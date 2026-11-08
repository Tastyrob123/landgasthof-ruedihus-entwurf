/* Anleitung Das Besucherbuch · Landgasthof Ruedihus: Bild gross mit Klick, Esc schliesst; das Zeichen des Hauses (Medaillon) aus assets/logo/zeichen.svg
   (eigene Datei: online laufen eingebettete Skripte ohne Prüfsumme nicht). */
(function () {
  var g = document.getElementById('gross'), im = g.querySelector('img');
  function zu() { g.hidden = true; }
  document.addEventListener('click', function (e) { var b = e.target.closest('.bild'); if (b) { im.src = b.querySelector('img').src; im.alt = b.querySelector('img').alt; g.hidden = false; } else if (e.target.closest('#gross')) zu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') zu(); });
  try { fetch('../../assets/logo/zeichen.svg').then(function (r) { return r.text(); }).then(function (t) { var p = (t.match(/<svg[^>]*>([\s\S]*)<\/svg>/) || [])[1] || ''; if (/<path/.test(p) && !/<script|\son\w+=/i.test(p)) document.getElementById('zeichen').innerHTML = p; }).catch(function () {}); } catch (e) {}
})();
