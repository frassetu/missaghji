
// --- PWA registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
}

const BO_LIST = ["BOBA","BOCC","BOES","BOGA","BOGB","BOPO","BOVA"]; // All BOs
const BO_FUNCS = ["CDC","CDT","CDR","PDA","PDE","PDM","PDS"];
const VERSION = window.APP_VERSION || 'v1.1.1';

// --- Helpers
const $ = (id)=>document.getElementById(id);
function lettersOnly(str){return (/^[A-Za-zÀ-ÖØ-öø-ÿ\-\s]+$/u).test((str||'').trim());}
function clampNum(n){n = parseInt(n||0,10); if(isNaN(n)||n<1) return 1; if(n>999) return 999; return n;}
function nextNum(){ let n = parseInt(localStorage.getItem('num')||'0',10); n = n>=999?1:n+1; localStorage.setItem('num', String(n)); return n; }
function nowHM(){ const d=new Date(); return {h:String(d.getHours()).padStart(2,'0'), m:String(d.getMinutes()).padStart(2,'0')}; }
function isBO(ent){return BO_LIST.includes(ent);}
function allowedCorrespondentEntities(userEnt){ return isBO(userEnt)? ['BAO','DELCO'] : BO_LIST.concat(['DELCO']); }

// --- Start page
function setupStart(){
  const form = $('startForm'); if(!form) return;
  const input = $('username');
  input.addEventListener('input', ()=>{ input.value = input.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\-\s]/gu,'').toUpperCase(); });
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = (input.value||'').trim();
    if(!name || !lettersOnly(name)) return alert('Le nom ne doit contenir que des lettres, espaces et tirets.');
    const ent = $('entity').value;
    localStorage.setItem('username', name.toUpperCase());
    localStorage.setItem('entity', ent);
    if(!localStorage.getItem('num')) localStorage.setItem('num','0');
    localStorage.setItem('version', VERSION);
    location.href = 'main.html';
  });
}

// --- Global state for UI values (to preserve on re-render)
let currentRole = 'Émetteur'; // or 'Récepteur'
let state = null;
function captureState(){
  const get = id=> $(id) ? $(id).value : '';
  state = {
    hour: get('hour'), min: get('min'),
    enNum: get('enNum'), enName: get('enName'), enFunc: get('enFunc'), enEnt: get('enEnt'),
    reNum: get('reNum'), reName: get('reName'), reFunc: get('reFunc'), reEnt: get('reEnt'),
    message: get('message')
  };
}
function invertStateBetweenSides(){
  if(!state) return;
  const s = state; // swap all paired fields including numbers
  [s.enNum, s.reNum] = [s.reNum, s.enNum];
  [s.enName, s.reName] = [s.reName, s.enName];
  [s.enFunc, s.reFunc] = [s.reFunc, s.enFunc];
  [s.enEnt, s.reEnt]   = [s.reEnt, s.enEnt];
}

function applyUppercaseLive(ids){ ids.forEach(id=>{ const el=$(id); if(!el) return; el.addEventListener('input',()=>{ el.value = (el.value||'').toUpperCase(); }); }); }
function applyLettersOnly(ids){ ids.forEach(id=>{ const el=$(id); if(!el) return; el.addEventListener('input',()=>{ el.value = el.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\-\s]/gu,''); }); }); }

// --- Menu overlay helpers
function toggleMenu(){ const o=$('menuOverlay'); if(!o) return; o.classList.toggle('hidden'); }
function closeMenu(){ const o=$('menuOverlay'); if(!o) return; o.classList.add('hidden'); }
function bindMenuActions(){
  const install = ()=>{ if(window.deferredPrompt){ window.deferredPrompt.prompt(); window.deferredPrompt=null; } else alert('Installation non disponible.'); };
  $('btnInstall')?.addEventListener('click', ()=>{ closeMenu(); install(); });
  $('btnHistory')?.addEventListener('click', ()=>{ closeMenu(); showHistory(); });
  $('btnChange')?.addEventListener('click', ()=>{ closeMenu(); location.href='index.html'; });
}

// --- Main UI render
function setupMain(){
  if(!$('topbar')) return;
  const user = localStorage.getItem('username')||'';
  const ent  = localStorage.getItem('entity')||'';
  $('topbar').innerHTML = `
    <div>
      <div class="app-title">MESSAGERIE OPÉRATIONNELLE <span class="version">${localStorage.getItem('version')||VERSION}</span></div>
      <div class="meta">${user} (${ent})</div>
    </div>
    <div class="burger" id="burger">☰</div>
  `;
  $('burger').addEventListener('click', toggleMenu);
  $('overlayBackdrop')?.addEventListener('click', closeMenu);
  $('closeMenu')?.addEventListener('click', closeMenu);
  renderApp();
  bindMenuActions();
}

window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); window.deferredPrompt = e; });

function renderApp(){
  const user = localStorage.getItem('username')||'';
  const ent  = localStorage.getItem('entity')||'';
  const c = $('content');
  const hm = nowHM();
  const s = state || {};

  const meSide = (currentRole==='Émetteur') ? 'sender' : 'receiver';
  const otherSide = (meSide==='sender') ? 'receiver' : 'sender';
  const corrOptions = allowedCorrespondentEntities(ent);
  const optionsCorr = corrOptions.map(x=>`<option value="${x}" ${s[otherSide==='sender'?'enEnt':'reEnt']===x?'selected':''}>${x}</option>`).join('');

  c.innerHTML = `

<section class="card block">
  <h3>Contexte</h3>

  <div class="context-row">
    
    <div class="ctx-item">
      <label for="role">Rôle</label>
      <select id="role">
        <option ${currentRole==='Émetteur'?'selected':''}>Émetteur</option>
        <option ${currentRole==='Récepteur'?'selected':''}>Récepteur</option>
      </select>
    </div>

    <div class="ctx-item">
      <label for="hour">Heure</label>
      <input type="number" id="hour" min="0" max="23" value="${s.hour||hm.h}">
    </div>

    <div class="ctx-item">
      <label for="min">Minutes</label>
      <input type="number" id="min" min="0" max="59" value="${s.min||hm.m}">
    </div>

    <div class="ctx-item ctx-btn">
      <label>&nbsp;</label>
      <button class="btn icon-btn" id="btnNow">⟳</button>
    </div>

  </div>
</section>


    <section class="card block">
      <h3>Émetteur <span class="badge">${meSide==='sender'?'MOI':''}</span></h3>
      <div class="row">
        <div>
          <label>N°</label>
          <div class="row">
            <input type="number" id="enNum" min="1" max="999" placeholder="1-999" value="${s.enNum||''}" />
            ${meSide==='sender'? '<button class="btn" id="enGen">⟳</button>' : ''}
          </div>
        </div>
        <div>
          <label>Nom</label>
          <input type="text" id="enName" placeholder="NOM" value="${s.enName||''}" />
        </div>
      </div>
      <div class="row">
        <div>
          <label>Fonction</label>
          <select id="enFunc"></select>
        </div>
        <div>
          <label>Entité</label>
          ${meSide==='sender' ?
            `<input type="text" id="enEnt" value="${ent}" disabled />` :
            `<select id="enEnt">${optionsCorr}</select>`}
        </div>
      </div>
    </section>

    <section class="card block">
      <h3>Récepteur <span class="badge">${meSide==='receiver'?'MOI':''}</span></h3>
      <div class="row">
        <div>
          <label>N°</label>
          <div class="row">
            <input type="number" id="reNum" min="1" max="999" placeholder="1-999" value="${s.reNum||''}" />
            ${meSide==='receiver'? '<button class="btn" id="reGen">⟳</button>' : ''}
          </div>
        </div>
        <div>
          <label>Nom</label>
          <input type="text" id="reName" placeholder="NOM" value="${s.reName||''}" />
        </div>
      </div>
      <div class="row">
        <div>
          <label>Fonction</label>
          <select id="reFunc"></select>
        </div>
        <div>
          <label>Entité</label>
          ${meSide==='receiver' ?
            `<input type="text" id="reEnt" value="${ent}" disabled />` :
            `<select id="reEnt">${optionsCorr}</select>`}
        </div>
      </div>
    </section>

    <section class="card block">
      <h3>Message</h3>
      <textarea id="message" placeholder="ÉCRIRE LE MESSAGE...">${s.message||''}</textarea>
      <div class="actions">
        <button class="btn primary" id="btnSave">Valider</button>
        <button class="btn ghost" id="btnReset">Réinitialiser</button>
      </div>
    </section>
  `;

  // Setup function options and locks
  const enFuncEl = $('enFunc');
  const reFuncEl = $('reFunc');

  if(meSide==='sender'){
    $('enName').value = user; $('enName').disabled = true;
    enFuncEl.innerHTML = (ent==='BAO') ? '<option value="CEX" selected>CEX</option>' : BO_FUNCS.map(f=>`<option value="${f}">${f}</option>`).join('');
    enFuncEl.disabled = (ent==='BAO');
  } else {
    $('reName').value = user; $('reName').disabled = true;
    reFuncEl.innerHTML = (ent==='BAO') ? '<option value="CEX" selected>CEX</option>' : BO_FUNCS.map(f=>`<option value="${f}">${f}</option>`).join('');
    reFuncEl.disabled = (ent==='BAO');
  }

  function updateCorrFunc(which){
    const entVal = (which==='sender'? $('enEnt').value : $('reEnt').value);
    const funcEl = (which==='sender'? enFuncEl : reFuncEl);
    if(entVal==='BAO'){ funcEl.innerHTML='<option value="CEX">CEX</option>'; funcEl.disabled=true; }
    else if(entVal==='DELCO'){ funcEl.innerHTML='<option value="CCO">CCO</option>'; funcEl.disabled=true; }
    else { funcEl.innerHTML=BO_FUNCS.map(f=>`<option value="${f}">${f}</option>`).join(''); funcEl.disabled=false; }
  }

  if(meSide==='sender'){
    if($('reEnt') && $('reEnt').tagName==='SELECT'){
      updateCorrFunc('receiver');
      $('reEnt').addEventListener('change', ()=>updateCorrFunc('receiver'));
    }
  } else {
    if($('enEnt') && $('enEnt').tagName==='SELECT'){
      updateCorrFunc('sender');
      $('enEnt').addEventListener('change', ()=>updateCorrFunc('sender'));
    }
  }

  // Handlers
  $('btnNow').onclick = ()=>{const n=nowHM(); $('hour').value=n.h; $('min').value=n.m;};
  $('role').onchange = ()=>{ captureState(); invertStateBetweenSides(); currentRole = $('role').value; renderApp(); };
  $('enGen')?.addEventListener('click', (e)=>{ e.preventDefault(); $('enNum').value = nextNum(); });
  $('reGen')?.addEventListener('click', (e)=>{ e.preventDefault(); $('reNum').value = nextNum(); });

  applyLettersOnly(['enName','reName']);
  applyUppercaseLive(['enName','reName','message']);

  $('btnSave').onclick = (e)=>{ e.preventDefault(); saveMessage(); };
  $('btnReset').onclick = (e)=>{ e.preventDefault(); state=null; renderApp(); };
}

function saveMessage(){
  const rec = {
    date: new Date().toLocaleDateString('fr-FR'),
    time: `${$('hour').value.toString().padStart(2,'0')}:${$('min').value.toString().padStart(2,'0')}`,
    role: $('role').value,
    em_num: String(clampNum($('enNum').value||nextNum())),
    em_name: $('enName').value.trim(),
    em_func: $('enFunc').value,
    em_ent:  $('enEnt').value,

    re_num: String(clampNum($('reNum').value||'')),
    re_name: $('reName').value.trim(),
    re_func: $('reFunc').value,
    re_ent:  $('reEnt').value,

    msg: $('message').value.trim()
  };

  if(!lettersOnly(rec.em_name) || !lettersOnly(rec.re_name)){
    alert('Les noms ne doivent contenir que des lettres, espaces et tirets.'); return;
  }

  const userEnt = localStorage.getItem('entity')||'';
  const corrEnt = (currentRole==='Émetteur') ? rec.re_ent : rec.em_ent;
  if(isBO(userEnt)){
    if(!(corrEnt==='BAO' || corrEnt==='DELCO')){ alert('Si vous êtes une BO, le correspondant doit être BAO ou DELCO.'); return; }
  } else {
    if(!(BO_LIST.includes(corrEnt) || corrEnt==='DELCO')){ alert('Si vous êtes BAO, le correspondant doit être une BO ou DELCO.'); return; }
  }

  const list = JSON.parse(localStorage.getItem('history')||'[]');
  list.push(rec);
  localStorage.setItem('history', JSON.stringify(list));
  alert('Message Validé');
  state=null;
  renderApp();
}

function showHistory(){
  const list = JSON.parse(localStorage.getItem('history')||'[]');
  const c = $('content');
  if(list.length===0){
    c.innerHTML = `<section class="card"><h2>Historique</h2><p>Aucun message enregistré.</p>
      <div class="actions"><button class="btn" id="back">Retour</button></div></section>`;
    $('back').onclick = ()=> renderApp();
    return;
  }
  const out = list.map(x=>{
    return `${x.date} ${x.time}\n`+
           `Émetteur: N° ${x.em_num} | ${x.em_name} | ${x.em_func} | ${x.em_ent}\n`+
           `Récepteur: N° ${x.re_num} | ${x.re_name} | ${x.re_func} | ${x.re_ent}\n`+
           `${x.msg}\n-----`;
  }).join("\n");
  c.innerHTML = `<section class="card"><h2>Historique</h2><pre>${out}</pre>
    <div class="actions">
      <button class="btn primary" id="exportCsv">Exporter CSV</button>
      <button class="btn" id="back">Retour</button>
    </div></section>`;
  $('back').onclick = ()=> renderApp();
  $('exportCsv').onclick = exportCSV;
  bindMenuActions();
}

function exportCSV(){
  const list = JSON.parse(localStorage.getItem('history')||'[]');
  const sep = ';';
  const headers = [
    'Date','Heure','Rôle',
    'N° Emetteur','Nom Emetteur','Fonction Emetteur','Entité Emetteur',
    'N° Recepteur','Nom Recepteur','Fonction Recepteur','Entité Recepteur',
    'Message'
  ];
  const rows = list.map(x=>[
    x.date, x.time, x.role,
    x.em_num, x.em_name, x.em_func, x.em_ent,
    x.re_num, x.re_name, x.re_func, x.re_ent,
    (x.msg||'').replace(/\r?\n/g,' ')
  ]);
  const csv = ['\ufeff'+headers.join(sep)].concat(rows.map(r=>r.map(v => '"'+String(v||'').replace(/"/g,'""')+'"').join(sep))).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'historique_messages.csv';
  document.body.appendChild(a); a.click(); a.remove();
}

// Bootstrap
document.addEventListener('DOMContentLoaded', ()=>{
  if($('startForm')) setupStart(); else setupMain();
});
