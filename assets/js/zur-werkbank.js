/* ZUR WERKBANK 18.10.2026 (Werkbank-Chat Ruedihus) · Robert ~23:00, alle vier Häuser: «… in jeder Sache irgendwie einen Button, dass ich zurückkomme
   zur Werkbank, wenn ich von der Werkbank dahin gekommen bin. Außer bei der Website.» Die Werkbank hängt beim Verlassen ?wb=<Höhe> an den Link.
   Hier: steht wb in der Adresse (oder kam man in diesem Fenster schon so herein), erscheint unten links «Zurück zur Werkbank»; der Knopf öffnet die
   Werkbank auf genau dieser Höhe (?y=). Ohne wb bleibt die Seite wie bisher. Wird beim Zusammenstellen für online in die Seiten gehängt
   (_werkzeuge/online/stell_ruedihus.py), nicht in die Website und nicht in die Werkbank selbst. */
(function () {
  try {
    var q = new URLSearchParams(location.search), wb = q.get('wb'), K = 'wb-zurueck';
    if (wb !== null && /^\d+$/.test(wb)) {
      var ref = document.referrer, o = '';
      try { if (ref && /\/werkbank\//.test(new URL(ref).pathname)) o = new URL(ref).origin; } catch (e) {}
      sessionStorage.setItem(K, JSON.stringify({ y: +wb, o: o || (sessionStorage.getItem(K) ? JSON.parse(sessionStorage.getItem(K)).o : '') }));
      q.delete('wb'); history.replaceState(history.state, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash);
    }
    var d = JSON.parse(sessionStorage.getItem(K) || 'null');
    if (!d) return;
    var basis = d.o || (/tastystudios\.ch$/.test(location.hostname) && !/-analyse\./.test(location.hostname) || /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? location.origin : 'https://ruedihus.tastystudios.ch');
    var ziel = basis + '/werkbank/?y=' + d.y;
    /* Endprüfung 19.10.2026: auch der Eintrag «Zur Werkbank» in der Leiste der Werkzeuge (Link auf /werkbank/ ohne Stelle) tut dasselbe wie der Knopf:
       Tab schliessen, wenn er aus der Werkbank geöffnet wurde, sonst die Werkbank auf der Höhe öffnen. */
    function zurueck(ev) {
      var o = null; try { o = window.opener; } catch (e) {}
      ev.preventDefault();
      if (o && !o.closed) { try { o.focus(); } catch (e) {} window.close(); setTimeout(function () { if (!window.closed) location.href = ziel; }, 400); }
      else location.href = ziel;
    }
    document.addEventListener('click', function (ev) {
      var l = ev.target && ev.target.closest && ev.target.closest('a[href]'); if (!l || l.id === 'zur-werkbank' || ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
      var u; try { u = new URL(l.getAttribute('href'), location.href); } catch (e) { return; }
      if (u.hash || u.searchParams.has('y') || !/\/werkbank\/(?:index\.html)?$/.test(u.pathname)) return;
      zurueck(ev);
    }, true);
    function setz() {
      if (document.getElementById('zur-werkbank')) return;
      var st = document.createElement('style');
      st.textContent = '#zur-werkbank{position:fixed;left:max(16px,env(safe-area-inset-left));bottom:max(16px,env(safe-area-inset-bottom));z-index:2147483000;display:inline-flex;align-items:center;gap:12px;'
        + 'padding:7px 18px 7px 7px;border-radius:999px;text-decoration:none;font:600 11.5px/1 ui-sans-serif,system-ui,-apple-system,sans-serif;letter-spacing:.14em;text-transform:uppercase;'
        + 'color:#fbf5ea;background:linear-gradient(180deg,#4a2f18,#321f10 60%,#1f1209);box-shadow:inset 0 1px 0 rgba(255,255,255,.16),0 0 0 1px rgba(201,133,67,.45),0 14px 24px -12px rgba(0,0,0,.6);'
        + 'transition:transform .25s cubic-bezier(.2,.8,.2,1)}#zur-werkbank:hover{transform:translateY(-2px)}#zur-werkbank:active{transform:translateY(0) scale(.98)}'
        + '#zur-werkbank i{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:linear-gradient(180deg,#f3cd94,#c98543);color:#1f1209;box-shadow:inset 0 1px 0 rgba(255,255,255,.5)}'
        + '#zur-werkbank svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}'
        + '@media print{#zur-werkbank{display:none}}';
      document.head.appendChild(st);
      var a = document.createElement('a');
      a.id = 'zur-werkbank'; a.href = ziel; a.setAttribute('aria-label', 'Zurück zur Werkbank, an die Stelle, an der Sie sie verlassen haben');
      a.innerHTML = '<i><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M12 8H4M7.5 4.5 4 8l3.5 3.5"/></svg></i><span>Zurück zur Werkbank</span>';
      /* Robert 19.10.2026 01:18: Werkzeuge und Beigaben öffnen in einem neuen Tab; «Zurück zur Werkbank» schliesst diesen Tab wieder,
         die Werkbank steht im ersten Tab noch genau da, wo man sie verlassen hat. Geht das Schliessen nicht, öffnet der Link die Werkbank auf der Höhe. */
      a.addEventListener('click', zurueck);
      document.body.appendChild(a);
      /* Endprüfung 19.10.2026: in Werkzeugen mit Leiste links (Schreibtisch, Tafel, Besucherbuch, Werkstatt …) lag der Knopf über den untersten Einträgen.
         Steht unten links eine hohe, schmale Leiste am Rand, rückt der Knopf rechts daneben (Angabe data-neben/data-luft am alten Skript gilt zuerst). */
      var t = document.querySelector('script[data-zw][data-neben]'), luft = t ? (+t.getAttribute('data-luft') || 24) : 24;
      function leiste() {
        if (t) { var n = document.querySelector(t.getAttribute('data-neben')); if (n && n.offsetParent !== null) return n; }
        a.style.visibility = 'hidden';
        var e = null, l = document.elementsFromPoint(24, innerHeight - 30);
        for (var i = 0; i < l.length; i++) { var r = l[i].getBoundingClientRect(); if (l[i] === document.body || l[i] === document.documentElement) continue;
          if (r.left <= 4 && r.width > 120 && r.width < innerWidth * .45 && r.height > innerHeight * .5) { e = l[i]; } }
        a.style.visibility = ''; return e;
      }
      function lage() { var e = innerWidth > 700 ? leiste() : null, r = e && e.getBoundingClientRect();
        a.style.left = r && r.right > 0 && r.right < innerWidth * .5 ? Math.round(r.right + luft) + 'px' : ''; }
      lage(); addEventListener('resize', lage); addEventListener('load', lage); setTimeout(lage, 1500); setTimeout(lage, 4000);
    }
    if (document.body) setz(); else document.addEventListener('DOMContentLoaded', setz);
  } catch (e) {}
})();
