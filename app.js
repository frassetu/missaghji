
// --- PWA registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
}

// --- Constants
const ENTITIES = ["BAO","BOBA","BOCC","BOES","BOGA","BOGB","BOPO","BOVA"]; // DELCO pas sur accueil
const BO_LIST = ["BOBA","BOCC","BOES","BOGA","BOGB","BOPO","BOVA"];
const BO_FUNCS = ["CDC","CDT","CDR","PDA","PDE","PDM","PDS"];
const VERSION = "v1.0.0";

// --- Utils
const $ = (id)=>document.getElementById(id);
const qs = (sel,root=document)=>root.querySelector(sel);
function lettersOnly(str){return (/^[A-Za-zÀ-ÖØ-öø-ÿ\-\s]+$/u).test(str.trim());}
function clampNum(n){n = parseInt(n||0,10); if(isNaN(n)||n<1) return 1; if(n>999) return 999; return n;}
function nextNum(){ let n = parseInt(localStorage.getItem('num')||'0',10); n = n>=999?1:n+1; localStorage.setItem('num', String(n)); return n; }
function nowHM(){ const d=new Date(); return {h:String(d.getHours()).padStart(2,'0'), m:String(d.getMinutes()).padStart(2,'0')}; }
function isBO(ent){return BO_LIST.includes(ent);}

// --- Start page
function setupStart(){
  const form = $('startForm'); if(!form) return;
  const input = $('username');
  // live cleanup (keep letters/spaces/hyphens)
  input.addEventListener('input', ()=>{
    input.value = input.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\-\s]/gu, '');
  });
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = (input.value||'').trim();
    if(!name || !lettersOnly(name)){
      alert('Le nom ne doit contenir que des lettres, espaces ou tirets.');
      input.focus();
      return;
    }
    const ent = $('entity').value;
    localStorage.setItem('username', name.toUpperCase());
    localStorage.setItem('entity', ent);
    if(!localStorage.getItem('num')) localStorage.setItem('num','0');
    localStorage.setItem('version', VERSION);
    // Go main
    window.location.href = 'main.html';
  });
}

// --- Main UI
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); deferredPrompt = e; });

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
  $('burger').addEventListener('click', openMenu);
  renderApp('Émetteur');
}

function openMenu(){
  const c = $('content');
  c.innerHTML = `
    <section class="card">
      <h2>Menu</h2>
      <div class="actions">
        <button class="btn primary" id="btnInstall">Installer le PWA</button>
        <button class="btn" id="btnHistory">Historique</button>
        <button class="btn ghost" id="btnChange">Changer entité</button>
        <button class="btn ghost" id="btnBack">Retour</button>
      </div>
      <p class="small">DELCO n'est pas disponible sur la page d'accueil, mais peut être sélectionné comme correspondant.</p>
    </section>
  `;
  $('btnInstall').onclick = ()=>{ if(deferredPrompt){ deferredPrompt.prompt(); deferredPrompt=null; } else alert('Installation non disponible (déjà installée ou non supportée).'); };
  $('btnHistory').onclick = showHistory;
  $('btnChange').onclick = ()=> window.location.href = 'index.html';
  $('btnBack').onclick = ()=> renderApp(currentRole);
}

let currentRole = 'Émetteur';

function renderApp(role){
  currentRole = role || currentRole;
  const user = localStorage.getItem('username')||'';
  const ent  = localStorage.getItem('entity')||'';
  const isUserBO = isBO(ent);
  const hm = nowHM();
  const c = $('content');

  // Build selects
  const funcOptionsUser = (ent==='BAO') ? '<option value="CEX">CEX</option>' : BO_FUNCS.map(f=>`<option value="${f}">${f}</option>`).join('');
  // Receiver entity options depending on user role/entity
  let recvEntOptions = '';
  if(isUserBO){ // user is BO → receiver must be BAO or DELCO
    recvEntOptions = ['BAO','DELCO'].map(x=>`<option value="${x}">${x}</option>`).join('');
  } else { // user is BAO → can target BO* or DELCO
    recvEntOptions = BO_LIST.concat(['DELCO']).map(x=>`<option value="${x}">${x}</option>`).join('');
  }

  c.innerHTML = `
    <section class="card block">
      <h3>Contexte</h3>
      <div class="row">
        <div>
          <label for="role">Rôle</label>
          <select id="role">
            <option ${currentRole==='Émetteur'?'selected':''}>Émetteur</option>
            <option ${currentRole==='Récepteur'?'selected':''}>Récepteur</option>
          </select>
        </div>
        <div class="row">
          <div>
            <label for="hour">Heure</label>
            <input type="number" id="hour" min="0" max="23" value="${hm.h}" />
          </div>
          <div>
            <label for="min">Minutes</label>
            <input type="number" id="min" min="0" max="59" value="${hm.m}" />
          </div>
        </div>
      </div>
      <div class="actions">
        <button class="btn icon-btn" id="btnNow">⟳ Actualiser l'heure</button>
      </div>
    </section>

    <section class="card block">
      <h3>Émetteur <span class="badge">${currentRole==='Émetteur'?'MOI':''}</span></h3>
      <div class="row">
        <div>
          <label>N°</label>
          <div class="row">
            <input type="number" id="enNum" min="1" max="999" placeholder="1-999" />
            <button class="btn" id="enGen">⟳</button>
          </div>
        </div>
        <div>
          <label>Nom</label>
          <input type="text" id="enName" placeholder="Nom" />
        </div>
      </div>
      <div class="row">
        <div>
          <label>Fonction</label>
          <select id="enFunc">${funcOptionsUser}</select>
        </div>
        <div>
          <label>Entité</label>
          <input type="text" id="enEnt" />
        </div>
      </div>
    </section>

    <section class="card block">
      <h3>Récepteur <span class="badge">${currentRole==='Récepteur'?'MOI':''}</span></h3>
      <div class="row">
        <div>
          <label>N°</label>
          <div class="row">
            <input type="number" id="reNum" min="1" max="999" placeholder="1-999" />
            <button class="btn" id="reGen">⟳</button>
          </div>
        </div>
        <div>
          <label>Nom</label>
          <input type="text" id="reName" placeholder="Nom" />
        </div>
      </div>
      <div class="row">
        <div>
          <label>Fonction</label>
          <select id="reFunc"></select>
        </div>
        <div>
          <label>Entité</label>
          <select id="reEnt">${recvEntOptions}</select>
        </div>
      </div>
    </section>

    <section class="card block">
      <h3>Message</h3>
      <textarea id="message" placeholder="Écrire le message..."></textarea>
      <div class="actions">
        <button class="btn primary" id="btnSave">Valider</button>
        <button class="btn ghost" id="btnReset">Réinitialiser</button>
      </div>
    </section>
  `;

  // Lock/prepare according to role
  applyRoleLocks();

  // Handlers
  $('btnNow').onclick = ()=>{const n=nowHM(); $('hour').value=n.h; $('min').value=n.m;};
  $('role').onchange = ()=>{ invertValues(); currentRole = $('role').value; applyRoleLocks(); };
  $('enGen').onclick = (e)=>{e.preventDefault(); $('enNum').value = nextNum(); };
  $('reGen').onclick = (e)=>{e.preventDefault(); $('reNum').value = nextNum(); };

  // Name filters (no digits)
  const nameFilter = (el)=> el.addEventListener('input', ()=>{ el.value = el.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\-\s]/gu,''); });
  nameFilter($('enName')); nameFilter($('reName'));

  // Receiver function behavior based on receiver entity
  function updateReceiverFunc(){
    const entR = $('reEnt').value;
    const rf = $('reFunc');
    if(entR==='BAO'){
      rf.innerHTML = '<option value="CEX">CEX</option>';
      rf.disabled = true;
    } else if(entR==='DELCO'){
      rf.innerHTML = '<option value="CCO">CCO</option>';
      rf.disabled = true;
    } else { // BOx
      rf.innerHTML = BO_FUNCS.map(f=>`<option value="${f}">${f}</option>`).join('');
      rf.disabled = false;
    }
  }
  updateReceiverFunc();
  $('reEnt').onchange = updateReceiverFunc;

  $('btnSave').onclick = (e)=>{ e.preventDefault(); saveMessage(); };
  $('btnReset').onclick = (e)=>{ e.preventDefault(); renderApp(currentRole); };
}

function applyRoleLocks(){
  const user = localStorage.getItem('username')||'';
  const ent  = localStorage.getItem('entity')||'';

  // Reset enable state
  ['enName','enEnt','reName','reEnt'].forEach(id=> $(id).disabled=false);
  $('enFunc').disabled=false; $('reFunc').disabled=false;

  if(currentRole==='Émetteur'){
    // User on sender side
    $('enName').value = user; $('enName').disabled = true;
    $('enEnt').value  = ent;  $('enEnt').disabled  = true;
    if(ent==='BAO'){
      $('enFunc').innerHTML = '<option value="CEX">CEX</option>';
      $('enFunc').disabled = true;
    } else {
      $('enFunc').innerHTML = BO_FUNCS.map(f=>`<option value="${f}">${f}</option>`).join('');
      $('enFunc').disabled = false;
    }
  } else {
    // User on receiver side
    $('reName').value = user; $('reName').disabled = true;
    // Receiver entity depends on user's fixed entity
    // If user is BAO → receiver (me) is BAO; If user is BO → receiver (me) is that BO
    $('reEnt').outerHTML = `<input type="text" id="reEnt" value="${ent}" disabled />`;
    // Receiver function for me
    if(ent==='BAO'){
      $('reFunc').innerHTML = '<option value="CEX">CEX</option>';
      $('reFunc').disabled = true;
    } else {
      $('reFunc').innerHTML = BO_FUNCS.map(f=>`<option value="${f}">${f}</option>`).join('');
      $('reFunc').disabled = false;
    }
  }
}

function invertValues(){
  // swap numbers
  const enNum = $('enNum').value; $('enNum').value = $('reNum').value; $('reNum').value = enNum;
  // swap names
  const enName = $('enName').value; $('enName').value = $('reName').value; $('reName').value = enName;
  // swap functions (copying values)
  const enFuncVal = $('enFunc').value; const reFuncVal = $('reFunc').value; $('enFunc').value = reFuncVal; $('reFunc').value = enFuncVal;
  // swap entities (if both are selects/inputs present)
  const enEntVal = $('enEnt').value; const reEntVal = $('reEnt').value; $('enEnt').value = reEntVal; $('reEnt').value = enEntVal;
}

function saveMessage(){
  const rec = {
    date: new Date().toLocaleDateString('fr-FR'),
    time: `${$('hour').value.padStart(2,'0')}:${$('min').value.padStart(2,'0')}`,
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

  // Validate names (no digits)
  if(!lettersOnly(rec.em_name) || !lettersOnly(rec.re_name)){
    alert('Les noms ne doivent contenir que des lettres, espaces et tirets.'); return;
  }

  // Validate entities vs rules when user is BO
  const userEnt = localStorage.getItem('entity')||'';
  if(isBO(userEnt)){
    if(!(rec.re_ent==='BAO' || rec.re_ent==='DELCO')){
      alert('Si vous êtes une BO, le correspondant doit être BAO ou DELCO.'); return;
    }
  }

  const list = JSON.parse(localStorage.getItem('history')||'[]');
  list.push(rec);
  localStorage.setItem('history', JSON.stringify(list));
  alert('Message Validé');
  // refresh
  renderApp(currentRole);
}

function showHistory(){
  const list = JSON.parse(localStorage.getItem('history')||'[]');
  const c = $('content');
  if(list.length===0){
    c.innerHTML = `<section class="card"><h2>Historique</h2><p>Aucun message enregistré.</p>
      <div class="actions"><button class="btn" id="back">Retour</button></div></section>`;
    $('back').onclick = ()=> renderApp(currentRole);
    return;
  }
  const out = list.map(x=>{
    return `${x.date} ${x.time}\n`+
           `Émetteur: N° ${x.em_num} | ${x.em_name} | ${x.em_func} | ${x.em_ent}\n`+
           `Récepteur: N° ${x.re_num} | ${x.re_name} | ${x.re_func} | ${x.re_ent}\n`+
           `${x.msg}\n-----`;
  }).join("\n");
  c.innerHTML = `<section class="card"><h2>Historique</h2><pre>${out}</pre>
    <div class="actions"><button class="btn" id="back">Retour</button></div></section>`;
  $('back').onclick = ()=> renderApp(currentRole);
}

// Bootstrap
document.addEventListener('DOMContentLoaded', ()=>{
  if($('startForm')) setupStart(); else setupMain();
});
