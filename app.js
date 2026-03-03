
document.addEventListener('DOMContentLoaded',()=>{
 if(document.getElementById('startForm')) start(); else main();});
function start(){document.getElementById('startForm').onsubmit=e=>{e.preventDefault();localStorage.username=document.getElementById('username').value;localStorage.entity=document.getElementById('entity').value;location='main.html';};}
function main(){document.getElementById('topbar').innerHTML=localStorage.username+' ('+localStorage.entity+')';render();}
function render(){let c=document.getElementById('content');c.innerHTML=`<div class=context>
<select id=role><option>Émetteur</option><option>Récepteur</option></select>
<input id=hour type=tel inputmode=numeric value='12'>
<input id=min type=tel inputmode=numeric value='00'>
<button id=refresh>⟳</button></div>
<div class=row3><input id=enNum type=tel inputmode=numeric><button id=enGen>⟳</button><input id=enName></div>
<div class=row2><select id=enFunc><option>CEX</option></select><input id=enEnt></div>
<div class=row3><input id=reNum type=tel inputmode=numeric><button id=reGen>⟳</button><input id=reName></div>
<div class=row2><select id=reFunc><option>CCO</option></select><select id=reEnt><option>BAO</option></select></div>
`;}
