/* =========================================================================
 * KONTA I SYNCHRONIZACJA (Firebase)
 *
 * Aplikacja działa „najpierw lokalnie”: wszystko zapisuje się w przeglądarce,
 * a po zalogowaniu stan jest dodatkowo scalany z kopią w chmurze (Firestore).
 * Logowanie: konto Google albo link z e-maila (bez hasła).
 * Konfiguracja: js/config.js. Biblioteka Firebase ładuje się dopiero wtedy,
 * gdy konfiguracja jest uzupełniona – bez niej aplikacja działa jak dotąd.
 * ========================================================================= */

/* ---------- scalanie stanów z dwóch urządzeń ---------- */

/** Seria liczona z historii dziennego XP (dni z rzędu kończące się ostatnim aktywnym dniem). */
function streakFromDaily(daily) {
  const days = Object.keys(daily).filter(d => daily[d] > 0).sort();
  if (!days.length) return { count: 0, last: null };
  const last = days[days.length - 1];
  const set = new Set(days);
  let count = 0, d = last;
  while (set.has(d)) { count++; d = addDays(d, -1); }
  return { count, last };
}

/**
 * Scala dwa stany tak, by nic nie przepadło:
 * - XP dzienne: maksimum dla każdego dnia, seria liczona od nowa,
 * - lekcje: maksimum ukończeń i najlepszego wyniku,
 * - słowa (powtórki): nowszy zapis wygrywa,
 * - własne słówka: suma, z uwzględnieniem usuniętych i edytowanych,
 * - ustawienia: z nowszego stanu.
 * Jeśli jedna strona została wyzerowana (lub wczytano kopię) po ostatniej
 * zmianie drugiej, postęp drugiej strony jest pomijany.
 */
function mergeStates(a, b) {
  if (!b) return a;
  if (!a) return b;
  const base = defaultState();
  const newer = (a.updatedAt || 0) >= (b.updatedAt || 0) ? a : b;
  // wyzerowanie po stronie, która jest „świeższa” od ostatniej zmiany drugiej
  if ((a.resetAt || 0) > (b.updatedAt || 0)) b = { ...b, daily: {}, lessons: {}, items: {}, xp: 0, answers: { right: 0, wrong: 0 }, streak: {} };
  else if ((b.resetAt || 0) > (a.updatedAt || 0)) a = { ...a, daily: {}, lessons: {}, items: {}, xp: 0, answers: { right: 0, wrong: 0 }, streak: {} };

  const out = { ...base, ...newer, settings: { ...base.settings, ...(newer.settings || {}) } };

  const daily = { ...(a.daily || {}) };
  for (const [d, v] of Object.entries(b.daily || {})) daily[d] = Math.max(daily[d] || 0, v);
  out.daily = daily;
  const sum = Object.values(daily).reduce((s, v) => s + v, 0);
  out.xp = Math.max(a.xp || 0, b.xp || 0, sum);

  const st = streakFromDaily(daily);
  out.streak = { count: st.count, last: st.last, best: Math.max(a.streak?.best || 0, b.streak?.best || 0, st.count) };

  const lessons = { ...(a.lessons || {}) };
  for (const [id, r] of Object.entries(b.lessons || {})) {
    const l = lessons[id];
    lessons[id] = l ? { done: Math.max(l.done, r.done), best: Math.max(l.best, r.best) } : r;
  }
  out.lessons = lessons;

  const items = { ...(a.items || {}) };
  for (const [k, r] of Object.entries(b.items || {})) {
    const l = items[k];
    if (!l) { items[k] = r; continue; }
    const lt = l.t || 0, rt = r.t || 0;
    if (rt > lt || (rt === lt && r.right + r.wrong > l.right + l.wrong)) items[k] = r;
  }
  out.items = items;

  out.answers = {
    right: Math.max(a.answers?.right || 0, b.answers?.right || 0),
    wrong: Math.max(a.answers?.wrong || 0, b.answers?.wrong || 0),
  };

  const deleted = [...new Set([...(a.deletedWords || []), ...(b.deletedWords || [])])].slice(-2000);
  const gone = new Set(deleted);
  const words = new Map();
  for (const w of [...(a.myWords || []), ...(b.myWords || [])]) {
    if (gone.has(w.id)) continue;
    const prev = words.get(w.id);
    if (!prev || (w.t || 0) > (prev.t || 0)) words.set(w.id, w);
  }
  out.myWords = [...words.values()];
  out.deletedWords = deleted;

  out.migratedClassic = !!(a.migratedClassic || b.migratedClassic);
  out.updatedAt = Math.max(a.updatedAt || 0, b.updatedAt || 0);
  out.resetAt = Math.max(a.resetAt || 0, b.resetAt || 0);
  return out;
}

/* ---------- połączenie z Firebase ---------- */
const FIREBASE_VER = '10.12.2';
const EMAIL_KEY = 'wp_signin_email';

/**
 * Warstwa serwera. Ukrywa szczegóły Firebase za kilkoma metodami,
 * więc w testach (lub przy zmianie dostawcy) wystarczy podmienić ten obiekt.
 */
const FirebaseBackend = {
  async init(cfg, onUser) {
    const base = `https://www.gstatic.com/firebasejs/${FIREBASE_VER}/`;
    const [appMod, authMod, fsMod] = await Promise.all([
      import(base + 'firebase-app.js'), import(base + 'firebase-auth.js'), import(base + 'firebase-firestore.js'),
    ]);
    this.a = authMod; this.f = fsMod;
    const app = appMod.initializeApp(cfg);
    this.auth = authMod.getAuth(app);
    this.auth.languageCode = 'pl';
    this.db = fsMod.getFirestore(app);
    await authMod.setPersistence(this.auth, authMod.browserLocalPersistence).catch(() => {});
    // powrót z linku logowania z e-maila
    if (authMod.isSignInWithEmailLink(this.auth, location.href)) {
      let email = '';
      try { email = localStorage.getItem(EMAIL_KEY) || ''; } catch { /* brak */ }
      if (!email) email = prompt('Podaj adres e-mail, na który wysłano link logowania:') || '';
      const clean = location.origin + location.pathname + '#profil';
      try {
        if (email) await authMod.signInWithEmailLink(this.auth, email, location.href);
        try { localStorage.removeItem(EMAIL_KEY); } catch { /* brak */ }
        toast('Zalogowano ✔');
      } catch (e) { toast('Logowanie nieudane: ' + esc(friendlyAuthError(e))); }
      history.replaceState(null, '', clean);
    }
    authMod.onAuthStateChanged(this.auth, u => onUser(u ? { id: u.uid, email: u.email || u.displayName || '' } : null));
  },
  async signInGoogle() {
    const provider = new this.a.GoogleAuthProvider();
    try {
      await this.a.signInWithPopup(this.auth, provider);
    } catch (e) {
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') {
        await this.a.signInWithRedirect(this.auth, provider);
      } else throw e;
    }
  },
  async sendLink(email) {
    await this.a.sendSignInLinkToEmail(this.auth, email, { url: location.origin + location.pathname, handleCodeInApp: true });
    try { localStorage.setItem(EMAIL_KEY, email); } catch { /* brak */ }
  },
  async signOut() { await this.a.signOut(this.auth); },
  async load(uid) {
    const snap = await this.f.getDoc(this.f.doc(this.db, 'progress', uid));
    if (!snap.exists()) return null;
    const d = snap.data();
    return typeof d.state === 'string' ? JSON.parse(d.state) : d.state || null;
  },
  async save(uid, state) {
    // stan zapisujemy jako tekst JSON – prosto i bez ograniczeń nazw pól Firestore
    await this.f.setDoc(this.f.doc(this.db, 'progress', uid), {
      state: JSON.stringify(state), updatedAt: this.f.serverTimestamp(), app: 'wloski-polski', v: 1,
    });
  },
};

function friendlyAuthError(e) {
  const map = {
    'auth/popup-closed-by-user': 'okno logowania zostało zamknięte',
    'auth/cancelled-popup-request': 'anulowano',
    'auth/invalid-email': 'nieprawidłowy adres e-mail',
    'auth/invalid-action-code': 'link wygasł lub został już użyty',
    'auth/expired-action-code': 'link wygasł',
    'auth/unauthorized-domain': 'ta domena nie jest dodana w ustawieniach Firebase (Authorized domains)',
    'auth/operation-not-allowed': 'ta metoda logowania nie jest włączona w Firebase',
    'auth/network-request-failed': 'brak połączenia z internetem',
    'auth/too-many-requests': 'zbyt wiele prób – spróbuj później',
    'permission-denied': 'brak uprawnień – sprawdź reguły Firestore',
    'auth/api-key-invalid': 'nieprawidłowa konfiguracja Firebase (apiKey w js/config.js)',
    'auth/invalid-api-key': 'nieprawidłowa konfiguracja Firebase (apiKey w js/config.js)',
    'auth/internal-error': 'błąd serwera logowania – sprawdź konfigurację Firebase',
  };
  return map[e?.code] || e?.message || String(e);
}

/* ---------- synchronizacja ---------- */
const Sync = {
  cfg: (window.WP_CONFIG || {}).firebase || {},
  backend: window.WP_TEST_BACKEND || FirebaseBackend, // w testach można podstawić atrapę
  user: null,
  ready: false,
  status: 'idle',        // idle | syncing | ok | error | offline
  error: '',
  lastSync: 0,
  _timer: null,
  _busy: false,
  _again: false,

  get enabled() { return !!(this.cfg.apiKey && this.cfg.projectId); },
  get loggedIn() { return !!this.user; },
  get email() { return this.user?.email || ''; },

  async init() {
    if (!this.enabled) return;
    window.addEventListener('online', () => (this.connected ? this.sync() : this.connect()));
    window.addEventListener('offline', () => { this.status = 'offline'; this.onChange(); });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') this.sync(); });
    await this.connect();
  },

  /** Ładuje Firebase i nasłuchuje logowania; przy braku sieci ponawia po odzyskaniu połączenia. */
  async connect() {
    if (this.connected || this._connecting) return;
    this._connecting = true;
    try {
      await this.backend.init(this.cfg, user => {
        const was = this.user?.id;
        this.user = user;
        this.ready = true;
        if (!user) this.status = 'idle';
        this.onChange();
        if (user && user.id !== was) this.sync();
      });
      this.connected = true;
    } catch (e) {
      console.warn('Firebase niedostępny', e);
      this.status = navigator.onLine ? 'error' : 'offline';
      this.error = navigator.onLine ? 'Nie udało się połączyć z serwerem.' : '';
      this.ready = true;
      this.onChange();
    } finally {
      this._connecting = false;
    }
  },

  onChange() { if (typeof onSyncChange === 'function') onSyncChange(); },

  async signInGoogle() {
    if (!this.connected) return toast('Brak połączenia z serwerem – sprawdź internet.');
    try { await this.backend.signInGoogle(); } catch (e) { toast('Logowanie nieudane: ' + esc(friendlyAuthError(e))); }
  },
  async sendLink(email) {
    if (!this.connected) throw new Error('brak połączenia z serwerem – sprawdź internet');
    await this.backend.sendLink(email);
  },
  async logout() {
    try { await this.backend.signOut(); } catch { /* i tak czyścimy */ }
    this.user = null;
    this.status = 'idle';
    this.onChange();
  },

  schedule(delay = 2500) {
    if (!this.enabled || !this.user) return;
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.sync(), delay);
  },

  /** Pobierz z chmury → scal z lokalnym → zapisz lokalnie i w chmurze. */
  async sync() {
    if (!this.enabled || !this.user) return;
    if (!navigator.onLine) { this.status = 'offline'; this.onChange(); return; }
    if (this._busy) { this._again = true; return; }
    // nie przeszkadzaj w trakcie lekcji – zsynchronizuj po jej zakończeniu
    if (document.body.classList.contains('in-lesson')) { this.schedule(5000); return; }
    this._busy = true;
    this.status = 'syncing';
    this.onChange();
    try {
      const uid = this.user.id;
      const remote = await this.backend.load(uid);
      const before = JSON.stringify(Storage.state);
      Storage.assign(mergeStates(Storage.state, remote));
      Storage.persistLocal();
      await this.backend.save(uid, Storage.state);
      this.status = 'ok';
      this.error = '';
      this.lastSync = Date.now();
      if (JSON.stringify(Storage.state) !== before && typeof onSyncDataChanged === 'function') onSyncDataChanged();
    } catch (e) {
      console.warn('Synchronizacja nieudana', e);
      this.status = 'error';
      this.error = friendlyAuthError(e);
    } finally {
      this._busy = false;
      this.onChange();
      if (this._again) { this._again = false; this.schedule(500); }
    }
  },
};
