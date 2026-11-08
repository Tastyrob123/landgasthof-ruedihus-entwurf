/* Der Schreibtisch · Landgasthof Ruedihus: Fehlermelder (R03), steht als erstes Skript im Kopf. Wie Grand Beau-Rivage (studio/index.html dort, 15.10.2026):
   Skriptfehler in den Browser (localStorage «rh-studio-fehler», liest die Prüfung) und an den Server (studio/api/b/fehler). Netzfehler nie melden
   (Safari meldete sonst die eigene gescheiterte Meldung in einer Schleife, 9'969 Fehler am 15.10.), höchstens 20 je Seite, eigener Fehlschlag nie erneut. */
(function () {
  var zahl = 0, still = false;
  function merk(t) {
    t = String(t);
    if (++zahl > 20 || /Load failed|access control|abort|NetworkError|Failed to fetch|Network request failed/i.test(t)) return;
    try { var a = JSON.parse(localStorage.getItem('rh-studio-fehler') || '[]'); a.push({ z: new Date().toISOString(), t: ('Schreibtisch: ' + t).slice(0, 300) }); localStorage.setItem('rh-studio-fehler', JSON.stringify(a.slice(-20))); } catch (e) { }
    if (still) return;
    try { fetch('/studio/api/b/fehler', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Studio': '1' }, body: JSON.stringify({ text: t.slice(0, 600) }), keepalive: true }).catch(function () { still = true; }); } catch (e) { still = true; }
  }
  window.addEventListener('error', function (e) { merk((e.message || 'Fehler') + ' · ' + (e.filename || '').split('/').pop() + ':' + (e.lineno || '')); });
  window.addEventListener('unhandledrejection', function (e) { merk('Versprechen: ' + ((e.reason && e.reason.message) || e.reason)); });
  window.bureauMerk = merk;
})();
