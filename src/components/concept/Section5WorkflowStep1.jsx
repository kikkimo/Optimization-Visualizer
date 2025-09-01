import React, { useRef, useEffect, useState } from 'react'
import katex from 'katex'

import MixedVariableAnimation from './animations/MixedVariableAnimation'
import SetConstraintAnimation from './animations/SetConstraintAnimation'
const Section5WorkflowStep1 = () => {
  // Stage1 Canvas 动画状态
  const [activeCard, setActiveCard] = useState(1) // 当前活跃的卡片 1-4
  const [activeExample, setActiveExample] = useState(0) // 当前活跃的胶囊索引
  const [animationState, setAnimationState] = useState('Idle@Card1') // 动画状态机
  const [isPlaying, setIsPlaying] = useState(false) // 是否正在播放
  const [constraintAnimationInfo, setConstraintAnimationInfo] = useState(null) // 约束动画状态信息
  const canvasRef = useRef(null)
  const katexRef = useRef(null) // KaTeX渲染元素引用

  // Stage1 卡片数据定义
  const stage1Cards = [
    {
      id: 1,
      title: '① 定义目标 (Define Objective)',
      subtitle: '明确优化的最终目的是什么？',
      examples: ['最小化误差', '最大化覆盖', '最短时间', '最大置信度']
    },
    {
      id: 2,
      title: '② 确定变量 (Identify Variables)',
      subtitle: '我们能够控制或改变的决策量是什么？并确定其类型。',
      examples: ['连续变量（位姿/点坐标/参数）', '离散变量（选址/路径/布设）', '混合变量（整数开关 + 连续参数）']
    },
    {
      id: 3,
      title: '③ 构建函数 (Formulate Functions)',
      subtitle: '将目标和约束量化为数学表达。',
      examples: ['目标函数 f(x) / 代价', '等式约束 g(x)=0', '不等式约束 h(x)≤0', '集合/结构约束（拓扑/锥/半定）', '正则项 R(x)（L1/L2/TV）']
    },
    {
      id: 4,
      title: '④ 问题画像 (Profile the Problem)',
      subtitle: '根据以上定义，为问题"画像"，明确其所属范式。',
      examples: [], // 无例举，使用标签
      labels: ['NLLS/BA', 'QP/QCQP/SOCP', 'MILP/MDP', 'MRF/Graph-Cut', 'Deep NN', 'PDE-OPT']
    }
  ]

  // 处理卡片点击
  const handleCardClick = (cardId) => {
    // 切换到新卡片
    setActiveCard(cardId)
    
    // 如果是确定变量卡片(cardId=2)，默认选中混合变量胶囊(index=2)
    if (cardId === 2) {
      setActiveExample(2)
    } else if (cardId === 3) {
      // 如果是构建函数卡片(cardId=3)，默认选中集合/结构约束胶囊(index=3)
      setActiveExample(3)
    } else {
      // 其他卡片重置活跃胶囊为第一个
      setActiveExample(0)
    }
    
    setIsPlaying(false)
    
    // 不自动播放，只切换静态显示
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      drawCurrentCardStaticScene(ctx, width, height, true) // 初次进入状态
    }
  }

  // 处理胶囊点击
  const handleExampleClick = async (cardId, exampleIndex) => {
  
  // 如果是确定变量卡片(cardId=2)，始终强制选择混合变量胶囊(index=2)，不允许切换
  if (cardId === 2) {
    // 检查是否需要停止动画：如果当前不是该卡片和胶囊的组合，则停止动画
    const isDifferentSelection = activeCard !== cardId || activeExample !== 2
    
    if (isDifferentSelection && isPlaying) {
      // 停止当前动画
      if (animationControllerRef.current) {
        animationControllerRef.current.abort()
        animationControllerRef.current = null
      }
      setAnimationShouldStop(true)
      setIsPlaying(false)
      setIsPlayingCoverage(false)
      
      // 等待动画完全停止，确保状态同步
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // 立即重置停止信号，准备下次播放
      setAnimationShouldStop(false)
    }
    
    setActiveCard(cardId)
    setActiveExample(2) // 强制设置为混合变量胶囊索引
    
    // 立即绘制对应的静态场景（由函数内部决定是初次进入还是保持动画结束状态）
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      drawCurrentCardStaticScene(ctx, width, height, true) // 传入true表示是胶囊切换触发的绘制
    }
    
    // 移除自动播放动画的调用
    // playSpecificExample(cardId, 2)
    return // 直接返回，不执行后续逻辑
  }
  
  // 如果是构建函数卡片(cardId=3)，只允许集合/结构约束(index=3)和正则项(index=4)点击
  if (cardId === 3 && exampleIndex !== 3 && exampleIndex !== 4) {
    // 不允许的胶囊点击，直接返回，不做任何响应
    return
  }
  
  // 检查是否需要停止动画：如果点击的是不同的卡片或胶囊组合，则停止当前动画
  const isDifferentSelection = activeCard !== cardId || activeExample !== exampleIndex
  
  if (isDifferentSelection && isPlaying) {
    // 停止当前动画
    if (animationControllerRef.current) {
      animationControllerRef.current.abort()
      animationControllerRef.current = null
    }
    setAnimationShouldStop(true)
    setIsPlaying(false)
    setIsPlayingCoverage(false)
    
    // 等待动画完全停止，确保状态同步
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 立即重置停止信号，准备下次播放
    setAnimationShouldStop(false)
  }
  
  // 对于其他卡片，保持原有逻辑
  // 立即更新状态
    新卡片: cardId,
    新胶囊: exampleIndex
  })
  setActiveCard(cardId)
  setActiveExample(exampleIndex)
  
  // 如果点击的是覆盖动画胶囊，更新覆盖方案状态
  if (cardId === 1 && exampleIndex === 1) {
    setCurrentCoveragePlan('B') // 默认显示最优方案B (站点3,5,6 - 75.33%)
  }
  
  // 如果点击的是置信度动画胶囊，更新置信度方案状态
  if (cardId === 1 && exampleIndex === 3) {
    setCurrentConfidenceScheme('B') // 默认显示最优方案B (95.2%)
  }
  
  // 立即绘制对应的静态场景（由函数内部决定是初次进入还是保持动画结束状态）
  const canvas = canvasRef.current
  if (canvas) {
    const ctx = canvas.getContext('2d')
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    drawCurrentCardStaticScene(ctx, width, height, true) // 传入true表示是胶囊切换触发的绘制
  }
  
  // 移除自动播放动画的调用
  // playSpecificExample(cardId, exampleIndex)
}

  // 播放特定胶囊的动画
  const playSpecificExample = async (cardId, exampleIndex) => {
      卡片ID: cardId,
      胶囊索引: exampleIndex,
      当前播放状态: isPlaying,
      动画应该停止: animationShouldStop,
      动画控制器存在: !!animationControllerRef.current
    })
    
    // 1. 先取消之前的动画控制器
    if (animationControllerRef.current) {
      animationControllerRef.current.abort()
      animationControllerRef.current = null
    }
    
    // 2. 彻底停止所有当前动画状态
    setAnimationShouldStop(true)
    setIsPlaying(false)
    setIsPlayingCoverage(false)
    
    // 3. 等待足够长的时间让动画完全停止
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 4. 创建新的动画控制器
    animationControllerRef.current = new AbortController()
    
    // 5. 重置停止信号，准备开始新动画
    setAnimationShouldStop(false)
    
    setIsPlaying(true)
    setAnimationState(`Playing@Card${cardId}[${exampleIndex + 1}]`)
    
      卡片ID: cardId,
      胶囊索引: exampleIndex,
      播放状态已设置为: true
    })
    
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    
    const ctx = canvas.getContext('2d')
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    
    
    // 根据卡片和例举索引播放对应动画
    try {
      const signal = animationControllerRef.current?.signal
      
      switch (cardId) {
        case 1:
          if (exampleIndex === 0) {
          } else if (exampleIndex === 1) {
          } else if (exampleIndex === 2) {
          } else if (exampleIndex === 3) {
          }
          await playCard1SpecificScene(ctx, width, height, exampleIndex, signal)
          break
        case 2:
          await playCard2SpecificScene(ctx, width, height, exampleIndex, signal)
          break
        case 3:
          await playCard3SpecificScene(ctx, width, height, exampleIndex, signal)
          break
        case 4:
          await playCard4Scene(ctx, width, height, signal)
          break
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return
      }
    }
    
      卡片ID: cardId,
      胶囊索引: exampleIndex
    })
    
    setIsPlaying(false)
    setAnimationState(`Idle@Card${cardId}`)
    
    // 记录当前胶囊已播放过动画
    const animationKey = `${cardId}-${exampleIndex}`
    setHasPlayedAnimation(prev => ({
      ...prev,
      [animationKey]: true
    }))
    
    // 动画结束后，绘制对应胶囊的静态场景（动画结束状态，保持方案信息）
    drawCurrentCardStaticScene(ctx, width, height, false) // 动画结束状态
  }

  // 绘制当前卡片的静态场景
  const drawCurrentCardStaticScene = (ctx, width, height, isInitialState = true) => {
    // 强制清除画布
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, width, height)
    
    // 检查当前胶囊是否播放过动画
    const currentAnimationKey = `${activeCard}-${activeExample}`
    const hasPlayedCurrentAnimation = hasPlayedAnimation[currentAnimationKey] || false
    
    // 检测是否是胶囊切换
    const isSwitching = currentAnimationKey !== lastActiveKey
    if (isSwitching) {
      // 更新上一次活动的胶囊键
      setLastActiveKey(currentAnimationKey)
    }
    
      活动卡片: activeCard,
      活动胶囊: activeExample,
      是否初次进入: isInitialState,
      当前胶囊是否播放过动画: hasPlayedCurrentAnimation,
      动画键: currentAnimationKey,
      上次动画键: lastActiveKey,
      是否胶囊切换: isSwitching
    })
    
    switch (activeCard) {
      case 1:
        // 根据当前胶囊显示不同的静态场景
        if (activeExample === 0) {
          // 最小化误差动画的静态场景
          if ((isInitialState && isSwitching) || (isInitialState && !hasPlayedCurrentAnimation)) {
            drawMinimizeErrorInitialScene(ctx, width, height)
          } else {
            drawCard1Scene1(ctx, width, height)
          }
        } else if (activeExample === 1) {
          // 最大化覆盖率动画的静态场景
          if ((isInitialState && isSwitching) || (isInitialState && !hasPlayedCurrentAnimation)) {
            drawCoverageInitialScene(ctx, width, height)
          } else {
            drawCoverageStaticScene(ctx, width, height)
          }
        } else if (activeExample === 2) {
          // 最短时间动画的静态场景
          if ((isInitialState && isSwitching) || (isInitialState && !hasPlayedCurrentAnimation)) {
            drawTimeOptInitialScene(ctx, width, height)
          } else {
            drawTimeOptStaticScene(ctx, width, height)
          }
        } else if (activeExample === 3) {
          // 最大置信度动画的静态场景
          if ((isInitialState && isSwitching) || (isInitialState && !hasPlayedCurrentAnimation)) {
            drawConfidenceInitialScene(ctx, width, height)
          } else {
            drawConfidenceStaticScene(ctx, width, height)
          }
        } else {
          // 其他情况，默认显示最小化误差
          if ((isInitialState && isSwitching) || (isInitialState && !hasPlayedCurrentAnimation)) {
            drawMinimizeErrorInitialScene(ctx, width, height)
          } else {
            drawCard1Scene1(ctx, width, height)
          }
        }
        break
      case 2:
        // 根据当前胶囊显示不同的静态场景
        switch (activeExample) {
          case 0:
            drawCard2Scene1(ctx, width, height) // 连续变量
            break
          case 1:
            drawCard2Scene2(ctx, width, height) // 离散变量
            break
          case 2:
            // 混合变量胶囊由MixedVariableAnimation组件自己处理，不在这里绘制
            break
          default:
            drawCard2Scene1(ctx, width, height)
        }
        break
      case 3:
        // 根据当前胶囊显示不同的静态场景
        switch (activeExample) {
          case 0:
            drawCard3Scene1(ctx, width, height) // 目标函数 f(x) / 代价
            break
          case 1:
            drawCard3Scene2(ctx, width, height) // 等式约束 g(x)=0
            break
          case 2:
            drawCard3Scene3(ctx, width, height) // 不等式约束 h(x)≤0
            break
          case 3:
            drawCard3Scene4(ctx, width, height) // 集合/结构约束
            break
          case 4:
            drawCard3Scene5(ctx, width, height) // 正则项 R(x)
            break
          default:
            drawCard3Scene1(ctx, width, height)
        }
        break
      case 4:
        // 卡片4没有静态场景，显示标题
        drawText(ctx, '问题画像 (Profile the Problem)', width/2, height/2, {
          fontSize: 18,
          align: 'center',
          color: '#1A202C'
        })
        drawText(ctx, '点击右侧卡片或播放按钮查看画像流程', width/2, height/2 + 30, {
          fontSize: 14,
          align: 'center',
          color: '#718096'
        })
        break
      default:
        if ((isInitialState && isSwitching) || (isInitialState && !hasPlayedCurrentAnimation)) {
          drawMinimizeErrorInitialScene(ctx, width, height)
        } else {
          drawCard1Scene1(ctx, width, height)
        }
    }
  }

  // Canvas 初始化和动画框架
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    
    // 设置Canvas分辨率
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = rect.width + 'px'
    canvas.style.height = rect.height + 'px'
    
    // 绘制初始状态（根据当前活跃卡片）
    // 混合变量胶囊由MixedVariableAnimation组件处理，不在这里绘制
    if (!(activeCard === 2 && activeExample === 2)) {
      drawCurrentCardStaticScene(ctx, rect.width, rect.height)
    } else {
    }
    
    // 窗口大小变化时重新初始化
    const handleResize = () => {
      const newRect = canvas.getBoundingClientRect()
      canvas.width = newRect.width * dpr
      canvas.height = newRect.height * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = newRect.width + 'px'
      canvas.style.height = newRect.height + 'px'
      
      // 重绘当前状态
      if (animationState.startsWith('Idle')) {
        // 混合变量胶囊由MixedVariableAnimation组件处理，不在这里绘制
        if (!(activeCard === 2 && activeExample === 2)) {
          drawCurrentCardStaticScene(ctx, newRect.width, newRect.height)
        } else {
        }
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [animationState, activeCard, activeExample])

  // 播放特定场景的函数
  const playCard1SpecificScene = async (ctx, width, height, sceneIndex, signal) => {
    switch (sceneIndex) {
      case 0: return await playCard1Scene1(ctx, width, height, signal)
      case 1: return await playCard1Scene2(ctx, width, height, signal)  
      case 2: return await playCard1Scene3(ctx, width, height, signal)
      case 3: return await playCard1Scene4(ctx, width, height, signal)
      default: return await playCard1Scene1(ctx, width, height, signal)
    }
  }

  const playCard2SpecificScene = async (ctx, width, height, sceneIndex, signal) => {
    switch (sceneIndex) {
      case 0: return await playCard2Scene1(ctx, width, height, signal)
      case 1: return await playCard2Scene2(ctx, width, height, signal)
      case 2: return await playCard2Scene3(ctx, width, height, signal)
      default: return await playCard2Scene1(ctx, width, height, signal)
    }
  }

  const playCard3SpecificScene = async (ctx, width, height, sceneIndex, signal) => {
    switch (sceneIndex) {
      case 0: return await playCard3Scene1(ctx, width, height)
      case 1: return await playCard3Scene2(ctx, width, height)
      case 2: return await playCard3Scene3(ctx, width, height)
      case 3: return await playCard3Scene4(ctx, width, height, signal)
      case 4: return await playCard3Scene5(ctx, width, height)
      default: return await playCard3Scene1(ctx, width, height)
    }
  }

  // 绘制工具函数
  const roundRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }
  
  const drawText = (ctx, text, x, y, options = {}) => {
    const {
      fontSize = 14,
      fontFamily = 'Arial, sans-serif',
      color = '#1A202C',
      align = 'left',
      baseline = 'top'
    } = options
    
    ctx.font = `${fontSize}px ${fontFamily}`
    ctx.fillStyle = color
    ctx.textAlign = align
    ctx.textBaseline = baseline
    ctx.fillText(text, x, y)
  }

  const drawCircle = (ctx, x, y, radius, options = {}) => {
    const {
      fillColor = '#2B6CB0',
      strokeColor = null,
      strokeWidth = 1
    } = options
    
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    
    if (fillColor) {
      ctx.fillStyle = fillColor
      ctx.fill()
    }
    
    if (strokeColor) {
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = strokeWidth
      ctx.stroke()
    }
  }

  // 基础线条绘制函数
  const drawBasicLine = (ctx, x1, y1, x2, y2, options = {}) => {
    const {
      color = '#1A202C',
      width = 2,
      dash = null
    } = options
    
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.strokeStyle = color
    ctx.lineWidth = width
    
    if (dash) {
      ctx.setLineDash(dash)
    } else {
      ctx.setLineDash([])
    }
    
    ctx.stroke()
  }


  // 固定数据点（围绕最佳拟合线的轻噪声样本）
  const dataPoints = [
    { x: 0.5, y: 1.88 }, { x: 1.0, y: 2.39 }, { x: 1.5, y: 3.23 }, { x: 2.0, y: 3.79 }, { x: 2.5, y: 4.67 },
    { x: 3.0, y: 5.28 }, { x: 3.5, y: 6.11 }, { x: 4.0, y: 6.67 }, { x: 4.5, y: 7.48 }, { x: 5.0, y: 8.13 }
  ]

  // 候选直线定义
  const candidateLines = [
    { a: 1.42, b: 1.05, rss: 0.0528, color: '#3B82F6', label: 'L1' }, // 最佳拟合线
    { a: 1.30, b: 2.20, rss: 6.9126, color: '#6B7280', label: 'L2' },
    { a: 1.60, b: 0.80, rss: 1.3271, color: '#6B7280', label: 'L3' },
    { a: 1.10, b: 1.20, rss: 7.5306, color: '#6B7280', label: 'L4' }
  ]
  // ===== 最大化覆盖动画数据配置 =====
  
  // 目标区域多边形（顺时针）
  const targetRegionPolygon = [
    {x: 0.8, y: 0.8}, {x: 9.2, y: 0.8}, {x: 9.2, y: 5.4}, {x: 7.6, y: 5.4},
    {x: 7.0, y: 4.2}, {x: 3.2, y: 4.2}, {x: 2.6, y: 5.4}, {x: 0.8, y: 5.4}
  ]

  // 候选站点配置
  const candidateSites = [
    {id: 1, x: 1.3, y: 1.2, type: 'circle', radius: 2.0},
    {id: 2, x: 2.9, y: 1.0, type: 'circle', radius: 2.0},
    {id: 3, x: 4.8, y: 2.8, type: 'circle', radius: 2.0},
    {id: 4, x: 6.6, y: 1.2, type: 'circle', radius: 2.0},
    {id: 5, x: 8.4, y: 2.2, type: 'circle', radius: 2.0},
    {id: 6, x: 2.0, y: 4.6, type: 'circle', radius: 2.0},
    {id: 7, x: 6.9, y: 4.0, type: 'circle', radius: 2.0},
    {id: 8, x: 8.7, y: 4.6, type: 'circle', radius: 2.0}
  ]

  // 候选方案配置（基于准确计算的结果）
  const coveragePlans = [
    {id: 'A', sites: [1, 3, 5], coverage: 73.09, description: '重叠适中，右侧覆盖良好。'},
    {id: 'B', sites: [3, 5, 6], coverage: 75.33, description: '左上、中部、右下覆盖良好。', isOptimal: true},
    {id: 'C', sites: [2, 3, 5], coverage: 70.58, description: '中心区域较好，边缘覆盖不足。'},
    {id: 'D', sites: [3, 6, 7], coverage: 68.56, description: '左上和中下覆盖，右侧有空白。'}
  ]

  // 覆盖动画状态
  const [currentCoveragePlan, setCurrentCoveragePlan] = useState('B')
  const [coverageAnimationState, setCoverageAnimationState] = useState('Idle@PlanB')
  const [isPlayingCoverage, setIsPlayingCoverage] = useState(false)
  const [animationShouldStop, setAnimationShouldStop] = useState(false) // 动画停止信号
  const [hasPlayedAnimation, setHasPlayedAnimation] = useState({}) // 记录每个胶囊是否播放过动画 格式: {`${cardId}-${exampleIndex}`: true}
  const [lastActiveKey, setLastActiveKey] = useState(`${1}-${0}`) // 记录上一次活动的胶囊键，用于检测胶囊切换
  
  // 覆盖动画手动平移量配置
  const coverageOffsetX = 6  // X方向平移量
  const coverageOffsetY = 20 // Y方向平移量
  
  // 统一的动画控制器
  const animationControllerRef = useRef(null)
  
  // 清理函数，在组件卸载时取消所有动画
  useEffect(() => {
    return () => {
      if (animationControllerRef.current) {
        animationControllerRef.current.abort()
        animationControllerRef.current = null
      }
    }
  }, [])

  // 坐标转换函数 - 从(0,0)原点开始
  const getCanvasCoords = (dataX, dataY, marginX, marginY, chartWidth, chartHeight) => {
    // X轴：从0到6的范围
    const canvasX = marginX + (dataX / 6) * chartWidth
    // Y轴：从0到10的范围，Y轴向上为正
    const canvasY = marginY + chartHeight - (dataY / 10) * chartHeight
    return { x: canvasX, y: canvasY }
  }
  // 覆盖动画专用坐标转换函数 - x:[0,10], y:[0,6]
  const getCoverageCanvasCoords = (dataX, dataY, marginX, marginY, chartWidth, chartHeight) => {
    const canvasX = marginX + (dataX / 10) * chartWidth
    const canvasY = marginY + chartHeight - (dataY / 6) * chartHeight
    return { x: canvasX, y: canvasY }
  }

  // 绘制网格
  const drawGrid = (ctx, marginX, marginY, chartWidth, chartHeight) => {
    // 次级网格（每0.5单位）
    ctx.strokeStyle = '#374151'
    ctx.globalAlpha = 0.4
    ctx.lineWidth = 1
    
    // 垂直次级网格 - 从x=0.5开始到x=6
    for (let x = 0.5; x <= 6; x += 0.5) {
      const canvasX = marginX + (x / 6) * chartWidth
      ctx.beginPath()
      ctx.moveTo(canvasX, marginY)
      ctx.lineTo(canvasX, marginY + chartHeight)
      ctx.stroke()
    }
    
    // 水平次级网格 - 从y=0.5开始到y=10
    for (let y = 0.5; y <= 10; y += 0.5) {
      const canvasY = marginY + chartHeight - (y / 10) * chartHeight
      ctx.beginPath()
      ctx.moveTo(marginX, canvasY)
      ctx.lineTo(marginX + chartWidth, canvasY)
      ctx.stroke()
    }
    
    // 主网格（每1.0单位）
    ctx.strokeStyle = '#4B5563'
    ctx.globalAlpha = 0.7
    ctx.lineWidth = 1.5
    
    // 垂直主网格 - 从x=1开始到x=6
    for (let x = 1; x <= 6; x += 1) {
      const canvasX = marginX + (x / 6) * chartWidth
      ctx.beginPath()
      ctx.moveTo(canvasX, marginY)
      ctx.lineTo(canvasX, marginY + chartHeight)
      ctx.stroke()
    }
    
    // 水平主网格 - 从y=1开始到y=10
    for (let y = 1; y <= 10; y += 1) {
      const canvasY = marginY + chartHeight - (y / 10) * chartHeight
      ctx.beginPath()
      ctx.moveTo(marginX, canvasY)
      ctx.lineTo(marginX + chartWidth, canvasY)
      ctx.stroke()
    }
    
    ctx.globalAlpha = 1
  }

  // 绘制坐标轴
  const drawAxes = (ctx, marginX, marginY, width, height, chartWidth, chartHeight) => {
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 2.5
    
    // 原点坐标 (0,0)
    const originX = marginX
    const originY = marginY + chartHeight
    
    // X轴 - 从原点到x=6
    ctx.beginPath()
    ctx.moveTo(originX, originY)
    ctx.lineTo(marginX + chartWidth + 8, originY)
    ctx.stroke()
    
    // X轴箭头
    ctx.beginPath()
    ctx.moveTo(marginX + chartWidth, originY - 6)
    ctx.lineTo(marginX + chartWidth + 8, originY)
    ctx.lineTo(marginX + chartWidth, originY + 6)
    ctx.stroke()
    
    // Y轴 - 从原点到y=10
    ctx.beginPath()
    ctx.moveTo(originX, originY)
    ctx.lineTo(originX, marginY - 8)
    ctx.stroke()
    
    // Y轴箭头
    ctx.beginPath()
    ctx.moveTo(originX - 6, marginY + 8)
    ctx.lineTo(originX, marginY - 8)
    ctx.lineTo(originX + 6, marginY + 8)
    ctx.stroke()
    
    // 轴标签 - 跟随坐标轴平移量调整位置
    ctx.fillStyle = '#F3F4F6'
    ctx.font = 'italic 18px "KaTeX_Math", "Times New Roman", serif'
    ctx.textAlign = 'center'
    // X轴标签：跟随X轴末端位置
    ctx.fillText('x', marginX + chartWidth + 20, originY + 5)
    // Y轴标签：跟随Y轴顶端位置
    ctx.save()
    ctx.translate(originX, marginY - 20)
    ctx.fillText('y', 0, 0)
    ctx.restore()
  }

  // 绘制刻度
  const drawTicks = (ctx, marginX, marginY, chartWidth, chartHeight) => {
    ctx.strokeStyle = '#9CA3AF'
    ctx.fillStyle = '#F3F4F6'
    ctx.lineWidth = 1.5
    ctx.font = '14px ui-sans-serif, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    
    const originY = marginY + chartHeight
    
    // X轴刻度 - 从0开始到6
    for (let x = 0; x <= 6; x += 0.5) {
      const canvasX = marginX + (x / 6) * chartWidth
      const tickHeight = (x % 1 === 0) ? 10 : 6
      
      ctx.beginPath()
      ctx.moveTo(canvasX, originY)
      ctx.lineTo(canvasX, originY + tickHeight)
      ctx.stroke()
      
      if (x % 1 === 0) {
        ctx.fillText(x.toString(), canvasX, originY + 25)
      }
    }
    
    // Y轴刻度 - 从0开始到10
    ctx.textAlign = 'right'
    for (let y = 0; y <= 10; y += 0.5) {
      const canvasY = marginY + chartHeight - (y / 10) * chartHeight
      const tickWidth = (y % 1 === 0) ? 10 : 6
      
      ctx.beginPath()
      ctx.moveTo(marginX, canvasY)
      ctx.lineTo(marginX - tickWidth, canvasY)
      ctx.stroke()
      
      if (y % 1 === 0) {
        ctx.fillText(y.toString(), marginX - 15, canvasY + 5)
      }
    }
  }

  // 绘制数据点
  const drawDataPoints = (ctx, marginX, marginY, chartWidth, chartHeight) => {
    dataPoints.forEach(point => {
      const coords = getCanvasCoords(point.x, point.y, marginX, marginY, chartWidth, chartHeight)
      
      // 描边
      ctx.strokeStyle = '#0C3B46'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(coords.x, coords.y, 5, 0, Math.PI * 2)
      ctx.stroke()
      
      // 填充
      ctx.fillStyle = '#2EC4B6'
      ctx.fill()
    })
  }

  // 绘制直线
  const drawLine = (ctx, line, marginX, marginY, chartWidth, chartHeight, isActive = false) => {
    const color = isActive ? '#F59E0B' : line.color
    const lineWidth = isActive ? 3 : (line.label === 'L1' ? 3 : 2)
    const opacity = isActive ? 1 : (line.color === '#6B7280' ? 0.45 : 1)
    
    ctx.globalAlpha = opacity
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    
    // 直线从x=0到x=6，y = ax + b
    const startX = marginX
    const endX = marginX + chartWidth
    const startY = marginY + chartHeight - ((line.a * 0 + line.b) / 10) * chartHeight  // x=0时的y值
    const endY = marginY + chartHeight - ((line.a * 6 + line.b) / 10) * chartHeight    // x=6时的y值
    
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)
    ctx.stroke()
    
    ctx.globalAlpha = 1
  }

  // 绘制残差线
  const drawResiduals = (ctx, line, marginX, marginY, chartWidth, chartHeight) => {
    ctx.strokeStyle = '#60A5FA'
    ctx.lineWidth = 2
    ctx.setLineDash([6, 4])
    
    dataPoints.forEach(point => {
      const coords = getCanvasCoords(point.x, point.y, marginX, marginY, chartWidth, chartHeight)
      const predictedY = line.a * point.x + line.b
      const predictedCoords = getCanvasCoords(point.x, predictedY, marginX, marginY, chartWidth, chartHeight)
      
      // 绘制残差线
      ctx.beginPath()
      ctx.moveTo(coords.x, coords.y)
      ctx.lineTo(predictedCoords.x, predictedCoords.y)
      ctx.stroke()
      
      // 绘制端点
      ctx.setLineDash([])
      ctx.fillStyle = '#3B82F6'
      ctx.beginPath()
      ctx.arc(predictedCoords.x, predictedCoords.y, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.setLineDash([6, 4])
    })
    
    ctx.setLineDash([])
  }
  // ===== 最大化覆盖动画绘制函数 =====
  
  // 绘制覆盖网格
  const drawCoverageGrid = (ctx, marginX, marginY, chartWidth, chartHeight) => {
    // 次级网格（每0.5单位）
    ctx.strokeStyle = '#374151'
    ctx.globalAlpha = 0.4
    ctx.lineWidth = 1
    
    // 垂直次级网格
    for (let x = 0.5; x <= 10; x += 0.5) {
      const canvasX = marginX + (x / 10) * chartWidth
      ctx.beginPath()
      ctx.moveTo(canvasX, marginY)
      ctx.lineTo(canvasX, marginY + chartHeight)
      ctx.stroke()
    }
    
    // 水平次级网格
    for (let y = 0.5; y <= 6; y += 0.5) {
      const canvasY = marginY + chartHeight - (y / 6) * chartHeight
      ctx.beginPath()
      ctx.moveTo(marginX, canvasY)
      ctx.lineTo(marginX + chartWidth, canvasY)
      ctx.stroke()
    }
    
    // 主网格（每1.0单位）
    ctx.strokeStyle = '#4B5563'
    ctx.globalAlpha = 0.7
    ctx.lineWidth = 1.5
    
    // 垂直主网格
    for (let x = 1; x <= 10; x += 1) {
      const canvasX = marginX + (x / 10) * chartWidth
      ctx.beginPath()
      ctx.moveTo(canvasX, marginY)
      ctx.lineTo(canvasX, marginY + chartHeight)
      ctx.stroke()
    }
    
    // 水平主网格
    for (let y = 1; y <= 6; y += 1) {
      const canvasY = marginY + chartHeight - (y / 6) * chartHeight
      ctx.beginPath()
      ctx.moveTo(marginX, canvasY)
      ctx.lineTo(marginX + chartWidth, canvasY)
      ctx.stroke()
    }
    
    ctx.globalAlpha = 1
  }

  // 绘制目标区域
  const drawTargetRegion = (ctx, marginX, marginY, chartWidth, chartHeight, filled = true) => {
    if (targetRegionPolygon.length < 3) return
    
    ctx.beginPath()
    const firstPoint = getCoverageCanvasCoords(
      targetRegionPolygon[0].x, targetRegionPolygon[0].y,
      marginX, marginY, chartWidth, chartHeight
    )
    ctx.moveTo(firstPoint.x, firstPoint.y)
    
    for (let i = 1; i < targetRegionPolygon.length; i++) {
      const point = getCoverageCanvasCoords(
        targetRegionPolygon[i].x, targetRegionPolygon[i].y,
        marginX, marginY, chartWidth, chartHeight
      )
      ctx.lineTo(point.x, point.y)
    }
    ctx.closePath()
    
    if (filled) {
      // 区域底纹
      ctx.fillStyle = 'rgba(17, 24, 39, 0.92)'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
      ctx.shadowBlur = 2
      ctx.shadowOffsetY = 1
      ctx.fill()
      
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0
    }
    
    // 边界描边
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  // 绘制候选站点
  const drawCandidateSites = (ctx, marginX, marginY, chartWidth, chartHeight, highlightedSites = []) => {
    candidateSites.forEach(site => {
      const coords = getCoverageCanvasCoords(site.x, site.y, marginX, marginY, chartWidth, chartHeight)
      const isHighlighted = highlightedSites.includes(site.id)
      
      // 站点圆点
      ctx.fillStyle = '#2EC4B6'
      ctx.strokeStyle = isHighlighted ? '#ED8936' : '#0C3B46'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(coords.x, coords.y, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      
      // 编号标签
      ctx.fillStyle = '#F3F4F6'
      ctx.font = '12px ui-monospace, Menlo, monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`#${site.id}`, coords.x, coords.y - 15)
    })
  }

  // 绘制覆盖域（圆形或扇形）
  const drawCoverageDomain = (ctx, site, marginX, marginY, chartWidth, chartHeight, isSelected = false, alpha = 1) => {
    const coords = getCoverageCanvasCoords(site.x, site.y, marginX, marginY, chartWidth, chartHeight)
    const radiusCanvas = (site.radius / 10) * chartWidth // 转换到画布坐标的半径
    
    ctx.globalAlpha = alpha
    
    // 所有站点都是圆形覆盖域
    ctx.beginPath()
    ctx.arc(coords.x, coords.y, radiusCanvas, 0, Math.PI * 2)
    
    if (isSelected) {
      ctx.fillStyle = 'rgba(34, 197, 94, 0.25)'
      ctx.fill()
      ctx.strokeStyle = '#ED8936'
      ctx.lineWidth = 1.5
      ctx.stroke()
    } else {
      ctx.strokeStyle = 'rgba(160, 174, 192, 0.6)'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }
    
    ctx.globalAlpha = 1
  }

  // 绘制覆盖并集
  const drawCoverageUnion = (ctx, selectedSites, marginX, marginY, chartWidth, chartHeight) => {
    if (selectedSites.length === 0) return
    
    // 使用栅格近似计算并集
    const gridSize = 2 // 像素精度
    const coverageData = new Set()
    
    // 对每个选中站点的覆盖域进行栅格化
    selectedSites.forEach(siteId => {
      const site = candidateSites.find(s => s.id === siteId)
      if (!site) return
      
      const siteCoords = getCoverageCanvasCoords(site.x, site.y, marginX, marginY, chartWidth, chartHeight)
      const radiusCanvas = (site.radius / 10) * chartWidth
      
      // 扫描覆盖域内的栅格点
      for (let x = siteCoords.x - radiusCanvas; x <= siteCoords.x + radiusCanvas; x += gridSize) {
        for (let y = siteCoords.y - radiusCanvas; y <= siteCoords.y + radiusCanvas; y += gridSize) {
          let inCoverage = false
          
          // 所有站点都是圆形覆盖
          const distance = Math.sqrt((x - siteCoords.x) ** 2 + (y - siteCoords.y) ** 2)
          inCoverage = distance <= radiusCanvas
          
          if (inCoverage) {
            // 检查是否在目标区域内
            if (isPointInTargetRegion(x, y, marginX, marginY, chartWidth, chartHeight)) {
              coverageData.add(`${Math.floor(x / gridSize)},${Math.floor(y / gridSize)}`)
            }
          }
        }
      }
    })
    
    // 绘制并集区域
    if (coverageData.size > 0) {
      ctx.fillStyle = 'rgba(34, 197, 94, 0.35)'
      ctx.strokeStyle = '#38A169'
      ctx.lineWidth = 2
      
      // 简化绘制：用小矩形拼接
      coverageData.forEach(point => {
        const [x, y] = point.split(',').map(Number)
        ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize)
      })
    }
  }

  // 检查点是否在目标区域内（射线法）
  const isPointInTargetRegion = (canvasX, canvasY, marginX, marginY, chartWidth, chartHeight) => {
    // 将画布坐标转回数据坐标
    const dataX = (canvasX - marginX) / chartWidth * 10
    const dataY = 6 - (canvasY - marginY) / chartHeight * 6
    
    let inside = false
    const polygon = targetRegionPolygon
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (((polygon[i].y > dataY) !== (polygon[j].y > dataY)) &&
          (dataX < (polygon[j].x - polygon[i].x) * (dataY - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)) {
        inside = !inside
      }
    }
    
    return inside
  }
  // 计算覆盖率（栅格近似）
  const calculateCoverageRatio = (selectedSites, marginX, marginY, chartWidth, chartHeight) => {
    if (selectedSites.length === 0) return 0
    
    const gridResolution = 160 // 栅格分辨率
    const stepX = 10 / gridResolution // X方向步长
    const stepY = 6 / gridResolution  // Y方向步长
    
    let totalCells = 0
    let coveredCells = 0
    
    // 遍历所有栅格点
    for (let xi = 0; xi < gridResolution; xi++) {
      for (let yi = 0; yi < gridResolution; yi++) {
        const dataX = xi * stepX
        const dataY = yi * stepY
        
        // 检查是否在目标区域内
        const canvasCoords = getCoverageCanvasCoords(dataX, dataY, marginX, marginY, chartWidth, chartHeight)
        if (isPointInTargetRegion(canvasCoords.x, canvasCoords.y, marginX, marginY, chartWidth, chartHeight)) {
          totalCells++
          
          // 检查是否被任一选中站点覆盖
          let isCovered = false
          for (let siteId of selectedSites) {
            const site = candidateSites.find(s => s.id === siteId)
            if (!site) continue
            
            const distance = Math.sqrt((dataX - site.x) ** 2 + (dataY - site.y) ** 2)
            
            // 所有站点都是圆形覆盖
            if (distance <= site.radius) {
              isCovered = true
              break
            }
          }
          
          if (isCovered) {
            coveredCells++
          }
        }
      }
    }
    
    return totalCells > 0 ? (coveredCells / totalCells) * 100 : 0
  }
  
  // 验证覆盖率计算准确性的调试函数
  const debugCoverageCalculation = () => {
    // 需要临时的图表尺寸来计算覆盖率（包含平移量）
    const tempMarginX = 100 + coverageOffsetX
    const tempMarginY = 100 + coverageOffsetY
    const tempChartWidth = 500
    const tempChartHeight = 300
    
    coveragePlans.forEach(plan => {
      const calculatedCoverage = calculateCoverageRatio(plan.sites, tempMarginX, tempMarginY, tempChartWidth, tempChartHeight)
    })
  }
  
  // ===== 最大化覆盖动画时间线函数 =====
  
  // 主动画控制函数
  const playCoverageAnimation = async (ctx, width, height, signal) => {
    
    // 验证覆盖率计算准确性
    debugCoverageCalculation()
    
    const margin = 48
    const originalChartWidth = width - 2 * margin
    const originalChartHeight = height - 144 - 80
    // 缩小到85%
    const scaleFactor = 0.85
    const chartWidth = originalChartWidth * scaleFactor
    const chartHeight = originalChartHeight * scaleFactor
    // 计算居中的边距，并加入手动平移量
    const centerOffsetX = (originalChartWidth - chartWidth) / 2
    const centerOffsetY = (originalChartHeight - chartHeight) / 2
    const adjustedMarginX = margin + centerOffsetX + coverageOffsetX
    const adjustedMarginY = 64 + centerOffsetY + coverageOffsetY
    
    setIsPlayingCoverage(true)
    setCoverageAnimationState('Playing@Entrance')
    
    // 入场动画 (0-1.2s)
    if (signal?.aborted) {
      throw new DOMException('Animation aborted', 'AbortError')
    }
    if (!animationShouldStop) {
      await animateCoverageEntrance(ctx, width, height, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight, signal)
    } else {
      setIsPlayingCoverage(false)
      return
    }
    
    // 主循环：方案 A → B → C → D
    for (let i = 0; i < coveragePlans.length; i++) {
      if (signal?.aborted) {
        throw new DOMException('Animation aborted', 'AbortError')
      }
      if (animationShouldStop) {
        setIsPlayingCoverage(false)
        return
      }
      
      const plan = coveragePlans[i]
      setCoverageAnimationState(`Playing@Plan${plan.id}`)
      await animateCoveragePlan(ctx, width, height, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight, plan, signal)
    }
    
    // 收尾：回到最优方案B并保持其状态
    const optimalPlan = coveragePlans.find(p => p.isOptimal)
    setCurrentCoveragePlan(optimalPlan.id)
    setCoverageAnimationState('Idle@PlanB')
    
    if (signal?.aborted) {
      throw new DOMException('Animation aborted', 'AbortError')
    }
    if (!animationShouldStop) {
      await animateCoverageFinale(ctx, width, height, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight, signal)
    } else {
    }
    
    setIsPlayingCoverage(false)
  }

  // 入场动画
  const animateCoverageEntrance = (ctx, width, height, marginX, marginY, chartWidth, chartHeight, signal) => {
    return new Promise(resolve => {
      let progress = 0
      const duration = 1200
      const startTime = Date.now()
      
      const animate = () => {
        // 检查abort信号
        if (signal?.aborted) {
          resolve()
          return
        }
        
        const elapsed = Date.now() - startTime
        progress = Math.min(elapsed / duration, 1)
        
        // 清除画布
        ctx.fillStyle = '#111827'
        roundRect(ctx, 0, 0, width, height, 12)
        ctx.fill()
        
        // 0-0.3s: 背景与网格淡入
        if (progress >= 0) {
          const gridAlpha = Math.min(progress * 3.33, 1)
          ctx.save()
          ctx.globalAlpha = gridAlpha
          drawCoverageGrid(ctx, marginX, marginY, chartWidth, chartHeight)
          ctx.restore()
        }
        
        // 0.3-0.6s: 目标区域边界描绘完成，区域底纹显现
        if (progress >= 0.25) {
          const regionProgress = Math.min((progress - 0.25) * 2.86, 1)
          ctx.save()
          ctx.globalAlpha = regionProgress
          drawTargetRegion(ctx, marginX, marginY, chartWidth, chartHeight)
          ctx.restore()
        }
        
        // 0.6-0.9s: 8个候选站点点亮
        if (progress >= 0.5) {
          const siteProgress = (progress - 0.5) * 3.33
          const visibleSites = Math.min(Math.floor(siteProgress * candidateSites.length), candidateSites.length)
          const scale = 0.92 + 0.16 * Math.sin(siteProgress * Math.PI) // 1.08倍回弹效果
          
          ctx.save()
          ctx.scale(scale, scale)
          ctx.translate((width * (1 - scale)) / (2 * scale), (height * (1 - scale)) / (2 * scale))
          
          const sitesToShow = candidateSites.slice(0, visibleSites)
          drawCandidateSites(ctx, marginX, marginY, chartWidth, chartHeight, [])
          ctx.restore()
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }
      
      animate()
    })
  }

  // 单个方案动画
  const animateCoveragePlan = (ctx, width, height, marginX, marginY, chartWidth, chartHeight, plan, signal) => {
    return new Promise(resolve => {
      let progress = 0
      const duration = 3000 // 每组方案3秒
      const startTime = Date.now()
      let currentCoverage = 0
      let frameCount = 0
      
      const animate = () => {
        frameCount++
        
        // 检查abort信号 - 最高优先级
        if (signal?.aborted) {
          resolve()
          return
        }
        
        // 强化停止检查
        if (animationShouldStop) {
          resolve()
          return
        }
        
        const elapsed = Date.now() - startTime
        progress = Math.min(elapsed / duration, 1)
        
        if (frameCount % 60 === 0) { // 每60帧打印一次调试信息
        }
        
        // 清除画布并绘制基础元素
        ctx.fillStyle = '#111827'
        roundRect(ctx, 0, 0, width, height, 12)
        ctx.fill()
        
        drawCoverageGrid(ctx, marginX, marginY, chartWidth, chartHeight)
        drawTargetRegion(ctx, marginX, marginY, chartWidth, chartHeight)
        
        // t=0.0-0.2s: 高亮当前站点
        const highlightedSites = progress >= 0 ? plan.sites : []
        drawCandidateSites(ctx, marginX, marginY, chartWidth, chartHeight, highlightedSites)
        
        // t=0.2-0.8s: 覆盖域扩张
        if (progress >= 0.067) {
          const domainProgress = Math.min((progress - 0.067) * 1.67, 1)
          
          // 绘制未选中站点的覆盖域（灰色）
          candidateSites.forEach(site => {
            if (!plan.sites.includes(site.id)) {
              drawCoverageDomain(ctx, site, marginX, marginY, chartWidth, chartHeight, false, 0.3)
            }
          })
          
          // 绘制选中站点的覆盖域（扩张动画）
          plan.sites.forEach(siteId => {
            const site = candidateSites.find(s => s.id === siteId)
            if (site) {
              const expandedRadius = site.radius * domainProgress
              const expandedSite = { ...site, radius: expandedRadius }
              drawCoverageDomain(ctx, expandedSite, marginX, marginY, chartWidth, chartHeight, true)
            }
          })
        }
        
        // t=1.0-1.8s: 覆盖率数字走表
        if (progress >= 0.33 && progress <= 0.6) {
          const rateProgress = (progress - 0.33) / 0.27
          const easeOut = 1 - Math.pow(1 - rateProgress, 3)
          currentCoverage = plan.coverage * easeOut
        } else if (progress > 0.6) {
          currentCoverage = plan.coverage
        }
        
        // 始终显示底部描述文字（不参与动画）
        drawCoverageDescriptionCard(ctx, width, height)
        
        // 绘制其他UI组件（始终显示）
        drawCoverageFormulaCard(ctx, width)
        drawCoverageValueCard(ctx, plan, currentCoverage, marginX, marginY, chartHeight)
        drawCoverageComparisonBar(ctx, width, plan.id, marginX, marginY, chartWidth, chartHeight)
        
        // 再次检查停止信号
        if (animationShouldStop) {
          resolve()
          return
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }
      
      animate()
    })
  }

  // 收尾动画
  const animateCoverageFinale = (ctx, width, height, marginX, marginY, chartWidth, chartHeight) => {
    return new Promise(resolve => {
      const optimalPlan = coveragePlans.find(p => p.isOptimal)
      
      // 清除画布并绘制最优方案
      ctx.fillStyle = '#111827'
      ctx.fillRect(0, 0, width, height)
      
      drawCoverageGrid(ctx, marginX, marginY, chartWidth, chartHeight)
      drawTargetRegion(ctx, marginX, marginY, chartWidth, chartHeight)
      drawCandidateSites(ctx, marginX, marginY, chartWidth, chartHeight, optimalPlan.sites)
      
      // 绘制最优方案的覆盖域和并集
      optimalPlan.sites.forEach(siteId => {
        const site = candidateSites.find(s => s.id === siteId)
        if (site) {
          drawCoverageDomain(ctx, site, marginX, marginY, chartWidth, chartHeight, true)
        }
      })
      
      drawCoverageUnion(ctx, optimalPlan.sites, marginX, marginY, chartWidth, chartHeight)
      
      setTimeout(resolve, 800)
    })
  }
  // ===== UI组件绘制函数 =====
  
  // 绘制覆盖公式牌（顶部居中）
  const drawCoverageFormulaCard = (ctx, width) => {
    // 公式现在由HTML覆盖层的KaTeX显示，这里保留函数以维持调用兼容性
    // 实际的KaTeX渲染会在组件的return部分处理
  }

  // 绘制覆盖数值牌（相对图表区域底部定位）
  const drawCoverageValueCard = (ctx, currentPlan, currentCoverage, marginX = 48, marginY = 64, chartHeight = 300) => {
    const cardWidth = 220
    const cardHeight = 100
    const x = marginX + 50 // 相对于图表左边距
    const y = ctx.canvas.height - 180 // 统一Y坐标位置 
    
    // 绘制卡片背景
    ctx.fillStyle = 'rgba(15, 17, 22, 0.95)'
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)'
    ctx.lineWidth = 1
    roundRect(ctx, x, y, cardWidth, cardHeight, 8)
    ctx.fill()
    ctx.stroke()
    
    // 绘制文本
    ctx.textAlign = 'left'
    
    // 行1：当前方案
    ctx.fillStyle = '#F3F4F6'
    ctx.font = '14px ui-sans-serif, -apple-system, sans-serif'
    const siteList = currentPlan ? `{#${currentPlan.sites.join(', #')}}` : '{}'
    ctx.fillText(`当前方案：S = ${siteList}`, x + 16, y + 25)
    
    // 行2：覆盖率
    ctx.fillText('覆盖率 = ', x + 16, y + 54)
    ctx.fillStyle = '#2EC4B6'
    ctx.font = '16px ui-sans-serif, -apple-system, sans-serif'
    ctx.fillText(`${currentCoverage.toFixed(1)}%`, x + 75, y + 52)
    
    // 行3：方案描述
    ctx.fillStyle = '#F3F4F6'
    ctx.font = '14px ui-sans-serif, -apple-system, sans-serif'
    const description = currentPlan ? currentPlan.description : '无描述'
    ctx.fillText(description, x + 16, y + 79)
  }

  // 绘制方案对比条（相对图表区域底部定位）
  const drawCoverageComparisonBar = (ctx, width, activePlanId = null, marginX = 48, marginY = 64, chartWidth = 500, chartHeight = 300) => {
    const barWidth = 280
    const barHeight = 100
    const x = marginX + chartWidth - barWidth - 50 // 相对于图表右边距
    const y = ctx.canvas.height - 180 // 统一Y坐标位置
    
    // 绘制背景
    ctx.fillStyle = 'rgba(15, 17, 22, 0.95)'
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)'
    ctx.lineWidth = 1
    roundRect(ctx, x, y, barWidth, barHeight, 8)
    ctx.fill()
    ctx.stroke()
    
    // 定义方案配色（参考最大置信度配色）
    const planColors = {
      'A': '#8B5CF6', // 紫色
      'B': '#10B981', // 绿色（最优方案）
      'C': '#F59E0B', // 橙色
      'D': '#EF4444'  // 红色
    }
    
    // 辅助函数：绘制文本（完全模仿置信度样式）
    const drawText = (ctx, text, x, y, options = {}) => {
      const {
        fontSize = 11,
        fontWeight = 'normal',
        color = '#F3F4F6',
        fontFamily = 'ui-sans-serif, -apple-system, sans-serif',
        baseline = 'middle'
      } = options
      
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
      ctx.fillStyle = color
      ctx.textBaseline = baseline
      ctx.textAlign = 'left'
      ctx.fillText(text, x, y)
    }
    
    // 对比条（完全模仿置信度样式，去掉标题，直接显示）
    coveragePlans.forEach((plan, index) => {
      const barY = y + 20 + index * 18  // 从顶部开始，增加行间距
      const progressBarWidth = 140  // 减小进度条宽度
      const fillWidth = progressBarWidth * (plan.coverage / 100)
      const barCenterY = barY + 4  // 进度条中心Y坐标
      
      const isActive = activePlanId === plan.id
      const isOptimal = plan.isOptimal
      const planColor = planColors[plan.id]
      
      // 方案名称标签 - 垂直居中对齐进度条
      drawText(ctx, `方案${plan.id}:`, x + 15, barCenterY, {
        fontSize: 11,
        color: isActive ? planColor : '#9CA3AF',
        fontWeight: isActive ? 'bold' : 'normal',
        fontFamily: 'ui-sans-serif, -apple-system, sans-serif',
        baseline: 'middle'
      })
      
      // 背景条
      ctx.fillStyle = 'rgba(75, 85, 99, 0.3)'
      ctx.fillRect(x + 60, barY, progressBarWidth, 8)
      
      // 填充条
      ctx.fillStyle = planColor
      ctx.fillRect(x + 60, barY, fillWidth, 8)
      
      // 覆盖率百分比 - 垂直居中对齐进度条
      const textColor = isOptimal ? '#22C55E' : (isActive ? '#3B82F6' : '#9CA3AF')
      drawText(ctx, `${plan.coverage.toFixed(1)}%`, x + 210, barCenterY, {
        fontSize: 10,
        color: textColor,
        fontFamily: 'ui-sans-serif, -apple-system, sans-serif',
        baseline: 'middle'
      })
      
      // 最优方案奖杯（右侧留出空间）- 垂直居中对齐进度条
      if (isOptimal) {
        drawText(ctx, '🏆', x + 250, barCenterY, {
          fontSize: 10,
          baseline: 'middle'
        })
      }
    })
  }

  // 绘制说明文字卡片（右侧）
  const drawCoverageDescriptionCard = (ctx, width, height) => {
    // 底部一行三列布局的说明文字
    const descriptions = [
      '在固定预算下（最多选3个站点），让目标区域的覆盖比例最大。',
      '覆盖定义：被任一选中站点触达的区域视为已覆盖。',
      '最优直觉：减少无效重叠，优先填补空白，并兼顾边界。'
    ]
    
    const colors = ['#2EC4B6', '#ED8936', '#38A169'] // 不同颜色区分
    const yPosition = height - 40 // 底部位置
    const columnWidth = width / 3
    
    descriptions.forEach((text, index) => {
      const x = columnWidth * index + 20 // 每列的起始位置，留20px边距
      const maxWidth = columnWidth - 40 // 每列最大宽度，减去两边边距
      
      // 绘制圆点
      ctx.fillStyle = colors[index]
      ctx.beginPath()
      ctx.arc(x, yPosition - 5, 3, 0, Math.PI * 2)
      ctx.fill()
      
      // 绘制文字
      ctx.fillStyle = '#F3F4F6'
      ctx.font = '12px ui-sans-serif, -apple-system, sans-serif'
      ctx.textAlign = 'left'
      
      // 简单的文字换行处理
      const words = text.split('')
      let line = ''
      let currentY = yPosition - 5
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i]
        const metrics = ctx.measureText(testLine)
        
        if (metrics.width > maxWidth - 20 && line !== '') { // 预留圆点空间
          ctx.fillText(line, x + 10, currentY)
          line = words[i]
          currentY += 16
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, x + 10, currentY)
    })
  }
  // ===== 覆盖动画静态场景和交互控制 =====
  
  // 绘制覆盖动画静态场景
  const drawCoverageStaticScene = (ctx, width, height) => {
    const margin = 48
    const originalChartWidth = width - 2 * margin
    const originalChartHeight = height - 144 - 80
    // 缩小到85%
    const scaleFactor = 0.85
    const chartWidth = originalChartWidth * scaleFactor
    const chartHeight = originalChartHeight * scaleFactor
    // 计算居中的边距，并加入手动平移量
    const centerOffsetX = (originalChartWidth - chartWidth) / 2
    const centerOffsetY = (originalChartHeight - chartHeight) / 2
    const adjustedMarginX = margin + centerOffsetX + coverageOffsetX
    const adjustedMarginY = 64 + centerOffsetY + coverageOffsetY
    
    // 设置背景
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, width, height)
    
    // 绘制基础元素
    drawCoverageGrid(ctx, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight)
    drawTargetRegion(ctx, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight)
    
    // 绘制当前方案的站点和覆盖域
    const currentPlan = coveragePlans.find(p => p.id === currentCoveragePlan) || coveragePlans[0]
    drawCandidateSites(ctx, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight, currentPlan.sites)
    
    // 绘制未选中站点的覆盖域（灰色）
    candidateSites.forEach(site => {
      if (!currentPlan.sites.includes(site.id)) {
        drawCoverageDomain(ctx, site, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight, false, 0.3)
      }
    })
    
    // 绘制选中站点的覆盖域
    currentPlan.sites.forEach(siteId => {
      const site = candidateSites.find(s => s.id === siteId)
      if (site) {
        drawCoverageDomain(ctx, site, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight, true)
      }
    })
    
    // 绘制覆盖并集
    drawCoverageUnion(ctx, currentPlan.sites, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight)
    
    // 绘制所有UI组件
    drawCoverageFormulaCard(ctx, width)
    drawCoverageValueCard(ctx, currentPlan, currentPlan.coverage, adjustedMarginX, adjustedMarginY, chartHeight)
    drawCoverageComparisonBar(ctx, width, currentPlan.id, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight)
    drawCoverageDescriptionCard(ctx, width, height)
  }
  // 最大化覆盖率的初次进入静态场景（仅显示基础元素，不显示方案信息）
  const drawCoverageInitialScene = (ctx, width, height) => {
    const margin = 48
    const originalChartWidth = width - 2 * margin
    const originalChartHeight = height - 144 - 80
    // 缩小到85%
    const scaleFactor = 0.85
    const chartWidth = originalChartWidth * scaleFactor
    const chartHeight = originalChartHeight * scaleFactor
    // 计算居中的边距，并加入手动平移量
    const centerOffsetX = (originalChartWidth - chartWidth) / 2
    const centerOffsetY = (originalChartHeight - chartHeight) / 2
    const adjustedMarginX = margin + centerOffsetX + coverageOffsetX
    const adjustedMarginY = 64 + centerOffsetY + coverageOffsetY
    
    // 设置背景
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, width, height)
    
    // 仅绘制基础元素：格网、多边形、点
    drawCoverageGrid(ctx, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight)
    drawTargetRegion(ctx, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight)
    
    // 绘制所有候选站点（使用与动画一致的薄荷绿效果）
    drawCandidateSites(ctx, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight, [])
    
    // 仅显示公式卡片（不显示其他UI组件）
    drawCoverageFormulaCard(ctx, width)
    
    // 显示描述卡片
    drawCoverageDescriptionCard(ctx, width, height)
  }

  // 覆盖动画方案切换
  const playCoverageSpecificPlan = async (ctx, width, height, planId) => {
    const plan = coveragePlans.find(p => p.id === planId)
    if (!plan) return
    
    const margin = 48
    const originalChartWidth = width - 2 * margin
    const originalChartHeight = height - 144 - 80
    // 缩小到85%
    const scaleFactor = 0.85
    const chartWidth = originalChartWidth * scaleFactor
    const chartHeight = originalChartHeight * scaleFactor
    // 计算居中的边距，并加入手动平移量
    const centerOffsetX = (originalChartWidth - chartWidth) / 2
    const centerOffsetY = (originalChartHeight - chartHeight) / 2
    const adjustedMarginX = margin + centerOffsetX + coverageOffsetX
    const adjustedMarginY = 64 + centerOffsetY + coverageOffsetY
    
    setCurrentCoveragePlan(planId)
    setCoverageAnimationState(`Playing@Plan${planId}`)
    
    await animateCoveragePlan(ctx, width, height, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight, plan)
    
    setCoverageAnimationState(`Idle@Plan${planId}`)
  }

  // 键盘导航处理（覆盖动画专用）
  const handleCoverageKeydown = (e) => {
    if (!isPlayingCoverage) {
      switch (e.key) {
        case '1':
          playCoverageSpecificPlan(canvasRef.current?.getContext('2d'), canvasRef.current?.clientWidth, canvasRef.current?.clientHeight, 'A')
          break
        case '2':
          playCoverageSpecificPlan(canvasRef.current?.getContext('2d'), canvasRef.current?.clientWidth, canvasRef.current?.clientHeight, 'B')
          break
        case '3':
          playCoverageSpecificPlan(canvasRef.current?.getContext('2d'), canvasRef.current?.clientWidth, canvasRef.current?.clientHeight, 'C')
          break
        case '4':
          playCoverageSpecificPlan(canvasRef.current?.getContext('2d'), canvasRef.current?.clientWidth, canvasRef.current?.clientHeight, 'D')
          break
        case ' ':
          e.preventDefault()
          playCoverageAnimation(canvasRef.current?.getContext('2d'), canvasRef.current?.clientWidth, canvasRef.current?.clientHeight)
          break
        case 'r':
        case 'R':
          playCoverageSpecificPlan(canvasRef.current?.getContext('2d'), canvasRef.current?.clientWidth, canvasRef.current?.clientHeight, currentCoveragePlan)
          break
      }
    }
  }

  // 绘制公式牌
  const drawFormulaCard = (ctx, width) => {
    // 公式现在由HTML覆盖层的KaTeX显示，这里不需要绘制
    // 保留函数以维持动画调用的兼容性
  }

  // 绘制数值牌（相对图表区域底部定位）
  const drawValueCard = (ctx, line, currentRSS, marginX = 48, marginY = 48, chartHeight = 300) => {
    const cardWidth = 280
    const cardHeight = 100 // 统一高度为100px
    const x = marginX + 20 // 相对于图表左边距
    const y = ctx.canvas.height - 130 // 统一Y坐标位置
    
    // 绘制卡片背景
    ctx.fillStyle = 'rgba(15, 17, 22, 0.95)'
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)'
    ctx.lineWidth = 1
    roundRect(ctx, x, y, cardWidth, cardHeight, 8)
    ctx.fill()
    ctx.stroke()
    
    // 绘制文本 - 精确垂直居中，等距分布
    ctx.textAlign = 'left'
    
    // 考虑实际字体高度：14px主要文字，12px提示文字
    const line1Height = 14 // 第一行字体高度
    const line2Height = 14 // 第二行字体高度  
    const line3Height = 12 // 第三行字体高度
    const lineSpacing = 20 // 行间距
    
    // 计算总文本区域高度
    const totalTextHeight = line1Height + lineSpacing + line2Height + lineSpacing + line3Height
    
    // 垂直居中计算：卡片中心减去文本区域一半
    const textStartY = y + (cardHeight - totalTextHeight) / 2 + line1Height + 3
    
    // 第一行：当前直线 - 使用数学斜体
    ctx.fillStyle = '#F3F4F6'
    ctx.font = '14px ui-sans-serif, -apple-system, sans-serif'
    ctx.fillText('当前：', x + 12, textStartY)
    
    // y = 部分用斜体
    ctx.font = 'italic 14px "KaTeX_Math", "Times New Roman", serif'
    ctx.fillText('y', x + 50, textStartY)
    
    ctx.font = '14px ui-sans-serif, -apple-system, sans-serif'
    ctx.fillText(' = ', x + 60, textStartY)
    
    ctx.fillText(line.a.toFixed(2), x + 80, textStartY)
    
    ctx.font = 'italic 14px "KaTeX_Math", "Times New Roman", serif'
    ctx.fillText('x', x + 120, textStartY)
    
    ctx.font = '14px ui-sans-serif, -apple-system, sans-serif'
    ctx.fillText(' + ', x + 130, textStartY)
    ctx.fillText(line.b.toFixed(2), x + 155, textStartY)
    
    // 第二行：RSS，精确行距
    const line2Y = textStartY + lineSpacing + line2Height - 4
    ctx.fillStyle = '#F3F4F6'
    ctx.font = '14px ui-sans-serif, -apple-system, sans-serif'
    ctx.fillText('残差平方和 RSS = ', x + 12, line2Y)
    
    ctx.fillStyle = '#2EC4B6'
    ctx.font = '14px ui-monospace, Menlo, monospace'
    ctx.fillText(currentRSS.toFixed(4), x + 140, line2Y)
    
    // 第三行：提示，精确行距
    const line3Y = line2Y + lineSpacing + line3Height - 6
    ctx.fillStyle = '#9CA3AF'
    ctx.font = '12px ui-sans-serif, -apple-system, sans-serif'
    ctx.fillText('点到直线的垂线为残差，RSS为残差的平方和', x + 12, line3Y)
  }

  // 绘制候选概览（相对图表区域底部定位）
  const drawCandidateOverview = (ctx, width, currentIndex = 0, marginX = 48, marginY = 48, chartWidth = 500, chartHeight = 300) => {
    const cardWidth = 200
    const cardHeight = 100
    const x = marginX + chartWidth - cardWidth - 50 // 相对于图表右边距
    const y = ctx.canvas.height - 130 // 统一Y坐标位置
    
    // 绘制卡片背景
    ctx.fillStyle = 'rgba(15, 17, 22, 0.95)'
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)'
    ctx.lineWidth = 1
    roundRect(ctx, x, y, cardWidth, cardHeight, 8)
    ctx.fill()
    ctx.stroke()
    
    // 绘制标题
    ctx.fillStyle = '#F3F4F6'
    ctx.font = '12px ui-sans-serif, -apple-system, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('方案对比', x + 15, y + 20)
    
    // 找到最大RSS值用于进度条归一化
    const maxRSS = Math.max(...candidateLines.map(line => line.rss))
    
    // 定义L1-L4的固定配色方案（参考最大置信度配色）
    const lineColors = [
      '#10B981', // L1 - 绿色（最优方案）
      '#8B5CF6', // L2 - 紫色
      '#F59E0B', // L3 - 橙色  
      '#EF4444'  // L4 - 红色
    ]
    
    candidateLines.forEach((line, index) => {
      const textY = y + 35 + index * 16
      const isCurrentlyPlaying = index === currentIndex
      const isTrueBest = index === 0 // L1 is always the true minimum (0.0528)
      
      // 方案标签颜色使用固定配色
      const lineColor = lineColors[index]
      ctx.fillStyle = lineColor
      
      // 绘制方案标签
      ctx.font = '10px ui-monospace, Menlo, monospace'
      ctx.fillText(`${line.label}:`, x + 12, textY)
      
      // RSS数值颜色逻辑：最优值绿色，当前播放蓝色，其他白色
      if (isTrueBest) {
        ctx.fillStyle = '#22C55E' // 绿色 - 最优值
      } else if (isCurrentlyPlaying) {
        ctx.fillStyle = '#3B82F6' // 蓝色 - 当前高亮
      } else {
        ctx.fillStyle = '#F3F4F6' // 白色 - 其他值
      }
      
      // 绘制RSS数值
      ctx.fillText(line.rss.toFixed(4), x + 35, textY)
      
      // 绘制进度条
      const progressWidth = 60 // 进度条宽度
      const progressHeight = 3 // 进度条高度
      const progressX = x + 105
      const progressY = textY - 6
      
      // 进度条背景
      ctx.fillStyle = 'rgba(75, 85, 99, 0.3)'
      ctx.fillRect(progressX, progressY, progressWidth, progressHeight)
      
      // 进度条填充 (RSS数值越大，进度条越长)
      const normalizedProgress = line.rss / maxRSS
      const fillWidth = progressWidth * normalizedProgress
      
      // 进度条使用对应的线条颜色
      ctx.fillStyle = lineColor
      ctx.fillRect(progressX, progressY, fillWidth, progressHeight)
      
      // 只有真正的最优解才显示奖杯
      if (isTrueBest) {
        ctx.fillStyle = '#22C55E'
        ctx.fillText('🏆', x + 170, textY)
      }
    })
  }

  // 卡片1场景绘制函数（静态）
  const drawCard1Scene1 = (ctx, width, height) => {
    // 设置背景 - 使用圆角矩形
    ctx.fillStyle = '#111827'
    roundRect(ctx, 0, 0, width, height, 12) // 使用12px圆角
    ctx.fill()
    
    const chartOffsetX = 20 // 图表水平偏移
    const chartOffsetY = 27 // 图表垂直向下偏移 (65-16=49，向上移动16px)
    const margin = 48
    const baseChartWidth = width - 2 * margin - 48
    const baseChartHeight = height - 144 - 80
    const chartWidth = baseChartWidth * 0.85 // 缩放为85%
    const chartHeight = baseChartHeight * 0.85 // 缩放为85%
    const adjustedMarginX = margin + chartOffsetX + (baseChartWidth - chartWidth) / 2 // 居中对齐
    const adjustedMarginY = margin + chartOffsetY + (baseChartHeight - chartHeight) / 2 // 居中对齐
    
    // 绘制网格
    drawGrid(ctx, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight)
    
    // 绘制坐标轴
    drawAxes(ctx, adjustedMarginX, adjustedMarginY, width, height, chartWidth, chartHeight)
    
    // 绘制刻度
    drawTicks(ctx, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight)
    
    // 绘制数据点
    drawDataPoints(ctx, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight)
    
    // 绘制最佳拟合线
    drawLine(ctx, candidateLines[0], adjustedMarginX, adjustedMarginY, chartWidth, chartHeight, false)
    
    // 绘制残差
    drawResiduals(ctx, candidateLines[0], adjustedMarginX, adjustedMarginY, chartWidth, chartHeight)
    
    // 绘制公式牌
    drawFormulaCard(ctx, width)
    
    // 绘制数值牌
    drawValueCard(ctx, candidateLines[0], candidateLines[0].rss, adjustedMarginX, adjustedMarginY, chartHeight)
    
    // 绘制候选概览
    drawCandidateOverview(ctx, width, 0, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight)
  }
  // 最小化误差的初始静止动画（仅显示坐标轴、格网、点位分布，不显示任何直线）
  const drawMinimizeErrorInitialScene = (ctx, width, height) => {
    // 设置背景 - 使用圆角矩形
    ctx.fillStyle = '#111827'
    roundRect(ctx, 0, 0, width, height, 12) // 使用12px圆角
    ctx.fill()
    
    const chartOffsetX = 20 // 图表水平偏移
    const chartOffsetY = 27 // 图表垂直向下偏移 (65-16=49，向上移动16px)
    const margin = 48
    const baseChartWidth = width - 2 * margin - 48
    const baseChartHeight = height - 144 - 80
    const chartWidth = baseChartWidth * 0.85 // 缩放为85%
    const chartHeight = baseChartHeight * 0.85 // 缩放为85%
    const adjustedMarginX = margin + chartOffsetX + (baseChartWidth - chartWidth) / 2 // 居中对齐
    const adjustedMarginY = margin + chartOffsetY + (baseChartHeight - chartHeight) / 2 // 居中对齐
    
    // 绘制网格
    drawGrid(ctx, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight)
    
    // 绘制坐标轴
    drawAxes(ctx, adjustedMarginX, adjustedMarginY, width, height, chartWidth, chartHeight)
    
    // 绘制刻度
    drawTicks(ctx, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight)
    
    // 绘制数据点（不绘制任何直线和残差）
    drawDataPoints(ctx, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight)
    
    // 仅绘制公式牌（不显示数值牌和候选概览）
    drawFormulaCard(ctx, width)
  }

  // 这里会添加所有的动画和绘制函数
  // 为了避免文件过大，这里暂时只添加核心函数，其他函数将从原文件迁移过来

  // 完整的最小化误差动画
  const playCard1Scene1 = async (ctx, width, height, signal) => {
    
    const chartOffsetX = 20 // 图表水平偏移
    const chartOffsetY = 27 // 图表垂直向下偏移 (65-16=49，向上移动16px)
    const margin = 48
    const baseChartWidth = width - 2 * margin - 48
    const baseChartHeight = height - 144 - 80
    const chartWidth = baseChartWidth * 0.85 // 缩放为85%
    const chartHeight = baseChartHeight * 0.85 // 缩放为85%
    const adjustedMarginX = margin + chartOffsetX + (baseChartWidth - chartWidth) / 2 // 居中对齐
    const adjustedMarginY = margin + chartOffsetY + (baseChartHeight - chartHeight) / 2 // 居中对齐
    
    // 设置背景 - 使用圆角矩形
    ctx.fillStyle = '#111827'
    roundRect(ctx, 0, 0, width, height, 12) // 使用12px圆角
    ctx.fill()
    
    // 入场动画（0-1.2s）
    if (signal?.aborted) {
      throw new DOMException('Animation aborted', 'AbortError')
    }
    if (!animationShouldStop) {
      await animateEntrance(ctx, width, height, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight, signal)
    } else {
      return
    }
    
    // 主循环：播放每条直线（每条2.8s）
    for (let i = 0; i < candidateLines.length; i++) {
      if (signal?.aborted) {
        throw new DOMException('Animation aborted', 'AbortError')
      }
      if (animationShouldStop) {
        return
      }
      
      await animateLine(ctx, width, height, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight, i, signal)
    }
    
    // 收尾：回到最佳拟合线视图
    if (!animationShouldStop) {
      await animateFinale(ctx, width, height, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight)
    } else {
    }
    
  }
  
  // 入场动画
  const animateEntrance = async (ctx, width, height, marginX, marginY, chartWidth, chartHeight, signal) => {
    return new Promise(resolve => {
      let progress = 0
      const duration = 1200
      const startTime = Date.now()
      
      const animate = () => {
        // 检查abort信号
        if (signal?.aborted) {
          resolve()
          return
        }
        
        const elapsed = Date.now() - startTime
        progress = Math.min(elapsed / duration, 1)
        
        ctx.fillStyle = '#111827'
        roundRect(ctx, 0, 0, width, height, 12)
        ctx.fill()
        
        if (progress >= 0) {
          // 网格淡入
          ctx.globalAlpha = Math.min(progress * 3.33, 1)
          drawGrid(ctx, marginX, marginY, chartWidth, chartHeight)
          ctx.globalAlpha = 1
        }
        
        if (progress >= 0.25) {
          // 坐标轴滑入
          const axisProgress = Math.min((progress - 0.25) * 2.86, 1)
          ctx.save()
          ctx.translate(0, (1 - axisProgress) * 12)
          drawAxes(ctx, marginX, marginY, width, height, chartWidth, chartHeight)
          ctx.restore()
        }
        
        if (progress >= 0.5) {
          // 刻度显现
          ctx.globalAlpha = Math.min((progress - 0.5) * 3.33, 1)
          drawTicks(ctx, marginX, marginY, chartWidth, chartHeight)
          ctx.globalAlpha = 1
        }
        
        if (progress >= 0.75) {
          // 数据点弹入
          const pointProgress = (progress - 0.75) * 4
          const scale = 0.8 + 0.2 * Math.min(pointProgress, 1)
          ctx.save()
          dataPoints.forEach((point, index) => {
            if (pointProgress > index * 0.1) {
              const coords = getCanvasCoords(point.x, point.y, marginX, marginY, chartWidth, chartHeight)
              ctx.save()
              ctx.translate(coords.x, coords.y)
              ctx.scale(scale, scale)
              ctx.translate(-coords.x, -coords.y)
              
              ctx.strokeStyle = '#0C3B46'
              ctx.lineWidth = 1.5
              ctx.beginPath()
              ctx.arc(coords.x, coords.y, 5, 0, Math.PI * 2)
              ctx.stroke()
              
              ctx.fillStyle = '#2EC4B6'
              ctx.fill()
              ctx.restore()
            }
          })
          ctx.restore()
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }
      
      animate()
    })
  }
  
  // 单条直线动画
  const animateLine = async (ctx, width, height, marginX, marginY, chartWidth, chartHeight, lineIndex, signal) => {
    return new Promise(resolve => {
      let progress = 0
      const duration = 2800
      const startTime = Date.now()
      let currentRSS = 0
      
      const animate = () => {
        // 检查abort信号 - 最高优先级
        if (signal?.aborted) {
          resolve()
          return
        }
        
        // 检查是否应该停止动画
        if (animationShouldStop) {
          resolve()
          return
        }
        
        const elapsed = Date.now() - startTime
        progress = Math.min(elapsed / duration, 1)
        
        // 清除并重绘基础元素
        ctx.fillStyle = '#111827'
        roundRect(ctx, 0, 0, width, height, 12)
        ctx.fill()
        
        drawGrid(ctx, marginX, marginY, chartWidth, chartHeight)
        drawAxes(ctx, marginX, marginY, width, height, chartWidth, chartHeight)
        drawTicks(ctx, marginX, marginY, chartWidth, chartHeight)
        drawDataPoints(ctx, marginX, marginY, chartWidth, chartHeight)
        
        // 绘制其他候选线（灰色）
        candidateLines.forEach((line, index) => {
          if (index !== lineIndex) {
            drawLine(ctx, line, marginX, marginY, chartWidth, chartHeight, false)
          }
        })
        
        const currentLine = candidateLines[lineIndex]
        
        // 当前直线出现（0-0.2s）
        if (progress >= 0) {
          const lineAlpha = Math.min(progress * 5, 1)
          ctx.globalAlpha = lineAlpha
          drawLine(ctx, currentLine, marginX, marginY, chartWidth, chartHeight, true)
          ctx.globalAlpha = 1
        }
        
        // 残差线逐个出现（0.2-1.0s）
        if (progress >= 0.07) {
          const residualProgress = (progress - 0.07) / 0.36
          const visibleResiduals = Math.floor(residualProgress * dataPoints.length)
          
          ctx.strokeStyle = '#60A5FA'
          ctx.lineWidth = 2
          ctx.setLineDash([6, 4])
          
          dataPoints.forEach((point, index) => {
            if (index <= visibleResiduals) {
              const coords = getCanvasCoords(point.x, point.y, marginX, marginY, chartWidth, chartHeight)
              const predictedY = currentLine.a * point.x + currentLine.b
              const predictedCoords = getCanvasCoords(point.x, predictedY, marginX, marginY, chartWidth, chartHeight)
              
              ctx.beginPath()
              ctx.moveTo(coords.x, coords.y)
              ctx.lineTo(predictedCoords.x, predictedCoords.y)
              ctx.stroke()
              
              ctx.setLineDash([])
              ctx.fillStyle = '#3B82F6'
              ctx.beginPath()
              ctx.arc(predictedCoords.x, predictedCoords.y, 3, 0, Math.PI * 2)
              ctx.fill()
              ctx.setLineDash([6, 4])
            }
          })
          
          ctx.setLineDash([])
        }
        
        // RSS数字滚动（0.21-0.43s）
        if (progress >= 0.21 && progress <= 0.43) {
          const rssProgress = (progress - 0.21) / 0.22
          const easeOut = 1 - Math.pow(1 - rssProgress, 3)
          currentRSS = currentLine.rss * easeOut
        } else if (progress > 0.43) {
          currentRSS = currentLine.rss
        }
        
        // 绘制公式牌和数值牌（始终显示）
        drawFormulaCard(ctx, width)
        drawValueCard(ctx, currentLine, currentRSS, marginX, marginY, chartHeight)
        
        // 绘制候选概览（始终显示，高亮当前正在播放的直线）
        drawCandidateOverview(ctx, width, lineIndex, marginX, marginY, chartWidth, chartHeight)
        
        if (progress < 1 && !animationShouldStop) {
          requestAnimationFrame(animate)
        } else {
          setTimeout(resolve, 300) // 每条线之间的间隔
        }
      }
      
      animate()
    })
  }
  
  // 结尾动画
  const animateFinale = async (ctx, width, height, marginX, marginY, chartWidth, chartHeight) => {
    return new Promise(resolve => {
      // 最终显示最佳拟合线
      ctx.fillStyle = '#111827'
      ctx.fillRect(0, 0, width, height)
      
      drawGrid(ctx, marginX, marginY, chartWidth, chartHeight)
      drawAxes(ctx, marginX, marginY, width, height, chartWidth, chartHeight)
      drawTicks(ctx, marginX, marginY, chartWidth, chartHeight)
      drawDataPoints(ctx, marginX, marginY, chartWidth, chartHeight)
      
      // 所有候选线（灰色）
      candidateLines.slice(1).forEach(line => {
        drawLine(ctx, line, marginX, marginY, chartWidth, chartHeight, false)
      })
      
      // 最佳拟合线（蓝色）
      drawLine(ctx, candidateLines[0], marginX, marginY, chartWidth, chartHeight, false)
      
      // 残差
      drawResiduals(ctx, candidateLines[0], marginX, marginY, chartWidth, chartHeight)
      
      // 绘制所有文本
      drawFormulaCard(ctx, width)
      drawValueCard(ctx, candidateLines[0], candidateLines[0].rss, marginX, marginY, chartHeight)
      drawCandidateOverview(ctx, width, 0, marginX, marginY, chartWidth, chartHeight)
      
      setTimeout(resolve, 800)
    })
  }

  const playCard1Scene2 = async (ctx, width, height, signal) => {
    // 播放最大化覆盖动画
    return await playCoverageAnimation(ctx, width, height, signal)
  }

  const playCard1Scene3 = async (ctx, width, height, signal) => {
    const margin = 48
    const chartWidth = width - 2 * margin
    const chartHeight = height - 144 - 80 - 120 // 为底部UI预留更多空间
    const marginX = margin
    const marginY = 64
    
    // 背景
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, width, height)
    
    // 入场动画（0-1.2s）
    if (signal?.aborted) return
    if (animationShouldStop) return
    
    await animateBrachistochroneEntrance(ctx, width, height, marginX, marginY, chartWidth, chartHeight, signal)
    
    // 四条路径主循环 A→B→C→D
    for (let pathIndex = 0; pathIndex < timeOptData.paths.length; pathIndex++) {
      if (signal?.aborted) return
      if (animationShouldStop) return
      
      await animateBrachistochronePath(ctx, width, height, marginX, marginY, chartWidth, chartHeight, pathIndex, signal)
      
      // 方案间过渡
      if (pathIndex < timeOptData.paths.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 400))
      }
    }
    
    // 收尾：回到最优方案D（摆线）
    if (!animationShouldStop && !signal?.aborted) {
      await animateBrachistochroneFinale(ctx, width, height, marginX, marginY, chartWidth, chartHeight)
    }
  }
  // 入场动画
  const animateBrachistochroneEntrance = async (ctx, width, height, marginX, marginY, chartWidth, chartHeight, signal) => {
    return new Promise(resolve => {
      let progress = 0
      const duration = 1200
      const startTime = Date.now()
      
      const animate = () => {
        if (signal?.aborted || animationShouldStop) {
          resolve()
          return
        }
        
        const elapsed = Date.now() - startTime
        progress = Math.min(elapsed / duration, 1)
        
        ctx.fillStyle = '#111827'
        roundRect(ctx, 0, 0, width, height, 12)
        ctx.fill()
        
        // 始终显示底部UI组件
        drawTimeOptFormulaCard(ctx, width)
        drawTimeOptValueCard(ctx, timeOptData.paths[0], 0, marginX, marginY, chartHeight)
        drawTimeOptComparisonBar(ctx, width, '', marginX, marginY, chartWidth, chartHeight)
        
        // 0-0.3s: 背景与网格淡入
        if (progress >= 0) {
          const gridAlpha = Math.min(progress * 3.33, 1)
          ctx.globalAlpha = gridAlpha
          drawTimeOptGrid(ctx, marginX, marginY, chartWidth, chartHeight)
          ctx.globalAlpha = 1
        }
        
        // 0.3-0.7s: 坐标轴滑入
        if (progress >= 0.25) {
          const axisProgress = Math.min((progress - 0.25) * 2.22, 1)
          ctx.save()
          ctx.translate(0, (1 - axisProgress) * 20)
          ctx.globalAlpha = axisProgress
          drawTimeOptAxes(ctx, marginX, marginY, chartWidth, chartHeight)
          drawTimeOptTicks(ctx, marginX, marginY, chartWidth, chartHeight)
          ctx.restore()
        }
        
        // 0.3-0.7s: S、T点弹入，重力箭头扫入
        if (progress >= 0.25) {
          const pointProgress = (progress - 0.25) / 0.36
          if (pointProgress <= 1) {
            const bounce = pointProgress < 1 ? 1 + 0.08 * Math.sin(pointProgress * Math.PI * 2) : 1
            drawTimeOptPoints(ctx, marginX, marginY, chartWidth, chartHeight, bounce)
            
            // 重力箭头从上向下扫入
            const gravityAlpha = Math.min(pointProgress * 2, 1)
            drawGravityArrow(ctx, marginX, marginY, chartWidth, chartHeight, gravityAlpha)
          }
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }
      
      animate()
    })
  }
  
  // 单个方案路径动画
  const animateBrachistochronePath = async (ctx, width, height, marginX, marginY, chartWidth, chartHeight, pathIndex, signal) => {
    return new Promise(resolve => {
      let progress = 0
      const duration = 2800
      const startTime = Date.now()
      const currentPath = timeOptData.paths[pathIndex]
      let currentTime = 0
      let ballPosition = { x: 0, y: 0 }
      
      const animate = () => {
        if (signal?.aborted || animationShouldStop) {
          resolve()
          return
        }
        
        const elapsed = Date.now() - startTime
        progress = Math.min(elapsed / duration, 1)
        
        // 清除并绘制基础场景
        ctx.fillStyle = '#111827'
        roundRect(ctx, 0, 0, width, height, 12)
        ctx.fill()
        
        drawTimeOptGrid(ctx, marginX, marginY, chartWidth, chartHeight)
        drawTimeOptAxes(ctx, marginX, marginY, chartWidth, chartHeight)
        drawTimeOptTicks(ctx, marginX, marginY, chartWidth, chartHeight)
        drawTimeOptPoints(ctx, marginX, marginY, chartWidth, chartHeight)
        drawGravityArrow(ctx, marginX, marginY, chartWidth, chartHeight)
        
        // 始终显示底部UI组件
        drawTimeOptFormulaCard(ctx, width)
        drawTimeOptValueCard(ctx, currentPath, currentTime, marginX, marginY, chartHeight)
        drawTimeOptComparisonBar(ctx, width, currentPath.id, marginX, marginY, chartWidth, chartHeight)
        
        // 0.0-0.4s: 路径显形
        if (progress >= 0) {
          const pathProgress = Math.min(progress * 2.5, 1)
          
          // 绘制其他路径（灰色半透明）
          timeOptData.paths.forEach((path, index) => {
            if (index !== pathIndex) {
              drawTimeOptPath(ctx, path, marginX, marginY, chartWidth, chartHeight, 0.15, 2)
            }
          })
          
          // 当前路径逐步绘制
          if (pathProgress > 0) {
            drawTimeOptPath(ctx, currentPath, marginX, marginY, chartWidth, chartHeight, pathProgress, 3)
          }
        }
        
        // 0.4-2.0s: 质点下滑 & 走表
        if (progress >= 0.143) {
          const moveProgress = Math.min((progress - 0.143) / 0.571, 1)
          
          // 计算质点位置
          ballPosition = calculateBallPosition(currentPath, moveProgress)
          
          // 绘制质点
          drawMovingBall(ctx, ballPosition.x, ballPosition.y, marginX, marginY, chartWidth, chartHeight)
          
          // 时间走表
          const easeOut = 1 - Math.pow(1 - moveProgress, 3)
          currentTime = currentPath.time * easeOut
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setTimeout(resolve, 300)
        }
      }
      
      animate()
    })
  }
  // 计算质点位置
  const calculateBallPosition = (path, progress) => {
    if (path.type === 'linear') {
      const x = progress * Math.PI
      const y = path.equation(x)
      return { x, y }
      
    } else if (path.type === 'polyline') {
      // 折线：需要判断在哪一段
      const segment1Length = Math.sqrt(Math.pow(1.2, 2) + Math.pow(1.5, 2))
      const segment2Length = Math.sqrt(Math.pow(Math.PI - 1.2, 2) + Math.pow(2 - 1.5, 2))
      const totalLength = segment1Length + segment2Length
      
      const currentLength = progress * totalLength
      
      if (currentLength <= segment1Length) {
        // 在第一段
        const t = currentLength / segment1Length
        return { x: t * 1.2, y: t * 1.5 }
      } else {
        // 在第二段
        const t = (currentLength - segment1Length) / segment2Length
        return { 
          x: 1.2 + t * (Math.PI - 1.2), 
          y: 1.5 + t * (2 - 1.5) 
        }
      }
      
    } else if (path.type === 'quadratic') {
      const x = progress * Math.PI
      const y = path.equation(x)
      return { x, y }
      
    } else if (path.type === 'cycloid') {
      const theta = progress * Math.PI
      const x = path.parametric.x(theta)
      const y = path.parametric.y(theta)
      return { x, y }
    }
    
    return { x: 0, y: 0 }
  }
  
  // 绘制移动的质点
  const drawMovingBall = (ctx, x, y, marginX, marginY, chartWidth, chartHeight) => {
    // 添加15%的高度下移偏移
    const canvasHeight = ctx.canvas.height
    const offsetY = canvasHeight * 0.05
    marginY += offsetY
    const coords = getTimeOptCanvasCoords(x, y, marginX, marginY, chartWidth, chartHeight)
    
    // 外圈微光
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'
    ctx.beginPath()
    ctx.arc(coords.x, coords.y, 10, 0, Math.PI * 2)
    ctx.fill()
    
    // 内圈质点
    ctx.fillStyle = '#F3F4F6'
    ctx.beginPath()
    ctx.arc(coords.x, coords.y, 6, 0, Math.PI * 2)
    ctx.fill()
  }
  
  // 收尾动画
  const animateBrachistochroneFinale = async (ctx, width, height, marginX, marginY, chartWidth, chartHeight) => {
    const bestPath = timeOptData.paths[3] // 方案D - 摆线
    
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, width, height)
    
    drawTimeOptGrid(ctx, marginX, marginY, chartWidth, chartHeight)
    drawTimeOptAxes(ctx, marginX, marginY, chartWidth, chartHeight)
    drawTimeOptTicks(ctx, marginX, marginY, chartWidth, chartHeight)
    drawTimeOptPoints(ctx, marginX, marginY, chartWidth, chartHeight)
    drawGravityArrow(ctx, marginX, marginY, chartWidth, chartHeight)
    
    // 其他方案透明度改为0.3
    timeOptData.paths.forEach(path => {
      if (!path.isBest) {
        drawTimeOptPath(ctx, path, marginX, marginY, chartWidth, chartHeight, 0.3, 2)
      }
    })
    
    // 最优方案高亮
    drawTimeOptPath(ctx, bestPath, marginX, marginY, chartWidth, chartHeight, 1, 3)
    
    drawTimeOptFormulaCard(ctx, width)
    drawTimeOptValueCard(ctx, bestPath, bestPath.time, marginX, marginY, chartHeight)
    drawTimeOptComparisonBar(ctx, width, '', marginX, marginY, chartWidth, chartHeight) // 空字符串表示结束状态
    
    return new Promise(resolve => setTimeout(resolve, 800))
  }
  // 绘制最短时间静态场景
  const drawTimeOptStaticScene = (ctx, width, height) => {
    const margin = 48
    const chartWidth = width - 2 * margin
    const chartHeight = height - 144 - 80 - 120 // 为底部UI预留更多空间
    const marginX = margin
    const marginY = 64
    
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, width, height)
    
    drawTimeOptGrid(ctx, marginX, marginY, chartWidth, chartHeight)
    drawTimeOptAxes(ctx, marginX, marginY, chartWidth, chartHeight)
    drawTimeOptTicks(ctx, marginX, marginY, chartWidth, chartHeight)
    drawTimeOptPoints(ctx, marginX, marginY, chartWidth, chartHeight)
    drawGravityArrow(ctx, marginX, marginY, chartWidth, chartHeight)
    
    // 绘制所有路径（最优方案高亮）
    const bestPath = timeOptData.paths[3] // 方案D - 摆线
    
    timeOptData.paths.forEach(path => {
      if (path.isBest) {
        drawTimeOptPath(ctx, path, marginX, marginY, chartWidth, chartHeight, 1, 3)
      } else {
        // 非最优路径透明度改为0.3
        drawTimeOptPath(ctx, path, marginX, marginY, chartWidth, chartHeight, 0.3, 2)
      }
    })
    
    drawTimeOptFormulaCard(ctx, width)
    drawTimeOptValueCard(ctx, bestPath, bestPath.time, marginX, marginY, chartHeight)
    drawTimeOptComparisonBar(ctx, width, '', marginX, marginY, chartWidth, chartHeight) // 结束状态
  }
  // 最短时间的初始静止动画（显示4条曲线，同等透明度）
  const drawTimeOptInitialScene = (ctx, width, height) => {
    const margin = 48
    const chartWidth = width - 2 * margin
    const chartHeight = height - 144 - 80 - 120 // 为底部UI预留更多空间
    const marginX = margin
    const marginY = 64
    
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, width, height)
    
    drawTimeOptGrid(ctx, marginX, marginY, chartWidth, chartHeight)
    drawTimeOptAxes(ctx, marginX, marginY, chartWidth, chartHeight)
    drawTimeOptTicks(ctx, marginX, marginY, chartWidth, chartHeight)
    drawTimeOptPoints(ctx, marginX, marginY, chartWidth, chartHeight)
    drawGravityArrow(ctx, marginX, marginY, chartWidth, chartHeight)
    
    // 绘制所有路径，同等透明度（0.8），同等线宽（2.5）
    timeOptData.paths.forEach(path => {
      drawTimeOptPath(ctx, path, marginX, marginY, chartWidth, chartHeight, 0.8, 2.5)
    })
    
    // 仅绘制公式卡片（不显示数值卡片和比较条）
    drawTimeOptFormulaCard(ctx, width)
  }

  // ===== 最短时间动画相关数据和函数 =====
  
  // 起止点和障碍物定义
  const timeOptData = {
    start: { x: 0, y: 0 },
    target: { x: Math.PI, y: 2 },
    gravity: 9.81, // m/s^2
    
    // 四条路径方案
    paths: [
      {
        id: 'A',
        name: '直线',
        description: '看起来最短',
        color: '#8B5CF6',
        time: 1.190,
        type: 'linear',
        // y = (2/π) * x
        equation: (x) => (2 / Math.PI) * x,
        derivative: (x) => 2 / Math.PI
      },
      {
        id: 'B', 
        name: '折线',
        description: '先陡后缓的直觉',
        color: '#10B981',
        time: 1.050,
        type: 'polyline',
        // S -> K(1.2, 1.5) -> T
        segments: [
          { start: [0, 0], end: [1.2, 1.5] },
          { start: [1.2, 1.5], end: [Math.PI, 2] }
        ]
      },
      {
        id: 'C',
        name: '二次曲线',
        description: '陡起步的平滑版本',  
        color: '#F59E0B',
        time: 1.044,
        type: 'quadratic',
        // y = αx + βx^2, α=1.3, β≈-0.2111605
        alpha: 1.3,
        beta: -0.2111605,
        equation: (x) => 1.3 * x + (-0.2111605) * x * x,
        derivative: (x) => 1.3 + 2 * (-0.2111605) * x
      },
      {
        id: 'D',
        name: '摆线',
        description: '最速曲线',
        color: '#EF4444',
        time: 1.003,
        type: 'cycloid',
        isBest: true,
        radius: 1,
        // 参数方程: x = θ - sin(θ), y = 1 - cos(θ), θ ∈ [0, π]
        parametric: {
          x: (theta) => theta - Math.sin(theta),
          y: (theta) => 1 - Math.cos(theta),
          // 导数 dx/dθ = 1 - cos(θ), dy/dθ = sin(θ)
          dxdt: (theta) => 1 - Math.cos(theta),
          dydt: (theta) => Math.sin(theta)
        }
      }
    ]
  }
  
  // 坐标转换函数
  const getTimeOptCanvasCoords = (x, y, marginX, marginY, chartWidth, chartHeight) => {
    return {
      x: marginX + (x / Math.PI) * chartWidth,
      y: marginY + (y / 2.0) * chartHeight
    }
  }
  
  // 绘制网格
  const drawTimeOptGrid = (ctx, marginX, marginY, chartWidth, chartHeight) => {
    // 添加15%的高度下移偏移
    const canvasHeight = ctx.canvas.height
    const offsetY = canvasHeight * 0.05
    marginY += offsetY
    // 次级网格
    ctx.strokeStyle = '#374151'
    ctx.globalAlpha = 0.4
    ctx.lineWidth = 1
    ctx.setLineDash([])
    
    // 垂直网格线 (x方向，π分为6份)
    for (let i = 0; i <= 6; i++) {
      const x = marginX + (i / 6) * chartWidth
      ctx.beginPath()
      ctx.moveTo(x, marginY)
      ctx.lineTo(x, marginY + chartHeight)
      ctx.stroke()
    }
    
    // 水平网格线 (y方向，2分为4份)
    for (let i = 0; i <= 4; i++) {
      const y = marginY + (i / 4) * chartHeight
      ctx.beginPath()
      ctx.moveTo(marginX, y)
      ctx.lineTo(marginX + chartWidth, y)
      ctx.stroke()
    }
    
    // 主网格
    ctx.strokeStyle = '#4B5563'
    ctx.globalAlpha = 0.7
    ctx.lineWidth = 1
    
    // 主垂直线 (π/2间隔)
    for (let i = 0; i <= 2; i++) {
      const x = marginX + (i / 2) * chartWidth
      ctx.beginPath()
      ctx.moveTo(x, marginY)
      ctx.lineTo(x, marginY + chartHeight)
      ctx.stroke()
    }
    
    // 主水平线 (1单位间隔)
    for (let i = 0; i <= 2; i++) {
      const y = marginY + (i / 2) * chartHeight
      ctx.beginPath()
      ctx.moveTo(marginX, y)
      ctx.lineTo(marginX + chartWidth, y)
      ctx.stroke()
    }
    
    ctx.globalAlpha = 1
  }
  // 绘制坐标轴
  const drawTimeOptAxes = (ctx, marginX, marginY, chartWidth, chartHeight) => {
    // 添加15%的高度下移偏移
    const canvasHeight = ctx.canvas.height
    const offsetY = canvasHeight * 0.05
    marginY += offsetY
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 2
    ctx.setLineDash([])
    
    // X轴
    ctx.beginPath()
    ctx.moveTo(marginX, marginY + chartHeight)
    ctx.lineTo(marginX + chartWidth + 10, marginY + chartHeight)
    ctx.stroke()
    
    // X轴箭头
    ctx.beginPath()
    ctx.moveTo(marginX + chartWidth + 10, marginY + chartHeight)
    ctx.lineTo(marginX + chartWidth + 5, marginY + chartHeight - 3)
    ctx.lineTo(marginX + chartWidth + 5, marginY + chartHeight + 3)
    ctx.closePath()
    ctx.fillStyle = '#F3F4F6'
    ctx.fill()
    
    // Y轴
    ctx.beginPath()
    ctx.moveTo(marginX, marginY + chartHeight)
    ctx.lineTo(marginX, marginY - 10)
    ctx.stroke()
    
    // Y轴箭头
    ctx.beginPath()
    ctx.moveTo(marginX, marginY - 10)
    ctx.lineTo(marginX - 3, marginY - 5)
    ctx.lineTo(marginX + 3, marginY - 5)
    ctx.closePath()
    ctx.fill()
    
    // 轴标签
    ctx.fillStyle = '#F3F4F6'
    ctx.font = '16px KaTeX_Math, Times New Roman, serif'
    ctx.textAlign = 'center'
    ctx.fillText('x', marginX + chartWidth + 20, marginY + chartHeight + 5)
    
    // y标签
    const startCoords = getTimeOptCanvasCoords(timeOptData.start.x, timeOptData.start.y, marginX, marginY, chartWidth, chartHeight)
    ctx.fillText('y', startCoords.x, startCoords.y - 18)
  }
  
  // 绘制坐标刻度
  const drawTimeOptTicks = (ctx, marginX, marginY, chartWidth, chartHeight) => {
    // 添加15%的高度下移偏移
    const canvasHeight = ctx.canvas.height
    const offsetY = canvasHeight * 0.05
    marginY += offsetY
    ctx.strokeStyle = '#9CA3AF'
    ctx.fillStyle = '#D1D5DB'
    ctx.lineWidth = 1
    ctx.font = '12px ui-sans-serif, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    
    // X轴刻度 (π/2间隔)
    const xLabels = ['0', 'π/2', 'π']
    for (let i = 0; i <= 2; i++) {
      const x = marginX + (i / 2) * chartWidth
      ctx.beginPath()
      ctx.moveTo(x, marginY + chartHeight)
      ctx.lineTo(x, marginY + chartHeight + 5)
      ctx.stroke()
      
      ctx.fillText(xLabels[i], x, marginY + chartHeight + 18)
    }
    
    // Y轴刻度 (1单位间隔)
    ctx.textAlign = 'right'
    for (let i = 0; i <= 2; i++) {
      const y = marginY + chartHeight - (i / 2) * chartHeight
      ctx.beginPath()
      ctx.moveTo(marginX - 5, y)
      ctx.lineTo(marginX, y)
      ctx.stroke()
      
      if (i > 0) { // 不显示0
        ctx.fillText(i.toString(), marginX - 8, y + 4)
      }
    }
  }
  
  // 绘制速度场区域
  const drawSpeedField = (ctx, field, marginX, marginY, chartWidth, chartHeight, alpha = 1) => {
    if (!field.points) return
    
    const coords = field.points.map(p => getTimeOptCanvasCoords(p[0], p[1], marginX, marginY, chartWidth, chartHeight))
    
    ctx.globalAlpha = alpha * field.fillAlpha
    ctx.fillStyle = field.color
    ctx.beginPath()
    ctx.moveTo(coords[0].x, coords[0].y)
    for (let i = 1; i < coords.length; i++) {
      ctx.lineTo(coords[i].x, coords[i].y)
    }
    ctx.closePath()
    ctx.fill()
    
    ctx.globalAlpha = alpha
    ctx.strokeStyle = field.strokeColor
    ctx.lineWidth = 1.5
    ctx.stroke()
    
    ctx.globalAlpha = 1
  }
  
  // 绘制障碍物
  const drawTimeOptObstacle = (ctx, obstacle, marginX, marginY, chartWidth, chartHeight, alpha = 1) => {
    const coords = obstacle.points.map(p => getTimeOptCanvasCoords(p[0], p[1], marginX, marginY, chartWidth, chartHeight))
    
    ctx.globalAlpha = alpha * 0.15
    ctx.fillStyle = '#718096'
    ctx.beginPath()
    ctx.moveTo(coords[0].x, coords[0].y)
    for (let i = 1; i < coords.length; i++) {
      ctx.lineTo(coords[i].x, coords[i].y)
    }
    ctx.closePath()
    ctx.fill()
    
    ctx.globalAlpha = alpha
    ctx.strokeStyle = '#4A5568'
    ctx.lineWidth = 1.5
    ctx.stroke()
    
    ctx.globalAlpha = 1
  }
  
  // 绘制起止点
  const drawTimeOptPoints = (ctx, marginX, marginY, chartWidth, chartHeight, scale = 1) => {
    // 添加15%的高度下移偏移
    const canvasHeight = ctx.canvas.height
    const offsetY = canvasHeight * 0.05
    marginY += offsetY
    const startCoords = getTimeOptCanvasCoords(timeOptData.start.x, timeOptData.start.y, marginX, marginY, chartWidth, chartHeight)
    const targetCoords = getTimeOptCanvasCoords(timeOptData.target.x, timeOptData.target.y, marginX, marginY, chartWidth, chartHeight)
    
    // 起点 S - 点位置不变
    ctx.fillStyle = '#2EC4B6'
    ctx.beginPath()
    ctx.arc(startCoords.x, startCoords.y, 6 * scale, 0, Math.PI * 2)
    ctx.fill()
    
    // S标识符向右下移动10px
    ctx.fillStyle = '#F3F4F6'
    ctx.font = '14px ui-sans-serif, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('S', startCoords.x + 16, startCoords.y + 5)
    
    // 终点 T
    ctx.fillStyle = '#4299E1'
    ctx.beginPath()
    ctx.arc(targetCoords.x, targetCoords.y, 6 * scale, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = '#F3F4F6'
    ctx.fillText('T', targetCoords.x, targetCoords.y - 12)
  }
  // 绘制重力箭头
  const drawGravityArrow = (ctx, marginX, marginY, chartWidth, chartHeight, alpha = 1) => {
    // 添加15%的高度下移偏移
    const canvasHeight = ctx.canvas.height
    const offsetY = canvasHeight * 0.05
    marginY += offsetY
    ctx.globalAlpha = alpha
    ctx.strokeStyle = '#60A5FA'
    ctx.fillStyle = '#3B82F6'
    ctx.lineWidth = 2
    
    const arrowX = marginX + chartWidth * 0.85
    const arrowY = marginY + 30
    const arrowLength = 40
    
    // 箭头线
    ctx.beginPath()
    ctx.moveTo(arrowX, arrowY)
    ctx.lineTo(arrowX, arrowY + arrowLength)
    ctx.stroke()
    
    // 箭头头部
    ctx.beginPath()
    ctx.moveTo(arrowX, arrowY + arrowLength)
    ctx.lineTo(arrowX - 4, arrowY + arrowLength - 8)
    ctx.lineTo(arrowX + 4, arrowY + arrowLength - 8)
    ctx.closePath()
    ctx.fill()
    
    // 标签"g"
    ctx.fillStyle = '#F3F4F6'
    ctx.font = '16px KaTeX_Math, Times New Roman, serif'
    ctx.textAlign = 'center'
    ctx.fillText('g', arrowX, arrowY - 8)
    
    ctx.globalAlpha = 1
  }
  
  // 绘制路径
  const drawTimeOptPath = (ctx, path, marginX, marginY, chartWidth, chartHeight, alpha = 1, lineWidth = 3) => {
    // 添加15%的高度下移偏移
    const canvasHeight = ctx.canvas.height
    const offsetY = canvasHeight * 0.05
    marginY += offsetY
    ctx.globalAlpha = alpha
    ctx.strokeStyle = path.color
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.setLineDash([])
    
    ctx.beginPath()
    
    if (path.type === 'linear') {
      // 直线: y = (2/π) * x
      const startCoords = getTimeOptCanvasCoords(0, 0, marginX, marginY, chartWidth, chartHeight)
      const endCoords = getTimeOptCanvasCoords(Math.PI, 2, marginX, marginY, chartWidth, chartHeight)
      ctx.moveTo(startCoords.x, startCoords.y)
      ctx.lineTo(endCoords.x, endCoords.y)
      
    } else if (path.type === 'polyline') {
      // 折线: S -> K -> T
      const segments = path.segments
      let firstPoint = true
      
      segments.forEach(segment => {
        const startCoords = getTimeOptCanvasCoords(segment.start[0], segment.start[1], marginX, marginY, chartWidth, chartHeight)
        const endCoords = getTimeOptCanvasCoords(segment.end[0], segment.end[1], marginX, marginY, chartWidth, chartHeight)
        
        if (firstPoint) {
          ctx.moveTo(startCoords.x, startCoords.y)
          firstPoint = false
        }
        ctx.lineTo(endCoords.x, endCoords.y)
      })
      
    } else if (path.type === 'quadratic') {
      // 二次曲线: y = αx + βx^2
      const numPoints = 50
      let firstPoint = true
      
      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints
        const x = t * Math.PI
        const y = path.equation(x)
        const coords = getTimeOptCanvasCoords(x, y, marginX, marginY, chartWidth, chartHeight)
        
        if (firstPoint) {
          ctx.moveTo(coords.x, coords.y)
          firstPoint = false
        } else {
          ctx.lineTo(coords.x, coords.y)
        }
      }
      
    } else if (path.type === 'cycloid') {
      // 摆线: x = θ - sin(θ), y = 1 - cos(θ)
      const numPoints = 100
      let firstPoint = true
      
      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints
        const theta = t * Math.PI
        const x = path.parametric.x(theta)
        const y = path.parametric.y(theta)
        const coords = getTimeOptCanvasCoords(x, y, marginX, marginY, chartWidth, chartHeight)
        
        if (firstPoint) {
          ctx.moveTo(coords.x, coords.y)
          firstPoint = false
        } else {
          ctx.lineTo(coords.x, coords.y)
        }
      }
    }
    
    ctx.stroke()
    ctx.globalAlpha = 1
  }
  
  // 绘制其他方案的预览路径
  const drawTimeOptPreviewPaths = (ctx, currentPathId, marginX, marginY, chartWidth, chartHeight) => {
    timeOptData.paths.forEach(path => {
      if (path.id !== currentPathId) {
        ctx.globalAlpha = 0.15
        ctx.strokeStyle = '#A0AEC0'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.setLineDash([])
        
        const coords = path.points.map(p => getTimeOptCanvasCoords(p[0], p[1], marginX, marginY, chartWidth, chartHeight))
        
        ctx.beginPath()
        ctx.moveTo(coords[0].x, coords[0].y)
        for (let i = 1; i < coords.length; i++) {
          ctx.lineTo(coords[i].x, coords[i].y)
        }
        ctx.stroke()
      }
    })
    ctx.globalAlpha = 1
  }
  
  // 绘制公式卡片
  const drawTimeOptFormulaCard = (ctx, width) => {
    // 公式现在由KaTeX覆盖层显示，这里不需要绘制任何内容
  }
  
  // 绘制数值卡片（相对图表区域底部定位）
  const drawTimeOptValueCard = (ctx, currentPath, currentTime = 0, marginX = 48, marginY = 64, chartHeight = 300) => {
    // 添加15%的高度下移偏移
    const canvasHeight = ctx.canvas.height
    const offsetY = canvasHeight * 0.05
    marginY += offsetY
    const cardWidth = 280
    const cardHeight = 100
    const x = marginX + 20 // 相对于图表左边距
    const y = ctx.canvas.height - 190 // 统一Y坐标位置
    
    // 背景
    ctx.fillStyle = 'rgba(15, 17, 22, 0.95)'
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)'
    ctx.lineWidth = 1
    roundRect(ctx, x, y, cardWidth, cardHeight, 8)
    ctx.fill()
    ctx.stroke()
    
    // 文字
    ctx.fillStyle = '#F3F4F6'
    ctx.font = '14px ui-sans-serif, -apple-system, sans-serif'
    ctx.textAlign = 'left'
    
    // 第一行：当前方案
    ctx.fillText(`当前方案：${currentPath.id} - ${currentPath.name}`, x + 12, y + 22)
    
    // 第二行：描述
    ctx.fillStyle = '#9CA3AF'
    ctx.font = '12px ui-sans-serif, -apple-system, sans-serif'
    ctx.fillText(currentPath.description, x + 12, y + 42)
    
    // 第三行：总时间
    ctx.fillStyle = '#F3F4F6'
    ctx.font = '14px ui-sans-serif, -apple-system, sans-serif'
    ctx.fillText('总时间 T = ', x + 12, y + 65)
    ctx.fillStyle = '#2EC4B6'
    ctx.font = '14px ui-monospace, Menlo, monospace'
    ctx.fillText(`${currentTime.toFixed(3)} s`, x + 80, y + 65)
    
    // 第四行：物理提示
    ctx.fillStyle = '#9CA3AF'
    ctx.font = '11px ui-sans-serif, -apple-system, sans-serif'
    ctx.fillText('越早获得纵向下落速度，整体用时越短', x + 12, y + 85)
  }
  // 绘制时间对比条（相对图表区域底部定位）
  const drawTimeOptComparisonBar = (ctx, width, currentPathId, marginX = 48, marginY = 64, chartWidth = 500, chartHeight = 300) => {
    // 添加15%的高度下移偏移
    const canvasHeight = ctx.canvas.height
    const offsetY = canvasHeight * 0.05
    marginY += offsetY
    const barWidth = 300
    const barHeight = 100
    const x = marginX + chartWidth - barWidth - 20 // 相对于图表右边距
    const y = ctx.canvas.height - 190 // 统一Y坐标位置
    
    // 背景
    ctx.fillStyle = 'rgba(15, 17, 22, 0.95)'
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)'
    ctx.lineWidth = 1
    roundRect(ctx, x, y, barWidth, barHeight, 8)
    ctx.fill()
    ctx.stroke()
    
    // 辅助函数：绘制文本（完全模仿置信度样式）
    const drawText = (ctx, text, x, y, options = {}) => {
      const {
        fontSize = 11,
        fontWeight = 'normal',
        color = '#F3F4F6',
        fontFamily = 'ui-sans-serif, -apple-system, sans-serif',
        baseline = 'middle'
      } = options
      
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
      ctx.fillStyle = color
      ctx.textBaseline = baseline
      ctx.textAlign = 'left'
      ctx.fillText(text, x, y)
    }
    
    // 获取最大时间用于进度条归一化
    const maxTime = Math.max(...timeOptData.paths.map(p => p.time))
    const isFinaleState = !currentPathId // 空字符串表示结束状态
    
    // 对比条（完全模仿置信度样式，去掉标题，直接显示）
    timeOptData.paths.forEach((path, index) => {
      const barY = y + 20 + index * 18  // 从顶部开始，增加行间距
      const progressBarWidth = 140  // 减小进度条宽度
      const fillWidth = progressBarWidth * (path.time / maxTime)
      const barCenterY = barY + 4  // 进度条中心Y坐标
      
      const isActive = path.id === currentPathId
      const isOptimal = path.isBest
      
      // 方案名称标签 - 垂直居中对齐进度条
      drawText(ctx, `路线${path.id}:`, x + 15, barCenterY, {
        fontSize: 11,
        color: isActive ? path.color : '#9CA3AF',
        fontWeight: isActive ? 'bold' : 'normal',
        fontFamily: 'ui-sans-serif, -apple-system, sans-serif',
        baseline: 'middle'
      })
      
      // 背景条
      ctx.fillStyle = 'rgba(75, 85, 99, 0.3)'
      ctx.fillRect(x + 60, barY, progressBarWidth, 8)
      
      // 填充条
      ctx.fillStyle = path.color
      ctx.fillRect(x + 60, barY, fillWidth, 8)
      
      // 时间数值 - 垂直居中对齐进度条
      let timeColor = '#9CA3AF' // 默认灰色
      if (isFinaleState) {
        // 结束状态：最优为绿色，其他为白色
        timeColor = isOptimal ? '#22C55E' : '#F3F4F6'
      } else {
        // 播放状态：当前为蓝色，最优为绿色，其他为灰色
        if (isActive) {
          timeColor = '#3B82F6' // 当前播放：蓝色
        } else if (isOptimal) {
          timeColor = '#22C55E' // 最优方案：绿色
        }
      }
      
      drawText(ctx, `${path.time.toFixed(3)}s`, x + 210, barCenterY, {
        fontSize: 10,
        color: timeColor,
        fontFamily: 'ui-monospace, Menlo, monospace',
        baseline: 'middle'
      })
      
      // 最优方案奖杯（右侧留出空间）- 垂直居中对齐进度条
      if (isOptimal) {
        drawText(ctx, '🏆', x + 260, barCenterY, {
          fontSize: 10,
          baseline: 'middle'
        })
      }
    })
  }
  
  // 绘制移动点
  const drawMovingDot = (ctx, x, y, marginX, marginY, chartWidth, chartHeight, scale = 1) => {
    const coords = getTimeOptCanvasCoords(x, y, marginX, marginY, chartWidth, chartHeight)
    
    // 外圈光晕
    ctx.fillStyle = 'rgba(237, 137, 54, 0.3)'
    ctx.beginPath()
    ctx.arc(coords.x, coords.y, 8 * scale, 0, Math.PI * 2)
    ctx.fill()
    
    // 内圈实心
    ctx.fillStyle = '#ED8936'
    ctx.beginPath()
    ctx.arc(coords.x, coords.y, 4 * scale, 0, Math.PI * 2)
    ctx.fill()
  }
  
  // 绘制速度标签
  const drawSpeedLabel = (ctx, text, x, y, marginX, marginY, chartWidth, chartHeight, alpha = 1) => {
    const coords = getTimeOptCanvasCoords(x, y, marginX, marginY, chartWidth, chartHeight)
    
    ctx.globalAlpha = alpha
    ctx.fillStyle = 'rgba(11, 18, 32, 0.8)'
    ctx.beginPath()
    ctx.roundRect(coords.x - 25, coords.y - 25, 50, 20, 4)
    ctx.fill()
    
    ctx.fillStyle = '#F3F4F6'
    ctx.font = '10px ui-sans-serif, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(text, coords.x, coords.y - 10)
    
    ctx.globalAlpha = 1
  }

  // 最大置信度动画相关状态
  const [currentConfidenceScheme, setCurrentConfidenceScheme] = useState('B')
  const [isPlayingConfidence, setIsPlayingConfidence] = useState(false)

  // 全站仪配置数据（按照详细规范）
  const confidenceData = {
    targetPoint: { E: 0, N: 0 }, // 目标点P（绿色圆点）
    stations: [
      // 低噪（蓝色）
      { id: 'L1', E: 0, N: 4000, noise: 'low', sigma: 0.003, weight: 111111, color: '#3B82F6' },
      { id: 'L2', E: 1000, N: 3800, noise: 'low', sigma: 0.003, weight: 111111, color: '#3B82F6' },
      // 中噪（浅橙）
      { id: 'M1', E: 800, N: 3600, noise: 'medium', sigma: 0.006, weight: 27778, color: '#F59E0B' },
      { id: 'M2', E: -4000, N: -300, noise: 'medium', sigma: 0.006, weight: 27778, color: '#F59E0B' },
      // 高噪（深红）
      { id: 'H1', E: 3500, N: -3500, noise: 'high', sigma: 0.012, weight: 6944, color: '#EF4444' },
      { id: 'H2', E: -3500, N: -3500, noise: 'high', sigma: 0.012, weight: 6944, color: '#EF4444' }
    ],
    schemes: [
      {
        id: 'A',
        name: '2低+1中，小角度交会',
        stations: ['L1', 'L2', 'M1'],
        description: '几何弱',
        minAngle: '2.21°',
        sqrtDetSigma: 3.872e-5,
        confidence: 0.628,
        color: '#8B5CF6',
        isBest: false,
        area95: 7.29e-4, // 95%置信度下的误差椭圆面积
        shapeDesc: '细长'
      },
      {
        id: 'B',
        name: '2低+1中，角度分散',
        stations: ['L1', 'L2', 'M2'],
        description: '综合最强',
        minAngle: '14.74°',
        sqrtDetSigma: 1.255e-5,
        confidence: 0.952,
        color: '#10B981',
        isBest: true,
        area95: 2.36e-4, // 95%置信度下的误差椭圆面积
        shapeDesc: '圆整'
      },
      {
        id: 'C',
        name: '1低+1中+1高，三角一般',
        stations: ['L1', 'M2', 'H1'],
        description: '中等',
        minAngle: '94.29°',
        sqrtDetSigma: 1.675e-5,
        confidence: 0.898,
        color: '#F59E0B',
        isBest: false,
        area95: 3.15e-4, // 95%置信度下的误差椭圆面积
        shapeDesc: '椭圆'
      },
      {
        id: 'D',
        name: '1中+2高，低质量',
        stations: ['M2', 'H1', 'H2'],
        description: '信息量最弱',
        minAngle: '40.71°',
        sqrtDetSigma: 6.440e-5,
        confidence: 0.448,
        color: '#EF4444',
        isBest: false,
        area95: 1.21e-3, // 95%置信度下的误差椭圆面积
        shapeDesc: '细长'
      }
    ],
    budgetArea: 2.4e-4, // m²（固定面积预算）
    coordRange: [-6000, 6000] // E/N坐标范围
  }

  const playCard1Scene4 = async (ctx, width, height, signal) => {
    setIsPlayingConfidence(true)
    
    const margin = 80
    const originalChartWidth = width - 2 * margin
    const originalChartHeight = height - 200  // 留出底部面板空间
    
    // 整体缩放到0.85
    const scaleFactor = 0.85
    const chartWidth = originalChartWidth * scaleFactor
    const chartHeight = originalChartHeight * scaleFactor
    
    const centerX = width / 2
    const centerY = (height - 200) / 2 + 80 // 向下移动给顶部更多空间
    
    // 坐标变换：E/N ∈ [-6000,6000] m 映射到画布
    const scale = Math.min(chartWidth, chartHeight) / 12000 // 适配12000m范围
    const transform = (E, N) => {
      return {
        x: centerX + E * scale,
        y: centerY - N * scale  // N轴向上
      }
    }
    
    // 绘制网格（去掉坐标轴）
    const drawGrid = () => {
      const gridBounds = {
        left: centerX - chartWidth / 2,
        right: centerX + chartWidth / 2,
        top: centerY - chartHeight / 2,
        bottom: centerY + chartHeight / 2
      }
      
      // 主网格线
      ctx.strokeStyle = '#4B5563'
      ctx.lineWidth = 0.5
      ctx.setLineDash([])
      
      for (let i = -6000; i <= 6000; i += 2000) {
        if (i !== 0) {
          const coords = transform(i, 0)
          if (coords.x >= gridBounds.left && coords.x <= gridBounds.right) {
            ctx.beginPath()
            ctx.moveTo(coords.x, gridBounds.top)
            ctx.lineTo(coords.x, gridBounds.bottom)
            ctx.stroke()
          }
          
          const coordsN = transform(0, i)
          if (coordsN.y >= gridBounds.top && coordsN.y <= gridBounds.bottom) {
            ctx.beginPath()
            ctx.moveTo(gridBounds.left, coordsN.y)
            ctx.lineTo(gridBounds.right, coordsN.y)
            ctx.stroke()
          }
        }
      }
      
      // 次网格线
      ctx.strokeStyle = '#374151'
      ctx.lineWidth = 0.3
      
      for (let i = -6000; i <= 6000; i += 1000) {
        if (i !== 0 && i % 2000 !== 0) {
          const coords = transform(i, 0)
          if (coords.x >= gridBounds.left && coords.x <= gridBounds.right) {
            ctx.beginPath()
            ctx.moveTo(coords.x, gridBounds.top)
            ctx.lineTo(coords.x, gridBounds.bottom)
            ctx.stroke()
          }
          
          const coordsN = transform(0, i)
          if (coordsN.y >= gridBounds.top && coordsN.y <= gridBounds.bottom) {
            ctx.beginPath()
            ctx.moveTo(gridBounds.left, coordsN.y)
            ctx.lineTo(gridBounds.right, coordsN.y)
            ctx.stroke()
          }
        }
      }
    }
    
    // 绘制目标点P
    const drawTargetPoint = () => {
      const coords = transform(confidenceData.targetPoint.E, confidenceData.targetPoint.N)
      
      // 外圈微光
      const gradient = ctx.createRadialGradient(coords.x, coords.y, 0, coords.x, coords.y, 12)
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.8)')
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0)')
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(coords.x, coords.y, 12, 0, 2 * Math.PI)
      ctx.fill()
      
      // 绿色圆点 6px
      ctx.fillStyle = '#10B981'
      ctx.beginPath()
      ctx.arc(coords.x, coords.y, 6, 0, 2 * Math.PI)
      ctx.fill()
      
      // P标识
      drawText(ctx, 'P', coords.x + 15, coords.y - 5, {
        fontSize: 12,
        color: '#10B981',
        fontWeight: 'bold'
      })
    }
    
    // 绘制全站仪（选中站点透明度增强+发光效果）
    const drawStations = (highlightScheme = null) => {
      confidenceData.stations.forEach(station => {
        const coords = transform(station.E, station.N)
        const isHighlighted = highlightScheme && highlightScheme.stations.includes(station.id)
        
        // 设置透明度：选中站点更亮，未选中站点更暗
        const baseAlpha = isHighlighted ? 1.0 : (highlightScheme ? 0.3 : 1.0)
        
        // 单站噪声小圆（示意用，半径与σ成比例）
        // 根据实际精度调整缩放比例：使误差圈和椭圆在视觉上呈现合理关系
        // L1/L2=3mm, M1/M2=6mm, H1/H2=12mm, A*=5.05mm
        const noiseRadius = station.sigma * 6500 // 调整为更合理的缩放比例
        ctx.globalAlpha = baseAlpha * 0.2
        ctx.fillStyle = station.color
        ctx.strokeStyle = station.color
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(coords.x, coords.y, noiseRadius, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()
        
        // 选中站点的发光效果
        if (isHighlighted) {
          // 外层发光光圈
          const gradient = ctx.createRadialGradient(coords.x, coords.y, 0, coords.x, coords.y, 25)
          gradient.addColorStop(0, `${station.color}80`)
          gradient.addColorStop(0.6, `${station.color}40`)
          gradient.addColorStop(1, `${station.color}00`)
          
          ctx.globalAlpha = 1.0
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(coords.x, coords.y, 25, 0, 2 * Math.PI)
          ctx.fill()
          
          // 内层强光圈
          const innerGradient = ctx.createRadialGradient(coords.x, coords.y, 0, coords.x, coords.y, 12)
          innerGradient.addColorStop(0, `${station.color}90`)
          innerGradient.addColorStop(1, `${station.color}20`)
          
          ctx.fillStyle = innerGradient
          ctx.beginPath()
          ctx.arc(coords.x, coords.y, 12, 0, 2 * Math.PI)
          ctx.fill()
        }
        
        // 三角形标记（全站仪）
        const size = isHighlighted ? 8 : 6
        const lineWidth = isHighlighted ? 3 : 2
        
        ctx.globalAlpha = isHighlighted ? 1.0 : baseAlpha
        ctx.fillStyle = station.color
        ctx.strokeStyle = station.color
        ctx.lineWidth = lineWidth
        
        ctx.beginPath()
        ctx.moveTo(coords.x, coords.y - size)
        ctx.lineTo(coords.x - size * 0.866, coords.y + size * 0.5)
        ctx.lineTo(coords.x + size * 0.866, coords.y + size * 0.5)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        
        // 站点标识
        drawText(ctx, station.id, coords.x, coords.y - size - 10, {
          fontSize: isHighlighted ? 12 : 10,
          align: 'center',
          color: station.color,
          fontWeight: isHighlighted ? 'bold' : 'normal'
        })
        
        ctx.globalAlpha = 1
      })
    }
    
    // 绘制固定面积预算圈（橙色半透明）
    const drawBudgetCircle = () => {
      const centerCoords = transform(confidenceData.targetPoint.E, confidenceData.targetPoint.N)
      const budgetRadius = Math.sqrt(confidenceData.budgetArea / Math.PI) * scale * 1000 // 转换为像素
      
      ctx.fillStyle = 'rgba(237, 137, 54, 0.6)' // #ED8936，透明60%
      ctx.strokeStyle = '#ED8936'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(centerCoords.x, centerCoords.y, budgetRadius, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
    }
    
    // 绘制静态A*预算误差椭圆（始终显示）
    const drawStaticBudgetEllipse = () => {
      const centerCoords = transform(confidenceData.targetPoint.E, confidenceData.targetPoint.N)
      
      // 使用固定的预算椭圆尺寸 - A*=5.05mm，应该介于L1(3mm)和M1(6mm)之间
      // 计算：sqrt(2.4e-4/π) = 0.00874m = 8.74mm，但中误差为5.05mm
      const budgetRadius = Math.sqrt(confidenceData.budgetArea / Math.PI) * scale * 1000 * 88 // 调整为40倍
      
      // A*椭圆形状（可以调整比例）
      const a = budgetRadius * 1.1  // 长半轴
      const b = budgetRadius * 0.9  // 短半轴
      
      // 绘制A*预算椭圆（浅灰色、实线、发光）
      ctx.fillStyle = 'rgba(156, 163, 175, 0.15)' // 浅灰色，15%透明度
      ctx.strokeStyle = '#9CA3AF' // 浅灰色边框
      ctx.lineWidth = 2
      ctx.setLineDash([]) // 实线
      
      // 添加发光效果
      ctx.shadowColor = '#9CA3AF'
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.beginPath()
      ctx.ellipse(centerCoords.x, centerCoords.y, a, b, 0, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
      
      // 重置阴影
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
    }
    
    // 绘制95%置信度椭圆（用于对比）
    const draw95ConfidenceEllipse = (scheme, progress) => {
      const centerCoords = transform(confidenceData.targetPoint.E, confidenceData.targetPoint.N)
      
      // 基于A95面积计算椭圆尺寸 - 与测站误差圈保持合理比例
      const baseRadius95 = Math.sqrt(scheme.area95 / Math.PI) * scale * 1000 * 88 // 与A*保持相同缩放
      const currentRadius95 = baseRadius95 * progress  // 动态缩放
      
      // 根据形状描述调整椭圆比例
      let a, b
      if (scheme.shapeDesc === '圆整') {
        a = currentRadius95
        b = currentRadius95
      } else if (scheme.shapeDesc === '椭圆') {
        a = currentRadius95 * 1.3
        b = currentRadius95 * 0.8
      } else { // 细长
        a = currentRadius95 * 1.6
        b = currentRadius95 * 0.6
      }
      
      // 绘制95%置信度椭圆（方案配色、虚线）
      ctx.fillStyle = `${scheme.color}33` // 方案配色，20%透明度
      ctx.strokeStyle = scheme.color
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5]) // 虚线
      
      ctx.beginPath()
      ctx.ellipse(centerCoords.x, centerCoords.y, a, b, 0, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
      
      ctx.setLineDash([])
    }
    
    // 绘制误差椭圆（基于协方差矩阵）
    const drawConfidenceEllipse = (scheme, progress) => {
      // 这个函数现在改名为drawBudgetEllipse更合适，但为了保持兼容性暂时保留原名
      // 实际上是绘制A*预算误差椭圆，应该始终静态显示
      const centerCoords = transform(confidenceData.targetPoint.E, confidenceData.targetPoint.N)
      
      // 基于固定面积预算计算椭圆尺寸 - 与测站误差圈保持合理比例
      const kMax = Math.sqrt(confidenceData.budgetArea / (Math.PI * scheme.sqrtDetSigma))
      const currentK = kMax * progress
      
      // 简化椭圆计算（实际应基于协方差矩阵特征值）- 与其他元素保持相同缩放
      const a = currentK * Math.sqrt(scheme.sqrtDetSigma) * scale * 1000 * 1.2 * 88 // 长半轴
      const b = currentK * Math.sqrt(scheme.sqrtDetSigma) * scale * 1000 * 0.8 * 88 // 短半轴
      
      // 绘制A*预算椭圆（浅灰色、实线、发光）
      ctx.fillStyle = 'rgba(156, 163, 175, 0.15)' // 浅灰色，15%透明度
      ctx.strokeStyle = '#9CA3AF' // 浅灰色边框
      ctx.lineWidth = 2
      ctx.setLineDash([]) // 实线
      
      // 添加发光效果
      ctx.shadowColor = '#9CA3AF'
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      
      ctx.beginPath()
      ctx.ellipse(centerCoords.x, centerCoords.y, a, b, 0, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
      
      // 重置阴影
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
    }
    
    // 绘制视线和夹角
    const drawSightLines = (scheme) => {
      const centerCoords = transform(confidenceData.targetPoint.E, confidenceData.targetPoint.N)
      const selectedStations = confidenceData.stations.filter(s => scheme.stations.includes(s.id))
      
      // 绘制视线（按测站精度设置颜色）
      selectedStations.forEach(station => {
        const stationCoords = transform(station.E, station.N)
        
        // 按照精度设置连线颜色：低噪(高精度)=蓝色，中噪(中精度)=橙色，高噪(低精度)=红色
        let lineColor
        if (station.noise === 'low') {
          lineColor = '#3B82F6' // 蓝色 - 高精度
        } else if (station.noise === 'medium') {
          lineColor = '#F59E0B' // 橙色 - 中精度  
        } else { // high
          lineColor = '#EF4444' // 红色 - 低精度
        }
        
        ctx.strokeStyle = `${lineColor}CC` // 透明度80%
        ctx.lineWidth = 2
        ctx.setLineDash([8, 4]) // 虚线
        ctx.beginPath()
        ctx.moveTo(centerCoords.x, centerCoords.y)
        ctx.lineTo(stationCoords.x, stationCoords.y)
        ctx.stroke()
      })
      
      ctx.setLineDash([])
      
      // 显示最小交会角文本
      drawText(ctx, `最小交会角: ${scheme.minAngle}`, centerCoords.x + 30, centerCoords.y - 35, {
        fontSize: 12,
        color: scheme.color,
        fontWeight: 'bold'
      })
    }
    
    // 绘制底部信息面板（模仿最短时间布局）
    const drawBottomInfoPanels = (scheme) => {
      const panelY = height - 130
      const leftCardX = 50
      const rightCardX = width - 350
      const cardHeight = 100
      
      // 左侧信息卡
      ctx.fillStyle = 'rgba(15, 17, 22, 0.95)'
      ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)'
      ctx.lineWidth = 1
      roundRect(ctx, leftCardX, panelY, 300, cardHeight, 8)
      ctx.fill()
      ctx.stroke()
      
      // 计算垂直居中的行位置（将卡片高度均匀分为5份，4行文字分布在中间4份）
      const lineHeight = cardHeight / 5  // 20px
      const textY1 = panelY + lineHeight * 1     // 20px
      const textY2 = panelY + lineHeight * 2     // 40px
      const textY3 = panelY + lineHeight * 3     // 60px
      const textY4 = panelY + lineHeight * 4     // 80px
      
      // 第一行：当前方案站点 - 垂直居中
      drawText(ctx, `当前方案：{${scheme.stations.join(', ')}}`, leftCardX + 15, textY1, {
        fontSize: 13,
        fontWeight: 'bold',
        color: scheme.color,
        fontFamily: 'ui-sans-serif, -apple-system, sans-serif',
        baseline: 'middle'
      })
      
      // 第二行：当前方案特点 - 垂直居中
      drawText(ctx, `${scheme.description}，最小交会角 ${scheme.minAngle}`, leftCardX + 15, textY2, {
        fontSize: 11,
        color: '#E5E7EB',
        fontFamily: 'ui-sans-serif, -apple-system, sans-serif',
        baseline: 'middle'
      })
      
      // 第三行：固定预算面积 - 垂直居中
      drawText(ctx, `固定预算面积 A* = 2.4e-4 m²`, leftCardX + 15, textY3, {
        fontSize: 10,
        color: '#9CA3AF',
        fontFamily: 'ui-sans-serif, -apple-system, sans-serif',
        baseline: 'middle'
      })
      
      // 第四行：95%置信度下误差椭圆面积 - 垂直居中
      drawText(ctx, `95%置信度面积 = ${scheme.area95.toExponential(2)} m²`, leftCardX + 15, textY4, {
        fontSize: 10,
        color: '#9CA3AF',
        fontFamily: 'ui-sans-serif, -apple-system, sans-serif',
        baseline: 'middle'
      })
      
      // 右侧比较卡
      ctx.fillStyle = 'rgba(15, 17, 22, 0.95)'
      ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)'
      roundRect(ctx, rightCardX, panelY, 280, cardHeight, 8)
      ctx.fill()
      ctx.stroke()
      
      // 对比条（去掉标题，直接显示）
      confidenceData.schemes.forEach((s, index) => {
        const barY = panelY + 20 + index * 18  // 从顶部开始，增加行间距
        const barWidth = 140  // 减小进度条宽度
        const fillWidth = barWidth * s.confidence
        const barCenterY = barY + 4  // 进度条中心Y坐标
        
        // 方案名称标签 - 垂直居中对齐进度条
        drawText(ctx, `方案${s.id}:`, rightCardX + 15, barCenterY, {
          fontSize: 11,
          color: s.id === scheme.id ? s.color : '#9CA3AF',
          fontWeight: s.id === scheme.id ? 'bold' : 'normal',
          fontFamily: 'ui-sans-serif, -apple-system, sans-serif',
          baseline: 'middle'
        })
        
        // 背景条
        ctx.fillStyle = 'rgba(75, 85, 99, 0.3)'
        ctx.fillRect(rightCardX + 60, barY, barWidth, 8)
        
        // 填充条
        ctx.fillStyle = s.color
        ctx.fillRect(rightCardX + 60, barY, fillWidth, 8)
        
        // 置信度百分比 - 垂直居中对齐进度条
        drawText(ctx, `${(s.confidence * 100).toFixed(1)}%`, rightCardX + 210, barCenterY, {
          fontSize: 10,
          color: s.id === scheme.id ? s.color : '#9CA3AF',
          fontFamily: 'ui-sans-serif, -apple-system, sans-serif',
          baseline: 'middle'
        })
        
        // 最优方案奖杯（右侧留出空间）- 垂直居中对齐进度条
        if (s.isBest) {
          drawText(ctx, '🏆', rightCardX + 250, barCenterY, {
            fontSize: 10,
            baseline: 'middle'
          })
        }
      })
    }
    
    // 入场动画（简化版本）
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, width, height)
    
    // 绘制基础场景
    drawGrid()
    drawTargetPoint()
    drawStations()
    drawBudgetCircle()
    drawStaticBudgetEllipse() // 始终显示A*预算椭圆
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 主循环：A→B→C→D（每条2.5-3s）
    for (let scheme of confidenceData.schemes) {
      if (signal?.aborted) return
      
      setCurrentConfidenceScheme(scheme.id)
      
      // 清空并绘制基础元素
      ctx.fillStyle = '#111827'
      ctx.fillRect(0, 0, width, height)
      drawGrid()
      drawTargetPoint()
      drawBudgetCircle()
      drawStaticBudgetEllipse() // 始终显示A*预算椭圆
      
      // 1. 高亮三台站点（发光效果）
      drawStations(scheme)
      drawSightLines(scheme)
      
      // 2. 95%置信度椭圆在动画中显示，这里不显示静态版本
      
      // 3. 绘制底部信息面板（始终显示）
      drawBottomInfoPanels(scheme)
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 4. 充置信度动画：椭圆从小逐步放大到面积=A*
      const duration = 2500
      const startTime = Date.now()
      
      while (Date.now() - startTime < duration) {
        if (signal?.aborted) return
        
        const progress = Math.min((Date.now() - startTime) / duration, 1)
        const easeProgress = 1 - Math.pow(1 - progress, 3) // ease-out cubic
        
        // 重新绘制基础元素
        ctx.fillStyle = '#111827'
        roundRect(ctx, 0, 0, width, height, 12)
        ctx.fill()
        drawGrid()
        drawTargetPoint()
        drawBudgetCircle()
        drawStaticBudgetEllipse() // 静态A*椭圆
        drawStations(scheme)
        drawSightLines(scheme)
        draw95ConfidenceEllipse(scheme, easeProgress) // 动态放大95%置信度椭圆
        drawBottomInfoPanels(scheme)
        
        await new Promise(resolve => setTimeout(resolve, 16))
      }
      
      // 5. 定格0.3s显示pmax
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    
    // 收尾（1.0s）：回到方案B定格（最优方案）
    const bestScheme = confidenceData.schemes.find(s => s.isBest)
    setCurrentConfidenceScheme(bestScheme.id)
    
    // 最终状态：显示最优方案的完整信息
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, width, height)
    drawGrid()
    drawTargetPoint()
    drawBudgetCircle()
    drawStaticBudgetEllipse() // 静态A*预算椭圆
    drawStations(bestScheme) // 高亮选中站点
    drawSightLines(bestScheme) // 显示连线
    draw95ConfidenceEllipse(bestScheme, 1) // 显示完整的95%置信度椭圆
    drawBottomInfoPanels(bestScheme)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsPlayingConfidence(false)
  }
  
  // 绘制置信度静态场景（更新规范）
  const drawConfidenceStaticScene = (ctx, width, height) => {
    const margin = 80
    const originalChartWidth = width - 2 * margin
    const originalChartHeight = height - 200
    
    // 整体缩放到0.85
    const scaleFactor = 0.85
    const chartWidth = originalChartWidth * scaleFactor
    const chartHeight = originalChartHeight * scaleFactor
    
    const centerX = width / 2
    const centerY = (height - 200) / 2 + 80
    
    // 坐标变换：E/N ∈ [-6000,6000] m 映射到画布
    const scale = Math.min(chartWidth, chartHeight) / 12000
    const transform = (E, N) => {
      return {
        x: centerX + E * scale,
        y: centerY - N * scale  // N轴向上
      }
    }
    
    // 绘制网格（去掉坐标轴）
    const gridBounds = {
      left: centerX - chartWidth / 2,
      right: centerX + chartWidth / 2,
      top: centerY - chartHeight / 2,
      bottom: centerY + chartHeight / 2
    }
    
    // 主网格线
    ctx.strokeStyle = '#4B5563'
    ctx.lineWidth = 0.5
    ctx.setLineDash([])
    
    for (let i = -6000; i <= 6000; i += 2000) {
      if (i !== 0) {
        const coords = transform(i, 0)
        if (coords.x >= gridBounds.left && coords.x <= gridBounds.right) {
          ctx.beginPath()
          ctx.moveTo(coords.x, gridBounds.top)
          ctx.lineTo(coords.x, gridBounds.bottom)
          ctx.stroke()
        }
        
        const coordsN = transform(0, i)
        if (coordsN.y >= gridBounds.top && coordsN.y <= gridBounds.bottom) {
          ctx.beginPath()
          ctx.moveTo(gridBounds.left, coordsN.y)
          ctx.lineTo(gridBounds.right, coordsN.y)
          ctx.stroke()
        }
      }
    }
    
    // 次网格线
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 0.3
    
    for (let i = -6000; i <= 6000; i += 1000) {
      if (i !== 0 && i % 2000 !== 0) {
        const coords = transform(i, 0)
        if (coords.x >= gridBounds.left && coords.x <= gridBounds.right) {
          ctx.beginPath()
          ctx.moveTo(coords.x, gridBounds.top)
          ctx.lineTo(coords.x, gridBounds.bottom)
          ctx.stroke()
        }
        
        const coordsN = transform(0, i)
        if (coordsN.y >= gridBounds.top && coordsN.y <= gridBounds.bottom) {
          ctx.beginPath()
          ctx.moveTo(gridBounds.left, coordsN.y)
          ctx.lineTo(gridBounds.right, coordsN.y)
          ctx.stroke()
        }
      }
    }
    
    // 绘制目标点P
    const targetCoords = transform(confidenceData.targetPoint.E, confidenceData.targetPoint.N)
    
    // 外圈微光
    const gradient = ctx.createRadialGradient(targetCoords.x, targetCoords.y, 0, targetCoords.x, targetCoords.y, 12)
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.8)')
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(targetCoords.x, targetCoords.y, 12, 0, 2 * Math.PI)
    ctx.fill()
    
    // 绿色圆点
    ctx.fillStyle = '#10B981'
    ctx.beginPath()
    ctx.arc(targetCoords.x, targetCoords.y, 6, 0, 2 * Math.PI)
    ctx.fill()
    
    drawText(ctx, 'P', targetCoords.x + 15, targetCoords.y - 5, {
      fontSize: 12,
      color: '#10B981',
      fontWeight: 'bold'
    })
    
    // 绘制固定面积预算圈
    const budgetRadius = Math.sqrt(confidenceData.budgetArea / Math.PI) * scale * 1000
    ctx.fillStyle = 'rgba(237, 137, 54, 0.6)'
    ctx.strokeStyle = '#ED8936'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(targetCoords.x, targetCoords.y, budgetRadius, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    
    // 绘制全站仪（带高亮发光效果）
    const currentScheme = confidenceData.schemes.find(s => s.id === currentConfidenceScheme)
    
    confidenceData.stations.forEach(station => {
      const coords = transform(station.E, station.N)
      const isHighlighted = currentScheme && currentScheme.stations.includes(station.id)
      
      // 设置透明度：选中站点更亮，未选中站点更暗
      const baseAlpha = isHighlighted ? 1.0 : (currentScheme ? 0.3 : 1.0)
      
      // 噪声小圆 - 与动画中保持一致的缩放比例
      const noiseRadius = station.sigma * 6500
      ctx.globalAlpha = baseAlpha * 0.2
      ctx.fillStyle = station.color
      ctx.strokeStyle = station.color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(coords.x, coords.y, noiseRadius, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
      
      // 选中站点的发光效果
      if (isHighlighted) {
        // 外层发光光圈
        const gradient = ctx.createRadialGradient(coords.x, coords.y, 0, coords.x, coords.y, 25)
        gradient.addColorStop(0, `${station.color}80`)
        gradient.addColorStop(0.6, `${station.color}40`)
        gradient.addColorStop(1, `${station.color}00`)
        
        ctx.globalAlpha = 1.0
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(coords.x, coords.y, 25, 0, 2 * Math.PI)
        ctx.fill()
        
        // 内层强光圈
        const innerGradient = ctx.createRadialGradient(coords.x, coords.y, 0, coords.x, coords.y, 12)
        innerGradient.addColorStop(0, `${station.color}90`)
        innerGradient.addColorStop(1, `${station.color}20`)
        
        ctx.fillStyle = innerGradient
        ctx.beginPath()
        ctx.arc(coords.x, coords.y, 12, 0, 2 * Math.PI)
        ctx.fill()
      }
      
      // 三角形标记
      const size = isHighlighted ? 8 : 6
      ctx.globalAlpha = isHighlighted ? 1.0 : baseAlpha
      ctx.fillStyle = station.color
      ctx.strokeStyle = station.color
      ctx.lineWidth = isHighlighted ? 3 : 2
      
      ctx.beginPath()
      ctx.moveTo(coords.x, coords.y - size)
      ctx.lineTo(coords.x - size * 0.866, coords.y + size * 0.5)
      ctx.lineTo(coords.x + size * 0.866, coords.y + size * 0.5)
      ctx.fill()
      ctx.stroke()
      
      drawText(ctx, station.id, coords.x, coords.y - size - 10, {
        fontSize: isHighlighted ? 12 : 10,
        align: 'center',
        color: station.color,
        fontWeight: isHighlighted ? 'bold' : 'normal'
      })
      
      ctx.globalAlpha = 1
    })
    
    // 绘制静态A*预算误差椭圆（始终显示）
    const budgetRadiusEllipse = Math.sqrt(confidenceData.budgetArea / Math.PI) * scale * 1000 * 88
    const aStatic = budgetRadiusEllipse * 1.1  // 长半轴
    const bStatic = budgetRadiusEllipse * 0.9  // 短半轴
    
    // A*预算椭圆（浅灰色、实线、发光）
    ctx.fillStyle = 'rgba(156, 163, 175, 0.15)' // 浅灰色，15%透明度
    ctx.strokeStyle = '#9CA3AF' // 浅灰色边框
    ctx.lineWidth = 2
    ctx.setLineDash([]) // 实线
    
    // 添加发光效果
    ctx.shadowColor = '#9CA3AF'
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    
    ctx.beginPath()
    ctx.ellipse(targetCoords.x, targetCoords.y, aStatic, bStatic, 0, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    
    // 重置阴影
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    
    // 绘制95%置信度椭圆（当前方案配色）
    if (currentScheme) {
      const radius95 = Math.sqrt(currentScheme.area95 / Math.PI) * scale * 1000 * 88  // 与A*保持相同缩放
      
      ctx.fillStyle = `${currentScheme.color}33` // 方案配色，20%透明度
      ctx.strokeStyle = currentScheme.color
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5]) // 虚线
      
      let a, b
      if (currentScheme.shapeDesc === '圆整') {
        a = radius95
        b = radius95
      } else if (currentScheme.shapeDesc === '椭圆') {
        a = radius95 * 1.3
        b = radius95 * 0.8
      } else {
        a = radius95 * 1.6
        b = radius95 * 0.6
      }
      
      ctx.beginPath()
      ctx.ellipse(targetCoords.x, targetCoords.y, a, b, 0, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
      
      ctx.setLineDash([])
    }
    
    // 绘制连线（从目标点到选中的测站）
    if (currentScheme) {
      const selectedStations = confidenceData.stations.filter(s => currentScheme.stations.includes(s.id))
      
      selectedStations.forEach(station => {
        const stationCoords = transform(station.E, station.N)
        
        // 按照精度设置连线颜色：低噪(高精度)=蓝色，中噪(中精度)=橙色，高噪(低精度)=红色
        let lineColor
        if (station.noise === 'low') {
          lineColor = '#3B82F6' // 蓝色 - 高精度
        } else if (station.noise === 'medium') {
          lineColor = '#F59E0B' // 橙色 - 中精度  
        } else { // high
          lineColor = '#EF4444' // 红色 - 低精度
        }
        
        ctx.strokeStyle = `${lineColor}CC` // 透明度80%
        ctx.lineWidth = 2
        ctx.setLineDash([8, 4]) // 虚线
        ctx.beginPath()
        ctx.moveTo(targetCoords.x, targetCoords.y)
        ctx.lineTo(stationCoords.x, stationCoords.y)
        ctx.stroke()
      })
      
      ctx.setLineDash([])
    }
    
    // 绘制底部信息面板
    if (currentScheme) {
      const panelY = height - 130
      const leftCardX = 50
      const rightCardX = width - 350
      const cardHeight = 100
      
      // 左侧信息卡
      ctx.fillStyle = 'rgba(15, 17, 22, 0.95)'
      ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)'
      ctx.lineWidth = 1
      roundRect(ctx, leftCardX, panelY, 300, cardHeight, 8)
      ctx.fill()
      ctx.stroke()
      
      // 计算垂直居中的行位置（将卡片高度均匀分为5份，4行文字分布在中间4份）
      const lineHeight = cardHeight / 5  // 20px
      const textY1 = panelY + lineHeight * 1     // 20px
      const textY2 = panelY + lineHeight * 2     // 40px
      const textY3 = panelY + lineHeight * 3     // 60px
      const textY4 = panelY + lineHeight * 4     // 80px
      
      // 第一行：当前方案站点 - 垂直居中
      drawText(ctx, `当前方案：{${currentScheme.stations.join(', ')}}`, leftCardX + 15, textY1, {
        fontSize: 13,
        fontWeight: 'bold',
        color: currentScheme.color,
        fontFamily: 'ui-sans-serif, -apple-system, sans-serif',
        baseline: 'middle'
      })
      
      // 第二行：当前方案特点 - 垂直居中
      drawText(ctx, `${currentScheme.description}，最小交会角 ${currentScheme.minAngle}`, leftCardX + 15, textY2, {
        fontSize: 11,
        color: '#E5E7EB',
        fontFamily: 'ui-sans-serif, -apple-system, sans-serif',
        baseline: 'middle'
      })
      
      // 第三行：固定预算面积 - 垂直居中
      drawText(ctx, `固定预算面积 A* = 2.4e-4 m²`, leftCardX + 15, textY3, {
        fontSize: 10,
        color: '#9CA3AF',
        fontFamily: 'ui-sans-serif, -apple-system, sans-serif',
        baseline: 'middle'
      })
      
      // 第四行：95%置信度下误差椭圆面积 - 垂直居中
      drawText(ctx, `95%置信度面积 = ${currentScheme.area95.toExponential(2)} m²`, leftCardX + 15, textY4, {
        fontSize: 10,
        color: '#9CA3AF',
        fontFamily: 'ui-sans-serif, -apple-system, sans-serif',
        baseline: 'middle'
      })
      
      // 右侧比较卡
      ctx.fillStyle = 'rgba(15, 17, 22, 0.95)'
      ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)'
      roundRect(ctx, rightCardX, panelY, 280, cardHeight, 8)
      ctx.fill()
      ctx.stroke()
      
      // 对比条（去掉标题，直接显示）
      confidenceData.schemes.forEach((s, index) => {
        const barY = panelY + 20 + index * 18  // 从顶部开始，增加行间距
        const barWidth = 140  // 减小进度条宽度
        const fillWidth = barWidth * s.confidence
        const barCenterY = barY + 4  // 进度条中心Y坐标
        
        // 方案名称标签 - 垂直居中对齐进度条
        drawText(ctx, `方案${s.id}:`, rightCardX + 15, barCenterY, {
          fontSize: 11,
          color: s.id === currentScheme.id ? s.color : '#9CA3AF',
          fontWeight: s.id === currentScheme.id ? 'bold' : 'normal',
          fontFamily: 'ui-sans-serif, -apple-system, sans-serif',
          baseline: 'middle'
        })
        
        // 背景条
        ctx.fillStyle = 'rgba(75, 85, 99, 0.3)'
        ctx.fillRect(rightCardX + 60, barY, barWidth, 8)
        
        // 填充条
        ctx.fillStyle = s.color
        ctx.fillRect(rightCardX + 60, barY, fillWidth, 8)
        
        // 置信度百分比 - 垂直居中对齐进度条
        drawText(ctx, `${(s.confidence * 100).toFixed(1)}%`, rightCardX + 210, barCenterY, {
          fontSize: 10,
          color: s.id === currentScheme.id ? s.color : '#9CA3AF',
          fontFamily: 'ui-sans-serif, -apple-system, sans-serif',
          baseline: 'middle'
        })
        
        // 最优方案奖杯（右侧留出空间）- 垂直居中对齐进度条
        if (s.isBest) {
          drawText(ctx, '🏆', rightCardX + 250, barCenterY, {
            fontSize: 10,
            baseline: 'middle'
          })
        }
      })
    }
  }
  // 最大置信度的初次进入静态场景（仅显示基础元素，不显示方案信息）
  const drawConfidenceInitialScene = (ctx, width, height) => {
    const margin = 80
    const originalChartWidth = width - 2 * margin
    const originalChartHeight = height - 200
    
    // 整体缩放到0.85
    const scaleFactor = 0.85
    const chartWidth = originalChartWidth * scaleFactor
    const chartHeight = originalChartHeight * scaleFactor
    
    const centerX = width / 2
    const centerY = (height - 200) / 2 + 80
    
    // 坐标变换：E/N ∈ [-6000,6000] m 映射到画布
    const scale = Math.min(chartWidth, chartHeight) / 12000
    const transform = (E, N) => {
      return {
        x: centerX + E * scale,
        y: centerY - N * scale  // N轴向上
      }
    }
    
    // 绘制网格（去掉坐标轴）
    const gridBounds = {
      left: centerX - chartWidth / 2,
      right: centerX + chartWidth / 2,
      top: centerY - chartHeight / 2,
      bottom: centerY + chartHeight / 2
    }
    
    // 主网格线
    ctx.strokeStyle = '#4B5563'
    ctx.lineWidth = 0.5
    ctx.setLineDash([])
    
    for (let i = -6000; i <= 6000; i += 2000) {
      if (i !== 0) {
        const coords = transform(i, 0)
        if (coords.x >= gridBounds.left && coords.x <= gridBounds.right) {
          ctx.beginPath()
          ctx.moveTo(coords.x, gridBounds.top)
          ctx.lineTo(coords.x, gridBounds.bottom)
          ctx.stroke()
        }
        
        const coordsN = transform(0, i)
        if (coordsN.y >= gridBounds.top && coordsN.y <= gridBounds.bottom) {
          ctx.beginPath()
          ctx.moveTo(gridBounds.left, coordsN.y)
          ctx.lineTo(gridBounds.right, coordsN.y)
          ctx.stroke()
        }
      }
    }
    
    // 次网格线
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 0.3
    
    for (let i = -6000; i <= 6000; i += 1000) {
      if (i !== 0 && i % 2000 !== 0) {
        const coords = transform(i, 0)
        if (coords.x >= gridBounds.left && coords.x <= gridBounds.right) {
          ctx.beginPath()
          ctx.moveTo(coords.x, gridBounds.top)
          ctx.lineTo(coords.x, gridBounds.bottom)
          ctx.stroke()
        }
        
        const coordsN = transform(0, i)
        if (coordsN.y >= gridBounds.top && coordsN.y <= gridBounds.bottom) {
          ctx.beginPath()
          ctx.moveTo(gridBounds.left, coordsN.y)
          ctx.lineTo(gridBounds.right, coordsN.y)
          ctx.stroke()
        }
      }
    }
    
    // 绘制目标点P
    const targetCoords = transform(confidenceData.targetPoint.E, confidenceData.targetPoint.N)
    
    // 外圈微光
    const gradient = ctx.createRadialGradient(targetCoords.x, targetCoords.y, 0, targetCoords.x, targetCoords.y, 12)
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.8)')
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(targetCoords.x, targetCoords.y, 12, 0, 2 * Math.PI)
    ctx.fill()
    
    // 绿色圆点
    ctx.fillStyle = '#10B981'
    ctx.beginPath()
    ctx.arc(targetCoords.x, targetCoords.y, 6, 0, 2 * Math.PI)
    ctx.fill()
    
    drawText(ctx, 'P', targetCoords.x + 15, targetCoords.y - 5, {
      fontSize: 12,
      color: '#10B981',
      fontWeight: 'bold'
    })
    
    // 绘制固定面积预算圈
    const budgetRadius = Math.sqrt(confidenceData.budgetArea / Math.PI) * scale * 1000
    ctx.fillStyle = 'rgba(237, 137, 54, 0.6)'
    ctx.strokeStyle = '#ED8936'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(targetCoords.x, targetCoords.y, budgetRadius, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    
    // 绘制全站仪（使用各自的颜色，但无选中状态，不显示连线）
    confidenceData.stations.forEach(station => {
      const coords = transform(station.E, station.N)
      
      // 噪声小圆 - 使用动画中一致的颜色和透明度
      const noiseRadius = station.sigma * 6500
      ctx.globalAlpha = 0.2
      ctx.fillStyle = station.color // 使用站点自己的颜色
      ctx.strokeStyle = station.color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(coords.x, coords.y, noiseRadius, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
      
      // 三角形标记（使用站点颜色）
      const size = 6
      ctx.globalAlpha = 1.0 // 使用完全不透明
      ctx.fillStyle = station.color
      ctx.strokeStyle = station.color
      ctx.lineWidth = 2
      
      ctx.beginPath()
      ctx.moveTo(coords.x, coords.y - size)
      ctx.lineTo(coords.x - size * 0.866, coords.y + size * 0.5)
      ctx.lineTo(coords.x + size * 0.866, coords.y + size * 0.5)
      ctx.fill()
      ctx.stroke()
      
      drawText(ctx, station.id, coords.x, coords.y - size - 10, {
        fontSize: 10,
        align: 'center',
        color: station.color // 使用站点颜色
      })
      
      ctx.globalAlpha = 1
    })
    
    // 绘制静态A*预算误差椭圆（始终显示）
    const budgetRadiusEllipse = Math.sqrt(confidenceData.budgetArea / Math.PI) * scale * 1000 * 88
    const aStatic = budgetRadiusEllipse * 1.1  // 长半轴
    const bStatic = budgetRadiusEllipse * 0.9  // 短半轴
    
    // A*预算椭圆（浅灰色、实线、发光）
    ctx.fillStyle = 'rgba(156, 163, 175, 0.15)' // 浅灰色，15%透明度
    ctx.strokeStyle = '#9CA3AF' // 浅灰色边框
    ctx.lineWidth = 2
    ctx.setLineDash([]) // 实线
    
    // 添加发光效果
    ctx.shadowColor = '#9CA3AF'
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    
    ctx.beginPath()
    ctx.ellipse(targetCoords.x, targetCoords.y, aStatic, bStatic, 0, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    
    // 重置阴影
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
  }

  // 其他卡片的临时实现
  const drawCard2Scene1 = (ctx, width, height) => {
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, width, height)
    drawText(ctx, '连续变量（位姿/点坐标/参数）', width/2, height/2, {
      fontSize: 16,
      align: 'center',
      color: '#E7EDF8'
    })
  }
  const drawCard2Scene2 = (ctx, width, height) => {
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, width, height)
    drawText(ctx, '离散变量（索引/标号/选择）', width/2, height/2, {
      fontSize: 16,
      align: 'center',
      color: '#E7EDF8'
    })
  }

  const drawCard2Scene3 = (ctx, width, height) => {
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, width, height)
    drawText(ctx, '混合变量（连续+离散）', width/2, height/2, {
      fontSize: 16,
      align: 'center',
      color: '#E7EDF8'
    })
  }

  const drawCard3Scene1 = (ctx, width, height) => {
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, width, height)
    drawText(ctx, '目标函数 f(x) / 代价', width/2, height/2, {
      fontSize: 16,
      align: 'center',
      color: '#E7EDF8'
    })
  }

  const drawCard3Scene2 = (ctx, width, height) => {
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, width, height)
    drawText(ctx, '等式约束 g(x)=0', width/2, height/2, {
      fontSize: 16,
      align: 'center',
      color: '#E7EDF8'
    })
  }

  const drawCard3Scene3 = (ctx, width, height) => {
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, width, height)
    drawText(ctx, '不等式约束 h(x)≤0', width/2, height/2, {
      fontSize: 16,
      align: 'center',
      color: '#E7EDF8'
    })
  }

  const drawCard3Scene4 = (ctx, width, height) => {
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, width, height)
    drawText(ctx, '集合/结构约束（拓扑/锥/半定）', width/2, height/2, {
      fontSize: 16,
      align: 'center',
      color: '#E7EDF8'
    })
  }

  const drawCard3Scene5 = (ctx, width, height) => {
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, width, height)
    drawText(ctx, '正则项 R(x)（L1/L2/TV）', width/2, height/2, {
      fontSize: 16,
      align: 'center',
      color: '#E7EDF8'
    })
  }

  const playCard2Scene1 = async (ctx, width, height, signal) => {
    drawCard2Scene1(ctx, width, height)
    
    return new Promise(resolve => {
      const timeoutId = setTimeout(resolve, 2000)
      
      // 监听中止信号
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timeoutId)
          resolve()
        })
      }
    })
  }

  const playCard2Scene2 = async (ctx, width, height, signal) => {
    ctx.clearRect(0, 0, width, height)
    drawText(ctx, '离散变量（选址/路径/布设）', width/2, height/2, {
      fontSize: 16,
      align: 'center',
      color: '#1A202C'
    })
    
    return new Promise(resolve => {
      const timeoutId = setTimeout(resolve, 2000)
      
      // 监听中止信号
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timeoutId)
          resolve()
        })
      }
    })
  }

  const playCard2Scene3 = async (ctx, width, height, signal) => {
    // 混合变量动画现在由 MixedVariableAnimation 组件处理
    // 这里需要等待动画完成的时间，但要响应中止信号
    const animationDuration = 8000 // 8.0秒，与动画实际时长一致
    
    return new Promise((resolve) => {
      const timeoutId = setTimeout(resolve, animationDuration)
      
      // 监听中止信号
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timeoutId)
          resolve()
        })
      }
    })
  }

  const playCard3Scene1 = async (ctx, width, height) => {
    drawCard3Scene1(ctx, width, height)
    return new Promise(resolve => setTimeout(resolve, 2000))
  }

  const playCard3Scene2 = async (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height)
    drawText(ctx, '等式约束 g(x)=0', width/2, height/2, {
      fontSize: 16,
      align: 'center',
      color: '#1A202C'
    })
    return new Promise(resolve => setTimeout(resolve, 2000))
  }

  const playCard3Scene3 = async (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height)
    drawText(ctx, '不等式约束 h(x)≤0', width/2, height/2, {
      fontSize: 16,
      align: 'center',
      color: '#1A202C'
    })
    return new Promise(resolve => setTimeout(resolve, 2000))
  }

  const playCard3Scene4 = async (ctx, width, height, signal) => {
    // 集合/结构约束动画现在由 SetConstraintAnimation 组件处理
    // 这里需要等待动画完成的时间，但要响应中止信号
    const animationDuration = 12500 // 12.5秒，与动画实际时长一致
    
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve()
      }, animationDuration)
      
      // 监听中止信号
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timeoutId)
          resolve()
        })
      }
    })
  }

  const playCard3Scene5 = async (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height)
    drawText(ctx, '正则项 R(x)（L1/L2/TV）', width/2, height/2, {
      fontSize: 16,
      align: 'center',
      color: '#1A202C'
    })
    return new Promise(resolve => setTimeout(resolve, 2000))
  }

  const playCard4Scene = async (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height)
    drawText(ctx, '问题画像 (Profile the Problem)', width/2, height/2, {
      fontSize: 18,
      align: 'center',
      color: '#1A202C'
    })
    return new Promise(resolve => setTimeout(resolve, 2000))
  }

  return (
    <div className="stage1-content" style={{ height: '100%', display: 'flex', gap: '24px' }}>
      {/* 左侧 Canvas 区域 (75%) */}
      <div style={{ 
        flex: '3',
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.8) 0%, rgba(31, 41, 55, 0.6) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(59, 130, 246, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Canvas 画布 */}
        <canvas
          ref={canvasRef}
          style={{ 
            width: '100%', 
            height: '100%', 
            display: 'block',
            background: 'transparent'
          }}
        />
        
        {/* KaTeX 公式覆盖层 */}
        <div
          ref={katexRef}
          style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'transparent',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '20px',
            color: '#E7EDF8',
            zIndex: 10,
            pointerEvents: 'none',
            minWidth: '600px',
            maxWidth: '900px',
            textAlign: 'center'
          }}
          dangerouslySetInnerHTML={{
            __html: katex.renderToString(
              (() => {
                if (activeCard === 1) {
                  if (activeExample === 1) 
                    return '\\max_{S \\subseteq C, |S| \\leq k} \\text{Coverage}(S) = \\frac{|\\bigcup_{i \\in S} A_i|}{|D|}'
                  else if (activeExample === 2)
                    return '\\min T = \\int_0^{x_T} \\frac{\\sqrt{1+(y\')^2}}{\\sqrt{2gy(x)}} dx'
                  else if (activeExample === 3)
                    return 'p_{\\max} = F_{\\chi^2(2)}\\left(\\frac{A_*}{\\pi\\sqrt{\\det\\Sigma}}\\right) = 1-\\exp\\left(-\\frac{A_*}{2\\pi\\sqrt{\\det\\Sigma}}\\right)'
                  else
                    return '\\min \\sum_i \\|y_i - \\hat{y}(x_i)\\|^2'
                } else if (activeCard === 2) {
                  return 'x \\in \\mathbb{R}^n \\text{ (变量空间定义)}'
                } else if (activeCard === 3) {
                  if (activeExample === 3) {
                    return '\\begin{aligned}' +
                           '\\text{流形约束：} & \\gamma \\in S^2_R \\\\' +
                           '\\text{集合约束：} & \\gamma \\cap C^{(+\\delta)} = \\emptyset' +
                           '\\end{aligned}'
                  } else {
                    return 'f: \\mathbb{R}^n \\rightarrow \\mathbb{R} \\text{ (目标函数构建)}'
                  }
                } else if (activeCard === 4) {
                  return '\\text{Problem Profile: } (\\text{目标}, \\text{约束}, \\text{变量}) \\rightarrow \\text{求解策略}'
                } else {
                  return '\\min \\sum_i \\|y_i - \\hat{y}(x_i)\\|^2'
                }
              })(),
              {
                throwOnError: false,
                displayMode: activeCard === 3 && activeExample === 3 ? true : false
              }
            )
          }}
        />
        
        {/* 混合变量动画层 */}
        {activeCard === 2 && activeExample === 2 && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 5,
            visibility: 'visible',
            opacity: 1
          }}>
            <MixedVariableAnimation 
              key="mixed-variable-animation" // 固定key，保持动画完成状态
              isPlaying={isPlaying && activeCard === 2 && activeExample === 2}
              onComplete={() => {
                setIsPlaying(false)
                setAnimationState(`Idle@Card${activeCard}`)
                // 移除可能覆盖动画组件渲染的调用
                // const canvas = canvasRef.current
                // if (canvas) {
                //   const ctx = canvas.getContext('2d')
                //   drawCurrentCardStaticScene(ctx, canvas.clientWidth, canvas.clientHeight)
                // }
              }}
            />
          </div>
        )}
        
        {/* 集合约束动画层 */}
        {activeCard === 3 && activeExample === 3 && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 5,
            visibility: 'visible',
            opacity: 1
          }}>
            <SetConstraintAnimation 
              isPlaying={(() => {
                const shouldPlay = isPlaying && activeCard === 3 && activeExample === 3
                return shouldPlay
              })()}
              onAnimationUpdate={(animationStage) => {
                setConstraintAnimationInfo(animationStage)
              }}
              onComplete={() => {
                setIsPlaying(false)
                setAnimationState(`Idle@Card${activeCard}`)
                // 设置最终状态
                setConstraintAnimationInfo({
                  stage: 'complete',
                  title: '约束演示完成',
                  content: [
                    '集合/结构约束演示完成',
                    '点击播放按钮重新观看演示过程'
                  ]
                })
                const canvas = canvasRef.current
                if (canvas) {
                  const ctx = canvas.getContext('2d')
                  drawCurrentCardStaticScene(ctx, canvas.clientWidth, canvas.clientHeight)
                }
              }}
            />
          </div>
        )}
        
        {/* 底部信息公式区域 - 仅在集合约束动画时显示 */}
        {activeCard === 3 && activeExample === 3 && constraintAnimationInfo && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 6,
            backgroundColor: 'rgba(17, 24, 39, 0.92)',
            border: '1.5px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '8px',
            padding: '16px 20px',
            maxWidth: '80%',
            minWidth: '55%',
            maxHeight: '35vh', // 增加最大高度到35%
            textAlign: 'center',
            overflow: 'visible'
          }}>
            <div style={{ 
              color: '#E7EDF8', 
              fontSize: '14px', 
              fontFamily: 'Consolas, monospace',
              lineHeight: '1.4',
              maxHeight: 'none',
              overflowY: 'visible'
            }}>
              {/* 动态标题 */}
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '8px',
                color: '#4A90E2'
              }}>
                {constraintAnimationInfo.title}
              </div>
              
              {/* 动态内容 */}
              {constraintAnimationInfo.content.map((line, index) => (
                <div key={index} style={{ 
                  marginBottom: index === constraintAnimationInfo.content.length - 1 ? '0' : '6px',
                  fontSize: line.includes('•') ? '12px' : '14px',
                  textAlign: line.includes('•') ? 'left' : 'center'
                }}>
                  {line.includes('γ ∈ S²ᵣ') ? (
                    <span>
                      流形约束：
                      <span 
                        dangerouslySetInnerHTML={{
                          __html: katex.renderToString('\\gamma \\in S^2_R', {
                            throwOnError: false,
                            displayMode: false
                          })
                        }}
                        style={{ 
                          color: '#4A90E2',
                          fontSize: '18px',
                          marginLeft: '8px'
                        }}
                      />
                    </span>
                  ) : line.includes('γ ∩ C⁽⁺ᵟ⁾ = ∅') ? (
                    <span>
                      集合约束：
                      <span 
                        dangerouslySetInnerHTML={{
                          __html: katex.renderToString('\\gamma \\cap C^{(+\\delta)} = \\emptyset', {
                            throwOnError: false,
                            displayMode: false
                          })
                        }}
                        style={{ 
                          color: '#4A90E2',
                          fontSize: '18px',
                          marginLeft: '8px'
                        }}
                      />
                    </span>
                  ) : (
                    line
                  )}
                </div>
              ))}
              
            </div>
          </div>
        )}
        
        {/* 右上角播放按钮 */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 10
        }}>
          <button
            onClick={() => {
                当前卡片: activeCard,
                当前胶囊: activeExample,
                正在播放: isPlaying,
                动画应该停止: animationShouldStop,
                动画控制器存在: !!animationControllerRef.current
              })
              playSpecificExample(activeCard, activeExample)
            }}
            style={{
              padding: '8px 12px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '8px',
              color: '#60A5FA',
              fontSize: '12px',
              cursor: isPlaying ? 'not-allowed' : 'pointer',
              opacity: isPlaying ? 0.6 : 1
            }}
            disabled={isPlaying}
          >
            {isPlaying ? '播放中...' : '播放'}
          </button>
        </div>
      </div>

      {/* 右侧卡片导航区域 (25%) */}
      <div style={{ 
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {stage1Cards.map(card => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            style={{
              background: activeCard === card.id 
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.08) 100%)' 
                : 'linear-gradient(135deg, rgba(31, 41, 55, 0.6) 0%, rgba(17, 24, 39, 0.8) 100%)',
              border: `1px solid ${activeCard === card.id ? 'rgba(59, 130, 246, 0.4)' : 'rgba(75, 85, 99, 0.3)'}`,
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              minHeight: 'fit-content'
            }}
          >
            {/* 标题 */}
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: activeCard === card.id ? '#3B82F6' : '#F1F5F9',
              marginBottom: '6px',
              lineHeight: '1.3'
            }}>
              {card.title}
            </h4>
            
            {/* 副标题 */}
            <p style={{
              fontSize: '11px',
              color: 'rgba(156, 163, 175, 0.8)',
              marginBottom: '12px',
              lineHeight: '1.4'
            }}>
              {card.subtitle}
            </p>

            {/* 例举胶囊或标签 */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '6px' 
            }}>
              {(card.examples || card.labels || []).map((item, index) => {
                // 检查是否为禁用点击的胶囊
                // 确定变量卡片：只允许混合变量胶囊(index=2)
                // 构建函数卡片：只允许集合/结构约束(index=3)和正则项(index=4)
                const isClickDisabled = (card.id === 2 && index !== 2) || (card.id === 3 && index !== 3 && index !== 4)
                
                return (
                  <span
                    key={index}
                    onClick={isClickDisabled ? undefined : (e) => {
                      e.stopPropagation()
                      handleExampleClick(card.id, index)
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '999px',
                      fontSize: '10px',
                      background: activeCard === card.id && activeExample === index
                        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.15) 100%)'
                        : 'rgba(55, 65, 81, 0.4)',
                      color: activeCard === card.id && activeExample === index
                        ? '#3B82F6'
                        : '#CBD5E1',
                      border: activeCard === card.id && activeExample === index
                        ? '1px solid rgba(59, 130, 246, 0.5)'
                        : '1px solid rgba(75, 85, 99, 0.3)',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (!(activeCard === card.id && activeExample === index)) {
                        e.currentTarget.style.background = 'rgba(75, 85, 99, 0.25)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!(activeCard === card.id && activeExample === index)) {
                        e.currentTarget.style.background = 'rgba(75, 85, 99, 0.15)'
                      }
                    }}
                  >
                    {item}
                  </span>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Section5WorkflowStep1