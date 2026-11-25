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
    authMod.onAuthStateChanged(this.auth, u => onUser(u ? { id: u.uid, email: u.email || u.displayName || '', name: u.displayName || '' } : null));
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

  /* ----- prośby o kod odblokowujący ----- */
  _date(v) { return v?.toMillis ? v.toMillis() : v || 0; },
  _req(snap) {
    const d = snap.data();
    return { ...d, createdAt: this._date(d.createdAt), decidedAt: this._date(d.decidedAt), redeemedAt: this._date(d.redeemedAt) };
  },
  async getRequest(uid) {
    const snap = await this.f.getDoc(this.f.doc(this.db, 'unlockRequests', uid));
    return snap.exists() ? this._req(snap) : null;
  },
  async createRequest(uid, { email, name, note }) {
    await this.f.setDoc(this.f.doc(this.db, 'unlockRequests', uid), {
      uid, email, name, note, status: 'pending', createdAt: this.f.serverTimestamp(),
    });
  },
  async markRedeemed(uid) {
    await this.f.updateDoc(this.f.doc(this.db, 'unlockRequests', uid), { redeemedAt: this.f.serverTimestamp() });
  },
  async isAdmin(uid) {
    try { return (await this.f.getDoc(this.f.doc(this.db, 'admins', uid))).exists(); } catch { return false; }
  },
  async listRequests() {
    const f = this.f;
    const [reqs, codes] = await Promise.all([
      f.getDocs(f.query(f.collection(this.db, 'unlockRequests'), f.orderBy('createdAt', 'desc'))),
      f.getDocs(f.collection(this.db, 'unlockCodes')),
    ]);
    const byUid = Object.fromEntries(codes.docs.map(d => [d.id, d.data().code]));
    return reqs.docs.map(d => ({ ...this._req(d), code: byUid[d.id] || '' }));
  },
  async decide(uid, approve, code, email) {
    const f = this.f, batch = f.writeBatch(this.db);
    const req = f.doc(this.db, 'unlockRequests', uid);
    if (approve) {
      // sam kod widzi tylko administrator; uczeń dostaje jego skrót do sprawdzenia
      batch.set(f.doc(this.db, 'unlockCodes', uid), { code, email, createdAt: f.serverTimestamp() });
      batch.update(req, { status: 'approved', codeHash: codeHash(code), decidedAt: f.serverTimestamp() });
    } else {
      batch.update(req, { status: 'rejected', decidedAt: f.serverTimestamp() });
    }
    await batch.commit();
  },
};

/** Losowy, czytelny kod: ITA-XXXX-XXXX (bez mylących znaków 0/O, 1/I/L). */
function generateUnlockCode() {
  const abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const s = [...bytes].map(b => abc[b % abc.length]).join('');
  return `ITA-${s.slice(0, 4)}-${s.slice(4)}`;
}

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
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return;
      this.sync();
      if (this.admin) this.refreshPending().then(() => this.onChange());
    });
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
        if (!user) { this.status = 'idle'; this.admin = false; this.pending = 0; }
        this.onChange();
        if (user && user.id !== was) { this.sync(); this.checkAdmin(); }
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
    this.admin = false;
    this.pending = 0;
    this.onChange();
  },

  /* ----- prośby o kod odblokowujący ----- */
  admin: false,
  pending: 0,

  /** Czy zalogowany użytkownik jest administratorem (dokument admins/{uid} w Firestore). */
  async checkAdmin() {
    if (!this.user) return;
    this.admin = await this.backend.isAdmin(this.user.id);
    if (this.admin) await this.refreshPending();
    this.onChange();
  },
  async refreshPending() {
    if (!this.admin) return [];
    try {
      const list = await this.backend.listRequests();
      this.pending = list.filter(r => r.status === 'pending').length;
      return list;
    } catch (e) { console.warn(e); return null; }
  },
  myRequest() { return this.backend.getRequest(this.user.id); },
  requestCode(note) {
    return this.backend.createRequest(this.user.id, { email: this.user.email || '', name: this.user.name || '', note: (note || '').slice(0, 500) });
  },
  /** Sprawdza osobisty kod ucznia; zwraca true, jeśli pasuje do zatwierdzonej prośby. */
  async redeem(code) {
    const req = await this.myRequest();
    if (!req || req.status !== 'approved' || req.codeHash !== codeHash(code)) return false;
    this.backend.markRedeemed(this.user.id).catch(e => console.warn(e));
    return true;
  },
  async decide(req, approve) {
    const code = approve ? generateUnlockCode() : '';
    await this.backend.decide(req.uid, approve, code, req.email);
    await this.refreshPending();
    this.onChange();
    return code;
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
