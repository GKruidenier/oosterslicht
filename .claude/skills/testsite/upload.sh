#!/usr/bin/env bash
#
# Zet bestanden op de testsite (test.oosterslicht.nl) via FTPS.
#
# Met --live gaat alles naar de echte site (www.oosterslicht.nl), via een
# eigen FTP-account in een eigen netrc-bestand. Schrijven naar live vraagt
# daarnaast --bevestig, en kan alleen als alle wijzigingen gecommit zijn:
# op de live site staat nooit iets wat niet in git staat.
#
# De inloggegevens staan NIET in dit bestand en niet in de repository, maar in
# een netrc-bestand buiten het project. Zie SKILL.md.
#
set -u

kleur() { printf '%s\n' "$*" >&2; }
fout()  { printf 'FOUT: %s\n' "$*" >&2; exit 1; }

DRYRUN=0
LIVE=0
BEVESTIGD=0
ACTIE="upload"
ARGS=()
for a in "$@"; do
  case "$a" in
    --proef|--dry-run) DRYRUN=1 ;;
    --alles|--all)     ACTIE="alles" ;;
    --lijst|--list)    ACTIE="lijst" ;;
    --verwijder|--rm)  ACTIE="verwijder" ;;
    --live)            LIVE=1 ;;
    --bevestig)        BEVESTIGD=1 ;;
    -*) fout "onbekende optie: $a" ;;
    *)  ARGS+=("$a") ;;
  esac
done

# Test en live hebben elk een eigen netrc-bestand met één account. Nooit beide
# in één bestand: het script neemt de eerste machine-regel, en dan kan een
# upload stilletjes op de verkeerde site belanden.
if [ "$LIVE" = 1 ]; then
  NETRC="${OOSTERSLICHT_LIVE_NETRC:-$HOME/.claude/oosterslicht-live.netrc}"
  DOELNAAM="LIVE (www.oosterslicht.nl)"
else
  NETRC="${OOSTERSLICHT_NETRC:-$HOME/.claude/oosterslicht-test.netrc}"
  DOELNAAM="testsite (test.oosterslicht.nl)"
fi
# De hostnaam staat niet in dit bestand. Deze repository is openbaar, en een
# hostnaam met de gebruikersnaam eronder wijst een aanvaller precies aan waar
# hij moet proberen. Hij wordt gelezen uit de machine-regel van het
# netrc-bestand, dat buiten de repository staat; OOSTERSLICHT_HOST overschrijft.
HOST="${OOSTERSLICHT_HOST:-$(awk '/^[[:space:]]*machine[[:space:]]/ {print $2; exit}' "$NETRC" 2>/dev/null)}"
REMOTE_ROOT="/public_html"
# --tls-max 1.2 is hier geen overbodige luxe. Onder TLS 1.3 breekt deze
# Pure-FTPd-server de overdracht af met "451 Error during read from data
# connection": hij gaat de mist in op de TLS-afsluiting van het datakanaal.
# Dat treft alleen bestanden boven ongeveer 14 kB - kleinere passen in één
# buffer en zijn klaar voordat het misgaat. Verraderlijk daarbij: het bestand
# is op de server dan al leeggemaakt, dus een mislukte upload laat een
# bestand van 0 bytes achter. Controleer na een mislukking dus altijd wat er
# op de server staat, en herstel het.
#
# Alles blijft versleuteld, ook het datakanaal; alleen de TLS-versie ligt
# vast op 1.2.
CURL_OPTS=(--netrc-file "$NETRC" --ssl-reqd --tls-max 1.2 --connect-timeout 15 --max-time 300 -sS)

# Bestanden die nooit mee mogen: bronmateriaal, werkbestanden, systeemrommel.
# stijlenlab.html is een interne ontwerppagina en hoort niet op de server.
UITSLUITEN='^(stijlenlab\.html$|\.git/|\.claude/|\.impeccable/|_originelen/|_schetsen/|_fontkeuze/|fotos_claude_website/|ONGEBRUIKTE-BESTANDEN\.txt$|\.gitignore$|.*/\.DS_Store$|\.DS_Store$|Thumbs\.db$|desktop\.ini$)'

# De site zelf: wat er bij --alles meegaat.
# .htaccess en sitemap.xml horen hier beslist bij. Zonder .htaccess mist de
# site elke 301 van de oude adressen, de canonicalisatie naar één domein, de
# eigen foutpagina en de compressie - en dat valt niet op, want alle pagina's
# laden gewoon. Zonder sitemap.xml kondigt robots.txt een sitemap aan die
# 404 geeft.
SITE_BESTANDEN=(*.html contact.php favicon.ico robots.txt sitemap.xml .htaccess .user.ini)
SITE_MAPPEN=(assets css js)

[ -r "$NETRC" ] || fout "geen inloggegevens gevonden op $NETRC (zie SKILL.md)"
[ -n "$HOST" ]  || fout "geen hostnaam gevonden; zet een machine-regel in $NETRC of OOSTERSLICHT_HOST"

# Live wordt nooit per ongeluk beschreven. Kijken (--lijst) en een proefdraai
# mogen altijd; alles wat iets verandert vraagt --bevestig en een schone
# werkmap, zodat wat live staat altijd terug te vinden is in git.
if [ "$LIVE" = 1 ] && [ "$ACTIE" != "lijst" ] && [ "$DRYRUN" = 0 ]; then
  [ "$BEVESTIGD" = 1 ] || fout "dit schrijft naar de LIVE site; voeg --bevestig toe als dat de bedoeling is (eerst --proef?)"
  [ -z "$(git status --porcelain 2>/dev/null)" ] || fout "er zijn niet-gecommitte wijzigingen; commit eerst, zodat live gelijk is aan git"
fi
kleur "Doel: $DOELNAAM"

remote_pad() { printf 'ftp://%s%s/%s' "$HOST" "$REMOTE_ROOT" "$1"; }

# Maakt de mappen van een pad aan. Pure-FTPd klaagt als een map al bestaat;
# dat is geen fout, dus die melding gaat naar /dev/null.
zorg_voor_map() {
  local pad="$1" opgebouwd=""
  [ "$pad" = "." ] && return 0
  local IFS=/
  for deel in $pad; do
    [ -z "$deel" ] && continue
    opgebouwd="${opgebouwd:+$opgebouwd/}$deel"
    curl "${CURL_OPTS[@]}" -Q "MKD $REMOTE_ROOT/$opgebouwd" "ftp://$HOST$REMOTE_ROOT/" >/dev/null 2>&1
  done
}

upload_bestand() {
  local lokaal="$1" doel="$2"
  if [ "$DRYRUN" = 1 ]; then
    printf '  zou uploaden: %s\n' "$doel"; return 0
  fi
  zorg_voor_map "$(dirname "$doel")"
  if curl "${CURL_OPTS[@]}" -T "$lokaal" "$(remote_pad "$doel")" >/dev/null; then
    printf '  %s (%s bytes)\n' "$doel" "$(wc -c < "$lokaal" | tr -d ' ')"
  else
    printf '  MISLUKT: %s\n' "$doel"; return 1
  fi
}

# Zet een pad (bestand of map) klaar als lijst van bestanden.
verzamel() {
  local pad="$1"
  if [ -f "$pad" ]; then printf '%s\n' "$pad"
  elif [ -d "$pad" ]; then find "$pad" -type f
  else fout "bestaat niet: $pad"
  fi
}

case "$ACTIE" in
  lijst)
    doel="${ARGS[0]:-}"
    curl "${CURL_OPTS[@]}" "ftp://$HOST$REMOTE_ROOT/${doel:+$doel/}" || fout "kon niet verbinden"
    ;;

  verwijder)
    [ "${#ARGS[@]}" -gt 0 ] || fout "geef op wat er weg moet, bijvoorbeeld: --verwijder mailtest.php"
    for d in "${ARGS[@]}"; do
      if [ "$DRYRUN" = 1 ]; then printf '  zou verwijderen: %s\n' "$d"; continue; fi
      if curl "${CURL_OPTS[@]}" -Q "-DELE $REMOTE_ROOT/$d" "ftp://$HOST$REMOTE_ROOT/" >/dev/null 2>&1; then
        printf '  verwijderd: %s\n' "$d"
      else
        printf '  MISLUKT (bestond hij wel?): %s\n' "$d"
      fi
    done
    ;;

  alles)
    kleur "Hele site naar $HOST$REMOTE_ROOT"
    mislukt=0
    for f in "${SITE_BESTANDEN[@]}"; do
      [ -f "$f" ] || continue
      printf '%s' "$f" | grep -Eq "$UITSLUITEN" && continue
      upload_bestand "$f" "$f" || mislukt=1
    done
    for m in "${SITE_MAPPEN[@]}"; do
      [ -d "$m" ] || continue
      while IFS= read -r f; do
        printf '%s' "$f" | grep -Eq "$UITSLUITEN" && continue
        upload_bestand "$f" "$f" || mislukt=1
      done < <(find "$m" -type f)
    done
    [ "$mislukt" = 0 ] || fout "niet alles is gelukt"
    kleur "Klaar."
    ;;

  upload)
    [ "${#ARGS[@]}" -gt 0 ] || fout "geef op wat er mee moet, bijvoorbeeld: upload.sh contact.php css/"
    mislukt=0
    for pad in "${ARGS[@]}"; do
      pad="${pad%/}"
      while IFS= read -r f; do
        printf '%s' "$f" | grep -Eq "$UITSLUITEN" && { printf '  overgeslagen: %s\n' "$f"; continue; }
        upload_bestand "$f" "$f" || mislukt=1
      done < <(verzamel "$pad")
    done
    [ "$mislukt" = 0 ] || fout "niet alles is gelukt"
    ;;
esac
