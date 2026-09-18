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

  document.querySelectorAll('[data-wheel]').forEach(function (wheel) {
    var segments = [].slice.call(wheel.querySelectorAll('.wheel__segment'));
    var nameEl = wheel.querySelector('[data-wheel-name]');
    var descEl = wheel.querySelector('[data-wheel-desc]');
    if (!segments.length || !nameEl || !descEl) return;

    var startName = nameEl.textContent;
    var startDesc = descEl.textContent;

    var toon = function (segment) {
      segments.forEach(function (s) { s.classList.toggle('is-active', s === segment); });
      nameEl.textContent = segment ? segment.dataset.name : startName;
      descEl.textContent = segment ? segment.dataset.desc : startDesc;
    };

    /* De materiaalfoto zit als <image> in het SVG-patroon waarmee het segment
       gevuld is; die halen we eruit in plaats van hem te dupliceren. */
    var fotoVan = function (segment) {
      // Browsers geven de fill terug als url("#id") — de aanhalingstekens
      // moeten dus optioneel zijn, anders matcht er niets.
      var m = /url\(\s*["']?#([^"')\s]+)["']?\s*\)/.exec(segment.style.fill || '');
      if (!m) return null;
      var pattern = wheel.querySelector('#' + CSS.escape(m[1]) + ' image');
      return pattern ? pattern.getAttribute('href') : null;
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
      'Ronde Lamp Yin (vloerlamp)':      { hout: 1, papier: 1 },
      'Vierkante Lamp Yang (vloerlamp)': { hout: 1, papier: 1 },
      'Hanglamp Kawa (hanglamp)':        { hout: 1, papier: 1 },
      'Lamp Koyo (wandlamp)':            { hout: 1, papier: 1, blad: 1, afmeting: 1 },
      'Wandlamp Torii (wandlamp)':       { hout: 1, papier: 1 },
      'Tafellamp Take (tafellamp)':      { hout: 1, papier: 1,
                                           blad: ['Geen blad', 'Bamboeblad'] },
      'Tafellamp De Stijl':                { tape: 1, vast: 'effen Japans papier zonder vezels' },
      'Wandlamp De Stijl':               { tape: 1, vast: 'effen Japans papier zonder vezels' },
      'Lamp op maat':                    { hout: 1, papier: 1, blad: 1, afmeting: 1 }
    };

    // Deze velden gelden altijd, ongeacht de lamp.
    var ALTIJD = { lamp: 1, aantal: 1, detaillering: 1 };

    var syncVelden = function (block) {
      if (!block) return;
      var select = block.querySelector('[data-veld="lamp"] select');
      if (!select) return;

      var gekozen = select.value || (select.selectedIndex > 0
        ? select.options[select.selectedIndex].text : '');
      var regels = LAMPVELDEN[gekozen] || null;
      var bestelt = orderBlock ? !orderBlock.hidden : true;

      block.querySelectorAll('[data-veld]').forEach(function (veld) {
        var sleutel = veld.getAttribute('data-veld');
        var regel = regels ? regels[sleutel] : null;
        // Zonder gekozen lamp alleen de vaste velden tonen; dat is rustiger
        // dan alles tonen en daarna de helft weghalen.
        var toon = !!ALTIJD[sleutel] || !!regel;
        veld.hidden = !toon;

        // Opties binnen het veld beperken wanneer de regel een lijst is.
        var toegestaan = Array.isArray(regel) ? regel : null;
        veld.querySelectorAll('select').forEach(function (sel) {
          var eersteVrij = null;
          [].slice.call(sel.options).forEach(function (opt) {
            var mag = !toegestaan || toegestaan.indexOf(opt.text) !== -1;
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

        veld.querySelectorAll('input, select, textarea').forEach(function (el) {
          if (!toon) {
            // Verplicht uitzetten, anders blokkeert een verborgen veld het
            // versturen; en terugzetten op de beginwaarde, anders reist een
            // oude keuze mee. Bij een <select> is dat de eerste optie en niet
            // een lege string: menu's als Afmeting en Blad hebben geen lege
            // optie, en die zouden dan blanco opengaan zodra ze weer
            // verschijnen.
            el.required = false;
            if (el.tagName === 'SELECT') el.selectedIndex = 0;
            else if (el.type !== 'number') el.value = '';
          } else if (el.hasAttribute('data-required')) {
            el.required = bestelt;
          }
        });
      });

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

    var syncAlleBlokken = function () {
      form.querySelectorAll('.lamp-block').forEach(syncVelden);
    };

    // Gedelegeerd, zodat het ook werkt voor blokken die later worden bijgezet.
    form.addEventListener('change', function (e) {
      if (e.target.matches('[data-veld="lamp"] select')) {
        syncVelden(e.target.closest('.lamp-block'));
      }
    });

    var syncReason = function () {
      var ordering = form.querySelector('input[name="onderwerp-type"]:checked');
      if (!orderBlock || !ordering) return;
      var isOrder = ordering.value === 'bestellen';
      orderBlock.hidden = !isOrder;
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
      syncAlleBlokken();

      var zichtbaar = function (el) {
        var veld = el && el.closest('[data-veld]');
        return !!veld && !veld.hidden;
      };
      var hout = form.querySelector('#houtsoort');
      var papier = form.querySelector('#papier');
      if (zichtbaar(hout) && pick(hout, params.get('hout'))) filled.push('houtsoort');
      if (zichtbaar(papier) && pick(papier, params.get('papier'))) filled.push('papier');

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
        'Je keuze uit de collectie is alvast ingevuld (' + filled.join(', ') +
        '). Je kunt alles hieronder nog aanpassen.';
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
          if (el.name) el.name = el.name.replace(/(\[\d*\])?$/, '[' + count + ']');
        });

        var remove = clone.querySelector('[data-remove-lamp]');
        if (remove) remove.hidden = false;

        list.appendChild(clone);
        syncVelden(clone);
        var firstField = clone.querySelector('select, input');
        if (firstField) firstField.focus();
      });

      list.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-remove-lamp]');
        if (!btn) return;
        var block = btn.closest('.lamp-block');
        if (block && list.querySelectorAll('.lamp-block').length > 1) {
          block.remove();
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
