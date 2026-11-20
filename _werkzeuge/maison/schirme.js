// Kontrollpanel · Landgasthof Ruedihus: Bildschirme der sechs Werkzeuge für die Säle (M08), im Safari-Kern, 1440 × 900, doppelte Dichte, nach roh/<name>.jpg.
//   node _werkzeuge/maison/schirme.js [name …]            nur Werkzeuge, deren LIEFERUNG «geliefert» meldet (pruefung/adressen.json, von bau.py)
//   ALLE=1 node _werkzeuge/maison/schirme.js [name …]     auch ungeliefert (zur Probe, Ziel dann ZIEL=<ordner>)
// danach python3 _werkzeuge/maison/bau.py. Nur lesen: öffnet die Werkzeuge, ändert nichts, eigenes Profil je Aufnahme.
// Bricht für ein Bild ab, wenn das Werkzeug eine Fehlertür zeigt oder leer bleibt, damit kein kaputtes Bild in die Etappen kommt.
const { webkit } = require('/Users/robertreff/Desktop/Apps & Tools/Tasty Website Builder/node_modules/playwright');
const path = require('path'), fs = require('fs');
const ZIEL = process.env.ZIEL || path.join(__dirname, 'roh');
const A = JSON.parse(fs.readFileSync(path.join(__dirname, 'pruefung', 'adressen.json'), 'utf8'));
const BASIS = process.env.BASIS || '';   // Werkbank-Chat 18.10.2026: Wege der Hausfassung sind ohne Server, darum hier die Adresse des Hausservers
const mit = (u, anker) => (u.startsWith('/') ? BASIS : '') + u.split('#')[0] + (anker || '');
// Ansicht je Bild: Werkzeug, Anker, Speicher (Schlüssel wie in den Werkzeugen der Häuser), Klick auf einen Reiter, Wartezeit
const AUFNAHMEN = [
  { name: 'bureau', w: 'bureau', speicher: { 'bureau-ansicht': JSON.stringify({ a: 'start' }) } },
  { name: 'bureau-2', w: 'bureau', speicher: { 'bureau-ansicht': JSON.stringify({ a: 'bereich', b: 'essen', s: 'essen.html' }) }, warte: 5000 },
  { name: 'carte', w: 'carte', speicher: { 'lc-modus': 'einfach', 'lc-wer': 'Beispiel', 'lc-rolle': 'service', 'lc-karte': 'egger-und-stettlerstube' } },
  { name: 'imprimerie', w: 'imprimerie', speicher: { 'ds-ruedihus-willkommen': '1', 'ds-landgasthof-ruedihus-willkommen': '1', 'ds-rh-willkommen': '1' } },
  { name: 'reception', w: 'reception', anker: '#eingang', speicher: { 'reception-ansicht': 'eingang' } },
  { name: 'registre', w: 'registre' },
  { name: 'livre-fotos', w: 'livre', anker: '#bilder', speicher: { 'rh-livre-ansicht': 'bilder' } },
  { name: 'livre-marke', w: 'livre', anker: '#dateien', speicher: { 'rh-livre-ansicht': 'dateien' } },
  { name: 'livre-pruefung', w: 'livre', anker: '#pruefung', speicher: { 'rh-livre-ansicht': 'pruefung' } },
];

(async () => {
  const nur = process.argv.slice(2);
  fs.mkdirSync(ZIEL, { recursive: true });
  const b = await webkit.launch();
  let fehler = 0;
  try {
    for (const a of AUFNAHMEN) {
      if (nur.length && !nur.includes(a.name) && !nur.includes(a.w)) continue;
      if (!process.env.ALLE && A[a.w].status !== 'geliefert') { console.log('übersprungen', a.name, '(noch nicht geliefert)'); continue; }
      const c = await b.newContext({ viewport: { width: +(process.env.BREIT || 1440), height: +(process.env.HOCH || 900) }, deviceScaleFactor: 2 });
      if (a.speicher) await c.addInitScript(s => { try { for (const k in s) localStorage.setItem(k, s[k]); } catch (e) { } }, a.speicher);
      const p = await c.newPage();
      const konsole = [];
      p.on('pageerror', e => konsole.push(String(e)));
      // nichts schreibt: jede ändernde Anfrage wird abgewiesen
      await p.route('**/*', r => ['GET', 'HEAD'].includes(r.request().method()) ? r.continue() : r.fulfill({ status: 204, body: '' }));
      try { await p.goto(mit(A[a.w].auf, a.anker), { waitUntil: 'load', timeout: 60000 }); }
      catch (e) { console.log('FEHLER', a.name, 'öffnet nicht', A[a.w].auf); fehler++; await c.close(); continue; }
      await p.waitForTimeout(a.warte || 4000);
      await p.evaluate(() => { const r = document.querySelector('.rdg-karte, .rdg-schild'); if (r) r.remove(); });
      const zustand = await p.evaluate(() => ({ text: document.body.innerText.replace(/\s+/g, ' ').trim(), tuer: /startet nicht/.test(document.body.innerText.slice(0, 400)) }));
      if (zustand.tuer || zustand.text.length < 200) { console.log('FEHLER', a.name, zustand.tuer ? 'Fehlertür' : 'leer', zustand.text.slice(0, 120), konsole.join(' | ')); fehler++; await c.close(); continue; }
      await p.screenshot({ path: path.join(ZIEL, (process.env.VOR || '') + a.name + '.jpg'), type: 'jpeg', quality: 88 });
      console.log('ok', a.name, zustand.text.slice(0, 90), konsole.length ? 'Konsole: ' + konsole.join(' | ') : '');
      await c.close();
    }
  } finally { await b.close(); }
  process.exit(fehler ? 1 : 0);
})();
