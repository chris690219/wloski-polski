/* =========================================================================
 * Narzędzia, sprawdzanie odpowiedzi, zapis stanu, powtórki (SRS), dźwięk
 * ========================================================================= */

/* ---------- drobne narzędzia ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function todayStr(d = new Date()) {
  const z = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}
function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return todayStr(d);
}
function daysBetween(a, b) {
  return Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);
}

/* ---------- warianty odpowiedzi ---------- */
/** Pierwszy (główny) wariant tekstu: "dzisiaj/dziś" → "dzisiaj" */
const mainVariant = s => s.split('/')[0].trim();
/** Wszystkie warianty, z rozwinięciem nawiasów opcjonalnych: "(io) sono" → ["io sono","sono"] */
function variants(s) {
  const out = [];
  for (const part of s.split('/')) {
    const p = part.trim();
    if (!p) continue;
    if (/\(.*\)/.test(p)) {
      out.push(p.replace(/[()]/g, '').replace(/\s+/g, ' ').trim());
      out.push(p.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim());
    } else out.push(p);
  }
  return out;
}

/* ---------- normalizacja i porównywanie ---------- */
function normStrict(s) {
  return String(s).toLowerCase()
    .replace(/[’`´]/g, "'")
    .replace(/[.,!?¿¡;:"„”«»…()\-–—]/g, ' ')
    .replace(/'/g, "' ")
    .replace(/\s+/g, ' ')
    .replace(/' /g, "'")
    .trim();
}
/** Bez znaków diakrytycznych (włoskich i polskich) i bez apostrofów. */
function normLoose(s) {
  return normStrict(s)
    .replace(/ł/g, 'l')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/'/g, '');
}
const ARTICLE_RE = /^(il|lo|la|i|gli|le|un|uno|una|l'|un')\s*/;
const stripArticle = s => s.replace(ARTICLE_RE, '');

function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

/**
 * Sprawdza wpisaną odpowiedź.
 * @param {string} input   – co wpisał użytkownik
 * @param {string[]} targets – poprawne odpowiedzi (mogą zawierać warianty "a/b")
 * @param {object} opt     – { italian: bool } – czy odpowiedź jest po włosku (rodzajniki)
 * @returns {{ok:boolean, note?:string, matched?:string}}
 */
function checkAnswer(input, targets, opt = {}) {
  const user = normStrict(input);
  if (!user) return { ok: false };
  const all = targets.flatMap(variants);
  // 1. dokładnie
  for (const t of all) if (normStrict(t) === user) return { ok: true, matched: t };
  // 2. bez akcentów / polskich znaków
  const ul = normLoose(input);
  for (const t of all) {
    if (normLoose(t) === ul) {
      return { ok: true, matched: t, note: opt.italian ? `Uwaga na akcenty: <b>${esc(t)}</b>` : `Uwaga na polskie znaki: <b>${esc(t)}</b>` };
    }
  }
  // 3. bez rodzajnika (tylko po włosku)
  if (opt.italian) {
    for (const t of all) {
      const tl = normLoose(t);
      if (ARTICLE_RE.test(tl) && stripArticle(tl) === stripArticle(ul)) {
        const accentsOk = stripArticle(normStrict(t)) === stripArticle(user);
        return { ok: true, matched: t, note: `Pamiętaj o rodzajniku${accentsOk ? '' : ' i akcentach'}: <b>${esc(t)}</b>` };
      }
    }
  }
  // 4. literówka
  for (const t of all) {
    const tl = normLoose(t);
    const d = levenshtein(ul, tl);
    const allowed = tl.length >= 8 ? 2 : tl.length >= 4 ? 1 : 0;
    if (d <= allowed) return { ok: true, matched: t, note: `Literówka – poprawnie: <b>${esc(t)}</b>` };
  }
  return { ok: false };
}

/* =========================================================================
 * STAN APLIKACJI
 * Cały stan to jeden obiekt JSON. Dziś trzymamy go w localStorage; w przyszłości
 * wystarczy podmienić `Storage.adapter`, aby synchronizować z serwerem (konta).
 * ========================================================================= */
const STORAGE_KEY = 'wp_state_v1';

const LocalAdapter = {
  load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
  },
  save(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { console.warn('Zapis nieudany', e); }
  },
};

function defaultState() {
  return {
    version: 1,
    created: todayStr(),
    xp: 0,
    daily: {},                       // { 'YYYY-MM-DD': xp }
    streak: { count: 0, last: null, best: 0 },
    lessons: {},                     // { lessonId: { done: n, best: 0..100 } }
    items: {},                       // { key: { box, due, right, wrong, last } }
    myWords: [],                     // [{ id, it, pl, cat }]
    answers: { right: 0, wrong: 0 },
    settings: { goal: 20, sound: true, autoplay: true, rate: 0.9, unlockAll: false, theme: 'auto', speak: true, unlockGranted: false },
    migratedClassic: false,
    deletedWords: [],                // id usuniętych własnych słów (dla synchronizacji)
    updatedAt: 0,                    // ms – ostatnia zmiana stanu
    resetAt: 0,                      // ms – ostatnie wyzerowanie / wczytanie kopii
  };
}

const Storage = {
  adapter: LocalAdapter,
  state: null,
  _timer: null,
  load() {
    const saved = this.adapter.load();
    const base = defaultState();
    this.state = saved ? { ...base, ...saved, settings: { ...base.settings, ...(saved.settings || {}) }, streak: { ...base.streak, ...(saved.streak || {}) } } : base;
    return this.state;
  },
  /** Zapis po zmianie przez użytkownika: oznacza czas zmiany i zleca synchronizację. */
  save() {
    this.state.updatedAt = Date.now();
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.adapter.save(this.state), 150);
    if (typeof Sync !== 'undefined') Sync.schedule();
  },
  saveNow() {
    this.state.updatedAt = Date.now();
    clearTimeout(this._timer);
    this.adapter.save(this.state);
    if (typeof Sync !== 'undefined') Sync.schedule();
  },
  /** Zapis lokalny bez oznaczania zmiany (np. po scaleniu z chmurą). */
  persistLocal() {
    clearTimeout(this._timer);
    this.adapter.save(this.state);
  },
  /** Podmienia stan „w miejscu”, żeby istniejące referencje nadal działały. */
  assign(newState) {
    const base = defaultState();
    const next = { ...base, ...newState, settings: { ...base.settings, ...(newState.settings || {}) }, streak: { ...base.streak, ...(newState.streak || {}) } };
    for (const k of Object.keys(this.state)) delete this.state[k];
    Object.assign(this.state, next);
  },
  /** Zastąpienie całego postępu (wyzerowanie, wczytanie kopii) – wygrywa także z danymi w chmurze. */
  replace(newState) {
    this.assign(newState);
    this.state.resetAt = Date.now();
    this.saveNow();
  },
};

/** Import słówek z poprzedniej („klasycznej”) wersji aplikacji – ta sama domena = ten sam localStorage. */
function migrateClassic(force = false) {
  const S = Storage.state;
  if (S.migratedClassic && !force) return 0;
  S.migratedClassic = true;
  let added = 0;
  try {
    const raw = localStorage.getItem('itpl_words');
    if (raw) {
      const words = JSON.parse(raw);
      added = addMyWords(words.map(w => ({ it: w.it, pl: w.pl, cat: w.cat || '' })));
    }
  } catch (e) { console.warn(e); }
  Storage.save();
  return added;
}

function addMyWords(list) {
  const S = Storage.state;
  const existing = new Set(S.myWords.map(w => normLoose(w.it) + '|' + normLoose(w.pl)));
  let n = 0;
  for (const w of list) {
    const it = (w.it || '').trim(), pl = (w.pl || '').trim();
    if (!it || !pl) continue;
    const k = normLoose(it) + '|' + normLoose(pl);
    if (existing.has(k)) continue;
    existing.add(k);
    S.myWords.push({ id: uid(), it, pl, cat: (w.cat || '').trim(), t: Date.now() });
    n++;
  }
  Storage.save();
  return n;
}

/* ---------- XP, seria dni ---------- */
function addXP(n) {
  const S = Storage.state;
  const t = todayStr();
  S.xp += n;
  S.daily[t] = (S.daily[t] || 0) + n;
  // seria
  if (S.streak.last !== t) {
    const gap = S.streak.last ? daysBetween(S.streak.last, t) : 999;
    S.streak.count = gap === 1 ? S.streak.count + 1 : 1;
    S.streak.last = t;
    S.streak.best = Math.max(S.streak.best || 0, S.streak.count);
  }
  Storage.save();
}
/** Seria wyświetlana – wygasa, jeśli wczoraj nic nie zrobiono. */
function currentStreak() {
  const S = Storage.state;
  if (!S.streak.last) return 0;
  const gap = daysBetween(S.streak.last, todayStr());
  return gap <= 1 ? S.streak.count : 0;
}
const todayXP = () => Storage.state.daily[todayStr()] || 0;

/* =========================================================================
 * POWTÓRKI – system Leitnera
 * Pudełko 0 = nowe; każda poprawna odpowiedź przesuwa słowo dalej,
 * błąd – z powrotem do pudełka 1 (powtórka jeszcze dziś).
 * ========================================================================= */
const SRS_INTERVALS = [0, 1, 2, 4, 8, 16, 32, 64]; // dni
const SRS_MAX = SRS_INTERVALS.length - 1;

function srsUpdate(key, correct) {
  const S = Storage.state;
  const r = S.items[key] || { box: 0, due: todayStr(), right: 0, wrong: 0 };
  if (correct) {
    r.box = Math.min(r.box + 1, SRS_MAX);
    r.right++;
  } else {
    r.box = 1;
    r.wrong++;
    r.lastWrong = todayStr();
  }
  r.due = addDays(todayStr(), correct ? SRS_INTERVALS[r.box] : 0);
  r.last = todayStr();
  r.t = Date.now();
  S.items[key] = r;
}

/** Siła słowa 0..1 (do wyświetlania pasków). */
function strength(key) {
  const r = Storage.state.items[key];
  if (!r) return 0;
  const overdue = Math.max(0, daysBetween(r.due, todayStr()));
  return Math.max(0.1, Math.min(1, r.box / 5) - overdue * 0.05);
}

/** Wszystkie elementy do nauki (słowa z kursu, zdania, własne słowa) po kluczu. */
function itemByKey(key) {
  if (key.startsWith('m:')) {
    const w = Storage.state.myWords.find(x => 'm:' + x.id === key);
    return w ? { it: w.it, pl: w.pl, key, mine: true, cat: w.cat } : null;
  }
  if (key.startsWith('s:')) return ALL_SENTENCES.find(s => s.key === key) || null;
  return ALL_COURSE_WORDS.find(w => w.key === key) || null;
}
const myWordItems = () => Storage.state.myWords.map(w => ({ it: w.it, pl: w.pl, key: 'm:' + w.id, mine: true, cat: w.cat }));

function dueItems() {
  const S = Storage.state, t = todayStr();
  return Object.entries(S.items)
    .filter(([, r]) => r.box > 0 && r.due <= t)
    .sort((a, b) => a[1].due.localeCompare(b[1].due) || a[1].box - b[1].box)
    .map(([k]) => itemByKey(k))
    .filter(Boolean);
}
function mistakeItems() {
  const S = Storage.state;
  return Object.entries(S.items)
    .filter(([, r]) => r.wrong > 0)
    .sort((a, b) => (b[1].wrong - b[1].right * 0.5) - (a[1].wrong - a[1].right * 0.5) || b[1].wrong - a[1].wrong)
    .map(([k, r]) => ({ item: itemByKey(k), rec: r }))
    .filter(x => x.item);
}
const learnedCount = () => Object.entries(Storage.state.items).filter(([k, r]) => !k.startsWith('s:') && r.box > 0).length;

/* ---------- postęp kursu ---------- */
const lessonDone = id => (Storage.state.lessons[id]?.done || 0) > 0;
function lessonUnlocked(lesson) {
  if (Storage.state.settings.unlockAll && Storage.state.settings.unlockGranted) return true;
  const i = ALL_LESSONS.indexOf(lesson);
  return i === 0 || lessonDone(ALL_LESSONS[i - 1].id);
}
/** Skrót kodu dostępu (cyrb53) – w bazie uczeń widzi tylko skrót swojego kodu, nie sam kod. */
function codeHash(str) {
  str = String(str).trim().toUpperCase();
  let h1 = 0xdeadbeef ^ 7, h2 = 0x41c6ce57 ^ 7;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}

const currentLesson = () => ALL_LESSONS.find(l => !lessonDone(l.id)) || null;

/* =========================================================================
 * MOWA (synteza) i efekty dźwiękowe
 * ========================================================================= */
const Speech = {
  supported: 'speechSynthesis' in window,
  voice: null,
  init() {
    if (!this.supported) return;
    const pickVoice = () => {
      const voices = speechSynthesis.getVoices();
      const it = voices.filter(v => /^it([-_]|$)/i.test(v.lang));
      // preferuj głosy „naturalne”/Google, potem lokalne
      this.voice = it.find(v => /natural|google|enhanced|premium/i.test(v.name)) || it.find(v => v.localService) || it[0] || null;
    };
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  },
  speak(text, rate) {
    if (!this.supported || !text) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/\//g, ', '));
      u.lang = 'it-IT';
      if (this.voice) u.voice = this.voice;
      u.rate = rate ?? Storage.state.settings.rate ?? 0.9;
      speechSynthesis.speak(u);
    } catch (e) { console.warn(e); }
  },
};

/* ---------- rozpoznawanie mowy (ćwiczenia mówienia) ---------- */
const Recog = {
  Ctor: window.SpeechRecognition || window.webkitSpeechRecognition || null,
  get supported() { return !!this.Ctor; },
  /** Ćwiczenia mówienia są włączone i nie wyciszone („Nie mogę teraz mówić”). */
  get enabled() {
    if (!this.supported || !Storage.state.settings.speak) return false;
    let until = 0;
    try { until = +localStorage.getItem('wp_speak_mute') || 0; } catch { /* brak */ }
    return Date.now() > until;
  },
  muteFor(minutes) {
    try { localStorage.setItem('wp_speak_mute', String(Date.now() + minutes * 60000)); } catch { /* brak */ }
  },
  /** Start nasłuchu; zwraca obiekt z metodą stop(). */
  listen({ onInterim, onFinal, onError, onEnd }) {
    const r = new this.Ctor();
    r.lang = 'it-IT';
    r.interimResults = true;
    r.maxAlternatives = 5;
    r.continuous = false;
    let done = false;
    r.onresult = e => {
      const res = e.results[e.results.length - 1];
      const alts = [...res].map(a => a.transcript.trim()).filter(Boolean);
      if (done) return;
      if (res.isFinal) { done = true; clearTimeout(guard); onFinal?.(alts); } else onInterim?.(alts[0] || '');
    };
    // zabezpieczenie: jeśli przeglądarka nic nie zgłosi, kończymy po 10 s
    const guard = setTimeout(() => { if (!done) { done = true; try { r.abort(); } catch { /* */ } onError?.('no-speech'); } }, 10000);
    r.onerror = e => { clearTimeout(guard); if (done) return; done = true; onError?.(e.error || 'error'); };
    r.onend = () => { clearTimeout(guard); if (!done) { done = true; onError?.('no-speech'); } onEnd?.(); };
    try { r.start(); } catch (e) { clearTimeout(guard); done = true; onError?.('start'); }
    return { stop: () => { done = true; clearTimeout(guard); try { r.abort(); } catch { /* już zatrzymane */ } } };
  },
};

/** Podobieństwo wypowiedzi do wzorca 0..1 (bez akcentów, rodzajników, interpunkcji; cyfry → słowa). */
const NUM_WORDS = { 0: 'zero', 1: 'uno', 2: 'due', 3: 'tre', 4: 'quattro', 5: 'cinque', 6: 'sei', 7: 'sette', 8: 'otto', 9: 'nove', 10: 'dieci', 20: 'venti', 30: 'trenta', 50: 'cinquanta', 100: 'cento', 1000: 'mille' };
function speechSimilarity(heard, target) {
  const prep = s => normLoose(String(s).replace(/\d+/g, n => NUM_WORDS[+n] ?? n)).replace(/\s+/g, ' ').trim();
  const h = prep(heard);
  let best = 0;
  for (const v of variants(target)) {
    const t = prep(v);
    for (const [a, b] of [[h, t], [stripArticle(h), stripArticle(t)]]) {
      if (!a || !b) continue;
      const sim = 1 - levenshtein(a, b) / Math.max(a.length, b.length);
      best = Math.max(best, sim);
    }
  }
  return best;
}

const Sfx = {
  ctx: null,
  play(kind) {
    if (!Storage.state.settings.sound) return;
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = { ok: [[660, 0], [880, 0.09]], bad: [[220, 0], [180, 0.12]], done: [[523, 0], [659, 0.1], [784, 0.2], [1047, 0.3]] }[kind] || [];
      const t0 = this.ctx.currentTime;
      for (const [f, dt] of notes) {
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = kind === 'bad' ? 'square' : 'sine';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t0 + dt);
        g.gain.exponentialRampToValueAtTime(kind === 'bad' ? 0.05 : 0.15, t0 + dt + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dt + 0.18);
        o.connect(g).connect(this.ctx.destination);
        o.start(t0 + dt);
        o.stop(t0 + dt + 0.2);
      }
    } catch { /* brak audio */ }
  },
};

/* ---------- pliki: pobieranie / CSV ---------- */
async function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  try {
    if (navigator.canShare && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
      const file = new File([blob], filename, { type });
      if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: filename }); return; }
    }
  } catch (e) { if (e.name === 'AbortError') return; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
function csvEscape(f) {
  const s = String(f ?? '');
  return /[",\r\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function parseCSV(text) {
  text = text.replace(/^﻿/, '');
  const firstLine = text.split(/\r?\n/)[0] || '';
  const delim = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';'
    : firstLine.includes('\t') && !firstLine.includes(',') ? '\t' : ',';
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === delim) { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.some(x => x.trim()));
}
