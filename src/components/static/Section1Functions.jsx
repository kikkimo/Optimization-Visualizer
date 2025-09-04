import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import DownHint from '../shared/DownHint';

gsap.registerPlugin(ScrollTrigger);

// 数学工具函数
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// 三次贝塞尔曲线评估
function bezierPoint(p0, p1, p2, p3, t) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  const x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
  const y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;
  return { x, y };
}

// 贝塞尔曲线切线（导数）
function bezierTangent(p0, p1, p2, p3, t) {
  const u = 1 - t;
  const x = 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x);
  const y = 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y);
  return { x, y };
}

// 改进的Box-Muller变换，一次生成两个高斯随机数
let spareGaussian = null;
function gaussianRandom(mean = 0, std = 1) {
  if (spareGaussian !== null) {
    const result = spareGaussian * std + mean;
    spareGaussian = null;
    return result;
  }
  
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  
  const z0 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  const z1 = Math.sqrt(-2.0 * Math.log(u)) * Math.sin(2 * Math.PI * v);
  
  spareGaussian = z1;
  return z0 * std + mean;
}

// 生成更真实的二维高斯分布噪声观测点
function jitter(pt, sigma = 15) {
  const dx = gaussianRandom(0, sigma);
  const dy = gaussianRandom(0, sigma);
  return {
    x: pt.x + dx,
    y: pt.y + dy
  };
}

// 构建更复杂的多段样条，优化末端切线以便平滑延伸
function buildSpline(width, height) {
  const pad = 40;
  const cx = (f) => pad + f * (width - 2 * pad);
  const cy = (f) => pad + f * (height - 2 * pad);

  // 更复杂的轨迹点，模拟真实的运动轨迹，优化最后几个点的分布
  const pts = [
    { x: cx(0.05), y: cy(0.65) },
    { x: cx(0.15), y: cy(0.25) },
    { x: cx(0.28), y: cy(0.75) },
    { x: cx(0.42), y: cy(0.35) },
    { x: cx(0.58), y: cy(0.80) },
    { x: cx(0.72), y: cy(0.20) },
    { x: cx(0.85), y: cy(0.55) }, // 调整倒数第二个点
    { x: cx(0.95), y: cy(0.45) }, // 调整最后一个点，使延伸方向更平缓
  ];

  const segs = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = i === 0 ? pts[i] : pts[i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = i + 2 < pts.length ? pts[i + 2] : pts[i + 1];

    // 对于最后一段，特别处理切线方向以确保延伸平滑
    let v1 = { x: p2.x - p0.x, y: p2.y - p0.y };
    let v2 = { x: p3.x - p1.x, y: p3.y - p1.y };
    
    // 如果是最后一段，调整切线方向使其更平缓
    if (i === pts.length - 2) {
      const prevV = { x: p1.x - p0.x, y: p1.y - p0.y };
      const avgV = { x: (prevV.x + v1.x) * 0.5, y: (prevV.y + v1.y) * 0.5 };
      v2 = avgV; // 使用平均方向作为最终切线
    }
    
    const s = 0.16; // 稍微减少张力使末端更平滑

    const c1 = { x: p1.x + v1.x * s, y: p1.y + v1.y * s };
    const c2 = { x: p2.x - v2.x * s, y: p2.y - v2.y * s };

    segs.push({ p0: p1, p1: c1, p2: c2, p3: p2 });
  }
  return segs;
}

function pointOnSpline(segs, s) {
  const n = segs.length;
  const t = clamp(s, 0, 1) * n;
  const i = Math.min(n - 1, Math.floor(t));
  const local = t - i;
  const seg = segs[i];
  const pt = bezierPoint(seg.p0, seg.p1, seg.p2, seg.p3, local);
  const tg = bezierTangent(seg.p0, seg.p1, seg.p2, seg.p3, local);
  return { pt, tg };
}

// Canvas可视化组件
const OptimizationViz = ({ mode, width = 900, height = 450 }) => {
  const canvasRef = useRef(null);
  const [s, setS] = useState(0.18); // 粒子位置参数
  const [breathAlpha, setBreathAlpha] = useState(0.01); // 轨迹呼吸透明度
  const animationRef = useRef(null);
  const breathRef = useRef(null);
  const segsRef = useRef(null);
  const samplesRef = useRef(null);
  const targetS = 0.42; // 静态快照位置
  
  // 初始化样条和样本数据
  useEffect(() => {
    segsRef.current = buildSpline(width, height);
    const { pt: snapPt } = pointOnSpline(segsRef.current, targetS);
    // 生成更多样本点，增大噪声标准差以显示高斯分布特性
    samplesRef.current = Array.from({ length: 32 }, () => jitter(snapPt, 18));
  }, [width, height]);

  // 动画循环 - 根据模式使用不同的循环范围
  useEffect(() => {
    const animate = () => {
      if (mode === 'static') {
        // 静态模式：只在原始轨迹上循环 (0-1)
        setS(prev => (prev + 0.001) % 1);
      } else {
        // 动态模式：包含延伸部分 (0-1.5)
        setS(prev => (prev + 0.001) % 1.5);
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mode]); // 依赖mode，当模式切换时重新启动动画

  // 呼吸动画 - 轨迹透明度从1%到90%缓慢呼吸
  useEffect(() => {
    let breathTime = 0;
    
    const breathAnimate = () => {
      breathTime += 0.02; // 控制呼吸速度
      // 使用正弦波实现平滑的呼吸效果，范围从0.01到0.65
      const alpha = 0.01 + (Math.sin(breathTime) + 1) / 2 * 0.64;
      setBreathAlpha(alpha);
      
      breathRef.current = requestAnimationFrame(breathAnimate);
    };
    
    breathRef.current = requestAnimationFrame(breathAnimate);
    
    return () => {
      if (breathRef.current) {
        cancelAnimationFrame(breathRef.current);
      }
    };
  }, []); // 呼吸动画不依赖任何状态

  // 绘制canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !segsRef.current) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // 设置高分辨率
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 绘制网格
    ctx.strokeStyle = 'rgba(100, 255, 218, 0.1)';
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 8; i++) {
      const x = (i * width) / 8;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let i = 1; i < 6; i++) {
      const y = (i * height) / 6;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // 绘制轨迹路径 - 使用呼吸透明度效果
    const segs = segsRef.current;
    ctx.strokeStyle = `rgba(100, 255, 218, ${breathAlpha})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(segs[0].p0.x, segs[0].p0.y);
    
    segs.forEach(seg => {
      ctx.bezierCurveTo(seg.p1.x, seg.p1.y, seg.p2.x, seg.p2.y, seg.p3.x, seg.p3.y);
    });
    ctx.stroke();
    
    // 当前粒子位置 - 支持延伸轨迹
    let currentPt;
    if (s <= 1) {
      // 在原始轨迹上
      const { pt } = pointOnSpline(segs, s);
      currentPt = pt;
    } else {
      // 在延伸轨迹上 - 沿切线方向继续
      const excess = s - 1;
      const { pt: endPt, tg: endTg } = pointOnSpline(segs, 1);
      const tgNorm = Math.sqrt(endTg.x * endTg.x + endTg.y * endTg.y);
      const unitTg = { x: endTg.x / tgNorm, y: endTg.y / tgNorm };
      const extrapolateDistance = excess * 200;
      
      currentPt = {
        x: endPt.x + unitTg.x * extrapolateDistance,
        y: endPt.y + unitTg.y * extrapolateDistance
      };
    }
    
    // 根据模式绘制不同内容
    if (mode === 'static') {
      // 静态模式：显示噪声观测点和最优估计
      const { pt: snapPt } = pointOnSpline(segs, targetS);
      const samples = samplesRef.current;
      
      // 绘制噪声观测点 - 高斯分布云状，表现真实观测噪声
      samples.forEach((pt, index) => {
        // 不同大小和透明度的点，体现高斯分布的密度变化
        const distFromCenter = Math.sqrt((pt.x - snapPt.x)**2 + (pt.y - snapPt.y)**2);
        const density = Math.exp(-(distFromCenter**2) / (2 * 18**2)); // 基于高斯分布的密度
        
        ctx.fillStyle = `rgba(239, 68, 68, ${0.4 + density * 0.5})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2 + density * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 添加微弱的外辉
        ctx.fillStyle = `rgba(239, 68, 68, ${0.1 + density * 0.2})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4 + density * 3, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // 计算最优估计（均值）
      const best = samples.reduce((acc, pt) => ({
        x: acc.x + pt.x / samples.length,
        y: acc.y + pt.y / samples.length
      }), { x: 0, y: 0 });
      
      // 绘制最优估计 - 更明显的圆和外圈
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(best.x, best.y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // 最优估计的外圈
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(best.x, best.y, 16, 0, Math.PI * 2);
      ctx.stroke();
      
      // 不确定性圈 - 虚线
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(best.x, best.y, 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // 真实快照点 - 黑色边框白色中心
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(snapPt.x, snapPt.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // 快照点的虚线外圈
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(snapPt.x, snapPt.y, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      
    } else if (mode === 'dynamic') {
      // 动态模式：显示恒定长度的局部概率带预测
      const { pt: nowPt, tg: nowTg } = pointOnSpline(segs, s);
      const constantPredictLength = 120; // 恒定的预测长度（像素单位）
      const stepSize = 0.002; // 更细的步长获得更平滑的曲线
      
      // 计算预测路径点
      const predictPoints = [];
      let totalDistance = 0;
      let currentS = s;
      
      // 先计算轨迹内的点
      while (currentS < 1 && totalDistance < constantPredictLength) {
        const { pt } = pointOnSpline(segs, currentS);
        predictPoints.push({ pt, withinTrajectory: true });
        
        if (predictPoints.length > 1) {
          const prev = predictPoints[predictPoints.length - 2].pt;
          const dist = Math.sqrt((pt.x - prev.x)**2 + (pt.y - prev.y)**2);
          totalDistance += dist;
        }
        
        currentS += stepSize;
      }
      
      // 如果还需要更多长度，则延伸到轨迹外
      if (totalDistance < constantPredictLength) {
        const { pt: endPt, tg: endTg } = pointOnSpline(segs, 1);
        const tgNorm = Math.sqrt(endTg.x * endTg.x + endTg.y * endTg.y);
        const unitTg = { x: endTg.x / tgNorm, y: endTg.y / tgNorm };
        
        const remainingLength = constantPredictLength - totalDistance;
        const extrapolationSteps = Math.ceil(remainingLength / 3); // 每步约3像素
        
        for (let i = 1; i <= extrapolationSteps; i++) {
          const dist = (i / extrapolationSteps) * remainingLength;
          const futurePt = {
            x: endPt.x + unitTg.x * dist,
            y: endPt.y + unitTg.y * dist
          };
          predictPoints.push({ pt: futurePt, withinTrajectory: false });
        }
      }
      
      // 绘制多层概率带结构（更宽，层次更分明）
      const layers = [
        { width: 32, alpha: 0.08, dash: [] },         // 最外层
        { width: 24, alpha: 0.12, dash: [] },         // 中外层
        { width: 16, alpha: 0.18, dash: [] },         // 中内层
        { width: 8, alpha: 0.25, dash: [] },          // 最内层
      ];
      
      layers.forEach((layer, index) => {
        ctx.lineWidth = layer.width;
        ctx.setLineDash(layer.dash);
        ctx.beginPath();
        
        let hasStarted = false;
        predictPoints.forEach((point, i) => {
          const { pt, withinTrajectory } = point;
          
          // 根据是否在轨迹内调整透明度
          let currentAlpha = layer.alpha;
          if (!withinTrajectory) {
            currentAlpha *= 0.6; // 延伸部分更淡
            if (!hasStarted || i % 3 === 0) { // 虚线效果
              ctx.setLineDash([6, 4]);
            }
          } else {
            ctx.setLineDash([]);
          }
          
          // 根据距离衰减透明度
          const progress = i / (predictPoints.length - 1);
          const fadeAlpha = currentAlpha * (1 - progress * 0.3);
          ctx.strokeStyle = `rgba(99, 102, 241, ${fadeAlpha})`;
          
          if (!hasStarted) {
            ctx.moveTo(pt.x, pt.y);
            hasStarted = true;
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        });
        
        ctx.stroke();
      });
      
      // 中心预测线（恒定长度）
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      let hasStarted = false;
      predictPoints.forEach((point, i) => {
        const { pt, withinTrajectory } = point;
        
        if (!withinTrajectory) {
          ctx.setLineDash([10, 5]);
          // 延伸部分逐渐变淡
          const progress = i / (predictPoints.length - 1);
          const fadeAlpha = 0.9 * (1 - progress * 0.4);
          ctx.strokeStyle = `rgba(99, 102, 241, ${fadeAlpha})`;
        } else {
          ctx.setLineDash([]);
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.9)';
        }
        
        if (!hasStarted) {
          ctx.moveTo(pt.x, pt.y);
          hasStarted = true;
        } else {
          ctx.lineTo(pt.x, pt.y);
        }
      });
      
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // 绘制当前粒子 - 在最后绘制以确保在最上层
    ctx.fillStyle = '#10b981';
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(currentPt.x, currentPt.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
  }, [s, mode, width, height, breathAlpha]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="border border-gray-200 rounded-lg bg-gray-900"
        style={{ width: `${width}px`, height: `${height}px` }}
      />
      <div className="absolute bottom-2 left-2 text-xs text-gray-400">
        {mode === 'static' ? '静态快照模式' : '动态预测模式'}
      </div>
    </div>
  );
};

const Section1Functions = ({ id, currentSection, totalSections }) => {
  const root = useRef(null);
  const tlRef = useRef(null);
  const [vizMode, setVizMode] = useState('static'); // 可视化模式
  
  const longText = `函数描述万物，万物皆可函数。这一理念启示我们，世界的运作本质上是函数的计算与映射。而当函数指向对现实的改进与抉择，我们便进入了"优化"的疆域——一个旨在众多可能性中寻找最优解的广阔世界。

若要为这一世界建构统一的认知图景，便无法回避其内在的复杂性：约束有紧弛，目标有曲直，规模有巨细……维度交织，体系森罗，难以简单归类。

然而，若我们要穿越这片迷雾，直抵其数学核心，并架设一座从算法实践通往哲学反思的桥梁，就必须寻得那束能照亮整座迷宫的根本主线——

这条主线，是"时间"。

在测绘遥感乃至更广泛的科学领域中，一个问题是否涉及状态随时间演化，从根本上决定了其数学表述的内在结构与求解的思维范式。时间，如同一条无声而决绝的分界，将万千优化问题划分为两大阵营：一方动态，一方静止；一方连续变化，一方离散定格。`;

  useLayoutEffect(() => {
    const el = root.current;
    
    if (!el) {
      console.warn('Section1Functions: root element not found');
      return;
    }

    const buildTimeline = () => {
      // 获取各个元素
      const titleEl = el.querySelector("#act1-title");
      const textContainerEl = el.querySelector("#act2-text-container");
      const particleContainerEl = el.querySelector("#act3-particle");
      
      // 容错检查
      if (!titleEl || !textContainerEl || !particleContainerEl) {
        console.warn('Section1Functions: 找不到必要的DOM元素');
        return gsap.timeline({ paused: true });
      }
      
      // 清空之前的内容
      textContainerEl.innerHTML = '';
      
      // 预置初始状态 - 参考 MindBarrage 的方式
      gsap.set(titleEl, { autoAlpha: 0, y: 8 });
      gsap.set(textContainerEl, { autoAlpha: 0 });
      gsap.set(particleContainerEl, { autoAlpha: 0, scale: 0.95 });
      
      const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
      
      // 第一幕：标题入场与淡出 (参考 MindBarrage 的实现)
      tl.to(titleEl, { autoAlpha: 1, y: 0, duration: 0.8 })
        .to(titleEl, { autoAlpha: 0, y: -18, duration: 1.0 }, "+=0.8");

      // 第二幕：游戏风格打字机效果 (2.6s开始，参考 MindBarrage 时序)
      const act2StartTime = 2.6;
      tl.to(textContainerEl, { 
        autoAlpha: 1, 
        duration: 0.5 
      }, act2StartTime);

      // 简化的打字机动画
      const textLines = longText.split('\n').filter(line => line.trim());
      const maxVisibleLines = 1;
      let totalTypingTime = act2StartTime + 0.5;
      let allLineElements = []; // 追踪所有行元素
      
      // 逐行显示，不使用递归
      textLines.forEach((line, index) => {
        // 创建行元素
        const lineEl = document.createElement('div');
        lineEl.className = 'typewriter-line fancy-typewriter';
        lineEl.style.opacity = '0';
        lineEl.style.marginBottom = '1.2rem';
        lineEl.style.lineHeight = '1.8';
        lineEl.style.transform = 'translateY(20px)';
        allLineElements.push(lineEl);
        
        // 如果超过显示行数，淡出最老的行
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
          if (textContainerEl) {
            textContainerEl.appendChild(lineEl);
          }
        }, [], totalTypingTime);
        
        // 行入场动画
        tl.to(lineEl, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out"
        }, totalTypingTime);
        
        // 打字效果 - 减慢打字速度
        const typingDuration = Math.min(line.length * 0.08, 5); // 从0.04增加到0.08，最大时长从3s增加到5s
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
        
        totalTypingTime += typingDuration + 1.2;
      });
      
      // 第三幕：粒子效果 (参考 MindBarrage 的结尾处理)
      const act3StartTime = totalTypingTime + 0.5;
      tl.to(textContainerEl, { 
        autoAlpha: 0, 
        duration: 0.8
      }, act3StartTime);
      
      tl.to(particleContainerEl, { 
        autoAlpha: 1, 
        scale: 1,
        duration: 1.2
      }, act3StartTime + 0.3);

      return tl;
    };

    // ScrollTrigger设置
    const snapContainer = document.getElementById('snap-container');
    
    const createAndPlayTimeline = () => {
      try {
        console.log('Section1Functions: 开始创建动画');
        if (tlRef.current) {
          tlRef.current.kill();
        }
        tlRef.current = buildTimeline();
        if (tlRef.current) {
          console.log('Section1Functions: 播放动画');
          tlRef.current.play(0);
        }
      } catch (error) {
        console.error('Section1Functions: 动画创建失败', error);
      }
    };
    
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

    // Intersection Observer备用
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

    // 立即创建并播放动画用于测试
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
    <section
      id={id}
      ref={root}
      className="snap-section relative flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: 'var(--bg-deep)' }}
    >
      {/* 函数主题背景动画 */}
      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 1 }}>
        {/* 数学网格 */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="functionGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(100, 255, 218, 0.3)" strokeWidth="0.5"/>
              </pattern>
              <linearGradient id="functionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgb(100, 255, 218)', stopOpacity: 0.8 }} />
                <stop offset="100%" style={{ stopColor: 'rgb(34, 197, 94)', stopOpacity: 0.4 }} />
              </linearGradient>
            </defs>
            
            <rect width="100%" height="100%" fill="url(#functionGrid)" />
            
            {/* 函数曲线 */}
            <path d="M0,600 Q350,200 700,400 T1400,300" 
                  stroke="url(#functionGradient)" 
                  strokeWidth="3" 
                  fill="none"
                  className="animate-pulse" />
            <path d="M0,400 Q350,600 700,200 T1400,500" 
                  stroke="url(#functionGradient)" 
                  strokeWidth="2" 
                  fill="none"
                  className="animate-pulse"
                  style={{ animationDelay: '1.5s' }} />
            
            {/* 数学符号 */}
            <text x="100" y="150" fontSize="32" fill="rgba(100, 255, 218, 0.4)" className="animate-pulse">f(x)</text>
            <text x="1200" y="700" fontSize="28" fill="rgba(34, 197, 94, 0.4)" className="animate-pulse">y = f(x)</text>
            <text x="700" y="100" fontSize="36" fill="rgba(100, 255, 218, 0.5)" className="animate-pulse">∂f/∂x</text>
          </svg>
        </div>
        
        {/* 浮动数学符号 */}
        <div className="absolute inset-0 opacity-25">
          <div className="floating-symbol absolute top-[20%] left-[10%] text-4xl animate-float-math">∫</div>
          <div className="floating-symbol absolute top-[60%] right-[15%] text-3xl animate-float-math" style={{ animationDelay: '2s' }}>∑</div>
          <div className="floating-symbol absolute bottom-[30%] left-[20%] text-5xl animate-float-math" style={{ animationDelay: '4s' }}>∇</div>
          <div className="floating-symbol absolute top-[40%] right-[25%] text-3xl animate-float-math" style={{ animationDelay: '6s' }}>lim</div>
          <div className="floating-symbol absolute bottom-[60%] right-[40%] text-4xl animate-float-math" style={{ animationDelay: '3s' }}>∂</div>
        </div>
        
        {/* 粒子系统 */}
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-1 h-1 rounded-full opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: '#64ffda',
                boxShadow: '0 0 6px rgba(100, 255, 218, 0.8)',
                animation: `floatParticle ${8 + Math.random() * 12}s linear infinite`,
                animationDelay: `${Math.random() * 8}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* 第一幕：简化标题 - 参考 MindBarrage */}
      <div 
        id="act1-title"
        className="absolute text-center px-6 font-bold"
        style={{ 
          zIndex: 30,
          fontSize: 'clamp(32px, 6vw, 64px)',
          color: 'var(--tech-mint)',
          textShadow: '0 0 30px rgba(100, 255, 218, 0.6)',
          letterSpacing: '0.05em',
          fontFamily: '"Microsoft YaHei", Arial, sans-serif'
        }}
      >
        Function Describes Everything
      </div>

      {/* 第二幕：打字机文本 */}
      <div 
        id="act2-text-container"
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl px-8"
        style={{ 
          zIndex: 30,
          fontSize: 'clamp(20px, 3vw, 32px)',
          color: 'var(--ink-high)',
          lineHeight: '1.8',
          fontWeight: '500'
        }}
      />

      {/* 第三幕：优化可视化 */}
      <div 
        id="act3-particle"
        className="absolute inset-0 flex flex-col items-center justify-center p-8"
        style={{ zIndex: 30 }}
      >
        {/* 切换按钮 */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setVizMode('static')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              vizMode === 'static' 
                ? 'bg-white text-gray-800 shadow-lg' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            style={{ 
              border: vizMode === 'static' ? '2px solid var(--tech-mint)' : '2px solid transparent'
            }}
          >
            静态优化
          </button>
          <button
            onClick={() => setVizMode('dynamic')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              vizMode === 'dynamic' 
                ? 'bg-white text-gray-800 shadow-lg' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            style={{ 
              border: vizMode === 'dynamic' ? '2px solid var(--tech-mint)' : '2px solid transparent'
            }}
          >
            动态优化
          </button>
        </div>

        {/* 可视化组件 */}
        <OptimizationViz mode={vizMode} width={900} height={450} />
        
        {/* 说明文字 */}
        <div className="mt-4 max-w-4xl text-center">
          <p className="text-sm text-gray-300 leading-relaxed">
            {vizMode === 'static' 
              ? '静态优化：从噪声观测中估计某一时刻的最优状态，如摄影测量中的点位坐标确定。'
              : '动态优化：基于历史轨迹预测未来状态，如目标跟踪与路径规划。'
            }
          </p>
        </div>

        {/* 图例 */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-cyan-400" />
            <span>真实轨迹</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>当前粒子</span>
          </div>
          {vizMode === 'static' ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>噪声观测</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white border-2 border-black" />
                <span>最优估计</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-indigo-500" style={{borderStyle: 'dashed'}} />
              <span>预测轨迹</span>
            </div>
          )}
        </div>
      </div>
      
      {currentSection < totalSections - 1 && (
        <DownHint targetSection={1} text="向下滚动继续" isStatic={true} />
      )}
      
      {/* CSS 动画样式 */}
      <style jsx>{`
        .floating-symbol {
          font-family: 'Times New Roman', serif;
          color: rgba(100, 255, 218, 0.6);
          user-select: none;
          pointer-events: none;
        }
        
        /* 简化的标题样式 */
        #act1-title {
          font-weight: bold;
        }
        
        /* 游戏风格打字机效果 */
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
            rgba(100, 255, 218, 0.08) 0%, 
            rgba(100, 255, 218, 0.03) 50%, 
            rgba(100, 255, 218, 0.08) 100%
          );
          padding: 0.8rem 1.5rem;
          margin: 0.3rem 0;
          border-left: 4px solid rgba(100, 255, 218, 0.7);
          border-radius: 4px;
          backdrop-filter: blur(1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
            rgba(100, 255, 218, 0.1) 50%, 
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
        }
        
        /* 其他动画 */
        @keyframes float-math {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-15px) rotate(2deg); }
          50% { transform: translateY(-8px) rotate(-1deg); }
          75% { transform: translateY(-22px) rotate(1deg); }
        }
        
        .animate-float-math {
          animation: float-math 12s ease-in-out infinite;
        }
        
        @keyframes floatParticle {
          0% { 
            transform: translateY(0px) translateX(0px) rotate(0deg); 
            opacity: 0;
          }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { 
            transform: translateY(-100vh) translateX(20px) rotate(360deg); 
            opacity: 0;
          }
        }
        
        @keyframes particlePulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.8;
          }
          50% { 
            transform: scale(1.5); 
            opacity: 1;
          }
        }
        
        /* 响应式调整 */
        @media (max-width: 768px) {
          .word-artistic {
            display: block;
            margin: 0.1em 0;
          }
        }
      `}</style>
    </section>
  );
};

export default Section1Functions;