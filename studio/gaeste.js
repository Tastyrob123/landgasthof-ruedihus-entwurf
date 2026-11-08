/* Gäste & Anfragen (Studio der Schwesterhäuser, aus gast_haeuser.py). Liest die Gästefragen aus /api/fragen und schreibt Antwort-Entwürfe über /api/gast.
   Verschickt nichts: Mails öffnet das Mailprogramm, der Text für die Website wird kopiert und im Studio eingesetzt. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var h = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var FRAGEN = [], FILTER = 'luecke';
  document.querySelectorAll('.g__reiter button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.g__reiter button').forEach(function (x) { x.classList.toggle('an', x === b); });
      $('#gefragt').hidden = b.dataset.r !== 'gefragt'; $('#anfragen').hidden = b.dataset.r !== 'anfragen';
    });
  });
  function datum(z) { var d = new Date(z); return d.toLocaleDateString('de-CH', { day: 'numeric', month: 'long' }) + ', ' + d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }) + ' Uhr'; }
  function woche(z) {
    var d = new Date(z), t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), tag = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - tag); var j = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)), kw = Math.ceil(((t - j) / 864e5 + 1) / 7);
    var mo = new Date(d); mo.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return { k: t.getUTCFullYear() + '-' + kw, titel: 'Woche ' + kw + ' · ab ' + mo.toLocaleDateString('de-CH', { day: 'numeric', month: 'long' }) };
  }
  function zeige() {
    var el = $('#gefragt'), alle = FRAGEN, luecken = alle.filter(function (x) { return !x.belegt && !x.erledigt; });
    var liste = FILTER === 'luecke' ? luecken : FILTER === 'erledigt' ? alle.filter(function (x) { return x.erledigt; }) : alle, gruppen = [];
    liste.forEach(function (x) { var w = woche(x.zeit), g = gruppen.filter(function (y) { return y.k === w.k; })[0]; if (!g) { g = { k: w.k, titel: w.titel, l: [] }; gruppen.push(g); } g.l.push(x); });
    el.innerHTML = '<div class="g__zahlen"><div><b>' + alle.length + '</b><span>Fragen gesamt</span></div><div><b>' + alle.filter(function (x) { return !x.belegt; }).length + '</b><span>nicht auf der Seite</span></div><div><b>' + alle.filter(function (x) { return x.buchung; }).length + '</b><span>mit Buchungsmaske</span></div><div><b>' + luecken.length + '</b><span>noch offen</span></div></div>' +
      '<div class="g__filter"><button type="button" data-f="luecke" class="' + (FILTER === 'luecke' ? 'an' : '') + '">Nicht auf der Seite</button><button type="button" data-f="alle" class="' + (FILTER === 'alle' ? 'an' : '') + '">Alle Fragen</button><button type="button" data-f="erledigt" class="' + (FILTER === 'erledigt' ? 'an' : '') + '">Erledigt</button><button type="button" data-f="neu">Neu laden</button></div>' +
      (gruppen.length ? gruppen.map(function (g) {
        return '<h2 class="g__woche">' + h(g.titel) + '</h2>' + g.l.map(function (x) {
          return '<article class="g__frage" data-id="' + h(x.id) + '"><b>' + h(x.frage) + '</b>' + (!x.belegt && !x.erledigt ? '<span class="g__marke g__marke--gold">Steht nicht auf der Seite</span>' : '') + (x.erledigt ? '<span class="g__marke">Erledigt</span>' : '') +
            '<small>' + datum(x.zeit) + (x.thema ? ' · ' + h(x.thema) : '') + (x.buchung ? ' · Buchungsmaske gezeigt' : '') + '</small>' +
            '<details><summary>Antwort der Rezeption</summary><p>' + h(x.antwort).replace(/\n/g, '<br>') + '</p></details>' +
            '<div class="g__aktion">' + (x.erledigt ? '<button class="kn kn--linie" type="button" data-a="offen">Zurückholen</button>' :
              (!x.belegt ? '<button class="kn" type="button" data-a="kopieren">Frage für die Website kopieren</button>' : '') + '<button class="kn kn--linie" type="button" data-a="erledigt">Erledigt</button>') + '</div></article>';
        }).join('');
      }).join('') : '<p class="g__leer">' + (FILTER === 'luecke' ? 'Keine Lücken: Jede Frage liess sich aus der Website beantworten.' : 'Noch nichts da. Sobald Gäste die Rezeption im Chat fragen, steht es hier.') + '</p>');
  }
  function lade() {
    $('#gefragt').innerHTML = '<p class="g__leer">Die Fragen werden geladen.</p>';
    // Seit 17.10.2026 abends liefert /api/fragen nur mit Geheimnis (401 ohne): in dieser Vorschau bleiben die Gästefragen geschützt
    fetch('/api/fragen', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw r.status; return r.json(); })
      .then(function (d) { FRAGEN = d.fragen || []; zeige(); })
      .catch(function (s) {
        $('#gefragt').innerHTML = '<p class="g__leer">' + (s === 401 || s === 403 ? 'In dieser Vorschau bleiben die Fragen der Gäste geschützt und werden hier nicht angezeigt.'
          : 'Die Gästefragen liegen im Speicher der Online-Fassung. Öffnen Sie das Studio auf der Online-Adresse des Hauses.') + '</p>';
      });
  }
  $('#gefragt').addEventListener('click', function (ev) {
    var f = ev.target.closest('[data-f]'), b = ev.target.closest('[data-a]');
    if (f) { if (f.dataset.f === 'neu') return lade(); FILTER = f.dataset.f; return zeige(); }
    if (!b) return;
    var k = b.closest('.g__frage'), x = FRAGEN.filter(function (y) { return y.id === k.dataset.id; })[0];
    if (b.dataset.a === 'kopieren') {
      navigator.clipboard.writeText((x.thema || x.frage) + '\n').then(function () { b.textContent = 'Kopiert: im Studio unter den häufigen Fragen einsetzen und die Antwort schreiben'; });
      return;
    }
    fetch('/api/fragen', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tun: b.dataset.a, id: x.id }) })
      .then(function (r) { if (!r.ok) throw 0; x.erledigt = b.dataset.a === 'erledigt'; zeige(); })
      .catch(function () { alert('Das hat nicht geklappt.'); });
  });
  // ---------------- Anfragen beantworten
  var E = null;
  $('#an-los').addEventListener('click', function () {
    var mail = $('#an-mail').value.trim(), hinweis = $('#an-hinweis').value.trim(), fe = $('#an-f'), los = $('#an-los');
    fe.textContent = '';
    if (mail.length < 20) { fe.textContent = 'Bitte die Anfrage des Gastes einfügen.'; return; }
    los.disabled = true; los.textContent = 'Wird geschrieben …';
    $('#an-ergebnis').innerHTML = '<p class="g__leer">Der Assistent liest die Anfrage und die Unterlagen des Hauses.</p>';
    fetch('/api/gast', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ modus: 'anfrage', mail: mail, hinweis: hinweis }) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok || !j.text) throw new Error(j.fehler || 'Das hat nicht geklappt.'); return j; }); })
      .then(function (j) {
        E = j; E.mail = mail;
        var offen = (j.text.match(/\[[^\]]+\]/g) || []).length;
        $('#an-ergebnis').innerHTML = '<div class="g__blatt" style="margin-top:18px"><h2 class="g__woche" style="margin-top:0">Entwurf <span class="g__marke">' + (offen ? offen + (offen === 1 ? ' Stelle' : ' Stellen') + ' in [Klammern] klären' : 'bereit zum Lesen') + '</span></h2>' +
          '<label class="g__feld"><span>Betreff</span><input id="an-betreff" value="' + h(j.betreff || '') + '"></label><label class="g__feld"><span>Mail</span><textarea id="an-text" rows="18">' + h(j.text) + '</textarea></label>' +
          (j.team ? '<div class="g__team"><b>Nur für das Team</b><br>' + h(j.team).replace(/\n/g, '<br>') + '</div>' : '') +
          '<div class="g__aktion"><button class="kn" type="button" data-e="mail">Im Mailprogramm öffnen</button><button class="kn kn--linie" type="button" data-e="kopieren">Text kopieren</button></div><p class="g__leise">Erst lesen, dann senden. Alles in eckigen Klammern entscheidet das Haus.</p></div>';
        $('#an-ergebnis').scrollIntoView({ behavior: 'smooth', block: 'start' });
      })
      .catch(function (e) { fe.textContent = e.message; $('#an-ergebnis').innerHTML = ''; })
      .then(function () { los.disabled = false; los.textContent = 'Entwurf schreiben'; });
  });
  $('#an-ergebnis').addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-e]'); if (!b || !E) return;
    var text = $('#an-text').value, betreff = $('#an-betreff').value;
    if (b.dataset.e === 'kopieren') navigator.clipboard.writeText(text).then(function () { b.textContent = 'Kopiert'; });
    if (b.dataset.e === 'mail') { var an = (E.mail.match(/[\w.+-]+@[\w-]+\.[\w.-]+/) || [''])[0]; location.href = 'mailto:' + an + '?subject=' + encodeURIComponent(betreff) + '&body=' + encodeURIComponent(text); }
  });
  lade();
})();
