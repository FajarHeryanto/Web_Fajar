/* ============================================
   ASCII RENDERER v7 — Scroll-Driven 3D Dragon
   Dragon moves with scroll, becomes bg in sections
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

  // SDF
  function sdE(p,r){const k0=v3len([p[0]/r[0],p[1]/r[1],p[2]/r[2]]);const k1=v3len([p[0]/(r[0]*r[0]),p[1]/(r[1]*r[1]),p[2]/(r[2]*r[2])]);return k0*(k0-1)/(k1||0.001);}
  function sdC(p,a,b,r){const pa=v3sub(p,a),ba=v3sub(b,a);const h=Math.max(0,Math.min(1,v3dot(pa,ba)/(v3dot(ba,ba)||0.001)));return v3len(v3sub(pa,v3scale(ba,h)))-r;}
  function opS(d1,d2,k){const h=Math.max(0,Math.min(1,0.5+0.5*(d2-d1)/k));return d2+(d1-d2)*h-k*h*(1-h);}

  function dragonSDF(p){
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
      for(let f=0;f<3;f++){
        const ft=(f+1)/4;
        const rs=[s*0.85+(s*3.0-s*0.85)*ft,-0.2+(-1.5+0.2)*ft,0.2+(-0.3-0.2)*ft];
        d=opS(d,sdC(p,rs,[s*(1.0+f*0.9),0.3,-0.5-f*0.2],0.04),0.08);
      }
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
    for(let i=0;i<10;i++){const st=i/10;d=opS(d,sdC(p,[0,-0.7+st*0.15,1.1-st*0.4],[0,-0.7+st*0.15-(0.15+(1-Math.abs(st-0.3)*2.5)*0.15),1.1-st*0.4-0.05],0.028),0.04);}
    return d;
  }

  function calcNormal(p){
    const e=0.015,d=dragonSDF(p);
    return v3norm([dragonSDF([p[0]+e,p[1],p[2]])-d,dragonSDF([p[0],p[1]+e,p[2]])-d,dragonSDF([p[0],p[1],p[2]+e])-d]);
  }

  // Pre-compute a frame at given rotation
  function computeFrame(cols,rows,rotYAngle,rotXAngle,viewSize){
    const buf=new Float32Array(cols*rows);
    const eyeBuf=new Uint8Array(cols*rows);
    const aspect=cols/rows*0.55;
    const vH=viewSize||8,vW=vH*aspect;
    const light=v3norm([0.5,-0.8,0.6]);
    const steps=isMobile?28:42;
    for(let y=0;y<rows;y++){
      for(let x=0;x<cols;x++){
        const wx=(x/cols-0.5)*vW, wy=(y/rows-0.5)*vH;
        let ro=[wx,wy,6], rd=[0,0,-1];
        if(rotXAngle){ro=v3rotX(ro,rotXAngle);rd=v3rotX(rd,rotXAngle);}
        if(rotYAngle){ro=v3rotY(ro,rotYAngle);rd=v3rotY(rd,rotYAngle);}
        let t=0,hit=false,hp=ro;
        for(let i=0;i<steps;i++){hp=v3add(ro,v3scale(rd,t));const dd=dragonSDF(hp);if(dd<0.025){hit=true;break;}t+=dd;if(t>16)break;}
        const idx=y*cols+x;
        if(hit){
          const n=calcNormal(hp);
          const diff=Math.max(0,v3dot(n,light));
          const vd=v3norm(v3sub(ro,hp));
          const hd=v3norm(v3add(light,vd));
          const spec=Math.pow(Math.max(0,v3dot(n,hd)),18)*0.45;
          const rim=Math.pow(1-Math.max(0,v3dot(n,vd)),3)*0.3;
          buf[idx]=Math.max(0,Math.min(1,0.1+diff*0.65+spec+rim));
          for(let s=-1;s<=1;s+=2){if(v3len(v3sub(hp,[s*0.3,-2.15,2.15]))<0.14) eyeBuf[idx]=1;}
        }
      }
    }
    return{brightness:buf,isEye:eyeBuf,cols,rows};
  }

  // ============================================
  // MAIN DRAGON — Fixed position, scroll-driven
  // ============================================
  class AsciiBackground {
    constructor(canvas,cfg={}){
      this.canvas=canvas; this.ctx=canvas.getContext('2d');
      this.cfg={fontSize:isMobile?7:(cfg.fontSize||10),maxFps:isMobile?10:(cfg.maxFps||14),...cfg};
      this.running=false; this.lastFrame=0; this.frameInterval=1000/this.cfg.maxFps;
      this.animId=null; this.time=0; this.scrollY=0;
      this.frameCache={}; this.currentFrame=null;
      this.cols=0; this.rows=0;
      this.docHeight=1;

      this._resize=this.resize.bind(this);
      this._scroll=()=>{this.scrollY=window.scrollY;this.docHeight=document.documentElement.scrollHeight-window.innerHeight;};
      window.addEventListener('resize',this._resize);
      window.addEventListener('scroll',this._scroll,{passive:true});
      this._scroll();
      this.resize();
    }

    resize(){
      const dpr=Math.min(window.devicePixelRatio||1,isMobile?1:1.5);
      this.w=window.innerWidth; this.h=window.innerHeight;
      this.canvas.width=this.w*dpr; this.canvas.height=this.h*dpr;
      this.canvas.style.width=this.w+'px'; this.canvas.style.height=this.h+'px';
      this.ctx.scale(dpr,dpr);
      this.charW=this.cfg.fontSize*0.6;
      this.cols=Math.ceil(this.w/this.charW);
      this.rows=Math.ceil(this.h/this.cfg.fontSize);
      this.frameCache={}; // invalidate on resize
    }

    _getFrame(angleKey){
      if(this.frameCache[angleKey]) return this.frameCache[angleKey];
      const angle=angleKey*(Math.PI/18); // 10 deg steps
      const tilt=0.15+Math.sin(angleKey*0.2)*0.08;
      const frame=computeFrame(this.cols,this.rows,angle,tilt,isMobile?7:8);
      this.frameCache[angleKey]=frame;
      return frame;
    }

    start(){
      if(this.running) return;
      this.running=true;
      // Compute initial frame
      requestAnimationFrame(()=>{
        this.currentFrame=this._getFrame(0);
        this._anim(performance.now());
      });
    }
    stop(){this.running=false;if(this.animId)cancelAnimationFrame(this.animId);}

    _anim(ts){
      if(!this.running) return;
      this.animId=requestAnimationFrame(this._anim.bind(this));
      if(ts-this.lastFrame<this.frameInterval) return;
      this.lastFrame=ts; this.time+=0.02;
      this._draw();
    }

    _draw(){
      const{ctx,w,h,cols,rows,cfg,time,scrollY,charW,docHeight}=this;
      const rgb=hexToRgb(getAccentColor());

      // Scroll progress 0..1
      const scrollP=docHeight>0?scrollY/docHeight:0;
      const heroH=window.innerHeight;

      // Dragon rotation based on scroll (full 360° over page)
      const rotDeg=scrollP*360;
      const angleKey=Math.round(rotDeg/10)%36;

      // Get or compute frame for this angle
      const frame=this._getFrame(angleKey);

      // Opacity: full in hero, fades to ghostly after
      let globalOpacity;
      if(scrollY<heroH*0.5) globalOpacity=1.0;
      else if(scrollY<heroH*1.5) globalOpacity=1.0-((scrollY-heroH*0.5)/heroH)*0.75;
      else globalOpacity=0.25; // ghost mode

      ctx.clearRect(0,0,w,h);
      ctx.font=`${cfg.fontSize}px "Space Mono","Courier New",monospace`;
      ctx.textBaseline='top';

      const{brightness,isEye}=frame;

      for(let y=0;y<rows;y++){
        for(let x=0;x<cols;x++){
          const idx=y*cols+x;
          let br=brightness[idx];

          if(br<0.01){
            // Sparse bg
            if(globalOpacity>0.5){
              const n=Math.sin(x*0.3+y*0.2+time)*Math.sin(x*0.1-y*0.15)*0.5+0.5;
              if(n>0.93){ctx.fillStyle=`rgba(255,255,255,${(0.04*globalOpacity).toFixed(3)})`;ctx.fillText('.',x*charW,y*cfg.fontSize);}
            }
            continue;
          }

          // Animate
          const shimmer=Math.sin(time*2.5+x*0.05+y*0.04)*0.04;
          const sparkle=(Math.random()<0.003&&br>0.3)?0.25:0;
          br=Math.max(0,Math.min(1,br+shimmer+sparkle));

          const ch=charB(br);
          if(ch===' ') continue;

          let r,g,b,op;
          if(isEye[idx]){r=rgb.r;g=rgb.g;b=rgb.b;op=globalOpacity;}
          else if(br>0.7&&Math.random()<0.1){
            r=Math.min(255,(180+rgb.r*0.3)|0);g=Math.min(255,(180+rgb.g*0.3)|0);b=Math.min(255,(180+rgb.b*0.3)|0);
            op=(0.5+br*0.5)*globalOpacity;
          } else {
            const v=100+br*155; r=v;g=v;b=v;
            op=(0.4+br*0.6)*globalOpacity;
          }

          if(op<0.01) continue;
          ctx.fillStyle=`rgba(${r|0},${g|0},${b|0},${op.toFixed(3)})`;
          ctx.fillText(ch,x*charW,y*cfg.fontSize);
        }
      }
    }

    destroy(){this.stop();window.removeEventListener('resize',this._resize);window.removeEventListener('scroll',this._scroll);}
  }

  // ============================================
  // 3D ROTATING DRAGON (bottom section)
  // ============================================
  class Dragon3D {
    constructor(canvas,cfg={}){
      this.canvas=canvas;this.ctx=canvas.getContext('2d');
      this.cfg={fontSize:isMobile?6:(cfg.fontSize||8),maxFps:isMobile?8:(cfg.maxFps||12),...cfg};
      this.running=false;this.lastFrame=0;this.frameInterval=1000/this.cfg.maxFps;
      this.animId=null;this.time=0;this.frameCache={};this.currentAngle=0;
      this._resize=this.resize.bind(this);
      window.addEventListener('resize',this._resize);
      this.resize();
    }
    resize(){
      const dpr=Math.min(window.devicePixelRatio||1,isMobile?1:1.5);
      const p=this.canvas.parentElement;
      const r=p?p.getBoundingClientRect():{width:400,height:400};
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
      const f=computeFrame(this.cols,this.rows,a,0.25,isMobile?8:9);
      this.frameCache[ak]=f; return f;
    }
    _anim(ts){
      if(!this.running)return;
      this.animId=requestAnimationFrame(this._anim.bind(this));
      if(ts-this.lastFrame<this.frameInterval)return;
      this.lastFrame=ts;this.time+=0.015;
      this.currentAngle+=0.4;if(this.currentAngle>=360)this.currentAngle-=360;
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
      const{brightness,isEye}=frame;
      for(let y=0;y<rows;y++){
        for(let x=0;x<cols;x++){
          const idx=y*cols+x;
          let br=brightness[idx]; if(br<0.01)continue;
          br=Math.max(0,Math.min(1,br+Math.sin(time*2+x*0.06+y*0.05)*0.04));
          const ch=charB(br); if(ch===' ')continue;
          let r,g,b,op;
          if(isEye[idx]){r=rgb.r;g=rgb.g;b=rgb.b;op=1;}
          else if(br>0.65&&Math.random()<0.1){r=Math.min(255,(170+rgb.r*0.4)|0);g=Math.min(255,(170+rgb.g*0.4)|0);b=Math.min(255,(170+rgb.b*0.4)|0);op=0.5+br*0.5;}
          else{const v=85+br*170;r=v;g=v;b=v;op=0.35+br*0.65;}
          ctx.fillStyle=`rgba(${r|0},${g|0},${b|0},${op.toFixed(2)})`;
          ctx.fillText(ch,x*charW,y*cfg.fontSize);
        }
      }
      ctx.font='10px "Space Mono",monospace';ctx.textAlign='center';
      ctx.fillStyle=`rgba(${rgb.r},${rgb.g},${rgb.b},0.35)`;
      ctx.fillText('< DRAGON >',w/2,h-16);ctx.textAlign='start';
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
