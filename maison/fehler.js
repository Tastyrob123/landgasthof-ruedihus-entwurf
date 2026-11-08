document.documentElement.classList.add('js');   /* Bewegung nur mit Skript; als Datei statt eingebettet (Sicherheitsregel online lässt keine eingebetteten Skripte zu) */
/* Fehlermelder (R03), vor allem anderen: Skriptfehler in den Browser (rh_fehler, liest die Prüfung von Le Bureau) und an dessen Server-Teil
   (studio/api/fehler). Netzfehler nie melden, höchstens 20 je Seite, eigener Fehlschlag wird nicht erneut gemeldet. */
(function(){var zahl=0;function merk(t){t=String(t);window.MAISON_FEHLER=t;if(++zahl>20||/Load failed|access control|abort|NetworkError|Failed to fetch/i.test(t))return;
try{var a=JSON.parse(localStorage.getItem('rh_fehler')||'[]');a.push({z:new Date().toISOString(),t:('Die Stube: '+t).slice(0,300)});localStorage.setItem('rh_fehler',JSON.stringify(a.slice(-20)))}catch(e){}
try{fetch('/studio/api/fehler',{method:'POST',headers:{'Content-Type':'application/json','X-Studio':'1'},body:JSON.stringify({text:('Die Stube · '+t).slice(0,600)}),keepalive:true}).catch(function(){})}catch(e){}}
window.addEventListener('error',function(e){if(e.target&&e.target.tagName==='SCRIPT'){window.MAISON_FEHLER='Die Datei '+e.target.getAttribute('src').split('?')[0]+' liess sich nicht laden.';return}merk((e.message||'Fehler')+' · '+(e.filename||'').split('/').pop()+':'+(e.lineno||''))},true);
window.addEventListener('unhandledrejection',function(e){merk('Versprechen: '+((e.reason&&e.reason.message)||e.reason))});
/* Startfehler-Tür (R04): ist maison.js beim Laden der Seite nicht durchgelaufen, sagt die Seite es, zeigt alles ohne Bewegung und führt zur Prüfung.
   Wache nach 12 s, falls «load» wegen eines hängenden Bildes ausbleibt. */
function tuer(){if(window.MAISON_BEREIT)return;var t=document.getElementById('tuer');if(!t||!t.hidden)return;
document.documentElement.classList.remove('js');document.getElementById('tuer-t').textContent=window.MAISON_FEHLER||'Das Programm der Seite ist nicht durchgelaufen.';t.hidden=false}
window.addEventListener('load',tuer);setTimeout(tuer,12000);})();
