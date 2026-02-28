
(function(){
  const AUTH_ENTITIES = ['BAO','BOBA','BOCC','BOES','BOGA','BOGB','BOPO','BOVA','AOC'];
  const STORAGE = { user:'missaghji:user', history:'missaghji:history', counters:'missaghji:counters', settings:'missaghji:settings' };
  const $ = (id)=>document.getElementById(id);
  const views = { auth: $('view-auth'), app: $('view-app'), history: $('view-history') };
  const idBadge = $('idBadge');
  const ls = { get(k,d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d }catch{return d} }, set(k,v){ localStorage.setItem(k, JSON.stringify(v)) } };

  let deferredPrompt=null;
  window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); deferredPrompt=e; $('btnInstall').classList.remove('hidden'); });
  $('btnInstall').addEventListener('click', async()=>{ if(!deferredPrompt) return; deferredPrompt.prompt(); try{ await deferredPrompt.userChoice; }catch{} deferredPrompt=null; $('btnInstall').classList.add('hidden'); });

  // Auth entities
  const authEntity = $('authEntity'); AUTH_ENTITIES.forEach(e=>{ const o=document.createElement('option'); o.value=e; o.textContent=e; authEntity.appendChild(o); });

  function show(view){ Object.values(views).forEach(v=>v.classList.add('hidden')); if(view==='auth'){ document.body.classList.add('only-auth'); views.auth.classList.remove('hidden'); } else if(view==='app'){ document.body.classList.remove('only-auth'); views.app.classList.remove('hidden'); } else { document.body.classList.remove('only-auth'); views.history.classList.remove('hidden'); } }
  function route(){ const hash=location.hash.replace('#/','')||''; const user=ls.get(STORAGE.user,null); if(!user){ show('auth'); return; } if(hash==='history') fillHistory(); show(hash==='history' ? 'history' : 'app'); refreshBadge(); prepareApp(); }
  window.addEventListener('hashchange', route);

  const authName=$('authName');
  $('authValidate').addEventListener('click', ()=>{ const name=(authName.value||'').trim(); const entity=authEntity.value; if(!name){ alert('Veuillez saisir votre nom'); return; } const user={name,entity}; ls.set(STORAGE.user,user); const c=ls.get(STORAGE.counters,{}); if(!c[entity]) c[entity]={ emetteur:1, recepteur:1 }; ls.set(STORAGE.counters,c); location.hash='#/app'; });

  const roleSelect=$('roleSelect'); const hh=$('hh'); const mm=$('mm'); const btnNow=$('btnNow');
  const emNum=$('emNum'), emGen=$('emGen'), emName=$('emName'), emFunc=$('emFunc'), emEntity=$('emEntity');
  const reNum=$('reNum'), reName=$('reName'), reFunc=$('reFunc'), reEntity=$('reEntity');
  const message=$('message');

  function zero2(n){ return (n<10?'0':'')+n }
  function setNow(){ const d=new Date(); hh.value=zero2(d.getHours()); mm.value=zero2(d.getMinutes()); }
  btnNow.addEventListener('click', setNow);

  reName.addEventListener('input', ()=>{ reName.value = reName.value.toUpperCase(); });

  function refreshBadge(){ const user=ls.get(STORAGE.user,null); if(!user){ idBadge.textContent=''; return; } idBadge.textContent = user.name + ' · ' + user.entity; }

  function counterpartEntities(userEntity){ if(userEntity==='BAO') return ['DELCO','BOBA','BOCC','BOES','BOGA','BOGB','BOPO','BOVA','AOC']; const group=new Set(['BOBA','BOCC','BOES','BOGA','BOGB','BOPO','BOVA','AOC']); if(group.has(userEntity)) return ['BAO','DELCO']; return ['BAO','DELCO']; }
  function fillCounterpartSelect(){ const user=ls.get(STORAGE.user,null); const opts=counterpartEntities(user.entity); reEntity.innerHTML=''; opts.forEach(e=>{ const o=document.createElement('option'); o.value=e; o.textContent=e; reEntity.appendChild(o); }); }

  function loadSettings(){ const s=ls.get(STORAGE.settings, { lang:'fr', role:'emetteur' }); $('langSelect').value = s.lang||'fr'; roleSelect.value = s.role||'emetteur'; }
  function saveSettings(){ const s=ls.get(STORAGE.settings, {}); s.lang=$('langSelect').value; s.role=roleSelect.value; ls.set(STORAGE.settings, s); }
  $('langSelect').addEventListener('change', ()=>{ saveSettings(); });

  function prepareApp(){ const user=ls.get(STORAGE.user,null); if(!user) return; loadSettings(); setNow(); fillCounterpartSelect(); configureByRole(); }

  function configureByRole(){ const user=ls.get(STORAGE.user,null); const role=roleSelect.value; if(role==='emetteur'){ emName.value=user.name; emEntity.value=user.entity; emName.readOnly=true; emEntity.readOnly=true; emGen.disabled=false; $('emNum').disabled=false; reNum.disabled=false; reName.disabled=false; reFunc.disabled=false; reEntity.disabled=false; } else { reName.value=user.name.toUpperCase(); const opts=counterpartEntities(user.entity); reEntity.value=opts[0]; reName.readOnly=true; emGen.disabled=true; $('emNum').disabled=false; } }
  roleSelect.addEventListener('change', ()=>{ saveSettings(); configureByRole(); });

  function loadCounters(){ return ls.get(STORAGE.counters,{}); }
  function saveCounters(c){ ls.set(STORAGE.counters,c); }
  function nextNumberFor(entity, role){ const c=loadCounters(); if(!c[entity]) c[entity]={ emetteur:1, recepteur:1 }; const n=c[entity][role]; c[entity][role]=Math.min(999,(n||1))+1; saveCounters(c); return n||1; }

  const genBtn = $('emGen');
  genBtn.addEventListener('click', ()=>{ const user=ls.get(STORAGE.user,null); if(!user) return; const role=roleSelect.value; const n=nextNumberFor(user.entity, role); if(role==='emetteur') emNum.value=n; else reNum.value=n; });

  $('btnRefresh').addEventListener('click', ()=>{ if(!confirm('Vider le formulaire (Nom & Entité initiaux et historique conservés) ?')) return; roleSelect.value='emetteur'; hh.value=mm.value=''; emNum.value=emName.value=emFunc.value=''; reNum.value=reName.value=reFunc.value=''; message.value=''; const user=ls.get(STORAGE.user,null); if(user){ emName.value=user.name; emEntity.value=user.entity; } fillCounterpartSelect(); setNow(); saveSettings(); });

  $('btnChangeEntity').addEventListener('click', ()=>{ const user=ls.get(STORAGE.user,null); if(!user){ location.hash='#/auth'; return; } $('authName').value=user.name; $('authEntity').value=user.entity; location.hash='#/auth'; });

  function getHistory(){ return ls.get(STORAGE.history, []); }
  function setHistory(list){ ls.set(STORAGE.history, list); }
  function fillHistory(){ const tbody=document.querySelector('#historyTable tbody'); tbody.innerHTML=''; const hist=getHistory(); for(const row of hist){ const tr=document.createElement('tr'); const cells=[row.time,row.emNum,row.emName,row.emFunc,row.emEntity,row.reNum,row.reName,row.reFunc,row.reEntity,row.message]; cells.forEach(c=>{ const td=document.createElement('td'); td.textContent = c ?? ''; tr.appendChild(td); }); tbody.appendChild(tr); } }

  $('btnHistory').addEventListener('click', ()=>{ location.hash='#/history'; });
  $('btnBack').addEventListener('click', ()=>{ location.hash='#/app'; });
  $('btnClearAll').addEventListener('click', ()=>{ if(!confirm("Supprimer tout l'historique ?")) return; setHistory([]); fillHistory(); });
  $('btnExport').addEventListener('click', ()=>{ const hist=getHistory(); const head=['heure','n_emetteur','nom_emetteur','fonction_emetteur','entite_emetteur','n_recepteur','nom_recepteur','fonction_recepteur','entite_recepteur','message']; const rows=hist.map(r=>[r.time,r.emNum,r.emName,r.emFunc,r.emEntity,r.reNum,r.reName,r.reFunc,r.reEntity,(r.message||'').replace(/
/g,' ')]); const csv=[head.join(';')].concat(rows.map(a=>a.map(v=>`"${(v??'').toString().replace('"','""')}"`).join(';'))).join('
'); const blob=new Blob([csv], {type:'text/csv;charset=utf-8;'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='missaghji_history.csv'; a.click(); URL.revokeObjectURL(url); });

  $('btnSave').addEventListener('click', ()=>{ const user=ls.get(STORAGE.user,null); if(!user){ alert("Identifiez-vous d'abord"); location.hash='#/auth'; return; } const hhv=(hh.value||'').padStart(2,'0'); const mmv=(mm.value||'').padStart(2,'0'); const time=`${hhv}:${mmv}`; const rec={ time, emNum:(emNum.value||'').trim(), emName:(emName.value||'').trim(), emFunc:(emFunc.value||'').trim(), emEntity:(emEntity.value||user.entity), reNum:(reNum.value||'').trim(), reName:(reName.value||'').trim().toUpperCase(), reFunc:(reFunc.value||'').trim(), reEntity:reEntity.value, message:(message.value||'').trim() }; if(!rec.message){ alert('Message vide'); return; } if(!rec.emName || !rec.reName){ alert('Nom émetteur et nom récepteur requis'); return; } const hist=getHistory(); hist.push(rec); setHistory(hist); const hint=$('saveHint'); hint.textContent='Enregistré'; setTimeout(()=>hint.textContent='',1500); });

  (function initAuthPrefill(){ const user=ls.get(STORAGE.user,null); if(user){ $('authName').value=user.name; if(AUTH_ENTITIES.includes(user.entity)) $('authEntity').value=user.entity; } })();

  route();
})();
