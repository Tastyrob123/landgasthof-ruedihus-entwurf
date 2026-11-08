/* Hängt «Gäste & Anfragen» ins Menü des Studios (Seite gaeste.html daneben). Das Studio baut sein Menü selbst neu, deshalb wird nachgesehen, sobald es sich ändert. */
(function () {
  function rein() {
    var nav = document.querySelector('#rand nav');
    if (!nav || nav.querySelector('.gaeste-link')) return;
    if (nav.querySelector('.nw')) {   // Le Bureau (seit 17.10.2026): Eintrag in der Form der übrigen Leiste, gleich unter «Eingang» (18.10.2026)
      var b = document.createElement('a');
      b.className = 'nw gaeste-link'; b.href = 'gaeste.html';
      b.innerHTML = '<span>Gäste &amp; Anfragen</span><em>Chat</em>';
      var e = nav.querySelector('a.nw[href*="eingang"]');
      if (e) e.after(b); else nav.appendChild(b);
      return;
    }
    var a = document.createElement('a');
    a.className = 'gaeste-link'; a.href = 'gaeste.html';
    a.innerHTML = '<svg class="zeichen" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/></svg>Gäste & Anfragen';
    nav.appendChild(a);
  }
  new MutationObserver(rein).observe(document.documentElement, { childList: true, subtree: true });
  rein();
})();
