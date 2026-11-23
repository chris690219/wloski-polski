/* =========================================================================
 * Ćwiczenia i przebieg sesji (lekcja, powtórka, trening własnych słówek)
 * ========================================================================= */

/* ---------- generowanie ćwiczeń ---------- */

/** Pula słów do dystraktorów: dotychczasowe jednostki + własne słowa. */
function distractorPool(upToUnit = COURSE.length - 1) {
  return [...COURSE.slice(0, upToUnit + 1).flatMap(u => u.lessons.flatMap(l => l.words)), ...myWordItems()];
}

/** Losuje n błędnych opcji, które nie pokrywają się z poprawną odpowiedzią. */
function distractors(item, pool, n, field) {
  const bad = new Set(variants(item[field]).map(normLoose));
  const seen = new Set();
  const cands = shuffle(pool).filter(p => {
    if (p.key === item.key) return false;
    const vs = variants(p[field]).map(normLoose);
    if (vs.some(v => bad.has(v))) return false;
    const m = normLoose(mainVariant(p[field]));
    if (seen.has(m)) return false;
    seen.add(m);
    return true;
  });
  // preferuj podobną długość – trudniej zgadnąć
  const len = mainVariant(item[field]).length;
  cands.sort((a, b) => Math.abs(mainVariant(a[field]).length - len) - Math.abs(mainVariant(b[field]).length - len) + (Math.random() - 0.5) * 6);
  return cands.slice(0, n);
}

/** Poprawne odpowiedzi z uwzględnieniem synonimów z puli (np. „proszę” = prego / per favore). */
function targetsFor(item, dir, pool) {
  const from = dir === 'pl-it' ? 'pl' : 'it';
  const to = dir === 'pl-it' ? 'it' : 'pl';
  const src = new Set(variants(item[from]).map(normLoose));
  const out = [item[to]];
  for (const p of pool) {
    if (p.key !== item.key && variants(p[from]).some(v => src.has(normLoose(v)))) out.push(p[to]);
  }
  return out;
}

function tokenize(sentence) {
  return sentence.split(/\s+/).map(t => t.replace(/^[¿¡"„«]+|[.,!?;:"”»]+$/g, '')).filter(Boolean);
}

function makeExercise(type, item, pool, extra = {}) {
  const ex = { type, item, ...extra };
  if (type === 'speak' && !Recog.enabled) {
    return item.sentence ? makeExercise('build', item, pool) : makeExercise('type', item, pool, { dir: 'pl-it' });
  }
  if (type === 'listen' || type === 'listenBuild') {
    if (!Speech.supported) return makeExercise(type === 'listen' ? 'type' : 'build', item, pool, { dir: 'pl-it' });
  }
  if (type === 'choice') {
    const field = ex.dir === 'it-pl' ? 'pl' : 'it';
    ex.options = shuffle([item, ...distractors(item, pool, 3, field)]);
  }
  if (type === 'schoice') {
    ex.options = shuffle([item, ...distractors(item, ALL_SENTENCES, 2, 'pl')]);
  }
  if (type === 'build' || type === 'listenBuild') {
    const tokens = tokenize(item.it);
    const have = new Set(tokens.map(t => normLoose(t)));
    const extraPool = shuffle([...ALL_SENTENCES.flatMap(s => tokenize(s.it)), ...pool.map(p => mainVariant(p.it))])
      .filter(t => !have.has(normLoose(t)) && t.split(' ').length === 1);
    const extras = [...new Set(extraPool)].slice(0, Math.min(4, Math.max(2, Math.ceil(tokens.length / 2))));
    ex.tiles = shuffle([...tokens, ...extras]);
  }
  if (type === 'type') ex.targets = targetsFor(item, ex.dir, pool);
  return ex;
}

/** Losowe ćwiczenie „praktyczne” dla słowa. */
function practiceExercise(item, pool, preferHard) {
  const r = Math.random();
  if (Recog.enabled && r < 0.12) return makeExercise('speak', item, pool);
  if (item.sentence) {
    return makeExercise(r < 0.35 ? 'listenBuild' : r < 0.55 ? 'schoice' : 'build', item, pool);
  }
  const types = preferHard
    ? [['type', 'pl-it'], ['type', 'pl-it'], ['type', 'it-pl'], ['listen'], ['choice', 'pl-it']]
    : [['choice', 'pl-it'], ['choice', 'it-pl'], ['type', 'pl-it'], ['type', 'it-pl'], ['listen']];
  const [type, dir] = pick(types);
  return makeExercise(type, item, pool, { dir });
}

function buildLessonSession(lesson) {
  const pool = distractorPool(lesson.unitIndex);
  const S = Storage.state;
  const repeat = lessonDone(lesson.id);
  const words = shuffle(lesson.words);
  const fresh = words.filter(w => !S.items[w.key]);
  const known = words.filter(w => S.items[w.key]);
  const exs = [];

  // 1. nowe słowa: po dwa wprowadzenia, potem pytanie o jedno z nich
  for (let i = 0; i < fresh.length; i += 2) {
    const pair = fresh.slice(i, i + 2);
    pair.forEach(w => exs.push(makeExercise('intro', w, pool)));
    pair.forEach(w => exs.push(makeExercise('choice', w, pool, { dir: pair.length > 1 && w === pair[1] ? 'pl-it' : 'it-pl' })));
  }
  // 2. dopasowywanie par
  const matchItems = shuffle(words).slice(0, 5);
  if (matchItems.length >= 3) exs.push({ type: 'match', items: matchItems });
  // 3. utrwalenie
  const practice = repeat ? words : shuffle([...known, ...shuffle(fresh).slice(0, 3)]);
  practice.forEach(w => exs.push(practiceExercise(w, pool, repeat)));
  // 4. zdania
  const sents = shuffle(lesson.sentences);
  sents.forEach((s, i) => exs.push(makeExercise(i === 0 ? 'build' : i === 1 ? 'listenBuild' : 'schoice', s, pool)));

  // 5. mówienie: jedno słowo i jedno zdanie
  if (Recog.enabled) {
    exs.push(makeExercise('speak', pick(words), pool));
    if (sents.length) exs.push(makeExercise('speak', pick(sents), pool));
  }

  // wprowadzenia i pierwsze pytania zostawiamy na początku, resztę mieszamy
  const introCount = fresh.length * 2;
  return [...exs.slice(0, introCount), ...shuffle(exs.slice(introCount))];
}

function buildPracticeSession(items, { max = 12, hard = false } = {}) {
  const pool = distractorPool();
  const chosen = items.slice(0, max);
  const words = chosen.filter(i => !i.sentence);
  const exs = [];
  if (words.length >= 4) exs.push({ type: 'match', items: shuffle(words).slice(0, 5) });
  chosen.forEach(it => exs.push(practiceExercise(it, pool, hard)));
  return exs.length && exs[0].type === 'match' ? [exs[0], ...shuffle(exs.slice(1))] : shuffle(exs);
}

/* =========================================================================
 * PRZEBIEG SESJI
 * ========================================================================= */
const Session = {
  open(exercises, { title = '', lessonId = null, onFinish = null } = {}) {
    if (!exercises.length) return;
    this.queue = exercises.map((ex, i) => ({ ...ex, slot: i }));
    this.total = exercises.length;
    this.finished = false;
    this.doneSlots = new Set();
    this.results = {};          // key → { wrong: bool }
    this.answered = 0;
    this.firstTry = 0;
    this.attempts = 0;
    this.combo = 0;
    this.lessonId = lessonId;
    this.title = title;
    this.onFinish = onFinish;
    this.startedAt = Date.now();
    this.idx = 0;
    $('#lesson').classList.remove('hidden');
    document.body.classList.add('in-lesson');
    this.next();
  },

  close(skipConfirm) {
    if (!skipConfirm && this.doneSlots.size > 0 && !confirm('Przerwać? Postęp tej lekcji nie zostanie zapisany.')) return;
    if (Speech.supported) speechSynthesis.cancel();
    this.stopListening();
    $('#lesson').classList.add('hidden');
    document.body.classList.remove('in-lesson');
    this.current = null;
    App.render();
  },

  mark(item, ok) {
    if (!item) return;
    const r = this.results[item.key] || (this.results[item.key] = { item, wrong: false, seen: false });
    r.seen = true;
    if (!ok) r.wrong = true;
  },

  updateProgress() {
    const pct = Math.round(this.doneSlots.size / this.total * 100);
    $('#lessonBar').style.width = pct + '%';
    $('#lessonCombo').textContent = this.combo >= 3 ? `🔥 ${this.combo}` : '';
  },

  stopListening() {
    this.listening?.stop();
    this.listening = null;
  },

  /** „Nie mogę teraz mówić”: pomija ćwiczenia mówienia bez kary na 15 minut. */
  skipSpeaking() {
    Recog.muteFor(15);
    this.stopListening();
    const later = this.queue.slice(this.idx).filter(e => e.type === 'speak');
    this.queue = [...this.queue.slice(0, this.idx), ...this.queue.slice(this.idx).filter(e => e.type !== 'speak')];
    const slots = new Set([this.current.slot, ...later.map(e => e.slot)]);
    this.total -= slots.size;
    toast('Ćwiczenia mówienia wyłączone na 15 minut.');
    this.next();
  },

  next() {
    this.stopListening();
    this.updateProgress();
    if (this.idx >= this.queue.length) return this.finish();
    this.current = this.queue[this.idx++];
    this.ready = false;
    this.checked = false;
    const body = $('#exBody');
    body.innerHTML = '';
    body.scrollTop = 0;
    const foot = $('#exFoot');
    foot.className = 'lesson-foot';
    $('#feedback').innerHTML = '';
    const btn = $('#checkBtn');
    btn.textContent = 'Sprawdź';
    btn.disabled = true;
    btn.className = 'btn primary big';
    $('#skipBtn').classList.toggle('hidden', ['intro', 'match', 'speak'].includes(this.current.type));
    Exercises[this.current.type].render(this.current, body, this);
    body.firstElementChild?.classList.add('enter');
  },

  setReady(v) {
    this.ready = v;
    $('#checkBtn').disabled = !v;
  },

  /** Przycisk główny: sprawdź → dalej */
  primary() {
    if (this.finished) { this.close(true); return this.onFinish?.(); }
    if (this.checked) return this.next();
    if (!this.ready) return;
    const ex = this.current;
    const handler = Exercises[ex.type];
    if (handler.noCheck) { this.complete(ex, true); return this.next(); }
    const res = handler.check(ex, this);
    this.showResult(ex, res);
  },

  skip() {
    if (this.checked) return;
    const ex = this.current;
    const res = { ok: false, correct: Exercises[ex.type].correctText?.(ex) };
    this.showResult(ex, res);
  },

  showResult(ex, res) {
    this.checked = true;
    this.attempts++;
    const foot = $('#exFoot');
    const fb = $('#feedback');
    $('#skipBtn').classList.add('hidden');
    if (res.ok) {
      Sfx.play('ok');
      this.combo++;
      const praise = pick(['Świetnie!', 'Brawo!', 'Doskonale!', 'Tak jest!', 'Perfetto!', 'Bravissimo!', 'Bene!']);
      foot.classList.add('ok');
      fb.innerHTML = `<div class="fb-title">✔ ${praise}</div>${res.note ? `<div class="fb-note">${res.note}</div>` : ''}`;
      if (!ex.retry) this.firstTry++;
      this.complete(ex, true);
    } else {
      Sfx.play('bad');
      this.combo = 0;
      foot.classList.add('bad');
      fb.innerHTML = `<div class="fb-title">✘ Poprawna odpowiedź:</div><div class="fb-answer">${esc(res.correct || '')}</div>`;
      this.complete(ex, false);
      // powtórz ćwiczenie później (nowe opcje)
      const again = ex.type === 'type' || ex.type === 'choice' || ex.type === 'listen'
        ? makeExercise(ex.type, ex.item, distractorPool(), { dir: ex.dir })
        : makeExercise(ex.type, ex.item, distractorPool());
      this.queue.push({ ...again, slot: ex.slot, retry: true });
    }
    if (ex.item && !res.ok) Speech.speak(mainVariant(ex.item.it));
    const btn = $('#checkBtn');
    btn.disabled = false;
    btn.textContent = 'Dalej';
    btn.className = 'btn big ' + (res.ok ? 'primary' : 'danger');
    btn.focus({ preventScroll: true });
    this.updateProgress();
  },

  complete(ex, ok) {
    if (ex.type !== 'intro') {
      this.answered++;
      Storage.state.answers[ok ? 'right' : 'wrong']++;
    }
    if (ex.item) this.mark(ex.item, ok);
    if (ok) this.doneSlots.add(ex.slot);
  },

  finish() {
    // nic nie zostało rozwiązane (np. pominięto wszystkie ćwiczenia mówienia) – bez nagrody
    if (!this.answered) return this.close(true);
    const S = Storage.state;
    const results = Object.values(this.results).filter(r => r.seen);
    results.forEach(r => srsUpdate(r.item.key, !r.wrong));
    const questions = this.queue.filter(e => e.type !== 'intro' && !e.retry).length || 1;
    const mistakes = this.queue.filter(e => e.retry).length;
    const accuracy = Math.max(0, Math.round((1 - mistakes / Math.max(questions, 1)) * 100));
    const perfect = mistakes === 0;
    const xp = 10 + (perfect ? 5 : 0);
    const goalBefore = todayXP() >= S.settings.goal;
    addXP(xp);
    const goalNow = !goalBefore && todayXP() >= S.settings.goal;
    if (this.lessonId) {
      const rec = S.lessons[this.lessonId] || { done: 0, best: 0 };
      rec.done++;
      rec.best = Math.max(rec.best, accuracy);
      S.lessons[this.lessonId] = rec;
    }
    Storage.saveNow();
    Sfx.play('done');
    const secs = Math.round((Date.now() - this.startedAt) / 1000);
    const time = secs >= 60 ? `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}` : `${secs} s`;
    $('#lessonBar').style.width = '100%';
    $('#exFoot').className = 'lesson-foot';
    $('#feedback').innerHTML = '';
    $('#skipBtn').classList.add('hidden');
    $('#exBody').innerHTML = `
      <div class="finish enter">
        <div class="finish-emoji">${perfect ? '🏆' : accuracy >= 70 ? '🎉' : '💪'}</div>
        <h2>${perfect ? 'Bezbłędnie!' : this.lessonId ? 'Lekcja ukończona!' : 'Trening ukończony!'}</h2>
        <p class="muted">${esc(this.title)}</p>
        <div class="finish-stats">
          <div class="fstat xp"><span>Zdobyte XP</span><b>+${xp}</b></div>
          <div class="fstat acc"><span>Celność</span><b>${accuracy}%</b></div>
          <div class="fstat time"><span>Czas</span><b>${time}</b></div>
        </div>
        ${goalNow ? `<div class="goal-reached">🎯 Dzienny cel osiągnięty! Seria: ${currentStreak()} 🔥</div>` : ''}
      </div>`;
    const btn = $('#checkBtn');
    btn.textContent = 'Kontynuuj';
    btn.disabled = false;
    btn.className = 'btn primary big';
    this.checked = true;
    this.finished = true;
  },
};

/* =========================================================================
 * RENDEROWANIE ĆWICZEŃ
 * ========================================================================= */
function speakBtn(text, cls = '') {
  return `<button class="speak ${cls}" data-say="${esc(mainVariant(text))}" aria-label="Odsłuchaj">🔊</button>`;
}
function maybeAutoplay(text) {
  if (Storage.state.settings.autoplay) setTimeout(() => Speech.speak(mainVariant(text)), 250);
}
const ACCENTS = ['à', 'è', 'é', 'ì', 'ò', 'ù'];
const PL_CHARS = ['ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż'];

function answerInput(body, session, lang) {
  const chars = lang === 'it' ? ACCENTS : PL_CHARS;
  body.insertAdjacentHTML('beforeend', `
    <textarea class="answer" rows="2" autocomplete="off" autocapitalize="off" spellcheck="false"
      placeholder="${lang === 'it' ? 'Napisz po włosku…' : 'Napisz po polsku…'}" lang="${lang === 'it' ? 'it' : 'pl'}"></textarea>
    <div class="charbar">${chars.map(c => `<button class="char" tabindex="-1">${c}</button>`).join('')}</div>`);
  const ta = $('.answer', body);
  ta.addEventListener('input', () => session.setReady(ta.value.trim().length > 0));
  ta.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); session.primary(); }
  });
  $$('.char', body).forEach(b => b.addEventListener('mousedown', e => {
    e.preventDefault();
    const s = ta.selectionStart, en = ta.selectionEnd;
    ta.value = ta.value.slice(0, s) + b.textContent + ta.value.slice(en);
    ta.selectionStart = ta.selectionEnd = s + 1;
    ta.dispatchEvent(new Event('input'));
  }));
  // na telefonie nie otwieraj klawiatury od razu – zasłania treść
  if (window.matchMedia('(pointer: fine)').matches) setTimeout(() => ta.focus(), 50);
  return ta;
}

const Exercises = {
  intro: {
    noCheck: true,
    render(ex, body, session) {
      const w = ex.item;
      body.innerHTML = `
        <div class="ex">
          <div class="ex-kind new">✨ Nowe słowo</div>
          <div class="intro-card">
            <div class="intro-it">${speakBtn(w.it, 'big')}<span lang="it">${esc(mainVariant(w.it))}</span></div>
            <div class="intro-pl">${esc(w.pl.split('/').join(' · '))}</div>
            ${w.note ? `<div class="intro-note">💡 ${esc(w.note)}</div>` : ''}
          </div>
        </div>`;
      maybeAutoplay(w.it);
      session.setReady(true);
      $('#checkBtn').textContent = 'Dalej';
    },
  },

  choice: {
    render(ex, body, session) {
      const itpl = ex.dir === 'it-pl';
      const q = itpl ? ex.item.it : ex.item.pl;
      const field = itpl ? 'pl' : 'it';
      body.innerHTML = `
        <div class="ex">
          <div class="ex-kind">${itpl ? 'Co to znaczy?' : 'Jak to powiedzieć po włosku?'}</div>
          <div class="prompt">${itpl ? speakBtn(q) : ''}<span ${itpl ? 'lang="it"' : ''}>${esc(itpl ? mainVariant(q) : q.split('/').join(' / '))}</span></div>
          <div class="options">${ex.options.map((o, i) => `
            <button class="option" data-i="${i}"><kbd>${i + 1}</kbd><span ${itpl ? '' : 'lang="it"'}>${esc(mainVariant(o[field]))}</span></button>`).join('')}
          </div>
        </div>`;
      if (itpl) maybeAutoplay(q);
      $$('.option', body).forEach(b => b.addEventListener('click', () => {
        if (session.checked) return;
        $$('.option', body).forEach(x => x.classList.remove('selected'));
        b.classList.add('selected');
        ex.selected = +b.dataset.i;
        if (!itpl) Speech.speak(mainVariant(ex.options[ex.selected].it));
        session.setReady(true);
      }));
    },
    check(ex) {
      const field = ex.dir === 'it-pl' ? 'pl' : 'it';
      const chosen = ex.options[ex.selected];
      // poprawna, jeśli wybrana opcja ma to samo znaczenie (synonimy)
      const ok = chosen.key === ex.item.key || variants(chosen[field]).some(v => variants(ex.item[field]).map(normLoose).includes(normLoose(v)));
      $$('.option').forEach((b, i) => {
        if (ex.options[i] === ex.item) b.classList.add('correct');
        else if (i === ex.selected && !ok) b.classList.add('wrong');
      });
      return { ok, correct: mainVariant(ex.item[field]) };
    },
    correctText: ex => mainVariant(ex.item[ex.dir === 'it-pl' ? 'pl' : 'it']),
  },

  type: {
    render(ex, body, session) {
      const plit = ex.dir === 'pl-it';
      const q = plit ? ex.item.pl : ex.item.it;
      body.innerHTML = `
        <div class="ex">
          <div class="ex-kind">${plit ? 'Napisz po włosku' : 'Przetłumacz na polski'}</div>
          <div class="prompt">${plit ? '' : speakBtn(q)}<span ${plit ? '' : 'lang="it"'}>${esc(plit ? q.split('/').join(' / ') : mainVariant(q))}</span></div>
        </div>`;
      if (!plit) maybeAutoplay(q);
      ex.input = answerInput(body.firstElementChild, session, plit ? 'it' : 'pl');
    },
    check(ex) {
      const plit = ex.dir === 'pl-it';
      ex.input.readOnly = true;
      const res = checkAnswer(ex.input.value, ex.targets, { italian: plit });
      return { ...res, correct: mainVariant(plit ? ex.item.it : ex.item.pl) };
    },
    correctText: ex => mainVariant(ex.dir === 'pl-it' ? ex.item.it : ex.item.pl),
  },

  listen: {
    render(ex, body, session) {
      body.innerHTML = `
        <div class="ex">
          <div class="ex-kind">🎧 Napisz, co słyszysz</div>
          <div class="listen-btns">
            <button class="listen-big" aria-label="Odsłuchaj">🔊</button>
            <button class="listen-slow" aria-label="Wolniej">🐢</button>
          </div>
        </div>`;
      const say = rate => Speech.speak(mainVariant(ex.item.it), rate);
      $('.listen-big', body).addEventListener('click', () => say());
      $('.listen-slow', body).addEventListener('click', () => say(0.55));
      setTimeout(() => say(), 300);
      ex.input = answerInput(body.firstElementChild, session, 'it');
    },
    check(ex) {
      ex.input.readOnly = true;
      const res = checkAnswer(ex.input.value, [ex.item.it], { italian: true });
      return { ...res, correct: `${mainVariant(ex.item.it)} — ${mainVariant(ex.item.pl)}` };
    },
    correctText: ex => `${mainVariant(ex.item.it)} — ${mainVariant(ex.item.pl)}`,
  },

  build: {
    render(ex, body, session, listen = false) {
      body.innerHTML = `
        <div class="ex">
          <div class="ex-kind">${listen ? '🎧 Ułóż to, co słyszysz' : 'Ułóż zdanie po włosku'}</div>
          ${listen
            ? `<div class="listen-btns"><button class="listen-big" aria-label="Odsłuchaj">🔊</button><button class="listen-slow" aria-label="Wolniej">🐢</button></div>`
            : `<div class="prompt sentence">${esc(ex.item.pl)}</div>`}
          <div class="build-area" aria-label="Twoja odpowiedź"></div>
          <div class="bank">${ex.tiles.map((t, i) => `<button class="tile" data-i="${i}" lang="it">${esc(t)}</button>`).join('')}</div>
        </div>`;
      if (listen) {
        const say = rate => Speech.speak(ex.item.it, rate);
        $('.listen-big', body).addEventListener('click', () => say());
        $('.listen-slow', body).addEventListener('click', () => say(0.55));
        setTimeout(() => say(), 300);
      }
      ex.chosen = [];
      const area = $('.build-area', body);
      const refresh = () => {
        area.innerHTML = ex.chosen.map((ti, pos) => `<button class="tile placed" data-pos="${pos}" lang="it">${esc(ex.tiles[ti])}</button>`).join('');
        $$('.bank .tile', body).forEach(b => b.classList.toggle('used', ex.chosen.includes(+b.dataset.i)));
        $$('.tile.placed', area).forEach(b => b.addEventListener('click', () => {
          if (session.checked) return;
          ex.chosen.splice(+b.dataset.pos, 1);
          refresh();
        }));
        session.setReady(ex.chosen.length > 0);
      };
      $$('.bank .tile', body).forEach(b => b.addEventListener('click', () => {
        if (session.checked || b.classList.contains('used')) return;
        ex.chosen.push(+b.dataset.i);
        Speech.speak(b.textContent, 1);
        refresh();
      }));
      refresh();
    },
    check(ex) {
      const answer = ex.chosen.map(i => ex.tiles[i]).join(' ');
      const ok = variants(ex.item.it).some(v => normStrict(v) === normStrict(answer));
      return { ok, correct: listenCorrect(ex) };
    },
    correctText: ex => listenCorrect(ex),
  },

  schoice: {
    render(ex, body, session) {
      body.innerHTML = `
        <div class="ex">
          <div class="ex-kind">Wybierz poprawne tłumaczenie</div>
          <div class="prompt sentence">${speakBtn(ex.item.it)}<span lang="it">${esc(ex.item.it)}</span></div>
          <div class="options">${ex.options.map((o, i) => `
            <button class="option" data-i="${i}"><kbd>${i + 1}</kbd><span>${esc(o.pl)}</span></button>`).join('')}
          </div>
        </div>`;
      maybeAutoplay(ex.item.it);
      $$('.option', body).forEach(b => b.addEventListener('click', () => {
        if (session.checked) return;
        $$('.option', body).forEach(x => x.classList.remove('selected'));
        b.classList.add('selected');
        ex.selected = +b.dataset.i;
        session.setReady(true);
      }));
    },
    check(ex) {
      const ok = ex.options[ex.selected] === ex.item;
      $$('.option').forEach((b, i) => {
        if (ex.options[i] === ex.item) b.classList.add('correct');
        else if (i === ex.selected) b.classList.add('wrong');
      });
      return { ok, correct: ex.item.pl };
    },
    correctText: ex => ex.item.pl,
  },

  match: {
    render(ex, body, session) {
      const left = shuffle(ex.items), right = shuffle(ex.items);
      body.innerHTML = `
        <div class="ex">
          <div class="ex-kind">Połącz w pary</div>
          <div class="match">
            <div class="col">${left.map(w => `<button class="mbtn" data-k="${esc(w.key)}" data-side="it" lang="it">${esc(mainVariant(w.it))}</button>`).join('')}</div>
            <div class="col">${right.map(w => `<button class="mbtn" data-k="${esc(w.key)}" data-side="pl">${esc(mainVariant(w.pl))}</button>`).join('')}</div>
          </div>
        </div>`;
      let sel = { it: null, pl: null };
      let left2go = ex.items.length;
      const byKey = Object.fromEntries(ex.items.map(w => [w.key, w]));
      $$('.mbtn', body).forEach(b => b.addEventListener('click', () => {
        if (b.disabled) return;
        const side = b.dataset.side;
        if (side === 'it') Speech.speak(b.textContent, 1);
        $$(`.mbtn[data-side="${side}"]`, body).forEach(x => x.classList.remove('selected'));
        if (sel[side] === b) { sel[side] = null; return; }
        sel[side] = b;
        b.classList.add('selected');
        if (sel.it && sel.pl) {
          const a = sel.it, c = sel.pl;
          sel = { it: null, pl: null };
          const same = a.dataset.k === c.dataset.k
            || normLoose(mainVariant(byKey[a.dataset.k].pl)) === normLoose(c.textContent);
          if (same) {
            [a, c].forEach(x => { x.classList.remove('selected'); x.classList.add('matched'); x.disabled = true; });
            Sfx.play('ok');
            session.mark(byKey[a.dataset.k], !ex.missed?.has(a.dataset.k));
            if (c.dataset.k !== a.dataset.k) session.mark(byKey[c.dataset.k], !ex.missed?.has(c.dataset.k));
            if (--left2go === 0) {
              session.complete(ex, true); // całe dopasowanie = jedno pytanie
              setTimeout(() => session.next(), 450);
            }
          } else {
            Sfx.play('bad');
            session.combo = 0;
            ex.missed = ex.missed || new Set();
            ex.missed.add(a.dataset.k); ex.missed.add(c.dataset.k);
            session.mark(byKey[a.dataset.k], false);
            session.mark(byKey[c.dataset.k], false);
            [a, c].forEach(x => { x.classList.remove('selected'); x.classList.add('shake'); setTimeout(() => x.classList.remove('shake'), 400); });
          }
        }
      }));
      $('#checkBtn').textContent = 'Połącz wszystkie pary';
    },
  },
};
Exercises.speak = {
  render(ex, body, session) {
    const it = ex.item.sentence ? ex.item.it : mainVariant(ex.item.it);
    ex.tries = 0;
    body.innerHTML = `
      <div class="ex">
        <div class="ex-kind">🎤 Powiedz na głos</div>
        <div class="prompt ${ex.item.sentence ? 'sentence' : ''}">${speakBtn(it)}<div><span lang="it">${esc(it)}</span>
          <div class="prompt-sub">${esc(mainVariant(ex.item.pl))}</div></div></div>
        <div class="mic-wrap">
          <button class="mic" aria-label="Mów">🎤</button>
          <div class="mic-label">Dotknij i powiedz po włosku</div>
          <div class="heard" aria-live="polite"></div>
        </div>
        <button class="link-btn" id="cantSpeak">Nie mogę teraz mówić</button>
      </div>`;
    maybeAutoplay(it);
    const mic = $('.mic', body), label = $('.mic-label', body), heard = $('.heard', body);
    const target = ex.item.sentence ? ex.item.it : ex.item.it;
    const threshold = ex.item.sentence ? 0.72 : 0.8;
    const reset = () => { mic.classList.remove('listening'); label.textContent = 'Dotknij i powiedz po włosku'; };
    mic.addEventListener('click', () => {
      if (session.checked) return;
      if (session.listening) { session.stopListening(); reset(); return; }
      if (Speech.supported) speechSynthesis.cancel();
      mic.classList.add('listening');
      label.textContent = 'Słucham… (dotknij, aby przerwać)';
      heard.textContent = '';
      session.listening = Recog.listen({
        onInterim: t => { heard.textContent = t; },
        onFinal: alts => {
          session.listening = null;
          reset();
          const scored = alts.map(a => ({ a, s: speechSimilarity(a, target) })).sort((x, y) => y.s - x.s);
          const best = scored[0] || { a: '', s: 0 };
          ex.heard = best.a;
          ex.score = best.s;
          if (best.s >= threshold) { session.setReady(true); return session.primary(); }
          ex.tries++;
          if (ex.tries >= 2) { session.setReady(true); return session.primary(); }
          heard.innerHTML = `Usłyszałem: „${esc(best.a)}”. <b>Spróbuj jeszcze raz.</b>`;
          Sfx.play('bad');
        },
        onError: err => {
          session.listening = null;
          reset();
          if (err === 'aborted') return;
          heard.innerHTML = err === 'not-allowed' || err === 'service-not-allowed'
            ? 'Brak dostępu do mikrofonu. Zezwól na mikrofon w przeglądarce albo wybierz „Nie mogę teraz mówić”.'
            : err === 'network' ? 'Rozpoznawanie mowy wymaga internetu.'
            : 'Nic nie usłyszałem – spróbuj jeszcze raz.';
        },
      });
    });
    $('#cantSpeak', body).addEventListener('click', () => session.skipSpeaking());
    $('#checkBtn').textContent = 'Mów do mikrofonu';
  },
  check(ex) {
    const ok = (ex.score || 0) >= (ex.item.sentence ? 0.72 : 0.8);
    const it = ex.item.sentence ? ex.item.it : mainVariant(ex.item.it);
    return ok
      ? { ok, note: `Usłyszałem: „${esc(ex.heard)}”` }
      : { ok, correct: `${it} (usłyszałem: „${ex.heard || '…'}”)` };
  },
  correctText: ex => (ex.item.sentence ? ex.item.it : mainVariant(ex.item.it)),
};
Exercises.listenBuild = {
  render: (ex, body, session) => Exercises.build.render(ex, body, session, true),
  check: Exercises.build.check,
  correctText: Exercises.build.correctText,
};
function listenCorrect(ex) {
  return ex.type === 'listenBuild' ? `${ex.item.it} — ${ex.item.pl}` : ex.item.it;
}
