/* ============================================
ASCII RENDERER v8 — Dual Dragon Edition
Hero: Western dragon (wings) + scroll-driven
Bottom: Eastern sitting dragon on ring base
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

const isMobile = window.innerWidth < 800;
const RAMP = ' .:-=+*#%@';
function charB(b){ return RAMP[Math.floor(Math.max(0,Math.min(0.999,b))*RAMP.length)]; }

// Vector math
function v3sub(a,b){return[a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
function v3add(a,b){return[a[0]+b[0],a[1]+b[1],a[2]+b[2]];}
function v3scale(a,s){return[a[0]*s,a[1]*s,a[2]*s];}
function v3dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
function v3len(a){return Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2]);}
function v3norm(a){const l=v3len(a)||1;return[a[0]/l,a[1]/l,a[2]/l];}
function v3rotY(p,a){const c=Math.cos(a),s=Math.sin(a);return[p[0]*c+p[2]*s,p[1],-p[0]*s+p[2]*c];}
function v3rotX(p,a){const c=Math.cos(a),s=Math.sin(a);return[p[0],p[1]*c-p[2]*s,p[1]*s+p[2]*c];}

// SDF primitives
function sdE(p,r){const k0=v3len([p[0]/r[0],p[1]/r[1],p[2]/r[2]]);const k1=v3len([p[0]/(r[0]*r[0]),p[1]/(r[1]*r[1]),p[2]/(r[2]*r[2])]);return k0*(k0-1)/(k1||0.001);}
function sdC(p,a,b,r){const pa=v3sub(p,a),ba=v3sub(b,a);const h=Math.max(0,Math.min(1,v3dot(pa,ba)/(v3dot(ba,ba)||0.001)));return v3len(v3sub(pa,v3scale(ba,h)))-r;}
function sdTorus(p,R,r){const q=Math.sqrt(p[0]*p[0]+p[2]*p[2])-R;return Math.sqrt(q*q+p[1]*p[1])-r;}
function sdSphere(p,r){return v3len(p)-r;}
function opS(d1,d2,k){const h=Math.max(0,Math.min(1,0.5+0.5*(d2-d1)/k));return d2+(d1-d2)*h-k*h*(1-h);}
function opSub(d1,d2,k){return Math.max(d1,-d2);}

// ============================================
// HERO DRAGON SDF (Refined, Clear 3D Wyvern Shape)
// Replaces the old 'bat-like' shape with clear details
// ============================================
function westernDragonSDF(p){
let d=999;

// Main Body (slimmer, arched)
d = sdE(p, [1.0, 0.6, 0.7]);
d = opS(d, sdE(v3sub(p, [0, 0.2, 0.5]), [0.8, 0.5, 0.6]), 0.3);

// Neck (long elegant S-curve)
d = opS(d, sdC(p, [0, -0.3, 0.6], [0, -1.2, 1.4], 0.25), 0.25);
d = opS(d, sdC(p, [0, -1.2, 1.4], [0, -2.0, 1.2], 0.18), 0.2);

// Head (sharper snout)
d = opS(d, sdE(v3sub(p, [0, -2.1, 1.3]), [0.25, 0.25, 0.45]), 0.15);
d = opS(d, sdE(v3sub(p, [0, -2.2, 1.6]), [0.15, 0.12, 0.3]), 0.05); // Snout

// Horns (sweeping back)
for(let s=-1;s<=1;s+=2){
d = opS(d, sdC(p, [s*0.2, -2.2, 1.1], [s*0.4, -2.8, 0.8], 0.06), 0.05);
d = opS(d, sdC(p, [s*0.4, -2.8, 0.8], [s*0.45, -3.1, 0.7], 0.02), 0.02);
}

// Wings (Wide, articulated, thinner membranes)
for(let s=-1;s<=1;s+=2){
// Main wing arm (Thick bone)
d = opS(d, sdC(p, [s*0.7, -0.2, 0.2], [s*2.8, -1.2, 0.0], 0.1), 0.1);
// Wing joint & outer bone
d = opS(d, sdC(p, [s*2.8, -1.2, 0.0], [s*4.5, -0.2, -0.5], 0.06), 0.08);
// Wing tip
d = opS(d, sdC(p, [s*4.5, -0.2, -0.5], [s*5.0, 0.5, -0.8], 0.03), 0.04);

// Wing fingers & membrane (thinner to let light through, improving 3D read)
for(let f=0;f<3;f++){
const ft = (f+1)/4;
const jX = s*0.7 + (s*2.8 - s*0.7)*ft;
const jY = -0.2 + (-1.2 - -0.2)*ft;
const jZ = 0.2 + (0.0 - 0.2)*ft;

// Bone extending down
const tip = [s*(2.0 + f*1.2), 0.8, -0.4 - f*0.3];
d = opS(d, sdC(p, [jX, jY, jZ], tip, 0.03), 0.05);

// Thin membrane between body and bone
if (f===0) {
d = opS(d, sdE(v3sub(p, [s*1.8, 0.1, -0.1]), [1.2, 0.02, 0.6]), 0.15);
}
}
}

// Tail (sweeping down and curling)
let tp = [0, 0.3, -0.6];
for(let i=0; i<8; i++){
const t = (i+1)/8;
// Curve left/right and up
const tn = [Math.sin(t*4)*0.6, 0.3 + t*0.8, -0.6 - t*2.5];
d = opS(d, sdC(p, tp, tn, 0.25*(1-t*0.8)), 0.1);
tp = tn;
}
// Tail tip (spade)
d = opS(d, sdE(v3sub(p, [tp[0], tp[1], tp[2]-0.1]), [0.15, 0.02, 0.2]), 0.05);

return d;
}

// ============================================
// SITTING DRAGON SDF (Clean, solid Gargoyle style)
// Replaces the messy coiled snake with a clear shape
// ============================================
function easternDragonSDF(p){
let d=999;

// BASE (Pedestal)
d = sdC(p, [0,-2.5,0], [0,-2.5,0], 1.0); // simple sphere base
d = opS(d, sdE(v3sub(p,[0,-2.5,0]), [1.5, 0.3, 1.5]), 0.2);

// LOWER BODY (thick torso)
d = opS(d, sdE(v3sub(p,[0, -1.0, 0.2]), [0.8, 1.0, 0.9]), 0.4);

// UPPER BODY / CHEST
d = opS(d, sdE(v3sub(p,[0, 0.5, 0.4]), [0.7, 0.9, 0.8]), 0.3);

// NECK
d = opS(d, sdC(p, [0, 1.0, 0.4], [0, 2.2, 1.0], 0.35), 0.3);

// HEAD
d = opS(d, sdE(v3sub(p,[0, 2.5, 1.3]), [0.35, 0.35, 0.45]), 0.2);
// SNOUT
d = opS(d, sdC(p, [0, 2.5, 1.5], [0, 2.2, 2.0], 0.25), 0.1);

// HORNS (swept back)
for(let s=-1; s<=1; s+=2){
d = opS(d, sdC(p, [s*0.25, 2.7, 1.1], [s*0.6, 3.2, 0.5], 0.1), 0.1);
}

// THIGHS (thick, sitting position)
for(let s=-1; s<=1; s+=2){
d = opS(d, sdE(v3sub(p,[s*0.8, -1.2, 0.0]), [0.45, 0.7, 0.6]), 0.2);
// Feet / Claws
d = opS(d, sdC(p, [s*0.8, -2.0, 0.2], [s*0.8, -2.2, 1.0], 0.2), 0.1);
}

// ARMS (resting holding orb)
for(let s=-1; s<=1; s+=2){
d = opS(d, sdC(p, [s*0.6, 0.5, 0.7], [s*0.4, -0.2, 1.2], 0.15), 0.15);
d = opS(d, sdE(v3sub(p,[s*0.4, -0.3, 1.3]), [0.15, 0.15, 0.2]), 0.1);
}
// Orb
d = opS(d, sdSphere(v3sub(p,[0, -0.3, 1.4]), 0.3), 0.1);

// WINGS (folded nicely, wrapping the back like a cloak)
for(let s=-1; s<=1; s+=2){
// Wing shoulder
d = opS(d, sdE(v3sub(p,[s*0.8, 1.0, -0.1]), [0.2, 0.4, 0.4]), 0.2);
// Wing main body folded down
let wp = v3sub(p, [s*1.2, 0.0, -0.5]);
wp = v3rotY(wp, s*0.3);
wp = v3rotX(wp, 0.1);
d = opS(d, sdE(wp, [0.15, 1.5, 0.8]), 0.3);
// Wing tips touching the ground
d = opS(d, sdC(p, [s*1.3, -1.0, -0.6], [s*1.5, -2.2, -0.8], 0.1), 0.2);
}

// TAIL (thick, curling around to the front right)
d = opS(d, sdC(p, [0, -1.5, -0.6], [1.0, -2.0, -0.8], 0.3), 0.2);
d = opS(d, sdC(p, [1.0, -2.0, -0.8], [1.8, -2.2, 0.0], 0.25), 0.2);
d = opS(d, sdC(p, [1.8, -2.2, 0.0], [1.2, -2.2, 1.2], 0.2), 0.2);

return d;
}

function calcNormal(sdfFn, p){
const e=0.015,d=sdfFn(p);
return v3norm([sdfFn([p[0]+e,p[1],p[2]])-d,sdfFn([p[0],p[1]+e,p[2]])-d,sdfFn([p[0],p[1],p[2]+e])-d]);
}

// Generic frame renderer
function computeFrame(sdfFn, cols, rows, rotYA, rotXA, viewSize){
const buf=new Float32Array(cols*rows);
const eyeBuf=new Uint8Array(cols*rows);
const aspect=cols/rows*0.55;
const vH=viewSize||8,vW=vH*aspect;
const light=v3norm([0.5,-0.8,0.6]);
// OPTIMIZATION: Reduced steps (8 for mobile, 16 for PC) to drastically speed up calculations
const steps=isMobile?8:16;
for(let y=0;y<rows;y++){
for(let x=0;x<cols;x++){
const wx=(x/cols-0.5)*vW,wy=(y/rows-0.5)*vH;
let ro=[wx,wy,7],rd=[0,0,-1];
if(rotXA){ro=v3rotX(ro,rotXA);rd=v3rotX(rd,rotXA);}
if(rotYA){ro=v3rotY(ro,rotYA);rd=v3rotY(rd,rotYA);}
let t=0,hit=false,hp=ro;
for(let i=0;i<steps;i++){hp=v3add(ro,v3scale(rd,t));const dd=sdfFn(hp);if(dd<0.03){hit=true;break;}t+=dd;if(t>18)break;}
const idx=y*cols+x;
if(hit){
const n=calcNormal(sdfFn,hp);
const diff=Math.max(0,v3dot(n,light));
const vd=v3norm(v3sub(ro,hp));
const hd=v3norm(v3add(light,vd));
const spec=Math.pow(Math.max(0,v3dot(n,hd)),16)*0.4;
const rim=Math.pow(1-Math.max(0,v3dot(n,vd)),3)*0.28;
buf[idx]=Math.max(0,Math.min(1,0.1+diff*0.6+spec+rim));
// Eye check (generic — works for both)
eyeBuf[idx]=0;
}
}
}
return{brightness:buf,isEye:eyeBuf,cols,rows};
}

// ============================================
// HERO DRAGON — Fixed, scroll-driven rotation
// ============================================
  class AsciiBackground {
    constructor(canvas,cfg={}){
      this.canvas=canvas;this.ctx=canvas.getContext('2d');
      // OPTIMIZATION: Increased mobile font size to 18px to reduce grid calculation size by 50%
      this.cfg={fontSize:isMobile?18:(cfg.fontSize||15),maxFps:isMobile?6:(cfg.maxFps||12),...cfg};
      this.running=false;this.lastFrame=0;this.frameInterval=1000/this.cfg.maxFps;
      this.animId=null;this.time=0;this.scrollY=0;
      this.currentAngle=0;this.targetAngle=0;
      this.frameCache={};this.cols=0;this.rows=0;this.docHeight=1;
      this._resize=this.resize.bind(this);
      this._scroll=()=>{this.scrollY=window.scrollY;this.docHeight=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);};
      window.addEventListener('resize',this._resize);
      window.addEventListener('scroll',this._scroll,{passive:true});
      this._scroll(); this.resize();
      this.setupObserver();
    }
    
    // OPTIMIZATION: Stop loop when Hero section is out of view
    setupObserver(){
      if(!window.IntersectionObserver) { this.start(); return; }
      this.observer = new IntersectionObserver(entries => {
        if(entries[0].isIntersecting) { if(!this.running) this.start(); }
        else { this.stop(); }
      }, { threshold: 0.0 });
      this.observer.observe(this.canvas);
    }
resize(){
const dpr=Math.min(window.devicePixelRatio||1,isMobile?1:1.5);
this.w=window.innerWidth;this.h=window.innerHeight;
this.canvas.width=this.w*dpr;this.canvas.height=this.h*dpr;
this.canvas.style.width=this.w+'px';this.canvas.style.height=this.h+'px';
this.ctx.scale(dpr,dpr);
this.charW=this.cfg.fontSize*0.6;
this.cols=Math.ceil(this.w/this.charW);
this.rows=Math.ceil(this.h/this.cfg.fontSize);
this.frameCache={};
}

_getFrame(ak){
if(this.frameCache[ak]) return this.frameCache[ak];
const a=ak*(Math.PI/18);
const tilt=0.15;
const f=computeFrame(westernDragonSDF,this.cols,this.rows,a,tilt,isMobile?7:8);
this.frameCache[ak]=f;return f;
}

precacheAll(){
let ak = 0;
const precompute = () => {
if(!this.running) return;
if(ak < 36) {
if(!this.frameCache[ak]) this._getFrame(ak);
ak++;
if(window.requestIdleCallback) {
requestIdleCallback(precompute, {timeout: 100});
} else {
setTimeout(precompute, 16);
}
        }
      };
      precompute();
    }

    start(){
      if(this.running)return;
      this.running=true;
      this.precacheAll();
      this._tick(performance.now());
    }
    stop(){
      this.running=false;
      if(this.animId)cancelAnimationFrame(this.animId);
    }
    _tick(ts){
      if(!this.running)return;
      this.animId=requestAnimationFrame(this._tick.bind(this));
      if(ts-this.lastFrame<this.frameInterval)return;
      this.lastFrame=ts;
      this.render();
    }
    render(){
      const{canvas,ctx,w,h,cfg,cols,rows,charW}=this;
      const docH = this.docHeight || 1;
      const angleKey = Math.floor((this.scrollY / docH) * 36) % 36;
      let ak = angleKey < 0 ? angleKey + 36 : angleKey;
      const frame=this._getFrame(ak);
      if(!frame)return;
      const rgb=hexToRgb(getAccentColor());
      const time=performance.now()*0.001;
      const gOp=isMobile ? 0.7 : 0.85;
// GAP Line 293
// GAP Line 294
// GAP Line 295
// GAP Line 296
// GAP Line 297
// GAP Line 298
// GAP Line 299
ctx.clearRect(0,0,w,h);
ctx.font=`${cfg.fontSize}px "Space Mono","Courier New",monospace`;
ctx.textBaseline='top';
const{brightness}=frame;
for(let y=0;y<rows;y++){
for(let x=0;x<cols;x++){
const idx=y*cols+x;
let br=brightness[idx];
if(br<0.01) continue;
const shimmer=Math.sin(time*2.5+x*0.05+y*0.04)*0.04;
const sparkle=(Math.random()<0.003&&br>0.3)?0.25:0;
br=Math.max(0,Math.min(1,br+shimmer+sparkle));
const ch=charB(br);if(ch===' ')continue;
let r,g,b,op;
if(br>0.7&&Math.random()<0.1){r=Math.min(255,(180+rgb.r*0.3)|0);g=Math.min(255,(180+rgb.g*0.3)|0);b=Math.min(255,(180+rgb.b*0.3)|0);op=(0.5+br*0.5)*gOp;}
else{const v=100+br*155;r=v;g=v;b=v;op=(0.4+br*0.6)*gOp;}
if(op<0.01)continue;
ctx.fillStyle=`rgba(${r|0},${g|0},${b|0},${op.toFixed(3)})`;
ctx.fillText(ch,x*charW,y*cfg.fontSize);
}
}
}
destroy(){this.stop();window.removeEventListener('resize',this._resize);window.removeEventListener('scroll',this._scroll);}
}

// ============================================
// BOTTOM 3D DRAGON — Eastern sitting dragon
// ============================================
  class Dragon3D {
    constructor(canvas,cfg={}){
      this.canvas=canvas;this.ctx=canvas.getContext('2d');
      // OPTIMIZATION: Increased mobile font size to 18px to reduce grid calculation size
      this.cfg={fontSize:isMobile?18:(cfg.fontSize||12),maxFps:isMobile?6:(cfg.maxFps||12),...cfg};
      this.running=false;this.lastFrame=0;this.frameInterval=1000/this.cfg.maxFps;
      this.animId=null;this.time=0;this.frameCache={};
      this.currentAngle=window.scrollY*0.15;this.targetAngle=window.scrollY*0.15;
      this._resize=this.resize.bind(this);
      window.addEventListener('resize',this._resize); this.resize();
    }
resize(){
const dpr=Math.min(window.devicePixelRatio||1,isMobile?1:1.5);
const p=this.canvas.parentElement;
const r=p?p.getBoundingClientRect():{width:400,height:500};
this.w=r.width;this.h=r.height;
this.canvas.width=this.w*dpr;this.canvas.height=this.h*dpr;
this.canvas.style.width=this.w+'px';this.canvas.style.height=this.h+'px';
this.ctx.setTransform(dpr,0,0,dpr,0,0);
this.charW=this.cfg.fontSize*0.6;
this.cols=Math.ceil(this.w/this.charW);
this.rows=Math.ceil(this.h/this.cfg.fontSize);
this.frameCache={};
}

setupObserver(){
if(!window.IntersectionObserver) { this.start(); return; }
this.observer = new IntersectionObserver(entries => {
if(entries[0].isIntersecting) { if(!this.running) this.start(); }
else { this.stop(); }
}, { threshold: 0.0 });
this.observer.observe(this.canvas);
}

precacheAll(){
let ak = 0;
const precompute = () => {
if(ak < 36) {
if(!this.frameCache[ak]) this._getFrame(ak);
ak++;
if(window.requestIdleCallback) {
requestIdleCallback(precompute, {timeout: 100});
} else {
setTimeout(precompute, 16);
}
}
};
precompute();
}

start(){
if(this.running)return;
this.running=true;
this.precacheAll();
this._anim(performance.now());
}
stop(){this.running=false;if(this.animId)cancelAnimationFrame(this.animId);}
_getFrame(ak){
if(this.frameCache[ak]) return this.frameCache[ak];
const a=ak*(Math.PI/18);
// Use the Eastern sitting dragon with a slight pitch
const f=computeFrame(easternDragonSDF,this.cols,this.rows,a,0.3,isMobile?10:11);
this.frameCache[ak]=f;return f;
}
_anim(ts){
if(!this.running)return;
this.animId=requestAnimationFrame(this._anim.bind(this));

// Continuous time-based rotation
this.currentAngle += 2.0; // Fixed speed continuous rotation


if(ts-this.lastFrame<this.frameInterval)return;
this.lastFrame=ts;this.time+=0.015;
this._draw();
}
_draw(){
const{ctx,w,h,cols,rows,cfg,time,charW,currentAngle}=this;
const rgb=hexToRgb(getAccentColor());
let ak=Math.round(currentAngle/10)%36;
if(ak<0) ak+=36;
const frame=this._getFrame(ak);
if(!frame)return;
ctx.clearRect(0,0,w,h);
ctx.font=`${cfg.fontSize}px "Space Mono","Courier New",monospace`;
ctx.textBaseline='top';
const{brightness}=frame;
for(let y=0;y<rows;y++){
for(let x=0;x<cols;x++){
const idx=y*cols+x;
let br=brightness[idx];if(br<0.01)continue;
br=Math.max(0,Math.min(1,br+Math.sin(time*2+x*0.06+y*0.05)*0.04));
const ch=charB(br);if(ch===' ')continue;
let r,g,b,op;
if(br>0.65&&Math.random()<0.08){r=Math.min(255,(170+rgb.r*0.4)|0);g=Math.min(255,(170+rgb.g*0.4)|0);b=Math.min(255,(170+rgb.b*0.4)|0);op=0.5+br*0.5;}
else{const v=85+br*170;r=v;g=v;b=v;op=0.35+br*0.65;}
ctx.fillStyle=`rgba(${r|0},${g|0},${b|0},${op.toFixed(2)})`;
ctx.fillText(ch,x*charW,y*cfg.fontSize);
}
}
}
  destroy(){this.stop();window.removeEventListener('resize',this._resize);}
}

// AsciiImage (cards)
class AsciiImage {
constructor(canvas,cfg={}){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.cfg={fontSize:cfg.fontSize||12,style:cfg.style||'geometric',seed:cfg.seed||12345,...cfg};this._resize=this.setupCanvas.bind(this);window.addEventListener('resize',this._resize);}
setupCanvas(){const p=this.canvas.parentElement;if(!p)return;const r=p.getBoundingClientRect();const dpr=Math.min(window.devicePixelRatio||1,2);this.w=r.width;this.h=r.height;this.canvas.width=this.w*dpr;this.canvas.height=this.h*dpr;this.canvas.style.width=this.w+'px';this.canvas.style.height=this.h+'px';this.ctx.scale(dpr,dpr);this.render();}
render(){const{ctx,w,h,cfg}=this;const rgb=hexToRgb(getAccentColor());let seed=cfg.seed;const rng=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};ctx.clearRect(0,0,w,h);ctx.font=`${cfg.fontSize}px "Space Mono","Courier New",monospace`;ctx.textBaseline='top';const cw=cfg.fontSize*0.6;const cols=Math.floor(w/cw),rows=Math.floor(h/cfg.fontSize);for(let row=0;row<rows;row++){for(let col=0;col<cols;col++){let ch=' ',op=0;if(cfg.style==='geometric'){const bx=Math.floor(col/8),by=Math.floor(row/6),lx=col%8,ly=row%6;const bs=(bx*31+by*17+cfg.seed)%100;if(bs<40){if(lx===0||lx===7){ch='|';op=0.4;}else if(ly===0||ly===5){ch='-';op=0.4;}else if(rng()<0.2){ch='.';op=0.15;}}else if(bs<60){if((lx===3||lx===4)&&(ly===2||ly===3)){ch='+';op=0.5;}else if(lx===3||lx===4){ch='|';op=0.3;}else if(ly===2||ly===3){ch='-';op=0.3;}}}else if(cfg.style==='circuit'){const gs=4,gx=col%gs,gy=row%gs;if(gx===0&&gy===0&&rng()<0.3){ch='+';op=0.5;}else if(gx===0&&rng()<0.4){ch='|';op=0.25;}else if(gy===0&&rng()<0.4){ch='-';op=0.25;}}else if(cfg.style==='wave'){const wv=Math.sin(col*0.3+row*0.2+cfg.seed)*0.5+0.5;if(wv>0.7){ch='#';op=wv*0.4;}else if(wv>0.4){ch=':';op=wv*0.3;}}if(ch!==' '&&op>0){ctx.fillStyle=`rgba(${rgb.r},${rgb.g},${rgb.b},${op})`;ctx.fillText(ch,col*cw,row*cfg.fontSize);}}}}
destroy(){window.removeEventListener('resize',this._resize);}
}

  window.AsciiBackground=AsciiBackground;
  window.Dragon3D=Dragon3D;
  window.AsciiImage=AsciiImage;
})(window);