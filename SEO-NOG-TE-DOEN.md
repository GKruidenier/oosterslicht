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

Voorstel hieronder, met het aantal tekens erbij. Google kapt af rond de zestig
tekens — niet op een vast aantal, maar op pixelbreedte, dus een titel die daar
precies op zit kan net wel of net niet passen. Alles boven de 57 is daarom
gemarkeerd als krap.

**Nog niet doorgevoerd.** Dit is een voorstel; de `<title>` in de HTML is
onveranderd.

### Kun je meerdere titels tegelijk hebben?

Nee. Een pagina heeft precies één `<title>`, en er is geen HTML-mechanisme
voor varianten of een ingebouwde A/B-test.

Twee dingen die daar wel bij horen. Google herschrijft titels regelmatig zelf
in het zoekresultaat, op basis van de `h1`, de tekst op de pagina en de
ankerteksten van links die ernaartoe wijzen — volledige controle heb je dus
sowieso niet. En wat je wel kunt: na elkaar testen. Zet een titel, wacht vier
tot zes weken, kijk in Search Console naar vertoningen, klikken en CTR van die
ene pagina, en wissel dan naar een andere variant. De description is daarbij
een tweede knop die los van de titel werkt.

Daarom staan hieronder meerdere varianten per pagina, zodat er iets is om naar
te wisselen. **A** is steeds het voorstel; de rest zijn alternatieven met een
ander accent. Bij de productpagina's gaat de keuze niet zozeer over de
formulering als over welk woord je opoffert: er passen nooit alle elementen
tegelijk in.

### Homepage en collectiepagina's

`index.html` — **gekozen: A**

| | Titel | Tekens |
|---|---|---|
| **A** | Japanse lampen van hout en washi, handgemaakt \| OostersLicht | 60 |
| B | Handgemaakte Japanse lampen van hout en washi \| OostersLicht | 60 |
| C | Japanse lampen van hout en washi \| OostersLicht | 47 |

A is precies 60 tekens en Google kapt af op pixelbreedte rond dat punt; de
kans is reëel dat "handgemaakt" wegvalt. C is dezelfde titel zonder die kans.

`lampencollectie.html` — bestemming van de redirect van `/meditatielampen/`

| | Titel | Tekens |
|---|---|---|
| **A** | Japanse lampen en meditatielampen \| OostersLicht | 48 |
| B | Japanse lampen: vloer-, hang- en wandlamp \| OostersLicht | 56 |
| C | Handgemaakte Japanse lampen van hout \| OostersLicht | 51 |

`collectie-de-stijl.html`

| | Titel | Tekens |
|---|---|---|
| **A** | De Stijl lampen van hout en Japans papier \| OostersLicht | 56 |
| B | De Stijl lampen met kleurvlakken op washi \| OostersLicht | 56 |
| C | De Stijl lampen, handgemaakt op Japans papier \| OostersLicht | 60 |

### Productpagina's

De beschrijvende woorden gaan voorop, want dat is wat een bezoeker leest en
waarop hij zoekt. De naam van de lamp staat achteraan: die zegt een vreemde
niets, maar hij is wel nodig — zonder naam zouden Koyo en Torii allebei
"houten wandlamp" heten, en Yin en Yang allebei "houten vloerlamp". Twee paar
identieke titels, en dan weet Google niet welke van de twee hij moet tonen.

| Pagina | **A** (voorstel) | Tekens |
|---|---|---|
| `lamp-kawa.html` | Handgemaakte Japanse houten hanglamp Kawa \| OostersLicht | 56 |
| `lamp-koyo.html` | Handgemaakte Japanse houten wandlamp Koyo \| OostersLicht | 56 |
| `lamp-take.html` | Handgemaakte Japanse houten tafellamp Take \| OostersLicht | 57 |
| `lamp-torii.html` | Handgemaakte Japanse houten wandlamp Torii \| OostersLicht | 57 |
| `lamp-yang.html` | Handgemaakte Japanse houten vloerlamp Yang \| OostersLicht | 57 |
| `lamp-yin.html` | Handgemaakte Japanse houten vloerlamp Yin \| OostersLicht | 56 |
| `destijl-tafellamp.html` | Handgemaakte tafellamp De Stijl \| OostersLicht | 46 |
| `destijl-wandlamp.html` | Handgemaakte wandlamp De Stijl \| OostersLicht | 45 |

"Japanse" staat erin omdat dat het woord is waarop de oude site gevonden
wordt, en het is hier de stijlaanduiding: gemaakt in Doorn, in Japanse traditie
en met Japans papier.

**De twee De Stijl-lampen krijgen het bewust niet.** Die collectie is
Nederlands modernisme — dat is het hele idee ervan — en "Japanse tafellamp De
Stijl" zou zichzelf tegenspreken. Ze zijn wel op Japans papier gemaakt, maar
dat erbij zetten komt op 61 tekens uit en valt af.

Deze zes zitten op 56 of 57 tekens: dat past, maar de marge is drie tekens.
Wil je meer lucht, dan kan "houten" eruit — de houtsoort staat toch in de
description en op de pagina zelf:

| Pagina | A-kort | Tekens |
|---|---|---|
| `lamp-kawa.html` | Handgemaakte Japanse hanglamp Kawa \| OostersLicht | 49 |
| `lamp-koyo.html` | Handgemaakte Japanse wandlamp Koyo \| OostersLicht | 49 |
| `lamp-take.html` | Handgemaakte Japanse tafellamp Take \| OostersLicht | 50 |
| `lamp-torii.html` | Handgemaakte Japanse wandlamp Torii \| OostersLicht | 50 |
| `lamp-yang.html` | Handgemaakte Japanse vloerlamp Yang \| OostersLicht | 50 |
| `lamp-yin.html` | Handgemaakte Japanse vloerlamp Yin \| OostersLicht | 49 |

Wat hier niet meer in past is "Japans papier". De volledige zin —
`Handgemaakte Japanse houten hanglamp met Japans papier \| OostersLicht` — is
ver over de afkapgrens. Dat woord hoort thuis in de **description**, de grijze
regel direct onder de titel in het zoekresultaat. Daar is ruimte voor ongeveer
155 tekens, en jouw descriptions noemen het papier al.

Als alternatief, met het papier er wel in maar "handgemaakte" eruit:

| Pagina | B | Tekens |
|---|---|---|
| `lamp-kawa.html` | Houten hanglamp Kawa met Japans papier \| OostersLicht | 53 |
| `lamp-koyo.html` | Houten wandlamp Koyo met geperst blad \| OostersLicht | 52 |
| `lamp-take.html` | Houten tafellamp Take met bamboemotief \| OostersLicht | 53 |
| `lamp-torii.html` | Houten wandlamp Torii, Japanse poortvorm \| OostersLicht | 55 |
| `lamp-yang.html` | Houten vloerlamp Yang, vierkante kap \| OostersLicht | 51 |
| `lamp-yin.html` | Houten vloerlamp Yin, ronde kap van noten \| OostersLicht | 56 |
| `destijl-tafellamp.html` | Tafellamp De Stijl met kleurvlakken \| OostersLicht | 50 |
| `destijl-wandlamp.html` | Wandlamp De Stijl met kleurvlakken \| OostersLicht | 49 |

Het verschil in één zin: **A** zet in op "handgemaakt" en leest als een
winkel, **B** zet in op wat elke lamp bijzonder maakt en leest als een
ambacht. A is consequenter, B is gevarieerder.

Alle lengtes zijn nagerekend, niet geschat. Boven de zestig tekens kapt Google
af en is de rest verspild.

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
