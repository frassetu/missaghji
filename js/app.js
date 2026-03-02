document.getElementById("startForm").addEventListener("submit", e=>{
e.preventDefault();
const name=document.getElementById("username").value.toUpperCase();
localStorage.setItem("username",name);
localStorage.setItem("entity",document.getElementById("entity").value);
window.location="main.html";
});