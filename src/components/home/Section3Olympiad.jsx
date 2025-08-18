// src/components/home/Section3Olympiad.jsx
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DownHint from './DownHint';

gsap.registerPlugin(ScrollTrigger);

const MIN_PER_PX = 12; // 1分钟 = 12px

// 工具函数：计算直线AB'与河岸y=R的交点H
const calculateIntersection = (A, BPrime, riverY) => {
  const { x: xA, y: yA } = A;
  const { x: xBPrime, y: yBPrime } = BPrime;
  
  if (yBPrime !== yA) {
    const xH = xA + (riverY - yA) * (xBPrime - xA) / (yBPrime - yA);
    return { x: xH, y: riverY };
  }
  return { x: xA, y: riverY };
};

export default function Section3Olympiad({ id }) {
  const root = useRef(null);
  const tlRef = useRef(null);

  useLayoutEffect(() => {
    const el = root.current;

    // helper
    const buildTimeline = () => {
      // 计算关键点坐标
      const A = { x: 120, y: 50 };
      const B = { x: 360, y: 60 };
      const riverY = 140;
      const BPrime = { x: B.x, y: 2 * riverY - B.y }; // B'(360, 220)
      const H = calculateIntersection(A, BPrime, riverY); // 最优点P2
      const P1 = { x: 180, y: riverY }; // 随意选的点P1，往左移动拉开距离
      
      // 初始样式
      gsap.set(["#p3-left", "#p3-right"], { autoAlpha: 0, y: 8 });
      gsap.set("#p3-title", { autoAlpha: 0, y: 8 });
      gsap.set([
        "#p3-left-caption",
        "#p3-tag-long",
        "#p3-tag-short",
        "#p3-right-caption",
        "#p3-lbl-serial",
        "#p3-lbl-parallel",
        "#p3-saved-badge",
        "#p3-footer",
        "#p3-Bp",
        "#p3-H",
        "#p3-ABprime-line",
        "#p3-P1",
        "#p3-P1-label",
        "#p3-P2",
        "#p3-P2-label",
        "#p3-color-legend",
      ], { autoAlpha: 0 });

      // 动态更新H点位置
      const hElement = document.getElementById("p3-H");
      if (hElement) {
        hElement.setAttribute("cx", H.x);
        hElement.setAttribute("cy", H.y);
      }

      // 更新短路径为正确的A→H→B
      const shortPath = document.getElementById("p3-path-short");
      if (shortPath) {
        shortPath.setAttribute("d", `M ${A.x} ${A.y} L ${H.x} ${H.y} L ${B.x} ${B.y}`);
      }

      // 准备左卡 SVG 路径描边动画
      const longPath = document.getElementById("p3-path-long");
      const abPrimeLine = document.getElementById("p3-ABprime-line");
      const prepDraw = (pathEl) => {
        if (!pathEl) return;
        const len = pathEl.getTotalLength();
        pathEl.style.strokeDasharray = String(len);
        pathEl.style.strokeDashoffset = String(len);
      };
      prepDraw(longPath);
      prepDraw(shortPath);
      // AB'虚线准备
      if (abPrimeLine) {
        const len = abPrimeLine.getTotalLength();
        abPrimeLine.style.strokeDasharray = "8,4";
        abPrimeLine.style.strokeDashoffset = String(len);
      }

      // 准备右卡：隐藏串行行和并行行
      gsap.set("#p3-serial", { autoAlpha: 0 });
      gsap.set("#p3-parallel", { autoAlpha: 0 });

      // 重置甘特条形和文字标签
      gsap.set([
        "#bar-serial-water", "#bar-serial-boil", "#bar-serial-wash", "#bar-serial-prep", "#bar-serial-brew",
        "#bar-par-water", "#bar-par-boil", "#bar-par-wash", "#bar-par-prep", "#bar-par-brew"
      ], { width: "0%" });
      
      gsap.set([
        "#text-serial-water", "#text-serial-boil", "#text-serial-wash", "#text-serial-prep", "#text-serial-brew",
        "#text-par-water", "#text-par-boil", "#text-par-wash", "#text-par-prep", "#text-par-brew"
      ], { opacity: 0 });
      
      // 重置并行容器高度为初始的2倍高度
      gsap.set("#p3-parallel-container", { height: "64px" }); // h-16 = 64px

      const tl = gsap.timeline({ paused: true, defaults: { ease: "power1.out" } });

      // 0.0–2.5s 标题入场与淡出（类似Section2MindBarrage）
      tl.to("#p3-title", { autoAlpha: 1, y: 0, duration: 0.8 })
        .to("#p3-title", { autoAlpha: 0, y: -18, duration: 1.0 }, "+=0.8");

      // 2.5–3.1s 卡片浮现
      tl.to(["#p3-left", "#p3-right"], { autoAlpha: 1, y: 0, duration: 0.6 }, 2.5);

      // 3.1–11.0s 左卡分镜
      // 3.1–4.0s：显示A、B、河；字幕淡入
      tl.to(["#p3-A", "#p3-B", "#p3-river"], { autoAlpha: 1, duration: 0.6 }, 3.1)
        .to("#p3-left-caption", { autoAlpha: 1, duration: 0.8 }, 3.1)
        
        // 4.0–5.5s：显示随意选点P1，绘制折线路径A→P1→B
        .to(["#p3-P1", "#p3-P1-label"], { autoAlpha: 1, duration: 0.3 }, 4.0)
        .to("#p3-path-long", { strokeDashoffset: 0, duration: 1.2, ease: "none" }, 4.3)
        .to("#p3-tag-long", { autoAlpha: 1, duration: 0.3 }, 5.2)
        
        // 5.5–7.5s：显示镜像点B'，绘制虚线AB'
        .to("#p3-Bp", { autoAlpha: 1, duration: 0.5 }, 5.5)
        .to("#p3-ABprime-line", { autoAlpha: 1, strokeDashoffset: 0, duration: 1.5, ease: "none" }, 6.0)
        
        // 7.5–10.5s：显示交点P2(H)，绘制最优路径A→P2→B
        .to(["#p3-P2", "#p3-P2-label"], { autoAlpha: 1, duration: 0.4 }, 7.5)
        .to("#p3-path-short", { strokeDashoffset: 0, duration: 1.8, ease: "none" }, 7.9)
        .to("#p3-tag-short", { autoAlpha: 1, duration: 0.4 }, 9.7)
        .to("#p3-ABprime-line", { autoAlpha: 0.2, duration: 0.4 }, 10.1);

      // 11.0–22.0s 右卡分镜
      // 11.0–12.5s：任务条与字幕浮现
      tl.to(["#p3-right-caption", "#p3-color-legend"], { autoAlpha: 1, duration: 0.8 }, 11.0)
        
        // 12.5–16.0s：显示串行甘特
        .to("#p3-serial", { autoAlpha: 1, duration: 0.4 }, 12.5)
        .to("#bar-serial-water", { width: "6.25%", duration: 0.3 }, 12.7)
        .to("#text-serial-water", { opacity: 1, duration: 0.2 }, 12.8)
        .to("#bar-serial-boil",  { width: "62.5%", duration: 1.0 }, 13.0)
        .to("#text-serial-boil", { opacity: 1, duration: 0.2 }, 13.3)
        .to("#bar-serial-wash",  { width: "18.75%", duration: 0.4 }, 14.2)
        .to("#text-serial-wash", { opacity: 1, duration: 0.2 }, 14.4)
        .to("#bar-serial-prep",  { width: "6.25%", duration: 0.2 }, 14.8)
        .to("#text-serial-prep", { opacity: 1, duration: 0.2 }, 15.0)
        .to("#bar-serial-brew",  { width: "6.25%", duration: 0.2 }, 15.2)
        .to("#text-serial-brew", { opacity: 1, duration: 0.2 }, 15.4)
        .to("#p3-lbl-serial",    { autoAlpha: 1, duration: 0.4 }, 15.5)
        
        // 16.0–22.0s：切换到并行场景（保持串行完全可见）
        .to("#p3-parallel", { autoAlpha: 1, duration: 0.5 }, 16.0)
        
        // 16.5–18.5s：并行甘特图动画（按16分钟总宽度计算）
        .to("#bar-par-water", { width: "6.25%", duration: 0.3 }, 16.5) // 1/16
        .to("#text-par-water", { opacity: 1, duration: 0.2 }, 16.6)
        .to("#bar-par-boil",  { width: "62.5%", duration: 1.0 }, 16.8) // 10/16
        .to("#text-par-boil", { opacity: 1, duration: 0.2 }, 17.1)
        .to("#bar-par-wash",  { width: "18.75%", duration: 0.4 }, 16.8) // 3/16
        .to("#text-par-wash", { opacity: 1, duration: 0.2 }, 16.9)
        .to("#bar-par-prep",  { width: "6.25%", duration: 0.2 }, 17.2) // 1/16
        .to("#text-par-prep", { opacity: 1, duration: 0.2 }, 17.3)
        .to("#bar-par-brew",  { width: "6.25%", duration: 0.3 }, 17.8) // 1/16
        .to("#text-par-brew", { opacity: 1, duration: 0.2 }, 17.9)
        
        // 18.5–20.0s：方框融合为串行等高并显示结果
        .to("#p3-parallel-container", { height: "32px", duration: 0.6, ease: "power2.out" }, 18.5) // 从64px(h-16)融合为32px(h-8)
        .to("#p3-lbl-parallel", { autoAlpha: 1, duration: 0.4 }, 19.0)
        .fromTo("#p3-saved-badge", { autoAlpha: 0, scale: 0.95 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }, 19.5);

      // 22.0–23.0s：底部收束句
      tl.to("#p3-footer", { autoAlpha: 1, y: 0, duration: 1.0 }, 22.0);

      return tl;
    };

    // ScrollTrigger：进入播放，离开复位
    const snapContainer = document.getElementById('snap-container');
    
    const st = ScrollTrigger.create({
      trigger: el,
      scroller: snapContainer || window, // 使用snap容器作为scroller
      start: "top 80%",
      end: "bottom 20%",
      invalidateOnRefresh: true,
      refreshPriority: -90,
      onEnter: () => {
        tlRef.current?.kill();
        tlRef.current = buildTimeline();
        tlRef.current.play(0);
      },
      onEnterBack: () => {
        tlRef.current?.kill();
        tlRef.current = buildTimeline();
        tlRef.current.play(0);
      },
      onLeave: () => {
        tlRef.current?.pause(0);
      },
      onLeaveBack: () => {
        tlRef.current?.pause(0);
      },
    });
    
    // 添加备用的 Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            tlRef.current?.kill();
            tlRef.current = buildTimeline();
            tlRef.current.play(0);
          }
        });
      },
      {
        root: snapContainer,
        threshold: [0.1, 0.3, 0.5, 0.7],
        rootMargin: "0px"
      }
    );
    
    observer.observe(el);

    // 强制刷新ScrollTrigger
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      st.kill();
      observer.disconnect();
      tlRef.current?.kill();
    };
  }, []); // 注意：这里是空数组，不依赖任何值！

  // 计算关键点坐标（用于渲染）
  const A = { x: 120, y: 50 };
  const B = { x: 360, y: 60 };
  const riverY = 140;
  const BPrime = { x: B.x, y: 2 * riverY - B.y }; // B'(360, 220)
  const H = calculateIntersection(A, BPrime, riverY); // 最优点P2
  const P1 = { x: 180, y: riverY }; // 随意选的点P1，往左移动拉开距离

  // —— 布局与静态结构 ——
  return (
    <section
      id={id}
      ref={root}
      className="snap-section relative flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: 'var(--bg-deep)', color: 'var(--ink-high)' }}
      aria-label="其实我们小时候就做过优化题"
    >
      <h1 
        id="p3-title" 
        className="absolute text-center px-6 font-bold"
        style={{ 
          zIndex: 30,
          fontSize: 'clamp(28px, 4vw, 56px)',
          color: 'var(--ink-high)',
          letterSpacing: '-0.5%',
          opacity: 0
        }}
      >
        其实我们小时候就做过优化题
      </h1>

      <div className="w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-6">
        {/* 左卡：将军饮马 */}
        <div 
          id="p3-left" 
          className="rounded-xl p-4"
          style={{ 
            opacity: 0,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--carbon-line)'
          }}
        >
          <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>将军饮马</h3>
          
          <p 
            id="p3-left-caption" 
            className="text-sm mb-4"
            style={{ 
              opacity: 0,
              color: 'var(--ink-mid)'
            }}
          >
            从 A 出发，路过河边喝水，再去 B。怎么走更短？
          </p>

          <div className="relative">
            <svg
              id="p3-left-svg"
              width="480"
              height="260"
              viewBox="0 0 480 260"
              className="w-full h-auto rounded-lg"
              style={{ 
                border: '1px solid var(--carbon-line)',
                backgroundColor: 'var(--bg-elevated)'
              }}
            >
              <title>将军饮马路径优化图</title>
              <desc>显示从点A经过河边到点B的两种路径比较</desc>
              
              {/* 河岸线 */}
              <line 
                id="p3-river" 
                x1="0" y1={riverY} x2="480" y2={riverY} 
                stroke="var(--tech-mint)" 
                strokeWidth="3"
                style={{ opacity: 0 }}
              />
              <text x="10" y={riverY - 10} fontSize="12" fill="var(--tech-mint)">河</text>
              
              {/* A / B 点 */}
              <circle id="p3-A" cx={A.x} cy={A.y} r="6" fill="var(--amber-signal)" style={{ opacity: 0 }} />
              <text x={A.x - 15} y={A.y - 10} fontSize="14" fill="var(--amber-signal)" fontWeight="bold">A</text>
              
              <circle id="p3-B" cx={B.x} cy={B.y} r="6" fill="var(--amber-signal)" style={{ opacity: 0 }} />
              <text x={B.x + 10} y={B.y - 10} fontSize="14" fill="var(--amber-signal)" fontWeight="bold">B</text>

              {/* 随意选的点P1 */}
              <circle id="p3-P1" cx={P1.x} cy={P1.y} r="5" fill="var(--ink-mid)" style={{ opacity: 0 }} />
              <text id="p3-P1-label" x={P1.x - 10} y={P1.y + 20} fontSize="12" fill="var(--ink-mid)" style={{ opacity: 0 }}>P1</text>

              {/* 镜像点B' */}
              <circle id="p3-Bp" cx={BPrime.x} cy={BPrime.y} r="6" fill="var(--danger-red)" fillOpacity="0.8" style={{ opacity: 0 }} />
              <text x={BPrime.x + 10} y={BPrime.y + 20} fontSize="12" fill="var(--danger-red)">B'</text>
              
              {/* B到B'的镜像虚线 */}
              <line x1={B.x} y1={B.y} x2={BPrime.x} y2={BPrime.y} 
                stroke="var(--ink-mid)" strokeWidth="1" strokeDasharray="3,3" opacity="0.3" />

              {/* AB'虚线（用于找最优点） */}
              <path
                id="p3-ABprime-line"
                d={`M ${A.x} ${A.y} L ${BPrime.x} ${BPrime.y}`}
                stroke="var(--danger-red)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="8,4"
                strokeDashoffset="400"
                style={{ opacity: 0 }}
              />

              {/* 最优点P2(H) */}
              <circle id="p3-P2" cx={H.x} cy={H.y} r="6" fill="var(--success-green)" style={{ opacity: 0 }} />
              <text id="p3-P2-label" x={H.x - 10} y={H.y + 20} fontSize="12" fill="var(--success-green)" style={{ opacity: 0 }}>P2</text>
              <circle id="p3-H" cx={H.x} cy={H.y} r="0" style={{ opacity: 0 }} />

              {/* "更长"路径 A→P1→B */}
              <path
                id="p3-path-long"
                d={`M ${A.x} ${A.y} L ${P1.x} ${P1.y} L ${B.x} ${B.y}`}
                stroke="var(--ink-mid)"
                strokeWidth="3"
                fill="none"
                strokeDasharray="500"
                strokeDashoffset="500"
              />
              
              {/* "更短"路径 A→P2→B */}
              <path
                id="p3-path-short"
                d={`M ${A.x} ${A.y} L ${H.x} ${H.y} L ${B.x} ${B.y}`}
                stroke="var(--success-green)"
                strokeWidth="3"
                fill="none"
                strokeDasharray="400"
                strokeDashoffset="400"
              />
            </svg>

            {/* 胶囊标签 - 根据P1和P2的位置动态定位 */}
            <div
              id="p3-tag-long"
              className="absolute rounded-full px-2 py-0.5 text-xs"
              style={{ 
                left: `${(P1.x / 480) * 100 - 15}%`,
                top: `${(riverY / 260) * 100 + 12}%`,
                opacity: 0,
                backgroundColor: 'var(--ink-dim)',
                color: 'var(--ink-mid)',
                border: '1px solid var(--ink-mid)'
              }}
            >
              这条路：更长
            </div>

            <div
              id="p3-tag-short"
              className="absolute rounded-full px-2 py-0.5 text-xs"
              style={{ 
                left: `${(H.x / 480) * 100 - 2}%`,
                top: `${(riverY / 260) * 100 + 12}%`,
                opacity: 0,
                backgroundColor: 'rgba(61, 220, 151, 0.1)',
                color: 'var(--success-green)',
                border: '1px solid var(--success-green)'
              }}
            >
              这条路：最短 ✅
            </div>
          </div>

          {/* 小提示 */}
          <p className="text-xs mt-2" style={{ color: 'var(--ink-low)' }}>
            把 B 映到河对面，连 A 到它，与河的交点就是饮马的地方。
          </p>
        </div>

        {/* 右卡：小明沏茶 */}
        <div 
          id="p3-right" 
          className="rounded-xl p-4"
          style={{ 
            opacity: 0,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--carbon-line)'
          }}
        >
          <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>小明沏茶</h3>
          
          <p 
            id="p3-right-caption" 
            className="text-sm mb-4"
            style={{ 
              opacity: 0,
              color: 'var(--ink-mid)'
            }}
          >
            小明要沏茶招待客人，不同的步骤耗时如下，他最快可以多长时间沏好茶？
          </p>

          {/* 颜色图例 */}
          <div 
            id="p3-color-legend"
            className="mb-3"
          >
            <div className="grid grid-cols-3 gap-2 text-xs" style={{ color: 'var(--ink-low)' }}>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-400 rounded"></div>
                <span>接水 1分钟</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-400 rounded"></div>
                <span>烧水 10分钟</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-400 rounded"></div>
                <span>泡茶 1分钟</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <span>洗茶杯 3分钟</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                <span>准备茶叶 1分钟</span>
              </div>
            </div>
          </div>

          <div id="p3-gantt" className="relative space-y-4">
            {/* 串行场景 */}
            <div id="p3-serial" style={{ opacity: 0 }}>
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium w-20" style={{ color: 'var(--ink-high)' }}>串行做:</span>
                <div className="flex-1 relative h-8 overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)', borderRadius: '6px' }}>
                  {/* 使用flexbox布局确保完美对齐 */}
                  <div className="absolute inset-0 flex">
                    {/* 接水 1分钟 (6.25% = 1/16) */}
                    <div id="bar-serial-water" className="bg-blue-400 flex items-center justify-center transition-all" style={{ width: '0%', borderTopLeftRadius: '6px', borderBottomLeftRadius: '6px' }}>
                      <span className="text-xs font-medium text-white opacity-0" id="text-serial-water">1</span>
                    </div>
                    {/* 烧水 10分钟 (62.5% = 10/16) */}
                    <div id="bar-serial-boil" className="bg-red-400 flex items-center justify-center transition-all" style={{ width: '0%' }}>
                      <span className="text-xs font-medium text-white opacity-0" id="text-serial-boil">10</span>
                    </div>
                    {/* 洗茶杯 3分钟 (18.75% = 3/16) */}
                    <div id="bar-serial-wash" className="bg-green-400 flex items-center justify-center transition-all" style={{ width: '0%' }}>
                      <span className="text-xs font-medium text-white opacity-0" id="text-serial-wash">3</span>
                    </div>
                    {/* 准备茶叶 1分钟 (6.25% = 1/16) */}
                    <div id="bar-serial-prep" className="bg-yellow-400 flex items-center justify-center transition-all" style={{ width: '0%' }}>
                      <span className="text-xs font-medium text-white opacity-0" id="text-serial-prep">1</span>
                    </div>
                    {/* 泡茶 1分钟 (6.25% = 1/16) */}
                    <div id="bar-serial-brew" className="bg-purple-400 flex items-center justify-center transition-all" style={{ width: '0%', borderTopRightRadius: '6px', borderBottomRightRadius: '6px' }}>
                      <span className="text-xs font-medium text-white opacity-0" id="text-serial-brew">1</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div
                id="p3-lbl-serial"
                className="rounded-full px-2 py-0.5 text-xs inline-block"
                style={{ 
                  opacity: 0,
                  backgroundColor: 'rgba(255, 107, 107, 0.1)',
                  color: 'var(--danger-red)',
                  border: '1px solid var(--danger-red)'
                }}
              >
                串行做：16 分钟
              </div>
            </div>

            {/* 并行场景 */}
            <div id="p3-parallel" style={{ opacity: 0 }}>
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium w-20" style={{ color: 'var(--ink-high)' }}>同时做:</span>
                <div id="p3-parallel-container" className="flex-1 relative h-16 rounded" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                  {/* 接水 1分钟 - 按16分钟总宽度的6.25% */}
                  <div id="bar-par-water" className="absolute top-0 h-full bg-blue-400 rounded-l flex items-center justify-center" style={{ left: '0%', width: '0%' }}>
                    <span className="text-xs font-medium text-white opacity-0" id="text-par-water">1</span>
                  </div>
                  
                  {/* 烧水 10分钟 - 从1分钟开始，占62.5%宽度，但只用实际的75%宽度(12/16) */}
                  <div id="bar-par-boil" className="absolute top-0 h-full bg-red-400 flex items-center justify-center" style={{ left: '6.25%', width: '0%' }}>
                    <span className="text-xs font-medium text-white opacity-0" id="text-par-boil">10</span>
                  </div>
                  
                  {/* 洗茶杯 3分钟 - 与烧水同时进行，在上半部分 */}
                  <div id="bar-par-wash" className="absolute bg-green-400 flex items-center justify-center" style={{ left: '6.25%', top: '0px', height: '50%', width: '0%' }}>
                    <span className="text-xs font-medium text-white opacity-0" id="text-par-wash">3</span>
                  </div>
                  
                  {/* 准备茶叶 1分钟 - 在洗茶杯之后，下半部分 */}
                  <div id="bar-par-prep" className="absolute bg-yellow-400 flex items-center justify-center" style={{ left: '25%', bottom: '0px', height: '50%', width: '0%' }}>
                    <span className="text-xs font-medium text-white opacity-0" id="text-par-prep">1</span>
                  </div>
                  
                  {/* 泡茶 1分钟 - 最后1分钟，实际在第11分钟位置 */}
                  <div id="bar-par-brew" className="absolute top-0 h-full bg-purple-400 flex items-center justify-center" style={{ left: '68.75%', width: '0%' }}>
                    <span className="text-xs font-medium text-white opacity-0" id="text-par-brew">1</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div
                  id="p3-lbl-parallel"
                  className="rounded-full px-2 py-0.5 text-xs"
                  style={{ 
                    opacity: 0,
                    backgroundColor: 'rgba(61, 220, 151, 0.1)',
                    color: 'var(--success-green)',
                    border: '1px solid var(--success-green)'
                  }}
                >
                  同时做：12 分钟
                </div>
                
                <div
                  id="p3-saved-badge"
                  className="rounded-full px-2 py-0.5 text-xs"
                  style={{ 
                    opacity: 0, 
                    transform: 'scale(0.95)',
                    backgroundColor: 'var(--amber-dim)',
                    color: 'var(--amber-signal)',
                    border: '1px solid var(--amber-signal)'
                  }}
                >
                  省 4 分钟 🎉
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部收束句 */}
      <p 
        id="p3-footer" 
        className="absolute bottom-32 left-0 right-0 text-center text-sm px-6"
        style={{ 
          opacity: 0,
          color: 'var(--ink-mid)',
          zIndex: 30
        }}
      >
        数学优化问题，小时候我们就已经会解！
      </p>

      {/* 底部提示 */}
      <DownHint targetSection={3} />
    </section>
  );
}