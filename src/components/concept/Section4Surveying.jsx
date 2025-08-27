import React, { useState, useRef, useEffect } from 'react';
import 'katex/dist/katex.min.css';
import DownHint from '../shared/DownHint';

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
      title: '状态估计与几何重构',
      coreIdentity: '从带有噪声的间接观测中，最优地估计系统内部状态与外部几何结构的核心问题',
      features: [
        { type: '变量类型', label: '连续', detail: '位姿、点坐标、IMU偏置等状态量', color: 'bg-blue-500' },
        { type: '目标结构', label: '非线性最小二乘', detail: 'NLLS', color: 'bg-green-500' },
        { type: '规模结构', label: '大规模、块稀疏', detail: '结构化稀疏矩阵', color: 'bg-purple-500' },
        { type: '求解范式', label: 'LM算法', detail: 'Schur Complement、流形优化', color: 'bg-red-500' },
        { type: '时序扩展', label: '递推状态估计', detail: 'KF/EKF/UKF、因子图优化', color: 'bg-orange-500' }
      ],
      modelingConclusion: '旨在解决从带有噪声的间接观测中，最优地估计系统内部状态与外部几何结构的核心问题。其本质是一个大规模稀疏的非线性最小二乘问题，其静态批量形式（如BA）构成了高精度几何重构的基石；在动态环境下则演化为递推状态估计（如Kalman滤波）或滑动窗口优化，是实现实时导航与建图的关键。',
      applications: [
        { 
          domain: '测绘经典', 
          scenarios: ['光束法平差 (BA)', 'GNSS/INS精密解算']
        },
        { 
          domain: '现代遥感', 
          scenarios: ['区域网联合平差', '多传感器融合与配准']
        },
        { 
          domain: 'GIS 应用', 
          scenarios: ['城市三维实景建模', '数字底图生产']
        },
        { 
          domain: '交叉综合', 
          scenarios: ['视觉/激光SLAM', '数字孪生', '几何构建与时序更新']
        }
      ],
      learningPath: {
        foundation: '最小二乘法、概率与统计、线性代数',
        intermediate: '非线性优化算法、稀疏线性代数、卡尔曼滤波', 
        advanced: '因子图优化、流形上的优化',
        application: '利用无人机序列影像进行建筑物密集点云重建的BA问题求解'
      },
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'constrained-convex',
      position: { angle: 60 }, // 2点钟方向
      icon: '⚖️',
      title: '约束下的参数平差',
      coreIdentity: '在满足特定物理定律或先验几何条件的严格约束下，求解测量数据的最优估值',
      features: [
        { type: '变量类型', label: '连续', detail: '控制点坐标、形变参数、模型系数', color: 'bg-blue-500' },
        { type: '目标结构', label: '二次规划', detail: 'QP（基于线性化的高斯-马尔可夫模型）', color: 'bg-green-500' },
        { type: '约束结构', label: '线性、二次或锥约束', detail: 'QCQP、SOCP', color: 'bg-yellow-500' },
        { type: '求解范式', label: '现代凸优化方法', detail: '内点法、增广拉格朗日法、凸对偶理论', color: 'bg-red-500' }
      ],
      modelingConclusion: '关注在满足特定物理定律或先验几何条件的严格约束下，求解测量数据的最优估值。它是一个以经典平差的二次规划 (QP) 为基础，通过 二次约束二次规划(QCQP)/二阶锥规划(SOCP) 等工具精确刻画各类复杂约束的凸优化问题。其求解的可靠性与效率高度依赖于现代凸优化算法，是确保解的物理真实性和可靠性的关键。',
      applications: [
        { domain: '测绘经典', scenarios: ['约束控制网平差', '正则化平差'] },
        { domain: '现代遥感', scenarios: ['InSAR形变场建模', '激光点云几何拟合'] },
        { domain: 'GIS应用', scenarios: ['地图要素自动综合'] },
        { domain: '交叉综合', scenarios: ['多源观测联合反演'] }
      ],
      learningPath: {
        foundation: '测量平差理论、拉格朗日乘子法',
        intermediate: '凸优化理论、标准凸问题形式', 
        advanced: '锥规划、内点法',
        application: '对GNSS控制网进行约束平差，要求部分控制点高程符合已知DEM'
      },
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'combinatorial',
      position: { angle: 120 }, // 4点钟方向
      icon: '🗺️',
      title: '组合决策与空间运筹',
      coreIdentity: '在离散的、有限的选项中，寻找满足特定目标的最优组合或序列',
      features: [
        { type: '变量类型', label: '离散/整数或混合整数', detail: '整数、排列', color: 'bg-blue-500' },
        { type: '目标结构', label: 'LP/MILP', detail: '线性规划/混合整数线性规划，常结合图论模型', color: 'bg-green-500' },
        { type: '求解范式', label: '整数规划与启发式算法', detail: '分支定界、启发式/元启发式算法、图搜索', color: 'bg-yellow-500' },
        { type: '时序扩展', label: 'MDP与强化学习', detail: '马尔可夫决策过程、强化学习', color: 'bg-red-500' }
      ],
      modelingConclusion: '旨在在离散的、有限的选项中，寻找满足特定目标的最优组合或序列，是典型的组合优化问题。静态决策通常建模为 混合整数线性规划(MILP) 或 图论问题，用于解决资源配置问题；在需要序贯决策的动态不确定环境下，则上升为 马尔科夫决策过程(MDP) 与 强化学习 的范畴，用于解决策略规划问题。',
      applications: [
        { 
          domain: '测绘经典', 
          scenarios: ['地面控制点布设', 'GNSS基准站布设']
        },
        {
          domain: '现代遥感',
          scenarios: ['卫星星座任务调度', '多无人机协同航摄']
        },
        { 
          domain: 'GIS应用', 
          scenarios: ['应急设施选址', '车辆路径规划VRP', '公共服务区划分']
        },
        { 
          domain: '交叉综合', 
          scenarios: ['多机器人协同勘探', '共享单车调度']
        }
      ],
      learningPath: {
        foundation: '图论、线性规划',
        intermediate: '整数与混合整数规划、元启发式算法', 
        advanced: '马尔可夫决策过程、强化学习',
        application: '规划无人机队伍飞行路径，满足续航限制下最短总航程完整覆盖测区'
      },
      gradient: 'from-green-500 to-teal-500'
    },
    {
      id: 'image-raster',
      position: { angle: 180 }, // 6点钟方向
      icon: '🖼️',
      title: '图像处理中的能量最小化',
      coreIdentity: '为图像中的每个像素（或超像素）分配一个离散标签，使得一个全局能量函数最小',
      features: [
        { type: '变量类型', label: '离散', detail: '像素标签、路径节点', color: 'bg-blue-500' },
        { type: '目标结构', label: '能量最小化', detail: '常表达为马尔可夫随机场模型', color: 'bg-green-500' },
        { type: '求解范式', label: '动态规划与图论方法', detail: '动态规划、图割/最大流最小割、置信度传播', color: 'bg-yellow-500' }
      ],
      modelingConclusion: '专注于为图像中的每个像素（或超像素）分配一个离散标签，使得一个全局能量函数最小。该能量函数通常包含惩罚标签与观测数据不符的“数据项”和惩罚相邻像素标签不一致的“平滑项”。这是一个在栅格（或图）结构上定义的大规模离散优化问题，其求解的核心在于利用图论工具（如图割）来高效地找到全局（或高质量的局部）能量最小解。',
      applications: [
        { domain: '测绘经典', scenarios: ['影像匀色', '最佳缝合线搜索'] },
        { domain: '现代遥感', scenarios: ['高分辨率遥感变化检测', '立体匹配', '高光谱影像分类'] },
        { domain: 'GIS应用', scenarios: ['栅格数据分类结果去噪'] },
        { domain: '交叉综合', scenarios: ['深度学习后处理模块'] }
      ],
      learningPath: {
        foundation: '数字图像处理、动态规划',
        intermediate: '马尔可夫随机场、图割与最大流/最小割', 
        advanced: '高级图割算法、条件随机场',
        application: '对两张重叠的航空影像进行无缝拼接，自动寻找最佳缝合线'
      },
      gradient: 'from-pink-500 to-red-500'
    },
    {
      id: 'data-driven',
      position: { angle: 240 }, // 8点钟方向
      icon: '🧠',
      title: '数据驱动的机器学习建模',
      coreIdentity: '从海量标注数据中，学习一个高维非线性模型（如深度神经网络）的参数',
      features: [
        { type: '变量类型', label: '模型参数连续', detail: '任务目标通常是离散类别或连续数值预测', color: 'bg-blue-500' },
        { type: '目标结构', label: '高度非凸的非线性规划', detail: '大规模数据上的求和形式', color: 'bg-green-500' },
        { type: '规模结构', label: '超大规模', detail: '亿万级数据、亿万级参数', color: 'bg-yellow-500' },
        { type: '求解范式', label: '一阶随机梯度方法', detail: 'SGD/Adam、GPU并行计算', color: 'bg-red-500' }
      ],
      modelingConclusion: '旨在从海量标注数据中，学习一个高维非线性模型（如深度神经网络）的参数，以实现分类、回归或生成等智能任务。这是一个在超大规模、非凸景观上的优化问题，其求解范式已经高度特化为基于 GPU 并行的一阶随机算法，优化的重点在于算法的收敛速度、泛化能力与计算效率，而非寻找全局最优解。',
      applications: [
        { domain: '测绘经典', scenarios: ['GNSS信号多路径效应识别', '大坝/桥梁沉降预测'] },
        { domain: '现代遥感', scenarios: ['土地利用分类', '目标检测', '地物参数反演'] },
        { domain: 'GIS应用', scenarios: ['城市功能区识别', '交通流量预测'] },
        { domain: '交叉综合', scenarios: ['神经辐射场NeRF', '地理空间预训练大模型'] }
      ],
      learningPath: {
        foundation: '机器学习概论、Python与深度学习框架',
        intermediate: '深度学习、随机优化算法', 
        advanced: '分布式训练、贝叶斯深度学习',
        application: '利用大量标注高分辨率遥感影像，训练深度模型实现建筑物实例分割'
      },
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      id: 'pde-physics',
      position: { angle: 300 }, // 10点钟方向
      icon: '⚡',
      title: '基于物理场的PDE约束优化',
      coreIdentity: '在满足特定偏微分方程描述的物理规律的约束下，寻找一个连续场的最优分布',
      features: [
        { type: '变量类型', label: '连续函数/场变量', detail: '高程场、位移场、温度场', color: 'bg-blue-500' },
        { type: '目标结构', label: 'PDE约束下的能量泛函最小化', detail: '变分问题', color: 'bg-green-500' },
        { type: '求解范式', label: '变分法与数值离散', detail: '变分法、有限元/有限差分、PDE约束优化算法', color: 'bg-yellow-500' }
      ],
      modelingConclusion: '解决的是在满足特定偏微分方程 (PDE) 描述的物理规律的约束下，寻找一个连续场的最优分布。这是一个定义在无穷维函数空间上的优化问题，其求解的本质是将变分原理与数值离散化方法 (如 FEM) 相结合，是连接第一性原理物理模型与稀疏观测数据的桥梁。',
      applications: [
        { domain: '测绘经典', scenarios: ['InSAR形变场物理机制建模'] },
        { domain: '现代遥感', scenarios: ['辐射传输模型大气参数反演'] },
        { domain: 'GIS应用', scenarios: ['污染物扩散', '地理过程模拟'] },
        { domain: '交叉综合', scenarios: ['物理信息神经网络PINN'] }
      ],
      learningPath: {
        foundation: '微积分与常微分方程、偏微分方程入门',
        intermediate: '变分法、数值分析与数值解', 
        advanced: 'PDE约束优化、物理信息神经网络PINN',
        application: '利用稀疏、带噪声的LiDAR散点数据，生成平滑且符合地表自然形态的DEM'
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
                      ← 返回建模范式全景
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
                                  <div className="font-semibold text-sm mb-2" style={{ color: 'var(--ink-high)' }}>
                                    {app.domain}
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
                                <div className="font-semibold text-sm mb-2" style={{ color: 'var(--ink-high)' }}>
                                  {app.domain}
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
                                <div className="font-semibold text-sm mb-2" style={{ color: 'var(--ink-high)' }}>
                                  {app.domain}
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
                        // 卡片1: 紧凑卡片式网格（适合5个特征）
                        <div className="space-y-2">
                          {problem.features.map((feature, index) => {
                            const colors = {
                              'bg-blue-500': '#3b82f6', 'bg-green-500': '#22c55e', 'bg-purple-500': '#a855f7',
                              'bg-red-500': '#ef4444', 'bg-orange-500': '#f97316', 'bg-yellow-500': '#eab308'
                            };
                            const color = colors[feature.color] || '#6b7280';
                            const icons = ['🔵', '🔶', '🟣', '🔴', '🟠'];
                            
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
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="text-xs font-bold opacity-80" style={{ color: 'var(--ink-mid)' }}>
                                      {feature.type}
                                    </div>
                                  </div>
                                  <div className="text-sm font-semibold mb-1" style={{ color: 'var(--ink-high)' }}>
                                    {feature.label}
                                  </div>
                                  <div className="text-xs opacity-80 truncate" style={{ color: 'var(--ink-mid)' }}>
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
            {/* 中心节点 - 六大核心建模范式 */}
            <div className="absolute z-20 w-48 h-48" style={{
              left: `${(window.innerWidth/2 - 96).toFixed(0)}px`,
              top: `${(window.innerHeight/2 - 96).toFixed(0)}px`
            }}>
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 flex items-center justify-center shadow-2xl">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">🌐</div>
                    <div className="font-bold text-lg">六大核心</div>
                    <div className="font-bold text-lg">建模范式</div>
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