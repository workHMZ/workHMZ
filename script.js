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
  const desktopRouteQuery = matchMedia('(min-width: 1101px) and (hover: hover) and (pointer: fine)');
  const saveData = Boolean(navigator.connection?.saveData);

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

  /* Theme */
  const themeToggle = $('#theme-toggle');
  const themeIcon = themeToggle ? $('i', themeToggle) : null;

  function currentTheme() {
    return doc.dataset.theme === 'dark' ? 'dark' : 'light';
  }

  function syncThemeUI(theme) {
    if (themeIcon) themeIcon.className = theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
    if (themeToggle) {
      const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
      themeToggle.setAttribute('aria-label', label);
      themeToggle.title = label;
    }
    const color = theme === 'dark' ? '#0e0c0b' : '#f0f3f8';
    $$('meta[name="theme-color"]').forEach(meta => meta.setAttribute('content', color));
    dispatchEvent(new CustomEvent('portfolio-theme-change', { detail: { theme } }));
  }

  syncThemeUI(currentTheme());

  themeToggle?.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    if (next === 'dark') doc.dataset.theme = 'dark';
    else delete doc.dataset.theme;
    try { localStorage.setItem('theme', next); } catch (_) {}
    syncThemeUI(next);
    requestAnimationFrame(measureLayout);
  });

  /* Mobile navigation */
  const navbar = $('#navbar');
  const navLinks = $('#nav-links');
  const menuToggle = $('#menu-toggle');
  const menuIcon = menuToggle ? $('i', menuToggle) : null;

  function setMenu(open) {
    if (!navLinks || !menuToggle) return;
    navLinks.classList.toggle('active', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (menuIcon) menuIcon.className = open ? 'ri-close-line' : 'ri-menu-3-line';
    body.style.overflow = open ? 'hidden' : '';
  }

  menuToggle?.addEventListener('click', () => setMenu(!navLinks?.classList.contains('active')));
  $$('#nav-links a[href^="#"]').forEach(link => link.addEventListener('click', () => setMenu(false)));
  mobileQuery.addEventListener?.('change', event => { if (!event.matches) setMenu(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navLinks?.classList.contains('active')) {
      setMenu(false);
      menuToggle?.focus();
    }
  });

  /* Typewriter */
  const typedText = $('#typed-text');
  const words = [
    'DevOps / SRE-oriented Engineer.',
    'AI & LLM Infrastructure Builder.',
    'CI/CD Automation Specialist.',
    'Observability Expert.'
  ];
  let wordIndex = 0;
  let charIndex = 0;
  let deleting = false;
  let typingTimer = 0;

  function scheduleType(delay) {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(typeStep, delay);
  }

  function typeStep() {
    if (!typedText || document.hidden || prefersReducedMotion.matches) return;
    const word = words[wordIndex];
    charIndex += deleting ? -1 : 1;
    typedText.textContent = word.slice(0, charIndex);

    if (!deleting && charIndex >= word.length) {
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
    scheduleType(deleting ? 40 : 78);
  }

  if (typedText) {
    if (prefersReducedMotion.matches) typedText.textContent = words[0];
    else scheduleType(800);
  }

  /* Section reveal */
  const revealElements = $$('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion.matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      });
    }, { threshold: isMobile() ? 0.04 : 0.08, rootMargin: '0px 0px -35px 0px' });
    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('active'));
  }

  /* Mobile handoff: local pulses replace cross-screen packets. */
  if ('IntersectionObserver' in window && !desktopRouteQuery.matches && !prefersReducedMotion.matches) {
    const mobileRouteObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const card = entry.target;
        card.classList.add('route-arrival');
        setTimeout(() => card.classList.remove('route-arrival'), 760);
        observer.unobserve(card);
      });
    }, { threshold: 0.28, rootMargin: '0px 0px -8% 0px' });
    $$('.route-card').forEach(card => mobileRouteObserver.observe(card));
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
        card.style.setProperty('--mouse-x', `${x.toFixed(1)}px`);
        card.style.setProperty('--mouse-y', `${y.toFixed(1)}px`);
        card.style.setProperty('--rotate-x', `${(-ny * 5.5).toFixed(2)}deg`);
        card.style.setProperty('--rotate-y', `${(nx * 5.5).toFixed(2)}deg`);
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

  /* Touch motion lighting */
  const motionToggle = $('#motion-toggle');
  const motionIcon = motionToggle ? $('i', motionToggle) : null;
  const touchDevice = navigator.maxTouchPoints > 0 || matchMedia('(any-pointer: coarse)').matches;
  const orientationSupported = Boolean(window.isSecureContext && 'DeviceOrientationEvent' in window);
  const motionCards = $$('.glass-card');
  const visibleMotionCards = new Set();
  const motionTarget = { x: 0, y: 0 };
  const motionCurrent = { x: 0, y: 0 };
  let motionEnabled = false;
  let motionDenied = false;
  let motionBaseline = null;
  let motionRaf = 0;
  let motionLastFrame = 0;
  let motionLastInput = 0;

  if (touchDevice && orientationSupported && !prefersReducedMotion.matches) doc.classList.add('motion-capable');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle('motion-visible', entry.isIntersecting);
        if (entry.isIntersecting) visibleMotionCards.add(entry.target);
        else visibleMotionCards.delete(entry.target);
      });
    }, { rootMargin: '100px 0px', threshold: 0 });
    motionCards.forEach(card => observer.observe(card));
  } else {
    motionCards.forEach(card => {
      card.classList.add('motion-visible');
      visibleMotionCards.add(card);
    });
  }

  function orientationAngle() {
    if (Number.isFinite(screen.orientation?.angle)) return ((screen.orientation.angle % 360) + 360) % 360;
    return Number.isFinite(window.orientation) ? ((window.orientation % 360) + 360) % 360 : 0;
  }

  function normalizedOrientation(beta, gamma) {
    const angle = orientationAngle();
    if (angle === 90) return { x: beta, y: -gamma };
    if (angle === 180) return { x: -gamma, y: -beta };
    if (angle === 270) return { x: -beta, y: gamma };
    return { x: gamma, y: beta };
  }

  function angleDelta(current, reference) {
    let delta = current - reference;
    delta = (((delta + 180) % 360) + 360) % 360 - 180;
    return delta;
  }

  function handleDeviceOrientation(event) {
    if (!motionEnabled || !Number.isFinite(event.beta) || !Number.isFinite(event.gamma)) return;
    const reading = normalizedOrientation(event.beta, event.gamma);
    if (!motionBaseline) {
      motionBaseline = reading;
      return;
    }
    motionTarget.x = clamp(angleDelta(reading.x, motionBaseline.x) / 24, -1, 1);
    motionTarget.y = clamp(angleDelta(reading.y, motionBaseline.y) / 30, -1, 1);
    motionLastInput = performance.now();
    ensureMotionFrame();
  }

  function ensureMotionFrame() {
    if (motionEnabled && !motionRaf && !document.hidden) {
      motionLastFrame = 0;
      motionRaf = requestAnimationFrame(renderMotionLighting);
    }
  }

  function renderMotionLighting(now) {
    if (!motionEnabled) { motionRaf = 0; return; }
    const dt = motionLastFrame ? Math.min(now - motionLastFrame, 50) : 16.67;
    motionLastFrame = now;
    const smoothing = 1 - Math.pow(.80, dt / 16.67);
    motionCurrent.x += (motionTarget.x - motionCurrent.x) * smoothing;
    motionCurrent.y += (motionTarget.y - motionCurrent.y) * smoothing;
    const lightX = 50 + motionCurrent.x * 44;
    const lightY = 50 + motionCurrent.y * 42;
    const opacity = .55 + Math.min(1, Math.hypot(motionCurrent.x, motionCurrent.y)) * .28;

    visibleMotionCards.forEach(card => {
      card.style.setProperty('--motion-x', `${lightX.toFixed(2)}%`);
      card.style.setProperty('--motion-y', `${lightY.toFixed(2)}%`);
      card.style.setProperty('--motion-opacity', opacity.toFixed(3));
    });

    const unsettled = Math.abs(motionTarget.x - motionCurrent.x) > .0015 || Math.abs(motionTarget.y - motionCurrent.y) > .0015;
    if (unsettled || now - motionLastInput < 100) motionRaf = requestAnimationFrame(renderMotionLighting);
    else { motionRaf = 0; motionLastFrame = 0; }
  }

  function syncMotionUI() {
    if (!motionToggle) return;
    motionToggle.classList.toggle('active', motionEnabled);
    motionToggle.classList.toggle('denied', motionDenied);
    motionToggle.setAttribute('aria-pressed', String(motionEnabled));
    if (motionIcon) motionIcon.className = motionDenied ? 'ri-lock-line' : motionEnabled ? 'ri-compass-3-fill' : 'ri-compass-3-line';
    const label = motionDenied ? 'Motion access denied' : motionEnabled ? 'Disable motion lighting' : 'Enable motion lighting';
    motionToggle.title = label;
    motionToggle.setAttribute('aria-label', label);
  }

  function disableMotionLighting() {
    motionEnabled = false;
    motionBaseline = null;
    motionTarget.x = motionTarget.y = motionCurrent.x = motionCurrent.y = 0;
    removeEventListener('deviceorientation', handleDeviceOrientation);
    if (motionRaf) cancelAnimationFrame(motionRaf);
    motionRaf = 0;
    doc.classList.remove('motion-active');
    motionCards.forEach(card => {
      card.style.removeProperty('--motion-x');
      card.style.removeProperty('--motion-y');
      card.style.removeProperty('--motion-opacity');
    });
    syncMotionUI();
  }

  async function enableMotionLighting() {
    if (!orientationSupported || prefersReducedMotion.matches) return;
    try {
      let permission = 'granted';
      if (typeof DeviceOrientationEvent.requestPermission === 'function') permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== 'granted') {
        motionDenied = true;
        syncMotionUI();
        return;
      }
      motionDenied = false;
      motionEnabled = true;
      motionBaseline = null;
      motionLastInput = performance.now();
      doc.classList.add('motion-active');
      addEventListener('deviceorientation', handleDeviceOrientation, { passive: true });
      syncMotionUI();
      ensureMotionFrame();
    } catch (_) {
      motionDenied = true;
      syncMotionUI();
    }
  }

  motionToggle?.addEventListener('click', () => motionEnabled ? disableMotionLighting() : enableMotionLighting());
  syncMotionUI();
  onOrientationChange(() => { motionBaseline = null; motionTarget.x = motionTarget.y = 0; ensureMotionFrame(); });

  /* Cached layout and capability routing */
  const sections = [$('#home'), $('#expertise'), $('#projects'), $('#lab'), $('#certs')].filter(Boolean);
  const navItems = $$('#nav-links a[href^="#"]');
  const telemetryControllerState = $('#telemetry-controller-state');
  const observabilitySource = $('#observability-source');

  const routes = [
    {
      id: 'ai', label: 'AI', index: 0,
      source: $('#exp-ai .route-source'), project: $('#proj-vertex .route-project'), service: $('#svc-aichatbot .route-service'),
      sourceCard: $('#exp-ai'), projectCard: $('#proj-vertex'), serviceCard: $('#svc-aichatbot'), packet: $('#route-packet-ai')
    },
    {
      id: 'delivery', label: 'DELIVERY', index: 1,
      source: $('#exp-delivery .route-source'), project: $('#proj-tokyo .route-project'), service: $('#svc-tokyo-transit .route-service'),
      sourceCard: $('#exp-delivery'), projectCard: $('#proj-tokyo'), serviceCard: $('#svc-tokyo-transit'), packet: $('#route-packet-delivery')
    },
    {
      id: 'cloud', label: 'EDGE', index: 2,
      source: $('#exp-cloud .route-source'), project: $('#proj-r2filebox .route-project'), service: $('#svc-r2filebox .route-service'),
      sourceCard: $('#exp-cloud'), projectCard: $('#proj-r2filebox'), serviceCard: $('#svc-r2filebox'), packet: $('#route-packet-cloud')
    }
  ];

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

  function centerDoc(element, scrollY) {
    const rect = element.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 + scrollY };
  }

  function firstRouteControlPoint(a, b, routeIndex) {
    const arc = [42, 58, -66][routeIndex] || 0;
    return {
      x: clamp(lerp(a.x, b.x, .5) + arc, 86, layout.width - 86),
      y: lerp(a.y, b.y, .48)
    };
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

    if (!desktopRouteQuery.matches || prefersReducedMotion.matches) return;

    routes.forEach(route => {
      if (!route.source || !route.project || !route.service || !route.packet) return;
      const source = centerDoc(route.source, scrollY);
      const project = centerDoc(route.project, scrollY);
      const service = centerDoc(route.service, scrollY);
      const stagger = route.index * layout.height * .045;
      const firstStart = source.y - layout.height * .43 + stagger;
      const firstEnd = project.y - layout.height * .54 + stagger * .26;
      const secondStart = project.y - layout.height * .40 + stagger * .58;
      const secondEnd = service.y - layout.height * .55 + stagger * .16;
      const computed = getComputedStyle(route.packet);

      layout.routes.set(route.id, {
        source, project, service,
        c1: firstRouteControlPoint(source, project, route.index),
        c2: {
          x: lerp(project.x, service.x, .5),
          y: lerp(project.y, service.y, .5)
        },
        firstStart,
        firstEnd: Math.max(firstEnd, firstStart + 240),
        secondStart,
        secondEnd: Math.max(secondEnd, secondStart + 240),
        color: computed.color
      });
    });
  }

  function scrollYValue() {
    return window.scrollY || document.documentElement.scrollTop || 0;
  }

  function quadraticPoint(a, c, b, t) {
    const u = 1 - t;
    return {
      x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
      y: u * u * a.y + 2 * u * t * c.y + t * t * b.y
    };
  }

  function quadraticTangent(a, c, b, t) {
    return {
      x: 2 * (1 - t) * (c.x - a.x) + 2 * t * (b.x - c.x),
      y: 2 * (1 - t) * (c.y - a.y) + 2 * t * (b.y - c.y)
    };
  }

  function hidePacket(route) {
    if (!route.packet) return;
    route.packet.classList.remove('is-active');
    route.packet.classList.remove('is-photon');
    route.packet.style.opacity = '0';
    route.packet.style.visibility = 'hidden';
  }

  function setRouteNodeVisibility(route, source, project, service) {
    if (route.source) route.source.style.opacity = String(source);
    if (route.project) route.project.style.opacity = String(project);
    if (route.service) route.service.style.opacity = String(service);
  }

  function setRouteRestingState() {
    const atSource = activeSectionId === 'expertise';
    const atProject = activeSectionId === 'projects';
    const atService = activeSectionId === 'lab' || activeSectionId === 'certs';

    routes.forEach(route => {
      hidePacket(route);
      route.sourceCard?.classList.toggle('route-docked', atSource);
      route.projectCard?.classList.toggle('route-docked', atProject);
      route.serviceCard?.classList.toggle('route-docked', atService);
      setRouteNodeVisibility(route, atProject || atService ? 0 : 1, atService ? 0 : 1, 1);
    });
  }

  function placePacket(route, geometry, a, c, b, rawProgress, stage) {
    const t = smoothstep(clamp(rawProgress, 0, 1));
    const point = quadraticPoint(a, c, b, t);
    const tangent = quadraticTangent(a, c, b, t);
    const viewportY = point.y - scrollState.y;

    if (viewportY < -70 || viewportY > layout.height + 70) {
      hidePacket(route);
      return;
    }

    const transit = Math.sin(t * Math.PI);
    const morph = smoothstep(clamp(transit * 3.6, 0, 1));
    const scale = 1 - morph * .66;
    const angle = Math.atan2(tangent.y, tangent.x) * 180 / Math.PI;
    const trail = clamp(36 + Math.abs(scrollState.velocity) * 4.2, 36, 76) * (.72 + morph * .38);
    route.packet.style.visibility = 'visible';
    route.packet.style.opacity = '1';
    route.packet.classList.add('is-active');
    route.packet.classList.toggle('is-photon', morph > .42);
    route.packet.style.setProperty('--packet-icon-opacity', clamp(1 - morph * 1.28, 0, 1).toFixed(2));
    route.packet.style.setProperty('--packet-radius', `${(13 + morph * 10).toFixed(1)}px`);
    route.packet.style.setProperty('--packet-angle', `${angle.toFixed(1)}deg`);
    route.packet.style.setProperty('--trail-length', `${(trail / scale).toFixed(0)}px`);
    route.packet.style.setProperty('--trail-width', `${Math.min(2.2, 1 / scale).toFixed(2)}px`);
    route.packet.style.transform = `translate3d(${point.x.toFixed(1)}px, ${viewportY.toFixed(1)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;

    const stateKey = stage === 1 ? 'projectArrived' : 'serviceArrived';
    const flashKey = stage === 1 ? 'projectFlash' : 'serviceFlash';
    if (rawProgress > .58 && !route[flashKey]) {
      route[flashKey] = true;
      flashTelemetry(route, stage === 1 ? 'ROUTED' : 'DEPLOYED');
    }
    if (rawProgress > .95 && !route[stateKey]) {
      route[stateKey] = true;
      pulseCard(stage === 1 ? route.projectCard : route.serviceCard);
    }
    if (rawProgress < .35) {
      route[stateKey] = false;
      route[flashKey] = false;
    }
  }

  function pulseCard(card) {
    if (!card) return;
    card.classList.remove('route-arrival');
    requestAnimationFrame(() => {
      card.classList.add('route-arrival');
      setTimeout(() => card.classList.remove('route-arrival'), 760);
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

  function updateRouting(scrollY) {
    if (!desktopRouteQuery.matches || prefersReducedMotion.matches) {
      routes.forEach(route => {
        hidePacket(route);
        setRouteNodeVisibility(route, 1, 1, 1);
      });
      return;
    }

    if (sectionJumpActive || routeNavigationLock || activeSectionId === 'lab' || activeSectionId === 'certs') {
      setRouteRestingState();
      return;
    }

    routes.forEach(route => {
      const g = layout.routes.get(route.id);
      if (!g) { hidePacket(route); return; }

      const firstProgress = (scrollY - g.firstStart) / Math.max(1, g.firstEnd - g.firstStart);
      const secondProgress = (scrollY - g.secondStart) / Math.max(1, g.secondEnd - g.secondStart);

      route.sourceCard?.classList.toggle('route-docked', firstProgress < .03 && activeSectionId === 'expertise');
      route.projectCard?.classList.toggle('route-docked', firstProgress >= .97 && secondProgress < .18);
      route.serviceCard?.classList.toggle('route-docked', secondProgress >= .96);

      if (firstProgress >= 0 && firstProgress <= 1) {
        setRouteNodeVisibility(route, 0, 0, 1);
        placePacket(route, g, g.source, g.c1, g.project, firstProgress, 1);
        return;
      }
      if (secondProgress >= 0 && secondProgress <= 1) {
        setRouteNodeVisibility(route, 0, 0, 0);
        placePacket(route, g, g.project, g.c2, g.service, secondProgress, 2);
        return;
      }
      hidePacket(route);

      if (scrollY < g.firstStart) setRouteNodeVisibility(route, 1, 1, 1);
      else if (scrollY < g.secondStart) setRouteNodeVisibility(route, 0, 1, 1);
      else setRouteNodeVisibility(route, 0, 0, 1);

      if (scrollY < g.firstStart - 100) {
        route.projectArrived = route.serviceArrived = route.projectFlash = route.serviceFlash = false;
      }
    });
  }

  function updateObservability(scrollY) {
    const inNarrative = activeSectionId === 'expertise' || activeSectionId === 'projects' || activeSectionId === 'lab';
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

    if (current !== activeSectionId) {
      activeSectionId = current;
      doc.dataset.section = current;
    }
    navItems.forEach(item => item.classList.toggle('active', item.getAttribute('href') === `#${current}`));
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

  addEventListener('scroll', () => {
    const y = scrollYValue();
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
  desktopRouteQuery.addEventListener?.('change', measureLayoutDebounced);
  onOrientationChange(() => setTimeout(measureLayoutDebounced, 180));
  document.fonts?.ready?.then(measureLayoutDebounced).catch(() => {});

  /* Endpoint health probes */
  const dashboardNodes = $$('.dashboard-node');
  const labSection = $('#lab');
  const consoleNodeCount = $('#console-node-count');
  const consoleRtt = $('#console-rtt');
  const consoleState = $('#console-state');
  const orbNodes = [$('.orb-node.node-a'), $('.orb-node.node-b'), $('.orb-node.node-c')];
  const NODE_META = {
    'svc-aichatbot': { cssVar: '--route-ai-color', fallback: { r: 124, g: 58, b: 237 }, color: { r: 124, g: 58, b: 237 } },
    'svc-tokyo-transit': { cssVar: '--route-delivery-color', fallback: { r: 2, g: 132, b: 199 }, color: { r: 2, g: 132, b: 199 } },
    'svc-r2filebox': { cssVar: '--route-cloud-color', fallback: { r: 13, g: 148, b: 136 }, color: { r: 13, g: 148, b: 136 } }
  };

  function syncNodeColors() {
    const styles = getComputedStyle(doc);
    Object.values(NODE_META).forEach(node => {
      node.color = parseCssColor(styles.getPropertyValue(node.cssVar), node.fallback);
    });
  }

  syncNodeColors();
  addEventListener('portfolio-theme-change', syncNodeColors);
  let telemetryStarted = false;
  let probeInterval = 0;

  function updateHeroConsole(activeCount, averageLatency, probing, states) {
    if (consoleNodeCount) consoleNodeCount.textContent = `${activeCount} / ${dashboardNodes.length || 3}`;
    if (consoleRtt) consoleRtt.textContent = probing ? '…' : `${Math.max(0, Math.round(averageLatency))} ms`;
    if (consoleState) {
      const state = probing ? 'SAMPLING' : activeCount >= dashboardNodes.length ? 'NOMINAL' : activeCount > 0 ? 'DEGRADED' : 'OFFLINE';
      consoleState.textContent = state;
      consoleState.dataset.state = state.toLowerCase();
    }
    states?.forEach((state, index) => {
      if (orbNodes[index]) orbNodes[index].style.opacity = state.status === 'offline' ? '.35' : state.status === 'probing' ? '.65' : '1';
    });
  }

  async function probeEndpoint(node) {
    const healthEndpoint = node.dataset.healthEndpoint;
    const endpoint = healthEndpoint || node.dataset.endpoint;
    const statusEl = $('.node-status', node);
    const latencyEl = $('.latency-display', node);
    const pingEl = $('.telemetry-ping', node);
    if (!endpoint || !statusEl || !latencyEl) return null;

    statusEl.className = 'node-status probing';
    statusEl.textContent = 'PROBING';
    if (pingEl) pingEl.className = 'telemetry-ping probing';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const started = performance.now();
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        mode: healthEndpoint ? 'cors' : 'no-cors',
        cache: 'no-store',
        signal: controller.signal
      });
      if (healthEndpoint && !response.ok) throw new Error(`Health probe returned ${response.status}`);
      const rtt = Math.max(1, Math.round(performance.now() - started));
      setNodeActive(statusEl, latencyEl, pingEl, rtt);
      return rtt;
    } catch (_) {
      statusEl.className = 'node-status offline';
      statusEl.textContent = 'OFFLINE';
      latencyEl.textContent = '--';
      if (pingEl) pingEl.className = 'telemetry-ping offline';
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  function setNodeActive(statusEl, latencyEl, pingEl, rtt) {
    statusEl.className = 'node-status';
    statusEl.textContent = 'ACTIVE';
    latencyEl.textContent = `${rtt} ms`;
    if (pingEl) pingEl.className = 'telemetry-ping';
  }

  async function runTelemetryProbes() {
    if (document.hidden) return;
    const probingStates = dashboardNodes.map(node => ({ id: node.id, status: 'probing', color: NODE_META[node.id]?.color }));
    updateTelemetryModel(dashboardNodes.length, 120, true, probingStates);
    updateHeroConsole(dashboardNodes.length, 120, true, probingStates);

    const results = await Promise.all(dashboardNodes.map(probeEndpoint));
    const valid = results.filter(Number.isFinite);
    const count = valid.length;
    const average = count ? Math.round(valid.reduce((sum, value) => sum + value, 0) / count) : 250;
    const states = dashboardNodes.map(node => {
      const statusEl = $('.node-status', node);
      const status = statusEl?.classList.contains('offline') ? 'offline' : statusEl?.classList.contains('probing') ? 'probing' : 'active';
      return { id: node.id, status, color: NODE_META[node.id]?.color };
    });
    updateTelemetryModel(count, average, false, states);
    updateHeroConsole(count, average, false, states);
  }

  function startTelemetry() {
    if (telemetryStarted) return;
    telemetryStarted = true;
    const run = () => {
      if ('requestIdleCallback' in window) requestIdleCallback(runTelemetryProbes, { timeout: 1500 });
      else setTimeout(runTelemetryProbes, 220);
    };
    run();
    probeInterval = setInterval(runTelemetryProbes, saveData ? 60000 : 20000);
  }

  if (labSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      startTelemetry();
      observer.disconnect();
    }, { rootMargin: '600px 0px' });
    observer.observe(labSection);
  } else {
    setTimeout(startTelemetry, 1400);
  }

  /* Telemetry pulse canvas */
  const pulseCanvas = $('#telemetry-pulse-canvas');
  const telemetry = {
    activeNodes: 3,
    avgLatency: 80,
    probing: false,
    nodeStates: Object.entries(NODE_META).map(([id, node]) => ({ id, status: 'active', color: node.color }))
  };
  let telemetryRouteFlash = () => {};
  let updateTelemetryModel = () => {};

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
      let nextPhotonAt = 0;
      let flashStrength = 0;
      let flashColor = { r: 16, g: 185, b: 129 };
      let gradientKey = '';
      let strokeGradient = null;
      const pulses = [];
      const photons = [];
      const LUT_MIN = -85;
      const LUT_MAX = 85;
      const LUT_SCALE = 2;
      const ecgLut = new Float32Array((LUT_MAX - LUT_MIN) * LUT_SCALE + 1);

      for (let i = 0; i < ecgLut.length; i++) {
        const y = LUT_MIN + i / LUT_SCALE;
        const p = Math.exp(-Math.pow((y + 38) / 14, 2)) * .22;
        const q = -Math.exp(-Math.pow((y + 14) / 6, 2)) * .18;
        const r = Math.exp(-Math.pow(y / 8, 2));
        const s = -Math.exp(-Math.pow((y - 12) / 7, 2)) * .28;
        const t = Math.exp(-Math.pow((y - 36) / 18, 2)) * .32;
        ecgLut[i] = p + q + r + s + t;
      }

      const sectionProfile = {
        home: { amp: .88, speed: .95, photons: .18 },
        expertise: { amp: 1.02, speed: 1.00, photons: .36 },
        projects: { amp: 1.10, speed: 1.04, photons: .48 },
        lab: { amp: 1.18, speed: 1.07, photons: .58 },
        certs: { amp: .90, speed: .94, photons: .16 }
      };

      function baseTelemetryColor() {
        if (telemetry.probing) return { r: 234, g: 179, b: 8 };
        if (telemetry.activeNodes <= 0) return { r: 234, g: 88, b: 12 };
        if (telemetry.activeNodes < dashboardNodes.length) return { r: 234, g: 179, b: 8 };
        return currentTheme() === 'dark' ? { r: 16, g: 185, b: 129 } : { r: 13, g: 148, b: 136 };
      }

      function resizePulseCanvas(force = false) {
        const nextHeight = Math.max(1, Math.round(innerHeight));
        const nextWidth = Math.round(clamp(innerWidth * .08, isMobile() ? 32 : 80, isMobile() ? 44 : 150));
        const heightThreshold = isMobile() ? 96 : 3;
        if (!force && Math.abs(nextHeight - canvasHeight) <= heightThreshold && Math.abs(nextWidth - canvasCssWidth) <= 2) return;

        canvasHeight = nextHeight;
        canvasCssWidth = nextWidth;
        dpr = Math.min(devicePixelRatio || 1, isMobile() ? 1.15 : 1.65);
        pointStep = isMobile() ? 9 : 6;
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

      function ecgOffset(pulseY, y, amplitude) {
        const delta = y - pulseY;
        if (delta <= LUT_MIN || delta >= LUT_MAX) return 0;
        return ecgLut[Math.round((delta - LUT_MIN) * LUT_SCALE)] * amplitude;
      }

      function spawnPulse(now, profile) {
        pulses.push({
          y: -90,
          speed: (72 + Math.random() * 11) * profile.speed,
          amplitude: (isMobile() ? 6.2 : 14) * profile.amp * (.88 + Math.random() * .20)
        });
        lastPulseAt = now;
        emitTelemetryBeat();
      }

      function spawnPhoton(profile) {
        const active = telemetry.nodeStates.filter(node => node.status === 'active');
        if (!active.length || photons.length >= (isMobile() ? 4 : 8)) return;
        const node = active[Math.floor(Math.random() * active.length)];
        photons.push({ y: -8, speed: (82 + Math.random() * 32) * profile.speed, alpha: .62 + Math.random() * .28, size: isMobile() ? .9 : 1.08, color: node.color || baseTelemetryColor() });
        nextPhotonAt = performance.now() + lerp(1500, 720, profile.photons);
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
        const baseX = canvasCssWidth - railOffset;

        if (!lastPulseAt || now - lastPulseAt > clamp(3050 + telemetry.avgLatency * 1.7, 3050, 3500)) spawnPulse(now, { ...profile, amp: profile.amp * engagedBoost });
        if (!nextPhotonAt || now >= nextPhotonAt) spawnPhoton(profile);

        const seconds = dt / 1000;
        pulses.forEach(pulse => { pulse.y += pulse.speed * seconds; });
        photons.forEach(photon => { photon.y += photon.speed * seconds; });
        while (pulses.length && pulses[0].y > canvasHeight + 90) pulses.shift();
        while (photons.length && photons[0].y > canvasHeight + 15) photons.shift();

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
          for (let p = 0; p < pulses.length; p++) offset += ecgOffset(pulses[p].y, y, pulses[p].amplitude);
          xPoints[i] = baseX + offset;
        }

        const timeSincePulse = Math.max(0, now - lastPulseAt);
        const beatProgress = clamp(timeSincePulse / 1600, 0, 1);
        const heartbeat = beatProgress < 1 ? Math.sin(beatProgress * Math.PI) * Math.exp(-beatProgress * 1.8) : 0;
        const baseAlpha = currentTheme() === 'dark' ? .15 : .18;
        ctx.save();
        ctx.globalAlpha = clamp((baseAlpha + heartbeat * .18 + flashStrength * .16) * (profile.amp + (engagedBoost - 1) * 1.5), .10, .72);
        ctx.strokeStyle = strokeGradient;
        ctx.lineWidth = isMobile() ? .82 : .98;
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

        photons.forEach(photon => {
          let offset = 0;
          for (let p = 0; p < pulses.length; p++) offset += ecgOffset(pulses[p].y, photon.y, pulses[p].amplitude);
          const x = baseX + offset;
          const haloAlpha = clamp(.18 + heartbeat * .11 + flashStrength * .12, .16, .52);
          ctx.beginPath();
          ctx.arc(x, photon.y, photon.size * 2.65, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${photon.color.r},${photon.color.g},${photon.color.b},${haloAlpha.toFixed(2)})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x, photon.y, photon.size, 0, Math.PI * 2);
          const lift = currentTheme() === 'dark' ? 42 : 0;
          ctx.fillStyle = `rgba(${Math.min(255, photon.color.r + lift)},${Math.min(255, photon.color.g + lift)},${Math.min(255, photon.color.b + lift)},${photon.alpha.toFixed(2)})`;
          ctx.fill();
          if (currentTheme() === 'dark') {
            ctx.beginPath();
            ctx.arc(x, photon.y, Math.max(.35, photon.size * .33), 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,.82)';
            ctx.fill();
          }
        });

        flashStrength *= Math.pow(.90, dt / 16.67);
      }

      function renderTelemetry(now) {
        raf = requestAnimationFrame(renderTelemetry);
        if (document.hidden || prefersReducedMotion.matches) return;
        const minInterval = saveData ? 1000 / 30 : 0;
        if (lastDraw && now - lastDraw < minInterval) return;
        const dt = lastFrame ? Math.min(now - lastFrame, 50) : 16.67;
        lastFrame = now;
        lastDraw = now;
        drawTelemetry(now, dt);
      }

      telemetryRouteFlash = colorString => {
        flashColor = parseCssColor(colorString, baseTelemetryColor());
        flashStrength = 1;
        lastPulseAt = 0;
      };

      updateTelemetryModel = (activeNodes, avgLatency, probing, states) => {
        telemetry.activeNodes = activeNodes;
        telemetry.avgLatency = avgLatency;
        telemetry.probing = probing;
        if (Array.isArray(states)) telemetry.nodeStates = states;
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

  /* Lifecycle */
  prefersReducedMotion.addEventListener?.('change', event => {
    if (event.matches) {
      disableMotionLighting();
      doc.classList.remove('motion-capable');
      routes.forEach(hidePacket);
    } else if (touchDevice && orientationSupported) {
      doc.classList.add('motion-capable');
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && motionRaf) {
      cancelAnimationFrame(motionRaf);
      motionRaf = 0;
    } else {
      if (motionEnabled) ensureMotionFrame();
      if (typedText && !prefersReducedMotion.matches) scheduleType(260);
    }
  });

  addEventListener('pagehide', event => {
    clearTimeout(typingTimer);
    if (!event.persisted) clearInterval(probeInterval);
  });

  addEventListener('pageshow', event => {
    if (!event.persisted) return;
    measureLayout();
    scrollState.y = scrollState.lastY = scrollYValue();
    requestScrollRender();
    if (typedText && !prefersReducedMotion.matches) scheduleType(260);
  });

  measureLayout();
  scrollState.y = scrollState.lastY = scrollYValue();
  renderScrollUI();
})();
