import React, { useRef, useEffect, useState } from 'react'

const RegularizationAnimation = ({ 
  isPlaying = false, 
  onComplete = () => {}, 
  onAnimationUpdate = () => {},
  currentStage = 0,
  onStageComplete = () => {},
  setButtonText = null,
  setStageInfo = null,
  stepMode = false,  // 新增：是否为分步播放模式
  targetStage = 0,   // 新增：目标播放阶段（分步模式下使用）
  shouldReset = false // 新增：是否应该重置动画状态
}) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const startTimeRef = useRef(null)
  
  // 内部状态管理
  const [currentInternalStage, setCurrentInternalStage] = useState(0)
  const [stageStates, setStageStates] = useState({})
  const [stageProgress, setStageProgress] = useState(0)
  const [internalPlaying, setInternalPlaying] = useState(false) // 内部播放状态
  const [internalStageInfo, setInternalStageInfo] = useState({ title: '', content: '' }) // 内部信息卡片
  
  // 动画参数 - 每个阶段的独立时长（很短的动画时间）
  const STAGE_DURATIONS = [
    2500,   // 阶段1: 硬约束演示 
    2000,   // 阶段2: 软约束演示 
    1500,   // 阶段3: 最快路径规划
    1500,   // 阶段4: 少收费路径规划
    1500,   // 阶段5: 躲避拥堵路径规划
    6200,   // 阶段6: 参数影响分析
    2500    // 阶段7: 最终对比
  ]
  const ANIMATION_DURATION = STAGE_DURATIONS[currentStage] || 3000 // 当前阶段的时长
  const SCALE_FACTOR = 0.9
  
  // 颜色定义
  const COLORS = {
    background: '#111827',
    gridPrimary: '#374151',
    gridSecondary: '#4B5563',
    water: '#1B2130',
    city: '#253043',
    startPoint: '#38A169', // 起点S绿色
    endPoint: '#4299E1', // 终点T蓝色
    naiveLine: '#A0AEC0', // 直觉线灰色
    roadWhite: '#FFFFFF',    // SA、SB、FT、GT白色
    roadGreen: '#22C55E',    // AD、DF、BE、EG绿色
    roadRed: '#EF4444',      // BD、DG红色
    lake: '#22D3EE',         // 湖泊青蓝色（更鲜艳好看的青色）
    forbiddenAnimation: '#FF0000', // 限行动画红色
    forbiddenArea: 'rgba(229, 62, 62, 0.35)', // 限行区红色
    forbiddenBorder: '#F56565',
    tollRoad: '#ED8936', // 收费路段橙色
    congestion: '#E53E3E', // 拥堵暗红
    highSpeed: '#38B2AC', // 高速青色
    feasibleHighlight: 'rgba(56, 178, 172, 0.1)',
    infoBackground: 'rgba(17, 24, 39, 0.92)',
    infoText: '#F3F4F6',
    constraintTag: '#9CA3AF'
  }
  
  // 网格参数
  const GRID_SIZE = 8
  const GRID_SPACING = 60
  
  // 路网节点定义 (S->T连通图) - 删除C点后重新命名
  const NODES = {
    S: { x: 100, y: 300, name: 'S' },  // 起点
    A: { x: 200, y: 200, name: 'A' },  // 上方中转点
    B: { x: 200, y: 400, name: 'B' },  // 下方中转点
    C: { x: 350, y: 300, name: 'C' },  // 中央中转点（原来的D）
    D: { x: 350, y: 550, name: 'D' },  // 下方远端点（原来的E）
    E: { x: 500, y: 200, name: 'E' },  // 上方终端前点（原来的F）
    F: { x: 500, y: 400, name: 'F' },  // 下方终端前点（原来的G）
    T: { x: 600, y: 300, name: 'T' }   // 终点
  }
  
  // 路段定义 (每条边的属性) - 删除AC、CE，新增AE
  const EDGES = {
    'S-C': { from: 'S', to: 'C', time: 8, toll: 0, congestion: 0, forbidden: true, type: 'bridge' },     // 普通高架桥，今日限行
    'C-T': { from: 'C', to: 'T', time: 4, toll: 0, congestion: 0, forbidden: true, type: 'bridge' },     // 普通高架桥，今日限行
    'S-A': { from: 'S', to: 'A', time: 3, toll: 0, congestion: 0, type: 'normal' },     // 普通路段
    'S-B': { from: 'S', to: 'B', time: 3, toll: 0, congestion: 0, type: 'normal' },     // 普通路段
    'A-E': { from: 'A', to: 'E', time: 5, toll: 2, congestion: 0, type: 'toll' },       // 收费畅通路段（新连接）
    'B-C': { from: 'B', to: 'C', time: 3, toll: 0, congestion: 3, type: 'congested' },  // 普通拥堵路段
    'B-D': { from: 'B', to: 'D', time: 6, toll: 0, congestion: 0, type: 'smooth' },     // 普通畅通路段
    'C-F': { from: 'C', to: 'F', time: 3, toll: 0, congestion: 2, type: 'congested' },  // 普通拥堵路段
    'D-F': { from: 'D', to: 'F', time: 7, toll: 0, congestion: 0, type: 'smooth' },     // 普通畅通路段
    'E-T': { from: 'E', to: 'T', time: 2, toll: 0, congestion: 1, type: 'normal' },     // 普通路段
    'F-T': { from: 'F', to: 'T', time: 2, toll: 0, congestion: 1, type: 'normal' }      // 普通路段
  }
  
  // 四条典型路径 - 更新连接方式
  const PATHS = {
    P0: { 
      route: ['S', 'C', 'T'], // 限行桥梁完整路径
      edges: ['S-C', 'C-T'], 
      time: 12, toll: 0, congestion: 0, 
      name: '路线1: 直观最短(今日限行)', 
      forbidden: true 
    },
    P1: { 
      route: ['S', 'A', 'E', 'T'], // 收费路径：S->A->E->T
      edges: ['S-A', 'A-E', 'E-T'],
      time: 10, toll: 2, congestion: 1, 
      name: '路线2: 收费但最快且通畅' 
    },
    P2: { 
      route: ['S', 'B', 'C', 'F', 'T'], 
      edges: ['S-B', 'B-C', 'C-F', 'F-T'],
      time: 17, toll: 0, congestion: 4, 
      name: '路线3: 免费，中等时长，较拥堵' 
    },
    P3: { 
      route: ['S', 'B', 'D', 'F', 'T'], 
      edges: ['S-B', 'B-D', 'D-F', 'F-T'],
      time: 18, toll: 0, congestion: 0, 
      name: '路线4: 免费，最不拥堵但更绕' 
    }
  }
  
  // 权重参数 - 初始状态为0，动画过程中会更新到目标值
  const weights = useRef({ lambda: 0, mu: 0 })
  const currentPath = useRef('P1')
  
  // 计算两点间距离
  const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
  }

  // 根据距离自动决定曲线段数
  const getOptimalSegments = (distance) => {
    const scaledDistance = distance / SCALE_FACTOR
    if (scaledDistance < 120) return 1      // 短距离：1段
    if (scaledDistance < 250) return 2      // 中距离：2段  
    return 3                                // 长距离：3段
  }

  // 绘制多段曲线路径（1-3段），保证拐点光滑连接
  // 统一布局计算函数
  const calculateLayout = (canvasWidth, canvasHeight) => {
    // 预留区域：顶部公式区域约120px，底部信息卡片约200px
    const topReserved = 120
    const bottomReserved = 200
    const availableHeight = canvasHeight - topReserved - bottomReserved
    const availableWidth = canvasWidth
    
    // 整体区域：在可用区域中居中，增加高度以获得更和谐的内部布局
    const totalWidth = 1000  // 整体宽度增加
    const totalHeight = 500  // 整体高度增加
    const totalX = (availableWidth - totalWidth) / 2
    const totalY = topReserved + (availableHeight - totalHeight) / 2
    
    // 左侧图形区域 - 在整体区域内垂直居中
    const graphWidth = 600   // 图形区域宽度
    const graphHeight = 400  // 图形实际高度
    const graphX = totalX + 20  // 左侧留20px边距
    const graphY = totalY + (totalHeight - graphHeight) / 2  // 在整体区域内垂直居中
    
    // 图形在其区域内居中
    const graphOffsetX = graphX + graphWidth / 2 - 250  // 图形中心偏移
    const graphOffsetY = graphY + graphHeight / 2 - 200 // 图形中心偏移
    
    // 右侧区域 - 也在整体区域内垂直居中
    const rightPanelX = graphX + graphWidth + 40  // 图形右边30px间距
    const rightPanelWidth = 200  
    
    // 右侧内容的总高度（图例+间距+参数滑条）
    const legendHeight = 220
    const slidersHeight = 120
    const rightContentSpacing = 20
    const rightContentTotalHeight = legendHeight + rightContentSpacing + slidersHeight
    
    // 右侧内容在整体区域内垂直居中
    const rightContentStartY = totalY + (totalHeight - rightContentTotalHeight) / 2
    
    // 图例区域（右侧上方）
    const legendX = rightPanelX
    const legendY = 280
    const legendWidth = rightPanelWidth
    
    // 参数滑条区域（右侧下方）
    const slidersX = rightPanelX
    const slidersY = 540
    const slidersWidth = rightPanelWidth
    
    return {
      total: { x: totalX, y: totalY, width: totalWidth, height: totalHeight },
      graph: { x: graphX, y: graphY, width: graphWidth, height: graphHeight, offsetX: graphOffsetX, offsetY: graphOffsetY },
      legend: { x: legendX, y: legendY, width: legendWidth, height: legendHeight },
      sliders: { x: slidersX, y: slidersY, width: slidersWidth, height: slidersHeight }
    }
  }
  const drawMultiCurve = (ctx, fromX, fromY, toX, toY, segments, controlPoints) => {
    ctx.moveTo(fromX, fromY)
    
    if (segments === 1) {
      // 单段曲线
      ctx.quadraticCurveTo(controlPoints[0].x, controlPoints[0].y, toX, toY)
    } else if (segments === 2) {
      // 双段曲线 - 使用光滑连接点
      const midX = (fromX + toX) / 2
      const midY = (fromY + toY) / 2
      
      // 计算光滑连接点，确保两段曲线切线连续
      const smoothMidX = midX + (controlPoints[0].x - midX) * 0.3 + (controlPoints[1].x - midX) * 0.3
      const smoothMidY = midY + (controlPoints[0].y - midY) * 0.3 + (controlPoints[1].y - midY) * 0.3
      
      ctx.quadraticCurveTo(controlPoints[0].x, controlPoints[0].y, smoothMidX, smoothMidY)
      ctx.quadraticCurveTo(controlPoints[1].x, controlPoints[1].y, toX, toY)
    } else if (segments === 3) {
      // 三段曲线 - 使用光滑连接点
      const third1X = fromX + (toX - fromX) / 3
      const third1Y = fromY + (toY - fromY) / 3
      const third2X = fromX + (toX - fromX) * 2 / 3
      const third2Y = fromY + (toY - fromY) * 2 / 3
      
      // 第一个光滑连接点
      const smooth1X = third1X + (controlPoints[0].x - third1X) * 0.2 + (controlPoints[1].x - third1X) * 0.2
      const smooth1Y = third1Y + (controlPoints[0].y - third1Y) * 0.2 + (controlPoints[1].y - third1Y) * 0.2
      
      // 第二个光滑连接点
      const smooth2X = third2X + (controlPoints[1].x - third2X) * 0.2 + (controlPoints[2].x - third2X) * 0.2
      const smooth2Y = third2Y + (controlPoints[1].y - third2Y) * 0.2 + (controlPoints[2].y - third2Y) * 0.2
      
      ctx.quadraticCurveTo(controlPoints[0].x, controlPoints[0].y, smooth1X, smooth1Y)
      ctx.quadraticCurveTo(controlPoints[1].x, controlPoints[1].y, smooth2X, smooth2Y)
      ctx.quadraticCurveTo(controlPoints[2].x, controlPoints[2].y, toX, toY)
    }
  }

  // 绘制单条边（曲线或直线）
  const drawEdge = (ctx, edgeId, edge, offsetX, offsetY) => {
    const fromNode = NODES[edge.from]
    const toNode = NODES[edge.to]
    
    if (!fromNode || !toNode) return
    
    const fromX = offsetX + fromNode.x * SCALE_FACTOR
    const fromY = offsetY + fromNode.y * SCALE_FACTOR
    const toX = offsetX + toNode.x * SCALE_FACTOR  
    const toY = offsetY + toNode.y * SCALE_FACTOR
    
    // 设置路线样式
    switch (edge.type) {
      case 'normal':
        ctx.strokeStyle = COLORS.roadWhite
        ctx.lineWidth = 3
        break
      case 'toll':
        ctx.strokeStyle = COLORS.roadGreen
        ctx.lineWidth = 3
        break
      case 'congested':
        ctx.strokeStyle = COLORS.roadRed
        ctx.lineWidth = 3
        break
      case 'smooth':
        ctx.strokeStyle = COLORS.roadGreen
        ctx.lineWidth = 3
        break
      default:
        ctx.strokeStyle = COLORS.roadWhite
        ctx.lineWidth = 3
    }
    ctx.setLineDash([])
    
    // 绘制曲线路径（除了SC、CT保持直线）
    ctx.beginPath()
    if (edgeId === 'S-C' || edgeId === 'C-T') {
      // SC和CT保持直线
      ctx.moveTo(fromX, fromY)
      ctx.lineTo(toX, toY)
    } else {
      // 其他边都绘制为多段曲线，模拟真实道路
      const midX = (fromX + toX) / 2
      const midY = (fromY + toY) / 2
      
      if (edgeId === 'B-D') {
        // BD路径：参考BC的自然弯曲，2段轻微曲线
        const controlPoints = [
          { x: fromX - 20 * SCALE_FACTOR, y: fromY + 40 * SCALE_FACTOR },
          { x: toX - 40 * SCALE_FACTOR, y: toY - 30 * SCALE_FACTOR }
        ]
        drawMultiCurve(ctx, fromX, fromY, toX, toY, 2, controlPoints)
      } else if (edgeId === 'D-F') {
        // DF路径：避免与CF交叉，向外弯曲的样条曲线
        const controlPoints = [
          { x: fromX + 60 * SCALE_FACTOR, y: fromY + 30 * SCALE_FACTOR },
          { x: toX + 30 * SCALE_FACTOR, y: toY - 10 * SCALE_FACTOR }
        ]
        drawMultiCurve(ctx, fromX, fromY, toX, toY, 2, controlPoints)
      } else if (edgeId === 'A-E') {
        // AE路径：2段曲线，跨越湖泊连接
        const controlPoints = [
          { x: fromX + 70 * SCALE_FACTOR, y: fromY - 30 * SCALE_FACTOR },
          { x: toX - 50 * SCALE_FACTOR, y: toY - 50 * SCALE_FACTOR }
        ]
        drawMultiCurve(ctx, fromX, fromY, toX, toY, 2, controlPoints)
      } else if (edgeId === 'S-A') {
        // SA：2段曲线，轻微蜿蜒
        const controlPoints = [
          { x: fromX - 10 * SCALE_FACTOR, y: fromY - 40 * SCALE_FACTOR },
          { x: toX - 30 * SCALE_FACTOR, y: toY - 20 * SCALE_FACTOR }
        ]
        drawMultiCurve(ctx, fromX, fromY, toX, toY, 2, controlPoints)
      } else if (edgeId === 'S-B') {
        // SB：2段曲线，轻微蜿蜒
        const controlPoints = [
          { x: fromX - 10 * SCALE_FACTOR, y: fromY + 40 * SCALE_FACTOR },
          { x: toX - 30 * SCALE_FACTOR, y: toY + 20 * SCALE_FACTOR }
        ]
        drawMultiCurve(ctx, fromX, fromY, toX, toY, 2, controlPoints)
      } else if (edgeId === 'B-C') {
        // BC：2段曲线
        const controlPoints = [
          { x: fromX + 20 * SCALE_FACTOR, y: fromY - 20 * SCALE_FACTOR },
          { x: toX - 20 * SCALE_FACTOR, y: toY + 40 * SCALE_FACTOR }
        ]
        drawMultiCurve(ctx, fromX, fromY, toX, toY, 2, controlPoints)
      } else if (edgeId === 'C-F') {
        // CF：2段曲线
        const controlPoints = [
          { x: fromX - 10 * SCALE_FACTOR, y: fromY + 40 * SCALE_FACTOR },
          { x: toX - 30 * SCALE_FACTOR, y: toY - 20 * SCALE_FACTOR }
        ]
        drawMultiCurve(ctx, fromX, fromY, toX, toY, 2, controlPoints)
      } else {
        // 其他边：单段曲线
        const controlPoints = [
          { x: midX + 20 * SCALE_FACTOR, y: midY + 15 * SCALE_FACTOR }
        ]
        drawMultiCurve(ctx, fromX, fromY, toX, toY, 1, controlPoints)
      }
    }
    
    ctx.stroke()
    
    // 绘制路段标识
    let midX, midY
    if (edgeId === 'S-C' || edgeId === 'C-T') {
      // 直线的中点
      midX = (fromX + toX) / 2
      midY = (fromY + toY) / 2
    } else {
      // 曲线的中点（近似计算）
      midX = (fromX + toX) / 2
      midY = (fromY + toY) / 2
      
      // 对于长距离弯曲路段，调整标识位置
      if (edgeId === 'B-D') {
        midX -= 40 * SCALE_FACTOR
        midY += 20 * SCALE_FACTOR
      } else if (edgeId === 'D-F') {
        midX += 30 * SCALE_FACTOR
        midY += 40 * SCALE_FACTOR
      } else if (edgeId === 'A-E') {
        // AE曲线的中点，沿着曲线路径调整
        midX += 35 * SCALE_FACTOR
        midY -= 40 * SCALE_FACTOR
      }
    }
    
    if (edge.type === 'toll') {
      // 收费标识 - 调整字体大小与限行一致
      ctx.fillStyle = COLORS.tollRoad
      ctx.fillRect(midX - 43, midY , 36, 20)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 12px Consolas'
      ctx.textAlign = 'center'
      ctx.fillText('收费', midX - 25, midY + 14)
    }
  }

  // 绘制路网结构
  const drawRoadNetwork = (ctx, canvasWidth, canvasHeight, alpha = 1) => {
    const layout = calculateLayout(canvasWidth, canvasHeight)
    const offsetX = layout.graph.offsetX
    const offsetY = layout.graph.offsetY
    
    ctx.save()
    ctx.globalAlpha = alpha
    
    // 绘制半月牙形湖泊 - 完全包含在SBCFTEA节点内部
    ctx.fillStyle = COLORS.lake
    
    // 计算节点边界来确保湖泊在内部
    const sNode = offsetX + NODES.S.x * SCALE_FACTOR
    const bNode = offsetX + NODES.B.x * SCALE_FACTOR  
    const cNode = offsetX + NODES.C.x * SCALE_FACTOR
    const fNode = offsetX + NODES.F.x * SCALE_FACTOR
    const tNode = offsetX + NODES.T.x * SCALE_FACTOR
    const eNode = offsetX + NODES.E.x * SCALE_FACTOR
    const aNode = offsetX + NODES.A.x * SCALE_FACTOR
    
    const sNodeY = offsetY + NODES.S.y * SCALE_FACTOR
    const bNodeY = offsetY + NODES.B.y * SCALE_FACTOR
    const cNodeY = offsetY + NODES.C.y * SCALE_FACTOR  
    const fNodeY = offsetY + NODES.F.y * SCALE_FACTOR
    const tNodeY = offsetY + NODES.T.y * SCALE_FACTOR
    const eNodeY = offsetY + NODES.E.y * SCALE_FACTOR
    const aNodeY = offsetY + NODES.A.y * SCALE_FACTOR
    
    // 连通湖泊设计 - 整体和谐的湖泊形状，边缘自然流畅
    
    // 绘制完整的连通湖泊，使用贝塞尔曲线确保边缘光滑
    ctx.beginPath()
    
    // 左侧湖泊部分 - 从左上角开始
    const leftCenterX = offsetX + 220 * SCALE_FACTOR
    const leftCenterY = offsetY + 280 * SCALE_FACTOR
    
    ctx.moveTo(leftCenterX - 70 * SCALE_FACTOR, leftCenterY - 60 * SCALE_FACTOR)
    // 左侧边缘 - 使用光滑的贝塞尔曲线
    ctx.bezierCurveTo(
      leftCenterX - 95 * SCALE_FACTOR, leftCenterY - 40 * SCALE_FACTOR,
      leftCenterX - 90 * SCALE_FACTOR, leftCenterY,
      leftCenterX - 75 * SCALE_FACTOR, leftCenterY + 20 * SCALE_FACTOR
    )
    ctx.bezierCurveTo(
      leftCenterX - 70 * SCALE_FACTOR, leftCenterY + 45 * SCALE_FACTOR,
      leftCenterX - 50 * SCALE_FACTOR, leftCenterY + 70 * SCALE_FACTOR,
      leftCenterX - 25 * SCALE_FACTOR, leftCenterY + 75 * SCALE_FACTOR
    )
    
    // 左侧湖泊底部到连接区域
    ctx.bezierCurveTo(
      leftCenterX + 5 * SCALE_FACTOR, leftCenterY + 72 * SCALE_FACTOR,
      leftCenterX + 30 * SCALE_FACTOR, leftCenterY + 60 * SCALE_FACTOR,
      leftCenterX + 50 * SCALE_FACTOR, leftCenterY + 55 * SCALE_FACTOR
    )
    
    // 连接水道下边缘 - 向上膨胀扩展
    const channelCenterX = offsetX + 350 * SCALE_FACTOR
    const channelTopY = offsetY + 230 * SCALE_FACTOR  // 向上膨胀
    const channelBottomY = offsetY + 310 * SCALE_FACTOR
    
    ctx.bezierCurveTo(
      leftCenterX + 80 * SCALE_FACTOR, channelBottomY - 8 * SCALE_FACTOR,
      channelCenterX - 30 * SCALE_FACTOR, channelBottomY - 5 * SCALE_FACTOR,
      channelCenterX, channelBottomY
    )
    
    // 右侧湖泊连接
    const rightCenterX = offsetX + 480 * SCALE_FACTOR
    const rightCenterY = offsetY + 280 * SCALE_FACTOR
    
    ctx.bezierCurveTo(
      channelCenterX + 30 * SCALE_FACTOR, channelBottomY - 5 * SCALE_FACTOR,
      rightCenterX - 80 * SCALE_FACTOR, channelBottomY - 3 * SCALE_FACTOR,
      rightCenterX - 60 * SCALE_FACTOR, rightCenterY + 50 * SCALE_FACTOR
    )
    
    // 右侧湖泊底部和右边缘
    ctx.bezierCurveTo(
      rightCenterX - 40 * SCALE_FACTOR, rightCenterY + 65 * SCALE_FACTOR,
      rightCenterX - 5 * SCALE_FACTOR, rightCenterY + 68 * SCALE_FACTOR,
      rightCenterX + 20 * SCALE_FACTOR, rightCenterY + 65 * SCALE_FACTOR
    )
    ctx.bezierCurveTo(
      rightCenterX + 45 * SCALE_FACTOR, rightCenterY + 58 * SCALE_FACTOR,
      rightCenterX + 70 * SCALE_FACTOR, rightCenterY + 35 * SCALE_FACTOR,
      rightCenterX + 75 * SCALE_FACTOR, rightCenterY + 15 * SCALE_FACTOR
    )
    ctx.bezierCurveTo(
      rightCenterX + 78 * SCALE_FACTOR, rightCenterY - 10 * SCALE_FACTOR,
      rightCenterX + 70 * SCALE_FACTOR, rightCenterY - 35 * SCALE_FACTOR,
      rightCenterX + 50 * SCALE_FACTOR, rightCenterY - 50 * SCALE_FACTOR
    )
    
    // 右侧湖泊顶部 - 更光滑的曲线过渡
    ctx.bezierCurveTo(
      rightCenterX + 35 * SCALE_FACTOR, rightCenterY - 58 * SCALE_FACTOR,
      rightCenterX + 5 * SCALE_FACTOR, rightCenterY - 68 * SCALE_FACTOR,
      rightCenterX - 30 * SCALE_FACTOR, rightCenterY - 60 * SCALE_FACTOR
    )
    
    // 连接水道上边缘 - 膨胀后的上边界，使用更平缓的过渡
    ctx.bezierCurveTo(
      rightCenterX - 55 * SCALE_FACTOR, rightCenterY - 58 * SCALE_FACTOR,
      rightCenterX - 75 * SCALE_FACTOR, channelTopY + 25 * SCALE_FACTOR,
      channelCenterX + 40 * SCALE_FACTOR, channelTopY + 12 * SCALE_FACTOR
    )
    ctx.bezierCurveTo(
      channelCenterX + 15 * SCALE_FACTOR, channelTopY + 5 * SCALE_FACTOR,
      channelCenterX - 15 * SCALE_FACTOR, channelTopY + 5 * SCALE_FACTOR,
      channelCenterX - 40 * SCALE_FACTOR, channelTopY + 12 * SCALE_FACTOR
    )
    ctx.bezierCurveTo(
      leftCenterX + 75 * SCALE_FACTOR, channelTopY + 20 * SCALE_FACTOR,
      leftCenterX + 95 * SCALE_FACTOR, leftCenterY - 25 * SCALE_FACTOR,
      leftCenterX + 80 * SCALE_FACTOR, leftCenterY - 20 * SCALE_FACTOR
    )
    
    // 左侧湖泊顶部闭合 - 更自然的曲线，补全连通角
    ctx.bezierCurveTo(
      leftCenterX + 75 * SCALE_FACTOR, leftCenterY - 35 * SCALE_FACTOR,
      leftCenterX + 35 * SCALE_FACTOR, leftCenterY - 72 * SCALE_FACTOR,
      leftCenterX, leftCenterY - 75 * SCALE_FACTOR
    )
    ctx.bezierCurveTo(
      leftCenterX - 35 * SCALE_FACTOR, leftCenterY - 72 * SCALE_FACTOR,
      leftCenterX - 60 * SCALE_FACTOR, leftCenterY - 68 * SCALE_FACTOR,
      leftCenterX - 70 * SCALE_FACTOR, leftCenterY - 60 * SCALE_FACTOR
    )
    
    ctx.closePath()
    ctx.fill()
    
    // 移除小湖岛装饰
    
    // 添加湖泊文字标识
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 14px Consolas'
    ctx.textAlign = 'center'
    
    // 左侧湖泊标识
    ctx.fillText('湖泊', leftCenterX - 10 * SCALE_FACTOR, leftCenterY - 10 * SCALE_FACTOR)
    
    // 右侧湖泊标识  
    ctx.fillText('湖泊', rightCenterX + 10 * SCALE_FACTOR, rightCenterY - 10 * SCALE_FACTOR)
    
    // 绘制所有边
    Object.entries(EDGES).forEach(([edgeId, edge]) => {
      // 跳过bridge类型，由drawForbiddenRoads单独处理
      if (edge.type === 'bridge') return
      
      drawEdge(ctx, edgeId, edge, offsetX, offsetY)
    })
    
    // 绘制默认的限行路段（SC、CT）- 默认显示红白虚线（非高亮状态）
    drawForbiddenRoads(ctx, canvasWidth, canvasHeight, alpha, false)
    
    ctx.restore()
    return { offsetX, offsetY, layout }
  }
  
  // 绘制所有节点
  const drawNodes = (ctx, canvasWidth, canvasHeight, alpha = 1) => {
    const layout = calculateLayout(canvasWidth, canvasHeight)
    const offsetX = layout.graph.offsetX
    const offsetY = layout.graph.offsetY
    const standardNodeSize = 15    // 统一节点大小
    
    ctx.save()
    ctx.globalAlpha = alpha
    
    Object.entries(NODES).forEach(([nodeId, node]) => {
      const x = offsetX + node.x * SCALE_FACTOR
      const y = offsetY + node.y * SCALE_FACTOR
      
      // 节点颜色
      let nodeColor
      if (nodeId === 'S') {
        nodeColor = COLORS.startPoint  // 起点S绿色
      } else if (nodeId === 'T') {
        nodeColor = COLORS.endPoint    // 终点T蓝色
      } else {
        nodeColor = '#6B7280'          // 其他节点统一灰色
      }
      
      // 绘制节点圆形
      ctx.fillStyle = nodeColor
      ctx.beginPath()
      ctx.arc(x, y, standardNodeSize, 0, Math.PI * 2)
      ctx.fill()
      
      // 绘制节点文字 - 直接在圆形上居中显示
      ctx.fillStyle = '#FFFFFF'  // 白色文字
      ctx.font = 'bold 12px Consolas'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'  // 垂直居中
      ctx.fillText(node.name, x, y)
    })
    
    ctx.restore()
    return { 
      startPoint: { 
        x: offsetX + NODES.S.x * SCALE_FACTOR, 
        y: offsetY + NODES.S.y * SCALE_FACTOR 
      }, 
      endPoint: { 
        x: offsetX + NODES.T.x * SCALE_FACTOR, 
        y: offsetY + NODES.T.y * SCALE_FACTOR 
      },
      layout 
    }
  }
  
  // 绘制速度最快路径P1 - 阶段3专用函数（贴合原始图的曲线边）
  const drawP1Path = (ctx, canvasWidth, canvasHeight, progress) => {
    // P1路径：S → A → E → T（收费但最快且通畅的路径）
    const path = PATHS['P1']
    if (!path || path.forbidden) return
    
    const layout = calculateLayout(canvasWidth, canvasHeight)
    const offsetX = layout.graph.offsetX
    const offsetY = layout.graph.offsetY
    
    // 呼吸效果参数
    const baseAlpha = 0.8
    const breathingSpeed = 3 // 呼吸速度
    const breathingIntensity = 0.3 // 呼吸强度
    const alpha = baseAlpha + Math.sin(progress * breathingSpeed * Math.PI * 2) * breathingIntensity
    
    const baseLineWidth = 6
    const lineWidth = baseLineWidth + Math.sin(progress * breathingSpeed * Math.PI * 2) * 2
    
    const baseBlur = 12
    const shadowBlur = baseBlur + Math.sin(progress * breathingSpeed * Math.PI * 2) * 8
    
    ctx.save()
    ctx.globalAlpha = Math.max(0.4, Math.min(1, alpha))
    
    // 黄色光效果 - 代表速度最快
    ctx.strokeStyle = '#FFD700'
    ctx.lineWidth = lineWidth
    ctx.shadowColor = '#FFD700'
    ctx.shadowBlur = shadowBlur
    
    // 绘制P1路径的三条边：S-A, A-E, E-T
    // 严格按照drawEdge中的曲线逻辑绘制，确保贴合原始图
    
    // 第一段：S-A边
    const sNode = NODES['S']
    const aNode = NODES['A']
    const sX = offsetX + sNode.x * SCALE_FACTOR
    const sY = offsetY + sNode.y * SCALE_FACTOR
    const aX = offsetX + aNode.x * SCALE_FACTOR
    const aY = offsetY + aNode.y * SCALE_FACTOR
    
    ctx.beginPath()
    // SA：2段曲线，轻微蜿蜒（与drawEdge完全一致）
    const saControlPoints = [
      { x: sX - 10 * SCALE_FACTOR, y: sY - 40 * SCALE_FACTOR },
      { x: aX - 30 * SCALE_FACTOR, y: aY - 20 * SCALE_FACTOR }
    ]
    drawMultiCurve(ctx, sX, sY, aX, aY, 2, saControlPoints)
    ctx.stroke()
    
    // 第二段：A-E边
    const eNode = NODES['E']
    const eX = offsetX + eNode.x * SCALE_FACTOR
    const eY = offsetY + eNode.y * SCALE_FACTOR
    
    ctx.beginPath()
    // AE：2段曲线，跨越湖泊连接（与drawEdge完全一致）
    const aeControlPoints = [
      { x: aX + 70 * SCALE_FACTOR, y: aY - 30 * SCALE_FACTOR },
      { x: eX - 50 * SCALE_FACTOR, y: eY - 50 * SCALE_FACTOR }
    ]
    drawMultiCurve(ctx, aX, aY, eX, eY, 2, aeControlPoints)
    ctx.stroke()
    
    // 第三段：E-T边
    const tNode = NODES['T']
    const tX = offsetX + tNode.x * SCALE_FACTOR
    const tY = offsetY + tNode.y * SCALE_FACTOR
    
    ctx.beginPath()
    // ET：使用与drawEdge相同的单段曲线逻辑
    const etMidX = (eX + tX) / 2
    const etMidY = (eY + tY) / 2
    
    // 使用与drawEdge完全相同的控制点逻辑
    const etControlPoints = [
      { x: etMidX + 20 * SCALE_FACTOR, y: etMidY + 15 * SCALE_FACTOR }
    ]
    drawMultiCurve(ctx, eX, eY, tX, tY, 1, etControlPoints)
    ctx.stroke()
    
    // 绘制路径标识
    ctx.shadowBlur = 0
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    const labelX = offsetX + ((sNode.x + aNode.x + eNode.x + tNode.x) / 4) * SCALE_FACTOR
    const labelY = offsetY + ((sNode.y + aNode.y + eNode.y + tNode.y) / 4) * SCALE_FACTOR - 40
    
    ctx.fillRect(labelX - 110, labelY - 30, 220, 50)
    
    // 路径名称
    ctx.fillStyle = '#FFD700'
    ctx.font = 'bold 16px Consolas'
    ctx.textAlign = 'center'
    ctx.fillText('P1 - 速度最快路径', labelX, labelY - 8)
    
    // 路径特征
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '12px Consolas'
    ctx.fillText('收费路段 | 通行顺畅 | 时间最短', labelX, labelY + 12)
    
    ctx.restore()
  }

  // 绘制P2路径（少走高速）- 阶段4专用函数
  const drawP2Path = (ctx, canvasWidth, canvasHeight, progress) => {
    // P2路径：S → B → C → F → T（少走高速，避免收费）
    const path = PATHS['P2']
    if (!path || path.forbidden) return
    
    const layout = calculateLayout(canvasWidth, canvasHeight)
    const offsetX = layout.graph.offsetX
    const offsetY = layout.graph.offsetY
    
    // 呼吸效果参数
    const baseAlpha = 0.8
    const breathingSpeed = 3 // 呼吸速度
    const breathingIntensity = 0.3 // 呼吸强度
    const alpha = baseAlpha + Math.sin(progress * breathingSpeed * Math.PI * 2) * breathingIntensity
    
    const baseLineWidth = 6
    const lineWidth = baseLineWidth + Math.sin(progress * breathingSpeed * Math.PI * 2) * 2
    
    const baseBlur = 12
    const shadowBlur = baseBlur + Math.sin(progress * breathingSpeed * Math.PI * 2) * 8
    
    ctx.save()
    ctx.globalAlpha = Math.max(0.4, Math.min(1, alpha))
    
    // 黄色光效果 - 代表少走高速路径
    ctx.strokeStyle = '#FFD700'
    ctx.lineWidth = lineWidth
    ctx.shadowColor = '#FFD700'
    ctx.shadowBlur = shadowBlur
    
    // 绘制P2路径的四条边：S-B, B-C, C-F, F-T
    // 严格按照drawEdge中的曲线逻辑绘制，确保贴合原始图
    
    // 第一段：S-B边
    const sNode = NODES['S']
    const bNode = NODES['B']
    const sX = offsetX + sNode.x * SCALE_FACTOR
    const sY = offsetY + sNode.y * SCALE_FACTOR
    const bX = offsetX + bNode.x * SCALE_FACTOR
    const bY = offsetY + bNode.y * SCALE_FACTOR
    
    ctx.beginPath()
    // SB：2段曲线，轻微蜿蜒（与drawEdge完全一致）
    const sbControlPoints = [
      { x: sX - 10 * SCALE_FACTOR, y: sY + 40 * SCALE_FACTOR },
      { x: bX - 30 * SCALE_FACTOR, y: bY + 20 * SCALE_FACTOR }
    ]
    drawMultiCurve(ctx, sX, sY, bX, bY, 2, sbControlPoints)
    ctx.stroke()
    
    // 第二段：B-C边
    const cNode = NODES['C']
    const cX = offsetX + cNode.x * SCALE_FACTOR
    const cY = offsetY + cNode.y * SCALE_FACTOR
    
    ctx.beginPath()
    // BC：2段曲线（与drawEdge完全一致）
    const bcControlPoints = [
      { x: bX + 20 * SCALE_FACTOR, y: bY - 20 * SCALE_FACTOR },
      { x: cX - 20 * SCALE_FACTOR, y: cY + 40 * SCALE_FACTOR }
    ]
    drawMultiCurve(ctx, bX, bY, cX, cY, 2, bcControlPoints)
    ctx.stroke()
    
    // 第三段：C-F边
    const fNode = NODES['F']
    const fX = offsetX + fNode.x * SCALE_FACTOR
    const fY = offsetY + fNode.y * SCALE_FACTOR
    
    ctx.beginPath()
    // CF：2段曲线（与drawEdge完全一致）
    const cfControlPoints = [
      { x: cX - 10 * SCALE_FACTOR, y: cY + 40 * SCALE_FACTOR },
      { x: fX - 30 * SCALE_FACTOR, y: fY - 20 * SCALE_FACTOR }
    ]
    drawMultiCurve(ctx, cX, cY, fX, fY, 2, cfControlPoints)
    ctx.stroke()
    
    // 第四段：F-T边
    const tNode = NODES['T']
    const tX = offsetX + tNode.x * SCALE_FACTOR
    const tY = offsetY + tNode.y * SCALE_FACTOR
    
    ctx.beginPath()
    // FT：其他边的单段曲线（与drawEdge完全一致）
    const ftMidX = (fX + tX) / 2
    const ftMidY = (fY + tY) / 2
    const ftControlPoints = [
      { x: ftMidX + 20 * SCALE_FACTOR, y: ftMidY + 15 * SCALE_FACTOR }
    ]
    drawMultiCurve(ctx, fX, fY, tX, tY, 1, ftControlPoints)
    ctx.stroke()
    
    // 绘制路径标识（与P1样式完全一致）
    ctx.shadowBlur = 0
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    const labelX = offsetX + ((sNode.x + bNode.x + cNode.x + fNode.x + tNode.x) / 5) * SCALE_FACTOR
    const labelY = offsetY + ((sNode.y + bNode.y + cNode.y + fNode.y + tNode.y) / 5) * SCALE_FACTOR - 40
    
    ctx.fillRect(labelX - 110, labelY - 30, 220, 50)
    
    // 路径名称
    ctx.fillStyle = '#FFD700'
    ctx.font = 'bold 16px Consolas'
    ctx.textAlign = 'center'
    ctx.fillText('P2 - 少走高速路径', labelX, labelY - 8)
    
    // 路径特征
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '12px Consolas'
    ctx.fillText('免费路段 | 中等拥堵 | 避开收费', labelX, labelY + 12)
    
    ctx.restore()
  }

  // 绘制P3路径（躲避拥堵）- 阶段5专用函数
  const drawP3Path = (ctx, canvasWidth, canvasHeight, progress) => {
    // P3路径：S → B → D → F → T（躲避拥堵，免费最通畅）
    const path = PATHS['P3']
    if (!path || path.forbidden) return
    
    const layout = calculateLayout(canvasWidth, canvasHeight)
    const offsetX = layout.graph.offsetX
    const offsetY = layout.graph.offsetY
    
    // 呼吸效果参数
    const baseAlpha = 0.8
    const breathingSpeed = 3 // 呼吸速度
    const breathingIntensity = 0.3 // 呼吸强度
    const alpha = baseAlpha + Math.sin(progress * breathingSpeed * Math.PI * 2) * breathingIntensity
    
    const baseLineWidth = 6
    const lineWidth = baseLineWidth + Math.sin(progress * breathingSpeed * Math.PI * 2) * 2
    
    const baseBlur = 12
    const shadowBlur = baseBlur + Math.sin(progress * breathingSpeed * Math.PI * 2) * 8
    
    ctx.save()
    ctx.globalAlpha = Math.max(0.4, Math.min(1, alpha))
    
    // 黄色光效果 - 代表躲避拥堵路径
    ctx.strokeStyle = '#FFD700'
    ctx.lineWidth = lineWidth
    ctx.shadowColor = '#FFD700'
    ctx.shadowBlur = shadowBlur
    
    // 绘制P3路径的四条边：S-B, B-D, D-F, F-T
    // 严格按照drawEdge中的曲线逻辑绘制，确保贴合原始图
    
    // 第一段：S-B边
    const sNode = NODES['S']
    const bNode = NODES['B']
    const sX = offsetX + sNode.x * SCALE_FACTOR
    const sY = offsetY + sNode.y * SCALE_FACTOR
    const bX = offsetX + bNode.x * SCALE_FACTOR
    const bY = offsetY + bNode.y * SCALE_FACTOR
    
    ctx.beginPath()
    // SB：2段曲线，轻微蜿蜒（与drawEdge完全一致）
    const sbControlPoints = [
      { x: sX - 10 * SCALE_FACTOR, y: sY + 40 * SCALE_FACTOR },
      { x: bX - 30 * SCALE_FACTOR, y: bY + 20 * SCALE_FACTOR }
    ]
    drawMultiCurve(ctx, sX, sY, bX, bY, 2, sbControlPoints)
    ctx.stroke()
    
    // 第二段：B-D边
    const dNode = NODES['D']
    const dX = offsetX + dNode.x * SCALE_FACTOR
    const dY = offsetY + dNode.y * SCALE_FACTOR
    
    ctx.beginPath()
    // BD：2段轻微曲线（与drawEdge完全一致）
    const bdControlPoints = [
      { x: bX - 20 * SCALE_FACTOR, y: bY + 40 * SCALE_FACTOR },
      { x: dX - 40 * SCALE_FACTOR, y: dY - 30 * SCALE_FACTOR }
    ]
    drawMultiCurve(ctx, bX, bY, dX, dY, 2, bdControlPoints)
    ctx.stroke()
    
    // 第三段：D-F边
    const fNode = NODES['F']
    const fX = offsetX + fNode.x * SCALE_FACTOR
    const fY = offsetY + fNode.y * SCALE_FACTOR
    
    ctx.beginPath()
    // DF：2段曲线，向外弯曲避免与CF交叉（与drawEdge完全一致）
    const dfControlPoints = [
      { x: dX + 60 * SCALE_FACTOR, y: dY + 30 * SCALE_FACTOR },
      { x: fX + 30 * SCALE_FACTOR, y: fY - 10 * SCALE_FACTOR }
    ]
    drawMultiCurve(ctx, dX, dY, fX, fY, 2, dfControlPoints)
    ctx.stroke()
    
    // 第四段：F-T边
    const tNode = NODES['T']
    const tX = offsetX + tNode.x * SCALE_FACTOR
    const tY = offsetY + tNode.y * SCALE_FACTOR
    
    ctx.beginPath()
    // FT：其他边的单段曲线（与drawEdge完全一致）
    const ftMidX = (fX + tX) / 2
    const ftMidY = (fY + tY) / 2
    const ftControlPoints = [
      { x: ftMidX + 20 * SCALE_FACTOR, y: ftMidY + 15 * SCALE_FACTOR }
    ]
    drawMultiCurve(ctx, fX, fY, tX, tY, 1, ftControlPoints)
    ctx.stroke()
    
    // 绘制路径标识（适当下移，更贴近P3路径）
    ctx.shadowBlur = 0
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    const labelX = offsetX + ((sNode.x + bNode.x + dNode.x + fNode.x + tNode.x) / 5) * SCALE_FACTOR
    const labelY = offsetY + ((sNode.y + bNode.y + dNode.y + fNode.y + tNode.y) / 5) * SCALE_FACTOR + 80
    
    ctx.fillRect(labelX - 110, labelY - 30, 220, 50)
    
    // 路径名称
    ctx.fillStyle = '#FFD700'
    ctx.font = 'bold 16px Consolas'
    ctx.textAlign = 'center'
    ctx.fillText('P3 - 躲避拥堵路径', labelX, labelY - 8)
    
    // 路径特征
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '12px Consolas'
    ctx.fillText('免费路段 | 最不拥堵 | 路程较远', labelX, labelY + 12)
    
    ctx.restore()
  }

  // 阶段6：计算动态参数并返回最优路径
  const calculateOptimalPath = (progress) => {
    // 动态调整λ和μ参数，创建6次纯随机参数组合
    const totalCombinations = 6 // 整个动画周期内6次变化
    const currentIndex = Math.floor(progress * totalCombinations)
    const cycleProgress = (progress * totalCombinations) % 1
    
    // 使用固定种子确保每次运行结果一致，但生成随机参数组合
    const seeds = [12345, 67890, 54321, 98765, 13579, 24680] // 为每个组合设置不同的种子
    const currentSeed = seeds[Math.min(currentIndex, totalCombinations - 1)]
    
    // 简单的伪随机数生成器（基于种子）
    const seededRandom = (seed) => {
      const x = Math.sin(seed) * 10000
      return x - Math.floor(x)
    }
    
    // 生成当前组合的随机λ和μ值（0-1范围）
    const lambda = seededRandom(currentSeed)
    const mu = seededRandom(currentSeed + 1) // 使用不同种子确保λ和μ不相关
    
    // 更新权重参数
    weights.current.lambda = lambda
    weights.current.mu = mu
    
    // 根据参数值选择最优路径
    let optimalPath
    if (lambda <= 0.35) {
      // λ<=0.35时，始终选择P1为最优路径
      optimalPath = 'P1'
    } else if (lambda > 0.35 && mu < 0.5) {
      // λ>0.35且μ<0.5时，始终选择P2为最优路径
      optimalPath = 'P2'
    } else {
      // λ>0.35且μ>0.5时，始终选择P3为最优路径
      optimalPath = 'P3'
    }
    
    return { optimalPath, lambda, mu, cycleProgress }
  }
  
  // 绘制单个滑条
  const drawSlider = (ctx, x, y, width, height, value, color, label) => {
    // 背景轨道
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.fillRect(x, y, width, height)
    
    // 进度条
    ctx.fillStyle = color
    ctx.fillRect(x, y, width * value, height)
    
    // 标签
    ctx.fillStyle = COLORS.infoText
    ctx.font = '12px Consolas'
    ctx.textAlign = 'left'
    ctx.fillText(label, x, y - 5)
    
    // 数值
    ctx.textAlign = 'right'
    ctx.fillText(value.toFixed(1), x + width, y - 5)
  }
  
  // 绘制阶段2顶部公式区域的高亮框
  const drawFormulaHighlights = (ctx, canvasWidth, canvasHeight, progress = 0) => {
    ctx.save()
    
    // 可调整的偏移量参数
    const offsetX = 320  // 水平偏移量，可根据需要调整
    const offsetY = 20  // 垂直偏移量，可根据需要调整
    
    // 基础位置（顶部区域）
    const baseY = 30 + offsetY
    
    // 收费惩罚黄色框的位置和尺寸
    const tollBoxX = 100 + offsetX
    const tollBoxY = baseY
    const tollBoxWidth = 120
    const tollBoxHeight = 45
    
    // 拥堵惩罚红色框的位置和尺寸  
    const congestionBoxX = 230 + offsetX
    const congestionBoxY = baseY
    const congestionBoxWidth = 120
    const congestionBoxHeight = 45
    
    // 根据progress控制闪烁效果
    let alpha = 1
    if (progress < 0.6) {
      // 前60%时间：闪烁效果
      const blinkSpeed = 8 // 闪烁频率
      alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(progress * blinkSpeed * Math.PI * 2))
    } else {
      // 后40%时间：常亮
      alpha = 1
    }
    
    ctx.globalAlpha = alpha
    
    // 绘制收费惩罚黄色框
    ctx.strokeStyle = '#FFD700' // 黄色
    ctx.lineWidth = 3
    ctx.setLineDash([])
    ctx.strokeRect(tollBoxX, tollBoxY, tollBoxWidth, tollBoxHeight)
    
    // 绘制拥堵惩罚红色框
    ctx.strokeStyle = '#FF4444' // 红色
    ctx.lineWidth = 3
    ctx.setLineDash([])
    ctx.strokeRect(congestionBoxX, congestionBoxY, congestionBoxWidth, congestionBoxHeight)
    
    ctx.restore()
  }
  
  // 绘制默认限行路段（SC、CT）- 红色矩形标识
  const drawForbiddenRoads = (ctx, canvasWidth, canvasHeight, alpha = 1, isStage1Highlight = false, progress = 0) => {
    const layout = calculateLayout(canvasWidth, canvasHeight)
    const offsetX = layout.graph.offsetX
    const offsetY = layout.graph.offsetY
    
    ctx.save()
    ctx.globalAlpha = alpha
    
    const sNode = NODES.S
    const cNode = NODES.C
    const tNode = NODES.T
    
    const sX = offsetX + sNode.x * SCALE_FACTOR
    const sY = offsetY + sNode.y * SCALE_FACTOR
    const cX = offsetX + cNode.x * SCALE_FACTOR
    const cY = offsetY + cNode.y * SCALE_FACTOR
    const tX = offsetX + tNode.x * SCALE_FACTOR
    const tY = offsetY + tNode.y * SCALE_FACTOR
    
    const time = Date.now() / 100 // 用时间创建流动效果
    
    if (isStage1Highlight) {
      // 阶段1：根据progress控制动画阶段
      if (progress < 0.5) {
        // 前半段：红白间隔流动效果（增强版）
        ctx.lineWidth = 5
        
        // 增强的流动效果，速度更快
        const fastTime = Date.now() / 50 // 更快的流动速度
        
        // 先绘制红色底色虚线
        ctx.setLineDash([15, 10])
        ctx.lineDashOffset = -fastTime % 25
        ctx.strokeStyle = COLORS.forbiddenAnimation
        
        // 绘制SC段红色虚线
        ctx.beginPath()
        ctx.moveTo(sX, sY)
        ctx.lineTo(cX, cY)
        ctx.stroke()
        
        // 绘制CT段红色虚线
        ctx.beginPath()
        ctx.moveTo(cX, cY)
        ctx.lineTo(tX, tY)
        ctx.stroke()
        
        // 再绘制白色虚线（偏移以显示红白交替效果）
        ctx.setLineDash([10, 15])
        ctx.lineDashOffset = -fastTime % 25 + 12.5
        ctx.strokeStyle = '#FFFFFF'
        
        // 绘制SC段白色虚线
        ctx.beginPath()
        ctx.moveTo(sX, sY)
        ctx.lineTo(cX, cY)
        ctx.stroke()
        
        // 绘制CT段白色虚线
        ctx.beginPath()
        ctx.moveTo(cX, cY)
        ctx.lineTo(tX, tY)
        ctx.stroke()
      } else {
        // 后半段：红色发光呼吸效果
        const breathingPhase = (progress - 0.5) * 2 // 将后半段progress映射到0-1
        const breathingIntensity = 0.5 + 0.5 * Math.sin(breathingPhase * Math.PI * 6) // 呼吸频率
        
        ctx.shadowColor = COLORS.forbiddenAnimation
        ctx.shadowBlur = 15 + 10 * breathingIntensity // 动态阴影模糊
        ctx.lineWidth = 5 + 2 * breathingIntensity // 动态线宽
        ctx.strokeStyle = COLORS.forbiddenAnimation
        ctx.setLineDash([])
        
        // 设置动态透明度用于呼吸效果
        ctx.globalAlpha = alpha * (0.7 + 0.3 * breathingIntensity)
        
        // 绘制SC段高亮
        ctx.beginPath()
        ctx.moveTo(sX, sY)
        ctx.lineTo(cX, cY)
        ctx.stroke()
        
        // 绘制CT段高亮
        ctx.beginPath()
        ctx.moveTo(cX, cY)
        ctx.lineTo(tX, tY)
        ctx.stroke()
        
        // 重置阴影和透明度
        ctx.shadowBlur = 0
        ctx.globalAlpha = alpha
      }
    } else {
      // 默认状态：红白间隔线段，带流动效果
      ctx.lineWidth = 4
      
      // 先绘制红色底色虚线
      ctx.setLineDash([12, 8])
      ctx.lineDashOffset = -time % 20
      ctx.strokeStyle = COLORS.forbiddenAnimation
      
      // 绘制SC段红色虚线
      ctx.beginPath()
      ctx.moveTo(sX, sY)
      ctx.lineTo(cX, cY)
      ctx.stroke()
      
      // 绘制CT段红色虚线
      ctx.beginPath()
      ctx.moveTo(cX, cY)
      ctx.lineTo(tX, tY)
      ctx.stroke()
      
      // 再绘制白色虚线（偏移一些以显示红白交替效果）
      ctx.setLineDash([8, 12])
      ctx.lineDashOffset = -time % 20 + 10
      ctx.strokeStyle = '#FFFFFF'
      
      // 绘制SC段白色虚线
      ctx.beginPath()
      ctx.moveTo(sX, sY)
      ctx.lineTo(cX, cY)
      ctx.stroke()
      
      // 绘制CT段白色虚线
      ctx.beginPath()
      ctx.moveTo(cX, cY)
      ctx.lineTo(tX, tY)
      ctx.stroke()
    }
    
    // 限行标识 - 在SC中点位置
    const scMidX = (sX + cX) / 2
    const scMidY = (sY + cY) / 2
    
    ctx.setLineDash([])
    ctx.shadowBlur = 0
    
    // 绘制限行标识背景
    ctx.fillStyle = isStage1Highlight ? '#FF0000' : '#DC2626'
    ctx.fillRect(scMidX - 18, scMidY - 10, 36, 20)
    
    // 绘制白色边框
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 1
    ctx.strokeRect(scMidX - 18, scMidY - 10, 36, 20)
    
    // 绘制白色限行文字
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 11px Consolas'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('限行', scMidX, scMidY)
    
    ctx.restore()
  }
  
  // 绘制限行路段突出动画效果（红光）
  const drawForbiddenAnimation = (ctx, canvasWidth, canvasHeight, animationProgress = 0) => {
    // 直接调用带高亮效果的限行道路绘制，传入progress参数
    drawForbiddenRoads(ctx, canvasWidth, canvasHeight, 1, true, animationProgress) // 使用阶段1高亮模式
  }
  
  // 顶部信息面板已移除，所有信息统一在底部显示
  
  // 顶部标签已移除，所有信息在底部显示
  
  // 计算目标值
  const calculateObjective = (pathName, lambda = weights.current.lambda, mu = weights.current.mu) => {
    const path = PATHS[pathName]
    if (!path) return Infinity
    
    return path.time + lambda * path.toll + mu * path.congestion
  }
  
  // 根据权重选择最优路径
  const selectOptimalPath = () => {
    const { lambda, mu } = weights.current
    
    // 计算所有可行路径的目标值
    const costs = {
      P1: calculateObjective('P1', lambda, mu),
      P2: calculateObjective('P2', lambda, mu), 
      P3: calculateObjective('P3', lambda, mu)
    }
    
    // 找到最小成本的路径
    let bestPath = 'P1'
    let minCost = costs.P1
    
    if (costs.P2 < minCost) {
      bestPath = 'P2'
      minCost = costs.P2
    }
    
    if (costs.P3 < minCost) {
      bestPath = 'P3'
      minCost = costs.P3
    }
    
    return bestPath
  }
  
  // 获取当前最优路径的目标值
  const getCurrentObjectiveValue = () => {
    return calculateObjective(currentPath.current).toFixed(1)
  }
  
  // 主动画循环
  const draw = (progress = 1) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    
    // 清空画布
    ctx.fillStyle = COLORS.background
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    
    // 你可以控制这个偏移量来移动整个组合
    const offsetX = 0  // 修改这个值可以水平移动整个组合
    const offsetY = -70  // 修改这个值可以垂直移动整个组合
    
    // 应用偏移量（在缩放变换之前）
    ctx.save()
    ctx.translate(offsetX, offsetY)
    
    // 缩放变换
    const scaleX = canvasWidth / 2
    const scaleY = canvasHeight / 2
    
    // ===== 统一整体布局绘制（内嵌到draw函数内部）=====
    const layout = calculateLayout(canvasWidth, canvasHeight)
    
    // 1. 绘制路网和节点（左侧图形区域）
    drawRoadNetwork(ctx, canvasWidth, canvasHeight, progress)
    const points = drawNodes(ctx, canvasWidth, canvasHeight, progress)
    
    // 2. 绘制右侧图例（上方）
    const legendX = layout.legend.x
    const legendY = layout.legend.y
    const legendWidth = layout.legend.width
    const legendHeight = layout.legend.height
    const itemHeight = 25
    
    // 图例背景
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 2
    ctx.fillStyle = COLORS.infoBackground
    ctx.fillRect(legendX, legendY, legendWidth, legendHeight)
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.3)'
    ctx.lineWidth = 1
    ctx.strokeRect(legendX, legendY, legendWidth, legendHeight)
    
    // 图例标题
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 16px Consolas'
    ctx.textAlign = 'center'
    ctx.fillText('图例', legendX + legendWidth/2, legendY + 25)
    
    let yOffset = legendY + 50
    
    // S节点
    ctx.fillStyle = COLORS.startPoint
    ctx.beginPath()
    ctx.arc(legendX + 25, yOffset, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 8px Consolas'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('S', legendX + 25, yOffset)
    ctx.font = '14px Consolas'
    ctx.textAlign = 'left'
    ctx.fillText('起点', legendX + 45, yOffset + 5)
    yOffset += itemHeight
    
    // T节点
    ctx.fillStyle = COLORS.endPoint
    ctx.beginPath()
    ctx.arc(legendX + 25, yOffset, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 8px Consolas'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('T', legendX + 25, yOffset)
    ctx.font = '14px Consolas'
    ctx.textAlign = 'left'
    ctx.fillText('终点', legendX + 45, yOffset + 5)
    yOffset += itemHeight
    
    // 其他节点
    ctx.fillStyle = '#6B7280'
    ctx.beginPath()
    ctx.arc(legendX + 25, yOffset, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 8px Consolas'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('A', legendX + 25, yOffset)
    ctx.font = '14px Consolas'
    ctx.textAlign = 'left'
    ctx.fillText('中转节点', legendX + 45, yOffset + 5)
    yOffset += itemHeight + 8
    
    // 限行道路 - 红白虚线
    ctx.setLineDash([8, 4])
    ctx.lineWidth = 3
    // 先画红色虚线
    ctx.strokeStyle = '#FF0000'
    ctx.beginPath()
    ctx.moveTo(legendX + 20, yOffset)
    ctx.lineTo(legendX + 40, yOffset)
    ctx.stroke()
    // 再画白色虚线（偏移一点显示红白交替效果）
    ctx.setLineDash([4, 8])
    ctx.strokeStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.moveTo(legendX + 24, yOffset)
    ctx.lineTo(legendX + 44, yOffset)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillText('限行道路', legendX + 45, yOffset + 5)
    yOffset += itemHeight
    
    // 畅通道路
    ctx.strokeStyle = COLORS.roadGreen
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(legendX + 20, yOffset)
    ctx.lineTo(legendX + 40, yOffset)
    ctx.stroke()
    ctx.fillText('畅通道路', legendX + 45, yOffset + 5)
    yOffset += itemHeight
    
    // 拥堵道路
    ctx.strokeStyle = COLORS.roadRed
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(legendX + 20, yOffset)
    ctx.lineTo(legendX + 40, yOffset)
    ctx.stroke()
    ctx.fillText('拥堵道路', legendX + 45, yOffset + 5)
    yOffset += itemHeight
    
    // 普通道路
    ctx.strokeStyle = COLORS.roadWhite
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(legendX + 20, yOffset)
    ctx.lineTo(legendX + 40, yOffset)
    ctx.stroke()
    ctx.fillText('普通道路', legendX + 45, yOffset + 5)
    
    // 3. 绘制右侧参数滑条（下方）
    const sliderX = layout.sliders.x + 25
    const sliderWidth = layout.sliders.width - 50
    const sliderHeight = 8
    
    // 参数滑条背景
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 2
    ctx.fillStyle = COLORS.infoBackground
    ctx.fillRect(layout.sliders.x, layout.sliders.y, layout.sliders.width, layout.sliders.height)
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.3)'
    ctx.lineWidth = 1
    ctx.strokeRect(layout.sliders.x, layout.sliders.y, layout.sliders.width, layout.sliders.height)
    
    // 参数滑条标题
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 14px Consolas'
    ctx.textAlign = 'center'
    ctx.fillText('正则化参数示例', layout.sliders.x + layout.sliders.width/2, layout.sliders.y + 18)
    
    // 计算参数滑条的垂直居中布局
    const titleHeight = 25 // 标题占用的高度
    const availableHeight = layout.sliders.height - titleHeight // 扣除标题后的可用高度
    const numParams = 2 // 参数个数（λ和μ）
    const paramSpacing = availableHeight / (numParams + 1) // 等间距分布
    
    // 2个参数垂直居中布局，合适的行距
    const paramVerticalSpacing = 45 // 参数间距
    const startParamY = layout.sliders.y + titleHeight + 25 // 起始Y坐标，留出更多空间进行垂直居中
    
    // λ (收费偏好) - 第1个参数
    drawSlider(ctx, sliderX, startParamY, sliderWidth, sliderHeight, weights.current.lambda, COLORS.tollRoad, 'λ 少收费')
    
    // μ (拥堵偏好) - 第2个参数  
    drawSlider(ctx, sliderX, startParamY + paramVerticalSpacing, sliderWidth, sliderHeight, weights.current.mu, COLORS.congestion, 'μ 躲拥堵')
    
    // ===== 统一整体布局绘制结束 =====
    
    ctx.restore()
  }
  
  // 动画循环函数
  const animate = (timestamp) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp
    }
    
    const elapsed = timestamp - startTimeRef.current
    const progress = Math.min(elapsed / ANIMATION_DURATION, 1)
    
    draw(progress)
  }

  // === 分阶段播放相关函数 ===
  

  // 更新阶段信息
  const updateStageInfo = (stage) => {
    const stageInfos = {
      1: {
        title: '硬约束',
        content: '硬约束对应数学优化问题的约束条件，其直接改变决策变量的可行域。如图上红白间隔线表示禁止通行的路段。'
      },
      2: {
        title: '软约束', 
        content: '正则化是一种软约束。路径规划时，软约束通过调整目标函数来影响路径选择。如希望速度最快？少走收费公路？躲避拥堵？。'
      },
      3: {
        title: '速度最快路径规划',
        content: '在速度最快的目标下，降低对走收费路的惩罚，取 λ=0.2，μ=0.4，得到路径P1（黄色，cost=15）。'
      },
      4: {
        title: '少走高速路径规划',
        content: '在少走高速的约束下，增大对收费路的惩罚，取 λ=1.0，μ=0.4，得到路径P2（黄色，cost=18）。'
      },
      5: {
        title: '躲避拥堵路径规划',
        content: '在少走高速的约束下，增大对拥堵路段的惩罚，取 λ=0.7，μ=1.0，得到路径P3（黄色，cost=20）。'
      },
      6: {
        title: '参数影响分析',
        content: 'λ 参数调节对通行费用的重视程度，μ 参数调节对道路拥堵的容忍度。通过调整二者组合，可以实现不同的规划策略，以满足多样化的决策目标。'
      },
      7: {
        title: '最终对比分析',
        content: [
          '硬约束是必须遵守的法律，正则化是依法纳税的税收。',
          '硬约束定义了可行与不可行的绝对边界，正则化定义了更优与次优的相对成本。',
          '硬约束是筛选方案的铁栅栏，正则化是引导方向的指南针。'
        ]
      }
    };
    
    const info = stageInfos[stage];
    
    if (info) {
      // 总是更新内部信息卡片
      setInternalStageInfo(info);
      
      // 如果父组件提供了setStageInfo，也调用它
      if (setStageInfo) {
        setStageInfo(info);
      } else {
      }
    }
  };

  // 处理播放按钮点击
  const handlePlayClick = () => {
    
    // 使用内部播放状态判断
    if (internalPlaying) {
      return;
    }
    
    if (currentInternalStage < 7) {
      // 播放下一阶段
      const nextStage = currentInternalStage + 1;
      
      setCurrentInternalStage(nextStage);
      setInternalPlaying(true);
      setStageProgress(0);
      
      // 更新按钮文字
      if (setButtonText) {
        setButtonText('播放中...');
      }
      
      // 更新阶段信息
      updateStageInfo(nextStage);
      
      // 开始播放当前阶段
      playStage(nextStage);
    } else {
      // 阶段7完成后，直接从阶段1重新开始
      setCurrentInternalStage(1);
      setStageStates({});
      setStageProgress(0);
      setInternalPlaying(true);
      
      // 重置权重参数到初始值
      weights.current.lambda = 0;
      weights.current.mu = 0;
      
      if (setButtonText) {
        setButtonText('播放中...');
      }
      
      // 更新阶段1信息并开始播放
      updateStageInfo(1);
      playStage(1);
    }
  };

  // 播放指定阶段
  const playStage = (stage) => {
    const startTime = Date.now();
    const startTimeStr = new Date(startTime).toLocaleTimeString();
    
    
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    
    const ctx = canvas.getContext('2d');
    const stageDuration = STAGE_DURATIONS[stage - 1] || 1000;
    
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / stageDuration, 1);
      
      
      // 清空画布
      ctx.fillStyle = COLORS.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 你可以控制这个偏移量来移动整个组合
      const offsetX = 0  // 修改这个值可以水平移动整个组合
      const offsetY = -70  // 修改这个值可以垂直移动整个组合
      
      // 应用偏移量（在缩放变换之前）
      ctx.save();
      ctx.translate(offsetX, offsetY);
      
      // 缩放变换
      const scaleX = canvas.width / 2;
      const scaleY = canvas.height / 2;
      
      // ===== 统一整体布局绘制（内嵌到playStage函数内部）=====
      const layout = calculateLayout(canvas.width, canvas.height)
      
      // 1. 绘制路网和节点（左侧图形区域）
      drawRoadNetwork(ctx, canvas.width, canvas.height, progress)
      const points = drawNodes(ctx, canvas.width, canvas.height, progress)
      
      // 2. 绘制右侧图例（上方）
      const legendX = layout.legend.x
      const legendY = layout.legend.y
      const legendWidth = layout.legend.width
      const legendHeight = layout.legend.height
      const itemHeight = 25
      
      // 图例背景
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      ctx.fillStyle = COLORS.infoBackground
      ctx.fillRect(legendX, legendY, legendWidth, legendHeight)
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      ctx.strokeStyle = 'rgba(156, 163, 175, 0.3)'
      ctx.lineWidth = 1
      ctx.strokeRect(legendX, legendY, legendWidth, legendHeight)
      
      // 图例标题
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 16px Consolas'
      ctx.textAlign = 'center'
      ctx.fillText('图例', legendX + legendWidth/2, legendY + 25)
      
      let yOffset = legendY + 50
      
      // S节点
      ctx.fillStyle = COLORS.startPoint
      ctx.beginPath()
      ctx.arc(legendX + 25, yOffset, 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 8px Consolas'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('S', legendX + 25, yOffset)
      ctx.font = '14px Consolas'
      ctx.textAlign = 'left'
      ctx.fillText('起点', legendX + 45, yOffset + 5)
      yOffset += itemHeight
      
      // T节点
      ctx.fillStyle = COLORS.endPoint
      ctx.beginPath()
      ctx.arc(legendX + 25, yOffset, 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 8px Consolas'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('T', legendX + 25, yOffset)
      ctx.font = '14px Consolas'
      ctx.textAlign = 'left'
      ctx.fillText('终点', legendX + 45, yOffset + 5)
      yOffset += itemHeight
      
      // 其他节点
      ctx.fillStyle = '#6B7280'
      ctx.beginPath()
      ctx.arc(legendX + 25, yOffset, 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 8px Consolas'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('A', legendX + 25, yOffset)
      ctx.font = '14px Consolas'
      ctx.textAlign = 'left'
      ctx.fillText('中转节点', legendX + 45, yOffset + 5)
      yOffset += itemHeight + 8
      
      // 限行道路 - 红白虚线
      ctx.setLineDash([8, 4])
      ctx.lineWidth = 3
      // 先画红色虚线
      ctx.strokeStyle = '#FF0000'
      ctx.beginPath()
      ctx.moveTo(legendX + 20, yOffset)
      ctx.lineTo(legendX + 40, yOffset)
      ctx.stroke()
      // 再画白色虚线（偏移一点显示红白交替效果）
      ctx.setLineDash([4, 8])
      ctx.strokeStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.moveTo(legendX + 24, yOffset)
      ctx.lineTo(legendX + 44, yOffset)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillText('限行道路', legendX + 45, yOffset + 5)
      yOffset += itemHeight
      
      // 畅通道路
      ctx.strokeStyle = COLORS.roadGreen
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(legendX + 20, yOffset)
      ctx.lineTo(legendX + 40, yOffset)
      ctx.stroke()
      ctx.fillText('畅通道路', legendX + 45, yOffset + 5)
      yOffset += itemHeight
      
      // 拥堵道路
      ctx.strokeStyle = COLORS.roadRed
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(legendX + 20, yOffset)
      ctx.lineTo(legendX + 40, yOffset)
      ctx.stroke()
      ctx.fillText('拥堵道路', legendX + 45, yOffset + 5)
      yOffset += itemHeight
      
      // 普通道路
      ctx.strokeStyle = COLORS.roadWhite
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(legendX + 20, yOffset)
      ctx.lineTo(legendX + 40, yOffset)
      ctx.stroke()
      ctx.fillText('普通道路', legendX + 45, yOffset + 5)
      
      // 3. 绘制右侧参数滑条（下方）
      const sliderX = layout.sliders.x + 25
      const sliderWidth = layout.sliders.width - 50
      const sliderHeight = 8
      
      // 参数滑条背景
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      ctx.fillStyle = COLORS.infoBackground
      ctx.fillRect(layout.sliders.x, layout.sliders.y, layout.sliders.width, layout.sliders.height)
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
      ctx.strokeStyle = 'rgba(156, 163, 175, 0.3)'
      ctx.lineWidth = 1
      ctx.strokeRect(layout.sliders.x, layout.sliders.y, layout.sliders.width, layout.sliders.height)
      
      // 参数滑条标题
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 14px Consolas'
      ctx.textAlign = 'center'
      ctx.fillText('正则化参数示例', layout.sliders.x + layout.sliders.width/2, layout.sliders.y + 18)
      
      // 计算参数滑条的垂直居中布局
      const titleHeight = 25 // 标题占用的高度
      const availableHeight = layout.sliders.height - titleHeight // 扣除标题后的可用高度
      const numParams = 2 // 参数个数（λ和μ）
      const paramSpacing = availableHeight / (numParams + 1) // 等间距分布
      
      // λ (收费偏好) - 第1个参数 
      const param1Y = layout.sliders.y + titleHeight + paramSpacing
      drawSlider(ctx, sliderX, param1Y, sliderWidth, sliderHeight, weights.current.lambda , COLORS.tollRoad, 'λ 少收费')
      
      // μ (拥堵偏好) - 第2个参数 
      const param2Y = layout.sliders.y + titleHeight + paramSpacing * 2
      drawSlider(ctx, sliderX, param2Y, sliderWidth, sliderHeight, weights.current.mu , COLORS.congestion, 'μ 躲拥堵')
      
      // ===== 统一整体布局绘制结束 =====
      
      // 绘制之前阶段的静态状态
      if (stage > 1) {
        // 阶段3、4、5、6、7特殊处理：只绘制阶段1的静态状态，清理隐藏前面阶段的所有动画显示
        if (stage === 3 || stage === 4 || stage === 5 || stage === 6 || stage === 7) {
          // 仅绘制阶段1的静态状态（限行道路）
          const state1 = stageStates[1];
          if (state1) {
            drawForbiddenRoads(ctx, canvas.width, canvas.height, 1, false);
          }
        }
      }
      
      // 绘制当前阶段动画
      if (stage === 1) {
        // 阶段1: 硬约束演示 - 前半时间流动效果，后半时间发光呼吸
        drawForbiddenRoads(ctx, canvas.width, canvas.height, 1, true, progress);
      } else if (stage === 2) {
        // 阶段2: 保持基础绘制
        drawForbiddenRoads(ctx, canvas.width, canvas.height, 1, false);
      } else if (stage === 3) {
        // 阶段3: 路径规划 - 更新权重参数并绘制速度最快的P1路径（贴合原始图的曲线边）
        weights.current.lambda = 0.2;
        weights.current.mu = 0.4;
        drawP1Path(ctx, canvas.width, canvas.height, progress);
      } else if (stage === 4) {
        // 阶段4: 少走高速路径 - 设置λ=1.0, μ=0.4并绘制P2路径（SBCFT）
        weights.current.lambda = 1.0;
        weights.current.mu = 0.4;
        drawP2Path(ctx, canvas.width, canvas.height, progress);
      } else if (stage === 5) {
        // 阶段5: 躲避拥堵路径规划 - 设置λ=0.7, μ=1.0并绘制P3路径（SBDFT）
        weights.current.lambda = 0.7;
        weights.current.mu = 1.0;
        drawP3Path(ctx, canvas.width, canvas.height, progress);
      } else if (stage === 6) {
        // 阶段6: 正则化参数影响分析 - 动态调整λ和μ，根据参数组合动态切换最优路径
        const { optimalPath, lambda, mu, cycleProgress } = calculateOptimalPath(progress)
        
        // 根据选择的最优路径绘制相应的路径
        if (optimalPath === 'P1') {
          drawP1Path(ctx, canvas.width, canvas.height, cycleProgress)
        } else if (optimalPath === 'P2') {
          drawP2Path(ctx, canvas.width, canvas.height, cycleProgress)
        } else if (optimalPath === 'P3') {
          drawP3Path(ctx, canvas.width, canvas.height, cycleProgress)
        }
      } else if (stage === 7) {
        // 阶段7: 最终对比 - 保留阶段6的最终显示结果
        // 获取阶段6的最终参数状态（progress=1）
        const { optimalPath, lambda, mu } = calculateOptimalPath(1)
        
        // 保持阶段6最后的参数值和路径显示
        weights.current.lambda = lambda
        weights.current.mu = mu
        
        // 绘制最终选择的路径
        if (optimalPath === 'P1') {
          drawP1Path(ctx, canvas.width, canvas.height, 1)
        } else if (optimalPath === 'P2') {
          drawP2Path(ctx, canvas.width, canvas.height, 1)
        } else if (optimalPath === 'P3') {
          drawP3Path(ctx, canvas.width, canvas.height, 1)
        }
      } else {
        // 其他阶段保持基础绘制 - 红白虚线
        drawForbiddenRoads(ctx, canvas.width, canvas.height, 1, false);
      }
      
      ctx.restore();
      
      // 阶段2专用：在transform之外绘制顶部公式区域高亮框（不受偏移影响，确保最顶层显示）
      if (stage === 2) {
        drawFormulaHighlights(ctx, canvas.width, canvas.height, progress);
      }
      
      // 更新进度
      setStageProgress(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // 阶段结束
        
        onStageCompleteHandler(stage);
      }
    };
    
    animate();
  };;;;;

  // 阶段完成处理
  const onStageCompleteHandler = (stage) => {
    setInternalPlaying(false);
    
    if (stage < 7) {
      // 非最终阶段：保存当前阶段的最终状态
      const newStageStates = { ...stageStates };
      const endState = getStageEndState(stage);
      newStageStates[stage] = endState;
      
      
      setStageStates(newStageStates);
      
      // 更新按钮文字
      if (setButtonText) {
        setButtonText('下一步');
      }
    } else {
      // 第7阶段：重置到初始状态
      
      // 重置权重参数到初始值
      weights.current.lambda = 0;
      weights.current.mu = 0;
      
      // 清空所有阶段状态
      setStageStates({});
      
      // 重新绘制完整的初始状态
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        // 使用完整的draw函数绘制初始状态
        draw(1.0);
      }
      
      // 更新按钮文字
      if (setButtonText) {
        setButtonText('播放');
      }
    }
    
    
    onStageComplete(stage);
  };;

  // 获取阶段结束状态
  const getStageEndState = (stage) => {
    switch (stage) {
      case 1:
        return { forbiddenHighlight: true };
      case 2:
        return {}; // 已删除拥堵显示功能
      case 3:
        return { pathVisible: true, pathType: 'P1' };
      case 4:
        return { weightVisible: true };
      case 5:
        return { optimizedPath: true };
      case 6:
        return { validationMarks: true };
      case 7:
        return { parameterComparison: true };
      case 8:
        return { finalComparison: true };
      default:
        return {};
    }
  };

  // 绘制阶段动画

  // 暴露函数供父组件使用 - 只在首次渲染时输出
  if (typeof window !== 'undefined') {
    // 主要的播放控制函数 - 父组件按钮应该调用这个
    window.handlePlayClick = () => {
      console.log('🌐 父组件按钮点击 - 智能判断操作');
      
      // 根据当前状态决定操作
      if (currentInternalStage === 0 && Object.keys(stageStates).length === 0) {
        // 初始状态，开始播放第一阶段
        console.log('🎬 开始第一阶段');
        handlePlayClick();
      } else if (currentInternalStage > 0 && currentInternalStage < 7 && !internalPlaying) {
        // 有已完成阶段，播放下一阶段
        console.log('👆 播放下一阶段');
        handlePlayClick();
      } else if (currentInternalStage === 7 && !internalPlaying) {
        // 第7阶段完成，直接从阶段1重新开始
          handlePlayClick();
      } else {
        console.log('⚠️ 当前无法操作，状态:', {
          currentInternalStage,
          internalPlaying,
          stageStatesCount: Object.keys(stageStates).length
        });
      }
    };
    
    if (!window._handlePlayClickLogged) {
      console.log('🌐 智能播放函数已暴露到 window.handlePlayClick');
      window._handlePlayClickLogged = true;
    }
    
    // 内部播放函数
    const internalPlayClick = handlePlayClick;
    
    // 添加测试函数
    window.testPlayClick = () => {
      console.log('🧪 测试函数被调用');
      internalPlayClick();
    };
    
    // 添加手动下一步函数
    window.nextStep = () => {
      console.log('👆 手动下一步');
      if (currentInternalStage > 0 && currentInternalStage < 8 && !internalPlaying) {
        internalPlayClick();
      }
    };
  }
  
  // 重置动画到初始状态的函数
  const resetToInitialState = () => {
    console.log('🔄 重置动画到初始状态');
    
    // 停止任何正在进行的动画
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // 重置所有状态
    setInternalPlaying(false);
    setCurrentInternalStage(0);
    setStageStates({});
    setStageProgress(0);
    
    // 重置按钮文字
    if (setButtonText) {
      setButtonText('播放');
    }
    
    // 重新绘制初始状态
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      draw(1.0); // 绘制完整的初始状态
    }
    
    console.log('✅ 动画重置完成');
  };
  
  // 监听重置信号
  useEffect(() => {
    if (shouldReset) {
      console.log('🔄 收到重置信号，执行动画重置');
      resetToInitialState();
    }
  }, [shouldReset]);
  
  // 组件卸载时清理动画
  useEffect(() => {
    return () => {
      console.log('🧹 组件卸载，清理动画');
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // 组件初始化调试
  useEffect(() => {
    console.log('🚀 RegularizationAnimation 组件初始化完成');
    console.log('🎯 初始状态:', {
      currentInternalStage,
      isPlaying,
      stageStates
    });
  }, []);
  
  // 监控内部状态变化
  useEffect(() => {
    console.log('🔄 内部阶段变化:', currentInternalStage);
  }, [currentInternalStage]);
  
  useEffect(() => {
    console.log('⏸️ 播放状态变化:', isPlaying);
    
    // 完全禁用父组件isPlaying的自动触发，改为按钮直接调用window.handlePlayClick
    console.log('ℹ️ 父组件isPlaying状态变化已被忽略，请使用按钮直接触发');
  }, [isPlaying]);

  useEffect(() => {
    console.log('🎭 内部播放状态变化:', internalPlaying);
  }, [internalPlaying]);
  
  // 组件生命周期
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // 设置canvas尺寸
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    
    canvas.style.width = rect.width + 'px'
    canvas.style.height = rect.height + 'px'
    
    // 禁用原有动画逻辑，使用新的分阶段播放
    console.log('🎨 画布初始化完成，绘制初始状态');
    
    // 绘制完整的初始静态场景（包括图例和参数）
    draw(1.0);
    
    // 已完成阶段的状态绘制逻辑已集成到playStage函数中
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [isPlaying, currentStage])
  
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ 
          width: '100%', 
          height: '100%', 
          background: 'transparent',
          display: 'block'
        }}
      />
      
      {/* 内置信息卡片 */}
      {internalStageInfo.title && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '8px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 1000
        }}>
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '16px', 
            fontWeight: '600',
            color: '#00D084'
          }}>
            {internalStageInfo.title}
          </h3>
          <div style={{ 
            margin: 0, 
            fontSize: '14px', 
            lineHeight: '1.4',
            opacity: 0.9
          }}>
            {Array.isArray(internalStageInfo.content) ? (
              internalStageInfo.content.map((item, index) => (
                <p key={index} style={{ 
                  margin: index === 0 ? '0 0 8px 0' : '8px 0',
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  • {item}
                </p>
              ))
            ) : (
              <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.4' }}>
                {internalStageInfo.content}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default RegularizationAnimation