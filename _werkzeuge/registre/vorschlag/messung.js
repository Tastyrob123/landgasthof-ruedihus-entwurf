/* Besucher · Landgasthof Ruedihus: Zählung auf der Website (Tasty Studios 17.10.2026). BAUSTEIN, noch nicht eingebaut: der Einbau in bau.py
   und das Hochladen gehören dem Werkbank-Chat des Ruedihus (Anleitung: _werkzeuge/registre/LIEFERUNG.md, «Was der Werkbank-Chat tun muss»).
   Ziel: assets/js/messung.js, auf jeder Seite vor </body> als <script src="assets/js/messung.js?v={V}" defer></script> (vorschlag/bau.py.patch).
   Vorbild: messung.js des Doldenhorn (Bau 17.10.2026) und assets/js/messung.js des Grand Beau-Rivage (beide nur gelesen), Klickwege des Ruedihus.

   Je Seite geht eine Zeile an /api/registre (lokal studio.py des Hauses mit vorschlag/studio.py.patch, online die Funktion api/registre.py, gleiche Adresse):
       r1 <seitenaufruf> <datei> <sprache> <geraet> <sekunden> <ereignisse|-> <herkunft|->
   einmal beim Öffnen (0 Sekunden), bei jedem gezählten Klick und beim Verlassen (Sekunden, in denen die Seite sichtbar war).
   Ohne Cookies und ohne Kennung im Gerät: «seitenaufruf» ist eine Zufallsfolge, die nur in dieser Variablen lebt und mit der Seite endet.
   Dass die Seiten eines Besuchs zusammenfinden, Land und Ort bestimmt der Server aus der Verbindung (registre.py); die Adresse speichert er nicht.
   «herkunft» ist nur der Name der Website, von der der Gast kam (zum Beispiel www.google.ch), nie die ganze Adresse.
   «sprache» ist die Sprache des Browsers (die Website gibt es nur deutsch), sonst «xx».
   Nicht gezählt: automatische Browser (Prüfläufe), Seiten im Rahmen, die Werkzeuge und Beigaben des Hauses, Entwurfs-, Varianten-, Konzept- und Bildauswahl-
   seiten und Geräte, auf denen das Team in «Besucher» «Dieses Gerät nicht mitzählen» gewählt hat (localStorage «rh-nicht-zaehlen», das Einzige im Gerät).
   Das Buchungssystem (SimpleBooking), der Spa-Kalender des Doldenhorn und die Formulare bleiben unberührt: gezählt wird nur der Klick, nie ein Inhalt.

   Ereignisse (Klickwege des Ruedihus, gelesen in assets/js/main.js, dienste.js, seiten.js, gast.js):
     fenster  Buchungsfenster geöffnet (Knopf mit data-buchen, ausser «Tisch»: der öffnet dasselbe Fenster beim Reiter Tisch)
     buchung  weiter zu SimpleBooking («Verfügbarkeit prüfen» im Fenster öffnet window.open, main.js; oder ein Link dorthin)
     tisch    «Tisch anfragen» abgeschickt (form[data-tisch], im Buchungsfenster und auf den Seiten; danach öffnet sich die Mail)
     anfrage  Formular abgeschickt: Fest anfragen (form[data-rechner]), Gutschein (form[data-gutschein]), Vor Ihrer Anreise (form[data-anreise]),
              Wunsch zur Abreise (form[data-abreise]); nur wenn das Formular gültig ist (sonst schickt die Seite nichts ab)
     spa      «Termin im Spa» geöffnet (Link zum Spa-Kalender des Waldhotel Doldenhorn, calendly.com/spa-doldenhorn)
     anruf    Telefonnummer angeklickt (tel:)
     mail     Mail-Adresse angeklickt (mailto:)
     chat     Rezeption im Chat geöffnet (.gast-knopf)
   Die ältere Zählung «Zahlen fürs Haus» (dienste.js → /api/zahlen, 10.10.2026) bleibt unberührt. */
(function () {
  'use strict';
  var n = navigator, d = document, w = window;
  if (w.__registre || !n.sendBeacon || n.webdriver || w.self !== w.top) return;
  try { if (w.localStorage.getItem('rh-nicht-zaehlen') === '1') return; } catch (e) { /* privat: zählt normal */ }
  var teile = location.pathname.split('/'), datei = teile.pop() || 'index.html';
  if (teile.length > 2 || /^(studio|_werkzeuge|werkzeuge|werkbank|maison|marke|reception|rezeption|registre|imprimerie|mission-control|potenzialanalyse|zimmermappe|unterlagen|drucksachen|feed|mails|material|siegel)$/.test(teile[1] || '')) return;
  if (!/^[a-z0-9-]{1,60}\.html$/.test(datei) || /varianten|^konzept|^mappe\.|^vorschau|^bildauswahl/.test(datei)) return;
  w.__registre = 1;
  var SPRACHEN = ' de en fr it nl es pt zh ja ko ar ';
  var sp = String(n.language || 'de').slice(0, 2).toLowerCase();
  if (SPRACHEN.indexOf(' ' + sp + ' ') < 0) sp = 'xx';
  var breit = function (px) { return !!(w.matchMedia && w.matchMedia('(max-width:' + px + 'px)').matches); };
  var geraet = breit(700) ? 'handy' : breit(1060) ? 'tablet' : 'rechner';
  var her = '-';
  try { var r = d.referrer ? new URL(d.referrer).hostname.toLowerCase() : ''; if (r && r !== location.hostname && /^[a-z0-9.-]{3,60}$/.test(r)) her = r; } catch (e) {}
  var pv, war, liste, sichtbar, seit, gesendet;
  function neu() {
    pv = (Math.random().toString(36) + '000000').slice(2, 8);
    war = {}; liste = []; sichtbar = 0; gesendet = '';
    seit = d.visibilityState === 'hidden' ? 0 : Date.now();
    sende();
  }
  function sek() { return Math.min(1800, Math.round((sichtbar + (seit ? Date.now() - seit : 0)) / 1000)); }
  function sende() {
    var zeile = 'r1 ' + pv + ' ' + datei + ' ' + sp + ' ' + geraet + ' ' + sek() + ' ' + (liste.length ? liste.join(',') : '-') + ' ' + her;
    if (zeile === gesendet) return;
    gesendet = zeile;
    try { n.sendBeacon('/api/registre', zeile); } catch (e) {}   /* wartet auf keine Antwort */
  }
  function zaehle(was) {
    if (war[was]) return;
    war[was] = 1; liste.push(was);
    sende();
  }
  function weg() { if (seit) { sichtbar += Date.now() - seit; seit = 0; } sende(); }
  neu();
  d.addEventListener('visibilitychange', function () { if (d.visibilityState === 'hidden') weg(); else if (!seit) seit = Date.now(); });
  w.addEventListener('pagehide', weg);
  w.addEventListener('pageshow', function (e) { if (e.persisted) neu(); });   /* zurück aus dem Seitenspeicher des Browsers: neuer Aufruf */
  d.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var b = t.closest('[data-buchen]');
    if (b) { if (b.getAttribute('data-buchen') !== 'tisch') zaehle('fenster'); return; }
    if (t.closest('.gast-knopf') && t.closest('.gast-knopf').getAttribute('aria-expanded') !== 'true') { zaehle('chat'); return; }
    var a = t.closest('a[href]'); if (!a) return;
    var h = a.getAttribute('href') || '';
    if (/simplebooking\./.test(a.href)) zaehle('buchung');
    else if (/calendly\.com\/spa-doldenhorn|[?&#]spa\b|^#spa$/i.test(a.href) || /Termin im Spa/i.test(a.textContent || '')) zaehle('spa');
    else if (/^tel:/i.test(h)) zaehle('anruf');
    else if (/^mailto:/i.test(h)) zaehle('mail');
  }, true);
  d.addEventListener('submit', function (e) {
    var f = e.target; if (!f || !f.matches || (f.checkValidity && !f.checkValidity())) return;
    if (f.matches('form[data-tisch]')) zaehle('tisch');
    else if (f.matches('form[data-rechner], form[data-gutschein], form[data-anreise], form[data-abreise]')) zaehle('anfrage');
  }, true);
  /* «Verfügbarkeit prüfen» öffnet das Buchungssystem über window.open (main.js): dort mitzählen */
  var offen = w.open;
  w.open = function (u) { try { if (/simplebooking\./.test(String(u))) zaehle('buchung'); } catch (e) {} return offen.apply(this, arguments); };
})();
