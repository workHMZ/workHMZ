(() => {
  'use strict';

  const doc = document.documentElement;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const I18N = window.PORTFOLIO_I18N || { en: { ui: {}, calendar: {} }, ja: { ui: {}, calendar: {}, text: {} } };
  const NS = 'http://www.w3.org/2000/svg';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const setText = (sel, value) => { const el = $(sel); if (el) el.textContent = value; };

  /* ---------------------------------------------------------- sticky top hairline */
  const syncScroll = () => {
    if (window.scrollY > 10) doc.dataset.scrolled = '';
    else delete doc.dataset.scrolled;
  };
  syncScroll();
  addEventListener('scroll', syncScroll, { passive: true });

  /* ---------------------------------------------------------- sliding segmented pills */
  const langToggle = $('#lang-toggle');
  const langThumb = $('.lang-thumb', langToggle || document);
  function syncLangThumb() {
    if (!langToggle || !langThumb) return;
    const active = $(`[data-lang-option="${doc.dataset.lang === 'ja' ? 'ja' : 'en'}"]`, langToggle);
    if (!active) return;
    langThumb.style.width = `${active.offsetWidth}px`;
    langThumb.style.setProperty('--lx', `${active.offsetLeft}px`);
  }

  const topInner = $('.top-inner');
  const markName = $('.mark-name');
  const markDot = $('.mark-dot');
  const topNav = $('.top-nav');
  const topTools = $('.top-tools');
  function syncTopBarWidth() {
    if (!topInner || !markName || !topTools) return;
    const markW = markName.offsetWidth + (markDot ? 6 + markDot.offsetWidth : 0);
    const navVisible = topNav && getComputedStyle(topNav).display !== 'none';
    const navW = navVisible ? topNav.offsetWidth : 0;
    const toolsW = topTools.offsetWidth;
    const narrow = innerWidth <= 640;
    const gap = narrow ? 6 : 10;
    const pad = narrow ? 19 : 24;
    const items = navVisible ? 3 : 2;
    const pillW = Math.ceil(markW + navW + toolsW + (items - 1) * gap + pad + 8);
    topInner.style.setProperty('--pill-w', `${pillW}px`);
  }

  const yearThumb = $('#year-thumb');
  function syncYearThumb() {
    const calYears = $('#cal-years');
    if (!calYears || !yearThumb) return;
    const active = $('button[aria-pressed="true"]', calYears);
    if (!active) { yearThumb.style.setProperty('--yo', '0'); return; }
    yearThumb.style.width = `${active.offsetWidth}px`;
    yearThumb.style.setProperty('--yx', `${active.offsetLeft}px`);
    yearThumb.style.setProperty('--yo', '1');
  }
  const syncChrome = () => { syncLangThumb(); syncYearThumb(); syncTopBarWidth(); };
  addEventListener('resize', syncChrome, { passive: true });
  document.fonts?.ready.then(syncChrome);

  /* ---------------------------------------------------------- view transitions (theme reveal, language cross-fade) */
  let vtSeq = 0;
  function withTransition(kind, update) {
    if (typeof document.startViewTransition !== 'function' || reduceMotion.matches) { update(); return null; }
    const id = ++vtSeq;
    doc.dataset.vt = kind;
    const transition = document.startViewTransition(update);
    transition.finished.finally(() => { if (vtSeq === id) delete doc.dataset.vt; });
    return transition;
  }

  /* ---------------------------------------------------------- mechanical digit reel */
  const odometers = [];
  function buildOdometer(el) {
    const raw = (el.dataset.odometer || el.textContent || '').trim();
    el.textContent = '';
    el.classList.add('odo');
    const spoken = document.createElement('span');
    spoken.className = 'sr-only';
    spoken.textContent = raw;
    el.appendChild(spoken);
    const cols = [];
    let digitIdx = 0;
    for (const ch of raw) {
      if (ch >= '0' && ch <= '9') {
        const col = document.createElement('span');
        col.className = 'odo-col';
        col.setAttribute('aria-hidden', 'true');
        const track = document.createElement('span');
        track.className = 'odo-track';
        track.style.setProperty('--idx', String(digitIdx++));
        for (let d = 0; d <= 9; d++) {
          const cell = document.createElement('i');
          cell.textContent = String(d);
          track.appendChild(cell);
        }
        const target = Number(ch);
        track.style.setProperty('--digit', reduceMotion.matches ? String(target) : '0');
        col.appendChild(track);
        el.appendChild(col);
        cols.push({ track, target });
      } else {
        const sym = document.createElement('span');
        sym.className = 'odo-sym';
        sym.setAttribute('aria-hidden', 'true');
        sym.textContent = ch;
        el.appendChild(sym);
      }
    }
    return {
      el,
      roll(fromDigits) {
        if (reduceMotion.matches) {
          cols.forEach(({ track, target }) => track.style.setProperty('--digit', String(target)));
          return;
        }
        if (Array.isArray(fromDigits)) {
          cols.forEach(({ track }, i) => {
            track.style.transition = 'none';
            track.style.setProperty('--digit', String(fromDigits[i] ?? 0));
          });
          void el.offsetWidth;
          cols.forEach(({ track }) => { track.style.transition = ''; });
        }
        requestAnimationFrame(() => {
          cols.forEach(({ track, target }) => track.style.setProperty('--digit', String(target)));
        });
      }
    };
  }

  function initOdometersAndMeters() {
    $$('.meter-cells i').forEach((cell, i) => cell.style.setProperty('--i', String(i)));
    $$('[data-odometer]').forEach(el => odometers.push(buildOdometer(el)));

    const impactCard = $('.card.impact');
    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      odometers.forEach(o => o.roll());
      impactCard?.classList.add('is-ready');
      return;
    }

    /* Tell the RAG story: the 65 glides up from its 43 baseline; everything else spins up from zero. */
    const rollIn = o => o.roll(o.el.dataset.odometer === '65' ? [4, 3] : [0, 0, 0, 0]);
    const seen = new WeakSet();
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || seen.has(entry.target)) return;
        seen.add(entry.target);
        if (entry.target === impactCard) {
          impactCard.classList.add('is-ready');
          odometers.filter(o => impactCard.contains(o.el)).forEach(rollIn);
        } else {
          const item = odometers.find(o => o.el === entry.target);
          if (item) rollIn(item);
        }
      });
    }, { threshold: .3 });

    if (impactCard) io.observe(impactCard);
    odometers.forEach(o => { if (!impactCard || !impactCard.contains(o.el)) io.observe(o.el); });
  }

  /* ---------------------------------------------------------- language */
  const englishSource = new Map();
  $$('[data-i18n]').forEach(el => englishSource.set(el, { mode: 'text', value: el.textContent }));
  $$('[data-i18n-html]').forEach(el => englishSource.set(el, { mode: 'html', value: el.innerHTML }));

  const lang = () => (doc.dataset.lang === 'ja' ? 'ja' : 'en');
  const t = key => (I18N[lang()].ui || {})[key] ?? I18N.en.ui[key] ?? key;

  function applyCopy() {
    const dict = lang() === 'ja' ? (I18N.ja.text || {}) : null;
    englishSource.forEach((source, el) => {
      const key = el.dataset.i18n || el.dataset.i18nHtml;
      const value = dict && key in dict ? dict[key] : source.value;
      if (source.mode === 'html') el.innerHTML = value;
      else el.textContent = value;
    });
    document.title = I18N[lang()].title || document.title;
    setText('#lang-hint', t('langSwitch'));
    langToggle?.setAttribute('title', t('langSwitch'));
    syncThemeLabel();
    renderChronoFrame(true);
    renderRulerHint(hoveredHour);
    renderCalendarCaption();
    renderBoard();
    delete doc.dataset.i18nPending;
    requestAnimationFrame(syncChrome);
  }

  function setLang(next) {
    doc.lang = next;
    doc.dataset.lang = next;
    try { localStorage.setItem('lang', next); } catch (_) {}
    const url = new URL(location.href);
    if (url.searchParams.has('lang')) { url.searchParams.set('lang', next); window.history.replaceState(null, '', url); }
    applyCopy();
  }
  langToggle?.addEventListener('click', () => {
    const next = lang() === 'ja' ? 'en' : 'ja';
    withTransition('lang', () => setLang(next));
  });

  /* ---------------------------------------------------------- theme */
  const themeMeta = $$('meta[name="theme-color"]');
  function syncThemeLabel() {
    const dark = doc.dataset.theme === 'dark';
    $('#theme-toggle')?.setAttribute('aria-label', t(dark ? 'themeToLight' : 'themeToDark'));
    themeMeta.forEach(meta => meta.setAttribute('content', dark ? '#121311' : '#f3f0e7'));
  }
  $('#theme-toggle')?.addEventListener('click', event => {
    const next = doc.dataset.theme === 'dark' ? 'light' : 'dark';
    const transition = withTransition('theme', () => {
      doc.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (_) {}
      syncThemeLabel();
    });
    if (!transition) return;
    /* Open the new palette as a circle growing out of the toggle. */
    const box = event.currentTarget.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    transition.ready.then(() => {
      doc.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 520, easing: 'cubic-bezier(.22, 1, .36, 1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(() => {});
  });

  /* ---------------------------------------------------------- 120Hz Braun chronograph + 24h Tokyo scrubber */
  const JST_OFFSET_MIN = 540;
  const clockCard = $('.card.clock');
  const dialTicks = $('#dial-ticks');
  const dialHr = $('#dial-hr');
  const dialMin = $('#dial-min');
  const dialSec = $('#dial-sec');
  const secbar = $('#secbar');
  const secTicks = [];
  const daybar = $('#daybar');
  const dayTicks = [];

  if (dialTicks) {
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const cardinal = i % 3 === 0;
      const rOuter = 20.6;
      const rInner = cardinal ? 16.8 : 18.4;
      const line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', (24 + Math.cos(angle) * rInner).toFixed(2));
      line.setAttribute('y1', (24 + Math.sin(angle) * rInner).toFixed(2));
      line.setAttribute('x2', (24 + Math.cos(angle) * rOuter).toFixed(2));
      line.setAttribute('y2', (24 + Math.sin(angle) * rOuter).toFixed(2));
      if (cardinal) line.setAttribute('class', 'is-cardinal');
      dialTicks.appendChild(line);
    }
  }
  if (secbar) {
    for (let s = 0; s < 60; s++) {
      const tick = document.createElement('i');
      if (s % 5 === 0) tick.dataset.m = '1';
      if (s % 15 === 0) tick.dataset.q = '1';
      secbar.appendChild(tick);
      secTicks.push(tick);
    }
  }
  if (daybar) {
    for (let h = 0; h < 24; h++) {
      const tick = document.createElement('i');
      if (h >= 9 && h < 20) tick.dataset.w = '1';
      daybar.appendChild(tick);
      dayTicks.push(tick);
    }
  }

  let currentJstHour = 0;
  let hoveredHour = null;
  let lastSecRendered = -1;
  let clockVisible = true;
  let chronoRaf = 0;

  function renderRulerHint(hour) {
    if (hour === null || hour === undefined) {
      setText('#ruler-hint', t('rulerIdle'));
      return;
    }
    const hh = String(hour).padStart(2, '0');
    const key = hour === currentJstHour ? 'rulerNow' : (hour >= 9 && hour < 20 ? 'rulerWork' : 'rulerQuiet');
    setText('#ruler-hint', t(key).replace('{h}', hh));
  }

  function paintDayTicks(pointerRatio) {
    dayTicks.forEach((tick, h) => {
      tick.dataset.t = h < currentJstHour ? 'past' : h === currentJstHour ? 'now' : 'next';
      if (pointerRatio === null || reduceMotion.matches) {
        tick.style.removeProperty('--sy');
        delete tick.dataset.hover;
      } else {
        const center = (h + 0.5) / 24;
        const dist = Math.abs(pointerRatio - center) * 24;
        const bell = Math.exp(-(dist * dist) / 3.2);
        const work = h >= 9 && h < 20;
        const base = h === currentJstHour ? 0.56 : h < currentJstHour ? (work ? 0.48 : 0.34) : (work ? 0.38 : 0.26);
        const scale = Math.min(1, base + bell * 0.66);
        tick.style.setProperty('--sy', scale.toFixed(3));
        if (dist < 0.55) tick.dataset.hover = 'true';
        else delete tick.dataset.hover;
      }
    });
  }

  if (daybar) {
    let releaseTimer = 0;
    const scrub = event => {
      clearTimeout(releaseTimer);
      const rect = daybar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(0.999, (event.clientX - rect.left) / rect.width));
      hoveredHour = Math.floor(ratio * 24);
      daybar.classList.add('is-scrubbing');
      paintDayTicks(ratio);
      renderRulerHint(hoveredHour);
    };
    const release = () => {
      clearTimeout(releaseTimer);
      hoveredHour = null;
      daybar.classList.remove('is-scrubbing');
      paintDayTicks(null);
      renderRulerHint(null);
    };
    daybar.addEventListener('pointerdown', scrub);
    daybar.addEventListener('pointermove', scrub);
    /* A lifted finger also fires pointerleave; let the pointerup timer below handle touch. */
    daybar.addEventListener('pointerleave', event => { if (event.pointerType !== 'touch') release(); });
    daybar.addEventListener('pointercancel', release);
    /* A finger has no "leave": hold the reading briefly after it lifts, then return to now. */
    daybar.addEventListener('pointerup', event => {
      if (event.pointerType !== 'mouse') releaseTimer = setTimeout(release, 1600);
    });
  }

  function restSecScale(s, past) {
    if (s % 15 === 0) return past ? 0.78 : 0.64;
    if (s % 5 === 0) return past ? 0.60 : 0.46;
    return past ? 0.38 : 0.28;
  }

  function baseSecScale(s, secInt) {
    if (s === secInt) return 1;
    return restSecScale(s, s < secInt);
  }

  function paintSecWindow(exactSec, secInt, fullPass) {
    if (!secTicks.length) return;
    const smooth = !reduceMotion.matches && !fullPass;
    if (fullPass || secInt !== lastSecRendered) {
      for (let s = 0; s < 60; s++) {
        const tick = secTicks[s];
        tick.dataset.s = s < secInt ? 'past' : s === secInt ? 'now' : 'next';
        tick.style.setProperty('--sy', baseSecScale(s, secInt).toFixed(3));
      }
    }
    if (smooth) {
      /* Only modulate the 7-tick neighborhood around exactSec at 120Hz (zero-GC, minimal style work). */
      for (let offset = -3; offset <= 3; offset++) {
        const s = (secInt + offset + 60) % 60;
        let diff = Math.abs(s - exactSec);
        if (diff > 30) diff = 60 - diff;
        const base = s === secInt ? restSecScale(s, true) : baseSecScale(s, secInt);
        const crest = Math.exp(-(diff * diff) / 0.72);
        const scale = Math.min(1, base + (1 - base) * crest);
        secTicks[s].style.setProperty('--sy', scale.toFixed(3));
      }
    }
  }

  function updateClockDigits(now, jstMs, secInt) {
    const totalSec = Math.floor(jstMs / 1000);
    const minInt = ((Math.floor(totalSec / 60) % 60) + 60) % 60;
    const hrInt = ((Math.floor(totalSec / 3600) % 24) + 24) % 24;
    setText('#clock-h', String(hrInt).padStart(2, '0'));
    setText('#clock-m', String(minInt).padStart(2, '0'));
    setText('#clock-s', String(secInt).padStart(2, '0'));
    currentJstHour = hrInt;
    if (hoveredHour === null) paintDayTicks(null);

    const diff = JST_OFFSET_MIN + now.getTimezoneOffset();
    const abs = Math.abs(diff);
    const span = abs % 60
      ? t('hoursMinutes').replace('{h}', Math.floor(abs / 60)).replace('{m}', abs % 60)
      : t('hours').replace('{h}', abs / 60);
    setText('#clock-diff', diff === 0 ? t('clockSame') : t(diff > 0 ? 'clockAhead' : 'clockBehind').replace('{d}', span));
  }

  function renderChronoFrame(forceDigits) {
    const now = new Date();
    const jstMs = now.getTime() + JST_OFFSET_MIN * 60000;
    const exactSec = (((jstMs % 60000) + 60000) % 60000) / 1000;
    const secInt = Math.floor(exactSec);
    const exactMin = (((jstMs / 60000) % 60) + 60) % 60;
    const exactHr = (((jstMs / 3600000) % 12) + 12) % 12;

    const secAngle = reduceMotion.matches ? secInt * 6 : exactSec * 6;
    dialSec?.setAttribute('transform', `rotate(${secAngle.toFixed(2)} 24 24)`);
    dialMin?.setAttribute('transform', `rotate(${(exactMin * 6).toFixed(2)} 24 24)`);
    dialHr?.setAttribute('transform', `rotate(${(exactHr * 30).toFixed(2)} 24 24)`);

    const secChanged = secInt !== lastSecRendered;
    paintSecWindow(exactSec, secInt, reduceMotion.matches || forceDigits);
    if (secChanged || forceDigits) {
      lastSecRendered = secInt;
      updateClockDigits(now, jstMs, secInt);
    }
  }

  function loopChrono() {
    chronoRaf = 0;
    if (document.hidden || !clockVisible || reduceMotion.matches) return;
    renderChronoFrame(false);
    chronoRaf = requestAnimationFrame(loopChrono);
  }
  function syncChronoLoop() {
    if (!document.hidden && clockVisible && !reduceMotion.matches) {
      if (!chronoRaf) chronoRaf = requestAnimationFrame(loopChrono);
    } else if (chronoRaf) {
      cancelAnimationFrame(chronoRaf);
      chronoRaf = 0;
    }
  }
  setInterval(() => { if (!chronoRaf && !document.hidden) renderChronoFrame(false); }, 1000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) renderChronoFrame(true);
    syncChronoLoop();
  });
  reduceMotion.addEventListener?.('change', () => { renderChronoFrame(true); syncChronoLoop(); });
  if ('IntersectionObserver' in window) {
    const awsFeature = $('.aws-feature');
    const visIo = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.target === clockCard) {
          clockVisible = entry.isIntersecting;
          if (clockVisible) renderChronoFrame(true);
          syncChronoLoop();
        } else if (entry.target === awsFeature) {
          if (entry.isIntersecting) delete awsFeature.dataset.offscreen;
          else awsFeature.dataset.offscreen = '';
        }
      });
    }, { rootMargin: '80px' });
    if (clockCard) visIo.observe(clockCard);
    if (awsFeature) visIo.observe(awsFeature);
  }
  syncChronoLoop();

  /* ---------------------------------------------------------- contribution calendar */
  const CAL = window.CALENDAR;
  const calSvg = $('#cal-svg');
  const calYears = $('#cal-years');
  const cells = [];
  let calYear = null;
  let playTimer = 0;
  let playBtn = null;

  const isArt = year => Boolean(I18N.en.calendar?.[year]);

  function setPlaying(active) {
    if (!playBtn) return;
    playBtn.dataset.playing = active ? 'true' : 'false';
    playBtn.innerHTML = active
      ? '<svg viewBox="0 0 10 10" aria-hidden="true"><rect x="2" y="1.5" width="2.2" height="7"/><rect x="5.8" y="1.5" width="2.2" height="7"/></svg>'
      : '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1.8 1v8L9 5z"/></svg>';
  }

  function stopPlay() {
    clearTimeout(playTimer);
    playTimer = 0;
    setPlaying(false);
  }

  function playYears(sequence) {
    if (playTimer) { stopPlay(); return; }
    let index = 0;
    setPlaying(true);
    const step = () => {
      showYear(sequence[index]);
      index++;
      if (index < sequence.length) playTimer = setTimeout(step, 1250);
      else { playTimer = 0; setPlaying(false); }
    };
    step();
  }

  function buildCalendar() {
    if (!CAL || !calSvg || !calYears) return;
    const years = Object.keys(CAL.years).map(Number).sort((a, b) => a - b);
    const columns = Math.max(...years.map(y => CAL.years[y].rows[0].length));
    const PITCH = 14, SIZE = 11;
    calSvg.setAttribute('viewBox', `0 0 ${columns * PITCH - (PITCH - SIZE)} ${7 * PITCH - (PITCH - SIZE)}`);
    for (let c = 0; c < columns; c++) {
      for (let r = 0; r < 7; r++) {
        const rect = document.createElementNS(NS, 'rect');
        Object.entries({ x: c * PITCH, y: r * PITCH, width: SIZE, height: SIZE, rx: 2.5 }).forEach(([k, v]) => rect.setAttribute(k, v));
        rect.style.setProperty('--c', c);
        rect.style.setProperty('--r', r);
        rect.dataset.l = 'x';
        calSvg.appendChild(rect);
        cells.push({ rect, c, r });
      }
    }

    playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'cal-play';
    setPlaying(false);
    playBtn.addEventListener('click', () => playYears(years.filter(isArt)));
    calYears.appendChild(playBtn);

    years.forEach(year => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = year;
      button.dataset.year = year;
      button.addEventListener('click', () => { stopPlay(); showYear(year); });
      calYears.appendChild(button);
    });

    const art = years.filter(isArt);
    const resting = art.length ? art[art.length - 1] : years[years.length - 1];
    showYear(resting);
  }

  function showYear(year) {
    const data = CAL.years[year];
    if (!data) return;
    calYear = year;
    cells.forEach(({ rect, c, r }) => {
      const value = data.rows[r]?.[c];
      rect.dataset.l = value === undefined || value === ' ' ? 'x' : value;
    });
    $$('button[data-year]', calYears).forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.year) === year)));
    renderCalendarCaption();
    requestAnimationFrame(syncYearThumb);
  }

  function renderCalendarCaption() {
    if (!CAL || calYear === null) return;
    playBtn?.setAttribute('aria-label', t('calPlay'));
    playBtn?.setAttribute('title', t('calPlay'));
    setText('#cal-year', calYear);
    const art = (I18N[lang()].calendar || {})[calYear] || I18N.en.calendar[calYear];
    if (art) {
      setText('#cal-theme', art[0]);
      setText('#cal-detail', art[1]);
      setText('#cal-tag', t('calArt'));
      calSvg?.setAttribute('aria-label', `${calYear} — ${art[0]}: ${art[1]}`);
    } else {
      const date = new Intl.DateTimeFormat(lang() === 'ja' ? 'ja-JP' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${CAL.asOf}T00:00:00Z`));
      const theme = t('calRealTheme');
      const detail = t('calRealDetail');
      setText('#cal-theme', theme);
      setText('#cal-detail', detail);
      setText('#cal-tag', t('calReal').replace('{n}', CAL.years[calYear].total.toLocaleString('en-US')).replace('{date}', date));
      calSvg?.setAttribute('aria-label', `${calYear} — ${theme}: ${detail}`);
    }
  }

  /* ---------------------------------------------------------- toolbox <-> live systems cross-highlight */
  $$('.chip-row[data-link-node]').forEach(row => {
    const target = row.dataset.linkNode;
    row.addEventListener('pointerenter', () => {
      $$(`.svc[data-node="${target}"]`).forEach(svc => svc.classList.add('is-linked'));
    });
    row.addEventListener('pointerleave', () => {
      $$('.svc.is-linked').forEach(svc => svc.classList.remove('is-linked'));
    });
  });

  /* ---------------------------------------------------------- selectable repository cards */
  $$('.card.project[data-href], .repo-tile[data-href]').forEach(card => {
    card.addEventListener('click', event => {
      /* Only the areas that show a pointer cursor navigate; on touch screens the links do. */
      if (event.defaultPrevented || event.target.closest('a, button, .repo-bar, .project-body')) return;
      if (matchMedia('(hover: none)').matches) return;
      if (String(window.getSelection?.() || '').trim().length > 0) return;
      window.open(card.dataset.href, '_blank', 'noopener,noreferrer');
    });
  });

  /* ---------------------------------------------------------- latest release tags
   * The markup ships the last known tag; the public GitHub API (60 req/h per IP, CORS open)
   * refreshes it, cached for an hour per tab. Any failure leaves the shipped tag in place.
   */
  const RELEASE_TTL = 3600000;
  $$('[data-release]').forEach(async link => {
    const repo = link.dataset.release;
    const mark = $('.release-mark', link);
    if (!mark) return;
    const show = tag => { mark.textContent = /^\d/.test(tag) ? `v${tag}` : tag; };
    const key = `release:${repo}`;
    try {
      const cached = JSON.parse(sessionStorage.getItem(key) || 'null');
      if (cached && Date.now() - cached.at < RELEASE_TTL) { show(cached.tag); return; }
    } catch (_) {}
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' }, credentials: 'omit' });
      if (!res.ok) return;
      const tag = (await res.json())?.tag_name;
      if (typeof tag !== 'string' || !tag || tag.length > 32) return;
      show(tag);
      try { sessionStorage.setItem(key, JSON.stringify({ tag, at: Date.now() })); } catch (_) {}
    } catch (_) {}
  });

  /* ---------------------------------------------------------- figure: resumable upload */
  const grid = $('#chunk-grid');
  if (grid) {
    const COLS = 8, ROWS = 4, W = 44, H = 30, GAP = 8, X0 = 36, Y0 = 82;
    const CONFIRMED = 18, CUT = 18;
    for (let i = 0; i < COLS * ROWS; i++) {
      const x = X0 + (i % COLS) * (W + GAP);
      const y = Y0 + Math.floor(i / COLS) * (H + GAP);
      const rect = document.createElementNS(NS, 'rect');
      Object.entries({ x, y, width: W, height: H, rx: 4 }).forEach(([k, v]) => rect.setAttribute(k, v));
      rect.setAttribute('class', i < CONFIRMED ? 'c-done' : i === CUT ? 'c-cut' : 'c-wait');
      grid.appendChild(rect);
      if (i > CUT && i < CUT + 6) {
        const overlay = rect.cloneNode();
        overlay.setAttribute('class', 'c-resume');
        overlay.style.setProperty('--d', String(i - CUT));
        grid.appendChild(overlay);
      }
      if (i === CUT) {
        const mark = document.createElementNS(NS, 'path');
        mark.setAttribute('d', `M${x + 16} ${y + 9}l12 12M${x + 28} ${y + 9}l-12 12`);
        mark.setAttribute('class', 'c-mark');
        grid.appendChild(mark);
      }
    }
  }

  function syncMotion() {
    $$('svg.diagram').forEach(svg => {
      try { reduceMotion.matches ? svg.pauseAnimations() : svg.unpauseAnimations(); } catch (_) {}
    });
  }
  syncMotion();
  reduceMotion.addEventListener?.('change', syncMotion);

  /* ---------------------------------------------------------- pointer-lit card borders + 120Hz micro-perspective tilt */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cards = $$('.card');
    const boxes = new Array(cards.length);
    const states = new WeakMap();
    const tilting = new Set();
    let hovered = null;
    let frame = 0;
    let lastNow = 0;
    let dirtyPointer = false;
    let px = -9999, py = -9999;

    function getState(card) {
      let s = states.get(card);
      if (!s) {
        s = { rx: 0, ry: 0, lift: 0, tx: 0, ty: 0, tlift: 0 };
        states.set(card, s);
      }
      return s;
    }

    function setHovered(next) {
      if (next === hovered) return;
      if (hovered) {
        const s = getState(hovered);
        s.tx = 0; s.ty = 0; s.tlift = 0;
      }
      hovered = next;
    }

    function releaseHover() {
      if (!hovered) return;
      setHovered(null);
      schedule();
    }

    function tick(now) {
      frame = 0;
      const dt = lastNow ? Math.min(0.05, Math.max(0.001, (now - lastNow) * 0.001)) : 0.016;
      lastNow = now;

      if (dirtyPointer) {
        dirtyPointer = false;
        const vh = innerHeight;
        /* Phase 1: batch all layout reads before any style writes (zero layout thrashing). */
        for (let i = 0; i < cards.length; i++) {
          boxes[i] = cards[i].getBoundingClientRect();
        }
        /* Phase 2: write specular coordinates and update active lens tilt target. */
        for (let i = 0; i < cards.length; i++) {
          const box = boxes[i];
          if (box.bottom < -120 || box.top > vh + 120) continue;
          const card = cards[i];
          card.style.setProperty('--mx', `${(px - box.left).toFixed(1)}px`);
          card.style.setProperty('--my', `${(py - box.top).toFixed(1)}px`);
          if (card === hovered && !reduceMotion.matches) {
            const hw = Math.max(1, box.width * 0.5);
            const hh = Math.max(1, box.height * 0.5);
            const nx = Math.max(-1, Math.min(1, (px - (box.left + hw)) / hw));
            const ny = Math.max(-1, Math.min(1, (py - (box.top + hh)) / hh));
            const calm = card.classList.contains('ledger');
            /* Constant ~12.5px corner depth travel gives every card size a balanced, perceptible 3D perspective. */
            const maxDeg = calm ? 0.65 : Math.min(3.4, Math.max(0.95, (12.5 / Math.max(120, Math.max(hw, hh))) * 57.2958));
            const s = getState(card);
            s.tx = -ny * maxDeg;
            s.ty = nx * maxDeg;
            s.tlift = calm ? 1.0 : 2.4;
            card.dataset.tilting = '';
            tilting.add(card);
          }
        }
      }

      if (tilting.size) {
        const k = reduceMotion.matches ? 1 : 1 - Math.exp(-15 * dt);
        tilting.forEach(card => {
          const s = getState(card);
          s.rx += (s.tx - s.rx) * k;
          s.ry += (s.ty - s.ry) * k;
          s.lift += (s.tlift - s.lift) * k;
          if (card !== hovered && Math.abs(s.rx) < 0.008 && Math.abs(s.ry) < 0.008 && Math.abs(s.lift) < 0.02) {
            s.rx = 0; s.ry = 0; s.lift = 0;
            card.style.removeProperty('transform');
            card.style.removeProperty('--gsx');
            card.style.removeProperty('--gsy');
            delete card.dataset.tilting;
            tilting.delete(card);
          } else {
            card.style.transform = `perspective(960px) translate3d(0, ${(-s.lift).toFixed(2)}px, 0) rotateX(${s.rx.toFixed(3)}deg) rotateY(${s.ry.toFixed(3)}deg)`;
            card.style.setProperty('--gsx', `${(-s.ry * 2.1).toFixed(2)}px`);
            card.style.setProperty('--gsy', `${(s.rx * 2.1).toFixed(2)}px`);
          }
        });
      }

      if (dirtyPointer || tilting.size) {
        frame = requestAnimationFrame(tick);
      } else {
        lastNow = 0;
      }
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(tick);
    }

    addEventListener('pointermove', event => {
      px = event.clientX;
      py = event.clientY;
      setHovered(reduceMotion.matches ? null : (event.target?.closest?.('.card') || null));
      dirtyPointer = true;
      schedule();
    }, { passive: true });

    doc.addEventListener('pointerleave', releaseHover, { passive: true });
    addEventListener('blur', releaseHover, { passive: true });
    addEventListener('scroll', releaseHover, { passive: true });
  }

  /* ---------------------------------------------------------- live probes */
  const PROBE_TIMEOUT = 6000;
  const FAIL_STREAK = 2;
  const SPARK_POINTS = 16;
  const BEAT_MS = navigator.connection?.saveData ? 6000 : 3000;
  const FIRST_LAP_MS = 900;
  const LABEL = { active: 'ACTIVE', shielded: 'SHIELDED', degraded: 'DEGRADED', unreachable: 'UNREACHABLE', probing: 'PROBING' };

  const nodes = $$('.svc[data-probe]');
  const probeable = nodes.filter(n => n.dataset.probe !== 'none');
  const readings = new Map();
  const rttHistory = new Map();
  const streaks = new Map();
  let beat = 0;
  let timer = 0;

  function paint(node, status, text) {
    const dot = $('.dot', node);
    if (dot) dot.dataset.state = status;
    const label = $('.svc-label', node);
    if (label) label.textContent = LABEL[status] || status.toUpperCase();
    const rtt = $('.svc-rtt', node);
    if (rtt) rtt.textContent = text;
  }

  function spark(node) {
    const line = $('.spark polyline', node);
    if (!line) return;
    const samples = rttHistory.get(node.dataset.node) || [];
    if (!samples.length) { line.setAttribute('points', ''); return; }
    const min = Math.min(...samples);
    const span = Math.max(8, Math.max(...samples) - min);
    const step = 100 / (SPARK_POINTS - 1);
    const offset = SPARK_POINTS - samples.length;
    const pts = samples.map((v, i) => `${((offset + i) * step).toFixed(1)},${(21 - ((v - min) / span) * 18).toFixed(1)}`);
    if (pts.length === 1) pts.unshift(`${(100 - step).toFixed(1)},${pts[0].split(',')[1]}`);
    line.setAttribute('points', pts.join(' '));
  }

  async function probe(node) {
    const id = node.dataset.node;
    const mode = node.dataset.probe;
    const endpoint = node.dataset.healthEndpoint || node.dataset.endpoint;
    const controller = new AbortController();
    const abort = setTimeout(() => controller.abort(), PROBE_TIMEOUT);
    const started = performance.now();
    try {
      const res = await fetch(endpoint, { method: 'GET', mode: 'cors', cache: 'no-store', credentials: 'omit', redirect: 'follow', signal: controller.signal });
      const rtt = Math.max(1, Math.round(performance.now() - started));
      if (!res.ok) {
        res.body?.cancel().catch(() => {});
        streaks.set(id, 0);
        return { status: 'degraded', text: String(res.status), rtt: null };
      }
      if (mode === 'health') {
        const body = await res.json().catch(() => null);
        const valid = body && typeof body === 'object' && !Array.isArray(body);
        const healthy = valid && (id === 'cloud' ? body.success === true && body.code === 200 : id === 'azure' ? body.status === 'UP' : true);
        if (!healthy) { streaks.set(id, 0); return { status: 'degraded', text: 'ERR', rtt: null }; }
      } else {
        res.body?.cancel().catch(() => {});
      }
      streaks.set(id, 0);
      const samples = rttHistory.get(id) || [];
      samples.push(rtt);
      if (samples.length > SPARK_POINTS) samples.shift();
      rttHistory.set(id, samples);
      return { status: 'active', text: `${rtt} ms`, rtt };
    } catch (_) {
      const streak = (streaks.get(id) || 0) + 1;
      streaks.set(id, streak);
      const held = readings.get(id);
      if (streak < FAIL_STREAK) return held && held.status === 'active' ? held : { status: 'probing', text: '–', rtt: null };
      return { status: 'unreachable', text: navigator.onLine === false ? 'OFFLINE' : '–', rtt: null };
    } finally {
      clearTimeout(abort);
    }
  }

  function renderBoard() {
    const states = probeable.map(n => readings.get(n.dataset.node)?.status || 'probing');
    const total = states.length;
    const healthy = states.filter(s => s === 'active').length;
    const pending = states.filter(s => s === 'probing').length;
    const rtts = probeable.map(n => readings.get(n.dataset.node)?.rtt).filter(Number.isFinite);
    const avg = rtts.length ? Math.round(rtts.reduce((a, b) => a + b, 0) / rtts.length) : NaN;
    const state = healthy + pending >= total ? (pending ? 'probing' : 'active') : healthy > 0 ? 'degraded' : 'unreachable';
    setText('#board-healthy', pending === total ? '– / –' : t('liveUp').replace('{healthy}', healthy).replace('{total}', total));
    setText('#board-rtt', t('avg').replace('{ms}', Number.isFinite(avg) ? avg : '–'));
    const dot = $('#board-dot');
    if (dot) dot.dataset.state = state;
  }

  async function sample(node) {
    const result = await probe(node);
    readings.set(node.dataset.node, result);
    paint(node, result.status, result.text);
    spark(node);
    node.classList.remove('is-sampled');
    void node.offsetWidth;
    node.classList.add('is-sampled');
    renderBoard();
  }

  function heartbeat() {
    timer = 0;
    if (document.hidden || !probeable.length) return;
    sample(probeable[beat % probeable.length]);
    beat++;
    const interval = beat < probeable.length ? FIRST_LAP_MS : BEAT_MS;
    timer = setTimeout(heartbeat, interval * (.95 + Math.random() * .1));
  }
  function start() { if (!timer && !document.hidden) timer = setTimeout(heartbeat, 400); }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });

  /* ---------------------------------------------------------- current section in the top bar */
  const navLinks = $$('.top-nav a[href^="#"]');
  const spyTargets = navLinks.map(link => $(link.getAttribute('href'))).filter(Boolean);
  if (spyTargets.length && 'IntersectionObserver' in window) {
    const inBand = new Set();
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => { entry.isIntersecting ? inBand.add(entry.target.id) : inBand.delete(entry.target.id); });
      navLinks.forEach(link => {
        if (inBand.has(link.getAttribute('href').slice(1))) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-38% 0px -58% 0px' });
    spyTargets.forEach(target => spy.observe(target));
  }

  buildCalendar();
  initOdometersAndMeters();
  applyCopy();
  start();
  setTimeout(() => { delete doc.dataset.enter; }, 2400);
})();
