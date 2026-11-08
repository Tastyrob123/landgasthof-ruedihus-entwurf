// Ruedihus (Werkbank-Chat 18.10.2026): Kopie des Waldhotel Doldenhorn, Farben aus dem Kleid des Ruedihus (Russ, Papier, Gold).
// Vorschau statt Veröffentlichen (Robert 17.10.2026: «dass wir das erstmal ausstellen für die Demo … man kann es dann da einmal anschauen,
// kurz in der Vorschau»; danach «in allen»). Liegt nur in der Online-Fassung der Werkzeuge (werkzeuge_online.py hängt es an), lokal nie.
// Jeder Knopf «Veröffentlichen» bleibt sichtbar, ist aber blass und sagt beim Klick, dass er in der Vorschau aus ist. Die Server-Teile
// lehnen das Veröffentlichen online zusätzlich selbst ab (probe.py, carte.py), dieses Skript ist nur die sichtbare Seite davon.
(function () {
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return;
  var SATZ = 'In der Vorschau ist Veröffentlichen aus. Ansehen und ausprobieren geht, die Website bleibt, wie sie ist.';
  var css = document.createElement('style');
  css.textContent = '.demo-aus{opacity:.45!important;cursor:not-allowed!important}' +
    '.demo-aus-satz{position:fixed;left:50%;bottom:96px;z-index:2147483000;transform:translateX(-50%);max-width:min(460px,calc(100vw - 32px));padding:12px 18px;border-radius:14px;' +
    'background:#1f1209;color:#fbf5ea;font:400 14px/1.45 system-ui,sans-serif;box-shadow:0 0 0 1px rgba(243,205,148,.5),0 18px 30px -12px rgba(0,0,0,.7);opacity:0;transition:opacity .25s;pointer-events:none}' +
    '.demo-aus-satz.da{opacity:1}' +
    '.demo-zeile{display:flex;align-items:center;gap:10px;margin:0;padding:10px clamp(16px,2.4vw,28px);border-bottom:1px solid rgba(183,143,81,.32);background:rgba(243,205,148,.12);' +
    'font:500 10.5px/1.35 ui-monospace,Menlo,monospace;letter-spacing:.1em;text-transform:uppercase;color:#6d431f;transition:background .4s,color .4s}' +
    '.demo-zeile i{flex:none;width:7px;height:7px;border-radius:50%;background:#c42e13}' +
    '.demo-zeile.hervor{background:#1f1209;color:#fbf5ea}' +
    '.sb__h+.demo-zeile{margin-top:12px;border:1px solid rgba(243,205,148,.28);border-radius:12px;background:rgba(243,205,148,.06);color:#efe4d3}' +
    'section.mitte>.demo-zeile,.demo-zeile--start{border-radius:12px;margin:0 0 12px;border:1px solid rgba(183,143,81,.32)}.ms-haupt>.demo-zeile--start{margin:14px 0 0}';
  document.head.appendChild(css);
  function knopf(el) {
    var b = el && el.closest && el.closest('button,a,[role="button"]');
    return b && /Veröffentlichen/i.test(b.textContent || '') ? b : null;
  }
  function markiere() {
    document.querySelectorAll('button,a,[role="button"]').forEach(function (b) {
      if (/Veröffentlichen/i.test(b.textContent || '')) { b.classList.add('demo-aus'); b.setAttribute('title', SATZ); b.setAttribute('aria-disabled', 'true'); }
    });
  }
  /* Robert 18.10.2026 17:39 (M26): der Hinweis steht als eigene ruhige Zeile im Fluss, oben im Inhalt, und schwebt nie über Titel, Knöpfen oder Inhalt.
     Ein Klick auf «Veröffentlichen» hebt diese Zeile kurz hervor, statt eine schwebende Meldung zu zeigen. */
  var ZEILE = 'Vorschau · Ansehen und Ausprobieren geht, Veröffentlichen ist in der Demo aus';
  var zeile = null, weg = 0;
  function setzeZeile() {
    /* Die Werkstatt hat zwei Ansichten über demselben Raum (Übersicht .start.ms und Arbeitsfläche section.mitte): dort je eine Zeile */
    var ms = document.querySelector('.start.ms > .ms-haupt');
    if (ms && !ms.querySelector(':scope > .demo-zeile')) { var z2 = document.createElement('p'); z2.className = 'demo-zeile demo-zeile--start'; z2.setAttribute('role', 'note'); z2.innerHTML = '<i aria-hidden="true"></i><span></span>'; z2.lastChild.textContent = ZEILE; ms.insertBefore(z2, ms.firstChild); }
    if (zeile && document.contains(zeile)) return;
    var ort = document.querySelector('main section.mitte') || document.querySelector('.sb__h') || document.querySelector('main');
    if (!ort) return;
    zeile = document.createElement('p'); zeile.className = 'demo-zeile'; zeile.setAttribute('role', 'note');
    zeile.innerHTML = '<i aria-hidden="true"></i><span></span>'; zeile.lastChild.textContent = ZEILE;
    if (ort.classList && ort.classList.contains('sb__h')) ort.parentNode.insertBefore(zeile, ort.nextSibling); else ort.insertBefore(zeile, ort.firstChild);
    /* liegt eine feste Kopfleiste über dem Anfang des Inhalts (Besucherbuch), rückt die Zeile darunter */
    var k = document.querySelector('.wo-kopf'); if (k && /fixed|sticky/.test(getComputedStyle(k).position)) { var d = k.getBoundingClientRect().bottom - zeile.getBoundingClientRect().top; if (d > 0 && scrollY === 0) zeile.style.marginTop = Math.ceil(d) + 'px'; }
  }
  function zeige() {
    setzeZeile(); if (!zeile) return;
    zeile.classList.add('hervor'); clearTimeout(weg); weg = setTimeout(function () { zeile.classList.remove('hervor'); }, 2400);
    var r = zeile.getBoundingClientRect(); if (r.top < 0 || r.bottom > innerHeight) zeile.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  document.addEventListener('click', function (ev) {
    if (knopf(ev.target)) { ev.preventDefault(); ev.stopImmediatePropagation(); zeige(); }
  }, true);
  var plan = 0;
  new MutationObserver(function () { if (!plan) plan = requestAnimationFrame(function () { plan = 0; markiere(); setzeZeile(); }); })
    .observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { markiere(); setzeZeile(); }); else { markiere(); setzeZeile(); }
})();
