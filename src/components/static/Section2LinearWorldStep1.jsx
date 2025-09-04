import React, { useState, useRef, useLayoutEffect, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';

const Section2LinearWorldStep1 = ({ id }) => {
  const [activeTab, setActiveTab] = useState('add'); // 'add' | 'hom' | 'sup'
  const [step, setStep] = useState(0);
  const [rightWeightCount, setRightWeightCount] = useState(0); // 右侧砝码数量
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // 天平常量
  const W = 900, H = 450;
  const PIVOT = { x: W / 2, y: 200 };
  const ARM = 260; // 横梁半长
  const PAN_DY = 90; // 链条长度
  const G_EGG = 50;
  const G_MILK = 1000;
  const BUNDLE_Y = 80; // 捆绑区域Y位置

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
      return { title, formula, info, leftItems, rightItems };
    }
    
    if (activeTab === 'hom') {
      const title = "齐次性";
      const formula = "f(α·x) = α·f(x)";
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
      return { title, formula, info, leftItems, rightItems };
    }
    
    // 线性叠加
    const title = "线性叠加";
    const formula = "f(αx + βy) = αf(x) + βf(y)";
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
    return { title, formula, info, leftItems, rightItems };
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
    let bundleX = W - 200; // 捆绑初始位置（右侧）
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
      const maxAngle = 0.3; // 最大倾角30度
      const targetAngle = Math.max(-maxAngle, Math.min(maxAngle, (diff / 2000) * maxAngle));
      
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
      
      // 绘制地面（深色主题）
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, H - 50, W, 50);
      
      // 绘制基座
      const baseGrad = ctx.createLinearGradient(PIVOT.x - 25, PIVOT.y + 30, PIVOT.x + 25, PIVOT.y + 30);
      baseGrad.addColorStop(0, '#475569');
      baseGrad.addColorStop(0.5, '#64748b');
      baseGrad.addColorStop(1, '#475569');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(PIVOT.x - 25, PIVOT.y + 30, 50, 150);
      
      // 保存状态并旋转
      ctx.save();
      ctx.translate(PIVOT.x, PIVOT.y);
      ctx.rotate(currentAngle);
      
      // 绘制横梁（更亮的颜色）
      const beamGrad = ctx.createLinearGradient(-ARM - 20, -8, -ARM - 20, 8);
      beamGrad.addColorStop(0, '#94a3b8');
      beamGrad.addColorStop(0.5, '#cbd5e1');
      beamGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(-ARM - 20, -8, 2 * ARM + 40, 16);
      
      // 绘制刻度线
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let i = -8; i <= 8; i++) {
        if (i !== 0) {
          ctx.beginPath();
          ctx.moveTo(i * 28, -10);
          ctx.lineTo(i * 28, 10);
          ctx.stroke();
        }
      }
      
      // 绘制中心轴
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#f1f5f9';
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 左右链条和托盘位置
      const L = { x: -ARM, y: 0 };
      const R = { x: ARM, y: 0 };
      
      // 绘制链条（亮色）
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 2]);
      
      // 左链条
      ctx.beginPath();
      ctx.moveTo(L.x, L.y);
      ctx.lineTo(L.x, L.y + PAN_DY);
      ctx.stroke();
      
      // 右链条
      ctx.beginPath();
      ctx.moveTo(R.x, R.y);
      ctx.lineTo(R.x, R.y + PAN_DY);
      ctx.stroke();
      
      ctx.setLineDash([]);
      
      // 绘制托盘（亮色）
      const drawPan = (x, y) => {
        const panGrad = ctx.createRadialGradient(x, y, 0, x, y, 90);
        panGrad.addColorStop(0, '#e2e8f0');
        panGrad.addColorStop(1, '#94a3b8');
        ctx.fillStyle = panGrad;
        ctx.beginPath();
        ctx.ellipse(x, y, 90, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.stroke();
      };
      
      drawPan(L.x, L.y + PAN_DY);
      drawPan(R.x, R.y + PAN_DY);
      
      // 物品绘制函数
      const drawEgg = (x, y, scale = 1) => {
        ctx.save();
        ctx.scale(scale, scale);
        x = x / scale;
        y = y / scale;
        
        // 鸡蛋（亮黄色）
        const eggGrad = ctx.createRadialGradient(x, y - 15, 3, x, y - 15, 18);
        eggGrad.addColorStop(0, '#fef3c7');
        eggGrad.addColorStop(0.6, '#fde68a');
        eggGrad.addColorStop(1, '#fbbf24');
        ctx.fillStyle = eggGrad;
        ctx.beginPath();
        ctx.ellipse(x, y - 15, 14, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // 高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.ellipse(x - 4, y - 20, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };
      
      const drawMilk = (x, y, scale = 1) => {
        ctx.save();
        ctx.scale(scale, scale);
        x = x / scale;
        y = y / scale;
        
        // 牛奶盒（亮蓝色）
        const milkGrad = ctx.createLinearGradient(x - 20, y - 30, x - 20, y + 5);
        milkGrad.addColorStop(0, '#bfdbfe');
        milkGrad.addColorStop(1, '#60a5fa');
        ctx.fillStyle = milkGrad;
        ctx.fillRect(x - 20, y - 30, 40, 50);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 20, y - 30, 40, 50);
        
        // 顶部盖子
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 20, y - 30, 40, 10);
        ctx.strokeRect(x - 20, y - 30, 40, 10);
        
        // 标签
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(x - 16, y - 12, 32, 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('MILK', x, y);
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
      
      // 绘制左侧物品（如果已放入）
      if (leftPanAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = leftPanAlpha;
        
        // 绘制物品
        const eggs = sceneConfig.leftItems.filter(i => i.type === 'egg');
        const milks = sceneConfig.leftItems.filter(i => i.type === 'milk');
        
        eggs.forEach((_, i) => {
          const spacing = 35;
          const startX = L.x - ((eggs.length - 1) * spacing) / 2;
          drawEgg(startX + i * spacing, L.y + PAN_DY - 10);
        });
        
        milks.forEach((_, i) => {
          const spacing = 50;
          const startX = L.x - ((milks.length - 1) * spacing) / 2;
          drawMilk(startX + i * spacing, L.y + PAN_DY - 10);
        });
        
        // 绘制3D捆绑绳（横向缠绕效果）
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2.5;
        ctx.globalAlpha = leftPanAlpha * 0.8;
        
        // 前面的绳子
        ctx.beginPath();
        ctx.ellipse(L.x, L.y + PAN_DY - 15, 85, 8, 0, 0, Math.PI);
        ctx.stroke();
        
        // 后面的绳子（虚线表示在物体后面）
        ctx.setLineDash([3, 3]);
        ctx.globalAlpha = leftPanAlpha * 0.4;
        ctx.beginPath();
        ctx.ellipse(L.x, L.y + PAN_DY - 15, 85, 8, 0, Math.PI, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
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
        
        const bundleY = BUNDLE_Y;
        
        // 绘制捆绑中的物品（平铺并垂直居中）
        if (activeTab === 'add') {
          // 鸡蛋和牛奶垂直居中对齐
          drawEgg(bundleX - 25, bundleY + 5); // 鸡蛋较矮，下移一点
          drawMilk(bundleX + 25, bundleY);
        } else if (activeTab === 'hom') {
          // 3个牛奶平铺
          for (let i = 0; i < 3; i++) {
            drawMilk(bundleX - 50 + i * 50, bundleY);
          }
        } else {
          // 2个鸡蛋和2个牛奶，垂直居中
          drawEgg(bundleX - 70, bundleY + 5);
          drawEgg(bundleX - 35, bundleY + 5);
          drawMilk(bundleX + 15, bundleY);
          drawMilk(bundleX + 65, bundleY);
        }
        
        // 绘制3D捆绑绳（横向缠绕效果）
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
        
        const bundleWidth = activeTab === 'hom' ? 140 : 
                           activeTab === 'add' ? 90 : 160;
        
        // 前面的绳子（实线）
        ctx.beginPath();
        ctx.ellipse(bundleX, bundleY - 15, bundleWidth/2, 10, 0, 0, Math.PI);
        ctx.stroke();
        
        // 后面的绳子（虚线）
        ctx.setLineDash([4, 4]);
        ctx.globalAlpha = bundleAlpha * 0.5;
        ctx.beginPath();
        ctx.ellipse(bundleX, bundleY - 15, bundleWidth/2, 10, 0, Math.PI, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // 绳结
        ctx.globalAlpha = bundleAlpha;
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(bundleX, bundleY - 15, 4, 0, Math.PI * 2);
        ctx.fill();
        
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
        <div className="flex items-start justify-between h-full">
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1" style={{ color: '#f1f5f9' }}>
              {sceneConfig.title}
            </h3>
            <div className="text-xl font-mono mb-2" style={{ color: 'var(--tech-mint)' }}>
              {sceneConfig.formula}
            </div>
            <p className="text-sm" style={{ color: '#cbd5e1' }}>
              {sceneConfig.info}
            </p>
          </div>
          
          <div className="ml-6 text-right">
            <div className="text-xs" style={{ color: '#94a3b8' }}>
              {step === 0 && '准备演示...'}
              {step === 1 && '捆绑物品中...'}
              {step === 2 && '移动到左盘...'}
              {step >= 3 && rightWeightCount < sceneConfig.rightItems.length && 
                `添加砝码 ${rightWeightCount}/${sceneConfig.rightItems.length}...`}
              {step >= 3 && rightWeightCount === sceneConfig.rightItems.length && '天平已平衡'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section2LinearWorldStep1;