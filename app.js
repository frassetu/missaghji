
(function(){
  // --- Data model strictly from user rules ---
  const BO_ENTS = ['BOBA','BOCC','BOES','BOGA','BOGB','BOPO','BOVA','AOC'];
  const AUTH_ENTS = ['BAO', ...BO_ENTS]; // DELCO retiré de l'accueil
  const F_BY_ENTITY = {
    BAO: ['CEX'],
    DELCO: ['CCO'],
    BOBA: ['CDC','CDT','CDR','PDA','PDE','PDM','PDS'],
    BOCC: ['CDC','CDT','CDR','PDA','PDE','PDM','PDS'],
    BOES: ['CDC','CDT','CDR','PDA','PDE','PDM','PDS'],
    BOGA: ['CDC','CDT','CDR','PDA','PDE','PDM','PDS'],
    BOGB: ['CDC','CDT','CDR','PDA','PDE','PDM','PDS'],
    BOPO: ['CDC','CDT','CDR','PDA','PDE','PDM','PDS'],
    BOVA: ['CDC','CDT','CDR','PDA','PDE','PDM','PDS'],
    AOC:  ['CDC','CDT','CDR','PDA','PDE','PDM','PDS']
  };

  const STORAGE = { user:'miss:user', history:'miss:hist', counters:'miss:cnt', settings:'miss:cfg' };
  const $=id=>document.getElementById(id);
  const views={auth:$('view-auth'), app:$('view-app'), history:$('view-history')};
  const idBadge=$('idBadge');
  const ls={ get(k,d){ try{return JSON.parse(localStorage.getItem(k)) ?? d}catch(e){return d} }, set(k,v){ localStorage.setItem(k, JSON.stringify(v)) } };

  function setOptions(sel, list){ sel.innerHTML=''; list.forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; sel.appendChild(o); }); }

  function show(view){ Object.values(views).forEach(v=>v.classList.add('hidden')); if(view==='auth'){ document.body.classList.add('only-auth'); views.auth.classList.remove('hidden'); } else if(view==='app'){ document.body.classList.remove('only-auth'); views.app.classList.remove('hidden'); } else { document.body.classList.remove('only-auth'); views.history.classList.remove('hidden'); } }
  function route(){ const user=ls.get(STORAGE.user,null); const hash=(location.hash||'').replace('#/',''); if(!user){ show('auth'); return; } if(hash==='history') fillHistory(); show(hash==='history'?'history':'app'); refreshBadge(); prepareApp(); }
  window.addEventListener('hashchange', route);

  // --- Auth ---
  const authName=$('authName'), authEntity=$('authEntity');
  function fillAuth(){ setOptions(authEntity, AUTH_ENTS); }
  authName.addEventListener('input', ()=>{ authName.value = authName.value.toUpperCase(); });
  $('authValidate').addEventListener('click', ()=>{ const name=(authName.value||'').trim(); const entity=authEntity.value; if(!name){ alert('Veuillez saisir votre nom'); return; } const user={ name, entity }; ls.set(STORAGE.user,user); const c=ls.get(STORAGE.counters,{}); if(!c[entity]) c[entity]={emetteur:1,recepteur:1}; ls.set(STORAGE.counters,c); location.hash='#/app'; route(); });

  // --- App refs ---
  const roleSelect=$('roleSelect');
  const hh=$('hh'), mm=$('mm'); $('btnNow').addEventListener('click', ()=>{ const d=new Date(); const z=n=>n<10?'0'+n:n; hh.value=z(d.getHours()); mm.value=z(d.getMinutes()); });
  const emNum=$('emNum'), reNum=$('reNum');
  const emGen=$('emGen'), reGen=$('reGen');
  const emName=$('emName'), reName=$('reName');
  const emFunc=$('emFunc'), emEntity=$('emEntity');
  const reFunc=$('reFunc'), reEntity=$('reEntity');
  const message=$('message');

  // Digits only filters
  function digitsOnly(max){ return function(){ this.value=this.value.replace(/\D/g,'').slice(0,max); } }
  ;[emNum,reNum].forEach(inp=>inp.addEventListener('input',digitsOnly(3)));
  hh.addEventListener('input',digitsOnly(2)); mm.addEventListener('input',digitsOnly(2));

  [emName,reName].forEach(i=>i.addEventListener('input',()=>{ i.value=i.value.toUpperCase(); }));

  function refreshBadge(){ const u=ls.get(STORAGE.user,null); idBadge.textContent=u? (u.name+' · '+u.entity):'' }

  function saveSettings(){ const s=ls.get(STORAGE.settings,{}); s.role=roleSelect.value; ls.set(STORAGE.settings,s); }

  function counterpartEntitiesFor(userEntity){
    // Si BAO => correspondant DELCO ou BO* ; Si BO* => correspondant BAO ou DELCO
    if(userEntity==='BAO') return ['DELCO', ...BO_ENTS];
    if(BO_ENTS.includes(userEntity)) return ['BAO','DELCO'];
    return ['BAO','DELCO'];
  }

  function prepareApp(){ const user=ls.get(STORAGE.user,null); if(!user) return;
    const s=ls.get(STORAGE.settings,{role:'emetteur'}); roleSelect.value=s.role||'emetteur';
    // Own side
    setOptions(emEntity,[user.entity]); emEntity.disabled=true;
    setOptions(emFunc, F_BY_ENTITY[user.entity]); emFunc.disabled = (F_BY_ENTITY[user.entity].length===1); // BAO => CEX (1), BO => 7 (libre)
    emName.value = user.name.toUpperCase();

    // Collaborator defaults from last snapshot if any
    let snap=ls.get('miss:snap',null);
    // Fill collaborator allowed entities and functions based on user's entity
    setOptions(reEntity, counterpartEntitiesFor(user.entity));
    // If we have a previously chosen collaborator entity, keep it if still allowed
    if(snap && snap.reEntity && counterpartEntitiesFor(user.entity).includes(snap.reEntity)) reEntity.value=snap.reEntity;
    // Functions list is contextual to the selected reEntity (apply coupling)
    applyCouplingFromEntity();
    if(snap && snap.reFunc && Array.from(reFunc.options).some(o=>o.value===snap.reFunc)) reFunc.value=snap.reFunc;

    // Role toggles only which generator is visible; it should NOT wipe fields
    emGen.style.display = (roleSelect.value==='emetteur')?'inline-block':'none';
    reGen.style.display = (roleSelect.value==='recepteur')?'inline-block':'none';
  }

  roleSelect.addEventListener('change', ()=>{ saveSettings(); ls.set('miss:snap',{ reEntity: reEntity.value, reFunc: reFunc.value, reName: reName.value, emNum: emNum.value, reNum: reNum.value, msg: message.value }); prepareApp(); restoreSnap(); });

  function restoreSnap(){ const s=ls.get('miss:snap',null); if(!s) return; if(s.reName) reName.value=s.reName; if(s.emNum) emNum.value=s.emNum; if(s.reNum) reNum.value=s.reNum; if(s.msg) message.value=s.msg; }

  // Two-way coupling between collaborator entity and function
  reEntity.addEventListener('change', applyCouplingFromEntity);
  reFunc.addEventListener('change', applyCouplingFromFunction);

  function applyCouplingFromEntity(){
    const ent = reEntity.value;
    if(ent==='BAO'){ setOptions(reFunc, ['CEX']); reFunc.disabled=true; }
    else if(ent==='DELCO'){ setOptions(reFunc, ['CCO']); reFunc.disabled=true; }
    else if(BO_ENTS.includes(ent)){ setOptions(reFunc, F_BY_ENTITY[ent]); reFunc.disabled=false; }
  }
  function applyCouplingFromFunction(){
    const fn = reFunc.value;
    if(fn==='CEX'){ setOptions(reEntity, ['BAO']); reEntity.disabled=true; }
    else if(fn==='CCO'){ setOptions(reEntity, ['DELCO']); reEntity.disabled=true; }
    else {
      // Function BO => force BO entities only, but also respect counterpart rule from user entity
      const user=ls.get(STORAGE.user,null); const allowed=counterpartEntitiesFor(user.entity); const boAllowed = BO_ENTS.filter(e=>allowed.includes(e));
      setOptions(reEntity, boAllowed); reEntity.disabled=false;
    }
  }

  // Generators per entity/role
  function loadCounters(){ return ls.get(STORAGE.counters,{}); }
  function saveCounters(c){ ls.set(STORAGE.counters,c); }
  function nextNumberFor(entity, role){ const c=loadCounters(); if(!c[entity]) c[entity]={emetteur:1,recepteur:1}; const n=c[entity][role]||1; c[entity][role]=Math.min(999,n+1); saveCounters(c); return n; }
  emGen.addEventListener('click', ()=>{ const user=ls.get(STORAGE.user,null); if(!user) return; if(roleSelect.value!=='emetteur'){ alert('Le générateur actif est côté Récepteur'); return; } emNum.value = nextNumberFor(user.entity,'emetteur'); });
  reGen.addEventListener('click', ()=>{ const user=ls.get(STORAGE.user,null); if(!user) return; if(roleSelect.value!=='recepteur'){ alert('Le générateur actif est côté Émetteur'); return; } reNum.value = nextNumberFor(user.entity,'recepteur'); });

  // Save / Refresh inline
  $('btnRefreshInline').addEventListener('click', ()=>{ emNum.value=reNum.value=''; message.value=''; ls.set('miss:snap',{ reEntity: reEntity.value, reFunc: reFunc.value, reName: reName.value, emNum: emNum.value, reNum: reNum.value, msg: message.value }); });

  $('btnSave').addEventListener('click', ()=>{
    const user=ls.get(STORAGE.user,null); if(!user){ alert("Identifiez-vous d'abord"); location.hash='#/auth'; route(); return; }
    if(!(emName.value||'').trim() || !(reName.value||'').trim()){ alert('Nom émetteur et nom récepteur requis'); return; }
    const time=`${(hh.value||'').padStart(2,'0')}:${(mm.value||'').padStart(2,'0')}`;
    // own func from mapping (if BO user, emFunc may be selectable among 7; we trust the select value)
    const ownFunc = (emFunc.value||'');
    const rec={ time, emNum:(emNum.value||'').trim(), emName:emName.value.trim().toUpperCase(), emFunc:ownFunc, emEntity:user.entity, reNum:(reNum.value||'').trim(), reName:reName.value.trim().toUpperCase(), reFunc:reFunc.value, reEntity:reEntity.value, message:(message.value||'').trim() };
    if(!rec.message){ alert('Message vide'); return; }
    // Guards: forbid CEX<->CEX and BO<->BO
    const isBO=e=>BO_ENTS.includes(e);
    if( (rec.emFunc==='CEX' && rec.reFunc==='CEX') || (isBO(rec.emEntity) && isBO(rec.reEntity)) ){
      alert('Combinaison non autorisée'); return;
    }
    const hist=ls.get(STORAGE.history,[]); hist.push(rec); ls.set(STORAGE.history,hist);
    const hint=$('saveHint'); hint.textContent='Enregistré ✓'; setTimeout(()=>hint.textContent='',1200);
  });

  // History
  function fillHistory(){ const tb=document.querySelector('#historyTable tbody'); tb.innerHTML=''; const hist=ls.get(STORAGE.history,[]); hist.forEach(r=>{ const tr=document.createElement('tr'); [r.time,r.emNum,r.emName,r.emFunc,r.emEntity,r.reNum,r.reName,r.reFunc,r.reEntity,r.message].forEach(v=>{ const td=document.createElement('td'); td.textContent=v??''; tr.appendChild(td); }); tb.appendChild(tr); }); }
  $('btnHistory').addEventListener('click', ()=>{ location.hash='#/history'; route(); }); $('mHistory').addEventListener('click', ()=>{ location.hash='#/history'; route(); }); $('btnBack').addEventListener('click', ()=>{ location.hash='#/app'; route(); });
  $('btnClearAll').addEventListener('click', ()=>{ if(!confirm("Supprimer tout l'historique ?")) return; ls.set(STORAGE.history,[]); fillHistory(); });
  $('btnExport').addEventListener('click', ()=>{ const hist=ls.get(STORAGE.history,[]); const head=['heure','n_emetteur','nom_emetteur','fonction_emetteur','entite_emetteur','n_recepteur','nom_recepteur','fonction_recepteur','entite_recepteur','message']; const rows=hist.map(r=>[r.time,r.emNum,r.emName,r.emFunc,r.emEntity,r.reNum,r.reName,r.reFunc,r.reEntity,(r.message||'').replace(/\n/g,' ')]); const csv=[head.join(';')].concat(rows.map(a=>a.map(v=>`"${(v??'').toString().replaceAll('"','""')}"`).join(';'))).join('\n'); const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='missaghji_history.csv'; a.click(); URL.revokeObjectURL(url); });

  // Menu
  const menuWrap=$('menuWrap'); $('btnMenu').addEventListener('click', ()=>menuWrap.classList.toggle('open')); document.addEventListener('click', e=>{ if(!menuWrap.contains(e.target)) menuWrap.classList.remove('open'); });
  $('btnChangeEntity').addEventListener('click', gotoAuth); $('mChangeEntity').addEventListener('click', gotoAuth);
  function gotoAuth(e){ if(e){ e.preventDefault(); e.stopPropagation(); } menuWrap.classList.remove('open'); location.hash='#/auth'; show('auth'); setTimeout(()=>{ $('authEntity').focus(); },0); }

  // Install
  let deferredPrompt=null; window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); deferredPrompt=e; $('btnInstall').classList.remove('hidden'); $('mInstall').classList.remove('hidden'); $('btnInstallHelp').classList.add('hidden'); $('mInstallHelp').classList.add('hidden'); });
  function promptInstall(){ if(!deferredPrompt){ alert("Installation non disponible pour l'instant. Utilisez le bouton d'aide."); return; } deferredPrompt.prompt(); deferredPrompt.userChoice.finally(()=>{ deferredPrompt=null; $('btnInstall').classList.add('hidden'); $('mInstall').classList.add('hidden'); }); }
  $('btnInstall').addEventListener('click', promptInstall); $('mInstall').addEventListener('click', ()=>{ menuWrap.classList.remove('open'); promptInstall(); });

  document.addEventListener('DOMContentLoaded', ()=>{ fillAuth(); const s=ls.get(STORAGE.settings,{role:'emetteur'}); const u=ls.get(STORAGE.user,null); if(u){ authName.value=u.name; if(AUTH_ENTS.includes(u.entity)) $('authEntity').value=u.entity; } route(); });
})();
