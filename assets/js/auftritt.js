/* AUFTRITT 18.10.2026 (Projektleitung Ruedihus) · für Seiten ohne eigenen Auftritt: Markenbuch, Anleitungen, Köpfe der Werkzeuge («Die Bühne»),
   Teile der Werkbank. Robert 17:46 (Markenbuch: «da fehlen die ganzen Animationen … stell das bitte überall sicher») und 18:17 (Mass): Start bei rund
   einem Fünftel sichtbar, 0,85 s weich auslaufend, 40 px von unten, Bilder dazu von 1,04 auf 1, Reihen 0,12 s versetzt. Voll deckend, kein Einblenden,
   nur transform, einmal beim Hinkommen, nichts hängt am Scrollen. Was schon einen eigenen Auftritt hat (data-r, rb-…, eigene Bewegung), bleibt unberührt.
   Wird beim Zusammenstellen für online eingehängt (_werkzeuge/online/stell_ruedihus.py), die Werkzeuge selbst bleiben unverändert. */
(function () {
  'use strict';
  if (window.__auftritt) return; window.__auftritt = 1;
  try { if (!location.hash && 'scrollRestoration' in history) { history.scrollRestoration = 'manual'; } } catch (e) {}
  if (/[?&]nomotion\b/.test(location.search) || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  var P = location.pathname, MODUS = 'frei', BEREICH = 'body';
  if (/\/_?werkzeuge\/livre\/buch\.html$/.test(P)) MODUS = 'frei';
  else if (/anleitung/.test(P)) MODUS = 'frei';
  else if (/\/werkbank\/ki\.html$/.test(P)) BEREICH = '#ki-stellen,#ki-daten,#ki-ohne,#ki-hand';
  else if (/\/werkbank\/geprueft\//.test(P)) BEREICH = 'main,body';
  else if (/\/werkbank\/(index\.html)?$/.test(P)) BEREICH = '#worum';
  else MODUS = 'buehne';   // Werkzeuge: nur der Kopf «Die Bühne»
  var KURVE = 'cubic-bezier(.16,1,.3,1)', DAUER = .85, VERSATZ = .12, WEG = 40;
  var BILD = /^(FIGURE|IMG|PICTURE)$/;
  function steht(el) {   // hat das Element (oder ein Vorfahr) schon eigene Bewegung?
    if (el.closest('[data-r],[class*="rb-"],.wo-lage,nav,.nav,dialog,[aria-hidden="true"]')) return true;
    var c = getComputedStyle(el);
    if (c.position === 'fixed' || c.position === 'sticky' || c.display === 'none' || c.visibility === 'hidden') return true;
    if (c.transform !== 'none' || (c.animationName && c.animationName !== 'none')) return true;
    var r = el.getBoundingClientRect(); return r.width < 8 || r.height < 8;
  }
  function vorbereiten(el) {
    el.__af = 1; el.style.transition = 'none';
    el.style.transform = 'translate3d(0,' + WEG + 'px,0)' + (BILD.test(el.tagName) ? ' scale(1.04)' : '');
  }
  var warte = [], geplant = false;
  function los() {
    geplant = false; var n = {};
    warte.sort(function (a, b) { return a.getBoundingClientRect().top - b.getBoundingClientRect().top || a.getBoundingClientRect().left - b.getBoundingClientRect().left; });
    warte.forEach(function (el) {
      var k = el.parentElement ? (el.parentElement.__afid || (el.parentElement.__afid = Math.random())) : 0; var i = n[k] = (n[k] || 0) + 1;
      el.style.transition = 'transform ' + DAUER + 's ' + KURVE + ' ' + (Math.min(i - 1, 4) * VERSATZ).toFixed(2) + 's';
      el.style.transform = '';
      el.addEventListener('transitionend', function f() { el.removeEventListener('transitionend', f); el.style.transition = ''; }, { once: true });
    });
    warte = [];
  }
  function zeige(el) { if (el.__afda) return; el.__afda = 1; warte.push(el); if (!geplant) { geplant = true; requestAnimationFrame(function () { requestAnimationFrame(los); }); } }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      if (e.intersectionRatio >= .2 || e.intersectionRect.height >= innerHeight * .2) { io.unobserve(e.target); zeige(e.target); }
    });
  }, { threshold: [0, .05, .1, .2] }) : null;
  function aufnehmen(liste) {
    liste = liste.filter(function (el) { return !el.__af && !steht(el); });
    liste = liste.filter(function (el) { return !liste.some(function (a) { return a !== el && a.contains(el); }); });   // Gruppen kommen als Ganzes
    liste.forEach(function (el) { vorbereiten(el); if (io) io.observe(el); else zeige(el); });
  }
  var KAND = 'h1,h2,h3,h4,p,figure,blockquote,table,ul,ol,dl,article,picture,img,a.kn,button.kn,.kn';
  function frei() {
    var b = [].slice.call(document.querySelectorAll(BEREICH)), liste = [];
    b.forEach(function (w) { [].push.apply(liste, [].slice.call(w.querySelectorAll(KAND))); });
    liste = liste.filter(function (el) { return !(el.tagName === 'IMG' && el.closest('figure,picture')); });
    aufnehmen(liste);
  }
  function buehne() {
    var sb = [].slice.call(document.querySelectorAll('.wo-sb'));
    sb.forEach(function (s) {
      var h = s.querySelector('.wo-sb__h') || s;
      if (s.__afsb || s.getBoundingClientRect().height < 60 || getComputedStyle(h).visibility !== 'visible') return; s.__afsb = 1;   // erst, wenn die Bühne gezeichnet ist (Schrift geladen)
      aufnehmen([].slice.call(s.querySelectorAll('.wo-sb__foto,.wo-sb__zier,.wo-sb__h,.wo-sb__satz,.wo-sb__kn')));
    });
  }
  function start() {
    if (MODUS === 'buehne') { buehne(); [150, 400, 800, 1500, 2500, 4000].forEach(function (t) { setTimeout(buehne, t); }); addEventListener('load', buehne); addEventListener('hashchange', function () { setTimeout(buehne, 60); }); new MutationObserver(function () { buehne(); }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class'] }); }
    else frei();
    if (!location.hash) try { scrollTo(0, 0); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 30); }); else setTimeout(start, 30);
})();
