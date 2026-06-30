// ── Firebase Sync — Mes Sport ──────────────────────────────────
// Réutilise le MÊME projet Firebase que Mes Menus (mes-menus-famille),
// dans une collection séparée ('sport') — backend partagé, app distincte.
// Connexion Google obligatoire, restreinte aux 2 comptes de la famille.
// Sans connexion : l'app fonctionne normalement en local (localStorage).

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

  function enableFirestoreSync() {
    if (_firestoreReady) return;
    _firestoreReady = true;

    _db = firebase.firestore();
    _db.enablePersistence({ synchronizeTabs: true }).catch(err => {
      if (err.code !== 'failed-precondition' && err.code !== 'unimplemented')
        console.warn('[FB] Persistence:', err.code);
    });

    // Collection dédiée au sport, séparée de 'etat' (Mes Menus)
    const _ref = key => _db.collection('sport').doc('cordedda_' + key);

    fbSyncSport = {
      saveHistorique(d) {
        try { localStorage.setItem('sportHistorique', JSON.stringify(d)); } catch(e) {}
        _ref('historique').set({ v: JSON.stringify(d) });
      },
    };

    function _listen(key, onData) {
      _ref(key).onSnapshot(snap => {
        if (!snap.exists || snap.metadata.hasPendingWrites) return;
        try { onData(JSON.parse(snap.data().v)); } catch(e) {}
      }, err => console.warn('[FB] Listen', key, err.code));
    }

    _listen('historique', v => { historique = v; if (document.getElementById('tab-historique').classList.contains('active')) renderHistorique(); });

    console.log('[Firebase] Synchronisation active');
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
    renderAuthBar('signed-in', user.email === 'lauriecordedda@gmail.com' ? 'Elle' : 'Lui');
    enableFirestoreSync();
  });

})();