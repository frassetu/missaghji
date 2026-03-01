
(function(){
  // --- Data ---
  const BO = ['BOBA','BOCC','BOES','BOGA','BOGB','BOPO','BOVA','AOC'];
  const AUTH = ['BAO', ...BO]; // DELCO absent de l'accueil
  const F_BY_E = {
    BAO:['CEX'], DELCO:['CCO'],
    BOBA:['CDC','CDT','CDR','PDA','PDE','PDM','PDS'], BOCC:['CDC','CDT','CDR','PDA','PDE','PDM','PDS'], BOES:['CDC','CDT','CDR','PDA','PDE','PDM','PDS'],
    BOGA:['CDC','CDT','CDR','PDA','PDE','PDM','PDS'], BOGB:['CDC','CDT','CDR','PDA','PDE','PDM','PDS'], BOPO:['CDC','CDT','CDR','PDA','PDE','PDM','PDS'],
    BOVA:['CDC','CDT','CDR','PDA','PDE','PDM','PDS'], AOC:['CDC','CDT','CDR','PDA','PDE','PDM','PDS']
  };

  const STORAGE={user:'miss:u',settings:'miss:s',hist:'miss:h',cnt:'miss:c',snap:'miss:snap'};
  const $=id=>document.getElementById(id);
  const ls={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}}, set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};

  const views={auth:$('view-auth'),app:$('view-app'),history:$('view-history')};
  const setOptions=(sel,list)=>{ sel.innerHTML=''; list.forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;sel.appendChild(o);}); };
  const isBO=e=>BO.includes(e);

  // i18n
  const i18n={ fr:{id:'Identification',hint:'Entrez votre Nom et choisissez votre Entité.',installer:'Installer',installerQ:'Installer ?',historique:'Historique',changer:'Changer entité',role:'Rôle',hh:'Heure (HH)',mm:'Minutes (MM)',actualiser:'Actualiser',num:'N°',nom:'Nom',nomMaj:'Nom (MAJ)',fonction:'Fonction',entite:'Entité',message:'Message',enregistrer:'Enregistrer',refresh:'Rafraîchir',retour:'Retour',export:'Exporter CSV',clear:'Supprimer tout'}, co:{id:'Identificazione',hint:"Mettite u vostru Nome è sceglite l'Entità.",installer:'Installà',installerQ:'Installà ?',historique:'Storicu',changer:'Cambià entità',role:'Rolu',hh:'Ora (HH)',mm:'Minuti (MM)',actualiser:'Attualizà',num:'N°',nom:'Nome',nomMaj:'Nome (MAI)',fonction:'Funzione',entite:'Entità',message:'Messaghju',enregistrer:'Arregistrà',refresh:'Rinfrescà',retour:'Ritornu',export:'Esporta CSV',clear:'Sguassà tuttu'} };
  function L(){ const s=ls.get(STORAGE.settings,{lang:'fr'}); return i18n[s.lang||'fr']; }
  function applyLang(){ const t=L();
    $('btnInstall').textContent=t.installer; $('mInstall').textContent=t.installer; $('btnInstallHelp').textContent=t.installerQ; $('mInstallHelp').textContent=t.installerQ;
    $('btnHistory').textContent=t.historique; $('mHistory').textContent=t.historique; $('btnChangeEntity').textContent=t.changer; $('mChangeEntity').textContent=t.changer;
    $('titleAuth').textContent=t.id; $('authHint').textContent=t.hint; $('labelAuthName').textContent=t.nom; $('labelAuthEntity').textContent=t.entite; $('authValidate').textContent='Valider';
    $('titleContext').textContent='Contexte'; $('labelRole').textContent=t.role; $('labelHH').textContent=t.hh; $('labelMM').textContent=t.mm; $('btnNow').textContent=t.actualiser;
    $('titleEmetteur').textContent='Émetteur'; $('titleRecepteur').textContent='Récepteur';
    $('labelEmNum').textContent=t.num; $('labelEmName').textContent=t.nom; $('labelEmFunc').textContent=t.fonction; $('labelEmEntity').textContent=t.entite;
    $('labelReNum').textContent=t.num; $('labelReName').textContent=t.nomMaj; $('labelReFunc').textContent=t.fonction; $('labelReEntity').textContent=t.entite;
    $('titleMessage').textContent=t.message; $('btnSave').textContent=t.enregistrer; $('btnRefreshInline').textContent=t.refresh;
    $('authName').placeholder=(t===i18n.co?'U VOSTRU NOME (MAI)':'VOTRE NOM (MAJ)'); $('emName').placeholder=(t===i18n.co?'NOME EMETTITORE (MAI)':'NOM ÉMETTEUR (MAJ)'); $('reName').placeholder=(t===i18n.co?'NOME RICEVITORE (MAI)':'NOM RÉCEPTEUR (MAJ)');
  }

  function show(view){ Object.values(views).forEach(v=>v.classList.add('hidden')); if(view==='auth'){document.body.classList.add('only-auth');views.auth.classList.remove('hidden')} else if(view==='app'){document.body.classList.remove('only-auth');views.app.classList.remove('hidden')} else {document.body.classList.remove('only-auth');views.history.classList.remove('hidden')} }
  function route(){ const u=ls.get(STORAGE.user,null); if(!u){ show('auth'); return;} const hash=(location.hash||'').replace('#/',''); if(hash==='history') fillHistory(); show(hash==='history'?'history':'app'); refreshBadge(); prepareApp(); }
  window.addEventListener('hashchange', route);

  // Auth
  const authName=$('authName'), authEntity=$('authEntity');
  const langSelect=$('langSelect'), mLangSelect=$('mLangSelect');
  function fillAuth(){ setOptions(authEntity, AUTH); }
  authName.addEventListener('input',()=>authName.value=authName.value.toUpperCase());
  $('authValidate').addEventListener('click',()=>{ const name=(authName.value||'').trim(); const entity=authEntity.value; if(!name){alert('Veuillez saisir votre nom'); return;} const u={name,entity}; ls.set(STORAGE.user,u); const c=ls.get(STORAGE.cnt,{}); if(!c[entity]) c[entity]={emetteur:1,recepteur:1}; ls.set(STORAGE.cnt,c); location.hash='#/app'; route(); });

  // App refs
  const roleSelect=$('roleSelect');
  const hh=$('hh'), mm=$('mm'), btnNow=$('btnNow');
  const emNum=$('emNum'), reNum=$('reNum'), emGen=$('emGen'), reGen=$('reGen');
  const emName=$('emName'), reName=$('reName');
  const emFunc=$('emFunc'), emEntity=$('emEntity');
  const reFunc=$('reFunc'), reEntity=$('reEntity');
  const message=$('message');

  // Lang change
  function saveLang(){ const s=ls.get(STORAGE.settings,{lang:'fr',role:'emetteur'}); s.lang=langSelect.value; ls.set(STORAGE.settings,s); mLangSelect.value=s.lang; applyLang(); }
  langSelect.addEventListener('change', saveLang); mLangSelect.addEventListener('change', ()=>{ langSelect.value=mLangSelect.value; saveLang(); });

  // Digits only
  function digitsOnly(max){ return function(){ this.value=this.value.replace(/\D/g,'').slice(0,max); } }
  ;[emNum,reNum].forEach(inp=>inp.addEventListener('input',digitsOnly(3))); hh.addEventListener('input',digitsOnly(2)); mm.addEventListener('input',digitsOnly(2));

  // Time now
  function setNow(){ const d=new Date(); const z=n=>n<10?'0'+n:n; hh.value=z(d.getHours()); mm.value=z(d.getMinutes()); }
  btnNow.addEventListener('click', setNow);

  // Uppercase names
  ;[emName,reName].forEach(i=>i.addEventListener('input',()=>i.value=i.value.toUpperCase()));

  function refreshBadge(){ const u=ls.get(STORAGE.user,null); $('idBadge').textContent=u? (u.name+' · '+u.entity):'' }

  function counterpartEntitiesFor(userEntity){
    if(userEntity==='BAO') return ['DELCO', ...BO];
    if(BO.includes(userEntity)) return ['BAO','DELCO'];
    return ['BAO','DELCO'];
  }
  function allowedFunctionsForCounterpart(userEntity){
    if(userEntity==='BAO'){ // peut parler à DELCO (CCO) ou BO* (CDC..PDS)
      const boFuncs = Array.from(new Set(BO.flatMap(e=>F_BY_E[e]))); // CDC..PDS
      return ['CCO', ...boFuncs];
    }
    if(BO.includes(userEntity)){ // peut parler à BAO (CEX) ou DELCO (CCO)
      return ['CEX','CCO'];
    }
    return ['CEX','CCO'];
  }

  // role helpers
  function isEmitter(){ return roleSelect.value==='emetteur'; }
  function ownName(){ return isEmitter() ? emName : reName; }
  function colName(){ return isEmitter() ? reName : emName; }
  function ownFuncSel(){ return isEmitter() ? emFunc : reFunc; }
  function ownEntSel(){ return isEmitter() ? emEntity : reEntity; }
  function colFuncSel(){ return isEmitter() ? reFunc : emFunc; }
  function colEntSel(){ return isEmitter() ? reEntity : emEntity; }
  function ownNum(){ return isEmitter() ? emNum : reNum; }
  function colNum(){ return isEmitter() ? reNum : emNum; }
  function showGenerators(){ emGen.style.display = isEmitter()?'inline-block':'none'; reGen.style.display = isEmitter()?'none':'inline-block'; }

  function prepareApp(){ const u=ls.get(STORAGE.user,null); if(!u) return; const s=ls.get(STORAGE.settings,{lang:'fr',role:'emetteur'}); langSelect.value=s.lang||'fr'; mLangSelect.value=s.lang||'fr'; roleSelect.value=s.role||'emetteur'; applyLang(); setNow();
    // own side (verrouillé sur l'entité de l'utilisateur)
    setOptions(ownEntSel(), [u.entity]); ownEntSel().disabled=true; setOptions(ownFuncSel(), F_BY_E[u.entity]); ownFuncSel().disabled=(F_BY_E[u.entity].length===1);
    ownName().value = u.name.toUpperCase(); colName().value='';

    // collaborateur: listes autorisées
    const ents = counterpartEntitiesFor(u.entity); setOptions(colEntSel(), ents); colEntSel().disabled=false;
    const funcs = allowedFunctionsForCounterpart(u.entity); setOptions(colFuncSel(), funcs);
    // si fonction choisie n'est pas compatible avec entités autorisées, corriger via couplage
    applyCouplingBothWays(u.entity);
    showGenerators();
  }

  roleSelect.addEventListener('change', ()=>{ const s=ls.get(STORAGE.settings,{}); s.role=roleSelect.value; ls.set(STORAGE.settings,s); prepareApp(); });

  function applyCouplingFromEntity(entitySel, funcSel, userEntity){
    const ent=entitySel.value;
    if(ent==='BAO'){ setOptions(funcSel,['CEX']); funcSel.disabled=true; }
    else if(ent==='DELCO'){ setOptions(funcSel,['CCO']); funcSel.disabled=true; }
    else if(BO.includes(ent)){ // BO -> CDC..PDS
      const allowed=allowedFunctionsForCounterpart(userEntity);
      const boFuncs=Array.from(new Set(BO.flatMap(e=>F_BY_E[e])));
      const final = boFuncs.filter(f=>allowed.includes(f));
      setOptions(funcSel, final.length?final:['CDC']); funcSel.disabled=false; // fallback sécurité
    }
  }
  function applyCouplingFromFunction(funcSel, entitySel, userEntity){
    const fn=funcSel.value; const allowedEnts=counterpartEntitiesFor(userEntity);
    if(fn==='CEX'){ setOptions(entitySel, ['BAO']); entitySel.disabled=true; }
    else if(fn==='CCO'){ setOptions(entitySel, ['DELCO']); entitySel.disabled=true; }
    else { // BO function
      const boOnly = BO.filter(e=>allowedEnts.includes(e));
      setOptions(entitySel, boOnly.length?boOnly:allowedEnts); entitySel.disabled=false;
    }
  }
  function applyCouplingBothWays(userEntity){
    // 1) prioriser la fonction sélectionnée (si déjà présente) sinon appliquer depuis entité
    const fSel=colFuncSel(), eSel=colEntSel();
    if(fSel.value){ applyCouplingFromFunction(fSel,eSel,userEntity); }
    else { applyCouplingFromEntity(eSel,fSel,userEntity); }
  }

  // Wire coupling for both sides (toujours côté collaborateur)
  reEntity.addEventListener('change', ()=>{ const u=ls.get(STORAGE.user,null); if(isEmitter()) applyCouplingFromEntity(reEntity,reFunc,u.entity); else applyCouplingFromEntity(emEntity,emFunc,u.entity); });
  reFunc.addEventListener('change', ()=>{ const u=ls.get(STORAGE.user,null); if(isEmitter()) applyCouplingFromFunction(reFunc,reEntity,u.entity); else applyCouplingFromFunction(emFunc,emEntity,u.entity); });
  emEntity.addEventListener('change', ()=>{ const u=ls.get(STORAGE.user,null); if(isEmitter()) applyCouplingFromEntity(reEntity,reFunc,u.entity); else applyCouplingFromEntity(emEntity,emFunc,u.entity); });
  emFunc.addEventListener('change', ()=>{ const u=ls.get(STORAGE.user,null); if(isEmitter()) applyCouplingFromFunction(reFunc,reEntity,u.entity); else applyCouplingFromFunction(emFunc,emEntity,u.entity); });

  // Generators per entity/role
  function loadCounters(){ return ls.get(STORAGE.cnt,{}); }
  function saveCounters(c){ ls.set(STORAGE.cnt,c); }
  function nextNumberFor(entity, role){ const c=loadCounters(); if(!c[entity]) c[entity]={emetteur:1,recepteur:1}; const n=c[entity][role]||1; c[entity][role]=Math.min(999,n+1); saveCounters(c); return n; }
  emGen.addEventListener('click', ()=>{ const u=ls.get(STORAGE.user,null); if(!u) return; if(!isEmitter()){ alert('Le générateur actif est côté Récepteur'); return; } emNum.value = nextNumberFor(u.entity,'emetteur'); });
  reGen.addEventListener('click', ()=>{ const u=ls.get(STORAGE.user,null); if(!u) return; if(isEmitter()){ alert('Le générateur actif est côté Émetteur'); return; } reNum.value = nextNumberFor(u.entity,'recepteur'); });

  // Save + Refresh
  function doRefresh(){ const u=ls.get(STORAGE.user,null); if(!u) return; const role=roleSelect.value; emNum.value=reNum.value=''; message.value=''; if(role==='emetteur'){ emName.value=u.name.toUpperCase(); reName.value=''; } else { reName.value=u.name.toUpperCase(); emName.value=''; } setNow(); prepareApp(); }
  $('btnRefreshInline').addEventListener('click', doRefresh);

  $('btnSave').addEventListener('click', ()=>{ const u=ls.get(STORAGE.user,null); if(!u){ alert("Identifiez-vous d'abord"); location.hash='#/auth'; route(); return; }
    const emitterSide = isEmitter() ? {num:emNum, name:emName, func:emFunc, ent:emEntity} : {num:reNum, name:reName, func:reFunc, ent:reEntity};
    const receiverSide = isEmitter() ? {num:reNum, name:reName, func:reFunc, ent:reEntity} : {num:emNum, name:emName, func:emFunc, ent:emEntity};
    if(!(emitterSide.name.value||'').trim() || !(receiverSide.name.value||'').trim()){ alert('Nom émetteur et nom récepteur requis'); return; }
    const time=`${(hh.value||'').padStart(2,'0')}:${(mm.value||'').padStart(2,'0')}`;
    const rec={ time, emNum:(emitterSide.num.value||'').trim(), emName:emitterSide.name.value.trim().toUpperCase(), emFunc:emitterSide.func.value, emEntity:emitterSide.ent.value, reNum:(receiverSide.num.value||'').trim(), reName:receiverSide.name.value.trim().toUpperCase(), reFunc:receiverSide.func.value, reEntity:receiverSide.ent.value, message:(message.value||'').trim() };
    if(!rec.message){ alert('Message vide'); return; }
    if( (rec.emFunc==='CEX' && rec.reFunc==='CEX') || (isBO(rec.emEntity) && isBO(rec.reEntity)) ){ alert('Combinaison non autorisée'); return; }
    const hist=ls.get(STORAGE.hist,[]); hist.push(rec); ls.set(STORAGE.hist,hist); const hint=$('saveHint'); hint.textContent='Enregistré ✓'; setTimeout(()=>hint.textContent='',1200); doRefresh();
  });

  // History
  function fillHistory(){ const tb=document.querySelector('#historyTable tbody'); tb.innerHTML=''; const hist=ls.get(STORAGE.hist,[]); hist.forEach(r=>{ const tr=document.createElement('tr'); [r.time,r.emNum,r.emName,r.emFunc,r.emEntity,r.reNum,r.reName,r.reFunc,r.reEntity,r.message].forEach(v=>{ const td=document.createElement('td'); td.textContent=v??''; tr.appendChild(td); }); tb.appendChild(tr); }); }
  $('btnHistory').addEventListener('click', ()=>{ location.hash='#/history'; route(); }); $('mHistory').addEventListener('click', ()=>{ location.hash='#/history'; route(); }); $('btnBack').addEventListener('click', ()=>{ location.hash='#/app'; route(); });
  $('btnClearAll').addEventListener('click', ()=>{ if(!confirm("Supprimer tout l'historique ?")) return; ls.set(STORAGE.hist,[]); fillHistory(); });
  $('btnExport').addEventListener('click', ()=>{ const hist=ls.get(STORAGE.hist,[]); const head=['heure','n_emetteur','nom_emetteur','fonction_emetteur','entite_emetteur','n_recepteur','nom_recepteur','fonction_recepteur','entite_recepteur','message']; const rows=hist.map(r=>[r.time,r.emNum,r.emName,r.emFunc,r.emEntity,r.reNum,r.reName,r.reFunc,r.reEntity,(r.message||'').replace(/\n/g,' ')]); const csv=[head.join(';')].concat(rows.map(a=>a.map(v=>`"${(v??'').toString().replaceAll('"','""')}"`).join(';'))).join('\n'); const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='missaghji_history.csv'; a.click(); URL.revokeObjectURL(url); });

  // Menu + change entity
  const menuWrap=$('menuWrap'); $('btnMenu').addEventListener('click',()=>menuWrap.classList.toggle('open')); document.addEventListener('click',e=>{ if(!menuWrap.contains(e.target)) menuWrap.classList.remove('open'); });
  function gotoAuth(ev){ if(ev){ev.preventDefault();ev.stopPropagation();} menuWrap.classList.remove('open'); location.hash='#/auth'; show('auth'); setTimeout(()=>$('authEntity').focus(),0); }
  $('btnChangeEntity').addEventListener('click', gotoAuth); $('mChangeEntity').addEventListener('click', gotoAuth);

  // Install (fix iOS = no prompt)
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  let deferredPrompt=null;
  window.addEventListener('beforeinstallprompt', (e)=>{ if(isIOS) return; e.preventDefault(); deferredPrompt=e; $('btnInstall').classList.remove('hidden'); $('mInstall').classList.remove('hidden'); $('btnInstallHelp').classList.add('hidden'); $('mInstallHelp').classList.add('hidden'); });
  function promptInstall(){ if(!deferredPrompt){ alert("Installation non disponible ici. Utilisez le bouton 'Installer ?' pour l'aide."); return; } deferredPrompt.prompt(); deferredPrompt.userChoice.finally(()=>{ deferredPrompt=null; $('btnInstall').classList.add('hidden'); $('mInstall').classList.add('hidden'); }); }
  $('btnInstall').addEventListener('click', ()=>promptInstall()); $('mInstall').addEventListener('click', ()=>{ menuWrap.classList.remove('open'); promptInstall(); });
  if(isIOS){ $('btnInstall').classList.add('hidden'); $('mInstall').classList.add('hidden'); $('btnInstallHelp').classList.remove('hidden'); $('mInstallHelp').classList.remove('hidden'); }

  document.addEventListener('DOMContentLoaded', ()=>{ fillAuth(); const s=ls.get(STORAGE.settings,{lang:'fr',role:'emetteur'}); langSelect.value=s.lang||'fr'; mLangSelect.value=s.lang||'fr'; applyLang(); const u=ls.get(STORAGE.user,null); if(u){ authName.value=u.name; if(AUTH.includes(u.entity)) $('authEntity').value=u.entity; } route(); });
})();
