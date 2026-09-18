---
target: "sectie Traditioneel papier uit Japan (maakproces.html#materialen)"
total_score: 29
max_score: 36
na_heuristics: 9
p0_count: 1
p1_count: 3
target_identity: "file:C:\\Users\\giada\\Documents\\website_oosterslicht_claude\\maakproces.html#materialen"
timestamp: 2026-09-18T11-35-46Z
slug: maakproces-html-materialen
---
Method: dual-agent (A: a53e31dc0d6321912 · B: a426df590547e3c2f)

Target: de sectie "Traditioneel papier uit Japan" (`maakproces.html`, `#materialen`).
Mode: Read. Twee ronden uitgevoerd; score voor 5/10, na 8/10.

## Design Health Score

| # | Heuristiek | Voor | Na | Kernpunt |
|---|---|---|---|---|
| 1 | Zichtbaarheid van systeemstatus | 2 | 3 | Terugval meldt nu waarom de film niet speelt; duur/taal ontbreken nog |
| 2 | Aansluiting op de echte wereld | 4 | 4 | kozo, shoji, unryu, 雲龍紙 — vakwoorden die worden uitgelegd |
| 3 | Controle en vrijheid | 3 | 4 | Monsters openen een close-up, zelfde handeling als het materiaalwiel |
| 4 | Consistentie en standaarden | 1 | 3 | Kolomsemantiek en raster hersteld; naam "Kozogami" vs "Kozo washi" nog scheef |
| 5 | Foutpreventie | 1 | 3 | Geblokkeerde embed toont nu tekst plus werkende link |
| 6 | Herkennen boven herinneren | 2 | 3 | Monsters groot genoeg om aan de tekst te koppelen |
| 7 | Flexibiliteit en efficientie | 2 | 2 | Een lineair pad, geen sprong naar de monsters |
| 8 | Esthetiek en minimalisme | 2 | 4 | Halflege rij weg, film op maat, regellengte in de band |
| 9 | Fouten herstellen | n/a | n/a | Geen invoer die de bezoeker fout kan doen |
| 10 | Hulp en documentatie | 3 | 3 | Geen samenvatting of transcript van de film |
| Totaal | | 20/36 | 29/36 | Van matig naar goed |

## Design Specificity Verdict

Voor: authored copy in een template-compositie. De tekst is onmiskenbaar van dit bedrijf;
de vormgeving kon van elk willekeurig product zijn. Na: de compositie doet nu mee.
De film is het grootste element van de sectie, de monsters zijn groot genoeg om vezel
te tonen, en de close-up is dezelfde interactie als op de collectiepagina.

Deterministische scan: 7 bevindingen, 6 identiek aan de nulmeting en geen daarvan
verankerd in deze sectie (paginahero, footer, body clipping, "primary font: inter").
De zevende is nieuw en een vals positief: "video__kader: children flush against bg"
meldt dat de terugvaltekst en de iframe tegen de rand van hun kader liggen. Dat is
precies wat een beeldkader hoort te doen; de tekst heeft eigen padding.

## Priority Issues - status na twee ronden

- [P0] Monsterraster telde zeven sporen voor drie monsters - opgelost. auto-fill met
  minimum 9rem vulde de rij met alle sporen die pasten; 748px bleef leeg en de monsters
  werden 159px. Nu drie gelijke kolommen: 408px op 1440.
- [P1] split--wide-media gaf de brede kolom aan de tekst - opgelost. --reverse verschoof
  het beeld na de spoorverdeling, dus kreeg de tekst 1,15fr. Film was 514px, is nu 695px;
  tekstregel ging van 107 naar 73 tekens.
- [P1] Monsters niet te vergroten terwijl de component bestond - opgelost via
  lightbox.openInfo, met naam en omschrijving uit het bijschrift.
- [P2] Geen terugval bij geblokkeerde embed - opgelost.
- [P2] Geen zichtbare bronvermelding - opgelost: "Film van Unesco" in het bijschrift.
- [P2] Beide alinea's even zwaar, sectie eindigt op 14px link - open, taalkeuze.
- [P1] Geen enkel beeld van doorschijnend papier - open, ontbrekende foto.
- [P2] "Kozogami" hier, "Kozo washi" in het wiel - open, inhoudelijke keuze.

## Persona Red Flags - na de ronden

- Materiaalgerichte lezer: kan het papier nu van dichtbij zien; mist nog het beeld van
  papier met licht erdoor, precies de eigenschap die de tekst claimt.
- Schermlezer: monsterrij heeft nu een groepskop; tabvolgorde loopt kop, film, monsters.
- Eerste bezoeker: film is nu het hoofdbeeld van de sectie in plaats van een postzegel.
