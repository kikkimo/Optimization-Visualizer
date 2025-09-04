import React, { useRef, useEffect, useState } from 'react'

const ProblemPortraitAnimation = ({ 
  onComplete = () => {}, 
  onAnimationUpdate = () => {},
  onStageComplete = () => {},
  setButtonText = null
}) => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)

  // 内部状态管理
  const [isPlaying, setIsPlaying] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)
  
  // 动画总时长（毫秒）
  const TOTAL_DURATION = 5000 // 5秒完整动画

  // 颜色定义
  const COLORS = {
    background: '#111827',
    centerNode: '#3B82F6',
    paradigmColor: '#8B5CF6',     // 紫色 - 问题范式
    constraintColor: '#10B981',   // 绿色 - 约束特性
    objectiveColor: '#F59E0B',    // 橙色 - 目标特性
    methodColor: '#EF4444',       // 红色 - 求解方式
    connectionLine: 'rgba(59, 130, 246, 0.3)',
    nodeText: '#F3F4F6',
    infoBackground: 'rgba(17, 24, 39, 0.92)',
    infoText: '#F3F4F6',
    highlight: '#60A5FA'
  }

  // 问题画像数据
  const PORTRAIT_DATA = {
    center: {
      title: '问题画像',
      subtitle: 'Problem Portrait',
      icon: '🎯'
    },
    dimensions: [
      {
        id: 'paradigm',
        title: '问题范式',
        subtitle: 'Problem Paradigm',
        color: COLORS.paradigmColor,
        icon: '🏗️',
        angle: 0, // 12点钟方向
        items: [
          { name: '状态估计与几何重构', icon: '🎯', desc: 'NLLS优化问题' },
          { name: '约束下的参数平差', icon: '⚖️', desc: '凸优化QP/SOCP' },
          { name: '组合决策与空间运筹', icon: '🗺️', desc: 'MILP/MDP问题' },
          { name: '图像能量最小化', icon: '🖼️', desc: '图割/MRF优化' },
          { name: '数据驱动机器学习', icon: '🧠', desc: '非凸大规模优化' },
          { name: 'PDE约束优化', icon: '⚡', desc: '变分/有限元方法' }
        ]
      },
      {
        id: 'constraint',
        title: '约束特性',
        subtitle: 'Constraint Properties',
        color: COLORS.constraintColor,
        icon: '🔗',
        angle: 90, // 3点钟方向
        items: [
          { name: '无约束', icon: '🆓', desc: '自由优化空间' },
          { name: '等式约束', icon: '=', desc: '流形约束条件' },
          { name: '不等式约束', icon: '≤', desc: '可行域边界' },
          { name: '集合约束', icon: '∈', desc: '离散/连续集合' },
          { name: '混合约束', icon: '🔀', desc: '多类型约束组合' }
        ]
      },
      {
        id: 'objective',
        title: '目标特性',
        subtitle: 'Objective Properties',
        color: COLORS.objectiveColor,
        icon: '🎯',
        angle: 180, // 6点钟方向
        items: [
          { name: '单目标优化', icon: '1️⃣', desc: '单一目标函数' },
          { name: '多目标优化', icon: '🎭', desc: 'Pareto最优解集' },
          { name: '凸目标函数', icon: '🔵', desc: '全局最优保证' },
          { name: '非凸目标', icon: '🌊', desc: '多局部最优值' },
          { name: '随机目标', icon: '🎲', desc: '期望值优化' }
        ]
      },
      {
        id: 'method',
        title: '求解方式',
        subtitle: 'Solution Methods',
        color: COLORS.methodColor,
        icon: '⚙️',
        angle: 270, // 9点钟方向
        items: [
          { name: '解析求解', icon: '📐', desc: '闭式解析解' },
          { name: '数值迭代', icon: '🔄', desc: '梯度/牛顿法' },
          { name: '启发式算法', icon: '💡', desc: '遗传/模拟退火' },
          { name: '机器学习', icon: '🤖', desc: 'SGD/Adam优化器' },
          { name: '专用求解器', icon: '🏭', desc: 'CPLEX/Gurobi等' }
        ]
      }
    ]
  }


  // 坐标转换函数
  const polarToCartesian = (centerX, centerY, radius, angle) => {
    const radian = (angle - 90) * Math.PI / 180
    return {
      x: centerX + radius * Math.cos(radian),
      y: centerY + radius * Math.sin(radian)
    }
  }

  // 绘制中心节点
  const drawCenterNode = (ctx, canvasWidth, canvasHeight, alpha = 1) => {
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2
    const radius = 80

    ctx.save()
    ctx.globalAlpha = alpha

    // 外圈光晕
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.5)
    gradient.addColorStop(0, `${COLORS.centerNode}40`)
    gradient.addColorStop(1, 'transparent')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2)
    ctx.fill()

    // 主节点
    ctx.fillStyle = COLORS.centerNode
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fill()

    // 边框
    ctx.strokeStyle = COLORS.highlight
    ctx.lineWidth = 3
    ctx.stroke()

    // 文字
    ctx.fillStyle = COLORS.nodeText
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(PORTRAIT_DATA.center.icon, centerX, centerY - 10)
    
    ctx.font = 'bold 16px Arial'
    ctx.fillText(PORTRAIT_DATA.center.title, centerX, centerY + 15)
    
    ctx.font = '12px Arial'
    ctx.fillText(PORTRAIT_DATA.center.subtitle, centerX, centerY + 32)

    ctx.restore()
  }

  // 绘制维度节点
  const drawDimensionNode = (ctx, canvasWidth, canvasHeight, dimension, progress = 0, isActive = false) => {
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2
    const radius = Math.min(canvasWidth, canvasHeight) * 0.25
    const nodeSize = isActive ? 70 : 60

    const pos = polarToCartesian(centerX, centerY, radius, dimension.angle)

    ctx.save()
    ctx.globalAlpha = progress

    // 连接线
    if (progress > 0) {
      ctx.strokeStyle = COLORS.connectionLine
      ctx.lineWidth = 2
      ctx.setLineDash([8, 8])
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // 节点背景光晕
    if (isActive) {
      const glowGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, nodeSize * 1.3)
      glowGradient.addColorStop(0, `${dimension.color}60`)
      glowGradient.addColorStop(1, 'transparent')
      
      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, nodeSize * 1.3, 0, Math.PI * 2)
      ctx.fill()
    }

    // 主节点
    ctx.fillStyle = dimension.color
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, nodeSize, 0, Math.PI * 2)
    ctx.fill()

    // 边框
    ctx.strokeStyle = isActive ? COLORS.highlight : 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = isActive ? 4 : 2
    ctx.stroke()

    // 图标和文字
    ctx.fillStyle = COLORS.nodeText
    ctx.font = `${isActive ? 'bold 28px' : 'bold 24px'} Arial`
    ctx.textAlign = 'center'
    ctx.fillText(dimension.icon, pos.x, pos.y - 5)
    
    ctx.font = `${isActive ? 'bold 14px' : 'bold 12px'} Arial`
    ctx.fillText(dimension.title, pos.x, pos.y + 25)

    if (isActive) {
      ctx.font = '10px Arial'
      ctx.fillStyle = 'rgba(243, 244, 246, 0.8)'
      ctx.fillText(dimension.subtitle, pos.x, pos.y + 40)
    }

    ctx.restore()
    return pos
  }



  // 主渲染函数
  const render = (ctx, canvasWidth, canvasHeight, progress) => {
    // 清空画布
    ctx.fillStyle = COLORS.background
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // 绘制中心节点 - 最开始出现
    const centerAlpha = Math.min(progress * 5, 1) // 前20%进度显示中心节点
    drawCenterNode(ctx, canvasWidth, canvasHeight, centerAlpha)

    // 绘制四个维度节点 - 依次出现
    PORTRAIT_DATA.dimensions.forEach((dimension, index) => {
      const startProgress = 0.2 + index * 0.2 // 每个维度间隔0.2的进度
      const nodeProgress = Math.max(0, Math.min(1, (progress - startProgress) / 0.2))
      const isActive = progress >= startProgress && progress < startProgress + 0.2
      
      if (nodeProgress > 0) {
        drawDimensionNode(ctx, canvasWidth, canvasHeight, dimension, nodeProgress, isActive)
      }
    })
  }

  // 静态场景渲染
  const renderStaticScene = (ctx, canvasWidth, canvasHeight) => {
    ctx.fillStyle = COLORS.background
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // 绘制完整的问题画像
    drawCenterNode(ctx, canvasWidth, canvasHeight, 1)
    
    PORTRAIT_DATA.dimensions.forEach((dimension) => {
      drawDimensionNode(ctx, canvasWidth, canvasHeight, dimension, 1, false)
    })
  }

  // 播放动画
  const playAnimation = () => {
    const startTime = Date.now()
    console.log(`🎭 问题画像动画开始播放，开始时间: ${new Date(startTime).toLocaleTimeString()}`)
    
    const canvas = canvasRef.current
    if (!canvas) {
      console.error('❌ Canvas 不存在，无法播放动画')
      return
    }
    
    const ctx = canvas.getContext('2d')
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / TOTAL_DURATION, 1)
      
      // 每1秒输出一次进度信息
      if (Math.floor(elapsed / 1000) !== Math.floor((elapsed - 16) / 1000)) {
        console.log(`📊 问题画像动画进度: ${(progress * 100).toFixed(1)}% (${elapsed}ms/${TOTAL_DURATION}ms)`)
      }
      
      // 渲染当前进度
      render(ctx, canvas.width, canvas.height, progress)
      
      // 调用动画更新回调
      if (onAnimationUpdate) {
        onAnimationUpdate({
          stage: 'playing',
          title: '问题画像',
          content: ['问题画像四个维度正在展示']
        })
      }
      
      // 更新进度
      setAnimationProgress(progress)
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // 动画结束
        console.log(`✅ 问题画像动画完成，总耗时: ${elapsed}ms`)
        onAnimationCompleteHandler()
      }
    }
    
    animationRef.current = requestAnimationFrame(animate)
  }

  // 动画完成处理
  const onAnimationCompleteHandler = () => {
    console.log('🏁 问题画像动画播放完成')
    setIsPlaying(false)
    console.log('⏹️ 已设置 isPlaying = false')
    
    // 重新绘制静态场景
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      renderStaticScene(ctx, canvas.width, canvas.height)
      console.log('🎨 已重新渲染静态场景')
    }
    
    // 更新按钮文字
    if (setButtonText) {
      setButtonText('播放')
      console.log('🔄 按钮文字已重置为: 播放')
    }
    
    console.log('📤 调用 onComplete()')
    onComplete()
  }

  // 播放控制函数
  const handlePlayClick = () => {
    console.log('🎬 handlePlayClick 被调用', { isPlaying })
    
    if (isPlaying) {
      console.log('⏸️ 当前正在播放，忽略点击')
      return
    }
    
    console.log('▶️ 开始播放问题画像动画')
    setIsPlaying(true)
    setAnimationProgress(0)
    
    // 更新按钮文字
    if (setButtonText) {
      setButtonText('播放中...')
      console.log('🔄 按钮文字已更新为: 播放中...')
    }
    
    // 开始播放动画
    console.log('🚀 调用 playAnimation()')
    playAnimation()
  }

  // 组件挂载
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
      
      // 重新渲染静态场景
      if (!isPlaying) {
        renderStaticScene(canvas.getContext('2d'), canvas.width, canvas.height)
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // 初始渲染静态场景
    renderStaticScene(canvas.getContext('2d'), canvas.width, canvas.height)

    // 暴露播放函数到全局
    window.handlePlayClick = () => {
      console.log('🌐 window.handlePlayClick 被外部调用')
      try {
        handlePlayClick()
      } catch (error) {
        console.error('❌ window.handlePlayClick 错误:', error)
      }
    }

    console.log('🚀 ProblemPortraitAnimation 组件已挂载', {
      isPlaying,
      animationProgress,
      canvasExists: !!canvas,
      windowHandlePlayClickWillBeSet: true,
      状态: '初始化完成'
    })
    
    // 检查window对象
    console.log('🌐 Window对象检查:', {
      hasWindow: typeof window !== 'undefined',
      windowHandlePlayClick: typeof window?.handlePlayClick
    })

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      delete window.handlePlayClick
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block'
      }}
      onDoubleClick={handlePlayClick}
    />
  )
}

export default ProblemPortraitAnimation