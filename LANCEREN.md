# Lanceerlijst

Wat er bij het live zetten gecontroleerd moet worden, in volgorde. Elk punt
heeft een commando en de uitkomst die je wilt zien. Draai alles in PowerShell
vanuit de hoofdmap van het project.

De commando's gebruiken `curl.exe` met de extensie erbij. Zonder die extensie
pakt PowerShell zijn eigen alias, en dan werken de vlaggen niet.

Twee dingen die je vaker nodig hebt:

- De testsite bestaat niet in de publieke DNS. Vanaf deze computer werkt hij
  via een regel in het hosts-bestand; in een commando wijs je hem aan met
  `--resolve test.oosterslicht.nl:80:5.22.249.25`.
- De canonieke vorm van de live site is `https://www.oosterslicht.nl`. Alles
  wat daarvan afwijkt hoort in één sprong daarheen te gaan.

---

## 1. Vóór de uitrol, op de testsite

### 1.1 De lusbeveiliging

De gevaarlijkste regel in `.htaccess`. `DirectoryIndex` vertaalt een verzoek om
`/` intern naar `index.html`, en die vertaling loopt opnieuw langs de
rewriteregels. Zonder de controle op `THE_REQUEST` stuurt `/` naar `/`, en is
de homepage onbereikbaar.

```powershell
curl.exe -s -o NUL --resolve test.oosterslicht.nl:80:5.22.249.25 -L --max-redirs 5 -w "status=%{http_code} sprongen=%{num_redirects}`n" http://test.oosterslicht.nl/
```

Wil zien: `status=200 sprongen=0`. Elk ander aantal sprongen is mis.

### 1.2 Alle oude adressen

```powershell
$oud = @(
  '/index.php','/index.html','/meditatielampen/',
  '/meditatielampen/handgemaakte-houten-hanglampen-van-esdoorn-of-beukenhout/',
  '/meditatielampen/wandlamp-gemaakt-van-notenhout-kersenhout-of-esdoorn-hout/',
  '/meditatielampen/Yin-Yang-houten-vloerlamp-met-lichtdoorlatend-japans-papier/',
  '/lampmateriaal/',
  '/lampmateriaal/washi-papier-van-moerbeiboom-jinwashi-van-hennep/',
  '/lampmateriaal/kersenboom-of-notenboom-met-esdoorn-beuken/',
  '/sinoloog-en-meubelmaker-van-meubelmakers-vakschool/',
  '/sinoloog-en-meubelmaker-van-meubelmakers-vakschool/contact/',
  '/cms-data/feed/feed/feed.rss'
)
foreach ($p in $oud) {
  $uit = curl.exe -s -o NUL --resolve test.oosterslicht.nl:80:5.22.249.25 -w "%{http_code} %{redirect_url}" "http://test.oosterslicht.nl$p"
  "{0,-78} {1}" -f $p, $uit
}
```

Wil zien: elf regels met `301` en de juiste bestemming, en de RSS-feed op
`410`. Let er vooral op dat een `index.php`-adres **direct** op de
eindbestemming uitkomt en niet eerst op een tussenstap.

De koppeling volgt de inhoud, niet de slug. De oude slugs liggen er niet op:
de pagina die `hanglampen-van-esdoorn-of-beukenhout` heet bevat de vloerlampen
Yin en Yang, en de pagina die `Yin-Yang-houten-vloerlamp` heet bevat juist de
hanglamp. Verander hier niets zonder de inhoud van de oude pagina erbij te
halen.

### 1.3 De noindex-header staat op de testsite

```powershell
(Invoke-WebRequest -Uri http://test.oosterslicht.nl/ -Method Head).Headers['X-Robots-Tag']
```

Wil zien: `noindex, nofollow`.

Let op: in `robots.txt` hoort **geen** `Disallow: /` voor de testsite. Een
crawler die de pagina niet mag ophalen, ziet die header nooit, en dan kan de
URL alsnog kaal in de zoekresultaten belanden. `robots.txt` is in beide
omgevingen hetzelfde bestand.

### 1.4 Let op: `/index.html` op de testsite brengt je naar de live site

**Test de homepage altijd op `/`, nooit op `/index.html`.**

De uitzondering voor de testsite in `.htaccess` geldt alleen voor de
canonicalisatie naar `https://www.oosterslicht.nl`. De doorstuurtabel
eronder blijft op de testsite gewoon werken — dat is met opzet, want juist
die 301's wil je daar kunnen controleren. Maar die tabel heeft de live
URL hardgecodeerd, ook in de regel die `/index.html` naar de homepage
stuurt.

Gevolg: wie op de testsite `/index.html` opvraagt, komt zonder waarschuwing
op de **live** homepage terecht. De pagina ziet er vertrouwd uit, dus je
merkt niet dat je naar de oude site zit te kijken en concludeert dat je
wijziging niet is aangekomen.

```powershell
curl.exe -s -o NUL --resolve test.oosterslicht.nl:80:5.22.249.25 -w "status=%{http_code} naar=%{redirect_url}`n" http://test.oosterslicht.nl/index.html
```

Wil zien: `status=301 naar=https://www.oosterslicht.nl/`. Dat is correct
gedrag, geen storing — deze controle staat hier zodat je weet waaróm het
gebeurt als je erin loopt.

Hetzelfde geldt voor elk oud adres uit hoofdstuk 1.2: die sturen je ook naar
de live site. Dat is precies wat je daar wilt meten, maar besef dat je na zo'n
sprong niet meer op de testsite bent.

---

## 2. De uitrol

```powershell
.claude/skills/testsite/upload.sh --alles --proef
.claude/skills/testsite/upload.sh --alles
```

Doe eerst de proefdraai en kijk of `.htaccess` en `sitemap.xml` in de lijst
staan. Zonder `.htaccess` mist de site elke 301, de canonicalisatie, de eigen
foutpagina en de compressie — en dat valt niet op, want alle pagina's laden
gewoon.

**Lees de uitvoer op het woord `MISLUKT`.** FTP maakt het doelbestand leeg
vóór het schrijven. Breekt de overdracht af, dan staat er 0 bytes op de server
en geeft die pagina een lege 200 zonder foutmelding. Controleer daarna:

```powershell
.claude/skills/testsite/upload.sh --lijst
```

Wil zien: geen enkel bestand van 0 bytes.

---

## 3. Direct na de uitrol, op de live site

### 3.1 De noindex-header staat er NIET

Het belangrijkste punt van de hele lijst. Gaat dit mis, dan verdwijnt de hele
site uit Google.

```powershell
$h = (Invoke-WebRequest -Uri https://www.oosterslicht.nl/ -Method Head).Headers['X-Robots-Tag']
if ($h) { "FOUT - de live site staat op: $h" } else { "goed - geen X-Robots-Tag" }
```

Wil zien: `goed - geen X-Robots-Tag`.

Dit is hiervandaan niet vooraf te testen: de testmap wordt alleen onder de
testnaam geserveerd, dus er is geen manier om dezelfde `.htaccess` onder een
andere hostnaam te bevragen. De voorwaarde in `.htaccess` is een verankerde
exacte match op `test.oosterslicht.nl`, maar dat is een redenering en geen
meting. Daarom staat dit punt hier.

### 3.2 Eén adres voor het hele domein

```powershell
foreach ($u in @('http://oosterslicht.nl/','https://oosterslicht.nl/','http://www.oosterslicht.nl/','https://www.oosterslicht.nl/index.html')) {
  $uit = curl.exe -s -o NUL -L --max-redirs 5 -w "sprongen=%{num_redirects} eind=%{url_effective}" $u
  "{0,-46} {1}" -f $u, $uit
}
```

Wil zien: alles eindigt op `https://www.oosterslicht.nl/`, en steeds in
**één** sprong. Twee sprongen betekent dat de canonicalisatie en de
doorstuurtabel elkaar in de weg zitten.

### 3.3 De oude adressen, nu echt live

Zelfde lus als bij 1.2, maar dan zonder `--resolve` en tegen
`https://www.oosterslicht.nl`. Wil zien: dezelfde elf uitkomsten.

### 3.4 robots.txt en sitemap.xml zijn bereikbaar

```powershell
foreach ($p in @('/robots.txt','/sitemap.xml')) {
  "{0,-16} {1}" -f $p, (curl.exe -s -o NUL -w "%{http_code}" "https://www.oosterslicht.nl$p")
}
```

Wil zien: twee keer `200`. `sitemap.xml` gaf op de testsite een 404 omdat het
uploadscript hem niet meestuurde; dat is verholpen, maar controleer het.

### 3.5 De foutpagina

```powershell
curl.exe -s -o NUL -w "%{http_code}`n" https://www.oosterslicht.nl/bestaat-niet-xyz/
curl.exe -s https://www.oosterslicht.nl/meditatielampen/onzin/ | Select-String 'kunnen we niet vinden'
```

Wil zien: `404`, en de tweede regel moet de tekst vinden. Die tweede
controle is niet overbodig: `404.html` gebruikt paden vanaf de root juist
omdat de pagina ook diep in een niet-bestaande oude map getoond wordt. Met
relatieve paden valt daar de opmaak weg.

### 3.6 Het contactformulier

Stuur één echt bericht via `contact.html` en controleer of het aankomt en of
`bedankt.html` verschijnt. Dit is het enige onderdeel dat niet met een
commando te controleren is.

Let op twee dingen die buiten de code liggen:

1. `$ONTVANGER` in `contact.php` staat op `info@oosterslicht.nl`. Die mailbox
   moet bestaan en gelezen worden. Wil je de aanvragen in een persoonlijke
   mailbox, zet dan een **doorstuurregel** in het klantenpaneel van
   KeurigOnline in plaats van hier een privéadres in te vullen: dan blijft er
   ook een kopie in de domeinmailbox staan, en komen antwoorden op de
   bevestigingsmail op dezelfde plek terecht.
2. Controleer dat de bezoeker ook de **bevestigingsmail** krijgt, niet alleen
   jij de aanvraag. Staat daar nog "je" in plaats van "u", of een gmailadres,
   dan draait er een verouderde `contact.php` op de server.

---

## 4. In Google Search Console

1. Voeg **beide** properties toe: `oosterslicht.nl` en `www.oosterslicht.nl`.
   Je wilt zien dat de non-www variant leegloopt en de www variant volloopt.
2. Dien `https://www.oosterslicht.nl/sitemap.xml` in.
3. **Vraag de lijst met geïndexeerde URL's op van de oude site.** De oude
   sitemap noemt tien pagina's, maar Google kan er meer kennen. Elke URL uit
   die export die niet in de doorstuurtabel in `.htaccess` staat, alsnog een
   regel geven.
4. Kijk een week later naar de dekkingsrapportage, op onverwachte 404's.

---

## 5. Na vier weken: de startmeting

Dit is het enige punt dat niet meteen na de lancering kan. Zet er een
herinnering voor.

Search Console is de enige bron die over **jouw** titels gaat in plaats van
over zoekwoorden in het algemeen. Geen enkele zoekwoordtool vertelt je of een
titel aangeklikt wordt; dat is CTR, en die zie je alleen hier.

Ga naar **Prestaties** en zet alle vier de vinkjes aan: vertoningen, klikken,
CTR en gemiddelde positie. Kies de periode "laatste 28 dagen". Noteer per
pagina:

| Pagina | Vertoningen | Klikken | CTR | Gem. positie |
|---|---|---|---|---|
| / | | | | |
| /lampencollectie.html | | | | |
| /lamp-kawa.html | | | | |
| … | | | | |

Kijk daarnaast onder het tabblad **Zoekopdrachten** welke termen je
vertoningen opleveren. Dat is de eerste keer dat je ziet wat mensen werkelijk
intikken om bij jou uit te komen — niet wat een tool schat.

**Waarom dit telt.** Zonder startmeting kun je later niet zien of een nieuwe
titel beter werkt. Wissel je een titel zonder eerst vier weken te meten, dan
weet je achteraf niet waarmee je vergelijkt. Eén titel per keer, vier tot zes
weken laten staan, dan vergelijken. Het titelvoorstel in
`SEO-NOG-TE-DOEN.md` heeft per pagina alternatieven staan om naar te
wisselen.

Let bij het lezen op twee dingen. Een lage CTR bij een goede positie betekent
dat je gevonden wordt maar niet aangeklikt: dan is de titel of de description
het probleem. Veel vertoningen op termen die niet bij je passen betekent het
omgekeerde — je trekt het verkeerde publiek.

---

## 6. Buiten de website

- **Google Bedrijfsprofiel.** De site noemt als vestigingsplaats
  **Driebergen-Rijsenburg** en geeft geen straatadres meer: het schema op de
  homepage is `Organization` met alleen `addressLocality`. De werkplaats is
  geen bezoekadres, lampen worden gebracht of bezorgd. Wil je een profiel,
  registreer je dan als servicegebied-bedrijf; Google wil dan wel een echt
  adres ter verificatie, maar toont het niet. Naam, plaats en telefoonnummer
  daar moeten gelijklopen met de site, anders werkt de inconsistentie tegen je.
- **Telefoonnummer.** De site staat op 0343 415525. Loop je oude vermeldingen
  na: bedrijfsprofiel, bedrijvengidsen, mailhandtekening, drukwerk.

---

## 7. Nog open

Dit staat los van de lancering, maar hoort wel een keer opgelost:

- De DNS-zone die het hostingpaneel bewerkt is niet de zone die de wereld
  bevraagt, waardoor `test.oosterslicht.nl` buiten deze computer niet bestaat.
  Dit moet KeurigOnline rechttrekken.
- PHP staat op 7.4.33 en krijgt geen beveiligingsupdates meer.
- Het FTP-wachtwoord is ooit in een gesprek gedeeld en hoort vervangen te
  worden.
