// PWA registration
if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js')); }

const BO_LIST=["BOBA","BOCC","BOES","BOGA","BOGB","BOPO","BOVA"];
const BO_FUNCS=["CDC","CDT","CDR","PDA","PDE","PDM","PDS"];
const VERSION=window.APP_VERSION||'v1.3.3';

const $=id=>document.getElementById(id);

const lettersOnly=str=>(/^[A-Za-zÀ-ÖØ-öø-ÿ\-\s]+$/u).test((str||'').trim());

const clampNum=n=>{
  n=parseInt(n||0,10);
  if(isNaN(n)||n<1) return 1;
  if(n>999) return 999;
  return n;
};

const nextNum=()=>{
  let n=parseInt(localStorage.getItem('num')||'0',10);
  n=n>=999?1:n+1;
  localStorage.setItem('num',String(n));
  return n;
};

const nowHM=()=>{
  const d=new Date();
  return {
    h:String(d.getHours()).padStart(2,'0'),
    m:String(d.getMinutes()).padStart(2,'0')
  };
};

const isBO=ent=>BO_LIST.includes(ent);

const allowedCorrespondentEntities=userEnt=>
  isBO(userEnt)? ['BAO','DELCO'] : BO_LIST.concat(['DELCO']);


// ✅ BLOQUER LES LETTRES DANS LES CHAMPS NUMÉRIQUES
function applyNumericOnly(ids){
  ids.forEach(id=>{
    const el=$(id);
    if(!el) return;
    el.addEventListener('input',()=>{
      el.value=el.value.replace(/[^0-9]/g,'');
    });
  });
}

function setupStart(){
  const form=$('startForm');
  if(!form) return;

  const input=$('username');

  input.addEventListener('input',()=>{
    input.value=input.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\-\s]/gu,'').toUpperCase();
  });

  form.addEventListener('submit',e=>{
    e.preventDefault();

    const name=(input.value||'').trim();
    if(!name||!lettersOnly(name)) return alert('Le nom ne doit contenir que des lettres, espaces et tirets.');

    const ent=$('entity').value;

    localStorage.setItem('username',name.toUpperCase());
    localStorage.setItem('entity',ent);

    if(!localStorage.getItem('num')) localStorage.setItem('num','0');

    localStorage.setItem('version',VERSION);

    location.href='main.html';
  });
}


// ✅ FIX rôle
let currentRole='Emettori';

let state=null;

function captureState(){
  const get=id=>$(id)?$(id).value:'';
  state={
    hour:get('hour'),
    min:get('min'),
    enNum:get('enNum'),
    enName:get('enName'),
    enFunc:get('enFunc'),
    enEnt:get('enEnt'),
    reNum:get('reNum'),
    reName:get('reName'),
    reFunc:get('reFunc'),
    reEnt:get('reEnt'),
    message:get('message')
  };
}

function applyUppercaseLive(ids){
  ids.forEach(id=>{
    const el=$(id);
    if(!el) return;
    el.addEventListener('input',()=>{
      el.value=(el.value||'').toUpperCase();
    });
  });
}

function applyLettersOnly(ids){
  ids.forEach(id=>{
    const el=$(id);
    if(!el) return;
    el.addEventListener('input',()=>{
      el.value=el.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\-\s]/gu,'');
    });
  });
}


function toggleMenu(){
  const o=$('menuOverlay');
  if(!o) return;
  o.classList.toggle('hidden');
}

function closeMenu(){
  const o=$('menuOverlay');
  if(!o) return;
  o.classList.add('hidden');
}


function bindMenuActions(){
  const install=()=>{
    if(window.deferredPrompt){
      window.deferredPrompt.prompt();
      window.deferredPrompt=null;
    } else {
      alert('Installation non disponible.');
    }
  };

  $('btnInstall')?.addEventListener('click',()=>{
    closeMenu();
    install();
  });

  $('btnHistory')?.addEventListener('click',()=>{
    closeMenu();
    showHistory();
  });

  $('btnChange')?.addEventListener('click',()=>{
    closeMenu();
    location.href='index.html';
  });
}


function setupMain(){
  if(!$('topbar')) return;

  const user=localStorage.getItem('username')||'';
  const ent=localStorage.getItem('entity')||'';

  $('topbar').innerHTML=`
    <div>
      <div class="app-title">
        CARNETTU DI MISSAGHJI
        <span class="version">${localStorage.getItem('version')||VERSION}</span>
      </div>
      <div class="meta">${user} (${ent})</div>
    </div>
    <div class="burger" id="burger">☰</div>
  `;

  $('burger').addEventListener('click',toggleMenu);
  $('overlayBackdrop')?.addEventListener('click',closeMenu);
  $('closeMenu')?.addEventListener('click',closeMenu);

  renderApp();
  bindMenuActions();
}

window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();
  window.deferredPrompt=e;
});


function renderApp(){

  const user=localStorage.getItem('username')||'';
  const ent=localStorage.getItem('entity')||'';

  const c=$('content');
  const hm=nowHM();
  const s=state||{};

  const meSide=(currentRole==='Emettori')?'sender':'receiver';

  const corrOptions=allowedCorrespondentEntities(ent);

  const optionsCorr=corrOptions.map(x=>
    `<option value="${x}" ${s[(meSide==='sender')?'reEnt':'enEnt']===x?'selected':''}>${x}</option>`
  ).join('');

  c.innerHTML=`
  <section class="card block">

  <div class="ctx-item ctx-item--role">
    <label>Funzioni</label>
    <select id="role">
      <option value="Emettori" ${currentRole==='Emettori'?'selected':''}>Emettori</option>
      <option value="Ricivitori" ${currentRole==='Ricivitori'?'selected':''}>Ricivitori</option>
    </select>
  </div>
  `;

  // ✅ FIX onchange (plus d’inversion)
  $('role').onchange=()=>{
    captureState();
    currentRole=$('role').value;
    renderApp();
  };

  // ✅ activation bloc chiffres
  applyNumericOnly(['hour','min','enNum','reNum']);

  applyLettersOnly(['enName','reName']);
  applyUppercaseLive(['enName','reName']);
}


function saveMessage(){
  const rec={
    role:$('role').value
  };

  const userEnt=localStorage.getItem('entity')||'';

  const corrEnt=(currentRole==='Emettori') ? 'receiver' : 'sender';
}
