document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // ============================================
  // 1. LOADING SCREEN
  // ============================================
  const loadingScreen = document.querySelector('.loading-screen');
  const loadingFill = document.querySelector('.loading-bar__fill');
  let loadProgress = 0;
  function animateLoading() {
    loadProgress = Math.min(loadProgress + Math.random() * 15 + 5, 100);
    if (loadingFill) loadingFill.style.width = loadProgress + '%';
    if (loadProgress < 100) {
      setTimeout(animateLoading, 80 + Math.random() * 150);
    } else {
      setTimeout(() => {
        if (loadingScreen) loadingScreen.classList.add('hidden');
        setTimeout(initAllAscii, 200);
      }, 350);
    }
  }
  animateLoading();

  // ============================================
  // 2. PERFORMANT SCROLL ENGINE
  // Key optimization: targets update ONLY on scroll,
  // lerp runs every frame (cheap math only)
  // ============================================
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;
  function easeOutExpo(t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  function easeOutQuart(t) { const u = 1 - t; return 1 - u * u * u * u; }

  // --- Collect animated elements ---
  const items = [];

  // Reveals
  document.querySelectorAll('.reveal').forEach((el, i) => {
    const parent = el.parentElement;
    const sibs = parent ? parent.querySelectorAll('.reveal') : [el];
    const idx = Array.from(sibs).indexOf(el);
    items.push({ el, type: 'reveal', stagger: idx * 0.04, speed: 0.06,
      cur: { op: 0, a: 60, b: 6 },  // a=ty, b=blur
      tgt: { op: 0, a: 60, b: 6 }
    });
  });

  // Scroll text lines
  document.querySelectorAll('.scroll-text__line').forEach((el, i) => {
    items.push({ el, type: 'text', stagger: i * 0.1, speed: 0.045,
      cur: { op: 0, a: 120, b: 0.88, c: 4 },  // a=ty, b=scale, c=rotateX
      tgt: { op: 0, a: 120, b: 0.88, c: 4 }
    });
  });

  // Section labels
  document.querySelectorAll('.section__label').forEach(el => {
    items.push({ el, type: 'label', stagger: 0, speed: 0.05,
      cur: { op: 0, a: -30 },  // a=tx
      tgt: { op: 0, a: -30 }
    });
  });

  // Stats
  document.querySelectorAll('.stat').forEach((el, i) => {
    items.push({ el, type: 'stat', stagger: i * 0.06, speed: 0.055,
      cur: { op: 0, a: 40, b: 0.9 },  // a=ty, b=scale
      tgt: { op: 0, a: 40, b: 0.9 }
    });
  });

  // Timeline items
  document.querySelectorAll('.timeline__item').forEach((el, i) => {
    items.push({ el, type: 'timeline', stagger: i * 0.08, speed: 0.05,
      cur: { op: 0, a: -40 },  // a=tx
      tgt: { op: 0, a: -40 }
    });
  });

  // Portfolio cards
  document.querySelectorAll('.portfolio-card').forEach((el, i) => {
    items.push({ el, type: 'card', stagger: i * 0.07, speed: 0.05,
      cur: { op: 0, a: 50, b: 0.92 },  // a=ty, b=scale
      tgt: { op: 0, a: 50, b: 0.92 }
    });
  });

  // --- SCROLL TARGETS (only recalculate on scroll) ---
  let scrollDirty = true;

  // Pre-calculate positions to avoid layout thrashing on scroll
  function calcPositions() {
    const sy = window.scrollY || document.documentElement.scrollTop;
    for (let i = 0, len = items.length; i < len; i++) {
      const d = items[i];
      const rect = d.el.getBoundingClientRect();
      d.absTop = rect.top + sy;
      d.absBot = rect.bottom + sy;
    }
    scrollDirty = true;
  }
  
  // Calculate once, and on resize
  setTimeout(calcPositions, 500); // give time for layout
  window.addEventListener('resize', calcPositions, { passive: true });

  function recalcTargets() {
    const vh = window.innerHeight;
    const sy = window.scrollY;
    for (let i = 0, len = items.length; i < len; i++) {
      const d = items[i];
      if (!d.absTop) continue; // safety check
      const top = d.absTop - sy;
      const bot = d.absBot - sy;

      switch (d.type) {
        case 'reveal': {
          const enterP = clamp((vh - top) / (vh * 0.55) - d.stagger, 0, 1);
          const exitP = bot < vh * 0.12 ? clamp(bot / (vh * 0.12), 0, 1) : 1;
          const e = easeOutExpo(enterP);
          d.tgt.op = e * exitP;
          d.tgt.a = 60 * (1 - e) - 25 * (1 - exitP);  // ty
          d.tgt.b = 6 * (1 - e);  // blur
          break;
        }
        case 'text': {
          const enterP = clamp((vh - top) / (vh * 0.6) - d.stagger, 0, 1);
          const exitP = top < vh * 0.15 ? clamp(top / (vh * 0.15), 0, 1) : 1;
          const e = easeOutExpo(enterP);
          d.tgt.op = e * exitP;
          d.tgt.a = 120 * (1 - e) - 60 * (1 - exitP);  // ty
          d.tgt.b = 0.88 + 0.12 * e;  // scale
          d.tgt.c = 4 * (1 - e);  // rotateX
          break;
        }
        case 'label': {
          const p = easeOutQuart(clamp((vh - top) / (vh * 0.4), 0, 1));
          const exitP = bot < vh * 0.1 ? clamp(bot / (vh * 0.1), 0, 1) : 1;
          d.tgt.op = p * exitP;
          d.tgt.a = -30 * (1 - p);  // tx
          break;
        }
        case 'stat': {
          const p = easeOutExpo(clamp((vh - top) / (vh * 0.5) - d.stagger, 0, 1));
          const exitP = bot < vh * 0.1 ? clamp(bot / (vh * 0.1), 0, 1) : 1;
          d.tgt.op = p * exitP;
          d.tgt.a = 40 * (1 - p);  // ty
          d.tgt.b = 0.9 + 0.1 * p;  // scale
          break;
        }
        case 'timeline': {
          const p = easeOutQuart(clamp((vh - top) / (vh * 0.45) - d.stagger, 0, 1));
          const exitP = bot < vh * 0.1 ? clamp(bot / (vh * 0.1), 0, 1) : 1;
          d.tgt.op = p * exitP;
          d.tgt.a = -40 * (1 - p);  // tx
          break;
        }
        case 'card': {
          const p = easeOutExpo(clamp((vh - top) / (vh * 0.5) - d.stagger, 0, 1));
          const exitP = bot < vh * 0.1 ? clamp(bot / (vh * 0.1), 0, 1) : 1;
          d.tgt.op = p * exitP;
          d.tgt.a = 50 * (1 - p);  // ty
          d.tgt.b = 0.92 + 0.08 * p;  // scale
          break;
        }
      }
    }
  }

  // Listen for scroll — set dirty flag only
  window.addEventListener('scroll', () => { scrollDirty = true; }, { passive: true });

  // --- APPLY LERP (runs every frame, only cheap math) ---
  function applyLerp() {
    for (let i = 0, len = items.length; i < len; i++) {
      const d = items[i];
      const s = d.speed;
      const c = d.cur, t = d.tgt;

      c.op = lerp(c.op, t.op, s);
      c.a  = lerp(c.a,  t.a,  s);
      if (t.b !== undefined) c.b = lerp(c.b, t.b, s);
      if (t.c !== undefined) c.c = lerp(c.c, t.c, s);

      const opStr = c.op < 0.001 ? '0' : c.op > 0.999 ? '1' : c.op.toFixed(2);

      switch (d.type) {
        case 'reveal':
          d.el.style.cssText = 'opacity:' + opStr +
            ';transform:translateY(' + c.a.toFixed(1) + 'px)' +
            (c.b > 0.3 ? ';filter:blur(' + c.b.toFixed(1) + 'px)' : '');
          break;
        case 'text':
          d.el.style.cssText = 'opacity:' + opStr +
            ';transform:translateY(' + c.a.toFixed(1) + 'px) scale(' + c.b.toFixed(3) +
            ') perspective(800px) rotateX(' + c.c.toFixed(1) + 'deg)';
          break;
        case 'label':
          d.el.style.cssText = 'opacity:' + opStr +
            ';transform:translateX(' + c.a.toFixed(1) + 'px)';
          break;
        case 'stat':
          d.el.style.cssText = 'opacity:' + opStr +
            ';transform:translateY(' + c.a.toFixed(1) + 'px) scale(' + c.b.toFixed(3) + ')';
          break;
        case 'timeline':
          d.el.style.cssText = 'opacity:' + opStr +
            ';transform:translateX(' + c.a.toFixed(1) + 'px)';
          break;
        case 'card':
          d.el.style.cssText = 'opacity:' + opStr +
            ';transform:translateY(' + c.a.toFixed(1) + 'px) scale(' + c.b.toFixed(3) + ')';
          break;
      }
    }
  }

  // --- CUSTOM CURSOR (merged into main loop) ---
  const cursor = document.querySelector('.custom-cursor');
  const hasCursor = cursor && window.matchMedia('(hover:hover) and (min-width:800px)').matches;
  let mx = 0, my = 0, cx = 0, cy = 0;
  if (hasCursor) {
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    document.querySelectorAll('a,button,[role=button],.portfolio-card,.corner-letter,.cta__button,.skill-tag').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
  }

  // --- CORNER + HERO BAR ---
  const corners = document.querySelectorAll('.corner-letter');
  const heroBar = document.getElementById('hero-bar');
  const heroSec = document.getElementById('hero');
  let cornerCur = 1, cornerTgt = 1;
  let heroCur = 1, heroTgt = 1;

  // --- SINGLE ANIMATION LOOP ---
  function tick() {
    requestAnimationFrame(tick);

    // Recalc targets only when scroll changed
    if (scrollDirty) {
      scrollDirty = false;
      recalcTargets();

      // Corner + hero bar targets
      const sy = window.scrollY;
      const hh = heroSec ? heroSec.offsetHeight : window.innerHeight;
      const r = clamp(sy / (hh * 0.35), 0, 1);
      cornerTgt = 1 - r;
      heroTgt = 1 - easeOutQuart(r);
    }

    // Lerp all animated elements (cheap)
    applyLerp();

    // Lerp corners
    cornerCur = lerp(cornerCur, cornerTgt, 0.06);
    heroCur = lerp(heroCur, heroTgt, 0.06);
    const co = cornerCur < 0.01 ? '0' : cornerCur > 0.99 ? '1' : cornerCur.toFixed(2);
    const ho = heroCur < 0.01 ? '0' : heroCur > 0.99 ? '1' : heroCur.toFixed(2);
    for (let i = 0; i < corners.length; i++) corners[i].style.opacity = co;
    if (heroBar) heroBar.style.opacity = ho;

    // Cursor (in same loop — no separate rAF)
    if (hasCursor) {
      cx = lerp(cx, mx, 0.15);
      cy = lerp(cy, my, 0.15);
      cursor.style.transform = 'translate(' + (cx - 4) + 'px,' + (cy - 4) + 'px)';
    }
  }
  // Kick off
  recalcTargets();
  requestAnimationFrame(tick);

  // ============================================
  // 3. NAV
  // ============================================
  const centerNav = document.querySelector('.center-nav');
  const menuToggle = document.getElementById('menu-toggle');
  if (menuToggle && centerNav) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      centerNav.classList.toggle('open');
      if (centerNav.classList.contains('open') && !navDragonInited) {
        const nc = document.getElementById('nav-dragon-canvas');
        if (nc && window.AsciiImage) {
          navDragonInited = true;
          new AsciiImage(nc, { fontSize: 7, style: 'geometric', seed: 42 }).setupCanvas();
        }
      }
    });
    
    document.addEventListener('click', (e) => {
      if (centerNav.classList.contains('open') && !centerNav.contains(e.target)) {
        centerNav.classList.remove('open');
      }
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        centerNav.classList.remove('open');
        const targetId = item.getAttribute('data-target');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  

  // ============================================
  // 4. THEME SWITCHER
  // ============================================
  const savedTheme = localStorage.getItem('dragonfly-theme') || 'orange';
  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('dragonfly-theme', t);
    document.querySelectorAll('.theme-dot, .theme-bar-item').forEach(d => {
      d.classList.toggle('active', d.getAttribute('data-theme') === t);
    });
  }
  setTheme(savedTheme);
  document.querySelectorAll('.theme-dot, .theme-bar-item').forEach(d => {
    d.addEventListener('click', () => { const t = d.getAttribute('data-theme'); if (t) setTheme(t); });
  });

  // ============================================
  // 5. COUNTERS
  // ============================================
  const statNums = document.querySelectorAll('.stat__number[data-target]');
  const countedSet = new Set();
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting && !countedSet.has(e.target)) { countedSet.add(e.target); animateCounter(e.target); } });
    }, { threshold: 0.5 });
    statNums.forEach(el => co.observe(el));
  }
  function animateCounter(el) {
    const tgt = el.getAttribute('data-target'), suffix = el.getAttribute('data-suffix') || '', numT = parseFloat(tgt), dur = 2200, start = performance.now();
    (function upd(now) {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.floor(numT * easeOutExpo(p)) + suffix;
      if (p < 1) requestAnimationFrame(upd); else el.textContent = tgt + suffix;
    })(start);
  }

  // ============================================
  // 6. ASCII ART
  // ============================================
  let dragon3d = null, navDragonInited = false;
  function initAllAscii() {
    const hc = document.getElementById('hero-ascii-canvas');
    if (hc && window.AsciiBackground) new AsciiBackground(hc, { fontSize: window.innerWidth < 800 ? 7 : 10, maxFps: window.innerWidth < 800 ? 10 : 14 }).start();
    const dc = document.getElementById('dragon-3d-canvas');
    if (dc && window.Dragon3D) dragon3d = new Dragon3D(dc, { fontSize: window.innerWidth < 800 ? 5 : 7, maxFps: window.innerWidth < 800 ? 8 : 12 });
    const fc = document.getElementById('featured-project-canvas');
    if (fc && window.AsciiImage) new AsciiImage(fc, { fontSize: 10, style: 'circuit', seed: 777 }).setupCanvas();
    document.querySelectorAll('.portfolio-card__canvas').forEach((c, i) => {
      if (window.AsciiImage) new AsciiImage(c, { fontSize: 9, style: ['geometric','circuit','wave'][i%3], seed: 100+i*257 }).setupCanvas();
    });
    
  }
  const d3s = document.getElementById('dragon-3d');
  if ('IntersectionObserver' in window && d3s) {
    new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { if (dragon3d && !dragon3d.running) dragon3d.start(); } else { if (dragon3d && dragon3d.running) dragon3d.stop(); } });
    }, { threshold: 0.05 }).observe(d3s);
  }

  // ============================================
  // 7. SMOOTH SCROLL
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const h = a.getAttribute('href'); if (h === '#') return; e.preventDefault();
      const t = document.querySelector(h); if (t) t.scrollIntoView({ behavior: 'smooth' });
    });
  });
});
