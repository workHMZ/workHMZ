/* Akira Portfolio — interaction and telemetry engine */

(() => {
  'use strict';

  const doc = document.documentElement;
  const body = document.body;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = t => t * t * (3 - 2 * t);

  function parseCssColor(value, fallback = { r: 16, g: 185, b: 129 }) {
    const match = String(value).match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
    if (match) return { r: +match[1], g: +match[2], b: +match[3] };
    if (String(value).trim().startsWith('#')) {
      const hex = String(value).trim().slice(1);
      const full = hex.length === 3 ? hex.split('').map(char => char + char).join('') : hex;
      if (full.length === 6) {
        return {
          r: parseInt(full.slice(0, 2), 16),
          g: parseInt(full.slice(2, 4), 16),
          b: parseInt(full.slice(4, 6), 16)
        };
      }
    }
    return { ...fallback };
  }

  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const mobileQuery = matchMedia('(max-width: 768px)');
  const navQuery = matchMedia('(max-width: 1024px)');
  const stackedQuery = matchMedia('(max-width: 992px)');
  const systemDark = matchMedia('(prefers-color-scheme: dark)');
  const saveData = Boolean(navigator.connection?.saveData);
  const I18N = window.PORTFOLIO_I18N || {};

  doc.dataset.js = 'ready';

  function debounce(fn, delay = 120) {
    let timer = 0;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  function isMobile() {
    return mobileQuery.matches;
  }

  /* The telemetry filament is the single heartbeat clock for every monitoring cue. */
  let telemetryBeatPhase = false;
  function emitTelemetryBeat() {
    telemetryBeatPhase = !telemetryBeatPhase;
    doc.classList.toggle('telemetry-beat-a', telemetryBeatPhase);
    doc.classList.toggle('telemetry-beat-b', !telemetryBeatPhase);
  }

  function onOrientationChange(handler) {
    if (screen.orientation?.addEventListener) {
      screen.orientation.addEventListener('change', handler);
      return;
    }
    addEventListener('orientationchange', handler, { passive: true });
  }

  /* Language: English copy is the DOM source of truth; Japanese comes from i18n.js. */
  let lang = doc.dataset.lang === 'ja' && I18N.ja ? 'ja' : 'en';
  const i18nNodes = $$('[data-i18n]');
  const englishCopy = new Map(i18nNodes.map(node => [node, node.innerHTML]));
  const englishTitle = document.title;
  const langToggle = $('#lang-toggle');
  const t = key => I18N[lang]?.ui?.[key] ?? I18N.en?.ui?.[key] ?? key;

  function applyCopy() {
    const dict = lang === 'ja' ? I18N.ja?.text || {} : null;
    i18nNodes.forEach(node => {
      const next = dict ? dict[node.dataset.i18n] : englishCopy.get(node);
      if (next !== undefined && node.innerHTML !== next) node.innerHTML = next;
    });
    document.title = lang === 'ja' ? I18N.ja?.title || englishTitle : englishTitle;
    doc.lang = lang;
    doc.dataset.lang = lang;
    langToggle?.setAttribute('aria-label', t('langSwitch'));
    delete doc.dataset.i18nPending;
  }

  applyCopy();

  /* Theme */
  const themeToggle = $('#theme-toggle');
  const themeIcon = themeToggle ? $('i', themeToggle) : null;

  function currentTheme() {
    return doc.dataset.theme === 'dark' ? 'dark' : 'light';
  }

  function syncThemeUI(theme) {
    if (themeIcon) themeIcon.className = theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
    if (themeToggle) {
      const label = t(theme === 'dark' ? 'themeToLight' : 'themeToDark');
      themeToggle.setAttribute('aria-label', label);
      themeToggle.title = label;
    }
    const color = theme === 'dark' ? '#0c0b0a' : '#f6f4f0';
    $$('meta[name="theme-color"]').forEach(meta => meta.setAttribute('content', color));
    dispatchEvent(new CustomEvent('portfolio-theme-change', { detail: { theme } }));
  }

  function applyTheme(theme) {
    if (theme === 'dark') doc.dataset.theme = 'dark';
    else delete doc.dataset.theme;
    syncThemeUI(theme);
    requestAnimationFrame(measureLayout);
  }

  syncThemeUI(currentTheme());

  themeToggle?.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', next); } catch (_) {}
    applyTheme(next);
  });

  /* Until the visitor picks a theme, keep following the OS (e.g. macOS Auto appearance at dusk). */
  systemDark.addEventListener?.('change', event => {
    let stored = null;
    try { stored = localStorage.getItem('theme'); } catch (_) {}
    if (!stored) applyTheme(event.matches ? 'dark' : 'light');
  });

  /* Navigation sheet */
  const navbar = $('#navbar');
  const navLinks = $('#nav-links');
  const menuToggle = $('#menu-toggle');
  const menuIcon = menuToggle ? $('i', menuToggle) : null;

  function syncMenuLabel() {
    if (!menuToggle) return;
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-label', t(open ? 'menuClose' : 'menuOpen'));
  }

  function setMenu(open) {
    if (!navLinks || !menuToggle) return;
    navLinks.classList.toggle('active', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    syncMenuLabel();
    if (menuIcon) menuIcon.className = open ? 'ri-close-line' : 'ri-menu-3-line';
    body.style.overflow = open ? 'hidden' : '';
  }

  menuToggle?.addEventListener('click', () => setMenu(!navLinks?.classList.contains('active')));
  $$('#nav-links a[href^="#"]').forEach(link => link.addEventListener('click', () => setMenu(false)));
  navQuery.addEventListener?.('change', event => { if (!event.matches) setMenu(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navLinks?.classList.contains('active')) {
      setMenu(false);
      menuToggle?.focus();
    }
  });
  syncMenuLabel();

  /* Typewriter */
  const typedText = $('#typed-text');
  let wordIndex = 0;
  let charIndex = 0;
  let deleting = false;
  let typingTimer = 0;

  function typedWords() {
    return I18N[lang]?.typed || I18N.en?.typed || ['AI Platform Engineer.'];
  }

  function scheduleType(delay) {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(typeStep, delay);
  }

  function typeStep() {
    if (!typedText || document.hidden || prefersReducedMotion.matches) return;
    const words = typedWords();
    /* Array.from keeps multi-byte Japanese characters whole. */
    const chars = Array.from(words[wordIndex % words.length]);
    charIndex += deleting ? -1 : 1;
    typedText.textContent = chars.slice(0, charIndex).join('');

    if (!deleting && charIndex >= chars.length) {
      deleting = true;
      scheduleType(2100);
      return;
    }
    if (deleting && charIndex <= 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      scheduleType(420);
      return;
    }
    scheduleType(deleting ? 40 : lang === 'ja' ? 105 : 78);
  }

  function restartTypewriter(delay = 320) {
    if (!typedText) return;
    clearTimeout(typingTimer);
    wordIndex = 0;
    charIndex = 0;
    deleting = false;
    if (prefersReducedMotion.matches) {
      typedText.textContent = typedWords()[0];
      return;
    }
    typedText.textContent = '';
    scheduleType(delay);
  }

  /* Section reveal and the track-record log */
  const revealElements = $$('.reveal');
  const recordEntries = $$('.record-entry');
  if ('IntersectionObserver' in window && !prefersReducedMotion.matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      });
    }, { threshold: isMobile() ? 0.04 : 0.08, rootMargin: '0px 0px -35px 0px' });
    revealElements.forEach(el => {
      revealObserver.observe(el);
      /* Route endpoints were measured while the section sat 22px low; re-measure once it settles. */
      el.addEventListener('transitionend', event => {
        if (event.target === el && event.propertyName === 'transform') measureLayoutDebounced();
      });
    });

    const recordObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    recordEntries.forEach(el => recordObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('active'));
    recordEntries.forEach(el => el.classList.add('is-visible'));
  }

  /* Desktop glass tilt */
  if (finePointer.matches && !prefersReducedMotion.matches) {
    $$('.glass-card').forEach(card => {
      let rect = null;
      let pointerX = 0;
      let pointerY = 0;
      let raf = 0;

      const render = () => {
        raf = 0;
        if (!rect) return;
        const x = pointerX - rect.left;
        const y = pointerY - rect.top;
        const nx = (x / rect.width) * 2 - 1;
        const ny = (y / rect.height) * 2 - 1;
        /* Wide cards tilt less, or the far edge swings out of the grid. */
        const strength = rect.width > 720 ? 2.2 : 5.5;
        card.style.setProperty('--mouse-x', `${x.toFixed(1)}px`);
        card.style.setProperty('--mouse-y', `${y.toFixed(1)}px`);
        card.style.setProperty('--rotate-x', `${(-ny * strength).toFixed(2)}deg`);
        card.style.setProperty('--rotate-y', `${(nx * strength).toFixed(2)}deg`);
        card.style.setProperty('--card-y', '-4px');
      };

      card.addEventListener('pointerenter', event => {
        rect = card.getBoundingClientRect();
        pointerX = event.clientX;
        pointerY = event.clientY;
        render();
      });
      card.addEventListener('pointermove', event => {
        if (!rect) return;
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (!raf) raf = requestAnimationFrame(render);
      });
      card.addEventListener('pointerleave', () => {
        rect = null;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        card.style.setProperty('--rotate-x', '0deg');
        card.style.setProperty('--rotate-y', '0deg');
        card.style.setProperty('--card-y', '0px');
        card.style.setProperty('--mouse-x', '-500px');
        card.style.setProperty('--mouse-y', '-500px');
      });
    });
  }

  /*
   * Capability routing: one packet per route flies from its capability card to the system
   * that runs it. Packets sit in a fixed viewport layer: mid-flight they hover around the
   * middle of the screen, so a frame-late update (Safari scrolls on its own thread) barely
   * moves them, where a document-positioned packet would shake on every wheel step.
   * Wide layouts fly an arc between grid columns; stacked layouts ride the telemetry rail.
   */
  const routingLayer = $('#capability-routing-layer');
  const sections = ['home', 'capabilities', 'systems', 'record', 'credentials'].map(id => document.getElementById(id)).filter(Boolean);
  const navItems = $$('#nav-links a[href^="#"]');
  const telemetryControllerState = $('#telemetry-controller-state');
  const observabilitySource = $('#observability-source');
  const GHOST_OPACITY = .22;

  const routes = [['ai', 'AI'], ['delivery', 'DELIVERY'], ['cloud', 'EDGE']].map(([id, label], index) => ({
    id,
    label,
    index,
    source: $(`#cap-${id} .route-source`),
    target: $(`#sys-${id} .route-target`),
    sourceCard: $(`#cap-${id}`),
    targetCard: $(`#sys-${id}`),
    packet: $(`#route-packet-${id}`),
    visible: false,
    arrived: false,
    flashed: false
  }));

  const layout = {
    width: innerWidth,
    height: innerHeight,
    sectionRanges: [],
    observabilityY: 0,
    routes: new Map()
  };

  let activeSectionId = 'home';
  let sectionJumpActive = false;
  let routeNavigationLock = false;
  let sectionJumpTimer = 0;
  let telemetryFlashTimer = 0;
  const opacityCache = new WeakMap();

  function routesEnabled() {
    return Boolean(routingLayer) && !prefersReducedMotion.matches;
  }

  function scrollYValue() {
    return window.scrollY || document.documentElement.scrollTop || 0;
  }

  function centerDoc(element, scrollY) {
    const rect = element.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 + scrollY };
  }

  function setOpacity(element, value) {
    if (!element || opacityCache.get(element) === value) return;
    opacityCache.set(element, value);
    element.style.opacity = value === 1 ? '' : String(value);
  }

  function measureLayout() {
    layout.width = innerWidth;
    layout.height = innerHeight;
    const scrollY = scrollYValue();

    layout.sectionRanges = sections.map(section => {
      const rect = section.getBoundingClientRect();
      return { id: section.id, top: rect.top + scrollY, bottom: rect.bottom + scrollY };
    });

    if (observabilitySource) layout.observabilityY = centerDoc(observabilitySource, scrollY).y;
    layout.routes.clear();
    if (!routesEnabled()) return;

    const rail = stackedQuery.matches;
    const railX = layout.width - clamp(layout.width * .06, 16, 30);

    routes.forEach(route => {
      if (!route.source || !route.target || !route.packet) return;
      const a = centerDoc(route.source, scrollY);
      const b = centerDoc(route.target, scrollY);
      /* Lift off when the source sits ~42% down the viewport, dock when the target reaches ~56%. */
      const stagger = route.index * layout.height * (rail ? .05 : .045);
      const start = a.y - layout.height * .42 + stagger;
      const end = Math.max(b.y - layout.height * .56 + stagger * .3, start + 260);
      const geometry = { a, b, start, end, color: getComputedStyle(route.packet).color };

      if (rail) {
        const x = railX - route.index * 8;
        const bend = clamp((b.y - a.y) * .12, 24, 90);
        const p1 = { x, y: a.y + bend };
        const p2 = { x, y: Math.max(p1.y + 1, b.y - bend) };
        const leg1 = Math.hypot(x - a.x, bend);
        const leg3 = Math.hypot(x - b.x, bend);
        const straight = p2.y - p1.y;
        const total = leg1 + straight + leg3;
        geometry.rail = { x, p1, p2, t1: leg1 / total, t2: (leg1 + straight) / total };
      } else {
        const arc = [56, 72, -84][route.index] || 0;
        geometry.c1 = { x: clamp(lerp(a.x, b.x, .3) + arc, 60, layout.width - 60), y: lerp(a.y, b.y, .34) };
        geometry.c2 = { x: clamp(lerp(a.x, b.x, .72) + arc * .55, 60, layout.width - 60), y: lerp(a.y, b.y, .7) };
      }
      layout.routes.set(route.id, geometry);
    });
  }

  function quadPoint(p0, c, p1, t) {
    const u = 1 - t;
    return { x: u * u * p0.x + 2 * u * t * c.x + t * t * p1.x, y: u * u * p0.y + 2 * u * t * c.y + t * t * p1.y };
  }

  function cubicPoint(p0, p1, p2, p3, t) {
    const u = 1 - t;
    const a = u * u * u;
    const b = 3 * u * u * t;
    const c = 3 * u * t * t;
    const d = t * t * t;
    return { x: a * p0.x + b * p1.x + c * p2.x + d * p3.x, y: a * p0.y + b * p1.y + c * p2.y + d * p3.y };
  }

  /* Rail paths: hop right onto the rail, run straight down it, hop left into the target icon. */
  function pathPoint(g, t) {
    if (!g.rail) return cubicPoint(g.a, g.c1, g.c2, g.b, t);
    const { rail } = g;
    if (t <= rail.t1) return quadPoint(g.a, { x: rail.x, y: g.a.y }, rail.p1, rail.t1 ? t / rail.t1 : 1);
    if (t >= rail.t2) return quadPoint(rail.p2, { x: rail.x, y: g.b.y }, g.b, (t - rail.t2) / Math.max(1e-6, 1 - rail.t2));
    return { x: rail.x, y: lerp(rail.p1.y, rail.p2.y, (t - rail.t1) / Math.max(1e-6, rail.t2 - rail.t1)) };
  }

  function hidePacket(route) {
    if (!route.packet || !route.visible) return;
    route.visible = false;
    route.packet.classList.remove('is-active', 'is-photon');
    route.packet.style.opacity = '0';
    route.packet.style.visibility = 'hidden';
  }

  /*
   * On the rail the first and last legs cross the card header, so the packet collapses into a
   * photon where it stands before it moves, and only re-expands once it sits on the target icon.
   */
  const RAIL_MORPH_SPAN = .06;

  function placePacket(route, g, rawProgress) {
    const eased = smoothstep(clamp(rawProgress, 0, 1));
    let t = eased;
    let morph;
    if (g.rail) {
      const span = RAIL_MORPH_SPAN;
      t = clamp((eased - span) / (1 - 2 * span), 0, 1);
      morph = smoothstep(clamp(Math.min(eased, 1 - eased) / span, 0, 1));
    } else {
      morph = smoothstep(clamp(Math.sin(eased * Math.PI) * 3.6, 0, 1));
    }
    const point = pathPoint(g, t);
    const viewportY = point.y - scrollState.y;

    if (viewportY < -80 || viewportY > layout.height + 80) {
      hidePacket(route);
      return;
    }

    const ahead = pathPoint(g, Math.min(1, t + .003));
    const behind = pathPoint(g, Math.max(0, t - .003));
    const scale = 1 - morph * (g.rail ? .72 : .66);
    const angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180 / Math.PI;
    const trail = clamp(36 + Math.abs(scrollState.velocity) * 4.2, 36, 76) * (.72 + morph * .38);
    const packet = route.packet;

    if (!route.visible) {
      route.visible = true;
      packet.style.visibility = 'visible';
      packet.style.opacity = '1';
      packet.classList.add('is-active');
    }
    packet.classList.toggle('is-photon', morph > .42);
    packet.style.setProperty('--packet-icon-opacity', clamp(1 - morph * 1.28, 0, 1).toFixed(2));
    packet.style.setProperty('--packet-radius', `${(13 + morph * 10).toFixed(1)}px`);
    packet.style.setProperty('--packet-angle', `${angle.toFixed(1)}deg`);
    packet.style.setProperty('--trail-length', `${(trail / scale).toFixed(0)}px`);
    packet.style.setProperty('--trail-width', `${Math.min(2.2, 1 / scale).toFixed(2)}px`);
    packet.style.transform = `translate3d(${point.x.toFixed(1)}px, ${viewportY.toFixed(1)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;

    if (rawProgress > .58 && !route.flashed) {
      route.flashed = true;
      flashTelemetry(route, 'DEPLOYED');
    }
    if (rawProgress > .95 && !route.arrived) {
      route.arrived = true;
      pulseCard(route.targetCard);
    }
    if (rawProgress < .35) route.arrived = route.flashed = false;
  }

  function pulseCard(card) {
    if (!card) return;
    card.classList.remove('route-arrival');
    requestAnimationFrame(() => {
      card.classList.add('route-arrival');
      setTimeout(() => card.classList.remove('route-arrival'), 900);
    });
  }

  function flashTelemetry(route, status) {
    const color = layout.routes.get(route.id)?.color || 'var(--color-green)';
    doc.style.setProperty('--telemetry-flash-color', color);
    doc.classList.add('telemetry-flash');
    if (telemetryControllerState) telemetryControllerState.textContent = `${route.label} ${status}`;
    clearTimeout(telemetryFlashTimer);
    telemetryFlashTimer = setTimeout(() => {
      doc.classList.remove('telemetry-flash');
      if (telemetryControllerState) telemetryControllerState.textContent = doc.classList.contains('telemetry-engaged') ? 'MONITORING' : 'STANDBY';
    }, 760);
    telemetryRouteFlash(color);
  }

  function setRouteRestingState() {
    const atTarget = activeSectionId === 'systems' || activeSectionId === 'record' || activeSectionId === 'credentials';
    const atSource = activeSectionId === 'capabilities';
    routes.forEach(route => {
      hidePacket(route);
      route.sourceCard?.classList.toggle('route-docked', atSource);
      route.targetCard?.classList.toggle('route-docked', activeSectionId === 'systems');
      setOpacity(route.source, atTarget ? GHOST_OPACITY : 1);
      setOpacity(route.target, atSource ? GHOST_OPACITY : 1);
    });
  }

  function updateRouting(scrollY) {
    if (!routesEnabled()) {
      routes.forEach(route => {
        hidePacket(route);
        setOpacity(route.source, 1);
        setOpacity(route.target, 1);
      });
      return;
    }

    if (sectionJumpActive || routeNavigationLock) {
      setRouteRestingState();
      return;
    }

    routes.forEach(route => {
      const g = layout.routes.get(route.id);
      if (!g) { hidePacket(route); return; }
      const raw = (scrollY - g.start) / Math.max(1, g.end - g.start);

      route.sourceCard?.classList.toggle('route-docked', raw < .03 && activeSectionId === 'capabilities');
      route.targetCard?.classList.toggle('route-docked', raw >= .97 && activeSectionId === 'systems');

      if (raw >= 0 && raw <= 1) {
        /* In flight: the packet is the icon, both ends show where it left and where it lands. */
        setOpacity(route.source, GHOST_OPACITY);
        setOpacity(route.target, GHOST_OPACITY);
        placePacket(route, g, raw);
        return;
      }

      hidePacket(route);
      setOpacity(route.source, raw < 0 ? 1 : GHOST_OPACITY);
      setOpacity(route.target, raw > 1 ? 1 : GHOST_OPACITY);
      if (raw < -.1) route.arrived = route.flashed = false;
    });
  }

  function updateObservability(scrollY) {
    const inNarrative = activeSectionId === 'capabilities' || activeSectionId === 'systems' || activeSectionId === 'record';
    const reachedSource = !layout.observabilityY || scrollY + layout.height * .72 >= layout.observabilityY;
    const engaged = inNarrative && reachedSource;
    doc.classList.toggle('telemetry-engaged', engaged);
    if (telemetryControllerState && !doc.classList.contains('telemetry-flash')) telemetryControllerState.textContent = engaged ? 'MONITORING' : 'STANDBY';
  }

  function updateActiveNav(scrollY) {
    let current = sections[0]?.id || 'home';
    const probe = scrollY + 190;
    layout.sectionRanges.forEach(range => { if (probe >= range.top) current = range.id; });
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 70) current = sections.at(-1)?.id || current;

    if (current === activeSectionId) return;
    activeSectionId = current;
    doc.dataset.section = current;
    navItems.forEach(item => {
      const active = item.getAttribute('href') === `#${current}`;
      item.classList.toggle('active', active);
      if (active) item.setAttribute('aria-current', 'location');
      else item.removeAttribute('aria-current');
    });
  }

  const scrollState = {
    y: scrollYValue(),
    lastY: scrollYValue(),
    velocity: 0,
    raf: 0
  };

  function renderScrollUI() {
    scrollState.raf = 0;
    navbar?.classList.toggle('scrolled', scrollState.y > 8);
    updateActiveNav(scrollState.y);
    updateObservability(scrollState.y);
    updateRouting(scrollState.y);
  }

  function requestScrollRender() {
    if (!scrollState.raf) scrollState.raf = requestAnimationFrame(renderScrollUI);
  }

  /* Glass re-blurs whatever moves behind it; the ambient drift pauses while the page is moving. */
  let scrollIdleTimer = 0;

  addEventListener('scroll', () => {
    const y = scrollYValue();
    doc.classList.add('is-scrolling');
    clearTimeout(scrollIdleTimer);
    scrollIdleTimer = setTimeout(() => doc.classList.remove('is-scrolling'), 180);
    scrollState.velocity = (y - scrollState.lastY) * .16;
    scrollState.lastY = y;
    scrollState.y = y;
    if (sectionJumpActive) {
      clearTimeout(sectionJumpTimer);
      sectionJumpTimer = setTimeout(finishSectionJump, 220);
    }
    requestScrollRender();
  }, { passive: true });

  function beginSectionJump() {
    sectionJumpActive = true;
    routeNavigationLock = true;
    doc.classList.add('section-jump-active');
    routes.forEach(hidePacket);
    clearTimeout(sectionJumpTimer);
    sectionJumpTimer = setTimeout(finishSectionJump, 1400);
  }

  function finishSectionJump() {
    if (!sectionJumpActive) return;
    sectionJumpActive = false;
    doc.classList.remove('section-jump-active');
    measureLayout();
    scrollState.y = scrollState.lastY = scrollYValue();
    requestScrollRender();
  }

  function releaseRouteNavigationLock() {
    if (!routeNavigationLock || sectionJumpActive) return;
    routeNavigationLock = false;
    requestScrollRender();
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.getAttribute('href') === '#') return;
    const target = document.querySelector(link.getAttribute('href'));
    if (target) beginSectionJump();
  });

  if ('onscrollend' in document) document.addEventListener('scrollend', finishSectionJump, { passive: true });

  addEventListener('wheel', releaseRouteNavigationLock, { passive: true });
  addEventListener('touchstart', releaseRouteNavigationLock, { passive: true });
  addEventListener('pointerdown', releaseRouteNavigationLock, { passive: true });
  document.addEventListener('keydown', event => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) releaseRouteNavigationLock();
  });

  const measureLayoutDebounced = debounce(() => {
    measureLayout();
    requestScrollRender();
  }, 150);

  addEventListener('resize', measureLayoutDebounced, { passive: true });
  stackedQuery.addEventListener?.('change', measureLayoutDebounced);
  onOrientationChange(() => setTimeout(measureLayoutDebounced, 180));
  document.fonts?.ready?.then(measureLayoutDebounced).catch(() => {});
  addEventListener('load', measureLayoutDebounced, { once: true });

  /* Endpoint health probes */
  const probeTargets = $$('[data-probe]');
  const consoleNodeCount = $('#console-node-count');
  const consoleRtt = $('#console-rtt');
  const consoleState = $('#console-state');
  const consoleSampled = $('#console-sampled');
  const NODE_META = {
    ai: { cssVar: '--route-ai-color', fallback: { r: 124, g: 58, b: 237 } },
    delivery: { cssVar: '--route-delivery-color', fallback: { r: 2, g: 132, b: 199 } },
    cloud: { cssVar: '--route-cloud-color', fallback: { r: 13, g: 148, b: 136 } },
    azure: { cssVar: '--route-platform-color', fallback: { r: 71, g: 85, b: 105 } }
  };
  Object.values(NODE_META).forEach(node => { node.color = { ...node.fallback }; });

  function syncNodeColors() {
    const styles = getComputedStyle(doc);
    Object.values(NODE_META).forEach(node => {
      node.color = parseCssColor(styles.getPropertyValue(node.cssVar), node.fallback);
    });
  }

  syncNodeColors();
  addEventListener('portfolio-theme-change', syncNodeColors);

  /*
   * Probe honesty rules. A portfolio that fakes green is worse than one that says
   * "I can't see this from here", so every node declares how it can be checked:
   *
   *   data-probe="health" - real cross-origin JSON health endpoint; status + payload checked
   *   data-probe="http"   - real cross-origin GET; HTTP status code checked
   *   data-probe="none"   - un-probeable by design (WAF challenge); never guessed at
   *
   * mode:'no-cors' is deliberately not used anywhere: an opaque response resolves for
   * every status code, so it can only ever report "reachable", never "healthy".
   */
  const PROBE_TIMEOUT = 6000;
  const FAIL_STREAK_BEFORE_UNREACHABLE = 2;
  const SPARK_POINTS = 16;
  const STATUS_LABEL = {
    active: 'ACTIVE',
    shielded: 'SHIELDED',
    degraded: 'DEGRADED',
    unreachable: 'UNREACHABLE',
    probing: 'PROBING'
  };
  /* shielded is a declared design state, not a fault - it counts as healthy. */
  const HEALTHY = new Set(['active', 'shielded']);
  const failStreaks = new Map();
  const lastGoodReading = new Map();
  const rttHistory = new Map();
  /*
   * One clock drives everything live: each heartbeat of the telemetry rail checks one node,
   * round-robin. ~2.8s reads as a resting pulse (between a heartbeat and a breath), every beat
   * wanders a few percent like real heart-rate variability, and the first lap runs quicker so
   * the control plane fills in while the visitor is still reading the hero.
   */
  const BEAT_MS = saveData ? 6000 : 2800;
  const FIRST_LAP_BEAT_MS = 1500;
  /* Respiratory rhythm: over ~5 beats the heart quickens and eases, and its spikes swell and settle. */
  const BREATH_BEATS = 5;
  let telemetryAvgLatency = NaN;
  const latestReadings = new Map();
  let lastProbeWall = 0;
  let beatTimer = 0;
  let beatCount = 0;

  function probeMode(node) {
    return node.dataset.probe || 'none';
  }

  function paintNode(id, status, latencyText) {
    const suffix = status === 'active' ? '' : ` ${status}`;
    $$(`[data-node="${id}"]`).forEach(view => {
      view.dataset.status = status;
      const statusEl = $('.node-status', view);
      if (statusEl) {
        statusEl.className = `node-status${suffix}`;
        statusEl.textContent = STATUS_LABEL[status] || status.toUpperCase();
      }
      $$('.latency-display', view).forEach(el => { el.textContent = latencyText; });
      $$('.telemetry-ping', view).forEach(el => { el.className = `telemetry-ping${suffix}`; });
    });
  }

  function renderSpark(id) {
    const samples = rttHistory.get(id) || [];
    $$(`[data-node="${id}"] .run-spark polyline`).forEach(line => {
      if (!samples.length) { line.setAttribute('points', ''); return; }
      const min = Math.min(...samples);
      const span = Math.max(8, Math.max(...samples) - min);
      const step = 100 / (SPARK_POINTS - 1);
      const offset = SPARK_POINTS - samples.length;
      const points = samples.map((value, index) => `${((offset + index) * step).toFixed(1)},${(21 - ((value - min) / span) * 18).toFixed(1)}`);
      if (points.length === 1) points.unshift(`${(100 - step).toFixed(1)},${points[0].split(',')[1]}`);
      line.setAttribute('points', points.join(' '));
    });
  }

  function settleHealthy(id, status, rtt) {
    const text = `${rtt} ms`;
    failStreaks.set(id, 0);
    lastGoodReading.set(id, { status, text });
    const history = rttHistory.get(id) || [];
    history.push(rtt);
    if (history.length > SPARK_POINTS) history.shift();
    rttHistory.set(id, history);
    paintNode(id, status, text);
    renderSpark(id);
    return { id, status, rtt };
  }

  /*
   * A thrown fetch cannot tell a dead service apart from a CORS policy, an offline
   * visitor, or an ad blocker - so it never turns the card red on the first miss.
   * Only the server answering with a bad status is treated as real evidence of trouble.
   */
  async function probeEndpoint(node) {
    const id = node.dataset.node;
    const mode = probeMode(node);
    if (mode === 'none') return { id, status: 'shielded', rtt: null };

    const endpoint = node.dataset.healthEndpoint || node.dataset.endpoint;
    if (!endpoint) return { id, status: 'shielded', rtt: null };

    /* Re-samples keep the last reading on screen; only a node never seen shows PROBING. */
    if (!lastGoodReading.has(id)) paintNode(id, 'probing', '--');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT);
    const started = performance.now();
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-store',
        credentials: 'omit',
        redirect: 'follow',
        signal: controller.signal
      });
      /* fetch settles on headers, so this is response time rather than full download time. */
      const rtt = Math.max(1, Math.round(performance.now() - started));

      if (!response.ok) {
        response.body?.cancel().catch(() => {});
        failStreaks.set(id, 0);
        lastGoodReading.delete(id);
        paintNode(id, 'degraded', `${response.status}`);
        return { id, status: 'degraded', rtt: null };
      }

      if (mode === 'health') {
        const payload = await response.json().catch(() => null);
        if (payload && (payload.success === false || (typeof payload.status === 'string' && payload.status.toUpperCase() !== 'UP'))) {
          failStreaks.set(id, 0);
          lastGoodReading.delete(id);
          paintNode(id, 'degraded', 'ERR');
          return { id, status: 'degraded', rtt: null };
        }
      } else {
        response.body?.cancel().catch(() => {});
      }

      return settleHealthy(id, 'active', rtt);
    } catch (_) {
      const streak = (failStreaks.get(id) || 0) + 1;
      failStreaks.set(id, streak);
      if (streak < FAIL_STREAK_BEFORE_UNREACHABLE) {
        /* One flaky attempt is not evidence. Keep the last good reading if we have one. */
        const held = lastGoodReading.get(id);
        if (held) paintNode(id, held.status, held.text);
        else paintNode(id, 'probing', '--');
        return { id, status: held ? held.status : 'probing', rtt: null };
      }
      lastGoodReading.delete(id);
      paintNode(id, 'unreachable', navigator.onLine === false ? 'OFFLINE' : '--');
      return { id, status: 'unreachable', rtt: null };
    } finally {
      clearTimeout(timer);
    }
  }

  const beatTargets = probeTargets.filter(node => probeMode(node) !== 'none');

  function currentStates() {
    return probeTargets.map(node => {
      const id = node.dataset.node;
      const reading = latestReadings.get(id) || { id, status: probeMode(node) === 'none' ? 'shielded' : 'probing', rtt: null };
      return { ...reading, color: NODE_META[id]?.color };
    });
  }

  function updateHeroConsole(states) {
    const total = states.length;
    const pending = states.filter(state => state.status === 'probing').length;
    const healthy = states.filter(state => HEALTHY.has(state.status)).length;
    /* Only nodes we actually timed contribute to RTT; the shielded node has no number. */
    const timed = states.map(state => state.rtt).filter(Number.isFinite);
    const average = timed.length ? timed.reduce((sum, value) => sum + value, 0) / timed.length : NaN;
    if (consoleNodeCount) consoleNodeCount.textContent = `${healthy} / ${total}`;
    if (consoleRtt) consoleRtt.textContent = Number.isFinite(average) ? `${Math.max(1, Math.round(average))} ms` : '-- ms';
    if (consoleState) {
      /* Nodes not measured yet are a boot state, not a fault. */
      const state = healthy + pending >= total ? (pending ? 'SAMPLING' : 'NOMINAL') : healthy > 0 ? 'DEGRADED' : 'OFFLINE';
      consoleState.textContent = state;
      consoleState.dataset.state = state.toLowerCase();
    }
    states.forEach(state => {
      const orbNode = $(`[data-orb-node="${state.id}"]`);
      if (!orbNode) return;
      orbNode.style.opacity = state.status === 'unreachable' ? '.35'
        : state.status === 'degraded' ? '.55'
        : state.status === 'probing' ? '.65'
        : state.status === 'shielded' ? '.8'
        : '1';
    });
    return { healthy, average };
  }

  function commitReadings() {
    const states = currentStates();
    const { healthy, average } = updateHeroConsole(states);
    telemetryAvgLatency = average;
    updateTelemetryModel(healthy, average, states);
  }

  function tickSampled() {
    if (!consoleSampled) return;
    consoleSampled.textContent = lastProbeWall ? `${Math.max(0, Math.round((Date.now() - lastProbeWall) / 1000))}s` : '--';
  }

  /*
   * The sample rides the beat that asked for it: its dot lands on that beat's peak the moment
   * the response returns (a slow node lands visibly later), and its control-plane row blinks.
   */
  function announceSample(result, pulse) {
    telemetryAttachSample(pulse, result);
    $$(`.console-node[data-node="${result.id}"]`).forEach(row => {
      row.classList.remove('is-sampled');
      void row.offsetWidth;
      row.classList.add('is-sampled');
    });
  }

  async function sampleNode(node, pulse) {
    const result = await probeEndpoint(node);
    latestReadings.set(result.id, result);
    lastProbeWall = Date.now();
    commitReadings();
    tickSampled();
    announceSample(result, pulse);
  }

  function heartbeat() {
    beatTimer = 0;
    /* Background tabs are throttled and probes would time out: rest until visible again. */
    if (document.hidden) return;
    const breath = Math.sin(beatCount / BREATH_BEATS * Math.PI * 2);
    emitTelemetryBeat();
    const pulse = telemetryPulse(breath);
    if (beatTargets.length) sampleNode(beatTargets[beatCount % beatTargets.length], pulse);
    beatCount++;
    /* The original rule still holds: a slower network makes a slower heart (+1.7ms per ms of RTT). */
    const latencyStretch = Number.isFinite(telemetryAvgLatency) ? clamp(telemetryAvgLatency * 1.7, 0, 450) : 0;
    const interval = beatCount < beatTargets.length ? FIRST_LAP_BEAT_MS : (BEAT_MS + latencyStretch) * (1 - .07 * breath);
    beatTimer = setTimeout(heartbeat, interval * (.97 + Math.random() * .06));
  }

  function startTelemetry() {
    if (beatTimer || document.hidden) return;
    commitReadings();
    beatTimer = setTimeout(heartbeat, 500);
  }

  setInterval(() => { if (!document.hidden) tickSampled(); }, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) startTelemetry(); });

  /* Telemetry pulse canvas */
  const pulseCanvas = $('#telemetry-pulse-canvas');
  const telemetry = { faults: 0, measured: 0 };
  let telemetryRouteFlash = () => {};
  let updateTelemetryModel = () => {};
  let telemetryPulse = () => null;
  let telemetryAttachSample = () => {};

  if (pulseCanvas && !prefersReducedMotion.matches) {
    const ctx = pulseCanvas.getContext('2d', { alpha: true, desynchronized: true });
    if (ctx) {
      let canvasCssWidth = 0;
      let canvasHeight = 0;
      let dpr = 1;
      let pointStep = 6;
      let pointCount = 0;
      let xPoints = new Float32Array(0);
      let raf = 0;
      let lastFrame = 0;
      let lastDraw = 0;
      let lastPulseAt = 0;
      let flashStrength = 0;
      let flashColor = { r: 52, g: 211, b: 153 };
      let gradientKey = '';
      let strokeGradient = null;
      const pulses = [];
      const LUT_MIN = -85;
      const LUT_MAX = 85;
      const LUT_SCALE = 2;
      const LUT_SIZE = (LUT_MAX - LUT_MIN) * LUT_SCALE + 1;
      /* P, QRS and T are kept apart so every beat can carry a slightly different shape. */
      const lutP = new Float32Array(LUT_SIZE);
      const lutQRS = new Float32Array(LUT_SIZE);
      const lutT = new Float32Array(LUT_SIZE);

      for (let i = 0; i < LUT_SIZE; i++) {
        const y = LUT_MIN + i / LUT_SCALE;
        lutP[i] = Math.exp(-Math.pow((y + 38) / 14, 2));
        lutQRS[i] = -Math.exp(-Math.pow((y + 14) / 6, 2)) * .18 + Math.exp(-Math.pow(y / 8, 2)) - Math.exp(-Math.pow((y - 12) / 7, 2)) * .28;
        lutT[i] = Math.exp(-Math.pow((y - 36) / 18, 2));
      }

      const sectionProfile = {
        home: { amp: .92, speed: .96 },
        capabilities: { amp: 1.04, speed: 1.00 },
        systems: { amp: 1.16, speed: 1.06 },
        record: { amp: 1.02, speed: 1.00 },
        credentials: { amp: .9, speed: .94 }
      };

      /* Green while every measured node answers; amber once one does not; orange if none do. */
      function baseTelemetryColor() {
        if (telemetry.faults && telemetry.faults >= telemetry.measured) return { r: 234, g: 88, b: 12 };
        if (telemetry.faults) return { r: 234, g: 179, b: 8 };
        return currentTheme() === 'dark' ? { r: 52, g: 211, b: 153 } : { r: 5, g: 150, b: 105 };
      }

      function resizePulseCanvas(force = false) {
        const nextHeight = Math.max(1, Math.round(innerHeight));
        const nextWidth = Math.round(clamp(innerWidth * .08, isMobile() ? 32 : 80, isMobile() ? 44 : 150));
        const heightThreshold = isMobile() ? 96 : 3;
        if (!force && Math.abs(nextHeight - canvasHeight) <= heightThreshold && Math.abs(nextWidth - canvasCssWidth) <= 2) return;

        canvasHeight = nextHeight;
        canvasCssWidth = nextWidth;
        dpr = Math.min(devicePixelRatio || 1, isMobile() ? 1.5 : 1.65);
        pointStep = isMobile() ? 8 : 6;
        pulseCanvas.width = Math.max(1, Math.round(canvasCssWidth * dpr));
        pulseCanvas.height = Math.max(1, Math.round(canvasHeight * dpr));
        pulseCanvas.style.width = `${canvasCssWidth}px`;
        pulseCanvas.style.height = `${canvasHeight}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        pointCount = Math.ceil((canvasHeight + 60) / pointStep) + 1;
        xPoints = new Float32Array(pointCount);
        gradientKey = '';
        strokeGradient = null;
      }

      function ecgOffset(pulse, y) {
        const delta = y - pulse.y;
        if (delta <= LUT_MIN || delta >= LUT_MAX) return 0;
        const i = Math.round((delta - LUT_MIN) * LUT_SCALE);
        return (lutQRS[i] + pulse.p * lutP[i] + pulse.t * lutT[i]) * pulse.amplitude;
      }

      function spawnPulse(now, profile, breath = 0) {
        const pulse = {
          y: -90,
          /* Each complex keeps its own pace, so the spacing between beats breathes as well. */
          speed: (70 + Math.random() * 12) * profile.speed,
          amplitude: (isMobile() ? 7 : 14) * profile.amp * (1 + .14 * breath) * (.94 + Math.random() * .12),
          /* No two beats share a shape: the P and T waves vary a little every time. */
          p: .17 + Math.random() * .1,
          t: .25 + Math.random() * .15,
          sample: null
        };
        pulses.push(pulse);
        lastPulseAt = now;
        return pulse;
      }

      function drawTelemetry(now, dt) {
        const profile = sectionProfile[activeSectionId] || sectionProfile.home;
        const engagedBoost = doc.classList.contains('telemetry-engaged') ? 1.08 : 1;
        const baseColor = baseTelemetryColor();
        const color = flashStrength > .02 ? {
          r: Math.round(lerp(baseColor.r, flashColor.r, flashStrength)),
          g: Math.round(lerp(baseColor.g, flashColor.g, flashStrength)),
          b: Math.round(lerp(baseColor.b, flashColor.b, flashStrength))
        } : baseColor;

        ctx.clearRect(0, 0, canvasCssWidth, canvasHeight);
        const railOffset = isMobile() ? clamp(innerWidth * .035, 7, 12) : clamp(innerWidth * .052, 30, 78);
        /* The whole filament sways with the same ~14s breath, about a pixel either way. */
        const baseX = canvasCssWidth - railOffset + Math.sin(now / 14000 * Math.PI * 2) * (isMobile() ? .7 : 1.3);

        const seconds = dt / 1000;
        pulses.forEach(pulse => { pulse.y += pulse.speed * seconds; });
        while (pulses.length && pulses[0].y > canvasHeight + 90) pulses.shift();

        const nextGradientKey = `${color.r},${color.g},${color.b},${canvasHeight}`;
        if (gradientKey !== nextGradientKey || !strokeGradient) {
          strokeGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
          strokeGradient.addColorStop(0, `rgba(${color.r},${color.g},${color.b},0)`);
          strokeGradient.addColorStop(.12, `rgb(${color.r},${color.g},${color.b})`);
          strokeGradient.addColorStop(.88, `rgb(${color.r},${color.g},${color.b})`);
          strokeGradient.addColorStop(1, `rgba(${color.r},${color.g},${color.b},0)`);
          gradientKey = nextGradientKey;
        }

        let y = -30;
        for (let i = 0; i < pointCount; i++, y += pointStep) {
          let offset = 0;
          for (let p = 0; p < pulses.length; p++) offset += ecgOffset(pulses[p], y);
          xPoints[i] = baseX + offset;
        }

        const timeSincePulse = Math.max(0, now - lastPulseAt);
        const beatProgress = clamp(timeSincePulse / 1600, 0, 1);
        const heartbeat = beatProgress < 1 ? Math.sin(beatProgress * Math.PI) * Math.exp(-beatProgress * 1.8) : 0;
        const baseAlpha = currentTheme() === 'dark' ? .15 : .18;
        ctx.save();
        ctx.globalAlpha = clamp((baseAlpha + heartbeat * .18 + flashStrength * .16) * (profile.amp + (engagedBoost - 1) * 1.5), .10, .72);
        ctx.strokeStyle = strokeGradient;
        ctx.lineWidth = isMobile() ? .9 : .98;
        ctx.beginPath();
        if (pointCount > 1) {
          let currentY = -30;
          ctx.moveTo(xPoints[0], currentY);
          for (let i = 1; i < pointCount - 1; i++) {
            const nextY = currentY + pointStep;
            ctx.quadraticCurveTo(xPoints[i], nextY, (xPoints[i] + xPoints[i + 1]) * .5, nextY + pointStep * .5);
            currentY = nextY;
          }
          ctx.lineTo(xPoints[pointCount - 1], -30 + (pointCount - 1) * pointStep);
        }
        ctx.stroke();
        ctx.restore();

        /* Sample dots sit on the peak of the beat that carried them. */
        const dark = currentTheme() === 'dark';
        pulses.forEach(pulse => {
          const sample = pulse.sample;
          if (!sample || pulse.y < -12 || pulse.y > canvasHeight + 12) return;
          let offset = 0;
          for (let p = 0; p < pulses.length; p++) offset += ecgOffset(pulses[p], pulse.y);
          const x = baseX + offset;
          const fade = clamp((now - sample.born) / 320, 0, 1);
          const { r, g, b } = sample.color;
          if (sample.hollow) {
            ctx.beginPath();
            ctx.arc(x, pulse.y, 2.2, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${r},${g},${b},${(.7 * fade).toFixed(2)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
            return;
          }
          ctx.beginPath();
          ctx.arc(x, pulse.y, 3.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${(.24 * fade).toFixed(2)})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x, pulse.y, 1.35, 0, Math.PI * 2);
          const lift = dark ? 36 : 0;
          ctx.fillStyle = `rgba(${Math.min(255, r + lift)},${Math.min(255, g + lift)},${Math.min(255, b + lift)},${(.95 * fade).toFixed(2)})`;
          ctx.fill();
        });

        flashStrength *= Math.pow(.90, dt / 16.67);
      }

      function renderTelemetry(now) {
        raf = requestAnimationFrame(renderTelemetry);
        if (document.hidden || prefersReducedMotion.matches) return;
        /*
         * The filament drifts at ~75px/s, so 30fps reads the same on a phone and halves the
         * battery cost. Safari never exposes navigator.connection, so saveData alone never fires there.
         * The 4ms slack keeps 60Hz/120Hz frame jitter from dropping us to 20fps.
         */
        const minInterval = saveData || isMobile() ? 1000 / 30 : 0;
        if (lastDraw && now - lastDraw < minInterval - 4) return;
        const dt = lastFrame ? Math.min(now - lastFrame, 50) : 16.67;
        lastFrame = now;
        lastDraw = now;
        drawTelemetry(now, dt);
      }

      telemetryPulse = (breath = 0) => {
        if (!canvasHeight) return null;
        const profile = sectionProfile[activeSectionId] || sectionProfile.home;
        const engagedBoost = doc.classList.contains('telemetry-engaged') ? 1.08 : 1;
        return spawnPulse(performance.now(), { ...profile, amp: profile.amp * engagedBoost }, breath);
      };

      /* A fresh success is its node's colour, a bad answer is amber, silence is an empty ring. */
      telemetryAttachSample = (pulse, result) => {
        if (!pulse) return;
        const fresh = result.status === 'active' && Number.isFinite(result.rtt);
        if (!fresh && result.status !== 'degraded' && result.status !== 'unreachable') return;
        const color = fresh ? NODE_META[result.id]?.color || baseTelemetryColor()
          : result.status === 'degraded' ? { r: 234, g: 179, b: 8 }
          : parseCssColor(getComputedStyle(doc).getPropertyValue('--text-muted'), { r: 148, g: 138, b: 128 });
        pulse.sample = { color, hollow: result.status === 'unreachable', born: performance.now() };
      };

      telemetryRouteFlash = colorString => {
        flashColor = parseCssColor(colorString, baseTelemetryColor());
        flashStrength = 1;
      };

      updateTelemetryModel = (healthy, average, states) => {
        const measured = states.filter(state => state.status !== 'probing' && state.status !== 'shielded');
        telemetry.measured = measured.length;
        telemetry.faults = measured.filter(state => !HEALTHY.has(state.status)).length;
      };

      const resizePulseDebounced = debounce(() => resizePulseCanvas(false), 170);
      addEventListener('resize', resizePulseDebounced, { passive: true });
      onOrientationChange(() => setTimeout(() => resizePulseCanvas(true), 180));
      addEventListener('portfolio-theme-change', () => { flashStrength = Math.max(flashStrength, .18); });
      resizePulseCanvas(true);
      raf = requestAnimationFrame(renderTelemetry);

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (raf) cancelAnimationFrame(raf);
          raf = 0;
          lastFrame = 0;
          lastDraw = 0;
        } else if (!raf) {
          raf = requestAnimationFrame(renderTelemetry);
        }
      });
    }
  }

  /* Language switch */
  function setLanguage(next) {
    lang = next === 'ja' && I18N.ja ? 'ja' : 'en';
    applyCopy();
    syncThemeUI(currentTheme());
    syncMenuLabel();
    restartTypewriter(260);
    /* Reflowed copy moves every route endpoint. */
    measureLayoutDebounced();
  }

  langToggle?.addEventListener('click', () => {
    const next = lang === 'ja' ? 'en' : 'ja';
    try { localStorage.setItem('lang', next); } catch (_) {}
    try {
      const url = new URL(location.href);
      if (url.searchParams.has('lang')) {
        url.searchParams.delete('lang');
        history.replaceState(history.state, '', url);
      }
    } catch (_) {}
    setLanguage(next);
  });

  /* Lifecycle */
  prefersReducedMotion.addEventListener?.('change', event => {
    if (event.matches) routes.forEach(hidePacket);
    restartTypewriter(320);
    measureLayoutDebounced();
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && typedText && !prefersReducedMotion.matches) scheduleType(260);
  });

  addEventListener('pagehide', event => {
    clearTimeout(typingTimer);
    clearTimeout(beatTimer);
    beatTimer = 0;
  });

  addEventListener('pageshow', event => {
    if (!event.persisted) return;
    measureLayout();
    scrollState.y = scrollState.lastY = scrollYValue();
    requestScrollRender();
    if (typedText && !prefersReducedMotion.matches) scheduleType(260);
    startTelemetry();
  });

  measureLayout();
  scrollState.y = scrollState.lastY = scrollYValue();
  renderScrollUI();
  restartTypewriter(800);
  if (!document.hidden) startTelemetry();
})();
