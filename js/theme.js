/* ==========================================================================
   OostersLicht — welk palet en welke letters de site gebruikt
   ==========================================================================

   Wijzig de twee regels hieronder en ververs de pagina. De waarden en hun
   uitwerking staan in css/themes.css; stijlenlab.html zet ze naast elkaar.

   Dit bestand staat bewust zonder defer in de <head>, zodat de keuze al
   vaststaat voordat de eerste regel tekst getekend wordt.
   ========================================================================== */

var PALET   = 'washi';       /* washi · sumi · indigo · kersen · mos · destijl */
var LETTERS = 'mincho';    /* garamond · mincho */


/* --- De lijst voor het stijlenlab ----------------------------------------
   Voeg je in css/themes.css een palet of letterset toe, zet hem dan ook hier
   neer met een leesbare naam en een korte omschrijving. Het stijlenlab bouwt
   zijn keuzelijsten hieruit op; verder gebruikt de site deze lijst niet. */

var PALETTEN = [
  ['washi',   'Washi',   'Warm papierwit met notenhout — zoals de site nu is'],
  ['sumi',    'Sumi',    'Inkt: donkere kamer, de lamp geeft het enige licht'],
  ['indigo',  'Indigo',  'Koel aizome-blauw, met opzet warm lamplicht erin'],
  ['kersen',  'Kersen',  'Kersenhout, het warmste palet, gebrand rood accent'],
  ['mos',     'Mos',     'Het blad in het papier: gedempt groen'],
  ['destijl', 'De Stijl','Bijna wit, zwarte lijn, drie primaire kleuren']
];

var LETTERSETS = [
  ['garamond',   'Garamond',   'Cormorant Garamond + Inter — de huidige zetting'],
  ['mincho',     'Mincho',     'Shippori Mincho + Zen Kaku Gothic — de traditie van het papier']
];


/* --- Tijdelijk voorbeeld -------------------------------------------------
   Het stijlenlab kan een combinatie op de hele site zetten om hem in het
   echt te bekijken. Dat gaat via de adresbalk (?palet=sumi&letters=mincho)
   en blijft daarna in sessionStorage staan, zodat je kunt doorklikken. Het
   verdwijnt zodra je de browser sluit, of via de knop in het lab.
   De twee regels bovenaan blijven wat de site standaard is. */

(function () {
  var palet = PALET;
  var letters = LETTERS;

  try {
    var vraag = new URLSearchParams(window.location.search);
    if (vraag.get('palet')) sessionStorage.setItem('ol-palet', vraag.get('palet'));
    if (vraag.get('letters')) sessionStorage.setItem('ol-letters', vraag.get('letters'));
    if (vraag.get('standaard') !== null) {
      sessionStorage.removeItem('ol-palet');
      sessionStorage.removeItem('ol-letters');
    }
    palet = sessionStorage.getItem('ol-palet') || palet;
    letters = sessionStorage.getItem('ol-letters') || letters;
  } catch (e) {
    /* Privémodus zonder opslag: dan gewoon de waarden uit dit bestand. */
  }

  document.documentElement.dataset.palet = palet;
  document.documentElement.dataset.letters = letters;
})();
