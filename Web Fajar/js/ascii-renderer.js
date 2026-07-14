/* ============================================
   ASCII RENDERER v4 — Clear Dragon Edition
   Hero: Pre-defined dragon bitmap
   Footer: Dense 3D wireframe dragon
   ============================================ */
(function(window) {
  'use strict';

  function getAccentColor() {
    try { return getComputedStyle(document.documentElement).getPropertyValue('--theme-accent').trim() || '#FF6B35'; }
    catch(e) { return '#FF6B35'; }
  }
  function hexToRgb(hex) {
    hex = hex.replace('#','');
    if(hex.length===3) hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    return { r:parseInt(hex.substring(0,2),16), g:parseInt(hex.substring(2,4),16), b:parseInt(hex.substring(4,6),16) };
  }

  // ============================================
  // DRAGON BITMAP — Pre-defined ASCII art
  // Each row is a string, characters define density
  // ============================================
  const DRAGON_ART = [
    "                                         .                                              ",
    "                                        /|\\                                             ",
    "                                       / | \\          .  .                               ",
    "                                      /  |  \\        / \\/ \\                              ",
    "                                  .--'   |   '--.   /      \\                             ",
    "                                 / ,     |     , \\ /   /\\   \\                            ",
    "                                / / \\    |    / \\ V   /  \\   \\                           ",
    "                    .-----.    / /   \\   |   /   \\   /    \\   \\    .-----.               ",
    "                   /  o  o \\  / /     \\  |  /     \\_/      \\   \\  /       \\              ",
    "                  |   ___   |/ /       \\ | /                \\   \\/    .    |              ",
    "                  |  /   \\  ' /         \\|/                  \\       / \\   |              ",
    "                   \\/ @@@ \\/./           V                    \\     /   \\  |              ",
    "                    |@@@@@|/            / \\                    \\   /     \\_/              ",
    "                    |@@@@@|            /   \\                    \\_/                       ",
    "              ___   |@@@@@|  ___      /     \\      ___                                   ",
    "          .--'   '-.|_____|.-'   '--./       \\.--'    '--.                                ",
    "         /          |     |          \\       /            \\                               ",
    "        /    /|     |     |     |\\    \\     /    /|   |\\   \\                              ",
    "       /    / |    /       \\    | \\    \\   /    / |   | \\   \\                             ",
    "      /    /  |   /  /---\\  \\   |  \\    \\ /    /  |   |  \\   \\                            ",
    "     /    /   |  /  / *** \\  \\  |   \\    V    /   |   |   \\   \\                           ",
    "    /    /    | /  / ***** \\  \\ |    \\       /    |   |    \\   \\                          ",
    "   /    /     |/  / ******* \\  \\|     \\     /     |   |     \\   \\                         ",
    "  /    /      '  / ********* \\  '      \\   /      |   |      \\   \\                        ",
    "  \\   \\        / /           \\ \\        \\ /       |   |       /   /                       ",
    "   \\   \\      / /             \\ \\        V        |   |      /   /                        ",
    "    \\   \\    / /               \\ \\      / \\       |   |     /   /                         ",
    "     \\   \\  / /                 \\ \\    /   \\      |   |    /   /                          ",
    "      \\   \\/ /                   \\ \\  /     \\     |   |   /   /                           ",
    "       \\   \\/                     \\ \\/       \\    |   |  /   /                            ",
    "        \\  /                       \\/         \\   |   | /   /                             ",
    "         \\/                        /\\          \\  |   |/   /                              ",
    "         /\\                       /  \\          \\ |   '   /                               ",
    "        /  \\                     /    \\          \\|      /                                ",
    "       /    \\                   /      \\          '     /                                 ",
    "      /      \\                 /        \\             /                                   ",
    "     /   /\\   \\               /    /\\    \\           /                                    ",
    "    /   /  \\   \\             /    /  \\    \\         /                                     ",
    "   /   /    \\   \\           /    /    \\    \\       /                                      ",
    "  /   /      \\   \\         /    /      \\    \\     /                                       ",
    " /   /        \\   \\       /    /        \\    \\   /                                        ",
    "/___/          \\___\\     /____/          \\____\\_/                                         ",
    "  ||            ||        ||              ||                                              ",
    "  ||            ||        ||              ||                                              ",
    " _||_          _||_      _||_            _||_                                            ",
    "/____\\        /____\\    /____\\          /____\\                                           ",
  ];

  // Second dragon art for the 3D section (front-facing)
  const DRAGON_FRONT = [
    "               .     .                ",
    "               |\\   /|                ",
    "               | \\ / |                ",
    "              ,'  V  ',               ",
    "             /  _   _  \\              ",
    "            / /(o) (o)\\ \\             ",
    "           |  |  ___  |  |            ",
    "           |  \\ '---' /  |            ",
    "            \\  '.___.'/  /             ",
    "       /\\    '-._____.-'    /\\        ",
    "      /  \\   /|         |\\   /  \\     ",
    "     /    \\_/ |         | \\_/    \\    ",
    "    /     /   |  /\\ /\\  |   \\     \\   ",
    "   /     /    | / | | \\ |    \\     \\  ",
    "  /     /     |/  | |  \\|     \\     \\ ",
    " /     /      /   | |   \\      \\     \\",
    "/     /      /    | |    \\      \\     |",
    "\\    /      /  /| | | |\\  \\      \\    |",
    " \\  /      /  / | | | | \\  \\      \\  / ",
    "  \\/      /  /  | | | |  \\  \\      \\/ ",
    "         /  /   | | | |   \\  \\        ",
    "        /  /    | | | |    \\  \\       ",
    "       /  /     | | | |     \\  \\      ",
    "      /  /      | | | |      \\  \\     ",
    "     /  /       | | | |       \\  \\    ",
    "    /  /        | | | |        \\  \\   ",
    "   /__/         | | | |         \\__\\  ",
    "   |__|         | | | |         |__|  ",
    "                |_| |_|               ",
    "               /__ _ __\\              ",
    "              |___|_|___|             ",
  ];

  // ============================================
  // HERO ASCII BACKGROUND — Bitmap Dragon
  // ============================================
  class AsciiBackground {
    constructor(canvas, cfg={}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.cfg = { fontSize: cfg.fontSize||10, maxFps: cfg.maxFps||20, seed: cfg.seed||42, ...cfg };
      this.running = false;
      this.lastFrame = 0;
      this.frameInterval = 1000 / this.cfg.maxFps;
      this.animId = null;
      this.time = 0;
      this.scrollY = 0;
      this.map = null;

      this._resize = this.resize.bind(this);
      this._scroll = () => { this.scrollY = window.scrollY; };
      window.addEventListener('resize', this._resize);
      window.addEventListener('scroll', this._scroll, {passive:true});
      this.resize();
    }

    resize() {
      const dpr = Math.min(window.devicePixelRatio||1, 1.5);
      const p = this.canvas.parentElement;
      const r = p ? p.getBoundingClientRect() : {width:window.innerWidth, height:window.innerHeight};
      this.w = r.width;
      this.h = r.height;
      this.canvas.width = this.w * dpr;
      this.canvas.height = this.h * dpr;
      this.canvas.style.width = this.w + 'px';
      this.canvas.style.height = this.h + 'px';
      this.ctx.scale(dpr, dpr);
      this.charW = this.cfg.fontSize * 0.6;
      this.cols = Math.ceil(this.w / this.charW);
      this.rows = Math.ceil(this.h / this.cfg.fontSize);
      this._build();
    }

    _build() {
      const {cols, rows} = this;
      const art = DRAGON_ART;
      const artH = art.length;
      const artW = Math.max(...art.map(r => r.length));

      // Scale and center the dragon art onto the grid
      const scaleX = cols / artW;
      const scaleY = rows / artH;
      const scale = Math.min(scaleX, scaleY) * 0.85;

      const offsetX = Math.floor((cols - artW * scale) / 2);
      const offsetY = Math.floor((rows - artH * scale) / 2);

      this.map = [];
      for (let y = 0; y < rows; y++) {
        this.map[y] = [];
        for (let x = 0; x < cols; x++) {
          // Map grid position back to art position
          const artX = Math.floor((x - offsetX) / scale);
          const artY = Math.floor((y - offsetY) / scale);

          let srcChar = ' ';
          let density = 0;
          let isEye = false;
          let isFire = false;

          if (artY >= 0 && artY < artH && artX >= 0 && artX < art[artY].length) {
            srcChar = art[artY][artX];

            if (srcChar === '@') {
              isEye = true;
              density = 1.0;
            } else if (srcChar === '*') {
              isFire = true;
              density = 0.8;
            } else if (srcChar === '#') {
              density = 0.9;
            } else if (srcChar === '/' || srcChar === '\\' || srcChar === '|') {
              density = 0.7;
            } else if (srcChar === '-' || srcChar === '_') {
              density = 0.6;
            } else if (srcChar === '\'' || srcChar === '`' || srcChar === ',') {
              density = 0.5;
            } else if (srcChar === '.' || srcChar === ':') {
              density = 0.4;
            } else if (srcChar !== ' ') {
              density = 0.55;
            }
          }

          // Add subtle background noise
          if (density === 0) {
            const nx = x / cols, ny = y / rows;
            const noise = Math.sin(nx * 20 + ny * 15) * Math.sin(nx * 8 - ny * 12) * 0.5 + 0.5;
            if (noise > 0.85) density = 0.04;
            else if (noise > 0.75) density = 0.02;
          }

          this.map[y][x] = {
            char: srcChar,
            density,
            isEye,
            isFire,
            phase: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 2
          };
        }
      }
    }

    start() { if(this.running) return; this.running = true; this._anim(performance.now()); }
    stop() { this.running = false; if(this.animId) cancelAnimationFrame(this.animId); }

    _anim(ts) {
      if (!this.running) return;
      this.animId = requestAnimationFrame(this._anim.bind(this));
      if (ts - this.lastFrame < this.frameInterval) return;
      this.lastFrame = ts;
      this.time += 0.02;
      this._draw();
    }

    _draw() {
      const {ctx, w, h, map, cols, rows, cfg, time, scrollY, charW} = this;
      if (!map) return;

      const rgb = hexToRgb(getAccentColor());
      const pY = scrollY * 0.15; // parallax

      ctx.clearRect(0, 0, w, h);
      ctx.font = `${cfg.fontSize}px "Space Mono","Courier New",monospace`;
      ctx.textBaseline = 'top';

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const c = map[y][x];
          if (c.density < 0.01) continue;

          // Determine character to render
          let ch = c.char;
          let opacity = c.density;

          // Animation
          const breath = Math.sin(time * 1.2) * 0.04;
          const shimmer = Math.sin(time * 2 + x * 0.05 + y * 0.04) * 0.05;
          opacity += breath + shimmer;

          // Special areas
          if (c.isEye) {
            ch = '◉';
            opacity = 0.9 + Math.sin(time * 3) * 0.1;
          } else if (c.isFire) {
            const fireChars = '*+°•×~';
            ch = fireChars[Math.floor((Math.sin(time * 8 + c.phase) * 0.5 + 0.5) * fireChars.length) % fireChars.length];
            opacity += Math.sin(time * 10 + c.phase) * 0.15;
          } else if (c.density < 0.05) {
            ch = Math.random() < 0.5 ? '·' : '.';
          }

          // Random sparkle on dragon body
          if (Math.random() < 0.003 && c.density > 0.3) opacity += 0.3;

          opacity = Math.max(0, Math.min(1, opacity));
          if (opacity < 0.01) continue;

          // Color
          let r, g, b;
          if (c.isEye) {
            r = rgb.r; g = rgb.g; b = rgb.b;
          } else if (c.isFire) {
            const fs = Math.sin(time * 5 + c.phase) * 0.5 + 0.5;
            r = Math.min(255, rgb.r + 60 * fs);
            g = Math.min(255, rgb.g * 0.6 + 100 * fs);
            b = Math.floor(rgb.b * 0.2);
          } else if (c.density > 0.5 && Math.random() < 0.1) {
            // Accent highlights on dense parts
            r = rgb.r; g = rgb.g; b = rgb.b;
            opacity *= 0.6;
          } else {
            const br = 130 + c.density * 125;
            r = br; g = br; b = br;
          }

          const drawY = y * cfg.fontSize - pY;
          if (drawY < -cfg.fontSize || drawY > h + cfg.fontSize) continue;

          ctx.fillStyle = `rgba(${r|0},${g|0},${b|0},${opacity})`;
          ctx.fillText(ch, x * charW, drawY);
        }
      }
    }

    destroy() {
      this.stop();
      window.removeEventListener('resize', this._resize);
      window.removeEventListener('scroll', this._scroll);
    }
  }

  // ============================================
  // 3D ROTATING DRAGON — Dense wireframe
  // ============================================
  class Dragon3D {
    constructor(canvas, cfg={}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.cfg = { fontSize: cfg.fontSize||7, maxFps: cfg.maxFps||24, ...cfg };
      this.running = false;
      this.lastFrame = 0;
      this.frameInterval = 1000 / this.cfg.maxFps;
      this.animId = null;
      this.time = 0;
      this.charGrid = null;
      this.art = DRAGON_FRONT;
      this.artW = Math.max(...this.art.map(r => r.length));
      this.artH = this.art.length;

      this._resize = this.resize.bind(this);
      window.addEventListener('resize', this._resize);
      this.resize();
    }

    resize() {
      const dpr = Math.min(window.devicePixelRatio||1, 2);
      const p = this.canvas.parentElement;
      const r = p ? p.getBoundingClientRect() : {width:400, height:400};
      this.w = r.width;
      this.h = r.height;
      this.canvas.width = this.w * dpr;
      this.canvas.height = this.h * dpr;
      this.canvas.style.width = this.w + 'px';
      this.canvas.style.height = this.h + 'px';
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    start() { if(this.running) return; this.running = true; this._anim(performance.now()); }
    stop() { this.running = false; if(this.animId) cancelAnimationFrame(this.animId); }

    _anim(ts) {
      if (!this.running) return;
      this.animId = requestAnimationFrame(this._anim.bind(this));
      if (ts - this.lastFrame < this.frameInterval) return;
      this.lastFrame = ts;
      this.time += 0.012;
      this._draw();
    }

    _draw() {
      const {ctx, w, h, cfg, time, art, artW, artH} = this;
      const rgb = hexToRgb(getAccentColor());

      ctx.clearRect(0, 0, w, h);
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      const fontSize = cfg.fontSize;
      const charW = fontSize * 0.6;

      // Calculate display size — fit the dragon in the canvas
      const displayCols = Math.floor(w / charW);
      const displayRows = Math.floor(h / fontSize);

      const scaleX = displayCols / artW;
      const scaleY = displayRows / artH;
      const scale = Math.min(scaleX, scaleY) * 0.9;

      const rotAngle = time * 0.6; // Rotation speed
      const wobble = Math.sin(time * 0.8) * 0.08; // Gentle wobble

      // For each character in the art, project it as if on a cylinder
      for (let ay = 0; ay < artH; ay++) {
        for (let ax = 0; ax < art[ay].length; ax++) {
          const ch = art[ay][ax];
          if (ch === ' ') continue;

          // Normalize art coords to -1..1
          const nx = (ax - artW / 2) / (artW / 2);
          const ny = (ay - artH / 2) / (artH / 2);

          // Wrap the art around a cylinder (Y axis rotation)
          const theta = nx * Math.PI * 0.45 + rotAngle; // angular position
          const cosT = Math.cos(theta);
          const sinT = Math.sin(theta);

          // Only render front-facing characters (cosT > 0 = facing camera)
          if (cosT < -0.1) continue;

          // 3D position on cylinder surface
          const x3d = sinT * 1.2;
          const y3d = ny * 1.5 + wobble * ny;
          const z3d = cosT * 1.2;

          // Simple perspective projection
          const fov = 3.0;
          const depth = z3d + 3;
          const projX = (x3d * fov / depth) * (w * 0.35) + w / 2;
          const projY = (y3d * fov / depth) * (h * 0.35) + h / 2;

          if (projX < 0 || projX > w || projY < 0 || projY > h) continue;

          // Opacity based on facing direction (brighter when facing camera)
          let opacity = cosT * 0.7 + 0.3;

          // Character density affects brightness
          let charWeight = 0.5;
          if (ch === '@' || ch === '#') charWeight = 1.0;
          else if (ch === '/' || ch === '\\' || ch === '|') charWeight = 0.8;
          else if (ch === '-' || ch === '_' || ch === '(' || ch === ')') charWeight = 0.7;
          else if (ch === '.' || ch === ',' || ch === '\'') charWeight = 0.4;
          else if (ch === 'o') charWeight = 0.9;
          else charWeight = 0.6;

          opacity *= charWeight;

          // Animation shimmer
          opacity += Math.sin(time * 3 + ax * 0.1 + ay * 0.1) * 0.06;
          opacity = Math.max(0.05, Math.min(1, opacity));

          // Color
          let r, g, b;
          const isEye = (ch === 'o' && ay >= 4 && ay <= 6);
          const isMouth = (ch === '-' && ay >= 6 && ay <= 8);

          if (isEye) {
            r = rgb.r; g = rgb.g; b = rgb.b;
            opacity = Math.max(opacity, 0.9);
          } else if (isMouth) {
            r = rgb.r; g = rgb.g; b = rgb.b;
            opacity *= 0.8;
          } else if (charWeight > 0.7 && Math.random() < 0.08) {
            r = rgb.r; g = rgb.g; b = rgb.b;
            opacity *= 0.5;
          } else {
            const br = 120 + cosT * 80 + charWeight * 55;
            r = br; g = br; b = br;
          }

          // Scale font slightly based on depth for 3D effect
          const depthScale = fov / depth;
          const renderSize = Math.max(4, fontSize * depthScale * 0.9);

          ctx.font = `${renderSize|0}px "Space Mono","Courier New",monospace`;
          ctx.fillStyle = `rgba(${r|0},${g|0},${b|0},${opacity})`;
          ctx.fillText(ch, projX, projY);
        }
      }

      // Draw subtle label
      ctx.font = `10px "Space Mono",monospace`;
      ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.4)`;
      ctx.textAlign = 'center';
      ctx.fillText('< DRAGON >', w / 2, h - 20);
    }

    destroy() {
      this.stop();
      window.removeEventListener('resize', this._resize);
    }
  }

  // ============================================
  // ASCII IMAGE (for cards)
  // ============================================
  class AsciiImage {
    constructor(canvas, cfg={}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.cfg = {fontSize:cfg.fontSize||12, style:cfg.style||'geometric', seed:cfg.seed||12345, ...cfg};
      this._resize = this.setupCanvas.bind(this);
      window.addEventListener('resize', this._resize);
    }
    setupCanvas() {
      const p = this.canvas.parentElement; if(!p) return;
      const r = p.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio||1, 2);
      this.w = r.width; this.h = r.height;
      this.canvas.width = this.w*dpr; this.canvas.height = this.h*dpr;
      this.canvas.style.width = this.w+'px'; this.canvas.style.height = this.h+'px';
      this.ctx.scale(dpr, dpr);
      this.render();
    }
    render() {
      const {ctx, w, h, cfg} = this;
      const rgb = hexToRgb(getAccentColor());
      let seed = cfg.seed;
      const rng = () => { seed=(seed*16807)%2147483647; return(seed-1)/2147483646; };
      ctx.clearRect(0, 0, w, h);
      ctx.font = `${cfg.fontSize}px "Space Mono","Courier New",monospace`;
      ctx.textBaseline = 'top';
      const cols = Math.floor(w/(cfg.fontSize*0.6)), rows = Math.floor(h/cfg.fontSize);
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          let ch = ' ', op = 0;
          if (cfg.style === 'geometric') {
            const bx=Math.floor(col/8), by=Math.floor(row/6), lx=col%8, ly=row%6;
            const bs=(bx*31+by*17+cfg.seed)%100;
            if(bs<40){if(lx===0||lx===7){ch='|';op=0.4;}else if(ly===0||ly===5){ch='-';op=0.4;}else{ch=rng()<0.3?'.':' ';op=0.15;}}
            else if(bs<60){if((lx===3||lx===4)&&(ly===2||ly===3)){ch='+';op=0.5;}else if(lx===3||lx===4){ch='|';op=0.3;}else if(ly===2||ly===3){ch='-';op=0.3;}}
            else if(bs<75){if(rng()<0.15){ch='.';op=0.2+rng()*0.2;}}
          } else if (cfg.style === 'circuit') {
            const gs=4,gx=col%gs,gy=row%gs;
            if(gx===0&&gy===0&&rng()<0.3){ch='+';op=0.5;}else if(gx===0&&rng()<0.4){ch='|';op=0.25;}else if(gy===0&&rng()<0.4){ch='-';op=0.25;}
          } else if (cfg.style === 'wave') {
            const wv=Math.sin(col*0.3+row*0.2+cfg.seed)*0.5+0.5;
            if(wv>0.7){ch='#';op=wv*0.4;}else if(wv>0.4){ch=':';op=wv*0.3;}else if(wv>0.2){ch='.';op=wv*0.25;}
          }
          if (ch !== ' ' && op > 0) {
            ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${op})`;
            ctx.fillText(ch, col*cfg.fontSize*0.6, row*cfg.fontSize);
          }
        }
      }
    }
    destroy() { window.removeEventListener('resize', this._resize); }
  }

  window.AsciiBackground = AsciiBackground;
  window.AsciiImage = AsciiImage;
  window.Dragon3D = Dragon3D;
})(window);
