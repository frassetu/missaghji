// PWA registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/missaghji/sw.js')
      .then(reg => console.log('SW OK', reg))
      .catch(err => console.log('SW ERREUR', err));
  });
}

const BO_LIST=["BOBA","BOCC","BOES","BOGA","BOGB","BOPO","BOVA"]; const BO_FUNCS=["CDC","CDT","CDR","PDA","PDE","PDM","PDS"];
const VERSION=window.APP_VERSION||'v1.3.5';
const $=id=>document.getElementById(id);

// ---- i18n : co (corsu) / fr (français) ----
const I18N={
  co:{
    menu_title:'Uzzioni', menu_close:'Sarrà', menu_install:'Installà', menu_history:'Storicu', menu_change:"Scambià l'entità",
    start_name:'A voscia casata', start_placeholder:'Asempiu : MURACCIOLI', start_entity:'Entità', start_enter:'Entra',
    err_name_start:'A casata devi cuntena soli letteri, spazii è linietti.',
    role:'Funzioni', role_sender:'Emettori', role_receiver:'Ricevitori',
    hour:'Ori', minute:'Minuti', refresh_now:'Attualizà',
    sender:'Emettori', receiver:'Ricevitori',
    message:'Missaghju', message_ph:'Scriva u missaghju',
    inc_title:'Incident :', trav_title:'Travaux immèdiat :',
    inc_type_siege:'Tippu Siegiu', siege:'Siegiu', inc_type_cause:'Tippu Causa', cause:'Causa',
    btn_validate:'Validà', btn_reset:'Rinizialisà', sc_show:'Siegiu/Causa', sc_hide:'Piatta Siegiu/Causa',
    err_names:'I casati devini cuntena soli letteri.',
    err_corr_bo:'Sè voi seti una BO, u currispundanti devi essa BAO o DELCO.',
    err_corr_bao:'Sè voi seti BAOu currispundanti devi essa una BO o DELCO.',
    msg_saved:'Missaghju validatu',
    hist_title:'Storicu', hist_empty:'Nisunu missaghju arrigistratu', back:'Ritornu',
    hist_sender:'Emettori', hist_receiver:'Ricevitori',
    export_csv:'Spurtà in CSV', clear_all:'Sguassà tuttu', confirm_clear:'Seti sicuru di sguassà tuttu ?',
    install_ios:"Pà installà l'appiicazioni :\n\n1. Pichjeti nantu Sparta (Partager)\n2. Pichjeti nantu ⌄ Veda di più (en voir plus)\n3. Scigliti Nantu screnu d'accolta (Sur l'écran d'accueil)",
    install_unavailable:"L'installazioni ùn hè micca dispuniibili cù stu navigatori.",
    csv_filename:'Storicu_Missaghji.csv',
    csv_headers:['Data','Ori','Funzioni','N° Emettori','Casata Emettori','Funzioni Emettori','Entità Emettori','N° Ricevitori','Casata Ricevitori','Funzioni Ricevitori','Entità Ricevitori','Missaghju'],
    csv_headers_sc:['Incidenti - Tippu Siegiu','Incidenti - Siegiu','Incidenti - Tippu Causa','Incidenti - Causa','Travaux urgent - Siegiu','Travaux urgent - Causa']
  },
  fr:{
    menu_title:'Options', menu_close:'Fermer', menu_install:'Installer', menu_history:'Historique', menu_change:"Changer d'entité",
    start_name:'Votre nom de famille', start_placeholder:'Exemple : MURACCIOLI', start_entity:'Entité', start_enter:'Entrer',
    err_name_start:'Le nom ne doit contenir que des lettres, espaces et tirets.',
    role:'Rôle', role_sender:'Émetteur', role_receiver:'Récepteur',
    hour:'Heure', minute:'Minutes', refresh_now:'Actualiser',
    sender:'Émetteur', receiver:'Récepteur',
    message:'Message', message_ph:'Écrivez le message',
    inc_title:'Incident :', trav_title:'Travaux immédiats :',
    inc_type_siege:'Type de siège', siege:'Siège', inc_type_cause:'Type de cause', cause:'Cause',
    btn_validate:'Valider', btn_reset:'Réinitialiser', sc_show:'Siège/Cause', sc_hide:'Masquer Siège/Cause',
    err_names:'Les noms ne doivent contenir que des lettres.',
    err_corr_bo:'Si vous êtes une BO, le correspondant doit être BAO ou DELCO.',
    err_corr_bao:'Si vous êtes BAO, le correspondant doit être une BO ou DELCO.',
    msg_saved:'Message validé',
    hist_title:'Historique', hist_empty:'Aucun message enregistré', back:'Retour',
    hist_sender:'Émetteur', hist_receiver:'Récepteur',
    export_csv:'Exporter en CSV', clear_all:'Tout effacer', confirm_clear:'Êtes-vous sûr de tout effacer ?',
    install_ios:"Pour installer l'application :\n\n1. Appuyez sur Partager\n2. Appuyez sur ⌄ Voir plus\n3. Choisissez Sur l'écran d'accueil",
    install_unavailable:"L'installation n'est pas disponible avec ce navigateur.",
    csv_filename:'Historique_Missaghji.csv',
    csv_headers:['Date','Heure','Rôle','N° Émetteur','Nom Émetteur','Fonction Émetteur','Entité Émetteur','N° Récepteur','Nom Récepteur','Fonction Récepteur','Entité Récepteur','Message'],
    csv_headers_sc:['Incident - Type de siège','Incident - Siège','Incident - Type de cause','Incident - Cause','Travaux urgent - Siège','Travaux urgent - Cause']
  }
};
const getLang=()=>{ try{ const l=localStorage.getItem('lang'); return (l==='fr'||l==='co')?l:'co'; }catch(e){ return 'co'; } };
const t=k=>{ const d=I18N[getLang()]; return (d&&k in d)?d[k]:(k in I18N.co?I18N.co[k]:k); };
function applyI18n(){
  document.documentElement.lang=getLang();
  document.querySelectorAll('[data-i18n]').forEach(el=>{ el.textContent=t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{ el.placeholder=t(el.dataset.i18nPlaceholder); });
  document.querySelectorAll('[data-i18n-title]').forEach(el=>{ el.title=t(el.dataset.i18nTitle); });
}
function updateLangButtons(){ const l=getLang(); document.querySelectorAll('[data-lang]').forEach(b=>{ const on=b.dataset.lang===l; b.classList.toggle('active',on); b.setAttribute('aria-pressed',on?'true':'false'); }); }
function setLang(l){
  if(l!=='fr'&&l!=='co') return;
  localStorage.setItem('lang',l); applyI18n(); updateLangButtons();
  if($('content')){ if(currentView==='history'){ showHistory(); } else { captureState(); renderApp(); } }
}
function bindLangButtons(){ document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang))); }
const lettersOnly=str=>(/^[A-Za-zÀ-ÖØ-öø-ÿ\-\s]+$/u).test((str||'').trim());
const clampNum=n=>{n=parseInt(n||0,10); if(isNaN(n)||n<1) return 1; if(n>999) return 999; return n;};
const nextNum=()=>{let n=parseInt(localStorage.getItem('num')||'0',10); n=n>=999?1:n+1; localStorage.setItem('num',String(n)); return n;};
const nowHM=()=>{const d=new Date(); return {h:String(d.getHours()).padStart(2,'0'), m:String(d.getMinutes()).padStart(2,'0')}};
const isBO=ent=>BO_LIST.includes(ent);
const allowedCorrespondentEntities=userEnt=> isBO(userEnt)? ['BAO','DELCO'] : BO_LIST.concat(['DELCO']);

// ---- Données Incident (menus dépendants) ----
const incSiegeOptions = {
  "Canalisation souterraine HTA": ["-", "6B - Jonction HTA papier/papier", "6D - Jonction HTA sec/sec", "6F - Transition HTA rétractable à froid JTRF hors 3M", "6G - Transition HTA rubanée JTR", "6H - Transition HTA thermo rétractable JT TH", "6K - Raccordement extréminté HTA EUI (C ou N)", "6L - Raccordement Connecteurs séparables HTA CS (E ou D)", "6M - Transition HTA rétractable à froid JTRF 3M."],
  "Canalisation souterraine HTA ou BT": ["-", "60 - Siège en attente d'indentification ou non identifié", "6A - Plein câble papier", "6C - Plein câble synthétique", "6T - Accessoire de dérivation HTA ou BT", "6Z - Bout perdu raccordé sur tout type de câble"],
  "Ligne aérienne HTA ou BT": ["-", "22 - Interrupteur manuel: IACM, ISP", "23 - Autre interrupteur: IAT, IACT", "24 - Armement", "25 - Isolateur", "26 - Attache", "27 - Raccord, pont, bretelle", "29 - Parafoudres ou éclateurs", "2A - Support bois", "2B - Support béton", "2C - Support métallique", "31 - Contact entre conducteurs", "38 - Ligne à conducteurs isolés", "3A - Conducteurs nus rompus, hors faible section", "3B - Conducteurs nus rompus, faible section <14 CU ou <22 AL"],
  "Poste HTA/BT": ["-", "29 - Parafoudres ou éclateurs", "40 - Armoire de coupure", "41 - Transformateur", "42 - Partie HTA", "43 - Partie BT", "S8 - Appareillage BT"],
  "Remontée aéro-souterraine HTA": ["-", "51 - Remontée aéro-sout: Câble", "5A - Remontée aéro-sout HTA: Extrémités"],
  "Réseau transport": ["-", "S1 - Réseau transport"],
  "Siège divers": ["-", "00 - Pas de siège", "01 - Pas de dégât: éliminé avec manœuvres d' OMT", "02 - Pas de dégât: éliminé avec manœuvres manuelles", "13 - Autre point d'alimentation, poste HTA/HTA et autotransformateur", "15 - Incident HTA avec siège sur réseau BT", "16 - Incident BT avec siège sur branchement BT"]
};

const incCausesBase = {
  "Causes internes": ["-", "01 - Fausse manoeuvres", "11 - Défaut de conception", "12 - Défaut de montage/tirage", "13 - Défaillance protection", "15 - Usure naturelle", "21 - Dépassement de capacités électriques"],
  "Causes externes": ["-", "31 - Corps étranger", "32 - Véhicule", "3A - Malveillance", "3B - Vol de métaux", "3C - Chasse", "3D - Incendie d'origine externe", "35 - Autres travaux de tiers (arrachages, ...)", "37 - Installation de clients HTA", "41 - Mouvement de terrain", "42 - Oiseaux", "43 - Autres animaux"],
  "Causes climatiques": ["-", "51 - Coup de foudre", "52 - Pollution, corrosion", "53 - Condensation, inondation"],
  "Autres": ["-"]
};

const incCausesAdditionnelles = {
  "Causes internes": {
    "Poste HTA/BT": ["16 - Incident transfo HTA/BT suite à prélèvement PCB"],
    "Ligne aérienne HTA ou BT": ["22 - Conducteurs déréglés"]
  },
  "Causes externes": {
    "Ligne aérienne HTA ou BT": ["34 - Travaux de tiers - Elagae ou abattage", "44 - Elagage insuffisant", "4A - Abattage Insuffisant"],
    "Siège divers": {
      "01": ["64 - Cause inconnue avec circonstances atmosphériques normales"],
      "02": ["64 - Cause inconnue avec circonstances atmosphériques normales"]
    }
  },
  "Causes climatiques": {
    "Ligne aérienne HTA ou BT": ["45 - Chute de branche par vent", "46 - Chute d'arbre par vent", "47 - Effort anormal par tempête de vent ou de pluie", "48 - Effort anormal par tempête de neige ou de givre"],
    "Canalisation souterraine HTA ou BT": ["49 - Cause forte chaleurs (canicule ou chaleur estivale)"],
    "Siège divers": {
      "01": ["61 - Cause inconnue : par grand vent", "62 - Cause inconnue : par orage", "63 - Cause inconnue : par neige ou givre"],
      "02": ["61 - Cause inconnue : par grand vent", "62 - Cause inconnue : par orage", "63 - Cause inconnue : par neige ou givre"]
    }
  },
  "Autres": {
    "Siège divers": {
      "00": ["8C - Panne de groupe électrogène (panne de carburant)", "8D - Panne de groupe électrogène (défaillance du groupe)", "07 - Grève"],
      "01": ["72 - Départ en RSE (avec cause non identifiée)", "8C - Panne de groupe électrogène (panne de carburant)", "8D - Panne de groupe électrogène (défaillance du groupe)", "07 - Grève"],
      "02": ["72 - Départ en RSE (avec cause non identifiée)", "8C - Panne de groupe électrogène (panne de carburant)", "8D - Panne de groupe électrogène (défaillance du groupe)", "07 - Grève"]
    }
  }
};

// ---- Données Travaux urgent (menus dépendants) ----
const travSiegeList = [
  "S0 - Ouvrage Client","S1 - Réseau Transport","S2 - Poste HTB/HTA : Partie HTB","S3 - Poste HTB/HTA : Partie HTA",
  "S5 - Poste HTA/HTA","S6 - Poste HTA/BT : Transformateur","S7 - Poste HTA/BT : Appareillage HTA","S8 - Poste HTA/BT : Appareillage BT",
  "T1 - Ligne aérienne : conducteurs","T2 - Ligne aérienne : supports et armements","T3 - Ligne aérienne : accessoires",
  "T4 - Ligne souterraine : câble","T8 - Ligne souterraine : accessoire"
];

const travCauseOptions = {
  "S0 - Ouvrage Client": ["","D1 - Travaux urgents (mise en sécurité décidée par EDF)","D2 - Coupure à la demande des autorités (ou de GRDF)","D3 - Réparation définitive suite à incident","D4 - Réparation suite à événement de grande ampleur","D5 - Travaux de maintenance courante (hors élagage)","D7 - Travaux d'élagage","D9 - Travaux de raccordement sous MOA Enedis","DA - Travaux de raccordement sous MOA ER","DB - Travaux délibérés (investissements) sous MOA EDF","DC - Travaux délibérés (investissements) sous MOA ER","DD - Adaptation aux charges","DE - Travaux de tiers à proximité des ouvrages","DF - Travaux de déplacement d'ouvrage à la demande de tiers","DG - Réparation de dégâts dus à des tiers","DH - Séparation de réseau suite à la demande d'un client S0","DJ - Coupure HTA pour réparation suite à un incident BT","DL - Travaux de raccordement Producteurs"],
  "S1 - Réseau Transport": ["","D0 - Travaux cause transport","DK - Essai de renvoi HTB","DL - Travaux de raccordement Producteurs"],
  "S2 - Poste HTB/HTA : Partie HTB": ["","D1 - Travaux urgents (mise en sécurité décidée par EDF)","D2 - Coupure à la demande des autorités (ou de GRDF)","D3 - Réparation définitive suite à incident","D4 - Réparation suite à événement de grande ampleur","D5 - Travaux de maintenance courante (hors élagage)","D6 - Maintenance lourde (prolongation durée de vie des ouvrages)","D7 - Travaux d'élagage","D9 - Travaux de raccordement sous MOA Enedis","DA - Travaux de raccordement sous MOA ER","DB - Travaux délibérés (investissements) sous MOA EDF","DC - Travaux délibérés (investissements) sous MOA ER","DD - Adaptation aux charges","DE - Travaux de tiers à proximité des ouvrages","DF - Travaux de déplacement d'ouvrage à la demande de tiers","DG - Réparation de dégâts dus à des tiers","DL - Travaux de raccordement Producteurs"],
  "S3 - Poste HTB/HTA : Partie HTA": ["","D1 - Travaux urgents (mise en sécurité décidée par EDF)","D2 - Coupure à la demande des autorités (ou de GRDF)","D3 - Réparation définitive suite à incident","D4 - Réparation suite à événement de grande ampleur","D5 - Travaux de maintenance courante (hors élagage)","D6 - Maintenance lourde (prolongation durée de vie des ouvrages)","D7 - Travaux d'élagage","D9 - Travaux de raccordement sous MOA Enedis","DA - Travaux de raccordement sous MOA ER","DB - Travaux délibérés (investissements) sous MOA EDF","DC - Travaux délibérés (investissements) sous MOA ER","DD - Adaptation aux charges","DE - Travaux de tiers à proximité des ouvrages","DF - Travaux de déplacement d'ouvrage à la demande de tiers","DG - Réparation de dégâts dus à des tiers","DJ - Coupure HTA pour réparation suite à un incident BT","DL - Travaux de raccordement Producteurs"],
  "S5 - Poste HTA/HTA": ["","D1 - Travaux urgents (mise en sécurité décidée par EDF)","D2 - Coupure à la demande des autorités (ou de GRDF)","D3 - Réparation définitive suite à incident","D4 - Réparation suite à événement de grande ampleur","D5 - Travaux de maintenance courante (hors élagage)","D6 - Maintenance lourde (prolongation durée de vie des ouvrages)","D7 - Travaux d'élagage","D9 - Travaux de raccordement sous MOA Enedis","DA - Travaux de raccordement sous MOA ER","DB - Travaux délibérés (investissements) sous MOA EDF","DC - Travaux délibérés (investissements) sous MOA ER","DD - Adaptation aux charges","DE - Travaux de tiers à proximité des ouvrages","DF - Travaux de déplacement d'ouvrage à la demande de tiers","DG - Réparation de dégâts dus à des tiers","DJ - Coupure HTA pour réparation suite à un incident BT","DL - Travaux de raccordement Producteurs"],
  "S6 - Poste HTA/BT : Transformateur": ["","D1 - Travaux urgents (mise en sécurité décidée par EDF)","D2 - Coupure à la demande des autorités (ou de GRDF)","D3 - Réparation définitive suite à incident","D4 - Réparation suite à événement de grande ampleur","D5 - Travaux de maintenance courante (hors élagage)","D6 - Maintenance lourde (prolongation durée de vie des ouvrages)","D7 - Travaux d'élagage","D8 - Traitement PCB","D9 - Travaux de raccordement sous MOA Enedis","DA - Travaux de raccordement sous MOA ER","DB - Travaux délibérés (investissements) sous MOA EDF","DC - Travaux délibérés (investissements) sous MOA ER","DD - Adaptation aux charges","DE - Travaux de tiers à proximité des ouvrages","DF - Travaux de déplacement d'ouvrage à la demande de tiers","DG - Réparation de dégâts dus à des tiers","DJ - Coupure HTA pour réparation suite à un incident BT","DL - Travaux de raccordement Producteurs"],
  "S7 - Poste HTA/BT : Appareillage HTA": ["","D1 - Travaux urgents (mise en sécurité décidée par EDF)","D2 - Coupure à la demande des autorités (ou de GRDF)","D3 - Réparation définitive suite à incident","D4 - Réparation suite à événement de grande ampleur","D5 - Travaux de maintenance courante (hors élagage)","D6 - Maintenance lourde (prolongation durée de vie des ouvrages)","D7 - Travaux d'élagage","D9 - Travaux de raccordement sous MOA Enedis","DA - Travaux de raccordement sous MOA ER","DB - Travaux délibérés (investissements) sous MOA EDF","DC - Travaux délibérés (investissements) sous MOA ER","DD - Adaptation aux charges","DE - Travaux de tiers à proximité des ouvrages","DF - Travaux de déplacement d'ouvrage à la demande de tiers","DG - Réparation de dégâts dus à des tiers","DJ - Coupure HTA pour réparation suite à un incident BT","DL - Travaux de raccordement Producteurs"],
  "S8 - Poste HTA/BT : Appareillage BT": ["","D1 - Travaux urgents (mise en sécurité décidée par EDF)","D2 - Coupure à la demande des autorités (ou de GRDF)","D3 - Réparation définitive suite à incident","D4 - Réparation suite à événement de grande ampleur","D5 - Travaux de maintenance courante (hors élagage)","D6 - Maintenance lourde (prolongation durée de vie des ouvrages)","D7 - Travaux d'élagage","D9 - Travaux de raccordement sous MOA Enedis","DA - Travaux de raccordement sous MOA ER","DB - Travaux délibérés (investissements) sous MOA EDF","DC - Travaux délibérés (investissements) sous MOA ER","DD - Adaptation aux charges","DE - Travaux de tiers à proximité des ouvrages","DF - Travaux de déplacement d'ouvrage à la demande de tiers","DG - Réparation de dégâts dus à des tiers","DJ - Coupure HTA pour réparation suite à un incident BT","DL - Travaux de raccordement Producteurs"],
  "T1 - Ligne aérienne : conducteurs": ["","D1 - Travaux urgents (mise en sécurité décidée par EDF)","D2 - Coupure à la demande des autorités (ou de GRDF)","D3 - Réparation définitive suite à incident","D4 - Réparation suite à événement de grande ampleur","D5 - Travaux de maintenance courante (hors élagage)","D6 - Maintenance lourde (prolongation durée de vie des ouvrages)","D7 - Travaux d'élagage","D9 - Travaux de raccordement sous MOA Enedis","DA - Travaux de raccordement sous MOA ER","DB - Travaux délibérés (investissements) sous MOA EDF","DC - Travaux délibérés (investissements) sous MOA ER","DD - Adaptation aux charges","DE - Travaux de tiers à proximité des ouvrages","DF - Travaux de déplacement d'ouvrage à la demande de tiers","DG - Réparation de dégâts dus à des tiers","DJ - Coupure HTA pour réparation suite à un incident BT","DL - Travaux de raccordement Producteurs"],
  "T2 - Ligne aérienne : supports et armements": ["","D1 - Travaux urgents (mise en sécurité décidée par EDF)","D2 - Coupure à la demande des autorités (ou de GRDF)","D3 - Réparation définitive suite à incident","D4 - Réparation suite à événement de grande ampleur","D5 - Travaux de maintenance courante (hors élagage)","D6 - Maintenance lourde (prolongation durée de vie des ouvrages)","D7 - Travaux d'élagage","D9 - Travaux de raccordement sous MOA Enedis","DA - Travaux de raccordement sous MOA ER","DB - Travaux délibérés (investissements) sous MOA EDF","DC - Travaux délibérés (investissements) sous MOA ER","DD - Adaptation aux charges","DE - Travaux de tiers à proximité des ouvrages","DF - Travaux de déplacement d'ouvrage à la demande de tiers","DG - Réparation de dégâts dus à des tiers","DJ - Coupure HTA pour réparation suite à un incident BT","DL - Travaux de raccordement Producteurs"],
  "T3 - Ligne aérienne : accessoires": ["","D1 - Travaux urgents (mise en sécurité décidée par EDF)","D2 - Coupure à la demande des autorités (ou de GRDF)","D3 - Réparation définitive suite à incident","D4 - Réparation suite à événement de grande ampleur","D5 - Travaux de maintenance courante (hors élagage)","D6 - Maintenance lourde (prolongation durée de vie des ouvrages)","D7 - Travaux d'élagage","D9 - Travaux de raccordement sous MOA Enedis","DA - Travaux de raccordement sous MOA ER","DB - Travaux délibérés (investissements) sous MOA EDF","DC - Travaux délibérés (investissements) sous MOA ER","DD - Adaptation aux charges","DE - Travaux de tiers à proximité des ouvrages","DF - Travaux de déplacement d'ouvrage à la demande de tiers","DG - Réparation de dégâts dus à des tiers","DJ - Coupure HTA pour réparation suite à un incident BT","DL - Travaux de raccordement Producteurs"],
  "T4 - Ligne souterraine : câble": ["","D1 - Travaux urgents (mise en sécurité décidée par EDF)","D2 - Coupure à la demande des autorités (ou de GRDF)","D3 - Réparation définitive suite à incident","D4 - Réparation suite à événement de grande ampleur","D5 - Travaux de maintenance courante (hors élagage)","D6 - Maintenance lourde (prolongation durée de vie des ouvrages)","D9 - Travaux de raccordement sous MOA Enedis","DA - Travaux de raccordement sous MOA ER","DB - Travaux délibérés (investissements) sous MOA EDF","DC - Travaux délibérés (investissements) sous MOA ER","DD - Adaptation aux charges","DE - Travaux de tiers à proximité des ouvrages","DF - Travaux de déplacement d'ouvrage à la demande de tiers","DG - Réparation de dégâts dus à des tiers","DJ - Coupure HTA pour réparation suite à un incident BT","DL - Travaux de raccordement Producteurs"],
  "T8 - Ligne souterraine : accessoire": ["","D1 - Travaux urgents (mise en sécurité décidée par EDF)","D2 - Coupure à la demande des autorités (ou de GRDF)","D3 - Réparation définitive suite à incident","D4 - Réparation suite à événement de grande ampleur","D5 - Travaux de maintenance courante (hors élagage)","D6 - Maintenance lourde (prolongation durée de vie des ouvrages)","D9 - Travaux de raccordement sous MOA Enedis","DA - Travaux de raccordement sous MOA ER","DB - Travaux délibérés (investissements) sous MOA EDF","DC - Travaux délibérés (investissements) sous MOA ER","DD - Adaptation aux charges","DE - Travaux de tiers à proximité des ouvrages","DF - Travaux de déplacement d'ouvrage à la demande de tiers","DG - Réparation de dégâts dus à des tiers","DJ - Coupure HTA pour réparation suite à un incident BT","DL - Travaux de raccordement Producteurs"]
};

function setupStart(){const savedUser=localStorage.getItem('username');const savedEntity=localStorage.getItem('entity');if(savedUser&&savedEntity){location.replace('main.html');return;}const form=$('startForm');if(!form)return;const input=$('username');input.addEventListener('input',()=>{input.value=input.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\-\s]/gu,'').toUpperCase();});form.addEventListener('submit',e=>{e.preventDefault();const name=(input.value||'').trim();if(!name||!lettersOnly(name))return alert(t('err_name_start'));const ent=$('entity').value;localStorage.setItem('username',name.toUpperCase());localStorage.setItem('entity',ent);if(!localStorage.getItem('num'))localStorage.setItem('num','0');localStorage.setItem('version',VERSION);location.href='main.html';});}

let currentRole='Émetteur'; let state=null; let showSiegeCause=false; let currentView='form';
function captureState(){ const get=id=>$(id)?$(id).value:''; state={ hour:get('hour'), min:get('min'), enNum:get('enNum'), enName:get('enName'), enFunc:get('enFunc'), enEnt:get('enEnt'), reNum:get('reNum'), reName:get('reName'), reFunc:get('reFunc'), reEnt:get('reEnt'), message:get('message'), incTypeSiege:get('incTypeSiege'), incSiege:get('incSiege'), incTypeCause:get('incTypeCause'), incCause:get('incCause'), travSiege:get('travSiege'), travCause:get('travCause') }; }
function invertStateBetweenSides(){ if(!state) return; const s=state; [s.enNum,s.reNum]=[s.reNum,s.enNum]; [s.enName,s.reName]=[s.reName,s.enName]; [s.enFunc,s.reFunc]=[s.reFunc,s.enFunc]; [s.enEnt,s.reEnt]=[s.reEnt,s.enEnt]; }
function applyUppercaseLive(ids){ ids.forEach(id=>{ const el=$(id); if(!el) return; el.addEventListener('input',()=>{ el.value=(el.value||'').toUpperCase(); }); }); }
function applyLettersOnly(ids){ ids.forEach(id=>{ const el=$(id); if(!el) return; el.addEventListener('input',()=>{ el.value=el.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\-\s]/gu,''); }); }); }
function applyNumericOnly(ids){ ids.forEach(id=>{ const el=$(id); if(!el) return; el.addEventListener('keydown',e=>{ if(!/[0-9]|Backspace|Delete|ArrowLeft|ArrowRight|Tab/.test(e.key)) e.preventDefault(); }); el.addEventListener('input',()=>{ el.value=el.value.replace(/[^0-9]/g,''); }); }); }

function toggleMenu(){ const o=$('menuOverlay'); if(!o) return; o.classList.toggle('hidden'); }
function closeMenu(){ const o=$('menuOverlay'); if(!o) return; o.classList.add('hidden'); }
function bindMenuActions(){ const install=()=>{if(window.deferredPrompt){window.deferredPrompt.prompt();window.deferredPrompt=null;return;}if(/iPhone|iPad|iPod/i.test(navigator.userAgent)){alert(t('install_ios'));return;}alert(t('install_unavailable'));}; $('btnInstall')?.addEventListener('click',()=>{ closeMenu(); install(); }); $('btnHistory')?.addEventListener('click',()=>{ closeMenu(); captureState(); showHistory(); }); $('btnChange')?.addEventListener('click',()=>{ closeMenu(); localStorage.removeItem('username'); localStorage.removeItem('entity'); location.href='index.html'; }); }

function setupMain(){ if(!$('topbar')) return; const user=localStorage.getItem('username')||''; const ent=localStorage.getItem('entity')||''; $('topbar').innerHTML=`<div><div class="app-title">CARNETTU DI MISSAGHJI<span class="version">${localStorage.getItem('version')||VERSION}</span></div><div class="meta">${user} (${ent})</div></div><div class="burger" id="burger">☰</div>`; $('burger').addEventListener('click',toggleMenu); $('overlayBackdrop')?.addEventListener('click',closeMenu); $('closeMenu')?.addEventListener('click',closeMenu); renderApp(); bindMenuActions(); }
window.addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); window.deferredPrompt=e; });

// ---- Câblage des menus Incident (mêmes règles que le HTA/BT) ----
function setupIncidentSelects(s){
  const typeSiegeEl=$('incTypeSiege'), siegeEl=$('incSiege'), typeCauseEl=$('incTypeCause'), causeEl=$('incCause');
  if(!typeSiegeEl) return;

  function updateSiege(){
    const selected=typeSiegeEl.value;
    siegeEl.innerHTML=`<option value=''>${t('siege')}</option>`;
    if(incSiegeOptions[selected]){
      incSiegeOptions[selected].forEach(opt=>{
        const o=document.createElement('option');
        o.value=opt.split(' - ')[0]; o.text=opt;
        siegeEl.appendChild(o);
      });
    }
    updateCause();
  }

  function updateCause(){
    const typeCause=typeCauseEl.value, typeSiege=typeSiegeEl.value, siege=siegeEl.value;
    if(!typeCause||!typeSiege||!siege){ causeEl.innerHTML=`<option value=''>${t('cause')}</option>`; return; }
    causeEl.innerHTML="";
    (incCausesBase[typeCause]||['-']).forEach(c=>{ const o=document.createElement('option'); o.value=c; o.text=c; causeEl.appendChild(o); });
    const add=incCausesAdditionnelles[typeCause];
    if(add){
      if(Array.isArray(add[typeSiege])){
        add[typeSiege].forEach(c=>{ const o=document.createElement('option'); o.value=c; o.text=c; causeEl.appendChild(o); });
      } else if(add[typeSiege]&&add[typeSiege][siege]){
        add[typeSiege][siege].forEach(c=>{ const o=document.createElement('option'); o.value=c; o.text=c; causeEl.appendChild(o); });
      }
    }
  }

  typeSiegeEl.addEventListener('change',updateSiege);
  siegeEl.addEventListener('change',updateCause);
  typeCauseEl.addEventListener('change',updateCause);

  // restaurer l'état si présent
  if(s&&s.incTypeSiege){ typeSiegeEl.value=s.incTypeSiege; updateSiege(); if(s.incSiege){ siegeEl.value=s.incSiege; updateCause(); if(s.incTypeCause){ typeCauseEl.value=s.incTypeCause; updateCause(); if(s.incCause) causeEl.value=s.incCause; } } }
}

// ---- Câblage du menu Travaux urgent ----
function setupTravauxSelects(s){
  const siegeEl=$('travSiege'), causeEl=$('travCause');
  if(!siegeEl) return;

  function updateCause(){
    const selected=siegeEl.value;
    causeEl.innerHTML=`<option value=''>${t('cause')}</option>`;
    if(travCauseOptions[selected]){
      travCauseOptions[selected].forEach(c=>{
        if(c===''){ return; }
        const o=document.createElement('option'); o.value=c; o.text=c; causeEl.appendChild(o);
      });
    }
  }

  siegeEl.addEventListener('change',updateCause);

  if(s&&s.travSiege){ siegeEl.value=s.travSiege; updateCause(); if(s.travCause) causeEl.value=s.travCause; }
}

function renderApp(){ currentView='form'; const user=localStorage.getItem('username')||''; const ent=localStorage.getItem('entity')||''; const c=$('content'); const hm=nowHM(); const s=state||{}; const meSide=(currentRole==='Émetteur')?'sender':'receiver'; const corrOptions=allowedCorrespondentEntities(ent); const optionsCorr=corrOptions.map(x=>`<option value="${x}" ${s[(meSide==='sender')?'reEnt':'enEnt']===x?'selected':''}>${x}</option>`).join('');

const isBAO=(ent==='BAO');
const incTypeSiegeOptions=Object.keys(incSiegeOptions).map(k=>`<option value="${k}">${k}</option>`).join('');
const incTypeCauseOptions=Object.keys(incCausesBase).map(k=>`<option value="${k}">${k}</option>`).join('');
const travSiegeSelectOptions=travSiegeList.map(k=>`<option value="${k}">${k}</option>`).join('');

const incidentTravauxBlock = (isBAO && showSiegeCause) ? `
<div class="block" style="margin-top:10px">
  <h4>${t('inc_title')}</h4>
  <div class="row-func-ent">
    <select id="incTypeSiege"><option value="">${t('inc_type_siege')}</option>${incTypeSiegeOptions}</select>
    <select id="incSiege"><option value="">${t('siege')}</option></select>
  </div>
  <div class="row-func-ent">
    <select id="incTypeCause"><option value="">${t('inc_type_cause')}</option>${incTypeCauseOptions}</select>
    <select id="incCause"><option value="">${t('cause')}</option></select>
  </div>
  <h4 style="margin-top:10px">${t('trav_title')}</h4>
  <div class="row-func-ent">
    <select id="travSiege"><option value="">${t('siege')}</option>${travSiegeSelectOptions}</select>
    <select id="travCause"><option value="">${t('cause')}</option></select>
  </div>
</div>
` : '';

c.innerHTML=`
<section class="card block">
  <div class="context-row">
    <div class="ctx-item ctx-item--role">
      <label for="role">${t('role')}</label>
      <select id="role">
        <option value="Émetteur" ${currentRole==='Émetteur'?'selected':''}>${t('role_sender')}</option>
        <option value="Récepteur" ${currentRole==='Récepteur'?'selected':''}>${t('role_receiver')}</option>
      </select>
    </div>
    <div class="ctx-item ctx-item--hour">
      <label for="hour">${t('hour')}</label>
      <input type="tel" inputmode="numeric" pattern="[0-9]*" id="hour" maxlength="2" min="0" max="23" value="${s.hour||hm.h}" />
    </div>
    <div class="ctx-item ctx-item--min">
      <label for="min">${t('minute')}</label>
      <input type="tel" inputmode="numeric" pattern="[0-9]*" id="min" maxlength="2" min="0" max="59" value="${s.min||hm.m}" />
    </div>
    <div class="ctx-item ctx-btn">
      <label>&nbsp;</label>
      <button class="btn icon-btn" id="btnNow" title="${t('refresh_now')}">⟳</button>
    </div>
  </div>
</section>

<section class="card block">
  <h3>${t('sender')} <span class="badge">${meSide==='sender'?'EIU':''}</span></h3>
  <div class="row-num-name">
    <input type="tel" inputmode="numeric" pattern="[0-9]*" maxlength="3" id="enNum" min="1" max="999" value="${s.enNum||''}">
    ${meSide==='sender'?`<button class="num-btn" id="enGen">⟳</button>`:`<div></div>`}
    <input type="text" id="enName" value="${s.enName||''}">
  </div>
  <div class="row-func-ent">
    <select id="enFunc"></select>
    ${meSide==='sender'?`<input type="text" id="enEnt" value="${ent}" disabled>`:`<select id="enEnt">${optionsCorr}</select>`}
  </div>
</section>

<section class="card block">
  <h3>${t('receiver')} <span class="badge">${meSide==='receiver'?'EIU':''}</span></h3>
  <div class="row-num-name">
    <input type="tel" inputmode="numeric" pattern="[0-9]*" maxlength="3" id="reNum" min="1" max="999" value="${s.reNum||''}">
    ${meSide==='receiver'?`<button class="num-btn" id="reGen">⟳</button>`:`<div></div>`}
    <input type="text" id="reName" value="${s.reName||''}">
  </div>
  <div class="row-func-ent">
    <select id="reFunc"></select>
    ${meSide==='receiver'?`<input type="text" id="reEnt" value="${ent}" disabled>`:`<select id="reEnt">${optionsCorr}</select>`}
  </div>
</section>

<section class="card block">
  <h3>${t('message')}</h3>
  <textarea id="message" placeholder="${t('message_ph')}">${s.message||''}</textarea>
  ${incidentTravauxBlock}
  <div class="actions">
    <button class="btn primary" id="btnSave">${t('btn_validate')}</button>
    <button class="btn ghost" id="btnReset">${t('btn_reset')}</button>
    ${isBAO?`<button class="btn ghost" id="btnToggleSC">${showSiegeCause?t('sc_hide'):t('sc_show')}</button>`:''}
  </div>
</section>`;

  const enFuncEl=$('enFunc'); const reFuncEl=$('reFunc');
  if(meSide==='sender'){
    $('enName').value=(user); $('enName').disabled=true;
    enFuncEl.innerHTML=(ent==='BAO')?'<option value="CEX" selected>CEX</option>':BO_FUNCS.map(f=>`<option value="${f}">${f}</option>`).join('');
    enFuncEl.disabled=(ent==='BAO');
  } else {
    $('reName').value=(user); $('reName').disabled=true;
    reFuncEl.innerHTML=(ent==='BAO')?'<option value="CEX" selected>CEX</option>':BO_FUNCS.map(f=>`<option value="${f}">${f}</option>`).join('');
    reFuncEl.disabled=(ent==='BAO');
  }

  function updateCorrFunc(which){ const entVal=(which==='sender'? $('enEnt').value : $('reEnt').value); const funcEl=(which==='sender'? enFuncEl : reFuncEl); if(entVal==='BAO'){ funcEl.innerHTML='<option value="CEX">CEX</option>'; funcEl.disabled=true; } else if(entVal==='DELCO'){ funcEl.innerHTML='<option value="CCO">CCO</option>'; funcEl.disabled=true; } else { funcEl.innerHTML=BO_FUNCS.map(f=>`<option value="${f}">${f}</option>`).join(''); funcEl.disabled=false; } }
  if(meSide==='sender'){ if($('reEnt')&&$('reEnt').tagName==='SELECT'){ updateCorrFunc('receiver'); $('reEnt').addEventListener('change',()=>updateCorrFunc('receiver')); } }
  else { if($('enEnt')&&$('enEnt').tagName==='SELECT'){ updateCorrFunc('sender'); $('enEnt').addEventListener('change',()=>updateCorrFunc('sender')); } }

  $('btnNow').onclick=()=>{ const n=nowHM(); $('hour').value=n.h; $('min').value=n.m; };
  $('role').onchange=()=>{ captureState(); invertStateBetweenSides(); currentRole=$('role').value; renderApp(); };
  $('enGen')?.addEventListener('click',e=>{ e.preventDefault(); $('enNum').value=nextNum(); });
  $('reGen')?.addEventListener('click',e=>{ e.preventDefault(); $('reNum').value=nextNum(); });

  applyLettersOnly(['enName','reName']);
  applyUppercaseLive(['enName','reName']);
  applyNumericOnly(['hour','min','enNum','reNum']);

  if(isBAO&&showSiegeCause){ setupIncidentSelects(s); setupTravauxSelects(s); }

  $('btnToggleSC')?.addEventListener('click',e=>{ e.preventDefault(); captureState(); showSiegeCause=!showSiegeCause; renderApp(); });

  $('btnSave').onclick=e=>{ e.preventDefault(); saveMessage(); };
  $('btnReset').onclick=e=>{ e.preventDefault(); state=null; renderApp(); };
}

function saveMessage(){ const rec={ date:new Date().toLocaleDateString('fr-FR'), time:`${$('hour').value.toString().padStart(2,'0')}:${$('min').value.toString().padStart(2,'0')}`, role:$('role').value, em_num:String(clampNum($('enNum').value||nextNum())), em_name:$('enName').value.trim(), em_func:$('enFunc').value, em_ent:$('enEnt').value, re_num:String(clampNum($('reNum').value||'')), re_name:$('reName').value.trim(), re_func:$('reFunc').value, re_ent:$('reEnt').value, msg:$('message').value.trim(), inc_type_siege:$('incTypeSiege')?$('incTypeSiege').value:'', inc_siege:$('incSiege')?$('incSiege').value:'', inc_type_cause:$('incTypeCause')?$('incTypeCause').value:'', inc_cause:$('incCause')?$('incCause').value:'', trav_siege:$('travSiege')?$('travSiege').value:'', trav_cause:$('travCause')?$('travCause').value:'' };
  if(!lettersOnly(rec.em_name)||!lettersOnly(rec.re_name)){ alert(t('err_names')); return; }
  const userEnt=localStorage.getItem('entity')||''; const corrEnt=(currentRole==='Émetteur')?rec.re_ent:rec.em_ent; if(isBO(userEnt)){ if(!(corrEnt==='BAO'||corrEnt==='DELCO')){ alert(t('err_corr_bo')); return; } } else { if(!(BO_LIST.includes(corrEnt)||corrEnt==='DELCO')){ alert(t('err_corr_bao')); return; } }
  const list=JSON.parse(localStorage.getItem('history')||'[]'); list.push(rec); localStorage.setItem('history',JSON.stringify(list)); alert(t('msg_saved')); state=null; renderApp(); }

function showHistory(){
  currentView='history';
  const list=JSON.parse(localStorage.getItem('history')||'[]'); const c=$('content');
  if(list.length===0){
    c.innerHTML=`<section class="card"><h2>${t('hist_title')}</h2><p>${t('hist_empty')}</p><div class="actions"><button class="btn" id="back">${t('back')}</button></div></section>`;
    $('back').onclick=()=>renderApp(); return;
  }
  const out=list.map(x=>`${x.date} ${x.time}\n${t('hist_sender')}: N° ${x.em_num} | ${x.em_name} | ${x.em_func} | ${x.em_ent}\n${t('hist_receiver')}: N° ${x.re_num} | ${x.re_name} | ${x.re_func} | ${x.re_ent}\n${x.msg}\n-----`).join("\n");
  c.innerHTML=`<section class="card"><h2>${t('hist_title')}</h2><pre>${out}</pre><div class="actions"><button class="btn primary" id="exportCsv">${t('export_csv')}</button><button class="btn ghost" id="clearHistory">${t('clear_all')}</button><button class="btn" id="back">${t('back')}</button></div></section>`;
  $('back').onclick=()=>renderApp(); $('exportCsv').onclick=exportCSV;
  $('clearHistory').onclick=()=>{ if(confirm(t('confirm_clear'))){ localStorage.removeItem('history'); renderApp(); } };
}

function exportCSV(){
  const list=JSON.parse(localStorage.getItem('history')||'[]'); const sep=';';
  // Colonnes Incident / Travaux : seulement pour BAO (ou si l'historique en contient déjà)
  const withSC=(localStorage.getItem('entity')==='BAO')||list.some(x=>x.inc_type_siege||x.inc_siege||x.inc_type_cause||x.inc_cause||x.trav_siege||x.trav_cause);
  const headers=withSC?t('csv_headers').concat(t('csv_headers_sc')):t('csv_headers');
  const rows=list.map(x=>{
    const base=[x.date,x.time,x.role,x.em_num,x.em_name,x.em_func,x.em_ent,x.re_num,x.re_name,x.re_func,x.re_ent,(x.msg||'').replace(/\r?\n/g,' ')];
    return withSC?base.concat([x.inc_type_siege||'',x.inc_siege||'',x.inc_type_cause||'',x.inc_cause||'',x.trav_siege||'',x.trav_cause||'']):base;
  });
  const csv=['\ufeff'+headers.join(sep)].concat(rows.map(r=>r.map(v=>'"'+String(v||'').replace(/"/g,'""')+'"').join(sep))).join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=t('csv_filename'); document.body.appendChild(a); a.click(); a.remove();
}

document.addEventListener('DOMContentLoaded',()=>{ applyI18n(); bindLangButtons(); updateLangButtons(); if($('startForm')) setupStart(); else setupMain(); });
