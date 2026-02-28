
(function(){
  const AUTH_ENTITIES = ['BAO','BOBA','BOCC','BOES','BOGA','BOGB','BOPO','BOVA','AOC'];
  const GROUP_ENTITIES = ['BOBA','BOCC','BOES','BOGA','BOGB','BOPO','BOVA','AOC'];
  const FN_BY_ENTITY = { BAO:'CEX', BOBA:'CDC', BOCC:'CDT', BOES:'CDR', BOGA:'PDM', BOGB:'PDA', BOPO:'PDE', BOVA:'PDM', AOC:'PDS' };
  const STORAGE = { user:'missaghji:user', history:'missaghji:history', counters:'missaghji:counters', settings:'missaghji:settings' };

  const $ = (id)=>document.getElementById(id);
  const views = { auth: $('view-auth'), app: $('view-app'), history: $('view-history') };
  const idBadge = $('idBadge');
  const ls = { get(k,d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d }catch(e){ return d } }, set(k,v){ localStorage.setItem(k, JSON.stringify(v)) } };

  // Router helpers
  function show(view){ Object.values(views).forEach(v=>v.classList.add('hidden')); if(view==='auth'){ document.body.classList.add('only-auth'); views.auth.classList.remove('hidden'); } else if(view==='app'){ document.body.classList.remove('only-auth'); views.app.classList.remove('hidden'); } else { document.body.classList.remove('only-auth'); views.history.classList.remove('hidden'); } }
  function route(){ const hash=location.hash.replace('#/','')||''; const user=ls.get(STORAGE.user,null); if(!user){ show('auth'); return; } if(hash==='history') fillHistory(); show(hash==='history'?'history':'app'); refreshBadge(); prepareApp(); }
  window.addEventListener('hashchange', route);

  function setOptions(select, list){ select.innerHTML=''; list.forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; select.appendChild(o); }); }

  // --- Auth
  const authName=$('authName'), authEntity=$('authEntity');
  function fillAuth(){ setOptions(authEntity, AUTH_ENTITIES); }
  authName.addEventListener('input', ()=>{ authName.value = authName.value.toUpperCase(); });
  $('authValidate').addEventListener('click', ()=>{ const name=(authName.value||'').trim(); const entity=authEntity.value; if(!name){ alert('Veuillez saisir votre nom'); return; } const user={ name, entity }; ls.set(STORAGE.user,user); const c=ls.get(STORAGE.counters,{}); if(!c[entity]) c[entity]={emetteur:1,recepteur:1}; ls.set(STORAGE.counters,c); location.hash='#/app'; route(); });

  // --- App
  const roleSelect=$('roleSelect');
  const hh=$('hh'), mm=$('mm'); const btnNow=$('btnNow');
  const emNum=$('emNum'), emGen=$('emGen'), emName=$('emName'), emFunc=$('emFunc'), emEntity=$('emEntity');
  const reNum=$('reNum'), reGen=$('reGen'), reName=$('reName'), reFunc=$('reFunc'), reEntity=$('reEntity');
  const message=$('message');

  function zero2(n){ return (n<10?'0':'')+n }
  function setNow(){ const d=new Date(); hh.value=zero2(d.getHours()); mm.value=zero2(d.getMinutes()); }
  btnNow.addEventListener('click', setNow);
  [emName,reName].forEach(inp=>inp.addEventListener('input',()=>{ inp.value = inp.value.toUpperCase(); }));

  function refreshBadge(){ const user=ls.get(STORAGE.user,null); if(!user){ idBadge.textContent=''; return; } idBadge.textContent = user.name + ' · ' + user.entity; }

  function loadSettings(){ const s=ls.get(STORAGE.settings,{lang:'fr',role:'emetteur'}); $('langSelect').value=s.lang||'fr'; $('mLangSelect').value=s.lang||'fr'; roleSelect.value=s.role||'emetteur'; }
  function saveSettings(){ const s=ls.get(STORAGE.settings,{}); s.lang=$('langSelect').value; s.role=roleSelect.value; ls.set(STORAGE.settings,s); $('mLangSelect').value=s.lang; }
  $('langSelect').addEventListener('change', saveSettings); $('mLangSelect').addEventListener('change', ()=>{ $('langSelect').value=$('mLangSelect').value; saveSettings(); });

  function counterpartEntitiesIfUserBAO(){ return GROUP_ENTITIES; }

  function prepareApp(){ const user=ls.get(STORAGE.user,null); if(!user) return; loadSettings(); setNow(); configureByRole(); }

  function configureByRole(){
    const user=ls.get(STORAGE.user,null); if(!user) return; const role=roleSelect.value; const ownFunc = FN_BY_ENTITY[user.entity] || '';
    // reset states
    emFunc.readOnly=false; reFunc.readOnly=false; emEntity.disabled=false; reEntity.disabled=false;

    if(role==='emetteur'){
      // Your block = Emetteur
      emName.value=user.name.toUpperCase(); emFunc.value=ownFunc; emFunc.readOnly=true; setOptions(emEntity,[user.entity]); emEntity.disabled=true;
      // Collaborator = Recepteu r (empty by default)
      reName.value=''; reFunc.value='';
      if(user.entity==='BAO'){
        setOptions(reEntity, counterpartEntitiesIfUserBAO()); // BOBA..AOC
        reEntity.disabled=false;
      } else {
        setOptions(reEntity, ['BAO']); reEntity.value='BAO'; reEntity.disabled=true;
      }
      emGen.style.display='inline-block'; reGen.style.display='none';
    } else {
      // Your block = Recepteur
      reName.value=user.name.toUpperCase(); reFunc.value=ownFunc; reFunc.readOnly=true; setOptions(reEntity,[user.entity]); reEntity.disabled=true;
      // Collaborator = Emetteur (empty by default)
      emName.value=''; emFunc.value='';
      if(user.entity==='BAO'){
        setOptions(emEntity, counterpartEntitiesIfUserBAO()); emEntity.disabled=false;
      } else {
        setOptions(emEntity, ['BAO']); emEntity.value='BAO'; emEntity.disabled=true;
      }
      emGen.style.display='none'; reGen.style.display='inline-block';
    }
  }
  roleSelect.addEventListener('change', ()=>{ saveSettings(); configureByRole(); });

  // Update collaborator entity when collaborator function changes (rules for BAO)
  function onCollaboratorFuncChange(){
    const user=ls.get(STORAGE.user,null); if(!user) return; const role=roleSelect.value;
    const funcField = (role==='emetteur')? reFunc : emFunc; // collaborator side
    const entitySelect = (role==='emetteur')? reEntity : emEntity;
    const f = (funcField.value||'').trim().toUpperCase();

    if(user.entity==='BAO'){
      if(f==='CCO'){
        setOptions(entitySelect, ['DELCO']); entitySelect.value='DELCO'; entitySelect.disabled=true;
      } else if(['CDC','CDT','CDR','PDM','PDA','PDE','PDS'].includes(f)){
        setOptions(entitySelect, GROUP_ENTITIES); entitySelect.disabled=false;
      } else {
        // Unknown/empty: allow choosing among group (no prefill)
        setOptions(entitySelect, GROUP_ENTITIES); entitySelect.disabled=false;
      }
    } else {
      // not BAO: keep BAO as default unless CCO => DELCO
      if(f==='CCO'){ setOptions(entitySelect, ['DELCO']); entitySelect.value='DELCO'; entitySelect.disabled=true; }
      else { setOptions(entitySelect, ['BAO']); entitySelect.value='BAO'; entitySelect.disabled=true; }
    }
  }
  reFunc.addEventListener('input', onCollaboratorFuncChange);
  emFunc.addEventListener('input', onCollaboratorFuncChange);

  // Generators
  function loadCounters(){ return ls.get(STORAGE.counters,{}); }
  function saveCounters(c){ ls.set(STORAGE.counters,c); }
  function nextNumberFor(entity, role){ const c=loadCounters(); if(!c[entity]) c[entity]={emetteur:1,recepteur:1}; const n=c[entity][role]; c[entity][role]=Math.min(999,(n||1))+1; saveCounters(c); return n||1; }
  emGen.addEventListener('click', ()=>{ const user=ls.get(STORAGE.user,null); if(!user) return; if(roleSelect.value!=='emetteur'){ alert('Le générateur actif est côté Récepteur'); return; } emNum.value = nextNumberFor(user.entity,'emetteur'); });
  reGen.addEventListener('click', ()=>{ const user=ls.get(STORAGE.user,null); if(!user) return; if(roleSelect.value!=='recepteur'){ alert('Le générateur actif est côté Émetteur'); return; } reNum.value = nextNumberFor(user.entity,'recepteur'); });

  // Refresh form
  function doRefresh(){ roleSelect.value='emetteur'; hh.value=mm.value=''; emNum.value=emName.value=emFunc.value=''; reNum.value=reName.value=reFunc.value=''; message.value=''; const user=ls.get(STORAGE.user,null); if(user){ emName.value=user.name.toUpperCase(); } configureByRole(); setNow(); saveSettings(); }
  $('btnRefresh').addEventListener('click', doRefresh); $('mRefresh').addEventListener('click', ()=>{ closeMenu(); doRefresh(); });

  // Change entity -> go auth immediately (first click)
  function gotoAuth(ev){ if(ev){ ev.preventDefault(); ev.stopPropagation(); } closeMenu(); location.hash='#/auth'; show('auth'); setTimeout(()=>{ $('authEntity').focus(); },0); }
  $('btnChangeEntity').addEventListener('click', gotoAuth); $('mChangeEntity').addEventListener('click', gotoAuth);

  // History
  function getHistory(){ return ls.get(STORAGE.history,[]); }
  function setHistory(list){ ls.set(STORAGE.history,list); }
  function fillHistory(){ const tbody=document.querySelector('#historyTable tbody'); tbody.innerHTML=''; const hist=getHistory(); for(const row of hist){ const tr=document.createElement('tr'); const cells=[row.time,row.emNum,row.emName,row.emFunc,row.emEntity,row.reNum,row.reName,row.reFunc,row.reEntity,row.message]; cells.forEach(c=>{ const td=document.createElement('td'); td.textContent=c??''; tr.appendChild(td); }); tbody.appendChild(tr); } }
  $('btnHistory').addEventListener('click', ()=>{ location.hash='#/history'; route(); }); $('mHistory').addEventListener('click', ()=>{ closeMenu(); location.hash='#/history'; route(); }); $('btnBack').addEventListener('click', ()=>{ location.hash='#/app'; route(); });

  $('btnClearAll').addEventListener('click', ()=>{ if(!confirm("Supprimer tout l'historique ?")) return; setHistory([]); fillHistory(); });
  $('btnExport').addEventListener('click', ()=>{ const hist=getHistory(); const head=['heure','n_emetteur','nom_emetteur','fonction_emetteur','entite_emetteur','n_recepteur','nom_recepteur','fonction_recepteur','entite_recepteur','message']; const rows=hist.map(r=>[r.time,r.emNum,r.emName,r.emFunc,r.emEntity,r.reNum,r.reName,r.reFunc,r.reEntity,(r.message||'').replace(/\n/g,' ')]); const csv=[head.join(';')].concat(rows.map(a=>a.map(v=>`"${(v??'').toString().replace('"','""')}"`).join(';'))).join('\n'); const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='missaghji_history.csv'; a.click(); URL.revokeObjectURL(url); });

  // Save
  $('btnSave').addEventListener('click', ()=>{ const user=ls.get(STORAGE.user,null); if(!user){ alert("Identifiez-vous d'abord"); location.hash='#/auth'; route(); return; } const time=`${(hh.value||'').padStart(2,'0')}:${(mm.value||'').padStart(2,'0')}`; const rec={ time, emNum:(emNum.value||'').trim(), emName:(emName.value||'').trim().toUpperCase(), emFunc:(emFunc.value||'').trim(), emEntity: emEntity.disabled ? (ls.get(STORAGE.user,null)||{}).entity : emEntity.value, reNum:(reNum.value||'').trim(), reName:(reName.value||'').trim().toUpperCase(), reFunc:(reFunc.value||'').trim(), reEntity: reEntity.disabled ? (ls.get(STORAGE.user,null)||{}).entity : reEntity.value, message:(message.value||'').trim() }; if(!rec.message){ alert('Message vide'); return; } if(!rec.emName || !rec.reName){ alert('Nom émetteur et nom récepteur requis'); return; } const hist=getHistory(); hist.push(rec); setHistory(hist); const hint=$('saveHint'); hint.textContent='Enregistré'; setTimeout(()=>hint.textContent='',1500); });

  // Menu
  const menuWrap=$('menuWrap'); const btnMenu=$('btnMenu');
  btnMenu.addEventListener('click', ()=>{ menuWrap.classList.toggle('open'); });
  function closeMenu(){ menuWrap.classList.remove('open'); }
  document.addEventListener('click', (e)=>{ if(!menuWrap.contains(e.target)) closeMenu(); });

  // Install
  let deferredPrompt=null;
  window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); deferredPrompt=e; $('btnInstall').classList.remove('hidden'); $('mInstall').classList.remove('hidden'); $('btnInstallHelp').classList.add('hidden'); $('mInstallHelp').classList.add('hidden'); });
  function promptInstall(){ if(!deferredPrompt) return; deferredPrompt.prompt(); deferredPrompt.userChoice.finally(()=>{ deferredPrompt=null; $('btnInstall').classList.add('hidden'); $('mInstall').classList.add('hidden'); }); }
  $('btnInstall').addEventListener('click', ()=>{ promptInstall(); }); $('mInstall').addEventListener('click', ()=>{ closeMenu(); promptInstall(); });
  $('btnInstallHelp').addEventListener('click', ()=>{ alert("Sur iPhone/iPad : Partager ▸ Ajouter à l'écran d'accueil. Sur Android : menu ⋮ ▸ Ajouter à l'écran d'accueil."); }); $('mInstallHelp').addEventListener('click', ()=>{ closeMenu(); alert("Sur iPhone/iPad : Partager ▸ Ajouter à l'écran d'accueil. Sur Android : menu ⋮ ▸ Ajouter à l'écran d'accueil."); });

  document.addEventListener('DOMContentLoaded', ()=>{ fillAuth(); const user=ls.get(STORAGE.user,null); if(user){ authName.value=user.name; authEntity.value=user.entity; } route(); });
})();
