/* Die Stube (La Maison) · Landgasthof Ruedihus (17.10.2026). Gebaut von _werkzeuge/maison/bau.py aus quelle/maison.js, nicht in der Ausgabe ändern.
   Gruss, Datum, Schlüsselbrett, Auftritte und der Stand je Werkzeug. Stand nur aus den Daten der Werkzeuge selbst (nichts geschätzt): Wege als Daten
   in der Seite (#maison-wege), ein Weg darf eine Liste sein (antwortet der erste nicht, gilt der nächste). Werte gehen nur als Zahl in die Seite. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ganz = function (x) { var n = parseInt(x, 10); return isFinite(n) && n > 0 ? n : 0; };
  var tag = function (d) { return d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }); };
  var setze = function (key, html) { $$('[data-stand="' + key + '"]').forEach(function (el) { el.innerHTML = html; }); };
  var zahl = function (key, wert) { $$('[data-zahl="' + key + '"]').forEach(function (el) { el.textContent = wert; }); };

  /* Gruss und Datum; ?gruss=morgen|tag|abend für das Standbild der Werkbank */
  var h = new Date().getHours();
  var fest = { morgen: 8, tag: 13, abend: 20 }[(/[?&]gruss=(morgen|tag|abend)/.exec(location.search) || [])[1]]; if (fest) h = fest;
  $('#gruss').textContent = h >= 5 && h < 11 ? 'Guten Morgen.' : h >= 11 && h < 18 ? 'Guten Tag.' : 'Guten Abend.';
  $('#datum').textContent = new Date().toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  /* Buchstaben-Rollen nur in den Namen der Leiste */
  $$('.rl').forEach(function (el) {
    el.innerHTML = el.textContent.split('').map(function (z, i) { return '<b style="--n:' + i + '">' + esc(z) + '</b>'; }).join('');
  });

  /* Schlüsselbrett: die Anhänger kommen herauf, wenn die sechs runden Raumbilder dekodiert sind (höchstens 1,4 s) */
  var pfosten = $('.sb__brett');
  (function () {
    if (!pfosten) return;
    var los = function () { pfosten.classList.add('bereit'); };
    var uhr = setTimeout(los, 1400);
    Promise.all($$('.sb__raum', pfosten).map(function (im) { return (im.decode ? im.decode() : Promise.resolve()).catch(function () {}); }))
      .then(function () { clearTimeout(uhr); requestAnimationFrame(los); });
  })();

  /* Raum zum Anhänger: Zeiger, Tastatur-Fokus oder Antippen eines Anhängers zeigt links seinen Raum, harter Schnitt, erst wenn das Bild da ist (M16) */
  /* einmal hochzählen, sobald die Zahl ins Bild kommt (nur Text; «Weniger Bewegung»: sofort) */
  var zaehlIO = ('IntersectionObserver' in window) && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) ? new IntersectionObserver(function (es) {
    es.forEach(function (x) { if (!x.isIntersecting) return; zaehlIO.unobserve(x.target); var el = x.target, ziel = +el.dataset.ziel, t0 = performance.now(), d = 1200;
      (function f(t) { var k = Math.min(1, Math.max(0, (t - t0) / d)), v = ziel * (1 - Math.pow(1 - k, 3)); el.textContent = v.toLocaleString('de-DE', { minimumFractionDigits: ziel % 1 ? 1 : 0, maximumFractionDigits: 1 }) + '\u00a0%'; if (k < 1) requestAnimationFrame(f); })(t0); });
  }, { threshold: .6 }) : null;
  /* ganze Zahlen des Wegs zählen einmal hoch, wenn ein Fünftel zu sehen ist (Weg des Gastes, 18.10.2026) */
  var wegIO = ('IntersectionObserver' in window) && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) ? new IntersectionObserver(function (es) {
    es.forEach(function (x) { if (!x.isIntersecting) return; wegIO.unobserve(x.target); var el = x.target, ziel = +el.dataset.ganz, t0 = performance.now();
      (function f(t) { var k = Math.min(1, Math.max(0, (t - t0) / 1200)); el.textContent = Math.round(ziel * (1 - Math.pow(1 - k, 3))).toLocaleString('de-CH'); if (k < 1) requestAnimationFrame(f); })(t0); });
  }, { threshold: .2 }) : null;
  var zaehle = function (el) { if (zaehlIO && !el.dataset.gezaehlt) { el.dataset.gezaehlt = 1; zaehlIO.observe(el); } };
  var S = $$('.sb__a'), R = $$('.sb__gross'), U = $$('.sb__unter span'), jetzt = 0, will = 0;
  var zeige = function (i) {
    will = i; if (i === jetzt || !R[i]) return;
    var im = R[i]; if (im.loading === 'lazy') im.loading = 'eager';
    var fertig = function () {
      if (will !== i) return;
      R.forEach(function (r, j) { r.classList.toggle('an', j === i); });
      U.forEach(function (u, j) { u.classList.toggle('an', j === i); });
      S.forEach(function (s, j) { s.classList.toggle('an', j + 1 === i); });
      jetzt = i;
    };
    (im.decode ? im.decode() : Promise.resolve()).then(fertig, fertig);   /* immer erst entpacken, dann zeigen: sonst entpackt der Browser beim Umschalten im selben Bild */
  };
  /* Robert 18.10.2026 ~16:40 (M23): nichts springt. Fährt der Zeiger über ein Werkzeug, zeigt das Bild links seinen Bildschirm (weich überblendet),
     verlässt er die Liste, steht wieder das Haus. Am Handy keine Vorschau, dort öffnet Antippen. Tastatur: Fokus zeigt den Bildschirm. */
  var brett = document.querySelector('.sb__brett');
  S.forEach(function (s, i) {
    s.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse' || e.pointerType === 'pen') zeige(i + 1); });
    s.addEventListener('focus', function () { zeige(i + 1); });
    s.addEventListener('blur', function () { setTimeout(function () { if (!brett || !brett.contains(document.activeElement)) zeige(0); }, 0); });
  });
  if (brett) brett.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' || e.pointerType === 'pen') zeige(0); });
  /* Die übrigen Räume laden, sobald der erste da ist (ruhig, nach dem Auftakt) */
  if (R[0]) {
    var weiter = function () { setTimeout(function () { R.forEach(function (r) { if (r.loading === 'lazy') r.loading = 'eager'; r.addEventListener('load', function () { if (r.decode) r.decode().catch(function () {}); }, { once: true }); }); }, 900); };
    if (R[0].complete) weiter(); else R[0].addEventListener('load', weiter, { once: true });
  }

  /* Taste 1 bis 6 öffnet das Werkzeug des Anhängers (M12), still, solange der Rundgang offen ist */
  addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || document.querySelector('.rdg-karte')) return;
    var k = S[+e.key - 1]; if (k) { zeige(+e.key); k.classList.add('gedrueckt'); setTimeout(function () { location.href = k.href; }, 180); }
  });

  /* Auftritte: ein Abschnitt fährt als Ganzes los, sobald er am unteren Rand auftaucht; jedes Stück mit seiner Staffel (--i) */
  var alle = $$('[data-r]');
  /* Kommt ein Stück an, lädt es seine Bilder sofort (M15: der Safari-Kern am Handy holte ein Bild im Blick sonst nie) */
  var wecke = function (el) { (el.tagName === 'IMG' ? [el] : $$('img[loading="lazy"]', el)).forEach(function (i) { if (!i.complete || !i.naturalWidth) i.loading = 'eager'; }); };
  var an = function (el) { el.classList.add('da'); wecke(el); };
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { an(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px 12% 0px', threshold: 0 });
    var gruppe = function (el) { return el.closest('section, .m-saal, .m-empfang, footer') || el; };
    var gesehen = new Set();
    var gio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (!e.isIntersecting || gesehen.has(e.target)) return; gesehen.add(e.target); gio.unobserve(e.target);
        alle.forEach(function (el) { if (gruppe(el) === e.target) { an(el); io.unobserve(el); } }); });
    }, { rootMargin: '0px 0px 8% 0px', threshold: 0 });
    alle.forEach(function (el) { io.observe(el); var g = gruppe(el); if (!gesehen.has(g) && g !== el) gio.observe(g); });
    /* Goldband läuft nur, solange es im Bild ist (M07) */
    var band = $('[data-laufband]');
    if (band) new IntersectionObserver(function (es) { band.classList.toggle('laeuft', es[0].isIntersecting); }).observe(band);
    /* Leiste: die Etappe im Blick ist markiert (M01) */
    var punkte = {};
    $$('.m-insel__p').forEach(function (a) { punkte[a.getAttribute('href').slice(1)] = a; });
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var a = punkte[e.target.id]; if (a) a.classList.toggle('an', e.isIntersecting); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    Object.keys(punkte).forEach(function (id) { var s = document.getElementById(id); if (s) sio.observe(s); });
  } else {
    alle.forEach(function (el) { el.classList.add('da'); });
  }

  /* Stand-Wege (gesetzt von bau.py als Daten, kein eingebettetes Skript wegen der Sicherheitsregel online) */
  var WEGE = {}; try { WEGE = JSON.parse($('#maison-wege').textContent) || {}; } catch (e) { /* ohne Wege: jede Zeile ohne Zahl */ }
  var hole = function (k) {
    var w = [].concat(WEGE[k] || []).filter(Boolean);
    var weiter = function (i) {
      return i >= w.length ? Promise.reject(new Error('kein Weg')) : fetch(w[i], { cache: 'no-store', credentials: 'same-origin' })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error(r.status)); })
        .then(function (d) { return d && typeof d === 'object' ? d : Promise.reject(new Error('leer')); })
        .catch(function () { return weiter(i + 1); });
    };
    return weiter(0);
  };

  /* Le Bureau: {aenderungen, zuletzt:{zeit}, bereiche:[…], seiten, sprachen?} */
  hole('bureau').then(function (u) {
    var a = ganz(u.aenderungen), z = u.zuletzt;
    if (Array.isArray(u.bereiche) && u.bereiche.length) zahl('bereiche', u.bereiche.length);
    if (ganz(u.seiten)) zahl('seiten', ganz(u.seiten));
    var sp = Array.isArray(u.sprachen) ? u.sprachen.length : ganz(u.sprachen);
    /* Le Bureau meldet zusätzliche Sprachen; 0 oder leer heisst: die Website ist nur deutsch («Nur Deutsch, nichts zu übersetzen») */
    if (sp) zahl('sprachen', sp); else if (u.sprachen === 0 || (Array.isArray(u.sprachen) && !u.sprachen.length)) zahl('sprachen', 'Deutsch');
    var zd = z && z.zeit ? new Date(String(z.zeit).replace(' ', 'T')) : null, zul = zd && !isNaN(zd) ? tag(zd) : '';
    setze('bureau-kurz', a ? '<b>' + a + ' im Entwurf</b>' : (zul ? 'Veröffentlicht ' + esc(zul) : 'Nichts offen'));
    setze('bureau', (a ? '<b>' + a + ' Änderung' + (a > 1 ? 'en' : '') + ' im Entwurf.</b> ' : 'Nichts offen im Entwurf. ') + (zul ? 'Zuletzt veröffentlicht am ' + esc(zul) + '.' : 'Noch nichts veröffentlicht.'));
  }).catch(function () { setze('bureau-kurz', 'Website des Hauses'); setze('bureau', 'Der Stand ist gerade nicht abrufbar.'); });

  /* La Carte: {karten:[{entwurf, pdf_zeit:"dd.mm.yyyy hh:mm"}]} */
  hole('carte').then(function (d) {
    var k = Array.isArray(d.karten) ? d.karten : null; if (!k) throw new Error('ohne Karten');
    var e = k.filter(function (x) { return x && x.entwurf; }).length;
    var sortier = function (s) { var m = String(s).match(/(\d+)\.(\d+)\.(\d+)\s+(\d+):(\d+)/); return m ? m[3] + m[2] + m[1] + m[4] + m[5] : ''; };
    var pdf = k.map(function (x) { return x && x.pdf_zeit || ''; }).filter(function (s) { return sortier(s); }).sort(function (a, b) { return sortier(a) < sortier(b) ? 1 : -1; })[0];
    zahl('karten', k.length);
    zahl('entwurf', e);
    if (pdf) { var m = String(pdf).match(/(\d+)\.(\d+)\./); zahl('pdf', ('0' + m[1]).slice(-2) + '.' + ('0' + m[2]).slice(-2) + '.'); }
    setze('carte-kurz', e ? '<b>' + e + ' im Entwurf</b>' : k.length + (k.length === 1 ? ' Karte, veröffentlicht' : ' Karten, alle veröffentlicht'));
  }).catch(function () { setze('carte-kurz', 'Karten des Hauses'); });

  /* L’Imprimerie: keine Änderungen, die sich zeigen liessen; die Zahl der fertigen Vorlagen aus ihrer Liste [{art, format, zahl}] */
  hole('imprimerie').then(function (l) {
    if (!Array.isArray(l) || !l.length) throw new Error('leer');
    var z = 0, arten = {}; l.forEach(function (x) { z += ganz(x && x.zahl); if (x && x.art) arten[String(x.art)] = 1; });
    var a = Object.keys(arten).length; if (!z) throw new Error('leer');
    setze('imprimerie-kurz', z + ' Vorlagen in ' + a + (a === 1 ? ' Art' : ' Arten'));
  }).catch(function () { setze('imprimerie-kurz', 'Vorlagen, druckfertig'); });

  /* La Réception: {anfragen_neu, anfragen_offen, ohne_antwort, fragen_gesamt} */
  hole('reception').then(function (r) {
    var u = {}; ['anfragen_neu', 'anfragen_offen', 'ohne_antwort', 'fragen_gesamt'].forEach(function (k) { u[k] = ganz(r[k]); });
    var teile = [];
    if (u.anfragen_neu) teile.push('<b>' + u.anfragen_neu + (u.anfragen_neu === 1 ? ' neue Anfrage' : ' neue Anfragen') + '</b>');
    else if (u.anfragen_offen) teile.push(u.anfragen_offen + (u.anfragen_offen === 1 ? ' Anfrage offen' : ' Anfragen offen'));
    if (u.ohne_antwort) teile.push('<b>' + u.ohne_antwort + (u.ohne_antwort === 1 ? ' Frage ohne Antwort' : ' Fragen ohne Antwort') + '</b>');
    var kurz = teile.length ? teile.join(' · ') : 'Nichts offen';
    setze('reception-kurz', kurz);
    setze('reception', teile.length ? kurz : 'Nichts offen · ' + u.fragen_gesamt + (u.fragen_gesamt === 1 ? ' Frage' : ' Fragen') + ' bisher');
  }).catch(function () { setze('reception-kurz', 'Rezeption im Chat'); setze('reception', '&nbsp;'); });

  /* Le Livre: stand:{fotos, ki, ue, dateien} (ki = mit KI erzeugt, ue = nachgeschärft) */
  hole('livre').then(function (d) {
    var s = d.stand || {}, f = ganz(s.fotos), da = ganz(s.dateien), ki = ganz(s.ki), ue = ganz(s.ue);
    if (!f && !da) throw new Error('leer');
    setze('livre-kurz', f + ' Fotos · ' + da + ' Dateien');
    var dazu = [ki ? ki + ' mit KI erzeugt' : '', ue ? ue + ' nachgeschärft' : ''].filter(Boolean);
    setze('livre', f + ' Fotos in fertigen Grössen' + (dazu.length ? ', davon ' + dazu.join(' und ') + ', alle gekennzeichnet' : '') + '. ' + da + ' Dateien für Agenturen und Druckereien, dazu die Markenprüfung.');
  }).catch(function () { setze('livre-kurz', 'Fotos, Dateien, Markenprüfung'); setze('livre', '&nbsp;'); });

  /* Le Registre: Werte der Zählung ohne Cookies. Vorführ-Betrieb: Beispielwerte, als Beispiel beschriftet (R20) */
  var RN = {}; try { RN = JSON.parse($('#maison-registre').textContent) || {}; } catch (e) {}
  /* Ersatzweg Le Registre (abgelegte Beispielwerte beispiel/30.json): die Ablage enthält heute den ganzen Tag. Was nach der jetzigen Uhrzeit von
     Kandersteg begänne, fällt weg, genau wie im Werkzeug (registre.js kuerzen/werteAus), sonst stünde «heute» zu hoch (F31). */
  var jetztZuerich = function () {
    try { return new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zurich', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(new Date()); }
    catch (e) { return new Date().toTimeString().slice(0, 8); }
  };
  var pyRund = function (x, st) {   /* wie Python round() (registre.js pyRund) */
    st = st || 0; if (x == null || !isFinite(x)) return x;
    var f = Math.pow(10, st), y = Math.abs(x) * f, b = Math.floor(y), r = y - b;
    var k = r > 0.5 + 1e-9 ? b + 1 : r < 0.5 - 1e-9 ? b : (b % 2 ? b + 1 : b);
    return (x < 0 ? -k : k) / f;
  };
  /* Seitenarten wie im Besucherbuch des Hauses (registre.js artVon); Seiten des Ruedihus */
  var ART = { angebot: ['zu-zweit.html'], restaurant: ['essen.html'], feiern: ['veranstaltungen.html'] };
  var artVon = function (x) { return x === 'index.html' ? 'start' : /^zimmer[.-]/.test(x) ? 'zimmer' : Object.keys(ART).filter(function (k) { return ART[k].indexOf(x) >= 0; })[0] || 'sonst'; };
  var kuerze = function (d) {
    var R = d.roh; if (!R || !R.heute_voll || !Array.isArray(d.besuche) || !Array.isArray(d.je_tag) || !d.summe) return d;
    var jetzt = jetztZuerich(), heute = d.bis, u = d.summe, t = d.je_tag[d.je_tag.length - 1];
    var weg = d.besuche.filter(function (b) { return b.tag === heute && (b.zs || b.z + ':00') > jetzt; });
    if (!weg.length) return d;
    var SS = {}; (R.S || []).forEach(function (x) { SS[x[0] + '|' + x[1] + '|' + x[2]] = x[3]; });
    var laender = {}; (R.laender || []).forEach(function (x) { laender[x.k] = x.n; });
    weg.forEach(function (b) {
      u.besuche--; u.seiten -= b.seiten; if (b.buchung) u.buchung--; u.heute--;
      t.besuche--; t.seiten -= b.seiten; if (b.buchung) t.buchung--;
      var l = b.l || '??'; if (l in laender) laender[l]--;
      (b.weg || []).forEach(function (x) { var a = artVon(x.s); ['seite'].concat(x.e || []).forEach(function (e) { var k = e + '|' + a + '|' + b.g; SS[k] = (SS[k] || 0) - 1; }); });
    });
    u.laender = Object.keys(laender).filter(function (k) { return laender[k] > 0 && k !== '??' && k !== ''; }).length;
    var sum = function (e, a) { var z = 0; Object.keys(SS).forEach(function (k) { var p = k.split('|'); if (p[0] === e && (a == null || p[1] === a)) z += SS[k]; }); return z; };
    var wert = function (z, v, mehr) { var o = { zahl: z, von: v, anteil: v ? pyRund(Math.min(100, 100 * z / v), 1) : null }; for (var k in mehr || {}) o[k] = mehr[k]; return o; };
    var auf = sum('seite');
    d.werte = { start: wert(sum('buchung', 'start'), sum('seite', 'start')), zimmer: wert(sum('buchung', 'zimmer'), sum('seite', 'zimmer')),
      angebot: wert(sum('buchung', 'angebot'), sum('seite', 'angebot')), abbruch: wert(Math.max(0, sum('fenster') - sum('buchung')), sum('fenster')),
      tisch: wert(sum('tisch'), auf, { kueche: sum('tisch', 'restaurant') }), anfrage: wert(sum('anfrage') + sum('spa'), auf, { anfrage: sum('anfrage'), spa: sum('spa') }),
      kontakt: wert(sum('anruf') + sum('mail'), auf, { anruf: sum('anruf'), mail: sum('mail') }), chat: wert(sum('chat'), auf) };
    d.leer = !u.besuche;
    return d;
  };
  if ($('#registre')) hole('registre').then(kuerze).then(function (m) {
    var n = function (x) { return Number(x || 0).toLocaleString('de-CH'); };
    var w = m.werte || {};
    var aufrufe = function (z) { return z === 1 ? 'Aufruf' : 'Aufrufen'; };
    Object.keys(RN).forEach(function (key) {
      var x = w[key] || {}, von = ganz(x.von), da = von > 0, anteil = Number(x.anteil);
      /* Sätze wie im Werkzeug (registre.js, Ansicht «Zur Buchung») */
      var mal = function (z) { z = ganz(z); return z === 1 ? 'einmal' : n(z) + ' Mal'; };
      var bei = ', bei ' + n(von) + ' ' + aufrufe(von);
      var klein = key === 'kontakt' ? mal(x.anruf) + ' die Nummer, ' + mal(x.mail) + ' die Mail-Adresse' + bei
        : key === 'abbruch' ? n(x.zahl) + ' von ' + n(von) + (von === 1 ? ' geöffneten Fenster' : ' geöffneten Fenstern')
        : key === 'tisch' ? mal(x.zahl) + bei + ', davon ' + n(x.kueche) + ' auf der Seite «Essen»'
        : key === 'anfrage' ? (ganz(x.anfrage) === 1 ? 'eine Anfrage' : n(x.anfrage) + ' Anfragen') + ' abgeschickt, ' + (ganz(x.spa) === 1 ? 'einmal der Spa-Kalender' : n(x.spa) + ' Mal der Spa-Kalender') + bei
        : key === 'chat' ? mal(x.zahl) + ' geöffnet' + bei
        : n(x.zahl) + ' von ' + n(von) + ' ' + aufrufe(von) + (RN[key] ? ' ' + RN[key] : '');
      /* Robert 18.10.2026 17:37: Komma statt Punkt; die Zahl zählt einmal hoch, wenn der Teil ins Bild kommt */
      $$('[data-mw="' + key + '"]').forEach(function (el) { if (da && isFinite(anteil)) { el.dataset.ziel = anteil; el.textContent = anteil.toLocaleString('de-DE', { maximumFractionDigits: 1 }) + '\u00a0%'; zaehle(el); } else el.textContent = '–'; });
      $$('[data-mk="' + key + '"]').forEach(function (el) { el.textContent = da ? klein : 'Noch nichts gezählt'; });
    });
    var u = m.summe || {};
    /* «Heute»: Besuche und Klicks zur Buchung des heutigen Tages (letzter Eintrag in je_tag, F40); ohne Wert «–» */
    var jt = Array.isArray(m.je_tag) && m.je_tag.length ? m.je_tag[m.je_tag.length - 1] : null;
    setze('registre-heute', u.heute !== undefined && isFinite(Number(u.heute)) ? n(u.heute) : '–');
    setze('registre-buchung', jt && jt.buchung !== undefined && isFinite(Number(jt.buchung)) ? n(jt.buchung) : '–');
    if (m.beispiel) $$('.sb__zeile').forEach(function (z) { z.classList.add('beispiel'); z.setAttribute('title', 'Beispielwerte, bis die Website echte Besuche zählt'); });
    var bs = ganz(u.besuche);   /* Stand auf dem Anhänger: Besuche des Zeitraums, Beispielwerte als solche benannt (R20) */
    setze('registre-kurz', m.leer || !bs ? 'Noch keine Besuche gezählt' : n(bs) + (bs === 1 ? ' Besuch' : ' Besuche') + ' in ' + n(ganz(m.tage)) + ' Tagen' + (m.beispiel ? ' · Beispiel' : ''));
    /* Weg des Gastes (Robert 18.10.2026 20:03, Fassung C): Besuche → Buchungsfenster geöffnet → weiter zu SimpleBooking → gebucht (zählt SimpleBooking) */
    var tg = ganz(m.tage), WB = ganz(u.besuche), WF = ganz((w.abbruch || {}).von), WK = ganz(u.buchung);
    var ORD = { 2: 'zweite', 3: 'dritte', 4: 'vierte', 5: 'fünfte', 6: 'sechste', 7: 'siebte', 8: 'achte', 9: 'neunte', 10: 'zehnte', 11: 'elfte', 12: 'zwölfte' };
    var proz = function (x) { return (Math.round(x * 1000) / 10).toLocaleString('de-DE', { maximumFractionDigits: 1 }) + '\u00a0%'; };
    var jeder = function (r) { var k = Math.round(1 / r); if (!ORD[k]) return proz(r) + ' der Besuche'; var d = r * k; return (d < .97 ? 'fast ' : d > 1.03 ? 'gut ' : '') + 'jeder ' + ORD[k] + ' Besuch'; };
    var teil = function (r) { var T = [[1 / 4, 'ein Viertel'], [1 / 3, 'ein Drittel'], [1 / 2, 'die Hälfte'], [2 / 3, 'zwei Drittel'], [3 / 4, 'drei Viertel']];
      for (var i = 0; i < T.length; i++) { var d = r / T[i][0]; if (d > .88 && d < 1.2) return (d < .97 ? 'knapp ' : d > 1.03 ? 'gut ' : 'rund ') + T[i][1] + ' davon'; } return proz(r) + ' davon'; };
    var zahlWeg = function (k, z) { $$('[data-mg="' + k + '"]').forEach(function (el) { el.textContent = n(z); if (!wegIO || !z) return; el.dataset.ganz = z; wegIO.observe(el); }); };
    var kleinWeg = function (k, s) { $$('[data-mgk="' + k + '"]').forEach(function (el) { el.textContent = s; }); };
    if (m.leer || !WB) { ['besuche', 'fenster', 'weiter'].forEach(function (k) { zahlWeg(k, 0); kleinWeg(k, 'Noch nichts gezählt'); }); }
    else {
      zahlWeg('besuche', WB); zahlWeg('fenster', WF); zahlWeg('weiter', WK);
      kleinWeg('besuche', 'auf der Website, in ' + (tg === 30 ? 'dreissig' : n(tg)) + ' Tagen');
      kleinWeg('fenster', WF ? jeder(WF / WB) : 'noch nie geöffnet');
      kleinWeg('weiter', WF && WK ? teil(WK / WF) : WK ? n(WK) + ' Mal' : 'noch keiner');
    }
    setze('besuche', m.leer ? 'Noch keine Besuche gezählt.' : (m.beispiel ? 'Beispielwerte, bis die Website echte Besuche zählt · ' : '') + 'letzte ' + n(tg) + ' Tage');
  }).catch(function () { setze('registre-kurz', 'Besuche ohne Namen'); setze('besuche', 'Die Zählung ist gerade nicht abrufbar.'); setze('registre-heute', '–'); setze('registre-buchung', '–'); });
  window.MAISON_BEREIT = true;   /* Startfehler-Tür (R04): ohne dieses Zeichen öffnet fehler.js die Tür */
})();
