// src/components/home/Section4Bridge.jsx
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DownHint from './DownHint';

gsap.registerPlugin(ScrollTrigger);

// src/components/sections/Page4Bridge.jsx
const CARDS = [
  { id: "delivery", title: "外卖配送", subtitle: "又快、又不绕路、不超时", icon: "🛵" },
  { id: "picking", title: "仓库拣货", subtitle: "少走多拣更高效", icon: "📦" },
  { id: "cctv", title: "摄像头布设", subtitle: "更少数量覆盖全", icon: "📹" },
  { id: "sensors", title: "传感器布站", subtitle: "看得见、信号稳", icon: "📡" },
  { id: "budget", title: "预算排程", subtitle: "钱与时间的平衡", icon: "🧮" },
  { id: "mosaic", title: "影像镶嵌线", subtitle: "缝更少、过渡更自然", icon: "🧩" },
  { id: "registration", title: "图像配准", subtitle: "两幅影像对齐更准", icon: "🧭" },
  { id: "uav", title: "无人机航线", subtitle: "安全、省电、覆盖好", icon: "🛩️" },
];




export default function Section4Bridge({ id, scrollToSection }) {
  const root = useRef(null);
  const tlRef = useRef(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    
    const ctx = gsap.context(() => {

      // 舞台聚光灯控制函数
      let randomMoveTimer = null;
      let isHovering = false; // 标记是否有卡片被悬浮
      let currentHoveredCard = null; // 当前悬浮的卡片
      let isAutoPlayActive = true; // 标记是否在自动播放阶段
      
      const moveSpotlights = (targetElement, duration = 0.4) => {
        const leftSpotlight = el.querySelector('#spotlight-left');
        const rightSpotlight = el.querySelector('#spotlight-right');
        const leftBeam = el.querySelector('#spotlight-left-beam');
        const rightBeam = el.querySelector('#spotlight-right-beam');
        
        if (!leftSpotlight || !rightSpotlight || !leftBeam || !rightBeam) return;
        
        // 立即停止所有进行中的动画，避免冲突
        gsap.killTweensOf([leftSpotlight, rightSpotlight, leftBeam, rightBeam]);
        
        if (targetElement) {
          // 停止所有随机移动
          if (randomMoveTimer) {
            clearTimeout(randomMoveTimer);
            randomMoveTimer = null;
          }
          
          // 获取目标元素位置
          const rect = targetElement.getBoundingClientRect();
          const containerRect = el.getBoundingClientRect();
          
          const targetX = rect.left + rect.width / 2 - containerRect.left;
          const targetY = rect.top + rect.height / 2 - containerRect.top;
          
          // 计算聚光灯位置
          const leftSpotX = targetX - 200 - 120;
          const leftSpotY = targetY - 200;
          const leftBeamX = targetX - 60 - 80;
          const leftBeamY = targetY - 60;
          const rightSpotX = targetX - 200 + 120;
          const rightSpotY = targetY - 200;
          const rightBeamX = targetX - 60 + 80;
          const rightBeamY = targetY - 60;
          
          // 检查聚光灯是否正在移动
          const isCurrentlyAnimating = gsap.isTweening([leftSpotlight, rightSpotlight, leftBeam, rightBeam]);
          const hasRandomMovement = randomMoveTimer !== null;
          
          // 决定动画时长 - 确保从随机位置移动时有明显的动画
          let animDuration;
          if (isCurrentlyAnimating || hasRandomMovement || !isAutoPlayActive) {
            // 正在随机移动或手动操作时，使用较长的可见动画
            animDuration = 0.6;
          } else if (duration <= 0.1) {
            // 静止状态快速响应
            animDuration = 0.2;
          } else {
            // 自动播放时的正常时长
            animDuration = duration;
          }
          
          // 使用强制可见的动画效果
          const animProps = {
            duration: animDuration,
            ease: 'power2.out',
            force3D: true, // 强制使用GPU加速
            immediateRender: false // 确保动画从当前位置开始
          };
          
          gsap.to(leftSpotlight, {
            left: leftSpotX,
            top: leftSpotY,
            opacity: 1,
            ...animProps
          });
          gsap.to(leftBeam, {
            left: leftBeamX,
            top: leftBeamY,
            opacity: 1,
            ...animProps
          });
          gsap.to(rightSpotlight, {
            left: rightSpotX,
            top: rightSpotY,
            opacity: 1,
            ...animProps
          });
          gsap.to(rightBeam, {
            left: rightBeamX,
            top: rightBeamY,
            opacity: 1,
            ...animProps
          });
          
        } else {
          // 开始随机移动（只在自动播放结束且没有悬浮时）
          if (isHovering || isAutoPlayActive) return;
          
          const randomMove = () => {
            // 如果有悬浮或还在自动播放就立即停止
            if (isHovering || isAutoPlayActive) return;
            
            const randomLeft1 = Math.random() * (el.clientWidth - 400);
            const randomTop1 = Math.random() * (el.clientHeight - 400);
            const randomLeft2 = Math.random() * (el.clientWidth - 400);
            const randomTop2 = Math.random() * (el.clientHeight - 400);
            
            // 先停止之前的动画
            gsap.killTweensOf([leftSpotlight, rightSpotlight, leftBeam, rightBeam]);
            
            gsap.to(leftSpotlight, {
              left: randomLeft1,
              top: randomTop1,
              opacity: 0.7,
              duration: 1.2,
              ease: 'power2.inOut'
            });
            
            gsap.to(leftBeam, {
              left: randomLeft1 + 140,
              top: randomTop1 + 140,
              opacity: 0.8,
              duration: 1.2,
              ease: 'power2.inOut'
            });
            
            gsap.to(rightSpotlight, {
              left: randomLeft2,
              top: randomTop2,
              opacity: 0.7,
              duration: 1.5,
              ease: 'power2.inOut'
            });
            
            gsap.to(rightBeam, {
              left: randomLeft2 + 140,
              top: randomTop2 + 140,
              opacity: 0.8,
              duration: 1.5,
              ease: 'power2.inOut'
            });
            
            // 2.5秒后继续随机移动
            randomMoveTimer = setTimeout(() => {
              if (!isHovering && !isAutoPlayActive) {
                randomMove();
              }
            }, 2500);
          };
          
          randomMove();
        }
      };
      
      // 设置悬浮状态
      const setHoverState = (cardElement, isEntering) => {
        if (isEntering) {
          isHovering = true;
          currentHoveredCard = cardElement;
          // 立即聚焦，快速响应
          moveSpotlights(cardElement, 0.1);
        } else {
          isHovering = false;
          currentHoveredCard = null;
          // 延迟后开始随机移动
          setTimeout(() => {
            if (!isHovering) {
              moveSpotlights(null);
            }
          }, 300);
        }
      };

      const highlightOn = (cardId, isAutoPlay = false) => {
        const target = `#p4-card-${cardId}`;
        const targetElement = el.querySelector(target);
        
        if (isAutoPlay) {
          // 自动播放时使用动画
          gsap.to(".p4-card", { opacity: 0.35, duration: 0.4 });
          gsap.to(target, {
            opacity: 1,
            scale: 1.06,
            filter: "drop-shadow(0 8px 18px rgba(60, 230, 192, 0.35))",
            boxShadow: "0 0 0 3px rgba(60, 230, 192, 0.35) inset",
            duration: 0.4,
          });
        } else {
          // 鼠标悬浮时立即响应
          gsap.set(".p4-card", { opacity: 0.35 });
          gsap.set(target, {
            opacity: 1,
            scale: 1.06,
            filter: "drop-shadow(0 8px 18px rgba(60, 230, 192, 0.35))",
            boxShadow: "0 0 0 3px rgba(60, 230, 192, 0.35) inset",
          });
        }
        
        // 聚光灯照射高亮卡片
        if (isAutoPlay) {
          // 自动播放时，平滑跟随
          moveSpotlights(targetElement, 0.4);
        } else {
          // 手动悬浮时通过setHoverState处理
          setHoverState(targetElement, true);
        }
      };
      
      const highlightOff = (isAutoPlay = false) => {
        if (isAutoPlay) {
          // 自动播放时使用动画
          gsap.to(".p4-card", {
            opacity: 1,
            scale: 1,
            filter: "none",
            boxShadow: "none",
            duration: 0.4,
          });
        } else {
          // 鼠标离开时立即响应
          gsap.set(".p4-card", {
            opacity: 1,
            scale: 1,
            filter: "none",
            boxShadow: "none",
          });
        }
        
        // 处理高亮结束
        if (!isAutoPlay) {
          // 手动悬浮结束时通过setHoverState处理
          setHoverState(null, false);
        }
      };

      const showDetail = (cardId, isAutoPlay = false) => {
        const target = `#p4-ticker-${cardId}`;
        const allDetails = '#p4-ticker-delivery, #p4-ticker-picking, #p4-ticker-cctv, #p4-ticker-sensors, #p4-ticker-budget, #p4-ticker-mosaic, #p4-ticker-registration, #p4-ticker-uav';
        
        // 先立即停止所有正在进行的动画，避免冲突
        gsap.killTweensOf(allDetails);
        
        // 立即隐藏所有说明
        gsap.set(allDetails, { autoAlpha: 0, x: 0 });
        
        if (isAutoPlay) {
          // 自动播放时使用动画
          gsap.to(target, { 
            autoAlpha: 1, 
            x: 0, 
            duration: 0.4, 
            ease: "power2.out" 
          });
        } else {
          // 鼠标悬浮时立即显示
          gsap.set(target, { autoAlpha: 1, x: 0 });
        }
      };

      const hideDetail = () => {
        const allDetails = '#p4-ticker-delivery, #p4-ticker-picking, #p4-ticker-cctv, #p4-ticker-sensors, #p4-ticker-budget, #p4-ticker-mosaic, #p4-ticker-registration, #p4-ticker-uav';
        gsap.to(allDetails, { 
          autoAlpha: 0, 
          duration: 0.2 
        });
      };

      const build = () => {
        // 复位所有元素到初始状态
        gsap.set("#p4-hero", { autoAlpha: 0, y: 8 });
        gsap.set(".p4-card", { 
          autoAlpha: 0, scale: 1, opacity: 1, 
          filter: "none", boxShadow: "none" 
        });
        gsap.set("#p4-ticker", { autoAlpha: 0 });
        gsap.set("#p4-ticker-delivery", { autoAlpha: 0, x: -50 });
        gsap.set("#p4-ticker-picking", { autoAlpha: 0, x: -30 });
        gsap.set("#p4-ticker-cctv", { autoAlpha: 0, x: -10 });
        gsap.set("#p4-ticker-sensors", { autoAlpha: 0, x: 10 });
        gsap.set("#p4-ticker-budget", { autoAlpha: 0, x: 30 });
        gsap.set("#p4-ticker-mosaic", { autoAlpha: 0, x: 50 });
        gsap.set("#p4-ticker-registration", { autoAlpha: 0, x: 70 });
        gsap.set("#p4-ticker-uav", { autoAlpha: 0, x: 90 });

        // 设置卡片初始位置：左侧4个从左飞入，右侧4个从右飞入
        const leftCards = [".p4-card:nth-child(1)", ".p4-card:nth-child(2)", ".p4-card:nth-child(3)", ".p4-card:nth-child(4)"];
        const rightCards = [".p4-card:nth-child(5)", ".p4-card:nth-child(6)", ".p4-card:nth-child(7)", ".p4-card:nth-child(8)"];
        
        gsap.set(leftCards, { x: -200, y: 0, rotate: -5 });
        gsap.set(rightCards, { x: 200, y: 0, rotate: 5 });

        const tl = gsap.timeline({ 
          paused: true, 
          defaults: { ease: "power2.out" } 
        });

        // 0.0–0.8s: 大字淡入，聚光灯同步照射
        tl.to("#p4-hero", { autoAlpha: 1, y: 0, duration: 0.8 }, 0.0)
          .call(() => {
            const heroElement = el.querySelector("#p4-hero");
            moveSpotlights(heroElement, 0.4); // 自动播放用平滑动画
          }, null, 0.0) // 同步开始
          // 0.8–1.6s: 大字淡出
          .to("#p4-hero", { autoAlpha: 0, y: -8, duration: 0.8 }, 0.8);

        // 1.6–3.2s: 左侧卡片从左飞入
        tl.to(leftCards, {
          autoAlpha: 1,
          x: 0,
          rotate: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.2)"
        }, 1.6);

        // 2.0–3.6s: 右侧卡片从右飞入（略有重叠）
        tl.to(rightCards, {
          autoAlpha: 1,
          x: 0,
          rotate: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.2)"
        }, 2.0);

        // 3.8–4.2s: 所有卡片微弹定格
        tl.to(".p4-card", { 
          y: -6, 
          yoyo: true, 
          repeat: 1, 
          duration: 0.2, 
          stagger: 0.03,
          ease: "power2.inOut"
        }, 3.8);

        // 4.8–5.0s: 跑马灯出现，聚光灯准备随机照射
        tl.to("#p4-ticker", { autoAlpha: 1, duration: 0.2 }, 4.8);

        // 5.0–8.0s: 高亮外卖配送并显示说明
        tl.call(() => {
          highlightOn("delivery", true);
          showDetail("delivery", true);
        }, null, 5.0)
        .to({}, { duration: 3.0 }) // 停留3秒
        .call(() => {
          highlightOff(true);
          hideDetail();
        }, null, 8.0);

        // 8.0–11.0s: 高亮图像配准并显示说明
        tl.call(() => {
          highlightOn("registration", true);
          showDetail("registration", true);
        }, null, 8.0)
        .to({}, { duration: 3.0 }) // 停留3秒
        .call(() => {
          highlightOff(true);
          hideDetail();
          // 自动播放结束，清理所有状态，激活随机照射
          const allDetails = '#p4-ticker-delivery, #p4-ticker-picking, #p4-ticker-cctv, #p4-ticker-sensors, #p4-ticker-budget, #p4-ticker-mosaic, #p4-ticker-registration, #p4-ticker-uav';
          gsap.set(allDetails, { autoAlpha: 0, x: 0 });
          // 标记自动播放结束
          isAutoPlayActive = false;
          // 延迟一下再开始随机照射
          setTimeout(() => moveSpotlights(null), 500);
        }, null, 11.0);

        // 12.5s+: 定格（不循环）
        return tl;
      };

      // 添加鼠标悬浮交互
      const enableHoverInteraction = () => {
        // 先确保所有说明文字都隐藏，避免叠加显示
        const allDetails = '#p4-ticker-delivery, #p4-ticker-picking, #p4-ticker-cctv, #p4-ticker-sensors, #p4-ticker-budget, #p4-ticker-mosaic, #p4-ticker-registration, #p4-ticker-uav';
        gsap.set(allDetails, { autoAlpha: 0, x: 0 });
        
        // 为所有8个卡片添加悬浮事件
        const cardIds = ['delivery', 'picking', 'cctv', 'sensors', 'budget', 'mosaic', 'registration', 'uav'];
        
        cardIds.forEach(cardId => {
          const card = el.querySelector(`#p4-card-${cardId}`);
          if (card) {
            card.addEventListener("mouseenter", () => {
              // 先强制隐藏所有说明，再显示当前的
              gsap.set(allDetails, { autoAlpha: 0 });
              highlightOn(cardId, false); // 明确标记为手动操作
              showDetail(cardId, false);
            });
            card.addEventListener("mouseleave", () => {
              highlightOff(false); // 明确标记为手动操作
              hideDetail();
            });
            
            // 只为外卖配送和图像配准添加点击跳转
            if (cardId === 'delivery' && scrollToSection) {
              card.addEventListener("click", () => {
                scrollToSection(4); // 跳转到页面5（TSP配送路径）
              });
            }
            if (cardId === 'registration' && scrollToSection) {
              card.addEventListener("click", () => {
                scrollToSection(5); // 跳转到页面6（图像配准对比）
              });
            }
          }
        });
      };

      // ScrollTrigger：进入播放，离开复位
      const snapContainer = document.getElementById('snap-container');
      
      const st = ScrollTrigger.create({
        trigger: el,
        scroller: snapContainer || window,
        start: "top 80%",
        end: "bottom 20%",
        invalidateOnRefresh: true,
        refreshPriority: -90,
        onEnter: () => {
          tlRef.current?.kill();
          isAutoPlayActive = true; // 重置自动播放状态
          tlRef.current = build();
          tlRef.current.play(0);
          // 动画完成后启用悬浮交互
          tlRef.current.call(() => {
            enableHoverInteraction();
          }, null, 11.0);
        },
        onEnterBack: () => {
          tlRef.current?.kill();
          isAutoPlayActive = true; // 重置自动播放状态
          tlRef.current = build();
          tlRef.current.play(0);
          // 动画完成后启用悬浮交互
          tlRef.current.call(() => {
            enableHoverInteraction();
          }, null, 11.0);
        },
        onLeave: () => {
          tlRef.current?.pause(0);
        },
        onLeaveBack: () => {
          tlRef.current?.pause(0);
        },
      });
      
      // 强制刷新ScrollTrigger
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
      
      return () => {
        st.kill();
        tlRef.current?.kill();
      };
    }, root);

    return () => {
      tlRef.current?.kill();
      ctx.revert();
    };
  }, []);

  return (
    <section
      id={id}
      ref={root}
      className="snap-section relative flex flex-col justify-center overflow-hidden min-h-screen py-8"
      style={{ backgroundColor: 'var(--bg-deep)', color: 'var(--ink-high)' }}
      aria-label="优化无处不在"
    >

      {/* 页首大字 - 绝对定位垂直居中 */}
      <h2
        id="p4-hero"
        className="absolute text-center px-6 font-bold"
        style={{
          fontSize: 'clamp(28px, 4vw, 56px)',
          color: 'var(--ink-high)',
          letterSpacing: '-0.5%',
          zIndex: 30,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        优化无处不在
      </h2>
      
      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 pt-5" style={{ zIndex: 10 }}>
        {/* 宫格 - 2×4 布局 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl mb-16">
          {CARDS.map((card) => (
            <article
              key={card.id}
              id={`p4-card-${card.id}`}
              className={`p4-card rounded-xl p-4 transition-all duration-300 ${
                card.id === 'delivery' || card.id === 'registration' ? 'cursor-pointer hover:shadow-lg' : 'cursor-default'
              }`}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: card.id === 'delivery' || card.id === 'registration' 
                  ? '1px solid var(--tech-mint-dim, var(--carbon-line))' 
                  : '1px solid var(--carbon-line)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
              aria-label={`${card.title}：${card.subtitle}${
                card.id === 'delivery' || card.id === 'registration' ? '（点击查看详情）' : ''
              }`}
            >
              <div 
                className="text-2xl mb-2" 
                aria-hidden="true"
                style={{ filter: 'grayscale(0.3)' }}
              >
                {card.icon}
              </div>
              <div 
                className="font-medium mb-1"
                style={{ 
                  fontSize: 'clamp(14px, 2.5vw, 18px)',
                  color: 'var(--ink-high)' 
                }}
              >
                {card.title}
              </div>
              <div 
                className="text-xs leading-tight"
                style={{ 
                  color: 'var(--ink-mid)',
                  fontSize: 'clamp(11px, 2vw, 14px)'
                }}
              >
                {card.subtitle}
              </div>
            </article>
          ))}
        </div>

        {/* 底部说明区域 */}
        <div 
          id="p4-ticker" 
          className="w-full px-6 mb-16"
          style={{ zIndex: 20 }}
        >
          <div 
            className="relative mx-auto max-w-4xl h-12 flex items-center justify-center overflow-hidden rounded-lg border"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--carbon-line)'
            }}
          >
            {/* 外卖配送详细说明 */}
            <div
              id="p4-ticker-delivery"
              className="absolute text-center px-6 whitespace-nowrap"
              style={{
                fontSize: 'clamp(14px, 2vw, 16px)',
                color: 'var(--ink-mid)',
                fontWeight: 400
              }}
            >
              🛵 外卖配送优化：通过算法优化配送路径，减少配送时间，提升用户体验
            </div>
            
            {/* 仓库拣货详细说明 */}
            <div
              id="p4-ticker-picking"
              className="absolute text-center px-6 whitespace-nowrap"
              style={{
                fontSize: 'clamp(14px, 2vw, 16px)',
                color: 'var(--ink-mid)',
                fontWeight: 400
              }}
            >
              📦 仓库拣货优化：优化拣货路径和货物摆放，减少人工行走距离，提高拣货效率
            </div>
            
            {/* 摄像头布设详细说明 */}
            <div
              id="p4-ticker-cctv"
              className="absolute text-center px-6 whitespace-nowrap"
              style={{
                fontSize: 'clamp(14px, 2vw, 16px)',
                color: 'var(--ink-mid)',
                fontWeight: 400
              }}
            >
              📹 摄像头布设优化：通过算法计算最优摄像头位置，用最少设备实现最大监控覆盖
            </div>
            
            {/* 传感器布站详细说明 */}
            <div
              id="p4-ticker-sensors"
              className="absolute text-center px-6 whitespace-nowrap"
              style={{
                fontSize: 'clamp(14px, 2vw, 16px)',
                color: 'var(--ink-mid)',
                fontWeight: 400
              }}
            >
              📡 传感器布站优化：优化传感器网络布局，确保数据采集全覆盖和信号传输稳定
            </div>
            
            {/* 预算排程详细说明 */}
            <div
              id="p4-ticker-budget"
              className="absolute text-center px-6 whitespace-nowrap"
              style={{
                fontSize: 'clamp(14px, 2vw, 16px)',
                color: 'var(--ink-mid)',
                fontWeight: 400
              }}
            >
              🧮 预算排程优化：在预算约束下合理分配资源和时间，实现成本效益最大化
            </div>
            
            {/* 影像镶嵌线详细说明 */}
            <div
              id="p4-ticker-mosaic"
              className="absolute text-center px-6 whitespace-nowrap"
              style={{
                fontSize: 'clamp(14px, 2vw, 16px)',
                color: 'var(--ink-mid)',
                fontWeight: 400
              }}
            >
              🧩 影像镶嵌线优化：算法计算最佳拼接缝，让多幅影像无缝融合，过渡更自然
            </div>
            
            {/* 图像配准详细说明 */}
            <div
              id="p4-ticker-registration"
              className="absolute text-center px-6 whitespace-nowrap"
              style={{
                fontSize: 'clamp(14px, 2vw, 16px)',
                color: 'var(--ink-mid)',
                fontWeight: 400
              }}
            >
              🧭 图像配准优化：利用数学优化精确对齐影像，实现高精度图像融合
            </div>
            
            {/* 无人机航线详细说明 */}
            <div
              id="p4-ticker-uav"
              className="absolute text-center px-6 whitespace-nowrap"
              style={{
                fontSize: 'clamp(14px, 2vw, 16px)',
                color: 'var(--ink-mid)',
                fontWeight: 400
              }}
            >
              🛩️ 无人机航线优化：规划最优飞行路径，兼顾安全性、电池续航和作业覆盖度
            </div>
          </div>
        </div>
      </div>

      {/* 舞台聚光灯背景动画 */}
      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 1 }}>
        {/* 左下聚光灯 */}
        <div 
          id="spotlight-left"
          className="absolute pointer-events-none"
          style={{
            width: '400px',
            height: '400px',
            left: '2%',
            bottom: '8%',
            background: `
              radial-gradient(ellipse at center, 
                rgba(60, 230, 192, 0.4) 0%, 
                rgba(60, 230, 192, 0.25) 30%, 
                rgba(60, 230, 192, 0.1) 60%, 
                transparent 100%
              )
            `,
            borderRadius: '50%',
            filter: 'blur(8px)',
            transition: 'all 0.6s ease-out',
            opacity: 0,
            boxShadow: '0 0 80px rgba(60, 230, 192, 0.3)'
          }}
        />
        
        {/* 左下聚光灯光束 */}
        <div 
          id="spotlight-left-beam"
          className="absolute pointer-events-none"
          style={{
            width: '120px',
            height: '120px',
            left: '8%',
            bottom: '18%',
            background: `
              radial-gradient(circle, 
                rgba(60, 230, 192, 0.8) 0%, 
                rgba(60, 230, 192, 0.4) 50%, 
                transparent 100%
              )
            `,
            borderRadius: '50%',
            filter: 'blur(2px)',
            transition: 'all 0.6s ease-out',
            opacity: 0,
            boxShadow: '0 0 40px rgba(60, 230, 192, 0.6)'
          }}
        />
        
        {/* 右下聚光灯 */}
        <div 
          id="spotlight-right"
          className="absolute pointer-events-none"
          style={{
            width: '400px',
            height: '400px',
            right: '2%',
            bottom: '8%',
            background: `
              radial-gradient(ellipse at center, 
                rgba(245, 178, 72, 0.4) 0%, 
                rgba(245, 178, 72, 0.25) 30%, 
                rgba(245, 178, 72, 0.1) 60%, 
                transparent 100%
              )
            `,
            borderRadius: '50%',
            filter: 'blur(8px)',
            transition: 'all 0.6s ease-out',
            opacity: 0,
            boxShadow: '0 0 80px rgba(245, 178, 72, 0.3)'
          }}
        />
        
        {/* 右下聚光灯光束 */}
        <div 
          id="spotlight-right-beam"
          className="absolute pointer-events-none"
          style={{
            width: '120px',
            height: '120px',
            right: '8%',
            bottom: '18%',
            background: `
              radial-gradient(circle, 
                rgba(245, 178, 72, 0.8) 0%, 
                rgba(245, 178, 72, 0.4) 50%, 
                transparent 100%
              )
            `,
            borderRadius: '50%',
            filter: 'blur(2px)',
            transition: 'all 0.6s ease-out',
            opacity: 0,
            boxShadow: '0 0 40px rgba(245, 178, 72, 0.6)'
          }}
        />
      </div>

      {/* 底部提示 */}
      <DownHint targetSection={4} />
      
      {/* 舞台聚光灯样式 */}
      <style jsx global>{`
        #spotlight-left, #spotlight-right {
          animation: spotlightPulse 4s ease-in-out infinite;
        }
        
        #spotlight-left-beam, #spotlight-right-beam {
          animation: beamFlicker 2s ease-in-out infinite;
        }
        
        @keyframes spotlightPulse {
          0%, 100% {
            filter: blur(8px);
          }
          50% {
            filter: blur(12px);
          }
        }
        
        @keyframes beamFlicker {
          0%, 100% {
            filter: blur(2px);
            transform: scale(1);
          }
          25% {
            filter: blur(1px);
            transform: scale(1.05);
          }
          75% {
            filter: blur(3px);
            transform: scale(0.95);
          }
        }
        
        /* 无障碍支持 */
        @media (prefers-reduced-motion: reduce) {
          #section-3 #spotlight-left,
          #section-3 #spotlight-right,
          #section-3 #spotlight-left-beam,
          #section-3 #spotlight-right-beam {
            animation: none !important;
            transition: none !important;
            opacity: 0.3 !important;
          }
        }
      `}</style>
      
    </section>
  );
}