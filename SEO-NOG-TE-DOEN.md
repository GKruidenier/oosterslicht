# SEO: wat er nog ligt

Stand van zaken en het werk dat nog open staat, op volgorde van opbrengst.
De eenmalige controles rond het live zetten staan apart in `LANCEREN.md`.

## Waar staat wat

Alle SEO-aanpassingen zitten **lokaal in git en op GitHub**. De testsite loopt
achter: die draait nog op de versie van 19 september.

| | Lokaal | Testsite |
|---|---|---|
| Canonicals, kruimelpaden, interne links naar `/` | ja | nee |
| Titels, H1's en descriptions (nieuw) | ja | nee |
| `og:locale`, `og:image:alt` | ja | nee |
| Vestigingsplaats Driebergen-Rijsenburg, telefoon 0343 | ja | nee |
| "Rijstpapier" en "japandi" | ja | nee |
| `.htaccess`: 301's, canonicalisatie, noindex op de testnaam | ja | ja |
| `404.html`, compressie, cache-headers | ja | ja |
| `sitemap.xml` | ja | nee (geeft daar 404) |

Voor de uitrol naar de testsite: zie `LANCEREN.md`, hoofdstuk 2.

---

## Het gereedschap: `seo.py`

Per pagina staat dezelfde tekst op meerdere plekken: de titel ook in
`og:title`, de description ook in `og:description`, de canonical ook in
`og:url` en in de sitemap. Zestien pagina’s maal zeven velden, met de hand
bijgehouden, loopt vroeg of laat uit elkaar. Daarvoor is `seo.py`. Het draait
op de standaardbibliotheek van Python, dus er valt niets te installeren.

### Titels en descriptions aanpassen

```
python seo.py bewerken
```

Schrijft `seo.tsv` en opent die meteen in Excel: één regel per pagina, met de
titel, de description, de `og:description` en de tekenaantallen.

1. `python seo.py bewerken` — Excel opent met zestien regels, één per pagina
2. Wijzig de kolommen `titel`, `description` of `og:description`
3. Ctrl+S — Excel vraagt of je de tab-indeling wilt behouden; zeg ja
4. `python seo.py toepassen`
5. `python seo.py controleer`

De kolommen `bestand` en `indexeerbaar` blijven ongemoeid: daarmee weet het
script waar een regel heen moet. De tekenaantallen hoef je niet bij te werken,
die worden bij de volgende export opnieuw geteld.

`toepassen` zet de titel in `<title>` én in `og:title`, zodat die twee niet
meer uit elkaar kunnen lopen. De `og:description` heeft een eigen kolom, want
op deze site staat daar bewust een kortere zin dan in de `description` — die
mag er niet door overschreven worden. Regels die je niet hebt aangeraakt laat
het script letterlijk staan, dus `&mdash;` blijft `&mdash;` en de diff toont
alleen wat je werkelijk hebt veranderd.

### Nakijken

```
python seo.py controleer
```

Verandert niets, klaagt alleen. Titels boven de 60 tekens, descriptions buiten
de 70–155, twee pagina’s met dezelfde titel, een canonical die niet klopt met
`og:url` of met de bestandsnaam, meer of minder dan één `h1`, afbeeldingen
zonder `alt`, ongeldige JSON-LD, een `@id` dat nergens gedefinieerd wordt, en
de sitemap: ontbrekende pagina’s, noindex-pagina’s die er tóch in staan, en
`lastmod`-datums die achterlopen op de git-historie.

Een afsluitcode van 1 betekent fouten, 0 betekent schoon. Handig als je het
ooit aan een controle bij het uitrollen wilt hangen.

### Sitemap bijwerken

```
python seo.py sitemap
```

Zet elke `lastmod` op de datum van de laatste commit van dat bestand. Dit was
het openstaande punt uit hoofdstuk 7: de sitemap werkte zichzelf niet bij.

### Wat het niet doet

Het schema, de OG-afbeeldingen en de paginatekst blijven handwerk. Dat is een
keuze: die dingen vragen om een oordeel, en een script dat ze genereert zou de
HTML tot output maken. De bestanden zelf zijn hier de bron, met het commentaar
erin waarom iets is zoals het is.

`seo.tsv` staat in `.gitignore`. Hij is altijd opnieuw af te leiden uit de
HTML, en twee waarheden naast elkaar is precies het probleem dat dit script
moet oplossen.

---

## Al gedaan

- 301 van elke oude URL naar de nieuwe pagina, in één sprong
- Domein vastgezet op `https://www.oosterslicht.nl`
- Canonical op alle dertien vindbare pagina's, gelijk aan `og:url` en sitemap
- `BreadcrumbList` op twaalf pagina's, gelijk aan het zichtbare kruimelpad
- Vestigingsplaats op Driebergen-Rijsenburg gezet, op 51 plekken. Straat en
  postcode zijn juist uit alle schemablokken gehaald: ze stonden nergens
  zichtbaar op de pagina, en dat gaat in tegen de richtlijn dat je geen
  gegevens markeert die de bezoeker niet ziet. Voor de ranking maakt een
  straatadres niets uit; alleen de plaatsnaam draagt bij
- `LocalBusiness` vervangen door `Organization` op de homepage. De werkplaats
  is geen bezoekadres: lampen worden gebracht of bezorgd. Daarmee is het type
  ook gelijk aan de `manufacturer`- en `seller`-blokken op de productpagina's
- Telefoonnummer naar 0343 415525, op 53 plekken
- Alle acht lampen hebben een prijs in `offers`; "op aanvraag" komt nergens
  meer voor
- Eigen 404-pagina, compressie, cache-headers
- Testomgeving op `noindex` via een header op de hostnaam
- Twaalf titels omgezet naar beschrijvend-eerst, met `og:title` gelijkgetrokken
- H1 van de zes Japanse lampen: "Japanse wandlamp Koyo" in plaats van
  "Wandlamp Koyo". Bewust korter dan de titel: de H1 staat in een smalle kolom
  en de volledige titel zou daar op mobiel vier regels worden
- H1 van de collectiepagina van "Lampen Japans" naar "Japanse lampen" - dat is
  ook gewoon beter Nederlands
- `og:locale` (nl_NL) en `og:image:alt` op alle vijftien pagina's met
  OG-tags; de vijf deelafbeeldingen die nergens als `<img>` voorkomen hebben
  een eigen beschrijving gekregen
- `sitemap.xml` opnieuw opgebouwd: `lastmod` per pagina uit de git-historie in
  plaats van een handmatige datum, en `priority` verwijderd omdat Google die
  negeert
- "Handgemaakte" in de description en `og:description` van alle acht
  productpagina's. Let op: dat helpt bij de klik, niet bij de ranking — de
  description is geen rankingfactor. Zie hieronder
- "Rijstpapier" op `maakproces.html` en "japandi" op `index.html`, handmatig
  toegevoegd (zie hoofdstuk 2)
- De `Organization` had op elke pagina een eigen kopie zonder `@id`, en op de
  productpagina’s zelfs twee (`manufacturer` en `offers.seller`). Nu één
  definitie per pagina met `@id` `https://www.oosterslicht.nl/#organization`,
  waar de rest naar verwijst: één knoop in plaats van negentien losse

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

**Doorgevoerd op 21 september 2026.** De A-varianten staan in de HTML, en
`og:title` is overal gelijkgetrokken met de `<title>`. De tabellen hieronder
blijven staan als alternatieven om later naar te wisselen, en als
verantwoording van de keuze.

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
wordt, en het is hier de stijlaanduiding: gemaakt in Driebergen-Rijsenburg,
in Japanse traditie en met Japans papier.

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

### Wat de concurrentie in haar titels zet

Gemeten via DuckDuckGo, dus niet één op één Google, en er zaten advertenties
tussen. Richtinggevend, niet gezaghebbend.

Bovenaan bij **"japanse lampen"**:

```
Japanse Lampen kopen? - Ruim aanbod Japanse Lampen
Japandi-lampen - Japan ontmoet Scandi
Ummei | Specialist in Japanse lampen | Webshop |
Japanse Lampen | ORIENTIQUE | Nu Gratis Levering!
Japanse Lampen & Lantaarns | Authentiek Washi, Kumiko & Bamboe
Japanse Lampen - Totale Showroom Leegverkoop! Tot 80% Korting
Japanse lampen | Zen en minimalistische stijl - SKLUM
```

Het hele veld concurreert op voorraad, prijs en levering. Geen enkele titel
zegt dat er één iemand aan zit die het ding maakt. Dat is het gat, en het is
breed. Bevestigd wordt ook dat "japandi" en "washi" commercieel gebruikt
worden: je zit niet naast de markt.

Bovenaan bij **"handgemaakte lampen"** — een heel ander en rommeliger veld:

```
Studio Limonada - Handgemaakte lampen, lampenkappen, kussens & poefjes
+200 handgemaakte lampenkappen - met liefde voor het Wauw effect
Blij Design - handgemaakte design lampen uit Nederland
Handgemaakte unieke lampen (lampen24.nl)
```

En de winkelresultaten eronder: Turkse mozaieklampen, rotan, bamboe, abaca —
geimporteerde waar met het etiket "handgemaakt".

**Gevolg voor het titelvoorstel.** "Handgemaakte lampen" op zichzelf levert
lampenkappen en mozaieklampen op, niet deze markt. Het woord verdient zijn
plaats alleen in combinatie met "Japanse": `Handgemaakte Japanse hanglamp
Kawa` is specifiek genoeg, `Handgemaakte hanglamp` zou de site in dat
gezelschap zetten. Dat is precies hoe het voorstel in hoofdstuk 1 is
opgebouwd.

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

### Kozogami: getoetst en verworpen

Een extern advies stelde voor om "kozogami" toe te voegen. Getoetst met
dezelfde methode als hierboven, en dat viel af:

| Term | Op de site | Autocomplete |
|---|---|---|
| kozogami | 0x | 2 suggesties, waarvan een over ander papier (gampi) |
| kozo washi | **26x in 11 bestanden** | 6 suggesties |
| washi | 66x in 14 bestanden | — |
| **"washi papier"** als woordpaar | **was 0x** | 6 suggesties, waaronder **"washi papier lamp"** |

Kozo washi en washi staan er allang ruim in; daar viel niets toe te voegen.
Het werkelijke gat zat in het woordpaar "washi papier", omdat de site
consequent "Japans papier (washi)" schrijft — met de twee woorden uit elkaar.
En juist *washi papier lamp* is een levende zoekopdracht.

Opgelost via de titel van `maakproces.html`, de pagina die over het papier
gaat en die als enige nog een merkgerichte titel had zonder enig zoekwoord:

> **Was:** Het maakproces — OostersLicht
> **Nu:** Washi papier en hout: het maakproces | OostersLicht

Alternatieven van gelijke lengte, mocht de formulering wringen:
`Het maakproces: hout en washi papier` (51) of `Washi papier, hout en
handwerk` (45).

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

## 2b. "Handgemaakt" staat nog niet in de paginatekst

De titels beloven "Handgemaakte Japanse hanglamp Kawa", en sinds kort zegt de
description het ook. Maar in de **hoofdtekst** van alle acht productpagina's
komt het woord nul keer voor; het staat alleen in de footer, buiten `<main>`.

Dat is geen detail. De description is geen rankingfactor — Google gebruikt hem
hooguit als de grijze regel onder je titel. Of een pagina zijn titel waarmaakt,
wordt beoordeeld op de tekst in `<main>`. Een titel die iets belooft wat de
pagina zelf nergens zegt, is precies het soort mismatch waar Google een eigen
titel voor in de plaats zet.

Eén zin in de introductie van elke lamp lost het op. Bijvoorbeeld bij de Kawa,
waar nu staat:

> De Kawa is een hanglamp, standaard uitgevoerd in esdoornhout, en het
> minimalistische kozo washi.

Daar zou "met de hand gemaakt" of "handgemaakt" natuurlijk in passen. Dit is
bewust niet automatisch doorgevoerd: het is zichtbare tekst, en acht keer
hetzelfde zinnetje inplakken leest als opvulling. Beter één keer per lamp, in
je eigen woorden.

Dezelfde overweging geldt voor de twee dunste pagina's: `destijl-wandlamp`
(143 woorden) en `destijl-tafellamp` (169 woorden) hebben sowieso ruimte.

---

## 3. Google Bedrijfsprofiel

Nul regels code. Verwacht er geen verkeer van: wie een handgemaakte Japanse
lamp zoekt, zoekt landelijk en niet "bij mij in de buurt", dus het kaartblok
komt nauwelijks in beeld. De winst zit elders.

**Recensies** zijn het echte argument. Die kunnen alleen bestaan met een
profiel, ze verschijnen bij je naam in de zoekresultaten, en voor iemand die
twijfelt over een lamp van een paar honderd euro wegen ze zwaarder dan welke
SEO-ingreep ook. Daarnaast krijg je een net panel bij merkzoekopdrachten.

Naam, plaats en telefoonnummer daar moeten gelijklopen met de site:
**Driebergen-Rijsenburg** en **0343 415525**. Er is geen straatadres meer om
te vergelijken; registreer je als servicegebied-bedrijf, dan wil Google wel
een echt adres ter verificatie maar toont het niet.

---

## 4. Doorgevoerd: structured data op de vier resterende pagina's

Deze hadden alleen een `BreadcrumbList`. Nu ook:

| Pagina | Schema |
|---|---|
| `lampencollectie.html` | `CollectionPage` met een `ItemList` van de zes Japanse lampen |
| `collectie-de-stijl.html` | `CollectionPage` met een `ItemList` van de twee De Stijl-lampen |
| `maakproces.html` | `AboutPage` met `Person` voor Jelle Kruidenier, lampenmaker |
| `contact.html` | `ContactPage` met de `Organization`-gegevens |

De `ItemList` volgt de volgorde waarin de lampen op de pagina staan, niet een
eigen rangschikking, en elke verwijzing is gecontroleerd op een bestaand
bestand. Vijfentwintig schemablokken op de site, alle geldig.

---

## 5. Doorgevoerd: de De Stijl-lampen hebben nu een prijs in het schema

Beide hadden `Product` zonder `offers`, omdat de prijs op aanvraag was.
Daarmee vielen ze buiten de rich-result-validatie. De tafellamp staat nu op
EUR 199 en de wandlamp op EUR 179, allebei met een `Offer` in dezelfde vorm
als de Japanse lampen. Alle acht productpagina's hebben er nu een.

---

## 6. `Organization` aanvullen

Staat nu op naam, beschrijving, url, image, logo, telefoon, e-mail, KvK,
`addressLocality`, `areaServed` (NL en BE) en `knowsLanguage`.

`sameAs` is van de lijst af: er zijn geen sociale profielen, en verwijzen
naar iets dat niet bestaat is schadelijker dan het weglaten. Het
KvK-nummer doet hier het werk dat `sameAs` zou doen. Wat nog wel kan is
`priceRange`.

`openingHours` en `geo` met coördinaten passen hier niet meer bij: die horen
bij een plek waar klanten langskomen, en die is er niet.

---

## 7. Doorgevoerd: het kleingoed

- `og:locale` (nl_NL) en `og:image:alt` staan op alle vijftien pagina's met
  OG-tags
- `sitemap.xml` opnieuw opgebouwd: `lastmod` per pagina uit de git-historie,
  `priority` eruit
- Elke lamppagina linkt al naar drie andere lampen, dus de onderlinge
  verwijzingen waren al in orde

De `lastmod` in de sitemap kwam uit de git-historie op het moment van
genereren en werkte zichzelf niet bij. Dat is opgelost: `python seo.py
sitemap` zet de datums opnieuw, en `python seo.py controleer` waarschuwt
zodra ze achterlopen. Zie het hoofdstuk over `seo.py` hierboven.

En nog niet gedaan: een blok met veelgestelde vragen op `contact.html` of
`maakproces.html`, met `FAQPage`. Dat levert extra ruimte in het
zoekresultaat.

---

## 8. De cultuur naar de etalage — deels uitgevoerd, deels ingetrokken

De site is cultureel diep, maar dat zit in de paginatekst en niet in de
titels: kozo staat er 117 keer, unryu 97 keer, zen 23 keer — en nul keer in
een titel. Elf van de zestien titels beginnen met "Handgemaakte", hetzelfde
woord dat Turkse mozaieklampen en rotan-import gebruiken.

Die constatering klopt. De vier voorstellen die eruit volgden niet allemaal.

### Wat er gezocht wordt en wat de site heeft

| Zoekterm | Suggesties | Op de site |
|---|---|---|
| **wabi sabi lamp** | ook *wabi sabi hanglamp*, *wabi sabi interieur* | nu 1x, was 0x |
| **japandi lamp** | ook *japandi stijl*, *japandi eettafel* | 2x |
| **shoji lamp** | ook *shoji papier*, *shoji schuifdeur* | 1x, in een bijzin |
| **japans interieur** | *winkel*, *design*, *stijl* | 0x |

"Washi" kaal werkt niet als zoekterm: dat levert *Washington* en *washi tape*
op. Het heeft altijd een lamp of papier ernaast nodig.

### Doorgevoerd: wabi-sabi op de homepage

> Een lamp van OostersLicht past goed bij een yoga- of meditatieruimte, of bij
> een rustige interieurstijl zoals **japandi of wabi-sabi: de waardering voor
> het onregelmatige, voor het blad dat nooit hetzelfde valt.**

De korte uitleg staat erbij omdat een losse term die niemand herkent niets
doet, en omdat Google die context nodig heeft. Drie lengtes gemeten op
mobiel: alleen de termen geeft 3 regels, deze variant 5, de volledige uitleg
7. De oorspronkelijke zin was er 3.

### Nog te doen: shoji uit de bijzin halen, op `maakproces.html`

> **Nu:** Dit stevige papier werd in Japan van oudsher gebruikt voor
> scheidingswanden en vensters (shoji) in huizen.
>
> **Voorstel:** Dit stevige papier werd in Japan van oudsher gebruikt voor
> shoji: de schuifwanden en vensters die een kamer in zacht licht zetten. Een
> lamp van OostersLicht werkt op dezelfde manier — hetzelfde papier, dezelfde
> techniek, alleen om het licht heen in plaats van voor het raam.

Dit is de sterkste van de vier: het voegt een verhaal toe dat de
geinteresseerde meteen herkent, in plaats van een woord te verplaatsen.

### INGETROKKEN: de titel van de collectiepagina

Het voorstel was `Handgemaakte Japanse lampen van hout` te vervangen door
`Japanse lampen van hout en washi`. **Dat is een slecht idee.** Naast de
homepagetitel ziet het er zo uit:

```
homepage:   Japanse lampen van hout en washi, handgemaakt | OostersLicht
collectie:  Japanse lampen van hout en washi | OostersLicht
```

Acht van de negen woorden identiek. Twee pagina's zouden op vrijwel dezelfde
titel concurreren en Google moet dan kiezen welke hij toont — precies het
probleem dat in dit document bij de twee De Stijl-pagina's als zwakste plek
staat aangewezen. De huidige titel onderscheidt zich juist van de homepage.
**Laten staan.**

### INGETROKKEN: "washi" in plaats van "Japans papier" in de descriptions

Twee redenen.

De **description is geen rankingfactor** — dat staat elders in dit document
ook. Een woord daar wisselen "voor de SEO" doet niets voor de vindbaarheid.

En "Japans papier" is **niet de mindere term**:

| Term | Wat mensen erachteraan typen |
|---|---|
| japans papier | *kopen, restauratie, **japans papier washi*** |
| washi papier | *kopen, hema, japan, lamp* |

Allebei leven ze, en bij "japans papier" typen mensen er zelf "washi" achter.
De site heeft beide woorden al, verspreid over de pagina's.

### De les hieruit

Twee van de vier voorstellen waren woorden verplaatsen, niet inhoud
toevoegen. Bij het toetsen bleek er geen onderbouwing voor, en bij een ervan
zelfs schade. Wat wel werkt is het omgekeerde: een begrip toevoegen dat er
nog niet stond (wabi-sabi) of een verhaal uit een bijzin halen (shoji).

Vuistregel voor de volgende ronde: verplaats geen woorden zonder meting,
voeg liever inhoud toe.

---

## Volgorde

Wat nu nog echt iets oplevert, op volgorde:

1. **Hoofdstuk 2b** — "handgemaakt" in de hoofdtekst van de acht
   productpagina's. De titels beloven het, de pagina's zeggen het nergens.
2. **Hoofdstuk 3** — Google Bedrijfsprofiel. Nul regels code, veel effect
   lokaal.
3. **Hoofdstuk 4** — structured data op de vier pagina's die alleen een
   kruimelpad hebben.
4. Het restje uit hoofdstuk 7: een blok met veelgestelde vragen en `FAQPage`.

Afgevallen: `sameAs` uit hoofdstuk 6. Er zijn geen sociale profielen, en een
`sameAs` naar een profiel dat niet bestaat is erger dan geen `sameAs`. Het
KvK-nummer staat al als `identifier` in het schema, en dat is voor een
Nederlands bedrijf een steviger bevestiging van de identiteit.

Het bijwerken van de sitemap stond hier ook: dat doet `python seo.py sitemap`
nu.

En los daarvan, vóór de lancering: **de testsite bijwerken**. Die loopt twee
dagen achter en `LANCEREN.md` gaat ervan uit dat je daar eerst test.
