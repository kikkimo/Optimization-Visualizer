import React, { useState, useRef, useLayoutEffect, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

const Section2LinearWorldStep1 = ({ id }) => {
  const [activeTab, setActiveTab] = useState('add'); // 'add' | 'hom' | 'sup'
  const [step, setStep] = useState(0);
  const [rightWeightCount, setRightWeightCount] = useState(0); // 右侧砝码数量
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // 天平常量
  const W = 900, H = 450;
  const PIVOT = { x: W / 2 + 50, y: 200 }; // 天平中心右移50px
  const ARM = 260; // 横梁半长
  const PAN_DY = 90; // 链条长度
  const G_EGG = 50;
  const G_MILK = 1000;
  const BUNDLE_X = W - 120; // 捆绑区域 X位置（右侧）
  const BUNDLE_Y = 100; // 捆绑区域 Y位置（稍微下移）

  const tabs = [
    { id: 'add', title: '可加性' },
    { id: 'hom', title: '齐次性' },
    { id: 'sup', title: '线性叠加' }
  ];

  // 获取当前场景配置
  const sceneConfig = useMemo(() => {
    if (activeTab === 'add') {
      const title = "可加性";
      const formula = "f(x + y) = f(x) + f(y)";
      const info = "将1个鸡蛋(50g)与1盒牛奶(1000g)捆绑后放入左盘，右盘放入对应重量砝码，总重1050g";
      const leftItems = [
        { type: "egg", g: G_EGG },
        { type: "milk", g: G_MILK }
      ];
      const rightItems = [
        { type: "weight", g: G_MILK },
        { type: "weight", g: G_EGG }
      ];
      return {
        title,
        definition: "对于一个映射或变换 f ，如果对于定义域中的任意两个元素 x 和 y，都满足：",
        formula,
        intuition: "把两个物体捆绑成一个整体称重，等于分别称重后相加",
        animation: "将鸡蛋（50g）与 1L 牛奶（1000g）先在左盘捆绑为一个整体，一次性放上；右盘依次放入 1000g 与 50g 两个砝码，天平回正。",
        info,
        leftItems,
        rightItems
      };
    }
    
    if (activeTab === 'hom') {
      const title = "齐次性";
      const formula = "f(\\alpha \\cdot x) = \\alpha \\cdot f(x)";
      const info = "将3盒牛奶(各1000g)捆绑后放入左盘，右盘放入3个1000g砝码，总重3000g";
      const leftItems = [
        { type: "milk", g: G_MILK },
        { type: "milk", g: G_MILK },
        { type: "milk", g: G_MILK }
      ];
      const rightItems = [
        { type: "weight", g: G_MILK },
        { type: "weight", g: G_MILK },
        { type: "weight", g: G_MILK }
      ];
      return {
        title,
        definition: "对于一个映射或变换 f ，如果对于定义域中的任意 x 和标量 α，都满足：",
        formula,
        intuition: "把三个相同物体捆绑称重，等于单个重量的三倍",
        animation: "将 3 盒牛奶（各 1000g）捆绑后放入左盘；右盘依次放入 3 个 1000g 砝码，天平回正。",
        info,
        leftItems,
        rightItems
      };
    }
    
    // 线性叠加
    const title = "线性叠加原理";
    const formula = "f(\\alpha x + \\beta y) = \\alpha f(x) + \\beta f(y)";
    const info = "将2个鸡蛋(各50g)与2盒牛奶(各1000g)捆绑后放入左盘，右盘放入对应砝码，总重2100g";
    const leftItems = [
      { type: "egg", g: G_EGG },
      { type: "egg", g: G_EGG },
      { type: "milk", g: G_MILK },
      { type: "milk", g: G_MILK }
    ];
    const rightItems = [
      { type: "weight", g: G_MILK },
      { type: "weight", g: G_MILK },
      { type: "weight", g: G_EGG },
      { type: "weight", g: G_EGG }
    ];
    return {
      title,
      definition: "如果一个映射或变换 f 同时满足可加性和齐次性，那么我们就称 f 是一个线性映射或线性变换。它所遵循的规律就是线性叠加原理。对于任意元素 x,y 和任意标量 α,β 有",
      formula,
      intuition: "捆绑多个不同物体的组合，等于各自重量的线性组合",
      animation: "将 2 个鸡蛋（各 50g）与 2 盒牛奶（各 1000g）捆绑后放入左盘；右盘依次放入 2 个 1000g 与 2 个 50g 砸码，天平回正。",
      info,
      leftItems,
      rightItems
    };
  }, [activeTab]);

  // 自动播放动画
  useEffect(() => {
    setStep(0);
    setRightWeightCount(0);
    
    // 动画步骤时间线
    const timeline = [
      { step: 1, delay: 500 },   // 捆绑动画
      { step: 2, delay: 2000 },  // 移动到左盘
      { step: 3, delay: 3500 },  // 开始放砝码
    ];
    
    const timers = timeline.map(({ step, delay }) => 
      setTimeout(() => setStep(step), delay)
    );
    
    // 右侧砝码逐个添加
    if (sceneConfig.rightItems.length > 0) {
      const weightTimers = sceneConfig.rightItems.map((_, index) => 
        setTimeout(() => setRightWeightCount(index + 1), 3500 + (index + 1) * 600)
      );
      timers.push(...weightTimers);
    }
    
    return () => timers.forEach(timer => clearTimeout(timer));
  }, [activeTab, sceneConfig.rightItems.length]);

  // Canvas动画绘制
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    // 动画状态
    let currentAngle = 0;
    let bundleAlpha = 0;
    let bundleX = BUNDLE_X; // 捆绑初始位置（使用常量）
    let leftPanAlpha = 0;
    let showLeftItems = false;

    const animate = () => {
      // 透明背景
      ctx.clearRect(0, 0, W, H);
      
      // 计算当前重量和目标倾角
      let leftTotal = 0;
      let rightTotal = 0;
      
      // 只有当物品真正显示在天平上时才计算重量
      if (showLeftItems && step >= 2) { 
        leftTotal = sceneConfig.leftItems.reduce((s, it) => s + it.g, 0);
      }
      
      if (step >= 3) { // 右盘有砝码
        rightTotal = sceneConfig.rightItems
          .slice(0, rightWeightCount)
          .reduce((s, it) => s + it.g, 0);
      }
      
      // 物理引擎：重量差与倾角的关系（左重为负，右重为正）
      const diff = rightTotal - leftTotal;
      const maxAngle = 0.25; // 最大倾角25度
      // 更灵敏的天平，50g差异也能明显感知
      // 使用非线性映射，小重量差异也有明显倾斜
      const sensitivity = 0.5; // 灵敏度系数
      const targetAngle = Math.max(-maxAngle, Math.min(maxAngle, 
        Math.sign(diff) * Math.pow(Math.abs(diff) / 1000, sensitivity) * maxAngle));
      
      // 平滑过渡角度
      currentAngle += (targetAngle - currentAngle) * 0.08;
      
      // 捆绑动画透明度和位置
      if (step === 1) {
        bundleAlpha = Math.min(1, bundleAlpha + 0.03);
      } else if (step === 2) {
        // 移动到左盘
        bundleX += (PIVOT.x - ARM - bundleX) * 0.05;
        if (Math.abs(bundleX - (PIVOT.x - ARM)) < 5) {
          bundleAlpha = Math.max(0, bundleAlpha - 0.05);
          leftPanAlpha = Math.min(1, leftPanAlpha + 0.05);
          if (leftPanAlpha > 0.8) {
            showLeftItems = true; // 物品显示后才开始影响天平
          }
        }
      } else if (step >= 3) {
        leftPanAlpha = 1;
        showLeftItems = true;
      }
      
      // 绘制完整连接的基座结构
      const baseGrad = ctx.createLinearGradient(PIVOT.x - 30, PIVOT.y, PIVOT.x + 30, PIVOT.y);
      baseGrad.addColorStop(0, '#475569');
      baseGrad.addColorStop(0.5, '#64748b');
      baseGrad.addColorStop(1, '#475569');
      
      // 底座三角形支撑（金字塔式结构）
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.moveTo(PIVOT.x - 50, H - 50);
      ctx.lineTo(PIVOT.x + 50, H - 50);
      ctx.lineTo(PIVOT.x, PIVOT.y + 10);
      ctx.closePath();
      ctx.fill();
      
      // 添加支撑结构的边线以增强3D效果
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 中心支撑柱（与三角形无缝连接）
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.moveTo(PIVOT.x - 10, PIVOT.y + 10);
      ctx.lineTo(PIVOT.x + 10, PIVOT.y + 10);
      ctx.lineTo(PIVOT.x + 8, PIVOT.y);
      ctx.lineTo(PIVOT.x - 8, PIVOT.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // 底座加强板（跟随天平位置）
      ctx.fillStyle = '#334155';
      ctx.fillRect(PIVOT.x - 75, H - 52, 150, 6);
      
      // 保存状态并旋转
      ctx.save();
      ctx.translate(PIVOT.x, PIVOT.y);
      ctx.rotate(currentAngle);
      
      // 绘制横梁（拟物化金属杆）
      // 横梁阴影
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;
      
      const beamGrad = ctx.createLinearGradient(-ARM - 20, -10, -ARM - 20, 10);
      beamGrad.addColorStop(0, '#f1f5f9');
      beamGrad.addColorStop(0.2, '#e2e8f0');
      beamGrad.addColorStop(0.5, '#cbd5e1');
      beamGrad.addColorStop(0.8, '#94a3b8');
      beamGrad.addColorStop(1, '#64748b');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(-ARM - 20, -10, 2 * ARM + 40, 20);
      
      ctx.shadowColor = 'transparent';
      
      // 横梁边缘线
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(-ARM - 20, -10, 2 * ARM + 40, 20);
      
      // 横梁高光带
      const beamHighlight = ctx.createLinearGradient(-ARM, -10, -ARM, -6);
      beamHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
      beamHighlight.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
      ctx.fillStyle = beamHighlight;
      ctx.fillRect(-ARM - 18, -9, 2 * ARM + 36, 3);
      
      // 绘制精细刻度线
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      for (let i = -8; i <= 8; i++) {
        if (i !== 0) {
          ctx.beginPath();
          ctx.moveTo(i * 32, -8);
          ctx.lineTo(i * 32, 8);
          ctx.stroke();
          
          // 刻度数字（如果是关键位置）
          if (i % 4 === 0) {
            ctx.fillStyle = '#1e293b';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(Math.abs(i), i * 32, -12);
          }
        }
      }
      
      // 绘制中心轴（拟物化轴承）
      // 外圈 - 金属质感
      const axisGrad = ctx.createRadialGradient(0, -2, 2, 0, 2, 14);
      axisGrad.addColorStop(0, '#ffffff');
      axisGrad.addColorStop(0.3, '#f1f5f9');
      axisGrad.addColorStop(0.6, '#cbd5e1');
      axisGrad.addColorStop(1, '#64748b');
      ctx.fillStyle = axisGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      
      // 外圈边缘
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // 中圈 - 轴承槽
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // 内圈 - 轴心
      const innerGrad = ctx.createRadialGradient(-1, -1, 0, 0, 0, 6);
      innerGrad.addColorStop(0, '#64748b');
      innerGrad.addColorStop(0.5, '#475569');
      innerGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // 中心螺丝
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(-3, 0);
      ctx.lineTo(3, 0);
      ctx.moveTo(0, -3);
      ctx.lineTo(0, 3);
      ctx.stroke();
      
      // 高光
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(-3, -3, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // 左右链条和托盘位置
      const L = { x: -ARM, y: 0 };
      const R = { x: ARM, y: 0 };
      
      // 绘制链条（拟物化金属链）
      const drawChain = (x1, y1, x2, y2) => {
        const chainLength = Math.abs(y2 - y1);
        const linkCount = Math.floor(chainLength / 8);
        
        ctx.save();
        for (let i = 0; i < linkCount; i++) {
          const y = y1 + (i * chainLength / linkCount);
          
          // 链节主体
          const linkGrad = ctx.createLinearGradient(x1 - 2, y, x1 + 2, y);
          linkGrad.addColorStop(0, '#cbd5e1');
          linkGrad.addColorStop(0.5, '#94a3b8');
          linkGrad.addColorStop(1, '#64748b');
          
          ctx.strokeStyle = linkGrad;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          
          if (i % 2 === 0) {
            // 垂直链节
            ctx.ellipse(x1, y + 4, 2, 4, 0, 0, Math.PI * 2);
          } else {
            // 水平链节（模拟3D旋转）
            ctx.ellipse(x1, y + 4, 3, 3, 0, 0, Math.PI * 2);
          }
          ctx.stroke();
          
          // 链节高光
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(x1 - 1, y + 2, 1, 0, Math.PI * 0.7);
          ctx.stroke();
        }
        ctx.restore();
      };
      
      // 绘制左右链条
      drawChain(L.x, L.y, L.x, L.y + PAN_DY);
      drawChain(R.x, R.y, R.x, R.y + PAN_DY);
      
      // 绘制托盘（拟物化金属质感）
      const drawPan = (x, y) => {
        // 托盘底部阴影
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(x, y + 3, 92, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // 托盘主体 - 金属质感
        const panGrad = ctx.createRadialGradient(x, y - 5, 20, x, y, 95);
        panGrad.addColorStop(0, '#f8fafc');
        panGrad.addColorStop(0.3, '#e2e8f0');
        panGrad.addColorStop(0.6, '#cbd5e1');
        panGrad.addColorStop(0.8, '#94a3b8');
        panGrad.addColorStop(1, '#64748b');
        ctx.fillStyle = panGrad;
        ctx.beginPath();
        ctx.ellipse(x, y, 90, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 托盘边缘
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 托盘内圈（深度效果）
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(x, y, 85, 15, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // 金属高光
        const highlight = ctx.createLinearGradient(x - 70, y - 10, x - 30, y);
        highlight.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
        highlight.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = highlight;
        ctx.beginPath();
        ctx.ellipse(x - 40, y - 5, 30, 8, -0.3, 0, Math.PI * 0.6);
        ctx.fill();
      };
      
      drawPan(L.x, L.y + PAN_DY);
      drawPan(R.x, R.y + PAN_DY);
      
      // 物品绘制函数
      const drawEgg = (x, y, scale = 1) => {
        ctx.save();
        ctx.scale(scale, scale);
        x = x / scale;
        y = y / scale;
        
        // 鸡蛋主体 - 拟物化风格
        const eggGrad = ctx.createRadialGradient(x - 3, y - 18, 2, x, y - 12, 22);
        eggGrad.addColorStop(0, '#ffffff');
        eggGrad.addColorStop(0.2, '#fef9e6');
        eggGrad.addColorStop(0.5, '#fef3c7');
        eggGrad.addColorStop(0.8, '#fde68a');
        eggGrad.addColorStop(1, '#f59e0b');
        ctx.fillStyle = eggGrad;
        ctx.beginPath();
        ctx.ellipse(x, y - 15, 14, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 轮廓线
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 主高光
        const highlight = ctx.createRadialGradient(x - 4, y - 22, 0, x - 4, y - 22, 6);
        highlight.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        highlight.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
        highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = highlight;
        ctx.beginPath();
        ctx.ellipse(x - 4, y - 22, 5, 7, -0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // 次高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(x + 3, y - 18, 2, 3, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // 底部阴影
        ctx.fillStyle = 'rgba(139, 69, 19, 0.15)';
        ctx.beginPath();
        ctx.ellipse(x, y - 2, 10, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      };
      
      const drawMilk = (x, y, scale = 1) => {
        ctx.save();
        ctx.scale(scale, scale);
        x = x / scale;
        y = y / scale;
        
        // 牛奶盒主体 - 精细的纸盒质感
        // 侧面阴影（立体效果）
        ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
        ctx.beginPath();
        ctx.moveTo(x + 20, y - 25);
        ctx.lineTo(x + 23, y - 23);
        ctx.lineTo(x + 23, y + 18);
        ctx.lineTo(x + 20, y + 20);
        ctx.closePath();
        ctx.fill();
        
        // 盒身主体 - 纸盒质感
        const bodyGrad = ctx.createLinearGradient(x - 20, y - 25, x - 20, y + 20);
        bodyGrad.addColorStop(0, '#ffffff');
        bodyGrad.addColorStop(0.1, '#f0f9ff');
        bodyGrad.addColorStop(0.4, '#dbeafe');
        bodyGrad.addColorStop(0.7, '#bfdbfe');
        bodyGrad.addColorStop(1, '#93c5fd');
        ctx.fillStyle = bodyGrad;
        ctx.fillRect(x - 20, y - 25, 40, 45);
        
        // 盒身边框
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(x - 20, y - 25, 40, 45);
        
        // 顶部三角形盖子
        const topGrad = ctx.createLinearGradient(x, y - 32, x, y - 25);
        topGrad.addColorStop(0, '#ffffff');
        topGrad.addColorStop(0.5, '#f8fafc');
        topGrad.addColorStop(1, '#f1f5f9');
        ctx.fillStyle = topGrad;
        ctx.beginPath();
        ctx.moveTo(x - 20, y - 25);
        ctx.lineTo(x - 15, y - 32);
        ctx.lineTo(x + 15, y - 32);
        ctx.lineTo(x + 20, y - 25);
        ctx.closePath();
        ctx.fill();
        
        // 盖子边框
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 盖子折痕
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(x - 15, y - 32);
        ctx.lineTo(x - 15, y - 25);
        ctx.moveTo(x + 15, y - 32);
        ctx.lineTo(x + 15, y - 25);
        ctx.stroke();
        
        // 牛奶品牌标签 - 更精细
        // 标签背景
        const labelGrad = ctx.createLinearGradient(x - 15, y - 10, x + 15, y + 8);
        labelGrad.addColorStop(0, '#2563eb');
        labelGrad.addColorStop(0.5, '#3b82f6');
        labelGrad.addColorStop(1, '#60a5fa');
        ctx.fillStyle = labelGrad;
        
        // 圆角矩形标签
        const radius = 3;
        ctx.beginPath();
        ctx.moveTo(x - 15 + radius, y - 10);
        ctx.lineTo(x + 15 - radius, y - 10);
        ctx.quadraticCurveTo(x + 15, y - 10, x + 15, y - 10 + radius);
        ctx.lineTo(x + 15, y + 8 - radius);
        ctx.quadraticCurveTo(x + 15, y + 8, x + 15 - radius, y + 8);
        ctx.lineTo(x - 15 + radius, y + 8);
        ctx.quadraticCurveTo(x - 15, y + 8, x - 15, y + 8 - radius);
        ctx.lineTo(x - 15, y - 10 + radius);
        ctx.quadraticCurveTo(x - 15, y - 10, x - 15 + radius, y - 10);
        ctx.closePath();
        ctx.fill();
        
        // 标签边框
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        
        // MILK 文字 - 只显示文字
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('MILK', x, y - 1);
        
        // 标签光泽
        const labelHighlight = ctx.createLinearGradient(x - 12, y - 8, x - 5, y - 3);
        labelHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        labelHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = labelHighlight;
        ctx.fillRect(x - 12, y - 8, 7, 5);
        
        // 盒身高光 - 增强立体感
        const boxHighlight = ctx.createLinearGradient(x - 19, y - 23, x - 10, y - 15);
        boxHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
        boxHighlight.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        boxHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = boxHighlight;
        ctx.fillRect(x - 19, y - 23, 8, 20);
        
        // 底部折痕（增加细节）
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x - 18, y + 15);
        ctx.lineTo(x + 18, y + 15);
        ctx.stroke();
        
        ctx.restore();
      };
      
      const drawWeight = (x, y, weight) => {
        if (weight === G_MILK) {
          // 1000g砝码（金色）
          const wGrad = ctx.createLinearGradient(x - 25, y - 22, x - 25, y + 18);
          wGrad.addColorStop(0, '#fde68a');
          wGrad.addColorStop(1, '#f59e0b');
          ctx.fillStyle = wGrad;
          ctx.fillRect(x - 25, y - 22, 50, 40);
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 2;
          ctx.strokeRect(x - 25, y - 22, 50, 40);
          
          // 把手
          ctx.fillStyle = '#fef3c7';
          ctx.beginPath();
          ctx.arc(x, y - 25, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.stroke();
          
          // 刻字
          ctx.fillStyle = '#7c2d12';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('1000g', x, y);
        } else {
          // 50g砝码（银色）
          const wGrad = ctx.createLinearGradient(x - 14, y - 14, x - 14, y + 14);
          wGrad.addColorStop(0, '#e2e8f0');
          wGrad.addColorStop(1, '#94a3b8');
          ctx.fillStyle = wGrad;
          ctx.fillRect(x - 14, y - 14, 28, 28);
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 2;
          ctx.strokeRect(x - 14, y - 14, 28, 28);
          
          // 把手
          ctx.fillStyle = '#f1f5f9';
          ctx.beginPath();
          ctx.arc(x, y - 16, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#94a3b8';
          ctx.stroke();
          
          // 刻字
          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('50g', x, y + 1);
        }
      };

      // 绘制带捆绑绳的物品函数（真实环绕效果）
      const drawBundledItems = (centerX, centerY, items, isOnScale = false) => {
        // 计算物品位置 - 紧密排列
        const positions = [];
        let totalWidth = 0;
        const spacing = 1; // 最小间距
        
        items.forEach((item, i) => {
          const width = item.type === 'egg' ? 30 : 45;
          const height = item.type === 'egg' ? 40 : 60;
          if (i > 0) totalWidth += spacing;
          positions.push({ 
            type: item.type, 
            x: totalWidth + width/2, 
            width,
            height 
          });
          totalWidth += width;
        });
        
        // 居中调整
        positions.forEach(pos => {
          pos.x = centerX - totalWidth/2 + pos.x;
        });
        
        // 先绘制物品
        positions.forEach(pos => {
          if (pos.type === 'egg') {
            drawEgg(pos.x, centerY + 5);
          } else {
            drawMilk(pos.x, centerY);
          }
        });
        
        // 然后绘制绳子（在物品前面）
        if (positions.length > 0) {
          const ropeY = centerY - 15; // 绳子在物体赤道位置
          
          ctx.save();
          
          // 绳子阴影
          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          ctx.shadowBlur = 3;
          ctx.shadowOffsetY = 2;
          
          // 创建一个连续的绳子路径，环绕所有物体
          ctx.beginPath();
          
          // 绳子材质渐变
          const ropeGrad = ctx.createLinearGradient(positions[0].x - positions[0].width/2, ropeY - 3, positions[0].x - positions[0].width/2, ropeY + 3);
          ropeGrad.addColorStop(0, '#d4a574');
          ropeGrad.addColorStop(0.2, '#c19a6b');
          ropeGrad.addColorStop(0.5, '#a0826d');
          ropeGrad.addColorStop(0.8, '#8b6f47');
          ropeGrad.addColorStop(1, '#6f4e37');
          
          ctx.strokeStyle = ropeGrad;
          ctx.lineWidth = 3.5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          // 左侧绳结起点
          const firstItem = positions[0];
          const leftStart = firstItem.x - firstItem.width/2 - 10;
          ctx.moveTo(leftStart, ropeY);
          
          // 遍历所有物体，绘制环绕效果
          positions.forEach((pos, index) => {
            // 绳子环绕物体前面的弧线
            // 从左边缘开始
            const leftEdge = pos.x - pos.width/2;
            const rightEdge = pos.x + pos.width/2;
            
            if (index === 0) {
              // 第一个物体，从绳结连接到左边缘
              ctx.lineTo(leftEdge, ropeY);
            }
            
            // 绘制环绕物体前面的弧线（下凸弧）
            const controlY = ropeY + (pos.type === 'egg' ? 6 : 8); // 控制点下移，形成环绕效果
            ctx.quadraticCurveTo(pos.x, controlY, rightEdge, ropeY);
            
            // 如果不是最后一个物体，连接到下一个物体
            if (index < positions.length - 1) {
              const nextPos = positions[index + 1];
              // 物体间的连接段（略微上凸，模拟绳子张力）
              const midX = (rightEdge + nextPos.x - nextPos.width/2) / 2;
              const midY = ropeY - 1;
              ctx.quadraticCurveTo(midX, midY, nextPos.x - nextPos.width/2, ropeY);
            }
          });
          
          // 右侧绳结终点
          const lastItem = positions[positions.length - 1];
          const rightEnd = lastItem.x + lastItem.width/2 + 10;
          ctx.lineTo(rightEnd, ropeY);
          
          // 绘制主绳子
          ctx.stroke();
          
          // 添加绳子纹理（螺旋纹）
          ctx.save();
          ctx.strokeStyle = '#8b6f47';
          ctx.lineWidth = 0.8;
          ctx.setLineDash([3, 2]);
          ctx.globalAlpha = 0.6;
          ctx.stroke();
          ctx.restore();
          
          // 绘制左侧绳结
          const drawKnot = (x, y) => {
            // 绳结主体
            ctx.fillStyle = '#8b6f47';
            ctx.beginPath();
            ctx.ellipse(x, y, 5, 4, -0.2, 0, Math.PI * 2);
            ctx.fill();
            
            // 绳结细节 - 交叉纹理
            ctx.strokeStyle = '#6f4e37';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x - 3, y - 2);
            ctx.lineTo(x + 3, y + 2);
            ctx.moveTo(x - 3, y + 2);
            ctx.lineTo(x + 3, y - 2);
            ctx.stroke();
            
            // 绳结高光
            ctx.fillStyle = 'rgba(212, 165, 116, 0.7)';
            ctx.beginPath();
            ctx.ellipse(x - 1, y - 1, 1.5, 1, -0.2, 0, Math.PI * 2);
            ctx.fill();
          };
          
          drawKnot(leftStart, ropeY);
          drawKnot(rightEnd, ropeY);
          
          ctx.restore();
        }
      };
      
      // 绘制左侧物品（如果已放入）
      if (leftPanAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = leftPanAlpha;
        drawBundledItems(L.x, L.y + PAN_DY - 10, sceneConfig.leftItems, true);
        ctx.restore();
      }
      
      // 绘制右侧砝码（逐个添加）
      if (rightWeightCount > 0) {
        const visibleRightItems = sceneConfig.rightItems.slice(0, rightWeightCount);
        const w50s = visibleRightItems.filter(i => i.g === G_EGG);
        const w1000s = visibleRightItems.filter(i => i.g === G_MILK);
        
        // 绘制1000g砝码
        w1000s.forEach((_, i) => {
          const spacing = 60;
          const startX = R.x - ((w1000s.length - 1) * spacing) / 2;
          drawWeight(startX + i * spacing, R.y + PAN_DY - 10, G_MILK);
        });
        
        // 绘制50g砝码
        w50s.forEach((_, i) => {
          const spacing = 35;
          const startX = R.x - ((w50s.length - 1) * spacing) / 2;
          drawWeight(startX + i * spacing, R.y + PAN_DY - 10, G_EGG);
        });
      }
      
      ctx.restore();
      
      // 绘制捆绑动画（在右侧按钮下方）
      if (bundleAlpha > 0 && step <= 2) {
        ctx.save();
        ctx.globalAlpha = bundleAlpha;
        drawBundledItems(bundleX, BUNDLE_Y, sceneConfig.leftItems, false);
        ctx.restore();
      }
      
      // 绘制指针和刻度盘（亮色）
      ctx.fillStyle = 'rgba(241, 245, 249, 0.9)';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.fillRect(PIVOT.x - 90, PIVOT.y - 120, 180, 28);
      ctx.strokeRect(PIVOT.x - 90, PIVOT.y - 120, 180, 28);
      
      // 刻度线
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      for (let i = -4; i <= 4; i++) {
        ctx.beginPath();
        ctx.moveTo(PIVOT.x + i * 18, PIVOT.y - 118);
        ctx.lineTo(PIVOT.x + i * 18, PIVOT.y - 94);
        ctx.stroke();
      }
      
      // 指针（与天平同步）
      ctx.save();
      ctx.translate(PIVOT.x, PIVOT.y - 106);
      ctx.rotate(currentAngle); // 指针与天平角度一致
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 12);
      ctx.lineTo(0, -18);
      ctx.stroke();
      
      // 指针中心
      ctx.beginPath();
      ctx.arc(0, 12, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [sceneConfig, step, rightWeightCount, activeTab]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* 动画区域 - 75% */}
      <div className="relative flex-grow" style={{ flex: '3' }}>
        {/* 图例 - 左上角 */}
        <div className="absolute top-4 left-4 p-3 rounded-lg" style={{ 
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          zIndex: 10
        }}>
          <div className="text-xs font-semibold mb-2" style={{ color: '#e2e8f0' }}>图例</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <canvas 
                width="30" 
                height="35" 
                ref={canvas => {
                  if (canvas) {
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, 30, 35);
                    // 绘制小鸡蛋
                    const egg = ctx.createRadialGradient(15, 17, 2, 15, 17, 10);
                    egg.addColorStop(0, '#fef3c7');
                    egg.addColorStop(0.6, '#fde68a');
                    egg.addColorStop(1, '#fbbf24');
                    ctx.fillStyle = egg;
                    ctx.beginPath();
                    ctx.ellipse(15, 17, 8, 10, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#f59e0b';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    // 高光
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.beginPath();
                    ctx.ellipse(12, 14, 2, 3, 0, 0, Math.PI * 2);
                    ctx.fill();
                  }
                }}
              />
              <span className="text-xs" style={{ color: '#cbd5e1' }}>鸡蛋 50g</span>
            </div>
            <div className="flex items-center gap-2">
              <canvas 
                width="30" 
                height="35" 
                ref={canvas => {
                  if (canvas) {
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, 30, 35);
                    // 绘制小牛奶盒
                    const milk = ctx.createLinearGradient(10, 8, 10, 27);
                    milk.addColorStop(0, '#bfdbfe');
                    milk.addColorStop(1, '#60a5fa');
                    ctx.fillStyle = milk;
                    ctx.fillRect(10, 8, 15, 19);
                    ctx.strokeStyle = '#3b82f6';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(10, 8, 15, 19);
                    // 盖子
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(10, 8, 15, 4);
                    ctx.strokeRect(10, 8, 15, 4);
                    // 标签
                    ctx.fillStyle = '#2563eb';
                    ctx.fillRect(12, 15, 11, 6);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 4px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('MILK', 17, 19);
                  }
                }}
              />
              <span className="text-xs" style={{ color: '#cbd5e1' }}>牛奶 1000g</span>
            </div>
          </div>
        </div>

        {/* 标签按钮 - 右上角 */}
        <div className="absolute top-0 right-0 flex" style={{ zIndex: 10 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === tab.id ? 'var(--tech-mint)' : 'transparent',
                borderBottom: activeTab === tab.id ? '3px solid var(--tech-mint)' : '3px solid transparent'
              }}
            >
              {tab.title}
            </button>
          ))}
        </div>

        {/* Canvas画布 */}
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ background: 'transparent' }}
        />
      </div>

      {/* 信息输出区域 - 25% */}
      <div className="px-6 py-4" style={{ 
        flex: '1',
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderTop: '1px solid rgba(100, 116, 139, 0.3)'
      }}>
        <div className="flex flex-col gap-2 h-full">
          {/* 标题和状态 */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold" style={{ color: '#f1f5f9' }}>
              {sceneConfig.title}
            </h3>
            <div className="text-xs" style={{ color: '#64748b' }}>
              {step === 0 && '准备演示...'}
              {step === 1 && '捆绑物品中...'}
              {step === 2 && '移动到左盘...'}
              {step >= 3 && rightWeightCount < sceneConfig.rightItems.length && 
                `添加砝码 ${rightWeightCount}/${sceneConfig.rightItems.length}...`}
              {step >= 3 && rightWeightCount === sceneConfig.rightItems.length && '✓ 天平已平衡'}
            </div>
          </div>
          
          {/* 数学定义 */}
          <div className="text-sm" style={{ color: '#e2e8f0' }}>
            <span className="font-semibold">定义：</span>
            <span>对于一个映射或变换 </span>
            <InlineMath math="f" />
            <span>，如果对于定义域中的任意</span>
            {activeTab === 'add' && (
              <>
                <span>两个元素 </span>
                <InlineMath math="x" />
                <span> 和 </span>
                <InlineMath math="y" />
              </>
            )}
            {activeTab === 'hom' && (
              <>
                <span> </span>
                <InlineMath math="x" />
                <span> 和标量 α</span>
              </>
            )}
            {activeTab === 'sup' && (
              <>
                <span>元素 </span>
                <InlineMath math="x,y" />
                <span> 和任意标量 α,β</span>
              </>
            )}
            <span>，都满足：</span>
          </div>
          
          {/* 公式 */}
          <div className="text-xl" style={{ color: 'var(--tech-mint)' }}>
            <InlineMath math={sceneConfig.formula} />
          </div>
          
          {/* 定义结论 */}
          {activeTab === 'add' && (
            <div className="text-sm" style={{ color: '#e2e8f0' }}>
              那么我们就称这个映射 <InlineMath math="f" /> 具有可加性
            </div>
          )}
          {activeTab === 'hom' && (
            <div className="text-sm" style={{ color: '#e2e8f0' }}>
              那么我们就称这个映射 <InlineMath math="f" /> 具有齐次性
            </div>
          )}
          {activeTab === 'sup' && (
            <div className="text-sm" style={{ color: '#e2e8f0' }}>
              那么我们就称 <InlineMath math="f" /> 是一个线性映射或线性变换
            </div>
          )}
          
          {/* 直观理解 */}
          <div className="text-sm" style={{ color: '#94a3b8' }}>
            <span className="font-semibold">直观：</span> {sceneConfig.intuition}
          </div>
          
          {/* 动画描述 */}
          <div className="text-sm flex items-start gap-1" style={{ color: '#94a3b8' }}>
            <span className="font-semibold flex-shrink-0">动画：</span>
            <span className="flex-1">
              {activeTab === 'add' && (
                <>
                  将鸡蛋（<InlineMath math="50g" />）与 <InlineMath math="1L" /> 牛奶（<InlineMath math="1000g" />）先在左盘捆绑为一个整体，一次性放上；右盘依次放入 <InlineMath math="1000g" /> 与 <InlineMath math="50g" /> 两个砝码，天平回正。
                </>
              )}
              {activeTab === 'hom' && (
                <>
                  将 <InlineMath math="3" /> 盒牛奶（各 <InlineMath math="1000g" />）捆绑后放入左盘；右盘依次放入 <InlineMath math="3" /> 个 <InlineMath math="1000g" /> 砝码，天平回正。
                </>
              )}
              {activeTab === 'sup' && (
                <>
                  将 <InlineMath math="2" /> 个鸡蛋（各 <InlineMath math="50g" />）与 <InlineMath math="2" /> 盒牛奶（各 <InlineMath math="1000g" />）捆绑后放入左盘；右盘依次放入 <InlineMath math="2" /> 个 <InlineMath math="1000g" /> 与 <InlineMath math="2" /> 个 <InlineMath math="50g" /> 砝码，天平回正。
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section2LinearWorldStep1;