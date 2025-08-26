import React, { useState, useEffect, useRef } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';


const Section1Definition = ({ id }) => {
  // 核心状态管理
  const [isMinimization, setIsMinimization] = useState(true);
  const [showMinMaxTooltip, setShowMinMaxTooltip] = useState(false);
  const [objectiveType, setObjectiveType] = useState('time'); // time, energy, balanced
  
  // 8个标签按钮的状态管理
  const [hoveredTerm, setHoveredTerm] = useState(null);
  const [showTooltip, setShowTooltip] = useState(null);
  const [tooltipTimeout, setTooltipTimeout] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  
  // 动画和路径状态
  const [currentFocusPath, setCurrentFocusPath] = useState('optimal'); // optimal, feasible, demo
  const [showMetrics, setShowMetrics] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationResetKey, setAnimationResetKey] = useState(0); // 用于强制重置动画
  
  // 约束状态（恒为ON）
  const constraintStates = {
    returnToStart: true,
    avoidObstacles: true
  };

  // 术语标签定义（8个）
  const termChips = [
    { id: 'decision-var', label: '决策变量', concept: 'decision variables' },
    { id: 'objective', label: '目标函数', concept: 'objective function' },
    { id: 'inequality', label: '不等式约束', concept: 'inequality constraints' },
    { id: 'equality', label: '等式约束', concept: 'equality constraints' },
    { id: 'domain', label: '定义域', concept: 'domain' },
    { id: 'feasible-region', label: '可行域', concept: 'feasible region' },
    { id: 'feasible-solution', label: '可行解', concept: 'feasible solution' },
    { id: 'optimal-solution', label: '最优解', concept: 'optimal solution' }
  ];

  // 术语标签定义和提示信息
  const termTooltips = {
    'decision-var': '决策变量：无人机每一秒的飞行位置',
    'objective': '目标函数：无人机飞行时间最短或能耗最低或兼顾考虑飞行时间与能耗',
    'inequality': '不等式约束：离禁飞区边界距离≥某值',
    'equality': '等式约束：拍摄任务结束后回到基站起点',
    'domain': '定义域：可飞行区域的边界范围',
    'feasible-region': '可行域：在定义域内同时满足所有飞行安全与任务约束的路线集合',
    'feasible-solution': '可行解：可行域内的任意具体路线',
    'optimal-solution': '最优解：可行解中，符合飞行时间最短或能耗最优的路线'
  };

  // 悬停激活处理（直接激活动画）
  const handleTermHover = (termId) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    
    // 立即激活标签和动画
    setHoveredTerm(termId);
    
    // 如果是带动画的术语，重置动画
    const animatedTerms = ['equality', 'feasible-region', 'feasible-solution', 'optimal-solution'];
    if (animatedTerms.includes(termId)) {
      setAnimationResetKey(prev => prev + 1);
    }
    
    // 显示气泡提示
    setShowTooltip(termId);
    
    // 动态计算气泡位置（使用 fixed 定位）
    setTimeout(() => {
      const buttonElement = document.querySelector(`[data-term-id="${termId}"]`);
      const tooltipElement = document.querySelector(`[data-term-id="${termId}"]`).parentElement.querySelector('.absolute.z-50');
      
      if (buttonElement && tooltipElement) {
        const buttonRect = buttonElement.getBoundingClientRect();
        const tooltipRect = tooltipElement.getBoundingClientRect();
        
        // 计算气泡应该的位置（按钮上方居中）
        const buttonCenterX = buttonRect.left + buttonRect.width / 2;
        const tooltipCenterX = tooltipRect.width / 2;
        // 添加-2px的微调，补偿边框/内边距的视觉偏差
        const leftPosition = buttonCenterX - tooltipCenterX - 2;
        const topPosition = buttonRect.top - tooltipRect.height - 12;
        
        // 应用新位置
        tooltipElement.style.position = 'fixed';
        tooltipElement.style.left = `${leftPosition}px`;
        tooltipElement.style.top = `${topPosition}px`;
        tooltipElement.style.bottom = 'auto';
        tooltipElement.style.transform = 'none';
      }
    }, 100);
    
    // 3秒后自动隐藏气泡
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
    }
    const newTooltipTimeout = setTimeout(() => {
      setShowTooltip(null);
    }, 3000);
    setTooltipTimeout(newTooltipTimeout);
  };

  // 悬停离开处理
  const handleTermLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    
    // 清除悬停状态和动画
    setHoveredTerm(null);
    
    // 立即隐藏气泡
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      setTooltipTimeout(null);
    }
    setShowTooltip(null);
  };

  // 文本中的术语交互（简化版）
  const handleTextTermInteraction = (termId, isActive) => {
    if (isActive) {
      handleTermHover(termId);
    } else {
      handleTermLeave();
    }
  };

  // Min/Max切换处理
  const handleMinMaxToggle = () => {
    const wasMinimization = isMinimization;
    setIsMinimization(!isMinimization);
    
    // 切换时显示相应的数学提示
    setShowMinMaxTooltip(true);
    setTimeout(() => setShowMinMaxTooltip(false), 3000);
  };

  // 目标函数切换处理（平滑形变）
  const handleObjectiveChange = (newType) => {
    if (newType === objectiveType) return;
    
    setIsAnimating(true);
    
    // 150ms 按钮高亮
    setTimeout(() => {
      setObjectiveType(newType);
      
      // 反向联动：临时高亮目标函数标签
      if (!lockedTerm) {
        setHoveredTerm('objective');
        setAnimationState('preview');
        setTimeout(() => {
          setHoveredTerm(null);
          setAnimationState('idle');
        }, 2000);
      }
      
      // 300-450ms 后动画结束
      setTimeout(() => {
        setIsAnimating(false);
      }, 450);
    }, 150);
  };

  // 获取当前活跃的术语（仅悬停状态）
  const currentActiveTerm = hoveredTerm;
  
  
  // 获取指标数据（模拟）
  const getMetricsForObjective = (objective) => {
    const metrics = {
      time: { time: 12.5, energy: 85, score: null }, // 飞行时间最短：时间优，能耗高
      energy: { time: 16.2, energy: 42, score: null }, // 能耗最小：能耗优，时间长
      balanced: { time: 14.1, energy: 63, score: 0.78 } // 平衡目标：综合评分
    };
    return metrics[objective] || metrics.time;
  };



  return (
    <section
      id={id}
      className="snap-section relative flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: 'var(--bg-deep)' }}
    >
      {/* 数学优化主题背景动画 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-deep)]">
        {/* 动态等高线 - 表示目标函数的等值线 */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.32]" viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="contourGradient1" cx="30%" cy="40%">
              <stop offset="0%" style={{ stopColor: 'rgb(34, 197, 94)', stopOpacity: 0.6 }} />
              <stop offset="50%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: 'transparent', stopOpacity: 0 }} />
            </radialGradient>
            <radialGradient id="contourGradient2" cx="70%" cy="60%">
              <stop offset="0%" style={{ stopColor: 'rgb(168, 85, 247)', stopOpacity: 0.5 }} />
              <stop offset="50%" style={{ stopColor: 'rgb(236, 72, 153)', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: 'transparent', stopOpacity: 0 }} />
            </radialGradient>
            <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'rgb(60, 230, 192)', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: 'rgb(34, 197, 94)', stopOpacity: 0.4 }} />
            </linearGradient>
          </defs>
          
          {/* 等高线椭圆 - 动态缩放 */}
          <ellipse cx="420" cy="320" rx="200" ry="120" 
                   fill="url(#contourGradient1)" 
                   className="animate-contour-pulse" 
                   style={{ animationDelay: '0s' }} />
          <ellipse cx="420" cy="320" rx="150" ry="90" 
                   fill="none" 
                   stroke="rgba(34, 197, 94, 0.5)" 
                   strokeWidth="2" 
                   strokeDasharray="8,4"
                   className="animate-contour-pulse" 
                   style={{ animationDelay: '1s' }} />
          
          <ellipse cx="980" cy="480" rx="180" ry="100" 
                   fill="url(#contourGradient2)" 
                   className="animate-contour-pulse" 
                   style={{ animationDelay: '2s' }} />
          <ellipse cx="980" cy="480" rx="130" ry="75" 
                   fill="none" 
                   stroke="rgba(168, 85, 247, 0.5)" 
                   strokeWidth="2" 
                   strokeDasharray="6,3"
                   className="animate-contour-pulse" 
                   style={{ animationDelay: '3s' }} />
          
          {/* 优化搜索轨迹 - 梯度下降路径 */}
          <path d="M 200 600 Q 350 500, 420 320 Q 500 200, 650 180 Q 800 160, 980 180 Q 1100 200, 1200 150"
                fill="none" 
                stroke="url(#searchGradient)" 
                strokeWidth="3"
                strokeDasharray="0 2000"
                className="animate-search-path"
                style={{ animationDuration: '15s' }} />
          
          {/* 搜索粒子 - 沿路径运动 */}
          <circle r="5" fill="rgb(60, 230, 192)" className="animate-search-particle">
            <animateMotion dur="15s" repeatCount="indefinite" begin="1s">
              <mpath href="#particle-path" />
            </animateMotion>
            <animate attributeName="r" values="5;8;5" dur="1s" repeatCount="indefinite" />
          </circle>
          
          {/* 辅助搜索粒子 */}
          <circle r="3" fill="rgb(34, 197, 94)" opacity="0.7" className="animate-search-particle">
            <animateMotion dur="18s" repeatCount="indefinite" begin="3s">
              <mpath href="#particle-path" />
            </animateMotion>
            <animate attributeName="r" values="3;6;3" dur="0.8s" repeatCount="indefinite" />
          </circle>
          
          {/* 隐藏路径定义 */}
          <path id="particle-path" d="M 200 600 Q 350 500, 420 320 Q 500 200, 650 180 Q 800 160, 980 180 Q 1100 200, 1200 150" fill="none" stroke="none" />
        </svg>
        
        {/* 数学符号群 - 增强版 */}
        <div className="absolute inset-0 opacity-[0.32]">
          {/* 梯度符号群 */}
          <div className="floating-math-symbol absolute top-[15%] left-[8%] text-5xl text-teal-400 animate-math-float-enhanced">∇</div>
          <div className="floating-math-symbol absolute top-[25%] right-[12%] text-4xl text-blue-400 animate-math-float-enhanced" style={{ animationDelay: '2s' }}>∂</div>
          <div className="floating-math-symbol absolute bottom-[30%] left-[15%] text-6xl text-green-400 animate-math-float-enhanced" style={{ animationDelay: '4s' }}>∫</div>
          <div className="floating-math-symbol absolute bottom-[20%] right-[8%] text-4xl text-purple-400 animate-math-float-enhanced" style={{ animationDelay: '6s' }}>∑</div>
          <div className="floating-math-symbol absolute top-[60%] left-[5%] text-5xl text-yellow-400 animate-math-float-enhanced" style={{ animationDelay: '1s' }}>∞</div>
          <div className="floating-math-symbol absolute top-[70%] right-[20%] text-4xl text-pink-400 animate-math-float-enhanced" style={{ animationDelay: '3s' }}>∈</div>
          
          {/* 额外的优化符号 */}
          <div className="floating-math-symbol absolute top-[40%] left-[25%] text-3xl text-cyan-400 animate-math-float-enhanced" style={{ animationDelay: '5s' }}>min</div>
          <div className="floating-math-symbol absolute top-[50%] right-[30%] text-3xl text-emerald-400 animate-math-float-enhanced" style={{ animationDelay: '7s' }}>max</div>
          <div className="floating-math-symbol absolute bottom-[50%] left-[40%] text-4xl text-indigo-400 animate-math-float-enhanced" style={{ animationDelay: '8s' }}>λ</div>
          <div className="floating-math-symbol absolute bottom-[40%] right-[45%] text-3xl text-orange-400 animate-math-float-enhanced" style={{ animationDelay: '9s' }}>∀</div>
        </div>
        
        {/* 可行域脉冲网格 */}
        <div className="absolute inset-0 opacity-[0.18]">
          <div className="w-full h-full animate-feasible-region-pulse" style={{
            backgroundImage: `
              radial-gradient(circle at 25% 30%, rgba(60, 230, 192, 0.4) 2px, transparent 3px),
              radial-gradient(circle at 75% 70%, rgba(34, 197, 94, 0.3) 2px, transparent 3px),
              linear-gradient(45deg, transparent 48%, rgba(60, 230, 192, 0.2) 49%, rgba(60, 230, 192, 0.2) 51%, transparent 52%)
            `,
            backgroundSize: '80px 80px, 100px 100px, 160px 160px',
          }} />
        </div>
        
        {/* 优化收敛指示器 */}
        <div className="absolute top-[20%] right-[15%] opacity-[0.5]">
          <div className="flex items-center space-x-2 animate-convergence-indicator">
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            <span className="text-xs text-gray-300 font-mono">收敛中...</span>
          </div>
        </div>
      </div>
      
      {/* 主要内容区域 - 仿照TSP页面的布局结构 */}
      <div className="relative z-10 w-full h-full flex" style={{ padding: '80px 24px' }}>
        <div className="w-full max-w-7xl mx-auto">
          
          {/* 6:4 左右分栏布局 */}
          <div className="grid grid-cols-10 gap-12 items-start h-full">
            
            {/* 左栏 (6) */}
            <div className="col-span-6 space-y-8">
              {/* 标题与副标题 */}
              <div className="space-y-4">
                <h1 className="text-4xl font-bold" style={{ color: 'var(--ink-high)' }}>
                  什么是数学优化？
                </h1>
                <p className="text-lg italic" style={{ color: 'var(--ink-mid)' }}>
                  Mathematical Optimization / Programming
                </p>
              </div>

              {/* 数学定义（两段文字）*/}
              <div className="space-y-6">
                <p className="text-lg leading-relaxed" style={{ color: 'var(--ink-high)' }}>
                  数学优化是研究在一定约束条件下，选择使<strong 
                    className="cursor-pointer transition-colors hover:text-teal-400"
                    onMouseEnter={() => handleTextTermInteraction('objective', true)}
                    onMouseLeave={() => handleTextTermInteraction('objective', false)}> 目标函数 </strong>达到最优值的<strong
                    className="cursor-pointer transition-colors hover:text-teal-400"
                    onMouseEnter={() => handleTextTermInteraction('decision-var', true)}
                    onMouseLeave={() => handleTextTermInteraction('decision-var', false)}> 决策变量 </strong>的理论与方法。
                </p>
                <p className="text-lg leading-relaxed" style={{ color: 'var(--ink-high)' }}>
                  其一般目标是在一个定义良好的集合（<strong
                    className="cursor-pointer transition-colors hover:text-teal-400"
                    onMouseEnter={() => handleTextTermInteraction('feasible-region', true)}
                    onMouseLeave={() => handleTextTermInteraction('feasible-region', false)}>可行域</strong>）中，寻找一个或多个<strong
                    className="cursor-pointer transition-colors hover:text-teal-400"
                    onMouseEnter={() => handleTextTermInteraction('optimal-solution', true)}
                    onMouseLeave={() => handleTextTermInteraction('optimal-solution', false)}> 最优解 </strong>。
                </p>
              </div>

              {/* 数学公式 */}
              <div className="space-y-4">
                <div className="relative">
                  {/* 公式块 */}
                  <div className="p-6 rounded-xl border relative" style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--carbon-line)'
                  }}>
                    {/* Min/Max 切换开关 - 完全贴合圆角矩形右上角 */}
                    <button
                      onClick={handleMinMaxToggle}
                      className="absolute top-0 right-0 px-2 py-1 text-xs font-mono font-medium transition-all duration-200 hover:opacity-80 focus:outline-none focus:ring-1 focus:ring-gray-400"
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        color: 'var(--ink-mid)',
                        border: '1px solid var(--carbon-line)',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        borderTopRightRadius: '0.75rem', // 匹配父容器的 rounded-xl
                        borderBottomLeftRadius: '0.25rem',
                        borderTopLeftRadius: '0',
                        borderBottomRightRadius: '0'
                      }}
                      aria-label={`切换为${isMinimization ? '最大化' : '最小化'}问题`}
                    >
                      {isMinimization ? 'MIN' : 'MAX'}
                    </button>
                    
                    <BlockMath math={`
                      \\begin{aligned}
                      ${isMinimization ? '\\min' : '\\max'}_{\\mathbf{x} \\in \\mathcal{X}} \\quad & f(\\mathbf{x}) \\\\
                      \\text{s.t.} \\quad & g_i(\\mathbf{x}) \\le 0, \\quad i=1,\\dots,m \\\\
                      & h_j(\\mathbf{x}) = 0, \\quad j=1,\\dots,p
                      \\end{aligned}
                    `} />
                  </div>

                  {/* MIN/MAX 提示气泡 - 显示在公式框下方中央，但箭头指向MIN/MAX按钮 */}
                  {showMinMaxTooltip && (
                    <div className="absolute px-4 py-2 rounded-lg text-sm animate-fade-in"
                         style={{
                           backgroundColor: 'var(--bg-elevated)',
                           color: 'var(--ink-mid)',
                           boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                           zIndex: 60,
                           top: '100%',
                           left: 0,
                           right: 0,
                           marginLeft: 'auto',
                           marginRight: 'auto',
                           marginTop: '16px',
                           width: 'fit-content'
                         }}>
                      {isMinimization 
                        ? "最小化问题是数学优化的标准形式，求解目标函数的全局最小值。"
                        : "最大化问题等价于最小化问题：max f(x) = -min(-f(x))"
                      }
                      
                      {/* 气泡箭头 - 指向右上角的MIN/MAX按钮 */}
                      <div 
                        className="absolute"
                        style={{
                          bottom: '100%',
                          right: '20px',
                          width: 0,
                          height: 0,
                          borderLeft: '6px solid transparent',
                          borderRight: '6px solid transparent',
                          borderBottom: '6px solid var(--bg-elevated)'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* 公式说明 */}
                <div className="space-y-3 text-sm" style={{ color: 'var(--ink-mid)' }}>
                  <p>其中：</p>
                  <ul className="space-y-2 ml-4">
                    <li>• <InlineMath math="\mathbf{x} \in \mathbb{R}^n" /> 为 <strong>决策变量</strong>（decision variables），即问题中待确定的未知量</li>
                    <li>• <InlineMath math="f(\mathbf{x})" /> 为 <strong>目标函数</strong>（objective function），表示评价方案优劣的数学函数</li>
                    <li>• <InlineMath math="g_i(\mathbf{x}) \le 0" /> 为 <strong>不等式约束</strong>（inequality constraints）</li>
                    <li>• <InlineMath math="h_j(\mathbf{x}) = 0" /> 为 <strong>等式约束</strong>（equality constraints）</li>
                    <li>• <InlineMath math="\mathcal{X}" /> 为 <strong>定义域</strong>（domain），可包含变量的取值类型</li>
                    <li>• <strong>可行域</strong>（feasible region）：满足所有约束条件的决策变量集合</li>
                    <li>• <strong>可行解</strong>（feasible solution）：可行域内的任意一个具体解</li>
                    <li>• <strong>最优解</strong>（optimal solution）：在可行域内使目标函数达到最优值的解</li>
                  </ul>
                </div>
              </div>

            </div>
            
            {/* 右栏 (4) */}
            <div className="col-span-4 space-y-6">
              <h3 className="text-xl font-semibold text-center" style={{ color: 'var(--ink-high)' }}>
                无人机点对点飞行任务
              </h3>

              {/* UAV 场景图 */}
              <div className="p-6 rounded-xl border" style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--carbon-line)'
              }}>
                <UavSceneSvg 
                  currentActiveTerm={currentActiveTerm}
                  objectiveType={objectiveType}
                  constraintStates={constraintStates}
                  animationResetKey={animationResetKey}
                />
              </div>

              {/* 核心概念标签 (Term Chips) */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium" style={{ color: 'var(--ink-mid)' }}>核心概念标签</h4>
                <div className="flex flex-wrap gap-2 relative">
                  {termChips.map((chip) => {
                    const isActive = currentActiveTerm === chip.id;
                    
                    return (
                      <div key={chip.id} className="relative">
                        <button
                          data-term-id={chip.id}
                          className={`px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 focus:outline-none ${
                            isActive
                              ? 'transform scale-105'
                              : 'hover:transform hover:scale-105'
                          }`}
                          style={{
                            backgroundColor: isActive ? 'var(--tech-mint)' : 'var(--bg-surface)',
                            color: isActive ? 'var(--bg-deep)' : 'var(--ink-high)',
                            border: `1px solid var(--carbon-line)`
                          }}
                          onMouseEnter={() => handleTermHover(chip.id)}
                          onMouseLeave={() => handleTermLeave()}
                          tabIndex={0}
                          aria-label={chip.label}
                        >
                          {chip.label}
                        </button>
                        
                        {/* 气泡提示 - 修复定位 */}
                        {showTooltip === chip.id && (
                          <div 
                            className="absolute z-50 px-3 py-2 text-xs rounded-lg shadow-lg animate-fade-in pointer-events-none"
                            style={{
                              backgroundColor: 'var(--tech-mint)',
                              color: 'var(--bg-deep)',
                              border: '2px solid #22d3ee',
                              boxShadow: '0 0 12px rgba(34, 211, 238, 0.6)',
                              bottom: 'calc(100% + 12px)',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              minWidth: '200px',
                              maxWidth: '500px',
                              whiteSpace: 'nowrap',
                              backdropFilter: 'blur(4px)',
                              position: 'fixed'
                            }}
                          >
                            {termTooltips[chip.id]}
                            
                            {/* 气泡箭头 */}
                            <div 
                              className="absolute"
                              style={{
                                top: '100%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 0,
                                height: 0,
                                borderLeft: '8px solid transparent',
                                borderRight: '8px solid transparent',
                                borderTop: '8px solid var(--tech-mint)'
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* 控件区域 */}
              <div className="space-y-4">
                {/* 目标函数选择 */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium" style={{ color: 'var(--ink-mid)' }}>目标函数选择</h4>
                  <div className={`p-3 rounded-lg transition-all duration-300 ${
                    currentActiveTerm === 'objective' ? 'animate-pulse' : ''
                  }`} style={{
                    backgroundColor: currentActiveTerm === 'objective' ? 'rgba(60, 230, 192, 0.1)' : 'transparent',
                    border: currentActiveTerm === 'objective' ? '1px solid rgba(60, 230, 192, 0.3)' : '1px solid transparent'
                  }}>
                    <div className="flex gap-2">
                    {[
                      { id: 'time', label: '飞行时间最短' },
                      { id: 'energy', label: '能耗最小化' },
                      { id: 'balanced', label: '平衡目标' }
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleObjectiveChange(option.id)}
                        className={`px-3 py-2 rounded-lg text-xs transition-all duration-200 ${
                          objectiveType === option.id ? 'font-medium' : ''
                        } ${currentActiveTerm === 'objective' && objectiveType === option.id ? 'animate-pulse' : ''}`}
                        style={{
                          backgroundColor: objectiveType === option.id ? 'var(--tech-mint)' : 'var(--bg-elevated)',
                          color: objectiveType === option.id ? 'var(--bg-deep)' : 'var(--ink-high)',
                          border: `1px solid ${objectiveType === option.id ? 'var(--tech-mint)' : 'var(--carbon-line)'}`
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                    </div>
                  </div>
                </div>
                
                {/* 指标面板 */}
                {showMetrics && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium" style={{ color: 'var(--ink-mid)' }}>性能指标</h4>
                    <div className="p-3 rounded-lg border space-y-2" style={{
                      backgroundColor: 'var(--bg-elevated)',
                      borderColor: 'var(--carbon-line)'
                    }}>
                      {(() => {
                        const metrics = getMetricsForObjective(objectiveType);
                        return (
                          <>
                            <div className="flex justify-between items-center text-xs">
                              <span style={{ color: 'var(--ink-mid)' }}>飞行时间</span>
                              <span className="font-mono font-medium" style={{ 
                                color: objectiveType === 'time' ? 'var(--tech-mint)' : 'var(--ink-high)' 
                              }}>
                                {metrics.time} min
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span style={{ color: 'var(--ink-mid)' }}>能耗</span>
                              <span className="font-mono font-medium" style={{ 
                                color: objectiveType === 'energy' ? 'var(--tech-mint)' : 'var(--ink-high)' 
                              }}>
                                {metrics.energy}%
                              </span>
                            </div>
                            {metrics.score !== null && (
                              <div className="flex justify-between items-center text-xs">
                                <span style={{ color: 'var(--ink-mid)' }}>平衡系数</span>
                                <span className="font-mono font-medium" style={{ 
                                  color: objectiveType === 'balanced' ? 'var(--tech-mint)' : 'var(--ink-high)' 
                                }}>
                                  {metrics.score.toFixed(2)}
                                </span>
                              </div>
                            )}
                            
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* 底部提示 */}
      <DownHint targetSection={1} />
      
      {/* 动效样式 */}
      <style jsx="true">{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, -40px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        /* 数学优化主题背景动画 */
        @keyframes math-float-enhanced {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg) scale(1); 
            opacity: 0.5; 
            filter: brightness(1);
          }
          25% { 
            transform: translateY(-20px) rotate(2.5deg) scale(1.08); 
            opacity: 0.7; 
            filter: brightness(1.15);
          }
          50% { 
            transform: translateY(-12px) rotate(-1.5deg) scale(1.04); 
            opacity: 0.8; 
            filter: brightness(1.3);
          }
          75% { 
            transform: translateY(-25px) rotate(1.5deg) scale(1.12); 
            opacity: 0.6; 
            filter: brightness(1.08);
          }
        }
        
        @keyframes contour-pulse {
          0%, 100% { 
            transform: scale(1) rotate(0deg); 
            opacity: 0.3; 
          }
          33% { 
            transform: scale(1.1) rotate(1deg); 
            opacity: 0.5; 
          }
          66% { 
            transform: scale(0.95) rotate(-1deg); 
            opacity: 0.4; 
          }
        }
        
        @keyframes search-path {
          0% { 
            stroke-dasharray: 0 2000; 
            opacity: 0.35; 
            filter: brightness(1);
          }
          30% { 
            stroke-dasharray: 600 2000; 
            opacity: 0.7; 
            filter: brightness(1.3) drop-shadow(0 0 6px currentColor);
          }
          70% { 
            stroke-dasharray: 1400 2000; 
            opacity: 0.55; 
            filter: brightness(1.15) drop-shadow(0 0 4px currentColor);
          }
          100% { 
            stroke-dasharray: 2000 2000; 
            opacity: 0.3; 
            filter: brightness(1);
          }
        }
        
        @keyframes feasible-region-pulse {
          0%, 100% { 
            transform: scale(1) rotate(0deg); 
            opacity: 0.2; 
          }
          50% { 
            transform: scale(1.02) rotate(0.5deg); 
            opacity: 0.4; 
          }
        }
        
        @keyframes convergence-indicator {
          0%, 100% { 
            transform: translateX(0px); 
            opacity: 0.6; 
          }
          50% { 
            transform: translateX(5px); 
            opacity: 1; 
          }
        }
        
        .animate-math-float-enhanced {
          animation: math-float-enhanced 10s ease-in-out infinite;
        }
        
        .animate-contour-pulse {
          animation: contour-pulse 8s ease-in-out infinite;
        }
        
        .animate-search-path {
          animation: search-path infinite linear;
        }
        
        .animate-search-particle {
          filter: drop-shadow(0 0 6px currentColor);
        }
        
        .animate-feasible-region-pulse {
          animation: feasible-region-pulse 12s ease-in-out infinite;
        }
        
        .animate-convergence-indicator {
          animation: convergence-indicator 3s ease-in-out infinite;
        }
        
        
        .floating-math-symbol {
          font-family: 'Times New Roman', serif;
          user-select: none;
          pointer-events: none;
        }
        
        /* 无障碍支持 */
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in,
          .animate-math-float-enhanced,
          .animate-contour-pulse,
          .animate-search-path,
          .animate-search-particle,
          .animate-feasible-region-pulse,
          .animate-convergence-indicator {
            animation: none !important;
          }
          
          .floating-math-symbol {
            opacity: 0.1 !important;
            transform: none !important;
          }
          
          circle[class*="animate"] {
            animation: none !important;
          }
          
          * {
            transition: none !important;
            filter: none !important;
          }
        }
      `}</style>
    </section>
  );
};

// 等式约束动画无人机组件（独立组件确保强制重置）
const EqualityAnimatedDrone = ({ pathId, resetKey }) => {
  const circleRef = useRef(null);
  
  // 每次resetKey变化时强制重启动画
  useEffect(() => {
    if (circleRef.current) {
      
      // 获取所有动画元素
      const animations = circleRef.current.querySelectorAll('animateMotion, animate');
      
      // 停止并重启所有动画
      animations.forEach(anim => {
        try {
          anim.endElement(); // 停止动画
          setTimeout(() => {
            anim.beginElement(); // 重新开始动画
          }, 10);
        } catch (error) {
        }
      });
    }
  }, [resetKey]);
  
  return (
    <circle 
      ref={circleRef}
      r="3" 
      fill="var(--tech-mint)" 
      stroke="none" 
      filter="url(#mintGlow)"
    >
      <animateMotion dur="5s" repeatCount="indefinite" calcMode="linear">
        <mpath href={`#${pathId}`} />
      </animateMotion>
      <animate attributeName="r" values="3;5;3" dur="0.6s" repeatCount="indefinite" />
    </circle>
  );
};

// 可行域动画无人机组件
const FeasibleRegionAnimatedDrone = ({ pathId, color, duration, resetKey, index }) => {
  const circleRef = useRef(null);
  
  useEffect(() => {
    if (circleRef.current) {
      
      const animations = circleRef.current.querySelectorAll('animateMotion, animate');
      animations.forEach(anim => {
        try {
          anim.endElement();
          setTimeout(() => {
            anim.beginElement();
          }, 10);
        } catch (error) {
        }
      });
    }
  }, [resetKey]);
  
  return (
    <circle 
      ref={circleRef}
      r="3" 
      fill={color} 
      stroke="white" 
      strokeWidth="1" 
      opacity="0.8"
    >
      <animateMotion dur={duration} repeatCount="indefinite" calcMode="linear">
        <mpath href={`#${pathId}`} />
      </animateMotion>
      <animate attributeName="r" values="3;5;3" dur="0.8s" repeatCount="indefinite" />
    </circle>
  );
};

// 可行解动画无人机组件
const FeasibleSolutionAnimatedDrone = ({ pathId, resetKey }) => {
  const circleRef = useRef(null);
  
  useEffect(() => {
    if (circleRef.current) {
      
      const animations = circleRef.current.querySelectorAll('animateMotion, animate');
      animations.forEach(anim => {
        try {
          anim.endElement();
          setTimeout(() => {
            anim.beginElement();
          }, 10);
        } catch (error) {
        }
      });
    }
  }, [resetKey]);
  
  return (
    <circle 
      ref={circleRef}
      r="4" 
      fill="var(--amber-signal)" 
      stroke="white" 
      strokeWidth="1"
      filter="url(#amberGlow)"
    >
      <animateMotion dur="2s" repeatCount="indefinite" calcMode="linear">
        <mpath href={`#${pathId}`} />
      </animateMotion>
      <animate attributeName="r" values="4;6;4" dur="0.6s" repeatCount="indefinite" />
    </circle>
  );
};

// 最优解动画无人机组件 - 显示emoji但模仿可行解的路径跟踪实现
const OptimalSolutionAnimatedDrone = ({ pathId, resetKey, objectiveType }) => {
  const droneRef = useRef(null);
  
  // 根据目标函数类型调整动画时长
  const getAnimationDuration = () => {
    switch (objectiveType) {
      case 'time':
        return '3.06s'; // 最短时间：4.375s × 70% = 3.06秒
      case 'energy':
        return '3.97s'; // 最优能耗：5.67s × 70% = 3.97秒
      case 'balanced':
        return '3.43s'; // 平衡模式：4.9s × 70% = 3.43秒
      default:
        return '3.43s';
    }
  };
  
  useEffect(() => {
    if (droneRef.current) {
      
      const animations = droneRef.current.querySelectorAll('animateMotion, animate');
      animations.forEach(anim => {
        try {
          anim.endElement();
          setTimeout(() => {
            anim.beginElement();
          }, 10);
        } catch (error) {
        }
      });
    }
  }, [resetKey]);
  
  return (
    <text 
      ref={droneRef}
      fontSize="16" 
      textAnchor="middle" 
      dominantBaseline="middle"
    >
      🚁
      <animateMotion dur={getAnimationDuration()} repeatCount="indefinite" calcMode="linear">
        <mpath href={`#${pathId}`} />
      </animateMotion>
    </text>
  );
};

// UAV 场景图组件
const UavSceneSvg = ({ currentActiveTerm, objectiveType, constraintStates, animationResetKey }) => {
  // 三种目标的最优路径数据（A到B再返回A，避开禁飞区）
  const getOptimalPath = () => {
    switch (objectiveType) {
      case 'time':
        return "M 50 250 L 172.5 118.9 L 350 50 L 172.5 118.9 L 50 250"; // 时间最短：A→E→B→E→A，E为两条切线的交点
      case 'energy':
        return "M 50 250 Q 100 230, 120 200 Q 140 170, 160 130 Q 200 90, 270 70 Q 310 60, 350 50 Q 310 60, 270 70 Q 200 90, 160 130 Q 140 170, 120 200 Q 100 230, 50 250"; // 能耗最小：圆滑曲线，避免急转弯
      case 'balanced':
        return "M 50 250 Q 80 230, 110 200 Q 130 180, 150 140 Q 180 100, 230 80 Q 290 65, 350 50 Q 290 65, 230 80 Q 180 100, 150 140 Q 130 180, 110 200 Q 80 230, 50 250"; // 平衡目标：确保完全绕开缓冲区圆形
      default:
        return "M 50 250 Q 120 220, 150 200 Q 180 130, 280 80 Q 320 65, 350 50 Q 320 65, 280 80 Q 180 130, 150 200 Q 120 220, 50 250";
    }
  };
  
  // 可行路径集合（用于可行域展示，都是A到B再返回的路径，完全绕开缓冲区）
  const getFeasiblePaths = () => {
    return [
      // 左上路径1 - 最外层绕行
      "M 50 250 Q 60 200, 80 150 Q 100 100, 130 80 Q 160 60, 200 55 Q 250 50, 300 52 Q 330 55, 350 50 Q 330 55, 300 52 Q 250 50, 200 55 Q 160 60, 130 80 Q 100 100, 80 150 Q 60 200, 50 250",
      
      // 左上路径2 - 中层绕行
      "M 50 250 Q 70 210, 90 170 Q 110 120, 140 95 Q 170 75, 200 70 Q 240 65, 280 68 Q 320 72, 350 50 Q 320 72, 280 68 Q 240 65, 200 70 Q 170 75, 140 95 Q 110 120, 90 170 Q 70 210, 50 250",
      
      // 左上路径3 - 内层绕行
      "M 50 250 Q 80 220, 100 180 Q 120 140, 145 110 Q 175 85, 200 80 Q 225 75, 260 78 Q 300 82, 350 50 Q 300 82, 260 78 Q 225 75, 200 80 Q 175 85, 145 110 Q 120 140, 100 180 Q 80 220, 50 250",
      
      // 右下路径1 - 最外层绕行
      "M 50 250 Q 120 260, 180 270 Q 240 275, 290 270 Q 330 260, 360 240 Q 380 220, 390 190 Q 380 150, 370 120 Q 360 90, 350 50 Q 360 90, 370 120 Q 380 150, 390 190 Q 380 220, 360 240 Q 330 260, 290 270 Q 240 275, 180 270 Q 120 260, 50 250",
      
      // 右下路径2 - 中外层绕行
      "M 50 250 Q 110 255, 170 260 Q 220 265, 260 260 Q 300 250, 330 230 Q 360 210, 370 180 Q 375 150, 365 120 Q 358 95, 350 50 Q 358 95, 365 120 Q 375 150, 370 180 Q 360 210, 330 230 Q 300 250, 260 260 Q 220 265, 170 260 Q 110 255, 50 250",
      
      // 右下路径3 - 中层绕行
      "M 50 250 Q 100 252, 150 255 Q 200 258, 240 255 Q 280 245, 310 225 Q 340 200, 350 175 Q 360 150, 355 125 Q 352 100, 350 50 Q 352 100, 355 125 Q 360 150, 350 175 Q 340 200, 310 225 Q 280 245, 240 255 Q 200 258, 150 255 Q 100 252, 50 250",
      
      // 右下路径4 - 内层绕行
      "M 50 250 Q 90 250, 140 252 Q 190 254, 230 250 Q 270 240, 300 220 Q 325 195, 335 170 Q 345 145, 340 120 Q 345 95, 350 50 Q 345 95, 340 120 Q 345 145, 335 170 Q 325 195, 300 220 Q 270 240, 230 250 Q 190 254, 140 252 Q 90 250, 50 250"
    ];
  };
  
  // 获取不同目标函数对应的路径颜色
  const getPathColor = () => {
    switch (objectiveType) {
      case 'time':
        return '#eab308'; // 黄色 (yellow-500)
      case 'energy': 
        return '#22c55e'; // 绿色 (green-500)
      case 'balanced':
        return '#3b82f6'; // 蓝色 (blue-500) 
      default:
        return 'var(--tech-mint)';
    }
  };
  
  // 获取决策变量的航点（沿当前最优路径均匀分布9个点）
  const getDecisionVariableWaypoints = () => {
    // 根据当前目标函数类型返回对应路径上的9个严格在路径上的点
    switch (objectiveType) {
      case 'time':
        // 时间最短：A(50,250) → E(172.5,118.9) → B(350,50) 折线路径
        // A、AE线段3个点、E、EB线段3个点、B点，总共9个点
        const A = {x: 50, y: 250};
        const E = {x: 172.5, y: 118.9};
        const B = {x: 350, y: 50};
        
        return [
          { x: A.x, y: A.y, rotation: 33 },  // A点
          // AE线段上的3个插值点（1/4, 2/4, 3/4位置），AE段实际方向角约为 43°
          { x: A.x + (E.x - A.x) * 0.25, y: A.y + (E.y - A.y) * 0.25, rotation: 33 },  // AE 1/4
          { x: A.x + (E.x - A.x) * 0.5, y: A.y + (E.y - A.y) * 0.5, rotation: 33 },    // AE 1/2  
          { x: A.x + (E.x - A.x) * 0.75, y: A.y + (E.y - A.y) * 0.75, rotation: 33 },  // AE 3/4
          // E转向点
          { x: E.x, y: E.y, rotation: 69 },   // E点转向，朝向B点
          // EB线段上的3个插值点（1/4, 2/4, 3/4位置），BE段实际方向角约为 69°
          { x: E.x + (B.x - E.x) * 0.25, y: E.y + (B.y - E.y) * 0.25, rotation: 59 },   // EB 1/4
          { x: E.x + (B.x - E.x) * 0.5, y: E.y + (B.y - E.y) * 0.5, rotation: 59 },     // EB 1/2
          { x: E.x + (B.x - E.x) * 0.75, y: E.y + (B.y - E.y) * 0.75, rotation: 59 },    // EB 3/4
          { x: B.x, y: B.y, rotation: 69 }    // B点
        ];
      case 'energy':
        // 能耗最小：贝塞尔曲线路径上的点
        // 基于路径 "M 50 250 Q 100 230, 120 200 Q 140 170, 160 130 Q 200 90, 270 70 Q 310 60, 350 50"
        // 将整条曲线分为7个均匀分布的点
        return [
          { x: 50, y: 250, rotation: 33 },      // A点
          { x: 84, y: 235, rotation: 35 },      // t=1/7处的曲线点
          { x: 113, y: 211, rotation: 25 },     // t=2/7处的曲线点
          { x: 139, y: 171, rotation: 28 },     // t=3/7处的曲线点
          { x: 167, y: 125, rotation: 40 },     // t=4/7处的曲线点（中点）
          { x: 211, y: 93, rotation: 52 },      // t=5/7处的曲线点
          { x: 256, y: 76, rotation: 55 },      // t=6/7处的曲线点
          { x: 305, y: 62, rotation: 65 },      // t=7/7处的曲线点（接近B点）
          { x: 350, y: 50, rotation: 69 }       // B点
        ];
      case 'balanced':
        // 平衡目标：适度弯曲路径上的点
        // 基于路径 "M 50 250 Q 80 230, 110 200 Q 130 180, 150 140 Q 180 100, 230 80 Q 290 65, 350 50"
        return [
          { x: 50, y: 250, rotation: 25 },        // A点
          { x: 82, y: 228, rotation: 32 },        // t=1/7处的曲线点
          { x: 113, y: 199, rotation: 35 },       // t=2/7处的曲线点
          { x: 141, y: 158, rotation: 30 },       // t=3/7处的曲线点
          { x: 166, y: 123, rotation: 40 },       // t=4/7处的曲线点（中点）
          { x: 208, y: 91, rotation: 65 },       // t=5/7处的曲线点
          { x: 253, y: 73, rotation: 70 },       // t=6/7处的曲线点
          { x: 300, y: 62, rotation: 72 },        // t=7/7处的曲线点（接近B点）
          { x: 350, y: 50, rotation: 73 }          // B点
        ];
      default:
        return [];
    }
  };

  // 约束始终存在，不可行路径仅在特定标签演示时显示
  const shouldShowInfeasibleRoutes = () => {
    return false; // 约束恒为ON，不可行路径仅用于教学演示
  };

  return (
    <svg viewBox="0 0 400 300" className="w-full h-64">
      {/* 背景网格 */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(60, 230, 192, 0.1)" strokeWidth="1"/>
        </pattern>
        {/* 发光滤镜 */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/> 
          </feMerge>
        </filter>
      </defs>
      <rect width="400" height="300" fill="url(#grid)" />
      
      {/* 飞行走廊 (定义域) */}
      {currentActiveTerm === 'domain' && (
        <rect x="20" y="20" width="360" height="260" 
              fill="rgba(34, 197, 94, 0.1)" 
              stroke="rgba(34, 197, 94, 0.5)" 
              strokeWidth="2" 
              strokeDasharray="10,5"
              className="animate-pulse" />
      )}
      
      {/* 目标点B */}
      <g className={currentActiveTerm === 'objective' ? 'animate-pulse' : ''}>
        <circle cx="350" cy="50" r="15" 
                fill={currentActiveTerm === 'objective' ? "rgba(59, 130, 246, 0.6)" : "rgba(59, 130, 246, 0.4)"} 
                stroke={currentActiveTerm === 'objective' ? "rgb(59, 130, 246)" : "rgba(59, 130, 246, 0.7)"} 
                strokeWidth={currentActiveTerm === 'objective' ? "3" : "2"}
                className="transition-all duration-200" />
        <text x="379" y="55" textAnchor="middle" fill="rgb(59, 130, 246)" fontSize="13" fontWeight="bold">B点</text>
        <text x="352" y="82" textAnchor="middle" fill="rgb(59, 130, 246)" fontSize="13">拍摄任务</text>
      </g>
      
      {/* 起点A（HOME基站） */}
      <g className={currentActiveTerm === 'equality' ? 'animate-pulse' : ''}>
        <circle cx="50" cy="250" r="12" 
                fill={currentActiveTerm === 'equality' ? 'var(--amber-signal)' : 'var(--tech-mint)'} 
                stroke="white" strokeWidth="2" />
        <text x="22" y="255" textAnchor="middle" fill="var(--tech-mint)" fontSize="13" fontWeight="bold">A点</text>
        <text x="50" y="278" textAnchor="middle" fill="var(--tech-mint)" fontSize="13">基站</text>
      </g>
      
      {/* 禁飞区（同心圆设计） */}
      <g className={currentActiveTerm === 'inequality' ? 'animate-pulse' : ''}>
        {/* 外圈：缓冲区 */}
        <circle cx="200" cy="160" r="50" 
                fill="none"
                stroke={currentActiveTerm === 'inequality' ? "rgba(255, 193, 7, 0.8)" : "rgba(255, 193, 7, 0.5)"} 
                strokeWidth={currentActiveTerm === 'inequality' ? "2" : "1"}
                strokeDasharray="8,4" />
        
        {/* 内圈：核心禁飞区 */}
        <circle cx="200" cy="160" r="30" 
                fill={currentActiveTerm === 'inequality' ? "rgba(239, 68, 68, 0.6)" : "rgba(239, 68, 68, 0.4)"} 
                stroke={currentActiveTerm === 'inequality' ? "rgb(239, 68, 68)" : "rgba(239, 68, 68, 0.7)"} 
                strokeWidth={currentActiveTerm === 'inequality' ? "3" : "2"} />
        
        <text x="200" y="165" textAnchor="middle" fill="rgb(239, 68, 68)" fontSize="13" fontWeight="bold">禁飞区</text>
        
        
        {/* 不等式约束动画：距离约束说明 */}
        {currentActiveTerm === 'inequality' && (
          <g>
            {/* 缓冲区内的标记点 */}
            <circle cx="224" cy="192" r="4" 
                    fill="var(--amber-signal)" 
                    stroke="white" 
                    strokeWidth="2" 
                    className="animate-pulse" />
            
            {/* 双折线引导线（虚线） */}
            <polyline points="224,192 245,217 280,217" 
                      fill="none" 
                      stroke="rgba(156, 163, 175, 0.8)" 
                      strokeWidth="1.5" 
                      strokeDasharray="3,3"
                      strokeLinecap="round" />
            
            {/* 距离约束文字（无背景框，灰色文字） */}
            <text x="285" y="222" 
                  fontSize="16" 
                  fill="rgb(156, 163, 175)" 
                  fontWeight="normal">
              离禁飞区距离≥△r
            </text>
          </g>
        )}
      </g>
      
      {/* 电池/能耗指标（左上方） */}
      <g className={currentActiveTerm === 'objective' ? 'animate-pulse' : ''}>
        {/* 电池外框 - 放大1.46倍 (1.33*1.1)，使用更明显的灰色表示已消耗部分 */}
        <rect x="18" y="28" width="44" height="26" rx="4" 
              fill={currentActiveTerm === 'objective' ? 'var(--amber-signal)' : 'rgba(100, 116, 139, 0.6)'} 
              stroke={currentActiveTerm === 'objective' ? 'var(--amber-signal)' : 'var(--carbon-line)'} 
              strokeWidth="1" />
        {/* 电池正极 - 放大1.46倍，调整位置和大小使其更明显 */}
        <rect x="62" y="37" width="5" height="10" rx="1" 
              fill={currentActiveTerm === 'objective' ? 'var(--amber-signal)' : 'rgba(100, 116, 139, 0.6)'} 
              stroke={currentActiveTerm === 'objective' ? 'none' : 'rgba(148, 163, 184, 0.7)'} 
              strokeWidth="0.5" />
        
        {/* 电池电量 - 放大1.46倍 */}
        <rect x="21" y="31" width={
          objectiveType === 'energy' ? '35' : // 能耗最小：高电量 (80%) - 24*1.46≈35
          objectiveType === 'time' ? '22' : // 时间最短：中等电量 (50%) - 15*1.46≈22
          '30' // 平衡目标：中上电量 (67%) - 20*1.46≈30
        } height="20" rx="3" 
              fill={
                objectiveType === 'energy' ? 'rgb(34, 197, 94)' : // 绿色：节能
                objectiveType === 'time' ? 'rgb(255, 193, 7)' : // 黄色：快速消耗
                'rgb(59, 130, 246)' // 蓝色：平衡
              } />
        
        {/* 下方指标文字 */}
        <text x="42" y="70" textAnchor="middle" fontSize="12" fill="var(--ink-mid)">
          {objectiveType === 'time' ? '时间优先' : objectiveType === 'energy' ? '续航优先' : '平衡模式'}
        </text>
      </g>
      
      {/* 可行域走廊层 - 颜色渐变路径和无人机动画 */}
      {currentActiveTerm === 'feasible-region' && (
        <g key={`feasible-region-container-${animationResetKey}`}>
          {getFeasiblePaths().map((path, index) => {
            // 从左到右的颜色渐变：紫色 -> 蓝色 -> 青色 -> 绿色 -> 黄色 -> 橙色 -> 红色
            const colors = [
              '#8b5cf6', // 紫色
              '#3b82f6', // 蓝色  
              '#06b6d4', // 青色
              '#10b981', // 绿色
              '#f59e0b', // 黄色
              '#f97316', // 橙色
              '#ef4444'  // 红色
            ];
            const pathColor = colors[index];
            const pathId = `feasible-path-${index}-${animationResetKey}`;
            
            // 根据路径复杂度估算相对长度，调整动画时间保持速度一致
            // 左侧路径0-2：外侧最长，内侧最短；右侧路径3-6：外侧最长，内侧最短
            const pathLengths = [1.2, 1.1, 1.0, 1.5, 1.4, 1.31, 1.22]; // 相对长度系数
            const baseSpeed = 4; // 基础速度（秒）
            const animationDuration = `${baseSpeed * pathLengths[index]}s`;
            
            return (
              <g key={`feasible-path-${index}-${animationResetKey}`}>
                {/* 路径线条 */}
                <path
                  id={pathId}
                  d={path}
                  fill="none"
                  stroke={pathColor}
                  strokeWidth="2.5"
                  opacity="0.4"
                  className="animate-pulse"
                  style={{ animationDelay: `${index * 100}ms` }}
                />
                
                {/* 无人机动画 - 相同速度，不同时间 */}
                <FeasibleRegionAnimatedDrone
                  pathId={pathId}
                  color={pathColor}
                  duration={animationDuration}
                  resetKey={animationResetKey}
                  index={index}
                />
              </g>
            );
          })}
        </g>
      )}
      
      {/* 演示用不可行路径（仅在特定标签时显示） */}
      {currentActiveTerm === 'inequality' && (
        <g className="animate-pulse">
          {/* 移除了穿越禁飞区的红色演示路径，保持界面简洁 */}
        </g>
      )}
      
      {currentActiveTerm === 'equality' && (
        <g className="animate-pulse">
          {/* 移除了未返回起点的红色演示路径，保持界面简洁 */}
        </g>
      )}
      
      {/* 可行解示例 */}
      {currentActiveTerm === 'feasible-solution' && (
        <g key={`feasible-solution-container-${animationResetKey}`}>
          <path d={getFeasiblePaths()[0]} 
                fill="none" 
                stroke="var(--amber-signal)" 
                strokeWidth="4"
                filter="url(#glow)"
                className="animate-pulse"
                id={`feasible-solution-path-${animationResetKey}`} />
          
          {/* 可行解无人机动画 - 改为圆点风格 */}
          <FeasibleSolutionAnimatedDrone
            pathId={`feasible-solution-path-${animationResetKey}`}
            resetKey={animationResetKey}
          />
          
          <text x="41" y="140" fontSize="14" fill="var(--amber-signal)" fontWeight="bold">可行解（非最优）</text>
          
          {/* 琥珀色发光滤镜 */}
          <defs>
            <filter id="amberGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </g>
      )}
      
      {/* 最优航线 */}
      <g>
        <path 
          d={getOptimalPath()} 
          fill="none" 
          stroke={getPathColor()} 
          strokeWidth={currentActiveTerm === 'optimal-solution' ? '6' : '3'}
          filter={currentActiveTerm === 'optimal-solution' ? 'url(#glow)' : 'none'}
          className="transition-all duration-300"
          id={`optimal-path-main-${animationResetKey}`}
        />
        
        
        
        {/* 最优值显示 */}
        {currentActiveTerm === 'optimal-solution' && (
          <g>
            {/* 更深的灰色圆角矩形背景，75%透明度 */}
            <rect x="130" y="235" width="144" height="26" rx="12"
                  fill="rgba(55, 65, 81, 0.75)" 
                  stroke="rgba(31, 41, 55, 0.6)"
                  strokeWidth="1" />
            {/* 文字内容 */}
            <text x="202" y="253" textAnchor="middle" fontSize="13" 
              fill="rgba(191, 192, 193, 0.75)">
              f(x*) = {objectiveType === 'time' ? '最短时间' : 
                       objectiveType === 'energy' ? '最小能耗' : '最优平衡'}
            </text>
          </g>
        )}
        
        {/* 无人机emoji动画（当悬浮最优解标签时） - 完全模仿可行解实现 */}
        {currentActiveTerm === 'optimal-solution' && (
          <g key={`optimal-solution-container-${animationResetKey}`}>
            <path d={getOptimalPath()} 
                  fill="none" 
                  stroke="transparent" 
                  strokeWidth="4"
                  id={`optimal-solution-path-${animationResetKey}`} />
            
            {/* 最优解无人机动画 - 使用emoji */}
            <OptimalSolutionAnimatedDrone
              pathId={`optimal-solution-path-${animationResetKey}`}
              resetKey={animationResetKey}
              objectiveType={objectiveType}
            />
          </g>
        )}
      </g>
      
      {/* 航点标记 (决策变量) */}
      {currentActiveTerm === 'decision-var' && (
        <g>
          {getDecisionVariableWaypoints().map((waypoint, i) => (
            <g key={i} className="animate-pulse" style={{ animationDelay: `${i * 200}ms` }}>
              {/* 航点圆圈 */}
              <circle cx={waypoint.x} cy={waypoint.y} r="8" 
                      fill="var(--amber-signal)" 
                      stroke="white" 
                      strokeWidth="2" />
              
              {/* 姿态箭头 */}
              <g transform={`translate(${waypoint.x}, ${waypoint.y}) rotate(${waypoint.rotation})`}>
                <path d="M -3,-8 L 0,-12 L 3,-8" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="2" 
                      strokeLinecap="round" />
              </g>
              
            </g>
          ))}
        </g>
      )}
      
      {/* 可行域高亮 */}
      {currentActiveTerm === 'feasible-region' && (
        <rect x="0" y="0" width="400" height="300" fill="rgba(60, 230, 192, 0.15)" />
      )}
      
      {/* 等式约束：A→B→A闭合路径动画 */}
      {currentActiveTerm === 'equality' && (
        <g key={`equality-container-${animationResetKey}`}>
          {/* A到B的红色虚线圆弧（左上方绕行） */}
          <path d="M 50 250 Q 80 180, 120 120 Q 160 80, 220 60 Q 280 50, 350 50" 
                fill="none" 
                stroke="red" 
                strokeWidth="2.5" 
                strokeDasharray="6,4"
                markerEnd="url(#redArrow)"
                id={`equality-path-ab-${animationResetKey}`} />
          
          {/* B到A的黄色虚线圆弧（右下方绕行） */}
          <path d="M 350 50 Q 320 120, 280 180 Q 240 220, 180 240 Q 120 250, 50 250" 
                fill="none" 
                stroke="#fbbf24" 
                strokeWidth="2.5" 
                strokeDasharray="6,4"
                markerEnd="url(#yellowArrow)"
                id={`equality-path-ba-${animationResetKey}`} />
          
          {/* 连续闭合路径：A→B→A */}
          <path d="M 50 250 Q 80 180, 120 120 Q 160 80, 220 60 Q 280 50, 350 50 Q 320 120, 280 180 Q 240 220, 180 240 Q 120 250, 50 250"
                fill="none" 
                stroke="transparent"
                id={`equality-complete-path-${animationResetKey}`} />
          
          {/* 薄荷绿发光点沿完整闭合路径动画 - 强制重新创建 */}
          <EqualityAnimatedDrone 
            pathId={`equality-complete-path-${animationResetKey}`}
            resetKey={animationResetKey}
          />
          
          {/* 定义箭头标记和发光滤镜 */}
          <defs>
            <marker id="redArrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="red" />
            </marker>
            <marker id="yellowArrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#fbbf24" />
            </marker>
            <filter id="mintGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </g>
      )}
    </svg>
  );
};

// DownHint 组件
const DownHint = ({ targetSection, text = '向下滚动继续' }) => {
  const handleClick = () => {
    // 获取snap容器
    const snapContainer = document.getElementById('snap-container');
    if (snapContainer) {
      // 计算目标位置（每个section是100vh）
      const targetY = targetSection * window.innerHeight;
      snapContainer.scrollTo({
        top: targetY,
        behavior: 'smooth'
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      className="absolute bottom-8 left-1/2 flex flex-col items-center gap-2 
                 transition-colors duration-300 group z-50"
      style={{
        transform: 'translateX(-50%)',
        color: 'var(--ink-mid)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--tech-mint)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--ink-mid)';
      }}
      aria-label={text}
    >
      <span className="text-sm">{text}</span>
      <svg 
        className="w-6 h-6 animate-bounce"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5}
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
    </button>
  );
};

export const meta = {
  id: 1,
  title: '基本概念',
  summary: '定义/术语/无人机任务对照',
  anchor: 'concept-1',
};

export default Section1Definition;