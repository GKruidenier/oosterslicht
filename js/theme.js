/* ==========================================================================
   OostersLicht — welk palet en welke letters de site gebruikt
   ==========================================================================

   Wijzig de twee regels hieronder en ververs de pagina. De waarden en hun
   uitwerking staan in css/themes.css; stijlenlab.html zet ze naast elkaar.

   Dit bestand staat bewust zonder defer in de <head>, zodat de keuze al
   vaststaat voordat de eerste regel tekst getekend wordt.
   ========================================================================== */

/* 'auto' volgt de voorkeur van het apparaat: washi overdag, sumi zodra het
   besturingssysteem op donker staat. Dat is geen toevallige koppeling — sumi
   is de kamer waarvoor deze lampen gemaakt zijn. Een vaste naam invullen
   (washi, sumi, …) zet de site onvoorwaardelijk op dat palet. */
var PALET   = 'auto';        /* auto · washi · sumi · indigo · kersen · mos · destijl */
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

/* Welke paletten donker zijn. Dit bepaalt ook wat de browser zelf tekent:
   schuifbalken, de cursor in een invoerveld, de standaard formulierknoppen.
   Zonder color-scheme blijven die lichtgrijs op een zwarte pagina staan. */
var DONKERE_PALETTEN = ['sumi'];

(function () {
  var palet = PALET;
  var letters = LETTERS;
  var gekozen = false;               /* heeft de bezoeker zelf iets gekozen? */

  var wilDonker = function () {
    return window.matchMedia &&
           window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  try {
    var vraag = new URLSearchParams(window.location.search);
    if (vraag.get('palet')) sessionStorage.setItem('ol-palet', vraag.get('palet'));
    if (vraag.get('letters')) sessionStorage.setItem('ol-letters', vraag.get('letters'));
    if (vraag.get('standaard') !== null) {
      sessionStorage.removeItem('ol-palet');
      sessionStorage.removeItem('ol-letters');
    }
    var bewaard = sessionStorage.getItem('ol-palet');
    if (bewaard) { palet = bewaard; gekozen = true; }
    letters = sessionStorage.getItem('ol-letters') || letters;
  } catch (e) {
    /* Privémodus zonder opslag: dan gewoon de waarden uit dit bestand. */
  }

  var zet = function (naam) {
    var echt = naam === 'auto' ? (wilDonker() ? 'sumi' : 'washi') : naam;
    document.documentElement.dataset.palet = echt;
    document.documentElement.style.colorScheme =
      DONKERE_PALETTEN.indexOf(echt) === -1 ? 'light' : 'dark';
  };

  zet(palet);
  document.documentElement.dataset.letters = letters;

  /* Iemand die 's avonds zijn telefoon op donker zet, hoeft de pagina niet te
     verversen. Wie zelf een palet koos houdt die keuze. */
  if (!gekozen && palet === 'auto' && window.matchMedia) {
    var donkerVraag = window.matchMedia('(prefers-color-scheme: dark)');
    var luister = function () { zet('auto'); };
    if (donkerVraag.addEventListener) donkerVraag.addEventListener('change', luister);
    else if (donkerVraag.addListener) donkerVraag.addListener(luister);
  }
})();
