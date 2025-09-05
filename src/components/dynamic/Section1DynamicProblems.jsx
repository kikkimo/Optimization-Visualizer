import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import DownHint from '../shared/DownHint'

gsap.registerPlugin(ScrollTrigger)

/**
 * Dynamic & Stochastic Optimization Animation Utils
 */

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function makeRng(seed = 1) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6D2B79F5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function randn(rng) {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function lerp(a,b,t){ return a + (b-a)*t; }

function add(a,b){ return [a[0]+b[0], a[1]+b[1]]; }
function sub(a,b){ return [a[0]-b[0], a[1]-b[1]]; }
function muls(a,s){ return [a[0]*s, a[1]*s]; }
function norm(a){ return Math.hypot(a[0], a[1]); }

// Kalman Filter Functions
function kfPredict(x, P, dt, q) {
  const A = [
    [1, 0, dt, 0],
    [0, 1, 0, dt],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
  const G = [ [0.5*dt*dt,0], [0,0.5*dt*dt], [dt,0], [0,dt] ];
  const xp = [
    A[0][0]*x[0] + A[0][2]*x[2],
    A[1][1]*x[1] + A[1][3]*x[3],
    x[2],
    x[3],
  ];
  function matMul(A,B){
    const m=A.length,n=B[0].length,k=B.length; const C=Array.from({length:m},()=>Array(n).fill(0));
    for(let i=0;i<m;i++) for(let j=0;j<n;j++) for(let t=0;t<k;t++) C[i][j]+=A[i][t]*B[t][j];
    return C;
  }
  function matAdd(A,B){ const C=A.map((r,i)=>r.map((v,j)=>v+B[i][j])); return C; }
  const At = A[0].map((_,j)=>A.map(row=>row[j]));
  const AP = matMul(A,P); const APA = matMul(AP,At);
  const Q = (()=>{
    const D = [[q,0],[0,q]]; const GD = matMul(G,D); const Gt = G[0].map((_,j)=>G.map(row=>row[j]));
    return matMul(GD,Gt);
  })();
  const Pp = matAdd(APA,Q);
  return {x: xp, P: Pp};
}

function kfUpdate(x, P, z, r){
  const H = [ [1,0,0,0], [0,1,0,0] ];
  function matMul(A,B){
    const m=A.length,n=B[0].length,k=B.length; const C=Array.from({length:m},()=>Array(n).fill(0));
    for(let i=0;i<m;i++) for(let j=0;j<n;j++) for(let t=0;t<k;t++) C[i][j]+=A[i][t]*B[t][j];
    return C;
  }
  const Ht = H[0].map((_,j)=>H.map(row=>row[j]));
  const I4 = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];
  function matAdd(A,B){ const C=A.map((r,i)=>r.map((v,j)=>v+B[i][j])); return C; }
  function matSub(A,B){ const C=A.map((r,i)=>r.map((v,j)=>v-B[i][j])); return C; }
  const hx = [x[0], x[1]]; const y = [z[0]-hx[0], z[1]-hx[1]];
  const HP = matMul(H,P); const HPHt = matMul(HP,Ht); const R = [[r,0],[0,r]];
  const S = matAdd(HPHt,R);
  const det = S[0][0]*S[1][1]-S[0][1]*S[1][0];
  const Sinv = [[ S[1][1]/det, -S[0][1]/det],[-S[1][0]/det, S[0][0]/det]];
  const PHt = matMul(P,Ht); const K = matMul(PHt,Sinv);
  const xy = [ K[0][0]*y[0]+K[0][1]*y[1], K[1][0]*y[0]+K[1][1]*y[1], K[2][0]*y[0]+K[2][1]*y[1], K[3][0]*y[0]+K[3][1]*y[1] ];
  const xn = [ x[0]+xy[0], x[1]+xy[1], x[2]+xy[2], x[3]+xy[3] ];
  const KH = matMul(K,H); const IminusKH = I4.map((row,i)=>row.map((v,j)=>v-(KH[i]?.[j]||0)));
  const Pn = matMul(IminusKH,P);
  return {x: xn, P: Pn};
}

function covEllipse(P, scale=3){
  const S = [[P[0][0],P[0][1]],[P[1][0],P[1][1]]];
  const tr = S[0][0]+S[1][1];
  const det = S[0][0]*S[1][1]-S[0][1]*S[1][0];
  const d = Math.sqrt(Math.max(0,tr*tr/4 - det));
  const l1 = tr/2 + d, l2 = tr/2 - d;
  const v1 = [S[0][1], l1 - S[0][0]];
  const ang = Math.atan2(v1[1], v1[0] || 1e-6);
  return { rx: Math.sqrt(Math.max(l1,0))*scale, ry: Math.sqrt(Math.max(l2,0))*scale, ang };
}

function planPreview(x0, steps, dt, target, uMax=40, kAcc=1.2) {
  let x = { p:[x0[0],x0[1]], v:[x0[2],x0[3]] };
  const path = [x.p.slice()];
  for(let i=0;i<steps;i++){
    const dir = sub(target,x.p);
    const d = norm(dir);
    const acc = d>1? muls(muls(dir,1/d), Math.min(uMax, kAcc*d)) : [0,0];
    x.v = add(x.v, muls(acc, dt));
    x.p = add(x.p, muls(x.v, dt));
    path.push(x.p.slice());
  }
  return path;
}

const WIDTH = 800, HEIGHT = 400, PAD = 20;
const WORLD = { xMin:-50, xMax: 350, yMin:-30, yMax: 220 };

function worldToSvg([x,y]){
  const W = WIDTH - PAD*2, H = HEIGHT - PAD*2;
  const X = PAD + (x - WORLD.xMin)/(WORLD.xMax - WORLD.xMin) * W;
  const Y = PAD + H - (y - WORLD.yMin)/(WORLD.yMax - WORLD.yMin) * H;
  return [X,Y];
}

function useTicker(speed=1){
  const [t, setT] = useState(0);
  const ref = useRef({ last: performance.now() });
  useEffect(()=>{
    let raf;
    const loop = (now)=>{
      const dt = (now - ref.current.last)/1000 * speed;
      ref.current.last = now;
      setT(v=> v + dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return ()=> cancelAnimationFrame(raf);
  },[speed]);
  return t;
}

// 动态优化可视化组件
const DynamicOptimizationViz = () => {
  const t = useTicker(1);
  const T = 40; // shorter loop
  const tau = (t % T);

  const PH1 = [0,15];   // Estimation
  const PH2 = [15,30];  // Control
  const PH3 = [30,40];  // Unified

  const rng = useMemo(()=> makeRng(42 + Math.floor(t/T)), [Math.floor(t/T)]);

  const dtFrame = 0.06;

  const processNoise = useMemo(()=>{
    if (tau < 8) return 4e-1;
    if (tau < 12) return 1.2;
    if (tau < 15) return 1e-2;
    if (tau < 25) return 0.3;
    if (tau < 30) return 0.6;
    return 0.3;
  }, [tau]);

  const measNoise = useMemo(()=>{
    if (tau < 8) return 6;
    if (tau < 10) return 30;
    if (tau < 12) return 6;
    if (tau < 15) return 1;
    if (tau < 30) return 5;
    return 8;
  }, [tau]);

  const controlAgg = useMemo(()=>{
    if (tau < PH2[0]) return 0;
    if (tau < 20) return 0.4;
    if (tau < 25) return 1.0;
    if (tau < PH2[1]) return 0.6;
    return 0.0;
  }, [tau]);

  const target = useMemo(()=>{
    const u = (tau - PH2[0]) / (PH2[1]-PH2[0]+1e-6);
    const p0 = [280, 40], p1 = [320, 180];
    const p = [ lerp(p0[0],p1[0], clamp(u,0,1)), lerp(p0[1],p1[1], clamp(u,0,1)) ];
    return p;
  }, [tau]);

  const simRef = useRef(null);
  if (!simRef.current) {
    simRef.current = {
      x: [20, 30, 30, 5],
      xh: [15, 25, 0, 0],
      P: [[30,0,0,0],[0,30,0,0],[0,0,10,0],[0,0,0,10]],
      history: [],
    };
  }

  const framesPerRender = 1;
  for (let k=0;k<framesPerRender;k++){
    const acc = [ randn(rng)*processNoise, randn(rng)*processNoise ];
    simRef.current.x[2] += acc[0]*dtFrame;
    simRef.current.x[3] += acc[1]*dtFrame;
    simRef.current.x[0] += simRef.current.x[2]*dtFrame;
    simRef.current.x[1] += simRef.current.x[3]*dtFrame;

    const margin = 5;
    [0,1].forEach(i=>{
      const pos = simRef.current.x[i];
      const velIdx = i+2;
      const min = i===0? WORLD.xMin+margin : WORLD.yMin+margin;
      const max = i===0? WORLD.xMax-margin : WORLD.yMax-margin;
      if (pos < min && simRef.current.x[velIdx] < 0) simRef.current.x[velIdx] *= -0.6;
      if (pos > max && simRef.current.x[velIdx] > 0) simRef.current.x[velIdx] *= -0.6;
    });

    const pred = kfPredict(simRef.current.xh, simRef.current.P, dtFrame, processNoise*0.5);
    let xh = pred.x, P = pred.P;

    const z = [ simRef.current.x[0] + randn(rng)*measNoise, simRef.current.x[1] + randn(rng)*measNoise ];
    const upd = kfUpdate(xh, P, z, measNoise*measNoise);
    xh = upd.x; P = upd.P;

    if (controlAgg > 0) {
      const toT = sub(target, [xh[0],xh[1]]);
      const accMag = controlAgg * 30;
      const a = muls(toT, accMag / Math.max(1, norm(toT)));
      xh[2] += a[0]*dtFrame;
      xh[3] += a[1]*dtFrame;
    }

    simRef.current.xh = xh; simRef.current.P = P;
    simRef.current.history.push({
      p: [simRef.current.x[0], simRef.current.x[1]],
      ph: [xh[0], xh[1]],
      P: JSON.parse(JSON.stringify(P)),
    });
    if (simRef.current.history.length > 300) simRef.current.history.shift();
  }

  const previewPath = useMemo(()=>{
    if (controlAgg <= 0) return [];
    const steps = 8;
    return planPreview(simRef.current.xh, steps, 0.25, target, 50*controlAgg, 1.0+controlAgg);
  }, [controlAgg, target, tau]);

  const beliefEllipses = useMemo(()=>{
    const H = simRef.current.history;
    const M = 30; const start = Math.max(0, H.length - M);
    return H.slice(start).map((h,i)=>{
      const e = covEllipse(h.P, 1.5);
      return { p: h.ph, e, alpha: (i+1)/M*0.25 };
    });
  }, [tau]);

  const sparkSegments = useMemo(()=>{
    if (tau < PH3[0]) return [];
    const path = previewPath.length? previewPath : [ [simRef.current.xh[0], simRef.current.xh[1]] ];
    const segs = [];
    for(let i=path.length-1;i>0;i--) segs.push([path[i-1], path[i]]);
    return segs;
  }, [tau, previewPath]);

  function Contours(){
    const rings = [20, 40, 60, 80, 100];
    return (
      <g>
        {rings.map((r,i)=>{
          const [cx,cy] = worldToSvg(target);
          return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke="rgba(60, 230, 192, 0.3)" strokeDasharray="4 4" strokeOpacity={0.5}/>;
        })}
      </g>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto rounded-xl border" style={{
        background: 'linear-gradient(135deg, rgba(60, 230, 192, 0.02) 0%, rgba(14, 165, 233, 0.02) 100%)',
        borderColor: 'rgba(60, 230, 192, 0.3)'
      }}>
        <defs>
          <pattern id="dynamicGrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(60, 230, 192, 0.1)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="url(#dynamicGrid)"/>

        {(tau>=PH2[0]) && <Contours/>}

        <g>
          {simRef.current.history.length>1 && (
            <path d={(()=>{
              const d = simRef.current.history.map((h,i)=>{
                const [X,Y] = worldToSvg(h.p);
                return `${i===0?"M":"L"}${X},${Y}`;
              }).join(" ");
              return d;
            })()} stroke="rgba(229, 231, 235, 0.4)" strokeWidth={1.5} fill="none"/>
          )}
        </g>

        <g>
          {simRef.current.history.slice(-80).map((h,i)=>{
            const alpha = 0.3 + 0.6 * (i%8===0? 1: 0.3);
            const [X,Y] = worldToSvg(h.p);
            return <circle key={i} cx={X} cy={Y} r={2} fill="rgba(245, 158, 11, 0.8)" fillOpacity={alpha}/>;
          })}
        </g>

        <g>
          {simRef.current.history.length>1 && (
            <path d={(()=>{
              const d = simRef.current.history.map((h,i)=>{
                const [X,Y] = worldToSvg(h.ph);
                return `${i===0?"M":"L"}${X},${Y}`;
              }).join(" ");
              return d;
            })()} stroke="rgba(60, 230, 192, 0.9)" strokeWidth={2.5} fill="none"/>
          )}
        </g>

        {(()=>{
          const last = simRef.current.history[simRef.current.history.length-1];
          if (!last) return null;
          const {e} = {e: covEllipse(last.P, 1.8)};
          const [cx,cy] = worldToSvg(last.ph);
          return (
            <g>
              <g transform={`translate(${cx},${cy}) rotate(${(e.ang*180/Math.PI).toFixed(2)})`}>
                <ellipse cx={0} cy={0} rx={Math.max(4,e.rx)} ry={Math.max(3,e.ry)} fill="rgba(60, 230, 192, 0.15)" stroke="rgba(60, 230, 192, 0.6)" strokeOpacity={0.8}/>
              </g>
            </g>
          );
        })()}

        {(tau>=PH2[0]) && (()=>{
          const [tx,ty] = worldToSvg(target);
          return (
            <g>
              <path d={`M ${tx} ${ty} l 0 -20 l 24 6 l -24 6 Z`} fill="rgba(16, 185, 129, 0.9)"/>
              <line x1={tx} y1={ty} x2={tx} y2={ty+18} stroke="rgba(15, 118, 110, 0.8)" strokeWidth={2}/>
            </g>
          );
        })()}

        {(tau>=PH2[0]) && previewPath.length>1 && (
          <path d={previewPath.map((p,i)=>{
            const [X,Y] = worldToSvg(p);
            return `${i===0?"M":"L"}${X},${Y}`;
          }).join(" ")} stroke="rgba(168, 85, 247, 0.7)" strokeWidth={2} fill="none"/>
        )}

        {(tau>=PH3[0]) && beliefEllipses.map((b,i)=>{
          const [cx,cy] = worldToSvg(b.p);
          return (
            <g key={i} transform={`translate(${cx},${cy}) rotate(${(b.e.ang*180/Math.PI).toFixed(2)})`}>
              <ellipse cx={0} cy={0} rx={Math.max(3,b.e.rx)} ry={Math.max(2,b.e.ry)} fill="rgba(168, 85, 247, 0.1)" stroke="rgba(168, 85, 247, 0.3)" strokeOpacity={b.alpha*0.9}/>
            </g>
          );
        })}

        {(tau>=PH3[0]) && sparkSegments.map((seg,i)=>{
          const [a,b] = seg; const [x1,y1]=worldToSvg(a), [x2,y2]=worldToSvg(b);
          const op = 0.2 + 0.6*(i%3===0?1:0.4);
          return <line key={i} x1={x2} y1={y2} x2={x1} y2={y1} stroke="rgba(245, 158, 11, 0.8)" strokeWidth={2} strokeOpacity={op}/>;
        })}
      </svg>
      
      <div className="mt-3 text-center">
        <div className="text-xs" style={{ color: 'var(--ink-mid)' }}>
          动态系统：估计 → 控制 → 统一视角 · 第 {(Math.floor(t/T)+1)} 轮
        </div>
      </div>
    </div>
  );
};

const Section1DynamicProblems = ({ id, currentSection, totalSections }) => {
  const textContainerRef = useRef(null);
  const sectionRef = useRef(null);
  const tlRef = useRef(null);

  const longText = `在静态优化中，我们为动态的现实按下暂停键，致力于寻找确定的最优参数，回答"是什么"这一瞬时性问题。这如同绘制精确的地图，帮助我们理解系统在特定时刻的理想状态。

然而现实世界始终处于动态变化中。从飞行器的轨迹到地球的形态，万物都在时间维度中持续演化。过程模型存在偏差，观测数据伴随噪声，这使得绝对确定性变得难以企及。这要求我们必须将时间维度引入模型核心，从求解"是什么"转向探索"如何演化与行动"。

这就是动态与随机优化研究的领域。在这类问题中，我们需要处理状态随时间演化且充满不确定性的系统。核心任务可分为两个重要方向：一是追踪动态过程，基于带噪声的观测来估计系统状态，这是对时变系统的认知；二是规划最优行动，通过系列决策引导系统达成目标，这是对系统行为的干预。

至此，优化问题的本质已经从寻找固定答案，转变为掌握处理动态系统的思想方法。解决这类问题不再依赖单一的迭代线性化工具，而是需要构建全新的方法论体系，以理解和引导这个充满变化的世界。`;

  const buildTypingTimeline = () => {
    const textContainer = textContainerRef.current;
    if (!textContainer) return gsap.timeline({ paused: true });

    textContainer.innerHTML = '';
    
    const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
    
    gsap.set(textContainer, { autoAlpha: 0 });
    
    tl.to(textContainer, { autoAlpha: 1, duration: 0.5 }, 1);

    const textLines = longText.split('\n').filter(line => line.trim());
    const maxVisibleLines = 1;
    let totalTypingTime = 1.5;
    let allLineElements = [];
    
    textLines.forEach((line, index) => {
      const lineEl = document.createElement('div');
      lineEl.className = 'typewriter-line fancy-typewriter';
      lineEl.style.opacity = '0';
      lineEl.style.marginBottom = '1.4rem';
      lineEl.style.lineHeight = '1.8';
      lineEl.style.transform = 'translateY(20px)';
      allLineElements.push(lineEl);
      
      if (index >= maxVisibleLines) {
        const oldLineIndex = index - maxVisibleLines;
        const oldLine = allLineElements[oldLineIndex];
        
        if (oldLine) {
          tl.to(oldLine, {
            opacity: 0,
            y: -30,
            duration: 0.5
          }, totalTypingTime - 0.3);
          
          tl.call(() => {
            if (oldLine && oldLine.parentNode) {
              oldLine.parentNode.removeChild(oldLine);
            }
          }, [], totalTypingTime + 0.2);
        }
      }
      
      tl.call(() => {
        if (textContainer) {
          textContainer.appendChild(lineEl);
        }
      }, [], totalTypingTime);
      
      tl.to(lineEl, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out"
      }, totalTypingTime);
      
      const typingDuration = Math.min(line.length * 0.06, 4);
      const typeInterval = typingDuration / line.length;
      
      for (let i = 0; i <= line.length; i++) {
        tl.call(() => {
          if (lineEl && lineEl.parentNode) {
            lineEl.textContent = line.substring(0, i);
            if (i < line.length) {
              lineEl.innerHTML = line.substring(0, i) + '<span class="typing-cursor">|</span>';
            } else {
              lineEl.textContent = line;
            }
          }
        }, [], totalTypingTime + 0.4 + i * typeInterval);
      }
      
      totalTypingTime += typingDuration + 1.0;
    });

    return tl;
  };

  useLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const createAndPlayTimeline = () => {
      if (tlRef.current) {
        tlRef.current.kill();
      }
      tlRef.current = buildTypingTimeline();
      if (tlRef.current) {
        tlRef.current.play(0);
      }
    };

    const snapContainer = document.getElementById('snap-container');
    
    const st = ScrollTrigger.create({
      trigger: el,
      scroller: snapContainer || window,
      start: "top 80%",
      end: "bottom 20%",
      invalidateOnRefresh: true,
      refreshPriority: -90,
      onEnter: createAndPlayTimeline,
      onEnterBack: createAndPlayTimeline,
      onLeave: () => {
        if (tlRef.current) {
          tlRef.current.pause(0);
        }
      },
      onLeaveBack: () => {
        if (tlRef.current) {
          tlRef.current.pause(0);
        }
      },
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            createAndPlayTimeline();
          }
        });
      },
      {
        root: snapContainer,
        threshold: [0.3, 0.7],
        rootMargin: "0px"
      }
    );
    
    if (el) {
      observer.observe(el);
    }

    setTimeout(() => {
      createAndPlayTimeline();
      ScrollTrigger.refresh();
    }, 500);

    return () => {
      st.kill();
      observer.disconnect();
      tlRef.current?.kill();
    };
  }, []);

  return (
    <div 
      ref={sectionRef}
      id={id}
      className="snap-section flex flex-col relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, var(--bg-deep) 0%, var(--bg-moderate) 100%)',
        color: 'var(--ink-high)',
        minHeight: '100vh'
      }}
    >
      {/* 背景动画 */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: 'var(--tech-mint)',
                boxShadow: '0 0 4px rgba(60, 230, 192, 0.8)',
                animation: `floatParticle ${6 + Math.random() * 8}s linear infinite`,
                animationDelay: `${Math.random() * 6}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            <span style={{ color: 'var(--tech-mint)' }}>动态与随机问题</span>
          </h2>
          <p className="text-lg md:text-xl leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
            探索时间演化系统中的不确定性与随机性
          </p>
        </div>

        {/* 动态优化可视化 */}
        <div className="mb-16">
          <DynamicOptimizationViz />
        </div>

        {/* 打字机文字区域 - 位于页面底部1/3 */}
        <div 
          ref={textContainerRef}
          className="w-full max-w-4xl mx-auto"
          style={{ 
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: 'var(--ink-high)',
            lineHeight: '1.8',
            fontWeight: '500'
          }}
        />
      </div>

      {/* 下一页提示 */}
      {currentSection < totalSections - 1 && (
        <DownHint targetSection={1} text="向下滚动继续" isStatic={false} />
      )}

      {/* CSS 动画样式 */}
      <style jsx>{`
        .typewriter-line {
          font-family: '"Microsoft YaHei", "Helvetica Neue", Arial, sans-serif';
          text-align: left;
          position: relative;
          font-weight: 500;
          letter-spacing: 0.3px;
        }
        
        .fancy-typewriter {
          position: relative;
          background: linear-gradient(90deg, 
            rgba(60, 230, 192, 0.06) 0%, 
            rgba(60, 230, 192, 0.02) 50%, 
            rgba(60, 230, 192, 0.06) 100%
          );
          padding: 0.8rem 1.2rem;
          margin: 0.3rem 0;
          border-left: 3px solid rgba(60, 230, 192, 0.6);
          border-radius: 4px;
          backdrop-filter: blur(1px);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }
        
        .fancy-typewriter::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(60, 230, 192, 0.1) 50%, 
            transparent 100%
          );
          animation: scanLine 2s linear infinite;
          pointer-events: none;
        }
        
        @keyframes scanLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        .typing-cursor {
          font-weight: 100;
          animation: blink 1s infinite;
          color: var(--tech-mint);
        }

        @keyframes floatParticle {
          0% { 
            transform: translateY(0px) translateX(0px) rotate(0deg); 
            opacity: 0;
          }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { 
            transform: translateY(-100vh) translateX(15px) rotate(360deg); 
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default Section1DynamicProblems