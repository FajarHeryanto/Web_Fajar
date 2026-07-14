document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // 1. LOADING SCREEN
  const loadingScreen = document.querySelector('.loading-screen');
  const loadingFill = document.querySelector('.loading-bar__fill');
  let loadProgress = 0;
  function animateLoading() {
    loadProgress = Math.min(loadProgress + Math.random()*15+5, 100);
    if(loadingFill) loadingFill.style.width = loadProgress+'%';
    if(loadProgress < 100) setTimeout(animateLoading, 100+Math.random()*200);
    else setTimeout(()=>{ if(loadingScreen) loadingScreen.classList.add('hidden'); setTimeout(initAllAscii,300); },400);
  }
  animateLoading();

  // 2. SCROLL REVEAL
  const revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    const ro = new IntersectionObserver(entries=>{
      entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('revealed'); ro.unobserve(e.target); } });
    },{threshold:0.1,rootMargin:'0px 0px -40px 0px'});
    revealEls.forEach(el=>ro.observe(el));
  } else revealEls.forEach(el=>el.classList.add('revealed'));

  // 3. NAV TOGGLE
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  const navOverlay = document.querySelector('.site-nav__overlay');
  const navItems = document.querySelectorAll('.nav-item');
  function openNav(){
    if(menuToggle) menuToggle.classList.add('active');
    if(siteNav) siteNav.classList.add('open');
    if(navOverlay) navOverlay.classList.add('active');
    document.body.style.overflow='hidden';
    navItems.forEach((item,i)=>{
      item.style.opacity='0'; item.style.transform='translateY(20px)';
      setTimeout(()=>{ item.style.transition='opacity 0.3s ease,transform 0.3s ease'; item.style.opacity='1'; item.style.transform='translateY(0)'; },100+i*60);
    });
  }
  function closeNav(){
    if(menuToggle) menuToggle.classList.remove('active');
    if(siteNav) siteNav.classList.remove('open');
    if(navOverlay) navOverlay.classList.remove('active');
    document.body.style.overflow='';
  }
  if(menuToggle) menuToggle.addEventListener('click',()=>{ siteNav&&siteNav.classList.contains('open')?closeNav():openNav(); });
  if(navOverlay) navOverlay.addEventListener('click',closeNav);
  navItems.forEach(item=>{
    item.addEventListener('click',()=>{
      const target=item.getAttribute('data-target');
      if(target){ const s=document.querySelector(target); if(s){ closeNav(); setTimeout(()=>s.scrollIntoView({behavior:'smooth'}),300); } }
    });
  });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&siteNav&&siteNav.classList.contains('open')) closeNav(); });

  // 4. THEME SWITCHER
  const allDots = document.querySelectorAll('.theme-dot,.center-dot[data-theme]');
  const savedTheme = localStorage.getItem('dragonfly-theme')||'orange';
  function setTheme(t){
    document.documentElement.setAttribute('data-theme',t);
    localStorage.setItem('dragonfly-theme',t);
    document.querySelectorAll('.theme-dot,.center-dot[data-theme]').forEach(d=>d.classList.toggle('active',d.getAttribute('data-theme')===t));
  }
  setTheme(savedTheme);
  allDots.forEach(d=>d.addEventListener('click',()=>{ const t=d.getAttribute('data-theme'); if(t) setTheme(t); }));

  // 5. CUSTOM CURSOR
  const cursor = document.querySelector('.custom-cursor');
  if(cursor && window.matchMedia('(hover:hover) and (min-width:800px)').matches){
    let cx=0,cy=0,tx=0,ty=0;
    document.addEventListener('mousemove',e=>{tx=e.clientX;ty=e.clientY;});
    (function upd(){cx+=(tx-cx)*0.15;cy+=(ty-cy)*0.15;cursor.style.transform=`translate(${cx-4}px,${cy-4}px)`;requestAnimationFrame(upd);})();
    document.querySelectorAll('a,button,[role=button],.portfolio-card,.nav-item,.theme-dot,.center-dot,.corner-letter,.cta__button,.skill-tag').forEach(el=>{
      el.addEventListener('mouseenter',()=>cursor.classList.add('hovering'));
      el.addEventListener('mouseleave',()=>cursor.classList.remove('hovering'));
    });
  }

  // 6. COUNTERS
  const statNums = document.querySelectorAll('.stat__number[data-target]');
  if('IntersectionObserver' in window){
    const co = new IntersectionObserver(entries=>{
      entries.forEach(e=>{ if(e.isIntersecting){ animateCounter(e.target); co.unobserve(e.target); } });
    },{threshold:0.5});
    statNums.forEach(el=>co.observe(el));
  }
  function animateCounter(el){
    const target=el.getAttribute('data-target'), suffix=el.getAttribute('data-suffix')||'', numT=parseFloat(target), dur=2000, start=performance.now();
    (function upd(now){
      const p=Math.min((now-start)/dur,1), ease=1-Math.pow(1-p,3);
      el.textContent=Math.floor(numT*ease)+suffix;
      if(p<1) requestAnimationFrame(upd); else el.textContent=target+suffix;
    })(start);
  }

  // 7. ASCII ART INIT
  let dragon3d = null;
  function initAllAscii(){
    const hc = document.getElementById('hero-ascii-canvas');
    if(hc && window.AsciiBackground){ new AsciiBackground(hc,{fontSize:window.innerWidth<800?7:10,maxFps:window.innerWidth<800?10:14}).start(); }

    const dc = document.getElementById('dragon-3d-canvas');
    if(dc && window.Dragon3D){ dragon3d = new Dragon3D(dc,{fontSize:window.innerWidth<800?6:8,maxFps:window.innerWidth<800?8:12}); }

    const fc = document.getElementById('featured-project-canvas');
    if(fc && window.AsciiImage){ new AsciiImage(fc,{fontSize:10,style:'circuit',seed:777}).setupCanvas(); }

    document.querySelectorAll('.portfolio-card__canvas').forEach((c,i)=>{
      if(window.AsciiImage){ const styles=['geometric','circuit','wave']; new AsciiImage(c,{fontSize:9,style:styles[i%3],seed:100+i*257}).setupCanvas(); }
    });
  }

  // 8. SCROLL TEXT REVEAL
  const stLines = document.querySelectorAll('.scroll-reveal-text');
  if('IntersectionObserver' in window && stLines.length>0){
    const to = new IntersectionObserver(entries=>{
      entries.forEach(e=>{ if(e.isIntersecting){ e.target.parentElement.querySelectorAll('.scroll-reveal-text').forEach((l,i)=>setTimeout(()=>l.classList.add('visible'),i*200)); to.unobserve(e.target); } });
    },{threshold:0.3});
    to.observe(stLines[0]);
  }

  // 9. 3D DRAGON VISIBILITY
  const d3s = document.getElementById('dragon-3d');
  if('IntersectionObserver' in window && d3s){
    new IntersectionObserver(entries=>{
      entries.forEach(e=>{ if(e.isIntersecting){ if(dragon3d&&!dragon3d.running) dragon3d.start(); } else { if(dragon3d&&dragon3d.running) dragon3d.stop(); } });
    },{threshold:0.1}).observe(d3s);
  }

  // 10. CORNER LETTERS FADE
  const corners = document.querySelectorAll('.corner-letter');
  const cNav = document.querySelector('.center-nav');
  const heroSec = document.getElementById('hero');
  window.addEventListener('scroll',()=>{
    const sy=window.scrollY, hh=heroSec?heroSec.offsetHeight:window.innerHeight;
    const r=Math.min(sy/(hh*0.5),1);
    corners.forEach(l=>{l.style.opacity=1-r;});
    if(cNav) cNav.style.opacity=sy>50?'0.85':'1';
  },{passive:true});

  // 11. SMOOTH SCROLL
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      const h=a.getAttribute('href'); if(h==='#')return; e.preventDefault();
      const t=document.querySelector(h); if(t) t.scrollIntoView({behavior:'smooth'});
    });
  });
});
