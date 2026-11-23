/* =========================================================================
 * Ekrany aplikacji: Nauka, Powtórki, Słówka, Profil
 * ========================================================================= */
const TABS = ['nauka', 'powtorki', 'slowka', 'profil'];

const App = {
  tab: 'nauka',
  wordsMode: 'moje',
  wordsQuery: '',
  practiceCat: '',

  init() {
    hideSplash();
    Storage.load();
    Speech.init();
    applyTheme();
    const migrated = migrateClassic();
    window.addEventListener('hashchange', () => this.route());
    $$('.tabbar a').forEach(a => a.addEventListener('click', () => Speech.supported && speechSynthesis.cancel()));
    $('#checkBtn').addEventListener('click', () => Session.primary());
    $('#skipBtn').addEventListener('click', () => Session.skip());
    $('#lessonClose').addEventListener('click', () => Session.close());
    $('#modal').addEventListener('click', e => { if (e.target.id === 'modal' || e.target.closest('[data-close]')) closeModal(); });
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-say]');
      if (b) { e.stopPropagation(); Speech.speak(b.dataset.say); }
    });
    document.addEventListener('keydown', onKey);
    this.route();
    Sync.init();
    if (migrated) toast(`Zaimportowano ${migrated} słówek z poprzedniej wersji 📥`);
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  },

  route() {
    const h = location.hash.replace('#', '');
    this.tab = TABS.includes(h) ? h : 'nauka';
    $$('.tabbar a').forEach(a => a.classList.toggle('active', a.dataset.tab === this.tab));
    this.render();
    window.scrollTo(0, 0);
  },

  render() {
    renderTopbar();
    const v = $('#view');
    v.innerHTML = Views[this.tab]();
    Views[this.tab + 'Bind']?.(v);
  },
};

/* ---------- pasek górny ---------- */
function renderTopbar() {
  const S = Storage.state;
  const streak = currentStreak();
  const doneToday = S.streak.last === todayStr();
  const pct = Math.min(100, Math.round(todayXP() / S.settings.goal * 100));
  $('#topStats').innerHTML = `
    <span class="chip ${doneToday ? 'fire' : 'cold'}" title="Seria dni nauki">🔥 ${streak}</span>
    <span class="chip xp" title="Punkty doświadczenia">⭐ ${S.xp}</span>
    <span class="ring" style="--p:${pct}" title="Dzienny cel: ${todayXP()}/${S.settings.goal} XP"><span>${pct >= 100 ? '✓' : '🎯'}</span></span>`;
}

/* ---------- ekran powitalny ---------- */
const SPLASH_MS = 3000;
function hideSplash() {
  const el = $('#splash');
  if (!el) return;
  const t0 = performance.timeOrigin ? Date.now() - performance.timeOrigin : 0;
  const go = () => { el.classList.add('gone'); setTimeout(() => el.remove(), 600); };
  setTimeout(go, Math.max(0, SPLASH_MS - t0));
  el.addEventListener('click', go); // dotknięcie pomija ekran
}

/* ---------- modal / toast ---------- */
function openModal(html) {
  $('#modalSheet').innerHTML = html;
  $('#modal').classList.remove('hidden');
  requestAnimationFrame(() => $('#modal').classList.add('open'));
}
function closeModal() {
  $('#modal').classList.remove('open');
  setTimeout(() => $('#modal').classList.add('hidden'), 200);
}
function toast(msg) {
  const t = $('#toast');
  t.innerHTML = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 2800);
}

function applyTheme() {
  const t = Storage.state.settings.theme;
  if (t === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
}

function onKey(e) {
  if ($('#lesson').classList.contains('hidden')) {
    if (e.key === 'Escape') closeModal();
    return;
  }
  const inField = e.target.matches('textarea, input');
  if (e.key === 'Escape') return Session.close();
  if (e.key === 'Enter' && !inField) { e.preventDefault(); return Session.primary(); }
  if (!inField && /^[1-9]$/.test(e.key)) {
    const opts = $$('#exBody .option');
    opts[+e.key - 1]?.click();
  }
}

/* ---------- uruchamianie sesji ---------- */
function startLesson(id) {
  const lesson = ALL_LESSONS.find(l => l.id === id);
  if (!lesson) return;
  closeModal();
  Session.open(buildLessonSession(lesson), { title: `${COURSE[lesson.unitIndex].title} · ${lesson.title}`, lessonId: id });
}
function startPractice(kind) {
  let items, title, hard = false;
  if (kind === 'due') { items = dueItems(); title = 'Powtórka dnia'; }
  else if (kind === 'mistakes') { items = mistakeItems().slice(0, 15).map(x => x.item); title = 'Ćwiczenie błędów'; hard = true; }
  else if (kind === 'weak') {
    items = Object.entries(Storage.state.items).filter(([, r]) => r.box > 0)
      .sort((a, b) => a[1].box - b[1].box || a[1].due.localeCompare(b[1].due))
      .map(([k]) => itemByKey(k)).filter(Boolean);
    items = shuffle(items.slice(0, 20));
    title = 'Trening najsłabszych słów';
  } else if (kind === 'listen') {
    items = shuffle(Object.keys(Storage.state.items).map(itemByKey).filter(Boolean)).slice(0, 10);
    title = 'Trening słuchu';
    const pool = distractorPool();
    const exs = items.map(it => makeExercise(it.sentence ? 'listenBuild' : 'listen', it, pool));
    if (!exs.length) return toast('Najpierw ukończ kilka lekcji.');
    return Session.open(exs, { title });
  } else if (kind === 'speak') {
    items = shuffle(Object.keys(Storage.state.items).map(itemByKey).filter(Boolean)).slice(0, 8);
    if (!items.length) return toast('Najpierw ukończ kilka lekcji.');
    if (!Recog.enabled) return toast(Recog.supported ? 'Ćwiczenia mówienia są wyłączone w ustawieniach lub wyciszone na 15 minut.' : 'Ta przeglądarka nie rozpoznaje mowy – spróbuj w Chrome lub Safari.');
    const pool = distractorPool();
    return Session.open(items.map(it => makeExercise('speak', it, pool)), { title: 'Trening mówienia' });
  } else if (kind === 'mine') {
    items = myWordItems().filter(w => !App.practiceCat || w.cat === App.practiceCat);
    // najpierw te, których jeszcze nie znasz
    items.sort((a, b) => (Storage.state.items[a.key]?.box || 0) - (Storage.state.items[b.key]?.box || 0) + (Math.random() - 0.5));
    title = App.practiceCat ? `Moje słówka · ${App.practiceCat}` : 'Moje słówka';
  }
  if (!items?.length) return toast('Brak słówek do ćwiczenia.');
  if (kind === 'mine' && items.length < 4) return toast('Dodaj co najmniej 4 słówka, aby ćwiczyć.');
  Session.open(buildPracticeSession(items, { hard }), { title });
}

/* =========================================================================
 * WIDOKI
 * ========================================================================= */
const Views = {
  /* ---------------- NAUKA ---------------- */
  nauka() {
    const S = Storage.state;
    const cur = currentLesson();
    const due = dueItems().length;
    const xpToday = todayXP();
    const goalPct = Math.min(100, xpToday / S.settings.goal * 100);
    let html = `
      <section class="hero card">
        <div class="hero-top">
          <div>
            <div class="eyebrow">Dzisiaj</div>
            <div class="hero-goal"><b>${xpToday}</b> / ${S.settings.goal} XP</div>
          </div>
          <div class="hero-flag" aria-hidden="true"><i></i><i></i><i></i></div>
        </div>
        <div class="goalbar"><div style="width:${goalPct}%"></div></div>
        <div class="hero-actions">
          ${cur ? `<button class="btn primary" data-start="${cur.id}">▶ ${S.xp === 0 ? 'Zacznij naukę' : 'Kontynuuj'}: ${esc(cur.title)}</button>`
                : `<div class="muted">🏁 Ukończono cały kurs! Utrwalaj słowa w powtórkach.</div>`}
          ${due ? `<a class="btn ghost" href="#powtorki">🔁 Powtórki: ${due}</a>` : ''}
        </div>
      </section>`;

    COURSE.forEach((u, ui) => {
      const done = u.lessons.filter(l => lessonDone(l.id)).length;
      const unlocked = lessonUnlocked(u.lessons[0]);
      html += `
        <section class="unit ${unlocked ? '' : 'locked'}" style="--uc:${u.color}">
          <header class="unit-head">
            <div>
              <div class="eyebrow">Jednostka ${ui + 1} · ${done}/${u.lessons.length}</div>
              <h2>${u.icon} ${esc(u.title)}</h2>
            </div>
            <button class="btn small light" data-tip="${ui}">📖 Wskazówki</button>
          </header>
          <div class="path">`;
      u.lessons.forEach((l, li) => {
        const isDone = lessonDone(l.id), isCur = cur && cur.id === l.id, open = lessonUnlocked(l);
        const offset = [0, 1, 0, -1][li % 4];
        const rec = S.lessons[l.id];
        html += `
            <div class="node-wrap ${isCur ? 'is-current' : ''}" style="--x:${offset}">
              <button class="node ${isDone ? 'done' : ''} ${isCur ? 'current' : ''} ${open ? '' : 'locked'}" data-lesson="${l.id}" aria-label="${esc(l.title)}">
                <span>${isDone ? (rec?.best === 100 ? '👑' : '✓') : open ? (isCur ? '★' : '▶') : '🔒'}</span>
              </button>
              ${isCur ? '<div class="node-start">START</div>' : ''}
              <div class="node-label">${esc(l.title)}</div>
            </div>`;
      });
      html += `</div></section>`;
    });
    return html;
  },
  naukaBind(v) {
    $$('[data-start]', v).forEach(b => b.addEventListener('click', () => startLesson(b.dataset.start)));
    $$('[data-tip]', v).forEach(b => b.addEventListener('click', () => {
      const u = COURSE[+b.dataset.tip];
      openModal(`<h2>${u.icon} ${esc(u.title)}</h2><div class="tip">${u.tip}</div>
        <button class="btn primary wide" data-close>Rozumiem</button>`);
    }));
    $$('[data-lesson]', v).forEach(b => b.addEventListener('click', () => {
      const l = ALL_LESSONS.find(x => x.id === b.dataset.lesson);
      const u = COURSE[l.unitIndex];
      const open = lessonUnlocked(l), rec = Storage.state.lessons[l.id];
      openModal(`
        <div class="eyebrow">${u.icon} ${esc(u.title)} · lekcja ${l.index + 1}</div>
        <h2>${esc(l.title)}</h2>
        ${rec ? `<p class="muted">Ukończono ${rec.done}× · najlepszy wynik ${rec.best}%</p>` : ''}
        ${open ? `<div class="wordchips">${l.words.map(w => `<span class="wchip"><b lang="it">${esc(mainVariant(w.it))}</b> ${rec ? esc(mainVariant(w.pl)) : ''}</span>`).join('')}</div>
          <button class="btn primary wide" data-go="${l.id}">${rec ? '🔁 Powtórz lekcję' : '▶ Zacznij lekcję'}</button>
          <button class="btn ghost wide" data-tipm="${u.index}">📖 Wskazówki do jednostki</button>`
               : `<p>🔒 Ukończ poprzednie lekcje, aby odblokować.</p>
          <button class="btn ghost wide" data-close>OK</button>`}`);
      $('[data-go]', $('#modalSheet'))?.addEventListener('click', () => startLesson(l.id));
      $('[data-tipm]', $('#modalSheet'))?.addEventListener('click', () =>
        openModal(`<h2>${u.icon} ${esc(u.title)}</h2><div class="tip">${u.tip}</div><button class="btn primary wide" data-close>Rozumiem</button>`));
    }));
    // przewiń do bieżącej lekcji
    const cur = $('.node.current', v);
    if (cur && Storage.state.xp > 0) setTimeout(() => cur.scrollIntoView({ block: 'center', behavior: 'smooth' }), 100);
  },

  /* ---------------- POWTÓRKI ---------------- */
  powtorki() {
    const due = dueItems();
    const S = Storage.state;
    const learned = Object.keys(S.items).length;
    const upcoming = Object.values(S.items).filter(r => r.box > 0 && r.due > todayStr()).map(r => r.due).sort()[0];
    const mistakes = mistakeItems();
    return `
      <h1 class="page-title">Powtórki</h1>
      <section class="card review-card">
        <div class="review-icon">🧠</div>
        <div class="grow">
          ${due.length ? `<h2>${due.length} ${plural(due.length, 'słowo czeka', 'słowa czekają', 'słów czeka')} na powtórkę</h2>
            <p class="muted">Powtarzaj wtedy, gdy zaczynasz zapominać – tak działa pamięć długotrwała.</p>`
          : learned ? `<h2>Wszystko powtórzone! ✨</h2><p class="muted">${upcoming ? `Następna powtórka: <b>${fmtDate(upcoming)}</b>.` : ''}</p>`
          : `<h2>Brak słów do powtórki</h2><p class="muted">Ukończ pierwszą lekcję – słowa trafią tutaj automatycznie.</p>`}
        </div>
      </section>
      ${due.length ? `<button class="btn primary wide" data-practice="due">▶ Powtórz teraz (${Math.min(due.length, 12)})</button>` : ''}
      <div class="grid2">
        <button class="card action" data-practice="weak" ${learned ? '' : 'disabled'}><span>💪</span><b>Najsłabsze słowa</b><small>Trening dowolny</small></button>
        <button class="card action" data-practice="listen" ${learned && Speech.supported ? '' : 'disabled'}><span>🎧</span><b>Trening słuchu</b><small>${Speech.supported ? 'Pisz, co słyszysz' : 'Przeglądarka nie obsługuje mowy'}</small></button>
        <button class="card action" data-practice="speak" ${learned && Recog.supported ? '' : 'disabled'}><span>🎤</span><b>Trening mówienia</b><small>${Recog.supported ? 'Mów po włosku' : 'Niedostępne w tej przeglądarce'}</small></button>
      </div>

      <h2 class="section-title">⚠️ Twoje błędy <span class="count">${mistakes.length}</span></h2>
      ${mistakes.length ? `
        <button class="btn danger-ghost wide" data-practice="mistakes">🔁 Ćwicz błędy</button>
        <ul class="list">${mistakes.slice(0, 40).map(({ item, rec }) => `
          <li class="row">
            ${speakBtn(item.it)}
            <div class="grow"><b lang="it">${esc(mainVariant(item.it))}</b><div class="muted small">${esc(mainVariant(item.pl))}</div></div>
            <span class="badge bad" title="Błędy">✘ ${rec.wrong}</span>
            <span class="badge ok" title="Poprawne">✔ ${rec.right}</span>
          </li>`).join('')}</ul>`
      : `<p class="muted empty">Brak błędów – tak trzymaj! 🎉</p>`}`;
  },
  powtorkiBind(v) {
    $$('[data-practice]', v).forEach(b => b.addEventListener('click', () => startPractice(b.dataset.practice)));
  },

  /* ---------------- SŁÓWKA ---------------- */
  slowka() {
    const mode = App.wordsMode;
    return `
      <h1 class="page-title">Słówka</h1>
      <div class="segmented">
        <button class="${mode === 'moje' ? 'on' : ''}" data-mode="moje">✏️ Moje słówka</button>
        <button class="${mode === 'kurs' ? 'on' : ''}" data-mode="kurs">📘 Słownik kursu</button>
      </div>
      ${mode === 'moje' ? myWordsView() : courseDictView()}`;
  },
  slowkaBind(v) {
    $$('[data-mode]', v).forEach(b => b.addEventListener('click', () => { App.wordsMode = b.dataset.mode; App.wordsQuery = ''; App.render(); }));
    const search = $('#wordSearch', v);
    if (search) search.addEventListener('input', () => {
      App.wordsQuery = search.value;
      $('#wordList').innerHTML = App.wordsMode === 'moje' ? myWordsList() : courseDictList();
      bindWordRows();
    });
    if (App.wordsMode === 'moje') bindMyWords(v);
    bindWordRows();
  },

  /* ---------------- PROFIL ---------------- */
  profil() {
    const S = Storage.state;
    const lessonsDone = ALL_LESSONS.filter(l => lessonDone(l.id)).length;
    const total = S.answers.right + S.answers.wrong;
    const acc = total ? Math.round(S.answers.right / total * 100) : 0;
    const st = S.settings;
    return `
      <h1 class="page-title">Profil</h1>
      <div class="stats">
        <div class="stat"><span>🔥</span><b>${currentStreak()}</b><small>dni z rzędu</small></div>
        <div class="stat"><span>🏅</span><b>${S.streak.best || 0}</b><small>najdłuższa seria</small></div>
        <div class="stat"><span>⭐</span><b>${S.xp}</b><small>XP łącznie</small></div>
        <div class="stat"><span>📚</span><b>${learnedCount()}</b><small>poznanych słów</small></div>
        <div class="stat"><span>✅</span><b>${lessonsDone}/${ALL_LESSONS.length}</b><small>lekcji</small></div>
        <div class="stat"><span>🎯</span><b>${acc}%</b><small>celność</small></div>
      </div>

      <section class="card">
        <h2 class="card-title">Ostatnie 7 dni</h2>
        ${weekChart()}
      </section>

      <section class="card settings">
        <h2 class="card-title">Ustawienia</h2>
        <div class="set-row">
          <label>Dzienny cel</label>
          <div class="pills">${[10, 20, 30, 50].map(g => `<button class="pill ${st.goal === g ? 'on' : ''}" data-goal="${g}">${g} XP</button>`).join('')}</div>
        </div>
        <div class="set-row"><label for="sSound">Efekty dźwiękowe</label><input type="checkbox" class="switch" id="sSound" ${st.sound ? 'checked' : ''}></div>
        <div class="set-row"><label for="sAuto">Automatycznie czytaj po włosku</label><input type="checkbox" class="switch" id="sAuto" ${st.autoplay ? 'checked' : ''}></div>
        <div class="set-row">
          <label for="sRate">Tempo mowy <span class="muted small" id="rateVal">${st.rate.toFixed(2)}×</span></label>
          <div class="inline"><input type="range" id="sRate" min="0.5" max="1.2" step="0.05" value="${st.rate}"><button class="btn small light" id="testVoice">🔊 Test</button></div>
        </div>
        ${Speech.supported ? '' : '<p class="warn">Ta przeglądarka nie obsługuje syntezy mowy – ćwiczenia ze słuchu zostaną pominięte.</p>'}
        <div class="set-row">
          <label>Motyw</label>
          <div class="pills">${[['auto', 'Auto'], ['light', 'Jasny'], ['dark', 'Ciemny']].map(([k, n]) => `<button class="pill ${st.theme === k ? 'on' : ''}" data-theme="${k}">${n}</button>`).join('')}</div>
        </div>
        <div class="set-row"><label for="sSpeak">Ćwiczenia mówienia 🎤<br><span class="muted small">${Recog.supported ? 'rozpoznawanie mowy w przeglądarce (wymaga internetu)' : 'niedostępne w tej przeglądarce – użyj Chrome lub Safari'}</span></label><input type="checkbox" class="switch" id="sSpeak" ${st.speak && Recog.supported ? 'checked' : ''} ${Recog.supported ? '' : 'disabled'}></div>
        <div class="set-row"><label for="sUnlock">Odblokuj wszystkie lekcje<br><span class="muted small">dla osób, które znają już podstawy</span></label><input type="checkbox" class="switch" id="sUnlock" ${st.unlockAll ? 'checked' : ''}></div>
      </section>

      ${accountCard()}

      <section class="card">
        <h2 class="card-title">Dane</h2>
        <p class="muted small">${Sync.loggedIn ? 'Postęp jest zapisany w tej przeglądarce i na Twoim koncie.' : 'Postęp jest zapisany tylko w tej przeglądarce. Zaloguj się albo zrób kopię, aby przenieść go na inne urządzenie.'}</p>
        <div class="btn-row">
          <button class="btn light" id="backupExport">💾 Zapisz kopię</button>
          <label class="btn light">📂 Wczytaj kopię<input type="file" id="backupImport" accept=".json,application/json" hidden></label>
        </div>
        <button class="btn danger-ghost wide" id="resetAll">🗑️ Wyzeruj postęp</button>
      </section>

      <p class="footer-note">
        <a href="klasyczna/">Poprzednia wersja aplikacji →</a><br>
        Włoski z Polskim · działa offline · v2
      </p>`;
  },
  profilBind(v) {
    const S = Storage.state;
    const set = (k, val) => { S.settings[k] = val; Storage.save(); };
    $$('[data-goal]', v).forEach(b => b.addEventListener('click', () => { set('goal', +b.dataset.goal); App.render(); }));
    $$('[data-theme]', v).forEach(b => b.addEventListener('click', () => { set('theme', b.dataset.theme); applyTheme(); App.render(); }));
    $('#sSound', v).addEventListener('change', e => set('sound', e.target.checked));
    $('#sAuto', v).addEventListener('change', e => set('autoplay', e.target.checked));
    $('#sUnlock', v).addEventListener('change', e => set('unlockAll', e.target.checked));
    $('#sSpeak', v).addEventListener('change', e => {
      set('speak', e.target.checked);
      if (e.target.checked) try { localStorage.removeItem('wp_speak_mute'); } catch { /* brak */ }
    });
    bindAccount(v);
    $('#sRate', v).addEventListener('input', e => { set('rate', +e.target.value); $('#rateVal').textContent = (+e.target.value).toFixed(2) + '×'; });
    $('#testVoice', v).addEventListener('click', () => Speech.speak('Ciao! Come stai? Benvenuto nel corso di italiano.'));
    $('#backupExport', v).addEventListener('click', () => {
      Storage.saveNow();
      downloadFile(`wloski-kopia-${todayStr()}.json`, JSON.stringify(Storage.state, null, 1), 'application/json');
    });
    $('#backupImport', v).addEventListener('change', async e => {
      const f = e.target.files[0];
      if (!f) return;
      try {
        const data = JSON.parse(await f.text());
        if (!data || typeof data !== 'object' || !('items' in data)) throw new Error('format');
        if (!confirm('Zastąpić obecny postęp danymi z kopii?')) return;
        Storage.replace(data);
        applyTheme();
        App.render();
        toast('Wczytano kopię ✔');
      } catch { toast('To nie jest poprawny plik kopii.'); }
    });
    $('#resetAll', v).addEventListener('click', () => {
      if (!confirm('Usunąć cały postęp (XP, serię, lekcje, powtórki)? Twoje słówka zostaną zachowane.')) return;
      const keep = { myWords: S.myWords, deletedWords: S.deletedWords, settings: S.settings, migratedClassic: true };
      Storage.replace({ ...defaultState(), ...keep });
      App.render();
      toast('Postęp wyzerowany.');
    });
  },
};

/* ---------- Konto i synchronizacja ---------- */
App.linkSentTo = '';

function accountCard() {
  if (!Sync.enabled) return '';
  let body;
  if (!Sync.ready) {
    body = `<p class="muted">Łączenie…</p>`;
  } else if (Sync.loggedIn) {
    const st = {
      syncing: '🔄 Synchronizuję…',
      ok: `✅ Zsynchronizowano ${Sync.lastSync ? new Date(Sync.lastSync).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) : ''}`,
      error: `⚠️ Błąd synchronizacji: ${esc(Sync.error)}`,
      offline: '📴 Brak internetu – zsynchronizuję po połączeniu',
      idle: '',
    }[Sync.status] || '';
    body = `
      <div class="account-row"><span class="avatar">${esc((Sync.email || '?')[0].toUpperCase())}</span>
        <div class="grow"><b>${esc(Sync.email)}</b><div class="muted small" id="syncStatus">${st}</div></div></div>
      <div class="btn-row">
        <button class="btn light small" id="syncNow">🔄 Synchronizuj teraz</button>
        <button class="btn ghost small" id="logout">Wyloguj</button>
      </div>`;
  } else if (App.linkSentTo) {
    body = `
      <p>📧 Wysłaliśmy link logowania na <b>${esc(App.linkSentTo)}</b>.</p>
      <p class="muted small">Otwórz e-mail <b>na tym urządzeniu</b> i kliknij link. Nie widzisz wiadomości? Sprawdź folder spam.</p>
      <button class="btn ghost small" id="changeEmail">Zmień adres e-mail</button>`;
  } else {
    body = `
      <p class="muted small">Zaloguj się, aby zapisywać postęp w chmurze i uczyć się na telefonie i komputerze. Twój obecny postęp zostanie zachowany.</p>
      <button class="btn light wide google-btn" id="googleLogin"><span class="g-logo" aria-hidden="true">G</span> Zaloguj przez Google</button>
      <div class="or"><span>lub link na e-mail</span></div>
      <form id="emailLogin" class="email-row">
        <input type="email" name="email" placeholder="twój@email.pl" required autocomplete="email">
        <button class="btn primary">Wyślij</button>
      </form>`;
  }
  return `<section class="card" id="accountCard"><h2 class="card-title">☁️ Konto i synchronizacja</h2>${body}</section>`;
}

function bindAccount(root) {
  $('#googleLogin', root)?.addEventListener('click', () => Sync.signInGoogle());
  $('#emailLogin', root)?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('button', e.target);
    const email = e.target.email.value.trim();
    btn.disabled = true;
    try {
      await Sync.sendLink(email);
      App.linkSentTo = email;
      App.render();
    } catch (err) {
      toast('Nie udało się wysłać: ' + esc(friendlyAuthError(err)));
      btn.disabled = false;
    }
  });
  $('#changeEmail', root)?.addEventListener('click', () => { App.linkSentTo = ''; App.render(); });
  $('#syncNow', root)?.addEventListener('click', () => Sync.sync());
  $('#logout', root)?.addEventListener('click', async () => {
    if (!confirm('Wylogować? Postęp zostanie na tym urządzeniu i na Twoim koncie.')) return;
    await Sync.logout();
    toast('Wylogowano.');
  });
}

/** Zmiana stanu logowania / synchronizacji → odśwież kartę konta (bez przebudowy całego ekranu). */
let wasLoggedIn = null;
function onSyncChange() {
  if (Sync.loggedIn) App.linkSentTo = '';
  const changed = wasLoggedIn !== null && wasLoggedIn !== Sync.loggedIn;
  wasLoggedIn = Sync.loggedIn;
  const card = $('#accountCard');
  if (!card || App.tab !== 'profil') return;
  const busy = card.contains(document.activeElement) && document.activeElement.matches('input');
  if (busy) return;
  if (changed && document.body.classList.contains('in-lesson') === false) { App.render(); return; }
  card.outerHTML = accountCard();
  bindAccount($('#accountCard').parentElement);
}
/** Dane zmieniły się po scaleniu z chmurą → odśwież widok, jeśli nic nie jest otwarte. */
function onSyncDataChanged() {
  applyTheme();
  if (document.body.classList.contains('in-lesson') || !$('#modal').classList.contains('hidden')) return;
  if (document.activeElement?.matches('input, textarea, select')) { renderTopbar(); return; }
  App.render();
}

/* ---------- Słówka: moje ---------- */
function myCategories() {
  return [...new Set(Storage.state.myWords.map(w => w.cat).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pl'));
}
function myWordsView() {
  const cats = myCategories();
  const n = Storage.state.myWords.length;
  return `
    <section class="card">
      <h2 class="card-title">Dodaj słówko</h2>
      <form id="addWord" class="addform" autocomplete="off">
        <input name="it" placeholder="po włosku" lang="it" required>
        <input name="pl" placeholder="po polsku (warianty: a/b)" required>
        <input name="cat" placeholder="kategoria (opcjonalnie)" list="catList">
        <datalist id="catList">${cats.map(c => `<option value="${esc(c)}">`).join('')}</datalist>
        <button class="btn primary">＋ Dodaj</button>
      </form>
    </section>
    <section class="card">
      <div class="practice-row">
        <select id="practiceCat" aria-label="Kategoria">
          <option value="">Wszystkie (${n})</option>
          ${cats.map(c => `<option value="${esc(c)}" ${App.practiceCat === c ? 'selected' : ''}>${esc(c)} (${Storage.state.myWords.filter(w => w.cat === c).length})</option>`).join('')}
        </select>
        <button class="btn primary" id="practiceMine" ${n >= 4 ? '' : 'disabled'}>▶ Ćwicz</button>
      </div>
      <div class="btn-row small">
        <label class="btn light small">📂 Import CSV<input type="file" id="csvImport" accept=".csv,.txt,text/csv" hidden></label>
        <button class="btn light small" id="csvExport" ${n ? '' : 'disabled'}>📄 Eksport CSV</button>
        <button class="btn light small" id="importClassic">📥 Ze starej wersji</button>
      </div>
      <p class="muted small">CSV: kolumny <i>włoski, polski, kategoria</i> (pierwszy wiersz może być nagłówkiem).</p>
    </section>
    <input type="search" id="wordSearch" class="search" placeholder="🔍 Szukaj…" value="${esc(App.wordsQuery)}">
    <ul class="list" id="wordList">${myWordsList()}</ul>`;
}
function myWordsList() {
  const q = normLoose(App.wordsQuery);
  const list = Storage.state.myWords.filter(w => !q || normLoose(w.it + ' ' + w.pl + ' ' + w.cat).includes(q));
  if (!Storage.state.myWords.length) return `<li class="empty muted">Nie masz jeszcze własnych słówek. Dodaj pierwsze powyżej!</li>`;
  if (!list.length) return `<li class="empty muted">Brak wyników.</li>`;
  return list.slice().reverse().map(w => `
    <li class="row" data-id="${w.id}">
      ${speakBtn(w.it)}
      <div class="grow"><b lang="it">${esc(w.it)}</b><div class="muted small">${esc(w.pl)}${w.cat ? ` · <span class="tag">${esc(w.cat)}</span>` : ''}</div></div>
      ${strengthBar('m:' + w.id)}
      <button class="icon-btn" data-edit="${w.id}" aria-label="Edytuj">✎</button>
      <button class="icon-btn" data-del="${w.id}" aria-label="Usuń">🗑</button>
    </li>`).join('');
}
function bindMyWords(v) {
  $('#addWord', v).addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    const n = addMyWords([{ it: f.it.value, pl: f.pl.value, cat: f.cat.value }]);
    if (!n) return toast('To słówko już jest na liście.');
    const cat = f.cat.value;
    App.render();
    $('#addWord [name=cat]').value = cat;
    $('#addWord [name=it]').focus();
    toast('Dodano ✔');
  });
  $('#practiceCat', v).addEventListener('change', e => { App.practiceCat = e.target.value; });
  $('#practiceMine', v).addEventListener('click', () => startPractice('mine'));
  $('#csvExport', v).addEventListener('click', () => {
    const rows = [['Włoski', 'Polski', 'Kategoria'], ...Storage.state.myWords.map(w => [w.it, w.pl, w.cat])];
    downloadFile('moje-slowka.csv', '﻿' + rows.map(r => r.map(csvEscape).join(',')).join('\r\n'), 'text/csv');
  });
  $('#csvImport', v).addEventListener('change', async e => {
    const f = e.target.files[0];
    if (!f) return;
    const rows = parseCSV(await f.text());
    if (rows.length && /w[łl]oski|italian|it/i.test(rows[0][0] || '') && /polski|polish|pl/i.test(rows[0][1] || '')) rows.shift();
    const n = addMyWords(rows.map(r => ({ it: r[0], pl: r[1], cat: r[2] })));
    App.render();
    toast(`Zaimportowano ${n} ${plural(n, 'słówko', 'słówka', 'słówek')}.`);
  });
  $('#importClassic', v).addEventListener('click', () => {
    const n = migrateClassic(true);
    App.render();
    toast(n ? `Zaimportowano ${n} ${plural(n, 'słówko', 'słówka', 'słówek')}.` : 'Nie znaleziono nowych słówek ze starej wersji w tej przeglądarce.');
  });
}
function bindWordRows() {
  $$('[data-del]').forEach(b => b.addEventListener('click', () => {
    const S = Storage.state;
    const w = S.myWords.find(x => x.id === b.dataset.del);
    if (!w || !confirm(`Usunąć „${w.it}”?`)) return;
    S.myWords = S.myWords.filter(x => x !== w);
    S.deletedWords = [...(S.deletedWords || []), w.id];
    delete S.items['m:' + w.id];
    Storage.save();
    App.render();
  }));
  $$('[data-edit]').forEach(b => b.addEventListener('click', () => {
    const w = Storage.state.myWords.find(x => x.id === b.dataset.edit);
    if (!w) return;
    openModal(`
      <h2>Edytuj słówko</h2>
      <form id="editForm" class="addform">
        <label>Po włosku<input name="it" value="${esc(w.it)}" required lang="it"></label>
        <label>Po polsku<input name="pl" value="${esc(w.pl)}" required></label>
        <label>Kategoria<input name="cat" value="${esc(w.cat)}" list="catList2"></label>
        <datalist id="catList2">${myCategories().map(c => `<option value="${esc(c)}">`).join('')}</datalist>
        <button class="btn primary wide">✔ Zapisz</button>
        <button type="button" class="btn ghost wide" data-close>Anuluj</button>
      </form>`);
    $('#editForm').addEventListener('submit', e => {
      e.preventDefault();
      const f = e.target;
      w.it = f.it.value.trim(); w.pl = f.pl.value.trim(); w.cat = f.cat.value.trim(); w.t = Date.now();
      Storage.save();
      closeModal();
      App.render();
    });
  }));
}

/* ---------- Słówka: słownik kursu ---------- */
function courseDictView() {
  return `
    <input type="search" id="wordSearch" class="search" placeholder="🔍 Szukaj w słowniku kursu…" value="${esc(App.wordsQuery)}">
    <ul class="list" id="wordList">${courseDictList()}</ul>`;
}
function courseDictList() {
  const q = normLoose(App.wordsQuery);
  let html = '';
  COURSE.forEach(u => {
    const words = u.lessons.flatMap(l => l.words).filter(w => !q || normLoose(w.it + ' ' + w.pl).includes(q));
    if (!words.length) return;
    html += `<li class="list-head">${u.icon} ${esc(u.title)}</li>`;
    html += words.map(w => {
      const known = !!Storage.state.items[w.key];
      return `
      <li class="row ${known ? '' : 'unknown'}">
        ${speakBtn(w.it)}
        <div class="grow"><b lang="it">${esc(mainVariant(w.it))}</b><div class="muted small">${esc(w.pl.split('/').join(', '))}${w.note ? ` · <i>${esc(w.note)}</i>` : ''}</div></div>
        ${strengthBar(w.key)}
      </li>`;
    }).join('');
  });
  return html || `<li class="empty muted">Brak wyników.</li>`;
}
function strengthBar(key) {
  const r = Storage.state.items[key];
  if (!r) return `<span class="strength none" title="Jeszcze nie ćwiczone"></span>`;
  const s = strength(key);
  const lvl = Math.max(1, Math.round(s * 4));
  return `<span class="strength" title="Opanowanie: ${Math.round(s * 100)}%">${[1, 2, 3, 4].map(i => `<i class="${i <= lvl ? 'on' : ''}"></i>`).join('')}</span>`;
}

/* ---------- wykres: XP z ostatnich 7 dni ---------- */
function weekChart() {
  const S = Storage.state;
  const days = Array.from({ length: 7 }, (_, i) => addDays(todayStr(), i - 6));
  const vals = days.map(d => S.daily[d] || 0);
  const max = Math.max(S.settings.goal, ...vals, 1);
  const goalPct = S.settings.goal / max * 100;
  const names = ['nd', 'pn', 'wt', 'śr', 'cz', 'pt', 'sb'];
  return `
    <div class="chart" role="img" aria-label="XP w ostatnich 7 dniach: ${days.map((d, i) => `${names[new Date(d + 'T12:00').getDay()]} ${vals[i]}`).join(', ')}">
      <div class="chart-plot">
        <div class="goal-line" style="bottom:${goalPct}%"><span>cel ${S.settings.goal}</span></div>
        ${vals.map((v, i) => `
          <div class="bar-col" tabindex="0" data-hint="${fmtDate(days[i])}: ${v} XP">
            <div class="bar ${v >= S.settings.goal ? 'met' : ''} ${i === 6 ? 'today' : ''}" style="height:${v / max * 100}%"></div>
            ${i === 6 && v ? `<span class="bar-val" style="bottom:${v / max * 100}%">${v}</span>` : ''}
          </div>`).join('')}
      </div>
      <div class="chart-x">${days.map((d, i) => `<span class="${i === 6 ? 'today' : ''}">${i === 6 ? 'dziś' : names[new Date(d + 'T12:00').getDay()]}</span>`).join('')}</div>
    </div>`;
}

/* ---------- pomocnicze ---------- */
function plural(n, one, few, many) {
  if (n === 1) return one;
  const d = n % 10, dd = n % 100;
  return d >= 2 && d <= 4 && (dd < 12 || dd > 14) ? few : many;
}
function fmtDate(s) {
  const diff = daysBetween(todayStr(), s);
  if (diff === 0) return 'dziś';
  if (diff === 1) return 'jutro';
  if (diff === -1) return 'wczoraj';
  return new Date(s + 'T12:00').toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' });
}

document.addEventListener('DOMContentLoaded', () => App.init());
