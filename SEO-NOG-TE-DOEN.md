# SEO: wat er nog ligt

Stand van zaken en het werk dat nog open staat, op volgorde van opbrengst.
De eenmalige controles rond het live zetten staan apart in `LANCEREN.md`.

## Waar staat wat

Alle SEO-aanpassingen zitten **lokaal in git**. De testsite loopt achter.

| | Lokaal | Testsite |
|---|---|---|
| Canonicals, kruimelpaden, interne links naar `/` | ja | nee |
| Adres Boswijklaan 52a, Doorn | ja | ja |
| `.htaccess`: 301's, canonicalisatie, noindex op de testnaam | ja | ja |
| `404.html`, compressie, cache-headers | ja | ja |
| `sitemap.xml` | ja | nee (geeft daar 404) |

---

## Al gedaan

- 301 van elke oude URL naar de nieuwe pagina, in één sprong
- Domein vastgezet op `https://www.oosterslicht.nl`
- Canonical op alle dertien vindbare pagina's, gelijk aan `og:url` en sitemap
- `BreadcrumbList` op twaalf pagina's, gelijk aan het zichtbare kruimelpad
- Adres rechtgezet en aangevuld met straat en postcode, in vijftien
  schemablokken en 33 plekken zichtbare tekst
- Eigen 404-pagina, compressie, cache-headers
- Testomgeving op `noindex` via een header op de hostnaam

---

## 1. De titels

**Het zwaarste dat nog open staat.** De huidige titels zetten de merknaam
voorop: `Wandlamp Koyo — OostersLicht`. Niemand zoekt op "Koyo". De
beschrijvende woorden waar mensen wél op zoeken — houten wandlamp, vloerlamp,
Japanse lampen — staan er niet in.

Voorstel hieronder. Alles blijft onder de zestig tekens, want daarboven kapt
Google af. Het aantal tekens staat erbij.

### Productpagina's

| Pagina | Voorstel | Tekens |
|---|---|---|
| `lamp-kawa.html` | Houten hanglamp Kawa met Japans papier \| OostersLicht | 53 |
| `lamp-koyo.html` | Houten wandlamp Koyo met geperst blad \| OostersLicht | 52 |
| `lamp-take.html` | Houten tafellamp Take met bamboemotief \| OostersLicht | 53 |
| `lamp-torii.html` | Houten wandlamp Torii, Japanse poortvorm \| OostersLicht | 55 |
| `lamp-yang.html` | Houten vloerlamp Yang, vierkante kap \| OostersLicht | 51 |
| `lamp-yin.html` | Houten vloerlamp Yin, ronde kap van noten \| OostersLicht | 56 |
| `destijl-tafellamp.html` | Tafellamp De Stijl met kleurvlakken \| OostersLicht | 50 |
| `destijl-wandlamp.html` | Wandlamp De Stijl met kleurvlakken \| OostersLicht | 49 |

Het patroon: **soort lamp + materiaal + naam + wat deze lamp onderscheidt**.
Het soort vooraan, omdat dat het zoekwoord is. De naam blijft erin, want wie
op "Koyo" zoekt kent je al en moet je zeker vinden. De staart verschilt per
lamp, zodat acht titels in een zoekresultaat niet op elkaar lijken.

### Homepage en collectiepagina's

| Pagina | Voorstel | Tekens |
|---|---|---|
| `index.html` | Japanse lampen van hout en washi, handgemaakt \| OostersLicht | 60 |
| `index.html` *(variant)* | Japanse lampen en meditatielampen van hout \| OostersLicht | 57 |
| `lampencollectie.html` | Japanse lampen en meditatielampen \| OostersLicht | 48 |
| `collectie-de-stijl.html` | Lampen naar De Stijl, op Japans papier \| OostersLicht | 53 |

Voor de homepage staan twee varianten, omdat daar een keuze in zit die van jou
is. Zie het volgende punt.

---

## 2. De woordenschat die de oude site heeft en de nieuwe niet

De oude site heet `Japanse lampen | Oosterslicht Meditatielamp` en rankt
daarop. Op de nieuwe site:

| Term | Voorkomens op de nieuwe site |
|---|---|
| "Japanse lampen" | 0 |
| "meditatielamp" | 1, en dat is een regel commentaar in de code |
| "meditatie" | 5, waarvan 2 in een alt-tekst en een commentaar |

Ter vergelijking: "Japanse collectie" 42 keer, "Japans papier" 14 keer. Mooie
taal, maar niet wat mensen intikken.

**Waarom dit telt.** De 301's vertellen Google dat een pagina verhuisd is,
maar Google beoordeelt daarna of de nieuwe pagina ergens nog over hetzelfde
gaat. Wijst `/meditatielampen/` naar een pagina die het woord meditatie
nergens noemt, dan zakt die positie alsnog weg. De redirects behouden de
autoriteit, niet de relevantie.

**De keuze is van jou.** Het woord "meditatielamp" is niet onwaar voor deze
lampen: je homepage noemt al "yoga- of meditatieruimte", en op de
maakprocespagina staat dat meditatie een van de vier interesses is waaruit het
werk is ontstaan. Maar of je merk daarmee vooropgaat, is jouw beslissing en
niet die van een zoekmachine. Een tussenweg: de term in de description en op
de collectiepagina, en de homepagetitel houden zoals hij is.

Minimaal nodig om de oude posities niet weg te gooien: de term ergens
zichtbaar op `lampencollectie.html`, want dat is de bestemming van de
redirect van `/meditatielampen/`.

---

## 3. Google Bedrijfsprofiel

Nul regels code, grote invloed op zoekopdrachten als "lampen Doorn" of
"lampenmaker Utrechtse Heuvelrug". Het adres daar moet exact overeenkomen met
het `LocalBusiness`-schema op de homepage: **Boswijklaan 52a, 3941 ZN Doorn**.

---

## 4. Structured data op vier pagina's

Deze hebben nu geen enkel schemablok:

- `lampencollectie.html` en `collectie-de-stijl.html`: `CollectionPage` met
  een `ItemList` die naar de losse lampen wijst
- `maakproces.html`: `AboutPage`, eventueel met `Person` voor Jelle
- `contact.html`: `ContactPage`, plus een herhaling van `LocalBusiness`

---

## 5. De Stijl-lampen hebben geen prijs in het schema

Beide hebben `Product` zonder `offers`, omdat de prijs op aanvraag is.
Daarmee vallen ze buiten de rich-result-validatie en krijgen ze geen
uitgebreid zoekresultaat. Keuze: een prijsindicatie toevoegen, of accepteren
dat deze twee een kaal resultaat houden.

---

## 6. `LocalBusiness` aanvullen

Staat nu op naam, adres, telefoon, e-mail en KvK. Kan bij: `openingHours`,
`geo` met coördinaten, `priceRange`, en `sameAs` naar Instagram of andere
profielen, als die er zijn.

---

## 7. Kleingoed

- `og:locale` (`nl_NL`) en `og:image:alt` ontbreken overal
- `sitemap.xml`: alle `lastmod` staan op dezelfde handmatige datum en
  verouderen stilletjes; `priority` wordt door Google genegeerd en mag weg
- Meer onderlinge links tussen de lamppagina's ("zie ook"), zodat de waarde
  beter verdeeld wordt. Nu linkt de homepage naar drie van de zes Japanse
  lampen, en zijn de twee De Stijl-lampen alleen vanaf hun collectiepagina
  bereikbaar
- Een blok met veelgestelde vragen op `contact.html` of `maakproces.html`,
  met `FAQPage`, levert extra ruimte in het zoekresultaat

---

## Volgorde

Punt 1, 2 en 3 vóór de verhuizing. Die bepalen of je de posities van de oude
site meeneemt of opnieuw begint.

Punt 4 tot en met 7 kan net zo goed erna. Dat zijn verbeteringen, geen
behoud.
