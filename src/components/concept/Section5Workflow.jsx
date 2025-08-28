import React, { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Section5Workflow = ({ id }) => {
  const sectionRef = useRef()
  
  // 状态管理
  const [currentStage, setCurrentStage] = useState('overview')
  const [flippedCards, setFlippedCards] = useState({})
  const [hoveredCard, setHoveredCard] = useState(null)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [hoveredBackflow, setHoveredBackflow] = useState(null)
  const [activeFlow, setActiveFlow] = useState(0)
  const [backflowAnimation, setBackflowAnimation] = useState(null)
  const [tooltipInfo, setTooltipInfo] = useState(null)

  // 导航项定义
  const navigationItems = [
    { id: 'overview', label: '总览', stage: '现实需求 → 数学模型 → 策略 → 求解 → 验证 → 反馈' },
    { id: 'stage1', label: '阶段一 问题识别与数学抽象', stage: '把工程诉求精确转写为"目标+变量+约束"的数学模型' },
    { id: 'stage2', label: '阶段二 策略设计与算法选型', stage: '根据画像选择解法引擎，权衡规模、精度、资源' },
    { id: 'stage3', label: '阶段三 求解准备与初始化', stage: '为算法提供稳健起点与优化超参数' },
    { id: 'stage4', label: '阶段四 迭代求解与收敛监控', stage: '在解空间中稳定逼近最优，监控健康指标' },
    { id: 'stage5', label: '阶段五 结果验证与方案迭代', stage: '检验可行性与最优性，必要时回跳前阶段' }
  ]

  // 阶段内容定义
  const stageContent = {
    overview: {
      cards: []  // 总览页面暂时保持空内容
    },
    stage1: {
      cards: [
        {
          id: 'objective',
          front: { title: '定义目标', content: '最小化误差 / 最大化覆盖 / 最短时间 / 最大置信度' },
          back: { content: '选择度量：L2、Huber、IoU、路径长度、收益/成本比' }
        },
        {
          id: 'variables',
          front: { title: '确定变量', content: '变量类型：连续｜离散｜混合；范围：盒约束/集合' },
          back: { content: '示例：位姿/点坐标/超参数（连续）；选址/路径/布设（离散）' }
        },
        {
          id: 'functions',
          front: { title: '构建函数', content: '目标 f(x)；约束 g(x)=0, h(x)≤0；正则 L1/L2/TV' },
          back: { content: '写清可微性/凸性/稀疏结构与噪声模型（高斯/鲁棒）' }
        },
        {
          id: 'portrait',
          front: { title: '问题画像', content: '范式标签：NLLS｜QP/QCQP｜MILP/MDP｜MRF｜深度学习' },
          back: { content: '规模：小/中/大；稀疏：稠密/块稀疏；不确定性：噪声/异常/鲁棒' }
        }
      ]
    },
    stage2: {
      cards: [
        {
          id: 'matching',
          front: { title: '算法匹配', content: '连续光滑→一/二阶（GD、L-BFGS、LM、内点）' },
          back: { content: '离散/组合→MILP/分支定界/图搜索；动态→KF/DP/RL' }
        },
        {
          id: 'accuracy',
          front: { title: '精度成本', content: '是否需要全局最优？可接受近似？' },
          back: { content: '小规模→二阶/精确；大规模→一阶/启发式/分而治之' }
        },
        {
          id: 'resources',
          front: { title: '资源并行', content: '时间/内存/GPU/分布式' },
          back: { content: '批处理、块分解、Schur、GPU一阶、图割并行' }
        },
        {
          id: 'feasibility',
          front: { title: '可行评估', content: '复杂度、内存峰值、收敛风险' },
          back: { content: '给出"首选方案/备选方案/放弃条件"' }
        }
      ]
    },
    stage3: {
      cards: [
        {
          id: 'starting',
          front: { title: '起点设置', content: 'x₀ 来自线性解/先验；初始可行解；种群P=100' },
          back: { content: '多起点以降局部最优风险；滑动窗口给动态问题暖启动' }
        },
        {
          id: 'hyperparams',
          front: { title: '超参数', content: '学习率 η=1e-2；正则 λ=1e-3；阈值 ε=1e-6' },
          back: { content: '自适应步长/线搜索；退火/动量；早停 patience=5' }
        },
        {
          id: 'stopping',
          front: { title: '停止准则', content: '|Δf|/f < 1e-4 或 ||∇f||∞ < 1e-5 或 iter ≥ K' },
          back: { content: '可行性违约 < 1e-6；对启发式用"无改进迭代"判停' }
        }
      ]
    },
    stage4: {
      cards: [
        {
          id: 'computing',
          front: { title: '核心运算', content: '梯度/Hessian更新；分支定界；生成-评估-选择' },
          back: { content: '数值稳定性：预条件/归一化/阻尼' }
        },
        {
          id: 'monitoring',
          front: { title: '监控面板', content: 'f(t)、||∇f||、违约度、步长、条件数' },
          back: { content: '异常警示：震荡/发散/停滞 → 触发回退或重设' }
        },
        {
          id: 'adaptive',
          front: { title: '自适应机制', content: '步长调整、信赖域、重启、温度退火' },
          back: { content: '触发条件：plateau≥N 次或违约上升' }
        }
      ]
    },
    stage5: {
      cards: [
        {
          id: 'quality',
          front: { title: '质量检验', content: '约束满足；KKT条件；残差分布' },
          back: { content: '异常：局部最优/过拟合/偏置' }
        },
        {
          id: 'robustness',
          front: { title: '鲁棒性', content: '多起点一致性；噪声扰动；置信区间' },
          back: { content: '不稳定 → 回阶段三或二' }
        },
        {
          id: 'comparison',
          front: { title: '性能对比', content: '与基线/标准/理论界对比' },
          back: { content: '指标：精度/速度/资源/可复现性' }
        },
        {
          id: 'feedback',
          front: { title: '反馈循环', content: '不理想 → 回三、回二、回一' },
          back: { content: '理想 → 固化配置 & 产出报告' }
        }
      ]
    }
  }

  // 处理卡片翻转
  const handleCardFlip = (stageId, cardId) => {
    const key = `${stageId}-${cardId}`
    setFlippedCards(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // 自动播放流程动画（只播放一次）
  useEffect(() => {
    if (currentStage === 'overview' && activeFlow < 5) {
      const timer = setTimeout(() => {
        setActiveFlow(prev => prev + 1)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [currentStage, activeFlow])
  
  // 重置动画
  useEffect(() => {
    if (currentStage === 'overview') {
      setActiveFlow(0)
    }
  }, [currentStage])

  // 处理阶段切换
  const handleStageChange = (stageId) => {
    setCurrentStage(stageId)
    setFlippedCards({})
    
    // 添加切换动画 - 检查元素是否存在
    const stageContent = document.querySelector('.stage-content')
    if (stageContent) {
      gsap.fromTo('.stage-content',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      )
    }
  }

  // 动画效果
  useEffect(() => {
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top center",
      onEnter: () => {
        // 导航项入场动画
        gsap.fromTo('.nav-item',
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" }
        )
        
        // 卡片入场动画
        gsap.fromTo('.card-wrapper',
          { opacity: 0, scale: 0.95, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 0.3, ease: "power2.out" }
        )
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [currentStage])

  // 渲染卡片
  const renderCard = (card, stageId) => {
    const isFlipped = flippedCards[`${stageId}-${card.id}`]
    const isHovered = hoveredCard === `${stageId}-${card.id}`
    
    return (
      <div
        key={card.id}
        className="card-wrapper"
        onMouseEnter={() => setHoveredCard(`${stageId}-${card.id}`)}
        onMouseLeave={() => setHoveredCard(null)}
        onClick={() => handleCardFlip(stageId, card.id)}
        style={{
          perspective: '1000px',
          cursor: 'pointer',
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'transform 0.3s ease'
        }}
      >
        <div
          style={{
            width: '100%',
            height: '180px',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* 卡片正面 */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              background: isHovered 
                ? 'linear-gradient(135deg, rgba(30, 58, 95, 0.95) 0%, rgba(45, 85, 135, 0.9) 100%)'
                : 'linear-gradient(135deg, rgba(30, 58, 95, 0.85) 0%, rgba(30, 41, 59, 0.8) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid',
              borderColor: isHovered ? 'rgba(96, 165, 250, 0.3)' : 'rgba(75, 85, 99, 0.2)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: isHovered 
                ? '0 20px 40px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)' 
                : '0 10px 25px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease'
            }}
          >
            <div>
              {card.front.icon && (
                <div style={{ 
                  fontSize: '28px',
                  marginBottom: '12px',
                  opacity: 0.9
                }}>
                  {card.front.icon}
                </div>
              )}
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: card.front.content ? '10px' : '0',
                color: '#E8EAED',
                letterSpacing: '0.3px'
              }}>
                {card.front.title}
              </h3>
              {card.front.content && (
                <p style={{ 
                  fontSize: '14px', 
                  color: 'rgba(156, 163, 175, 0.95)', 
                  lineHeight: '1.6'
                }}>
                  {card.front.content}
                </p>
              )}
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: 'rgba(156, 163, 175, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '4px'
            }}>
              <span>查看详情</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* 卡片背面 */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(60, 230, 192, 0.25)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
            }}
          >
            <p style={{ 
              fontSize: '15px', 
              color: '#E8EAED', 
              lineHeight: '1.8'
            }}>
              {card.back.content}
            </p>
            <div style={{ 
              fontSize: '11px', 
              color: 'rgba(60, 230, 192, 0.7)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>返回</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 渲染总览页面的流程图
  const renderOverviewFlowchart = () => {
    
    // 节点定义 - W型波浪布局（140px正方形）
    const nodes = [
      { 
        id: 'N1', 
        label: '问题建模', 
        desc: '目标+变量+约束', 
        x: 80, 
        y: 80,
        width: 140,
        height: 140,
        color: '#3B82F6',
        bgColor: 'rgba(59, 130, 246, 0.03)'
      },
      { 
        id: 'N2', 
        label: '算法选型', 
        desc: '匹配解法引擎', 
        x: 280, 
        y: 270,  // 下移70px
        width: 140,
        height: 140,
        color: '#8B5CF6',
        bgColor: 'rgba(139, 92, 246, 0.03)'
      },
      { 
        id: 'N3', 
        label: '初始化', 
        desc: '起点与超参数', 
        x: 480, 
        y: 80,
        width: 140,
        height: 140,
        color: '#EC4899',
        bgColor: 'rgba(236, 72, 153, 0.03)'
      },
      { 
        id: 'N4', 
        label: '迭代求解', 
        desc: '循环优化更新', 
        x: 680, 
        y: 270,  // 下移70px
        width: 140,
        height: 140,
        color: '#F59E0B',
        bgColor: 'rgba(245, 158, 11, 0.03)'
      },
      { 
        id: 'N5', 
        label: '验证输出', 
        desc: '质量检验对标', 
        x: 880, 
        y: 80,
        width: 140,
        height: 140,
        color: '#10B981',
        bgColor: 'rgba(16, 185, 129, 0.03)'
      }
    ]
    
    // 回退路径定义（按时间顺序排列）
    const backflowPaths = [
      { 
        id: 'B1', 
        from: 1, 
        to: 0, 
        label: '简化模型', 
        reason: '问题太复杂了',
        explanation: '就像做一道有1000个步骤的菜谱，太复杂了做不完！电脑算不动或者内存不够，需要简化问题：减少变量数量、去掉不重要的约束，或者用简单的近似方法替代',
        color: '#EC4899' 
      },
      { 
        id: 'B2', 
        from: 3, 
        to: 2, 
        label: '稳定化', 
        reason: '发散/震荡/停滞',
        explanation: '迭代过程中出现数值发散、目标函数值震荡或长时间无改进时，需要调整步长、添加正则化项或改变初始化策略来稳定求解过程',
        color: '#F97316' 
      },
      { 
        id: 'B3', 
        from: 4, 
        to: 2, 
        label: '重设起点', 
        reason: '起点选得不好',
        explanation: '就像爬山总是爬到小山包就以为到了山顶！算法对起始点太敏感，容易陷入局部最优解，需要换个起点重新开始，或者用多个起点同时尝试',
        color: '#F59E0B' 
      },
      { 
        id: 'B4', 
        from: 3, 
        to: 1, 
        label: '更换算法', 
        reason: '算法不合适',
        explanation: '就像用菜刀切钢板，工具选错了！算法在求解过程中不收敛、跑不动、或者根本不适合这类问题，需要换个更合适的求解工具',
        color: '#EF4444' 
      },
      { 
        id: 'B5', 
        from: 4, 
        to: 0, 
        label: '重构模型', 
        reason: '理解错了问题',
        explanation: '就像把"省钱"理解成了"花钱"！建模时对问题本质理解错了，优化目标写反了或重要约束漏了，得出的结果虽然技术上正确但完全不合理，需要重新建模',
        color: '#DC2626' 
      }
    ]
    
    // 触发回退动画
    const triggerBackflowAnimation = (path) => {
      // 阶段1: 起始节点发光 (0.5s)
      setBackflowAnimation({ ...path, phase: 'start' })
      setTimeout(() => {
        // 阶段2: 虚线绘制动画 (1.0s)
        setBackflowAnimation({ ...path, phase: 'flow' })
      }, 500)
      setTimeout(() => {
        // 阶段3: 目标节点发光 (0.5s)
        setBackflowAnimation({ ...path, phase: 'end' })
      }, 1500)  // 500 + 1000
      setTimeout(() => {
        // 阶段4: 动画完成，持续显示曲线
        setBackflowAnimation({ ...path, phase: 'completed' })
      }, 2000)  // 500 + 1000 + 500
    }
    
    return (
      <div className="flowchart-container" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '20px' }}>

        {/* 流程图区域 */}
        <div style={{ flex: 1, position: 'relative', minHeight: '400px' }}>
          {/* SVG画布 - 连接线 */}
          <svg 
            width="100%" 
            height="500" 
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
          >
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="rgba(60, 230, 192, 0.8)" />
              </marker>
              <marker id="arrow-back" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="currentColor" opacity="0.8" />
              </marker>
              {/* 渐变定义 */}
              <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(60, 230, 192, 0.2)" />
                <stop offset="100%" stopColor="rgba(60, 230, 192, 0.6)" />
              </linearGradient>
            </defs>
            
            {/* 主流程连接线 - 曲线 */}
            {nodes.slice(0, -1).map((node, index) => {
              const nextNode = nodes[index + 1]
              const isActive = activeFlow > index
              const isCurrentAnimating = activeFlow === index + 1
              
              // 根据节点位置决定连接方式（下-左、上-左交替）
              let path = ''
              const gap = 3 // 距离边缘的间隙
              
              if (index === 0) {
                // N1底部 → N2左侧
                const startX = node.x + node.width / 2
                const startY = node.y + node.height + gap
                const endX = nextNode.x - gap
                const endY = nextNode.y + nextNode.height / 2
                path = `M ${startX} ${startY} Q ${startX} ${endY} ${endX} ${endY}`
              } else if (index === 1) {
                // N2顶部 → N3左侧
                const startX = node.x + node.width / 2
                const startY = node.y - gap
                const endX = nextNode.x - gap
                const endY = nextNode.y + nextNode.height / 2
                path = `M ${startX} ${startY} Q ${startX} ${endY} ${endX} ${endY}`
              } else if (index === 2) {
                // N3底部 → N4左侧
                const startX = node.x + node.width / 2
                const startY = node.y + node.height + gap
                const endX = nextNode.x - gap
                const endY = nextNode.y + nextNode.height / 2
                path = `M ${startX} ${startY} Q ${startX} ${endY} ${endX} ${endY}`
              } else {
                // N4顶部 → N5左侧
                const startX = node.x + node.width / 2
                const startY = node.y - gap
                const endX = nextNode.x - gap
                const endY = nextNode.y + nextNode.height / 2
                path = `M ${startX} ${startY} Q ${startX} ${endY} ${endX} ${endY}`
              }
              
              return (
                <g key={`main-${index}`}>
                  {/* 连接线 */}
                  <path
                    d={path}
                    stroke={isActive 
                      ? isCurrentAnimating ? 'url(#pathGradient)' : 'rgba(60, 230, 192, 0.5)'
                      : 'rgba(75, 85, 99, 0.2)'}
                    strokeWidth={isActive ? "2.5" : "2"}
                    fill="none"
                    markerEnd={isActive ? "url(#arrow)" : ""}
                    style={{
                      transition: 'all 0.6s ease',
                      opacity: isCurrentAnimating ? 1 : (isActive ? 0.8 : 0.5)
                    }}
                  />
                  
                  
                  {/* 发光效果 */}
                  {isCurrentAnimating && (
                    <path
                      d={path}
                      stroke="rgba(60, 230, 192, 0.8)"
                      strokeWidth="1"
                      fill="none"
                      opacity="0"
                    >
                      <animate 
                        attributeName="opacity" 
                        values="0;0.8;0" 
                        dur="0.6s" 
                        repeatCount="1" 
                      />
                      <animate 
                        attributeName="stroke-width" 
                        values="1;4;1" 
                        dur="0.6s" 
                        repeatCount="1" 
                      />
                    </path>
                  )}
                </g>
              )
            })}
            
            {/* 回退路径和标签 */}
            {hoveredBackflow && (() => {
              const fromNode = nodes[hoveredBackflow.from]
              const toNode = nodes[hoveredBackflow.to]
              
              // 计算绕开节点的路径
              let path = ''
              let textX = 0
              let textY = 0
              
              if (hoveredBackflow.from === 1 && hoveredBackflow.to === 0) {
                // B1: N2底部 → N1底部左侧25% (简化模型)
                const startX = fromNode.x + fromNode.width / 2
                const startY = fromNode.y + fromNode.height  
                const endX = toNode.x + toNode.width * 0.25  // 左侧25%位置
                const endY = toNode.y + toNode.height  
                // 从N2底部向下绕行，再向上到N1底部左侧
                const midY = startY + 60
                path = `M ${startX} ${startY} Q ${startX} ${midY} ${(startX + endX) / 2} ${midY} Q ${endX} ${midY} ${endX} ${endY}`
                textX = (startX + endX) / 2 + 15
                textY = startY + 48  // 文字显示在路径下方，预留间隔
                
              } else if (hoveredBackflow.from === 3 && hoveredBackflow.to === 2) {
                // B2: N4 → N3 (从N4底部到N3底部左侧25%位置)
                const startX = fromNode.x + fromNode.width / 2
                const startY = fromNode.y + fromNode.height
                const endX = toNode.x + toNode.width * 0.25  // N3底部边缘25%位置
                const endY = toNode.y + toNode.height
                path = `M ${startX} ${startY} 
                        Q ${(startX + endX) / 2} ${startY + 80} 
                        ${endX} ${endY}`
                textX = (startX + endX) / 2 + 65
                textY = startY + 38
              } else if (hoveredBackflow.from === 4 && hoveredBackflow.to === 2) {
                // B3: N5 → N3 (从外围上方)
                path = `M ${fromNode.x} ${fromNode.y + fromNode.height / 2} 
                        Q ${(fromNode.x + toNode.x) / 2} ${fromNode.y - 60} 
                        ${toNode.x + toNode.width} ${toNode.y + toNode.height / 2}`
                textX = (fromNode.x + toNode.x) / 2 + 40
                textY = fromNode.y - 10
              } else if (hoveredBackflow.from === 3 && hoveredBackflow.to === 1) {
                // B4: N4 → N2 (更换算法)
                const startX = fromNode.x + fromNode.width / 2
                const startY = fromNode.y + fromNode.height
                const endX = toNode.x + toNode.width / 2
                const endY = toNode.y + toNode.height
                
                // 使用适度的曲线路径：减少下探深度
                const deepY = Math.max(startY, endY) + 120
                const controlX = (startX + endX) / 2 + 100
                path = `M ${startX} ${startY} 
                        Q ${controlX} ${deepY} 
                        ${endX} ${endY}`
                textX = controlX - 50
                textY = deepY - 72
              } else {
                // B5: N5 → N1 (从外围上方大弧度)
                path = `M ${fromNode.x} ${fromNode.y} 
                        Q ${(fromNode.x + toNode.x) / 2} ${-20} 
                        ${toNode.x + toNode.width} ${toNode.y}`
                textX = (fromNode.x + toNode.x) / 2 + 30
                textY = 20
              }
              
              return (
                <g>
                  {/* 标签文字 - 只在动画的end和completed阶段显示 */}
                  {backflowAnimation && backflowAnimation.id === hoveredBackflow.id && (backflowAnimation.phase === 'end' || backflowAnimation.phase === 'completed') && (
                    <text
                      x={textX}
                      y={textY}
                      fill={hoveredBackflow.color}
                      fontSize="13"
                      fontWeight="500"
                      textAnchor="middle"
                      style={{
                        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                      }}
                    >
                      {hoveredBackflow.reason}
                    </text>
                  )}
                  
                  {/* 动画绘制虚线曲线 - 真正的从0%到100%逐渐绘制 */}
                  {backflowAnimation && backflowAnimation.id === hoveredBackflow.id && backflowAnimation.phase === 'flow' && (
                    <g key={`${hoveredBackflow.id}-${Date.now()}`}>
                      <defs>
                        <mask id={`progressMask-${hoveredBackflow.id}`}>
                          <rect width="100%" height="100%" fill="black"/>
                          <path
                            d={path}
                            stroke="white"
                            strokeWidth="4"
                            fill="none"
                            style={{
                              strokeDasharray: '2000',
                              strokeDashoffset: '2000',
                              animation: 'trulyDrawPath 1.0s linear forwards'
                            }}
                          />
                        </mask>
                      </defs>
                      {/* 虚线路径 - 使用mask来实现真正的逐渐绘制 */}
                      <path
                        d={path}
                        stroke={hoveredBackflow.color}
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="5,5"
                        mask={`url(#progressMask-${hoveredBackflow.id})`}
                        style={{
                          opacity: 0.8,
                          filter: `drop-shadow(0 0 6px ${hoveredBackflow.color}40)`
                        }}
                      />
                      {/* 箭头 - 虚线绘制完成后立即显示 */}
                      <path
                        d={path}
                        stroke="transparent"
                        strokeWidth="2"
                        fill="none"
                        markerEnd="url(#arrow-back)"
                        style={{
                          opacity: 0,
                          animationName: 'showArrow',
                          animationDuration: '0.1s',
                          animationTimingFunction: 'ease-out',
                          animationDelay: '0.3s',
                          animationFillMode: 'forwards'
                        }}
                      />
                    </g>
                  )}
                  
                  {/* 动画完成后持续显示的完整虚线 */}
                  {backflowAnimation && backflowAnimation.id === hoveredBackflow.id && (backflowAnimation.phase === 'end' || backflowAnimation.phase === 'completed') && (
                    <g>
                      {/* 完整虚线 */}
                      <path
                        d={path}
                        stroke={hoveredBackflow.color}
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="5,5"
                        markerEnd="url(#arrow-back)"
                        style={{
                          opacity: 0.8,
                          filter: `drop-shadow(0 0 6px ${hoveredBackflow.color}40)`
                        }}
                      />
                    </g>
                  )}
                  
                  
                </g>
              )
            })()}
          </svg>
          
          {/* 流程节点 */}
          {nodes.map((node, index) => {
            const isActive = activeFlow > index
            const isCurrent = activeFlow === index + 1 && activeFlow < 5 // 防止节点5持续发光
            const isBackflowFrom = backflowAnimation?.from === index && backflowAnimation.phase === 'start'
            const isBackflowTo = backflowAnimation?.to === index && backflowAnimation.phase === 'end'
            
            return (
              <div
                key={node.id}
                style={{
                  position: 'absolute',
                  left: node.x + 'px',
                  top: node.y + 'px',
                  width: node.width + 'px',
                  height: node.height + 'px',
                  padding: '20px',
                  background: isActive 
                    ? `linear-gradient(135deg, ${node.color}15 0%, ${node.color}08 100%)`
                    : node.bgColor,
                  border: '1px solid',
                  borderColor: isActive ? node.color : 'rgba(75, 85, 99, 0.15)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.5s ease',
                  transform: (isCurrent || isBackflowFrom || isBackflowTo) ? 'scale(1.08)' : hoveredNode === node.id ? 'scale(1.03)' : 'scale(1)',
                  boxShadow: (isCurrent || isBackflowFrom || isBackflowTo)
                    ? `0 10px 25px ${node.color}30, 0 0 25px ${node.color}25`
                    : hoveredNode === node.id 
                    ? `0 8px 16px rgba(0, 0, 0, 0.1)` 
                    : '0 4px 8px rgba(0, 0, 0, 0.05)',
                  zIndex: (isCurrent || isBackflowFrom || isBackflowTo) ? 10 : 1
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => handleStageChange('stage' + (index + 1))}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: (isActive || isBackflowFrom || isBackflowTo) ? node.color : 'rgba(75, 85, 99, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: (isActive || isBackflowFrom || isBackflowTo) ? 'white' : 'rgba(229, 231, 235, 0.7)'
                  }}>
                    {index + 1}
                  </div>
                </div>
                <h4 style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: (isActive || isBackflowFrom || isBackflowTo) ? node.color : 'rgba(229, 231, 235, 0.9)',
                  margin: '0 0 6px 0',
                  textAlign: 'center'
                }}>
                  {node.label}
                </h4>
                <p style={{
                  fontSize: '12px',
                  color: 'rgba(156, 163, 175, 0.85)',
                  margin: 0,
                  textAlign: 'center',
                  lineHeight: '1.4'
                }}>
                  {node.desc}
                </p>
              </div>
            )
          })}
        </div>
        
        {/* 悬浮标签按钮区域 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '20px',
          background: 'rgba(15, 23, 42, 0.3)',
          borderRadius: '12px',
          border: '1px solid rgba(75, 85, 99, 0.15)'
        }}>
          <div style={{ 
            textAlign: 'center',
            fontSize: '14px', 
            color: 'rgba(156, 163, 175, 0.8)', 
            fontWeight: '600',
            letterSpacing: '0.5px'
          }}>
            回退处理机制
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '12px'
          }}>
            {backflowPaths.map((path, index) => (
              <div key={path.id} style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <button
                  style={{
                    width: '100%',
                    padding: '10px 8px',
                    fontSize: '12px',
                    background: hoveredBackflow?.id === path.id 
                      ? `linear-gradient(135deg, ${path.color}15 0%, ${path.color}08 100%)`
                      : 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid',
                    borderColor: hoveredBackflow?.id === path.id ? path.color : 'rgba(75, 85, 99, 0.3)',
                    borderRadius: '8px',
                    color: hoveredBackflow?.id === path.id ? path.color : 'rgba(229, 231, 235, 0.9)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}
                  onMouseEnter={(e) => {
                    setHoveredBackflow(path)
                    
                    // 直接使用按钮的绝对位置
                    const buttonRect = e.currentTarget.getBoundingClientRect()
                    const buttonCenterX = buttonRect.left + buttonRect.width / 2
                    
                    // 找到右侧内容面板作为定位基准
                    const flowchartContainer = e.currentTarget.closest('.flowchart-container')
                    const rightContentPanel = flowchartContainer.querySelector('.flex-1 > div') // 右侧内容面板
                    const rightPanelRect = rightContentPanel ? rightContentPanel.getBoundingClientRect() : { left: 0 }
                    const relativeLeft = buttonCenterX - rightPanelRect.left
                    
                    // 使用一个临时的初始位置，之后会在DOM更新后修正
                    setTooltipInfo({ 
                      path, 
                      index, 
                      buttonLeft: relativeLeft, // 临时位置
                      buttonCenterX: buttonCenterX // 保存按钮中心坐标供后续计算使用
                    })
                    triggerBackflowAnimation(path)
                    
                  }}
                  onMouseLeave={() => {
                    setHoveredBackflow(null)
                    setBackflowAnimation(null)
                    setTooltipInfo(null)
                  }}
                >
                  {path.label}
                </button>
                <div style={{
                  fontSize: '10px',
                  color: 'rgba(156, 163, 175, 0.6)',
                  textAlign: 'center',
                  lineHeight: '1.3'
                }}>
                  {`N${path.from + 1}→N${path.to + 1}`}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 气泡提示 */}
        {tooltipInfo && (() => {
          // 在渲染后立即修正位置
          setTimeout(() => {
            const tooltipElement = document.querySelector('.tooltip-bubble')
            if (tooltipElement && tooltipElement.offsetParent && tooltipInfo.buttonCenterX) {
              const offsetParentRect = tooltipElement.offsetParent.getBoundingClientRect()
              const correctLeft = tooltipInfo.buttonCenterX - offsetParentRect.left
              tooltipElement.style.left = `${correctLeft}px`
            }
          }, 0)
          
          return (
            <div
              className="tooltip-bubble"
              style={{
                position: 'absolute',
                left: `${tooltipInfo.buttonLeft}px`,
                bottom: '146px',
                transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.95)',
              border: `1px solid ${tooltipInfo.path.color}`,
              borderRadius: '8px',
              padding: '12px 16px',
              minWidth: '260px',
              maxWidth: '280px',
              zIndex: 100,
              animation: 'fadeIn 0.3s ease',
              boxShadow: `0 4px 12px rgba(0, 0, 0, 0.3), 0 0 20px ${tooltipInfo.path.color}20`
            }}
          >
            <div style={{
              fontSize: '13px',
              color: tooltipInfo.path.color,
              fontWeight: '600',
              marginBottom: '6px'
            }}>
              {tooltipInfo.path.label}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(229, 231, 235, 0.9)',
              lineHeight: '1.5'
            }}>
              {tooltipInfo.path.explanation}
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: '-6px',
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                width: '12px',
                height: '12px',
                background: 'rgba(15, 23, 42, 0.95)',
                borderRight: `1px solid ${tooltipInfo.path.color}`,
                borderBottom: `1px solid ${tooltipInfo.path.color}`,
                borderTop: 'none',
                borderLeft: 'none'
              }}
            />
          </div>
          )
        })()}
        
        {/* 动画样式 */}
        <style>{`
          @keyframes flowAnimation {
            to { stroke-dashoffset: -10; }
          }
          @keyframes flowBackAnimation {
            to { stroke-dashoffset: 10; }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateX(-50%) translateY(5px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
          @keyframes trulyDrawPath {
            from { 
              stroke-dashoffset: 2000;
            }
            to { 
              stroke-dashoffset: 0;
            }
          }
          @keyframes showArrow {
            from { 
              opacity: 0;
            }
            to { 
              opacity: 1;
            }
          }
        `}</style>
      </div>
    )
  }

  // 渲染阶段内容
  const renderStageContent = () => {
    const content = stageContent[currentStage]
    if (!content) return null

    // 总览页面特殊处理
    if (currentStage === 'overview') {
      return renderOverviewFlowchart()
    }

    return (
      <div className="stage-content" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 标题区 - 仅在非总览页面显示 */}
        {content.title && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ 
              fontSize: '32px', 
              fontWeight: '700', 
              color: '#E8EAED',
              marginBottom: '8px',
              letterSpacing: '-0.5px'
            }}>
              {content.title}
            </h2>
            {content.subtitle && (
              <p style={{ 
                fontSize: '16px', 
                color: 'rgba(156, 163, 175, 0.9)',
                fontWeight: '400'
              }}>
                {content.subtitle}
              </p>
            )}
          </div>
        )}

        {/* 卡片网格 */}
        <div style={{ 
          flex: 1,
          display: 'grid',
          gridTemplateColumns: content.cards.length === 3 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
          gap: '20px'
        }}>
          {content.cards.map(card => renderCard(card, currentStage))}
        </div>
      </div>
    )
  }

  return (
    <section
      ref={sectionRef}
      id={id}
      className="snap-section relative overflow-hidden"
      style={{ 
        backgroundColor: 'var(--bg-deep)',
        minHeight: '100vh',
        paddingTop: '60px',
        paddingBottom: '20px'
      }}
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute rounded-full opacity-30"
          style={{
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
            top: '-10%',
            left: '-15%',
            filter: 'blur(100px)'
          }}
        />
        <div 
          className="absolute rounded-full opacity-30"
          style={{
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(60, 230, 192, 0.1) 0%, transparent 70%)',
            bottom: '-20%',
            right: '-10%',
            filter: 'blur(120px)'
          }}
        />
      </div>

      {/* 内容容器 - 95%宽度 */}
      <div className="relative z-10 h-full mx-auto" style={{ width: '95%', maxWidth: '1600px' }}>
        {/* 主要内容区域 */}
        <div className="flex gap-8" style={{ height: 'calc(100vh - 100px)' }}>
          {/* 左侧导航（25%） */}
          <div className="w-1/4" style={{ minWidth: '280px', maxWidth: '340px' }}>
            <div 
              className="h-full rounded-2xl backdrop-blur-sm overflow-hidden relative"
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(75, 85, 99, 0.15)',
                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
              }}
            >
              {/* 装饰元素 */}
              <div className="absolute top-0 left-0 w-full h-32 opacity-10" 
                style={{
                  background: 'radial-gradient(ellipse at top left, var(--tech-mint) 0%, transparent 60%)'
                }}
              />
              <div className="absolute bottom-0 right-0 w-48 h-48 opacity-5" 
                style={{
                  background: 'radial-gradient(circle, var(--tech-blue) 0%, transparent 70%)',
                  filter: 'blur(40px)'
                }}
              />
              
              {/* 标题区域 */}
              <div className="p-6 pb-4 relative">
                {/* 标题 */}
                <div style={{
                  textAlign: 'center',
                  marginBottom: '24px'
                }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#E8EAED',
                    letterSpacing: '0.5px'
                  }}>
                    通用优化求解流程
                  </h3>
                </div>
                
                {/* 分隔线 */}
                <div style={{
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(75, 85, 99, 0.2) 50%, transparent 100%)',
                  marginBottom: '24px'
                }}/>
                
                <div className="relative">
                  {/* 流程连接线 */}
                  <div style={{
                    position: 'absolute',
                    left: '12px',
                    top: '40px',
                    bottom: '40px',
                    width: '2px',
                    background: 'linear-gradient(180deg, rgba(60, 230, 192, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                    zIndex: 0
                  }}/>
                  
                  <div className="space-y-3 relative">
                  {navigationItems.map((item, index) => {
                    const isActive = currentStage === item.id
                    const isOverview = item.id === 'overview'
                    
                    return (
                      <button
                        key={item.id}
                        className="nav-item w-full text-left rounded-xl transition-all duration-300 relative"
                        onClick={() => handleStageChange(item.id)}
                        style={{
                          padding: isOverview ? '16px 16px 16px 36px' : '18px 18px 18px 36px',
                          minHeight: isOverview ? '60px' : '84px',
                          background: isActive 
                            ? 'rgba(60, 230, 192, 0.06)'
                            : 'transparent',
                          border: '1px solid',
                          borderColor: isActive 
                            ? 'rgba(60, 230, 192, 0.2)' 
                            : 'transparent',
                          transform: isActive ? 'scale(1)' : 'scale(1)',
                          boxShadow: isActive 
                            ? 'inset 0 1px 0 rgba(255,255,255,0.03)' 
                            : 'none',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'rgba(75, 85, 99, 0.08)'
                            e.currentTarget.style.transform = 'translateX(2px)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.transform = 'translateX(0)'
                          }
                        }}
                      >
                        {/* 流程节点 */}
                        <div style={{
                          position: 'absolute',
                          left: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: isActive ? '14px' : '8px',
                          height: isActive ? '14px' : '8px',
                          borderRadius: '50%',
                          backgroundColor: isActive ? 'var(--tech-mint)' : 'rgba(75, 85, 99, 0.5)',
                          border: isActive ? '2px solid rgba(60, 230, 192, 0.3)' : 'none',
                          boxShadow: isActive ? '0 0 16px rgba(60, 230, 192, 0.5)' : 'none',
                          transition: 'all 0.3s ease',
                          zIndex: 1
                        }}/>
                        
                        {/* 内容区 */}
                        <div className="flex items-center justify-between h-full">
                          <div className="flex-1">
                            <div style={{ 
                              fontSize: isOverview ? '16px' : '15px',
                              fontWeight: isActive ? '600' : '500',
                              color: isActive ? 'var(--tech-mint)' : 'rgba(229, 231, 235, 0.95)',
                              marginBottom: item.stage ? '8px' : '0',
                              lineHeight: '1.4',
                              transition: 'all 0.3s ease'
                            }}>
                              {item.label}
                            </div>
                            {item.stage && (
                              <div style={{ 
                                fontSize: '13px',
                                color: isActive ? 'rgba(156, 163, 175, 0.9)' : 'rgba(156, 163, 175, 0.75)',
                                lineHeight: '1.5',
                                letterSpacing: '0.3px',
                                transition: 'all 0.3s ease',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}>
                                {item.stage}
                              </div>
                            )}
                          </div>
                          
                          {/* 右侧箭头 */}
                          {isActive && (
                            <div className="ml-3" style={{ transition: 'all 0.3s ease' }}>
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path 
                                  d="M6 4L10 8L6 12" 
                                  stroke="var(--tech-mint)" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                  opacity="0.7"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧内容面板（75%） */}
          <div className="flex-1">
            <div 
              className="h-full rounded-2xl backdrop-blur-sm p-8"
              style={{
                background: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid rgba(75, 85, 99, 0.15)',
                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
              }}
            >
              {renderStageContent()}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Section5Workflow