/* Prüfung des Schreibtischs · Landgasthof Ruedihus (R23, 17.10.2026). Aus der Kontrolle des Studios (studio/kontrolle.html, 09.10.2026) als eigene Datei:
   online lässt die Sicherheitsregel nur Skripte mit bekannter Prüfsumme zu (Falle Carlton 16.10.2026), deshalb kein eingebettetes Skript.
   Dazu: Lexikon der Meldungen mit Stichwort (#m-<stichwort>), Reparaturen erst nach dem zweiten Klick, Fehler des Schreibtischs aus dem Browser. */
(() => {
'use strict';
const $ = s => document.querySelector(s);
const h = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const EINGEBETTET = /[?&]eingebettet=1/.test(location.search);
if (EINGEBETTET) document.body.classList.add('eingebettet');
// Die eine Fehlerquelle, die der Server nicht selbst melden kann: dass er nicht antwortet. Deshalb steht sie hier, nicht nur im Lexikon des Servers.
const OHNE_SERVER = { id: 'server', titel: 'Server antwortet nicht', text: 'Die Kontrolle erreicht das Studio nicht. Dann lädt auch die Website nicht.',
  abhilfe: 'Lokal: im Projektordner «python3 serve.py 8917» starten (oder den Rechner neu starten, der Dienst kommt wieder). Online: einige Minuten warten, dann neu laden. Bleibt es so, Robert Bescheid geben.' };
/* Meldungen des Schreibtischs mit Stichwort («STELLE · …»): «Was tun?» in der Quittung öffnet hier #m-<stichwort> (Grundlage: Lexikon des Doldenhorn, 17.10.2026) */
const STICHWORTE = [["m-konflikt", "KONFLIKT · In einem anderen Fenster wurde gespeichert", "Der Schreibtisch ist in zwei Fenstern (oder auf zwei Rechnern) offen, und im anderen wurde inzwischen gespeichert.", "Damit nichts still überschrieben wird, nimmt der Schreibtisch die Eingabe nicht an. Ihre gelben Eingaben sind noch da, die Liste ist neu geladen.", "Ansehen, was das andere Fenster gespeichert hat, dann noch einmal «Speichern». Am besten nur in einem Fenster arbeiten.", "studio_bureau.py basis()/_gleich(): Fingerabdruck von entwurf.json, 409."], ["m-herkunft", "HERKUNFT · Anfrage von einer fremden Seite", "Eine schreibende Anfrage kam nicht vom Schreibtisch selbst, sondern von einer anderen Adresse.", "Abgewiesen (403). So kann keine fremde Seite heimlich etwas an der Website ändern.", "Den Schreibtisch immer über seine eigene Adresse öffnen. Erscheint die Meldung beim normalen Arbeiten: Robert Bescheid sagen.", "studio.py H.herkunft_fremd(): Origin ≠ Host oder «null» → 403; fremder Host → 421 (localhost, 127.0.0.1)."], ["m-grenze", "GRENZE · Zu viele Anfragen in kurzer Zeit", "Mehr als 60 Speicherungen oder 600 Abfragen in einer Minute vom selben Rechner.", "Der Schreibtisch macht eine Minute Pause, damit niemand den Server überlasten kann. Nichts geht verloren.", "Eine Minute warten, dann noch einmal.", "studio.py zu_viele(): 60 schreibend / 600 lesend je Absender und Minute, 429 mit Retry-After: 60, Eintrag im Protokoll."], ["m-groesse", "GROESSE · Die Anfrage ist zu gross", "Eine Datei oder Eingabe ist grösser als 32 MB (ein Foto: höchstens 25 MB).", "Abgewiesen, bevor sie den Server belastet.", "Foto kleiner exportieren: für die Website reichen 2000 Pixel Breite (meist 1 bis 3 MB).", "studio.py do_POST: 413 über 32 MB (b/hochladen 36 MB, weil Base64); bureau.js weist über 25 MB schon im Browser ab."], ["m-stelle", "STELLE · Diese Stelle oder Seite gibt es nicht mehr", "Ein Text, Abschnitt oder eine Seite, die der Schreibtisch gerade zeigt, steht nach einem Umbau der Website nicht mehr da.", "Die Website wurde inzwischen neu gebaut. Der Schreibtisch kennt die alte Stelle noch.", "Seite neu laden. Bleibt es: unter «Entwurf & Vergleich» nachsehen, ob die Änderung ihre Stelle verloren hat, und neu eingeben.", "studio.py aendern_auf (aus, text) und studio_bureau.seite(): Fingerabdruck der Stelle (inhalt._kern) nicht mehr im Bau."], ["m-bild", "BILD · Mit dem Foto stimmt etwas nicht", "Ein hochgeladenes Foto ist zu klein (unter 900 Pixel, für Startbild, Seitenköpfe und Fenster unter 1400), zu gross (über 25 MB), kein Bild (Text, PDF) oder ein iPhone-Foto im HEIC-Format.", "Das Foto wurde nicht übernommen. Auf der Website ändert sich nichts.", "Ein JPG, PNG oder WebP nehmen, mindestens 900, besser 2000 Pixel breit. iPhone: unter Einstellungen → Kamera → Formate «Maximale Kompatibilität».", "studio_bureau.hochladen() → studio.py bild_annehmen(): Pillow öffnet, neu kodiert als WebP 900/1500/volle Breite (-s/-m/-l). Startbild/Fenster: eigene Rechnung mit Abdunklung (studio.py fest_rechnen)."], ["m-eingabe", "EINGABE · Die Eingabe passt nicht", "Ein Feld ist leer, wo etwas stehen muss, oder die Anfrage liess sich nicht lesen.", "Nichts wurde gespeichert. Ihre Eingabe steht noch im Feld.", "Den Satz der Meldung lesen und das Feld ergänzen. Um etwas ganz wegzunehmen: «Abschnitt ausblenden» statt leeren Text.", "studio_bureau._op() / studio.py aendern_auf(): Fehler → 422 mit Stichwort."], ["m-angabe", "ANGABE · Die Angabe passt nicht", "Telefon ohne Ziffern, E-Mail ohne @, Link ohne https:// oder ein leeres Pflichtfeld.", "Die Angabe wurde nicht übernommen, damit kein falscher Knopf auf der Website steht.", "Telefon wie (+41) 033 675 81 81, E-Mail vollständig, Links mit https:// am Anfang.", "studio.py fakt_setzen(): Prüfung je Art (mail, link, pdf, kontakt.telefon)."], ["m-hinweis", "HINWEIS · Der Hinweis für Gäste passt nicht", "Hinweis eingeschaltet ohne Text, Datum nicht lesbar oder Link ohne https://.", "Nicht gespeichert, das Band auf der Website bleibt, wie es war.", "Text eintragen, Datum mit dem Kalender wählen, Link mit https:// oder eine Seite wie spa.html.", "studio.py aendern_auf art=hinweis, hinweis_norm(); Gestaltung (farbe, schrift, groesse) setzt studio_inhalt.py ins Band."], ["m-laeuft", "LAEUFT · Es wird gerade veröffentlicht", "Ein Veröffentlichen ist noch nicht fertig.", "Ein zweites startet erst, wenn das erste fertig ist.", "Warten, bis «Ist online.» oder «Nicht veröffentlicht.» erscheint (der Schreibtisch zeigt den Fortschritt auch nach dem Neuladen).", "studio_bureau.LAUF[aktiv], Faden «veroeffentlichen»."], ["m-pruefung", "PRUEFUNG · Vor dem Umschalten ist etwas aufgefallen", "der Schreibtisch setzt beim Veröffentlichen alle Seiten zuerst in einem Bauordner und prüft sie: jede Seite endet sauber, keine Kennzeichen der Vorschau, keine Seite um mehr als 40 % kleiner, keine alte Telefonnummer oder Adresse mehr, jede Änderung an ihrer Stelle.", "Eine Prüfung ist rot. Die Website ist unverändert, Ihr Entwurf ist noch da.", "Den Satz der Meldung lesen. Steht dort «hat ihre Stelle nicht gefunden»: unter «Entwurf & Vergleich» die Änderung neu eingeben. Sonst Robert Bescheid sagen.", "studio.py _pruefe_bau(): Befunde; Bauordner DATEN/_bau/neu-<zeit>, wird danach weggeräumt."], ["m-nachpruefung", "NACHPRUEFUNG · Nach dem Übernehmen nicht gleich", "Nach dem Übernehmen vergleicht der Schreibtisch jede neue Seite Byte für Byte mit der geprüften.", "Eine Seite stimmte nicht (Platte voll, Datei von aussen geändert). Alles wurde aus der Sicherung zurückgestellt: Die Website ist unverändert.", "Noch einmal veröffentlichen. Bleibt es: Robert Bescheid sagen.", "studio.py veroeffentlichen(): Rückstellung aus VERLAUF/<zeit>-dateien."], ["m-bau", "BAU · Die Seiten liessen sich nicht setzen", "Der Bau der Website (bau.py mit den Änderungen) ist gescheitert.", "Nichts wurde gespeichert oder veröffentlicht, die Website ist unverändert.", "Oben «Noch einmal prüfen». Ist der Punkt «Bau» rot, «Entwurf und Vergleich neu bauen». Sonst Robert Bescheid sagen.", "studio.py baue() → studio_inhalt.py bau → bau.py; letzte Zeile von stderr steht in der Meldung, Spur in DATEN/studio.log."], ["m-verlauf", "VERLAUF · Diese Fassung gibt es nicht mehr", "Eine frühere Fassung, die zurückgeholt werden sollte, liegt nicht mehr im Verlauf.", "Nichts wurde geändert.", "Seite neu laden und eine andere Fassung wählen. «Ursprünglicher Stand» geht immer.", "DATEN/verlauf/<id>.json fehlt oder ist beschädigt (Punkt «Verlauf»)."], ["m-rueckgaengig", "RUECKGAENGIG · Dieser Schritt ist nicht mehr da", "der Schreibtisch hebt die letzten 80 Speicherungen für «Rückgängig» auf.", "Ältere Schritte sind weg. Der Entwurf ist unverändert.", "Unter «Entwurf & Vergleich» einzelne Änderungen zurücknehmen oder unter «Frühere Fassungen» zurückholen.", "DATEN/schritte/, die letzten 80 bleiben."], ["m-seite", "SEITE · Das ist keine Seite der Website", "Die Vorschau sollte eine Seite zeigen, die es im Entwurf nicht gibt.", "Meist nach einem Umbau oder einer entfernten eigenen Seite.", "der Schreibtisch neu laden und die Seite neu wählen.", "studio_bureau.vorschau(): Datei im Bau des Entwurfs fehlt."], ["m-weg", "WEG · Unbekannte Anfrage", "der Schreibtisch hat einen Weg angefragt, den der Server nicht kennt.", "Oberfläche und Server passen nicht zusammen (eine Datei wurde ersetzt, die andere noch nicht).", "Seite mit Cmd+Shift+R neu laden.", "studio_bureau.get()/post(): Fassung von bureau.js (?v=) und studio_bureau.py vergleichen."], ["m-zugang", "ZUGANG · Bitte anmelden", "Der Schreibtisch ist mit Passwort geschützt und Sie sind nicht (mehr) angemeldet.", "Die Anmeldung ist abgelaufen (12 Stunden) oder wurde auf einem anderen Gerät beendet.", "Unter «Zugang» anmelden, dann weiterarbeiten. Ungespeicherte Eingaben bleiben im Fenster stehen.", "Datei DATEN/offen = ohne Passwort (bis zur Auslieferung, Robert 15.10.2026)."], ["m-verbindung", "VERBINDUNG · Keine Verbindung zum Schreibtisch", "Der Browser erreicht den Server nicht (Netz weg, Server aus).", "Nichts wurde gespeichert. Ihre Eingaben sind noch im Fenster, gelb markiert.", "Verbindung prüfen, dann noch einmal «Speichern». Die Eingaben gehen nicht verloren, solange das Fenster offen bleibt.", "bureau.js api(): fetch scheitert. Lokal: läuft studio.py auf seinem Port?"], ["m-server", "SERVER · Unerwarteter Fehler", "Etwas, mit dem der Schreibtisch nicht gerechnet hat.", "Der Fehler steht im Protokoll des Servers. Ihre Eingaben sind noch im Fenster.", "Oben «Noch einmal prüfen» und «Bericht kopieren», an Robert schicken.", "DATEN/studio.log (Spur), DATEN/protokoll.log (wer, was, wann)."]];
const FRAGEN = { bauordner: 'Die Bauordner eines abgebrochenen Veröffentlichens werden weggeräumt. Die Website ist davon nie betroffen.', bauen: 'Entwurf und Vergleich werden neu gebaut. Die Website ändert sich nicht.',
  sitzungen: 'Abgelaufene Anmeldungen werden entfernt. Wer angemeldet ist, bleibt es.', log: 'Die Liste der Fehler des Servers wird geleert. Behobene Fehler stehen danach nicht mehr da.',
  dateien: 'Beschädigte Dateien werden ersetzt (eine Kopie bleibt als .kaputt liegen). Ein beschädigter Entwurf wird vom Stand neu angelegt, unveröffentlichte Änderungen darin gehen verloren.',
  verwaist: 'Einträge des Entwurfs, die auf der Seite keine Stelle mehr haben, werden entfernt. Sie wirken ohnehin nirgends.',
  aufraeumen: 'Hochgeladene Fotos, die weder der Stand, noch der Entwurf, noch ein Eintrag im Verlauf nennt, werden vom Laufwerk gelöscht.',
  verlauf: 'Beschädigte Einträge des Verlaufs werden in den Ordner _kaputt verschoben. Sie lassen sich danach nicht mehr zurückholen (vorher ging das auch nicht).',
  live: 'Die veröffentlichte Website wird aus dem veröffentlichten Stand neu geschrieben. Inhaltlich ändert sich nichts.' };
let ZT = null, LEBT = null, BR = [], LEX = null;

function meld(t) { const m = $('#k-meld'); m.textContent = t; m.classList.add('an'); clearTimeout(meld.t); meld.t = setTimeout(() => m.classList.remove('an'), 3200); }
async function hole(weg, o) {
  const r = await fetch(weg, Object.assign({ cache: 'no-store' }, o || {}));
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.fehler || ('Antwort ' + r.status));
  return j;
}
const punktH = (p, lex) => `<div class="punkt ${p.stand}" data-id="${h(p.id)}"><i></i><div><b>${h(p.titel)}</b><p>${h(p.text)}</p>
  ${lex ? `<p class="abhilfe"><b>Abhilfe</b>${h(lex.abhilfe)}</p>` : (p.abhilfe ? `<p class="abhilfe"><b>Abhilfe</b>${h(p.abhilfe)}</p>` : '')}
  ${p.mehr && p.mehr.length ? `<details><summary>${p.mehr.length} Einzelheiten</summary><ul>${p.mehr.map(x => `<li>${h(x)}</li>`).join('')}</ul></details>` : ''}</div>
  <div class="r">${p.aktion ? `<button class="kn kn--klein" type="button" data-aktion="${h(p.aktion)}">${h(p.aktion_name || p.aktion)}</button>` : ''}</div></div>`;
function ampel(stand, titel, text) { const a = $('#k-ampel'); a.className = 'ampel ' + stand; a.innerHTML = `<i></i><div><b>${h(titel)}</b><span>${h(text)}</span></div>`; }
const WORT = { gruen: 'Alles in Ordnung.', gelb: 'Läuft, mit Hinweisen.', rot: 'Etwas ist kaputt.' };

function zeichne() {
  const lexVon = {};
  (ZT ? ZT.lexikon : []).forEach(l => { lexVon[l.id] = l; });
  const server = $('#k-server');
  if (ZT) {
    server.innerHTML = ZT.punkte.map(p => punktH(p, lexVon[p.id])).join('');
    $('#k-n1').textContent = String(ZT.punkte.length).padStart(2, '0');
    const z = ZT.zahl;
    $('#k-zahlen').innerHTML = `<span><b>${z.ok}</b> in Ordnung</span><span><b>${z.info}</b> Hinweise</span><span><b>${z.warn}</b> Warnungen</span><span><b>${z.fehler}</b> Fehler</span><span>Geprüft ${h(ZT.zeit.slice(11, 16))} Uhr · Fassung ${h(ZT.fassung)}</span>`;
  }
  const br = $('#k-browser');
  br.innerHTML = BR.map(p => punktH(p)).join('');
  $('#k-n2').textContent = String(BR.length).padStart(2, '0');
  const alle = (ZT ? ZT.punkte : []).concat(BR).map(p => p.stand);
  const stand = alle.includes('fehler') ? 'rot' : alle.includes('warn') ? 'gelb' : 'gruen';
  if (ZT) ampel(stand, WORT[stand], stand === 'gruen' ? 'Jeder Punkt wurde geprüft, nichts hakt.' : 'Die betroffenen Punkte stehen unten mit Abhilfe. Was sich gefahrlos richten lässt, hat einen Knopf.');
  const lex = $('#k-lex');
  const ohne = Object.assign({ was: 'Antwortet der Server überhaupt.', woran: OHNE_SERVER.text }, OHNE_SERVER);
  const eintraege = ZT ? ZT.lexikon : LEX ? [ohne].concat(LEX) : [ohne];
  lex.innerHTML = eintraege.map(l => `<details id="k-${h(l.id)}"><summary>${h(l.titel)}</summary><dl><dt>Geprüft wird</dt><dd>${h(l.was)}</dd><dt>Woran man es merkt</dt><dd>${h(l.woran)}</dd><dt>Abhilfe</dt><dd>${h(l.abhilfe)}</dd></dl></details>`).join('');
  $('#k-n3').textContent = String(eintraege.length + STICHWORTE.length).padStart(2, '0');
  ziel();
}

/* Stichworte unter #m-<wort> (eigene Kennungen, damit sie nicht mit den Prüfpunkten kollidieren, Fund Doldenhorn F72) */
function stichworte() {
  $('#k-sw').innerHTML = STICHWORTE.map(([id, t, was, heisst, tun, robert]) => `<details id="${h(id)}"><summary>${h(t)}</summary><dl><dt>Was Sie sehen</dt><dd>${h(was)}</dd><dt>Was es heisst</dt><dd>${h(heisst)}</dd><dt>Was tun</dt><dd>${h(tun)}</dd><dt>Für Robert</dt><dd>${h(robert)}</dd></dl></details>`).join('');
}
function ziel() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id) return;
  const d = document.getElementById(id);
  if (!d || d.tagName !== 'DETAILS' || d.dataset.gezeigt) return;
  d.dataset.gezeigt = '1'; d.open = true; d.classList.add('ziel');
  setTimeout(() => d.scrollIntoView({ block: 'start' }), 60);
}
window.addEventListener('hashchange', () => { document.querySelectorAll('#lexikon details[data-gezeigt]').forEach(d => delete d.dataset.gezeigt); ziel(); });

async function browserPruefen() {
  BR = [];
  const p = (id, stand, titel, text, abhilfe) => BR.push({ id, stand, titel, text, abhilfe });
  let t0 = performance.now();
  try {
    LEBT = await hole('/studio/api/lebt');
    if (!LEX) hole('/studio/api/lexikon').then(j => { LEX = j.lexikon || null; zeichne(); }).catch(() => {});
    const ms = Math.round(performance.now() - t0);
    p('verbindung', ms > 2000 ? 'warn' : 'ok', 'Verbindung zum Schreibtisch', `Antwort in ${ms} ms · Fassung ${LEBT.fassung} · Python ${LEBT.python}${LEBT.probe ? ' · Probe-Instanz' : ''}`, 'Dauert es lange: Rechner oder Leitung ausgelastet, oder der Entwurf wird gerade gebaut.');
    if (LEBT.zugang === 'kaputt') p('zugang', 'fehler', 'Zugang', 'Die Passwort-Datei ist beschädigt. Anmelden ist unmöglich.', 'Robert löscht inhalt/zugang.json, danach wird beim nächsten Öffnen ein neues Passwort festgelegt.');
    if (LEBT.zugang === 'offen') p('zugang', 'info', 'Zugang', 'Der Schreibtisch ist ohne Passwort offen (so gewollt bis zur Auslieferung an das Haus, Robert 15.10.2026).', 'Bei der Auslieferung: die Datei «offen» im Datenordner löschen, dann ist der Schutz an.');
    if (LEBT.bau_fehler) p('bau', 'fehler', 'Bau der Seite', 'Der letzte Bau des Entwurfs ist fehlgeschlagen.', 'Anmelden und oben die Einzelheiten lesen; Aktion «Neu bauen» versuchen.');
    const uhr = Math.abs(new Date(LEBT.zeit) - new Date()) / 60000;
    p('uhr', uhr > 5 ? 'warn' : 'ok', 'Uhr von Browser und Server', uhr > 5 ? `Die Uhren gehen ${Math.round(uhr)} Minuten auseinander.` : 'Beide Uhren stimmen überein.', 'Datum und Uhrzeit des Rechners prüfen; der Hinweis für Gäste richtet sich nach dem Datum.');
  } catch (e) {
    p('verbindung', 'fehler', OHNE_SERVER.titel, OHNE_SERVER.text + ' (' + e.message + ')', OHNE_SERVER.abhilfe);
  }
  const datei = async (weg, name, test) => {
    try {
      const r = await fetch(weg, { cache: 'no-store' });
      const t = await r.text();
      if (!r.ok) return p(name, 'fehler', name, `${weg} antwortet ${r.status}.`, 'Datei aus der Sicherung (_sicherung/) zurückkopieren.');
      const m = test(t);
      p(name, m ? 'fehler' : 'ok', name, m || `${weg} · ${Math.round(t.length / 1024)} kB, in Ordnung.`, m ? 'Datei aus der Sicherung (_sicherung/) zurückkopieren.' : '');
    } catch (e) { p(name, 'fehler', name, `${weg} lädt nicht (${e.message}).`, OHNE_SERVER.abhilfe); }
  };
  await datei('/studio/bureau.js', 'Schreibtisch (bureau.js)', t => { try { new Function(t); return ''; } catch (e) { if (e instanceof EvalError) return t.length > 20000 && /\}\)\(\);?\s*$|\}\s*$/.test(t.trim()) ? '' : 'Das Skript ist unvollständig.'; return 'Das Skript hat einen Fehler: ' + e.message; } });   // unter der Sicherheitsregel ist new Function gesperrt (EvalError): dann nur Länge und Schluss prüfen, wie bei studio.js
  await datei('/studio/bureau.css', 'Gestaltung des Schreibtischs (bureau.css)', t => t.includes(':root{') ? '' : 'Die Datei ist nicht die Gestaltung des Schreibtischs.');
  await datei('/studio/studio.js', 'Frühere Ansichten (studio.js)', t => { try { new Function(t); return ''; } catch (e) { if (e instanceof EvalError) return t.length > 20000 && /\}\)\(\);?\s*$|\}\s*$/.test(t.trim()) ? '' : 'Das Skript ist unvollständig.'; return 'Das Skript hat einen Fehler: ' + e.message; } });
  await datei('/studio/studio.css', 'Gestaltung der früheren Ansichten (studio.css)', t => t.includes(':root{') ? '' : 'Die Datei ist nicht die Gestaltung des Studios.');
  await datei('/assets/logo/zeichen.svg', 'Zeichen des Hauses', t => t.includes('<svg') ? '' : 'Die Datei ist kein Zeichen.');
  await datei('/index.html', 'Website (Startseite)', t => t.includes('data-e="') || t.includes('data-q="') ? 'Die veröffentlichte Seite trägt Kennzeichen des Entwurfs.' : (t.includes('<html') ? '' : 'Die Antwort ist keine Seite.'));
  if (LEBT && LEBT.angemeldet) await datei('/entwurf/index.html', 'Entwurf (Startseite)', t => t.includes('data-e="') ? '' : 'Der Entwurf trägt keine Kennzeichen: die Stellen lassen sich im Werkzeug nicht anklicken.');
  p('browser', navigator.cookieEnabled ? 'ok' : 'fehler', 'Browser', `${navigator.userAgent.replace(/Mozilla\/5\.0 \(|\) .*$/g, '').slice(0, 60)} · ${innerWidth || document.documentElement.clientWidth}×${innerHeight || document.documentElement.clientHeight} · ${navigator.language}${navigator.onLine ? '' : ' · offline'}${navigator.cookieEnabled ? '' : ' · Cookies gesperrt'}`, 'Ohne Cookies bleibt die Anmeldung nicht bestehen. Cookies für diese Adresse erlauben.');
  let fehler = [];
  try { fehler = JSON.parse(localStorage.getItem('rh-studio-fehler') || '[]'); } catch (e) {}
  fehler = fehler.map(f => f && f.t !== undefined ? { zeit: f.z || '', wo: 'Schreibtisch', text: String(f.t).replace(/^Schreibtisch: /, '') } : f).filter(Boolean);   // Fehlermelder des Schreibtischs schreibt {z, t}, das frühere Studio {zeit, wo, text}
  const heute = new Date().toISOString().slice(0, 10), frisch = fehler.filter(f => (f.zeit || '').slice(0, 10) === heute);
  p('js-fehler', frisch.length ? 'warn' : 'ok', 'Fehler im Werkzeug (dieser Browser)', frisch.length ? `${frisch.length} heute, zuletzt: ${frisch[frisch.length - 1].wo} · ${frisch[frisch.length - 1].text}` : (fehler.length ? `${fehler.length} ältere Einträge, heute keiner.` : 'Keine Fehler festgehalten.'), 'Seite neu laden. Bleibt es, den Eintrag Robert nennen (Knopf «Bericht kopieren»).');
  if (fehler.length) BR[BR.length - 1].mehr = fehler.slice().reverse().map(f => `${(f.zeit || '').slice(0, 16).replace('T', ' ')} · ${f.wo} · ${f.text}`);
  if (fehler.length) BR[BR.length - 1].aktion = 'js-log';
  if (fehler.length) BR[BR.length - 1].aktion_name = 'Liste leeren';
}

async function pruefen() {
  $('#k-neu').disabled = true;
  ampel('grau', 'Wird geprüft …', 'Einen Moment.');
  await browserPruefen();
  ZT = null;
  if (LEBT && LEBT.angemeldet) {
    try { ZT = await hole('/studio/api/pruefung'); }
    catch (e) { $('#k-server').innerHTML = `<p class="hinweis">Die Prüfung auf dem Server ist fehlgeschlagen: ${h(e.message)}</p>`; }
  } else if (LEBT) {
    $('#k-server').innerHTML = `<p class="hinweis">Für die vollständige Prüfung der Dateien und des Baus bitte <a href="/studio/">im Studio anmelden</a> und die Kontrolle dann noch einmal öffnen. ${LEBT.zugang === 'fehlt' ? 'Es ist noch kein Passwort festgelegt: das geschieht beim ersten Öffnen des Studios.' : ''}</p>`;
    ampel(BR.some(x => x.stand === 'fehler') ? 'rot' : BR.some(x => x.stand === 'warn') ? 'gelb' : 'gelb', LEBT.zugang === 'kaputt' ? 'Zugang ist kaputt.' : 'Nicht angemeldet.', 'Der Server antwortet. Die Prüfung der Dateien braucht die Anmeldung.');
  } else {
    $('#k-server').innerHTML = `<p class="hinweis">Ohne Server lässt sich hier nichts prüfen. ${h(OHNE_SERVER.abhilfe)}</p>`;
    ampel('rot', 'Server antwortet nicht.', OHNE_SERVER.text);
  }
  zeichne();
  if (!ZT && LEBT) { /* Ampel bleibt wie oben gesetzt */ } else if (!ZT) ampel('rot', 'Server antwortet nicht.', OHNE_SERVER.text);
  $('#k-neu').disabled = false;
}

document.addEventListener('click', async ev => {
  const b = ev.target.closest('[data-aktion]');
  if (!b) return;
  const was = b.dataset.aktion, zeile = b.closest('.punkt');
  if (!b.dataset.ja) {   // jede Reparatur erst nach dem zweiten Klick (R23, Fund Doldenhorn F72)
    const alt = zeile.querySelector('.frage');
    if (alt) alt.remove();
    zeile.insertAdjacentHTML('beforeend', `<div class="frage"><span>${h(FRAGEN[was] || 'Wirklich ausführen?')}</span><button class="kn kn--klein kn--dunkel" type="button" data-aktion="${h(was)}" data-ja="1">Ja, ausführen</button><button class="kn kn--klein" type="button" data-weg>Abbrechen</button></div>`);
    return;
  }
  b.disabled = true;
  if (was === 'js-log') { try { localStorage.removeItem('rh-studio-fehler'); } catch (e) {} meld('Liste geleert.'); return pruefen(); }
  try {
    const r = await hole('/studio/api/reparieren', { method: 'POST', headers: { 'X-Studio': '1', 'Content-Type': 'application/json' }, body: JSON.stringify({ was }) });
    ZT = r;
    meld(r.getan || 'Erledigt.');
    await browserPruefen();
    zeichne();
  } catch (e) { meld('Das ging nicht: ' + e.message); b.disabled = false; }
});
document.addEventListener('click', ev => { const w = ev.target.closest('[data-weg]'); if (w) w.closest('.frage').remove(); });
$('#k-neu').addEventListener('click', pruefen);
$('#k-kopie').addEventListener('click', async () => {
  const zeilen = ['Prüfung Schreibtisch Landgasthof Ruedihus · ' + new Date().toLocaleString('de-CH') + ' · ' + location.origin];
  (ZT ? ZT.punkte : []).concat(BR).forEach(p => { zeilen.push(`[${p.stand}] ${p.titel}: ${p.text}`); (p.mehr || []).forEach(m => zeilen.push('    - ' + m)); });
  const text = zeilen.join('\n');
  try { await navigator.clipboard.writeText(text); meld('Bericht kopiert. Zum Einfügen in eine Nachricht an Robert.'); }
  catch (e) { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); meld('Bericht kopiert.'); } catch (x) { meld('Kopieren ging nicht; der Bericht steht unten zum Markieren.'); t.style.cssText = 'width:100%;height:200px;margin-top:20px'; return; } t.remove(); }
});
stichworte();
ziel();
pruefen();
})();
