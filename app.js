
(() => {
  const APP_VERSION = 'v1.0.0';
  const els = {
    role: document.getElementById('role'),
    nom: document.getElementById('nom'),
    entite: document.getElementById('entite'),
    fonction: document.getElementById('fonction'),
    genBtn: document.getElementById('genBtn'),
    numero: document.getElementById('numero'),
    exportBtn: document.getElementById('exportBtn'),
    clearBtn: document.getElementById('clearBtn'),
    historyTableBody: document.querySelector('#historyTable tbody'),
    sequenceInfo: document.getElementById('sequenceInfo'),
    installBtn: document.getElementById('installBtn'),
    version: document.getElementById('appVersion')
  };

  // Version dans le menu
  els.version.textContent = APP_VERSION;

  // ---- Persistance ----
  const getCounter = () => parseInt(localStorage.getItem('globalCounter') || '1', 10);
  const setCounter = (n) => localStorage.setItem('globalCounter', String(n));
  const getHistory = () => JSON.parse(localStorage.getItem('history') || '[]');
  const setHistory = (arr) => localStorage.setItem('history', JSON.stringify(arr));

  // Info séquence affichée
  const updateSequenceInfo = () => {
    els.sequenceInfo.textContent = `Prochain numéro: ${getCounter()} (la séquence ne se réinitialise pas en changeant de rôle)`;
  };
  updateSequenceInfo();

  // ---- Validation Noms : lettres uniquement ----
  const lettersRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ '\-]+$/;
  els.nom.addEventListener('input', () => {
    const clean = els.nom.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ '\-]/g, '');
    if (clean !== els.nom.value) els.nom.value = clean;
  });

  // ---- Règle métier : si fonction = CCO => entité = DELCO ----
  const applyBusinessRules = () => {
    if (els.fonction.value === 'CCO') {
      els.entite.value = 'DELCO';
    }
  };
  els.fonction.addEventListener('change', applyBusinessRules);

  // ---- Générer un numéro (ne se réinitialise pas au changement de rôle) ----
  els.genBtn.addEventListener('click', () => {
    if (!els.nom.value || !lettersRegex.test(els.nom.value)) {
      alert('Veuillez saisir un nom valide (lettres seulement).');
      els.nom.focus();
      return;
    }
    let current = getCounter();
    els.numero.textContent = String(current);
    setCounter(current + 1);
    updateSequenceInfo();

    // Ajout à l'historique
    const row = {
      timestamp: new Date().toISOString(),
      role: els.role.value,
      numero: current,
      nom: els.nom.value.trim(),
      entite: els.entite.value,
      fonction: els.fonction.value
    };
    const hist = getHistory();
    hist.unshift(row);
    setHistory(hist);
    renderHistory();
  });

  // ---- Historique : rendu, export CSV, suppression ----
  function renderHistory() {
    const hist = getHistory();
    els.historyTableBody.innerHTML = hist.map(r => `
      <tr>
        <td>${new Date(r.timestamp).toLocaleString()}</td>
        <td>${r.role}</td>
        <td>${r.numero}</td>
        <td>${r.nom}</td>
        <td>${r.entite}</td>
        <td>${r.fonction}</td>
      </tr>`).join('');
  }
  renderHistory();

  els.exportBtn.addEventListener('click', () => {
    const hist = getHistory();
    if (!hist.length) { alert('Aucune donnée à exporter.'); return; }
    const header = ['timestamp','role','numero','nom','entite','fonction'];
    const csv = [header.join(';')].concat(hist.map(r => [r.timestamp, r.role, r.numero, r.nom, r.entite, r.fonction].join(';'))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historique-missaghji.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  els.clearBtn.addEventListener('click', () => {
    if (!confirm('Supprimer tout l\'historique ?')) return;
    setHistory([]);
    renderHistory();
  });

  // ---- Installation PWA ----
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    els.installBtn.style.display = 'inline-flex';
  });

  els.installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      els.installBtn.style.display = 'none';
    } else {
      alert('Si le bouton ne s\'affiche pas, utilisez "Ajouter à l\'écran d\'accueil" dans le menu de votre navigateur.');
    }
  });

  // ---- Service Worker ----
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(console.error);
    });
  }

})();
