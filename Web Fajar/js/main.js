/* ============================================
   MAIN.JS - Fajar Heryanto Portfolio
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // ============================================
  // 1. LOADING SCREEN
  // ============================================
  const loadingScreen = document.querySelector('.loading-screen');
  const loadingFill = document.querySelector('.loading-bar__fill');
  let loadProgress = 0;

  function animateLoading() {
    const increment = Math.random() * 15 + 5;
    loadProgress = Math.min(loadProgress + increment, 100);
    if (loadingFill) loadingFill.style.width = loadProgress + '%';

    if (loadProgress < 100) {
      setTimeout(animateLoading, 100 + Math.random() * 200);
    } else {
      setTimeout(() => {
        if (loadingScreen) loadingScreen.classList.add('hidden');
        setTimeout(initAllAscii, 300);
      }, 400);
    }
  }

  animateLoading();

  // ============================================
  // 2. SCROLL REVEAL (IntersectionObserver)
  // ============================================
  const revealElements = document.querySelectorAll('.reveal');
  
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: show all
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // ============================================
  // 3. NAVIGATION TOGGLE
  // ============================================
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  const navOverlay = document.querySelector('.site-nav__overlay');
  const navItems = document.querySelectorAll('.nav-item');

  function openNav() {
    if (menuToggle) menuToggle.classList.add('active');
    if (siteNav) siteNav.classList.add('open');
    if (navOverlay) navOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Stagger animate nav items
    navItems.forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      setTimeout(() => {
        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, 100 + i * 60);
    });
  }

  function closeNav() {
    if (menuToggle) menuToggle.classList.remove('active');
    if (siteNav) siteNav.classList.remove('open');
    if (navOverlay) navOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      if (siteNav && siteNav.classList.contains('open')) {
        closeNav();
      } else {
        openNav();
      }
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', closeNav);
  }

  // Nav item click -> scroll to section
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.getAttribute('data-target');
      if (target) {
        const section = document.querySelector(target);
        if (section) {
          closeNav();
          setTimeout(() => {
            section.scrollIntoView({ behavior: 'smooth' });
          }, 300);
        }
      }
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && siteNav && siteNav.classList.contains('open')) {
      closeNav();
    }
  });

  // ============================================
  // 4. THEME SWITCHER
  // ============================================
  const allThemeDots = document.querySelectorAll('.theme-dot, .center-dot[data-theme]');
  const savedTheme = localStorage.getItem('dragonfly-theme') || 'orange';

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dragonfly-theme', theme);
    
    document.querySelectorAll('.theme-dot, .center-dot[data-theme]').forEach(dot => {
      dot.classList.toggle('active', dot.getAttribute('data-theme') === theme);
    });
  }

  setTheme(savedTheme);

  allThemeDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const theme = dot.getAttribute('data-theme');
      if (theme) setTheme(theme);
    });
  });

  // ============================================
  // 5. CUSTOM CURSOR
  // ============================================
  const cursor = document.querySelector('.custom-cursor');
  
  if (cursor && window.matchMedia('(hover: hover) and (min-width: 800px)').matches) {
    let cursorX = 0, cursorY = 0;
    let targetX = 0, targetY = 0;

    document.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    });

    function updateCursor() {
      cursorX += (targetX - cursorX) * 0.15;
      cursorY += (targetY - cursorY) * 0.15;
      cursor.style.transform = `translate(${cursorX - 4}px, ${cursorY - 4}px)`;
      requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Hover detection
    const interactiveElements = document.querySelectorAll(
      'a, button, [role="button"], .portfolio-card, .article-card, .nav-item, .filter-btn, .theme-dot, .center-dot, .center-nav__menu, .corner-letter, .cta__button, .skill-tag'
    );

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
  }

  // ============================================
  // 6. COUNTER ANIMATION
  // ============================================
  const statNumbers = document.querySelectorAll('.stat__number[data-target]');

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));
  }

  function animateCounter(el) {
    const target = el.getAttribute('data-target');
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const numericTarget = parseFloat(target);
    const duration = 2000;
    const start = performance.now();
    const isFloat = target.includes('.');

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = numericTarget * ease;

      if (isFloat) {
        el.textContent = prefix + current.toFixed(1) + suffix;
      } else {
        el.textContent = prefix + Math.floor(current) + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = prefix + target + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  // ============================================
  // 7. PORTFOLIO FILTER
  // ============================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      portfolioCards.forEach((card, i) => {
        const category = card.getAttribute('data-category');
        const show = (filter === 'all' || category === filter);

        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        if (show) {
          card.style.display = '';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, i * 30);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // ============================================
  // 8. INIT ASCII ART
  // ============================================
  let dragon3dInstance = null;

  function initAllAscii() {
    // Hero fullscreen ASCII background
    const heroCanvas = document.getElementById('hero-ascii-canvas');
    if (heroCanvas && window.AsciiBackground) {
      const bg = new AsciiBackground(heroCanvas, {
        fontSize: 11,
        maxFps: 18,
        seed: 42
      });
      bg.start();
    }

    // 3D Dragon (rotating wireframe)
    const dragon3dCanvas = document.getElementById('dragon-3d-canvas');
    if (dragon3dCanvas && window.Dragon3D) {
      dragon3dInstance = new Dragon3D(dragon3dCanvas, {
        fontSize: 7,
        maxFps: 24
      });
      // Only start when visible
    }

    // Featured project canvas
    const featuredProjectCanvas = document.getElementById('featured-project-canvas');
    if (featuredProjectCanvas && window.AsciiImage) {
      const img = new AsciiImage(featuredProjectCanvas, {
        fontSize: 10,
        style: 'circuit',
        seed: 777
      });
      img.setupCanvas();
    }

    // Portfolio card canvases
    const projectCanvases = document.querySelectorAll('.portfolio-card__canvas');
    if (window.AsciiImage) {
      const styles = ['geometric', 'circuit', 'wave', 'geometric', 'circuit', 'wave'];
      projectCanvases.forEach((canvas, i) => {
        const img = new AsciiImage(canvas, {
          fontSize: 9,
          style: styles[i % styles.length],
          seed: 100 + i * 257
        });
        img.setupCanvas();
      });
    }

    // Featured article canvas
    const articleCanvas = document.querySelector('.featured-article__image canvas');
    if (articleCanvas && window.AsciiImage) {
      const img = new AsciiImage(articleCanvas, {
        fontSize: 10,
        style: 'geometric',
        seed: 42
      });
      img.setupCanvas();
    }
  }

  // ============================================
  // 9. SCROLL TEXT REVEAL
  // ============================================
  const scrollTextLines = document.querySelectorAll('.scroll-reveal-text');
  
  if ('IntersectionObserver' in window && scrollTextLines.length > 0) {
    const textObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Stagger the lines
          const lines = entry.target.parentElement.querySelectorAll('.scroll-reveal-text');
          lines.forEach((line, i) => {
            setTimeout(() => {
              line.classList.add('visible');
            }, i * 200);
          });
          textObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.3
    });

    // Only observe the first line to trigger all
    textObserver.observe(scrollTextLines[0]);
  }

  // ============================================
  // 10. 3D DRAGON VISIBILITY OBSERVER
  // ============================================
  const dragon3dSection = document.getElementById('dragon-3d');
  
  if ('IntersectionObserver' in window && dragon3dSection) {
    const dragonObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (dragon3dInstance && !dragon3dInstance.running) {
            dragon3dInstance.start();
          }
        } else {
          if (dragon3dInstance && dragon3dInstance.running) {
            dragon3dInstance.stop();
          }
        }
      });
    }, {
      threshold: 0.1
    });

    dragonObserver.observe(dragon3dSection);
  }

  // ============================================
  // 11. CORNER LETTERS HIDE ON SCROLL
  // ============================================
  const cornerLetters = document.querySelectorAll('.corner-letter');
  const centerNav = document.querySelector('.center-nav');
  const heroSection = document.getElementById('hero');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroHeight = heroSection ? heroSection.offsetHeight : window.innerHeight;
    const scrollRatio = Math.min(scrollY / (heroHeight * 0.5), 1);

    // Fade out corner letters as user scrolls past hero
    cornerLetters.forEach(letter => {
      letter.style.opacity = 1 - scrollRatio;
    });

    // Fade the center nav slightly when scrolling
    if (centerNav) {
      if (scrollY > 50) {
        centerNav.style.opacity = '0.85';
      } else {
        centerNav.style.opacity = '1';
      }
    }
  }, { passive: true });

  // ============================================
  // 12. SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ============================================
  // 13. ASCII BADGE IN FOOTER
  // ============================================
  const asciiBadge = document.querySelector('.footer__ascii-badge');
  if (asciiBadge) {
    asciiBadge.textContent = 
      '  /\\_/\\  \n' +
      ' ( o.o ) \n' +
      '  > ^ <  \n' +
      ' /|   |\\ \n' +
      '(_|   |_)';
  }

});
