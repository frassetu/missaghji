
if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

const ENT_BO=["BOBA","BOCC","BOES","BOGA","BOGB","BOPO","BOVA"];

function $(id){return document.getElementById(id)}

document.addEventListener('DOMContentLoaded',()=>{
 if($('startForm')) setupStart();
 else setupMain();
});

function setupStart(){ $('startForm').addEventListener('submit',e=>{
  e.preventDefault();
  localStorage.username=$('username').value.toUpperCase();
  localStorage.entity=$('entity').value;
  localStorage.num = localStorage.num || 1;
  location='main.html';
 }); }

function nextNum(){ let n=parseInt(localStorage.num||1); n=n>=999?1:n+1; localStorage.num=n; return n; }

function setupMain(){ const top=$('topbar'); top.innerHTML=`<h2>${localStorage.username} (${localStorage.entity})</h2>
<div class='menu' onclick='openMenu()'>☰</div>`;

renderUI(); }

function openMenu(){ const ui=$('ui'); ui.innerHTML=`<div class='card'>
<h2>Menu</h2>
<button class='btn' onclick='installPWA()'>Installer</button>
<button class='btn' onclick='showHistory()'>Historique</button>
<button class='btn' onclick='location="index.html"'>Changer entité</button>
</div>`; }

let deferredPrompt;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault(); deferredPrompt=e;});
function installPWA(){ if(deferredPrompt){ deferredPrompt.prompt(); deferredPrompt=null; } }

function renderUI(){ const ui=$('ui'); ui.innerHTML=`
<div class='block'>
<label>Rôle</label>
<select id='role' onchange='swapRoles()'><option>Émetteur</option><option>Récepteur</option></select>
<label>Heure</label>
<input id='hour' type='number' value='${new Date().getHours()}' min='0' max='23'>
<label>Minutes</label>
<input id='min' type='number' value='${new Date().getMinutes()}' min='0' max='59'>
<button class='btn' onclick='setNow()'>Actualiser heure</button>
</div>

<div class='block'>
<h3>Émetteur</h3>
<input id='en' placeholder='N°'>
<input id='ename' placeholder='Nom'>
<input id='efct' placeholder='Fonction'>
<input id='eent' placeholder='Entité'>
</div>

<div class='block'>
<h3>Récepteur</h3>
<input id='rn' placeholder='N°'>
<input id='rname' placeholder='Nom'>
<input id='rfct' placeholder='Fonction'>
<input id='rent' placeholder='Entité'>
</div>

<div class='block'>
<h3>Message</h3>
<textarea id='msg'></textarea>
<button class='btn' onclick='validateMsg()'>Valider</button>
<button class='btn' onclick='renderUI()'>Réinitialiser</button>
</div>`;

fillUser(); }

function fillUser(){ let ent=localStorage.entity;
 $('ename').value=localStorage.username; $('ename').disabled=true;
 $('eent').value=ent; $('eent').disabled=true;
 $('efct').value = ent==='BAO'?'CEX':'';
}

function setNow(){ $('hour').value=new Date().getHours(); $('min').value=new Date().getMinutes(); }

function swapRoles(){ let r=$('role').value;
 let e={n:$('en').value,name:$('ename').value,f:$('efct').value,ent:$('eent').value};
 let t={n:$('rn').value,name:$('rname').value,f:$('rfct').value,ent:$('rent').value};
 if(r==='Récepteur'){
  $('en').value=t.n; $('ename').value=t.name; $('efct').value=t.f; $('eent').value=t.ent;
  $('rn').value=e.n; $('rname').value=e.name; $('rfct').value=e.f; $('rent').value=e.ent;
 } else {
  $('en').value=e.n; $('ename').value=e.name; $('efct').value=e.f; $('eent').value=e.ent;
  $('rn').value=t.n; $('rname').value=t.name; $('rfct').value=t.f; $('rent').value=t.ent;
 }
}

function validateMsg(){ let rec={
 date:new Date().toLocaleDateString(),
 time:$('hour').value+":"+$('min').value,
 en:$('en').value||nextNum(),
 ename:$('ename').value,
 efct:$('efct').value,
 eent:$('eent').value,
 rn:$('rn').value,
 rname:$('rname').value,
 rfct:$('rfct').value,
 rent:$('rent').value,
 msg:$('msg').value
 };
 let h=JSON.parse(localStorage.history||"[]"); h.push(rec); localStorage.history=JSON.stringify(h);
 alert('Message validé'); renderUI(); }

function showHistory(){ let h=JSON.parse(localStorage.history||"[]");
 let txt=h.map(x=>`${x.date} ${x.time}
Emetteur: ${x.en} ${x.ename} ${x.efct} ${x.eent}
Recepteur: ${x.rn} ${x.rname} ${x.rfct} ${x.rent}
${x.msg}
-----`).join("
");
 $('ui').innerHTML=`<div class='card'><h2>Historique</h2><pre id='history'>${txt}</pre>
<button class='btn' onclick='renderUI()'>Retour</button></div>`;
}
