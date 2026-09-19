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
- "Rijstpapier" op `maakproces.html` en "japandi" op `index.html`, handmatig
  toegevoegd (zie hoofdstuk 2)

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
| **A** | Handgemaakte Japanse lampen van hout \| OostersLicht | 51 |
| B | Japanse lampen: vloer-, hang- en wandlamp \| OostersLicht | 56 |
| C | Japanse lampen van hout en rijstpapier \| OostersLicht | 53 |

Hier stond eerst "Japanse lampen en meditatielampen". Dat is aangepast om
dezelfde reden als in hoofdstuk 2: "meditatielamp" levert geen enkele
autocomplete-suggestie op, en wat er wel omheen gezocht wordt zijn
waxinelichthouders. Variant C neemt in plaats daarvan "rijstpapier" mee, het
woord waarmee mensen washi aanduiden.

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
"Japanse wandlamp" heten, en Yin en Yang allebei "Japanse vloerlamp". Twee
paar identieke titels, en dan weet Google niet welke van de twee hij moet
tonen.

| Pagina | **A** (voorstel) | Tekens |
|---|---|---|
| `lamp-kawa.html` | Handgemaakte Japanse hanglamp Kawa \| OostersLicht | 49 |
| `lamp-koyo.html` | Handgemaakte Japanse wandlamp Koyo \| OostersLicht | 49 |
| `lamp-take.html` | Handgemaakte Japanse tafellamp Take \| OostersLicht | 50 |
| `lamp-torii.html` | Handgemaakte Japanse wandlamp Torii \| OostersLicht | 50 |
| `lamp-yang.html` | Handgemaakte Japanse vloerlamp Yang \| OostersLicht | 50 |
| `lamp-yin.html` | Handgemaakte Japanse vloerlamp Yin \| OostersLicht | 49 |
| `destijl-tafellamp.html` | Handgemaakte tafellamp De Stijl \| OostersLicht | 46 |
| `destijl-wandlamp.html` | Handgemaakte wandlamp De Stijl \| OostersLicht | 45 |

"Japanse" staat erin omdat dat het woord is waarop de oude site gevonden
wordt, en het is hier de stijlaanduiding: gemaakt in Doorn, in Japanse
traditie en met Japans papier.

**De twee De Stijl-lampen krijgen het bewust niet.** Die collectie is
Nederlands modernisme — dat is het hele idee ervan — en "Japanse tafellamp De
Stijl" zou zichzelf tegenspreken. Wie op Japanse lampen zoekt en daar
uitkomt, klikt meteen weg.

### Waarom er geen "houten" in staat

Meer woorden is niet beter. Drie redenen:

- **Verdunning.** Google weegt de titel als geheel; elk woord erbij verkleint
  het gewicht van de rest. Een titel met vijf zoekwoorden rankt op elk
  daarvan slechter dan een titel met drie.
- **De klik.** Wie een resultatenlijst scant leest drie of vier woorden.
  "Handgemaakte Japanse houten hanglamp Kawa" is vijf bepalingen voordat je
  weet wat het is.
- **Afkappen.** Met "houten" erin kom je op 56 tot 57 tekens, drie van de
  grens. Wat er als eerste afvalt is het staartje: de merknaam.

En "houten" voegt hier weinig toe, want het staat al overal op de pagina:

| | Kawa | Koyo | Take | Torii | Yang | Yin |
|---|---|---|---|---|---|---|
| "hout" in de tekst | 35x | 30x | 21x | 22x | 47x | 36x |
| in de description | ja | ja | ja | ja | ja | ja |
| in het `material`-schema | ja | ja | ja | ja | ja | ja |
| eigen regel in de specificaties | ja | ja | ja | ja | ja | ja |

Wat je inlevert, eerlijk gezegd: voor de zoekopdracht "houten hanglamp" sta je
met dat woord in de titel iets sterker. Maar dat is een brede, drukke
opdracht waar een kleine maker het toch aflegt tegen de woonwinkelketens,
terwijl "handgemaakte Japanse hanglamp" er een is die je kunt winnen.

Wil je "houten" toch in de titel, dan wordt het dit — het past, maar krap:

| Pagina | A-lang | Tekens |
|---|---|---|
| `lamp-kawa.html` | Handgemaakte Japanse houten hanglamp Kawa \| OostersLicht | 56 |
| `lamp-koyo.html` | Handgemaakte Japanse houten wandlamp Koyo \| OostersLicht | 56 |
| `lamp-take.html` | Handgemaakte Japanse houten tafellamp Take \| OostersLicht | 57 |
| `lamp-torii.html` | Handgemaakte Japanse houten wandlamp Torii \| OostersLicht | 57 |
| `lamp-yang.html` | Handgemaakte Japanse houten vloerlamp Yang \| OostersLicht | 57 |
| `lamp-yin.html` | Handgemaakte Japanse houten vloerlamp Yin \| OostersLicht | 56 |

"Japans papier" past in geen van beide. Dat woord hoort thuis in de
**description**, de grijze regel direct onder de titel in het zoekresultaat.
Daar is ruimte voor ongeveer 155 tekens, en jouw descriptions noemen het al.

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

## 2. De woorden waarop gezocht wordt

De oude site heet `Japanse lampen | Oosterslicht Meditatielamp` en rankt
daarop. De vraag is welke van die woorden het waard zijn om mee te nemen.

**Hoe dit gemeten is.** Via Googles eigen autocomplete, de suggesties die
verschijnen terwijl je typt. Die komen uit wat mensen werkelijk intikken.
Het is geen zoekvolume — daarvoor heb je een zoekwoordtool nodig — maar het
laat wel zien welke termen leven en met welke bedoeling ze gebruikt worden.
Geen suggesties betekent "onder Googles drempel", niet bewijsbaar nul.

### Sterk en relevant

| Term | Wat mensen erachteraan typen |
|---|---|
| japanse lampen | **kopen**, amsterdam, **rijstpapier**, buiten, groningen |
| japanse vloerlamp | **rijstpapier**, **japandi stijl**, japanse papieren vloerlamp |
| houten vloerlamp | met kap, landelijk, voet — maar ook kwantum, marktplaats |
| handgemaakte lampen | den haag, arnhem, amsterdam, haarlem |

Twee dingen vallen op. "Kopen" en plaatsnamen duiken op bij zowel *japanse
lampen* als *handgemaakte lampen*: dat is koopintentie en lokale intentie, en
precies waar een maker met een werkplaats iets te halen heeft. En bij *houten
vloerlamp* staan Kwantum en Marktplaats tussen de suggesties — dat is de
massamarkt, waar je het als kleine maker niet van wint.

### Zwak of het verkeerde publiek

| Term | Wat er gebeurt |
|---|---|
| meditatielamp | **geen enkele suggestie** |
| meditatie lamp | alleen "meditatie lampje xenos" — waxinelichthouders |
| zen lamp | overwoekerd door een Roblox-game en de serie Ozark |
| rustgevende lamp | autisme, dementie, baby, kinderkamer — zorgmarkt |
| washi lamp | vrijwel alles Engelstalig: lampshade, tokyo, diy, ikea |
| zen verlichting, sfeerlamp hout, lamp japans papier | te zeldzaam |

### Bijstelling van een eerder advies

In een eerdere versie van dit document stond dat "meditatielamp"
teruggeclaimd moest worden, omdat de oude site erop rankt. Dat klopt
feitelijk, maar het is minder waard dan het leek. De term levert geen enkele
suggestie op, en wat er wél omheen gezocht wordt is "meditatie lampje Xenos":
mensen die een waxinelichthouder van een paar euro zoeken, geen vloerlamp van
585 euro. Bovenaan staan bij een term die bijna niemand intikt, en dan nog bij
het verkeerde publiek, levert weinig op.

**De winnaar is "Japanse lampen", niet "meditatielamp".** Die staat al in het
titelvoorstel voor de homepage en de collectiepagina.

### Twee woorden die de site mist

| Woord | Was | Nu | Waarom het telt |
|---|---|---|---|
| `rijstpapier` | 0x | **1x** | Stond wel op de oude site en komt in twee suggesties voor |
| `japandi` | 0x | **3x** | Levende interieurtrend; *vloerlamp japandi stijl* is een suggestie |

Ter vergelijking: "washi" staat er 65 keer, "Japans papier" 58 keer. Juiste
taal, maar niet de taal van de zoekbalk.

#### Doorgevoerd: rijstpapier op `maakproces.html`

Vakinhoudelijk is "rijstpapier" onjuist — washi is van moerbeibast, niet van
rijst. De zin vangt de zoekterm en zet het misverstand meteen recht:

> OostersLicht werkt met authentiek Japans papier: washi, geïmporteerd uit
> Japan. De basis is kozo-papier (in de volksmond vaak rijstpapier genoemd),
> gemaakt van de bast van de moerbeiboom.

Let op: hiermee is "(kozo washi)" uit die zin verdwenen. De term staat nog wel
in de specificaties van elke lamp, maar wordt nu nergens meer geïntroduceerd.

#### Doorgevoerd: japandi op `index.html`

Op drie plekken, in de intro, in een tweede blok en in een bijschrift van de
galerij:

> Een lamp van OostersLicht past goed bij een yoga- of meditatieruimte, of een
> minimalistisch interieur zoals japandi.

Vier tikfouten in deze nieuwe tekst zijn hersteld: "yoga-of" zonder spatie,
"eenminimalistisch" aan elkaar, "minimalistische interieur" in plaats van
"minimalistisch interieur", en "japans paviljoen" met kleine letter terwijl de
site verder overal "Japans" schrijft.

#### Wat er bij die wijziging is verdwenen

De vervangen zin luidde: *"Een lamp van OostersLicht brengt rust en sfeer in
uw huis, retraite, horeca of andere ruimtes waar een serene ambiance gewenst
is."* Daarmee zijn deze woorden van de site verdwenen:

| Woord | Nog op de site |
|---|---|
| retraite | 0x |
| serene, ambiance, "rust en sfeer" | 0x |
| horeca | 1x (nog in het tweede blok) |

Geen ramp — het waren geen sterke zoektermen — maar "retraite" was wel een
concrete afnemer die nu nergens meer genoemd wordt. Overweeg of die ergens
terug moet, bijvoorbeeld in de description van de homepage.

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
