
(function(){
  // --- Constants
  const AUTH_ENTITIES = ['BAO','BOBA','BOCC','BOES','BOGA','BOGB','BOPO','BOVA','AOC'];
  const STORAGE = { user:'missaghji:user', history:'missaghji:history', counters:'missaghji:counters', settings:'missaghji:settings' };
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  // --- Shorthands
  const $ = (id)=>document.getElementById(id);
  const views = { auth: $('view-auth'), app: $('view-app'), history: $('view-history') };
  const idBadge = $('idBadge');

  const ls = { get(k,d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d }catch(e){ return d } }, set(k,v){ localStorage.setItem(k, JSON.stringify(v)) } };

  // --- i18n
  const i18n = {
    fr: { identification:'Identification', authHint:'Entrez votre Nom et choisissez votre Entité.', valider:'Valider', installer:'Installer', installerHelp:'Installer ?', historique:'Historique', rafraichir:'Rafraîchir', changerEntite:'Changer entité', role:'Rôle', emetteur:'Émetteur', recepteur:'Récepteur', hh:'Heure (HH)', mm:'Minutes (MM)', actualiser:'Actualiser', numero:'N°', generer:'Générer', nom:'Nom', nomMaj:'Nom (MAJ)', fonction:'Fonction', entite:'Entité', message:'Message', enregistrer:'Enregistrer', retour:'Retour', exporter:'Exporter CSV', supprimerTout:'Supprimer tout', history:'Historique' },
    co: { identification:'Identificazione', authHint:"Mettite u vostru Nome è sceglite l'Entità.", valider:'Validà', installer:'Installà', installerHelp:'Installà ?', storico:'Storicu', historique:'Storicu', rafraichir:'Rinfrescà', changerEntite:"Cambià entità", role:'Rolu', emetteur:'Emettitore', recepteur:'Ricevitore', hh:'Ora (HH)', mm:'Minuti (MM)', actualiser:'Attualizà', numero:'N°', generer:'Generà', nom:'Nome', nomMaj:'Nome (MAI)', fonction:'Funzione', entite:'Entità', message:'Messaghju', enregistrer:'Arregistrà', retour:'Ritornu', exporter:'Esporta CSV', supprimerTout:'Sguassà tuttu', history:'Storicu' }
  };

  function applyLang(lang){
    const t = i18n[lang] || i18n.fr;
    // App bar buttons (both inline and dropdown)
    setText('btnInstall', t.installer); setText('mInstall', t.installer);
    setText('btnInstallHelp', t.installerHelp); setText('mInstallHelp', t.installerHelp);
    setText('btnHistory', t.historique); setText('mHistory', t.historique);
    setText('btnRefresh', t.rafraichir); setText('mRefresh', t.rafraichir);
    setText('btnChangeEntity', t.changerEntite); setText('mChangeEntity', t.changerEntite);

    // Titles
    setText('titleAuth', t.identification); setText('authHint', t.authHint);
    setText('titleContext', 'Contexte');
    setText('titleEmetteur', t.emetteur); setText('titleRecepteur', t.recepteur);
    setText('titleMessage', t.message); setText('titleHistory', t.history || t.historique);

    // Labels
    setText('labelAuthName', t.nom); setText('labelAuthEntity', t.entite);
    setText('labelRole', t.role); setText('labelHH', t.hh); setText('labelMM', t.mm);
    setText('labelEmNum', t.numero); setText('labelEmName', t.nom); setText('labelEmFunc', t.fonction); setText('labelEmEntity', t.entite);
    setText('labelReNum', t.numero); setText('labelReName', t.nomMaj); setText('labelReFunc', t.fonction); setText('labelReEntity', t.entite);

    // Buttons inside cards
    setText('btnNow', t.actualiser); setText('emGen', t.generer); setText('btnSave', t.enregistrer);
    setText('authValidate', t.valider); setText('btnBack', t.retour); setText('btnExport', t.exporter); setText('btnClearAll', t.supprimerTout);

    // Placeholders
    $('authName').placeholder = (lang==='co' ? 'U VOSTRU NOME (MAI)' : 'VOTRE NOM (MAJ)');
    $('emName').placeholder = (lang==='co' ? 'NOME EMETTITORE (MAI)' : 'NOM ÉMETTEUR (MAJ)');
    $('reName').placeholder = (lang==='co' ? 'NOME RICEVITORE (MAI)' : 'NOM RÉCEPTEUR (MAJ)');
    $('message').placeholder = (lang==='co' ? 'Scrivite u vostru messaghju (illimitatu)' : 'Saisissez votre message (illimité)');
  }
  function setText(id, txt){ const el=$(id); if(el) el.textContent = txt; }

  // --- Install flow
  let deferredPrompt=null;
  window.addEventListener('beforeinstallprompt', (e)=>{
    e.preventDefault(); deferredPrompt = e;
    $('btnInstall').classList.remove('hidden'); $('mInstall').classList.remove('hidden');
    $('btnInstallHelp').classList.add('hidden'); $('mInstallHelp').classList.add('hidden');
  });
  function promptInstall(){ if(!deferredPrompt) return; deferredPrompt.prompt(); deferredPrompt.userChoice.finally(()=>{ deferredPrompt=null; $('btnInstall').classList.add('hidden'); $('mInstall').classList.add('hidden'); }); }
  function showInstallHelp(){
    if(isIOS){
      alert("Sur iPhone/iPad : bouton Partager ▸ Ajouter à l'écran d'accueil.");
    } else {
      alert("Sur Android : menu ⋮ ▸ Ajouter à l'écran d'accueil, ou utilisez le bouton Installer quand il apparaît.");
    }
  }

  // --- Populate auth entities after DOM ready
  function fillAuthEntities(){
    const sel = $('authEntity'); sel.innerHTML='';
    AUTH_ENTITIES.forEach(e=>{ const o=document.createElement('option'); o.value=e; o.textContent=e; sel.appendChild(o); });
  }

  // --- Router
  function show(view){ Object.values(views).forEach(v=>v.classList.add('hidden')); if(view==='auth'){ document.body.classList.add('only-auth'); views.auth.classList.remove('hidden'); } else if(view==='app'){ document.body.classList.remove('only-auth'); views.app.classList.remove('hidden'); } else { document.body.classList.remove('only-auth'); views.history.classList.remove('hidden'); } }
  function route(){ const hash=location.hash.replace('#/','')||''; const user=ls.get(STORAGE.user,null); if(!user){ show('auth'); return; } if(hash==='history') fillHistory(); show(hash==='history'?'history':'app'); refreshBadge(); prepareApp(); }
  window.addEventListener('hashchange', route);

  // --- Auth
  const authName = $('authName'); const authEntity = $('authEntity');
  authName.addEventListener('input', ()=>{ authName.value = authName.value.toUpperCase(); });
  $('authValidate').addEventListener('click', ()=>{
    const name=(authName.value||'').trim(); const entity=authEntity.value; if(!name){ alert('Veuillez saisir votre nom'); return; }
    const user={ name, entity }; ls.set(STORAGE.user,user);
    const counters=ls.get(STORAGE.counters,{}); if(!counters[entity]) counters[entity] = { emetteur:1, recepteur:1 }; ls.set(STORAGE.counters, counters);
    location.hash = '#/app';
  });

  // --- App prep
  const roleSelect=$('roleSelect'); const hh=$('hh'); const mm=$('mm');
  const emNum=$('emNum'), emGen=$('emGen'), emName=$('emName'), emFunc=$('emFunc'), emEntity=$('emEntity');
  const reNum=$('reNum'), reName=$('reName'), reFunc=$('reFunc'), reEntity=$('reEntity');
  const message=$('message');

  function zero2(n){ return (n<10?'0':'')+n }
  function setNow(){ const d=new Date(); hh.value=zero2(d.getHours()); mm.value=zero2(d.getMinutes()); }
  $('btnNow').addEventListener('click', setNow);

  reName.addEventListener('input', ()=>{ reName.value = reName.value.toUpperCase(); });
  emName.addEventListener('input', ()=>{ emName.value = emName.value.toUpperCase(); });

  function refreshBadge(){ const user=ls.get(STORAGE.user,null); if(!user){ idBadge.textContent=''; return; } idBadge.textContent = user.name + ' · ' + user.entity; }

  function counterpartEntities(userEntity){ if(userEntity==='BAO') return ['DELCO','BOBA','BOCC','BOES','BOGA','BOGB','BOPO','BOVA','AOC']; const group=new Set(['BOBA','BOCC','BOES','BOGA','BOGB','BOPO','BOVA','AOC']); if(group.has(userEntity)) return ['BAO','DELCO']; return ['BAO','DELCO']; }
  function fillCounterpartSelect(){ const user=ls.get(STORAGE.user,null); const opts=counterpartEntities(user.entity); reEntity.innerHTML=''; opts.forEach(e=>{ const o=document.createElement('option'); o.value=e; o.textContent=e; reEntity.appendChild(o); }); }

  function loadSettings(){ const s=ls.get(STORAGE.settings,{lang:'fr',role:'emetteur'}); $('langSelect').value=s.lang||'fr'; $('mLangSelect').value=s.lang||'fr'; roleSelect.value=s.role||'emetteur'; applyLang(s.lang||'fr'); }
  function saveSettings(){ const s=ls.get(STORAGE.settings,{}); s.lang=$('langSelect').value; s.role=roleSelect.value; ls.set(STORAGE.settings,s); applyLang(s.lang); $('mLangSelect').value=s.lang; }

  $('langSelect').addEventListener('change', saveSettings);
  $('mLangSelect').addEventListener('change', ()=>{ $('langSelect').value=$('mLangSelect').value; saveSettings(); });

  function prepareApp(){ const user=ls.get(STORAGE.user,null); if(!user) return; loadSettings(); setNow(); fillCounterpartSelect(); if(!reEntity.options || reEntity.options.length===0) setTimeout(fillCounterpartSelect,0); configureByRole(); }

  function configureByRole(){ const user=ls.get(STORAGE.user,null); const role=roleSelect.value; if(role==='emetteur'){ emName.value=user.name; emEntity.value=user.entity; emName.readOnly=true; emEntity.readOnly=true; reName.readOnly=false; } else { reName.value=user.name.toUpperCase(); const opts=counterpartEntities(user.entity); reEntity.value=opts[0]; reName.readOnly=true; emName.readOnly=false; }
  }
  roleSelect.addEventListener('change', ()=>{ saveSettings(); configureByRole(); });

  function loadCounters(){ return ls.get(STORAGE.counters,{}); }
  function saveCounters(c){ ls.set(STORAGE.counters,c); }
  function nextNumberFor(entity, role){ const c=loadCounters(); if(!c[entity]) c[entity]={ emetteur:1, recepteur:1 }; const n=c[entity][role]; c[entity][role]=Math.min(999,(n||1))+1; saveCounters(c); return n||1; }

  $('emGen').addEventListener('click', ()=>{ const user=ls.get(STORAGE.user,null); if(!user) return; const role=roleSelect.value; const n=nextNumberFor(user.entity, role); if(role==='emetteur') emNum.value=n; else reNum.value=n; });

  $('btnRefresh').addEventListener('click', ()=>{ doRefresh(); });
  $('mRefresh').addEventListener('click', ()=>{ closeMenu(); doRefresh(); });
  function doRefresh(){ roleSelect.value='emetteur'; hh.value=mm.value=''; emNum.value=emName.value=emFunc.value=''; reNum.value=reName.value=reFunc.value=''; message.value=''; const user=ls.get(STORAGE.user,null); if(user){ emName.value=user.name; emEntity.value=user.entity; } fillCounterpartSelect(); setNow(); saveSettings(); }

  $('btnChangeEntity').addEventListener('click', ()=>{ changeEntity(); });
  $('mChangeEntity').addEventListener('click', ()=>{ closeMenu(); changeEntity(); });
  function changeEntity(){ const user=ls.get(STORAGE.user,null); if(!user){ location.hash='#/auth'; return; } $('authName').value=user.name; $('authEntity').value=user.entity; location.hash='#/auth'; }

  // History
  function getHistory(){ return ls.get(STORAGE.history,[]); }
  function setHistory(list){ ls.set(STORAGE.history,list); }

  function fillHistory(){ const tbody=document.querySelector('#historyTable tbody'); tbody.innerHTML=''; const hist=getHistory(); for(const row of hist){ const tr=document.createElement('tr'); const cells=[row.time,row.emNum,row.emName,row.emFunc,row.emEntity,row.reNum,row.reName,row.reFunc,row.reEntity,row.message]; cells.forEach(c=>{ const td=document.createElement('td'); td.textContent = c ?? ''; tr.appendChild(td); }); tbody.appendChild(tr); } }

  $('btnHistory').addEventListener('click', ()=>{ location.hash='#/history'; });
  $('mHistory').addEventListener('click', ()=>{ closeMenu(); location.hash='#/history'; });
  $('btnBack').addEventListener('click', ()=>{ location.hash='#/app'; });

  $('btnClearAll').addEventListener('click', ()=>{ if(!confirm("Supprimer tout l'historique ?")) return; setHistory([]); fillHistory(); });
  $('btnExport').addEventListener('click', ()=>{ const hist=getHistory(); const head=['heure','n_emetteur','nom_emetteur','fonction_emetteur','entite_emetteur','n_recepteur','nom_recepteur','fonction_recepteur','entite_recepteur','message']; const rows=hist.map(r=>[r.time,r.emNum,r.emName,r.emFunc,r.emEntity,r.reNum,r.reName,r.reFunc,r.reEntity,(r.message||'').replace(/\n/g,' ')]); const csv=[head.join(';')].concat(rows.map(a=>a.map(v=>`"${(v??'').toString().replace('"','""')}"`).join(';'))).join('\n'); const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='missaghji_history.csv'; a.click(); URL.revokeObjectURL(url); });

  // Save
  $('btnSave').addEventListener('click', ()=>{
    const user=ls.get(STORAGE.user,null); if(!user){ alert("Identifiez-vous d'abord"); location.hash='#/auth'; return; }
    const time=`${(hh.value||'').padStart(2,'0')}:${(mm.value||'').padStart(2,'0')}`;
    const rec={ time, emNum:(emNum.value||'').trim(), emName:(emName.value||'').trim().toUpperCase(), emFunc:(emFunc.value||'').trim(), emEntity:(emEntity.value||user.entity), reNum:(reNum.value||'').trim(), reName:(reName.value||'').trim().toUpperCase(), reFunc:(reFunc.value||'').trim(), reEntity:reEntity.value, message:(message.value||'').trim() };
    if(!rec.message){ alert('Message vide'); return; }
    if(!rec.emName || !rec.reName){ alert('Nom émetteur et nom récepteur requis'); return; }
    const hist=getHistory(); hist.push(rec); setHistory(hist);
    const hint=$('saveHint'); hint.textContent='Enregistré'; setTimeout(()=>hint.textContent='',1500);
  });

  // --- Menu burger behaviour
  const menuWrap=$('menuWrap'); const btnMenu=$('btnMenu');
  btnMenu.addEventListener('click', ()=>{ menuWrap.classList.toggle('open'); });
  function closeMenu(){ menuWrap.classList.remove('open'); }
  document.addEventListener('click', (e)=>{ if(!menuWrap.contains(e.target)) closeMenu(); });

  // --- Install buttons wiring
  $('btnInstall').addEventListener('click', ()=>{ promptInstall(); });
  $('mInstall').addEventListener('click', ()=>{ closeMenu(); promptInstall(); });
  $('btnInstallHelp').addEventListener('click', ()=>{ showInstallHelp(); });
  $('mInstallHelp').addEventListener('click', ()=>{ closeMenu(); showInstallHelp(); });

  // --- Init after DOM ready
  document.addEventListener('DOMContentLoaded', ()=>{
    // Fill auth select and apply language
    fillAuthEntities();
    const s=ls.get(STORAGE.settings,{lang:'fr',role:'emetteur'}); applyLang(s.lang||'fr');

    // Prefill from storage
    const user=ls.get(STORAGE.user,null); if(user){ $('authName').value=user.name; $('authEntity').value=user.entity; }

    // If beforeinstallprompt never fires, keep Install Help visible
    if(!isIOS){ $('btnInstallHelp').classList.remove('hidden'); } else { $('btnInstallHelp').classList.remove('hidden'); }

    route();
  });
})();
