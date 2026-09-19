---
name: testsite
description: Zet bestanden op de testsite test.oosterslicht.nl via FTPS, toont wat daar staat, en ruimt testbestanden op. Gebruik dit zodra er iets naar de testomgeving moet, of als er gecontroleerd moet worden wat er nu op de server staat.
---

# Uploaden naar de testsite

De testsite is `test.oosterslicht.nl`, een losse map naast de live site. De
live site draait ongestoord door op `oosterslicht.nl` en wordt hier nooit
geraakt: het FTP-account is opgesloten in de map van de testsite.

## Eerst even weten

- **De DNS werkt nog niet.** `test.oosterslicht.nl` bestaat niet in de
  openbare DNS (zie *Openstaand* onderaan). Voor controle vanaf hier moet je
  daarom `--resolve` gebruiken, en in de browser een regel in het
  hosts-bestand.
- **HTTP, geen HTTPS.** Zonder DNS is er geen certificaat voor deze naam.
- **Er draait PHP 7.4.33 op LiteSpeed.** `.htaccess` met `php_value` doet hier
  niets; PHP-instellingen gaan via `.user.ini`, die tot vijf minuten gecachet
  wordt.

## Inloggegevens

Staan bewust **niet** in de repository, maar in een netrc-bestand daarbuiten:

```
~/.claude/oosterslicht-test.netrc
```

Met deze inhoud (rechten op 600):

```
machine <ftp-host>
login <ftp-gebruikersnaam>
password HETWACHTWOORD
```

Ontbreekt dat bestand, dan stopt het script met een duidelijke melding. Een
ander pad kan via de omgevingsvariabele `OOSTERSLICHT_NETRC`.

Zet een wachtwoord nooit in een commando op de opdrachtregel en nooit in een
bestand binnen het project.

## Gebruik

Draai alles vanuit de hoofdmap van het project. Paden zijn relatief aan die
map en komen op dezelfde plek op de server terecht.

```bash
# Losse bestanden of hele mappen
.claude/skills/testsite/upload.sh contact.php
.claude/skills/testsite/upload.sh css/ js/ index.html

# De hele site in één keer
.claude/skills/testsite/upload.sh --alles

# Eerst kijken wat er zou gebeuren, zonder te uploaden
.claude/skills/testsite/upload.sh --alles --proef

# Wat staat er nu op de server?
.claude/skills/testsite/upload.sh --lijst
.claude/skills/testsite/upload.sh --lijst css

# Testbestanden weghalen
.claude/skills/testsite/upload.sh --verwijder mailtest.php phpcheck.php
```

Bronmateriaal en werkbestanden worden altijd overgeslagen: `_originelen/`,
`_schetsen/`, `_fontkeuze/`, `fotos_claude_website/`, `.git/`, `.claude/` en
systeemrommel. `--alles` stuurt de HTML-bestanden, `contact.php`,
`favicon.ico`, `robots.txt`, `.user.ini` en de mappen `assets`, `css`, `js`.

## Achteraf controleren

Omdat de DNS ontbreekt, wijs je de naam zelf even aan:

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  --resolve test.oosterslicht.nl:80:5.22.249.25 \
  http://test.oosterslicht.nl/css/style.css
```

Controleer na een upload altijd of de gewijzigde pagina's een `200` geven, en
bij CSS- of JS-wijzigingen of de bestanden zelf ook echt ververst zijn.

## Valkuilen

- **Een mislukte upload laat een leeg bestand achter.** FTP maakt het
  doelbestand leeg vóór het schrijven. Breekt de overdracht daarna af, dan
  staat er 0 bytes op de server en geeft de pagina een lege 200 - geen
  foutmelding, dus je ziet het niet vanzelf. Controleer na elke melding
  `MISLUKT` met `--lijst` wat er staat, en upload opnieuw.
- **TLS 1.3 breekt grote overdrachten.** Deze Pure-FTPd-server gaat de mist
  in op de TLS-afsluiting van het datakanaal en antwoordt met `451 Error
  during read from data connection`. Het treft alleen bestanden boven
  ongeveer 14 kB; kleinere zijn klaar voordat het misgaat, waardoor het lijkt
  alsof er een groottelimiet is. Daarom staat `--tls-max 1.2` in het script.
  Haal die vlag er niet uit. Alles blijft versleuteld, ook het datakanaal.
- **Zip nooit met `Compress-Archive`.** PowerShell schrijft backslashes als
  mapscheiding; Linux maakt daar bestanden van die letterlijk `css\style.css`
  heten. Upload liever rechtstreeks met dit script.
- **`robots.txt` verschilt.** Op de testsite staat `Disallow: /` zodat Google
  hem niet indexeert. Die mag niet mee naar de live site.
- **`.user.ini` werkt pas na maximaal vijf minuten.** Niet meteen concluderen
  dat het niet werkt.

## Openstaand

- De DNS-zone die het paneel bewerkt (`ns1.keurigonline79.nl`) is niet de zone
  die de wereld bevraagt (`ns.keurigonline.nl` en vier andere). Daardoor
  bestaat `test.oosterslicht.nl` buiten deze computer niet. Dit moet
  KeurigOnline rechttrekken.
- PHP staat op 7.4.33 en krijgt geen beveiligingsupdates meer.
- Het FTP-wachtwoord is ooit in een gesprek gedeeld en hoort vervangen te
  worden.
