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
    setActiveCard(cardId)
    setActiveExample(exampleIndex)
    playSpecificExample(cardId, exampleIndex)
  }

  // 播放特定胶囊的动画
  const playSpecificExample = async (cardId, exampleIndex) => {
    setIsPlaying(true)
    setAnimationState(`Playing@Card${cardId}[${exampleIndex + 1}]`)
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    
    // 根据卡片和例举索引播放对应动画
    try {
      switch (cardId) {
        case 1:
          await playCard1SpecificScene(ctx, width, height, exampleIndex)
          break
        case 2:
          await playCard2SpecificScene(ctx, width, height, exampleIndex)
          break
        case 3:
          await playCard3SpecificScene(ctx, width, height, exampleIndex)
          break
        case 4:
          await playCard4Scene(ctx, width, height)
          break
      }
    } catch (error) {
      console.error('Animation error:', error)
    }
    
    setIsPlaying(false)
    setAnimationState(`Idle@Card${cardId}`)
  }

  // 绘制当前卡片的静态场景
  const drawCurrentCardStaticScene = (ctx, width, height) => {
    switch (activeCard) {
      case 1:
        drawCard1Scene1(ctx, width, height)
        break
      case 2:
        drawCard2Scene1(ctx, width, height)
        break
      case 3:
        drawCard3Scene1(ctx, width, height)
        break
      case 4:
        // 卡片4没有静态场景，显示标题
        ctx.clearRect(0, 0, width, height)
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
  const playCard1SpecificScene = async (ctx, width, height, sceneIndex) => {
    switch (sceneIndex) {
      case 0: return await playCard1Scene1(ctx, width, height)
      case 1: return await playCard1Scene2(ctx, width, height)  
      case 2: return await playCard1Scene3(ctx, width, height)
      case 3: return await playCard1Scene4(ctx, width, height)
      default: return await playCard1Scene1(ctx, width, height)
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

  // 坐标转换函数 - 从(0,0)原点开始
  const getCanvasCoords = (dataX, dataY, marginX, marginY, chartWidth, chartHeight) => {
    // X轴：从0到6的范围
    const canvasX = marginX + (dataX / 6) * chartWidth
    // Y轴：从0到10的范围，Y轴向上为正
    const canvasY = marginY + chartHeight - (dataY / 10) * chartHeight
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
  const drawCandidateOverview = (ctx, width, bestIndex = 0) => {
    const startX = width - 200
    const startY = 450
    
    ctx.font = '12px ui-monospace, Menlo, monospace'
    ctx.textAlign = 'left'
    
    candidateLines.forEach((line, index) => {
      const y = startY + index * 18
      const isBest = index === bestIndex
      
      ctx.fillStyle = isBest ? '#38A169' : '#9AA5B1'
      ctx.fillText(`${line.label}: ${line.rss.toFixed(4)}`, startX, y)
      
      // 绘制奖杯符号
      if (isBest) {
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
  const playCard1Scene1 = async (ctx, width, height) => {
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
    await animateEntrance(ctx, width, height, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight)
    
    // 主循环：播放每条直线（每条2.8s）
    for (let i = 0; i < candidateLines.length; i++) {
      await animateLine(ctx, width, height, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight, i)
    }
    
    // 收尾：回到最佳拟合线视图
    await animateFinale(ctx, width, height, adjustedMarginX, adjustedMarginY, chartWidth, chartHeight)
  }
  
  // 入场动画
  const animateEntrance = async (ctx, width, height, marginX, marginY, chartWidth, chartHeight) => {
    return new Promise(resolve => {
      let progress = 0
      const duration = 1200
      const startTime = Date.now()
      
      const animate = () => {
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
  const animateLine = async (ctx, width, height, marginX, marginY, chartWidth, chartHeight, lineIndex) => {
    return new Promise(resolve => {
      let progress = 0
      const duration = 2800
      const startTime = Date.now()
      let currentRSS = 0
      
      const animate = () => {
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
        
        // 绘制候选概览（显示最佳）
        if (progress >= 0.43) {
          drawCandidateOverview(ctx, width, lineIndex === 0 ? 0 : -1)
        }
        
        if (progress < 1) {
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

  const playCard1Scene2 = async (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height)
    drawText(ctx, '最大化覆盖 (传感器覆盖率)', width/2, height/2, {
      fontSize: 18,
      align: 'center',
      color: '#2B6CB0'
    })
    return new Promise(resolve => setTimeout(resolve, 2000))
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
            pointerEvents: 'none'
          }}
          dangerouslySetInnerHTML={{
            __html: katex.renderToString('\\min \\sum_i \\|y_i - \\hat{y}(x_i)\\|^2', {
              throwOnError: false,
              displayMode: false
            })
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
              flex: 1,
              background: activeCard === card.id 
                ? 'rgba(43, 108, 176, 0.1)' 
                : 'rgba(15, 23, 42, 0.3)',
              border: `1px solid ${activeCard === card.id ? '#2B6CB0' : 'rgba(75, 85, 99, 0.2)'}`,
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
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