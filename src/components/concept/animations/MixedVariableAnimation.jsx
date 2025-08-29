import React, { useRef, useEffect } from 'react'

const MixedVariableAnimation = ({ isPlaying = false, onComplete = () => {} }) => {
  
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const animationStateRef = useRef({
    startTime: 0,
    currentTime: 0,
    totalDuration: 12000, // 12 seconds
    isRunning: false
  })

  // 画布与坐标系统
  const WORLD_WIDTH = 24
  const WORLD_HEIGHT = 16
  const CANVAS_PADDING = 0.06 // 6% padding

  // 停车场几何
  const PARKING_GEOMETRY = {
    laneY: [5, 11], // 车道Y范围
    slotWidth: 2.5,
    slotDepth: 5.0,
    bottomSlots: { y: 2.5, centers: [3, 6, 9, 12, 15, 18] }, // B1-B6
    topSlots: { y: 13.5, centers: [3, 6, 9, 12, 15, 18] }     // T1-T6
  }

  // 车辆参数
  const VEHICLE = {
    length: 4.5,
    width: 1.8,
    axleDistance: 2.7,
    maxSteerAngle: 35 * Math.PI / 180, // 35度转弧度
    safetyMargin: 0.30
  }

  // 计算最小转弯半径
  const R_MIN = VEHICLE.axleDistance / Math.tan(VEHICLE.maxSteerAngle)
  const KAPPA_MAX = 1 / R_MIN

  // 起始和目标位置
  const START_POS = { x: 2.0, y: 8.0, heading: 0 }
  const TARGET_SLOT = { id: 'B5', center: { x: 15.0, y: 2.5 }, heading: Math.PI / 2 }

  // 路径控制点 - 根据MATLAB代码优化后的参数
  const PATH_SEGMENTS = {
    forward: {
      bezier: {
        P0: { x: 2.0, y: 8.0 },
        P1: { x: 6.0, y: 8.0 },
        P2: { x: 12.0, y: 6.5 },
        P3: { x: 15.0, y: 5.5 }
      }
    },
    reverse: {
      bezier: {
        P0: { x: 15.0, y: 5.5 },
        P1: { x: 15.0, y: 4.5 },
        P2: { x: 15.0, y: 3.5 },
        P3: { x: 15.0, y: 2.5 }
      }
    }
  }

  // 颜色主题
  const COLORS = {
    background: '#0F1116',
    majorGrid: 'rgba(47, 54, 66, 0.7)',
    minorGrid: 'rgba(37, 41, 51, 0.4)',
    lane: 'rgba(191, 201, 218, 0.6)',
    emptySlot: 'rgba(49, 130, 206, 0.15)',
    occupiedSlot: 'rgba(160, 174, 192, 0.25)',
    slotBorder: 'rgba(191, 201, 218, 0.6)',
    targetSlot: '#63B3ED',
    vehicle: '#38A169',
    vehicleArrow: '#E7EDF8',
    forwardPath: '#4299E1',
    reversePath: '#ED8936',
    safetyHull: 'rgba(246, 173, 85, 0.25)',
    controlPolygon: 'rgba(231, 237, 248, 0.4)',
    text: '#E7EDF8',
    formulaBackground: 'rgba(11, 18, 32, 0.85)'
  }

  // 坐标系转换
  const worldToScreen = (worldX, worldY, canvasWidth, canvasHeight) => {
    const scale = Math.min(
      (canvasWidth * (1 - 2 * CANVAS_PADDING)) / WORLD_WIDTH,
      (canvasHeight * (1 - 2 * CANVAS_PADDING)) / WORLD_HEIGHT
    )
    const offsetX = (canvasWidth - WORLD_WIDTH * scale) / 2
    const offsetY = (canvasHeight - WORLD_HEIGHT * scale) / 2
    
    return {
      x: offsetX + worldX * scale,
      y: offsetY + (WORLD_HEIGHT - worldY) * scale, // Y轴翻转
      scale
    }
  }

  // 绘制网格
  const drawGrid = (ctx, canvasWidth, canvasHeight) => {
    // 主网格线 (每5米)
    ctx.strokeStyle = COLORS.majorGrid
    ctx.lineWidth = 0.8
    ctx.beginPath()
    for (let x = 0; x <= WORLD_WIDTH; x += 5) {
      const screenStart = worldToScreen(x, 0, canvasWidth, canvasHeight)
      const screenEnd = worldToScreen(x, WORLD_HEIGHT, canvasWidth, canvasHeight)
      ctx.moveTo(screenStart.x, screenStart.y)
      ctx.lineTo(screenEnd.x, screenEnd.y)
    }
    for (let y = 0; y <= WORLD_HEIGHT; y += 5) {
      const screenStart = worldToScreen(0, y, canvasWidth, canvasHeight)
      const screenEnd = worldToScreen(WORLD_WIDTH, y, canvasWidth, canvasHeight)
      ctx.moveTo(screenStart.x, screenStart.y)
      ctx.lineTo(screenEnd.x, screenEnd.y)
    }
    ctx.stroke()

    // 次网格线 (每1米)
    ctx.strokeStyle = COLORS.minorGrid
    ctx.lineWidth = 0.5
    ctx.beginPath()
    for (let x = 0; x <= WORLD_WIDTH; x++) {
      if (x % 5 !== 0) {
        const screenStart = worldToScreen(x, 0, canvasWidth, canvasHeight)
        const screenEnd = worldToScreen(x, WORLD_HEIGHT, canvasWidth, canvasHeight)
        ctx.moveTo(screenStart.x, screenStart.y)
        ctx.lineTo(screenEnd.x, screenEnd.y)
      }
    }
    for (let y = 0; y <= WORLD_HEIGHT; y++) {
      if (y % 5 !== 0) {
        const screenStart = worldToScreen(0, y, canvasWidth, canvasHeight)
        const screenEnd = worldToScreen(WORLD_WIDTH, y, canvasWidth, canvasHeight)
        ctx.moveTo(screenStart.x, screenStart.y)
        ctx.lineTo(screenEnd.x, screenEnd.y)
      }
    }
    ctx.stroke()
  }

  // 绘制车道
  const drawLanes = (ctx, canvasWidth, canvasHeight) => {
    ctx.strokeStyle = COLORS.lane
    ctx.lineWidth = 1.0
    
    // 上车道边界
    const topLaneStart = worldToScreen(0, PARKING_GEOMETRY.laneY[1], canvasWidth, canvasHeight)
    const topLaneEnd = worldToScreen(WORLD_WIDTH, PARKING_GEOMETRY.laneY[1], canvasWidth, canvasHeight)
    ctx.beginPath()
    ctx.moveTo(topLaneStart.x, topLaneStart.y)
    ctx.lineTo(topLaneEnd.x, topLaneEnd.y)
    ctx.stroke()

    // 下车道边界
    const bottomLaneStart = worldToScreen(0, PARKING_GEOMETRY.laneY[0], canvasWidth, canvasHeight)
    const bottomLaneEnd = worldToScreen(WORLD_WIDTH, PARKING_GEOMETRY.laneY[0], canvasWidth, canvasHeight)
    ctx.beginPath()
    ctx.moveTo(bottomLaneStart.x, bottomLaneStart.y)
    ctx.lineTo(bottomLaneEnd.x, bottomLaneEnd.y)
    ctx.stroke()
  }

  // 绘制停车位
  const drawParkingSlots = (ctx, canvasWidth, canvasHeight, highlightB5 = false) => {
    const { slotWidth, slotDepth, bottomSlots, topSlots } = PARKING_GEOMETRY

    // 绘制下排停车位 (B1-B6)
    bottomSlots.centers.forEach((centerX, index) => {
      const isB5 = centerX === 15
      const slotLeft = centerX - slotWidth / 2
      const slotRight = centerX + slotWidth / 2
      const slotBottom = 0
      const slotTop = slotDepth

      const corners = [
        worldToScreen(slotLeft, slotBottom, canvasWidth, canvasHeight),
        worldToScreen(slotRight, slotBottom, canvasWidth, canvasHeight),
        worldToScreen(slotRight, slotTop, canvasWidth, canvasHeight),
        worldToScreen(slotLeft, slotTop, canvasWidth, canvasHeight)
      ]

      // 填充颜色
      ctx.fillStyle = isB5 ? COLORS.emptySlot : COLORS.occupiedSlot
      ctx.beginPath()
      ctx.moveTo(corners[0].x, corners[0].y)
      corners.forEach(corner => ctx.lineTo(corner.x, corner.y))
      ctx.closePath()
      ctx.fill()

      // 边框
      if (isB5 && highlightB5) {
        ctx.strokeStyle = COLORS.targetSlot
        ctx.lineWidth = 2.5
        ctx.shadowColor = COLORS.targetSlot
        ctx.shadowBlur = 8
      } else {
        ctx.strokeStyle = COLORS.slotBorder
        ctx.lineWidth = 1.2
        ctx.shadowBlur = 0
      }
      ctx.stroke()
      ctx.shadowBlur = 0

      // 标签
      if (isB5) {
        const center = worldToScreen(centerX, bottomSlots.y, canvasWidth, canvasHeight)
        ctx.fillStyle = COLORS.text
        ctx.font = '12px Consolas'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('B5', center.x, center.y)
      }
    })

    // 绘制上排停车位 (T1-T6) - 都是占用状态
    topSlots.centers.forEach(centerX => {
      const slotLeft = centerX - slotWidth / 2
      const slotRight = centerX + slotWidth / 2
      const slotBottom = 11
      const slotTop = 16

      const corners = [
        worldToScreen(slotLeft, slotBottom, canvasWidth, canvasHeight),
        worldToScreen(slotRight, slotBottom, canvasWidth, canvasHeight),
        worldToScreen(slotRight, slotTop, canvasWidth, canvasHeight),
        worldToScreen(slotLeft, slotTop, canvasWidth, canvasHeight)
      ]

      ctx.fillStyle = COLORS.occupiedSlot
      ctx.beginPath()
      ctx.moveTo(corners[0].x, corners[0].y)
      corners.forEach(corner => ctx.lineTo(corner.x, corner.y))
      ctx.closePath()
      ctx.fill()

      ctx.strokeStyle = COLORS.slotBorder
      ctx.lineWidth = 1.2
      ctx.stroke()
    })
  }

  // 三次贝塞尔曲线计算
  const bezierPoint = (t, P0, P1, P2, P3) => {
    const u = 1 - t
    return {
      x: u*u*u*P0.x + 3*u*u*t*P1.x + 3*u*t*t*P2.x + t*t*t*P3.x,
      y: u*u*u*P0.y + 3*u*u*t*P1.y + 3*u*t*t*P2.y + t*t*t*P3.y
    }
  }

  // 贝塞尔曲线导数（用于计算切向量）
  const bezierDerivative = (t, P0, P1, P2, P3) => {
    const u = 1 - t
    return {
      x: -3*u*u*P0.x + 3*u*u*P1.x - 6*u*t*P1.x + 6*u*t*P2.x - 3*t*t*P2.x + 3*t*t*P3.x,
      y: -3*u*u*P0.y + 3*u*u*P1.y - 6*u*t*P1.y + 6*u*t*P2.y - 3*t*t*P2.y + 3*t*t*P3.y
    }
  }

  // 绘制贝塞尔曲线路径
  const drawBezierPath = (ctx, canvasWidth, canvasHeight, bezierPoints, color, isDashed = false) => {
    ctx.strokeStyle = color
    ctx.lineWidth = 2.5
    
    if (isDashed) {
      ctx.setLineDash([8, 4])
    } else {
      ctx.setLineDash([])
    }

    ctx.beginPath()
    const startPoint = worldToScreen(bezierPoints.P0.x, bezierPoints.P0.y, canvasWidth, canvasHeight)
    ctx.moveTo(startPoint.x, startPoint.y)

    // 绘制贝塞尔曲线
    for (let t = 0; t <= 1; t += 0.01) {
      const point = bezierPoint(t, bezierPoints.P0, bezierPoints.P1, bezierPoints.P2, bezierPoints.P3)
      const screenPoint = worldToScreen(point.x, point.y, canvasWidth, canvasHeight)
      ctx.lineTo(screenPoint.x, screenPoint.y)
    }
    ctx.stroke()
    ctx.setLineDash([])
  }

  // 绘制控制多边形
  const drawControlPolygon = (ctx, canvasWidth, canvasHeight, bezierPoints) => {
    ctx.strokeStyle = COLORS.controlPolygon
    ctx.lineWidth = 1.0
    ctx.setLineDash([4, 4])

    const points = [bezierPoints.P0, bezierPoints.P1, bezierPoints.P2, bezierPoints.P3]
    
    ctx.beginPath()
    const startPoint = worldToScreen(points[0].x, points[0].y, canvasWidth, canvasHeight)
    ctx.moveTo(startPoint.x, startPoint.y)
    
    for (let i = 1; i < points.length; i++) {
      const point = worldToScreen(points[i].x, points[i].y, canvasWidth, canvasHeight)
      ctx.lineTo(point.x, point.y)
    }
    ctx.stroke()

    // 绘制控制点
    ctx.fillStyle = COLORS.controlPolygon
    points.forEach(point => {
      const screenPoint = worldToScreen(point.x, point.y, canvasWidth, canvasHeight)
      ctx.beginPath()
      ctx.arc(screenPoint.x, screenPoint.y, 4, 0, 2 * Math.PI)
      ctx.fill()
    })

    ctx.setLineDash([])
  }

  // 绘制车辆
  const drawVehicle = (ctx, canvasWidth, canvasHeight, position, heading, showSafetyHull = false) => {
    const center = worldToScreen(position.x, position.y, canvasWidth, canvasHeight)
    
    ctx.save()
    ctx.translate(center.x, center.y)
    ctx.rotate(-heading) // 注意Y轴翻转，所以旋转角度取负

    const scale = center.scale
    const vehicleLength = VEHICLE.length * scale
    const vehicleWidth = VEHICLE.width * scale

    // 安全廓
    if (showSafetyHull) {
      const safeLength = (VEHICLE.length + 2 * VEHICLE.safetyMargin) * scale
      const safeWidth = (VEHICLE.width + 2 * VEHICLE.safetyMargin) * scale
      
      ctx.fillStyle = COLORS.safetyHull
      ctx.fillRect(-safeLength/2, -safeWidth/2, safeLength, safeWidth)
    }

    // 车体
    ctx.fillStyle = COLORS.vehicle
    ctx.strokeStyle = COLORS.vehicle
    ctx.lineWidth = 1.8
    ctx.fillRect(-vehicleLength/2, -vehicleWidth/2, vehicleLength, vehicleWidth)
    ctx.strokeRect(-vehicleLength/2, -vehicleWidth/2, vehicleLength, vehicleWidth)

    // 车头箭头
    ctx.strokeStyle = COLORS.vehicleArrow
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(vehicleLength/4, 0)
    ctx.lineTo(vehicleLength/2 - 8, -6)
    ctx.moveTo(vehicleLength/4, 0)
    ctx.lineTo(vehicleLength/2 - 8, 6)
    ctx.stroke()

    ctx.restore()
  }

  // 绘制公式牌 - 移动到底部左侧
  const drawFormulaCard = (ctx, canvasWidth, canvasHeight) => {
    const padding = 16
    const cardWidth = 280
    const cardHeight = 120
    const borderRadius = 8
    const topMargin = 10  // 增加与动画区域的间隙
    const leftMargin = 45

    // 定位到底部左侧，增加顶部间隙
    const cardX = padding + leftMargin
    const cardY = canvasHeight - cardHeight - padding + topMargin

    // 绘制圆角矩形背景
    ctx.fillStyle = COLORS.formulaBackground
    ctx.beginPath()
    ctx.moveTo(cardX + borderRadius, cardY)
    ctx.lineTo(cardX + cardWidth - borderRadius, cardY)
    ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + borderRadius)
    ctx.lineTo(cardX + cardWidth, cardY + cardHeight - borderRadius)
    ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - borderRadius, cardY + cardHeight)
    ctx.lineTo(cardX + borderRadius, cardY + cardHeight)
    ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - borderRadius)
    ctx.lineTo(cardX, cardY + borderRadius)
    ctx.quadraticCurveTo(cardX, cardY, cardX + borderRadius, cardY)
    ctx.closePath()
    ctx.fill()

    // 绘制圆角矩形边框
    ctx.strokeStyle = 'rgba(191, 201, 218, 0.3)'
    ctx.lineWidth = 1
    ctx.stroke()

    // 标题
    ctx.fillStyle = COLORS.text
    ctx.font = 'bold 16px Consolas'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('混合变量优化', cardX + 16, cardY + 16)

    // 内容
    ctx.font = '12px Consolas'
    const lines = [
      '离散：车位选择 z_i∈{0,1}, Σz_i=1',
      '      段落开关 g_k∈{+1,-1}',
      '连续：Bézier控制点 {P}、速度 v(t)',
      '约束：|κ|≤0.259 m⁻¹、安全廓+0.30m'
    ]

    lines.forEach((line, index) => {
      ctx.fillText(line, cardX + 16, cardY + 44 + index * 16)
    })
  }

  // 绘制状态指示器
  const drawStatusIndicators = (ctx, canvasWidth, canvasHeight, isForward = true, time = 0, distance = 0, curvature = 0) => {
    const padding = 16

    // D/R指示灯 - 移动到左上角
    const lightSize = 32
    const lightX = padding
    const lightY = padding
    
    // D灯 (前进档 Drive)
    ctx.fillStyle = isForward ? COLORS.forwardPath : 'rgba(66, 153, 225, 0.3)'
    ctx.fillRect(lightX, lightY, lightSize, lightSize)
    ctx.fillStyle = COLORS.text
    ctx.font = 'bold 16px Consolas'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('D', lightX + lightSize/2, lightY + lightSize/2)

    // R灯 (倒车档 Reverse)
    ctx.fillStyle = !isForward ? COLORS.reversePath : 'rgba(237, 137, 54, 0.3)'
    ctx.fillRect(lightX, lightY + lightSize + 8, lightSize, lightSize)
    ctx.fillStyle = COLORS.text
    ctx.fillText('R', lightX + lightSize/2, lightY + lightSize + 8 + lightSize/2)

    // 数值显示 - 移动到底部右侧，与左侧公式卡片垂直对齐，增加间隙
    const statusWidth = 200
    const statusHeight = 120  // 与左侧卡片高度一致
    const borderRadius = 8   // 与左侧卡片圆角一致
    const topMargin = 10     // 与左侧卡片保持相同的顶部间隙
    const leftMargin = -40     // 与左侧卡片保持相同的顶部间隙
    const statusX = canvasWidth - statusWidth - padding + leftMargin
    const statusY = canvasHeight - statusHeight - padding + topMargin  // 增加顶部间隙与左侧卡片对齐

    // 绘制圆角矩形背景
    ctx.fillStyle = COLORS.formulaBackground
    ctx.beginPath()
    ctx.moveTo(statusX + borderRadius, statusY)
    ctx.lineTo(statusX + statusWidth - borderRadius, statusY)
    ctx.quadraticCurveTo(statusX + statusWidth, statusY, statusX + statusWidth, statusY + borderRadius)
    ctx.lineTo(statusX + statusWidth, statusY + statusHeight - borderRadius)
    ctx.quadraticCurveTo(statusX + statusWidth, statusY + statusHeight, statusX + statusWidth - borderRadius, statusY + statusHeight)
    ctx.lineTo(statusX + borderRadius, statusY + statusHeight)
    ctx.quadraticCurveTo(statusX, statusY + statusHeight, statusX, statusY + statusHeight - borderRadius)
    ctx.lineTo(statusX, statusY + borderRadius)
    ctx.quadraticCurveTo(statusX, statusY, statusX + borderRadius, statusY)
    ctx.closePath()
    ctx.fill()

    // 绘制圆角矩形边框
    ctx.strokeStyle = 'rgba(191, 201, 218, 0.3)'
    ctx.lineWidth = 1
    ctx.stroke()

    // 标题
    ctx.fillStyle = COLORS.text
    ctx.font = 'bold 16px Consolas'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('运动状态', statusX + 12, statusY + 16)

    // 数值显示
    ctx.font = '12px Consolas'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    const statusLines = [
      `t = ${time.toFixed(2)} s`,
      `s = ${distance.toFixed(2)} m`,
      `|κ|/κmax = ${(curvature / KAPPA_MAX).toFixed(2)}`
    ]

    statusLines.forEach((line, index) => {
      ctx.fillText(line, statusX + 12, statusY + 44 + index * 16)
    })

    // 曲率条形图 - 调整位置以适应新的卡片高度
    const barWidth = 120
    const barHeight = 8
    const barX = statusX + 12
    const barY = statusY + 96

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.fillRect(barX, barY, barWidth, barHeight)

    ctx.fillStyle = curvature > KAPPA_MAX * 0.8 ? '#EF4444' : COLORS.forwardPath
    const fillWidth = Math.min(barWidth * (curvature / KAPPA_MAX), barWidth)
    ctx.fillRect(barX, barY, fillWidth, barHeight)
  }

  // 主渲染函数
  const render = (ctx, canvasWidth, canvasHeight, currentTime) => {
    // 清空画布
    ctx.fillStyle = COLORS.background
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // 时间节点定义
    const SCENE_FADE_IN = 1200    // [0-1.2s] 场景入场
    const SLOT_SELECTION = 2200   // [1.2-2.2s] 车位选择
    const PATH_PREVIEW = 3600     // [2.2-3.6s] 路径预览
    const FORWARD_START = 3600    // [3.6s] 前进开始
    const FORWARD_END = 7000      // [7.0s] 前进结束
    const GEAR_SHIFT = 7500       // [7.5s] 换挡完成
    const REVERSE_END = 10000     // [10.0s] 倒车结束
    const TOTAL_DURATION = 12000  // [12.0s] 总时长

    // 根据时间阶段渲染
    if (currentTime >= 0) {
      // 基础场景
      drawGrid(ctx, canvasWidth, canvasHeight)
      drawLanes(ctx, canvasWidth, canvasHeight)
      
      // 停车位高亮
      const highlightB5 = currentTime >= SLOT_SELECTION
      drawParkingSlots(ctx, canvasWidth, canvasHeight, highlightB5)
    }

    if (currentTime >= SCENE_FADE_IN) {
      // 公式牌
      drawFormulaCard(ctx, canvasWidth, canvasHeight)
    }

    if (currentTime >= PATH_PREVIEW) {
      // 路径预览
      drawControlPolygon(ctx, canvasWidth, canvasHeight, PATH_SEGMENTS.forward.bezier)
      drawControlPolygon(ctx, canvasWidth, canvasHeight, PATH_SEGMENTS.reverse.bezier)
      drawBezierPath(ctx, canvasWidth, canvasHeight, PATH_SEGMENTS.forward.bezier, COLORS.forwardPath)
      drawBezierPath(ctx, canvasWidth, canvasHeight, PATH_SEGMENTS.reverse.bezier, COLORS.reversePath, true)
    }

    // 车辆动画
    let vehiclePos = START_POS
    let vehicleHeading = START_POS.heading
    let isForward = true
    let animTime = 0
    let distance = 0
    let curvature = 0

    if (currentTime >= FORWARD_START && currentTime <= FORWARD_END) {
      // 前进阶段
      const progress = (currentTime - FORWARD_START) / (FORWARD_END - FORWARD_START)
      const bezierProgress = Math.min(progress, 1)
      
      vehiclePos = bezierPoint(bezierProgress, 
        PATH_SEGMENTS.forward.bezier.P0,
        PATH_SEGMENTS.forward.bezier.P1,
        PATH_SEGMENTS.forward.bezier.P2,
        PATH_SEGMENTS.forward.bezier.P3
      )

      // 计算朝向（从切向量）
      const derivative = bezierDerivative(bezierProgress,
        PATH_SEGMENTS.forward.bezier.P0,
        PATH_SEGMENTS.forward.bezier.P1,
        PATH_SEGMENTS.forward.bezier.P2,
        PATH_SEGMENTS.forward.bezier.P3
      )
      vehicleHeading = Math.atan2(derivative.y, derivative.x)
      
      animTime = (currentTime - FORWARD_START) / 1000
      distance = progress * 15 // 估算距离
      curvature = 0.1 // 简化的曲率值

    } else if (currentTime >= GEAR_SHIFT && currentTime <= REVERSE_END) {
      // 倒车阶段
      isForward = false
      const progress = (currentTime - GEAR_SHIFT) / (REVERSE_END - GEAR_SHIFT)
      const bezierProgress = Math.min(progress, 1)
      
      vehiclePos = bezierPoint(bezierProgress,
        PATH_SEGMENTS.reverse.bezier.P0,
        PATH_SEGMENTS.reverse.bezier.P1,
        PATH_SEGMENTS.reverse.bezier.P2,
        PATH_SEGMENTS.reverse.bezier.P3
      )

      // 倒车时车头朝向与运动方向相反
      const derivative = bezierDerivative(bezierProgress,
        PATH_SEGMENTS.reverse.bezier.P0,
        PATH_SEGMENTS.reverse.bezier.P1,
        PATH_SEGMENTS.reverse.bezier.P2,
        PATH_SEGMENTS.reverse.bezier.P3
      )
      vehicleHeading = Math.atan2(-derivative.y, -derivative.x) // 反向
      
      animTime = (currentTime - GEAR_SHIFT) / 1000 + 3.4
      distance = 15 + progress * 5 // 前进距离 + 倒车距离
      curvature = 0.05

    } else if (currentTime > REVERSE_END) {
      // 最终位置
      vehiclePos = TARGET_SLOT.center
      vehicleHeading = TARGET_SLOT.heading
      isForward = false
      animTime = 10.0
      distance = 20.0
      curvature = 0
    }

    // 绘制车辆
    if (currentTime >= SCENE_FADE_IN) {
      const showSafety = currentTime >= PATH_PREVIEW
      drawVehicle(ctx, canvasWidth, canvasHeight, vehiclePos, vehicleHeading, showSafety)
    }

    // 状态指示器
    if (currentTime >= PATH_PREVIEW) {
      drawStatusIndicators(ctx, canvasWidth, canvasHeight, isForward, animTime, distance, curvature)
    }

    // 目标标签
    if (currentTime >= SLOT_SELECTION) {
      const targetCenter = worldToScreen(TARGET_SLOT.center.x, TARGET_SLOT.center.y + 1.5, canvasWidth, canvasHeight)
      ctx.fillStyle = COLORS.text
      ctx.font = '12px Consolas'
      ctx.textAlign = 'center'
      ctx.fillText('目标姿态 θ≈90°', targetCenter.x, targetCenter.y)
    }
  }

  // 渲染静态停车场场景
  const renderStaticScene = (ctx, canvasWidth, canvasHeight) => {
    
    // 清空画布
    ctx.fillStyle = COLORS.background
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // 渲染基础场景
    drawGrid(ctx, canvasWidth, canvasHeight)
    drawLanes(ctx, canvasWidth, canvasHeight)
    drawParkingSlots(ctx, canvasWidth, canvasHeight, true) // 高亮B5

    // 显示路径预览
    drawControlPolygon(ctx, canvasWidth, canvasHeight, PATH_SEGMENTS.forward.bezier)
    drawControlPolygon(ctx, canvasWidth, canvasHeight, PATH_SEGMENTS.reverse.bezier)
    drawBezierPath(ctx, canvasWidth, canvasHeight, PATH_SEGMENTS.forward.bezier, COLORS.forwardPath)
    drawBezierPath(ctx, canvasWidth, canvasHeight, PATH_SEGMENTS.reverse.bezier, COLORS.reversePath, true)

    // 车辆在起始位置
    drawVehicle(ctx, canvasWidth, canvasHeight, START_POS, START_POS.heading, true)

    // 显示信息卡片
    drawFormulaCard(ctx, canvasWidth, canvasHeight)
    drawStatusIndicators(ctx, canvasWidth, canvasHeight, true, 0, 0, 0)

    // 目标标签
    const targetCenter = worldToScreen(TARGET_SLOT.center.x, TARGET_SLOT.center.y + 1.5, canvasWidth, canvasHeight)
    ctx.fillStyle = COLORS.text
    ctx.font = '12px Consolas'
    ctx.textAlign = 'center'
    ctx.fillText('目标姿态 θ≈90°', targetCenter.x, targetCenter.y)
  }

  // 动画循环
  const animate = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const state = animationStateRef.current

    if (!state.isRunning) return

    const now = Date.now()
    const elapsed = now - state.startTime
    state.currentTime = elapsed

    // 渲染当前帧
    render(ctx, canvas.width, canvas.height, elapsed)

    // 检查是否完成
    if (elapsed >= state.totalDuration) {
      state.isRunning = false
      onComplete()
      return
    }

    // 继续下一帧
    animationRef.current = requestAnimationFrame(animate)
  }

  // 开始动画
  const startAnimation = () => {
    const state = animationStateRef.current
    state.startTime = Date.now()
    state.currentTime = 0
    state.isRunning = true
    animate()
  }

  // 停止动画
  const stopAnimation = () => {
    const state = animationStateRef.current
    state.isRunning = false
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }

  // 响应播放状态变化
  useEffect(() => {
    if (isPlaying) {
      // 当开始播放时，重新检查Canvas尺寸
      const canvas = canvasRef.current
      if (canvas) {
        setTimeout(() => {
          const rect = canvas.parentElement.getBoundingClientRect()
          if (rect.width > 0 && rect.height > 0) {
            canvas.width = rect.width
            canvas.height = rect.height
            
            // 开始播放前先显示静态场景
            const ctx = canvas.getContext('2d')
            renderStaticScene(ctx, canvas.width, canvas.height)
          }
        }, 50) // 等待DOM更新
      }
      
      startAnimation()
    } else {
      stopAnimation()
      
      // 停止时渲染静态场景
      const canvas = canvasRef.current
      if (canvas && canvas.width > 0 && canvas.height > 0) {
        const ctx = canvas.getContext('2d')
        renderStaticScene(ctx, canvas.width, canvas.height)
      }
    }

    return () => stopAnimation()
  }, [isPlaying])

  // 画布大小调整
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      // 等待一个frame，确保DOM已经渲染
      requestAnimationFrame(() => {
        const rect = canvas.parentElement.getBoundingClientRect()
        
        if (rect.width > 0 && rect.height > 0) {
          canvas.width = rect.width
          canvas.height = rect.height
          
          // 渲染静态场景或当前帧
          const ctx = canvas.getContext('2d')
          if (animationStateRef.current.isRunning) {
            render(ctx, canvas.width, canvas.height, animationStateRef.current.currentTime)
          } else {
            // 渲染静态停车场场景
            renderStaticScene(ctx, canvas.width, canvas.height)
          }
        } else {
          setTimeout(resizeCanvas, 100) // 100ms后重试
        }
      })
    }

    // 立即尝试设置尺寸
    resizeCanvas()
    
    // 监听窗口大小变化
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          background: COLORS.background
        }}
      />
    </div>
  )
}

export default MixedVariableAnimation