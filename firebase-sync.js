// ── Firebase Sync — Mes Sport ──────────────────────────────────
// Réutilise le MÊME projet Firebase que Mes Menus (mes-menus-famille),
// dans une collection séparée ('sport') — backend partagé, app distincte.
// Connexion Google obligatoire, restreinte aux 2 comptes de la famille.
// Sans connexion : l'app fonctionne normalement en local (localStorage).
//
// Séparation par personne (30/06/2026) : le compte Google connecté
// détermine automatiquement à qui appartiennent les données (historique,
// poids) — chacun écrit dans ses propres documents Firestore, pas de
// sélecteur manuel nécessaire, et plus aucun risque d'écrasement si Elle
// et Lui font une séance en même temps sur deux appareils différents.

(function () {

  firebase.initializeApp({
    apiKey: "AIzaSyAXzH9-j33ZOEFPfsUuNtu5vjmGaNUxcDI",
    authDomain: "mes-menus-famille.firebaseapp.com",
    projectId: "mes-menus-famille",
    storageBucket: "mes-menus-famille.firebasestorage.app",
    messagingSenderId: "554571384276",
    appId: "1:554571384276:web:94f006ddff1ca96eb28241"
  });

  const ALLOWED_EMAILS = ['lauriecordedda@gmail.com', 'nelson.cordedda@gmail.com'];
  const personKeyFromEmail = email => email === 'lauriecordedda@gmail.com' ? 'elle' : 'lui';
  const personLabelFromEmail = email => email === 'lauriecordedda@gmail.com' ? 'Elle' : 'Lui';

  const auth = firebase.auth();
  const provider = new firebase.auth.GoogleAuthProvider();

  let _db = null;
  let _firestoreReady = false;

  function renderAuthBar(state, label) {
    const el = document.getElementById('auth-bar');
    if (!el) return;
    if (state === 'signed-in') {
      el.className = 'auth-bar ok';
      el.innerHTML = `<span>✓ Connecté — ${label} · synchro active</span>
        <button onclick="fbSignOut()">Déconnexion</button>`;
    } else if (state === 'denied') {
      el.className = 'auth-bar err';
      el.innerHTML = `<span>⚠️ Compte non autorisé (${label}) — synchro désactivée</span>
        <button onclick="fbSignIn()">Changer de compte</button>`;
    } else if (state === 'loading') {
      el.className = 'auth-bar';
      el.innerHTML = `<span>Connexion en cours…</span>`;
    } else {
      el.className = 'auth-bar';
      el.innerHTML = `<span>🔒 Synchro entre appareils désactivée</span>
        <button onclick="fbSignIn()">Se connecter avec Google</button>`;
    }
  }

  window.fbSignIn = function () {
    renderAuthBar('loading');
    auth.signInWithPopup(provider).catch(err => {
      console.warn('[FB] Erreur connexion:', err.code, err.message);
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        auth.signInWithRedirect(provider);
      } else {
        renderAuthBar('signed-out');
      }
    });
  };

  window.fbSignOut = function () {
    auth.signOut();
  };

  function enableFirestoreSync(personKey) {
    if (_firestoreReady) return;
    _firestoreReady = true;

    _db = firebase.firestore();
    _db.enablePersistence({ synchronizeTabs: true }).catch(err => {
      if (err.code !== 'failed-precondition' && err.code !== 'unimplemented')
        console.warn('[FB] Persistence:', err.code);
    });

    // Collection dédiée au sport, séparée de 'etat' (Mes Menus).
    // Documents séparés par personne : cordedda_historique_lui / _elle, etc.
    const _ref = key => _db.collection('sport').doc('cordedda_' + key + '_' + personKey);

    fbSyncSport = {
      saveHistorique(d) {
        try { localStorage.setItem('sportHistorique_' + personKey, JSON.stringify(d)); } catch(e) {}
        _ref('historique').set({ v: JSON.stringify(d) });
      },
      savePoids(p) {
        try { localStorage.setItem('sportPoids_' + personKey, p); } catch(e) {}
        _ref('poids').set({ v: String(p) });
      },
    };

    function _listen(key, onData) {
      _ref(key).onSnapshot(snap => {
        if (!snap.exists || snap.metadata.hasPendingWrites) return;
        try { onData(snap.data().v); } catch(e) {}
      }, err => console.warn('[FB] Listen', key, err.code));
    }

    _listen('historique', v => {
      try {
        historique = JSON.parse(v);
        if (document.getElementById('tab-historique').classList.contains('active')) renderHistorique();
      } catch(e) {}
    });

    _listen('poids', v => {
      const p = parseFloat(v);
      if (p) {
        poids = p;
        const el = document.getElementById('poids-input');
        if (el) el.value = p;
      }
    });

    console.log('[Firebase] Synchronisation active —', personKey);
  }

  auth.getRedirectResult().catch(err => {
    console.warn('[FB] Erreur redirection connexion:', err.code);
    renderAuthBar('signed-out');
  });

  let _deniedUntil = 0;

  auth.onAuthStateChanged(user => {
    if (!user) {
      if (Date.now() < _deniedUntil) return;
      renderAuthBar('signed-out');
      return;
    }
    if (!user.emailVerified || !ALLOWED_EMAILS.includes(user.email)) {
      _deniedUntil = Date.now() + 4000;
      renderAuthBar('denied', user.email || 'compte inconnu');
      auth.signOut();
      return;
    }
    const personKey = personKeyFromEmail(user.email);
    renderAuthBar('signed-in', personLabelFromEmail(user.email));
    // Recharge l'historique local propre à cette personne (évite d'afficher
    // un instant les données d'un autre compte précédemment connecté sur cet appareil)
    try {
      const localHist = localStorage.getItem('sportHistorique_' + personKey);
      if (localHist) historique = JSON.parse(localHist);
      const localPoids = localStorage.getItem('sportPoids_' + personKey);
      if (localPoids) {
        poids = parseFloat(localPoids);
        const el = document.getElementById('poids-input');
        if (el) el.value = poids;
      }
    } catch(e) {}
    enableFirestoreSync(personKey);
  });

})();