/* La Carte · Landgasthof Ruedihus (Die Tafel) — Satz der Karten (17.10.2026, Kopie aus der Tafel des Waldhotel Doldenhorn).
   Eine Datei für drei Stellen: die Vorschau im Werkzeug, die Druckseite (PDF) und die Prüfung im Rundlauf (node).
   Die Karten liegen als Baum aus dem fertigen Satz des Projekts vor (einlesen.py): Seiten, Elemente mit ihren Merkmalen, Texte und feste Teile
   (Zeichen des Hauses, Wortmarke, eingebettete Bilder). Aus denselben Daten entsteht hier Zeichen für Zeichen dasselbe HTML wie in
   _werkbank/satz/u-<karte>.html (geprüft mit pruefe.py rund). Gestalten (Fortgeschritten) legt sich als Stil über ein Element, ohne den Satz
   zu ändern. Das Ruedihus hat kein Mittagsmenü der Woche (C08 betrifft nicht); der Teil MITTAG bleibt aus der Vorlage, wird nicht benutzt. Ohne Bibliothek. */
(function (G) {
  'use strict';
  var A = '', Z = '', M0 = '', M1 = '', M2 = '';
  var ZEICHEN = { ZEICHEN: '', WORTMARKE: '' };
  var LEER_TAG = { img: 1, br: 1, hr: 1, meta: 1, link: 1, input: 1, wbr: 1, col: 1, source: 1 };
  var BLOCK = { p: 1, h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, li: 1, div: 1, section: 1 };

  function esc(x) { return String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;'); }   // html.escape()
  function wahr(x) { return !(x === null || x === undefined || x === false || x === '' || x === 0 || (Array.isArray(x) && !x.length)); }

  /* ---------------------------------------------------------------- Gestalten (Fortgeschritten), wie La Carte des Grand Beau-Rivage und des Carlton:
     lage = { x, y (mm), s (Faktor) · f Schrift · t Schriftgrösse (Faktor) · a Textart · c Farbe · al Ausrichtung · z Zeilenabstand · mt, mb (mm) · aus ·
     lin {x, y, b, d, c, aus} } an einem Element. Verschoben per transform (Ursprung oben links), der Satz bleibt. Ohne lage ist das HTML das alte. */
  function zahl(x) { return String(Math.round((+x || 0) * 100) / 100); }
  var SCHRIFT = { gelasio: "'Gelasio',Georgia,'Times New Roman',serif", instrument: "'Instrument Sans',Arial,sans-serif", mono: "'DM Mono',Menlo,monospace" };
  // Farben des Hauses (assets/css/main.css :root, Werte der Website; Geranie nur als Punkt)
  var FARBE = { tinte: '#2a1a0e', russ: '#1f1209', holz: '#321f10', balken: '#6d431f', kerze: '#c98543', gold: '#b78f51', licht: '#f3cd94', leinen: '#d8c2ad', papier: '#efe4d3', blatt: '#fbf5ea', geranie: '#c42e13', weiss: '#ffffff' };
  var ALIGN = { links: ['left', 'flex-start'], mitte: ['center', 'center'], rechts: ['right', 'flex-end'] };
  function lageStil(l) {
    if (!l) return '';
    var x = +l.x || 0, y = +l.y || 0, sk = +l.s || 1;
    if (Math.abs(x) < 0.05 && Math.abs(y) < 0.05 && Math.abs(sk - 1) < 0.005) return '';
    return 'transform:translate(' + x.toFixed(2) + 'mm,' + y.toFixed(2) + 'mm)' + (Math.abs(sk - 1) >= 0.005 ? ' scale(' + sk.toFixed(3) + ')' : '') + ';transform-origin:0 0';
  }
  function gestalt(l) {
    var st = [], at = '';
    if (!l || typeof l !== 'object') return ['', ''];
    var tr = lageStil(l); if (tr) st.push(tr);
    if (l.aus) st.push('visibility:hidden');
    if (SCHRIFT[l.f]) { st.push('--gf:' + SCHRIFT[l.f]); at += ' data-gf=""'; }
    if (FARBE[l.c]) { st.push('--gc:' + FARBE[l.c]); at += ' data-gc=""'; }
    if (/^(normal|kursiv|versal|medium)$/.test(l.a || '')) at += ' data-ga="' + l.a + '"';
    if (ALIGN[l.al]) { st.push('--gal:' + ALIGN[l.al][0] + ';--gai:' + ALIGN[l.al][1]); at += ' data-gal=""'; }
    if (+l.z) { st.push('--gz:' + zahl(+l.z)); at += ' data-gz=""'; }
    if (+l.t && Math.abs(+l.t - 1) > 0.004) at += ' data-gt="' + zahl(+l.t) + '"';
    if (l.mt != null && l.mt !== '') st.push('margin-top:' + zahl(+l.mt) + 'mm');
    if (l.mb != null && l.mb !== '') st.push('margin-bottom:' + zahl(+l.mb) + 'mm');
    if (l.lin && typeof l.lin === 'object') at += ' data-lin-l="' + [zahl(l.lin.x), zahl(l.lin.y), zahl(l.lin.b), zahl(l.lin.d), FARBE[l.lin.c] || '', l.lin.aus ? 1 : 0].join(',') + '"';
    return [st.join(';').replace(/"/g, "'"), at];
  }
  function oeffne(tag, at, data, stil, mehr) {   // öffnendes Tag, um data-n, Stil und Merkmale ergänzt
    var innen = '<' + tag + at;
    if (stil) { if (/ style="/.test(innen)) innen = innen.replace(/ style="([^"]*)"/, function (m, a) { return ' style="' + a + (a && !/;$/.test(a) ? ';' : '') + stil + '"'; }); else innen += ' style="' + stil + '"'; }
    if (data) innen += ' data-n="' + data + '"';
    if (mehr) innen += mehr;
    return innen + '>';
  }

  /* ---------------------------------------------------------------- Was ein Element auf der Karte ist (für die Liste im Modus «Einfach»)
     eintrag: ein Gericht, Wein, eine Behandlung, ein Menu, eine Zeile mit Preis · rubrik: Überschrift einer Gruppe · zwischen: Zwischentitel ·
     titel: Titel einer Seite · text: Absatz · null: Behälter (die Liste geht hinein) · fest: gehört zum Rahmen der Seite (Fusszeile, Bild) */
  /* Ruedihus (Satz _werkbank/satz_daten.py, nos_menus_satz.py): g Gericht · tt Tagesteller · tmsp Tag des Tagesmenus · gzeile Zeile des
     Gutscheins mit Preis · menu Fondue- oder Raclette-Menu im Kasten · nm-… Menus, Gänge und Zeilen der Menuvorschläge · rubrik Rubrik · oder «oder / ou / or» · h3 im Kasten Zwischentitel */
  var EINHEIT = /(^| )(g|tt|tmsp|gzeile|menu|nm-g|nm-m|nm-p|nm-pk|nm-tab__g|nm-haus|nm-wahl|nm-as)( |$)/;
  var KIND_EINHEIT = /(^| )(nie-vorhanden)( |$)/;   // Kinder dieser Behälter sind je ein Eintrag (im Ruedihus keine)
  var RUBRIK = /(^| )(rubrik)( |$)/;
  var ZWISCHEN = /(^| )(oder|gz2|vorzeile|nm-tab__e|nm-zwt)( |$)/;
  function klasse(n) { var m = /\sclass="([^"]*)"/.exec(n.a[1] || ''); return m ? m[1] : ''; }
  function art(n, eltern) {
    if (!n || typeof n !== 'object' || n.fn !== 'el') return null;
    var tag = n.a[0], kl = klasse(n), ek = eltern ? klasse(eltern) : '';
    if (tag === 'footer' || tag === 'img' || tag === 'svg') return 'fest';
    if (EINHEIT.test(kl) || (eltern && eltern.fn === 'el' && KIND_EINHEIT.test(ek) && tag === 'div')) return 'eintrag';
    if (RUBRIK.test(kl)) return 'rubrik';
    if (ZWISCHEN.test(kl) || (tag === 'h3' && !kl)) return 'zwischen';
    if (/^h[12]$/.test(tag)) return 'titel';
    if (/^(p|h3|h4|li)$/.test(tag) && textVon(n).trim() && !/(^| )stern( |$)/.test(kl)) return 'text';
    if (tag === 'ul') return 'text';
    return null;
  }
  function textVon(x) {
    if (typeof x === 'string') return x;
    if (x && x.fn === 'el') return x.a.slice(2).map(textVon).join('');
    if (x && x.fn === 'seite') return x.a.slice(1).map(textVon).join('');
    return '';
  }
  /* Die Texte eines Eintrags mit Namen (für das Fenster «bearbeiten»): [{pfad (relativ zum Eintrag), name, wert, preis}] */
  var LEISE = /^[\s·*|–\-]*$/;
  function feldName(tag, kl, kette, i, art0) {
    var in_ = function (re) { return kette.some(function (k) { return re.test(k); }); };
    if (tag === 'h1') return 'Titel';
    if (/(^| )(rp|mpreis)( |$)/.test(kl)) return 'Preis';
    if (tag === 'b' && in_(/kopfz/)) return 'Spaltenkopf';
    if (tag === 'b' && in_(/nm-tab/)) return 'Plätze';
    if (/(^| )k( |$)/.test(kl)) return 'Kleine Portion';
    if (/(^| )mg( |$)/.test(kl)) return 'Gang';
    if (/(^| )mf( |$)/.test(kl)) return 'Übersetzung';
    if (tag === 'span' && /(^| )d( |$)/.test(kl)) return 'Beschreibung';
    if (tag === 'span' && /(^| )h( |$)/.test(kl)) return 'Gericht';
    if (tag === 'small' && in_(/^h2/)) return 'Übersetzung';
    if (tag === 'h2' || (tag === 'span' && in_(/^h2/))) return art0 === 'rubrik' ? 'Rubrik' : 'Überschrift';
    if (tag === 'h3' && in_(/tt__k/)) return 'Name';
    if (tag === 'h3') return 'Zwischentitel';
    if (/(^| )(f|fr|tagu)( |$)/.test(kl) || in_(/ (f|fr)$/) || in_(/ (f|fr) /)) return in_(/ ld/) || /(^| )ld( |$)/.test(kl) ? 'Übersetzung, Name' : 'Übersetzung';
    if (/(^| )marke( |$)/.test(kl)) return 'Marke';
    if (/(^| )ld( |$)/.test(kl)) return 'Übersetzung, Name';
    if (tag === 'sup') return 'Hinweis';
    if (tag === 'small') return 'Zusatz';
    if (tag === 'h4') return /(^| )tag( |$)/.test(kl) ? 'Tag' : 'Name';
    if (tag === 'b' && in_(/^h4/)) return 'Name';
    if (tag === 'span' && in_(/^h4/)) return 'Zusatz';
    if (tag === 'b') return 'Preis';
    if (tag === 'em') return in_(/wk-z/) ? 'Punkte' : in_(/dh-p/) ? 'Spaltenkopf' : 'Titel';
    if (tag === 'i') return in_(/wk-z/) ? 'Jahrgang' : in_(/dh-m/) ? 'Dauer' : 'Text';
    if (tag === 'span') return in_(/dh-m/) ? 'Behandlung' : in_(/dh-v/) ? 'Grösse' : in_(/dh-wahl/) ? 'Name' : in_(/dh-t/) ? 'Deutsch' : in_(/nm-tab/) ? 'Tischform' : 'Text';
    if (/(^| )b( |$)/.test(kl)) return 'Zusatz';
    if (tag === 'p') return in_(/nm-m/) || /(^| )gang( |$)/.test(kl) ? 'Gang' : /(^| )h( |$)/.test(kl) ? 'Gericht' : 'Beschreibung';
    return 'Text';
  }
  function istNb(x) { return x && x.fn === 'el' && x.a[0] === 'span' && /(^| )dh-nb( |$)/.test(klasse(x)); }
  function istZ(x) { return x && x.fn === 'el' && x.a[0] === 'span' && /(^| )z( |$)/.test(klasse(x)); }
  function istBild(x) { return x && x.fn === 'el' && x.a[0] === 'img'; }
  function felder(n, art0) {
    var aus = [], zahl0 = {};
    var nimm = function (f) { zahl0[f.name] = (zahl0[f.name] || 0) + 1; aus.push(f); };
    (function geh(x, pfad, kette) {
      if (typeof x === 'string') {
        if (LEISE.test(x) && x !== '') return;
        var e = kette[kette.length - 1] || {};
        nimm({ pfad: pfad, name: feldName(e.tag, e.kl, kette.map(function (k) { return k.tag + ' ' + k.kl; }), aus.length, art0), wert: x });
        return;
      }
      if (!x || x.fn !== 'el') return;
      // Name eines Gerichts mit den Zeichen des Hauses am letzten Wort (satz_daten.py name_mit_zeichen): ein Feld für den ganzen Namen
      if (x.a[0] === 'h4' && x.a.slice(2).some(istNb)) {
        nimm({ pfad: pfad, name: 'Name', wert: x.a.slice(2).map(function (y) { return istNb(y) ? y.a.slice(2).filter(function (z) { return typeof z === 'string'; }).join('') : typeof y === 'string' ? y : ''; }).join(''), nb: true });
        return;
      }
      var k2 = kette.concat([{ tag: x.a[0], kl: klasse(x) }]);
      x.a.slice(2).forEach(function (y, i) { geh(y, (pfad ? pfad + '.' : '') + 'a.' + (i + 2), k2); });
    })(n, '', []);
    Object.keys(zahl0).forEach(function (nm) { if (zahl0[nm] < 2) return; var j = 0; aus.forEach(function (f) { if (f.name === nm) f.name = nm + ' ' + (++j); }); });
    aus.forEach(function (f) { f.preis = /^Preis/.test(f.name); });
    return aus.filter(function (f) { return f.wert !== '' || /Preis|Jahrgang|Punkte|Dauer|Spaltenkopf/.test(f.name); });
  }
  function lies(o, pfad) { return pfad ? pfad.split('.').reduce(function (x, k) { return x == null ? x : x[/^\d+$/.test(k) ? +k : k]; }, o) : o; }
  function vaterVon(o, pfad) { var k = pfad.split('.'), i = +k.pop(); return { arr: lies(o, k.join('.')), idx: i }; }
  /* Ein Feld eines Eintrags setzen (n wird verändert). Leer: ein Absatz oder eine Zeile fällt weg (leer: true), sonst bleibt das Element leer. */
  function setzeFeld(n, f, wert) {
    if (f.nb) {
      var h4 = lies(n, f.pfad), nb = h4.a.slice(2).filter(istNb)[0], bilder = nb.a.slice(2).filter(function (z) { return typeof z !== 'string'; });
      var t = String(wert).replace(/\s+$/, ''), j = t.lastIndexOf(' '), vorn = j >= 0 ? t.slice(0, j + 1) : '', letzt = j >= 0 ? t.slice(j + 1) : t;
      h4.a = [h4.a[0], h4.a[1]].concat(vorn ? [vorn] : []).concat([{ fn: 'el', a: [nb.a[0], nb.a[1], letzt].concat(bilder) }]);
      return;
    }
    var v = vaterVon(n, f.pfad);
    v.arr[v.idx] = wert;
    // Ruedihus 17.10.2026: eine Zeile besteht oft aus zwei Texten (Vorspann der Übersetzung in <span class="ld"> und Rest). Leer ist eine Zeile,
    // wenn in ihr kein Text mehr steht: jeder Block zwischen dem Eintrag und dem Text (p, dann die Zeile div.gz) fällt dann weg; der Eintrag selbst nie.
    var k = f.pfad.split('.'), kette = [];
    for (var x = k.length - 2; x >= 2; x -= 2) { var e = lies(n, k.slice(0, x).join('.')); if (e && e.fn === 'el') kette.push(e); }
    kette.forEach(function (e) { if (!BLOCK[e.a[0]]) return; if (!textVon(e).trim() && !hatFest(e)) e.leer = true; else delete e.leer; });
  }
  function hatFest(x) { return !!x && typeof x === 'object' && (x.fn === 'roh' || (x.fn === 'el' && (x.a[0] === 'img' || x.a.slice(2).some(hatFest)))); }
  /* Zeichen des Hauses an einem Eintrag (vegetarisch, vegan …): Nummern der festen Teile der Bilder, in der Reihenfolge des Satzes */
  function zeichenOrt(n) {
    var ort = null;
    (function geh(x) { if (ort || !x || x.fn !== 'el') return; if (istNb(x) || istZ(x)) { ort = x; return; } x.a.slice(2).forEach(geh); })(n);
    return ort;
  }
  function zeichenVon(n) {
    var o = zeichenOrt(n); if (!o) return [];
    return o.a.slice(2).filter(istBild).map(function (b) { var m = new RegExp(A + '(\\d+)' + Z).exec(b.a[1]); return m ? +m[1] : -1; });
  }
  function hatZeichenOrt(n) {   // Gericht mit Namen (h4) oder Zeile mit Zeichen-Spalte
    if (zeichenOrt(n)) return true;
    var h4 = null; (function geh(x) { if (h4 || !x || x.fn !== 'el') return; if (x.a[0] === 'h4') { h4 = x; return; } x.a.slice(2).forEach(geh); })(n);
    return !!h4;
  }
  /* Zeichen setzen: bild(teil) = Merkmale des Bildes, nb = Merkmale des Behälters am letzten Wort (beide aus dem Satz der Karte) */
  function setzeZeichen(n, teile, bildAt, nbAt) {
    var o = zeichenOrt(n), imgs = teile.map(function (t) { return { fn: 'el', a: ['img', bildAt(t)] }; });
    if (o) { o.a = [o.a[0], o.a[1]].concat(o.a.slice(2).filter(function (y) { return !istBild(y); })).concat(imgs); return; }
    if (!teile.length) return;
    var h4 = null; (function geh(x) { if (h4 || !x || x.fn !== 'el') return; if (x.a[0] === 'h4') { h4 = x; return; } x.a.slice(2).forEach(geh); })(n);
    if (!h4) return;
    var t = h4.a.slice(2).filter(function (y) { return typeof y === 'string'; }).join(''), j = t.lastIndexOf(' ');
    h4.a = [h4.a[0], h4.a[1]].concat(j >= 0 ? [t.slice(0, j + 1)] : []).concat([{ fn: 'el', a: ['span', nbAt, j >= 0 ? t.slice(j + 1) : t].concat(imgs) }]);
  }

  /* ---------------------------------------------------------------- Setzen */
  function Satz(d, opt) { this.d = d; this.mk = !!(opt && opt.marken); }
  Satz.prototype.kind = function (x, pfad, eltern, inE) {
    if (typeof x === 'string') return this.mk && x.trim() ? M0 + pfad + M1 + esc(x) + M2 : esc(x);
    if (!x || typeof x !== 'object') return '';
    if (x.fn === 'roh') return x.a[0];
    if (x.fn === 'el') return this.el(x, pfad, eltern, inE);
    return '';
  };
  Satz.prototype.el = function (n, pfad, eltern, inE) {
    if (n.aus) return '';
    var tag = n.a[0], at = n.a[1] || '', me = this, a = art(n, eltern);
    if (n.leer && !textVon(n).trim() && !hatFest(n)) return '';
    var waehlbar = !inE && (a && a !== 'fest' || tag === 'header' || tag === 'footer' || tag === 'img');
    var data = (this.mk && waehlbar) || n.lage ? pfad : '';
    var g = gestalt(n.lage), offen = (data || g[0] || g[1]) ? oeffne(tag, at, data, g[0], g[1]) : '<' + tag + at + '>';
    if (LEER_TAG[tag]) return offen;
    var drin = inE || a === 'eintrag';
    return offen + n.a.slice(2).map(function (y, i) { return me.kind(y, pfad + '.a.' + (i + 2), n, drin); }).join('') + '</' + tag + '>';
  };
  Satz.prototype.seite = function (n, i, nr) {
    var me = this, at = n.a[0] || '', mehr = '';
    if (this.mk) mehr = ' data-seite="' + i + '" data-nr="' + nr + '"';
    var b = /data-b="(\d+)"/.exec(at);
    return '<section' + at + mehr + '>' + n.a.slice(1).map(function (y, j) { return me.kind(y, 'seiten.' + i + '.a.' + (j + 1), n, false); }).join('') + '</section>';
  };
  function teileLos(h, teile) { return h.replace(new RegExp(A + '(\\d+)' + Z, 'g'), function (m, n) { return (teile || [])[+n] || ''; }); }
  function marken(h) { return h.replace(new RegExp(M0 + '([^' + M1 + ']*)' + M1, 'g'), function (m, p) { return '<k-t data-k="' + p + '">'; }).split(M2).join('</k-t>'); }

  function seiten(d, opt) {
    var dd = d.art === 'mittag' ? mittagAnwenden(JSON.parse(JSON.stringify(d))) : d, sz = new Satz(dd, opt), aus = [];
    (dd.seiten || []).forEach(function (n, i) {
      if (n.aus) return;
      var h = teileLos(sz.seite(n, i, aus.length + 1), dd.teile);
      aus.push(opt && opt.marken ? marken(h) : h);
    });
    return aus;
  }
  /* Ganze Datei wie _werkbank/satz/u-<karte>.html (für den Rundlauf) */
  function dokument(d) { return d.kopf + seiten(d, {}).join('') + d.fuss; }
  function kopfCss(d) {
    var f = d.format || [210, 297];
    return '@page{size:' + f[0] + 'mm ' + f[1] + 'mm;margin:0}' + (d.art === 'mittag' ? MT_CSS : '');
  }

  /* ---------------------------------------------------------------- Mittagsmenü (C08, nach La Carte des Grand Beau-Rivage und des Carlton)
     Je Tag eine Tageskarte, Gänge fest (Salat oder Suppe · Vegetarisch, Fleisch, Fisch · Dessert), alles mittig, zwischen den Gängen ein kurzer
     Goldstrich. Kleid der Unterlagen des Hauses: Band mit dem Tannen-Zeichen und Titel, Rubriken in Caslon, Fusszeile mit der Wortmarke. */
  var TAGE = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  var MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  var GAENGE = [['salat', 'Salat', 'Vorspeise'], ['suppe', 'Suppe', 'Vorspeise'], ['vegi', 'Vegetarisch', 'Hauptgang'], ['fleisch', 'Fleisch', 'Hauptgang'], ['fisch', 'Fisch', 'Hauptgang'], ['dessert', 'Dessert', 'Dessert']];
  function datum(ab, plus) { var x = String(ab || '').split('-').map(Number); return new Date(x[0], (x[1] || 1) - 1, (x[2] || 1) + (plus || 0), 12); }
  function iso(dt) { return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0'); }
  function montag(ab) { var dt = datum(ab); dt.setDate(dt.getDate() - ((dt.getDay() + 6) % 7)); return iso(dt); }
  function tagName(ab, i) { var dt = datum(ab, i); return TAGE[i] + ', ' + dt.getDate() + '. ' + MONATE[dt.getMonth()]; }
  function spanne(ab, n) {
    var a = datum(ab), b = datum(ab, n - 1);
    if (a.getFullYear() !== b.getFullYear()) return a.getDate() + '. ' + MONATE[a.getMonth()] + ' ' + a.getFullYear() + ' – ' + b.getDate() + '. ' + MONATE[b.getMonth()] + ' ' + b.getFullYear();
    if (a.getMonth() !== b.getMonth()) return a.getDate() + '. ' + MONATE[a.getMonth()] + ' – ' + b.getDate() + '. ' + MONATE[b.getMonth()] + ' ' + b.getFullYear();
    return a.getDate() + '. – ' + b.getDate() + '. ' + MONATE[b.getMonth()] + ' ' + b.getFullYear();
  }
  var leer = function (x) { return !String(x || '').trim(); };
  function tagLeer(tg) { return !tg.zu && GAENGE.every(function (g) { return leer(tg[g[0]]); }); }
  function leererTag() { var tg = { zu: false, hinweis: '' }; GAENGE.forEach(function (g) { tg[g[0]] = ''; }); return tg; }
  var MT_CSS = '.blatt.mt .inhalt{text-align:center;justify-content:flex-start}.blatt.mt .uband p{margin-top:.45em;font-size:calc(9pt*var(--s));letter-spacing:.2em}' +
    '.mt .mt-zeit{font-family:\'DM Mono\',Menlo,monospace;font-size:calc(9pt*var(--s));letter-spacing:.14em;text-transform:uppercase;color:#8a7036;margin:0 0 calc(9mm*var(--s))}' +
    '.mt .dh-r{margin:0 0 calc(2.6mm*var(--s))}.mt .mt-g{font-family:var(--titel);font-size:calc(14pt*var(--s));line-height:1.32;color:#142235;margin:0 auto calc(1.2mm*var(--s));max-width:150mm;text-wrap:balance}' +
    '.mt .mt-oder{font-family:\'DM Mono\',Menlo,monospace;font-size:calc(8pt*var(--s));letter-spacing:.18em;text-transform:uppercase;color:#8a7036;margin:calc(.8mm*var(--s)) 0 calc(1.6mm*var(--s))}' +
    '.mt .mt-strich{display:block;width:14mm;height:0;border-top:.35mm solid #b89850;margin:calc(7mm*var(--s)) auto calc(6mm*var(--s))}' +
    '.mt .mt-preis{font-family:var(--titel);font-size:calc(20pt*var(--s));color:#142235;margin:calc(10mm*var(--s)) 0 0}.mt .mt-dazu{font-size:calc(10pt*var(--s));color:#384858;margin:calc(1.5mm*var(--s)) 0 0}' +
    '.mt .mt-spruch{font-family:var(--titel);font-size:calc(12pt*var(--s));color:#8a7036;margin:calc(10mm*var(--s)) 0 0}.mt .mt-beispiel{font-family:\'DM Mono\',Menlo,monospace;font-size:calc(7.5pt*var(--s));letter-spacing:.14em;text-transform:uppercase;color:#98917e;margin:calc(8mm*var(--s)) 0 0}';
  var SEITE_AT = ' data-max="1.0" class="blatt dh mt" data-b="210" data-h="297" style="width:210mm;height:297mm"';
  function el(tag, kl, kinder, mehr) { var n = { fn: 'el', a: [tag, kl ? ' class="' + kl + '"' : ''].concat(kinder || []) }; if (mehr) Object.keys(mehr).forEach(function (k) { n[k] = mehr[k]; }); return n; }
  function mittagSeiten(w) {
    var n = Math.max(1, Math.min(7, (w.tage || []).length)), aus = [];
    var P = function (text, kl, feld, vor) { return el('p', kl, [text], feld ? (vor ? { w: feld, vor: vor } : { w: feld }) : null); };
    var kopf = function (titel, unter, i) {
      return el('header', 'uband', [el('span', 'uband__z', [{ fn: 'roh', a: [ZEICHEN.ZEICHEN] }]), el('div', '', [el('h1', '', [titel], { w: 'titel' }), el('p', '', [unter])])], { lk: 't' + i + '.band' });
    };
    var fuss = function (i) { return el('footer', 'ufuss2', leer(w.fuss) ? [el('span', 'dh-fw', [{ fn: 'roh', a: [ZEICHEN.WORTMARKE] }])] : [w.fuss.trim()], leer(w.fuss) ? { lk: 't' + i + '.fuss' } : { w: 'fuss', lk: 't' + i + '.fuss' }); };
    (w.tage || []).slice(0, n).forEach(function (tg, i) {
      if (tagLeer(tg)) return;
      var teile = [];
      if (!leer(w.zeiten)) teile.push(P(w.zeiten.trim(), 'mt-zeit', 'zeiten'));
      if (tg.zu) teile.push(P(leer(tg.hinweis) ? 'An diesem Tag gibt es kein Mittagsmenü.' : tg.hinweis.trim(), 'mt-g', leer(tg.hinweis) ? null : 'tage.' + i + '.hinweis'));
      else {
        var erst = true;
        ['Vorspeise', 'Hauptgang', 'Dessert'].forEach(function (gang) {
          var z = GAENGE.filter(function (g) { return g[2] === gang && !leer(tg[g[0]]); });
          if (!z.length) return;
          if (!erst) teile.push(el('i', 'mt-strich', []));
          erst = false;
          teile.push(el('h2', 'dh-r m', [gang]));
          z.forEach(function (g, j) {
            if (j && gang === 'Vorspeise') teile.push(P('oder', 'mt-oder'));
            teile.push(P((gang === 'Hauptgang' ? g[1] + ': ' : '') + tg[g[0]].trim(), 'mt-g', 'tage.' + i + '.' + g[0], gang === 'Hauptgang' ? g[1] + ': ' : ''));
          });
        });
        if (!leer(w.preis)) teile.push(P(w.preis.trim(), 'mt-preis', 'preis'));
        if (!leer(w.zusatz)) teile.push(P(w.zusatz.trim(), 'mt-dazu', 'zusatz'));
      }
      if (!leer(w.spruch)) teile.push(P(w.spruch.trim(), 'mt-spruch', 'spruch'));
      if (w.beispiel) teile.push(P('Beispielwoche · Gerichte aus der Grossen Karte', 'mt-beispiel'));
      var zaehl = {}, WL = w.lage || {};
      var hdr = kopf(w.titel || 'Mittagsmenü', tagName(w.ab, i) + ' ' + datum(w.ab, i).getFullYear(), i), ftr = fuss(i);
      teile.forEach(function (x) {
        var r = x.w ? x.w.replace(/^tage\.\d+\./, '') : x.a[0] === 'h2' ? String(x.a[2]).toLowerCase() : x.a[0] === 'i' ? 'strich' : /mt-oder/.test(x.a[1]) ? 'oder' : 'text';
        zaehl[r] = (zaehl[r] || 0) + 1; x.lk = 't' + i + '.' + r + (zaehl[r] > 1 ? zaehl[r] : '');
      });
      [hdr, ftr].concat(teile).forEach(function (x) { if (WL[x.lk]) x.lage = JSON.parse(JSON.stringify(WL[x.lk])); });
      aus.push({ fn: 'seite', a: [SEITE_AT, hdr, el('div', 'inhalt', teile), ftr] });
    });
    if (!aus.length) aus.push({ fn: 'seite', a: [SEITE_AT, kopf(w.titel || 'Mittagsmenü', spanne(w.ab, n), 0), el('div', 'inhalt', [P('Die Gerichte dieser Woche folgen.', 'mt-g')]), fuss(0)] });
    return aus;
  }
  function mittagAnwenden(d) { d.seiten = mittagSeiten(d.woche); d.teile = []; return d; }

  G.SATZ = {
    zeichen: function (z) { ZEICHEN = z; }, seiten: seiten, dokument: dokument, kopfCss: kopfCss, lageStil: lageStil, gestalt: gestalt, SCHRIFT: SCHRIFT, FARBE: FARBE,
    art: art, felder: felder, setzeFeld: setzeFeld, zeichenVon: zeichenVon, setzeZeichen: setzeZeichen, hatZeichenOrt: hatZeichenOrt, textVon: textVon, klasse: klasse, esc: esc, wahr: wahr, lies: lies,
    MITTAG: { TAGE: TAGE, MONATE: MONATE, GAENGE: GAENGE, datum: datum, iso: iso, montag: montag, tagName: tagName, spanne: spanne, leererTag: leererTag, tagLeer: tagLeer, seiten: mittagSeiten, anwenden: mittagAnwenden, CSS: MT_CSS },
  };
  if (typeof module !== 'undefined') module.exports = G.SATZ;
})(typeof window !== 'undefined' ? window : globalThis);
