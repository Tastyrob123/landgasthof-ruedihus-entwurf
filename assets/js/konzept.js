/* Landgasthof Ruedihus, Konzept-Board — Einblenden, sobald etwas ins Bild kommt. Nativer Scroll, nur Beobachter. */
(function () {
  'use strict';
  var still = document.documentElement.classList.contains('still');
  var alle = [].slice.call(document.querySelectorAll('[data-r], .linie, [data-fenster]'));
  if (still || !('IntersectionObserver' in window)) { alle.forEach(function (el) { el.classList.add('da'); }); return; }
  /* Fenster: der Satz steht fest in der Bildschirmmitte und blendet ein, sobald der Ausschnitt ihn freigibt */
  var fenster = [].slice.call(document.querySelectorAll('[data-fenster]'));
  fenster.forEach(function (t) { t.style.opacity = 0; t.style.transition = 'opacity 1.1s cubic-bezier(.16,1,.3,1)'; });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('da'); io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  alle.forEach(function (el) { if (!el.hasAttribute('data-fenster')) io.observe(el); });
  var fio = new IntersectionObserver(function (es) {
    es.forEach(function (e) { var t = e.target.querySelector('[data-fenster]'); if (t) t.style.opacity = e.intersectionRatio > 0.9 ? 1 : 0; });
  }, { threshold: [0, 0.5, 0.9, 1] });
  [].slice.call(document.querySelectorAll('.bruch')).forEach(function (b) { fio.observe(b); });
})();
