import React, { useState, useRef, useEffect } from 'react';
import 'katex/dist/katex.min.css';
import DownHint from '../home/DownHint';

const Section4Surveying = ({ id }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [animationStage, setAnimationStage] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(0);

  // 动画时序配置 - 可手动调整每一栏的开始和结束时间
  const animationConfig = {
    'state-estimation': {
      stage1: { start: 200, end: 800 },   // 问题本质
      stage2: { start: 850, end: 1700 },  // 应用场景  
      stage3: { start: 1750, end: 2600 }, // 特征矩阵
      stage4: { start: 2650, end: 3400 }  // 学习路线
    },
    'constrained-convex': {
      stage1: { start: 200, end: 850 },
      stage2: { start: 850, end: 1500 },
      stage3: { start: 1550, end: 2200 },
      stage4: { start: 2250, end: 2800 }
    },
    'combinatorial': {
      stage1: { start: 200, end: 800 },
      stage2: { start: 850, end: 1900 },  // 更多应用场景，需要更长时间
      stage3: { start: 1950, end: 2600 },
      stage4: { start: 2650, end: 3200 }
    },
    'image-raster': {
      stage1: { start: 200, end: 800 },
      stage2: { start: 850, end: 1500 },
      stage3: { start: 1550, end: 2200 },
      stage4: { start: 2250, end: 2800 }
    },
    'data-driven': {
      stage1: { start: 200, end: 800 },
      stage2: { start: 850, end: 1700 },  // 更多应用场景
      stage3: { start: 1750, end: 2400 },
      stage4: { start: 2450, end: 3200 }
    },
    'pde-physics': {
      stage1: { start: 200, end: 800 },
      stage2: { start: 850, end: 1700 },  // 更多应用场景
      stage3: { start: 1750, end: 2400 },
      stage4: { start: 2450, end: 3200 }
    }
  };

  // 处理卡片点击
  const handleCardClick = (cardId) => {
    if (selectedCard === cardId) {
      setSelectedCard(null);
      setAnimationStage(0);
    } else {
      // 重置动画状态
      setAnimationStage(0);
      setSelectedCard(cardId);
      
      // 强制重新渲染后再开始动画
      requestAnimationFrame(() => {
        const config = animationConfig[cardId] || animationConfig['state-estimation'];
        
        setTimeout(() => setAnimationStage(1), config.stage1.start);
        setTimeout(() => setAnimationStage(2), config.stage2.start);
        setTimeout(() => setAnimationStage(3), config.stage3.start);
        setTimeout(() => setAnimationStage(4), config.stage4.start);
      });
    }
  };

  // 六大类优化问题数据
  const problems = [
    {
      id: 'state-estimation',
      position: { angle: 0 }, // 12点钟方向
      icon: '🎯',
      title: '状态估计与几何优化',
      coreIdentity: '动态状态估计和几何关系恢复的核心问题',
      features: [
        { type: '变量类型', label: '连续变量', detail: '位姿、三维点、传感器状态', color: 'bg-blue-500' },
        { type: '目标结构', label: '非线性最小二乘', detail: 'NLLS', color: 'bg-green-500' },
        { type: '规模结构', label: '大规模稀疏矩阵', detail: '结构化稀疏', color: 'bg-purple-500' },
        { type: '方法', label: 'LM算法', detail: '稀疏分解、流形优化', color: 'bg-red-500' },
        { type: '动态扩展', label: '递推状态估计', detail: 'KF/EKF/UKF、PF', color: 'bg-orange-500' }
      ],
      modelingConclusion: '本质是一个大规模稀疏的非线性最小二乘优化问题，在动态环境下扩展为递推状态估计。',
      applications: [
        { 
          domain: '测绘经典', 
          scenarios: ['控制网平差', '自由网平差', '空中三角测量', '导线网优化'], 
          description: '经典测绘中的基础理论与实践' 
        },
        { 
          domain: '现代遥感', 
          scenarios: ['影像匹配', '立体重建', '传感器标定', '几何纠正'], 
          description: '影像处理与几何重建的核心技术' 
        },
        { 
          domain: '智能测绘', 
          scenarios: ['SLAM定位', '视觉里程计', '激光点云配准', '多传感器融合', 'AR/VR定位', '自动驾驶定位'], 
          description: '人工智能与测绘融合的前沿应用' 
        }
      ],
      learningPath: {
        foundation: '非线性最小二乘理论',
        intermediate: '稀疏矩阵分解、流形优化', 
        advanced: '鲁棒估计、动态滤波',
        application: 'SLAM算法实现、多传感器融合'
      },
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'constrained-convex',
      position: { angle: 60 }, // 2点钟方向
      icon: '⚖️',
      title: '约束与凸优化',
      coreIdentity: '在几何与物理约束下的高精度解算问题',
      features: [
        { type: '变量类型', label: '连续变量', detail: '控制点、定向参数', color: 'bg-blue-500' },
        { type: '目标结构', label: '二次规划', detail: 'QP', color: 'bg-green-500' },
        { type: '约束结构', label: '复杂约束', detail: '二次约束二次规划(QCQP)、二阶锥规划(SOCP)', color: 'bg-yellow-500' },
        { type: '方法', label: '现代凸优化', detail: '内点法、增广拉格朗日', color: 'bg-red-500' }
      ],
      modelingConclusion: '本质是一个以QP为基础，通过QCQP或SOCP刻画复杂约束的凸优化问题，高效解算依赖现代凸优化方法。',
      applications: [
        { domain: '测绘经典', scenarios: ['控制网平差', '约束平差', '导线测量'], description: '约束条件下的精密测量' },
        { domain: '现代遥感', scenarios: ['形变监测', '物理约束建模'], description: '复杂约束的高精度解算' }
      ],
      learningPath: {
        foundation: '有约束优化理论',
        intermediate: '二次规划方法', 
        advanced: 'QCQP与SOCP技术',
        application: '控制网平差解算'
      },
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'combinatorial',
      position: { angle: 120 }, // 4点钟方向
      icon: '🗺️',
      title: '组合优化与空间决策',
      coreIdentity: '空间资源配置与路径规划中的运筹学问题',
      features: [
        { type: '变量类型', label: '离散变量', detail: '布尔、整数、排列', color: 'bg-blue-500' },
        { type: '目标结构', label: '组合优化', detail: 'TSP、MST、最短路径', color: 'bg-green-500' },
        { type: '约束结构', label: '复杂约束', detail: '资源、时间、空间约束', color: 'bg-yellow-500' },
        { type: '方法', label: '启发式算法', detail: 'GA、SA、PSO、ACO', color: 'bg-red-500' }
      ],
      modelingConclusion: '本质是一个在复杂约束下的组合优化问题，需要启发式算法求解近似最优解。',
      applications: [
        { 
          domain: '测绘经典', 
          scenarios: ['控制点选址', '测站网优化', '测量路径规划', '观测计划编制'], 
          description: '经典测量中的空间布局与路径优化' 
        },
        {
          domain: '现代遥感',
          scenarios: ['无人机航迹规划', '传感器网络布设', '卫星任务调度', '观测资源调度'],
          description: '遥感平台的空间资源优化配置'
        },
        { 
          domain: 'GIS应用', 
          scenarios: ['设施选址', '土地利用优化', '交通网络设计', '物流配送优化', '应急设施布局', '生态廊道规划'], 
          description: 'GIS中的空间决策支持、优化分析和空间配置优化' 
        }
      ],
      learningPath: {
        foundation: '组合优化理论',
        intermediate: '启发式算法', 
        advanced: '智能优化方法',
        application: '带约束的路径规划'
      },
      gradient: 'from-green-500 to-teal-500'
    },
    {
      id: 'image-raster',
      position: { angle: 180 }, // 6点钟方向
      icon: '🖼️',
      title: '图像与栅格优化',
      coreIdentity: '影像处理与栅格数据中的空间优化问题',
      features: [
        { type: '变量类型', label: '像素变量', detail: '灰度、RGB、光谱', color: 'bg-blue-500' },
        { type: '目标结构', label: '能量最小化', detail: '马尔可夫随机场', color: 'bg-green-500' },
        { type: '约束结构', label: '空间约束', detail: '邻域、连续性约束', color: 'bg-yellow-500' },
        { type: '方法', label: '图割算法', detail: 'Graph Cut、Belief Propagation', color: 'bg-red-500' }
      ],
      modelingConclusion: '本质是一个在空间约束下的能量最小化问题，通过图论方法求解全局最优。',
      applications: [
        { domain: '图像处理', scenarios: ['影像分割', '边界提取'], description: '传统影像处理技术' },
        { domain: '现代遥感', scenarios: ['地物分类', '变化检测', '影像镶嵌'], description: '智能影像分析方法' }
      ],
      learningPath: {
        foundation: '能量最小化理论',
        intermediate: '图论优化方法', 
        advanced: '深度学习优化',
        application: '影像分析与地物识别'
      },
      gradient: 'from-pink-500 to-red-500'
    },
    {
      id: 'data-driven',
      position: { angle: 240 }, // 8点钟方向
      icon: '🧠',
      title: '数据驱动与机器学习',
      coreIdentity: '基于数据驱动的模式识别与预测优化问题',
      features: [
        { type: '变量类型', label: '权重参数', detail: '神经网络权重、核参数', color: 'bg-blue-500' },
        { type: '目标结构', label: '损失最小化', detail: '经验风险最小化', color: 'bg-green-500' },
        { type: '约束结构', label: '正则化约束', detail: 'L1、L2、弹性网约束', color: 'bg-yellow-500' },
        { type: '方法', label: '梯度优化', detail: 'SGD、Adam、RMSprop', color: 'bg-red-500' }
      ],
      modelingConclusion: '本质是一个在正则化约束下的经验风险最小化问题，通过梯度优化方法训练模型。',
      applications: [
        { domain: '测绘经典', scenarios: ['数据拟合', '参数估计'], description: '经典数据分析方法' },
        { domain: '现代遥感', scenarios: ['深度学习', '模式识别'], description: '人工智能技术应用' }
      ],
      learningPath: {
        foundation: '机器学习理论',
        intermediate: '深度学习方法', 
        advanced: '优化理论与算法',
        application: '影像目标识别与分类'
      },
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      id: 'pde-physics',
      position: { angle: 300 }, // 10点钟方向
      icon: '⚡',
      title: 'PDE约束与物理场优化',
      coreIdentity: '偏微分方程约束下的物理场重建与优化问题',
      features: [
        { type: '变量类型', label: '场变量', detail: '势场、流场、温度场', color: 'bg-blue-500' },
        { type: '目标结构', label: '变分问题', detail: '能量泛函最小化', color: 'bg-green-500' },
        { type: '约束结构', label: 'PDE约束', detail: '拉普拉斯、泊松方程', color: 'bg-yellow-500' },
        { type: '方法', label: '有限元方法', detail: 'FEM、有限差分', color: 'bg-red-500' }
      ],
      modelingConclusion: '本质是一个在偏微分方程约束下的变分问题，通过数值方法求解边值问题。',
      applications: [
        { domain: '测绘经典', scenarios: ['重力场建模', '磁场建模'], description: '地球物理场重建' },
        { domain: '现代遥感', scenarios: ['热红外建模', '电磁场仿真'], description: '物理过程数值模拟' }
      ],
      learningPath: {
        foundation: '偏微分方程理论',
        intermediate: '变分法与数值方法', 
        advanced: '计算物理学',
        application: '地球物理建模与仿真'
      },
      gradient: 'from-cyan-500 to-blue-500'
    }
  ];

  // 圆周运动动画
  useEffect(() => {
    if (selectedCard) return; // 在详细视图时停止旋转
    
    const interval = setInterval(() => {
      setRotationAngle(prev => (prev + 0.3) % 360); // 每100ms转0.3度，120秒完成360度
    }, 100);
    
    return () => clearInterval(interval);
  }, [selectedCard]);

  return (
    <section
      id={id}
      className="snap-section relative overflow-hidden min-h-screen"
      style={{ backgroundColor: 'var(--bg-deep)' }}
    >
      {/* 主要内容区域 - 使用固定视口定位 */}
      <div className="fixed inset-0 w-full h-screen flex items-center justify-center" style={{ top: 0, left: 0, zIndex: 10 }}>
        {selectedCard ? (
          // 单卡片详细视图 - 缩短宽度至85%，优化高度，下边缘上移20px
          <div className="w-full max-w-[85vw] mx-auto px-8" 
               style={{ 
                 height: 'calc(100vh - 150px)',
                 paddingTop: '20px',
                 paddingBottom: '15px', 
                 display: 'flex',
                 flexDirection: 'column'
               }}>
            {problems
              .filter(p => p.id === selectedCard)
              .map((problem) => (
                <div key={problem.id} className="bg-black/[0.02] backdrop-blur-sm rounded-2xl border border-white/20 min-h-full">
                  {/* 固定顶部：返回按钮和核心身份 */}
                  <div className="sticky top-0 bg-black/[0.05] backdrop-blur-md border-b border-white/10 p-6 z-20">
                    {/* 返回按钮左对齐 */}
                    <button 
                      onClick={() => handleCardClick(null)}
                      className="absolute top-6 left-6 flex items-center gap-2 text-sm hover:text-white transition-colors z-10"
                      style={{ color: 'var(--tech-mint)' }}
                    >
                      ← 返回优化建模全景
                    </button>
                    
                    {/* 图标和标题居中对齐 */}
                    <div className="flex items-start justify-center gap-6">
                      <div className={`text-6xl p-6 rounded-3xl bg-gradient-to-br ${problem.gradient} bg-opacity-20 shadow-lg`}>
                        {problem.icon}
                      </div>
                      <div className="text-center">
                        <h2 className="text-4xl font-bold mb-3" style={{ color: 'var(--ink-high)' }}>
                          {problem.title}
                        </h2>
                        <p className="text-xl opacity-90" style={{ color: 'var(--ink-mid)' }}>
                          {problem.coreIdentity}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* 四段式内容区域 - 重新设计布局和动画 */}
                  <div className="flex-1 p-6 grid grid-cols-4 gap-8 min-h-0">
                    
                    {/* 第一段：问题本质 - 圆角矩形（基准设计） */}
                    <div className="space-y-4"
                         style={{
                           opacity: animationStage >= 1 ? 1 : 0,
                           transform: animationStage >= 1 ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.9)',
                           transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                         }}>
                      <h3 className="text-xl font-bold flex items-center justify-center gap-2 mb-4" style={{ color: 'var(--tech-mint)' }}>
                        💡 问题本质
                      </h3>
                      <div className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 to-purple-500/8 rounded-2xl" />
                        <div className="relative p-5 rounded-2xl border border-blue-500/25 backdrop-blur-sm"
                             style={{
                               boxShadow: animationStage >= 1 ? '0 8px 25px rgba(59, 130, 246, 0.12)' : 'none',
                               transition: 'box-shadow 0.6s ease-out 0.3s'
                             }}>
                          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-l-2xl" />
                          <p className="text-sm leading-relaxed pl-4" style={{ color: 'var(--ink-high)' }}>
                            {problem.modelingConclusion}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 第二段：应用场景 - 根据不同卡片使用不同设计 */}
                    <div className="space-y-4"
                         style={{
                           opacity: animationStage >= 2 ? 1 : 0,
                           transform: animationStage >= 2 ? 'translateX(0) rotateX(0deg)' : 'translateX(-20px) rotateX(10deg)',
                           transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.1s'
                         }}>
                      <h3 className="text-xl font-bold flex items-center justify-center gap-2 mb-4" style={{ color: 'var(--tech-mint)' }}>
                        🌐 应用场景
                      </h3>
                      
                      {/* 根据不同卡片ID显示不同设计 */}
                      {problem.id === 'state-estimation' && (
                        // 卡片1: 时间轴垂直流
                        <div className="relative">
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-green-500/30" />
                          <div className="space-y-4">
                            {(problem.applications || []).map((app, index) => (
                              <div key={index} className="relative flex items-start gap-4"
                                   style={{
                                     opacity: animationStage >= 2 ? 1 : 0,
                                     transform: animationStage >= 2 ? 'translateX(0)' : 'translateX(-20px)',
                                     transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${0.15 * index}s`
                                   }}>
                                <div className="relative z-10 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                  {index + 1}
                                </div>
                                <div className="flex-1 bg-green-500/8 rounded-lg p-3 border border-green-500/20">
                                  <div className="font-semibold text-sm mb-1" style={{ color: 'var(--ink-high)' }}>
                                    {app.domain}
                                  </div>
                                  <div className="text-xs mb-2 opacity-80" style={{ color: 'var(--ink-mid)' }}>
                                    {app.description}
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {app.scenarios.map((scenario, i) => (
                                      <span key={i} className="px-2 py-1 bg-green-500/20 text-xs rounded-full border border-green-500/30" 
                                            style={{ color: 'var(--ink-high)' }}>
                                        {scenario}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {problem.id === 'constrained-convex' && (
                        // 卡片2: 修改为手风琴折叠
                        <div className="space-y-2">
                          {(problem.applications || []).map((app, index) => (
                            <div key={index} className="relative"
                                 style={{
                                   opacity: animationStage >= 2 ? 1 : 0,
                                   transform: animationStage >= 2 ? 'translateY(0)' : 'translateY(15px)',
                                   transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${0.15 * index}s`
                                 }}>
                              <div className="border border-red-500/25 rounded-lg overflow-hidden">
                                <div className="bg-red-500/10 px-4 py-2 border-b border-red-500/25 cursor-pointer hover:bg-red-500/15 transition-colors">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    <div className="font-semibold text-sm" style={{ color: 'var(--ink-high)' }}>
                                      {app.domain}
                                    </div>
                                    <div className="text-xs opacity-60 ml-auto">▼</div>
                                  </div>
                                </div>
                                <div className="p-3 bg-red-500/5">
                                  <div className="text-xs mb-2 opacity-80" style={{ color: 'var(--ink-mid)' }}>
                                    {app.description}
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {app.scenarios.map((scenario, i) => (
                                      <span key={i} className="px-2 py-1 bg-red-500/20 text-xs rounded-full border border-red-500/30" 
                                            style={{ color: 'var(--ink-high)' }}>
                                        {scenario}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {problem.id === 'combinatorial' && (
                        // 卡片3: 分层卡片堆叠
                        <div className="relative">
                          {(problem.applications || []).map((app, index) => (
                            <div key={index} className="relative mb-4"
                                 style={{
                                   opacity: animationStage >= 2 ? 1 : 0,
                                   transform: animationStage >= 2 ? `translateY(${index * 2}px) translateX(${index * 4}px) rotate(${index * 1}deg)` : 'translateY(20px) rotate(3deg)',
                                   transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${0.15 * index}s`,
                                   zIndex: (problem.applications || []).length - index
                                 }}>
                              <div className="bg-purple-500/8 rounded-xl p-4 border border-purple-500/20 shadow-lg backdrop-blur-sm"
                                   style={{
                                     boxShadow: `0 ${4 + index * 2}px ${12 + index * 4}px rgba(168, 85, 247, ${0.1 + index * 0.05})`
                                   }}>
                                <div className="font-semibold text-sm mb-1" style={{ color: 'var(--ink-high)' }}>
                                  {app.domain}
                                </div>
                                <div className="text-xs mb-2 opacity-80" style={{ color: 'var(--ink-mid)' }}>
                                  {app.description}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {app.scenarios.map((scenario, i) => (
                                    <span key={i} className="px-2 py-1 bg-purple-500/20 text-xs rounded-full border border-purple-500/30" 
                                          style={{ color: 'var(--ink-high)' }}>
                                      {scenario}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {problem.id === 'image-raster' && (
                        // 卡片4: 手风琴折叠 - 简化版本
                        <div className="space-y-2">
                          {(problem.applications || []).map((app, index) => (
                            <div key={index} className="relative"
                                 style={{
                                   opacity: animationStage >= 2 ? 1 : 0,
                                   transform: animationStage >= 2 ? 'translateY(0)' : 'translateY(15px)',
                                   transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${0.15 * index}s`
                                 }}>
                              <div className="border border-pink-500/25 rounded-lg overflow-hidden">
                                <div className="bg-pink-500/10 px-4 py-2 border-b border-pink-500/25 cursor-pointer hover:bg-pink-500/15 transition-colors">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-pink-500" />
                                    <div className="font-semibold text-sm" style={{ color: 'var(--ink-high)' }}>
                                      {app.domain}
                                    </div>
                                    <div className="text-xs opacity-60 ml-auto">▼</div>
                                  </div>
                                </div>
                                <div className="p-3 bg-pink-500/5">
                                  <div className="text-xs mb-2 opacity-80" style={{ color: 'var(--ink-mid)' }}>
                                    {app.description}
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {app.scenarios.map((scenario, i) => (
                                      <span key={i} className="px-2 py-1 bg-pink-500/20 text-xs rounded-full border border-pink-500/30" 
                                            style={{ color: 'var(--ink-high)' }}>
                                        {scenario}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {(problem.id === 'data-driven' || problem.id === 'pde-physics') && (
                        // 卡片5&6: 胶囊标签组和时间轴的不同实现
                        <div className="space-y-3">
                          {(problem.applications || []).map((app, index) => (
                            <div key={index} className="relative flex items-start gap-3"
                                 style={{
                                   opacity: animationStage >= 2 ? 1 : 0,
                                   transform: animationStage >= 2 ? 'translateX(0)' : 'translateX(-15px)',
                                   transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${0.15 * index}s`
                                 }}>
                              <div className="w-1 h-16 bg-gradient-to-b from-indigo-500 to-cyan-500 rounded-full" />
                              <div className="flex-1 bg-gradient-to-br from-indigo-500/8 to-cyan-500/8 rounded-lg p-3 border border-indigo-500/20">
                                <div className="font-semibold text-sm mb-1" style={{ color: 'var(--ink-high)' }}>
                                  {app.domain}
                                </div>
                                <div className="text-xs mb-2 opacity-80" style={{ color: 'var(--ink-mid)' }}>
                                  {app.description}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {app.scenarios.map((scenario, i) => (
                                    <span key={i} className="px-2 py-1 bg-indigo-500/20 text-xs rounded-full border border-indigo-500/30" 
                                          style={{ color: 'var(--ink-high)' }}>
                                      {scenario}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 第三段：特征矩阵 - 根据不同卡片使用不同设计 */}
                    <div className="space-y-4"
                         style={{
                           opacity: animationStage >= 3 ? 1 : 0,
                           transform: animationStage >= 3 ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                           transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s'
                         }}>
                      <h3 className="text-xl font-bold flex items-center justify-center gap-2 mb-4" style={{ color: 'var(--tech-mint)' }}>
                        🏷️ 特征矩阵
                      </h3>
                      
                      {/* 根据不同卡片ID显示不同设计 */}
                      {problem.id === 'state-estimation' && (
                        // 卡片1: 仪表盘指标
                        <div className="grid grid-cols-2 gap-4">
                          {problem.features.map((feature, index) => {
                            const colors = {
                              'bg-blue-500': '#3b82f6', 'bg-green-500': '#22c55e', 'bg-purple-500': '#a855f7',
                              'bg-red-500': '#ef4444', 'bg-orange-500': '#f97316', 'bg-yellow-500': '#eab308'
                            };
                            const color = colors[feature.color] || '#6b7280';
                            
                            return (
                              <div key={index} className="relative flex flex-col items-center p-3"
                                   style={{
                                     opacity: animationStage >= 3 ? 1 : 0,
                                     transform: animationStage >= 3 ? 'translateY(0)' : 'translateY(20px)',
                                     transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${0.15 * index}s`
                                   }}>
                                {/* 仪表盘 */}
                                <div className="relative w-16 h-16 mb-2">
                                  <svg className="w-full h-full" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                                    <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="4"
                                            strokeDasharray={`${(index + 1) * 70}, 283`}
                                            strokeLinecap="round" 
                                            style={{
                                              transform: 'rotate(-90deg)',
                                              transformOrigin: '50px 50px',
                                              transition: 'stroke-dasharray 1s ease-out',
                                              transitionDelay: `${0.3 + index * 0.1}s`
                                            }} />
                                    {/* 指针 */}
                                    <line x1="50" y1="50" x2="50" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round"
                                          style={{
                                            transform: `rotate(${animationStage >= 3 ? (index + 1) * 60 - 90 : -90}deg)`,
                                            transformOrigin: '50px 50px',
                                            transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                            transitionDelay: `${0.5 + index * 0.1}s`
                                          }} />
                                    <circle cx="50" cy="50" r="3" fill={color} />
                                  </svg>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs font-bold opacity-80 mb-1" style={{ color: 'var(--ink-mid)' }}>
                                    {feature.type}
                                  </div>
                                  <div className="text-sm font-semibold mb-1" style={{ color: 'var(--ink-high)' }}>
                                    {feature.label}
                                  </div>
                                  <div className="text-xs opacity-80" style={{ color: 'var(--ink-mid)' }}>
                                    {feature.detail}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {problem.id === 'constrained-convex' && (
                        // 卡片2: 卡片式网格
                        <div className="space-y-3">
                          {problem.features.map((feature, index) => {
                            const colors = {
                              'bg-blue-500': '#3b82f6', 'bg-green-500': '#22c55e', 'bg-purple-500': '#a855f7',
                              'bg-red-500': '#ef4444', 'bg-orange-500': '#f97316', 'bg-yellow-500': '#eab308'
                            };
                            const color = colors[feature.color] || '#6b7280';
                            const icons = ['🔵', '🔶', '🔷', '🔸', '🔹'];
                            
                            return (
                              <div key={index} className="relative flex items-center gap-3 p-3 rounded-lg border"
                                   style={{
                                     backgroundColor: `${color}08`,
                                     borderColor: `${color}25`,
                                     opacity: animationStage >= 3 ? 1 : 0,
                                     transform: animationStage >= 3 ? 'translateX(0)' : 'translateX(-20px)',
                                     transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${0.12 * index}s`
                                   }}>
                                <div className="absolute top-0 left-0 w-1 h-full rounded-l-lg" style={{ backgroundColor: color }} />
                                <div className="text-xl">{icons[index % icons.length]}</div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="text-xs font-bold opacity-80" style={{ color: 'var(--ink-mid)' }}>
                                      {feature.type}
                                    </div>
                                  </div>
                                  <div className="text-sm font-semibold mb-1" style={{ color: 'var(--ink-high)' }}>
                                    {feature.label}
                                  </div>
                                  <div className="text-xs opacity-80" style={{ color: 'var(--ink-mid)' }}>
                                    {feature.detail}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {problem.id === 'combinatorial' && (
                        // 卡片3: 改回最早的圆角矩形设计
                        <div className="space-y-3">
                          {problem.features.map((feature, index) => {
                            const colorClasses = {
                              'bg-blue-500': 'from-blue-500/10 to-blue-600/5 border-blue-500/25',
                              'bg-green-500': 'from-green-500/10 to-green-600/5 border-green-500/25',
                              'bg-purple-500': 'from-purple-500/10 to-purple-600/5 border-purple-500/25',
                              'bg-red-500': 'from-red-500/10 to-red-600/5 border-red-500/25',
                              'bg-orange-500': 'from-orange-500/10 to-orange-600/5 border-orange-500/25',
                              'bg-yellow-500': 'from-yellow-500/10 to-yellow-600/5 border-yellow-500/25'
                            };
                            
                            return (
                              <div key={index} className="relative group"
                                   style={{
                                     opacity: animationStage >= 3 ? 1 : 0,
                                     transform: animationStage >= 3 ? 'translateX(0) rotateY(0deg)' : `translateX(${index % 2 ? 15 : -15}px) rotateY(${index % 2 ? -10 : 10}deg)`,
                                     transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${0.12 * index}s`
                                   }}>
                                <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[feature.color] || 'from-gray-500/10 to-gray-600/5 border-gray-500/25'} rounded-xl`} />
                                <div className="relative p-3 rounded-xl border backdrop-blur-sm hover:shadow-lg transition-shadow duration-300">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-3 h-3 rounded-full ${feature.color} shadow-sm`}
                                         style={{
                                           opacity: animationStage >= 3 ? 1 : 0,
                                           transform: animationStage >= 3 ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(180deg)',
                                           transition: `all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${0.15 * index + 0.3}s`
                                         }} />
                                    <div className="text-xs font-bold opacity-80" style={{ color: 'var(--ink-mid)' }}>
                                      {feature.type}
                                    </div>
                                  </div>
                                  <div className="text-sm font-semibold mb-1" style={{ color: 'var(--ink-high)' }}>
                                    {feature.label}
                                  </div>
                                  <div className="text-xs opacity-80" style={{ color: 'var(--ink-mid)' }}>
                                    {feature.detail}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {problem.id === 'image-raster' && (
                        // 卡片4: 改回最早的圆角矩形设计
                        <div className="space-y-3">
                          {problem.features.map((feature, index) => {
                            const colorClasses = {
                              'bg-blue-500': 'from-blue-500/10 to-blue-600/5 border-blue-500/25',
                              'bg-green-500': 'from-green-500/10 to-green-600/5 border-green-500/25',
                              'bg-purple-500': 'from-purple-500/10 to-purple-600/5 border-purple-500/25',
                              'bg-red-500': 'from-red-500/10 to-red-600/5 border-red-500/25',
                              'bg-orange-500': 'from-orange-500/10 to-orange-600/5 border-orange-500/25',
                              'bg-yellow-500': 'from-yellow-500/10 to-yellow-600/5 border-yellow-500/25'
                            };
                            
                            return (
                              <div key={index} className="relative group"
                                   style={{
                                     opacity: animationStage >= 3 ? 1 : 0,
                                     transform: animationStage >= 3 ? 'translateX(0) rotateY(0deg)' : `translateX(${index % 2 ? 15 : -15}px) rotateY(${index % 2 ? -10 : 10}deg)`,
                                     transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${0.12 * index}s`
                                   }}>
                                <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[feature.color] || 'from-gray-500/10 to-gray-600/5 border-gray-500/25'} rounded-xl`} />
                                <div className="relative p-3 rounded-xl border backdrop-blur-sm hover:shadow-lg transition-shadow duration-300">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-3 h-3 rounded-full ${feature.color} shadow-sm`}
                                         style={{
                                           opacity: animationStage >= 3 ? 1 : 0,
                                           transform: animationStage >= 3 ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(180deg)',
                                           transition: `all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${0.15 * index + 0.3}s`
                                         }} />
                                    <div className="text-xs font-bold opacity-80" style={{ color: 'var(--ink-mid)' }}>
                                      {feature.type}
                                    </div>
                                  </div>
                                  <div className="text-sm font-semibold mb-1" style={{ color: 'var(--ink-high)' }}>
                                    {feature.label}
                                  </div>
                                  <div className="text-xs opacity-80" style={{ color: 'var(--ink-mid)' }}>
                                    {feature.detail}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {problem.id === 'pde-physics' && (
                        // 卡片6: 改回最早的圆角矩形设计
                        <div className="space-y-3">
                          {problem.features.map((feature, index) => {
                            const colorClasses = {
                              'bg-blue-500': 'from-blue-500/10 to-blue-600/5 border-blue-500/25',
                              'bg-green-500': 'from-green-500/10 to-green-600/5 border-green-500/25',
                              'bg-purple-500': 'from-purple-500/10 to-purple-600/5 border-purple-500/25',
                              'bg-red-500': 'from-red-500/10 to-red-600/5 border-red-500/25',
                              'bg-orange-500': 'from-orange-500/10 to-orange-600/5 border-orange-500/25',
                              'bg-yellow-500': 'from-yellow-500/10 to-yellow-600/5 border-yellow-500/25'
                            };
                            
                            return (
                              <div key={index} className="relative group"
                                   style={{
                                     opacity: animationStage >= 3 ? 1 : 0,
                                     transform: animationStage >= 3 ? 'translateX(0) rotateY(0deg)' : `translateX(${index % 2 ? 15 : -15}px) rotateY(${index % 2 ? -10 : 10}deg)`,
                                     transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${0.12 * index}s`
                                   }}>
                                <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[feature.color] || 'from-gray-500/10 to-gray-600/5 border-gray-500/25'} rounded-xl`} />
                                <div className="relative p-3 rounded-xl border backdrop-blur-sm hover:shadow-lg transition-shadow duration-300">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-3 h-3 rounded-full ${feature.color} shadow-sm`}
                                         style={{
                                           opacity: animationStage >= 3 ? 1 : 0,
                                           transform: animationStage >= 3 ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(180deg)',
                                           transition: `all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${0.15 * index + 0.3}s`
                                         }} />
                                    <div className="text-xs font-bold opacity-80" style={{ color: 'var(--ink-mid)' }}>
                                      {feature.type}
                                    </div>
                                  </div>
                                  <div className="text-sm font-semibold mb-1" style={{ color: 'var(--ink-high)' }}>
                                    {feature.label}
                                  </div>
                                  <div className="text-xs opacity-80" style={{ color: 'var(--ink-mid)' }}>
                                    {feature.detail}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {problem.id === 'data-driven' && (
                        // 卡片5: 仪表盘指标变种
                        <div className="grid grid-cols-2 gap-4">
                          {problem.features.map((feature, index) => {
                            const colors = {
                              'bg-blue-500': '#3b82f6', 'bg-green-500': '#22c55e', 'bg-purple-500': '#a855f7',
                              'bg-red-500': '#ef4444', 'bg-orange-500': '#f97316', 'bg-yellow-500': '#eab308'
                            };
                            const color = colors[feature.color] || '#6b7280';
                            
                            return (
                              <div key={index} className="relative flex flex-col items-center p-3"
                                   style={{
                                     opacity: animationStage >= 3 ? 1 : 0,
                                     transform: animationStage >= 3 ? 'translateY(0)' : 'translateY(20px)',
                                     transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${0.15 * index}s`
                                   }}>
                                {/* 小型仪表盘 */}
                                <div className="relative w-14 h-14 mb-2">
                                  <svg className="w-full h-full" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="3"
                                            strokeDasharray={`${(index + 1) * 62}, 251`}
                                            strokeLinecap="round" 
                                            style={{
                                              transform: 'rotate(-90deg)',
                                              transformOrigin: '50px 50px',
                                              transition: 'stroke-dasharray 1s ease-out',
                                              transitionDelay: `${0.3 + index * 0.1}s`
                                            }} />
                                    {/* 指针 */}
                                    <line x1="50" y1="50" x2="50" y2="25" stroke={color} strokeWidth="2" strokeLinecap="round"
                                          style={{
                                            transform: `rotate(${animationStage >= 3 ? (index + 1) * 70 - 90 : -90}deg)`,
                                            transformOrigin: '50px 50px',
                                            transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                            transitionDelay: `${0.5 + index * 0.1}s`
                                          }} />
                                    <circle cx="50" cy="50" r="2.5" fill={color} />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color }}>
                                    {index + 1}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs font-bold opacity-80 mb-1" style={{ color: 'var(--ink-mid)' }}>
                                    {feature.type}
                                  </div>
                                  <div className="text-sm font-semibold mb-1" style={{ color: 'var(--ink-high)' }}>
                                    {feature.label}
                                  </div>
                                  <div className="text-xs opacity-80" style={{ color: 'var(--ink-mid)' }}>
                                    {feature.detail}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 第四段：学习路线 - 圆形进度环设计 */}
                    <div className="space-y-4"
                         style={{
                           opacity: animationStage >= 4 ? 1 : 0,
                           transform: animationStage >= 4 ? 'translateY(0) scale(1)' : 'translateY(25px) scale(0.9)',
                           transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s'
                         }}>
                      <h3 className="text-xl font-bold flex items-center justify-center gap-2 mb-4" style={{ color: 'var(--tech-mint)' }}>
                        🎯 学习路线
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(problem.learningPath || {
                          foundation: '基础理论',
                          intermediate: '进阶方法', 
                          advanced: '高级技术',
                          application: '实际应用'
                        }).map(([level, content], index) => {
                          const colors = {
                            0: { bg: '#3b82f6', light: '#3b82f615' }, // blue
                            1: { bg: '#a855f7', light: '#a855f715' }, // purple
                            2: { bg: '#f97316', light: '#f9731615' }, // orange
                            3: { bg: '#22c55e', light: '#22c55e15' }  // green
                          };
                          const levelNames = { foundation: '基础', intermediate: '进阶', advanced: '高级', application: '应用' };
                          const icons = ['📚', '🔬', '⚡', '🚀'];
                          const progressValues = [25, 50, 75, 100];
                          
                          return (
                            <div key={level} className="relative flex flex-col items-center"
                                 style={{
                                   opacity: animationStage >= 4 ? 1 : 0,
                                   transform: animationStage >= 4 ? 'translateY(0) scale(1)' : `translateY(20px) scale(0.9)`,
                                   transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${0.15 * index}s`
                                 }}>
                              {/* 圆形进度环 */}
                              <div className="relative w-20 h-20 mb-3">
                                {/* 背景圆环 */}
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                  <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#e5e7eb"
                                    strokeWidth="2"
                                  />
                                  {/* 进度圆环 */}
                                  <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke={colors[index].bg}
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeDasharray={`${animationStage >= 4 ? progressValues[index] : 0}, 100`}
                                    style={{
                                      transition: 'stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                      transitionDelay: `${0.3 + index * 0.2}s`
                                    }}
                                  />
                                </svg>
                                
                                {/* 中心内容 */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className="text-lg mb-1">{icons[index]}</span>
                                  <span className="text-xs font-bold" style={{ color: colors[index].bg }}>
                                    {progressValues[index]}%
                                  </span>
                                </div>
                              </div>
                              
                              {/* 标题和内容 */}
                              <div className="text-center">
                                <div className="font-semibold text-sm mb-1" style={{ color: 'var(--ink-high)' }}>
                                  {levelNames[level] || level}
                                </div>
                                <div className="text-xs opacity-80 px-2 leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                                  {content}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>
              ))}
          </div>
        ) : (
          // 六卡片环形布局总览视图
          <>
            {/* 中心节点 - 优化建模全景 */}
            <div className="absolute z-20 w-48 h-48" style={{
              left: `${(window.innerWidth/2 - 96).toFixed(0)}px`,
              top: `${(window.innerHeight/2 - 96).toFixed(0)}px`
            }}>
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 flex items-center justify-center shadow-2xl">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">🌐</div>
                  <div className="font-bold text-lg">优化建模</div>
                  <div className="font-bold text-lg">全景</div>
                </div>
              </div>
              
              {/* 中心节点光环效果 */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 animate-ping opacity-20"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 opacity-30 animate-pulse"></div>
            </div>

            {/* 六个卡片环形分布 */}
            {problems.map((problem, index) => {
              const radius = 280;
              const angle = problem.position.angle + rotationAngle; // 加上圆周运动角度
              const radian = (angle - 90) * Math.PI / 180; // -90度让0度对应12点钟方向
              const x = Math.cos(radian) * radius;
              const y = Math.sin(radian) * radius;

              return (
                <div 
                  key={problem.id}
                  className="absolute z-30 cursor-pointer transition-all duration-500 hover:scale-110 hover:z-40"
                  style={{
                    left: `${(window.innerWidth/2 + x - 112).toFixed(0)}px`,
                    top: `${(window.innerHeight/2 + y - 112).toFixed(0)}px`,
                    animationDelay: `${index * 200}ms`,
                    animation: 'simpleScaleIn 0.8s ease-out forwards'
                  }}
                  onClick={() => handleCardClick(problem.id)}
                >
                  <div className={`w-56 h-56 rounded-2xl bg-gradient-to-br ${problem.gradient} bg-opacity-90 backdrop-blur-sm border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300`}>
                    <div className="p-6 h-full flex flex-col items-center justify-center text-center text-white">
                      <div className="text-5xl mb-4">{problem.icon}</div>
                      <h3 className="text-lg font-bold mb-3 leading-tight">{problem.title}</h3>
                      <p className="text-sm opacity-90">{problem.coreIdentity.slice(0, 30)}...</p>
                      <div className="absolute top-3 right-3 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">{index + 1}</div>
                      <div className="absolute bottom-3 left-3 right-3 text-xs opacity-70">点击探索详情</div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* SVG连接线 */}
            <svg 
              className="absolute inset-0 pointer-events-none" 
              style={{ width: '800px', height: '600px', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
              viewBox="0 0 800 600"
            >
              <defs>
                <radialGradient id="connectionGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
                </radialGradient>
              </defs>
              {/* 从中心(400,300)到各个卡片的连接线 */}
              {problems.map((problem, index) => {
                const radius = 280;
                const angle = problem.position.angle + rotationAngle; // 加上圆周运动角度
                const radian = (angle - 90) * Math.PI / 180;
                const x = Math.cos(radian) * radius;
                const y = Math.sin(radian) * radius;
                // SVG中心坐标为(400,300)，卡片坐标需要转换到SVG坐标系
                const cardSvgX = 400 + x * 0.8; // 稍微缩短连接线
                const cardSvgY = 300 + y * 0.8;
                
                return (
                  <line
                    key={`line-${index}`}
                    x1="400"
                    y1="300"
                    x2={cardSvgX.toFixed(1)}
                    y2={cardSvgY.toFixed(1)}
                    stroke="url(#connectionGradient)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    opacity="0.6"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="0;10;0"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </line>
                );
              })}
            </svg>
          </>
        )}
      </div>

      {/* 底部提示 - 始终显示，跳转到下一个概念页面 */}
      <button
        onClick={() => {
          // 寻找下一个概念页面 concept-4
          const target = document.getElementById('concept-4');
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}
        className="absolute bottom-8 left-1/2 flex flex-col items-center gap-2 
                   transition-colors duration-300 group"
        style={{
          transform: 'translateX(-50%)',
          color: 'var(--ink-mid)',
          zIndex: 100
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--tech-mint)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--ink-mid)';
        }}
        aria-label="向下滚动继续"
      >
        <span className="text-sm">向下滚动继续</span>
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
      
      {/* 动画样式 */}
      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.8);
        }
        
        @keyframes simpleScaleIn {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideInScale {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes slideInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(-20px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </section>
  );
};

export const meta = {
  id: 4,
  title: '测绘优化建模',
  summary: '六大类优化问题的完整光谱',
  anchor: 'concept-4',
};

export default Section4Surveying;