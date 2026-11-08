/* Der Schreibtisch (Le Bureau) · Landgasthof Ruedihus (17.10.2026). Nachbau von Le Bureau des Grand Beau-Rivage (studio/studio.js v25 dort, lokale Fassung,
   nur gelesen) über die Fassung des Waldhotels Doldenhorn (gleicher Tag, nur gelesen): jede Funktion und jeder Handgriff gleich, dazu die Zusätze des
   Carlton-Europe (zwei Fenster, Grösse im Browser, Kleine Handys). Das Kleid ist das des Ruedihus (bureau.css). Server-Teil: studio_bureau.py
   (Wege /studio/api/b/…) über studio.py. Was nur das Ruedihus hat (Listen des Hauses: Zimmer, Karten der Website, Anlässe, Stellen und Team,
   Zahlen und Angebote, Bilder, Zugang, Besuche): die Ansichten des früheren Studios, eingebettet aus alt.html (studio/studio.js).
   Nichts speichert still: Eingaben warten gelb, «Speichern» legt sie in den Entwurf (Quittung mit Vorher/Nachher und Rückgängig),
   auf die Website kommt erst, was veröffentlicht wird. */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PF = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5"/></svg>';
const ZU = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13"/></svg>';
const LUPE = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3.5 3.5"/></svg>';
const SPNAME = { en: 'Englisch', fr: 'Französisch', it: 'Italienisch' };
const SPRW = { en: 'English', fr: 'Français', it: 'Italiano' };
const SPR = () => [['', 'Deutsch']].concat(((S.ue && S.ue.sprachen) || []).map(k => [k, SPRW[k] || k]));   // die Website hat zurzeit nur Deutsch
const ZAHLWORT = { 1: 'Eine', 2: 'Zwei', 3: 'Drei', 4: 'Vier', 5: 'Fünf', 6: 'Sechs', 7: 'Sieben', 8: 'Acht' };
const WEG = k => (S.ue && S.ue.wege && S.ue.wege[k]) || { website: '/', pruefung: '/studio/pruefung.html', anleitung: '/studio/anleitung/' }[k] || '';
const CARTE = () => WEG('carte');   // Die Tafel (La Carte) des Hauses: Adresse aus dem Server (anschluss.json), nie geraten
/* Namen der Werkzeuge in der Welt Landhaus (_Werkzeuge/stamm/welt.js). Für das Ruedihus von Robert noch nicht festgelegt: hier und in studio_bureau.py NAME ändern. */
const NB = 'Der Schreibtisch', NM = 'Die Stube', NC = 'Die Tafel';
/* Listen des Hauses und die frühere Ansicht, in der sie gepflegt werden (alt.html, studio/studio.js LISTEN) */
const LV = { zimmer: 'zimmer', anlaesse: 'anlaesse', stellen: 'stellen', team: 'stellen', jahre: 'zahlen', gut: 'zahlen', gourmet: 'zahlen', umgebung: 'zahlen', tagesmenu: 'karte', 'bew.balken': 'haus' };
/* Listen des Hauses je Bereich: stehen im Reiter «Listen» des Bereichs, bearbeitet in der eingebetteten Ansicht des früheren Studios (alt.html) */
const LISTEN_B = k => { const b = S.ue && S.ue.bereiche.find(x => x.key === k); return b && b.listen && b.listen.length ? b.listen : null; };
const ALT_B = k => { const b = S.ue && S.ue.bereiche.find(x => x.key === k); return (b && b.alt) || ''; };
const S = { ue: null, ansicht: 'start', bereich: '', seite: '', sp: '', geraet: 'rechner', verz: null, offen: {}, wahl: null, y: 0, bilder: null, zahlenFilter: 'alle', lauf: null };

/* ---------- Server ---------- */
const MIT_BASIS = ['speichern', 'rueckgaengig', 'verwerfen', 'veroeffentlichen', 'zurueckholen', 'hochladen'];   // ersetzen den Entwurf: Fingerabdruck mitschicken (zwei Fenster, 16.10.2026)
async function api(was, daten) {
  let r;
  if (daten !== undefined && MIT_BASIS.includes(was) && S.ue && S.ue.basis) daten = Object.assign({ basis: S.ue.basis }, daten);
  try {
    r = await fetch('/studio/api/b/' + was, daten === undefined ? { cache: 'no-store', credentials: 'same-origin' } : { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-Studio': '1' }, body: JSON.stringify(daten) });
  } catch (e) {
    throw new Error('VERBINDUNG · Keine Verbindung zum Schreibtisch. Ihre Eingaben sind noch da: Verbindung prüfen und noch einmal speichern.');
  }
  let d = {};
  try { d = await r.json(); } catch (e) { throw new Error('SERVER · Antwort nicht lesbar (' + r.status + ').'); }
  if (!r.ok) {
    const t = d.fehler || ('SERVER · Fehler ' + r.status);
    if (/^KONFLIKT · /.test(t)) { try { await frisch(); } catch (e) { /* die Meldung zählt */ } }   // neu laden, die gelben Eingaben (S.offen) bleiben stehen
    throw new Error(t);
  }
  if (d.basis && S.ue) S.ue.basis = d.basis;
  return d;
}
function fehler(e) {
  const t = String((e && e.message) || e);
  const m = t.match(/^([A-ZÄÖÜ]+) · (.*)$/);
  const wort = m ? m[1] : 'SERVER';
  window.bureauMerk && window.bureauMerk(t);
  quit(m ? m[2] : t, '', [['Was tun?', () => window.open(WEG('pruefung') + '#m-' + wort.toLowerCase(), '_blank')]], true);
}
function quit(titel, text, knoepfe = [], fehl = false, dauer = 9000) {
  const q = document.createElement('div');
  q.className = 'quit' + (fehl ? ' fehl' : '');
  q.innerHTML = `<div><b>${esc(titel)}</b>${text ? `<span>${esc(text)}</span>` : ''}</div>`;
  knoepfe.forEach(([t, f]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.onclick = () => { f(); q.remove(); }; q.appendChild(b); });
  const x = document.createElement('button'); x.type = 'button'; x.setAttribute('aria-label', 'Schliessen'); x.textContent = '×'; x.onclick = () => q.remove(); q.appendChild(x);
  $('#meldung').appendChild(q);
  while ($('#meldung').children.length > 3) $('#meldung').firstChild.remove();
  if (dauer) setTimeout(() => q.remove(), dauer);
}
function kleinBild(b) {   // kleinste Fassung, die es gibt: aus der Liste des Servers (S.bilder), sonst -s geraten; feste Bilder (fest:<name>) liegen als eine Datei
  if (/^fest:/.test(b)) return `/assets/img/${b.slice(5)}.webp`;
  if (/^u-[0-9a-f]{10}f[0-9a-f]{4}$/.test(b)) return `/assets/img/${b}.webp`;
  const x = S.bilder && S.bilder.find(y => y.b === b);
  return x && x.klein ? x.klein : `/assets/img/${b}-s.webp`;
}
/* Ersatzbild, wenn eine Bildfassung fehlt (data-ersatz): ein Zuhörer für alle Bilder statt onerror im HTML, das die Sicherheitsregel blockt
   (Fund 17.10.2026 in Firefox: «blocked an event handler (script-src-attr)»; Chromium und Safari blocken es still, der Ersatz kam nie) */
document.addEventListener('error', e => { const i = e.target; if (i && i.tagName === 'IMG' && i.dataset.ersatz && !i.__ersatz) { i.__ersatz = 1; i.src = i.dataset.ersatz; } }, true);
function datum(iso) {
  if (!iso) return '';
  const d = new Date(iso.replace(' ', 'T'));
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Zurich' }) + ', ' + d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zurich' }) + ' Uhr';   // immer Schweizer Zeit, auch am Rechner im Ausland
}

/* ---------- Rand ---------- */
function rand() {   /* Werkzeug-Oberfläche «Die Bühne» (Stamm, Werkbank-Chat 17.10.2026): Rand aus WO.rand, Wege und data-gehe wie bisher */
  const u = S.ue, an = S.ansicht;
  const nw = (key, name, zahl = 0, extra = '') => ({ text: name, zahl, extra, an: an === key || (an === 'bereich' && key === 'b:' + S.bereich), attr: `data-gehe="${key}"` });
  const kz = u.karten && u.karten.karten && u.karten.karten.length ? (u.karten.karten.some(k => k.entwurf) ? 'Entwurf' : u.karten.karten.length + ' Karten') : 'Website';
  $('#rand').innerHTML = WO.rand([
    { eintraege: [nw('start', 'Übersicht')] },
    { titel: 'Die Website', eintraege: u.bereiche.map(b => nw('b:' + b.key, b.name, b.offen)) },
    { titel: 'Für alle Seiten', eintraege: [nw('angaben', 'Angaben des Hauses'), nw('zahlen', 'Zeiten & Preise'), nw('hinweis', 'Hinweis für Gäste'), nw('google', 'Google-Texte'), nw('sprachen', 'Sprachen'), nw('x:bilder', 'Bilder')] },
    { titel: 'Karten', eintraege: [nw('karten', 'Karten des Hauses', 0, `<em class="wo-rand__z">${kz}</em>`), nw('x:karte', 'Karten der Website', 0, '<em class="wo-rand__z">Zeilen</em>')] },
    { titel: 'Im Betrieb', eintraege: [nw('x:besuche', 'Besuche & Anfragen')] },
    { titel: 'Entwurf', eintraege: [nw('entwurf', 'Entwurf & Vergleich', u.aenderungen), nw('verlauf', 'Frühere Fassungen')] },
    { titel: 'Sicher', eintraege: [nw('x:zugang', 'Zugang')] }
  ], { website: WEG('website'), anleitung: WEG('anleitung'), pruefung: WEG('pruefung') });
  $$('#rand [data-gehe]').forEach(b => b.onclick = () => gehe(b.dataset.gehe));   // Handy: oberflaeche.js klappt den Rand nach der Wahl zu
  kopfLeiste();
}

/* ---------- Leiste unten ---------- */
function offenZahl() { return Object.keys(S.offen).length; }
function leiste(gruen = false) {   /* Werkzeug-Oberfläche: Leiste aus WO.leiste, Ids und Abläufe wie bisher */
  const n = offenZahl(), a = S.ue ? S.ue.aenderungen : 0, z = S.ue && S.ue.zuletzt;
  const sp = gruen ? 'fertig' : n ? 'wartet' : 'glas';
  $('#leiste').innerHTML = WO.leiste({
    titel: n ? `${n} Eingabe${n > 1 ? 'n' : ''} noch nicht gespeichert` : a ? `Entwurf: ${a} Änderung${a > 1 ? 'en warten' : ' wartet'}` : 'Alles ist veröffentlicht',
    satz: n ? 'Speichern legt sie in den Entwurf. Auf der Website erscheint erst, was Sie veröffentlichen.' : a ? 'Gespeichert, noch nicht auf der Website.' + (S.ue.entwurf_zeit ? ' Zuletzt ' + datum(S.ue.entwurf_zeit) + '.' : '') : (z ? 'Zuletzt veröffentlicht ' + datum(z.zeit) + (z.notiz ? ' · ' + z.notiz : '') + '.' : 'Die Website zeigt sich wie gebaut.'),
    entwurf: !!a && !n,
    knoepfe: ((a || n) ? WO.knopf('Vorher, nachher', 'auge', 'glas', { id: 'l-vgl', klein: true }) : '')   /* Fehlerbuch 10a (Schlössli 20.10.2026): in der Leiste stehen nur Knöpfe, die gerade etwas tun, keine ausgegrauten */
      + WO.knopf(gruen ? 'Gespeichert' : 'Speichern', gruen ? 'haken' : 'pfeil', sp, { id: 'l-sp', klein: true })
      + (a && !n ? WO.knopf('Veröffentlichen', 'hoch', 'gold', { id: 'l-raus', klein: true }) : '')
  });
  $('#l-sp').onclick = speichern;
  if ($('#l-vgl')) $('#l-vgl').onclick = () => gehe('entwurf');
  if ($('#l-raus')) $('#l-raus').onclick = veroeffentlichenFenster;
}

/* ---------- Speichern, Quittung, Rückgängig ---------- */
function vormerken(key, op) {
  S.offen[key] = op;
  leiste();
}
function vergessen(key) { delete S.offen[key]; leiste(); }
async function speichern() {
  const ops = Object.values(S.offen);
  if (ops.some(o => o.art !== 'text')) { S.vorschauNeu = true; const r = document.getElementById('vf-r'); if (r) r.classList.add('laedt'); }   // Foto oder Block: Schleier sofort, nicht erst wenn die Vorschau neu geladen wird (15.10.2026: bis dahin stand 1 bis 2 s das alte Bild ohne Hinweis)
  if (!ops.length) { quit('Nichts geändert, nichts gespeichert.', '', [], false, 4000); return; }
  try {
    const r = await api('speichern', { ops });
    S.offen = {};
    if (!r.geaendert) { quit(r.meldung || 'Nichts geändert, nichts gespeichert.', '', [], false, 4000); await frisch(); return; }
    await frisch();
    leiste(true);
    setTimeout(() => leiste(), 2600);
    quit('Gespeichert', r.was.slice(0, 3).join(' · ') + (r.was.length > 3 ? ` · und ${r.was.length - 3} weitere` : ''), [
      ['Vorher/Nachher ansehen', () => gehe('entwurf')],
      ['Rückgängig', async () => { try { S.vorschauNeu = true; await api('rueckgaengig', { schritt: r.schritt }); await frisch(); quit('Rückgängig gemacht', 'Der Entwurf ist wie vor diesem Speichern.', [], false, 5000); } catch (e) { fehler(e); } }]]);
  } catch (e) { fehler(e); }
}
async function frisch(neuZeichnen = true) {
  S.ue = await api('ueberblick');
  rand();
  leiste();
  if (neuZeichnen) await zeichne(true);
}
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); speichern(); }
  if (e.key === 'Escape' && !$('#fenster').hidden) fensterZu();
});
window.addEventListener('beforeunload', e => { if (offenZahl()) { e.preventDefault(); e.returnValue = ''; } });

/* ---------- Navigation ---------- */
function gehe(ziel, extra = {}) {
  const vorher = S.ansicht;
  if (ziel.startsWith('b:')) { S.ansicht = 'bereich'; S.bereich = ziel.slice(2); const b = bereich(); S.seite = extra.seite || (b.seiten[0] || {}).datei; S.wahl = extra.wahl || null; if (S.wahl) S.tab = 'texte'; }   // eine Stelle zeigen: immer im Reiter Texte
  else S.ansicht = ziel;
  if (vorher && vorher.startsWith('x:')) api('ueberblick').then(u => { S.ue = u; rand(); leiste(); }).catch(() => {});   // eine frühere Ansicht hat vielleicht gespeichert: Stand und Fingerabdruck auffrischen
  try { localStorage.setItem('bureau-ansicht', JSON.stringify({ a: S.ansicht, b: S.bereich, s: S.seite })); } catch (e) { /* privat */ }
  rand();
  zeichne();
  window.scrollTo(0, 0);
}
function bereich() { return S.ue.bereiche.find(b => b.key === S.bereich) || S.ue.bereiche[0]; }
function bereichVon(seite) { return S.ue.bereiche.find(b => b.seiten.some(s => s.datei === seite)); }
const ZEICHEN = '<i class="rhz" aria-hidden="true"></i>';   /* das Medaillon des Hauses (assets/logo/zeichen.svg, von der Karte nachgezeichnet), als Maske in Gold */
const KB = { start: 'haus-daemmerung', angaben: 'schild', zahlen: 'stube-lang', karten: 'e-roesti', hinweis: 'butzen', google: 'giebel', sprachen: 'garten-gitter', entwurf: 'stube-tuer', verlauf: 'ofestuebli',
  'x:bilder': 'd-bilder', 'x:karte': 'e-plaettli', 'x:besuche': 'terrasse', 'x:zugang': 'd-knauf', 'x:zimmer': 'z-hochzeit', 'x:anlaesse': 'fest-tafel', 'x:stellen': 'familie', 'x:zahlen': 'holz', 'x:haus': 'schild' };   // Foto der Bühne je Ansicht (studio/buehne.js), Bereiche nehmen ihr eigenes
function kopf(mono, titel, satz, knoepfe = '', knapp = false) {   /* Werkzeug-Oberfläche: Startbild aus WO.startbild (gleich in allen sechs Werkzeugen) */
  const kb = S.ansicht === 'bereich' ? (bereich().foto || '') : (KB[S.ansicht] || '');
  return WO.startbild({ werkzeug: 'website', zier: mono, h1: titel, satz, knoepfe, art: knapp || S.ansicht !== 'start' ? 'buehne' : 'voll', foto: kb && S.ansicht !== 'start' ? '/assets/img/' + kb + '-l.webp' : '' });
}
const TITEL = { start: 'Übersicht', angaben: 'Angaben des Hauses', zahlen: 'Zeiten & Preise', karten: 'Karten des Hauses', hinweis: 'Hinweis für Gäste', google: 'Google-Texte', sprachen: 'Sprachen', entwurf: 'Entwurf & Vergleich', verlauf: 'Frühere Fassungen',
  'x:bilder': 'Bilder', 'x:besuche': 'Besuche & Anfragen', 'x:zugang': 'Zugang', 'x:karte': 'Karten der Website', 'x:zimmer': 'Zimmer & Preise', 'x:anlaesse': 'Anlässe', 'x:stellen': 'Stellen & Team', 'x:zahlen': 'Zahlen & Angebote', 'x:haus': 'Haus & Noten' };
const SYM = {
  pruef: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.8 2.8 4v3.6c0 3.2 2.2 5.6 5.2 6.6 3-1 5.2-3.4 5.2-6.6V4z"/><path d="m5.6 8 1.7 1.7 3.2-3.4"/></svg>',
  buch: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 3.2c2-.8 3.8-.6 5.5.6 1.7-1.2 3.5-1.4 5.5-.6v9.6c-2-.8-3.8-.6-5.5.6-1.7-1.2-3.5-1.4-5.5-.6z"/><path d="M8 3.8v9.6"/></svg>',
  welt: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.8"/><path d="M2.4 8h11.2M8 2.2c1.6 1.6 2.4 3.6 2.4 5.8S9.6 12.2 8 13.8C6.4 12.2 5.6 10.2 5.6 8S6.4 3.8 8 2.2z"/></svg>' };
/* Kleine Symbole für Kacheln, Angaben und Zeiten (Robert 15.10.2026: «mit Bildmaterial oder kleinen Symbolen arbeiten») */
const IC = {
  stift: '<path d="M10.8 2.6 13.4 5.2 5.6 13H3v-2.6z"/><path d="m9.4 4 2.6 2.6"/>',
  welt: '<circle cx="8" cy="8" r="5.8"/><path d="M2.4 8h11.2M8 2.2c1.6 1.6 2.4 3.6 2.4 5.8S9.6 12.2 8 13.8C6.4 12.2 5.6 10.2 5.6 8S6.4 3.8 8 2.2z"/>',
  karte: '<path d="M3.5 2.5h7.5l1.5 1.5v9.5h-9z"/><path d="M5.8 6h4.4M5.8 8.4h4.4M5.8 10.8h2.6"/>',
  text: '<path d="M3 4V2.8h10V4M8 2.8v10.4M6.2 13.2h3.6"/>',
  uhr: '<circle cx="8" cy="8" r="5.8"/><path d="M8 4.8V8l2.2 1.6"/>',
  preis: '<path d="M8.6 2.4h4.9v4.9L7.6 13.2 2.8 8.4z"/><circle cx="11" cy="5" r="1"/>',
  aus: '<path d="M2 8s2.2-4.2 6-4.2S14 8 14 8s-2.2 4.2-6 4.2S2 8 2 8z"/><path d="m3 13 10-10"/>',
  foto: '<rect x="2.2" y="3.2" width="11.6" height="9.6" rx="1.6"/><circle cx="5.8" cy="6.6" r="1.2"/><path d="m2.6 11.6 3.4-3 2.6 2.2 2.2-1.8 2.6 2.4"/>',
  hinweis: '<path d="M8 2.2 14 13H2z"/><path d="M8 6.4v3.2M8 11.4v.2"/>',
  karriere: '<rect x="2.4" y="5" width="11.2" height="8" rx="1.4"/><path d="M6 5V3.4h4V5M2.4 8.6h11.2"/>',
  tel: '<path d="M4.2 2.4h2l1 3-1.4 1c.7 1.5 1.7 2.5 3.2 3.2l1-1.4 3 1v2c0 .7-.6 1.3-1.3 1.3C6.6 12.5 3.5 9.4 2.9 3.7c0-.7.6-1.3 1.3-1.3z"/>',
  mail: '<rect x="2.2" y="3.6" width="11.6" height="8.8" rx="1.4"/><path d="m2.6 4.4 5.4 4.2 5.4-4.2"/>',
  ort: '<path d="M8 14s4.6-4.2 4.6-7.6a4.6 4.6 0 0 0-9.2 0C3.4 9.8 8 14 8 14z"/><circle cx="8" cy="6.4" r="1.6"/>',
  link: '<path d="M6.6 9.4a2.6 2.6 0 0 0 3.7 0l2.2-2.2a2.6 2.6 0 0 0-3.7-3.7l-.8.8M9.4 6.6a2.6 2.6 0 0 0-3.7 0L3.5 8.8a2.6 2.6 0 0 0 3.7 3.7l.8-.8"/>',
  mass: '<path d="M2.4 10.6 10.6 2.4l3 3-8.2 8.2z"/><path d="m5 8 1.4 1.4M7 6l1 1M9 4l1.4 1.4"/>',
  haus: '<path d="M2.6 7.4 8 2.8l5.4 4.6"/><path d="M4 6.4v6.8h8V6.4M6.6 13.2V9.6h2.8v3.6"/>',
  sprache: '<path d="M2.4 3.4h6.4M5.6 2v1.4M3.6 3.4c.6 2.4 2.2 4.2 4.4 5.2M7.6 3.4C7 5.8 5.4 7.6 3 8.8"/><path d="m8.6 13.6 2.4-6 2.4 6M9.4 11.8h3.2"/>',
  zurueck: '<path d="M3.4 6.2h6.4a3.4 3.4 0 0 1 0 6.8H6"/><path d="M5.8 3.6 3.2 6.2l2.6 2.6"/>'
};
const ic = k => `<svg viewBox="0 0 16 16" aria-hidden="true">${IC[k] || IC.text}</svg>`;
function kopfLeiste() {   /* Werkzeug-Oberfläche: Kopf aus WO.kopf (Zeichen, die sechs Werkzeuge, Die Stube, Prüfung, Anleitung, Website) */
  const b = S.ansicht === 'bereich' ? bereich() : null;
  const t = b ? b.name : (TITEL[S.ansicht] || NB);
  const u = S.ue, z = u && u.zuletzt;
  $('#kopf').innerHTML = WO.kopf({ werkzeug: 'website', unter: 'Website', titel: t, stand: u && u.aenderungen ? u.aenderungen + ' im Entwurf' : z ? 'Veröffentlicht ' + datum(z.zeit).split(',')[0] : 'Wie gebaut',
    pruefung: WEG('pruefung'), anleitung: WEG('anleitung'), website: WEG('website'), marke: 'data-gehe="start" aria-label="Zur Übersicht"' });
  $$('#kopf [data-gehe]').forEach(x => x.onclick = e => { e.preventDefault(); gehe(x.dataset.gehe); });
}
async function zeichne(still = false) {
  const a = S.ansicht, el = $('#ansicht');
  const zb = $('#zl-blick'); if (zb) zb.classList.remove('auf');
  clearTimeout(S.ladeUhr);
  if (!still && a !== 'start' && a !== 'karten') S.ladeUhr = setTimeout(() => { el.innerHTML = '<div class="lade" style="padding-top:18vh"><div class="lade__r"></div><span class="leise">Wird geladen …</span></div>'; }, 280);
  try {
    if (a === 'start') el.innerHTML = start();
    else if (a === 'bereich') await zeichneBereich(still);
    else if (a === 'angaben') await zeichneAngaben();
    else if (a === 'zahlen') await zeichneZahlen();
    else if (a === 'karten') el.innerHTML = karten();
    else if (a === 'hinweis') await zeichneHinweis();
    else if (a === 'google') await zeichneGoogle();
    else if (a === 'sprachen') await zeichneSprachen();
    else if (a === 'entwurf') await zeichneEntwurf();
    else if (a === 'verlauf') await zeichneVerlauf();
    else if (a.startsWith('x:')) zeichneExtra(a.slice(2));
    clearTimeout(S.ladeUhr);
    $$('#ansicht [data-gehe]').forEach(b => b.onclick = () => gehe(b.dataset.gehe, b.dataset.seite ? { seite: b.dataset.seite } : {}));
    if (!still) { el.classList.remove('ansicht-neu'); void el.offsetWidth; el.classList.add('ansicht-neu'); }
  } catch (e) { fehler(e); }
}

/* ---------- Was nur das Ruedihus hat: die Ansichten des früheren Studios aus alt.html (studio/studio.js), eingebettet ohne deren Rahmen ---------- */
const EXTRA = {
  bilder: ['Für alle Seiten', 'Die <em>Bilder.</em>', 'Jedes Foto der Website an einem Ort, auch Startbild, Seitenköpfe, Fenster und Schlussbild: tauschen, überall wo es steht, und die Beschreibung für Blinde und Google.'],
  karte: ['Karten', 'Karten <em>der Website.</em>', 'Schpiszettel der Chäs- und Wystube, Schpis Charte der Egger- und Stettlerstube und Tagesteller, wie sie auf der Seite «Essen» stehen: Rubrik für Rubrik, Gericht für Gericht mit Preis.'],
  besuche: ['Im Betrieb', 'Besuche <em>& Anfragen.</em>', 'Was Gäste auf der Website anklicken: Zimmer, Tischanfragen, Gutscheine, Buchen. Ohne Kekse, ohne Namen.'],
  zugang: ['Sicher', 'Ihr <em>Zugang.</em>', 'Passwort und Anmeldung. Bei der Auslieferung an das Haus wird der Schreibtisch mit Anmeldung und Passwort geschützt.'],
  zimmer: ['Listen des Hauses', 'Zimmer <em>& Preise.</em>', 'Die vier Zimmer mit Satz, Preis, Belegung und Fotos.'],
  anlaesse: ['Listen des Hauses', '<em>Anlässe.</em>', 'Die Anlässe im Jahreslauf, auf «Durchs Jahr» und auf «Essen».'],
  stellen: ['Listen des Hauses', 'Stellen <em>& Team.</em>', 'Die offenen Stellen und die Zahlen zum Team auf «Das Haus».'],
  zahlen: ['Listen des Hauses', 'Zahlen <em>& Angebote.</em>', 'Die grossen Zahlen der Startseite, «Gut zu wissen», der Gourmetaufenthalt und die Orte rund um Kandersteg.'],
  haus: ['Listen des Hauses', 'Haus <em>& Noten.</em>', 'Die Noten der Gäste im Einzelnen und die Angaben des Hauses in der früheren Ansicht.']
};
function zeichneExtra(name, listen) {
  const x = EXTRA[name] || [NB, esc(name), ''];
  const tafel = CARTE() && (name === 'karte' || ALT_B(listen) === 'karte') ? '&tafel=1' : '';   // Die Tafel angeschlossen: dort nur noch das Tagesmenu (studio.js TAFEL)
  const ziel = listen ? `/studio/alt.html?eingebettet=1${tafel}#/${ALT_B(listen)}` : `/studio/alt.html?eingebettet=1${tafel}#/${name}`;
  const html = `<div class="einbett"><iframe id="ein-f" title="${esc(TITEL['x:' + name] || name || 'Listen')}" src="${ziel}"></iframe><div class="lade-schleier">Wird geladen …</div></div>`;
  if (listen) return html;
  const knopf = name === 'karte' && CARTE() ? `<a class="kn" href="${CARTE()}" target="_blank" rel="noopener">${NC} öffnen<i>${PF}</i></a>` : '';
  $('#ansicht').innerHTML = kopf(x[0], x[1], name === 'karte' && CARTE() ? 'Gerichte, Preise, Rubriken und PDF der drei Karten pflegt ' + NC + '. Hier bleibt das Tagesmenu der Egger- und Stettlerstube.' : x[2], knopf, true) + html;
  einbettVerbinden();
}
function einbettVerbinden() {
  const f = $('#ein-f'); if (!f) return;
  const r = f.parentElement; r.classList.add('laedt');
  f.onload = () => r.classList.remove('laedt');
}
/* Die eingebettete Ansicht meldet jede gespeicherte Änderung: Leiste, Rand und Zahlen stimmen dann sofort */
window.addEventListener('message', ev => { const d = ev.data || {}; if (d.bureau === 'geaendert') frisch(false); if (d.bureau === 'hoehe') { const f = $('#ein-f'); if (f && ev.source === f.contentWindow) f.style.height = Math.max(520, d.h) + 'px'; } });

/* ---------- Übersicht ---------- */
function start() {
  const u = S.ue, h = new Date().getHours();
  const gruss = h >= 5 && h < 11 ? 'Guten Morgen.' : h >= 11 && h < 18 ? 'Guten Tag.' : 'Guten Abend.';
  const AUFG = [
    ['b:start', 'Einen Text ändern', 'Auf der Seite anklicken, links neu schreiben.', 'text', 'haus-daemmerung'],
    ['zahlen', 'Preis oder Öffnungszeit', 'Alle Zeiten und Preise der Website an einem Ort.', 'uhr', 'stube-lang'],
    ['b:jahr', 'Anlass ausblenden', 'Einen vorbeigegangenen Anlass von der Seite nehmen.', 'aus', 'fest-tafel'],
    ['b:zimmer', 'Foto tauschen', 'Ein Foto anklicken, aus den Fotos des Hauses wählen oder hochladen.', 'foto', 'z-hochzeit'],
    ['karten', 'Gericht oder Preis auf der Karte', 'Schpiszettel, Schpis Charte, Tagesteller: Zeile für Zeile.', 'karte', 'e-roesti'],
    ['hinweis', 'Hinweis für Gäste', 'Ein Satz unten auf jeder Seite, mit Zeitraum.', 'hinweis', 'butzen'],
    ['b:haus', 'Stelle besetzt', 'Stelle ausblenden oder neu beschreiben.', 'karriere', 'familie'],
    ['angaben', 'Telefon oder E-Mail', 'Einmal ändern, auf allen Seiten richtig.', 'tel', 'schild']];
  const mc = (u.karten && u.karten.karten) || [];
  const kw = (u.karten && u.karten.website) || [];
  return kopf(`${NB} · Landgasthof Ruedihus · Kandersteg`, `${gruss} <em>Was ändern wir heute?</em>`,
    `Hier pflegen Sie die Website des Hauses: jeden Text, jedes Foto, jede Angabe. Alles wartet zuerst im Entwurf. Auf die Website kommt es erst, wenn Sie veröffentlichen, und jeder frühere Stand lässt sich zurückholen.`,
    WO.knopf('Anleitung', 'buch', 'gold', { href: WEG('anleitung'), neu: true })) +
    `<div class="wo-lage">
      <div class="wo-lg"><i class="wo-lg__z">${ic('stift')}</i><span class="wo-mk">Entwurf</span><b>${u.aenderungen ? u.aenderungen + ' Änderung' + (u.aenderungen > 1 ? 'en warten' : ' wartet') : 'Nichts offen'}</b><p>${u.aenderungen ? 'Gespeichert, noch nicht auf der Website.' : 'Was Sie speichern, sammelt sich hier.'}</p>${u.aenderungen ? '<button class="wo-lk" type="button" data-gehe="entwurf">Ansehen und veröffentlichen</button>' : ''}</div>
      <div class="wo-lg"><i class="wo-lg__z">${ic('welt')}</i><span class="wo-mk">Website</span><b>${u.zuletzt ? 'Veröffentlicht ' + datum(u.zuletzt.zeit).split(',')[0] : 'Wie gebaut'}</b><p>${u.seiten} Seiten auf Deutsch.${u.zuletzt && u.zuletzt.notiz ? ' Zuletzt: ' + esc(u.zuletzt.notiz) : ''}</p><a class="wo-lk" href="${WEG('website')}" target="_blank" rel="noopener">Website öffnen</a></div>
      <div class="wo-lg"><i class="wo-lg__z">${ic('karte')}</i><span class="wo-mk">Karten</span><b>${mc.filter(k => k.entwurf).length ? mc.filter(k => k.entwurf).length + ' Karte im Entwurf' : mc.length ? (ZAHLWORT[mc.length] || mc.length) + ' Karten in der Tafel' : (ZAHLWORT[kw.length] || kw.length) + ' Karten auf der Website'}</b><p>Schpiszettel, Schpis Charte und Tagesteller, Zeile für Zeile mit Preis.</p><button class="wo-lk" type="button" data-gehe="karten">Zu den Karten</button></div>
    </div>
    <h2 class="wo-zw">Häufig <em>gebraucht</em></h2>
    <div class="wo-aufg">${AUFG.map(([z, t, s, k, f]) => `<button class="wo-ag" type="button" data-gehe="${z}"><span class="wo-ag__b"><img src="/assets/img/${f}-s.webp" alt="" loading="lazy" decoding="async"></span><span class="wo-ag__t"><i class="wo-ag__z">${ic(k)}</i><b>${t}</b><span>${s}</span></span></button>`).join('')}</div>
    <h2 class="wo-zw">Die Website, <em>Bereich für Bereich</em></h2>
    <div class="wo-ber">${u.bereiche.map(b => `<button class="wo-bk" type="button" data-gehe="b:${b.key}"><span class="wo-bk__b"><img src="/assets/img/${b.foto}-s.webp" alt="" loading="lazy" decoding="async" data-ersatz="/assets/img/${b.foto}.webp"></span><span class="wo-bk__t"><b>${esc(b.name)}</b><small>${b.seiten.length} Seite${b.seiten.length > 1 ? 'n' : ''}${b.offen ? ' · ' + b.offen + ' offen' : ''}</small><span>${esc(b.satz)}</span></span><i class="wo-bk__p">${WO.ic('pfeil')}</i></button>`).join('')}</div>`;
}

/* ---------- Bereich: Stellen links, Seite rechts ---------- */
function iframeUrl(z = 'entwurf', seite = S.seite, sp = S.sp, neu = false) {
  /* Vorschau unter /entwurf/ und /vorher/ mit ?bureau (Ruedihus): online belegt die Sicherheitsregel des Hauses (sicherheit.py) alles unter /studio/ mit
     «base-uri 'none'» und sperrt eingebettete Skripte, die Vorschau unter /studio/seite/… lüde dort ohne Gestaltung und ohne Klick-Skript (Fund 17.10.2026) */
  return `/${z === 'stand' ? 'vorher' : 'entwurf'}/${sp ? sp + '/' : ''}${seite}?bureau=1&nomotion=1&t=${Date.now()}${neu ? '&neu=1' : ''}`;
}
function vorschauHtml(id = 'vf', titel = '') {
  return `<section class="vorschau" aria-label="Vorschau der Seite">
    <div class="vorschau__k"><span class="mono" id="${id}-t">${esc(titel)}</span>
      <div class="wahl2 wahl2--dunkel" role="group" aria-label="Gerät"><button type="button" data-geraet="rechner" aria-pressed="${S.geraet === 'rechner'}">Rechner</button><button type="button" data-geraet="handy" aria-pressed="${S.geraet === 'handy'}">Handy</button></div>
      ${SPR().length > 1 ? `<select class="sel" id="${id}-sp" aria-label="Sprache der Vorschau">${SPR().map(([k, n]) => `<option value="${k}" ${S.sp === k ? 'selected' : ''}>${n}</option>`).join('')}</select>` : '<span class="mono vorschau__sp">Deutsch</span>'}
      <a href="#" id="${id}-gross" target="_blank" rel="noopener">Gross öffnen</a></div>
    <div class="rahmen${S.geraet === 'handy' ? ' handy' : ''}" id="${id}-r"><iframe id="${id}" title="Seite mit dem Entwurf"></iframe><div class="lade-schleier">Seite wird gesetzt …</div></div>
  </section>`;
}
function rahmenMass(r) {
  if (!r) return;
  const f = r.querySelector('iframe');
  const breite = S.geraet === 'handy' ? 390 : 1440;   // echte Geräte: Rechner 1440 × 900, Handy 390 × 844, verkleinert ohne Verzerrung
  r.style.setProperty('--wz', (r.clientWidth / breite).toFixed(4));
}
function vorschauVerbinden(id, url) {
  const f = $('#' + id), r = $('#' + id + '-r');
  rahmenMass(r);
  r.classList.add('laedt');
  f.onload = () => { r.classList.remove('laedt'); };
  f.dataset.geladen = '';
  requestAnimationFrame(() => setTimeout(() => { f.src = url; }, 40));   // erst die Liste zeichnen, dann die Seite laden (beide teilen sich den Rechner)
  $('#' + id + '-gross').href = url.replace(/[?&]t=\d+/, '');
  $$('[data-geraet]', r.parentElement).forEach(b => b.onclick = () => { S.geraet = b.dataset.geraet; zeichne(true); });
  if ($('#' + id + '-sp')) $('#' + id + '-sp').onchange = e => { S.sp = e.target.value; zeichne(true); };
}
window.addEventListener('resize', () => $$('.rahmen').forEach(rahmenMass));

async function zeichneBereich(still) {
  const b = bereich();
  if (!S.seite || !b.seiten.some(s => s.datei === S.seite)) S.seite = b.seiten[0].datei;
  const yAlt = S.y;
  S.verz = await api('seite?s=' + encodeURIComponent(S.seite));
  const v = S.verz;
  const reiter = b.seiten.length > 1 ? (b.seiten.length > 5
    ? `<select class="sel" id="seitenwahl" aria-label="Seite">${b.seiten.map(s => `<option value="${s.datei}" ${s.datei === S.seite ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select>`
    : `<div class="wahl2" role="group" aria-label="Seite">${b.seiten.map(s => `<button type="button" data-seite-w="${s.datei}" aria-pressed="${s.datei === S.seite}">${esc(s.name)}</button>`).join('')}</div>`) : '';
  const key = [S.bereich, S.seite, S.sp, S.geraet].join('|');
  if (still && S.vfKey === key && $('#vf') && $('#gruppen')) {   // nach dem Speichern: nur die Liste erneuern, die Seite bleibt stehen (kein Neuladen, kein Springen)
    const offenGr = new Set($$('#gruppen .gr[open]').map(g => g.dataset.g));
    const st = $('.stellen'), sc = st.scrollTop;
    const alt = $('.stellen .ausgeblendet'); if (alt) alt.remove();
    $('#gruppen').insertAdjacentHTML('beforebegin', ausgeblendetHtml(v));
    S.offenGr = offenGr;
    $('#gruppen').innerHTML = v.gruppen.map((g, gi) => gruppeHtml(g, gi)).join('');
    S.offenGr = null;
    verbindeZeigen(); verbindeGruppen(); suche($('#such').value); st.scrollTop = sc;
    const fo = $('.stellen__fotos'); if (fo) { fo.innerHTML = fotosHtml(v); verbindeFotos(); }
    if (S.vorschauNeu) {
      S.vorschauNeu = false;
      const y = S.y;
      S.nachLaden = () => { if (y) senden({ bureau: 'oben', y }); };
      $('#vf-r').classList.add('laedt'); $('#vf').src = iframeUrl();
    }
    if (S.wahl && S.wahl.h) oeffneStelle(S.wahl.h, S.wahl.n, false);
    return;
  }
  S.vfKey = key;
  const extra = S.bereich === 'essen' ? `<button class="kn kn--linie kn--klein" type="button" data-gehe="karten">Zu den Karten<i>${PF}</i></button>` : '';
  $('#ansicht').innerHTML = kopf('Bereich · ' + esc(b.name), esc(b.name).replace(/^(\S+)(.*)$/, (m, a, c) => c ? `${a}<em>${c}</em>` : `<em>${a}</em>`),
    esc(b.satz) + ' Klicken Sie in der Seite auf einen Text oder ein Foto, oder wählen Sie links.', extra, true) +
    (reiter ? `<div class="reiter">${reiter}<span class="leise">${b.seiten.length} Seiten</span></div>` : '') +
    `<div class="arbeit">
      <div class="platte stellen">
        <div class="wahl2 stellen__w" role="group" aria-label="Texte, Fotos oder Listen"><button type="button" data-tab="texte" aria-pressed="${S.tab !== 'fotos' && S.tab !== 'listen'}">${ic('text')}Texte · ${v.gruppen.reduce((a, g) => a + g.stellen.length, 0)}</button><button type="button" data-tab="fotos" aria-pressed="${S.tab === 'fotos'}">${ic('foto')}Fotos · ${fotosVon(v).length}</button>${LISTEN_B(S.bereich) ? `<button type="button" data-tab="listen" aria-pressed="${S.tab === 'listen'}">${ic('karte')}Listen · ${LISTEN_B(S.bereich).length}</button>` : ''}</div>
        <div class="stellen__texte"${S.tab === 'fotos' || S.tab === 'listen' ? ' hidden' : ''}>
        <label class="suche">${LUPE}<input type="search" id="such" placeholder="Text auf dieser Seite suchen" autocomplete="off"></label>
        ${ausgeblendetHtml(v)}
        <div id="gruppen">${v.gruppen.map((g, gi) => gruppeHtml(g, gi)).join('')}</div>
        </div>
        <div class="stellen__fotos"${S.tab === 'fotos' ? '' : ' hidden'}>${fotosHtml(v)}</div>
        ${LISTEN_B(S.bereich) ? `<div class="stellen__listen"${S.tab === 'listen' ? '' : ' hidden'}><p class="leise stellen__satz">Was auf diesen Seiten als Liste steht: ${esc(LISTEN_B(S.bereich).join(', '))}. Ein Eintrag lässt sich ändern, neu anlegen, verschieben oder ausblenden; die Seite rechts zeigt es nach dem Speichern. Gespeichert wird im Entwurf, auf die Website kommt es mit «Veröffentlichen».</p>${S.tab === 'listen' ? zeichneExtra(null, S.bereich) : ''}</div>` : ''}
      </div>
      ${vorschauHtml('vf', v.name)}
    </div>`;
  $$('[data-tab]').forEach(x => x.onclick = () => {
    S.tab = x.dataset.tab; $$('[data-tab]').forEach(y => y.setAttribute('aria-pressed', y === x));
    $('.stellen__texte').hidden = S.tab !== 'texte'; $('.stellen__fotos').hidden = S.tab !== 'fotos';
    const li = $('.stellen__listen'); if (li) { li.hidden = S.tab !== 'listen'; if (S.tab === 'listen' && !$('#ein-f', li)) { li.insertAdjacentHTML('beforeend', zeichneExtra(null, S.bereich)); einbettVerbinden(); } }
    $('.arbeit').classList.toggle('arbeit--listen', S.tab === 'listen');
  });
  if (S.tab === 'listen') { einbettVerbinden(); $('.arbeit').classList.add('arbeit--listen'); }
  verbindeFotos();
  $$('[data-seite-w]').forEach(x => x.onclick = () => { S.seite = x.dataset.seiteW; S.wahl = null; S.y = 0; zeichne(); });
  if ($('#seitenwahl')) $('#seitenwahl').onchange = e => { S.seite = e.target.value; S.wahl = null; S.y = 0; zeichne(); };
  $('#such').oninput = e => suche(e.target.value);
  verbindeZeigen();
  verbindeGruppen();
  vorschauVerbinden('vf', iframeUrl());
  S.nachLaden = () => {
    if (still && yAlt) senden({ bureau: 'oben', y: yAlt });
    if (S.wahl) senden(Object.assign({ bureau: 'zeige', still: !!(still && yAlt) }, S.wahl));
    $$('.st.offen').forEach(x => { const st = stelleVon(x.dataset.h, +x.dataset.n); const op = S.offen[`text|${S.seite}|${st.h}|${st.n}`]; if (op) senden({ bureau: 'tippe', h: st.h, n: st.n, html: op.neu }); });
  };
  if (S.wahl && S.wahl.h) oeffneStelle(S.wahl.h, S.wahl.n, false);
}
/* Alle Fotos der Seite auf einen Blick (Robert 15.10.2026: «kann ich bitte auch die Bilder wechseln, aus dem Bilderfundus auswählen»):
   Zeiger darauf zeigt das Foto in der Seite, Klick öffnet die Fotos des Hauses zum Tauschen */
function fotosVon(v) { const g = new Set(); return v.gruppen.flatMap(x => x.fotos.map(f => Object.assign({ gruppe: x.titel }, f))).filter(f => { const k = f.b + '|' + f.n; if (g.has(k)) return false; g.add(k); return true; }); }
function verbindeFotos() {
  $$('.stellen__fotos [data-foto]').forEach(x => { x.onclick = () => { const [b, n] = x.dataset.foto.split('|'); bildFenster(b, +n, []); }; x.onmouseenter = () => { const [b, n] = x.dataset.foto.split('|'); senden({ bureau: 'zeige', b, n: +n, sanft: true }); }; });
}
function fotosHtml(v) {
  const L = fotosVon(v);
  if (!L.length) return '<p class="leise" style="padding:14px 6px">Auf dieser Seite steht kein Foto, das sich tauschen lässt.</p>';
  return `<p class="leise stellen__satz">Zeiger auf ein Foto zeigt es in der Seite. Klick öffnet die Fotos des Hauses: eines wählen oder ein eigenes hochladen.</p>
    <div class="fotoraster">${L.map(f => `<button type="button" class="fr${f.neu || f.alt_neu ? ' geaendert' : ''}" data-foto="${f.b}|${f.n}" title="${esc(f.alt)}"><span class="fr__b"><img src="${f.klein || `/assets/img/${f.neu || f.b}-s.webp`}" alt="" loading="lazy" data-ersatz="/assets/img/${f.neu || f.b}.webp"></span><span class="fr__n"><small>${esc(f.gruppe || 'Foto')}</small><b>${esc(f.alt || f.b)}</b></span><em>${ic('foto')}Tauschen</em></button>`).join('')}</div>`;
}
function ausgeblendetHtml(v) {
  return v.ausgeblendet.length ? `<div class="ausgeblendet"><b>Ausgeblendet auf dieser Seite</b>${v.ausgeblendet.map(a => `<div><span>${esc(a.t || a.tag)}</span><button class="link" type="button" data-zeigen="${a.h}|${a.n}">Wieder zeigen</button></div>`).join('')}</div>` : '';
}
function verbindeZeigen() {
  $$('[data-zeigen]').forEach(x => x.onclick = () => { const [h, n] = x.dataset.zeigen.split('|'); vormerken(`aus|${S.seite}|${h}|${n}`, { art: 'aus', seite: S.seite, h, n: +n, an: false }); speichern(); });
}
function gruppeHtml(g, gi) {
  if (g.mc) return `<details class="gr gr--mc" data-g="${gi}"><summary><b>${esc(g.titel || 'Karte')}</b><small>${NC}</small></summary>
    <div class="ed" style="border-top:0"><p style="margin:0 0 10px">Gerichte und Preise dieser Karte kommen aus ${NC}, zusammen mit der PDF. Dort ändern, dann stimmt alles überein.</p>
    <a class="kn kn--linie kn--klein" href="${CARTE()}" target="_blank" rel="noopener">${NC} öffnen<i>${PF}</i></a></div></details>`;
  const geaendert = g.stellen.some(s => s.neu !== undefined) || g.fotos.some(f => f.neu || f.alt_neu);
  const offen = gi < 2 || geaendert || (S.offenGr && S.offenGr.has(String(gi)));
  return `<details class="gr${g.aus ? ' ist-aus' : ''}" ${offen ? 'open' : ''} data-g="${gi}"${offen ? '' : ' data-leer'}><summary><b>${esc(g.titel || 'Abschnitt')}</b><small>${g.stellen.length} Text${g.stellen.length === 1 ? '' : 'e'}${g.fotos.length ? ' · ' + g.fotos.length + ' Foto' + (g.fotos.length > 1 ? 's' : '') : ''}</small></summary>
    ${offen ? gruppeInnen(g) : ''}</details>`;
}
function gruppeInnen(g) {   // Inhalt einer Gruppe; geschlossene Gruppen bekommen ihn erst beim Aufklappen (Liste mit über 400 Stellen sonst auf einen Schlag)
  return `${g.stellen.map(s => stelleHtml(s)).join('')}
    ${g.fotos.length ? `<div class="fotos">${g.fotos.map(f => `<button type="button" class="${f.neu || f.alt_neu ? 'geaendert' : ''}" data-foto="${f.b}|${f.n}" title="${esc(f.alt)}"><img src="${f.klein || `/assets/img/${f.neu || f.b}-s.webp`}" alt="" loading="lazy" data-ersatz="/assets/img/${f.neu || f.b}.webp"></button>`).join('')}</div>` : ''}
    ${g.h ? `<div class="gr__fuss"><button class="link rot" type="button" data-blk-aus="${g.h}|${g.n}">Ganzen Abschnitt ausblenden</button></div>` : ''}`;
}
function fuelle(det) {
  if (!det || !det.hasAttribute('data-leer')) return;
  det.removeAttribute('data-leer');
  det.insertAdjacentHTML('beforeend', gruppeInnen(S.verz.gruppen[+det.dataset.g]));
  verbindeGruppen();
}
const TAGNAME = { h1: 'Titel', h2: 'Überschrift', h3: 'Zwischentitel', h4: 'Zwischentitel', p: 'Absatz', li: 'Listenpunkt', a: 'Link', button: 'Knopf', span: 'Text', b: 'Text', small: 'Kleingedrucktes', figcaption: 'Bildzeile', dt: 'Begriff', dd: 'Angabe', td: 'Zelle', th: 'Spaltenkopf', label: 'Feld', em: 'Text', strong: 'Text', address: 'Adresse', blockquote: 'Zitat', q: 'Zitat', i: 'Text' };
function stelleHtml(s) {
  const op = S.offen[`text|${S.seite}|${s.h}|${s.n}`];
  const txt = op ? op.vorschau : s.neu !== undefined ? s.neu.replace(/<[^>]+>/g, ' ') : s.t;
  const art = s.q ? (s.q.some(q => /^(haus|kontakt|link|bew)\./.test(q)) ? 'Angabe des Hauses' : s.q.some(q => /^l:/.test(q)) ? 'Listeneintrag' : s.q.some(q => /^kg?:/.test(q)) ? 'Karte der Website' : s.q.some(q => /^hinweis\./.test(q)) ? 'Hinweis für Gäste' : 'Aus einem anderen Bereich') : '';
  const offenA = s.q && s.q.some(q => S.offen['angabe|' + q]);
  return `<button type="button" class="st${s.neu !== undefined ? ' geaendert' : ''}${op || offenA ? ' offen' : ''}${s.q ? ' st--angabe' : ''}" data-h="${s.h}" data-n="${s.n}"><small>${TAGNAME[s.tag] || 'Text'}${art ? ' · ' + art : ''}${s.gleich > 1 ? ` · ${s.gleich}× auf der Seite` : ''}</small><span>${esc(txt)}</span></button>`;
}
function verbindeGruppen() {
  $$('#gruppen .gr[data-leer]').forEach(d => { if (!d.__t) { d.__t = 1; d.addEventListener('toggle', () => { if (d.open) fuelle(d); }); } });
  $$('.st').forEach(x => x.onclick = () => oeffneStelle(x.dataset.h, +x.dataset.n, true));
  $$('[data-foto]').forEach(x => x.onclick = () => { const [b, n] = x.dataset.foto.split('|'); bildFenster(b, +n, []); });
  $$('[data-blk-aus]').forEach(x => x.onclick = () => { const [h, n] = x.dataset.blkAus.split('|'); blockAus(h, +n, x.closest('details').querySelector('summary b').textContent); });
}
function suche(q) {
  q = q.trim().toLowerCase();
  if (q) $$('#gruppen .gr[data-leer]').forEach(fuelle);
  $$('#gruppen .gr').forEach(g => {
    let treffer = 0;
    $$('.st', g).forEach(x => { const ja = !q || x.textContent.toLowerCase().includes(q); x.hidden = !ja; if (ja) treffer++; });
    g.hidden = q && !treffer;
    if (q && treffer) g.open = true;
  });
}
function stelleVon(h, n) {
  for (const g of S.verz.gruppen) for (const s of g.stellen) if (s.h === h && s.n === n) return s;
  return null;
}
function senden(d) { const f = $('#vf'); if (f && f.contentWindow) f.contentWindow.postMessage(d, '*'); }
function oeffneStelle(h, n, zeigen, bloecke) {
  const s = stelleVon(h, n);
  if (!s) return;
  if (s.mc) { quit('Diese Karte pflegt ' + NC, 'Gerichte und Preise dort ändern: dann stimmen PDF und Website überein.', [[NC + ' öffnen', () => window.open(CARTE(), '_blank')]], false, 8000); return; }
  if (s.q && s.q.length) return oeffneAngabe(s, h, n, zeigen);   // die Stelle zeigt eine Angabe, eine Karte oder einen Listeneintrag des Hauses (wie beim Carlton)
  S.wahl = { h, n };
  $$('.ed').forEach(x => x.remove());
  $$('.st.aktiv').forEach(x => x.classList.remove('aktiv'));
  const gi = S.verz.gruppen.findIndex(g => g.stellen.includes(s));
  fuelle($(`#gruppen .gr[data-g="${gi}"]`));
  const btn = $(`.st[data-h="${h}"][data-n="${n}"]`);
  if (!btn) return;
  btn.classList.add('aktiv');
  const det = btn.closest('details'); det.open = true;
  const key = `text|${S.seite}|${h}|${n}`;
  const op = S.offen[key];
  const jetzt = op ? op.neu : (s.neu !== undefined ? s.neu : s.html);
  const navi = /Kopf und Menü|^Menü$/.test(det.querySelector('summary b').textContent) || s.tag === 'a' && s.gleich === 1 && s.t.length < 30;
  const ueberall = op ? op.ueberall : (s.ueberall !== undefined ? s.ueberall : navi);
  const ed = document.createElement('div');
  ed.className = 'ed';
  ed.innerHTML = `<span class="mono">${TAGNAME[s.tag] || 'Text'}${s.art === 'el' && /<(em|i)\b/.test(s.html) ? ' · Kursives bleibt kursiv' : ''}</span>
    <div class="ed__f" contenteditable="${s.art === 'el' ? 'true' : 'plaintext-only'}" spellcheck="true" lang="de-CH">${s.art === 'el' ? jetzt : esc(jetzt.replace(/<[^>]+>/g, ''))}</div>
    <div class="ed__z">
      <label><input type="checkbox" id="ed-ue" ${ueberall ? 'checked' : ''}> Überall ändern, wo genau dieser Text steht (alle Seiten)</label>
      ${(s.neu !== undefined || op) ? '<button class="link" type="button" id="ed-zurueck">Wie ursprünglich</button>' : ''}
      <button class="link" type="button" id="ed-zu">Schliessen</button>
    </div>
    ${s.neu !== undefined || op ? `<p class="ed__vor"><b>Ursprünglich:</b> ${esc(s.t)}</p>` : ''}
    <div class="ed__bl" id="ed-bl" hidden></div>`;
  btn.after(ed);
  const f = $('.ed__f', ed);
  const merk = () => {
    const neu = s.art === 'el' ? f.innerHTML : f.textContent;
    const urs = s.art === 'el' ? s.html : s.t;
    const ue = $('#ed-ue', ed).checked;
    if (neu.trim() === (s.neu !== undefined ? s.neu : urs).trim() && ue === (s.ueberall !== undefined ? s.ueberall : navi)) { vergessen(key); btn.classList.remove('offen'); }
    else { vormerken(key, { art: 'text', seite: S.seite, h, n, neu, ueberall: ue, vorschau: f.textContent }); btn.classList.add('offen'); }
    $('span', btn).textContent = f.textContent;
    senden({ bureau: 'tippe', h, n, html: s.art === 'el' ? neu : esc(neu) });
  };
  f.oninput = merk;
  $('#ed-ue', ed).onchange = merk;
  f.addEventListener('paste', e => { e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain')); });
  f.addEventListener('keydown', e => { if (e.key === 'Enter' && s.art !== 'el') e.preventDefault(); });
  if ($('#ed-zurueck', ed)) $('#ed-zurueck', ed).onclick = () => {
    const urs = s.art === 'el' ? s.html : esc(s.t);
    f.innerHTML = urs;
    vormerken(key, { art: 'text', seite: S.seite, h, n, neu: s.art === 'el' ? s.html : s.t, ueberall: $('#ed-ue', ed).checked, vorschau: s.t });
    btn.classList.add('offen');
    senden({ bureau: 'tippe', h, n, html: urs });
  };
  $('#ed-zu', ed).onclick = () => { ed.remove(); btn.classList.remove('aktiv'); S.wahl = null; };
  if (bloecke && bloecke.length) zeigeBloecke(bloecke, $('#ed-bl', ed));
  if (zeigen) senden({ bureau: 'zeige', h, n, sanft: true });
  btn.scrollIntoView({ block: 'nearest' });
  setTimeout(() => { f.focus(); }, 30);
}
/* Eine Stelle, die eine Angabe des Hauses zeigt (Öffnungszeit, Telefon, E-Mail …), ändert die Angabe selbst: dann stimmt sie auf allen Seiten (Muster Carlton).
   Gehört sie zu einer Liste (Zimmer, Anlass, Stelle …) oder zur Karte, führt ein Knopf dorthin. */
async function oeffneAngabe(s, h, n, zeigen) {
  if (!S.felder) S.felder = (await api('felder')).felder;
  S.wahl = { h, n };
  $$('.ed').forEach(x => x.remove());
  $$('.st.aktiv').forEach(x => x.classList.remove('aktiv'));
  const gi = S.verz.gruppen.findIndex(g => g.stellen.includes(s));
  fuelle($(`#gruppen .gr[data-g="${gi}"]`));
  const btn = $(`.st[data-h="${h}"][data-n="${n}"]`);
  if (!btn) return;
  btn.classList.add('aktiv'); btn.closest('details').open = true;
  const felder = s.q.map(q => S.felder.find(f => f.key === q)).filter(Boolean);
  const liste = s.q.find(q => /^l:/.test(q)), karte = s.q.find(q => /^kg?:/.test(q)), hinw = s.q.find(q => /^hinweis\./.test(q)), eigen = null;
  const lv = liste ? LV[liste.split(':')[1]] || 'zahlen' : 'karte', imBereich = !!LISTEN_B(S.bereich) && ALT_B(S.bereich) === lv;   // gehört die Liste zur Ansicht im Reiter «Listen» dieses Bereichs?
  const ed = document.createElement('div'); ed.className = 'ed ed--angabe';
  ed.innerHTML = `<span class="mono">${felder.length ? 'Angabe des Hauses' : liste ? 'Eintrag einer Liste' : 'Aus einem anderen Bereich'}</span>
    ${felder.map(f => { const op = S.offen['angabe|' + f.key]; return `<label class="feld"><span>${esc(f.label)} <small class="leise">· steht ${f.mal}× auf ${f.seiten} Seite${f.seiten === 1 ? '' : 'n'}</small></span><input type="text" data-k="${f.key}" data-std="${esc(f.wert)}" value="${esc(op ? op.wert : f.wert)}"></label>`; }).join('')}
    ${felder.length ? '<p class="ed__vor">Einmal hier ändern: die Angabe stimmt danach auf jeder Seite.</p>' : ''}
    ${karte && CARTE() ? `<p class="ed__vor">Diese Zeile gehört zu einer Karte. Gerichte und Preise pflegt ${NC}: dort ändern, dann stimmen Karte, PDF und Website überein.</p><a class="kn kn--klein" href="${CARTE()}" target="_blank" rel="noopener">${NC} öffnen<i>${PF}</i></a>` : liste || karte ? `<p class="ed__vor">Dieser Text gehört zu ${karte ? 'einer Karte der Website' : 'einem Eintrag einer Liste des Hauses'}${imBereich ? ' (' + esc(LISTEN_B(S.bereich).join(', ')) + ')' : ''}. Ändern Sie ihn dort, dann stimmt er auf allen Seiten, auf denen er steht.</p>${imBereich ? `<button class="kn kn--klein" type="button" data-zu-liste>In der Liste ändern<i>${PF}</i></button>` : `<button class="kn kn--klein" type="button" data-gehe-x="x:${karte ? 'karte' : lv}">${karte ? 'Karten der Website öffnen' : (TITEL['x:' + lv] || 'Listen') + ' öffnen'}<i>${PF}</i></button>`}` : ''}
    ${hinw ? `<button class="kn kn--klein" type="button" data-gehe-x="hinweis">Hinweis für Gäste öffnen<i>${PF}</i></button>` : ''}
    <div class="ed__z"><span></span><button class="link" type="button" id="ed-zu">Schliessen</button></div>`;
  btn.after(ed);
  $$('input[data-k]', ed).forEach(i => i.oninput = () => { const k = i.dataset.k; if (i.value.trim() === i.dataset.std) { vergessen('angabe|' + k); btn.classList.remove('offen'); } else { vormerken('angabe|' + k, { art: 'angabe', key: k, wert: i.value.trim() }); btn.classList.add('offen'); } });
  const zl = $('[data-zu-liste]', ed); if (zl) zl.onclick = () => { const t = $('[data-tab="listen"]'); if (t) t.click(); };
  $$('[data-gehe-x]', ed).forEach(b => b.onclick = () => gehe(b.dataset.geheX));
  $('#ed-zu', ed).onclick = () => { ed.remove(); btn.classList.remove('aktiv'); S.wahl = null; };
  if (zeigen) senden({ bureau: 'zeige', h, n, sanft: true });
  btn.scrollIntoView({ block: 'nearest' });
  const i0 = $('input', ed); if (i0) setTimeout(() => i0.focus(), 30);
}
function zeigeBloecke(bloecke, box) {
  const NAME = { section: 'Abschnitt', article: 'Karte', li: 'Listenpunkt', figure: 'Bild mit Zeile', aside: 'Kasten' };
  bloecke = bloecke.filter(b => NAME[b.tag]);
  if (!bloecke.length) return;
  box.hidden = false;
  box.innerHTML = '<p>Statt den Text zu ändern, etwas ganz von der Seite nehmen:</p>' + bloecke.slice(0, 4).map(b =>
    `<button class="link rot" type="button" data-bl="${b.h}|${b.n}" data-t="${esc(b.t)}">${NAME[b.tag] || 'Block'} ausblenden${b.t ? ': «' + esc(b.t.slice(0, 50)) + (b.t.length > 50 ? '…' : '') + '»' : ''}</button>`).join('');
  $$('[data-bl]', box).forEach(x => {
    x.onmouseenter = () => { const [h, n] = x.dataset.bl.split('|'); senden({ bureau: 'zeige', blk: h, n: +n, still: true }); };
    x.onclick = () => { const [h, n] = x.dataset.bl.split('|'); blockAus(h, +n, x.dataset.t); };
  });
}
function blockAus(h, n, titel) {
  fenster(`<h2>Ausblenden, <em>nicht löschen.</em></h2><p class="satz">«${esc((titel || '').slice(0, 120))}» verschwindet von der Seite. Unter «Entwurf» oder oben auf dieser Seite holen Sie es jederzeit zurück.</p>
    <div class="fenster__kn"><button class="link" type="button" data-zu>Abbrechen</button><button class="kn kn--gefahr" type="button" id="bl-ja">Ausblenden und speichern<i>${PF}</i></button></div>`, true);
  $('#bl-ja').onclick = () => { fensterZu(); vormerken(`aus|${S.seite}|${h}|${n}`, { art: 'aus', seite: S.seite, h, n, an: true }); speichern(); };
}
window.addEventListener('message', ev => {
  const d = ev.data || {};
  if (!d.bureau) return;
  if (d.bureau === 'geladen') { $$('.rahmen.laedt').forEach(x => { const f = x.querySelector('iframe'); if (f && f.contentWindow === ev.source) x.classList.remove('laedt'); }); if (S.nachLaden) S.nachLaden(); }
  if (d.bureau === 'scroll') S.y = d.y;
  if (d.bureau === 'text' && S.ansicht === 'bereich') { oeffneStelle(d.h, d.n, false, d.bloecke); senden({ bureau: 'zeige', h: d.h, n: d.n, still: true }); }
  if (d.bureau === 'bild' && S.ansicht === 'bereich') bildFenster(d.b, d.n, d.bloecke || []);
  if (d.bureau === 'gehe') {
    const b = bereichVon(d.seite);
    if (b && S.ansicht === 'bereich') { S.bereich = b.key; S.seite = d.seite; S.wahl = null; S.y = 0; rand(); zeichne(); }
  }
});

/* ---------- Foto tauschen ---------- */
async function bildFenster(b, n, bloecke) {
  if (!S.bilder) S.bilder = (await api('bilder')).bilder;
  let f0 = null;
  for (const g of S.verz.gruppen) for (const f of g.fotos) if (f.b === b && f.n === n) f0 = f;
  f0 = f0 || { b, n, alt: '' };
  const fest = !!f0.fest;   // Startbild, Seitenkopf, Fenster, Schlussbild, Haus im Fuss: eigenes Format (dunkler gerechnet für die Schrift darauf)
  const key = `bild|${S.seite}|${b}|${n}`;
  const op = S.offen[key];
  let wahl = op ? op.neu : (f0.neu || b);
  senden({ bureau: 'zeige', b, n, still: true });
  fenster(`<h2>Foto <em>tauschen.</em></h2><p class="satz">${fest ? `Das ist ein grosses Bild mit eigenem Format (${esc(f0.was || 'Startbild, Seitenkopf, Fenster oder Schlussbild')}). Ein eigenes Foto wird dafür passend zugeschnitten und so abgedunkelt, dass die Schrift lesbar bleibt. Mindestens 1400 Pixel breit, besser 2500.` : 'Links das Foto, wie es jetzt steht. Rechts die Fotos des Hauses: eines wählen oder ein eigenes hochladen. Mindestens 900 Pixel breit, besser 2000.'}</p>
    <div class="bild-wahl">
      <div><div class="bild-jetzt"><img id="bw-img" src="${kleinBild(wahl)}" data-ersatz="/assets/img/${wahl}.webp" alt=""></div>
        <label class="feld" style="margin-top:16px"><span>Bildbeschreibung (für Blinde und Google)</span><textarea id="bw-alt" rows="2">${esc(op ? op.alt || f0.alt : (f0.alt_neu || f0.alt))}</textarea></label>
        <label class="ed__z"><label><input type="checkbox" id="bw-ue" ${fest || (op && op.ueberall) ? 'checked' : ''} ${fest ? 'disabled' : ''}> Überall tauschen, wo dieses Foto steht</label></label>
        <div class="ed__bl" id="bw-bl" hidden></div></div>
      <div><label class="suche">${LUPE}<input type="search" id="bw-q" placeholder="Fotos suchen: Stube, Zimmer, Garten, Rösti …"${fest ? ' disabled' : ''}></label>
        <div style="margin:-4px 0 12px"><label class="kn kn--linie kn--klein" style="cursor:pointer">Eigenes Foto hochladen<i>${PF}</i><input type="file" id="bw-hoch" accept="image/*" hidden></label></div>
        <div class="bibl" id="bw-l"></div></div>
    </div>
    <div class="fenster__kn">${f0.neu ? '<button class="link" type="button" id="bw-urs">Ursprüngliches Foto</button>' : ''}<button class="link" type="button" data-zu>Abbrechen</button><button class="kn" type="button" id="bw-ok">Übernehmen<i>${PF}</i></button></div>`);
  const liste = q => {
    q = (q || '').trim().toLowerCase();
    const L = fest ? S.bilder.filter(x => x.b === wahl || x.b === b) : S.bilder.filter(x => !q || (x.b + ' ' + x.alt).toLowerCase().includes(q)).slice(0, 240);
    if (fest && !L.length) { $('#bw-l').innerHTML = '<p class="leise" style="grid-column:1/-1;margin:0">Für dieses Bild gibt es nur eigene Fotos: «Eigenes Foto hochladen». Es wird für genau diese Stelle gerechnet.</p>'; return; }
    $('#bw-l').innerHTML = L.map(x => `<button type="button" data-b="${x.b}" aria-pressed="${x.b === wahl}" title="${esc(x.alt || x.b)}"><img src="${x.klein}" alt="" loading="lazy">${x.eigen ? '<span>Eigenes</span>' : ''}</button>`).join('');
    $$('#bw-l [data-b]').forEach(y => y.onclick = () => { wahl = y.dataset.b; $$('#bw-l [data-b]').forEach(z => z.setAttribute('aria-pressed', z === y)); $('#bw-img').src = y.querySelector('img').src; const t = S.bilder.find(z => z.b === wahl); if (t && t.alt && wahl !== b) $('#bw-alt').value = t.alt; });
  };
  liste('');
  $('#bw-q').oninput = e => liste(e.target.value);
  if (bloecke.length) zeigeBloecke(bloecke, $('#bw-bl'));
  $('#bw-hoch').onchange = async e => {
    const datei = e.target.files[0]; if (!datei) return;
    e.target.value = '';   // dieselbe Datei lässt sich danach noch einmal wählen
    if (datei.size > 25 * 1024 * 1024) { fehler(new Error('BILD · Das Foto ist grösser als 25 MB. Bitte kleiner exportieren (für die Website reichen 2000 Pixel Breite).')); return; }   // gar nicht erst schicken (Prüfung 16.10.2026: 30 MB)
    const daten = await new Promise((ok, nein) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = nein; r.readAsDataURL(datei); });
    try {
      quit('Foto wird vorbereitet …', datei.name, [], false, 3000);
      const r = await api('hochladen', { name: datei.name, daten, fuer: fest ? b : '' });
      if (r.fest) S.bilder = S.bilder || [];
      S.bilder = (await api('bilder')).bilder;
      if (r.fest) S.bilder.push({ b: r.b, klein: r.klein, alt: '', eigen: true });
      wahl = r.b; liste(''); $('#bw-img').src = r.klein;
      quit('Foto hochgeladen', `${r.w} × ${r.h} Pixel, jetzt unter den Fotos des Hauses.`, [], false, 5000);
    } catch (er) { fehler(er); }
  };
  if ($('#bw-urs')) $('#bw-urs').onclick = () => { wahl = b; $('#bw-img').src = kleinBild(b); $('#bw-alt').value = f0.alt; liste($('#bw-q').value); };
  $('#bw-ok').onclick = () => {
    const alt = $('#bw-alt').value.trim();
    vormerken(key, { art: 'bild', seite: S.seite, b, n, neu: wahl, alt: alt !== f0.alt ? alt : '', ueberall: fest || $('#bw-ue').checked });
    fensterZu();
    speichern();
  };
}

/* ---------- Angaben des Hauses ---------- */
async function zeichneAngaben() {
  const L = (await api('angaben')).angaben;
  const ORD = ['Kontakt', 'Adresse', 'Links', 'Noten der Gäste', 'Karten als PDF'];
  const gruppen = [...new Set(L.map(a => a.gruppe))].sort((x, y) => (ORD.indexOf(x) + 99) % 99 - (ORD.indexOf(y) + 99) % 99);
  const SATZ = { Kontakt: 'Telefon und E-Mail stehen im Fuss jeder Seite und hinter jedem Knopf, der anruft oder schreibt. Die Adresse für Bewerbungen steht bei den offenen Stellen.', Adresse: 'Die Adresse steht im Fuss jeder Seite.',
    Links: 'Wohin die Knöpfe führen: Zimmer buchen, Anfahrt, Spa im Nachbarhaus. Gebucht wird weiter beim Buchungssystem des Hauses.', 'Noten der Gäste': 'Die Noten bei Booking.com und Google mit der Zahl der Bewertungen und dem Stand, dazu die Zeile zu TripAdvisor.',
    'Karten als PDF': 'Die Karten als PDF hinter den Knöpfen auf «Essen». Nach einem neuen Druck hier den Weg zur neuen Datei eintragen.' };
  $('#ansicht').innerHTML = kopf('Für alle Seiten', 'Angaben <em>des Hauses.</em>', 'Eine Angabe, jede Stelle: Ändern Sie die Telefonnummer hier, wechselt sie auf allen Seiten und in jedem Knopf zum Anrufen.') +
    gruppen.map(g => `<section class="karte"><div class="kh"><i class="kh__z">${ic({ Kontakt: 'tel', Adresse: 'ort', Links: 'link', 'Noten der Gäste': 'preis', 'Karten als PDF': 'karte' }[g] || 'haus')}</i><div><h3>${g}</h3><p>${SATZ[g] || ''}</p></div></div>${L.filter(a => a.gruppe === g).map(a => {
      const op = S.offen['angabe|' + a.key];
      return `<div class="fz${op ? ' offen' : ''}${a.wert !== a.standard ? ' geaendert' : ''}" data-k="${a.key}"><span><i class="fz__z">${ic(a.art === 'tel' ? 'tel' : a.art === 'mail' ? 'mail' : a.art === 'link' ? 'link' : 'ort')}</i><b>${esc(a.label)}</b><small>steht ${a.mal}× auf ${a.seiten} Seite${a.seiten === 1 ? '' : 'n'}</small></span>
        <input type="${a.art === 'mail' ? 'email' : a.art === 'tel' ? 'tel' : a.art === 'link' ? 'url' : 'text'}" value="${esc(op ? op.wert : a.wert)}" data-std="${esc(a.wert)}" spellcheck="false">
        ${a.wert !== a.standard ? `<button class="link" type="button" data-urs="${esc(a.standard)}">Ursprünglich</button>` : '<span></span>'}
        ${a.wert !== a.standard ? `<em>Ursprünglich: ${esc(a.standard)}</em>` : ''}</div>`;
    }).join('')}</section>`).join('');
  $$('.fz[data-k]').forEach(z => {
    const i = $('input', z), k = z.dataset.k;
    i.oninput = () => { if (i.value.trim() === i.dataset.std) { vergessen('angabe|' + k); z.classList.remove('offen'); } else { vormerken('angabe|' + k, { art: 'angabe', key: k, wert: i.value.trim() }); z.classList.add('offen'); } };
    const u = $('[data-urs]', z); if (u) u.onclick = () => { i.value = u.dataset.urs; i.oninput(); };
  });
}

/* ---------- Zeiten & Preise ---------- */
async function zeichneZahlen() {
  const Z = await api('zahlen'), L = Z.zahlen;
  const F = { alle: () => true, preise: s => /CHF|Fr\./.test(s.t), zeiten: s => /Uhr|\d[.:]\d\d\s?[–-]/.test(s.t), groessen: s => /m²|Person|Nacht|Nächte|Minuten|Grad|°/.test(s.t) };
  const filt = L.filter(F[S.zahlenFilter] || F.alle);
  const nachSeite = {};
  filt.forEach(s => { (nachSeite[s.seite] = nachSeite[s.seite] || []).push(s); });
  $('#ansicht').innerHTML = kopf('Für alle Seiten', 'Zeiten <em>& Preise.</em>', `Jede Stelle der Website mit einem Preis, einer Uhrzeit, einer Dauer oder einer Grösse, Seite für Seite. Direkt hier ändern oder «In der Seite» öffnen; Preise der Karten und Listen führen zu ihrer Liste. ${L.length} Stellen.`) +
    `<div class="filter"><div class="wahl2" role="group" aria-label="Filter">${[['alle', 'Alle'], ['preise', 'Preise'], ['zeiten', 'Zeiten'], ['groessen', 'Grössen und Dauer']].map(([k, n]) => `<button type="button" data-f="${k}" aria-pressed="${S.zahlenFilter === k}">${n}</button>`).join('')}</div></div>` +
    angabenZahlen(Z.angaben) +
    Object.entries(nachSeite).map(([seite, l]) => { const be = bereichVon(seite); return `<section class="karte"><div class="kh">${be && be.foto ? `<img class="kh__b" src="/assets/img/${be.foto}-s.webp" alt="" loading="lazy" data-ersatz="/assets/img/${be.foto}.webp">` : ''}<div><h3>${esc(l[0].seite_name)}</h3><p>${esc(l[0].bereich)} · ${l.length} Stelle${l.length > 1 ? 'n' : ''}</p></div><button class="kn kn--linie kn--klein" type="button" data-gehe="b:${be ? be.key : ''}" data-seite="${seite}">Seite öffnen<i>${PF}</i></button></div>${l.map(s => {
      const op = S.offen[`text|${seite}|${s.h}|${s.n}`], viele = (s.seiten_alle || []).length > 1;
      const zi = `<i class="zl__z">${ic(/CHF|Fr\./.test(s.t) ? 'preis' : /Uhr|\d[.:]\d\d\s?[–-]/.test(s.t) ? 'uhr' : 'mass')}</i>`;
      if (s.liste) return `<div class="zl zl--liste" data-s="${seite}" data-h="${s.h}" data-n="${s.n}">${zi}<div><small>${esc(s.gruppe)}${s.vor && s.vor !== s.gruppe ? ' · ' + esc(s.vor) : ''} · ${s.liste === 'karte' ? 'aus der Karte' : 'aus einer Liste des Hauses'}${(s.seiten_alle || []).length > 1 ? ` · steht auf ${s.seiten_alle.length} Seiten` : ''}</small><span class="zl__t">${esc(s.t)}</span></div>
        <span class="zl__kn"><button class="zl__blick" type="button" data-blick title="Kurz zeigen, wo das auf der Seite steht">${ic('foto')}<span>Zeigen</span></button><button class="link" type="button" data-zur-liste="${s.liste}">${s.liste === 'karte' ? 'In der Karte ändern' : 'In der Liste ändern'}</button><button class="link" type="button" data-zeig="${seite}|${s.h}|${s.n}">In der Seite</button></span></div>`;   // Ruedihus: Preise der Karten und Listen ändert man dort, dann stimmen alle Seiten
      return `<div class="zl${s.neu !== undefined ? ' geaendert' : ''}" data-s="${seite}" data-h="${s.h}" data-n="${s.n}"${viele ? ' data-ueberall' : ''}>${zi}<div><small>${esc(s.gruppe)}${s.vor && s.vor !== s.gruppe ? ' · ' + esc(s.vor) : ''}${viele ? ` · steht auf ${s.seiten_alle.length} Seiten, ändert überall` : ''}</small><span contenteditable="plaintext-only" spellcheck="false" class="ed__f" style="min-height:0;padding:8px 10px">${esc(op ? op.vorschau : (s.neu !== undefined ? s.neu.replace(/<[^>]+>/g, '') : s.t))}</span></div>
        <span class="zl__kn"><button class="zl__blick" type="button" data-blick title="Kurz zeigen, wo das auf der Seite steht">${ic('foto')}<span>Zeigen</span></button><button class="link" type="button" data-zeig="${seite}|${s.h}|${s.n}">In der Seite</button></span></div>`;
    }).join('')}</section>`; }).join('');
  $$('[data-f]').forEach(b => b.onclick = () => { S.zahlenFilter = b.dataset.f; zeichne(); });
  $$('.fz[data-k]').forEach(z => { const i = $('input', z), k = z.dataset.k; i.oninput = () => { if (i.value.trim() === i.dataset.std) { vergessen('angabe|' + k); z.classList.remove('offen'); } else { vormerken('angabe|' + k, { art: 'angabe', key: k, wert: i.value.trim() }); z.classList.add('offen'); } }; const u = $('[data-urs]', z); if (u) u.onclick = () => { i.value = u.dataset.urs; i.oninput(); }; });
  $$('.zl:not(.zl--liste)').forEach(z => {
    const s = L.find(x => x.seite === z.dataset.s && x.h === z.dataset.h && x.n === +z.dataset.n);
    const f = $('.ed__f', z), key = `text|${s.seite}|${s.h}|${s.n}`, ue = z.hasAttribute('data-ueberall');   // gleicher Text auf mehreren Seiten: überall ändern
    f.oninput = () => {
      const t = f.textContent.trim(), alt = (s.neu !== undefined ? s.neu.replace(/<[^>]+>/g, '') : s.t).trim();
      if (t === alt) vergessen(key);
      else if (s.art === 'el' && /<(em|i|b|strong|br|a)\b/.test(s.html)) {   // Auszeichnung im Satz: nur die Ziffern tauschen, Kursives bleibt
        vormerken(key, { art: 'text', seite: s.seite, h: s.h, n: s.n, neu: ersetzeText(s.neu !== undefined ? s.neu : s.html, alt, t), ueberall: ue, vorschau: t });
      } else vormerken(key, { art: 'text', seite: s.seite, h: s.h, n: s.n, neu: s.art === 'el' ? esc(t) : t, ueberall: ue, vorschau: t });
    };
  });
  $$('[data-zur-liste]').forEach(b => b.onclick = () => b.dataset.zurListe === 'karte' && CARTE() ? window.open(CARTE(), '_blank') : gehe('x:' + b.dataset.zurListe));   // Karten: zur Tafel, sobald sie angeschlossen ist
  $$('[data-zeig]').forEach(b => b.onclick = () => { const [seite, h, n] = b.dataset.zeig.split('|'); const be = bereichVon(seite); gehe('b:' + be.key, { seite, wahl: { h, n: +n } }); });
  blickVorschau();
}
/* Öffnungszeiten, die das Haus als Angabe führt (beim Ruedihus das Restaurant): eine Angabe, jede Stelle (Muster Carlton) */
function angabenZahlen(A) {
  const f = S.zahlenFilter, L = (A || []).filter(a => f === 'alle' || f === 'zeiten');
  if (!L.length) return '';
  return `<section class="karte"><div class="kh"><i class="kh__z">${ic('haus')}</i><div><h3>Öffnungszeit des Restaurants</h3><p>Sie steht an vielen Stellen der Website. Einmal hier ändern, dann stimmen alle Seiten.</p></div></div>${L.map(a => {
    const op = S.offen['angabe|' + a.key];
    return `<div class="fz${op ? ' offen' : ''}${a.wert !== a.standard ? ' geaendert' : ''}" data-k="${a.key}"><span><i class="fz__z">${ic('uhr')}</i><b>${esc(a.label)}</b><small>steht ${a.mal}× auf ${a.seiten} Seite${a.seiten === 1 ? '' : 'n'}</small></span>
      <input type="text" value="${esc(op ? op.wert : a.wert)}" data-std="${esc(a.wert)}" spellcheck="false">
      ${a.wert !== a.standard ? `<button class="link" type="button" data-urs="${esc(a.standard)}">Ursprünglich</button>` : '<span></span>'}
      ${a.wert !== a.standard ? `<em>Ursprünglich: ${esc(a.standard)}</em>` : ''}</div>`;
  }).join('')}</section>`;
}
/* Knopf «Zeigen» je Zeile (Robert 16.10.2026: nicht beim Überfahren, «das verrückelt»; stattdessen ein Knopf, der kurz das Bild der Seite zeigt,
   dann hineinzoomt und einen Kreis um die Stelle legt). Ein Fenster für alle Zeilen; eine Seite wird nur einmal geladen. Bewegung nur über transform und opacity. */
function blickVorschau() {
  /* «Zeigen» (Robert 16.10.2026: hell, gross und mittig, ruhig vom ganzen Bild zur Stelle, Stelle hell ausgeleuchtet statt gelber Kreis) */
  let box = $('#zl-blick');
  if (!box) {
    const schl = document.createElement('div'); schl.id = 'zl-schleier'; schl.className = 'zl-schleier'; document.body.appendChild(schl);
    box = document.createElement('div'); box.id = 'zl-blick'; box.className = 'zl-blick';
    box.innerHTML = '<div class="zl-blick__r"><iframe id="zb-f" title="Vorschau der Stelle" tabindex="-1"></iframe><span class="zl-blick__kreis"></span></div><p class="zl-blick__t"><span><small></small><b></b></span><button class="zl-blick__kn" type="button" data-nochmal>Nochmal</button><button class="zl-blick__zu" type="button" data-zu aria-label="Schliessen">×</button></p>';
    document.body.appendChild(box);
    box.__z = { seite: '', ziel: null, bereit: false };
    const zu = () => { box.classList.remove('auf'); schl.classList.remove('auf'); clearTimeout(box.__z.uhr); $('.zl-blick__kreis', box).classList.remove('an'); clearTimeout(box.__weg); box.__weg = setTimeout(() => { if (!box.classList.contains('auf')) box.style.display = 'none'; }, 520); };   // Safari liess das Fenster sonst stehen (16.10.2026)
    window.addEventListener('message', ev => { const f = $('#zb-f'); if (f && ev.source === f.contentWindow && (ev.data || {}).bureau === 'geladen') { box.__z.bereit = true; box.classList.remove('laedt'); setTimeout(blickZeig, 300); } });
    $('[data-zu]', box).onclick = zu; schl.onclick = zu;
    $('[data-nochmal]', box).onclick = () => blickZeig();
    document.addEventListener('keydown', e => { if (e.key === 'Escape') zu(); });
  }
  const Z = box.__z;
  Z.seite = ''; Z.bereit = false;   // jede Ansicht lädt neu: der Entwurf kann sich geändert haben
  $$('.zl [data-blick]').forEach(k => k.onclick = () => {
    const z = k.closest('.zl');
    Z.ziel = { h: z.dataset.h, n: +z.dataset.n };
    $('b', box).textContent = z.closest('section').querySelector('h3').textContent;
    $('small', box).textContent = (z.querySelector('.zl__wo, small, .zl__o') || {}).textContent || 'So steht es auf der Seite';
    $('.zl-blick__kreis', box).classList.remove('an');
    clearTimeout(box.__weg); box.style.display = ''; void box.offsetWidth;
    box.classList.add('auf'); $('#zl-schleier').classList.add('auf');
    const f0 = $('#zb-f'), r0 = $('.zl-blick__r', box); if (Z.seite !== z.dataset.s) { f0.style.transition = 'none'; f0.style.transform = `scale(${r0.clientWidth / 1440})`; }
    if (Z.seite !== z.dataset.s) { Z.seite = z.dataset.s; Z.bereit = false; box.classList.add('laedt'); $('#zb-f').src = iframeUrl('entwurf', Z.seite, ''); } else blickZeig();
  });
}
function blickZeig() {
  const box = $('#zl-blick'), Z = box && box.__z; if (!Z || !Z.bereit || !Z.ziel) return;
  const f = $('#zb-f'), rahmen = $('.zl-blick__r', box), kreis = $('.zl-blick__kreis', box);
  let d, el; try { d = f.contentDocument; el = d.querySelector(`[data-e="${Z.ziel.h}"][data-en="${Z.ziel.n}"]`); } catch (e) { return; }
  if (!el) return;
  // in der Vorschau steht alles still: kein Hereinschweben, kein weiches Scrollen, sonst misst man eine Stelle, die noch unterwegs ist (Safari, 16.10.2026)
  if (!d.getElementById('zb-still')) { const st = d.createElement('style'); st.id = 'zb-still'; st.textContent = '*,*::before,*::after{animation:none!important;transition:none!important}html,body{scroll-behavior:auto!important}'; d.head.appendChild(st); }
  el.scrollIntoView({ block: 'center', behavior: 'instant' });
  const W = rahmen.clientWidth, H = rahmen.clientHeight, s0 = W / 1440, FH = f.offsetHeight || 900;
  const q = el.getBoundingClientRect(), cx = q.left + q.width / 2, cy = q.top + q.height / 2;
  // nah genug, dass man es lesen kann, weit genug, dass man sieht, wo es steht
  const s1 = Math.min(1, Math.max(s0 * 1.5, Math.min(W * .42 / Math.max(q.width, 80), H * .3 / Math.max(q.height, 30))));
  // Ausschnitt bleibt in der Seite: nie leerer Rand neben der Seite
  const tx = Math.min(0, Math.max(W - 1440 * s1, W / 2 - cx * s1)), ty = Math.min(0, Math.max(H - FH * s1, H / 2 - cy * s1));
  f.style.transition = 'none'; f.style.transform = `translate(0,0) scale(${s0})`; kreis.classList.remove('an'); void f.offsetWidth;
  clearTimeout(Z.uhr);
  Z.uhr = setTimeout(() => {
    f.style.transition = 'transform 2.6s cubic-bezier(.45,0,.2,1)';
    f.style.transform = `translate(${tx}px,${ty}px) scale(${s1})`;
    const kw = q.width * s1 + 28, kh = q.height * s1 + 20;
    kreis.style.width = kw + 'px'; kreis.style.height = kh + 'px'; kreis.style.left = (tx + q.left * s1 - 14) + 'px'; kreis.style.top = (ty + q.top * s1 - 10) + 'px';
    Z.uhr = setTimeout(() => kreis.classList.add('an'), 2500);
  }, 1300);
}

function ersetzeText(html, alt, neu) {
  /* gleicher sichtbarer Text bis auf geänderte Stücke: das erste abweichende Wort-Stück im HTML-Text tauschen */
  const a = alt.split(/(\s+)/), b = neu.split(/(\s+)/);
  if (a.length !== b.length) return esc(neu);
  let h = html;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) { if (!h.includes(a[i])) return esc(neu); h = h.replace(a[i], esc(b[i])); }
  return h;
}

/* ---------- Karten (La Carte) ---------- */
function karten() {
  const K = S.ue.karten || {}, mc = K.karten || [], kw = K.website || [];
  const BILD = { k1: 'e-plaettli', k2: 'e-roesti', k3: 'e-terrine' };
  return kopf('Karten', 'Die <em>Karten.</em>', 'Der Schpiszettel der Chäs- und Wystube, die Schpis Charte der Egger- und Stettlerstube und der Tagesteller stehen auf der Seite «Essen» als Listen mit Preis. Sie pflegen sie Zeile für Zeile unter «Karten der Website». Gedruckte Karten und PDFs macht ' + NC + '.',
    `${CARTE() ? `<a class="kn" href="${CARTE()}" target="_blank" rel="noopener">${NC} öffnen<i>${PF}</i></a>` : ''}<button class="kn${CARTE() ? ' kn--linie' : ''}" type="button" data-gehe="x:karte">Karten der Website<i>${PF}</i></button>`) +
    (K.fehler ? `<div class="leer-hinweis"><b>${CARTE() ? NC + ' antwortet nicht.' : NC + ' ist noch nicht angeschlossen.'}</b>${CARTE() ? esc(K.fehler) : 'Die gedruckten Karten und ihre PDFs bekommen ein eigenes Werkzeug. Bis es am Schreibtisch angeschlossen ist, pflegen Sie die Karten der Website hier, die PDFs stehen unter «Angaben des Hauses».'}</div>` : '') +
    (mc.length ? `<div class="kt-flaeche">${mc.map((k, i) => `<a class="kt" style="--i:${i};--r:${[-2.5, 1.8, -1.2, 2.4, -1.8][i % 5]}deg" href="${CARTE()}#${esc(k.ziel)}" target="_blank" rel="noopener"><span class="kt__b"><img src="/assets/img/stube-kerze-s.webp" alt="" loading="lazy" decoding="async"></span><b>${esc(k.name)}</b><small>${esc(k.gruppe || 'Karte')} · PDF vom ${esc((k.pdf_zeit || '–').split(' ')[0])}</small>${k.entwurf ? '<em>Entwurf wartet</em>' : ''}</a>`).join('')}</div>` : '') +
    `<h2 class="zw">Auf der <em>Website</em></h2>
    <div class="kt-flaeche">${kw.map((k, i) => `<button class="kt" type="button" data-gehe="x:karte" style="--i:${i};--r:${[-2.5, 1.8, -1.2, 2.4, -1.8][i % 5]}deg"><span class="kt__b"><img src="/assets/img/${BILD[k.key] || 'stube-kerze'}-s.webp" alt="" loading="lazy" decoding="async"></span><b>${esc(k.titel)}</b><small>${esc(k.unter || 'Essen')} · ${k.rubriken} Rubrik${k.rubriken === 1 ? '' : 'en'} · ${k.zeilen} Zeile${k.zeilen === 1 ? '' : 'n'}</small></button>`).join('')}</div>
    <h2 class="zw">So läuft <em>eine Preisänderung</em></h2>
    <div class="ablauf">${[
      ['preis', 'Ändern', 'Unter «Karten der Website» die Karte wählen, das Gericht bearbeiten, den Preis ändern. Gespeichert wird in den Entwurf.'],
      ['stift', 'Ansehen', 'Unter «Entwurf & Vergleich» steht die Zeile vorher und nachher, daneben die Seite mit dem Entwurf.'],
      ['welt', 'Veröffentlichen', 'Mit «Veröffentlichen» kommt die neue Zeile auf die Website, geprüft vor dem Umschalten.'],
      ['zurueck', 'Zurückholen', 'Jede frühere Fassung holen Sie unter «Frühere Fassungen» zurück in den Entwurf.']].map(([k, t, x], i) => `<div class="ab" style="--i:${i}"><i class="ab__z">${ic(k)}</i><span class="mono">Schritt ${i + 1}</span><b>${t}</b><p>${x}</p></div>`).join('')}</div>
    <div class="karte ablauf__fuss"><p class="leise" style="margin:0">Texte rund um die Karten (Stimmung, Fotos der Restaurants, Öffnungszeiten) ändern Sie unter <button class="link" type="button" data-gehe="b:essen">Essen</button> und <button class="link" type="button" data-gehe="zahlen">Zeiten & Preise</button>.</p></div>`;
}

/* ---------- Hinweis für Gäste ---------- */
async function zeichneHinweis() {
  const e = (await api('entwurf')).entwurf;
  const LEER = { an: false, text: '', von: '', bis: '', link: '', linktext: '', farbe: 'holz', schrift: 'klar', groesse: 'mittel' };
  const h = (S.offen.hinweis && S.offen.hinweis) || Object.assign({}, LEER, e.hinweis || {});
  const wahl = (k, liste) => `<div class="wahl2 hw-wahl" role="group" data-hw="${k}">${liste.map(([v, n, f]) => `<button type="button" data-v="${v}" aria-pressed="${(h[k] || liste[0][0]) === v}">${f ? `<i style="background:${f}"></i>` : ''}${n}</button>`).join('')}</div>`;
  $('#ansicht').innerHTML = kopf('Für alle Seiten', 'Hinweis <em>für Gäste.</em>', 'Ein Satz unten auf jeder Seite: Ruhetag, Betriebsferien, ein besonderer Abend in der Stube. Mit Zeitraum erscheint und verschwindet er von selbst.') +
    `<div class="hw-stil karte"><h3>Gestaltung des Bands</h3>
      <div class="hw-z"><span class="mono">Farbe</span>${wahl('farbe', [['holz', 'Wandholz', '#4a2e17'], ['kerze', 'Kerzenlicht', '#c98543'], ['papier', 'Papier', '#efe4d3'], ['russ', 'Stube', '#1f1209']])}</div>
      <div class="hw-z"><span class="mono">Schrift</span>${wahl('schrift', [['klar', 'Klar'], ['elegant', 'Elegant'], ['gesperrt', 'Gesperrt']])}</div>
      <div class="hw-z"><span class="mono">Grösse</span>${wahl('groesse', [['klein', 'Klein'], ['mittel', 'Mittel'], ['gross', 'Gross']])}</div></div>
    <div class="hw-vor"><span class="mono">So sieht er aus</span>
      <div class="mini mini--gross" aria-hidden="true"><div class="mini__leiste"><i></i><i></i><i></i><span>doldenhorn-ruedihus.ch</span></div>
        <div class="mini__seite"><img src="/assets/img/haus-daemmerung-l.webp" alt=""><div class="mini__nav"><span></span><span></span>${ZEICHEN}<span></span><span></span></div><div class="mini__t"><small>Kandersteg · seit 1753</small><b>Landgasthof Ruedihus</b></div></div>
        <div id="h-probe"></div></div>
      <p class="leise" id="h-probe-satz"></p></div>
    <div class="arbeit hw-arbeit"><div class="karte">
      <label class="schalter" style="margin-bottom:18px"><input type="checkbox" id="h-an" ${h.an ? 'checked' : ''}> Hinweis zeigen</label>
      <label class="feld"><span>Text</span><textarea id="h-text" rows="3" placeholder="Die Stuben bleiben vom 3. bis 14. November geschlossen. Wir freuen uns auf Ihren Besuch danach.">${esc(h.text)}</textarea></label>
      <div class="zwei"><label class="feld"><span>Ab (freiwillig)</span><input type="date" id="h-von" value="${esc(h.von)}"></label><label class="feld"><span>Bis (freiwillig)</span><input type="date" id="h-bis" value="${esc(h.bis)}"></label></div>
      <div class="zwei"><label class="feld"><span>Link (freiwillig)</span><input type="text" id="h-link" value="${esc(h.link)}" placeholder="essen.html oder https://…"></label><label class="feld"><span>Linktext</span><input type="text" id="h-lt" value="${esc(h.linktext)}" placeholder="Mehr"></label></div>
      <p class="leise">Gäste können das Band mit dem Kreuz schliessen. Ohne Zeitraum steht es, bis Sie es hier ausschalten.</p>
    </div></div>`;
  const zeig = () => {
    const st = k => ($(`[data-hw="${k}"] [aria-pressed="true"]`) || {}).dataset.v;
    const d = { art: 'hinweis', an: $('#h-an').checked, text: $('#h-text').value.trim(), von: $('#h-von').value, bis: $('#h-bis').value, link: $('#h-link').value.trim(), linktext: $('#h-lt').value.trim(), farbe: st('farbe'), schrift: st('schrift'), groesse: st('groesse') };
    const alt = Object.assign({}, LEER, e.hinweis || {});
    if (['an', 'text', 'von', 'bis', 'link', 'linktext', 'farbe', 'schrift', 'groesse'].every(k => String(d[k]) === String(alt[k]))) vergessen('hinweis'); else vormerken('hinweis', d);
    const bsp = !d.text, txt = d.text || $('#h-text').placeholder;
    const FA = { holz: ['linear-gradient(180deg,#4a2e17,#27160b)', '#efe4d3', '#f3cd94'], kerze: ['#c98543', '#2a1a0e', '#321f10'], papier: ['#efe4d3', '#2a1a0e', '#6d431f'], russ: ['#1f1209', '#efe4d3', '#f3cd94'] }[d.farbe] || ['linear-gradient(180deg,#4a2e17,#27160b)', '#efe4d3', '#f3cd94'];   // wie studio_inhalt.py HINWEIS_FARBE, Wandholz = Band der Seite
    const gr = { klein: 12, mittel: 14, gross: 16 }[d.groesse] || 14;
    const fo = d.schrift === 'elegant' ? `font:400 ${gr + 1}px/1.35 'Gelasio',Georgia,serif` : d.schrift === 'gesperrt' ? `font:500 ${gr - 3}px/1.7 'DM Mono',monospace;letter-spacing:.12em;text-transform:uppercase` : `font:500 ${gr}px/1.45 'Instrument Sans',system-ui,sans-serif`;
    $('#h-probe').innerHTML = `<div class="mini__band${d.an && !bsp ? '' : ' aus'}" style="background:${FA[0]};color:${FA[1]};${fo};--lk:${FA[2]}"><i class="mini__dr" style="border-color:${FA[2]}"></i>${bsp ? '<em>Beispiel</em>' : ''}<span>${esc(txt)}${d.link || bsp ? ` <u>${esc(d.linktext || 'Mehr')}</u>` : ''}</span><b>×</b></div>`;
    $('#h-probe-satz').textContent = bsp ? 'Noch kein Text: so sähe ein Hinweis aus. Er steht unten auf jeder Seite, über dem Inhalt.' : d.an ? (d.von || d.bis ? `Steht unten auf jeder Seite${d.von ? ' ab ' + d.von.split('-').reverse().join('.') : ''}${d.bis ? ' bis ' + d.bis.split('-').reverse().join('.') : ''}.` : 'Steht unten auf jeder Seite, sobald Sie veröffentlichen.') : 'Ausgeschaltet: steht noch nirgends. Oben «Hinweis zeigen» einschalten.';
  };
  $$('#ansicht input, #ansicht textarea').forEach(i => i.oninput = zeig);
  $$('[data-hw] button').forEach(b => b.onclick = () => { $$('button', b.parentNode).forEach(x => x.setAttribute('aria-pressed', x === b)); zeig(); });
  zeig();
}

/* ---------- Google-Texte ---------- */
async function zeichneGoogle() {
  const seiten = S.ue.bereiche.flatMap(b => b.seiten);
  const verz = await Promise.all(seiten.map(s => api('seite?s=' + encodeURIComponent(s.datei)).then(v => [s, v.seo])));
  $('#ansicht').innerHTML = kopf('Für alle Seiten', 'Google-<em>Texte.</em>', 'Titel und Beschreibung jeder Seite, so wie Google sie in den Suchergebnissen zeigt. Titel bis etwa 60 Zeichen, Beschreibung bis etwa 155.') +
    verz.map(([s, seo]) => {
      const op = S.offen['seo|' + s.datei];
      const t = op ? op.titel : (seo.neu.titel || ''), d = op ? op.beschr : (seo.neu.beschr || '');
      return `<section class="karte" data-s="${s.datei}">${(be => be && be.foto ? `<div class="kh">${`<img class="kh__b" src="/assets/img/${be.foto}-s.webp" alt="" loading="lazy" data-ersatz="/assets/img/${be.foto}.webp">`}<div><h3>${esc(s.name)}</h3></div></div>` : `<h3>${esc(s.name)}</h3>`)(bereichVon(s.datei))}<div class="zwei"><div>
        <label class="feld"><span>Titel <i class="zaehler" data-z="t"></i></span><input type="text" data-f="titel" value="${esc(t)}" placeholder="${esc(seo.titel)}"></label>
        <label class="feld"><span>Beschreibung <i class="zaehler" data-z="d"></i></span><textarea data-f="beschr" rows="3" placeholder="${esc(seo.beschr)}">${esc(d)}</textarea></label>
        <small class="leise">Leer gelassen gilt der Text, der grau im Feld steht.</small></div>
        <div class="google"><small>doldenhorn-ruedihus.ch › ${esc(s.datei.replace('.html', ''))}</small><b data-g="t"></b><span data-g="d"></span></div></div></section>`;
    }).join('');
  $$('.karte[data-s]').forEach(k => {
    const t = $('[data-f=titel]', k), d = $('[data-f=beschr]', k), alt = { t: t.value, d: d.value };
    const zeig = () => {
      const tt = t.value.trim() || t.placeholder, dd = d.value.trim() || d.placeholder;
      $('[data-g=t]', k).textContent = tt.length > 62 ? tt.slice(0, 60) + ' …' : tt;
      $('[data-g=d]', k).textContent = dd.length > 158 ? dd.slice(0, 155) + ' …' : dd;
      $('[data-z=t]', k).textContent = tt.length + '/60'; $('[data-z=t]', k).classList.toggle('zu', tt.length > 60);
      $('[data-z=d]', k).textContent = dd.length + '/155'; $('[data-z=d]', k).classList.toggle('zu', dd.length > 155);
    };
    const merk = () => { if (t.value === alt.t && d.value === alt.d) vergessen('seo|' + k.dataset.s); else vormerken('seo|' + k.dataset.s, { art: 'seo', seite: k.dataset.s, titel: t.value.trim(), beschr: d.value.trim() }); zeig(); };
    t.oninput = merk; d.oninput = merk; zeig();
  });
}

/* ---------- Sprachen ---------- */
async function zeichneSprachen() {
  const R = await api('sprachen'), L = R.liste, SP = R.sprachen || [];
  $('#ansicht').innerHTML = kopf('Für alle Seiten', '<em>Sprachen.</em>', SP.length ? 'Ein Text, den Sie auf Deutsch ändern, steht in den anderen Sprachen deutsch, bis er hier übersetzt ist. Nichts wird geraten.' : 'Die Website des Ruedihus steht zurzeit auf Deutsch. Sobald weitere Sprachen dazukommen, steht hier jeder Satz, den Sie auf Deutsch ändern, mit einem Feld je Sprache.') +
    (L.length ? L.map((e, i) => `<section class="karte ue" data-i="${i}"><span class="mono">${esc(e.wo)}</span><div class="ue__de">${esc(e.de)}</div>${e.vorher_de ? `<div class="ue__vor">Vorher: ${esc(e.vorher_de)}</div>` : ''}
      ${Object.entries(e.sp).map(([sp, x]) => {
        const op = S.offen[`wort|${sp}|${e.de}`];
        return `<div class="ue__sp"><label for="ue-${i}-${sp}">${SPNAME[sp] || sp}</label><input id="ue-${i}-${sp}" type="text" data-sp="${sp}" value="${esc(op ? op.ue : x.wert)}" placeholder="${x.haus ? esc(x.haus) : 'steht deutsch, bis hier etwas steht'}">${x.haus ? '<small>Schon übersetzt (aus dem Wörterbuch der Website).</small>' : x.alt ? `<small>Bisher: ${esc(x.alt)}</small>` : ''}</div>`;
      }).join('')}</section>`).join('')
      : `<div class="leer-hinweis"><b>${SP.length ? 'Nichts zu übersetzen.' : 'Nur Deutsch, nichts zu übersetzen.'}</b>${SP.length ? 'Sobald Sie einen Text auf Deutsch ändern und speichern, steht er hier mit einem Feld je Sprache.' : 'Kommt Englisch oder Französisch dazu, läuft es so:'}</div>
      <div class="ue-weg">${[['stift', 'Auf Deutsch ändern', 'Im Schreibtisch einen Satz der Website neu schreiben und speichern.'],
        ['sprache', 'Hier übersetzen', 'Der Satz erscheint hier, mit einem Feld je Sprache der Website.'],
        ['welt', 'Gäste lesen ihn', 'Wer die Website in einer anderen Sprache öffnet, liest Ihre Übersetzung.']].map(([k, t, x], i) => `<div class="ue-weg__s" style="--i:${i}"><i>${ic(k)}</i><b>${t}</b><span>${x}</span></div>`).join('')}</div>
      <section class="karte ue ue--bsp" aria-label="Beispiel"><div class="ue-wo"><img src="/assets/img/stube-lang-s.webp" alt=""><div><small>Steht auf der Website</small><b>Essen · Restaurant</b><span>Gäste, die die Seite in einer anderen Sprache öffnen, lesen die Zeile aus dem Feld ihrer Sprache.</span></div></div><span class="mono">Beispiel · Essen · Restaurant</span><div class="ue__de">Das Restaurant ist von 11:30 bis 22:00 Uhr geöffnet.</div><div class="ue__vor">Vorher: Das Restaurant ist von 11:30 bis 21:00 Uhr geöffnet.</div>
        ${[['en', 'The restaurant is open from 11.30 am to 10 pm.'], ['fr', 'Le restaurant est ouvert de 11 h 30 à 22 h.']].map(([sp, t]) => `<div class="ue__sp"><label>${SPNAME[sp]}</label><input type="text" value="${t}" disabled tabindex="-1"></div>`).join('')}</section>`);
  $$('.ue[data-i]').forEach(k => {
    const e = L[+k.dataset.i];
    $$('input[data-sp]', k).forEach(i => i.oninput = () => {
      const sp = i.dataset.sp, key = `wort|${sp}|${e.de}`;
      if (i.value.trim() === e.sp[sp].wert) vergessen(key); else vormerken(key, { art: 'wort', sp, de: e.de, ue: i.value.trim() });
    });
  });
}

/* ---------- Entwurf & Vergleich ---------- */
function markiere(a, b) {
  const wa = String(a || '').split(/(\s+)/), wb = String(b || '').split(/(\s+)/);
  const gleich = new Set(wa);
  return wb.map(w => /\S/.test(w) && !gleich.has(w) ? `<mark>${esc(w)}</mark>` : esc(w)).join('');
}
async function zeichneEntwurf() {
  const L = (await api('aenderungen')).aenderungen;
  const seiten = [...new Set(L.map(a => a.seite).filter(Boolean))];
  const vglSeite = S.vglSeite || seiten[0] || 'index.html';
  const alle = S.ue.bereiche.flatMap(b => b.seiten);
  if (!S.bilder && L.some(a => a.art === 'bild')) S.bilder = (await api('bilder')).bilder;   // kleinste Fassung je Foto (nicht jedes hat -s)
  const zelle = (a, w) => a.art === 'bild' ? `<img src="${esc(kleinBild(w))}" data-ersatz="/assets/img/${esc(w)}-k.webp" alt="">` : '';
  $('#ansicht').innerHTML = kopf('Entwurf', 'Vorher, <em>nachher.</em>', L.length ? `${L.length} Änderung${L.length > 1 ? 'en warten' : ' wartet'}. Jede einzeln zurücknehmen, unten Seite für Seite vergleichen, dann veröffentlichen.` : 'Der Entwurf ist gleich wie die Website.',
    L.length ? `<button class="kn kn--linie" type="button" id="e-weg">Entwurf verwerfen<i>${PF}</i></button><button class="kn" type="button" id="e-raus">Veröffentlichen<i>${PF}</i></button>` : '') +
    (L.length ? L.map((a, i) => `<div class="ae"><span class="mono">${esc(a.was)}<br>${esc(a.wo)}</span>
        <div class="vor"><small>Vorher</small>${a.art === 'bild' ? zelle(a, a.vorher) : a.vorher ? `<del>${esc(a.vorher)}</del>` : '<i>leer</i>'}</div>
        <div class="nach"><small>Nachher</small>${a.art === 'bild' ? zelle(a, a.nachher) : a.nachher ? markiere(a.vorher, a.nachher) : '<i>leer</i>'}</div>
        <div class="ae__kn"><button class="link" type="button" data-z="${i}">Zurücknehmen</button>${a.seite && alle.some(s => s.datei === a.seite) ? `<button class="link" type="button" data-v="${a.seite}">Vergleichen</button>` : ''}</div></div>`).join('')
      : `<div class="leer-hinweis"><b>Nichts offen.</b>Was Sie speichern, steht hier mit vorher und nachher, bevor es auf die Website kommt. So sieht das dann aus:</div>
      <div class="ae-bsp" aria-label="Beispiel">${[   // Beispiel, solange nichts offen ist (Robert 15.10.2026: «so ein Beispiel-Case einbauen»)
        ['Text', 'Essen', 'Restaurant geöffnet 11:30 – 21:00 Uhr', 'Restaurant geöffnet 11:30 – 22:00 Uhr'],
        ['Preis', 'Essen · Schpiszettel', 'Gärschtesuppe, CHF 14.00', 'Gärschtesuppe, CHF 14.50'],
        ['Foto', 'Startseite', 'stube-rund', 'stube-kerze']].map(([was, wo, v, n]) => `<div class="ae"><span class="mono">${was}<br>${wo}</span>
          <div class="vor"><small>Vorher</small>${was === 'Foto' ? `<img src="/assets/img/${v}-s.webp" alt="">` : `<del>${v}</del>`}</div>
          <div class="nach"><small>Nachher</small>${was === 'Foto' ? `<img src="/assets/img/${n}-s.webp" alt="">` : markiere(v, n)}</div>
          <div class="ae__kn"><span class="link" aria-disabled="true">Zurücknehmen</span><span class="link" aria-disabled="true">Vergleichen</span></div></div>`).join('')}</div>`) +
    `<h2 class="zw">Seite für Seite <em>vergleichen</em></h2>
    <div class="reiter"><select class="sel" id="vgl-s" aria-label="Seite">${alle.map(s => `<option value="${s.datei}" ${s.datei === vglSeite ? 'selected' : ''}>${esc(s.name)}${seiten.includes(s.datei) ? ' · geändert' : ''}</option>`).join('')}</select>
      <span class="leise">Links die Website, wie sie jetzt ist. Rechts mit dem Entwurf. Gold umrandet: vom Haus geändert.</span></div>
    <div class="vgl2"><div>${vorschauHtml('va', 'Jetzt auf der Website')}</div><div>${vorschauHtml('vb', 'Mit dem Entwurf')}</div></div>`;
  $$('[data-z]').forEach(b => b.onclick = async () => { try { const r = await api('speichern', { ops: [{ art: 'zuruecknehmen', a: L[+b.dataset.z] }] }); await frisch(); quit('Zurückgenommen', (r.was || []).join(' · '), [], false, 5000); } catch (e) { fehler(e); } });
  $$('[data-v]').forEach(b => b.onclick = () => { S.vglSeite = b.dataset.v; zeichne(); setTimeout(() => $('.vgl2').scrollIntoView({ behavior: 'smooth' }), 80); });
  $('#vgl-s').onchange = e => { S.vglSeite = e.target.value; zeichne(); };
  if ($('#e-raus')) $('#e-raus').onclick = veroeffentlichenFenster;
  if ($('#e-weg')) $('#e-weg').onclick = () => {
    fenster(`<h2>Entwurf <em>verwerfen?</em></h2><p class="satz">Alle ${L.length} Änderungen im Entwurf gehen zurück auf den Stand der Website. Der verworfene Entwurf wird aufgehoben: «Rückgängig» in der Quittung holt ihn zurück.</p><div class="fenster__kn"><button class="link" type="button" data-zu>Behalten</button><button class="kn kn--gefahr" type="button" id="w-ja">Verwerfen<i>${PF}</i></button></div>`, true);
    $('#w-ja').onclick = async () => { fensterZu(); try { await api('verwerfen', {}); S.offen = {}; await frisch(); quit('Entwurf verworfen', 'Er ist aufgehoben.', [], false, 5000); } catch (e) { fehler(e); } };
  };
  vorschauVerbinden('va', iframeUrl('stand', vglSeite, S.sp, true));
  vorschauVerbinden('vb', iframeUrl('entwurf', vglSeite, S.sp, true));
  S.nachLaden = null;
}

/* ---------- Veröffentlichen ---------- */
async function veroeffentlichenFenster() {
  if (offenZahl()) { quit('Erst speichern', 'Es gibt Eingaben, die noch nicht gespeichert sind.', [['Jetzt speichern', speichern]], false, 6000); return; }
  const L = (await api('aenderungen')).aenderungen;
  if (!L.length) { quit('Nichts geändert, nichts veröffentlicht.', '', [], false, 4000); return; }
  fenster(`<h2>Auf die <em>Website.</em></h2><p class="satz">${L.length} Änderung${L.length > 1 ? 'en gehen' : ' geht'} auf die Website, auf allen Seiten, wo sie stehen. Vorher wird alles in einem Bauordner gesetzt und geprüft. Der jetzige Stand kommt in die früheren Fassungen.</p>
    <div style="max-height:34vh;overflow:auto">${L.map(a => `<div class="zl"><div><small>${esc(a.was)} · ${esc(a.wo)}</small><span>${a.art === 'bild' ? 'Foto ' + esc(a.nachher) : esc(a.nachher || 'entfernt')}</span></div></div>`).join('')}</div>
    <label class="feld" style="margin-top:16px"><span>Notiz für den Verlauf (freiwillig)</span><input type="text" id="r-notiz" placeholder="zum Beispiel: Ruhetage im November"></label>
    <div class="fenster__kn"><button class="link" type="button" data-zu>Noch nicht</button><button class="kn" type="button" id="r-ja">Jetzt veröffentlichen<i>${PF}</i></button></div>`);
  $('#r-ja').onclick = async () => {
    try {
      const r = await api('veroeffentlichen', { notiz: $('#r-notiz').value });
      if (!r.laeuft) { fensterZu(); quit(r.meldung || 'Nichts veröffentlicht.', '', [], false, 4000); return; }
      fortschritt(r.lauf);
    } catch (e) { fehler(e); }
  };
}
async function fortschritt(vorab) {   /* vorab: online kommt das Ergebnis gleich mit der Antwort (Probe-Fassung) */
  $('#fenster').firstElementChild.innerHTML = `<div class="lade"><div class="lade__r"></div><h2>Wird <em>veröffentlicht …</em></h2><ol class="schritte" id="r-sch"></ol></div>`;
  for (;;) {
    await new Promise(r => setTimeout(r, 700));
    let d = vorab; vorab = null;
    if (!d) try { d = await api('lauf'); } catch (e) { continue; }
    const sch = d.schritte || [];
    if ($('#r-sch')) $('#r-sch').innerHTML = sch.map((x, i) => `<li class="${i < sch.length - 1 || d.fertig ? 'fertig' : 'jetzt'}">${esc(x.t)}</li>`).join('');
    if (!d.aktiv) {
      const k = $('#fenster').firstElementChild;
      if (d.fehler) {
        k.innerHTML = `<h2>Nicht <em>veröffentlicht.</em></h2><p class="satz">${esc(d.fehler.replace(/^[A-ZÄÖÜ]+ · /, ''))}</p><p class="leise">Die Website ist unverändert. Ihr Entwurf ist noch da.</p><div class="fenster__kn"><a class="link" href="${WEG('pruefung')}#m-${esc((d.fehler.split(' · ')[0] || 'bau').toLowerCase())}" target="_blank">Was tun?</a><button class="kn" type="button" data-zu>Schliessen<i>${PF}</i></button></div>`;
      } else if (d.fertig) {
        k.innerHTML = `<h2>Ist <em>online.</em></h2><p class="satz">${d.fertig.zahl} Änderung${d.fertig.zahl > 1 ? 'en sind' : ' ist'} auf der Website, alle Seiten gesetzt, geprüft und Byte für Byte nachgeprüft.</p>
          <ol class="schritte">${(d.fertig.aenderungen || []).map(a => `<li class="fertig">${esc(a.was)} · ${esc(a.wo)}</li>`).join('')}</ol>
          <div class="fenster__kn"><a class="kn kn--linie" href="${WEG('website')}" target="_blank" rel="noopener">Website ansehen<i>${PF}</i></a><button class="kn" type="button" data-zu>Fertig<i>${PF}</i></button></div>`;
      }
      $$('[data-zu]', k).forEach(b => b.onclick = fensterZu);
      await frisch();
      return;
    }
  }
}

/* ---------- Frühere Fassungen ---------- */
async function zeichneVerlauf() {
  const L = (await api('verlauf')).verlauf;
  $('#ansicht').innerHTML = kopf('Entwurf', 'Frühere <em>Fassungen.</em>', 'Jede Veröffentlichung wird aufgehoben. Eine frühere Fassung kommt zuerst in den Entwurf: Sie sehen vorher und nachher und veröffentlichen dann.') +
    (L.length ? L.map(v => `<div class="vl"><div><b>${datum(v.zeit)}</b><span>${v.zahl} Änderung${v.zahl === 1 ? '' : 'en'}${v.notiz ? ' · ' + esc(v.notiz) : ''}</span></div><button class="kn kn--linie kn--klein" type="button" data-id="${v.id}">In den Entwurf holen<i>${PF}</i></button></div>`).join('')
      : `<div class="leer-hinweis"><b>So sieht die Liste aus.</b>In der Vorführung wird nichts veröffentlicht. Im Betrieb steht hier jede Fassung, die neueste oben, zum Beispiel:</div>
        <div class="vl-bsp" aria-label="Beispiel">${[   // Beispiel, solange nichts veröffentlicht ist (Robert 15.10.2026: «dass man versteht, was gemeint ist»)
          ['Dienstag, 4. November, 16.20 Uhr', '3 Änderungen · Ruhetage im November, Hinweis zu den Betriebsferien', 'Neueste'],
          ['Freitag, 24. Oktober, 09.05 Uhr', '1 Änderung · Foto der Chäs- und Wystube getauscht', ''],
          ['Montag, 20. Oktober, 11.40 Uhr', '5 Änderungen · Metzgete im November, Preis der Gärschtesuppe', '']].map(([z, t, m], i) => `<div class="vl"><i class="vl__z">${ic(i ? 'zurueck' : 'welt')}</i><div><b>${z}</b><span>${t}</span></div>${m ? `<em class="vl__m">${m}</em>` : ''}<span class="kn kn--linie kn--klein" aria-disabled="true">In den Entwurf holen<i>${PF}</i></span></div>`).join('')}
          <p class="leise vl-bsp__satz">Eine ältere Fassung zurückholen: Sie kommt zuerst in den Entwurf. Dort sehen Sie vorher und nachher und veröffentlichen erst, wenn alles stimmt.</p></div>`) +
    `<div class="vl vl--ursprung"><div><b>Ursprünglicher Stand</b><span>Die Website, wie Tasty Studios sie gebaut hat, ohne jede Änderung im Schreibtisch.</span></div><button class="kn kn--linie kn--klein" type="button" data-id="ursprung">In den Entwurf holen<i>${PF}</i></button></div>`;
  $$('[data-id]').forEach(b => b.onclick = async () => {
    try { const r = await api('zurueckholen', { id: b.dataset.id }); S.offen = {}; await frisch(false); gehe('entwurf'); quit('Im Entwurf', `${r.offen} Änderung${r.offen === 1 ? '' : 'en'} gegenüber der Website. Prüfen, dann veröffentlichen.`, [], false, 6000); } catch (e) { fehler(e); }
  });
}

/* ---------- Fenster ---------- */
function fenster(html, schmal = false) {
  const f = $('#fenster');
  f.innerHTML = `<div class="fenster__k${schmal ? ' schmal' : ''}" role="dialog" aria-modal="true"><button class="rund fenster__zu" type="button" data-zu aria-label="Schliessen">${ZU}</button>${html}</div>`;
  f.hidden = false;
  $$('[data-zu]', f).forEach(b => b.onclick = fensterZu);
  f.onclick = e => { if (e.target === f) fensterZu(); };
}
function fensterZu() { $('#fenster').hidden = true; $('#fenster').innerHTML = ''; }

/* ---------- Start ---------- */
(async function () {
  try {
    S.ue = await api('ueberblick');
  } catch (e) {
    $('#tuer').hidden = false;
    $('#tuer-t').textContent = String(e.message || e).replace(/^[A-ZÄÖÜ]+ · /, '');
    window.bureauMerk && window.bureauMerk('Start: ' + (e.message || e));
    return;
  }
  /* Aus La Maison / Der Stube geöffnet: immer auf der Übersicht anfangen (Robert 16.10.2026), beim Neuladen bleibt die letzte Ansicht */
  if ((/\/maison\/?(index\.html)?([?#].*)?$/.test(document.referrer) && ((performance.getEntriesByType('navigation')[0] || {}).type !== 'reload'))) try { localStorage.removeItem('bureau-ansicht'); } catch (e) { /* privat */ }
  else try { const m = JSON.parse(localStorage.getItem('bureau-ansicht') || 'null'); if (m) { S.ansicht = m.a || 'start'; S.bereich = m.b || ''; S.seite = m.s || ''; } } catch (e) { /* privat */ }
  if (S.ansicht === 'bereich' && !S.ue.bereiche.some(b => b.key === S.bereich)) S.ansicht = 'start';
  rand();
  leiste();
  zeichne();
  if (S.ue.lauf && S.ue.lauf.aktiv) { fenster('<div></div>'); fortschritt(); }
})();
