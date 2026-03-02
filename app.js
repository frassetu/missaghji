
(function () {

  /******************************
   *   CONFIGURATION PRINCIPALE
   ******************************/
  const APP_VERSION = "v1.0.4";

  // ENTITÉS
  const BO = ["BOBA", "BOCC", "BOES", "BOGA", "BOGB", "BOPO", "BOVA", "AOC"];
  const AUTH = ["BAO", "DELCO", ...BO];

  // FONCTIONS PAR ENTITÉ
  const FUNCS = {
    BAO: ["CEX"],
    DELCO: ["CCO"],
    BO: ["CDC", "CDT", "CDR", "PDA", "PDE", "PDM", "PDS"]
  };

  // STOCKAGE
  const STORAGE = {
    user: "miss:u",
    settings: "miss:s",
    hist: "miss:h",
    cnt: "miss:c"
  };

  const $ = (id) => document.getElementById(id);
  const ls = {
    get: (k, d) => {
      try {
        return JSON.parse(localStorage.getItem(k)) ?? d;
      } catch {
        return d;
      }
    },
    set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
  };

  /******************************
   *          i18n
   ******************************/
  const i18n = {
    fr: {
      id: "Identification",
      hint: "Entrez votre Nom et choisissez votre Entité.",
      installer: "Installer",
      installerQ: "Installer ?",
      historique: "Historique",
      changer: "Changer entité",
      role: "Rôle",
      hh: "Heure (HH)",
      mm: "Minutes (MM)",
      actualiser: "Actualiser",
      num: "N°",
      nom: "Nom",
      nomMaj: "Nom (MAJ)",
      fonction: "Fonction",
      entite: "Entité",
      message: "Message",
      valider: "Valider",
      refresh: "Rafraîchir"
    },
    co: {
      id: "Identificazione",
      hint: "Mettite u vostru Nome è sceglite l'Entità.",
      installer: "Installà",
      installerQ: "Installà ?",
      historique: "Storicu",
      changer: "Cambià entità",
      role: "Rolu",
      hh: "Ora (HH)",
      mm: "Minuti (MM)",
      actualiser: "Attualizà",
      num: "N°",
      nom: "Nome",
      nomMaj: "Nome (MAI)",
      fonction: "Funzione",
      entite: "Entità",
      message: "Messaghju",
      valider: "Validà",
      refresh: "Rinfrescà"
    }
  };

  function L() {
    const s = ls.get(STORAGE.settings, { lang: "fr" });
    return i18n[s.lang] || i18n.fr;
  }

  function applyLang() {
    const t = L();

    $("btnInstall").textContent = t.installer;
    $("btnInstallHelp").textContent = t.installerQ;
    $("btnHistory").textContent = t.historique;
    $("btnChangeEntity").textContent = t.changer;
    $("mInstall").textContent = t.installer;
    $("mInstallHelp").textContent = t.installerQ;
    $("mHistory").textContent = t.historique;
    $("mChangeEntity").textContent = t.changer;

    $("titleAuth").textContent = t.id;
    $("authHint").textContent = t.hint;
    $("labelAuthName").textContent = t.nom;
    $("labelAuthEntity").textContent = t.entite;

    $("authValidate").textContent = t.valider;

    $("titleContext").textContent = "Contexte";
    $("labelRole").textContent = t.role;
    $("labelHH").textContent = t.hh;
    $("labelMM").textContent = t.mm;
    $("btnNow").textContent = t.actualiser;

    $("titleEmetteur").textContent = "Émetteur";
    $("titleRecepteur").textContent = "Récepteur";
    $("labelEmNum").textContent = t.num;
    $("labelEmName").textContent = t.nom;
    $("labelEmFunc").textContent = t.fonction;
    $("labelEmEntity").textContent = t.entite;

    $("labelReNum").textContent = t.num;
    $("labelReName").textContent = t.nomMaj;
    $("labelReFunc").textContent = t.fonction;
    $("labelReEntity").textContent = t.entite;

    $("titleMessage").textContent = t.message;
    $("btnSave").textContent = t.valider;
    $("btnRefreshInline").textContent = t.refresh;
  }

  /******************************
   *   UTILITAIRES
   ******************************/
  const lettersRe = /^[A-Za-zÀ-ÖØ-öø-ÿ '\-]+$/;
  function toLettersOnly(el) {
    el.addEventListener("input", () => {
      el.value = (el.value || "")
        .toUpperCase()
        .replace(/[^A-Za-zÀ-ÖØ-öø-ÿ '\-]/g, "");
    });
  }

  function setNow() {
    const d = new Date();
    const two = (n) => (n < 10 ? "0" + n : n);
    $("hh").value = two(d.getHours());
    $("mm").value = two(d.getMinutes());
  }

  function nextNumberFor(entity) {
    const c = ls.get(STORAGE.cnt, {});
    if (!c[entity]) c[entity] = 1;
    const out = c[entity];
    c[entity] = Math.min(999, out + 1);
    ls.set(STORAGE.cnt, c);
    return out;
  }

  /******************************
   *   RÈGLES MÉTIER A + B
   ******************************/

  // 🔥 L’utilisateur BO → ne peut être que BO en fonction
  function setUserFunctions(userEntity) {
    if (BO.includes(userEntity)) {
      return FUNCS.BO; // CDC/CDT/CDR/PDA/PDE/PDM/PDS
    }
    return FUNCS[userEntity];
  }

  // 🔥 Correspondants possibles
  function getCorrespondantEntities(userEntity) {
    if (BO.includes(userEntity)) return ["BAO", "DELCO"];
    if (userEntity === "BAO") return ["DELCO", ...BO];
    if (userEntity === "DELCO") return ["BAO", ...BO];
    return ["BAO", "DELCO"];
  }

  // 🔥 Couplage strict
  function fixCoupling(funcSel, entSel) {
    if (entSel.value === "BAO") funcSel.value = "CEX";
    if (entSel.value === "DELCO") funcSel.value = "CCO";

    if (funcSel.value === "CEX") entSel.value = "BAO";
    if (funcSel.value === "CCO") entSel.value = "DELCO";
  }

  /******************************
   *   APP INIT
   ******************************/
  function prepareApp() {
    const u = ls.get(STORAGE.user, null);
    if (!u) return;

    // Nom utilisateur forcé MAJ
    $("emName").value = u.name.toUpperCase();
    $("reName").value = "";

    // Entité utilisateur LOCKÉE
    $("emEntity").innerHTML = `<option value="${u.entity}">${u.entity}</option>`;
    $("reEntity").innerHTML = `<option value="${u.entity}">${u.entity}</option>`;

    // Fonctions utilisateur BO → uniquement BO
    const funcs = setUserFunctions(u.entity);
    $("emFunc").innerHTML = funcs.map((f) => `<option>${f}</option>`).join("");
    $("reFunc").innerHTML = funcs.map((f) => `<option>${f}</option>`).join("");

    setNow();
  }

  /******************************
   *   SWAP (Émetteur / Récepteur)
   ******************************/
  function swapRole() {
    const e = {
      num: $("emNum").value,
      name: $("emName").value,
      func: $("emFunc").value,
      ent: $("emEntity").value
    };

    $("emNum").value = $("reNum").value;
    $("emName").value = $("reName").value;
    $("emFunc").value = $("reFunc").value;
    $("emEntity").value = $("reEntity").value;

    $("reNum").value = e.num;
    $("reName").value = e.name;
    $("reFunc").value = e.func;
    $("reEntity").value = e.ent;

    // Fix couplages après swap
    fixCoupling($("reFunc"), $("reEntity"));
    fixCoupling($("emFunc"), $("emEntity"));

    const u = ls.get(STORAGE.user);
    $("emEntity").value = u.entity;
  }

  /******************************
   *   SAVE MESSAGE
   ******************************/
  $("btnSave").addEventListener("click", () => {
    const u = ls.get(STORAGE.user, null);
    if (!u) {
      alert("Identifiez-vous d'abord");
      return;
    }

    const role = $("roleSelect").value;

    const emitter = {
      num: role === "emetteur" ? $("emNum").value : $("reNum").value,
      name: role === "emetteur" ? $("emName").value : $("reName").value,
      func: role === "emetteur" ? $("emFunc").value : $("reFunc").value,
      ent: role === "emetteur" ? $("emEntity").value : $("reEntity").value
    };

    const receiver = {
      num: role === "emetteur" ? $("reNum").value : $("emNum").value,
      name: role === "emetteur" ? $("reName").value : $("emName").value,
      func: role === "emetteur" ? $("reFunc").value : $("emFunc").value,
      ent: role === "emetteur" ? $("reEntity").value : $("emEntity").value
    };

    if (!emitter.name || !receiver.name) {
      alert("Nom requis");
      return;
    }

    const d = new Date();
    const date = d.toLocaleDateString("fr-FR");
    const time = $("hh").value + ":" + $("mm").value;

    const rec = {
      time: `${date} ${time}`,
      emNum: emitter.num,
      emName: emitter.name,
      emFunc: emitter.func,
      emEntity: emitter.ent,
      reNum: receiver.num,
      reName: receiver.name,
      reFunc: receiver.func,
      reEntity: receiver.ent,
      message: $("message").value.trim()
    };

    if (!rec.message) {
      alert("Message vide");
      return;
    }

    const hist = ls.get(STORAGE.hist, []);
    hist.push(rec);
    ls.set(STORAGE.hist, hist);

    alert("Message Validé");

    $("emNum").value = "";
    $("reNum").value = "";
    $("reName").value = "";
    $("message").value = "";
    setNow();
  });

})();
