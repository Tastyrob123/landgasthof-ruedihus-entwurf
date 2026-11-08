/* Vorschaubilder in den Bildwänden des Schreibtischs (Robert 18.10.2026 ~13:38: «die bilder in den archiven müssen schneller laden überall»; Master M19).
   Kacheln zeigen /assets/img/vs/<schlüssel>.webp (400 px); fehlt sie, bleibt das bisherige Bild. Das grosse Bild lädt erst beim Öffnen. */
(function () {
  var WAND = '.mauer img, .bildwand img, #bw-l img, .bibl img, .fotos img';
  var MUSTER = /\/assets\/img\/([^\/?#]+?)(-s|-l)?\.webp/;
  function klein(img) {
    if (img.dataset.vs) return;
    var s = img.getAttribute('src') || '', m = s.match(MUSTER);
    if (!m || s.indexOf('/vs/') > -1) return;
    img.dataset.vs = '1';
    img.onerror = function () { img.onerror = null; img.src = s; };
    img.src = '/assets/img/vs/' + m[1] + '.webp';
  }
  function alle() { [].forEach.call(document.querySelectorAll(WAND), klein); }
  var plan = 0;
  new MutationObserver(function () { if (!plan) plan = requestAnimationFrame(function () { plan = 0; alle(); }); })
    .observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', alle); else alle();
})();
