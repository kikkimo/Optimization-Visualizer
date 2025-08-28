import React, { useRef, useEffect, useState } from 'react'
import katex from 'katex'

const Section5WorkflowStep1 = () => {
  // Stage1 Canvas 动画状态
  const [activeCard, setActiveCard] = useState(1) // 当前活跃的卡片 1-4
  const [activeExample, setActiveExample] = useState(0) // 当前活跃的胶囊索引
  const [animationState, setAnimationState] = useState('Idle@Card1') // 动画状态机
  const [isPlaying, setIsPlaying] = useState(false) // 是否正在播放
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
    // 切换到新卡片，重置活跃胶囊为第一个
    setActiveCard(cardId)
    setActiveExample(0)
    setIsPlaying(false)
    
    // 不自动播放，只切换静态显示
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      drawCurrentCardStaticScene(ctx, width, height)
    }
  }

  // 处理胶囊点击
  const handleExampleClick = (cardId, exampleIndex) => {
    // 立即更新状态
    setActiveCard(cardId)
    setActiveExample(exampleIndex)
    
    // 如果点击的是覆盖动画胶囊，更新覆盖方案状态
    if (cardId === 1 && exampleIndex === 1) {
      setCurrentCoveragePlan('B') // 默认显示最优方案B (站点3,5,6 - 75.33%)
    }
    
    // 立即绘制对应的静态场景
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      drawCurrentCardStaticScene(ctx, width, height)
    }
    
    // 然后播放动画
    playSpecificExample(cardId, exampleIndex)
  }

  // 播放特定胶囊的动画
  const playSpecificExample = async (cardId, exampleIndex) => {
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
      console.error('❌ [ERROR] Animation error:', error)
    }
    
    setIsPlaying(false)
    setAnimationState(`Idle@Card${cardId}`)
    
    // 动画结束后，绘制对应胶囊的静态场景
    drawCurrentCardStaticScene(ctx, width, height)
  }

  // 绘制当前卡片的静态场景
  const drawCurrentCardStaticScene = (ctx, width, height) => {
    // 强制清除画布
    ctx.fillStyle = '#0F1116'
    ctx.fillRect(0, 0, width, height)
    
    switch (activeCard) {
      case 1:
        // 根据当前胶囊显示不同的静态场景
        if (activeExample === 1) {
          // 显示覆盖动画的静态场景
          drawCoverageStaticScene(ctx, width, height)
        } else {
          // 显示最小化误差的静态场景
          drawCard1Scene1(ctx, width, height)
        }
        break
      case 2:
        drawCard2Scene1(ctx, width, height)
        break
      case 3:
        drawCard3Scene1(ctx, width, height)
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
        drawCard1Scene1(ctx, width, height)
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
    drawCurrentCardStaticScene(ctx, rect.width, rect.height)
    
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
        drawCurrentCardStaticScene(ctx, newRect.width, newRect.height)
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

  const playCard2SpecificScene = async (ctx, width, height, sceneIndex) => {
    switch (sceneIndex) {
      case 0: return await playCard2Scene1(ctx, width, height)
      case 1: return await playCard2Scene2(ctx, width, height)
      case 2: return await playCard2Scene3(ctx, width, height)
      default: return await playCard2Scene1(ctx, width, height)
    }
  }

  const playCard3SpecificScene = async (ctx, width, height, sceneIndex) => {
    switch (sceneIndex) {
      case 0: return await playCard3Scene1(ctx, width, height)
      case 1: return await playCard3Scene2(ctx, width, height)
      case 2: return await playCard3Scene3(ctx, width, height)
      case 3: return await playCard3Scene4(ctx, width, height)
      case 4: return await playCard3Scene5(ctx, width, height)
      default: return await playCard3Scene1(ctx, width, height)
    }
  }

  // 绘制工具函数
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
    { a: 1.42, b: 1.05, rss: 0.0528, color: '#2B6CB0', label: 'L1' }, // 最佳拟合线
    { a: 1.30, b: 2.20, rss: 6.9126, color: '#A0AEC0', label: 'L2' },
    { a: 1.60, b: 0.80, rss: 1.3271, color: '#A0AEC0', label: 'L3' },
    { a: 1.10, b: 1.20, rss: 7.5306, color: '#A0AEC0', label: 'L4' }
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
    ctx.strokeStyle = '#252933'
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
    ctx.strokeStyle = '#2F3642'
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
    ctx.strokeStyle = '#E7EDF8'
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
    ctx.fillStyle = '#E7EDF8'
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
    ctx.strokeStyle = '#BFC9DA'
    ctx.fillStyle = '#E7EDF8'
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
    const color = isActive ? '#ED8936' : line.color
    const lineWidth = isActive ? 3 : (line.label === 'L1' ? 3 : 2)
    const opacity = isActive ? 1 : (line.color === '#A0AEC0' ? 0.45 : 1)
    
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
    ctx.strokeStyle = '#F6AD55'
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
      ctx.fillStyle = '#F6AD55'
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
    ctx.strokeStyle = '#252933'
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
    ctx.strokeStyle = '#2F3642'
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
      ctx.fillStyle = 'rgba(11, 18, 32, 0.85)'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
      ctx.shadowBlur = 2
      ctx.shadowOffsetY = 1
      ctx.fill()
      
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0
    }
    
    // 边界描边
    ctx.strokeStyle = '#E7EDF8'
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
      ctx.fillStyle = '#E7EDF8'
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
      ctx.fillStyle = 'rgba(56, 161, 105, 0.25)'
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
      ctx.fillStyle = 'rgba(56, 161, 105, 0.35)'
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
        ctx.fillStyle = '#0F1116'
        ctx.fillRect(0, 0, width, height)
        
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
        ctx.fillStyle = '#0F1116'
        ctx.fillRect(0, 0, width, height)
        
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
        
        // 绘制UI组件（从进度20%开始显示）
        if (progress >= 0.2) {
          drawCoverageFormulaCard(ctx, width)
          drawCoverageValueCard(ctx, plan, currentCoverage)
          drawCoverageComparisonBar(ctx, width, plan.id)
          drawCoverageDescriptionCard(ctx, width, height)
        }
        
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
      ctx.fillStyle = '#0F1116'
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

  // 绘制覆盖数值牌（底部左下对齐）
  const drawCoverageValueCard = (ctx, currentPlan, currentCoverage) => {
    const cardWidth = 220
    const cardHeight = 100
    const x = 140 
    const y = 530 
    
    // 绘制卡片背景
    ctx.fillStyle = 'rgba(11, 18, 32, 0.85)'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetY = 1
    
    // 绘制圆角矩形
    ctx.beginPath()
    ctx.moveTo(x + 8, y)
    ctx.lineTo(x + cardWidth - 8, y)
    ctx.quadraticCurveTo(x + cardWidth, y, x + cardWidth, y + 8)
    ctx.lineTo(x + cardWidth, y + cardHeight - 8)
    ctx.quadraticCurveTo(x + cardWidth, y + cardHeight, x + cardWidth - 8, y + cardHeight)
    ctx.lineTo(x + 8, y + cardHeight)
    ctx.quadraticCurveTo(x, y + cardHeight, x, y + cardHeight - 8)
    ctx.lineTo(x, y + 8)
    ctx.quadraticCurveTo(x, y, x + 8, y)
    ctx.closePath()
    ctx.fill()
    
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0
    
    // 绘制文本
    ctx.textAlign = 'left'
    
    // 行1：当前方案
    ctx.fillStyle = '#E7EDF8'
    ctx.font = '14px ui-sans-serif, -apple-system, sans-serif'
    const siteList = currentPlan ? `{#${currentPlan.sites.join(', #')}}` : '{}'
    ctx.fillText(`当前方案：S = ${siteList}`, x + 16, y + 25)
    
    // 行2：覆盖率
    ctx.fillText('覆盖率 = ', x + 16, y + 54)
    ctx.fillStyle = '#2EC4B6'
    ctx.font = '16px ui-sans-serif, -apple-system, sans-serif'
    ctx.fillText(`${currentCoverage.toFixed(1)}%`, x + 75, y + 52)
    
    // 行3：方案描述
    ctx.fillStyle = '#E7EDF8'
    ctx.font = '14px ui-sans-serif, -apple-system, sans-serif'
    const description = currentPlan ? currentPlan.description : '无描述'
    ctx.fillText(description, x + 16, y + 79)
  }

  // 绘制方案对比条（右下）
  const drawCoverageComparisonBar = (ctx, width, activePlanId = null) => {
    const barWidth = 200
    const barHeight = 100
    const x = width - barWidth - 138
    const y = 530
    
    // 绘制背景
    ctx.fillStyle = 'rgba(11, 18, 32, 0.85)'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetY = 1
    
    ctx.beginPath()
    ctx.moveTo(x + 8, y)
    ctx.lineTo(x + barWidth - 8, y)
    ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + 8)
    ctx.lineTo(x + barWidth, y + barHeight - 8)
    ctx.quadraticCurveTo(x + barWidth, y + barHeight, x + barWidth - 8, y + barHeight)
    ctx.lineTo(x + 8, y + barHeight)
    ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - 8)
    ctx.lineTo(x, y + 8)
    ctx.quadraticCurveTo(x, y, x + 8, y)
    ctx.closePath()
    ctx.fill()
    
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0
    
    // 绘制方案对比
    ctx.textAlign = 'left'
    ctx.font = '12px ui-sans-serif, -apple-system, sans-serif'
    
    coveragePlans.forEach((plan, index) => {
      const textY = y + 25 + index * 18
      const isActive = activePlanId === plan.id
      const isOptimal = plan.isOptimal
      
      if (isActive) {
        ctx.fillStyle = '#ED8936'
      } else if (isOptimal) {
        ctx.fillStyle = '#38A169'
      } else {
        ctx.fillStyle = '#9AA5B1'
      }
      
      ctx.fillText(`${plan.id}:${plan.coverage.toFixed(1)}%`, x + 16, textY)
      
      // 绘制最优标记
      if (isOptimal) {
        ctx.fillStyle = '#38A169'
        ctx.fillText('🏆', x + 80, textY)
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
      ctx.fillStyle = '#E7EDF8'
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
    ctx.fillStyle = '#0F1116'
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
    drawCoverageValueCard(ctx, currentPlan, currentPlan.coverage)
    drawCoverageComparisonBar(ctx, width, currentPlan.id)
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

  // 绘制数值牌
  const drawValueCard = (ctx, line, currentRSS) => {
    const cardWidth = 280
    const cardHeight = 80
    const x = 70
    const y = 250
    
    // 绘制卡片背景
    ctx.fillStyle = 'rgba(11, 18, 32, 0.85)'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetY = 1
    
    // 绘制圆角矩形（兼容性更好的方法）
    ctx.beginPath()
    ctx.moveTo(x + 8, y)
    ctx.lineTo(x + cardWidth - 8, y)
    ctx.quadraticCurveTo(x + cardWidth, y, x + cardWidth, y + 8)
    ctx.lineTo(x + cardWidth, y + cardHeight - 8)
    ctx.quadraticCurveTo(x + cardWidth, y + cardHeight, x + cardWidth - 8, y + cardHeight)
    ctx.lineTo(x + 8, y + cardHeight)
    ctx.quadraticCurveTo(x, y + cardHeight, x, y + cardHeight - 8)
    ctx.lineTo(x, y + 8)
    ctx.quadraticCurveTo(x, y, x + 8, y)
    ctx.closePath()
    ctx.fill()
    
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0
    
    // 绘制文本
    ctx.textAlign = 'left'
    
    // 第一行：当前直线 - 使用数学斜体
    ctx.fillStyle = '#E7EDF8'
    ctx.font = '14px ui-sans-serif, -apple-system, sans-serif'
    ctx.fillText('当前：', x + 12, y + 20)
    
    // y = 部分用斜体
    ctx.font = 'italic 14px "KaTeX_Math", "Times New Roman", serif'
    ctx.fillText('y', x + 50, y + 20)
    
    ctx.font = '14px ui-sans-serif, -apple-system, sans-serif'
    ctx.fillText(' = ', x + 60, y + 20)
    
    ctx.fillText(line.a.toFixed(2), x + 80, y + 20)
    
    ctx.font = 'italic 14px "KaTeX_Math", "Times New Roman", serif'
    ctx.fillText('x', x + 120, y + 20)
    
    ctx.font = '14px ui-sans-serif, -apple-system, sans-serif'
    ctx.fillText(' + ', x + 130, y + 20)
    ctx.fillText(line.b.toFixed(2), x + 155, y + 20)
    
    // 第二行：RSS
    ctx.fillStyle = '#E7EDF8'
    ctx.fillText('残差平方和 RSS = ', x + 12, y + 40)
    
    ctx.fillStyle = '#2EC4B6'
    ctx.font = '14px ui-monospace, Menlo, monospace'
    ctx.fillText(currentRSS.toFixed(4), x + 140, y + 40)
    
    // 第三行：提示
    ctx.fillStyle = '#9AA5B1'
    ctx.font = '12px ui-sans-serif, -apple-system, sans-serif'
    ctx.fillText('点到直线的垂线为残差，RSS为残差的平方和', x + 12, y + 62)
  }

  // 绘制候选概览
  const drawCandidateOverview = (ctx, width, currentIndex = 0) => {
    const startX = width - 200
    const startY = 450
    
    ctx.font = '12px ui-monospace, Menlo, monospace'
    ctx.textAlign = 'left'
    
    candidateLines.forEach((line, index) => {
      const y = startY + index * 18
      const isCurrentlyPlaying = index === currentIndex
      const isTrueBest = index === 0 // L1 is always the true minimum (0.0528)
      
      // 设置文字颜色
      if (isTrueBest) {
        ctx.fillStyle = '#38A169' // 绿色 - 真正的最优解
      } else if (isCurrentlyPlaying) {
        ctx.fillStyle = '#2B6CB0' // 蓝色 - 当前正在播放的非最优方案
      } else {
        ctx.fillStyle = '#9AA5B1' // 灰色 - 其他方案
      }
      
      ctx.fillText(`${line.label}: ${line.rss.toFixed(4)}`, startX, y)
      
      // 只有真正的最优解才显示奖杯
      if (isTrueBest) {
        ctx.fillStyle = '#38A169'
        ctx.fillText('🏆', startX + 80, y)
      }
    })
  }

  // 卡片1场景绘制函数（静态）
  const drawCard1Scene1 = (ctx, width, height) => {
    // 设置背景
    ctx.fillStyle = '#0F1116'
    ctx.fillRect(0, 0, width, height)
    
    const chartOffsetX = 20 // 图表水平偏移
    const chartOffsetY = 65 // 图表垂直向下偏移
    const margin = 48
    const chartWidth = width - 2 * margin - 48
    const chartHeight = height - 144 - 80
    const adjustedMarginX = margin + chartOffsetX
    const adjustedMarginY = margin + chartOffsetY
    
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
    drawValueCard(ctx, candidateLines[0], candidateLines[0].rss)
    
    // 绘制候选概览
    drawCandidateOverview(ctx, width, 0)
  }

  // 这里会添加所有的动画和绘制函数
  // 为了避免文件过大，这里暂时只添加核心函数，其他函数将从原文件迁移过来

  // 完整的最小化误差动画
  const playCard1Scene1 = async (ctx, width, height, signal) => {
    
    const chartOffsetX = 20 // 图表水平偏移
    const chartOffsetY = 65 // 图表垂直向下偏移
    const margin = 48
    const chartWidth = width - 2 * margin - 48
    const chartHeight = height - 144 - 80
    const adjustedMarginX = margin + chartOffsetX
    const adjustedMarginY = margin + chartOffsetY
    
    // 设置背景
    ctx.fillStyle = '#0F1116'
    ctx.fillRect(0, 0, width, height)
    
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
        
        ctx.fillStyle = '#0F1116'
        ctx.fillRect(0, 0, width, height)
        
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
        ctx.fillStyle = '#0F1116'
        ctx.fillRect(0, 0, width, height)
        
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
          
          ctx.strokeStyle = '#F6AD55'
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
              ctx.fillStyle = '#F6AD55'
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
        
        // 绘制公式牌和数值牌
        if (progress >= 0.1) {
          drawFormulaCard(ctx, width)
          drawValueCard(ctx, currentLine, currentRSS)
        }
        
        // 绘制候选概览（高亮当前正在播放的直线）
        if (progress >= 0.43) {
          drawCandidateOverview(ctx, width, lineIndex)
        }
        
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
      ctx.fillStyle = '#0F1116'
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
      drawValueCard(ctx, candidateLines[0], candidateLines[0].rss)
      drawCandidateOverview(ctx, width, 0)
      
      setTimeout(resolve, 800)
    })
  }

  const playCard1Scene2 = async (ctx, width, height, signal) => {
    // 播放最大化覆盖动画
    return await playCoverageAnimation(ctx, width, height, signal)
  }

  const playCard1Scene3 = async (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height)
    drawText(ctx, '最短时间 (路径优化)', width/2, height/2, {
      fontSize: 18,
      align: 'center',
      color: '#2B6CB0'
    })
    return new Promise(resolve => setTimeout(resolve, 2000))
  }

  const playCard1Scene4 = async (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height)
    drawText(ctx, '最大置信度 (不确定性最小)', width/2, height/2, {
      fontSize: 18,
      align: 'center',
      color: '#2B6CB0'
    })
    return new Promise(resolve => setTimeout(resolve, 2000))
  }

  // 其他卡片的临时实现
  const drawCard2Scene1 = (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height)
    drawText(ctx, '连续变量（位姿/点坐标/参数）', width/2, height/2, {
      fontSize: 16,
      align: 'center',
      color: '#1A202C'
    })
  }

  const drawCard3Scene1 = (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height)
    drawText(ctx, '目标函数 f(x) / 代价', width/2, height/2, {
      fontSize: 16,
      align: 'center',
      color: '#1A202C'
    })
  }

  const playCard2Scene1 = async (ctx, width, height) => {
    drawCard2Scene1(ctx, width, height)
    return new Promise(resolve => setTimeout(resolve, 2000))
  }

  const playCard2Scene2 = async (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height)
    drawText(ctx, '离散变量（选址/路径/布设）', width/2, height/2, {
      fontSize: 16,
      align: 'center',
      color: '#1A202C'
    })
    return new Promise(resolve => setTimeout(resolve, 2000))
  }

  const playCard2Scene3 = async (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height)
    drawText(ctx, '混合变量（整数开关 + 连续参数）', width/2, height/2, {
      fontSize: 16,
      align: 'center',
      color: '#1A202C'
    })
    return new Promise(resolve => setTimeout(resolve, 2000))
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

  const playCard3Scene4 = async (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height)
    drawText(ctx, '集合/结构约束（拓扑/锥/半定）', width/2, height/2, {
      fontSize: 16,
      align: 'center',
      color: '#1A202C'
    })
    return new Promise(resolve => setTimeout(resolve, 2000))
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
        background: 'rgba(15, 23, 42, 0.2)',
        borderRadius: '16px',
        border: '1px solid rgba(75, 85, 99, 0.1)',
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
            background: '#0F1116',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '20px',
            color: '#E7EDF8',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            zIndex: 10,
            pointerEvents: 'none',
            minWidth: '500px',
            maxWidth: '800px',
            textAlign: 'center'
          }}
          dangerouslySetInnerHTML={{
            __html: katex.renderToString(
              activeCard === 1 && activeExample === 1 
                ? '\\max_{S \\subseteq C, |S| \\leq k} \\text{Coverage}(S) = \\frac{|\\bigcup_{i \\in S} A_i|}{|D|}'
                : '\\min \\sum_i \\|y_i - \\hat{y}(x_i)\\|^2',
              {
                throwOnError: false,
                displayMode: false
              }
            )
          }}
        />
        
        {/* 右上角播放按钮 */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px'
        }}>
          <button
            onClick={() => playSpecificExample(activeCard, activeExample)}
            style={{
              padding: '8px 12px',
              background: 'rgba(60, 230, 192, 0.1)',
              border: '1px solid rgba(60, 230, 192, 0.3)',
              borderRadius: '6px',
              color: '#3ce6c0',
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
                ? 'rgba(43, 108, 176, 0.1)' 
                : 'rgba(15, 23, 42, 0.3)',
              border: `1px solid ${activeCard === card.id ? '#2B6CB0' : 'rgba(75, 85, 99, 0.2)'}`,
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
              color: activeCard === card.id ? '#2B6CB0' : '#E8EAED',
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
              {(card.examples || card.labels || []).map((item, index) => (
                <span
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleExampleClick(card.id, index)
                  }}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '999px',
                    fontSize: '10px',
                    background: activeCard === card.id && activeExample === index
                      ? 'rgba(43, 108, 176, 0.2)'
                      : 'rgba(75, 85, 99, 0.15)',
                    color: activeCard === card.id && activeExample === index
                      ? '#2B6CB0'
                      : 'rgba(156, 163, 175, 0.9)',
                    border: activeCard === card.id && activeExample === index
                      ? '1px solid #2B6CB0'
                      : '1px solid transparent',
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
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Section5WorkflowStep1