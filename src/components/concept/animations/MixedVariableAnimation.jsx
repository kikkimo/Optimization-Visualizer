import React, { useRef, useEffect, useState } from 'react'

const MixedVariableAnimation = ({ isPlaying = false, onComplete = () => {} }) => {
  
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const animationStateRef = useRef({
    startTime: 0,
    currentTime: 0,
    totalDuration: 7500, // 7.5 seconds - 与render函数中的TOTAL_DURATION一致
    isRunning: false,
    hasInternallyCompleted: false // 内部完成标记，避免异步状态问题
  })
  
  // 跟踪动画是否已完成过（用于区分初始状态和结束状态）
  const [hasCompletedAnimation, setHasCompletedAnimation] = useState(false)
  
  // 简单直接的完成状态跟踪
  const [animationCompleted, setAnimationCompleted] = useState(false)

  // 画布与坐标系统
  const WORLD_WIDTH = 24
  const WORLD_HEIGHT = 16
  const CANVAS_PADDING = 0.06 // 6% padding
  const SCALE_FACTOR = 0.81 // 整体缩放因子 (0.9 * 0.9 = 0.81)
  const VERTICAL_OFFSET = -15 // 上移15px

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
  // 根据MATLAB代码实现真实的停车路径规划
  const generateParkingPath = () => {
    // MATLAB参数
    const Rmin = R_MIN
    const S = [2.0, 8.0]  // 起始点
    const C = [15.0, 2.6] // 目标停车位中心
    
    // 通过参数搜索找到的最优参数 (基于MATLAB结果)
    const L0 = 4.25      // 入场直线长度
    const phi1 = Math.PI * 20 / 180  // 第一个右弯角度 (20度)
    const margin = Math.PI * 8 / 180  // 左弯终角削减 (8度)
    
    // 计算中间直线长度
    const R = Rmin * 1.3  // 使用略大的转弯半径以产生变化的曲率
    const Delta = Math.PI/2 + phi1 - margin
    const Sx = S[0], Sy = S[1]
    const Lmid = (15 - Sx - L0 - R*(2*Math.sin(phi1) + Math.cos(margin))) / Math.cos(phi1)
    
    // 生成路径各段
    const segments = {
      // 段0: 直线前进
      seg0: [],
      // 段1: 右弯
      seg1: [],
      // 段2: 斜直线
      seg2: [],
      // 段3: 左弯
      seg3: [],
      // 段4: 倒车直下
      seg4: []
    }
    
    // 段0: 入场直线 (S -> S1)
    const N0 = 40
    for (let i = 0; i < N0; i++) {
      const t = i / (N0 - 1)
      segments.seg0.push({
        x: S[0] + t * L0,
        y: S[1],
        heading: 0,
        curvature: 0  // 直线段曲率为0
      })
    }
    
    // 段1: 右弯 (S1 -> S2) - 修复heading方向
    const S1 = [S[0] + L0, S[1]]
    const N1 = 140
    for (let i = 0; i < N1; i++) {
      const t = i / (N1 - 1)
      const ph = t * phi1
      // 渐变曲率：从0逐渐增加到最大值，然后逐渐减小
      const curvatureScale = Math.sin(t * Math.PI) // 正弦曲线，中间最大
      segments.seg1.push({
        x: S1[0] + R * Math.sin(ph),
        y: S1[1] - R * (1 - Math.cos(ph)),
        heading: -ph,  // 右转时heading应该为负值，车头向下
        curvature: (1.0 / R) * curvatureScale  // 渐变曲率
      })
    }
    
    // 段2: 斜直线 (S2 -> S3)
    const S2 = segments.seg1[segments.seg1.length - 1]
    const thS = -phi1
    const N2 = 220
    for (let i = 0; i < N2; i++) {
      const t = i / (N2 - 1)
      segments.seg2.push({
        x: S2.x + t * Lmid * Math.cos(thS),
        y: S2.y + t * Lmid * Math.sin(thS),
        heading: thS,
        curvature: 0  // 直线段曲率为0
      })
    }
    
    // 段3: 左弯 (S3 -> S4)
    const S3 = segments.seg2[segments.seg2.length - 1]
    const N3 = 220
    for (let i = 0; i < N3; i++) {
      const t = i / (N3 - 1)
      const psi = t * Delta
      // 渐变曲率：从0逐渐增加到最大值，然后逐渐减小
      const curvatureScale = Math.sin(t * Math.PI) // 正弦曲线，中间最大
      segments.seg3.push({
        x: S3.x + R * (Math.sin(thS + psi) - Math.sin(thS)),
        y: S3.y - R * (Math.cos(thS + psi) - Math.cos(thS)),
        heading: thS + psi,
        curvature: (1.0 / R) * curvatureScale  // 渐变曲率
      })
    }
    
    // 段4: 倒车直下 (S4 -> C)
    const S4 = segments.seg3[segments.seg3.length - 1]
    const N4 = 240
    for (let i = 0; i < N4; i++) {
      const t = i / (N4 - 1)
      segments.seg4.push({
        x: 15.0,  // 直线倒车，x恒定
        y: S4.y + (C[1] - S4.y) * t,
        heading: Math.PI / 2,  // 车头朝上
        curvature: 0  // 直线段曲率为0
      })
    }
    
    // 合并所有段落
    const allPoints = [
      ...segments.seg0,
      ...segments.seg1.slice(1), // 去掉重复点
      ...segments.seg2.slice(1),
      ...segments.seg3.slice(1),
      ...segments.seg4.slice(1)
    ]
    
    // 计算段落索引
    const forwardEndIndex = segments.seg0.length + segments.seg1.length - 1 + 
                           segments.seg2.length - 1 + segments.seg3.length - 1
    
    return {
      path: allPoints,
      forwardEndIndex: forwardEndIndex,
      segments: {
        seg0: { start: 0, length: segments.seg0.length },
        seg1: { start: segments.seg0.length, length: segments.seg1.length - 1 },
        seg2: { start: segments.seg0.length + segments.seg1.length - 1, length: segments.seg2.length - 1 },
        seg3: { start: segments.seg0.length + segments.seg1.length + segments.seg2.length - 2, length: segments.seg3.length - 1 },
        seg4: { start: forwardEndIndex, length: segments.seg4.length - 1 }
      }
    }
  }
  const PATH_SEGMENTS = generateParkingPath()

  // 颜色主题
  const COLORS = {
    background: '#111827',
    majorGrid: 'rgba(75, 85, 99, 0.7)',
    minorGrid: 'rgba(55, 65, 81, 0.4)',
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
    formulaBackground: 'rgba(15, 17, 22, 0.95)'
  }

  // 坐标系转换
  const worldToScreen = (worldX, worldY, canvasWidth, canvasHeight) => {
    const baseScale = Math.min(
      (canvasWidth * (1 - 2 * CANVAS_PADDING)) / WORLD_WIDTH,
      (canvasHeight * (1 - 2 * CANVAS_PADDING)) / WORLD_HEIGHT
    )
    const scale = baseScale * SCALE_FACTOR
    const scaledWorldWidth = WORLD_WIDTH * scale
    const scaledWorldHeight = WORLD_HEIGHT * scale
    const offsetX = (canvasWidth - scaledWorldWidth) / 2
    const offsetY = (canvasHeight - scaledWorldHeight) / 2 + VERTICAL_OFFSET
    
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
    
    // 定义已占用的车位和随机配色 (排除B5和B5上方的T5)
    const occupiedBottomSlots = [3, 6, 9, 18] // B1, B2, B3, B6 有车
    const occupiedTopSlots = [3, 6, 9, 12, 18] // T1, T2, T3, T4, T6 有车，T5空着
    
    // 为每个车位分配随机颜色方案
    const bottomSlotColors = {
      3: 'white',    // B1 - 珍珠白
      6: 'glacier',  // B2 - 冰川蓝  
      9: 'black',    // B3 - 墨玉黑
      18: 'gold',    // B6 - 香槟金
    }
    
    const topSlotColors = {
      3: 'gray',     // T1 - 钛金灰 (与B1珍珠白不同)
      6: 'gold',     // T2 - 香槟金 (与B2冰川蓝不同)
      9: 'white',    // T3 - 珍珠白 (与B3墨玉黑不同) 
      12: 'glacier', // T4 - 冰川蓝
      18: 'gray'     // T6 - 钛金灰 (与B6香槟金不同)
    }

    // 绘制下排停车位 (B1-B6)
    bottomSlots.centers.forEach((centerX, index) => {
      const isB5 = centerX === 15
      const isOccupied = occupiedBottomSlots.includes(centerX)
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
      if (isB5) {
        ctx.fillStyle = COLORS.emptySlot
      } else {
        ctx.fillStyle = isOccupied ? COLORS.occupiedSlot : COLORS.emptySlot
      }
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
      
      // 绘制占用车位中的车辆（使用不同配色方案）
      if (isOccupied && !isB5) {
        const vehiclePos = { x: centerX, y: bottomSlots.y }
        const vehicleHeading = Math.PI / 2 // 垂直停放
        const colorType = bottomSlotColors[centerX] || 'white'
        drawParkedVehicle(ctx, canvasWidth, canvasHeight, vehiclePos, vehicleHeading, colorType)
      }
    })

    // 绘制上排停车位 (T1-T6)
    topSlots.centers.forEach(centerX => {
      const isOccupied = occupiedTopSlots.includes(centerX)
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

      ctx.fillStyle = isOccupied ? COLORS.occupiedSlot : COLORS.emptySlot
      ctx.beginPath()
      ctx.moveTo(corners[0].x, corners[0].y)
      corners.forEach(corner => ctx.lineTo(corner.x, corner.y))
      ctx.closePath()
      ctx.fill()

      ctx.strokeStyle = COLORS.slotBorder
      ctx.lineWidth = 1.2
      ctx.stroke()
      
      // 绘制占用车位中的车辆（使用不同配色方案）
      if (isOccupied) {
        const vehiclePos = { x: centerX, y: topSlots.y }
        const vehicleHeading = -Math.PI / 2 // 倒向停放
        const colorType = topSlotColors[centerX] || 'gray'
        drawParkedVehicle(ctx, canvasWidth, canvasHeight, vehiclePos, vehicleHeading, colorType)
      }
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
  // 绘制真实路径（基于MATLAB算法）
  const drawRealPath = (ctx, canvasWidth, canvasHeight) => {
    if (!PATH_SEGMENTS.path || PATH_SEGMENTS.path.length === 0) return
    
    const path = PATH_SEGMENTS.path
    const forwardEndIndex = PATH_SEGMENTS.forwardEndIndex
    
    // 绘制前进路径 (蓝色实线)
    ctx.strokeStyle = COLORS.forwardPath
    ctx.lineWidth = 2.5
    ctx.setLineDash([])
    ctx.beginPath()
    
    for (let i = 0; i <= forwardEndIndex; i++) {
      const point = worldToScreen(path[i].x, path[i].y, canvasWidth, canvasHeight)
      if (i === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    }
    ctx.stroke()
    
    // 绘制倒车路径 (橙色虚线)
    if (forwardEndIndex < path.length - 1) {
      ctx.strokeStyle = COLORS.reversePath
      ctx.lineWidth = 2.5
      ctx.setLineDash([8, 4])
      ctx.beginPath()
      
      for (let i = forwardEndIndex; i < path.length; i++) {
        const point = worldToScreen(path[i].x, path[i].y, canvasWidth, canvasHeight)
        if (i === forwardEndIndex) {
          ctx.moveTo(point.x, point.y)
        } else {
          ctx.lineTo(point.x, point.y)
        }
      }
      ctx.stroke()
    }
    
    ctx.setLineDash([])
  }

  // 绘制已停放车辆（完全复制主车辆的精美绘制，仅修改配色）
  const drawParkedVehicle = (ctx, canvasWidth, canvasHeight, position, heading, colorType) => {
    const center = worldToScreen(position.x, position.y, canvasWidth, canvasHeight)
    
    ctx.save()
    ctx.translate(center.x, center.y)
    ctx.rotate(-heading) // 注意Y轴翻转，所以旋转角度取负

    const scale = center.scale
    const vehicleLength = VEHICLE.length * scale * 0.85 // 稍微缩小停放的车辆
    const vehicleWidth = VEHICLE.width * scale * 0.85

    // 根据颜色类型选择不同的车辆颜色方案
    const colorSchemes = {
      white: {  // 珍珠白
        bodyMain: '#F8FAFC',
        bodyMid: '#E2E8F0', 
        bodyDark: '#CBD5E1',
        frontMain: '#FFFFFF',
        frontMid: '#F1F5F9',
        frontDark: '#E2E8F0',
        rearMain: '#E2E8F0',
        rearMid: '#CBD5E1',
        rearDark: '#94A3B8'
      },
      glacier: {  // 冰川蓝
        bodyMain: '#0EA5E9',
        bodyMid: '#0284C7', 
        bodyDark: '#0369A1',
        frontMain: '#38BDF8',
        frontMid: '#0EA5E9',
        frontDark: '#0284C7',
        rearMain: '#0284C7',
        rearMid: '#0369A1',
        rearDark: '#075985'
      },
      gray: {  // 钛金灰
        bodyMain: '#64748B',
        bodyMid: '#475569', 
        bodyDark: '#334155',
        frontMain: '#94A3B8',
        frontMid: '#64748B',
        frontDark: '#475569',
        rearMain: '#475569',
        rearMid: '#334155',
        rearDark: '#1E293B'
      },
      black: { // 墨玉黑
        bodyMain: '#1E293B',
        bodyMid: '#0F172A', 
        bodyDark: '#020617',
        frontMain: '#334155',
        frontMid: '#1E293B',
        frontDark: '#0F172A',
        rearMain: '#0F172A',
        rearMid: '#020617',
        rearDark: '#000000'
      },
      gold: { // 香槟金
        bodyMain: '#D97706',
        bodyMid: '#B45309', 
        bodyDark: '#92400E',
        frontMain: '#F59E0B',
        frontMid: '#D97706',
        frontDark: '#B45309',
        rearMain: '#B45309',
        rearMid: '#92400E',
        rearDark: '#78350F'
      }
    }
    
    const colors = colorSchemes[colorType] || colorSchemes.white // 默认使用珍珠白

    // 阴影效果 - 为车辆添加深度
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    const shadowOffset = 2
    ctx.fillRect(-vehicleLength/2 + shadowOffset, -vehicleWidth/2 + shadowOffset, 
                vehicleLength, vehicleWidth)
    
    // 车身主体 - 渐变背景
    const frontLength = vehicleLength * 0.28  // 车头长度
    const rearLength = vehicleLength * 0.18   // 车尾长度
    const bodyLength = vehicleLength - frontLength - rearLength
    const cornerRadius = Math.min(vehicleWidth * 0.08, vehicleLength * 0.04)
    
    const bodyLeft = -vehicleLength/2 + rearLength
    const bodyRight = vehicleLength/2 - frontLength
    const bodyTop = -vehicleWidth/2
    const bodyBottom = vehicleWidth/2
    
    // 创建渐变效果
    const gradient = ctx.createLinearGradient(0, bodyTop, 0, bodyBottom)
    gradient.addColorStop(0, colors.bodyMid)  // 顶部亮一些
    gradient.addColorStop(0.3, colors.bodyMain) // 主色
    gradient.addColorStop(0.7, colors.bodyMain) // 主色
    gradient.addColorStop(1, colors.bodyDark)   // 底部暗一些
    
    ctx.fillStyle = gradient
    ctx.strokeStyle = colors.bodyDark
    ctx.lineWidth = 1.8
    
    // 车身主体路径
    ctx.beginPath()
    ctx.moveTo(bodyLeft + cornerRadius, bodyTop)
    ctx.lineTo(bodyRight - cornerRadius, bodyTop)
    ctx.quadraticCurveTo(bodyRight, bodyTop, bodyRight, bodyTop + cornerRadius)
    ctx.lineTo(bodyRight, bodyBottom - cornerRadius)
    ctx.quadraticCurveTo(bodyRight, bodyBottom, bodyRight - cornerRadius, bodyBottom)
    ctx.lineTo(bodyLeft + cornerRadius, bodyBottom)
    ctx.quadraticCurveTo(bodyLeft, bodyBottom, bodyLeft, bodyBottom - cornerRadius)
    ctx.lineTo(bodyLeft, bodyTop + cornerRadius)
    ctx.quadraticCurveTo(bodyLeft, bodyTop, bodyLeft + cornerRadius, bodyTop)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // 车顶装饰线
    ctx.strokeStyle = colors.bodyMid
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(bodyLeft + bodyLength * 0.1, bodyTop + vehicleWidth * 0.15)
    ctx.lineTo(bodyRight - bodyLength * 0.1, bodyTop + vehicleWidth * 0.15)
    ctx.stroke()
    
    // 车头 - 更立体的设计
    const frontLeft = bodyRight
    const frontRight = vehicleLength/2
    const frontTopInset = vehicleWidth * 0.12
    
    // 车头渐变
    const frontGradient = ctx.createLinearGradient(0, bodyTop + frontTopInset, 0, bodyBottom - frontTopInset)
    frontGradient.addColorStop(0, colors.frontMain)
    frontGradient.addColorStop(0.5, colors.frontMid)
    frontGradient.addColorStop(1, colors.frontDark)
    
    ctx.fillStyle = frontGradient
    ctx.strokeStyle = colors.bodyMain
    ctx.lineWidth = 1.5
    
    ctx.beginPath()
    ctx.moveTo(frontLeft, bodyTop + frontTopInset)
    ctx.lineTo(frontRight - cornerRadius * 0.7, bodyTop + frontTopInset)
    ctx.quadraticCurveTo(frontRight, bodyTop + frontTopInset, frontRight, bodyTop + frontTopInset + cornerRadius * 0.7)
    ctx.lineTo(frontRight, bodyBottom - frontTopInset - cornerRadius * 0.7)
    ctx.quadraticCurveTo(frontRight, bodyBottom - frontTopInset, frontRight - cornerRadius * 0.7, bodyBottom - frontTopInset)
    ctx.lineTo(frontLeft, bodyBottom - frontTopInset)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // 车头格栅
    ctx.strokeStyle = colors.bodyDark
    ctx.lineWidth = 1.2
    const grillY = bodyTop + frontTopInset + vehicleWidth * 0.2
    const grillHeight = vehicleWidth * 0.15
    const grillLeft = frontLeft + frontLength * 0.1
    const grillRight = frontRight - frontLength * 0.2
    
    ctx.beginPath()
    ctx.rect(grillLeft, grillY, grillRight - grillLeft, grillHeight)
    ctx.stroke()
    
    // 格栅横线
    for (let i = 1; i < 4; i++) {
      const y = grillY + (grillHeight * i / 4)
      ctx.beginPath()
      ctx.moveTo(grillLeft + 1, y)
      ctx.lineTo(grillRight - 1, y)
      ctx.stroke()
    }
    
    // 车尾 - 更立体的设计
    const rearLeft = -vehicleLength/2
    const rearRight = bodyLeft
    const rearTopInset = vehicleWidth * 0.08
    
    const rearGradient = ctx.createLinearGradient(0, bodyTop + rearTopInset, 0, bodyBottom - rearTopInset)
    rearGradient.addColorStop(0, colors.rearMain)
    rearGradient.addColorStop(0.5, colors.rearMid)
    rearGradient.addColorStop(1, colors.rearDark)
    
    ctx.fillStyle = rearGradient
    ctx.strokeStyle = colors.rearDark
    ctx.lineWidth = 1.5
    
    ctx.beginPath()
    ctx.moveTo(rearLeft + cornerRadius * 0.7, bodyTop + rearTopInset)
    ctx.lineTo(rearRight, bodyTop + rearTopInset)
    ctx.lineTo(rearRight, bodyBottom - rearTopInset)
    ctx.lineTo(rearLeft + cornerRadius * 0.7, bodyBottom - rearTopInset)
    ctx.quadraticCurveTo(rearLeft, bodyBottom - rearTopInset, rearLeft, bodyBottom - rearTopInset - cornerRadius * 0.7)
    ctx.lineTo(rearLeft, bodyTop + rearTopInset + cornerRadius * 0.7)
    ctx.quadraticCurveTo(rearLeft, bodyTop + rearTopInset, rearLeft + cornerRadius * 0.7, bodyTop + rearTopInset)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // A柱和C柱（车门框架）
    ctx.fillStyle = colors.bodyDark
    ctx.lineWidth = 1
    const pillarWidth = vehicleWidth * 0.08
    
    // A柱（前门柱）
    ctx.fillRect(bodyLeft + bodyLength * 0.15, bodyTop + vehicleWidth * 0.1, 
                pillarWidth, vehicleWidth * 0.8)
    // B柱（中门柱）                
    ctx.fillRect(bodyLeft + bodyLength * 0.5, bodyTop + vehicleWidth * 0.1, 
                pillarWidth, vehicleWidth * 0.8)
    // C柱（后门柱）
    ctx.fillRect(bodyRight - bodyLength * 0.15 - pillarWidth, bodyTop + vehicleWidth * 0.1, 
                pillarWidth, vehicleWidth * 0.8)
    
    // 车窗 - 深蓝色玻璃效果
    const windowGradient = ctx.createLinearGradient(0, bodyTop, 0, bodyBottom)
    windowGradient.addColorStop(0, '#1E3A8A')
    windowGradient.addColorStop(0.3, '#3B82F6')
    windowGradient.addColorStop(0.7, '#1E40AF')
    windowGradient.addColorStop(1, '#1E3A8A')
    
    ctx.fillStyle = windowGradient
    ctx.strokeStyle = '#1E40AF'
    ctx.lineWidth = 1
    
    const windowInset = vehicleWidth * 0.12
    const windowHeight = vehicleWidth - 2 * windowInset
    
    // 前窗
    const frontWindowLeft = bodyLeft + bodyLength * 0.05
    const frontWindowWidth = bodyLength * 0.15 - pillarWidth
    ctx.fillRect(frontWindowLeft, bodyTop + windowInset, frontWindowWidth, windowHeight)
    ctx.strokeRect(frontWindowLeft, bodyTop + windowInset, frontWindowWidth, windowHeight)
    
    // 中窗（主窗）
    const mainWindowLeft = bodyLeft + bodyLength * 0.15 + pillarWidth
    const mainWindowWidth = bodyLength * 0.35 - pillarWidth
    ctx.fillRect(mainWindowLeft, bodyTop + windowInset, mainWindowWidth, windowHeight)
    ctx.strokeRect(mainWindowLeft, bodyTop + windowInset, mainWindowWidth, windowHeight)
    
    // 后窗
    const rearWindowLeft = bodyLeft + bodyLength * 0.5 + pillarWidth
    const rearWindowWidth = bodyLength * 0.35 - pillarWidth
    ctx.fillRect(rearWindowLeft, bodyTop + windowInset, rearWindowWidth, windowHeight)
    ctx.strokeRect(rearWindowLeft, bodyTop + windowInset, rearWindowWidth, windowHeight)
    
    // 窗户反光效果
    ctx.fillStyle = 'rgba(147, 197, 253, 0.3)'
    ctx.fillRect(frontWindowLeft + frontWindowWidth * 0.1, bodyTop + windowInset + windowHeight * 0.1,
                frontWindowWidth * 0.8, windowHeight * 0.15)
    ctx.fillRect(mainWindowLeft + mainWindowWidth * 0.1, bodyTop + windowInset + windowHeight * 0.1,
                mainWindowWidth * 0.8, windowHeight * 0.15)
    ctx.fillRect(rearWindowLeft + rearWindowWidth * 0.1, bodyTop + windowInset + windowHeight * 0.1,
                rearWindowWidth * 0.8, windowHeight * 0.15)
    
    // LED前大灯组 - 现代化设计
    const headlightSize = vehicleWidth * 0.1
    const headlightY1 = -vehicleWidth/2 + vehicleWidth * 0.22
    const headlightY2 = vehicleWidth/2 - vehicleWidth * 0.22
    const headlightX = frontRight - headlightSize * 0.6
    
    // 大灯外壳
    ctx.fillStyle = '#E5E7EB'
    ctx.strokeStyle = '#9CA3AF'
    ctx.lineWidth = 1
    
    // 左前大灯外壳
    ctx.beginPath()
    ctx.arc(headlightX, headlightY1, headlightSize * 0.6, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    
    // 右前大灯外壳
    ctx.beginPath()
    ctx.arc(headlightX, headlightY2, headlightSize * 0.6, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    
    // LED灯珠
    ctx.fillStyle = '#F9FAFB'
    ctx.strokeStyle = '#F3F4F6'
    ctx.lineWidth = 0.5
    
    // 左LED
    ctx.beginPath()
    ctx.arc(headlightX, headlightY1, headlightSize * 0.3, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    
    // 右LED
    ctx.beginPath()
    ctx.arc(headlightX, headlightY2, headlightSize * 0.3, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    
    // LED光晕效果
    const ledGradient = ctx.createRadialGradient(headlightX, headlightY1, 0, headlightX, headlightY1, headlightSize * 0.8)
    ledGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
    ledGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)')
    ledGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    
    ctx.fillStyle = ledGradient
    ctx.beginPath()
    ctx.arc(headlightX, headlightY1, headlightSize * 0.8, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.beginPath()
    ctx.arc(headlightX, headlightY2, headlightSize * 0.8, 0, Math.PI * 2)
    ctx.fill()
    
    // 现代化LED尾灯组
    const taillightWidth = vehicleWidth * 0.15
    const taillightHeight = vehicleWidth * 0.06
    const taillightY1 = -vehicleWidth/2 + vehicleWidth * 0.2
    const taillightY2 = vehicleWidth/2 - vehicleWidth * 0.26
    const taillightX = rearLeft + rearLength * 0.3
    
    // 尾灯外壳
    ctx.fillStyle = colors.rearDark
    ctx.strokeStyle = colors.rearDark
    ctx.lineWidth = 1
    
    // 左尾灯组
    ctx.fillRect(taillightX - taillightWidth/2, taillightY1 - taillightHeight/2, 
                taillightWidth, taillightHeight)
    ctx.strokeRect(taillightX - taillightWidth/2, taillightY1 - taillightHeight/2, 
                  taillightWidth, taillightHeight)
    
    // 右尾灯组
    ctx.fillRect(taillightX - taillightWidth/2, taillightY2 - taillightHeight/2, 
                taillightWidth, taillightHeight)
    ctx.strokeRect(taillightX - taillightWidth/2, taillightY2 - taillightHeight/2, 
                  taillightWidth, taillightHeight)
    
    // LED尾灯
    ctx.fillStyle = '#F97316'
    ctx.strokeStyle = '#EA580C'
    ctx.lineWidth = 0.5
    
    const ledSpacing = taillightWidth / 4
    for (let i = 0; i < 3; i++) {
      const ledX = taillightX - taillightWidth/2 + ledSpacing/2 + i * ledSpacing
      const ledSize = taillightHeight * 0.6
      
      // 上尾灯LED
      ctx.beginPath()
      ctx.arc(ledX, taillightY1, ledSize/2, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      
      // 下尾灯LED  
      ctx.beginPath()
      ctx.arc(ledX, taillightY2, ledSize/2, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }
    
    // 车身高光和装饰条
    ctx.fillStyle = `rgba(255, 255, 255, 0.2)`
    const highlightHeight = vehicleWidth * 0.12
    ctx.fillRect(bodyLeft + bodyLength * 0.1, bodyTop, 
                bodyLength * 0.8, highlightHeight)
    
    // 侧装饰条
    ctx.fillStyle = colors.bodyMid
    const sideStripeY = (bodyTop + bodyBottom) / 2
    ctx.fillRect(bodyLeft, sideStripeY - 1, bodyLength, 2)
    
    // 精细车轮设计
    const wheelRadius = vehicleWidth * 0.09
    const tireWidth = wheelRadius * 0.3
    const wheelOffsetX = vehicleLength * 0.28
    const wheelOffsetY = vehicleWidth * 0.38
    
    // 轮胎绘制函数
    const drawWheel = (x, y) => {
      // 轮胎外圈
      ctx.fillStyle = '#111827'
      ctx.strokeStyle = '#1F2937'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.arc(x, y, wheelRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      
      // 轮毂
      ctx.fillStyle = '#6B7280'
      ctx.strokeStyle = '#4B5563'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(x, y, wheelRadius * 0.7, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      
      // 轮毂辐条
      ctx.strokeStyle = '#374151'
      ctx.lineWidth = 1.5
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + Math.cos(angle) * wheelRadius * 0.6, 
                  y + Math.sin(angle) * wheelRadius * 0.6)
        ctx.stroke()
      }
      
      // 轮毂中心
      ctx.fillStyle = '#1F2937'
      ctx.beginPath()
      ctx.arc(x, y, wheelRadius * 0.25, 0, Math.PI * 2)
      ctx.fill()
      
      // 轮胎花纹
      ctx.strokeStyle = '#374151'
      ctx.lineWidth = 0.8
      const treadLines = 12
      for (let i = 0; i < treadLines; i++) {
        const angle = (i * Math.PI * 2) / treadLines
        const innerR = wheelRadius * 0.85
        const outerR = wheelRadius * 0.95
        ctx.beginPath()
        ctx.moveTo(x + Math.cos(angle) * innerR, y + Math.sin(angle) * innerR)
        ctx.lineTo(x + Math.cos(angle) * outerR, y + Math.sin(angle) * outerR)
        ctx.stroke()
      }
    }
    
    // 绘制四个车轮
    drawWheel(wheelOffsetX, -wheelOffsetY)   // 前左
    drawWheel(wheelOffsetX, wheelOffsetY)    // 前右
    drawWheel(-wheelOffsetX, -wheelOffsetY)  // 后左
    drawWheel(-wheelOffsetX, wheelOffsetY)   // 后右

    ctx.restore()
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

    // 绘制更精致的车辆外形
    const frontLength = vehicleLength * 0.28  // 车头长度
    const rearLength = vehicleLength * 0.18   // 车尾长度
    const bodyLength = vehicleLength - frontLength - rearLength
    const cornerRadius = Math.min(vehicleWidth * 0.08, vehicleLength * 0.04)
    
    // 阴影效果 - 为车辆添加深度
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    const shadowOffset = 2
    ctx.fillRect(-vehicleLength/2 + shadowOffset, -vehicleWidth/2 + shadowOffset, 
                vehicleLength, vehicleWidth)
    
    // 车身主体 - 渐变背景
    const bodyLeft = -vehicleLength/2 + rearLength
    const bodyRight = vehicleLength/2 - frontLength
    const bodyTop = -vehicleWidth/2
    const bodyBottom = vehicleWidth/2
    
    // 创建渐变效果
    const gradient = ctx.createLinearGradient(0, bodyTop, 0, bodyBottom)
    gradient.addColorStop(0, '#4B5563')  // 顶部亮一些
    gradient.addColorStop(0.3, '#374151') // 主色
    gradient.addColorStop(0.7, '#374151') // 主色
    gradient.addColorStop(1, '#1F2937')   // 底部暗一些
    
    ctx.fillStyle = gradient
    ctx.strokeStyle = '#1F2937'
    ctx.lineWidth = 1.8
    
    // 车身主体路径
    ctx.beginPath()
    ctx.moveTo(bodyLeft + cornerRadius, bodyTop)
    ctx.lineTo(bodyRight - cornerRadius, bodyTop)
    ctx.quadraticCurveTo(bodyRight, bodyTop, bodyRight, bodyTop + cornerRadius)
    ctx.lineTo(bodyRight, bodyBottom - cornerRadius)
    ctx.quadraticCurveTo(bodyRight, bodyBottom, bodyRight - cornerRadius, bodyBottom)
    ctx.lineTo(bodyLeft + cornerRadius, bodyBottom)
    ctx.quadraticCurveTo(bodyLeft, bodyBottom, bodyLeft, bodyBottom - cornerRadius)
    ctx.lineTo(bodyLeft, bodyTop + cornerRadius)
    ctx.quadraticCurveTo(bodyLeft, bodyTop, bodyLeft + cornerRadius, bodyTop)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // 车顶装饰线
    ctx.strokeStyle = '#6B7280'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(bodyLeft + bodyLength * 0.1, bodyTop + vehicleWidth * 0.15)
    ctx.lineTo(bodyRight - bodyLength * 0.1, bodyTop + vehicleWidth * 0.15)
    ctx.stroke()
    
    // 车头 - 更立体的设计
    const frontLeft = bodyRight
    const frontRight = vehicleLength/2
    const frontTopInset = vehicleWidth * 0.12
    
    // 车头渐变
    const frontGradient = ctx.createLinearGradient(0, bodyTop + frontTopInset, 0, bodyBottom - frontTopInset)
    frontGradient.addColorStop(0, '#9CA3AF')
    frontGradient.addColorStop(0.5, '#6B7280')
    frontGradient.addColorStop(1, '#4B5563')
    
    ctx.fillStyle = frontGradient
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 1.5
    
    ctx.beginPath()
    ctx.moveTo(frontLeft, bodyTop + frontTopInset)
    ctx.lineTo(frontRight - cornerRadius * 0.7, bodyTop + frontTopInset)
    ctx.quadraticCurveTo(frontRight, bodyTop + frontTopInset, frontRight, bodyTop + frontTopInset + cornerRadius * 0.7)
    ctx.lineTo(frontRight, bodyBottom - frontTopInset - cornerRadius * 0.7)
    ctx.quadraticCurveTo(frontRight, bodyBottom - frontTopInset, frontRight - cornerRadius * 0.7, bodyBottom - frontTopInset)
    ctx.lineTo(frontLeft, bodyBottom - frontTopInset)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // 车头格栅
    ctx.strokeStyle = '#1F2937'
    ctx.lineWidth = 1.2
    const grillY = bodyTop + frontTopInset + vehicleWidth * 0.2
    const grillHeight = vehicleWidth * 0.15
    const grillLeft = frontLeft + frontLength * 0.1
    const grillRight = frontRight - frontLength * 0.2
    
    ctx.beginPath()
    ctx.rect(grillLeft, grillY, grillRight - grillLeft, grillHeight)
    ctx.stroke()
    
    // 格栅横线
    for (let i = 1; i < 4; i++) {
      const y = grillY + (grillHeight * i / 4)
      ctx.beginPath()
      ctx.moveTo(grillLeft + 1, y)
      ctx.lineTo(grillRight - 1, y)
      ctx.stroke()
    }
    
    // 车尾 - 更立体的设计
    const rearLeft = -vehicleLength/2
    const rearRight = bodyLeft
    const rearTopInset = vehicleWidth * 0.08
    
    const rearGradient = ctx.createLinearGradient(0, bodyTop + rearTopInset, 0, bodyBottom - rearTopInset)
    rearGradient.addColorStop(0, '#374151')
    rearGradient.addColorStop(0.5, '#1F2937')
    rearGradient.addColorStop(1, '#111827')
    
    ctx.fillStyle = rearGradient
    ctx.strokeStyle = '#111827'
    ctx.lineWidth = 1.5
    
    ctx.beginPath()
    ctx.moveTo(rearLeft + cornerRadius * 0.7, bodyTop + rearTopInset)
    ctx.lineTo(rearRight, bodyTop + rearTopInset)
    ctx.lineTo(rearRight, bodyBottom - rearTopInset)
    ctx.lineTo(rearLeft + cornerRadius * 0.7, bodyBottom - rearTopInset)
    ctx.quadraticCurveTo(rearLeft, bodyBottom - rearTopInset, rearLeft, bodyBottom - rearTopInset - cornerRadius * 0.7)
    ctx.lineTo(rearLeft, bodyTop + rearTopInset + cornerRadius * 0.7)
    ctx.quadraticCurveTo(rearLeft, bodyTop + rearTopInset, rearLeft + cornerRadius * 0.7, bodyTop + rearTopInset)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // A柱和C柱（车门框架）
    ctx.fillStyle = '#1F2937'
    ctx.lineWidth = 1
    const pillarWidth = vehicleWidth * 0.08
    
    // A柱（前门柱）
    ctx.fillRect(bodyLeft + bodyLength * 0.15, bodyTop + vehicleWidth * 0.1, 
                pillarWidth, vehicleWidth * 0.8)
    // B柱（中门柱）                
    ctx.fillRect(bodyLeft + bodyLength * 0.5, bodyTop + vehicleWidth * 0.1, 
                pillarWidth, vehicleWidth * 0.8)
    // C柱（后门柱）
    ctx.fillRect(bodyRight - bodyLength * 0.15 - pillarWidth, bodyTop + vehicleWidth * 0.1, 
                pillarWidth, vehicleWidth * 0.8)
    
    // 车窗 - 深蓝色玻璃效果
    const windowGradient = ctx.createLinearGradient(0, bodyTop, 0, bodyBottom)
    windowGradient.addColorStop(0, '#1E3A8A')
    windowGradient.addColorStop(0.3, '#3B82F6')
    windowGradient.addColorStop(0.7, '#1E40AF')
    windowGradient.addColorStop(1, '#1E3A8A')
    
    ctx.fillStyle = windowGradient
    ctx.strokeStyle = '#1E40AF'
    ctx.lineWidth = 1
    
    const windowInset = vehicleWidth * 0.12
    const windowHeight = vehicleWidth - 2 * windowInset
    
    // 前窗
    const frontWindowLeft = bodyLeft + bodyLength * 0.05
    const frontWindowWidth = bodyLength * 0.15 - pillarWidth
    ctx.fillRect(frontWindowLeft, bodyTop + windowInset, frontWindowWidth, windowHeight)
    ctx.strokeRect(frontWindowLeft, bodyTop + windowInset, frontWindowWidth, windowHeight)
    
    // 中窗（主窗）
    const mainWindowLeft = bodyLeft + bodyLength * 0.15 + pillarWidth
    const mainWindowWidth = bodyLength * 0.35 - pillarWidth
    ctx.fillRect(mainWindowLeft, bodyTop + windowInset, mainWindowWidth, windowHeight)
    ctx.strokeRect(mainWindowLeft, bodyTop + windowInset, mainWindowWidth, windowHeight)
    
    // 后窗
    const rearWindowLeft = bodyLeft + bodyLength * 0.5 + pillarWidth
    const rearWindowWidth = bodyLength * 0.35 - pillarWidth
    ctx.fillRect(rearWindowLeft, bodyTop + windowInset, rearWindowWidth, windowHeight)
    ctx.strokeRect(rearWindowLeft, bodyTop + windowInset, rearWindowWidth, windowHeight)
    
    // 窗户反光效果
    ctx.fillStyle = 'rgba(147, 197, 253, 0.3)'
    ctx.fillRect(frontWindowLeft + frontWindowWidth * 0.1, bodyTop + windowInset + windowHeight * 0.1,
                frontWindowWidth * 0.8, windowHeight * 0.15)
    ctx.fillRect(mainWindowLeft + mainWindowWidth * 0.1, bodyTop + windowInset + windowHeight * 0.1,
                mainWindowWidth * 0.8, windowHeight * 0.15)
    ctx.fillRect(rearWindowLeft + rearWindowWidth * 0.1, bodyTop + windowInset + windowHeight * 0.1,
                rearWindowWidth * 0.8, windowHeight * 0.15)
    
    // LED前大灯组 - 现代化设计
    const headlightSize = vehicleWidth * 0.1
    const headlightY1 = -vehicleWidth/2 + vehicleWidth * 0.22
    const headlightY2 = vehicleWidth/2 - vehicleWidth * 0.22
    const headlightX = frontRight - headlightSize * 0.6
    
    // 大灯外壳
    ctx.fillStyle = '#E5E7EB'
    ctx.strokeStyle = '#9CA3AF'
    ctx.lineWidth = 1
    
    // 左前大灯外壳
    ctx.beginPath()
    ctx.arc(headlightX, headlightY1, headlightSize * 0.6, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    
    // 右前大灯外壳
    ctx.beginPath()
    ctx.arc(headlightX, headlightY2, headlightSize * 0.6, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    
    // LED灯珠
    ctx.fillStyle = '#F9FAFB'
    ctx.strokeStyle = '#F3F4F6'
    ctx.lineWidth = 0.5
    
    // 左LED
    ctx.beginPath()
    ctx.arc(headlightX, headlightY1, headlightSize * 0.3, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    
    // 右LED
    ctx.beginPath()
    ctx.arc(headlightX, headlightY2, headlightSize * 0.3, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    
    // LED光晕效果
    const ledGradient = ctx.createRadialGradient(headlightX, headlightY1, 0, headlightX, headlightY1, headlightSize * 0.8)
    ledGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
    ledGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)')
    ledGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    
    ctx.fillStyle = ledGradient
    ctx.beginPath()
    ctx.arc(headlightX, headlightY1, headlightSize * 0.8, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.beginPath()
    ctx.arc(headlightX, headlightY2, headlightSize * 0.8, 0, Math.PI * 2)
    ctx.fill()
    
    // 现代化LED尾灯组
    const taillightWidth = vehicleWidth * 0.15
    const taillightHeight = vehicleWidth * 0.06
    const taillightY1 = -vehicleWidth/2 + vehicleWidth * 0.2
    const taillightY2 = vehicleWidth/2 - vehicleWidth * 0.26
    const taillightX = rearLeft + rearLength * 0.3
    
    // 尾灯外壳
    ctx.fillStyle = '#1F2937'
    ctx.strokeStyle = '#111827'
    ctx.lineWidth = 1
    
    // 左尾灯组
    ctx.fillRect(taillightX - taillightWidth/2, taillightY1 - taillightHeight/2, 
                taillightWidth, taillightHeight)
    ctx.strokeRect(taillightX - taillightWidth/2, taillightY1 - taillightHeight/2, 
                  taillightWidth, taillightHeight)
    
    // 右尾灯组
    ctx.fillRect(taillightX - taillightWidth/2, taillightY2 - taillightHeight/2, 
                taillightWidth, taillightHeight)
    ctx.strokeRect(taillightX - taillightWidth/2, taillightY2 - taillightHeight/2, 
                  taillightWidth, taillightHeight)
    
    // LED尾灯
    ctx.fillStyle = '#F97316'
    ctx.strokeStyle = '#EA580C'
    ctx.lineWidth = 0.5
    
    const ledSpacing = taillightWidth / 4
    for (let i = 0; i < 3; i++) {
      const ledX = taillightX - taillightWidth/2 + ledSpacing/2 + i * ledSpacing
      const ledSize = taillightHeight * 0.6
      
      // 上尾灯LED
      ctx.beginPath()
      ctx.arc(ledX, taillightY1, ledSize/2, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      
      // 下尾灯LED  
      ctx.beginPath()
      ctx.arc(ledX, taillightY2, ledSize/2, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }
    
    // 车身高光和装饰条
    ctx.fillStyle = 'rgba(156, 163, 175, 0.4)'
    const highlightHeight = vehicleWidth * 0.12
    ctx.fillRect(bodyLeft + bodyLength * 0.1, bodyTop, 
                bodyLength * 0.8, highlightHeight)
    
    // 侧装饰条
    ctx.fillStyle = 'rgba(107, 114, 128, 0.6)'
    const sideStripeY = (bodyTop + bodyBottom) / 2
    ctx.fillRect(bodyLeft, sideStripeY - 1, bodyLength, 2)
    
    // 精细车轮设计
    const wheelRadius = vehicleWidth * 0.09
    const tireWidth = wheelRadius * 0.3
    const wheelOffsetX = vehicleLength * 0.28
    const wheelOffsetY = vehicleWidth * 0.38
    
    // 轮胎绘制函数
    const drawWheel = (x, y) => {
      // 轮胎外圈
      ctx.fillStyle = '#111827'
      ctx.strokeStyle = '#1F2937'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.arc(x, y, wheelRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      
      // 轮毂
      ctx.fillStyle = '#6B7280'
      ctx.strokeStyle = '#4B5563'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(x, y, wheelRadius * 0.7, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      
      // 轮毂辐条
      ctx.strokeStyle = '#374151'
      ctx.lineWidth = 1.5
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + Math.cos(angle) * wheelRadius * 0.6, 
                  y + Math.sin(angle) * wheelRadius * 0.6)
        ctx.stroke()
      }
      
      // 轮毂中心
      ctx.fillStyle = '#1F2937'
      ctx.beginPath()
      ctx.arc(x, y, wheelRadius * 0.25, 0, Math.PI * 2)
      ctx.fill()
      
      // 轮胎花纹
      ctx.strokeStyle = '#374151'
      ctx.lineWidth = 0.8
      const treadLines = 12
      for (let i = 0; i < treadLines; i++) {
        const angle = (i * Math.PI * 2) / treadLines
        const innerR = wheelRadius * 0.85
        const outerR = wheelRadius * 0.95
        ctx.beginPath()
        ctx.moveTo(x + Math.cos(angle) * innerR, y + Math.sin(angle) * innerR)
        ctx.lineTo(x + Math.cos(angle) * outerR, y + Math.sin(angle) * outerR)
        ctx.stroke()
      }
    }
    
    // 绘制四个车轮
    drawWheel(wheelOffsetX, -wheelOffsetY)   // 前左
    drawWheel(wheelOffsetX, wheelOffsetY)    // 前右
    drawWheel(-wheelOffsetX, -wheelOffsetY)  // 后左
    drawWheel(-wheelOffsetX, wheelOffsetY)   // 后右
    
    // 方向指示箭头（在车顶中央）
    ctx.strokeStyle = '#10B981'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    const arrowLength = vehicleLength * 0.15
    const arrowX = vehicleLength * 0.1
    ctx.moveTo(arrowX - arrowLength/2, 0)
    ctx.lineTo(arrowX + arrowLength/2, 0)
    ctx.moveTo(arrowX + arrowLength/2 - 4, -3)
    ctx.lineTo(arrowX + arrowLength/2, 0)
    ctx.lineTo(arrowX + arrowLength/2 - 4, 3)
    ctx.stroke()

    ctx.restore()
  }

  // 绘制公式牌 - 移动到底部左侧
  const drawFormulaCard = (ctx, canvasWidth, canvasHeight) => {
    const padding = 16
    const cardWidth = 300
    const cardHeight = 140
    const borderRadius = 8
    const topMargin = -10  // 增加与动画区域的间隙
    const leftMargin = 100

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

    // 公式编辑器风格的数学表达式渲染函数
    const renderMathExpression = (ctx, x, y, parts) => {
      let currentX = x
      parts.forEach(part => {
        ctx.font = part.font
        ctx.fillStyle = part.color
        if (part.type === 'subscript') {
          ctx.fillText(part.text, currentX, y + 5)
          currentX += ctx.measureText(part.text).width
        } else if (part.type === 'superscript') {
          ctx.fillText(part.text, currentX, y - 4)
          currentX += ctx.measureText(part.text).width
        } else {
          ctx.fillText(part.text, currentX, y)
          currentX += ctx.measureText(part.text).width
        }
      })
      return currentX
    }

    // 计算垂直居中的起始位置
    const lineHeight = 26
    const totalLines = 5
    const contentHeight = totalLines * lineHeight - lineHeight * 0.2
    const startY = cardY + (cardHeight - contentHeight) / 2

    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic' // 使用基线对齐获得更好的数学公式效果

    // 离散变量行
    ctx.font = 'bold 14px "Microsoft YaHei", sans-serif'
    ctx.fillStyle = '#4299E1'
    ctx.fillText('离散：', cardX + 16, startY + 14) // 调整基线位置
    
    ctx.font = '13px "Microsoft YaHei", sans-serif'
    ctx.fillStyle = '#9CA3AF'
    ctx.fillText('车位选择 ', cardX + 80, startY + 14)
    
    // z_i ∈ {0,1}, ∑z_i = 1 公式
    const discreteFormula = [
      { text: 'z', font: '15px "Times New Roman", serif', color: '#9CA3AF', type: 'normal' },
      { text: 'i', font: '12px "Times New Roman", serif', color: '#9CA3AF', type: 'subscript' },
      { text: ' ∈ {0,1}, ', font: '15px "Times New Roman", serif', color: '#9CA3AF', type: 'normal' },
      { text: '∑', font: '18px "Times New Roman", serif', color: '#9CA3AF', type: 'normal' },
      { text: 'z', font: '15px "Times New Roman", serif', color: '#9CA3AF', type: 'normal' },
      { text: 'i', font: '12px "Times New Roman", serif', color: '#9CA3AF', type: 'subscript' },
      { text: ' = 1', font: '15px "Times New Roman", serif', color: '#9CA3AF', type: 'normal' }
    ]
    renderMathExpression(ctx, cardX + 148, startY + 14, discreteFormula)

    // 档位选择行  
    ctx.font = '13px "Microsoft YaHei", sans-serif'
    ctx.fillStyle = '#9CA3AF'
    ctx.fillText('档位选择 ', cardX + 80, startY + lineHeight + 14)
    
    const gearFormula = [
      { text: 'g', font: '15px "Times New Roman", serif', color: '#9CA3AF', type: 'normal' },
      { text: 'k', font: '12px "Times New Roman", serif', color: '#9CA3AF', type: 'subscript' },
      { text: ' ∈ {前进,倒车}', font: '13px "Microsoft YaHei", sans-serif', color: '#9CA3AF', type: 'normal' }
    ]
    renderMathExpression(ctx, cardX + 148, startY + lineHeight + 14, gearFormula)

    // 连续变量行
    ctx.font = 'bold 14px "Microsoft YaHei", sans-serif'
    ctx.fillStyle = '#4299E1'
    ctx.fillText('连续：', cardX + 16, startY + 2 * lineHeight + 14)
    
    ctx.font = '13px "Microsoft YaHei", sans-serif'
    ctx.fillStyle = '#9CA3AF'
    ctx.fillText('Bézier控制点 ', cardX + 80, startY + 2 * lineHeight + 14)
    
    const continuousFormula = [
      { text: '{P}', font: '15px "Times New Roman", serif', color: '#9CA3AF', type: 'normal' },
      { text: '、速度 ', font: '13px "Microsoft YaHei", sans-serif', color: '#9CA3AF', type: 'normal' },
      { text: 'v(t)', font: '15px "Times New Roman", serif', color: '#9CA3AF', type: 'normal' }
    ]
    renderMathExpression(ctx, cardX + 188, startY + 2 * lineHeight + 14, continuousFormula)

    // 约束条件行
    ctx.font = 'bold 14px "Microsoft YaHei", sans-serif'
    ctx.fillStyle = '#4299E1'
    ctx.fillText('约束：', cardX + 16, startY + 3 * lineHeight + 14)
    
    const constraintFormula = [
      { text: '|κ| ≤ 0.259 m', font: '15px "Times New Roman", serif', color: '#9CA3AF', type: 'normal' },
      { text: '−1', font: '12px "Times New Roman", serif', color: '#9CA3AF', type: 'superscript' },
      { text: '、安全廓+0.30m', font: '13px "Microsoft YaHei", sans-serif', color: '#9CA3AF', type: 'normal' }
    ]
    renderMathExpression(ctx, cardX + 80, startY + 3 * lineHeight + 14, constraintFormula)

    // 目标函数行
    ctx.font = 'bold 14px "Microsoft YaHei", sans-serif'
    ctx.fillStyle = '#4299E1'
    ctx.fillText('目标：', cardX + 16, startY + 4 * lineHeight + 14)
    
    ctx.font = '13px "Microsoft YaHei", sans-serif'
    ctx.fillStyle = '#9CA3AF'
    ctx.fillText('min ', cardX + 80, startY + 4 * lineHeight + 14)
    
    const objectiveFormula = [
      { text: 'T', font: '15px "Times New Roman", serif', color: '#9CA3AF', type: 'normal' },
      { text: 'total', font: '12px "Times New Roman", serif', color: '#9CA3AF', type: 'subscript' },
      { text: ' + λ·Safety', font: '15px "Times New Roman", serif', color: '#9CA3AF', type: 'normal' }
    ]
    renderMathExpression(ctx, cardX + 110, startY + 4 * lineHeight + 14, objectiveFormula)
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
    const statusWidth = 220
    const statusHeight = 140  // 与左侧卡片高度一致
    const borderRadius = 8   // 与左侧卡片圆角一致
    const topMargin = -10     // 与左侧卡片保持相同的顶部间隙
    const leftMargin = -102     // 与左侧卡片保持相同的顶部间隙
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

    // 计算垂直居中的起始位置 - 将曲率条形图视为第4行
    const lineHeight = 28
    const totalLines = 4 // 3行数据 + 1行条形图
    const contentHeight = totalLines * lineHeight - lineHeight * 0.3 // 最后一行不需要完整行间距
    const startY = statusY + (statusHeight - contentHeight) / 2

    // 数值显示 - 去掉标题，内容垂直居中
    ctx.fillStyle = '#9CA3AF' // 灰色内容文字
    ctx.font = '16px "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    const statusLines = [
      `t = ${time.toFixed(2)} s`,
      `s = ${distance.toFixed(2)} m`,
      `κ = ${Math.abs(curvature).toFixed(3)} m⁻¹`
    ]

    statusLines.forEach((line, index) => {
      ctx.fillText(line, statusX + 16, startY + index * lineHeight)
    })

    // 曲率条形图 - 作为第4行，与文字等间距
    const barWidth = 160
    const barHeight = 10
    const barX = statusX + 16
    const barY = startY + 3 * lineHeight + 8 // 稍微调整位置使其视觉上更好

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.fillRect(barX, barY, barWidth, barHeight)

    ctx.fillStyle = Math.abs(curvature) > KAPPA_MAX * 0.6 ? '#EF4444' : COLORS.forwardPath
    const fillWidth = Math.min(barWidth * (Math.abs(curvature) / KAPPA_MAX), barWidth)
    ctx.fillRect(barX, barY, fillWidth, barHeight)
  }

  // 主渲染函数
  const render = (ctx, canvasWidth, canvasHeight, currentTime) => {

    // 清空画布
    ctx.fillStyle = COLORS.background
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // 时间节点定义 - 立即开始播放，无延迟
    const SCENE_FADE_IN = 0       // [0s] 场景立即显示  
    const SLOT_SELECTION = 0      // [0s] 车位立即选择
    const PATH_PREVIEW = 0        // [0s] 路径立即显示
    const FORWARD_START = 500     // [0.5s] 前进开始
    const FORWARD_END = 5500      // [5.5s] 前进结束，匀速5秒
    const GEAR_SHIFT = 5800       // [5.8s] 换挡完成
    const REVERSE_END = 7500      // [7.5s] 倒车结束，匀速1.7秒
    const TOTAL_DURATION = 7500   // [7.5s] 停车后立即结束

    // 根据时间阶段渲染
    if (currentTime >= 0) {
      // 基础场景
      drawGrid(ctx, canvasWidth, canvasHeight)
      drawLanes(ctx, canvasWidth, canvasHeight)
      
      // 停车位高亮
      const highlightB5 = currentTime >= SLOT_SELECTION
      drawParkingSlots(ctx, canvasWidth, canvasHeight, highlightB5)
    }

    // 公式牌 - 立即显示
    drawFormulaCard(ctx, canvasWidth, canvasHeight)

    // 绘制真实路径 - 立即显示
    drawRealPath(ctx, canvasWidth, canvasHeight)

    // 车辆动画 - 使用真实路径数据
    let vehiclePos = START_POS
    let vehicleHeading = START_POS.heading
    let isForward = true
    let animTime = 0
    let distance = 0
    let curvature = 0
    let currentSegment = ''

    if (PATH_SEGMENTS.path && PATH_SEGMENTS.path.length > 0) {
      const path = PATH_SEGMENTS.path
      const forwardEndIndex = PATH_SEGMENTS.forwardEndIndex

      if (currentTime >= FORWARD_START && currentTime <= FORWARD_END) {
        // 前进阶段 - 使用平滑插值实现匀速运动
        const progress = (currentTime - FORWARD_START) / (FORWARD_END - FORWARD_START)
        
        // 使用平滑的路径插值，而不是简单的线性索引
        const exactIndex = progress * (forwardEndIndex - 1)
        const floorIndex = Math.floor(exactIndex)
        const ceilIndex = Math.min(floorIndex + 1, forwardEndIndex - 1)
        const t = exactIndex - floorIndex // 插值因子
        
        if (path[floorIndex] && path[ceilIndex]) {
          // 平滑插值位置和方向
          const pos1 = path[floorIndex]
          const pos2 = path[ceilIndex]
          
          vehiclePos = {
            x: pos1.x + (pos2.x - pos1.x) * t,
            y: pos1.y + (pos2.y - pos1.y) * t
          }
          
          // 平滑插值方向角
          let heading1 = pos1.heading
          let heading2 = pos2.heading
          
          // 处理角度跨越问题（-π到π的跳跃）
          if (Math.abs(heading2 - heading1) > Math.PI) {
            if (heading2 > heading1) {
              heading1 += 2 * Math.PI
            } else {
              heading2 += 2 * Math.PI
            }
          }
          
          vehicleHeading = heading1 + (heading2 - heading1) * t
          if (vehicleHeading > Math.PI) vehicleHeading -= 2 * Math.PI
          if (vehicleHeading < -Math.PI) vehicleHeading += 2 * Math.PI
          
          // 平滑插值曲率
          const curv1 = pos1.curvature || 0
          const curv2 = pos2.curvature || 0
          curvature = curv1 + (curv2 - curv1) * t
          
          // 计算当前所在段落
          const segments = PATH_SEGMENTS.segments
          const currentIndex = Math.round(exactIndex)
          if (currentIndex < segments.seg0.start + segments.seg0.length) {
            currentSegment = '直线前进'
          } else if (currentIndex < segments.seg1.start + segments.seg1.length) {
            currentSegment = '右弯'
          } else if (currentIndex < segments.seg2.start + segments.seg2.length) {
            currentSegment = '斜线'
          } else {
            currentSegment = '左弯'
          }
        }
        
        animTime = (currentTime / 1000) * 10 // 模拟真实时间：动画7.5秒对应75秒
        distance = progress * 15 // 前进阶段的累积距离
        isForward = true

      } else if (currentTime > FORWARD_END && currentTime < GEAR_SHIFT) {
        // 换挡阶段 - 保持在前进结束位置
        const lastForwardIndex = Math.min(forwardEndIndex - 1, path.length - 1)
        if (path[lastForwardIndex]) {
          vehiclePos = { x: path[lastForwardIndex].x, y: path[lastForwardIndex].y }
          vehicleHeading = path[lastForwardIndex].heading
        }
        
        animTime = (currentTime / 1000) * 10 // 模拟真实时间：动画7.5秒对应75秒
        distance = 15 // 前进阶段完成的距离
        curvature = 0
        currentSegment = '换挡中'
        isForward = false

      } else if (currentTime >= GEAR_SHIFT && currentTime <= REVERSE_END) {
        // 倒车阶段 - 使用平滑插值实现匀速运动
        isForward = false
        const progress = (currentTime - GEAR_SHIFT) / (REVERSE_END - GEAR_SHIFT)
        const reversePathLength = path.length - 1 - forwardEndIndex
        
        // 使用平滑的路径插值
        const exactIndex = forwardEndIndex + progress * reversePathLength
        const floorIndex = Math.floor(exactIndex)
        const ceilIndex = Math.min(floorIndex + 1, path.length - 1)
        const t = exactIndex - floorIndex // 插值因子
        
        if (path[floorIndex] && path[ceilIndex]) {
          // 平滑插值位置
          const pos1 = path[floorIndex]
          const pos2 = path[ceilIndex]
          
          vehiclePos = {
            x: pos1.x + (pos2.x - pos1.x) * t,
            y: pos1.y + (pos2.y - pos1.y) * t
          }
          
          // 平滑插值方向角
          let heading1 = pos1.heading
          let heading2 = pos2.heading
          
          // 处理角度跨越问题
          if (Math.abs(heading2 - heading1) > Math.PI) {
            if (heading2 > heading1) {
              heading1 += 2 * Math.PI
            } else {
              heading2 += 2 * Math.PI
            }
          }
          
          vehicleHeading = heading1 + (heading2 - heading1) * t
          if (vehicleHeading > Math.PI) vehicleHeading -= 2 * Math.PI
          if (vehicleHeading < -Math.PI) vehicleHeading += 2 * Math.PI
          
          // 平滑插值曲率
          const curv1 = Math.abs(pos1.curvature || 0)
          const curv2 = Math.abs(pos2.curvature || 0)
          curvature = curv1 + (curv2 - curv1) * t
        }
        
        animTime = (currentTime / 1000) * 10 // 模拟真实时间：动画7.5秒对应75秒
        distance = 15 + progress * 7 // 前进15m + 倒车进度*7m
        currentSegment = '倒车入位'

      } else if (currentTime > REVERSE_END) {
        // 最终位置
        vehiclePos = TARGET_SLOT.center
        vehicleHeading = TARGET_SLOT.heading
        isForward = false
        animTime = 75.0 // 模拟真实停车时间75秒
        distance = 22.0 // 实际行驶总距离（前进15m + 倒车7m）
        curvature = 0 // 停车时曲率为0
        currentSegment = '停车完成'
        
        // 立即设置动画完成状态
        if (!animationCompleted) {
          setAnimationCompleted(true)
          setHasCompletedAnimation(true)
        }
      }
    }

    // 绘制车辆 - 立即显示，无淡入延迟
    drawVehicle(ctx, canvasWidth, canvasHeight, vehiclePos, vehicleHeading, true)

    // 状态指示器 - 立即显示
    drawStatusIndicators(ctx, canvasWidth, canvasHeight, isForward, animTime, distance, curvature)

    // 目标标签 - 已移除显示

    // 段落状态显示 - 显示在D/R档位右侧居中
    if (currentTime >= FORWARD_START && currentSegment) {
      const padding = 16
      const lightSize = 32
      const textX = padding + lightSize + 12  // D/R档位右侧
      const textY = padding + lightSize  // D和R之间的垂直中心位置
      
      ctx.fillStyle = COLORS.text
      ctx.font = '12px Consolas'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(`当前: ${currentSegment}`, textX, textY)
    }

  }

  // 渲染静态停车场场景
  // 初始静止场景（车辆在起始位置）
  const renderInitialScene = (ctx, canvasWidth, canvasHeight) => {
    
    // 清空画布
    ctx.fillStyle = COLORS.background
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // 渲染基础场景
    drawGrid(ctx, canvasWidth, canvasHeight)
    drawLanes(ctx, canvasWidth, canvasHeight)
    drawParkingSlots(ctx, canvasWidth, canvasHeight, true) // 高亮B5

    // 显示真实路径预览（替换旧的Bézier路径）
    drawRealPath(ctx, canvasWidth, canvasHeight)

    // 车辆在起始位置
    drawVehicle(ctx, canvasWidth, canvasHeight, START_POS, START_POS.heading, true)

    // 显示信息卡片
    drawFormulaCard(ctx, canvasWidth, canvasHeight)
    drawStatusIndicators(ctx, canvasWidth, canvasHeight, true, 0, 0, 0)

  }

  // 结束静止场景（车辆停在停车位B5）
  const renderCompletedScene = (ctx, canvasWidth, canvasHeight) => {
    
    // 清空画布
    ctx.fillStyle = COLORS.background
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // 渲染基础场景
    drawGrid(ctx, canvasWidth, canvasHeight)
    drawLanes(ctx, canvasWidth, canvasHeight)
    drawParkingSlots(ctx, canvasWidth, canvasHeight, true) // 高亮B5

    // 显示完整的真实路径（已完成的路径）
    drawRealPath(ctx, canvasWidth, canvasHeight)

    // 车辆停在B5停车位（最终位置）
    const finalPosition = { 
      x: TARGET_SLOT.center.x, 
      y: TARGET_SLOT.center.y, 
      heading: TARGET_SLOT.heading 
    }
    drawVehicle(ctx, canvasWidth, canvasHeight, finalPosition, finalPosition.heading, true)

    // 显示信息卡片，显示完成状态
    drawFormulaCard(ctx, canvasWidth, canvasHeight)
    drawStatusIndicators(ctx, canvasWidth, canvasHeight, false, 75.0, 22.0, 0) // 显示完成状态：75秒，22米，曲率0

  }

  // 根据动画状态选择渲染的场景
  const renderStaticScene = (ctx, canvasWidth, canvasHeight) => {
    
    if (animationCompleted) {
      renderCompletedScene(ctx, canvasWidth, canvasHeight)
    } else {
      renderInitialScene(ctx, canvasWidth, canvasHeight)
    }
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
      state.hasInternallyCompleted = true // 立即设置内部完成标记
      
      // 详细记录动画完成时的车辆位置信息
      
      // 先标记动画已完成，然后渲染最终场景
      setHasCompletedAnimation(true)
      
      // 立即渲染完成后的场景，确保车辆停在停车位
      setTimeout(() => {
        const canvas = canvasRef.current
        if (canvas) {
          const ctx = canvas.getContext('2d')
          
          renderCompletedScene(ctx, canvas.width, canvas.height)
          
        }
        
        onComplete()
      }, 50) // 延迟50ms确保状态更新完成
      
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
    state.hasInternallyCompleted = false // 重置内部完成标记
    
    // 重置所有完成状态
    setAnimationCompleted(false)
    setHasCompletedAnimation(false) // 关键：也要重置这个状态
    
    animate()
  }

  // 停止动画
  const stopAnimation = () => {
    const state = animationStateRef.current
    
    // 在停止前检查是否应该标记为完成
    if (state.isRunning && state.currentTime >= state.totalDuration) {
      state.hasInternallyCompleted = true
      setHasCompletedAnimation(true)
    }
    
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
      
      // 停止时延迟渲染静态场景，等待hasCompletedAnimation状态更新
      setTimeout(() => {
        const internallyCompleted = animationStateRef.current.hasInternallyCompleted
        
        
        const canvas = canvasRef.current
        if (canvas && canvas.width > 0 && canvas.height > 0) {
          const ctx = canvas.getContext('2d')
          renderStaticScene(ctx, canvas.width, canvas.height)
        }
      }, 100) // 延迟100ms等待状态更新
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