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
  // WESTERN DRAGON SDF (wings spread, hero)
  // ============================================
  function westernDragonSDF(p){
    let d=999;
    d=sdE(p,[1.3,0.75,0.85]);
    d=opS(d,sdE(v3sub(p,[0,-0.15,0.5]),[0.95,0.65,0.65]),0.4);
    d=opS(d,sdC(p,[0,-0.3,0.7],[0,-1.3,1.5],0.38),0.3);
    d=opS(d,sdC(p,[0,-1.3,1.5],[0,-1.9,1.7],0.28),0.25);
    d=opS(d,sdE(v3sub(p,[0,-2.1,1.8]),[0.48,0.38,0.58]),0.2);
    d=opS(d,sdE(v3sub(p,[0,-2.2,2.35]),[0.32,0.22,0.42]),0.15);
    d=opS(d,sdE(v3sub(p,[0,-1.92,2.2]),[0.3,0.13,0.38]),0.1);
    for(let s=-1;s<=1;s+=2){
      d=opS(d,sdC(p,[s*0.28,-2.2,1.55],[s*0.55,-3.0,1.15],0.09),0.05);
      d=opS(d,sdC(p,[s*0.55,-3.0,1.15],[s*0.6,-3.3,1.0],0.04),0.03);
    }
    for(let s=-1;s<=1;s+=2) d=opS(d,sdE(v3sub(p,[s*0.3,-2.15,2.15]),[0.09,0.07,0.09]),0.02);
    for(let s=-1;s<=1;s+=2){
      d=opS(d,sdC(p,[s*0.85,-0.2,0.2],[s*3.0,-1.5,-0.3],0.13),0.15);
      d=opS(d,sdC(p,[s*3.0,-1.5,-0.3],[s*4.0,-0.4,-0.9],0.08),0.1);
      d=opS(d,sdC(p,[s*4.0,-0.4,-0.9],[s*4.4,0.3,-1.1],0.04),0.05);
      d=opS(d,sdE(v3sub(p,[s*2.3,-0.6,-0.4]),[1.9,0.035,1.0]),0.2);
      for(let f=0;f<3;f++){const ft=(f+1)/4;const rs=[s*0.85+(s*3.0-s*0.85)*ft,-0.2+(-1.5+0.2)*ft,0.2+(-0.3-0.2)*ft];d=opS(d,sdC(p,rs,[s*(1.0+f*0.9),0.3,-0.5-f*0.2],0.04),0.08);}
    }
    let tp=[0,0.2,-0.8];
    for(let i=0;i<7;i++){const t=(i+1)/7;const tn=[Math.sin(t*3)*0.4*t,0.2+t*0.3,-0.8-t*2.8];d=opS(d,sdC(p,tp,tn,0.32*(1-t*0.85)),0.15);tp=tn;}
    d=opS(d,sdE(v3sub(p,[tp[0],tp[1],tp[2]-0.15]),[0.22,0.035,0.2]),0.05);
    for(let s=-1;s<=1;s+=2){
      d=opS(d,sdC(p,[s*0.5,0.3,0.5],[s*0.6,1.05,0.6],0.19),0.15);
      d=opS(d,sdC(p,[s*0.6,1.05,0.6],[s*0.55,1.55,0.4],0.13),0.1);
      d=opS(d,sdE(v3sub(p,[s*0.55,1.6,0.45]),[0.16,0.07,0.22]),0.05);
      d=opS(d,sdC(p,[s*0.6,0.2,-0.5],[s*0.7,1.05,-0.7],0.21),0.15);
      d=opS(d,sdC(p,[s*0.7,1.05,-0.7],[s*0.65,1.55,-0.5],0.14),0.1);
      d=opS(d,sdE(v3sub(p,[s*0.65,1.6,-0.45]),[0.17,0.07,0.23]),0.05);
    }
    for(let i=0;i<10;i++){const st=i/10;d=opS(d,sdC(p,[0,-0.7+st*0.15,1.1-st*0.4],[0,-0.7+st*0.15-0.2,1.05-st*0.4],0.028),0.04);}
    return d;
  }

  // ============================================
  // EASTERN SITTING DRAGON SDF (on ring base)
  // Serpentine body, no wings, coiled on torus
  // ============================================
  function easternDragonSDF(p){
    let d = 999;

    // === TORUS BASE (ring/pedestal) ===
    const torusP = v3sub(p, [0, 1.8, 0]);
    d = sdTorus(torusP, 1.6, 0.18);
    // Inner ring
    d = opS(d, sdTorus(v3sub(p,[0,1.8,0]), 1.2, 0.1), 0.1);
    // Flat disc inside the ring
    const discP = v3sub(p, [0, 1.85, 0]);
    const discD = sdE(discP, [1.4, 0.06, 1.4]);
    d = opS(d, discD, 0.1);

    // === COILED SERPENTINE BODY ===
    // Body coils upward in a spiral from the base
    const coilSegs = 20;
    let prevP = [0, 1.5, 0.8];
    for(let i = 0; i <= coilSegs; i++){
      const t = i / coilSegs;
      // Spiral path going upward
      const angle = t * Math.PI * 3.5; // ~1.75 full coils
      const radius = 0.8 - t * 0.5; // spiral tightens going up
      const height = 1.5 - t * 3.8; // goes from 1.5 to -2.3
      const cx = Math.cos(angle) * radius;
      const cz = Math.sin(angle) * radius;
      const curP = [cx, height, cz];
      // Body thickness tapers from bottom to top
      const thickness = 0.28 * (1 - t * 0.5);
      if(i > 0) {
        d = opS(d, sdC(p, prevP, curP, thickness), 0.15);
      }
      prevP = curP;
    }

    // === HEAD (at top of spiral) ===
    const headPos = prevP;
    const headP = v3sub(p, headPos);
    // Main head
    d = opS(d, sdE(v3sub(p,[headPos[0],headPos[1]-0.1,headPos[2]+0.15]), [0.35,0.28,0.45]), 0.15);
    // Snout (forward)
    d = opS(d, sdE(v3sub(p,[headPos[0],headPos[1]-0.05,headPos[2]+0.55]), [0.22,0.16,0.3]), 0.1);
    // Lower jaw
    d = opS(d, sdE(v3sub(p,[headPos[0],headPos[1]+0.1,headPos[2]+0.45]), [0.2,0.1,0.28]), 0.08);

    // === HORNS (antler-style, Eastern dragon) ===
    for(let s=-1;s<=1;s+=2){
      // Main horn going up and back
      d = opS(d, sdC(p, [headPos[0]+s*0.2,headPos[1]-0.15,headPos[2]], [headPos[0]+s*0.4,headPos[1]-0.7,headPos[2]-0.3], 0.06), 0.04);
      // Horn branch
      d = opS(d, sdC(p, [headPos[0]+s*0.35,headPos[1]-0.5,headPos[2]-0.15], [headPos[0]+s*0.5,headPos[1]-0.8,headPos[2]-0.1], 0.035), 0.03);
      // Second branch
      d = opS(d, sdC(p, [headPos[0]+s*0.3,headPos[1]-0.4,headPos[2]-0.1], [headPos[0]+s*0.25,headPos[1]-0.75,headPos[2]+0.1], 0.03), 0.03);
    }

    // === EYES ===
    for(let s=-1;s<=1;s+=2){
      d = opS(d, sdSphere(v3sub(p,[headPos[0]+s*0.18,headPos[1]-0.08,headPos[2]+0.35]), 0.07), 0.02);
    }

    // === WHISKERS (Eastern dragon feature) ===
    for(let s=-1;s<=1;s+=2){
      d = opS(d, sdC(p, [headPos[0]+s*0.15,headPos[1]+0.05,headPos[2]+0.5], [headPos[0]+s*0.6,headPos[1]-0.1,headPos[2]+0.8], 0.025), 0.02);
      d = opS(d, sdC(p, [headPos[0]+s*0.12,headPos[1]+0.08,headPos[2]+0.45], [headPos[0]+s*0.5,headPos[1]+0.2,headPos[2]+0.7], 0.02), 0.02);
    }

    // === MANE (flowing down the neck) ===
    for(let i=0;i<6;i++){
      const t = i/6;
      const angle = t * Math.PI * 3.5;
      const radius = 0.8 - t * 0.5;
      const height = 1.5 - t * 3.8;
      const mx = Math.cos(angle) * radius;
      const mz = Math.sin(angle) * radius;
      const maneH = 0.2 * (1 - t * 0.6);
      d = opS(d, sdC(p, [mx,height,mz], [mx*1.1,height-maneH,mz*1.1], 0.04), 0.05);
    }

    // === FRONT CLAWS (gripping the ring) ===
    for(let s=-1;s<=1;s+=2){
      // Arm from body to ring
      const armAngle = s > 0 ? 1.0 : -1.0;
      const armX = Math.cos(armAngle) * 0.6;
      const armZ = Math.sin(armAngle) * 0.6;
      d = opS(d, sdC(p, [armX*0.5, 0.5, armZ*0.5], [armX*1.3, 1.5, armZ*1.3], 0.12), 0.1);
      // Paw on ring
      d = opS(d, sdE(v3sub(p,[armX*1.35, 1.65, armZ*1.35]), [0.15,0.08,0.15]), 0.05);
      // Claws
      for(let c=-1;c<=1;c++){
        d = opS(d, sdC(p, [armX*1.35+c*0.06, 1.65, armZ*1.35], [armX*1.5+c*0.08, 1.75, armZ*1.5], 0.02), 0.02);
      }
    }

    // === TAIL (wrapping around the base ring) ===
    const tailSegs = 10;
    let tailPrev = [Math.cos(Math.PI*3.5*0.95)*0.35, 1.4, Math.sin(Math.PI*3.5*0.95)*0.35];
    for(let i=0;i<tailSegs;i++){
      const t = (i+1)/tailSegs;
      const ta = Math.PI*3.5 + t * Math.PI * 1.5; // continues the spiral
      const tr = 1.2 + t * 0.4; // moves outward toward ring
      const th = 1.5 + t * 0.3;
      const tn = [Math.cos(ta)*tr, th, Math.sin(ta)*tr];
      const thick = 0.15 * (1 - t * 0.7);
      d = opS(d, sdC(p, tailPrev, tn, thick), 0.1);
      tailPrev = tn;
    }
    // Tail tip fan
    d = opS(d, sdE(v3sub(p,[tailPrev[0],tailPrev[1]-0.05,tailPrev[2]]), [0.15,0.02,0.12]), 0.04);

    // === SCALES/SPINES along back ===
    for(let i=0;i<14;i++){
      const t = i/14;
      const angle = t * Math.PI * 3.5;
      const radius = 0.8 - t * 0.5;
      const height = 1.5 - t * 3.8;
      const sx = Math.cos(angle) * (radius + 0.1);
      const sz = Math.sin(angle) * (radius + 0.1);
      const sh = 0.12 + (1-Math.abs(t-0.3)*2.5)*0.1;
      d = opS(d, sdC(p, [sx,height,sz], [sx*1.15,height-sh,sz*1.15], 0.02), 0.03);
    }

    // === ORB in center of ring (mystical element) ===
    d = opS(d, sdSphere(v3sub(p,[0,1.6,0]), 0.3), 0.08);
    // Ring around orb
    d = opS(d, sdTorus(v3sub(p,[0,1.6,0]), 0.4, 0.04), 0.05);

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
    const steps=isMobile?26:40;
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
      this.cfg={fontSize:isMobile?7:(cfg.fontSize||10),maxFps:isMobile?10:(cfg.maxFps||14),...cfg};
      this.running=false;this.lastFrame=0;this.frameInterval=1000/this.cfg.maxFps;
      this.animId=null;this.time=0;this.scrollY=0;
      this.frameCache={};this.cols=0;this.rows=0;this.docHeight=1;
      this._resize=this.resize.bind(this);
      this._scroll=()=>{this.scrollY=window.scrollY;this.docHeight=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);};
      window.addEventListener('resize',this._resize);
      window.addEventListener('scroll',this._scroll,{passive:true});
      this._scroll(); this.resize();
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
    start(){
      if(this.running)return;this.running=true;
      requestAnimationFrame(()=>{this._getFrame(0);this._anim(performance.now());});
    }
    stop(){this.running=false;if(this.animId)cancelAnimationFrame(this.animId);}
    _anim(ts){
      if(!this.running)return;
      this.animId=requestAnimationFrame(this._anim.bind(this));
      if(ts-this.lastFrame<this.frameInterval)return;
      this.lastFrame=ts;this.time+=0.02;this._draw();
    }
    _draw(){
      const{ctx,w,h,cols,rows,cfg,time,scrollY,charW,docHeight}=this;
      const rgb=hexToRgb(getAccentColor());
      const scrollP=docHeight>0?scrollY/docHeight:0;
      const heroH=window.innerHeight;
      // Scroll drives rotation
      const rotDeg=scrollP*360;
      const ak=Math.round(rotDeg/10)%36;
      const frame=this._getFrame(ak);
      // Opacity: full in hero → ghost after
      let gOp;
      if(scrollY<heroH*0.3) gOp=1.0;
      else if(scrollY<heroH*1.2) gOp=1.0-((scrollY-heroH*0.3)/(heroH*0.9))*0.8;
      else gOp=0.2;

      ctx.clearRect(0,0,w,h);
      ctx.font=`${cfg.fontSize}px "Space Mono","Courier New",monospace`;
      ctx.textBaseline='top';
      const{brightness}=frame;
      for(let y=0;y<rows;y++){
        for(let x=0;x<cols;x++){
          const idx=y*cols+x;
          let br=brightness[idx];
          if(br<0.01){
            if(gOp>0.5){const n=Math.sin(x*0.3+y*0.2+time)*Math.sin(x*0.1-y*0.15)*0.5+0.5;if(n>0.93){ctx.fillStyle=`rgba(255,255,255,${(0.04*gOp).toFixed(3)})`;ctx.fillText('.',x*charW,y*cfg.fontSize);}}
            continue;
          }
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
      this.cfg={fontSize:isMobile?6:(cfg.fontSize||7),maxFps:isMobile?8:(cfg.maxFps||12),...cfg};
      this.running=false;this.lastFrame=0;this.frameInterval=1000/this.cfg.maxFps;
      this.animId=null;this.time=0;this.frameCache={};this.currentAngle=0;
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
    start(){if(this.running)return;this.running=true;this._anim(performance.now());}
    stop(){this.running=false;if(this.animId)cancelAnimationFrame(this.animId);}
    _getFrame(ak){
      if(this.frameCache[ak]) return this.frameCache[ak];
      const a=ak*(Math.PI/18);
      const f=computeFrame(easternDragonSDF,this.cols,this.rows,a,0.3,isMobile?9:10);
      this.frameCache[ak]=f;return f;
    }
    _anim(ts){
      if(!this.running)return;
      this.animId=requestAnimationFrame(this._anim.bind(this));
      if(ts-this.lastFrame<this.frameInterval)return;
      this.lastFrame=ts;this.time+=0.015;
      this.currentAngle+=0.35;if(this.currentAngle>=360)this.currentAngle-=360;
      this._draw();
    }
    _draw(){
      const{ctx,w,h,cols,rows,cfg,time,charW,currentAngle}=this;
      const rgb=hexToRgb(getAccentColor());
      const ak=Math.round(currentAngle/10)%36;
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
  window.AsciiImage=AsciiImage;
  window.Dragon3D=Dragon3D;
})(window);
