/* OostersLicht — interactie
   Mobiel menu, sticky-header-staat en scroll-onthulling.
   Alle beweging respecteert prefers-reduced-motion. */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* --- Mobiel menu -------------------------------------------------------- */

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  if (toggle && nav) {
    var closeMenu = function () {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    };

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });

    // Escape sluit het menu en geeft focus terug aan de knop.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        toggle.focus();
      }
    });

    // Een link volgen sluit het menu.
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    // Terug naar desktop: menu-staat opruimen.
    window.matchMedia('(min-width: 980px)').addEventListener('change', function (e) {
      if (e.matches) closeMenu();
    });
  }

  /* --- Sticky header ------------------------------------------------------ */

  var header = document.querySelector('.site-header');

  if (header) {
    var sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;';
    document.body.prepend(sentinel);

    new IntersectionObserver(
      function (entries) {
        header.classList.toggle('is-stuck', !entries[0].isIntersecting);
      },
      { threshold: 0 }
    ).observe(sentinel);
  }

  /* --- Scroll-onthulling -------------------------------------------------- */

  var revealables = document.querySelectorAll('[data-reveal]');

  if (revealables.length) {
    // Bij minder-beweging meteen de eindtoestand tonen, zonder observer.
    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      revealables.forEach(function (el) {
        el.classList.add('is-visible');
      });
    } else {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
      );

      revealables.forEach(function (el) {
        observer.observe(el);
      });
    }
  }

  /* --- Lichtbak ------------------------------------------------------------ */

  var lightbox = (function () {
    var dialog = null;
    var img = null;
    var label = null;
    var slides = [];
    var index = 0;
    var onChange = null;

    var icon = function (d) {
      return (
        '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="' +
        d +
        '"/></svg>'
      );
    };

    var build = function () {
      dialog = document.createElement('dialog');
      dialog.className = 'lightbox';
      /* Een dialoogvenster zonder naam wordt door een schermlezer aangekondigd
         als alleen "dialoog", zonder te zeggen wat er te zien is. De naam
         wordt per opening bijgewerkt in open() en openInfo(). */
      dialog.setAttribute('aria-label', 'Foto op ware grootte');
      dialog.innerHTML =
        '<img class="lightbox__img" alt="">' +
        '<div class="lightbox__info" data-lb="info" hidden>' +
        '<h2 class="lightbox__title" data-lb="titel"></h2>' +
        '<p class="lightbox__desc" data-lb="desc"></p>' +
        '</div>' +
        '<div class="lightbox__bar">' +
        '<button class="lightbox__btn" type="button" data-lb="prev" aria-label="Vorige foto">' + icon('M10 3 5 8l5 5') + '</button>' +
        '<span data-lb="label"></span>' +
        '<button class="lightbox__btn" type="button" data-lb="next" aria-label="Volgende foto">' + icon('M6 3l5 5-5 5') + '</button>' +
        '<button class="lightbox__btn" type="button" data-lb="close" aria-label="Sluiten">' + icon('M4 4l8 8M12 4l-8 8') + '</button>' +
        '</div>';
      document.body.appendChild(dialog);

      img = dialog.querySelector('.lightbox__img');
      label = dialog.querySelector('[data-lb="label"]');

      dialog.querySelector('[data-lb="prev"]').addEventListener('click', function () { step(-1); });
      dialog.querySelector('[data-lb="next"]').addEventListener('click', function () { step(1); });
      dialog.querySelector('[data-lb="close"]').addEventListener('click', function () { dialog.close(); });

      // Klik op de achtergrond sluit; klik op de foto niet.
      dialog.addEventListener('click', function (e) {
        if (e.target === dialog) dialog.close();
      });

      dialog.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      });
    };

    var render = function () {
      var slide = slides[index];
      if (!slide) return;
      img.src = slide.currentSrc || slide.src;
      img.alt = slide.alt;
      label.textContent = index + 1 + ' / ' + slides.length;
      var single = slides.length < 2;
      dialog.querySelector('[data-lb="prev"]').hidden = single;
      dialog.querySelector('[data-lb="next"]').hidden = single;
      if (onChange) onChange(index);
    };

    var step = function (d) {
      // Zonder deze grens levert modulo nul een NaN-index op.
      if (!slides.length) return;
      index = (index + d + slides.length) % slides.length;
      render();
    };

    return {
      /* Reeks foto's met vorige/volgende. */
      open: function (list, start, cb) {
        if (!dialog) build();
        slides = list;
        index = start || 0;
        onChange = cb || null;
        dialog.querySelector('[data-lb="info"]').hidden = true;
        label.hidden = false;
        dialog.setAttribute('aria-label', 'Foto op ware grootte, ' +
          slides.length + (slides.length === 1 ? ' foto' : ' foto’s'));
        render();
        dialog.showModal();
      },

      /* Eén afbeelding met naam en omschrijving — voor de materiaalwielen. */
      openInfo: function (opties) {
        if (!dialog) build();
        slides = [];
        onChange = null;

        img.src = opties.src;
        img.alt = opties.alt || '';

        var info = dialog.querySelector('[data-lb="info"]');
        dialog.querySelector('[data-lb="titel"]').textContent = opties.titel || '';
        dialog.querySelector('[data-lb="desc"]').textContent = opties.desc || '';
        info.hidden = false;

        label.hidden = true;
        dialog.querySelector('[data-lb="prev"]').hidden = true;
        dialog.querySelector('[data-lb="next"]').hidden = true;
        dialog.setAttribute('aria-label', opties.titel
          ? opties.titel + ' — close-up'
          : 'Materiaal van dichtbij');

        dialog.showModal();
      }
    };
  })();

  /* --- Papiermonsters: klikken opent een close-up -------------------------- */

  /* Dezelfde close-up als het materiaalwiel bij de collectie, zodat dezelfde
     handeling op beide plekken hetzelfde doet. Naam en omschrijving komen uit
     het bijschrift dat er al staat; geen tweede plek om bij te houden. */
  document.querySelectorAll('[data-monster]').forEach(function (knop) {
    knop.addEventListener('click', function () {
      var foto = knop.querySelector('img');
      var caption = knop.closest('figure').querySelector('figcaption');
      if (!foto || !caption) return;

      var figuur = knop.closest('figure');
      var naam = caption.textContent.trim();

      lightbox.openInfo({
        src: foto.currentSrc || foto.src,
        alt: 'Close-up van ' + naam,
        titel: naam,
        desc: figuur.dataset.omschrijving || ''
      });
    });
  });

  /* --- Hout- en papiersoort aanwijzen -------------------------------------- */

  /* In de specificaties op een productpagina staan de soorten als woorden.
     "Kinwashi" of "iep" zegt niets als je ze niet kent, en de close-ups staan
     elders: op het maakproces en in de materiaalwielen bij de collectie. Wie
     op een productpagina staat is aan het kiezen, en die moet de soort kunnen
     zien zonder weg te klikken.

     Eén tabel voor alle negen soorten. De namen en omschrijvingen zijn
     dezelfde als in de wielen en bij de monsters, zodat er niet op drie
     plekken een eigen waarheid ontstaat. */
  var SOORTEN = {
    esdoorn:  { naam: 'Esdoorn',    desc: 'Licht met een subtiele nerf. Rustig en minimalistisch.',   bron: 'inzet_esdoornhout.webp' },
    es:       { naam: 'Es',         desc: 'Licht van kleur met een duidelijke, levendige nerf.',      bron: 'inzet_essenhout.webp' },
    iep:      { naam: 'Iep',        desc: 'Warm lichtbruin met een krachtige, karakteristieke nerf.', bron: 'inzet_iepenhout.webp' },
    kers:     { naam: 'Kers',       desc: 'Warm roodbruin dat met de tijd verdiept en rijker wordt.', bron: 'inzet_kersenhout.webp' },
    noten:    { naam: 'Noten',      desc: 'Diep donkerbruin met een golvende tekening.',              bron: 'inzet_notenhout.webp' },
    eiken:    { naam: 'Eiken',      desc: 'Stevig, met een open en herkenbare nerf.',                 bron: 'inzet_eikenhout.webp' },
    kozo:     { naam: 'Kozo washi', desc: 'Wit en egaal, van de bast van de moerbeiboom.',            bron: 'traditioneel_wit_moerbei_kozo_2.webp' },
    unryu:    { naam: 'Unryu kozo', desc: 'Lange vezels die als wolken door het vel lopen.',          bron: 'unryu_moerbei_kozo_papier.webp' },
    kinwashi: { naam: 'Kinwashi',   desc: 'Met manillahennep, iets geliger van kleur.',               bron: 'kinwashi_kozo_washi.webp' }
  };

  (function () {
    var knoppen = [].slice.call(document.querySelectorAll('[data-staal]'));
    if (!knoppen.length) return;

    /* De originelen lopen tot 269 kB — te zwaar om bij het aanwijzen op te
       halen, want dan is het kaartje een halve seconde leeg. Er staat dus een
       uitsnede van 320px klaar per soort; de originelen blijven voor de
       close-up, waar je ze wél op ware grootte wilt. */
    function klein(sleutel) { return 'assets/img/staal/' + sleutel + '.webp'; }
    function groot(sleutel) { return 'assets/img/' + SOORTEN[sleutel].bron; }

    var kaart, foto, naamEl, descEl;
    var actief = null;
    var wacht = 0;

    function bouw() {
      kaart = document.createElement('div');
      kaart.className = 'staalkaart';
      /* Het kaartje herhaalt wat de knop al aan een schermlezer vertelt, dus
         het hoort niet nog een keer in de voorleesvolgorde. */
      kaart.setAttribute('aria-hidden', 'true');
      kaart.innerHTML =
        '<img class="staalkaart__foto" alt="" width="320" height="320" decoding="async">' +
        '<span class="staalkaart__tekst">' +
        '<span class="staalkaart__naam"></span>' +
        '<span class="staalkaart__desc"></span>' +
        '</span>';
      document.body.appendChild(kaart);
      foto = kaart.querySelector('.staalkaart__foto');
      naamEl = kaart.querySelector('.staalkaart__naam');
      descEl = kaart.querySelector('.staalkaart__desc');
    }

    /* Het kaartje mag niet half buiten beeld vallen, dus het klapt om zodra
       het rechts of onder niet meer past. De 18px is de afstand tot de punt
       van de muis: dichterbij en de cursor staat er bovenop. */
    function plaats(x, y) {
      var m = kaart.getBoundingClientRect();
      var r = 18;
      var l = x + r;
      var t = y + r;
      if (l + m.width > window.innerWidth - 8) l = x - r - m.width;
      if (t + m.height > window.innerHeight - 8) t = y - r - m.height;
      if (l < 8) l = 8;
      if (t < 8) t = 8;
      kaart.style.transform = 'translate3d(' + Math.round(l) + 'px,' + Math.round(t) + 'px,0)';
    }

    /* Onder de knop in plaats van bij de muis: bij toetsenbordbediening is er
       geen cursor om naast te gaan staan. */
    function plaatsBijKnop(knop) {
      var k = knop.getBoundingClientRect();
      plaats(k.left - 18, k.bottom - 12);
    }

    function toon(knop, x, y) {
      var sleutel = knop.dataset.staal;
      var soort = SOORTEN[sleutel];
      if (!soort) return;
      if (!kaart) bouw();

      if (actief !== sleutel) {
        actief = sleutel;
        foto.src = klein(sleutel);
        naamEl.textContent = soort.naam;
        descEl.textContent = soort.desc;
      }
      if (x === null) plaatsBijKnop(knop); else plaats(x, y);
      kaart.setAttribute('data-open', '');
    }

    function verberg() {
      if (kaart) kaart.removeAttribute('data-open');
    }

    knoppen.forEach(function (knop) {
      var soort = SOORTEN[knop.dataset.staal];
      if (!soort) return;

      /* Het kaartje is beeld; de omschrijving moet ook zonder beeld mee. */
      knop.setAttribute('aria-label', soort.naam + ': ' + soort.desc + ' Bekijk close-up.');

      knop.addEventListener('pointerenter', function (e) {
        if (e.pointerType !== 'mouse') return;
        toon(knop, e.clientX, e.clientY);
      });

      knop.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse' || actief !== knop.dataset.staal) return;
        /* Eén verplaatsing per beeld: pointermove vuurt vaker dan er getekend
           wordt, en dan staat het kaartje te trillen. */
        if (wacht) return;
        var x = e.clientX;
        var y = e.clientY;
        wacht = requestAnimationFrame(function () {
          wacht = 0;
          plaats(x, y);
        });
      });

      knop.addEventListener('pointerleave', verberg);
      knop.addEventListener('focus', function () { toon(knop, null, null); });
      knop.addEventListener('blur', verberg);

      /* Aanklikken of aantikken opent dezelfde close-up als de monsters op de
         maakproces-pagina. Daar is de grote versie op zijn plek, en op een
         telefoon — waar niets aan te wijzen valt — is dit de enige manier. */
      knop.addEventListener('click', function () {
        verberg();
        lightbox.openInfo({
          src: groot(knop.dataset.staal),
          alt: 'Close-up van ' + soort.naam,
          titel: soort.naam,
          desc: soort.desc
        });
      });
    });

    window.addEventListener('scroll', verberg, { passive: true });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') verberg();
    });

    /* De uitsnedes van deze pagina alvast ophalen zodra de browser niets beters
       te doen heeft. Het zijn er hooguit zeven van rond de 10 kB, en daarmee
       staat het kaartje bij de eerste aanwijzing meteen goed. */
    function vooruit() {
      var gehad = {};
      knoppen.forEach(function (knop) {
        var sleutel = knop.dataset.staal;
        if (gehad[sleutel] || !SOORTEN[sleutel]) return;
        gehad[sleutel] = 1;
        new Image().src = klein(sleutel);
      });
    }
    if (window.requestIdleCallback) requestIdleCallback(vooruit, { timeout: 3000 });
    else setTimeout(vooruit, 1200);
  })();

  /* --- Lampgalerij met materiaalfilter ------------------------------------- */

  document.querySelectorAll('[data-lamp-gallery]').forEach(function (gallery) {
    var slider = gallery.querySelector('[data-slider]');
    if (!slider) return;

    var all = [].slice.call(slider.querySelectorAll('.slider__slide'));
    if (!all.length) return;

    var count = slider.querySelector('.slider__count');
    var caption = slider.querySelector('[data-slider-caption]');
    var prev = slider.querySelector('.slider__btn--prev');
    var next = slider.querySelector('.slider__btn--next');
    var zoom = slider.querySelector('.slider__zoom');
    var orderLink = gallery.querySelector('[data-order-link]');

    var visible = all.slice();
    var index = 0;

    var checked = function (attr) {
      return gallery.querySelector('input[' + attr + ']:checked');
    };

    var render = function () {
      all.forEach(function (s) { s.classList.remove('is-active'); });

      if (visible.length) {
        if (index >= visible.length) index = 0;
        visible[index].classList.add('is-active');
      }

      if (count) count.textContent = visible.length ? index + 1 + ' / ' + visible.length : '';
      if (caption) caption.textContent = visible.length ? visible[index].dataset.caption || '' : '';

      // Pijlen alleen tonen als er iets te bladeren valt.
      slider.classList.toggle('is-ready', visible.length > 1);
    };

    var updateOrderLink = function () {
      if (!orderLink) return;
      var wood = checked('data-wood-option');
      var paper = checked('data-paper-option');
      var params = new URLSearchParams();
      params.set('lamp', gallery.dataset.lampName || '');
      // Keuzeknoppen als die er zijn; anders de vaste soort van deze lamp.
      if (wood) params.set('hout', wood.value);
      else if (gallery.dataset.lampHout) params.set('hout', gallery.dataset.lampHout);
      if (paper) params.set('papier', paper.value);
      else if (gallery.dataset.lampPapier) params.set('papier', gallery.dataset.lampPapier);
      orderLink.href = 'contact.html?' + params.toString() + '#formulier';
    };

    /* SLAPEND — dit filter wisselt de foto's van één lamp op basis van een
       gekozen hout- of papiersoort. Het is af en werkt, maar staat uit omdat
       de twee dingen die het voedt nog ontbreken:

         1. Keuzeknoppen in het productblok:
            <input type="radio" data-wood-option="noten" ...> binnen
            [data-lamp-gallery]. De change-listener onderaan deze functie
            pakt ze dan vanzelf op.
         2. Foto's per houtsoort, elk getagd op de slide zelf:
            <img class="slider__slide" data-wood="noten" data-paper="unryu" ...>
            Nu heeft geen enkele slide die attributen, dus zelfs mét knoppen
            valt het filter terug op "toon alles".

       Punt 2 is fotografie, geen code: het vraagt van elke lamp een opname per
       houtsoort. Zolang dat er niet is, beloven de materiaalwielen op de
       pagina bewust geen keuze — zie de teksten onder #materialen.

       Zodra beide er zijn werkt ook updateOrderLink() hierboven mee: die neemt
       de gekozen soorten dan over in de link naar het bestelformulier. */
    var applyFilter = function () {
      var wood = checked('data-wood-option');
      var paper = checked('data-paper-option');
      var w = wood ? wood.dataset.woodOption : null;
      var p = paper ? paper.dataset.paperOption : null;

      visible = all.filter(function (s) {
        var woodOk = !w || s.dataset.wood === w;
        var paperOk = !p || s.dataset.paper === p || s.dataset.paper === 'alle';
        return woodOk && paperOk;
      });

      // Nooit met een lege slider eindigen: val terug op de algemene foto's.
      if (!visible.length) {
        visible = all.filter(function (s) { return s.dataset.paper === 'alle'; });
      }
      if (!visible.length) visible = all.slice();

      index = 0;
      render();
      updateOrderLink();
    };

    if (prev) prev.addEventListener('click', function () {
      index = (index - 1 + visible.length) % visible.length;
      render();
    });

    if (next) next.addEventListener('click', function () {
      index = (index + 1) % visible.length;
      render();
    });

    if (zoom) zoom.addEventListener('click', function () {
      lightbox.open(visible, index, function (i) {
        index = i;
        render();
      });
    });

    gallery.querySelectorAll('input[data-wood-option], input[data-paper-option]').forEach(function (input) {
      input.addEventListener('change', applyFilter);
    });

    applyFilter();
  });

  /* --- Materiaalwielen ----------------------------------------------------- */

  /* Een SVG-patroon kent geen loading="lazy": zodra de parser de <image> ziet,
     haalt hij hem op. De wielen staan ver onder de vouw, dus dat kostte de
     collectiepagina 213 kB voordat er iets van te zien was. De bron staat nu
     in data-href en wordt pas gezet als het wiel in de buurt komt. Onder de
     texturen ligt een vlak in de gemiddelde kleur van de foto, zodat er geen
     leeg wiel staat tijdens het laden — en zodat het wiel zonder JavaScript
     nog steeds negen te onderscheiden soorten toont. */
  (function () {
    var patronen = [].slice.call(document.querySelectorAll('image[data-href]'));
    if (!patronen.length) return;

    var laad = function (image) {
      if (image.getAttribute('href')) return;
      image.setAttribute('href', image.getAttribute('data-href'));
    };

    if (!('IntersectionObserver' in window)) {
      patronen.forEach(laad);
      return;
    }

    /* Een halve schermhoogte vooruit: ver genoeg om geladen te zijn voordat
       het wiel in beeld komt, dichtbij genoeg om niets op te halen voor wie
       nooit zo ver scrolt. */
    var kijker = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll('image[data-href]').forEach(laad);
        kijker.unobserve(entry.target);
      });
    }, { rootMargin: '50% 0px' });

    document.querySelectorAll('[data-wheel]').forEach(function (wheel) {
      kijker.observe(wheel);
    });
  })();

  document.querySelectorAll('[data-wheel]').forEach(function (wheel) {
    var segments = [].slice.call(wheel.querySelectorAll('.wheel__segment'));
    /* De uitleg staat niet meer onder elk wiel, maar één keer tussen de twee
       wielen in; beide wielen schrijven dus naar hetzelfde vak. */
    var readout = wheel.querySelector('[data-wheel-readout]') ||
      (wheel.closest('.wheels') || document).querySelector('[data-wheel-readout]');
    var nameEl = readout && readout.querySelector('[data-wheel-name]');
    var descEl = readout && readout.querySelector('[data-wheel-desc]');
    if (!segments.length || !nameEl || !descEl) return;

    var startName = nameEl.textContent;
    var startDesc = descEl.textContent;

    var toon = function (segment) {
      segments.forEach(function (s) { s.classList.toggle('is-active', s === segment); });
      nameEl.textContent = segment ? segment.dataset.name : startName;
      descEl.textContent = segment ? segment.dataset.desc : startDesc;
    };

    /* De materiaalfoto zit als <image> in het SVG-patroon waarmee het segment
       gevuld is; die halen we eruit in plaats van hem te dupliceren.
       Het patroon zelf draagt een versie van 512px — genoeg voor een taartpunt
       van 336px, veel te weinig voor een close-up. data-groot wijst naar het
       origineel, dat alleen wordt opgehaald als iemand echt doorklikt. */
    var fotoVan = function (segment) {
      // Browsers geven de fill terug als url("#id") — de aanhalingstekens
      // moeten dus optioneel zijn, anders matcht er niets.
      var m = /url\(\s*["']?#([^"')\s]+)["']?\s*\)/.exec(segment.style.fill || '');
      if (!m) return null;
      var pattern = wheel.querySelector('#' + CSS.escape(m[1]) + ' image');
      if (!pattern) return null;
      return pattern.getAttribute('data-groot') ||
             pattern.getAttribute('data-href') ||
             pattern.getAttribute('href');
    };

    segments.forEach(function (segment) {
      segment.addEventListener('mouseenter', function () { toon(segment); });
      segment.addEventListener('focus', function () { toon(segment); });

      // Klikken opent de foto uitvergroot, met naam en omschrijving.
      segment.addEventListener('click', function () {
        toon(segment);
        var src = fotoVan(segment);
        if (!src) return;
        lightbox.openInfo({
          src: src,
          alt: 'Close-up van ' + segment.dataset.name,
          titel: segment.dataset.name,
          desc: segment.dataset.desc
        });
      });

      segment.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // SVG-elementen erven niet van HTMLElement en hebben dus geen .click().
          segment.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
      });
    });

    wheel.addEventListener('mouseleave', function () { toon(null); });

    wheel.addEventListener('focusout', function (e) {
      if (!wheel.contains(e.relatedTarget)) toon(null);
    });
  });

  /* --- Diptiek: ensō en yin/yang ------------------------------------------ */

  /* Zweven opent een paneel via CSS alleen; dat werkt niet op een
     aanraakscherm en zegt een schermlezer niets. Deze knop maakt dezelfde
     tekst bereikbaar met een tik en met Enter, en meldt de stand. */
  document.querySelectorAll('.duality__toggle').forEach(function (knop) {
    var paneel = knop.closest('.duality__panel');
    if (!paneel) return;

    /* Zonder muis staat de tekst open (zie de (hover: none)-regels in de
       stylesheet); de knop doet hem daar dus juist dicht. */
    var geenMuis = window.matchMedia('(hover: none)');
    knop.setAttribute('aria-expanded', geenMuis.matches ? 'true' : 'false');

    knop.addEventListener('click', function () {
      if (geenMuis.matches) {
        var dicht = paneel.toggleAttribute('data-dicht');
        knop.setAttribute('aria-expanded', dicht ? 'false' : 'true');
      } else {
        var open = paneel.toggleAttribute('data-open');
        knop.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
    });

    /* Wisselt iemand van aanraken naar een muis (of draait een tablet om),
       dan klopt de gemelde stand anders niet meer met wat er staat. */
    geenMuis.addEventListener('change', function (e) {
      paneel.removeAttribute('data-open');
      paneel.removeAttribute('data-dicht');
      knop.setAttribute('aria-expanded', e.matches ? 'true' : 'false');
    });
  });

  /* --- Contactformulier ---------------------------------------------------- */

  var form = document.querySelector('[data-form]');

  if (form) {
    /* Toon het bestelblok alleen wanneer iemand wil bestellen.
       Zonder JS staat alles open, zodat het formulier bruikbaar blijft. */
    var orderBlock = form.querySelector('[data-order-block]');
    var reasons = form.querySelectorAll('input[name="onderwerp-type"]');

    /* --- Alleen de velden tonen die voor de gekozen lamp gelden -------------

       Wat er per lamp te kiezen valt, staat in de productbeschrijving. Elke
       lamp uit de Japanse collectie kan met elke papiersoort worden gemaakt;
       De Stijl-lampen hebben geen hout- of papierkeuze en wél een tapekleur.
       De sleutels komen letterlijk overeen met de teksten van de
       <option>-elementen in het lampmenu.

       Een waarde van 1 betekent: veld tonen met alle opties. Staat er een
       lijst, dan blijven alleen die opties over — de Take krijgt wel een
       blad, maar alleen bamboe, terwijl de Koyo uit vier soorten kan
       kiezen. */
    var LAMPVELDEN = {
      /* De houtsoorten komen uit de specificatie op de productpagina en zijn
         per lamp verschillend: alleen de Koyo wordt in alle zes gemaakt. Bij
         de Yin en de Yang gaat de keuze over de kap. Bij de Yang staat onder
         het menu dat de detaillering altijd esdoorn is. "In overleg"
         staat overal bij, want elke pagina zegt "andere soorten op aanvraag".

         Het papier is bij elke Japanse lamp vrij te kiezen uit alle drie. */
      'Vloerlamp Yin':      { hout: ['Noten', 'In overleg'], papier: 1 },
      'Vloerlamp Yang':     { hout: ['Kers', 'Iep', 'Noten', 'In overleg'], papier: 1,
                              vast: 'een detaillering van esdoornhout' },
      'Hanglamp Kawa':      { hout: ['Esdoorn', 'In overleg'], papier: 1 },
      'Wandlamp Koyo':      { hout: 1, papier: 1, blad: 1, afmeting: 1 },
      'Wandlamp Torii':     { hout: ['Noten', 'In overleg'], papier: 1 },
      'Tafellamp Take':     { hout: ['Noten', 'In overleg'], papier: 1,
                              blad: ['Geen blad', 'Bamboeblad'],
                              standaard: { blad: 'Bamboeblad' } },

      'Tafellamp De Stijl': { tape: 1, vast: 'effen Japans papier zonder vezels' },
      'Wandlamp De Stijl':  { tape: 1, vast: 'effen Japans papier zonder vezels' },

      /* Bij een volledig nieuw ontwerp valt er nog niets te kiezen: hout,
         papier, blad en afmeting komen pas ter sprake in het gesprek dat
         hierna volgt. Daarom alleen een beschrijving en, als iemand die
         heeft, een schets of foto. Met opmaat gelden ook de ALTIJD-velden
         niet, op de lampkeuze zelf na. */
      'Volledig op maat':   { opmaat: true, beschrijving: 1, bestanden: 1 }
    };

    /* De bezoeker kon een lamp bestellen zonder ooit een bedrag te zien: de
       deeplink vanaf een productpagina draagt alleen ?lamp=, en het formulier
       zweeg erover. Dit zijn dezelfde bedragen als in de specificatielijst op
       de productpagina's; wijzigt daar een prijs, dan ook hier.

       Twee bedragen betekent: de prijs hangt af van de afmeting. */
    var PRIJZEN = {
      'Vloerlamp Yin':      585,
      'Vloerlamp Yang':     485,
      'Hanglamp Kawa':      365,
      'Wandlamp Koyo':      121,
      'Wandlamp Torii':     395,
      'Tafellamp Take':     395,
      'Tafellamp De Stijl': 199,
      'Wandlamp De Stijl':  179
    };

    // Deze velden gelden altijd, ongeacht de lamp.
    var ALTIJD = { lamp: 1, aantal: 1, detaillering: 1 };
    var ALTIJD_OPMAAT = { lamp: 1, aantal: 1 };

    var syncVelden = function (block, verseKeuze) {
      if (!block) return;
      var select = block.querySelector('[data-veld="lamp"] select');
      if (!select) return;

      var gekozen = select.value || (select.selectedIndex > 0
        ? select.options[select.selectedIndex].text : '');
      var regels = LAMPVELDEN[gekozen] || null;
      var bestelt = orderBlock ? !orderBlock.hidden : true;
      var altijd = (regels && regels.opmaat) ? ALTIJD_OPMAAT : ALTIJD;

      block.querySelectorAll('[data-veld]').forEach(function (veld) {
        var sleutel = veld.getAttribute('data-veld');
        var regel = regels ? regels[sleutel] : null;
        // Zonder gekozen lamp alleen de vaste velden tonen; dat is rustiger
        // dan alles tonen en daarna de helft weghalen.
        var toon = !!altijd[sleutel] || !!regel;
        veld.hidden = !toon;

        // Opties binnen het veld beperken wanneer de regel een lijst is.
        var toegestaan = Array.isArray(regel) ? regel : null;
        veld.querySelectorAll('select').forEach(function (sel) {
          var eersteVrij = null;
          [].slice.call(sel.options).forEach(function (opt) {
            var mag = !toegestaan || opt.value === '' ||
                      toegestaan.indexOf(opt.text) !== -1;
            opt.hidden = !mag;
            opt.disabled = !mag;
            if (mag && eersteVrij === null) eersteVrij = opt.index;
          });
          // Stond er een keuze die nu niet meer mag, val terug op de eerste.
          if (sel.selectedIndex >= 0 && sel.options[sel.selectedIndex] &&
              sel.options[sel.selectedIndex].disabled && eersteVrij !== null) {
            sel.selectedIndex = eersteVrij;
          }
        });

        /* Een beginkeuze die afwijkt van de eerste optie: de Take krijgt zijn
           bamboeblad. Alleen bij een verse lampkeuze, zodat een bezoeker die
           daarna bewust "geen blad" kiest dat niet verderop kwijtraakt. */
        if (toon && verseKeuze && regels && regels.standaard &&
            regels.standaard[sleutel]) {
          var wens = regels.standaard[sleutel];
          veld.querySelectorAll('select').forEach(function (sel) {
            [].slice.call(sel.options).forEach(function (opt) {
              if (!opt.disabled && opt.text === wens) sel.selectedIndex = opt.index;
            });
          });
        }

        veld.querySelectorAll('input, select, textarea').forEach(function (el) {
          if (!toon) {
            // Verplicht uitzetten, anders blokkeert een verborgen veld het
            // versturen; en terugzetten op de beginwaarde, anders reist een
            // oude keuze mee. Bij een <select> is dat de eerste optie en niet
            // een lege string: menu's als Afmeting en Blad hebben geen lege
            // optie, en die zouden dan blanco opengaan zodra ze weer
            // verschijnen.
            //
            // Uitschakelen erbij, want verborgen is niet hetzelfde als
            // afwezig: een veld in een verborgen blok wordt gewoon meegestuurd.
            // Zonder dit stond er bij een Vloerlamp Yin "Afmeting: Standaard"
            // en "Blad: Geen blad" in de bestelmail, terwijl die lamp geen van
            // beide kent.
            el.required = false;
            el.disabled = true;
            if (el.tagName === 'SELECT') el.selectedIndex = 0;
            else if (el.type !== 'number') el.value = '';
          } else {
            el.disabled = false;
            if (el.hasAttribute('data-required')) el.required = bestelt;
          }
        });
      });

      var prijsEl = block.querySelector('[data-prijs]');
      if (prijsEl) {
        var tarief = PRIJZEN[gekozen];
        if (typeof tarief === 'object') {
          var maat = block.querySelector('[data-veld="afmeting"] select');
          tarief = tarief[maat && maat.value ? maat.value : 'Standaard'];
        }
        if (!bestelt || tarief === undefined) {
          /* Geen bedrag bekend (De Stijl, volledig op maat) of geen bestelling:
             dan liever niets dan een bedrag dat niet klopt. */
          prijsEl.hidden = true;
          prijsEl.textContent = '';
        } else {
          prijsEl.innerHTML = 'Richtprijs <strong>&euro; ' + tarief + '</strong> incl. btw. ' +
            'Een andere houtsoort, maat of afwerking kan de prijs veranderen.';
          prijsEl.hidden = false;
        }
      }

      var vast = block.querySelector('[data-vast]');
      if (vast) {
        if (regels && regels.vast) {
          vast.textContent = 'Deze lamp wordt altijd gemaakt met ' + regels.vast + '.';
          vast.hidden = false;
        } else {
          vast.textContent = '';
          vast.hidden = true;
        }
      }
    };

    /* Bij de Koyo verandert de prijs mee met de afmeting, dus die keuze moet
       het blok opnieuw laten rekenen. */
    form.addEventListener('change', function (e) {
      var sel = e.target.closest('[data-veld="afmeting"] select');
      if (!sel) return;
      var blok = sel.closest('.lamp-block');
      if (blok) syncVelden(blok);
    });

    /* --- Staal bij de keuzelijst -----------------------------------------

       "Kinwashi" en "iep" zeggen niets als je ze niet kent, en dit is het
       duurste moment van de site om ze niet te kennen: het bestelformulier.
       De negen soorten staan al in SOORTEN hierboven, met dezelfde namen en
       omschrijvingen als in de materiaalwielen, en de uitsneden van 320px
       staan al klaar in assets/img/staal. Er hoeft dus niets bij; het moet
       alleen op de plek komen waar gekozen wordt.

       Niet het zwevende kaartje van de wielen. Dat hangt aan de muis en aan
       hover, en hier heeft de bezoeker al gekozen: die wil zien wát hij koos
       en dat het blijft staan, ook op een telefoon waar geen muis is. */
    var ververseStaal = function (veld) {
      var kaart = veld.querySelector('[data-staal-keuze]');
      var sel = veld.querySelector('select');
      if (!kaart || !sel) return;
      var opt = sel.options[sel.selectedIndex];
      var soort = opt && opt.dataset.staal ? SOORTEN[opt.dataset.staal] : null;
      /* "In overleg" en de lege beginoptie dragen geen sleutel: dan is er
         niets te tonen en verdwijnt het staal weer. */
      if (!soort) { kaart.hidden = true; return; }

      /* Het beeld wordt hier gemaakt en niet in contact.html neergezet. Een
         <img> zonder src in de uitgeleverde pagina is een afbeelding die
         nergens naar wijst; de bron staat pas vast als er gekozen is. */
      var foto = kaart.querySelector('.staal-keuze__foto');
      var tekst = kaart.querySelector('.staal-keuze__desc');
      if (!foto) {
        foto = document.createElement('img');
        foto.className = 'staal-keuze__foto';
        foto.alt = '';
        foto.width = 320;
        foto.height = 320;
        foto.decoding = 'async';
        foto.src = 'assets/img/staal/' + opt.dataset.staal + '.webp';
        tekst = document.createElement('span');
        tekst.className = 'staal-keuze__desc';
        kaart.append(foto, tekst);
      } else {
        foto.src = 'assets/img/staal/' + opt.dataset.staal + '.webp';
      }
      tekst.textContent = soort.desc;
      kaart.hidden = false;
    };

    var ververseAlleStalen = function () {
      form.querySelectorAll('[data-veld="hout"], [data-veld="papier"]')
        .forEach(ververseStaal);
    };

    /* Gedelegeerd, net als de andere twee hieronder: een lampblok dat later
       wordt bijgezet is een kloon en heeft dus zijn eigen keuzelijsten. */
    form.addEventListener('change', function (e) {
      var veld = e.target.closest('[data-veld="hout"], [data-veld="papier"]');
      if (veld) ververseStaal(veld);
    });

    var syncAlleBlokken = function (verseKeuze) {
      form.querySelectorAll('.lamp-block').forEach(function (block) {
        syncVelden(block, verseKeuze);
      });
      /* Een andere lamp kan de houtkeuze verschuiven of het veld verbergen,
         dus het staal moet daarna opnieuw kijken wat er nu geselecteerd is. */
      ververseAlleStalen();
    };

    // Gedelegeerd, zodat het ook werkt voor blokken die later worden bijgezet.
    form.addEventListener('change', function (e) {
      if (e.target.matches('[data-veld="lamp"] select')) {
        syncVelden(e.target.closest('.lamp-block'), true);
      }
    });

    var berichtVeld = form.querySelector('#bericht');
    var berichtSter = form.querySelector('[data-req-bericht]');

    var syncReason = function () {
      var ordering = form.querySelector('input[name="onderwerp-type"]:checked');
      if (!orderBlock || !ordering) return;
      var isOrder = ordering.value === 'bestellen';
      orderBlock.hidden = !isOrder;

      /* Bij een bestelling vertelt het blok hierboven al waar het over gaat:
         een onderwerpregel is dan dubbelop en het bericht mag leeg blijven.
         Bij een vraag is het bericht juist het enige wat er staat, dus daar
         blijft het verplicht. Uitschakelen en niet alleen verbergen, want een
         verborgen veld wordt gewoon meegestuurd. */
      form.querySelectorAll('[data-alleen-vraag]').forEach(function (veld) {
        veld.hidden = isOrder;
        veld.querySelectorAll('input, select, textarea').forEach(function (el) {
          if (isOrder) el.value = '';
          // Uitschakelen, niet alleen verbergen: een verborgen veld wordt
          // meegestuurd, en een verborgen verplicht veld blokkeert het
          // versturen zonder dat iemand ziet waarom.
          el.disabled = isOrder;
          el.required = !isOrder;
        });
      });

      if (berichtVeld) berichtVeld.required = !isOrder;
      if (berichtSter) berichtSter.hidden = isOrder;
      // Verplichte velden uitschakelen als het blok verborgen is,
      // anders blokkeert native validatie het versturen.
      orderBlock.querySelectorAll('[data-required]').forEach(function (el) {
        el.required = isOrder;
      });
      // Daarna pas de per-lamp regels, die required voor verborgen velden
      // weer uitzetten.
      syncAlleBlokken();
    };

    reasons.forEach(function (r) {
      r.addEventListener('change', syncReason);
    });
    syncReason();

    /* Het formulier kan vijf bijlagen van 5 MB meesturen; dat duurt lang genoeg
       om een tweede klik uit te lokken, en dan komt de bestelling twee keer
       binnen. De knop gaat op slot zodra de browser echt gaat versturen — na de
       native validatie dus, anders zit hij vast terwijl er nog een veld
       ontbreekt. Bij terugnavigeren uit de cache moet hij weer open. */
    var verzendknop = form.querySelector('button[type="submit"]');
    if (verzendknop) {
      form.addEventListener('submit', function () {
        verzendknop.disabled = true;
        verzendknop.dataset.bezig = 'ja';
      });
      window.addEventListener('pageshow', function () {
        verzendknop.disabled = false;
        delete verzendknop.dataset.bezig;
      });
    }

    /* Voorinvullen vanuit de collectiepagina (?lamp=…&hout=…&papier=…).
       De waarden komen uit onze eigen links, maar we zoeken ze alsnog op in de
       bestaande opties en zetten niets wat er niet in staat. */
    (function prefillFromQuery() {
      var params = new URLSearchParams(window.location.search);
      if (!params.has('lamp') && !params.has('hout') && !params.has('papier')) return;

      var norm = function (s) {
        return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      };

      var pick = function (select, wanted) {
        if (!select || !wanted) return false;
        var target = norm(wanted);
        var options = [].slice.call(select.options);
        var hit = options.find(function (o) { return norm(o.text) === target; });
        if (!hit) {
          hit = options.find(function (o) {
            var t = norm(o.text);
            return t && (t.indexOf(target) === 0 || target.indexOf(t) === 0);
          });
        }
        if (!hit) return false;
        select.value = hit.value || hit.text;
        return true;
      };

      var filled = [];
      if (pick(form.querySelector('#lamp'), params.get('lamp'))) filled.push('lamp');

      // De lampkeuze bepaalt welke velden er zijn; daarna pas de rest invullen,
      // anders zetten we een waarde in een veld dat voor deze lamp niet geldt.
      syncAlleBlokken(true);

      var zichtbaar = function (el) {
        var veld = el && el.closest('[data-veld]');
        return !!veld && !veld.hidden;
      };
      var hout = form.querySelector('#houtsoort');
      var papier = form.querySelector('#papier');
      if (zichtbaar(hout) && pick(hout, params.get('hout'))) filled.push('houtsoort');
      if (zichtbaar(papier) && pick(papier, params.get('papier'))) filled.push('papier');

      // Nog een keer, voor het geval de URL een soort noemde die voor deze lamp
      // niet gemaakt wordt; die valt dan terug op de keuzeprompt.
      syncAlleBlokken();

      if (!filled.length) return;

      // Zorg dat het bestelblok openstaat.
      var bestellen = form.querySelector('input[name="onderwerp-type"][value="bestellen"]');
      if (bestellen && !bestellen.checked) {
        bestellen.checked = true;
        syncReason();
      }

      // Meld aan de bezoeker wat er is overgenomen, ook voor schermlezers.
      var notice = document.createElement('p');
      notice.className = 'notice';
      notice.setAttribute('role', 'status');
      notice.textContent =
        'Uw keuze uit de collectie is alvast ingevuld (' + filled.join(', ') +
        '). U kunt alles hieronder nog aanpassen.';
      form.prepend(notice);
    })();

    /* Nog een lamp toevoegen */
    var list = form.querySelector('[data-lamp-list]');
    var addBtn = form.querySelector('[data-add-lamp]');

    if (list && addBtn) {
      var count = 1;

      addBtn.hidden = false;

      addBtn.addEventListener('click', function () {
        var first = list.querySelector('.lamp-block');
        if (!first) return;

        count += 1;
        var clone = first.cloneNode(true);

        clone.querySelector('.lamp-block__title').textContent = 'Lamp ' + count;

        // Velden leegmaken en id/for-koppelingen uniek houden.
        clone.querySelectorAll('input, select, textarea').forEach(function (el) {
          if (el.type === 'number') el.value = '1';
          else el.value = '';

          if (el.id) {
            var newId = el.id + '-' + count;
            var label = clone.querySelector('label[for="' + el.id + '"]');
            el.id = newId;
            if (label) label.setAttribute('for', newId);
          }
          if (el.name) {
            // bestanden[1][] moet bestanden[2][] worden en niet bestanden[1][2]:
            // de haakjes aan het eind horen bij het meervoud, niet bij de teller.
            el.name = /\[\]$/.test(el.name)
              ? el.name.replace(/\[\d*\]\[\]$/, '[' + count + '][]')
              : el.name.replace(/(\[\d*\])?$/, '[' + count + ']');
          }
        });

        var remove = clone.querySelector('[data-remove-lamp]');
        if (remove) remove.hidden = false;

        list.appendChild(clone);
        syncVelden(clone, true);
        var firstField = clone.querySelector('select, input');
        if (firstField) firstField.focus();
      });

      /* Na het weghalen van een blok uit het midden bleef er "Lamp 1" naast
         "Lamp 3" staan: count telde alleen op. contact.php nummert in de mail
         zelf door, dus de bestelling klopte wel — het scherm loog. */
      var hernummer = function () {
        var blokken = [].slice.call(list.querySelectorAll('.lamp-block'));
        blokken.forEach(function (blok, i) {
          var titel = blok.querySelector('.lamp-block__title');
          if (titel) titel.textContent = 'Lamp ' + (i + 1);
        });
        count = blokken.length;
      };

      list.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-remove-lamp]');
        if (!btn) return;
        var block = btn.closest('.lamp-block');
        if (block && list.querySelectorAll('.lamp-block').length > 1) {
          block.remove();
          hernummer();
          addBtn.focus();
        }
      });
    }
  }

  /* --- Filter op soort lamp (collectiepagina) ------------------------------ */

  (function () {
    var balk = document.querySelector('[data-filters]');
    if (!balk) return;

    var kaarten = [].slice.call(document.querySelectorAll('.card[data-soort]'));
    if (!kaarten.length) return;

    var knoppen = [].slice.call(balk.querySelectorAll('[data-filter]'));
    var teller = document.querySelector('[data-filter-count]');

    // Pas tonen als de JavaScript draait; anders staan alle lampen er al en
    // zouden de knoppen niets doen.
    balk.hidden = false;

    var toon = function (soort) {
      var zichtbaar = 0;
      kaarten.forEach(function (kaart) {
        var mee = soort === 'alle' || kaart.getAttribute('data-soort') === soort;
        kaart.hidden = !mee;
        if (mee) zichtbaar++;
      });

      knoppen.forEach(function (knop) {
        knop.setAttribute('aria-pressed',
          String(knop.getAttribute('data-filter') === soort));
      });

      if (teller) {
        // role="status" leest dit voor, zodat ook zonder zicht duidelijk is
        // dat de lijst korter is geworden.
        teller.textContent = zichtbaar === kaarten.length
          ? kaarten.length + ' lampen'
          : zichtbaar + ' van de ' + kaarten.length + ' lampen';
      }
    };

    knoppen.forEach(function (knop) {
      knop.addEventListener('click', function () {
        toon(knop.getAttribute('data-filter'));
      });
    });

    toon('alle');
  })();

  /* --- Foutmelding na een mislukte verzending ----------------------------- */

  /* contact.php stuurt bij een fout terug naar contact.html?fout=1. De melding
     staat al in de HTML (verborgen) in plaats van hier te worden opgebouwd,
     zodat hij ook zichtbaar is als deze JavaScript niet laadt. */

  (function () {
    if (location.search.indexOf('fout=1') === -1) return;
    var melding = document.getElementById('form-fout');
    if (!melding) return;
    melding.hidden = false;
    melding.scrollIntoView({ block: 'center' });
  })();
})();
