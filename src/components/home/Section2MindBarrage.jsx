// src/components/home/Section2MindBarrage.jsx
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { mindLines } from "../../assets/data/mindLines";
import DownHint from "./DownHint";

gsap.registerPlugin(ScrollTrigger);

export default function Section2MindBarrage({ id }) {
  const root = useRef(null);
  const tlRef = useRef(null);
  

  useLayoutEffect(() => {
    const el = root.current;

    // helper
    const buildTimeline = () => {
      // 清空舞台
      const stage = el.querySelector("#mind-stage");
      stage.innerHTML = "";

      // 预置标题与结尾初始状态
      const titleEl = el.querySelector("#mind-title");
      const finaleEl = el.querySelector("#mind-finale");
      
      gsap.set(titleEl, { autoAlpha: 0, y: 8 });
      gsap.set(finaleEl, { autoAlpha: 0, scale: 0.95 });

      // 渲染弹幕节点
      const allNodes = [];
      
      // 直接按mindLines顺序创建弹幕，先设置样式再计算尺寸
      mindLines.forEach((text, index) => {
        const d = document.createElement("div");
        d.textContent = text;
        d.className = "absolute pointer-events-none whitespace-nowrap font-medium";
        d.dataset.order = index; // 明确标记顺序
        
        // Web2.0风格渐变色配色
        const gradients = [
          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // 蓝紫渐变
          'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // 粉红渐变
          'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // 蓝青渐变
          'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // 绿青渐变
          'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // 粉黄渐变
          'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // 青粉渐变
          'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // 橙桃渐变
          'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', // 红粉渐变
          'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', // 紫粉渐变
          'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)'  // 桃紫渐变
        ];
        
        const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
        const randomSize = gsap.utils.random(28, 40); // 进一步增大字体大小 28-40px
        const randomWeight = gsap.utils.random(400, 700);
        
        // 先设置所有样式
        d.style.background = randomGradient;
        d.style.webkitBackgroundClip = 'text';
        d.style.webkitTextFillColor = 'transparent';
        d.style.backgroundClip = 'text';
        d.style.fontSize = `${randomSize}px`;
        d.style.fontWeight = randomWeight;
        d.style.textShadow = '0 0 10px rgba(255,255,255,0.3)';
        
        // 添加到DOM以便测量尺寸，但先隐藏
        d.style.position = 'absolute';
        d.style.visibility = 'hidden';
        d.style.opacity = '0';
        d.style.left = '0';
        d.style.top = '0';
        
        stage.appendChild(d);
        allNodes.push(d);
      });

      const W = () => stage.clientWidth;
      const H = () => stage.clientHeight;

      const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

      // 0) 标题入场与淡出（~2s）
      tl.to(titleEl, { autoAlpha: 1, y: 0, duration: 0.8 })
        .to(titleEl, { autoAlpha: 0, y: -18, duration: 1.0 }, "+=0.8");

      // 1) 弹幕阶段（2.5s → ~21s）
      let maxEndTime = 2.5; // 跟踪最晚结束时间
      
      allNodes.forEach((node, index) => {
        const dir = Math.floor(Math.random() * 4); // 0 L→R, 1 R→L, 2 T→B, 3 B→T
        const start = 2.5 + index * 0.75; // 按顺序启动，每个间隔0.75秒
        const life = gsap.utils.random(11, 15); // 放慢到11-15秒，让文字有充足阅读时间
        const endTime = start + life;
        
        if (endTime > maxEndTime) {
          maxEndTime = endTime;
        }
        
        // 测量文字实际尺寸（已经设置好样式了）
        const textWidth = node.offsetWidth || node.getBoundingClientRect().width;
        const textHeight = node.offsetHeight || node.getBoundingClientRect().height;

        let from = {}, to = {};
        
        // 添加基于index的偏移，避免相同方向的文字重叠
        const indexOffset = (index % 5) * 50; // 每5个为一组，组内错开50px
        
        if (dir === 0) {
          // 左到右 - 根据文字宽度动态计算偏移距离，Y坐标远离上下边缘20%
          const safeOffset = textWidth + 50; // 文字宽度 + 安全边距
          const marginY = H() * 0.2; // 上下各留20%屏幕高度
          const minY = marginY;
          const maxY = H() - textHeight - marginY;
          
          from = { 
            x: -safeOffset,
            y: gsap.utils.random(minY, Math.max(minY, maxY)) + indexOffset, 
            rotation: gsap.utils.random(-2, 2), 
            opacity: 0.3,  // 从淡色开始
            scale: 0.8,
            visibility: 'visible'
          };
          to = { 
            x: W() + safeOffset,
            y: "+=" + gsap.utils.random(-20, 20), 
            scale: 1,
            duration: life 
          };
        } else if (dir === 1) {
          // 右到左 - 根据文字宽度动态计算偏移距离，Y坐标远离上下边缘20%
          const safeOffset = textWidth + 50; // 文字宽度 + 安全边距
          const marginY = H() * 0.2; // 上下各留20%屏幕高度
          const minY = marginY;
          const maxY = H() - textHeight - marginY;
          
          from = { 
            x: W() + safeOffset,
            y: gsap.utils.random(minY, Math.max(minY, maxY)) + indexOffset, 
            rotation: gsap.utils.random(-2, 2), 
            opacity: 0.3,  // 从淡色开始
            scale: 0.8,
            visibility: 'visible'
          };
          to = { 
            x: -safeOffset,
            y: "+=" + gsap.utils.random(-20, 20), 
            scale: 1,
            duration: life 
          };
        } else if (dir === 2) {
          // 上到下 - 根据文字高度动态计算偏移距离，X坐标确保在屏幕内且留出15%边距
          const safeOffsetY = textHeight + 50; // 文字高度 + 安全边距
          const marginX = W() * 0.15; // 左右各留15%屏幕宽度
          const minX = marginX;
          const maxX = W() - textWidth - marginX;
          
          from = { 
            x: gsap.utils.random(minX, Math.max(minX, maxX)) + indexOffset, 
            y: -safeOffsetY,
            rotation: gsap.utils.random(-2, 2), 
            opacity: 0.3,  // 从淡色开始
            scale: 0.8,
            visibility: 'visible'
          };
          to = { 
            x: "+=" + gsap.utils.random(-30, 30), 
            y: H() + safeOffsetY,
            scale: 1,
            duration: life 
          };
        } else {
          // 下到上 - 根据文字高度动态计算偏移距离，X坐标确保在屏幕内且留出15%边距
          const safeOffsetY = textHeight + 50; // 文字高度 + 安全边距
          const marginX = W() * 0.15; // 左右各留15%屏幕宽度
          const minX = marginX;
          const maxX = W() - textWidth - marginX;
          
          from = { 
            x: gsap.utils.random(minX, Math.max(minX, maxX)) + indexOffset, 
            y: H() + safeOffsetY,
            rotation: gsap.utils.random(-2, 2), 
            opacity: 0.3,  // 从淡色开始
            scale: 0.8,
            visibility: 'visible'
          };
          to = { 
            x: "+=" + gsap.utils.random(-30, 30), 
            y: -safeOffsetY,
            scale: 1,
            duration: life 
          };
        }

        gsap.set(node, from);
        tl.to(node, to, start);
        
        // 线性淡入变深效果 - 从0.3到1.0，线性渐变
        tl.to(node, { 
          opacity: 1.0, 
          duration: 2.0,
          ease: "none" // 线性变化
        }, start + 0.2);
        
        // 渐出效果
        tl.to(node, { 
          opacity: 0, 
          scale: 0.8, 
          duration: 0.4 
        }, start + life - 0.4);
        
      });

      // 2) 结尾文案（在所有弹幕结束后 → 定格）
      const finaleStartTime = maxEndTime - 1.8; // 在最后一条弹幕结束前1.8秒开始，让结束文字更早出现
      tl.to(finaleEl, { autoAlpha: 1, scale: 1, duration: 1.2 }, finaleStartTime);
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
  }, []);

  return (
    <section
      id={id}
      ref={root}
      className="snap-section relative flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: 'var(--bg-deep)' }}
      aria-label="Mind barrage"
    >
      {/* 黑色帝国风格背景动画 */}
      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 1 }}>
        {/* 移动的几何线条 */}
        <div className="absolute inset-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`line-${i}`}
              className="absolute opacity-20"
              style={{
                width: '1px',
                height: '100%',
                left: `${(i + 1) * 8.33}%`,
                background: 'linear-gradient(to bottom, transparent, #00ff41, transparent)',
                animation: `empireLineMove ${15 + i * 2}s linear infinite`,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </div>
        
        {/* 旋转的六边形网格 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-96 h-96 opacity-10"
            style={{
              background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300ff41' fill-opacity='0.1'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              animation: 'empireRotate 30s linear infinite'
            }}
          />
        </div>
        
        {/* 脉冲圆环 */}
        <div className="absolute inset-0 flex items-center justify-center">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`ring-${i}`}
              className="absolute rounded-full opacity-15"
              style={{
                width: `${200 + i * 150}px`,
                height: `${200 + i * 150}px`,
                border: '1px solid #00ff41',
                boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)',
                animation: `empirePulse ${4 + i}s ease-in-out infinite`,
                animationDelay: `${i * 1.5}s`
              }}
            />
          ))}
        </div>
        
        {/* 移动的粒子点 */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-1 h-1 rounded-full opacity-25"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: '#00ff41',
                boxShadow: '0 0 4px rgba(0, 255, 65, 0.6)',
                animation: `empireFloat ${10 + Math.random() * 10}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
      </div>

      <h2
        id="mind-title"
        className="absolute text-center px-6 font-bold"
        style={{
          zIndex: 30,
          fontSize: 'clamp(28px, 4vw, 56px)',
          color: 'var(--ink-high)',
          letterSpacing: '-0.5%'
        }}
      >
        看到数学优化，你脑海里在想啥？
      </h2>

      <div id="mind-stage" className="absolute inset-0" style={{ zIndex: 20 }} />

      <div
        id="mind-finale"
        className="absolute text-center px-6 max-w-5xl font-bold"
        style={{
          zIndex: 30,
          fontSize: 'clamp(28px, 5vw, 48px)', // 增大结束文字尺寸
          color: 'var(--tech-mint)',
          textShadow: '0 0 30px rgba(60, 230, 192, 0.5)',
          lineHeight: '1.3'
        }}
      >
        <div>如果你有以上想法，</div>
        <div>你其实已经问对了大部分的关键问题！</div>
      </div>


      {/* 底部提示 */}
      <DownHint targetSection={2} />
    </section>
  );
}