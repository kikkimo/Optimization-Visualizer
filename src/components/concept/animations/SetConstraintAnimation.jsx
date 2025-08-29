import React, { useRef, useEffect } from 'react'

const SetConstraintAnimation = ({ isPlaying = false, onComplete = () => {}, onAnimationUpdate = () => {} }) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const startTimeRef = useRef(null)
  
  // 3D交互状态
  const interactionRef = useRef({
    isDragging: false,
    lastMousePos: { x: 0, y: 0 },
    rotation: { x: 0, y: 0 }, // 当前旋转角度
    zoom: 1, // 缩放级别
    autoRotation: 0 // 自动旋转时间
  })
  

  // 动画参数
  const ANIMATION_DURATION = 14000 // 14秒总时长，与动画逻辑保持一致
  
  // 颜色定义
  const COLORS = {
    background: '#0F1116',
    gridPrimary: 'rgba(47, 54, 66, 0.7)',
    gridSecondary: 'rgba(37, 41, 51, 0.4)',
    ocean: '#1B2130',
    land: '#253043',
    pointA: '#38A169', // 起点绿色
    pointB: '#4299E1', // 终点蓝色
    euclideanLine: 'rgba(160, 174, 192, 0.4)', // 欧氏弦段
    greatCircle: '#8B5CF6', // 大圆弧紫色
    forbiddenZone: 'rgba(229, 62, 62, 0.35)', // 禁飞区红色
    forbiddenBorder: '#F56565',
    bufferZone: 'rgba(237, 137, 54, 0.15)', // 缓冲带橙色
    bufferBorder: '#ED8936',
    feasibleHighlight: 'rgba(56, 178, 172, 0.1)', // 可行域高亮
    infoBackground: 'rgba(11, 18, 32, 0.85)',
    infoText: '#E7EDF8',
    constraintTag: '#BFC9DA',
    referencePoint: '#E7EDF8'
  }

  // 地理参数
  const EARTH_RADIUS = 6371 // km
  const POINT_A = { lat: 20, lon: 10, name: 'A' } // 北纬20°, 东经10°
  const POINT_B = { lat: 25, lon: 150, name: 'B' } // 北纬25°, 东经150°
  
  // 禁飞区：球面多边形定义（初始较小）
  const FORBIDDEN_POLYGON_INITIAL = [
    { lat: 32, lon: 75 },  // 多边形顶点1
    { lat: 35, lon: 82 },  // 多边形顶点2  
    { lat: 32, lon: 88 }, // 多边形顶点3
    { lat: 28, lon: 85 },  // 多边形顶点4
    { lat: 25, lon: 80 },  // 多边形顶点5
    { lat: 28, lon: 75 }   // 多边形顶点6
  ]
  
  // 禁飞区：最终扩大后的多边形
  const FORBIDDEN_POLYGON_FINAL = [
    { lat: 45, lon: 60 },  // 扩大的多边形顶点1
    { lat: 50, lon: 85 },  // 扩大的多边形顶点2  
    { lat: 45, lon: 110 }, // 扩大的多边形顶点3
    { lat: 15, lon: 105 }, // 扩大的多边形顶点4
    { lat: 10, lon: 80 },  // 扩大的多边形顶点5
    { lat: 15, lon: 55 }   // 扩大的多边形顶点6
  ]
  
  const BUFFER_DISTANCE = 12 // 12°缓冲距离

  // 坐标转换函数
  const degToRad = (deg) => deg * Math.PI / 180
  const radToDeg = (rad) => rad * 180 / Math.PI

  // 球面坐标转3D笛卡尔坐标
  const sphericalToCartesian = (lat, lon, radius = 1) => {
    const latRad = degToRad(lat)
    const lonRad = degToRad(lon)
    return {
      x: radius * Math.cos(latRad) * Math.cos(lonRad),
      y: radius * Math.cos(latRad) * Math.sin(lonRad),
      z: radius * Math.sin(latRad)
    }
  }

  // 3D变换矩阵相关函数
  const rotateX = (point, angle) => ({
    x: point.x,
    y: point.y * Math.cos(angle) - point.z * Math.sin(angle),
    z: point.y * Math.sin(angle) + point.z * Math.cos(angle)
  })

  const rotateY = (point, angle) => ({
    x: point.x * Math.cos(angle) + point.z * Math.sin(angle),
    y: point.y,
    z: -point.x * Math.sin(angle) + point.z * Math.cos(angle)
  })

  const rotateZ = (point, angle) => ({
    x: point.x * Math.cos(angle) - point.y * Math.sin(angle),
    y: point.x * Math.sin(angle) + point.y * Math.cos(angle),
    z: point.z
  })

  // 3D到2D投影（透视投影）
  const project3D = (point, canvasWidth, canvasHeight, cameraDistance = 5) => {
    const baseScale = Math.min(canvasWidth, canvasHeight) * 0.2
    const scale = baseScale * (interactionRef.current?.zoom || 1)
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2
    
    // 透视投影
    const projectedX = (point.x * cameraDistance) / (point.z + cameraDistance)
    const projectedY = (point.y * cameraDistance) / (point.z + cameraDistance)
    
    return {
      x: centerX + projectedX * scale,
      y: centerY - projectedY * scale,
      depth: point.z // 用于深度排序
    }
  }

  // 3D球体渲染：生成球面上的点并应用旋转
  const generate3DSpherePoint = (lat, lon) => {
    // 基础球面坐标转换
    let point = sphericalToCartesian(lat, lon, 1)
    
    if (!interactionRef.current) return point
    
    if (isPlaying) {
      // 动画播放时：使用自动旋转
      const rotationY = interactionRef.current.autoRotation * 0.5
      const rotationX = Math.sin(interactionRef.current.autoRotation * 0.3) * 0.2
      
      point = rotateY(point, rotationY)
      point = rotateX(point, rotationX)
    } else {
      // 静态时：使用交互控制的旋转
      point = rotateX(point, interactionRef.current.rotation.x)
      point = rotateY(point, interactionRef.current.rotation.y)
    }
    
    return point
  }

  // 检查3D点是否在球体前面（用于隐藏背面）
  const isPointVisible = (point3D) => {
    return point3D.z > -0.8 // 阈值控制可见范围
  }

  // 兼容性：等距方位投影（保留用于旧的绘制函数）
  const azimuthalProjection = (lat, lon, canvasWidth, canvasHeight) => {
    // 简化版：直接使用3D投影的结果
    const point3D = generate3DSpherePoint(lat, lon)
    if (!isPointVisible(point3D)) {
      // 对于不可见的点，返回屏幕外的坐标
      return { x: -1000, y: -1000 }
    }
    return project3D(point3D, canvasWidth, canvasHeight)
  }

  // 计算大圆弧路径点
  const calculateGreatCirclePath = (pointA, pointB, numPoints = 100) => {
    const A = sphericalToCartesian(pointA.lat, pointA.lon)
    const B = sphericalToCartesian(pointB.lat, pointB.lon)
    
    // 计算两点间的夹角
    const dot = A.x * B.x + A.y * B.y + A.z * B.z
    const angle = Math.acos(Math.max(-1, Math.min(1, dot)))
    
    if (angle === 0) return [pointA]
    
    const points = []
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints
      const sinAngle = Math.sin(angle)
      const factor1 = Math.sin((1 - t) * angle) / sinAngle
      const factor2 = Math.sin(t * angle) / sinAngle
      
      const x = factor1 * A.x + factor2 * B.x
      const y = factor1 * A.y + factor2 * B.y
      const z = factor1 * A.z + factor2 * B.z
      
      // 转回球面坐标
      const lat = radToDeg(Math.asin(z))
      const lon = radToDeg(Math.atan2(y, x))
      
      points.push({ lat, lon })
    }
    
    return points
  }

  // 根据时间进度计算当前的禁飞区多边形
  const getCurrentForbiddenPolygon = (progress) => {
    return FORBIDDEN_POLYGON_INITIAL.map((initialVertex, index) => {
      const finalVertex = FORBIDDEN_POLYGON_FINAL[index]
      return {
        lat: initialVertex.lat + (finalVertex.lat - initialVertex.lat) * progress,
        lon: initialVertex.lon + (finalVertex.lon - initialVertex.lon) * progress
      }
    })
  }

  // 检查点是否在动态球面多边形禁飞区内
  const isPointInForbiddenPolygon = (lat, lon, includeBuffer = false, polygonProgress = 1) => {
    const currentPolygon = getCurrentForbiddenPolygon(polygonProgress)
    
    // 简化版：使用包围框检测
    const minLat = Math.min(...currentPolygon.map(p => p.lat)) - (includeBuffer ? BUFFER_DISTANCE : 0)
    const maxLat = Math.max(...currentPolygon.map(p => p.lat)) + (includeBuffer ? BUFFER_DISTANCE : 0)
    const minLon = Math.min(...currentPolygon.map(p => p.lon)) - (includeBuffer ? BUFFER_DISTANCE : 0)
    const maxLon = Math.max(...currentPolygon.map(p => p.lon)) + (includeBuffer ? BUFFER_DISTANCE : 0)
    
    return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon
  }

  // 计算点到动态球面多边形的距离（简化版）
  const distanceToForbiddenPolygon = (lat, lon, polygonProgress = 1) => {
    const currentPolygon = getCurrentForbiddenPolygon(polygonProgress)
    
    // 计算到多边形中心的距离
    const centerLat = currentPolygon.reduce((sum, p) => sum + p.lat, 0) / currentPolygon.length
    const centerLon = currentPolygon.reduce((sum, p) => sum + p.lon, 0) / currentPolygon.length
    
    const deltaLat = lat - centerLat
    const deltaLon = lon - centerLon
    
    return Math.sqrt(deltaLat * deltaLat + deltaLon * deltaLon)
  }

  // 绘制3D经纬网格
  const draw3DGrid = (ctx, canvasWidth, canvasHeight) => {
    // 纬度线 (水平圆环)
    ctx.strokeStyle = COLORS.gridSecondary
    ctx.lineWidth = 0.8
    
    for (let lat = -60; lat <= 60; lat += 30) {
      const gridPoints = []
      for (let lon = -180; lon <= 180; lon += 5) {
        const point3D = generate3DSpherePoint(lat, lon)
        if (isPointVisible(point3D)) {
          const projected = project3D(point3D, canvasWidth, canvasHeight)
          gridPoints.push({ ...projected, visible: true })
        } else {
          gridPoints.push({ visible: false })
        }
      }
      
      // 绘制可见的线段
      ctx.beginPath()
      let pathStarted = false
      for (let i = 0; i < gridPoints.length; i++) {
        if (gridPoints[i].visible) {
          if (!pathStarted) {
            ctx.moveTo(gridPoints[i].x, gridPoints[i].y)
            pathStarted = true
          } else {
            ctx.lineTo(gridPoints[i].x, gridPoints[i].y)
          }
        } else {
          pathStarted = false
        }
      }
      ctx.stroke()
    }
    
    // 经度线 (纵向半圆)
    ctx.strokeStyle = COLORS.gridPrimary
    ctx.lineWidth = 1
    
    for (let lon = -180; lon <= 150; lon += 30) {
      const gridPoints = []
      for (let lat = -85; lat <= 85; lat += 3) {
        const point3D = generate3DSpherePoint(lat, lon)
        if (isPointVisible(point3D)) {
          const projected = project3D(point3D, canvasWidth, canvasHeight)
          gridPoints.push({ ...projected, visible: true })
        } else {
          gridPoints.push({ visible: false })
        }
      }
      
      // 绘制可见的线段
      ctx.beginPath()
      let pathStarted = false
      for (let i = 0; i < gridPoints.length; i++) {
        if (gridPoints[i].visible) {
          if (!pathStarted) {
            ctx.moveTo(gridPoints[i].x, gridPoints[i].y)
            pathStarted = true
          } else {
            ctx.lineTo(gridPoints[i].x, gridPoints[i].y)
          }
        } else {
          pathStarted = false
        }
      }
      ctx.stroke()
    }
  }

  // 绘制3D地球
  const draw3DEarth = (ctx, canvasWidth, canvasHeight, alpha = 0.5) => {
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2
    const baseRadius = Math.min(canvasWidth, canvasHeight) * 0.2
    const radius = baseRadius * (interactionRef.current?.zoom || 1)
    
    // 设置球体整体透明度
    ctx.save()
    ctx.globalAlpha = alpha

    // 创建径向渐变模拟地球光照效果
    const earthGradient = ctx.createRadialGradient(
      centerX - radius * 0.3, centerY - radius * 0.3, 0,
      centerX, centerY, radius * 1.2
    )
    earthGradient.addColorStop(0, '#4A90E2') // 海洋高光
    earthGradient.addColorStop(0.3, '#2E5C8A') // 海洋中色
    earthGradient.addColorStop(0.7, '#1A3A5C') // 海洋深色
    earthGradient.addColorStop(1, '#0F1F2E') // 地球阴影

    // 绘制地球基础球体
    ctx.fillStyle = earthGradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fill()

    // 绘制大陆轮廓（简化版）
    ctx.save()
    drawContinents(ctx, centerX, centerY, radius)
    ctx.restore()

    // 添加地球轮廓
    ctx.strokeStyle = 'rgba(70, 130, 180, 0.5)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.stroke()

    // 添加大气层效果
    const atmosphereGradient = ctx.createRadialGradient(
      centerX, centerY, radius,
      centerX, centerY, radius * 1.1
    )
    atmosphereGradient.addColorStop(0, 'rgba(135, 206, 250, 0.3)')
    atmosphereGradient.addColorStop(1, 'rgba(135, 206, 250, 0)')
    
    ctx.fillStyle = atmosphereGradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 1.1, 0, Math.PI * 2)
    ctx.fill()
    
    // 恢复透明度设置
    ctx.restore()
  }

  // 绘制简化的大陆轮廓
  const drawContinents = (ctx, centerX, centerY, earthRadius) => {
    ctx.fillStyle = '#2D5016' // 陆地颜色
    
    // 绘制可见的陆地区域（根据当前旋转角度）
    const continents = [
      // 亚洲（简化）
      { lat: 30, lon: 100, width: 60, height: 40 },
      // 欧洲（简化）
      { lat: 55, lon: 20, width: 30, height: 25 },
      // 非洲（简化）
      { lat: 0, lon: 20, width: 35, height: 50 },
      // 北美洲（简化）
      { lat: 45, lon: -100, width: 45, height: 35 },
      // 南美洲（简化）
      { lat: -15, lon: -60, width: 25, height: 45 }
    ]

    continents.forEach(continent => {
      const point3D = generate3DSpherePoint(continent.lat, continent.lon)
      if (isPointVisible(point3D)) {
        const projected = project3D(point3D, centerX * 2, centerY * 2)
        const scale = (point3D.z + 1) / 2 // 深度缩放
        
        ctx.beginPath()
        ctx.ellipse(
          projected.x, projected.y,
          continent.width * scale * 0.3, continent.height * scale * 0.3,
          0, 0, Math.PI * 2
        )
        ctx.fill()
      }
    })
  }

  // 绘制地球底图
  const drawEarth = (ctx, canvasWidth, canvasHeight) => {
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2
    const radius = Math.min(canvasWidth, canvasHeight) * 0.35
    
    // 海洋
    ctx.fillStyle = COLORS.ocean
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fill()
    
    // 简化的陆地轮廓
    ctx.fillStyle = COLORS.land
    // 亚洲大陆
    ctx.beginPath()
    ctx.ellipse(centerX + 50, centerY - 30, 80, 60, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // 欧洲
    ctx.beginPath()
    ctx.ellipse(centerX - 20, centerY - 40, 30, 25, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // 绘制3D点
  const draw3DPoint = (ctx, point, canvasWidth, canvasHeight, color, label, radius = 8) => {
    // 生成3D坐标并应用旋转
    const point3D = generate3DSpherePoint(point.lat, point.lon)
    
    // 检查点是否可见
    if (!isPointVisible(point3D)) return
    
    // 投影到2D
    const projected = project3D(point3D, canvasWidth, canvasHeight)
    
    // 根据深度调整大小和不透明度
    const depthScale = Math.max(0.3, (point3D.z + 1) / 2)
    const adjustedRadius = radius * depthScale
    
    // 外圈微光
    const gradient = ctx.createRadialGradient(
      projected.x, projected.y, 0,
      projected.x, projected.y, adjustedRadius * 2
    )
    gradient.addColorStop(0, color)
    gradient.addColorStop(1, 'transparent')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(projected.x, projected.y, adjustedRadius * 2, 0, Math.PI * 2)
    ctx.fill()
    
    // 实心圆
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(projected.x, projected.y, radius, 0, Math.PI * 2)
    ctx.fill()
    
    // 标签
    ctx.fillStyle = COLORS.infoText
    ctx.font = 'bold 14px Consolas'
    ctx.textAlign = 'center'
    ctx.fillText(label, projected.x, projected.y - radius - 8)
    
    return projected
  }

  // 绘制欧氏弦段（只绘制可见部分）
  const drawEuclideanLine = (ctx, pointA, pointB, canvasWidth, canvasHeight, progress = 1) => {
    const point3DA = generate3DSpherePoint(pointA.lat, pointA.lon)
    const point3DB = generate3DSpherePoint(pointB.lat, pointB.lon)
    
    // 检查两个端点是否可见
    const isAVisible = isPointVisible(point3DA)
    const isBVisible = isPointVisible(point3DB)
    
    // 如果两个端点都不可见，不绘制
    if (!isAVisible && !isBVisible) return
    
    const projA = project3D(point3DA, canvasWidth, canvasHeight)
    const projB = project3D(point3DB, canvasWidth, canvasHeight)
    
    ctx.strokeStyle = COLORS.euclideanLine
    ctx.lineWidth = 3
    ctx.setLineDash([10, 10])
    
    ctx.beginPath()
    
    if (isAVisible && isBVisible) {
      // 两个端点都可见，正常绘制
      ctx.moveTo(projA.x, projA.y)
      ctx.lineTo(
        projA.x + (projB.x - projA.x) * progress,
        projA.y + (projB.y - projA.y) * progress
      )
      
      // 问号标记
      if (progress > 0.8) {
        const questionX = projA.x + (projB.x - projA.x) * 0.5
        const questionY = projA.y + (projB.y - projA.y) * 0.5
        
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 20px Consolas'
        ctx.textAlign = 'center'
        ctx.fillText('?', questionX, questionY)
      }
    } else if (isAVisible && !isBVisible) {
      // 只有A可见，绘制部分线段到屏幕边缘
      const midX = projA.x + (projB.x - projA.x) * 0.4 * progress
      const midY = projA.y + (projB.y - projA.y) * 0.4 * progress
      ctx.moveTo(projA.x, projA.y)
      ctx.lineTo(midX, midY)
    } else if (!isAVisible && isBVisible) {
      // 只有B可见，从屏幕边缘开始绘制到B
      const startX = projB.x - (projB.x - projA.x) * 0.4 * progress
      const startY = projB.y - (projB.y - projA.y) * 0.4 * progress
      ctx.moveTo(startX, startY)
      ctx.lineTo(projB.x, projB.y)
    }
    
    ctx.stroke()
    ctx.setLineDash([])
  }

  // 绘制大圆弧（只绘制可见部分）
  const drawGreatCircle = (ctx, pointA, pointB, canvasWidth, canvasHeight, progress = 1) => {
    const pathPoints = calculateGreatCirclePath(pointA, pointB)
    const drawPoints = Math.floor(pathPoints.length * progress)
    
    if (drawPoints < 2) return pathPoints
    
    ctx.strokeStyle = COLORS.greatCircle
    ctx.lineWidth = 3
    
    // 将路径点转换为3D坐标并检查可见性
    const visibleSegments = []
    let currentSegment = []
    
    for (let i = 0; i < drawPoints; i++) {
      const point3D = generate3DSpherePoint(pathPoints[i].lat, pathPoints[i].lon)
      const isVisible = isPointVisible(point3D)
      
      if (isVisible) {
        const projected = project3D(point3D, canvasWidth, canvasHeight)
        currentSegment.push({ ...pathPoints[i], projected })
      } else {
        // 当前点不可见，结束当前段
        if (currentSegment.length > 1) {
          visibleSegments.push(currentSegment)
        }
        currentSegment = []
      }
    }
    
    // 添加最后一个段
    if (currentSegment.length > 1) {
      visibleSegments.push(currentSegment)
    }
    
    // 绘制所有可见段
    visibleSegments.forEach(segment => {
      if (segment.length > 1) {
        ctx.beginPath()
        ctx.moveTo(segment[0].projected.x, segment[0].projected.y)
        
        for (let i = 1; i < segment.length; i++) {
          ctx.lineTo(segment[i].projected.x, segment[i].projected.y)
        }
        ctx.stroke()
      }
    })
    
    return pathPoints
  }

  // 绘制禁飞区
  const drawForbiddenZone = (ctx, canvasWidth, canvasHeight, showBuffer = true, progress = 1) => {
    const center = azimuthalProjection(FORBIDDEN_CENTER.lat, FORBIDDEN_CENTER.lon, canvasWidth, canvasHeight)
    const scale = Math.min(canvasWidth, canvasHeight) * 0.35
    
    // 计算屏幕上的半径
    const coreRadius = scale * Math.sin(degToRad(FORBIDDEN_RADIUS)) * progress
    const bufferRadius = scale * Math.sin(degToRad(FORBIDDEN_RADIUS + BUFFER_RADIUS)) * progress
    
    // 缓冲带
    if (showBuffer && progress > 0) {
      ctx.fillStyle = COLORS.bufferZone
      ctx.strokeStyle = COLORS.bufferBorder
      ctx.lineWidth = 2
      ctx.setLineDash([8, 8])
      
      ctx.beginPath()
      ctx.arc(center.x, center.y, bufferRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.setLineDash([])
    }
    
    // 核心禁飞区
    if (progress > 0) {
      ctx.fillStyle = COLORS.forbiddenZone
      ctx.strokeStyle = COLORS.forbiddenBorder
      ctx.lineWidth = 2
      
      ctx.beginPath()
      ctx.arc(center.x, center.y, coreRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }
    
    return { center, coreRadius, bufferRadius }
  }

  // 绘制动态扩大的球面多边形禁飞区
  const drawSphericalPolygonForbiddenZone = (ctx, canvasWidth, canvasHeight, showBuffer = true, progress = 1) => {
    // 获取当前时刻的禁飞区多边形（从初始到最终的插值）
    const currentPolygon = getCurrentForbiddenPolygon(progress)
    
    // 核心禁飞区多边形
    const corePolygonPoints = currentPolygon.map(vertex => {
      const point3D = generate3DSpherePoint(vertex.lat, vertex.lon)
      if (!isPointVisible(point3D)) return null
      return project3D(point3D, canvasWidth, canvasHeight)
    }).filter(p => p !== null)
    
    if (corePolygonPoints.length > 2) {
      ctx.save()
      
      // 绘制缓冲区（扩大的多边形） - 进度超过50%后出现
      if (showBuffer && progress > 0.5) {
        const bufferProgress = (progress - 0.5) / 0.5
        const bufferPolygonPoints = currentPolygon.map(vertex => {
          // 缓冲区：在当前多边形基础上进一步扩大
          const expandFactor = 1 + (BUFFER_DISTANCE / 30) * bufferProgress
          const centerLat = currentPolygon.reduce((sum, p) => sum + p.lat, 0) / currentPolygon.length
          const centerLon = currentPolygon.reduce((sum, p) => sum + p.lon, 0) / currentPolygon.length
          
          const expandedVertex = {
            lat: centerLat + (vertex.lat - centerLat) * expandFactor,
            lon: centerLon + (vertex.lon - centerLon) * expandFactor
          }
          
          const point3D = generate3DSpherePoint(expandedVertex.lat, expandedVertex.lon)
          if (!isPointVisible(point3D)) return null
          return project3D(point3D, canvasWidth, canvasHeight)
        }).filter(p => p !== null)
        
        if (bufferPolygonPoints.length > 2) {
          ctx.fillStyle = COLORS.bufferZone
          ctx.strokeStyle = COLORS.bufferBorder
          ctx.lineWidth = 2
          ctx.setLineDash([8, 8])
          
          // 绘制缓冲区测地线边界
          const bufferPolygon = currentPolygon.map(vertex => {
            const expandFactor = 1 + (BUFFER_DISTANCE / 30) * bufferProgress
            const centerLat = currentPolygon.reduce((sum, p) => sum + p.lat, 0) / currentPolygon.length
            const centerLon = currentPolygon.reduce((sum, p) => sum + p.lon, 0) / currentPolygon.length
            return {
              lat: centerLat + (vertex.lat - centerLat) * expandFactor,
              lon: centerLon + (vertex.lon - centerLon) * expandFactor
            }
          })
          
          // 缓冲区填充
          ctx.beginPath()
          ctx.moveTo(bufferPolygonPoints[0].x, bufferPolygonPoints[0].y)
          for (let i = 1; i < bufferPolygonPoints.length; i++) {
            ctx.lineTo(bufferPolygonPoints[i].x, bufferPolygonPoints[i].y)
          }
          ctx.closePath()
          ctx.fill()
          
          // 缓冲区测地线边界
          for (let i = 0; i < bufferPolygon.length; i++) {
            const startVertex = bufferPolygon[i]
            const endVertex = bufferPolygon[(i + 1) % bufferPolygon.length]
            const geodesicPath = calculateGreatCirclePath(startVertex, endVertex, 15)
            
            const visibleSegment = []
            geodesicPath.forEach(point => {
              const point3D = generate3DSpherePoint(point.lat, point.lon)
              if (isPointVisible(point3D)) {
                const projected = project3D(point3D, canvasWidth, canvasHeight)
                visibleSegment.push(projected)
              }
            })
            
            if (visibleSegment.length > 1) {
              ctx.beginPath()
              ctx.moveTo(visibleSegment[0].x, visibleSegment[0].y)
              for (let j = 1; j < visibleSegment.length; j++) {
                ctx.lineTo(visibleSegment[j].x, visibleSegment[j].y)
              }
              ctx.stroke()
            }
          }
          
          ctx.setLineDash([])
        }
      }
      
      // 绘制核心禁飞区多边形 - 使用测地线连接顶点
      if (progress > 0) {
        ctx.fillStyle = COLORS.forbiddenZone
        ctx.strokeStyle = COLORS.forbiddenBorder
        ctx.lineWidth = 3
        
        // 绘制多边形边界 - 每条边都是测地线
        const polygonPaths = []
        for (let i = 0; i < currentPolygon.length; i++) {
          const startVertex = currentPolygon[i]
          const endVertex = currentPolygon[(i + 1) % currentPolygon.length]
          const geodesicPath = calculateGreatCirclePath(startVertex, endVertex, 20)
          polygonPaths.push(geodesicPath)
        }
        
        // 将所有测地线路径转换为可见的投影点
        const allVisibleSegments = []
        polygonPaths.forEach(path => {
          const visibleSegment = []
          path.forEach(point => {
            const point3D = generate3DSpherePoint(point.lat, point.lon)
            if (isPointVisible(point3D)) {
              const projected = project3D(point3D, canvasWidth, canvasHeight)
              visibleSegment.push(projected)
            }
          })
          if (visibleSegment.length > 1) {
            allVisibleSegments.push(visibleSegment)
          }
        })
        
        // 填充禁飞区 - 使用简化的多边形填充
        if (corePolygonPoints.length > 2) {
          ctx.beginPath()
          ctx.moveTo(corePolygonPoints[0].x, corePolygonPoints[0].y)
          for (let i = 1; i < corePolygonPoints.length; i++) {
            ctx.lineTo(corePolygonPoints[i].x, corePolygonPoints[i].y)
          }
          ctx.closePath()
          ctx.fill()
        }
        
        // 绘制测地线边界
        allVisibleSegments.forEach(segment => {
          if (segment.length > 1) {
            ctx.beginPath()
            ctx.moveTo(segment[0].x, segment[0].y)
            for (let i = 1; i < segment.length; i++) {
              ctx.lineTo(segment[i].x, segment[i].y)
            }
            ctx.stroke()
          }
        })
      }
      
      ctx.restore()
    }
    
    return { corePolygonPoints, currentPolygon }
  }

  // 计算动态避障路径
  const calculateDynamicAvoidancePath = (pointA, pointB, forbiddenZoneProgress) => {
    const currentForbiddenPolygon = getCurrentForbiddenPolygon(forbiddenZoneProgress)
    
    // 计算禁飞区中心和边界
    const forbiddenCenterLat = currentForbiddenPolygon.reduce((sum, p) => sum + p.lat, 0) / currentForbiddenPolygon.length
    const forbiddenCenterLon = currentForbiddenPolygon.reduce((sum, p) => sum + p.lon, 0) / currentForbiddenPolygon.length
    
    // 计算禁飞区的最大半径（用于确定安全距离）
    const maxRadius = Math.max(...currentForbiddenPolygon.map(vertex => {
      const latDiff = vertex.lat - forbiddenCenterLat
      const lonDiff = vertex.lon - forbiddenCenterLon
      return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff)
    }))
    
    // 动态计算安全距离，随着禁飞区扩大而增加
    const baseSafeDistance = 15
    const expandingSafeDistance = forbiddenZoneProgress * 12
    const totalSafeDistance = maxRadius + baseSafeDistance + expandingSafeDistance
    
    // 计算两个备选绕行点：北绕和南绕
    const waypointNorth = { 
      lat: forbiddenCenterLat + totalSafeDistance, 
      lon: forbiddenCenterLon 
    }
    const waypointSouth = { 
      lat: forbiddenCenterLat - totalSafeDistance, 
      lon: forbiddenCenterLon 
    }
    
    // 选择距离更短的绕行路径
    const northDistance = getGreatCircleDistance(pointA, waypointNorth) + getGreatCircleDistance(waypointNorth, pointB)
    const southDistance = getGreatCircleDistance(pointA, waypointSouth) + getGreatCircleDistance(waypointSouth, pointB)
    
    const selectedWaypoint = northDistance <= southDistance ? waypointNorth : waypointSouth
    
    // 生成平滑的绕行路径
    const path1 = calculateGreatCirclePath(pointA, selectedWaypoint, 30)
    const path2 = calculateGreatCirclePath(selectedWaypoint, pointB, 30)
    
    return [...path1, ...path2]
  }
  
  // 计算两点间的大圆距离（简化版本）
  const getGreatCircleDistance = (pointA, pointB) => {
    const latDiff = pointA.lat - pointB.lat
    const lonDiff = pointA.lon - pointB.lon
    return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) // 简化距离计算
  }

  // 绘制绕过禁飞区的替代路径（只绘制可见部分）- 动态调整
  const drawAlternativePath = (ctx, pointA, pointB, canvasWidth, canvasHeight, progress = 1, forbiddenZoneProgress = 0) => {
    // 获取动态计算的绕行路径
    const allPathPoints = calculateDynamicAvoidancePath(pointA, pointB, forbiddenZoneProgress)
    
    // 计算当前选择的航点（用于显示）
    const currentForbiddenPolygon = getCurrentForbiddenPolygon(forbiddenZoneProgress)
    const forbiddenCenterLat = currentForbiddenPolygon.reduce((sum, p) => sum + p.lat, 0) / currentForbiddenPolygon.length
    const forbiddenCenterLon = currentForbiddenPolygon.reduce((sum, p) => sum + p.lon, 0) / currentForbiddenPolygon.length
    const maxRadius = Math.max(...currentForbiddenPolygon.map(vertex => {
      const latDiff = vertex.lat - forbiddenCenterLat
      const lonDiff = vertex.lon - forbiddenCenterLon
      return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff)
    }))
    const totalSafeDistance = maxRadius + 15 + (forbiddenZoneProgress * 12)
    const waypointNorth = { lat: forbiddenCenterLat + totalSafeDistance, lon: forbiddenCenterLon }
    
    const drawPoints = Math.floor(allPathPoints.length * progress)
    
    ctx.strokeStyle = '#4A90E2' // 使用蓝色区分绕行路径
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    
    // 将路径点转换为3D坐标并检查可见性
    const visibleSegments = []
    let currentSegment = []
    
    for (let i = 0; i < drawPoints && i < allPathPoints.length; i++) {
      const point3D = generate3DSpherePoint(allPathPoints[i].lat, allPathPoints[i].lon)
      const isVisible = isPointVisible(point3D)
      
      if (isVisible) {
        const projected = project3D(point3D, canvasWidth, canvasHeight)
        currentSegment.push({ ...allPathPoints[i], projected })
      } else {
        // 当前点不可见，结束当前段
        if (currentSegment.length > 1) {
          visibleSegments.push(currentSegment)
        }
        currentSegment = []
      }
    }
    
    // 添加最后一个段
    if (currentSegment.length > 1) {
      visibleSegments.push(currentSegment)
    }
    
    // 绘制所有可见段
    visibleSegments.forEach(segment => {
      if (segment.length > 1) {
        ctx.beginPath()
        ctx.moveTo(segment[0].projected.x, segment[0].projected.y)
        
        for (let i = 1; i < segment.length; i++) {
          ctx.lineTo(segment[i].projected.x, segment[i].projected.y)
        }
        ctx.stroke()
      }
    })
    
    ctx.setLineDash([])
    
    // 绘制动态调整的航点
    if (progress > 0.5) {
      const wpNorth3D = generate3DSpherePoint(waypointNorth.lat, waypointNorth.lon)
      if (isPointVisible(wpNorth3D)) {
        const wpNorthProj = project3D(wpNorth3D, canvasWidth, canvasHeight)
        
        // 航点随禁飞区扩大而高亮显示
        const waypointOpacity = 0.7 + (forbiddenZoneProgress * 0.3)
        ctx.fillStyle = `rgba(74, 144, 226, ${waypointOpacity})`
        ctx.strokeStyle = `rgba(74, 144, 226, ${waypointOpacity + 0.2})`
        ctx.lineWidth = 2 + (forbiddenZoneProgress * 2) // 线宽随扩大增加
        
        ctx.beginPath()
        const radius = 4 + (forbiddenZoneProgress * 3)
        ctx.arc(wpNorthProj.x, wpNorthProj.y, radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        
        // 动态标签
        ctx.fillStyle = `rgba(74, 144, 226, ${waypointOpacity})`
        ctx.font = 'bold 12px Consolas'
        ctx.textAlign = 'center'
        const labelText = forbiddenZoneProgress > 0.5 ? '动态航点' : '航点'
        ctx.fillText(labelText, wpNorthProj.x, wpNorthProj.y - radius - 8)
      }
    }
    
  }

  // 绘制可行域高亮
  const drawFeasibleRegion = (ctx, canvasWidth, canvasHeight, alpha = 0.1) => {
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2
    const earthRadius = Math.min(canvasWidth, canvasHeight) * 0.35
    const forbiddenCenter = azimuthalProjection(FORBIDDEN_CENTER.lat, FORBIDDEN_CENTER.lon, canvasWidth, canvasHeight)
    const forbiddenRadius = earthRadius * Math.sin(degToRad(FORBIDDEN_RADIUS + BUFFER_RADIUS))
    
    ctx.save()
    
    // 创建整个地球的路径
    ctx.beginPath()
    ctx.arc(centerX, centerY, earthRadius, 0, Math.PI * 2)
    
    // 挖掉禁飞区的洞
    ctx.arc(forbiddenCenter.x, forbiddenCenter.y, forbiddenRadius, 0, Math.PI * 2, true)
    
    ctx.fillStyle = `rgba(56, 178, 172, ${alpha})`
    ctx.fill('evenodd')
    
    ctx.restore()
  }

  // 绘制底部信息面板
  const drawInfoPanel = (ctx, canvasWidth, canvasHeight, lines, defaultFontSize = 16) => {
    if (!lines || lines.length === 0) return
    
    const padding = 18
    const maxLineHeight = Math.max(...lines.map(line => (line.fontSize || defaultFontSize) + 4))
    const totalTextHeight = lines.reduce((sum, line) => sum + (line.fontSize || defaultFontSize) + 4, 0)
    const panelWidth = canvasWidth * 0.8
    const panelHeight = padding * 2 + totalTextHeight
    const panelX = (canvasWidth - panelWidth) / 2
    const panelY = canvasHeight - panelHeight - 20
    
    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight)
    
    // 边框
    ctx.strokeStyle = 'rgba(231, 237, 248, 0.4)'
    ctx.lineWidth = 1.5
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight)
    
    // 计算文本垂直居中起始位置
    const textStartY = panelY + (panelHeight - totalTextHeight) / 2
    
    let currentY = textStartY
    lines.forEach((line, index) => {
      const fontSize = line.fontSize || defaultFontSize
      const lineHeight = fontSize + 4
      
      ctx.fillStyle = COLORS.infoText
      ctx.font = `${fontSize}px Consolas`
      ctx.textAlign = 'center'
      
      currentY += lineHeight
      ctx.fillText(
        line.text,
        panelX + panelWidth / 2,
        currentY
      )
    })
  }

  // 绘制顶部约束公式
  const drawConstraintTags = (ctx, canvasWidth, canvasHeight, constraints) => {
    if (constraints.length === 0) return
    
    const centerX = canvasWidth / 2
    const startY = 25
    
    // 计算总宽度
    const totalText = constraints.join('   ')
    ctx.font = 'bold 16px Times New Roman'
    const totalWidth = ctx.measureText(totalText).width
    
    // 背景
    const padding = 15
    const bgHeight = 35
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(centerX - totalWidth/2 - padding, startY - 5, totalWidth + padding*2, bgHeight)
    
    // 边框
    ctx.strokeStyle = COLORS.constraintTag
    ctx.lineWidth = 2
    ctx.strokeRect(centerX - totalWidth/2 - padding, startY - 5, totalWidth + padding*2, bgHeight)
    
    // 文字
    ctx.fillStyle = COLORS.constraintTag
    ctx.font = 'bold 16px Times New Roman'
    ctx.textAlign = 'center'
    ctx.fillText(totalText, centerX, startY + 16)
  }

  // 绘制参考点
  const drawReferencePoints = (ctx, canvasWidth, canvasHeight, alpha = 1) => {
    // 模拟两个相切参考点
    const point1 = { lat: 25, lon: 65 }
    const point2 = { lat: 35, lon: 95 }
    
    const proj1 = azimuthalProjection(point1.lat, point1.lon, canvasWidth, canvasHeight)
    const proj2 = azimuthalProjection(point2.lat, point2.lon, canvasWidth, canvasHeight)
    
    ctx.save()
    ctx.globalAlpha = alpha
    
    ctx.fillStyle = COLORS.referencePoint
    ctx.strokeStyle = COLORS.referencePoint
    ctx.lineWidth = 2
    
    // 绘制菱形
    const drawDiamond = (x, y, size) => {
      ctx.beginPath()
      ctx.moveTo(x, y - size)
      ctx.lineTo(x + size, y)
      ctx.lineTo(x, y + size)
      ctx.lineTo(x - size, y)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }
    
    drawDiamond(proj1.x, proj1.y, 6)
    drawDiamond(proj2.x, proj2.y, 6)
    
    ctx.restore()
  }

  // 获取当前动画阶段信息
  const getAnimationStage = (currentTime) => {
    const R3_PATH_END = 2000
    const MANIFOLD_END = 5000
    const SET_CONSTRAINT_END = 11000
    const FINAL_COMPARISON_END = 14000
    
    // 计算整体动画进度（0-1），使用实际的动画结束时间
    const overallProgress = Math.min(1, currentTime / FINAL_COMPARISON_END)
    
    
    if (currentTime <= R3_PATH_END) {
      const stageProgress = currentTime / R3_PATH_END
      return {
        stage: 'r3_path',
        progress: overallProgress, // 使用整体进度
        stageProgress, // 阶段内进度
        title: '未施加约束演示',
        content: [
          '在R³空间中，两点间的最短路径是直线',
          '但现实中的航空路线不能在三维空间中直接"拉弦"飞行'
        ]
      }
    } else if (currentTime <= MANIFOLD_END) {
      const stageProgress = (currentTime - R3_PATH_END) / (MANIFOLD_END - R3_PATH_END)
      return {
        stage: 'manifold',
        progress: overallProgress,
        stageProgress,
        title: '流形约束演示',
        content: [
          '施加流形约束：航线必须在地球表面上',
          '欧氏直线 → 无效；大圆弧 = 球面上的最短路径',
          '流形约束：γ ∈ S²ᵣ'
        ]
      }
    } else if (currentTime <= SET_CONSTRAINT_END) {
      const stageProgress = (currentTime - MANIFOLD_END) / (SET_CONSTRAINT_END - MANIFOLD_END)
      return {
        stage: 'set_constraint',
        progress: overallProgress,
        stageProgress,
        title: '集合约束演示',
        content: [
          '施加集合约束：航线必须避开禁飞区',
          '原始球面路径与禁飞区发生冲突',
          '必须计算绕行路径以满足约束条件',
          '集合约束：γ ∩ C⁽⁺ᵟ⁾ = ∅'
        ]
      }
    } else if (currentTime <= FINAL_COMPARISON_END) {
      const stageProgress = (currentTime - SET_CONSTRAINT_END) / (FINAL_COMPARISON_END - SET_CONSTRAINT_END)
      return {
        stage: 'comparison',
        progress: overallProgress,
        stageProgress,
        title: '路径对比分析',
        content: stageProgress < 0.7 ? [
          '• R³直线路径 - 理论最短但物理上不可行',
          '• 球面大圆弧 - 满足流形约束但与禁飞区冲突',
          '• 动态绕行路径 - 满足所有约束条件的可行解'
        ] : [
          '集合/结构约束的本质：',
          '约束条件将可行域进行收缩或"打孔"处理',
          '优化问题的几何结构因约束而发生根本改变',
          '需要在约束条件下重新寻找最优路径'
        ]
      }
    } else {
      return {
        stage: 'complete',
        progress: 1,
        stageProgress: 1,
        title: '约束演示完成',
        content: [
          '集合/结构约束演示完成',
          '约束条件改变了优化问题的可行域结构',
          '实际优化需要在约束条件下寻找可行解'
        ]
      }
    }
  }

  // 主渲染函数
  const render = (ctx, canvasWidth, canvasHeight, currentTime) => {
    // 清空画布
    ctx.fillStyle = COLORS.background
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    
    // 时间节点
    const R3_PATH_END = 2000      // R³空间直线路径演示结束
    const MANIFOLD_END = 5000     // 流形约束演示结束  
    const SET_CONSTRAINT_END = 11000  // 集合约束演示结束（延长2秒）
    const FINAL_COMPARISON_END = 14000  // 最终对比结束
    
    // 更新自动旋转时间（仅在播放动画时）
    if (isPlaying) {
      interactionRef.current.autoRotation = currentTime / 1000
    }
    
    // 绘制3D地球
    draw3DEarth(ctx, canvasWidth, canvasHeight)
    
    // 绘制3D网格
    draw3DGrid(ctx, canvasWidth, canvasHeight)
    
    // 阶段1: R³空间最短路径演示 (0-2.0s)
    if (currentTime <= R3_PATH_END) {
      const progress = currentTime / R3_PATH_END
      
      draw3DPoint(ctx, POINT_A, canvasWidth, canvasHeight, COLORS.pointA, 'A')
      draw3DPoint(ctx, POINT_B, canvasWidth, canvasHeight, COLORS.pointB, 'B')
      
      // R³空间欧氏直线路径逐渐显示
      drawEuclideanLine(ctx, POINT_A, POINT_B, canvasWidth, canvasHeight, progress)
      
      
      
    // 阶段2: 流形约束演示 (2.0-5.0s)  
    } else if (currentTime <= MANIFOLD_END) {
      const progress = (currentTime - R3_PATH_END) / (MANIFOLD_END - R3_PATH_END)
      
      draw3DPoint(ctx, POINT_A, canvasWidth, canvasHeight, COLORS.pointA, 'A')
      draw3DPoint(ctx, POINT_B, canvasWidth, canvasHeight, COLORS.pointB, 'B')
      
      // R³欧氏线淡出
      if (progress < 0.4) {
        ctx.save()
        ctx.globalAlpha = 1 - progress * 2.5
        drawEuclideanLine(ctx, POINT_A, POINT_B, canvasWidth, canvasHeight, 1)
        ctx.restore()
      }
      
      // 流形最短路径（大圆弧）出现
      if (progress > 0.2) {
        const arcProgress = Math.max(0, (progress - 0.2) / 0.8)
        drawGreatCircle(ctx, POINT_A, POINT_B, canvasWidth, canvasHeight, arcProgress)
      }
      
      
      
    // 阶段3: 集合约束演示 (5.0-9.0s)
    } else if (currentTime <= SET_CONSTRAINT_END) {
      const progress = (currentTime - MANIFOLD_END) / (SET_CONSTRAINT_END - MANIFOLD_END)
      
      draw3DPoint(ctx, POINT_A, canvasWidth, canvasHeight, COLORS.pointA, 'A')
      draw3DPoint(ctx, POINT_B, canvasWidth, canvasHeight, COLORS.pointB, 'B')
      
      // 继续显示原始大圆弧路径
      const pathPoints = drawGreatCircle(ctx, POINT_A, POINT_B, canvasWidth, canvasHeight, 1)
      
      // 球面多边形禁飞区逐步出现
      if (progress > 0.1) {
        const zoneProgress = Math.max(0, (progress - 0.1) / 0.5)
        drawSphericalPolygonForbiddenZone(ctx, canvasWidth, canvasHeight, true, zoneProgress)
        
        // 检查大圆弧与禁飞区的冲突
        if (progress > 0.4 && pathPoints) {
          pathPoints.forEach((point, index) => {
            if (isPointInForbiddenPolygon(point.lat, point.lon, true)) {
              const proj = azimuthalProjection(point.lat, point.lon, canvasWidth, canvasHeight)
              if (proj.x > 0 && proj.y > 0) { // 只绘制可见的冲突点
                // 红色X标记表示冲突
                ctx.strokeStyle = '#FF0000'
                ctx.lineWidth = 4
                ctx.beginPath()
                ctx.moveTo(proj.x - 10, proj.y - 10)
                ctx.lineTo(proj.x + 10, proj.y + 10)
                ctx.moveTo(proj.x + 10, proj.y - 10)
                ctx.lineTo(proj.x - 10, proj.y + 10)
                ctx.stroke()
              }
            }
          })
        }
      }
      
      // 显示绕过禁飞区的替代路径
      if (progress > 0.6) {
        const altProgress = Math.max(0, (progress - 0.6) / 0.4)
        const forbiddenProgress = Math.min(1, progress) // 禁飞区扩大进度
        drawAlternativePath(ctx, POINT_A, POINT_B, canvasWidth, canvasHeight, altProgress, forbiddenProgress)
      }
      
      
      
    // 阶段4: 最终对比演示 (9.0-12.0s)
    } else if (currentTime <= FINAL_COMPARISON_END) {
      const progress = (currentTime - SET_CONSTRAINT_END) / (FINAL_COMPARISON_END - SET_CONSTRAINT_END)
      
      draw3DPoint(ctx, POINT_A, canvasWidth, canvasHeight, COLORS.pointA, 'A')
      draw3DPoint(ctx, POINT_B, canvasWidth, canvasHeight, COLORS.pointB, 'B')
      
      // 显示所有路径进行对比
      // 1. R³直线路径（半透明）
      ctx.save()
      ctx.globalAlpha = 0.5
      drawEuclideanLine(ctx, POINT_A, POINT_B, canvasWidth, canvasHeight, 1)
      ctx.restore()
      
      // 2. 原始大圆弧路径（被禁飞区阻挡）
      ctx.save()
      ctx.globalAlpha = 0.9
      drawGreatCircle(ctx, POINT_A, POINT_B, canvasWidth, canvasHeight, 1)
      ctx.restore()
      
      // 3. 禁飞区
      drawSphericalPolygonForbiddenZone(ctx, canvasWidth, canvasHeight, true, 1)
      
      // 4. 绕行替代路径
      drawAlternativePath(ctx, POINT_A, POINT_B, canvasWidth, canvasHeight, 1, 1)
      
      
      
    // 阶段5: 收尾 (12.0s+)
    } else {
      // 显示静态的最终状态
      draw3DPoint(ctx, POINT_A, canvasWidth, canvasHeight, COLORS.pointA, 'A')
      draw3DPoint(ctx, POINT_B, canvasWidth, canvasHeight, COLORS.pointB, 'B')
      
      // 显示所有路径（最终静态状态）
      ctx.save()
      ctx.globalAlpha = 0.2
      drawEuclideanLine(ctx, POINT_A, POINT_B, canvasWidth, canvasHeight, 1)
      ctx.restore()
      
      ctx.save()
      ctx.globalAlpha = 0.4
      drawGreatCircle(ctx, POINT_A, POINT_B, canvasWidth, canvasHeight, 1)
      ctx.restore()
      
      drawSphericalPolygonForbiddenZone(ctx, canvasWidth, canvasHeight, true, 1)
      drawAlternativePath(ctx, POINT_A, POINT_B, canvasWidth, canvasHeight, 1, 1)
      
      
      
      // 版权标记
      ctx.fillStyle = COLORS.infoText
      ctx.font = '10px Consolas'
      ctx.textAlign = 'right'
      ctx.fillText(
        '本片仅演示约束如何改变\'可行集合\'，不涉及求解/比优',
        canvasWidth - 20,
        canvasHeight - 20
      )
    }
  }

  // 静态场景渲染
  const renderStaticScene = (ctx, canvasWidth, canvasHeight) => {
    ctx.fillStyle = COLORS.background
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    
    // 使用3D渲染方法
    draw3DEarth(ctx, canvasWidth, canvasHeight)
    draw3DGrid(ctx, canvasWidth, canvasHeight)
    draw3DPoint(ctx, POINT_A, canvasWidth, canvasHeight, COLORS.pointA, 'A')
    draw3DPoint(ctx, POINT_B, canvasWidth, canvasHeight, COLORS.pointB, 'B')
    
    // 显示所有路径和约束（静态状态）
    ctx.save()
    ctx.globalAlpha = 0.5
    drawEuclideanLine(ctx, POINT_A, POINT_B, canvasWidth, canvasHeight, 1)
    ctx.restore()
    
    drawGreatCircle(ctx, POINT_A, POINT_B, canvasWidth, canvasHeight, 1)
    drawSphericalPolygonForbiddenZone(ctx, canvasWidth, canvasHeight, true, 1)
    drawAlternativePath(ctx, POINT_A, POINT_B, canvasWidth, canvasHeight, 1, 1)
    
    
  }

  // 动画循环
  const animate = () => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const ctx = canvas.getContext('2d')
    const now = Date.now()
    
    if (!startTimeRef.current) {
      startTimeRef.current = now
    }
    
    const elapsed = now - startTimeRef.current
    
    if (elapsed <= ANIMATION_DURATION) {
      render(ctx, canvas.width, canvas.height, elapsed)
      
      // 调用动画更新回调，传递当前阶段信息
      if (onAnimationUpdate) {
        const animationStage = getAnimationStage(elapsed)
        onAnimationUpdate(animationStage)
      } else {
      }
      
      animationRef.current = requestAnimationFrame(animate)
      
    } else {
      // 动画结束，显示静态场景
      renderStaticScene(ctx, canvas.width, canvas.height)
      
      // 调用完成回调
      if (onComplete) {
        onComplete()
      }
    }
  }

  // 开始动画
  const startAnimation = () => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    startTimeRef.current = null
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    animate()
  }

  // 停止动画
  const stopAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      renderStaticScene(ctx, canvas.width, canvas.height)
    } else {
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
      // 重新渲染
      if (!isPlaying) {
        renderStaticScene(canvas.getContext('2d'), canvas.width, canvas.height)
      }
    }
    
    // 鼠标事件处理
    const handleMouseDown = (e) => {
      interactionRef.current.isDragging = true
      const rect = canvas.getBoundingClientRect()
      interactionRef.current.lastMousePos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
      canvas.style.cursor = 'grabbing'
    }

    const handleMouseMove = (e) => {
      if (!interactionRef.current.isDragging) return
      
      const rect = canvas.getBoundingClientRect()
      const currentPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
      
      const deltaX = currentPos.x - interactionRef.current.lastMousePos.x
      const deltaY = currentPos.y - interactionRef.current.lastMousePos.y
      
      // 更新旋转角度
      interactionRef.current.rotation.y += deltaX * 0.01
      interactionRef.current.rotation.x += deltaY * 0.01
      
      // 限制X轴旋转范围
      interactionRef.current.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, interactionRef.current.rotation.x))
      
      interactionRef.current.lastMousePos = currentPos
      
      // 实时重新渲染
      if (!isPlaying) {
        renderStaticScene(canvas.getContext('2d'), canvas.width, canvas.height)
      }
    }

    const handleMouseUp = () => {
      if (interactionRef.current.isDragging) {
      }
      interactionRef.current.isDragging = false
      canvas.style.cursor = 'grab'
    }

    const handleWheel = (e) => {
      e.preventDefault()
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
      const oldZoom = interactionRef.current.zoom
      interactionRef.current.zoom *= zoomFactor
      interactionRef.current.zoom = Math.max(0.5, Math.min(3, interactionRef.current.zoom))
      
      
      // 实时重新渲染
      if (!isPlaying) {
        renderStaticScene(canvas.getContext('2d'), canvas.width, canvas.height)
      }
    }
    
    // 添加事件监听器
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mouseleave', handleMouseUp)
    canvas.addEventListener('wheel', handleWheel)
    canvas.style.cursor = 'grab'

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseUp)
      canvas.removeEventListener('wheel', handleWheel)
      stopAnimation()
    }
  }, [])

  // 暴露控制方法给父组件
  useEffect(() => {
    if (isPlaying) {
      startAnimation()
    } else {
      stopAnimation()
    }
  }, [isPlaying])

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block'
      }}
      onDoubleClick={startAnimation}
    />
  )
}

export default SetConstraintAnimation