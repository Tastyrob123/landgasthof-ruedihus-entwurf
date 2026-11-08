/* Studio · Landgasthof Ruedihus. Das Werkzeug, mit dem das Haus seine Seite pflegt. Ohne Bibliothek. Aufbau nach dem Studio von Salt & Silver (07./08.10.2026). */
(() => {
'use strict';
/* Der Schreibtisch (17.10.2026): dieses frühere Studio läuft als alt.html weiter; der Schreibtisch bettet seine Ansichten ein (Listen, Karten der Website, Bilder,
   Besuche, Zugang). Eingebettet ohne Rand und Leiste; jede gespeicherte Änderung meldet es an den Schreibtisch, dann stimmen Leiste, Rand und Zahlen dort sofort. */
const EIN = new URLSearchParams(location.search).has('eingebettet') && window.parent !== window;
if (EIN) document.documentElement.classList.add('eingebettet');
const melden = () => { if (EIN) window.parent.postMessage({ bureau: 'geaendert' }, '*'); };
/* Ist Die Tafel (La Carte) angeschlossen, pflegt sie Gerichte, Preise, Rubriken und PDF der drei Karten (Notiz der Tafel 17.10.2026); in der Kartenansicht bleibt
   hier nur das Tagesmenu, damit nie zwei Werkzeuge dieselben Zeilen ändern. Der Schreibtisch öffnet die Ansicht dann mit ?tafel=1. */
const TAFEL = EIN && new URLSearchParams(location.search).has('tafel');
if (TAFEL) document.documentElement.classList.add('tafel');
// Fehler im Browser festhalten: die Kontrolle (/studio/kontrolle.html) liest sie aus, auch wenn dieses Skript danach nicht mehr läuft.
const merkeFehler = (wo, text) => { try { const k = 'rh-studio-fehler', l = JSON.parse(localStorage.getItem(k) || '[]'); l.push({ zeit: new Date().toISOString(), wo: String(wo).slice(0, 80), text: String(text).slice(0, 300) }); localStorage.setItem(k, JSON.stringify(l.slice(-20))); } catch (e) {} };
addEventListener('error', ev => merkeFehler((ev.filename || '').split('/').pop() + ':' + (ev.lineno || ''), ev.message || 'Fehler'));
addEventListener('unhandledrejection', ev => merkeFehler('Versprechen', (ev.reason && ev.reason.message) || String(ev.reason)));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const h = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let ZVB = '0 0 233 233';
const HZ = (kl = 'hz') => `<svg class="${kl}" viewBox="${ZVB}" aria-hidden="true" fill="currentColor"><use href="#zeichen"/></svg>`;
const PF = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 11 11 3M4.5 3H11v6.5"/></svg>';
const L = p => `<span class="z" aria-hidden="true"><svg viewBox="0 0 24 24">${p}</svg></span>`;
const Z = {  // Zeichen in feiner Linie, in der Farbe des Textes
  start: L('<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'),
  besuche: L('<path d="M4 20V11M10 20V5M16 20v-7M2 20h20"/>'),
  seiten: L('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'),
  zimmer: L('<path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7"/><path d="M3 15h18M6 9V6h12v3M7 18v2M17 18v2"/>'),
  karte: L('<path d="M7 3v8M5 3v4a2 2 0 0 0 4 0V3M7 11v10"/><path d="M15 3c-1.5 2-2 4-2 6a2 2 0 0 0 2 2v10M15 3c1.5 2 2 4 2 6"/>'),
  haus: L('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  anlaesse: L('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M8 14h3v3H8z"/>'),
  stellen: L('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>'),
  zahlen: L('<path d="M9 3 7 21M17 3l-2 18M3 9h18M2 15h18"/>'),
  bilder: L('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m4 17 5-5 4 4 3-3 4 4"/><circle cx="16" cy="9" r="1.6"/>'),
  hinweis: L('<path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4z"/><path d="M10 21a2 2 0 0 0 4 0"/>'),
  google: L('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.8-4.8"/>'),
  aenderungen: L('<path d="M4 7h3M4 12h3M4 17h3M10 7h10M10 12h10M10 17h10"/>'),
  verlauf: L('<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5M12 8v4l3 2"/>'),
  zugang: L('<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M15 12v2"/>'),
  kontrolle: L('<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.5 2.5L16 9.5"/>'),
  text: L('<path d="M5 6h14M12 6v13M9 19h6"/>'),
  liste: L('<path d="M5 7h2M5 12h2M5 17h2M10 7h9M10 12h9M10 17h9"/>'),
  fakt: L('<path d="M4 6h16v12H4z"/><path d="M8 10h8M8 14h5"/>'),
};
const PF2 = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 11 11 3M4.5 3H11v6.5"/></svg>';
const SYM = {
  links: '<svg viewBox="0 0 14 14"><path d="m9 2-5 5 5 5"/></svg>', rechts: '<svg viewBox="0 0 14 14"><path d="m5 2 5 5-5 5"/></svg>',
  hoch: '<svg viewBox="0 0 14 14"><path d="m2.5 9 4.5-4.5L11.5 9"/></svg>', runter: '<svg viewBox="0 0 14 14"><path d="m2.5 5 4.5 4.5L11.5 5"/></svg>',
  zu: '<svg viewBox="0 0 14 14"><path d="m3 3 8 8M11 3l-8 8"/></svg>', auge: '<svg viewBox="0 0 16 14"><path d="M1 7s2.6-4.5 7-4.5S15 7 15 7s-2.6 4.5-7 4.5S1 7 1 7Z"/><circle cx="8" cy="7" r="1.9"/></svg>',
  augezu: '<svg viewBox="0 0 16 14"><path d="M1 7s2.6-4.5 7-4.5S15 7 15 7s-2.6 4.5-7 4.5S1 7 1 7Z"/><path d="m3 1 10 12"/></svg>',
  bild: '<svg viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="10" rx="2"/><path d="m3 11 3.2-3 2.3 2 2-1.6L13 11"/></svg>',
  korb: '<svg viewBox="0 0 14 14"><path d="M2.5 4h9M5.5 4V2.5h3V4M3.5 4l.6 7.5h5.8L10.5 4"/></svg>',
  rechner: '<svg viewBox="0 0 16 14"><rect x="1.5" y="1.5" width="13" height="8.5" rx="1.4"/><path d="M5.5 12.5h5"/></svg>', handy: '<svg viewBox="0 0 14 16"><rect x="3.5" y="1.5" width="7" height="13" rx="1.6"/></svg>',
};
const NAV = [['uebersicht', 'Übersicht', 'start'], ['seiten', 'Seiten & Texte', 'seiten'], ['zimmer', 'Zimmer & Preise', 'zimmer'], ['karte', 'Karten', 'karte'], ['haus', 'Haus & Angaben', 'haus'], ['anlaesse', 'Anlässe', 'anlaesse'], ['stellen', 'Stellen & Team', 'stellen'], ['zahlen', 'Zahlen & Angebote', 'zahlen'], ['bilder', 'Bilder', 'bilder'], ['hinweis', 'Hinweis für Gäste', 'hinweis'], ['google', 'Google & Co.', 'google'], ['besuche', 'Besuche & Anfragen', 'besuche'],
  null, ['aenderungen', 'Änderungen', 'aenderungen'], ['verlauf', 'Verlauf', 'verlauf'], ['zugang', 'Zugang', 'zugang'], ['kontrolle', 'Kontrolle', 'kontrolle']];
const ARTZ = { fakt: 'fakt', text: 'text', karte: 'karte', bild: 'bilder', liste: 'liste', hinweis: 'hinweis', google: 'google' };
const sicht = $('#sicht');
let Zt = null, W = null, V = null, OFFEN = false, PROBE = false;

// ---------------------------------------------------------------- Verbindung
async function api(was, daten, roh) {
  if (!roh && daten && typeof daten === 'object' && Zt && Zt.marke && (was === 'aendern' || was === 'veroeffentlichen')) daten = { ...daten, marke: Zt.marke };
  const o = daten === undefined ? {} : { method: 'POST', headers: roh ? { 'X-Studio': '1' } : { 'X-Studio': '1', 'Content-Type': 'application/json' }, body: roh ? daten : JSON.stringify(daten) };
  let r;
  try { r = await fetch('/studio/api/' + was, o); } catch (e) { merkeFehler('api ' + was, 'keine Verbindung'); throw new Error('Keine Verbindung zum Studio. Läuft der Server? Die Kontrolle (unten links) weiss mehr.'); }
  const j = await r.json().catch(() => ({}));
  if (r.status === 401 && was !== 'status') { tor('an'); throw new Error(j.fehler || 'Bitte anmelden.'); }
  if (r.status === 409 && j.aenderungen) { Zt = j; rand(); leiste(); if (W) neuLaden({}); else zeige(true); throw new Error(j.fehler_text || 'In einem anderen Fenster wurde inzwischen etwas geändert. Bitte noch einmal.'); }
  if (!r.ok) { if (r.status >= 500) merkeFehler('api ' + was, j.fehler || r.status); throw new Error(j.fehler || 'Das hat nicht geklappt.'); }
  return j;
}
async function aendern(a) { Zt = await api('aendern', a); rand(); leiste(); melden(); return Zt; }
function sag(text, fehler) {
  $$('#meldung div').forEach(x => { if (x.textContent === text) x.remove(); });
  const d = document.createElement('div');
  d.textContent = text;
  if (fehler) d.className = 'f';
  $('#meldung').appendChild(d);
  setTimeout(() => d.remove(), fehler ? 5200 : 2600);
}
const mal = (n, eins, viele) => `${n} ${n === 1 ? eins : viele}`;
function datum(z) {
  const d = new Date(z);
  return isNaN(d) ? '' : d.toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
}
const bildadr = (k, g = 's') => k && k.startsWith('fest:') ? `/assets/img/${k.slice(5)}.webp` : `/assets/img/${k}-${g}.webp`;
const bildVon = key => { const b = Zt.bilder.find(x => x.key === key); return b ? b.adresse : bildadr(key); };

// ---------------------------------------------------------------- Tor
function tor(art) {
  $('#app').hidden = true;
  const t = $('#tor');
  t.hidden = false;
  const neu = art === 'neu';
  t.innerHTML = `<img class="tor__bild" src="/assets/img/haus-daemmerung-l.webp" alt="">
  <div class="tor__k">
    ${HZ('tor__z')}
    <h1>Ruedihus <em>Studio.</em></h1>
    <p>${neu ? 'Legen Sie ein Passwort fest. Damit kommen nur Sie an die Inhalte der Website.' : 'Hier pflegen Sie die Website: Karten, Zimmerpreise, Zeiten, Texte und Bilder.'}</p>
    <form autocomplete="off">
      <label class="feld"><span>${neu ? 'Neues Passwort' : 'Passwort'}</span><input type="password" name="p" autocomplete="${neu ? 'new-password' : 'current-password'}" required minlength="${neu ? 10 : 1}" autofocus></label>
      ${neu ? '<label class="feld"><span>Noch einmal</span><input type="password" name="p2" autocomplete="new-password" required></label>' : ''}
      <div class="fehler" role="alert"></div>
      <button class="kn kn--dunkel kn--breit" type="submit">${neu ? 'Passwort festlegen' : 'Öffnen'}<i>${PF}</i></button>
    </form>
    ${neu ? '<p class="tor__f">Mindestens 10 Zeichen. Sie können es später unter «Zugang» ändern.</p>' : ''}
    <p class="tor__f"><a href="kontrolle.html" style="text-decoration:underline;text-underline-offset:3px">Hakt etwas? Zur Kontrolle.</a></p>
  </div>`;
  const f = $('form', t), fe = $('.fehler', t);
  f.addEventListener('submit', async ev => {
    ev.preventDefault();
    fe.textContent = '';
    if (neu && f.p.value !== f.p2.value) { fe.textContent = 'Die beiden Eingaben sind nicht gleich.'; return; }
    try {
      await api(neu ? 'einrichten' : 'anmelden', { passwort: f.p.value });
      t.hidden = true;
      t.innerHTML = '';
      await laden();
    } catch (e) { fe.textContent = e.message; }
  });
}

// ---------------------------------------------------------------- Rahmen
async function laden() {
  Zt = await api('stand');
  $('#app').hidden = false;
  rand();
  leiste();
  zeige();
}
function rand() {
  const n = Zt.aenderungen.length, teil = location.hash.split('/')[1] || 'uebersicht', an = teil === 'seite' ? 'seiten' : teil;
  $('#rand').innerHTML = `<a class="rand__marke" href="#/uebersicht">${HZ()}<div><b>RUEDIHUS</b><span>Studio</span></div></a>
  <nav aria-label="Bereiche">${NAV.map(p => p ? `<a href="#/${p[0]}" class="${an === p[0] ? 'an' : ''}">${Z[p[2]]}${p[1]}${p[0] === 'aenderungen' && n ? `<b>${n}</b>` : ''}</a>` : '<div class="rand__trenn"></div>').join('')}</nav>
  <div class="rand__fuss"><a href="/live/index.html" target="_blank" rel="noopener">Website ansehen ${PF2}</a>${OFFEN || PROBE ? '' : '<button type="button" data-akt="abmelden">Abmelden</button>'}</div>`;
  const aktiv = $('#rand nav a.an');
  if (aktiv && innerWidth <= 860) aktiv.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
function kopf(titel, text, rechts = '') {
  return `<header class="kopfz"><div><h1>${titel}</h1>${text ? `<p>${text}</p>` : ''}</div><div class="kopfz__r">${rechts}</div></header>`;
}
// ---------------------------------------------------------------- Besuche & Anfragen: was Gäste auf der Website tun (Tasty Studios, 10.10.2026, Vorlage Waldhotel Doldenhorn)
// Die Website meldet Ereignisse an /api/zahlen (online im Blob-Speicher, am Rechner in _dienste/zahlen.jsonl). Keine Kekse, keine Adressen, keine Namen.
async function besucheS() {
  sicht.innerHTML = `<div class="in">${kopf('Besuche <em>& Anfragen.</em>', 'Was Gäste auf der Website tun: Besuche, Klicks auf «Buchen», gefragte Zimmer, Tischanfragen, Gutscheine der letzten 30 Tage.')}<div class="leerbild">${HZ('z')}<b>Einen Moment.</b><p>Die Zahlen werden geladen.</p></div></div>`;
  let ev;
  try { const r = await fetch('/api/zahlen', { cache: 'no-store' }); if (!r.ok) throw new Error(r.status); ev = (await r.json()).ereignisse || []; }
  catch (e) { sicht.querySelector('.in').innerHTML = kopf('Besuche <em>& Anfragen.</em>', '') + `<div class="leerbild">${HZ('z')}<b>Gerade nicht erreichbar.</b><p>Die Zahlen liegen im Speicher der Online-Fassung der Website.</p></div>`; return; }
  const n = t => ev.filter(e => e.t === t).length;
  const zaehle = (L, f) => { const m = {}; L.forEach(e => { const k = f(e); if (k) m[k] = (m[k] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
  const ZIMMER = { landhaus: 'Landhaus', hochzeitsstube: 'Hochzeitsstube', liebeslaube: 'Liebeslaube oder Hymmelrich', hymmelrich: 'Hymmelrich', 'dh-economy': 'Doldenhorn, Economy', 'dh-ambiance': 'Doldenhorn, Ambiance', 'dh-junior-suite': 'Doldenhorn, Junior Suite', 'dh-suite': 'Doldenhorn, Suite' };
  const FORM = { fest: 'Fest in der Stube', gutschein: 'Gutschein', anreise: 'Vor der Anreise' };
  let land = k => k; try { const dn = new Intl.DisplayNames(['de-CH'], { type: 'region' }); land = k => { try { return dn.of(k); } catch (e) { return k; } }; } catch (e) {}
  const liste = (titel, L, name, leer) => { const max = L.length ? L[0][1] : 1; return `<section class="zrang"><h3>${titel}</h3>${L.length ? L.slice(0, 8).map(([k, v]) => `<div class="zrang__z"><span>${h(name ? name(k) : k)}</span><i style="--w:${Math.max(4, Math.round(v / max * 100))}%"></i><b>${v}</b></div>`).join('') : `<p class="zrang__leer">${leer}</p>`}</section>`; };
  const tage = []; for (let i = 13; i >= 0; i--) tage.push(new Date(Date.now() - i * 864e5).toISOString().slice(0, 10));
  const proTag = tage.map(t => ev.filter(e => e.t === 'seite' && String(e.zeit).slice(0, 10) === t).length), maxT = Math.max(1, ...proTag);
  sicht.querySelector('.in').innerHTML = kopf('Besuche <em>& Anfragen.</em>', 'Die letzten 30 Tage. Gezählt wird ohne Kekse und ohne Adressen, Prüfläufe zählen nicht mit.') +
    `<section class="zkacheln"><div><b>${n('seite')}</b><span>Seitenaufrufe</span></div><div><b>${n('buchen')}</b><span>Klicks auf «Buchen» und «Tisch»</span></div><div><b>${n('finder')}</b><span>Zimmer-Suchen mit Preis</span></div><div><b>${n('tisch') + n('formular')}</b><span>Anfragen und Gutscheine</span></div></section>
    <section class="zrang"><h3>Seitenaufrufe, die letzten 14 Tage</h3><div class="ztage">${proTag.map((v, i) => `<div title="${v}"><i style="--h:${Math.max(2, Math.round(v / maxT * 100))}%"></i><span>${new Date(tage[i]).getDate()}.</span></div>`).join('')}</div></section>
    <div class="zrang-raster">
    ${liste('Gefragte Zimmer', zaehle(ev.filter(e => (e.t === 'zimmer' || e.t === 'finder') && e.z), e => e.z), k => ZIMMER[k] || k, 'Noch kein Zimmer über die Suche gewählt.')}
    ${liste('Tischanfragen nach Stube', zaehle(ev.filter(e => e.t === 'tisch'), e => e.p), null, 'Noch keine Tischanfrage.')}
    ${liste('Anfragen und Gutscheine', zaehle(ev.filter(e => e.t === 'formular'), e => e.f), k => FORM[k] || k, 'Noch keine Anfrage über die Website.')}
    ${liste('Länder', zaehle(ev.filter(e => e.t === 'seite'), e => e.l), land, 'Noch kein Land erkannt.')}
    ${liste('Meistbesuchte Seiten', zaehle(ev.filter(e => e.t === 'seite'), e => e.s), null, 'Noch keine Besuche.')}
    </div>`;
}
const SICHTEN = { besuche: besucheS, uebersicht, seiten, seite, karte, haus, bilder, aenderungen: aenderungenS, verlauf, zugang, hinweis: hinweisS, google: googleS, kontrolle: kontrolleS,
  zimmer: () => listenAnsicht('zimmer'), anlaesse: () => listenAnsicht('anlaesse'), stellen: () => listenAnsicht('stellen'), zahlen: () => listenAnsicht('zahlen') };
let hier = location.hash;
function zeige(halte) {
  if (!Zt) return;
  const [, name = 'uebersicht', arg] = location.hash.split('/');
  W = null;
  offen = null;
  hier = location.hash;
  if (halte !== true) sicht.scrollTop = 0;
  let a;
  try { a = arg ? decodeURIComponent(arg) : undefined; } catch (e) { a = undefined; }
  try { (SICHTEN[name] || uebersicht)(a); } catch (e) { merkeFehler('Ansicht ' + name, e.message); kaputt(e); }
  const nav = NAV.find(p => p && p[0] === (name === 'seite' ? 'seiten' : name));
  document.title = (nav ? nav[1] + ' · ' : '') + 'Studio · Landgasthof Ruedihus';
  rand();
}
addEventListener('hashchange', () => {
  if (offen && offen() && location.hash !== hier) {
    const ziel = location.hash;
    history.replaceState(null, '', hier || '#/uebersicht');
    frage('Noch nicht <em>gespeichert.</em>', 'Sie haben Angaben geändert und noch nicht auf «Speichern» gedrückt. Wenn Sie weitergehen, gehen sie verloren.', 'Ohne Speichern weiter', async () => { offen = null; location.hash = ziel; });
    return;
  }
  if (!Zt) return;
  zeige();
  leiste();
});

// ---------------------------------------------------------------- Entwurfsleiste, Liste, Quittung
const HAKEN = '<svg viewBox="0 0 16 16"><path d="m3.5 8.5 3 3 6-7"/></svg>';
let letzteZahl = null, BLITZ = null, offen = null;
function vor(z) {
  const m = Math.round((Date.now() - new Date(z)) / 60000);
  return isNaN(m) ? '' : m < 1 ? 'gerade eben' : m < 60 ? `vor ${m} Min.` : m < 1440 ? `vor ${Math.round(m / 60)} Std.` : datum(z);
}
const nachZeit = () => [...Zt.aenderungen].sort((a, b) => (b.zeit || '').localeCompare(a.zeit || ''));
function leiste() {
  const el = $('#leiste'), n = Zt.aenderungen.length, neueste = nachZeit()[0], zuletzt = Zt.verlauf.find(v => !v.anfang);
  el.classList.toggle('offen', n > 0);
  el.innerHTML = n ? `<button class="leiste__l" type="button" data-akt="lade" aria-label="Liste der Änderungen zeigen"><i class="leiste__z">${n}</i><span><b>${n === 1 ? 'Änderung' : 'Änderungen'} im Entwurf</b><small>Zuletzt: ${h(neueste.satz)}${neueste.zeit ? ' · ' + vor(neueste.zeit) : ''}</small></span></button>
    <div class="leiste__r"><button class="kn kn--klein kn--linie" type="button" data-akt="lade">Liste zeigen</button><a class="kn kn--klein kn--linie" href="/entwurf/${W ? encodeURIComponent(W.datei) : 'index.html'}" target="_blank" rel="noopener">Entwurf ansehen</a><button class="kn kn--klein" type="button" data-akt="raus">Veröffentlichen<i>${PF}</i></button></div>`
    : `<div class="leiste__l"><i class="leiste__z ok">${HAKEN}</i><span><b>Alles veröffentlicht</b><small>${zuletzt ? 'Stand vom ' + datum(zuletzt.zeit) : 'Die Website zeigt den neuesten Stand.'}</small></span></div>
    <div class="leiste__r"><a class="kn kn--klein kn--linie" href="/live/index.html" target="_blank" rel="noopener">Website ansehen</a></div>`;
  if (letzteZahl !== null && letzteZahl !== n && n) $('.leiste__z', el).classList.add('hupf');
  letzteZahl = n;
  if (!$('#lade').hidden) lade();
}
function kurzdiff(c) {
  if (c.art === 'bild') return `<span class="mini"><img src="${h(c.vorher)}" alt=""><i>→</i><img src="${h(c.nachher)}" alt=""></span>`;
  if (c.art === 'karte' || c.art === 'liste') return c.punkte.slice(0, 4).map(p => `<span class="zl"><b>${h(p.name)}</b> ${h(p.text)}</span>`).join('') + (c.punkte.length > 4 ? `<span class="zl">und ${c.punkte.length - 4} weitere</span>` : '');
  if (c.art === 'google') return c.teile.slice(0, 4).map(t => `<span class="zl">${h(t.feld)}: ${t.vorher ? `<s>${h(t.vorher)}</s> → ` : ''}<b>${h(t.nachher)}</b></span>`).join('');
  return `<span class="zl"><s>${h(c.vorher) || 'leer'}</s> → <b>${h(c.nachher) || 'leer'}</b></span>`;
}
function lade() {
  const l = $('#lade'), cs = nachZeit();
  l.hidden = false;
  l.innerHTML = `<div class="lade__k" role="dialog" aria-label="Ihr Entwurf"><header><div><h2>Ihr <em>Entwurf.</em></h2><p>${cs.length ? 'Gespeichert, aber noch nicht auf der Website. Erst «Veröffentlichen» macht es für Gäste sichtbar.' : 'Nichts offen. Alles steht auf der Website.'}</p></div>
      <button class="rund" type="button" data-akt="ladezu" aria-label="Schliessen">${SYM.zu}</button></header>
    <ol class="lade__l">${cs.map(c => `<li data-id="${h(c.id)}"><span class="lade__z">${Z[ARTZ[c.art] || 'text']}</span><div><b>${h(c.titel)}</b><small>${h(c.ort || '')}${c.zeit ? ' · ' + vor(c.zeit) : ''}</small><p>${kurzdiff(c)}</p>
      <div class="lade__a">${c.stellen.length ? '<button class="link" type="button" data-akt="sehen">Auf der Seite ansehen</button>' : ''}<button class="link" type="button" data-akt="weg">Zurücknehmen</button></div></div></li>`).join('')}</ol>
    ${cs.length ? `<footer><button class="link" type="button" data-akt="alles">Alles zurücknehmen</button><button class="kn kn--klein" type="button" data-akt="raus">Veröffentlichen<i>${PF}</i></button></footer>` : ''}</div>`;
}
function ladeZu() { const l = $('#lade'); l.hidden = true; l.innerHTML = ''; }
async function aktAenderung(akt, id, seiteD) {
  const c = Zt.aenderungen.find(x => x.id === id), n = Zt.aenderungen.length;
  try {
    if (akt === 'sehen' && c) { ladeZu(); vergleich(c, seiteD); }
    else if (akt === 'weg' && c) { await aendern({ art: 'verwerfen', id: c.id }); sag('Zurückgenommen: ' + c.titel); neuZeichnen(); }
    else if (akt === 'alles') frage('Alles <em>zurücknehmen?</em>', `${mal(n, 'Änderung geht', 'Änderungen gehen')} verloren. Die Website bleibt, wie sie ist.`, 'Alles zurücknehmen', async () => { await aendern({ art: 'verwerfen', id: 'alles' }); sag('Der Entwurf ist leer.'); neuZeichnen(); });
    else if (akt === 'raus') { ladeZu(); veroeffentlichen(); }
  } catch (e) { sag(e.message, true); }
}
function quittung(titel, text, o = {}) {
  const m = $('#meldung');
  $$('.quitt', m).forEach(x => x.remove());
  const d = document.createElement('div'), c = o.id && Zt.aenderungen.find(x => x.id === o.id);
  d.className = 'quitt';
  d.setAttribute('role', 'status');
  d.innerHTML = `<i>${HAKEN}</i><div><b>${h(titel)}</b>${text ? `<span>${h(text)}</span>` : ''}<small>Im Entwurf gespeichert. Auf der Website erst nach dem Veröffentlichen.</small>
    <div class="quitt__a">${c && c.stellen.length ? '<button type="button" data-q="sehen">Vorher/Nachher ansehen</button>' : ''}${o.zurueck ? '<button type="button" data-q="zurueck">Rückgängig</button>' : ''}</div></div>
    <button class="quitt__zu" type="button" data-q="zu" aria-label="Schliessen">${SYM.zu}</button>`;
  d.addEventListener('click', async ev => {
    const b = ev.target.closest('[data-q]');
    if (!b) return;
    d.remove();
    if (b.dataset.q === 'sehen') { const x = Zt.aenderungen.find(y => y.id === o.id); if (x) vergleich(x, o.seite); }
    if (b.dataset.q === 'zurueck') { try { await aendern(o.zurueck); sag('Rückgängig gemacht.'); neuZeichnen(); } catch (e) { sag(e.message, true); } }
  });
  m.appendChild(d);
  setTimeout(() => d.remove(), 10000);
}
async function tun(a, q) {
  try { await aendern(a); if (q) quittung(q.titel, q.text, q); return true; } catch (e) { sag(e.message, true); return false; }
}
function neuZeichnen() {
  if (W) return neuLaden({});
  const y = sicht.scrollTop;
  zeige(true);
  sicht.scrollTop = y;
}
const chipsH = (name, opt, wert) => `<div class="chips" data-chips="${name}">${opt.map(([v, t]) => `<button type="button" data-v="${h(v)}" class="${String(v) === String(wert) ? 'an' : ''}">${h(t)}</button>`).join('')}</div>`;
const schalter = (id, an, text) => `<label class="schalter"><input type="checkbox" id="${id}"${an ? ' checked' : ''}><i></i><span>${text}</span></label>`;
document.addEventListener('click', ev => {
  const c = ev.target.closest('.chips button');
  if (!c) return;
  $$('button', c.parentNode).forEach(x => x.classList.toggle('an', x === c));
  c.parentNode.dispatchEvent(new CustomEvent('wahl', { bubbles: true, detail: { name: c.parentNode.dataset.chips, wert: c.dataset.v } }));
});

// ---------------------------------------------------------------- Übersicht
function uebersicht() {
  const n = Zt.aenderungen.length, st = new Date().getHours(), cs = nachZeit();
  const tuer = (akt, z, titel, text) => `<button class="tuer" type="button" data-los="${akt}">${Z[z]}<b>${titel}</b><span>${text}</span><i>${PF2}</i></button>`;
  const zi = (Zt.listen.zimmer || { liste: [] }).liste, f = Zt.felder, fw = p => h((f[p] || {}).wert || '');
  sicht.innerHTML = `<div class="in">${kopf(st < 11 ? 'Guten <em>Morgen.</em>' : st < 18 ? 'Guten <em>Tag.</em>' : 'Guten <em>Abend.</em>', 'Suchen Sie sich aus, was Sie tun möchten. Alles wird zuerst im Entwurf gespeichert. Unten sehen Sie jederzeit, was offen ist, und stellen es mit einem Knopf auf die Website.')}
  ${Zt.fehler || !Zt.seiten.length ? `<p class="hinweis" style="margin-bottom:14px"><b>Der Entwurf lässt sich gerade nicht bauen.</b> ${h(Zt.fehler || 'Das Verzeichnis der Seiten fehlt.')} <a href="#/kontrolle" style="text-decoration:underline;text-underline-offset:3px">Zur Kontrolle</a>, dort steht, woran es liegt und was hilft.</p>` : ''}
  <h2 class="zw" style="margin-top:0">Was möchten Sie tun?</h2>
  <div class="raster r-3">
    ${tuer('zimmer', 'zimmer', 'Zimmerpreis ändern', 'Preis, Belegung, Satz oder Fotos eines Zimmers. Einmal ändern, auf jeder Seite richtig.')}
    ${tuer('karte', 'karte', 'Preis oder Gericht ändern', 'Eine der drei Karten öffnen, Zeile wählen, bearbeiten.')}
    ${tuer('gericht', 'karte', 'Gericht hinzufügen', 'Neues Gericht in eine Rubrik des Schpiszettels, der Schpis Charte oder der Tagesteller.')}
    ${tuer('haus', 'haus', 'Öffnungszeit ändern', 'Zeiten, Adresse, Telefon, E-Mail und Buchungslink an einer Stelle.')}
    ${tuer('seiten', 'seiten', 'Text oder Überschrift ändern', 'Seite öffnen, auf den Text klicken, schreiben.')}
    ${tuer('bilder', 'bilder', 'Bild tauschen', 'Ein Foto ersetzen, überall wo es zu sehen ist. Auch das Startbild.')}
    ${tuer('anlaesse', 'anlaesse', 'Anlass eintragen', 'Metzgete, Stubete, Ruedi-Tag: Datum, Text und Menü für «Durchs Jahr».')}
    ${tuer('hinweis', 'hinweis', 'Hinweis für Gäste', 'Betriebsferien oder Feiertage, unten auf jeder Seite, zeitlich begrenzt.')}
    ${tuer('stellen', 'stellen', 'Stelle ausschreiben', 'Offene Stellen auf der Seite «Das Haus».')}
  </div>
  ${n ? `<h2 class="zw">Im Entwurf<span>${String(n).padStart(2, '0')}</span></h2><section class="blatt offenes">${cs.slice(0, 4).map(c => `<div class="offenes__z" data-id="${h(c.id)}"><span class="lade__z">${Z[ARTZ[c.art] || 'text']}</span><div><b>${h(c.satz)}</b><small>${h(c.ort || '')}${c.zeit ? ' · ' + vor(c.zeit) : ''}</small></div>
      ${c.stellen.length ? '<button class="kn kn--klein kn--linie" type="button" data-akt="sehen">Ansehen</button>' : ''}</div>`).join('')}
      <div class="offenes__f"><button class="link" type="button" data-akt="lade">${n > 4 ? `Alle ${n} zeigen` : 'Liste öffnen'}</button><button class="kn kn--klein" type="button" data-akt="raus">Veröffentlichen<i>${PF}</i></button></div></section>` : ''}
  <h2 class="zw">Das Haus</h2>
  <a class="hk" href="#/haus"><span class="hk__b"><img src="/assets/img/haus-sommer-s.webp" alt="" loading="lazy"></span>
    <span class="hk__t"><b>Landgasthof Ruedihus</b><dl><div><dt>Restaurant</dt><dd>${fw('haus.zeiten') || '–'}</dd></div><div><dt>Adresse</dt><dd>${fw('haus.strasse')}${fw('haus.strasse') && fw('haus.ort') ? ', ' : ''}${fw('haus.ort') || (fw('haus.strasse') ? '' : '–')}</dd></div><div><dt>Zimmer</dt><dd>${zi.map(z => h(z.name)).join(', ') || '–'}</dd></div></dl><i>Angaben ändern</i></span></a></div>`;
  sicht.querySelector('.in').addEventListener('click', ev => {
    const t = ev.target.closest('[data-los]'), s = ev.target.closest('[data-akt="sehen"]');
    if (s) return aktAenderung('sehen', s.closest('[data-id]').dataset.id);
    if (!t) return;
    const los = t.dataset.los;
    if (los === 'gericht') gerichtFenster({ karte: 'k1' });
    else location.hash = '#/' + los;
  });
}

// ---------------------------------------------------------------- Seiten
function seiten() {
  const gruppen = [...new Set(Zt.seiten.map(s => s.gruppe))];
  sicht.innerHTML = `<div class="in">${kopf('Seiten <em>& Texte.</em>', 'Suchen Sie sich eine Seite aus. Sie öffnet sich so, wie Gäste sie sehen. Ein Klick auf einen Text oder ein Bild, und Sie können es ändern.')}
  ${gruppen.map(g => `<h2 class="zw">${g}<span>${String(Zt.seiten.filter(s => s.gruppe === g).length).padStart(2, '0')}</span></h2><div class="raster r-4">${Zt.seiten.filter(s => s.gruppe === g).map(s =>
    `<a class="sk" href="#/seite/${encodeURIComponent(s.datei)}"><span class="sk__b">${s.bild ? `<img src="${bildVon(s.bild)}" alt="" loading="lazy">` : ''}</span><span class="sk__t"><b>${h(s.name)}</b><span>${mal(s.texte, 'Text', 'Texte')} · ${mal(s.bilder, 'Bild', 'Bilder')}</span></span></a>`).join('')}</div>`).join('')}</div>`;
}

// ---------------------------------------------------------------- Seite bearbeiten
const RSTIL = `.studio-hov,.studio-an{position:absolute;z-index:2147483000;pointer-events:none;border-radius:5px;display:none;box-sizing:border-box}
.studio-hov{outline:calc(1.5px*var(--studio-k,1)) dashed #c42e13;outline-offset:calc(4px*var(--studio-k,1))}
.studio-hov::before{content:attr(data-w);position:absolute;left:-4px;bottom:calc(100% + 9px*var(--studio-k,1));background:#c42e13;color:#fff;font:500 10px/1 'DM Mono',ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;padding:6px 8px;border-radius:5px;white-space:nowrap;transform:scale(var(--studio-k,1));transform-origin:0 100%}
.studio-hov[data-w=""]::before{display:none}
.studio-an{outline:calc(2px*var(--studio-k,1)) solid #c42e13;outline-offset:calc(4px*var(--studio-k,1));background:rgba(196,46,19,.07)}
.studio-werk [data-e]{cursor:text;pointer-events:auto!important}.studio-werk img[data-b]{cursor:pointer;pointer-events:auto!important}.studio-werk .lupe{display:none!important}`;  // auch Stellen in Schildern, die die Seite selbst nicht anklickbar macht (Namensschild in der Bildecke)
function richte(d, werk) {
  if (!d.getElementById('studio-stil')) {
    const s = d.createElement('style');
    s.id = 'studio-stil';
    s.textContent = RSTIL;
    d.head.appendChild(s);
  }
  if (werk) d.documentElement.classList.add('studio-werk');
  const k = c => { const b = d.createElement('div'); b.className = c; d.body.appendChild(b); return b; };
  return { hov: k('studio-hov'), an: k('studio-an') };
}
function rahme(box, el, wort) {
  if (!box) return;
  const r = el && el.isConnected ? el.getBoundingClientRect() : null;
  if (!r || (!r.width && !r.height)) { box.style.display = 'none'; return false; }
  const d = el.ownerDocument, w = d.defaultView, wirt = el.closest('dialog') || d.body;
  if (box.parentNode !== wirt) wirt.appendChild(box);
  let x = r.left + w.scrollX, y = r.top + w.scrollY;
  if (wirt !== d.body) { const wr = wirt.getBoundingClientRect(); x = r.left - wr.left + wirt.scrollLeft - wirt.clientLeft; y = r.top - wr.top + wirt.scrollTop - wirt.clientTop; }
  Object.assign(box.style, { display: 'block', left: x + 'px', top: y + 'px', width: r.width + 'px', height: r.height + 'px' });
  box.dataset.w = wort || '';
  return true;
}
function passe(fr, wirt, soll) {
  const tu = () => {
    if (wirt.classList.contains('handy')) { fr.style.cssText = ''; try { fr.contentDocument.documentElement.style.setProperty('--studio-k', '1'); } catch (e) {} return; }
    const w = wirt.clientWidth, hoch = wirt.clientHeight;
    if (!w) return;
    const k = Math.min(1, w / soll);
    fr.style.cssText = `position:absolute;left:0;top:0;width:${k < 1 ? soll : w}px;height:${hoch / k}px;transform-origin:0 0;transform:${k < 1 ? `scale(${k})` : 'none'}`;
    try { fr.contentDocument.documentElement.style.setProperty('--studio-k', (1 / k).toFixed(3)); } catch (e) {}
  };
  fr.addEventListener('load', tu);
  new ResizeObserver(tu).observe(wirt);
  tu();
  return tu;
}
function zeig(el) {
  for (let p = el.parentElement; p; p = p.parentElement) {
    if (p.getAttribute('role') === 'tabpanel' && p.hidden) {
      const d = p.ownerDocument;
      $$('[role="tabpanel"]', p.parentElement).forEach(c => { c.hidden = c !== p; });
      $$('[aria-controls]', d).forEach(t => { if (t.getAttribute('role') === 'tab') t.setAttribute('aria-selected', t.getAttribute('aria-controls') === p.id ? 'true' : 'false'); });
    } else if (p.hidden) p.hidden = false;
    if (p.tagName === 'DIALOG' && !p.open) { try { p.showModal(); } catch (e) { p.setAttribute('open', ''); } }
    if (p.tagName === 'DETAILS') p.open = true;
  }
}
function tabWechsel(btn) {
  const d = btn.ownerDocument, wurzel = btn.closest('[role="tablist"]'), id = btn.getAttribute('aria-controls');
  if (!wurzel || !id) return;
  $$('[role="tab"]', wurzel).forEach(x => { x.setAttribute('aria-selected', x === btn ? 'true' : 'false'); const f = d.getElementById(x.getAttribute('aria-controls')); if (f) f.hidden = x !== btn; });
}
function ziel(d, x, y) {
  const els = d.elementsFromPoint(x, y).filter(e => !/^studio-/.test(e.className));
  if (!els.length) return null;
  let t = els[0].closest('[data-e]') || els.slice(0, 5).find(e => e.matches('[data-e]'));
  const b = els.find(e => e.matches('img[data-b]'));
  if (!t && b) return { art: 'bild', el: b, wort: b.dataset.b.startsWith('fest:') ? 'Festes Bild tauschen' : 'Bild tauschen' };
  if (!t) return null;
  return zielVon(t);
}
function zielVon(el) {
  const q = (el.dataset.q || '').split(' ').filter(Boolean), rein = el.hasAttribute('data-rein');
  if (rein && q[0].startsWith('k:')) return { art: 'gericht', el, q, wort: 'Auf der Karte ändern' };
  if (rein && q[0].startsWith('l:')) return { art: 'liste', el, q, wort: WORTE[q[0].split(':')[1]] ? WORTE[q[0].split(':')[1]] + ' bearbeiten' : 'Eintrag bearbeiten' };
  if (rein && q[0].startsWith('hinweis.')) return { art: 'hinweis', el, q, wort: 'Hinweis bearbeiten' };
  if (rein) return { art: 'angabe', el, q, wort: 'Angabe ändern' };
  return { art: 'text', el, q, wort: 'Text ändern' };
}
function seite(datei) {
  const s = Zt.seiten.find(x => x.datei === datei) || Zt.seiten[0];
  if (!s) return kaputt();
  const gruppen = [...new Set(Zt.seiten.map(x => x.gruppe))];
  sicht.innerHTML = `<div class="werk">
    <div class="werk__leiste">
      <a class="rund" href="#/seiten" title="Zurück zu den Seiten" aria-label="Zurück zu den Seiten">${SYM.links}</a>
      <select id="w-seite" aria-label="Seite">${gruppen.map(g => `<optgroup label="${g}">${Zt.seiten.filter(x => x.gruppe === g).map(x => `<option value="${h(x.datei)}"${x.datei === s.datei ? ' selected' : ''}>${h(x.name)}</option>`).join('')}</optgroup>`).join('')}</select>
      <button class="rund an" type="button" data-akt="geraet" data-g="rechner" title="Wie am Rechner" aria-label="Wie am Rechner">${SYM.rechner}</button>
      <button class="rund" type="button" data-akt="geraet" data-g="handy" title="Wie am Handy" aria-label="Wie am Handy">${SYM.handy}</button>
      <span class="werk__hin">Klicken Sie in der Seite auf einen Text oder ein Bild. Rechts ändern Sie es und bestätigen mit «Übernehmen».</span>
    </div>
    <div class="werk__buehne" id="w-buehne"><iframe id="w-rahmen" title="${h(s.name)}" src="/entwurf/${encodeURIComponent(s.datei)}?nomotion"></iframe></div>
    <aside class="pruef" id="w-pruef" aria-live="polite"></aside>
  </div>`;
  W = { datei: s.datei, fr: $('#w-rahmen'), sel: null, y: 0, wieder: null };
  W.passe = passe(W.fr, $('#w-buehne'), 1200);
  W.fr.addEventListener('load', werkBereit);
  $('#w-seite').addEventListener('change', ev => { location.hash = '#/seite/' + encodeURIComponent(ev.target.value); });
  pruefLeer();
}
function werkBereit() {
  if (!W) return;
  const d = W.fr.contentDocument;
  if (!d || !d.body) return;
  const w = d.defaultView;
  Object.assign(W, richte(d, true), { sel: null });
  d.addEventListener('mousemove', ev => { const t = ziel(d, ev.clientX, ev.clientY); rahme(W.hov, t && (!W.sel || t.el !== W.sel.el) ? t.el : null, t && t.wort); }, true);
  d.documentElement.addEventListener('mouseleave', () => W && rahme(W.hov, null));
  d.addEventListener('click', ev => {
    if (ev.target.closest && ev.target.closest('a[href]')) ev.preventDefault();
    const t = ziel(d, ev.clientX, ev.clientY);
    if (!t) return;
    ev.preventDefault();
    ev.stopPropagation();  // die Seite selbst reagiert nicht (Lupe, Buchung, Galerie): hier wird geändert, nicht bedient
    const tab = t.el.closest && t.el.closest('[role="tab"]');
    if (tab) tabWechsel(tab);
    waehle(t);
  }, true);
  d.addEventListener('submit', ev => ev.preventDefault(), true);
  const nach = () => { if (W && W.sel) rahme(W.an, W.sel.el); };
  w.addEventListener('scroll', nach, { passive: true, capture: true });
  w.addEventListener('resize', nach);
  if (W.wieder) {
    const m = W.wieder, el = m.q ? d.querySelector(`[data-q="${m.q}"]`) : m.b ? d.querySelector(`img[data-b="${m.b}"][data-bn="${m.n}"]`) : d.querySelector(`[data-e="${m.e}"][data-en="${m.n}"]`);
    W.wieder = null;
    if (el) {
      zeig(el);
      el.scrollIntoView({ block: 'center', inline: 'center' });
      setTimeout(() => { if (W && el.isConnected) waehle(el.matches('img') ? { art: 'bild', el } : zielVon(el)); }, 150);
      return;
    }
    w.scrollTo(0, W.y);
  }
  pruefLeer();
}
function neuLaden(merk) {
  if (!W) return;
  const w = W.fr.contentWindow;
  W.y = w.scrollY;
  W.wieder = merk || {};
  w.location.reload();
}
function pruefLeer() {
  if (!W) return;
  W.sel = null;
  rahme(W.an, null);
  const hierC = Zt.aenderungen.filter(c => c.stellen.some(x => x.seite === W.datei));
  let versteckt = '';
  try {
    const d = W.fr.contentDocument;
    if (d && d.querySelector('dialog.buchen')) versteckt = `<div class="pruef__wo"><h3>Verborgene Stellen</h3><button type="button" data-zeig="dialog.buchen">Fenster «Zimmer buchen / Tisch reservieren» öffnen</button></div>`;
  } catch (e) {}
  $('#w-pruef').innerHTML = `<div class="pruef__leer">${HZ('z')}<b>Klicken Sie in die Seite.</b><p>Alles, was rot umrandet wird, können Sie ändern.</p>
    <ul><li><b>Text</b>Überschriften, Absätze, Knöpfe</li><li><b>Bild</b>Foto tauschen, auch das Startbild</li><li><b>Angabe</b>Öffnungszeit, Adresse, Preise, Zimmer, Anlässe</li></ul></div>
    ${versteckt}
    ${hierC.length ? `<div class="pruef__offen"><h3>Auf dieser Seite im Entwurf</h3>${hierC.slice(0, 6).map(c => `<button type="button" data-id="${h(c.id)}"><b>${h(c.satz)}</b><small>Vorher/Nachher ansehen</small></button>`).join('')}</div>` : ''}`;
  $$('.pruef__offen button').forEach(b => b.addEventListener('click', () => aktAenderung('sehen', b.dataset.id, W.datei)));
  $$('[data-zeig]').forEach(b => b.addEventListener('click', () => { try { const d = W.fr.contentDocument, el = d.querySelector(b.dataset.zeig); if (el && !el.open) el.showModal(); el.scrollIntoView({ block: 'center' }); } catch (e) {} }));
}
function waehle(t) {
  if (W.sel && W.sel.orig !== undefined && W.sel.el.isConnected && !W.sel.fertig) spiegel(W.sel, W.sel.orig);
  W.sel = t;
  rahme(W.hov, null);
  rahme(W.an, t.el);
  ({ text: pruefText, angabe: pruefAngabe, gericht: pruefGericht, bild: pruefBild, liste: t => { const [, key, i] = t.q[0].split(':'); pruefLeer(); listeFenster(key, +i); }, hinweis: () => { location.hash = '#/hinweis'; } })[t.art](t);
}
const woSteht = (n, s) => n > 1 ? `Steht an <b>${n} Stellen</b>${s > 1 ? ` auf <b>${s} Seiten</b>` : ''}.` : '';
function spiegel(t, html) {
  const d = t.el.ownerDocument, alle = t.ueberall ? $$(`[data-e="${t.el.dataset.e}"]:not([data-rein])`, d) : [t.el];
  alle.forEach(e => { e.innerHTML = html; });
  $$(`[data-spiegel] [data-e="${t.el.dataset.e}"][data-en="${t.el.dataset.en}"]`, d).forEach(e => { e.innerHTML = html; });  // unsichtbare Kopien (Schatten, Laufband) folgen sofort mit
  rahme(W.an, t.el);
}
function rein(html) {
  return html.replace(/<div[^>]*>|<p[^>]*>/gi, '<br>').replace(/<\/(div|p)>/gi, '').replace(/\r?\n/g, '<br>').replace(/^(<br>)+/, '').replace(/&nbsp;/g, ' ');
}
function pruefText(t) {
  const el = t.el, hs = el.dataset.e, n = +el.dataset.en, lauf = el.hasAttribute('data-lauf'), m = Zt.mehrfach[hs];
  const tag = el.closest('h1,h2,h3,h4,.d1,.d2,.d3') ? 'Überschrift' : el.closest('a,button') ? 'Knopf oder Link' : 'Text';
  const link = el.closest('a[href]'), intern = link && /^[\w\-]+\.html/.test(link.getAttribute('href') || '') ? link.getAttribute('href').split('#')[0] : null;
  t.orig = el.innerHTML;
  t.ueberall = !!m;
  const angaben = t.q.filter(q => !q.startsWith('k:') && !q.startsWith('l:')).map(q => Zt.felder[q]).filter(Boolean);
  const listen = t.q.filter(q => q.startsWith('l:')).map(q => Zt.listen[q.split(':')[1]]).filter(Boolean);
  $('#w-pruef').innerHTML = `<h2>${tag}</h2>
    <div class="schreib" id="w-schreib" contenteditable="true" spellcheck="true" role="textbox" aria-multiline="true" aria-label="${tag}"></div>
    ${m ? `<div><div class="wahl2" role="group" aria-label="Wo ändern"><button type="button" class="an" data-wo="1">Überall</button><button type="button" data-wo="0">Nur an dieser Stelle</button></div>
      <p class="hinweis" style="margin-top:10px" id="w-wo">${woSteht(m[0], m[1])} Sie ändern alle auf einmal.</p></div>` : ''}
    ${angaben.length ? `<p class="hinweis">In diesem Satz steht eine Angabe, die an vielen Stellen gleich ist: <b>${angaben.map(a => h(a.label)).join(', ')}</b>. Ändern Sie sie besser unter «Haus & Angaben». Schreiben Sie den Satz hier um, folgt er ihr nicht mehr von selbst.</p>` : ''}
    ${listen.length ? `<p class="hinweis">In diesem Satz steht ein Eintrag aus <b>${listen.map(a => h(a.label)).join(', ')}</b>. Ändern Sie ihn besser dort, sonst folgt der Satz der Liste nicht mehr.</p>` : ''}
    <div class="pruef__kn"><button class="kn kn--dunkel kn--breit" type="button" id="w-ok">Übernehmen<i>${PF}</i></button>
      <button class="link" type="button" id="w-ab" style="justify-self:center">Abbrechen</button>
      ${el.hasAttribute('data-neu') ? '<button class="link" type="button" id="w-ur" style="justify-self:center">Ursprünglichen Text zurückholen</button>' : ''}
      ${intern && Zt.seiten.some(s => s.datei === intern) ? `<a class="link" href="#/seite/${encodeURIComponent(intern)}" style="justify-self:center">Zur verlinkten Seite wechseln</a>` : ''}</div>`;
  const box = $('#w-schreib');
  box.innerHTML = t.orig.replace(/\s*\n\s*/g, ' ');
  const anfang = rein(box.innerHTML);
  offen = () => box.isConnected && !t.fertig && rein(box.innerHTML) !== anfang;
  box.addEventListener('input', () => spiegel(t, rein(box.innerHTML)));
  box.addEventListener('keydown', ev => {
    if (ev.key === 'Enter') { ev.preventDefault(); if (!lauf && !ev.metaKey && !ev.ctrlKey) document.execCommand('insertLineBreak'); else if (ev.metaKey || ev.ctrlKey) $('#w-ok').click(); }
  });
  box.addEventListener('paste', ev => { ev.preventDefault(); document.execCommand('insertText', false, (ev.clipboardData || window.clipboardData).getData('text/plain')); });
  $$('.wahl2 button').forEach(b => b.addEventListener('click', () => {
    spiegel(t, t.orig);
    t.ueberall = b.dataset.wo === '1';
    $$('.wahl2 button').forEach(x => x.classList.toggle('an', x === b));
    $('#w-wo').innerHTML = t.ueberall ? `${woSteht(m[0], m[1])} Sie ändern alle auf einmal.` : 'Nur diese eine Stelle ändert sich. Alle anderen bleiben, wie sie sind.';
    spiegel(t, rein(box.innerHTML));
  }));
  $('#w-ab').addEventListener('click', () => { spiegel(t, t.orig); pruefLeer(); });
  const ur = $('#w-ur');
  if (ur) ur.addEventListener('click', async () => {
    try { await aendern({ art: 'text-weg', h: hs, seite: W.datei, n }); t.fertig = true; sag('Der ursprüngliche Text steht wieder da.'); neuLaden({ e: hs, n }); } catch (e) { sag(e.message, true); }
  });
  $('#w-ok').addEventListener('click', async () => {
    const neu = rein(box.innerHTML);
    if (neu === t.orig || neu === anfang) { spiegel(t, t.orig); pruefLeer(); return; }
    try {
      await aendern({ art: 'text', h: hs, seite: W.datei, n, neu, ueberall: t.ueberall, lauf });
      t.fertig = true;
      el.setAttribute('data-neu', '');
      pruefLeer();
      quittung('Text gespeichert', box.textContent.trim().slice(0, 90), { id: t.ueberall ? `t:${hs}||` : `t:${hs}|${W.datei}|${n}`, seite: W.datei });
    } catch (e) { sag(e.message, true); }
  });
  box.focus();
  const sel = getSelection(), r = document.createRange();
  r.selectNodeContents(box);
  r.collapse(false);
  sel.removeAllRanges();
  sel.addRange(r);
}
function pruefAngabe(t) {
  const felder = t.q.map(q => [q, Zt.felder[q]]).filter(x => x[1]);
  if (!felder.length) return pruefLeer();
  const f0 = felder[0][1];
  $('#w-pruef').innerHTML = `<h2>${h(Zt.gruppen[f0.gruppe] || 'Angabe')}</h2>
    ${felder.map(([q, f]) => `<label class="feld"><span>${h(f.label)}</span><input data-p="${q}" value="${h(f.wert)}"></label>`).join('')}
    <p class="hinweis">${woSteht(f0.stellen, f0.seiten) || 'Diese Angabe gilt für die ganze Website.'} Sie ändern sie hier für alle auf einmal.</p>
    <div class="pruef__kn"><button class="kn kn--dunkel kn--breit" type="button" id="w-ok">Übernehmen<i>${PF}</i></button><button class="link" type="button" id="w-ab" style="justify-self:center">Abbrechen</button>
    <a class="link" href="#/haus" style="justify-self:center">Alle Angaben des Hauses</a></div>`;
  const ins = $$('#w-pruef input');
  ins.forEach(i => i.addEventListener('keydown', ev => { if (ev.key === 'Enter') $('#w-ok').click(); }));
  $('#w-ab').addEventListener('click', pruefLeer);
  $('#w-ok').addEventListener('click', async () => {
    try {
      const werte = {}, alte = {};
      ins.forEach(i => { if (i.value.trim() !== Zt.felder[i.dataset.p].wert) { werte[i.dataset.p] = i.value; alte[i.dataset.p] = Zt.felder[i.dataset.p].wert; } });
      const ps = Object.keys(werte);
      if (!ps.length) return pruefLeer();
      await aendern({ art: 'fakten', werte });
      quittung(mal(ps.length, 'Angabe', 'Angaben') + ' gespeichert', ps.map(p => Zt.felder[p].label).join(', '), { id: 'f:' + ps[0], seite: W.datei, zurueck: { art: 'fakten', werte: alte } });
      neuLaden({ e: t.el.dataset.e, n: t.el.dataset.en });
    } catch (e) { sag(e.message, true); }
  });
  ins[0].focus();
  ins[0].select();
}
function pruefGericht(t) {
  const [, gruppe, idx] = t.q[0].split(':'), g = Zt.karte[gruppe], i = +idx, x = g && g.liste[i];
  if (!x) return pruefLeer();
  $('#w-pruef').innerHTML = `<h2>${h(g.titel)}</h2><p class="leise" style="margin-top:-10px">${h(Zt.kartennamen[g.karte])}</p>
    <label class="feld"><span>Name</span><input id="w-n" value="${h(x.n)}"></label>
    <label class="feld"><span>Zusatz</span><textarea id="w-z" rows="3">${h(x.z)}</textarea></label>
    <label class="feld"><span>Preis in CHF</span><input id="w-p" value="${h(x.p)}" placeholder="z. B. 24.00 oder 24.00 / 29.00"><small>Zwei Preise mit Schrägstrich heissen kleine Portion und Portion.</small></label>
    <p class="hinweis">Das Gericht ändert sich auf der Karte und überall, wo die Seite es nennt.</p>
    <div class="pruef__kn"><button class="kn kn--dunkel kn--breit" type="button" id="w-ok">Übernehmen<i>${PF}</i></button><button class="link" type="button" id="w-ab" style="justify-self:center">Abbrechen</button>
    <a class="link" href="#/karte/${g.karte}" style="justify-self:center">Ganze Karte öffnen</a></div>`;
  $('#w-ab').addEventListener('click', pruefLeer);
  $('#w-ok').addEventListener('click', async () => {
    const liste = g.liste.map(y => ({ ...y }));
    const ur = x.u || (g.stand.some(y => y.n === x.n) ? x.n : null), nn = $('#w-n').value.trim();
    liste[i] = { ...liste[i], n: nn, z: $('#w-z').value, p: $('#w-p').value, u: ur && ur !== nn ? ur : null };
    const alt = g.liste.map(y => ({ ...y }));
    if (await tun({ art: 'karte', gruppe, liste }, { titel: 'Gericht gespeichert', text: `${liste[i].n} · ${g.titel}`, id: 'k:' + gruppe, seite: W.datei, zurueck: { art: 'karte', gruppe, liste: alt } })) neuLaden({ q: t.q[0] });
  });
  $('#w-n').focus();
}
function pruefBild(t, neu) {
  const key = t.el.dataset.b, b = Zt.bilder.find(x => x.key === key) || { seiten: [] };
  const sende = async (wert, titel) => { if (await tun({ art: 'bild', key, neu: wert }, { titel, text: mal(b.seiten.length, 'Seite', 'Seiten') + ' betroffen', id: 'b:' + key, seite: W.datei, zurueck: { art: 'bild', key, neu: b.neu || null } })) neuLaden({ b: key, n: t.el.dataset.bn }); };
  if (neu) {
    $('#w-pruef').innerHTML = `<h2>Neues Bild</h2><div class="bildvor"><img src="${h(neu.adresse)}" alt=""></div>
      <p class="hinweis">Es ersetzt das bisherige Bild${b.seiten.length > 1 ? ` auf <b>${b.seiten.length} Seiten</b>` : ''}.${neu.hinweis ? ' ' + h(neu.hinweis) : ''}</p>
      <div class="pruef__kn"><button class="kn kn--dunkel kn--breit" type="button" id="w-ok">Bild übernehmen<i>${PF}</i></button><button class="link" type="button" id="w-ab" style="justify-self:center">Abbrechen</button></div>`;
    $('#w-ok').addEventListener('click', () => sende(neu.key, 'Bild getauscht'));
    $('#w-ab').addEventListener('click', () => pruefBild(t));
    return;
  }
  $('#w-pruef').innerHTML = `<h2>${b.fest ? h(b.sonder) : 'Bild'}</h2><div class="bildvor"><img src="${h(t.el.currentSrc || t.el.src)}" alt=""></div>
    <p class="hinweis">${b.seiten.length > 1 ? `Dieses Bild ist auf <b>${b.seiten.length} Seiten</b> zu sehen: ${b.seiten.slice(0, 6).map(s => h(s.name)).join(', ')}${b.seiten.length > 6 ? ' …' : ''}. Ein neues Bild ersetzt es überall.` : 'Dieses Bild ist nur auf dieser Seite zu sehen.'}
    ${b.fest ? ' Das Dunkel für die Schrift wird ins neue Foto gerechnet. Am besten ein Querformat mit mindestens 2500 Pixeln Breite.' : ''}</p>
    <div class="ablage" id="w-ablage" tabindex="0" role="button"><b>Neues Bild wählen</b><span>oder hierher ziehen · JPG, PNG, WebP</span></div>
    ${b.fest ? '' : '<button class="link" type="button" id="w-vorrat" style="justify-self:center;align-self:center">Ein Foto aus dem Vorrat nehmen</button>'}
    ${b.neu ? '<button class="link" type="button" id="w-alt" style="justify-self:center;align-self:center">Ursprüngliches Bild zurückholen</button>' : ''}`;
  ablage($('#w-ablage'), key, r => pruefBild(t, r));
  const alt = $('#w-alt');
  if (alt) alt.addEventListener('click', () => sende(null, 'Ursprüngliches Bild zurückgeholt'));
  const vr = $('#w-vorrat');
  if (vr) vr.addEventListener('click', () => bildWahl(k => pruefBild(t, { key: k, adresse: bildadr(k, 'l') }), key));
}

// ---------------------------------------------------------------- Hochladen
function waehleDatei() {
  return new Promise(ok => {
    const i = $('#datei');
    i.value = '';
    i.onchange = () => ok(i.files[0] || null);
    i.click();
  });
}
async function ladeHoch(datei, fuer) {
  if (!datei) return null;
  if (!/^image\/(jpeg|png|webp)$/.test(datei.type)) { sag('Bitte ein JPG, PNG oder WebP wählen.', true); return null; }
  sag('Das Bild wird vorbereitet …');
  try {
    const r = await api('hochladen?fuer=' + encodeURIComponent(fuer || ''), datei, true);
    if (r.hinweis) sag(r.hinweis, true);
    Zt.neu_bilder[r.key] = { w: r.w, h: r.h, fest: !!r.fest };
    if (r.marke) Zt.marke = r.marke;
    return r;
  } catch (e) { sag(e.message, true); return null; }
}
async function hochladen(fuer) { return ladeHoch(await waehleDatei(), fuer); }
function ablage(el, fuer, dann) {
  const los = async d => { const r = await ladeHoch(d, fuer); if (r) dann(r); };
  el.addEventListener('click', async () => los(await waehleDatei()));
  el.addEventListener('keydown', async ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); los(await waehleDatei()); } });
  el.addEventListener('dragover', ev => { ev.preventDefault(); el.classList.add('drauf'); });
  el.addEventListener('dragleave', () => el.classList.remove('drauf'));
  el.addEventListener('drop', ev => { ev.preventDefault(); el.classList.remove('drauf'); los(ev.dataTransfer.files[0]); });
}
function bildWahl(dann, ohne) {
  // Ein Foto aus dem Vorrat der Seite (alle Fotos, die es schon gibt, dazu selbst hochgeladene). Legt sich über ein offenes Formular, statt es zu ersetzen.
  const keys = Object.keys(Zt.manifest).concat(Object.keys(Zt.neu_bilder).filter(k => !Zt.neu_bilder[k].fest && !Zt.manifest[k])).filter(k => k !== ohne);
  const inhalt = `<h2>Foto <em>wählen.</em></h2><p>Alle Fotos, die es auf der Seite schon gibt.</p><div class="bildwand">${keys.map(k => `<button type="button" data-k="${h(k)}" title="${h((Zt.manifest[k] || {}).was || '')}"><img src="${bildadr(k)}" alt="" loading="lazy"></button>`).join('')}</div>
    <div class="fenster__kn"><button class="kn kn--linie" type="button" id="bw-zu">Zurück</button></div>`;
  const f = $('#fenster');
  if (f.hidden) {
    fenster(inhalt);
    $('#bw-zu').addEventListener('click', fensterZu);
    $$('.bildwand button', f).forEach(b => b.addEventListener('click', () => { fensterZu(); dann(b.dataset.k); }));
    return;
  }
  const k = $('.fenster__k', f), rest = [...k.children].filter(c => !c.matches('.zu'));
  const w = document.createElement('div');
  w.innerHTML = inhalt;
  const war = rest.map(c => c.hidden);
  rest.forEach(c => { c.hidden = true; });
  k.appendChild(w);
  k.scrollTop = 0;
  const zurueck = () => { w.remove(); rest.forEach((c, i) => { c.hidden = war[i]; }); };
  $('#bw-zu', w).addEventListener('click', zurueck);
  $$('.bildwand button', w).forEach(b => b.addEventListener('click', () => { zurueck(); dann(b.dataset.k); }));
}

// ---------------------------------------------------------------- Karten
const preisT = p => String(p || '').trim();
function platzNach(stand, y, liste, nameJetzt, nameStand) {
  for (let k = stand.indexOf(y) - 1; k >= 0; k--) {
    const j = liste.findIndex(x => nameJetzt(x) === nameStand(stand[k]) || nameStand(x) === nameStand(stand[k]));
    if (j >= 0) return j + 1;
  }
  return 0;
}
function abgleich(g) {
  const a = g.stand, b = g.liste, na = a.map(x => x.n), nb = b.map(x => (x.u && na.includes(x.u) ? x.u : x.n));
  const status = b.map((x, i) => {
    const y = a[na.indexOf(nb[i])];
    if (!y) return 'neu';
    return (y.n !== x.n || y.z !== x.z || y.p !== x.p || y.aus !== x.aus) ? 'anders' : '';
  });
  return { status, weg: a.filter(y => !nb.includes(y.n)) };
}
function karte(kid) {
  kid = Zt.kartennamen[kid] ? kid : 'k1';
  /* Bilder in jeder Liste (Robert 19.10.2026): ein Gericht zeigt nur ein Foto, das es wirklich zeigt; sonst trägt die Rubrik ihr Bild */
  const kb = (art, n) => window.kartenBild ? window.kartenBild('alle', art, n) : '';
  const zeile = (x, i, g, st, letzte) => `<div class="gz${x.aus ? ' aus' : ''}${BLITZ === x.n ? ' blitz' : ''}" data-i="${i}">
      ${kb('z', x.n) ? `<button class="gz__b" type="button" data-akt="edit" tabindex="-1" aria-hidden="true"><img src="${kb('z', x.n)}" alt="" loading="lazy" decoding="async"></button>` : ''}
      <button class="gz__t" type="button" data-akt="edit" title="Bearbeiten"><b>${h(x.n)}</b>${x.z ? `<span>${h(x.z)}</span>` : ''}</button>
      <span class="gz__s">${x.aus ? '<i class="marke grau">Ausgeblendet</i>' : ''}${st === 'neu' ? '<i class="marke rot">Neu im Entwurf</i>' : st === 'anders' ? '<i class="marke rot">Geändert</i>' : ''}</span>
      <span class="gz__p">${h(preisT(x.p))}</span>
      <div class="gz__r"><button class="rund" type="button" data-akt="hoch" title="Nach oben" aria-label="Nach oben"${i === 0 ? ' disabled' : ''}>${SYM.hoch}</button><button class="rund" type="button" data-akt="runter" title="Nach unten" aria-label="Nach unten"${letzte ? ' disabled' : ''}>${SYM.runter}</button>
        <button class="rund" type="button" data-akt="aus" title="${x.aus ? 'Wieder zeigen' : 'Vorübergehend ausblenden'}" aria-label="${x.aus ? 'Wieder zeigen' : 'Ausblenden'}">${x.aus ? SYM.augezu : SYM.auge}</button>
        <button class="rund" type="button" data-akt="weg" title="Von der Karte nehmen" aria-label="Von der Karte nehmen">${SYM.korb}</button>
        <button class="kn kn--klein kn--linie" type="button" data-akt="edit">Bearbeiten</button></div></div>`;
  const gruppe = ([key, g]) => {
    const ab = abgleich(g);
    return `<section class="blatt gruppe" data-g="${key}"><div class="gruppe__k">${kb('g', key) ? `<span class="ug__b" aria-hidden="true"><img src="${kb('g', key)}" alt="" loading="lazy" decoding="async"></span>` : ''}<h3>${h(g.titel)}<span>${String(g.liste.filter(x => !x.aus).length).padStart(2, '0')}</span></h3>${g.geaendert ? '<i class="marke rot">Im Entwurf geändert</i>' : ''}${g.eigen ? '<i class="marke hell">Eigene Rubrik</i>' : ''}
        <button class="kn kn--klein" type="button" data-akt="neu">Gericht hinzufügen<i>${PF}</i></button></div>
      <div class="zeilen">${g.liste.map((x, i) => zeile(x, i, g, ab.status[i], i === g.liste.length - 1)).join('')}${ab.weg.map(y => `<div class="gz weg"><span class="gz__t"><b>${h(y.n)}</b></span><span class="gz__s"><i class="marke grau">Entfernt, noch nicht veröffentlicht</i></span><span class="gz__p"></span>
        <div class="gz__r"><button class="kn kn--klein kn--linie" type="button" data-akt="hol" data-n="${h(y.n)}">Zurückholen</button></div></div>`).join('')}
        ${g.liste.length || ab.weg.length ? '' : `<p class="gz leer">Noch nichts in dieser Rubrik.</p>`}</div>
      ${g.geaendert ? '<div class="gruppe__f"><button class="link" type="button" data-akt="std">Alle Änderungen in dieser Rubrik zurücknehmen</button></div>' : ''}</section>`;
  };
  const alle = Object.entries(Zt.karte).filter(([, g]) => g.karte === kid);
  const pdf = Zt.felder['link.' + kid + 'pdf'];
  sicht.innerHTML = `<div class="in">${kopf('Die drei <em>Karten.</em>', 'Wählen Sie eine Karte. Mit «Bearbeiten» öffnen Sie ein Gericht, mit «Gericht hinzufügen» legen Sie ein neues an. Jede Änderung wird bestätigt und steht danach auf der Seite «Essen». Die Karte als PDF laden Sie unten getrennt hoch.',
      `<a class="kn kn--linie" href="/entwurf/essen.html#karte" target="_blank" rel="noopener">Karte im Entwurf ansehen</a><button class="kn" type="button" data-akt="neu-oben">Gericht hinzufügen<i>${PF}</i></button>`)}
    <div class="kartenwahl">${Object.entries(Zt.kartennamen).map(([k, n]) => `<a class="kw${k === kid ? ' an' : ''}" href="#/karte/${k}"><b>${h(n.split(' · ')[0])}</b><span>${h(n.split(' · ')[1] || '')}${n.split(' · ')[1] ? ' · ' : ''}${mal(Object.values(Zt.karte).filter(g => g.karte === k).reduce((a, g) => a + g.liste.filter(x => !x.aus).length, 0), 'Gericht', 'Gerichte')}</span></a>`).join('')}</div>
    ${TAFEL ? '<p class="tafel-hin">Gerichte, Preise, Rubriken und PDF dieser Karten pflegt Die Tafel (Knopf oben im Schreibtisch). Hier bleibt das Tagesmenu der Egger- und Stettlerstube.</p>' : ''}
    ${alle.map(gruppe).join('')}
    ${kid === 'k2' ? `<h2 class="reiheT">Tagesmenu</h2>${listeBlatt('tagesmenu')}` : ''}
    <h2 class="reiheT">Rubriken & PDF</h2>${gruppenBlatt(kid)}
    <section class="blatt"><div class="gruppe__k" style="padding:0"><h3>Karte als PDF</h3></div><p class="gruppe__hin" style="padding:8px 0 0">Hinter dem Link «Karte als PDF» unter dieser Karte auf der Seite «Essen». Laden Sie die neue Karte hoch, der Link zeigt danach auf die neue Datei.</p>
      <div class="sichern offen" style="position:static;margin:14px 0 0"><i></i><span>${h(pdf ? pdf.wert.split('/').pop() : '')}</span><button class="kn kn--klein" type="button" data-akt="pdf">Neue PDF hochladen<i>${PF}</i></button></div></section></div>`;
  const blitz = $('.gz.blitz', sicht);
  BLITZ = null;
  if (blitz) blitz.scrollIntoView({ block: 'center' });
  sicht.querySelector('.in').addEventListener('click', ev => {
    const b = ev.target.closest('[data-akt]');
    if (!b) return;
    const akt = b.dataset.akt;
    if (TAFEL && !b.closest('[data-l]')) { sag('Gerichte, Preise, Rubriken und PDF dieser Karten pflegt Die Tafel. Hier bleibt das Tagesmenu.'); return; }
    if (akt === 'neu-oben') return gerichtFenster({ karte: kid });
    if (akt === 'pdf') return pdfHoch('link.' + kid + 'pdf');
    if (gruppenKlick(ev, kid)) return;
    if (listenKlick(ev)) return;
    const sec = b.closest('.gruppe');
    if (!sec || !sec.dataset.g) return;
    const key = sec.dataset.g, g = Zt.karte[key], z = b.closest('.gz'), i = z && z.dataset.i !== undefined ? +z.dataset.i : -1, alt = g.liste.map(x => ({ ...x })), l = alt.map(x => ({ ...x }));
    const sende = async (liste, titel, text) => { if (await tun({ art: 'karte', gruppe: key, liste }, { titel, text, id: 'k:' + key, zurueck: { art: 'karte', gruppe: key, liste: alt } })) neuZeichnen(); };
    if (akt === 'neu') return gerichtFenster({ karte: kid, gruppe: key });
    if (akt === 'edit') return gerichtFenster({ karte: kid, gruppe: key, i });
    if (akt === 'std') return frage('Änderungen <em>zurücknehmen?</em>', `«${h(g.titel)}» steht danach wieder so da wie auf der Website.`, 'Zurücknehmen', async () => { await aendern({ art: 'verwerfen', id: 'k:' + key }); sag('Zurückgenommen: ' + g.titel); neuZeichnen(); });
    if (akt === 'hol') { const y = g.stand.find(x => x.n === b.dataset.n); l.splice(platzNach(g.stand, y, l, x => x.u || x.n, x => x.n), 0, { ...y }); BLITZ = y.n; return sende(l, 'Wieder auf der Karte', y.n); }
    if (akt === 'hoch' && i > 0) { [l[i - 1], l[i]] = [l[i], l[i - 1]]; BLITZ = l[i - 1].n; return sende(l, 'Reihenfolge gespeichert', `${l[i - 1].n} steht jetzt weiter oben`); }
    if (akt === 'runter' && i < l.length - 1) { [l[i + 1], l[i]] = [l[i], l[i + 1]]; BLITZ = l[i + 1].n; return sende(l, 'Reihenfolge gespeichert', `${l[i + 1].n} steht jetzt weiter unten`); }
    if (akt === 'aus') { l[i].aus = !l[i].aus; BLITZ = l[i].n; return sende(l, l[i].aus ? 'Ausgeblendet' : 'Wieder sichtbar', l[i].aus ? `${l[i].n} steht vorerst nicht auf der Karte` : l[i].n); }
    if (akt === 'weg') return frage('Von der Karte <em>nehmen?</em>', `«${h(alt[i].n)}» verschwindet aus ${h(g.titel)}. Bis zum Veröffentlichen können Sie es mit einem Klick zurückholen.`, 'Von der Karte nehmen', async () => { l.splice(i, 1); await sende(l, 'Von der Karte genommen', alt[i].n); });
  });
}
function gerichtFenster({ karte: kid, gruppe, i }) {
  const neu = i === undefined, st = neu ? { n: '', z: '', p: '', aus: false } : { ...Zt.karte[gruppe].liste[i] };
  const gruppenVon = k => Object.entries(Zt.karte).filter(([, g]) => g.karte === k);
  const erste = k => (gruppenVon(k)[0] || [null])[0];
  let kW = kid || 'k1', grW = gruppe || erste(kW), pos = 'ende';
  const teile = String(st.p || '').split('/').map(x => x.trim());
  let art = !st.p ? 'eins' : teile.length > 1 ? 'zwei' : 'eins';
  fenster(`<h2>${neu ? 'Neues <em>Gericht.</em>' : 'Gericht <em>bearbeiten.</em>'}</h2>
    <div class="form2"><div class="form2__l">
      ${neu ? `<div class="feld"><span>Karte</span>${chipsH('karte', Object.entries(Zt.kartennamen).map(([k, n]) => [k, n.split(' · ')[0]]), kW)}</div><div class="feld"><span>Rubrik</span><div id="g-gruppen"></div></div>`
    : `<p class="form2__ort">${h(Zt.kartennamen[kW])} · ${h(Zt.karte[grW].titel)}</p>`}
      <label class="feld"><span>Name (wie auf der Karte, gern in Mundart)</span><input id="g-n" maxlength="140" value="${h(st.n)}" placeholder="z. B. CHÄSSCHNITTE mit Ei und Schinken"></label>
      <label class="feld"><span>Zusatz (freiwillig)</span><textarea id="g-z" rows="2" maxlength="300" placeholder="Erklärung oder Beilagen">${h(st.z)}</textarea></label>
      <div class="feld"><span>Preis in CHF</span><div class="preisz"><input id="g-p" value="${h(teile[0] || '')}" placeholder="z. B. 24.00" inputmode="decimal">${chipsH('art', [['eins', 'Ein Preis'], ['zwei', 'Kleine Portion / Portion'], ['ohne', 'Ohne Preis']], !st.p ? 'ohne' : art)}</div>
        <input id="g-p2" value="${h(teile[1] || '')}" placeholder="Preis der Portion, z. B. 29.00" inputmode="decimal" style="margin-top:8px"${art === 'zwei' ? '' : ' hidden'}><small id="g-ph"></small></div>
      ${neu ? `<div class="feld"><span>Platz in der Rubrik</span>${chipsH('pos', [['ende', 'Am Ende'], ['anfang', 'Ganz oben']], pos)}</div>` : ''}
      ${schalter('g-an', !st.aus, 'Auf der Karte zeigen')}
    </div><div class="form2__r"><span class="mono leise">So steht es auf der Karte</span><div id="g-vor"></div></div></div>
    <div class="fehler" id="g-f" role="alert"></div>
    <div class="fenster__kn"><button class="kn kn--linie" type="button" data-zu>Abbrechen</button><button class="kn kn--dunkel" type="button" id="g-ok">${neu ? 'Auf die Karte setzen' : 'Speichern'}<i>${PF}</i></button></div>`, true);
  const f = $('#fenster');
  let preisArt = !st.p ? 'ohne' : art;
  const preis = () => { const a = $('#g-p').value.trim().replace(',', '.'), b = $('#g-p2').value.trim().replace(',', '.'); return preisArt === 'ohne' ? '' : preisArt === 'zwei' ? (a && b ? `${a} / ${b}` : a || b) : a; };
  const mal2 = () => {
    const g = Zt.karte[grW], n = $('#g-n').value.trim() || 'Name des Gerichts', z = $('#g-z').value.trim(), aus = !$('#g-an').checked;
    if (neu) $('#g-gruppen').innerHTML = chipsH('gruppe', gruppenVon(kW).map(([k, x]) => [k, x.titel]), grW);
    $('#g-p2').hidden = preisArt !== 'zwei';
    $('#g-p').hidden = preisArt === 'ohne';
    $('#g-ph').textContent = preisArt === 'zwei' ? 'Erst die kleine Portion, dann die Portion.' : preisArt === 'ohne' ? 'Ohne Preis bleibt das Feld leer (zum Beispiel bei Menü-Gängen).' : 'Mit Punkt und zwei Stellen, wie auf der Karte: 24.00';
    $('#g-vor').innerHTML = `<div class="vw${aus ? ' aus' : ''}"><div><b>${h(n)}</b>${z ? `<small>${h(z)}</small>` : ''}</div><i>${h(preis())}</i></div>
      <p class="vor__h">${aus ? 'Ausgeblendet: steht vorerst nicht auf der Karte.' : `${h(Zt.kartennamen[kW])} · ${h(g ? g.titel : '')}`}</p>`;
  };
  mal2();
  f.oninput = () => { mal2(); $('#g-f').textContent = ''; };
  f.bei = ev => {
    const { name, wert } = ev.detail;
    if (name === 'karte') { kW = wert; grW = erste(kW); }
    if (name === 'gruppe') grW = wert;
    if (name === 'art') preisArt = wert;
    if (name === 'pos') pos = wert;
    mal2();
  };
  $('#g-ok').addEventListener('click', async ev => {
    const g = Zt.karte[grW], n = $('#g-n').value.trim(), alt = g.liste.map(x => ({ ...x })), liste = alt.map(x => ({ ...x }));
    if (!n) { $('#g-f').textContent = 'Bitte einen Namen eintragen.'; $('#g-n').focus(); return; }
    if (alt.some((x, j) => x.n.toLowerCase() === n.toLowerCase() && (neu || j !== i))) { $('#g-f').textContent = `«${n}» steht schon in ${g.titel}. Bitte einen anderen Namen wählen.`; return; }  // textContent, keine Maskierung nötig
    const eintrag = { n, z: $('#g-z').value.trim(), p: preis(), aus: !$('#g-an').checked };
    const ur = st.u || (!neu && g.stand.some(x => x.n === st.n) ? st.n : null);
    if (ur && ur !== n) eintrag.u = ur;
    if (neu) { if (pos === 'anfang') liste.unshift(eintrag); else liste.push(eintrag); } else liste[i] = eintrag;
    if (!neu && ['n', 'z', 'p', 'aus'].every(k => (eintrag[k] || '') === (alt[i][k] || ''))) { fensterZu(); sag('Nichts geändert, nichts gespeichert.'); return; }
    ev.target.disabled = true;
    const ok = await tun({ art: 'karte', gruppe: grW, liste }, { titel: neu ? 'Gericht hinzugefügt' : 'Gericht gespeichert', text: `${n} · ${g.titel}`, id: 'k:' + grW, zurueck: { art: 'karte', gruppe: grW, liste: alt } });
    ev.target.disabled = false;
    if (!ok) return;
    fensterZu();
    BLITZ = n;
    if (W) neuLaden({}); else if (location.hash !== '#/karte/' + kW) location.hash = '#/karte/' + kW; else neuZeichnen();
  });
  $('#g-n').focus();
}
function gruppenBlatt(kid) {
  const gs = Zt.kartengruppen.filter(g => g.karte === kid);
  return `<section class="blatt gruppe" data-gruppen><div class="gruppe__k"><h3>Eigene Rubriken<span>${String(gs.length).padStart(2, '0')}</span></h3><button class="kn kn--klein" type="button" data-akt="gruppe-neu">Rubrik anlegen<i>${PF}</i></button></div>
    <p class="gruppe__hin">Eine Rubrik ist ein Abschnitt der Karte, zum Beispiel «Metzgete» oder «Wildwochen». Sie steht am Ende dieser Karte. Gerichte legen Sie danach wie gewohnt an.</p>
    <div class="zeilen">${gs.map(g => `<div class="gz" data-gi="${g.i}"><span class="gz__t"><b>${h(g.titel)}</b></span><span class="gz__s"></span><span class="gz__p"></span><div class="gz__r"><button class="rund" type="button" data-akt="gruppe-weg" aria-label="Entfernen" title="Rubrik entfernen">${SYM.korb}</button><button class="kn kn--klein kn--linie" type="button" data-akt="gruppe-edit">Umbenennen</button></div></div>`).join('') || '<p class="gz leer">Noch keine eigene Rubrik.</p>'}</div></section>`;
}
function gruppeFenster(kid, g) {
  fenster(`<h2>${g ? 'Rubrik <em>umbenennen.</em>' : 'Neue <em>Rubrik.</em>'}</h2><div class="form1" style="margin-top:18px">
    <label class="feld"><span>Name der Rubrik</span><input id="gr-t" maxlength="60" value="${h(g ? g.titel : '')}" placeholder="z. B. WILDWOCHEN"></label>
    <div class="feld"><span>Auf welcher Karte</span>${chipsH('karte', Object.entries(Zt.kartennamen).map(([k, n]) => [k, n.split(' · ')[0]]), kid)}</div></div>
    <div class="fehler" id="gr-f"></div><div class="fenster__kn"><button class="kn kn--linie" type="button" data-zu>Abbrechen</button><button class="kn kn--dunkel" type="button" id="gr-ok">${g ? 'Speichern' : 'Anlegen'}<i>${PF}</i></button></div>`);
  let kW = kid;
  $('#fenster').bei = ev => { if (ev.detail.name === 'karte') kW = ev.detail.wert; };
  $('#gr-ok').addEventListener('click', async () => {
    const t = $('#gr-t').value.trim();
    if (!t) { $('#gr-f').textContent = 'Bitte einen Namen eintragen.'; return; }
    if (await tun({ art: 'kartengruppe', karte: kW, titel: t, i: g ? g.i : undefined }, { titel: g ? 'Rubrik gespeichert' : 'Rubrik angelegt', text: `${t} · ${Zt.kartennamen[kW]}` })) { fensterZu(); if (kW !== kid) location.hash = '#/karte/' + kW; else neuZeichnen(); }
  });
  $('#gr-t').focus();
}
function gruppenKlick(ev, kid) {
  const b = ev.target.closest('[data-akt]');
  if (!b || !b.closest('[data-gruppen]')) return false;
  const z = b.closest('.gz'), g = z && Zt.kartengruppen.find(x => x.i === +z.dataset.gi);
  if (b.dataset.akt === 'gruppe-neu') gruppeFenster(kid);
  else if (b.dataset.akt === 'gruppe-edit' && g) gruppeFenster(kid, g);
  else if (b.dataset.akt === 'gruppe-weg' && g) frage('Rubrik <em>entfernen?</em>', `«${h(g.titel)}» und die Gerichte darin verschwinden von der Karte.`, 'Entfernen', async () => { if (await tun({ art: 'kartengruppe-weg', i: g.i, karte: kid }, { titel: 'Rubrik entfernt', text: g.titel })) neuZeichnen(); });
  else return false;
  return true;
}
async function pdfHoch(pfad) {
  const d = await waehleDateiArt('application/pdf,.pdf');
  if (!d) return null;
  if (d.type !== 'application/pdf' && !/\.pdf$/i.test(d.name)) { sag('Bitte eine PDF wählen.', true); return null; }
  sag('Die PDF wird abgelegt …');
  try {
    const r = await api('hochladen?art=pdf&name=' + encodeURIComponent(d.name), d, true);
    if (await tun({ art: 'fakt', pfad, wert: r.pfad }, { titel: 'Karte als PDF ersetzt', text: `${d.name} (${r.kb} kB)`, id: 'f:' + pfad, zurueck: { art: 'fakt', pfad, wert: Zt.felder[pfad].wert } })) neuZeichnen();
  } catch (e) { sag(e.message, true); }
}
function waehleDateiArt(accept) {
  return new Promise(ok => { const i = $('#datei'); i.value = ''; i.accept = accept; i.onchange = () => { ok(i.files[0] || null); i.accept = 'image/jpeg,image/png,image/webp'; }; i.click(); });
}

// ---------------------------------------------------------------- Haus & Angaben
function haus() {
  const feld = (p, f) => `<label class="feld" data-p="${p}"><span>${h(f.label)}${f.wert !== f.stand ? '<i class="marke rot">Im Entwurf geändert</i>' : ''}</span><input value="${h(f.wert)}"${f.art === 'link' ? ' inputmode="url"' : ''}>
      <small>${f.stellen ? `steht an ${mal(f.stellen, 'Stelle', 'Stellen')} auf ${mal(f.seiten, 'Seite', 'Seiten')}` : (f.art === 'link' ? 'hinter den Knöpfen der Seite' : f.art === 'pdf' ? 'unter «Karten» hochladen' : '')}${f.wert !== f.stand ? ` · <button class="link" type="button" data-sehen="f:${p}">vorher/nachher ansehen</button>` : ''}</small></label>`;
  const teil = (g, art) => Object.entries(Zt.felder).filter(([p, f]) => f.gruppe === g && (!art || art.includes(f.art))).map(([p, f]) => feld(p, f)).join('');
  const fuss = '<div class="sichern"><i></i><span></span><button class="link" type="button" data-akt="verwerfen">Verwerfen</button><button class="kn kn--klein" type="button" data-akt="sichern">Speichern<i>' + PF + '</i></button></div>';
  const blatt = (k, z, titel, text, innen) => `<section class="blatt haus" data-karte="${k}"><div class="haus__k">${Z[z]}<h3>${titel}</h3></div><div class="haus__t">${text ? `<p class="hinweis">${text}</p>` : ''}${innen}</div>${fuss}</section>`;
  sicht.innerHTML = `<div class="in">${kopf('Haus <em>& Angaben.</em>', 'Jede Angabe gibt es nur einmal. Tragen Sie sie ein und drücken Sie unten am Blatt auf «Speichern». Danach stimmt sie auf jeder Seite: Startseite, Zimmer, Essen, Das Haus, Fuss der Seite.')}
    <div class="raster r-2">
      ${blatt('haus', 'haus', 'Zeiten & Adresse', '', '<div class="sosteht"><span>So steht es auf der Seite</span><div></div></div>' + teil('haus'))}
      ${blatt('kontakt', 'stellen', 'Telefon & E-Mail', 'Die Telefonnummer wird auf der Seite anklickbar. Die E-Mail für Feste steht hinter «Fest anfragen», die für Bewerbungen bei den offenen Stellen.', teil('kontakt'))}
      ${blatt('link', 'fakt', 'Links', 'Das Buchungssystem öffnet sich hinter «Verfügbarkeit prüfen» und «Zimmer buchen». Die Karten als PDF laden Sie unter «Karten» hoch.', teil('link', ['link']))}
      ${blatt('bew', 'zahlen', 'Noten der Gäste', 'Die Karten «So sehen es die Gäste» auf der Startseite und auf «Das Haus». Die Balken von Booking.com stehen darunter.', teil('bew'))}
    </div>
    <h2 class="zw">Noten bei Booking.com, im Einzelnen</h2>${listeBlatt('bew.balken')}</div>`;
  const wurzel = sicht.querySelector('.in');
  const pruefe = karte => {
    const anders = $$('.feld', karte).filter(l => { const d = $('input', l).value.trim() !== Zt.felder[l.dataset.p].wert; l.classList.toggle('offen', d); return d; });
    const s = $('.sichern', karte), imEntwurf = $$('.feld', karte).filter(l => Zt.felder[l.dataset.p].wert !== Zt.felder[l.dataset.p].stand).length;
    s.classList.toggle('offen', !!anders.length);
    s.classList.toggle('entwurf', !anders.length && !!imEntwurf);
    $$('button', s).forEach(b => { b.disabled = !anders.length; });
    $('span', s).textContent = anders.length ? mal(anders.length, 'Angabe', 'Angaben') + ' noch nicht gespeichert' : imEntwurf ? `Gespeichert, ${imEntwurf} im Entwurf` : 'Nichts geändert';
    const so = $('.sosteht div', karte);
    if (so) { const w = p => { const i = $(`[data-p="haus.${p}"] input`, karte); return i ? i.value.trim() : ''; }; so.textContent = `Restaurant ${w('zeiten')} · ${w('strasse')}, ${w('ort')}`; }
    return anders;
  };
  $$('.haus', wurzel).forEach(pruefe);
  offen = () => !!$('.feld.offen', sicht);
  wurzel.addEventListener('input', ev => { const k = ev.target.closest('.haus'); if (k) pruefe(k); });
  wurzel.addEventListener('keydown', ev => { if (ev.key === 'Enter' && ev.target.matches('.haus .feld input')) { ev.preventDefault(); const k = ev.target.closest('.haus'); if (pruefe(k).length) $('[data-akt="sichern"]', k).click(); } });
  wurzel.addEventListener('click', async ev => {
    if (listenKlick(ev)) return;
    const s = ev.target.closest('[data-sehen]'), b = ev.target.closest('[data-akt]'), karte = b && b.closest('.haus');
    if (s) { ev.preventDefault(); const c = Zt.aenderungen.find(x => x.id === s.dataset.sehen); if (c) vergleich(c); return; }
    if (!karte) return;
    if (b.dataset.akt === 'verwerfen') { $$('.feld', karte).forEach(l => { $('input', l).value = Zt.felder[l.dataset.p].wert; }); pruefe(karte); return; }
    if (b.dataset.akt === 'sichern') {
      const anders = pruefe(karte), werte = {}, alte = {};
      anders.forEach(l => { werte[l.dataset.p] = $('input', l).value; alte[l.dataset.p] = Zt.felder[l.dataset.p].wert; });
      const namen = anders.map(l => Zt.felder[l.dataset.p].label), erste = Object.keys(werte)[0];
      b.disabled = true;
      const ok = await tun({ art: 'fakten', werte }, { titel: mal(anders.length, 'Angabe', 'Angaben') + ' gespeichert', text: `${namen.slice(0, 3).join(', ')}${namen.length > 3 ? ' …' : ''}`, id: 'f:' + erste, zurueck: { art: 'fakten', werte: alte } });
      b.disabled = false;
      if (ok) { offen = null; neuZeichnen(); }
    }
  });
}

// ---------------------------------------------------------------- Bilder
function bilder(filter) {
  const wahl = [['', 'Alle']].concat(Zt.seiten.map(s => [s.datei, s.name]), [['fest', 'Feste Bilder']]);
  const liste = Zt.bilder.filter(b => !filter || (filter === 'fest' ? b.fest : b.seiten.some(s => s.datei === filter)));
  sicht.innerHTML = `<div class="in">${kopf('Bil<em>der.</em>', 'Jedes Foto der Website. Klicken Sie auf ein Bild, wählen Sie ein neues und bestätigen Sie. Es ändert sich dann überall, wo es zu sehen ist. Feste Bilder sind Startbild, Seitenköpfe, Fenster und Schluss: dort wird das Dunkel für die Schrift ins Foto gerechnet.')}
    <div class="filter">${wahl.map(([d, n]) => `<button type="button" data-f="${h(d)}" class="${(filter || '') === d ? 'an' : ''}">${h(n)}</button>`).join('')}</div>
    <div class="mauer">${liste.map(b => `<button class="bk" type="button" data-key="${h(b.key)}"><img src="${h(b.adresse)}" alt="" loading="lazy">${b.neu ? '<i>Getauscht</i>' : ''}${b.fest ? `<u>${h(b.sonder)}</u>` : ''}<span>${mal(b.seiten.length, 'Seite', 'Seiten')}</span><em>Tauschen</em></button>`).join('')}</div></div>`;
  sicht.querySelector('.in').addEventListener('click', ev => {
    const f = ev.target.closest('[data-f]'), k = ev.target.closest('[data-key]');
    if (f) location.hash = '#/bilder' + (f.dataset.f ? '/' + encodeURIComponent(f.dataset.f) : '');
    if (k) bildFenster(k.dataset.key);
  });
}
function bildFenster(key, neu) {
  const b = Zt.bilder.find(x => x.key === key);
  if (!b) return;
  const jetztA = b.fest ? b.adresse : bildadr(b.neu || b.key, 'l');
  fenster(`<h2>${b.fest ? h(b.sonder) + ' <em>tauschen.</em>' : 'Bild <em>tauschen.</em>'}</h2>
    ${neu ? `<div class="vn vn--bild"><div class="alt"><span>Bisher</span><img src="${h(jetztA)}" alt=""></div><svg viewBox="0 0 22 22"><path d="M3 11h15M13 6l5 5-5 5"/></svg><div class="neu"><span>Neu</span><img src="${h(neu.adresse)}" alt=""></div></div>
      <p>Das neue Bild ersetzt das bisherige auf ${b.seiten.length > 1 ? `<b>${b.seiten.length} Seiten</b>: ${b.seiten.slice(0, 6).map(s => h(s.name)).join(', ')}${b.seiten.length > 6 ? ' …' : ''}` : `der Seite <b>${h(b.seiten[0].name)}</b>`}.${neu.hinweis ? ' ' + h(neu.hinweis) : ''}</p>
      <div class="fenster__kn"><button class="kn kn--linie" type="button" data-zu>Abbrechen</button><button class="kn kn--linie" type="button" id="f-anders">Anderes Bild</button><button class="kn kn--dunkel" type="button" id="f-ok">Bild übernehmen<i>${PF}</i></button></div>`
    : `<div class="bz"><div class="bz__b"><img src="${h(jetztA)}" alt=""></div>
      <div><p style="margin:0"><b>Zu sehen auf</b></p><ul>${b.seiten.slice(0, 8).map(s => `<li>${h(s.name)}${s.zahl > 1 ? ` (${s.zahl} ×)` : ''}</li>`).join('')}${b.seiten.length > 8 ? `<li>und ${b.seiten.length - 8} weiteren Seiten</li>` : ''}</ul>
        ${b.fest ? `<p class="hinweis" style="margin-top:14px">Dieses Foto ist ein ${h(b.sonder)}. Das Dunkel für die Schrift wird ins neue Bild gerechnet, am Handy entsteht ein eigener Ausschnitt. Am besten ein Querformat mit mindestens 2500 Pixeln Breite.</p>` : ''}
        <div class="ablage" id="f-ablage" tabindex="0" role="button" style="margin-top:16px"><b>Neues Bild wählen</b><span>oder hierher ziehen · JPG, PNG, WebP</span></div>
        ${b.fest ? '' : '<p style="margin-top:14px;text-align:center"><button class="link" type="button" id="f-vorrat">Ein Foto aus dem Vorrat nehmen</button></p>'}
        ${b.neu ? '<p style="margin-top:14px;text-align:center"><button class="link" type="button" id="f-alt">Ursprüngliches Bild zurückholen</button></p>' : ''}</div></div>`}`, true);
  const sende = async (wert, titel) => {
    if (await tun({ art: 'bild', key, neu: wert }, { titel, text: mal(b.seiten.length, 'Seite', 'Seiten') + ' betroffen', id: 'b:' + key, zurueck: { art: 'bild', key, neu: b.neu || null } })) { fensterZu(); neuZeichnen(); }
  };
  if (neu) {
    $('#f-ok').addEventListener('click', () => sende(neu.key, 'Bild getauscht'));
    $('#f-anders').addEventListener('click', async () => { const r = await hochladen(key); if (r) bildFenster(key, r); });
  } else {
    ablage($('#f-ablage'), key, r => bildFenster(key, r));
    const alt = $('#f-alt');
    if (alt) alt.addEventListener('click', () => sende(null, 'Ursprüngliches Bild zurückgeholt'));
    const vr = $('#f-vorrat');
    if (vr) vr.addEventListener('click', () => bildWahl(k => bildFenster(key, { key: k, adresse: bildadr(k, 'l') }), key));
  }
}

// ---------------------------------------------------------------- Listen (Zimmer, Anlässe, Stellen, Team, Zahlen, Gut zu wissen, Gourmet, Tagesmenu, Balken)
const LISTEN = {
  zimmer: { titel: 'Zimmer <em>& Preise.</em>', text: 'Die vier Zimmerarten mit Satz, Preis, Belegung und Fotos. Sie stehen auf der Startseite im Gefüge, auf der Zimmer-Seite und jedes auf seiner eigenen Seite. Das erste Foto ist das grosse.', keys: ['zimmer'], seite: 'zimmer.html' },
  anlaesse: { titel: 'An<em>lässe.</em>', text: 'Metzgete, Stubete, Ruedi-Tag: Sie stehen auf der Seite «Durchs Jahr» und als Karten auf der Seite «Essen». Aus dem Datum ergibt sich der Balken im Jahreslauf.', keys: ['anlaesse'], seite: 'veranstaltungen.html' },
  stellen: { titel: 'Stellen <em>& Team.</em>', text: 'Die offenen Stellen und die Zahlen zum Team auf der Seite «Das Haus». Bewerbungen kommen per E-Mail an die Adresse für Bewerbungen (unter «Haus & Angaben»).', keys: ['stellen', 'team'], seite: 'haus.html#stellen' },
  zahlen: { titel: 'Zahlen <em>& Angebote.</em>', text: 'Die grossen Jahreszahlen auf der Startseite, «Gut zu wissen» und der Gourmetaufenthalt auf der Zimmer-Seite, dazu die Orte der Karte «Rund um Kandersteg» auf der Seite «Das Haus».', keys: ['jahre', 'gut', 'gourmet', 'umgebung'], seite: 'index.html' },
};
const WORTE = { zimmer: 'Zimmer', anlaesse: 'Anlass', stellen: 'Stelle', team: 'Zahl', jahre: 'Zahl', gut: 'Angabe', gourmet: 'Zeile', umgebung: 'Ort', tagesmenu: 'Tag', 'bew.balken': 'Note' };
const feldWert = (x, f) => f[2] === 'liste' ? (x[f[0]] || []).join(', ') : f[2] === 'bilder' ? mal((x[f[0]] || []).length, 'Foto', 'Fotos') : String(x[f[0]] ?? '');
const listeName = (x, g) => { const f = g.felder.find(f => f[2] === 'text' && x[f[0]]); return f ? feldWert(x, f) : feldWert(x, g.felder[0]); };
function listeStatus(g) {
  const norm = l => JSON.stringify(l.map(x => Object.fromEntries(g.felder.filter(f => f[2] !== 'id').map(f => [f[0], f[2] === 'liste' || f[2] === 'bilder' ? (x[f[0]] || []) : (x[f[0]] ?? '')]))));
  const a = g.stand, b = g.liste, na = a.map(x => listeName(x, g)), nb = b.map(x => listeName(x, g)), gleich = a.length === b.length;
  return { status: b.map((x, i) => { const j = na.includes(nb[i]) ? na.indexOf(nb[i]) : (gleich && !nb.includes(na[i]) ? i : -1); return j < 0 ? 'neu' : (norm([a[j]]) !== norm([x]) ? 'anders' : ''); }), weg: a.filter((y, i) => !nb.includes(na[i]) && !(gleich && !na.includes(nb[i]))) };
}
function listeBlatt(key) {
  const g = Zt.listen[key];
  if (!g) return '';
  const st = listeStatus(g), bildF = g.felder.find(f => f[2] === 'bild' || f[2] === 'bilder'), zweit = g.felder.filter(f => !['bild', 'bilder', 'liste', 'id', 'lang'].includes(f[2])).slice(1, 3);
  const wort = g.wort || WORTE[key] || 'Eintrag';
  /* Bilder in jeder Liste (Robert 19.10.2026): ohne eigenes Foto das Bild aus /assets/js/listenbilder.js */
  const lbild = (x, i) => window.listenBild ? window.listenBild(key, i, listeName(x, g)) : '';
  const bildK = (x, i) => { const v = bildF ? x[bildF[0]] : ''; const k = bildF && bildF[2] === 'bilder' ? (v || [])[0] : v; const lb = k ? bildadr(k) : lbild(x, i); return lb ? `<img src="${lb}" alt="" loading="lazy" decoding="async">` : SYM.bild; };
  const zeile = (x, i) => `<div class="gz${BLITZ === key + ':' + i ? ' blitz' : ''}" data-i="${i}">
      ${bildF || lbild(x, i) ? `<button class="gz__b" type="button" data-akt="edit" tabindex="-1" aria-hidden="true">${bildK(x, i)}</button>` : ''}
      <button class="gz__t" type="button" data-akt="edit" title="Bearbeiten"><b>${h(listeName(x, g)) || '<i>ohne Namen</i>'}</b>${zweit.map(f => feldWert(x, f)).filter(Boolean).length ? `<span>${h(zweit.map(f => feldWert(x, f)).filter(Boolean).join(' · '))}</span>` : ''}</button>
      <span class="gz__s">${st.status[i] === 'neu' ? '<i class="marke rot">Neu im Entwurf</i>' : st.status[i] === 'anders' ? '<i class="marke rot">Geändert</i>' : ''}</span><span class="gz__p"></span>
      <div class="gz__r"><button class="rund" type="button" data-akt="hoch" aria-label="Nach oben"${i === 0 ? ' disabled' : ''}>${SYM.hoch}</button><button class="rund" type="button" data-akt="runter" aria-label="Nach unten"${i === g.liste.length - 1 ? ' disabled' : ''}>${SYM.runter}</button>
        <button class="rund" type="button" data-akt="weg" title="Entfernen" aria-label="Entfernen">${SYM.korb}</button><button class="kn kn--klein kn--linie" type="button" data-akt="edit">Bearbeiten</button></div></div>`;
  return `<section class="blatt gruppe" data-l="${h(key)}"><div class="gruppe__k"><h3>${h(g.label)}<span>${String(g.liste.length).padStart(2, '0')}</span></h3>${g.eigen ? '<i class="marke rot">Im Entwurf geändert</i>' : ''}<button class="kn kn--klein" type="button" data-akt="neu">${wort} hinzufügen<i>${PF}</i></button></div>
    ${g.hinweis ? `<p class="gruppe__hin">${h(g.hinweis)}</p>` : ''}
    <div class="zeilen">${g.liste.map(zeile).join('')}${st.weg.map(y => `<div class="gz weg"><span class="gz__t"><b>${h(listeName(y, g))}</b></span><span class="gz__s"><i class="marke grau">Entfernt, noch nicht veröffentlicht</i></span><span class="gz__p"></span><div class="gz__r"><button class="kn kn--klein kn--linie" type="button" data-akt="hol" data-n="${h(listeName(y, g))}">Zurückholen</button></div></div>`).join('')}
      ${g.liste.length || st.weg.length ? '' : '<p class="gz leer">Noch nichts in dieser Liste.</p>'}</div>
    ${g.eigen ? '<div class="gruppe__f"><button class="link" type="button" data-akt="std">Alle Änderungen in dieser Liste zurücknehmen</button></div>' : ''}</section>`;
}
function listenKlick(ev) {
  const b = ev.target.closest('[data-akt]'), sec = b && b.closest('[data-l]');
  if (!sec) return false;
  const key = sec.dataset.l, g = Zt.listen[key], z = b.closest('.gz'), i = z && z.dataset.i !== undefined ? +z.dataset.i : -1, akt = b.dataset.akt;
  const alt = g.liste.map(x => ({ ...x })), l = alt.map(x => ({ ...x }));
  const sende = async (liste, titel, text) => { if (await tun({ art: 'liste', key, liste }, { titel, text, id: 'l:' + key, zurueck: { art: 'liste', key, liste: alt } })) neuZeichnen(); };
  if (akt === 'neu') listeFenster(key);
  else if (akt === 'edit') listeFenster(key, i);
  else if (akt === 'std') frage('Änderungen <em>zurücknehmen?</em>', `«${h(g.label)}» steht danach wieder so da wie auf der Website.`, 'Zurücknehmen', async () => { await aendern({ art: 'verwerfen', id: 'l:' + key }); sag('Zurückgenommen: ' + g.label); neuZeichnen(); });
  else if (akt === 'hol') { const y = g.stand.find(x => listeName(x, g) === b.dataset.n), pos = platzNach(g.stand, y, l, x => listeName(x, g), x => listeName(x, g)); l.splice(pos, 0, { ...y }); BLITZ = key + ':' + pos; sende(l, 'Wieder da', listeName(y, g)); }
  else if (akt === 'hoch' && i > 0) { [l[i - 1], l[i]] = [l[i], l[i - 1]]; BLITZ = key + ':' + (i - 1); sende(l, 'Reihenfolge gespeichert', listeName(l[i - 1], g)); }
  else if (akt === 'runter' && i < l.length - 1) { [l[i + 1], l[i]] = [l[i], l[i + 1]]; BLITZ = key + ':' + (i + 1); sende(l, 'Reihenfolge gespeichert', listeName(l[i + 1], g)); }
  else if (akt === 'weg') frage('Eintrag <em>entfernen?</em>', `«${h(listeName(alt[i], g))}» verschwindet aus «${h(g.label)}». Bis zum Veröffentlichen können Sie es zurückholen.`, 'Entfernen', async () => { l.splice(i, 1); await sende(l, 'Entfernt', listeName(alt[i], g)); });
  else return false;
  return true;
}
function listenAnsicht(name) {
  const a = LISTEN[name];
  sicht.innerHTML = `<div class="in">${kopf(a.titel, a.text, `<a class="kn kn--linie" href="/entwurf/${a.seite}" target="_blank" rel="noopener">Seite im Entwurf ansehen</a>`)}${a.keys.map(listeBlatt).join('')}</div>`;
  const blitz = $('.gz.blitz', sicht);
  BLITZ = null;
  if (blitz) blitz.scrollIntoView({ block: 'center' });
  sicht.querySelector('.in').addEventListener('click', listenKlick);
}
function feldH(f, wert, id) {
  const [k, label, art] = f;
  if (art === 'id') return '';
  if (art === 'lang') return `<label class="feld"><span>${h(label)}</span><textarea id="${id}" rows="4">${h(wert ?? '')}</textarea></label>`;
  if (art === 'liste') return `<label class="feld"><span>${h(label)}</span><textarea id="${id}" rows="4" placeholder="Eine Zeile je Punkt">${h((wert || []).join('\n'))}</textarea></label>`;
  if (art === 'zahl') return `<label class="feld"><span>${h(label)}</span><input id="${id}" inputmode="decimal" value="${h(String(wert ?? '').replace('.', ','))}"></label>`;
  if (art === 'bild') return `<div class="feld" data-bildfeld="${k}"><span>${h(label)}</span><div class="fotowahl">${wert ? `<img src="${bildadr(wert)}" alt="">` : `<div class="fotowahl__leer">${HZ('z')}</div>`}<div><button class="kn kn--klein kn--linie" type="button" data-akt="vorrat">Aus dem Vorrat</button><button class="kn kn--klein kn--linie" type="button" data-akt="foto">${wert ? 'Anderes Foto hochladen' : 'Foto hochladen'}</button>${wert ? '<button class="link" type="button" data-akt="ohnefoto">Ohne Foto</button>' : ''}</div></div></div>`;
  if (art === 'bilder') return `<div class="feld" data-bilderfeld="${k}"><span>${h(label)}</span><div class="fotos">${(wert || []).map((b, i) => `<div class="foto"><img src="${bildadr(b)}" alt="">${i === 0 ? '<i>Grosses Foto</i>' : `<button class="foto__v" type="button" data-akt="fvor" data-i="${i}">Als grosses Foto</button>`}<button class="foto__x" type="button" data-akt="fweg" data-i="${i}" aria-label="Foto entfernen">${SYM.zu}</button></div>`).join('')}
      ${(wert || []).length < 8 ? `<button class="foto foto--neu" type="button" data-akt="fvorrat"><b>+</b><span>Aus dem Vorrat</span></button><button class="foto foto--neu" type="button" data-akt="fneu"><b>↑</b><span>Hochladen</span></button>` : ''}</div><small>Das erste Foto ist das grosse. Höchstens acht.</small></div>`;
  return `<label class="feld"><span>${h(label)}</span><input id="${id}" maxlength="400" value="${h(wert ?? '')}"></label>`;
}
function listeFenster(key, i) {
  const g = Zt.listen[key], neu = i === undefined, st = neu ? {} : JSON.parse(JSON.stringify(g.liste[i]));
  const wort = g.wort || WORTE[key] || 'Eintrag';
  fenster(`<h2>${neu ? `${h(wort)} <em>hinzufügen.</em>` : `${h(wort)} <em>bearbeiten.</em>`}</h2><p class="form2__ort" style="margin-top:6px">${h(g.label)}</p>
    <div class="form1">${g.felder.map((f, n) => feldH(f, st[f[0]], 'lf-' + n)).join('')}</div>
    <div class="fehler" id="lf-f" role="alert"></div>
    <div class="fenster__kn"><button class="kn kn--linie" type="button" data-zu>Abbrechen</button><button class="kn kn--dunkel" type="button" id="lf-ok">${neu ? 'Hinzufügen' : 'Speichern'}<i>${PF}</i></button></div>`, true);
  const f = $('#fenster');
  const lies = () => { g.felder.forEach((fd, n) => { const el = $('#lf-' + n); if (!el) return; st[fd[0]] = fd[2] === 'liste' ? el.value.split('\n').map(x => x.trim()).filter(Boolean) : el.value; }); };
  const neuMal = () => { lies(); const bf = g.felder.find(x => x[2] === 'bild'), bl = g.felder.find(x => x[2] === 'bilder'); if (bf) $(`[data-bildfeld="${bf[0]}"]`).outerHTML = feldH(bf, st[bf[0]], ''); if (bl) $(`[data-bilderfeld="${bl[0]}"]`).outerHTML = feldH(bl, st[bl[0]], ''); };
  f.onclick = async ev => {
    const b = ev.target.closest('[data-akt]');
    if (!b) return;
    const bf = g.felder.find(x => x[2] === 'bild'), bl = g.felder.find(x => x[2] === 'bilder'), ix = +b.dataset.i;
    lies();
    if (b.dataset.akt === 'foto') { const r = await hochladen(''); if (r) { st[bf[0]] = r.key; neuMal(); } }
    if (b.dataset.akt === 'vorrat') bildWahl(k => { st[bf[0]] = k; neuMal(); });
    if (b.dataset.akt === 'ohnefoto') { st[bf[0]] = ''; neuMal(); }
    if (b.dataset.akt === 'fneu') { const r = await hochladen(''); if (r) { st[bl[0]] = (st[bl[0]] || []).concat([r.key]); neuMal(); } }
    if (b.dataset.akt === 'fvorrat') bildWahl(k => { st[bl[0]] = (st[bl[0]] || []).concat([k]); neuMal(); });
    if (b.dataset.akt === 'fweg') { st[bl[0]].splice(ix, 1); neuMal(); }
    if (b.dataset.akt === 'fvor') { st[bl[0]].unshift(st[bl[0]].splice(ix, 1)[0]); neuMal(); }
  };
  $('#lf-ok').addEventListener('click', async ev => {
    lies();
    const fe = $('#lf-f');
    fe.textContent = '';
    if (!listeName(st, g)) { fe.textContent = 'Bitte mindestens das erste Feld ausfüllen.'; return; }
    const alt = g.liste.map(x => ({ ...x })), liste = alt.map(x => ({ ...x }));
    if (neu) liste.push(st); else liste[i] = st;
    ev.target.disabled = true;
    const ok = await tun({ art: 'liste', key, liste }, { titel: neu ? `${wort} hinzugefügt` : `${wort} gespeichert`, text: `${listeName(st, g)} · ${g.label}`, id: 'l:' + key, zurueck: { art: 'liste', key, liste: alt } });
    ev.target.disabled = false;
    if (!ok) return;
    fensterZu();
    BLITZ = key + ':' + (neu ? liste.length - 1 : i);
    const zielA = Object.entries(LISTEN).find(([, a]) => a.keys.includes(key));
    if (W) neuLaden({}); else if (zielA && location.hash !== '#/' + zielA[0]) location.hash = '#/' + zielA[0]; else neuZeichnen();
  });
  const erstes = $('#lf-0');
  if (erstes) erstes.focus();
}

// ---------------------------------------------------------------- Hinweis für Gäste
function hinweisS() {
  const hw = Zt.hinweis, aktiv = hw.an && hw.text;
  sicht.innerHTML = `<div class="in">${kopf('Hinweis für <em>Gäste.</em>', 'Ein Streifen unten auf jeder Seite: Betriebsferien, Feiertage, geschlossene Gesellschaft. Sie können ihn zeitlich begrenzen, dann verschwindet er von selbst. Gäste können ihn wegtippen.')}
    <section class="blatt" style="max-width:760px"><div class="form1">
      ${schalter('hw-an', hw.an, 'Hinweis zeigen')}
      <label class="feld"><span>Text</span><textarea id="hw-text" rows="2" maxlength="300" placeholder="z. B. Betriebsferien vom 3. bis 20. November. Ab dem 21. sind wir wieder für Sie da.">${h(hw.text)}</textarea></label>
      <div class="raster r-2"><label class="feld"><span>Zeigen ab (freiwillig)</span><input id="hw-von" type="date" value="${h(hw.von)}"></label><label class="feld"><span>Zeigen bis (freiwillig)</span><input id="hw-bis" type="date" value="${h(hw.bis)}"></label></div>
      <div class="raster r-2"><label class="feld"><span>Link (freiwillig)</span><select id="hw-link"><option value="">Kein Link</option>${Zt.seiten.map(s => `<option value="${h(s.datei)}"${hw.link === s.datei ? ' selected' : ''}>${h(s.name)}</option>`).join('')}</select></label><label class="feld"><span>Beschriftung des Links</span><input id="hw-lt" maxlength="60" value="${h(hw.linktext)}" placeholder="Mehr"></label></div>
      <div class="feld"><span>So sieht es aus</span><div class="hwvor${aktiv ? '' : ' aus'}" id="hw-vor"></div></div>
      <div class="sichern offen" style="position:static;margin:0"><i></i><span id="hw-stand"></span><button class="kn kn--klein" type="button" id="hw-ok">Speichern<i>${PF}</i></button></div>
    </div></section></div>`;
  const vorS = () => { const t = $('#hw-text').value.trim(), lt = $('#hw-lt').value.trim() || 'Mehr', an = $('#hw-an').checked; $('#hw-vor').className = 'hwvor' + (an && t ? '' : ' aus'); $('#hw-vor').innerHTML = `${HZ('z')}<p>${h(t || 'Ihr Hinweis …')}${$('#hw-link').value ? ` <a>${h(lt)}</a>` : ''}</p>`; $('#hw-stand').textContent = an && t ? 'Wird unten auf jeder Seite gezeigt' : 'Ausgeschaltet, nichts zu sehen'; };
  vorS();
  sicht.querySelector('.in').addEventListener('input', vorS);
  $('#hw-ok').addEventListener('click', async () => {
    const neu = { an: $('#hw-an').checked, text: $('#hw-text').value, von: $('#hw-von').value, bis: $('#hw-bis').value, link: $('#hw-link').value, linktext: $('#hw-lt').value };
    if (await tun({ art: 'hinweis', hinweis: neu }, { titel: neu.an && neu.text.trim() ? 'Hinweis gespeichert' : 'Hinweis ausgeschaltet', text: neu.text.trim().slice(0, 80), id: 'h:hinweis', zurueck: { art: 'hinweis', hinweis: hw } })) neuZeichnen();
  });
}

// ---------------------------------------------------------------- Google-Texte und Bildbeschreibungen
function googleS(filter) {
  const datei = filter && Zt.seo[filter] ? filter : 'index.html', so = Zt.seo[datei], sd = Zt.seiten.find(s => s.datei === datei);
  if (!so) return kaputt();
  const alts = Object.entries(Zt.alt).filter(([k]) => Zt.bilder.some(b => b.key === k && b.seiten.some(x => x.datei === datei)));
  sicht.innerHTML = `<div class="in">${kopf('Google <em>& Co.</em>', 'Was Google und andere Suchmaschinen über jede Seite zeigen, und die Beschreibung jedes Bildes für Menschen, die nicht sehen können.')}
    <div class="filter">${Zt.seiten.map(s => `<button type="button" data-f="${h(s.datei)}" class="${s.datei === datei ? 'an' : ''}">${h(s.name)}</button>`).join('')}</div>
    <section class="blatt" style="max-width:820px"><h3>Bei Google: ${h(sd ? sd.name : datei)}</h3><div class="form1" style="margin-top:16px">
      <label class="feld"><span>Titel (so steht es im Browser-Reiter und bei Google)</span><input id="se-titel" maxlength="120" value="${h(so.eigen.titel || '')}" placeholder="${h(so.titel)}"><small><span id="se-tz">${(so.eigen.titel || so.titel).length}</span> Zeichen, bis 60 sind ideal</small></label>
      <label class="feld"><span>Beschreibung (die zwei Zeilen unter dem Titel)</span><textarea id="se-beschr" rows="3" maxlength="320" placeholder="${h(so.beschr)}">${h(so.eigen.beschr || '')}</textarea><small><span id="se-bz">${(so.eigen.beschr || so.beschr).length}</span> Zeichen, bis 155 sind ideal · leer lassen heisst: Vorgabe behalten</small></label>
      <div class="gvor"><b id="gv-t">${h(so.eigen.titel || so.titel)}</b><i>doldenhorn-ruedihus.ch › ${h(datei.replace('.html', ''))}</i><p id="gv-b">${h(so.eigen.beschr || so.beschr)}</p></div>
      <div class="sichern offen" style="position:static;margin:0"><i></i><span>Google-Text</span><button class="kn kn--klein" type="button" id="se-ok">Speichern<i>${PF}</i></button></div></div></section>
    <h2 class="zw">Bildbeschreibungen<span>${String(alts.length).padStart(2, '0')}</span></h2>
    <section class="blatt" style="padding:4px 0">${alts.map(([k, a]) => `<div class="ware" data-alt="${h(k)}"><img src="${bildVon(k)}" alt=""><label class="feld"><span>Beschreibung${a.eigen ? ' <i class="marke rot">Im Entwurf geändert</i>' : ''}</span><input maxlength="200" value="${h(a.eigen || '')}" placeholder="${h(a.standard || 'Was ist auf dem Bild zu sehen?')}"></label><button class="kn kn--klein kn--linie" type="button" data-akt="alt-ok">Speichern</button></div>`).join('') || '<p class="gz leer">Auf dieser Seite gibt es keine Bilder.</p>'}</section></div>`;
  const wurzel = sicht.querySelector('.in');
  wurzel.addEventListener('input', () => { const t = $('#se-titel').value.trim() || so.titel, b = $('#se-beschr').value.trim() || so.beschr; $('#gv-t').textContent = t; $('#gv-b').textContent = b; $('#se-tz').textContent = t.length; $('#se-bz').textContent = b.length; });
  wurzel.addEventListener('click', async ev => {
    const f = ev.target.closest('[data-f]'), b = ev.target.closest('[data-akt]');
    if (f) { location.hash = '#/google/' + encodeURIComponent(f.dataset.f); return; }
    if (!b) return;
    if (b.dataset.akt === 'alt-ok') { const z = b.closest('[data-alt]'), k = z.dataset.alt, alt = Zt.alt[k].eigen; if (await tun({ art: 'alt', key: k, text: $('input', z).value }, { titel: 'Bildbeschreibung gespeichert', text: $('input', z).value.trim().slice(0, 80) || 'Vorgabe', id: 'a:' + k, zurueck: { art: 'alt', key: k, text: alt } })) neuZeichnen(); }
  });
  $('#se-ok').addEventListener('click', async () => { if (await tun({ art: 'seo', datei, titel: $('#se-titel').value, beschr: $('#se-beschr').value }, { titel: 'Google-Text gespeichert', text: sd ? sd.name : datei, id: 'g:' + datei, zurueck: { art: 'seo', datei, titel: so.eigen.titel || '', beschr: so.eigen.beschr || '' } })) neuZeichnen(); });
}

// ---------------------------------------------------------------- Änderungen
function aenderungenS() {
  const cs = nachZeit(), n = cs.length;
  const pfeil = '<svg viewBox="0 0 22 22"><path d="M3 11h15M13 6l5 5-5 5"/></svg>';
  const kern = c => {
    if (c.art === 'bild') return `<div class="vn"><div class="alt"><span>Vorher</span><img src="${h(c.vorher)}" alt=""></div>${pfeil}<div class="neu"><span>Nachher</span><img src="${h(c.nachher)}" alt=""></div></div>`;
    if (c.art === 'karte' || c.art === 'liste') return `<ul class="punkte">${c.punkte.map(p => `<li class="${p.was}"><i>${{ neu: 'Neu', weg: 'Entfernt', anders: 'Geändert', reihe: 'Sortiert' }[p.was]}</i><div><b>${h(p.name)}</b> <span>${h(p.text)}</span></div></li>`).join('')}</ul>`;
    if (c.art === 'google') return c.teile.map(t => `<div class="vn"><div class="alt"><span>${h(t.feld)} vorher</span>${h(t.vorher) || '–'}</div>${pfeil}<div class="neu"><span>${h(t.feld)} nachher</span>${h(t.nachher)}</div></div>`).join('');
    return `<div class="vn"><div class="alt"><span>Vorher</span>${h(c.vorher) || '–'}</div>${pfeil}<div class="neu"><span>Nachher</span>${h(c.nachher) || '–'}</div></div>`;
  };
  const karteC = c => `<article class="aend" data-id="${h(c.id)}"><div class="aend__z">${Z[ARTZ[c.art] || 'text']}</div>
    <div><h3>${h(c.titel)}<small>${h(c.ort || '')}${c.zeit ? ' · gespeichert ' + vor(c.zeit) : ''}</small></h3>${kern(c)}
      ${c.verwaist ? '<p class="hinweis" style="margin-top:14px">Diese Stelle gibt es auf der Seite nicht mehr. Die Änderung hat deshalb keine Wirkung.</p>' : ''}
      ${c.seiten.length ? `<div class="wo"><span>${c.anzahl > 1 ? mal(c.anzahl, 'Stelle', 'Stellen') + ' auf' : 'Steht auf'}</span>${c.seiten.slice(0, 9).map(s => `<button type="button" data-akt="sehen" data-seite="${h(s.datei)}">${h(s.name)}${s.zahl > 1 ? `<b>${s.zahl}</b>` : ''}</button>`).join('')}</div>` : ''}</div>
    <div class="aend__r">${c.stellen.length ? '<button class="kn kn--klein" type="button" data-akt="sehen">Vorher/Nachher<i>' + PF + '</i></button>' : ''}<button class="link" type="button" data-akt="weg">Zurücknehmen</button></div></article>`;
  sicht.innerHTML = `<div class="in">${kopf('Ände<em>rungen.</em>', n ? 'Das ist im Entwurf gespeichert. Schauen Sie sich jede Stelle vorher und nachher an. Erst mit «Veröffentlichen» sehen es Ihre Gäste.' : '',
      n ? `<button class="kn kn--linie" type="button" data-akt="alles">Alles zurücknehmen</button><button class="kn" type="button" data-akt="raus">${mal(n, 'Änderung', 'Änderungen')} veröffentlichen<i>${PF}</i></button>` : '')}
    ${n ? cs.map(karteC).join('') : `<div class="leerbild">${HZ('z')}<b>Nichts offen.</b><p>Alles, was Sie geändert haben, steht auf der Website.</p><a class="kn kn--dunkel" href="#/uebersicht">Zur Übersicht<i>${PF}</i></a></div>`}</div>`;
  sicht.querySelector('.in').addEventListener('click', ev => {
    const b = ev.target.closest('[data-akt]');
    if (!b || !['sehen', 'weg'].includes(b.dataset.akt)) return;
    ev.stopPropagation();
    aktAenderung(b.dataset.akt, b.closest('.aend').dataset.id, b.dataset.seite);
  });
}
function veroeffentlichen() {
  const cs = nachZeit(), n = cs.length;
  if (!n) return;
  fenster(`<h2>Auf die Website <em>stellen?</em></h2><p>${mal(n, 'Änderung wird', 'Änderungen werden')} sofort für alle sichtbar. Jeden früheren Stand können Sie im Verlauf zurückholen.</p>
    <ul class="quittliste">${cs.map(c => `<li>${Z[ARTZ[c.art] || 'text']}<span>${h(c.satz)}</span></li>`).join('')}</ul>
    <label class="feld" style="margin-top:18px"><span>Notiz für den Verlauf (freiwillig)</span><input id="f-notiz" maxlength="200" placeholder="z. B. Winterkarte"></label>
    <div class="fenster__kn"><button class="kn kn--linie" type="button" data-zu>Abbrechen</button><button class="kn kn--dunkel" type="button" id="f-ok">Jetzt veröffentlichen<i>${PF}</i></button></div>`);
  $('#f-ok').addEventListener('click', async ev => {
    ev.target.disabled = true;
    ev.target.firstChild.textContent = 'Wird veröffentlicht …';
    try {
      Zt = await api('veroeffentlichen', { notiz: $('#f-notiz').value }); melden();
      rand();
      leiste();
      fenster(`<div class="erfolg"><i>${HAKEN}</i><h2>Veröffent<em>licht.</em></h2><p>Die Website zeigt jetzt den neuen Stand. Das ist live:</p></div>
        <ul class="quittliste ok">${cs.map(c => `<li><i>${HAKEN}</i><span>${h(c.satz)}</span></li>`).join('')}</ul>
        <div class="fenster__kn"><a class="kn kn--linie" href="/live/index.html" target="_blank" rel="noopener">Website ansehen</a><button class="kn kn--dunkel" type="button" data-zu>Fertig<i>${PF}</i></button></div>`);
      if (W) neuLaden({}); else zeige(true);
    } catch (e) { sag(e.message, true); ev.target.disabled = false; ev.target.firstChild.textContent = 'Jetzt veröffentlichen'; }
  });
}

// ---------------------------------------------------------------- Vergleich vorher / nachher
function vergleich(c, seiteDatei) {
  const stellen = c.stellen.length ? c.stellen : [];
  if (!stellen.length) return;
  V = { c, stellen, i: Math.max(0, seiteDatei ? stellen.findIndex(s => s.seite === seiteDatei) : 0), geraet: 'rechner', box: {}, seite: {} };
  const v = $('#vergleich');
  v.hidden = false;
  v.innerHTML = `<div class="vgl__k"><button class="rund" type="button" data-akt="zu" title="Schliessen" aria-label="Schliessen">${SYM.zu}</button>
      <h2>${h(c.titel)}<small>${h(c.ort || '')}</small></h2>
      <select id="v-seite" aria-label="Seite"${c.seiten.length < 2 ? ' hidden' : ''}>${c.seiten.map(s => `<option value="${h(s.datei)}">${h(s.name)}${s.zahl > 1 ? ` (${s.zahl} Stellen)` : ''}</option>`).join('')}</select>
      <div class="vgl__nav"><button class="rund" type="button" data-akt="vor" aria-label="Vorherige Stelle">${SYM.links}</button><span id="v-zahl"></span><button class="rund" type="button" data-akt="nach" aria-label="Nächste Stelle">${SYM.rechts}</button>
        <button class="rund an" type="button" data-g="rechner" aria-label="Wie am Rechner">${SYM.rechner}</button><button class="rund" type="button" data-g="handy" aria-label="Wie am Handy">${SYM.handy}</button></div></div>
    <div class="vgl__b" id="v-b">${['vorher', 'entwurf'].map(p => `<div class="vgl__s"><span>${p === 'vorher' ? 'Vorher <b>so steht es jetzt auf der Website</b>' : 'Nachher <b>so sieht es nach dem Veröffentlichen aus</b>'}</span>
      <div class="vgl__r"><iframe id="v-${p}" title="${p === 'vorher' ? 'Vorher' : 'Nachher'}"></iframe><div class="vgl__m" id="vm-${p}"></div><div class="vgl__leer" id="vl-${p}" hidden></div></div></div>`).join('')}</div>`;
  v.onclick = ev => {
    const b = ev.target.closest('button');
    if (!b) return;
    if (b.dataset.akt === 'zu') return vglZu();
    if (b.dataset.akt === 'vor') V.i = (V.i - 1 + V.stellen.length) % V.stellen.length;
    else if (b.dataset.akt === 'nach') V.i = (V.i + 1) % V.stellen.length;
    else if (b.dataset.g) {
      V.geraet = b.dataset.g;
      $('#v-b').classList.toggle('handy', V.geraet === 'handy');
      $$('.vgl__r', v).forEach(r => r.classList.toggle('handy', V.geraet === 'handy'));
      $$('[data-g]', v).forEach(x => x.classList.toggle('an', x === b));
      V.passe.forEach(f => f());
      setTimeout(() => ['vorher', 'entwurf'].forEach(vglMarke), 350);
      return;
    }
    else return;
    vglLade();
  };
  $('#v-seite').addEventListener('change', ev => { V.i = Math.max(0, V.stellen.findIndex(s => s.seite === ev.target.value)); vglLade(); });
  V.passe = [];
  ['vorher', 'entwurf'].forEach(p => {
    const fr = $('#v-' + p);
    V.passe.push(passe(fr, fr.parentNode, 1280));
    fr.addEventListener('load', () => {
      const d = fr.contentDocument;
      if (!d || !d.body || !V) return;
      V.box[p] = richte(d, false).an;
      d.addEventListener('click', ev => { if (ev.target.closest && ev.target.closest('a[href]')) ev.preventDefault(); }, true);
      d.defaultView.addEventListener('wheel', () => requestAnimationFrame(() => { const a = $('#v-' + (p === 'vorher' ? 'entwurf' : 'vorher')); try { a.contentWindow.scrollTo(0, d.defaultView.scrollY); vglRahmen(); } catch (e) {} }), { passive: true });
      d.defaultView.addEventListener('scroll', vglRahmen, { passive: true });
      vglMarke(p);
    });
  });
  vglLade();
}
function vglZu() { V = null; const v = $('#vergleich'); v.hidden = true; v.innerHTML = ''; }
function vglFinde(d, st, p) {
  if (st.oben) return null;
  if (st.b) return d.querySelector(`img[data-b="${st.b}"][data-bn="${st.n}"]`);
  const genau = () => d.querySelector(`[data-e="${st.h}"][data-en="${st.n}"]`);
  if (V.c.art !== 'karte' || p === (st.vorher ? 'vorher' : 'entwurf')) return genau();
  return $$(`[data-e="${st.h}"]`, d).find(e => e.textContent.trim() === st.t) || null;
}
function vglRahmen() {
  if (!V) return;
  ['vorher', 'entwurf'].forEach(p => { const el = V.el && V.el[p]; if (el) rahme(V.box[p], el); });
}
function vglMarke(p) {
  if (!V) return;
  const fr = $('#v-' + p), d = fr.contentDocument, st = V.stellen[V.i], leer = $('#vl-' + p), m = $('#vm-' + p);
  if (!d || !d.body || V.seite[p] !== st.seite || d.readyState === 'loading') return;
  V.el = V.el || {};
  let el = vglFinde(d, st, p);
  leer.hidden = true;
  if (st.oben) { d.defaultView.scrollTo(0, 0); rahme(V.box[p], null); m.innerHTML = ''; V.el[p] = null; return; }
  if (el) {
    zeig(el);
    el = el.closest('.gang,.jl__k,.zimmer') || el;
    el.scrollIntoView({ block: 'center', inline: 'center' });
    if (!rahme(V.box[p], el)) { leer.hidden = false; leer.textContent = 'Diese Stelle ist auf der Seite gerade eingeklappt und erst nach einem Klick zu sehen.'; }
  } else {
    rahme(V.box[p], null);
    leer.hidden = false;
    leer.textContent = p === 'vorher' ? 'Hier stand das vorher noch nicht.' : 'Hier steht es nach dem Veröffentlichen nicht mehr.';
  }
  V.el[p] = el;
  const hoehe = d.documentElement.scrollHeight || 1;
  m.innerHTML = V.stellen.map((s, i) => {
    if (s.seite !== st.seite) return '';
    const e = i === V.i ? el : vglFinde(d, s, p);
    const r = e && e.getBoundingClientRect();
    return r && (r.width || r.height) ? `<i class="${i === V.i ? 'an' : ''}" style="top:${((r.top + d.defaultView.scrollY) / hoehe * 100).toFixed(2)}%"></i>` : '';
  }).join('');
}
function vglLade() {
  const st = V.stellen[V.i], name = (V.c.seiten.find(s => s.datei === st.seite) || {}).name || st.seite;
  $('#v-zahl').textContent = `Stelle ${V.i + 1} von ${V.stellen.length} · ${name}`;
  $('#v-seite').value = st.seite;
  ['vorher', 'entwurf'].forEach(p => {
    const fr = $('#v-' + p);
    if (V.seite[p] !== st.seite) { V.seite[p] = st.seite; V.el = {}; fr.src = `/${p}/${encodeURIComponent(st.seite)}?nomotion`; } else vglMarke(p);
  });
}

// ---------------------------------------------------------------- Kontrolle (eigene Seite, hier eingebettet) und Notfall-Ansicht
function kontrolleS() {
  sicht.innerHTML = `<div class="werk" style="grid-template-rows:minmax(0,1fr);grid-template-columns:minmax(0,1fr)"><iframe id="k-rahmen" title="Kontrolle" src="kontrolle.html?eingebettet=1" style="width:100%;height:100%;border:0;background:var(--papier)"></iframe></div>`;
}
function kaputt(e) {
  sicht.innerHTML = `<div class="in"><div class="leerbild">${HZ('z')}<b>Diese Ansicht lässt sich gerade nicht zeigen.</b><p>${h(e ? e.message : 'Die Seite ist noch nicht gebaut oder das Verzeichnis fehlt.')} Die Kontrolle zeigt, woran es liegt und was hilft.</p><a class="kn kn--dunkel" href="#/kontrolle">Zur Kontrolle<i>${PF}</i></a></div></div>`;
}

// ---------------------------------------------------------------- Verlauf und Zugang
function verlauf() {
  const vs = Zt.verlauf;
  sicht.innerHTML = `<div class="in">${kopf('Ver<em>lauf.</em>', vs.length ? 'Jede Veröffentlichung wird aufgehoben. Holen Sie einen früheren Stand zurück, liegt er zuerst als Entwurf bereit. Sie prüfen ihn und veröffentlichen dann.' : '')}
    ${vs.length ? `<ol class="lauf">${vs.map((v, i) => `<li><div class="blatt"><div><time>${v.anfang ? 'Ursprünglicher Stand' : datum(v.zeit)}</time>
      <p>${v.anfang ? 'So war die Website, bevor im Studio zum ersten Mal etwas geändert wurde.' : (v.notiz ? `<b>${h(v.notiz)}</b> · ` : '') + h(v.punkte.slice(0, 6).join(' · ')) + (v.punkte.length > 6 ? ` und ${v.punkte.length - 6} weitere` : '')}</p></div>
      ${i === 0 ? '<span class="mono leise">Das ist der Stand der Website</span>' : `<button class="kn kn--klein kn--linie" type="button" data-id="${h(v.id)}">Diesen Stand zurückholen</button>`}</div></li>`).join('')}</ol>`
    : `<div class="leerbild">${HZ('z')}<b>Noch nichts veröffentlicht.</b><p>Sobald Sie zum ersten Mal etwas veröffentlichen, finden Sie hier jeden Stand der Website und können ihn zurückholen.</p></div>`}</div>`;
  sicht.querySelector('.in').addEventListener('click', ev => {
    const b = ev.target.closest('[data-id]');
    if (!b) return;
    frage('Stand <em>zurückholen?</em>', 'Der frühere Stand wird als Entwurf geladen. Was Sie gerade an unveröffentlichten Änderungen haben, wird dabei ersetzt. Auf der Website ändert sich erst etwas, wenn Sie veröffentlichen.', 'Zurückholen', async () => {
      Zt = await api('zurueck', { id: b.dataset.id }); melden();
      sag('Der frühere Stand liegt als Entwurf bereit.');
      location.hash = '#/aenderungen';
    });
  });
}
function zugang() {
  if (PROBE) {
    sicht.innerHTML = `<div class="in">${kopf('Zu<em>gang.</em>', 'Die Probe-Fassung braucht kein Passwort. Jeder Besucher arbeitet in seiner eigenen Kopie, die echte Website bleibt, wie sie ist.')}
      <section class="blatt" style="max-width:640px"><h3>Im echten Studio</h3><p style="margin-top:12px;color:rgba(42,26,14,.72)">Dort legen Sie beim ersten Öffnen Ihr eigenes Passwort fest und können es hier jederzeit ändern. Nach zwölf Stunden meldet es Sie von selbst ab.</p></section></div>`;
    return;
  }
  if (OFFEN) {
    sicht.innerHTML = `<div class="in">${kopf('Zu<em>gang.</em>', 'Das Studio ist gerade ohne Passwort offen. Sobald Sie wirklich damit arbeiten, wird der Schutz wieder eingeschaltet.')}
      <section class="blatt" style="max-width:640px"><h3>Offen</h3><p style="margin-top:12px;color:rgba(42,26,14,.72)">Jeder, der die Adresse kennt, kann gerade ändern und veröffentlichen. Zum Einschalten des Schutzes sagen Sie Robert Bescheid.</p></section></div>`;
    return;
  }
  sicht.innerHTML = `<div class="in">${kopf('Zu<em>gang.</em>', 'Das Studio ist mit einem Passwort geschützt. Nach zwölf Stunden meldet es Sie von selbst ab.')}
    <div class="raster r-2"><section class="blatt"><h3>Passwort ändern</h3><form id="z-form" style="display:grid;gap:14px;margin-top:18px" autocomplete="off">
      <label class="feld"><span>Bisheriges Passwort</span><input type="password" name="alt" autocomplete="current-password" required></label>
      <label class="feld"><span>Neues Passwort</span><input type="password" name="neu" autocomplete="new-password" required minlength="10"><small>Mindestens 10 Zeichen</small></label>
      <label class="feld"><span>Noch einmal</span><input type="password" name="neu2" autocomplete="new-password" required></label>
      <div class="fehler" role="alert" style="text-align:left"></div><div><button class="kn kn--dunkel" type="submit">Passwort ändern<i>${PF}</i></button></div></form></section>
    <section class="blatt"><h3>Abmelden</h3><p style="margin:14px 0 20px;color:rgba(42,26,14,.72)">An einem fremden Rechner melden Sie sich am besten ab, wenn Sie fertig sind. Entwürfe bleiben erhalten.</p><button class="kn kn--linie" type="button" data-akt="abmelden">Abmelden</button></section></div>
    <h2 class="zw">Wenn etwas hakt</h2><section class="blatt" style="max-width:640px"><h3>Kontrolle</h3><p style="margin:12px 0 18px;color:rgba(42,26,14,.72)">Die Kontrolle prüft das Studio von innen: Dateien, Bau der Seite, Bilder, Zugang. Sie läuft auch dann, wenn das übrige Werkzeug nicht mehr lädt.</p><a class="kn kn--linie" href="#/kontrolle">Kontrolle öffnen</a> <a class="link" href="kontrolle.html" target="_blank" rel="noopener" style="margin-left:14px">Als eigene Seite</a></section></div>`;
  const f = $('#z-form');
  f.addEventListener('submit', async ev => {
    ev.preventDefault();
    const fe = $('.fehler', f);
    fe.textContent = '';
    if (f.neu.value !== f.neu2.value) { fe.textContent = 'Die beiden neuen Eingaben sind nicht gleich.'; return; }
    try { await api('passwort', { alt: f.alt.value, neu: f.neu.value }); f.reset(); sag('Das Passwort ist geändert.'); } catch (e) { fe.textContent = e.message; }
  });
}

// ---------------------------------------------------------------- Fenster
function fenster(html, breit) {
  const f = $('#fenster');
  f.hidden = false;
  f.oninput = f.onclick = f.bei = null;
  $$('.quitt').forEach(x => { if (!html.includes('class="erfolg"')) x.remove(); });
  f.innerHTML = `<div class="fenster__k${breit ? ' breit' : ''}" role="dialog" aria-modal="true"><button class="rund zu" type="button" data-zu aria-label="Schliessen">${SYM.zu}</button>${html}</div>`;
  const erstes = $('input,button.kn', f);
  if (erstes) erstes.focus();
}
function fensterZu() { const f = $('#fenster'); f.hidden = true; f.innerHTML = ''; }
function frage(titel, text, knopf, tunF) {
  fenster(`<h2>${titel}</h2><p>${text}</p><div class="fenster__kn"><button class="kn kn--linie" type="button" data-zu>Abbrechen</button><button class="kn kn--dunkel" type="button" id="f-ja">${knopf}<i>${PF}</i></button></div>`);
  $('#f-ja').addEventListener('click', async () => { try { await tunF(); fensterZu(); } catch (e) { sag(e.message, true); } });
}
$('#fenster').addEventListener('click', ev => { if (ev.target.closest('[data-zu]')) fensterZu(); });
$('#fenster').addEventListener('wahl', ev => { const f = $('#fenster'); if (f.bei) f.bei(ev); });
$('#lade').addEventListener('click', ev => { if (ev.target.id === 'lade') ladeZu(); });
addEventListener('keydown', ev => {
  if (ev.key !== 'Escape') return;
  if (!$('#fenster').hidden) fensterZu(); else if (V) vglZu(); else if (!$('#lade').hidden) ladeZu();
});
document.addEventListener('click', async ev => {
  const b = ev.target.closest('[data-akt]');
  if (!b) return;
  const akt = b.dataset.akt, imLade = b.closest('#lade');
  if (akt === 'abmelden') { try { await api('abmelden', {}); } catch (e) {} Zt = null; ladeZu(); tor('an'); }
  if (akt === 'lade') { if ($('#lade').hidden) lade(); else ladeZu(); }
  if (akt === 'ladezu') ladeZu();
  if (akt === 'raus' || akt === 'alles') aktAenderung(akt);
  if (imLade && (akt === 'sehen' || akt === 'weg')) aktAenderung(akt, b.closest('[data-id]').dataset.id);
  if (b.dataset.akt === 'geraet' && W) {
    $('#w-buehne').classList.toggle('handy', b.dataset.g === 'handy');
    W.passe();
    $$('[data-akt="geraet"]').forEach(x => x.classList.toggle('an', x === b));
    setTimeout(() => { if (W && W.sel) rahme(W.an, W.sel.el); }, 300);
  }
});

(async () => {
  try {
    const z = await fetch('/assets/logo/zeichen.svg').then(r => r.text()).catch(() => '');
    const vb = z.match(/viewBox="([^"]+)"/), innen = z.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
    if (vb && innen) { ZVB = vb[1]; $('#zeichen').innerHTML = innen[1]; }
    const s = await api('status');
    OFFEN = !!s.offen;
    PROBE = !!s.probe;
    if (s.offen || s.probe) await laden(); else if (!s.eingerichtet) tor('neu'); else if (!s.angemeldet) tor('an'); else await laden();
  } catch (e) {
    merkeFehler('Start', e.message);
    document.body.insertAdjacentHTML('beforeend', `<div style="position:fixed;inset:0;display:grid;place-items:center;padding:24px;background:#1f1209;color:#efe4d3;font-family:'Instrument Sans',system-ui,sans-serif;text-align:center"><div style="max-width:460px"><p style="font:700 2rem/1.1 Gelasio,Georgia,serif;margin:0 0 14px">Das Studio lädt gerade nicht.</p><p style="margin:0 0 22px;opacity:.8">${h(e.message)}</p><a href="kontrolle.html" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#efe4d3;color:#2a1a0e;text-decoration:none;font-weight:600">Zur Kontrolle</a><p style="margin-top:18px;font-size:13px;opacity:.6">Die Kontrolle prüft Server, Dateien und Bau der Seite und sagt, was zu tun ist.</p></div></div>`);
  }
})();
})();
