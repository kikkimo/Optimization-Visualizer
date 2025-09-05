import React, { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { InlineMath, BlockMath } from 'react-katex'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const Section4NonlinearWorldStep3 = () => {
  const [activeDemo, setActiveDemo] = useState(null)
  const canvasRef = useRef(null)
  const [rotation, setRotation] = useState({ x: -0.3, y: 0.5 })
  const [isDragging, setIsDragging] = useState(false)
  const lastMousePos = useRef({ x: 0, y: 0 })

  // 3D多峰函数：创建一个有多个局部最大值的函数，扩大分布范围
  const surfaceFunction = (x, y) => {
    // 主峰（全局最大值）- 位于中心偏右
    const peak1 = 6 * Math.exp(-((x - 1.2) ** 2 + (y - 0.8) ** 2) / 0.3)
    // 局部峰1 - 左上角
    const peak2 = 4.2 * Math.exp(-((x + 1.5) ** 2 + (y - 1.3) ** 2) / 0.25) 
    // 局部峰2 - 右下角
    const peak3 = 3.8 * Math.exp(-((x - 1.8) ** 2 + (y + 1.6) ** 2) / 0.28)
    // 局部峰3 - 左下角
    const peak4 = 3.5 * Math.exp(-((x + 1.8) ** 2 + (y + 1.2) ** 2) / 0.22)
    // 局部峰4 - 右上角，较小
    const peak5 = 3.0 * Math.exp(-((x - 0.5) ** 2 + (y - 2.0) ** 2) / 0.2)
    // 基础波动，幅度减小
    const base = 0.3 * Math.sin(1.5 * x) * Math.cos(1.5 * y)
    
    return peak1 + peak2 + peak3 + peak4 + peak5 + base
  }

  // Rainbow颜色映射函数 - 更完整的彩虹光谱
  const getRainbow = (t) => {
    // t 在 0-1 之间，映射到彩虹色
    t = Math.max(0, Math.min(1, t))
    
    // 使用完整的彩虹光谱：紫(270) -> 蓝(240) -> 青(180) -> 绿(120) -> 黄(60) -> 红(0)
    const h = (1 - t) * 270
    const s = 80  // 提高饱和度
    const l = 55  // 调整亮度
    
    return { h, s, l }
  }

  // 3D投影函数
  const project3D = (x, y, z, canvas) => {
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const scale = 120  // 减小缩放，让XY范围显得更大
    
    // 旋转
    const cosRx = Math.cos(rotation.x)
    const sinRx = Math.sin(rotation.x) 
    const cosRy = Math.cos(rotation.y)
    const sinRy = Math.sin(rotation.y)
    
    // Y轴旋转
    let x1 = x * cosRy + z * sinRy * 0.3  // 减少Z对投影的影响
    let z1 = -x * sinRy + z * cosRy * 0.3
    let y1 = y
    
    // X轴旋转
    let y2 = y1 * cosRx - z1 * sinRx
    let z2 = y1 * sinRx + z1 * cosRx
    
    // 投影到2D，增大XY的投影比例
    const perspective = 5
    const projX = cx + (x1 * scale * 1.5) / (perspective + z2)  // 增大X投影
    const projY = cy - (y2 * scale * 1.5) / (perspective + z2)  // 增大Y投影
    
    return { x: projX, y: projY, z: z2 }
  }

  // 渲染3D曲面
  const render3DSurface = (canvas, ctx) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // 设置背景
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    const resolution = 25  // 减少格网密度
    const triangles = []
    
    // 计算Z值的最大最小值用于归一化
    let minZ = Infinity, maxZ = -Infinity
    const xyRange = 3.5  // 进一步扩大XY范围到3.5
    
    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        const x = -xyRange + (i / resolution) * (2 * xyRange)
        const y = -xyRange + (j / resolution) * (2 * xyRange)
        const z = surfaceFunction(x, y)
        minZ = Math.min(minZ, z)
        maxZ = Math.max(maxZ, z)
      }
    }
    
    // 生成曲面网格
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const x1 = -xyRange + (i / resolution) * (2 * xyRange)
        const y1 = -xyRange + (j / resolution) * (2 * xyRange)
        const x2 = -xyRange + ((i + 1) / resolution) * (2 * xyRange)
        const y2 = -xyRange + ((j + 1) / resolution) * (2 * xyRange)
        
        const z1 = surfaceFunction(x1, y1)
        const z2 = surfaceFunction(x2, y1)
        const z3 = surfaceFunction(x1, y2)
        const z4 = surfaceFunction(x2, y2)
        
        const p1 = project3D(x1, y1, z1, canvas)
        const p2 = project3D(x2, y1, z2, canvas)
        const p3 = project3D(x1, y2, z3, canvas)
        const p4 = project3D(x2, y2, z4, canvas)
        
        // 创建两个三角形
        const height1 = (z1 + z2 + z3) / 3
        const height2 = (z2 + z4 + z3) / 3
        
        triangles.push({
          points: [p1, p2, p3],
          z: (p1.z + p2.z + p3.z) / 3,
          height: height1,
          normalizedHeight: Math.max(0, Math.min(1, (height1 - minZ) / (maxZ - minZ)))
        })
        triangles.push({
          points: [p2, p4, p3],
          z: (p2.z + p4.z + p3.z) / 3,
          height: height2,
          normalizedHeight: Math.max(0, Math.min(1, (height2 - minZ) / (maxZ - minZ)))
        })
      }
    }
    
    // 按深度排序
    triangles.sort((a, b) => b.z - a.z)
    
    // 调试信息
    console.log(`Z值范围: ${minZ.toFixed(3)} ~ ${maxZ.toFixed(3)}`)
    console.log(`三角形数量: ${triangles.length}`)
    
    // 验证归一化是否正确
    const heights = triangles.map(t => t.height)
    const normalizedHeights = triangles.map(t => t.normalizedHeight)
    console.log(`实际高度范围: ${Math.min(...heights).toFixed(3)} ~ ${Math.max(...heights).toFixed(3)}`)
    console.log(`归一化高度范围: ${Math.min(...normalizedHeights).toFixed(3)} ~ ${Math.max(...normalizedHeights).toFixed(3)}`)
    
    // 绘制三角形 - 使用Rainbow颜色
    triangles.forEach((triangle, index) => {
      const normalizedHeight = triangle.normalizedHeight
      
      // 调试前几个三角形的颜色计算
      if (index < 5) {
        console.log(`三角形${index}: 高度=${triangle.height.toFixed(3)}, 归一化=${normalizedHeight.toFixed(3)}`)
      }
      
      // 简化的彩虹色映射
      let r, g, b;
      if (normalizedHeight < 0.2) {
        // 紫色到蓝色
        r = Math.round(128 + 127 * (1 - normalizedHeight * 5));
        g = 0;
        b = 255;
      } else if (normalizedHeight < 0.4) {
        // 蓝色到青色
        r = 0;
        g = Math.round(255 * (normalizedHeight - 0.2) * 5);
        b = 255;
      } else if (normalizedHeight < 0.6) {
        // 青色到绿色
        r = 0;
        g = 255;
        b = Math.round(255 * (1 - (normalizedHeight - 0.4) * 5));
      } else if (normalizedHeight < 0.8) {
        // 绿色到黄色
        r = Math.round(255 * (normalizedHeight - 0.6) * 5);
        g = 255;
        b = 0;
      } else {
        // 黄色到红色
        r = 255;
        g = Math.round(255 * (1 - (normalizedHeight - 0.8) * 5));
        b = 0;
      }
      
      // 调试前几个三角形的RGB值
      if (index < 5) {
        console.log(`三角形${index}: RGB(${r}, ${g}, ${b})`)
      }
      
      // 设置40%透明度
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.4)`
      ctx.strokeStyle = `rgba(${Math.round(r*0.7)}, ${Math.round(g*0.7)}, ${Math.round(b*0.7)}, 0.2)`
      ctx.lineWidth = 0.2
      
      ctx.beginPath()
      ctx.moveTo(triangle.points[0].x, triangle.points[0].y)
      ctx.lineTo(triangle.points[1].x, triangle.points[1].y)
      ctx.lineTo(triangle.points[2].x, triangle.points[2].y)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    })
    
    // 绘制峰值点
    drawPeakPoints(canvas, ctx)
  }

  // 绘制峰值点
  const drawPeakPoints = (canvas, ctx) => {
    // 全局最大值点 - 更新到新的坐标
    const globalMax = project3D(1.2, 0.8, surfaceFunction(1.2, 0.8), canvas)
    ctx.fillStyle = '#22c55e'
    ctx.beginPath()
    ctx.arc(globalMax.x, globalMax.y, 12, 0, 2 * Math.PI)
    ctx.fill()
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 4
    ctx.stroke()
    
    // 添加发光效果
    ctx.shadowColor = '#22c55e'
    ctx.shadowBlur = 20
    ctx.beginPath()
    ctx.arc(globalMax.x, globalMax.y, 10, 0, 2 * Math.PI)
    ctx.fill()
    ctx.shadowBlur = 0
    
    // 局部最大值点 - 更新到新的分布坐标
    const localPeaks = [
      { x: -1.5, y: 1.3, z: surfaceFunction(-1.5, 1.3) },   // 左上角
      { x: 1.8, y: -1.6, z: surfaceFunction(1.8, -1.6) },  // 右下角
      { x: -1.8, y: -1.2, z: surfaceFunction(-1.8, -1.2) }, // 左下角
      { x: 0.5, y: 2.0, z: surfaceFunction(0.5, 2.0) }     // 右上角
    ]
    
    ctx.fillStyle = '#ef4444'
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 3
    
    localPeaks.forEach(peak => {
      const proj = project3D(peak.x, peak.y, peak.z, canvas)
      ctx.beginPath()
      ctx.arc(proj.x, proj.y, 8, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
      
      // 添加发光效果
      ctx.shadowColor = '#ef4444'
      ctx.shadowBlur = 12
      ctx.beginPath()
      ctx.arc(proj.x, proj.y, 6, 0, 2 * Math.PI)
      ctx.fill()
      ctx.shadowBlur = 0
    })
  }

  // 鼠标事件处理
  const handleMouseDown = (e) => {
    setIsDragging(true)
    lastMousePos.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    
    const deltaX = e.clientX - lastMousePos.current.x
    const deltaY = e.clientY - lastMousePos.current.y
    
    setRotation(prev => ({
      x: prev.x + deltaY * 0.01,
      y: prev.y + deltaX * 0.01
    }))
    
    lastMousePos.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // 渲染效果
  useEffect(() => {
    if (canvasRef.current && activeDemo === 'optimize') {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      render3DSurface(canvas, ctx)
    }
  }, [activeDemo, rotation])

  return (
    <div className="h-full w-full flex flex-col gap-4 relative p-2">
      <style jsx global="true">{`
        .pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0.14, 0.3, 1) infinite;
        }
        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.3;
          }
          100% {
            transform: scale(0.8);
            opacity: 1;
          }
        }
        .glow-effect {
          filter: drop-shadow(0 0 8px currentColor);
          animation: glow 2s ease-in-out infinite alternate;
        }
        @keyframes glow {
          from {
            filter: drop-shadow(0 0 8px currentColor);
          }
          to {
            filter: drop-shadow(0 0 16px currentColor) drop-shadow(0 0 24px currentColor);
          }
        }
      `}</style>
      <div className="flex-1 flex gap-4">
        {/* 竖直按钮区域 */}
        <div className="flex flex-col gap-3 w-24">
          <button 
            onClick={() => setActiveDemo(activeDemo === 'source' ? null : 'source')}
            className="h-28 rounded-lg border transition-all shadow-lg hover:shadow-purple-500/25 flex flex-col items-center justify-center gap-1"
            style={{
              background: activeDemo === 'source' 
                ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(251, 146, 60, 0.2))' 
                : 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(251, 146, 60, 0.1))',
              borderColor: activeDemo === 'source' ? 'rgba(168, 85, 247, 0.6)' : 'rgba(168, 85, 247, 0.4)',
              color: 'var(--ink-high)'
            }}
          >
            <div className="text-2xl mb-1">🔍</div>
            <div className="text-xs font-medium text-center leading-tight">非线性<br/>来源</div>
          </button>
          
          <button 
            onClick={() => setActiveDemo(activeDemo === 'optimize' ? null : 'optimize')}
            className="h-28 rounded-lg border transition-all shadow-lg hover:shadow-green-500/25 flex flex-col items-center justify-center gap-1"
            style={{
              background: activeDemo === 'optimize' 
                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(168, 85, 247, 0.2))' 
                : 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(168, 85, 247, 0.1))',
              borderColor: activeDemo === 'optimize' ? 'rgba(34, 197, 94, 0.6)' : 'rgba(34, 197, 94, 0.4)',
              color: 'var(--ink-high)'
            }}
          >
            <div className="text-2xl mb-1">🏔️</div>
            <div className="text-xs font-medium text-center leading-tight">全局最优<br/>vs<br/>局部最优</div>
          </button>
          
          <button 
            onClick={() => setActiveDemo(activeDemo === 'challenge' ? null : 'challenge')}
            className="h-28 rounded-lg border transition-all shadow-lg hover:shadow-orange-500/25 flex flex-col items-center justify-center gap-1"
            style={{
              background: activeDemo === 'challenge' 
                ? 'linear-gradient(135deg, rgba(251, 146, 60, 0.25), rgba(168, 85, 247, 0.2))' 
                : 'linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(168, 85, 247, 0.1))',
              borderColor: activeDemo === 'challenge' ? 'rgba(251, 146, 60, 0.6)' : 'rgba(251, 146, 60, 0.4)',
              color: 'var(--ink-high)'
            }}
          >
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-xs font-medium text-center leading-tight">核心<br/>挑战</div>
          </button>
        </div>

        {/* 内容展示区域 */}
        <div className="rounded-2xl border backdrop-blur-sm p-4 flex-1"
             style={{
               background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(251, 146, 60, 0.06) 100%)',
               borderColor: 'rgba(168, 85, 247, 0.2)',
               minHeight: '400px'
             }}>
          <AnimatePresence mode="wait">
            {activeDemo === null && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center h-full"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                    非线性优化探索
                  </h3>
                  <p className="text-base" style={{ color: 'var(--ink-mid)' }}>
                    点击左侧按钮开始探索非线性优化的奥秘
                  </p>
                </div>
              </motion.div>
            )}

            {activeDemo === 'source' && (
              <motion.div
                key="source"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full overflow-y-auto"
              >
                <div className="space-y-4">
                  {/* 几何投影 */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 rounded-lg border"
                    style={{ 
                      backgroundColor: 'rgba(168, 85, 247, 0.08)', 
                      borderColor: 'rgba(168, 85, 247, 0.2)' 
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">📐</div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                          几何投影
                        </h4>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                          最经典的例子是摄影测量中的<strong className="text-purple-400">共线方程</strong>。
                          它描述了三维空间点到二维像平面的透视投影关系，这是一个典型的
                          <strong className="text-purple-400">分式非线性</strong>函数。
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* 传感器模型 */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-lg border"
                    style={{ 
                      backgroundColor: 'rgba(251, 146, 60, 0.08)', 
                      borderColor: 'rgba(251, 146, 60, 0.2)' 
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">📡</div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                          传感器模型
                        </h4>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                          许多传感器的物理响应（如遥感器对不同地物的光谱响应、IMU的误差模型）都包含非线性项。
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* 物理过程 */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-lg border"
                    style={{ 
                      backgroundColor: 'rgba(34, 197, 94, 0.08)', 
                      borderColor: 'rgba(34, 197, 94, 0.2)' 
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">🌍</div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                          物理过程
                        </h4>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                          地球物理过程（如大气辐射传输、地表形变）的数学模型通常由复杂的非线性偏微分方程描述。
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* 坐标变换 */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-4 rounded-lg border"
                    style={{ 
                      backgroundColor: 'rgba(239, 68, 68, 0.08)', 
                      borderColor: 'rgba(239, 68, 68, 0.2)' 
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">🔄</div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                          坐标变换
                        </h4>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                          涉及角度（如旋转矩阵）的坐标系变换，本质上是由三角函数（
                          <InlineMath math="\sin, \cos" />）构成的，这些都是高度非线性的。
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* 机器学习模型 */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-4 rounded-lg border"
                    style={{ 
                      backgroundColor: 'rgba(168, 85, 247, 0.08)', 
                      borderColor: 'rgba(168, 85, 247, 0.2)' 
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">🧠</div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                          机器学习模型
                        </h4>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                          现代机器学习，特别是深度神经网络，其核心就是通过
                          <strong className="text-purple-400">激活函数</strong>
                          （如 ReLU, Sigmoid）的层层叠加，来构建一个极其复杂的、高维的非线性映射。
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeDemo === 'optimize' && (
              <motion.div
                key="optimize"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full overflow-y-auto"
              >
                <div className="space-y-4">
                  {/* 3D非凸曲面可视化 */}
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-4 border border-green-500/30">
                    <div className="text-sm mb-3 text-center font-medium" style={{ color: 'var(--ink-mid)' }}>
                      3D非凸优化地形：全局峰值 vs 局部峰值
                    </div>
                    
                    <div className="relative">
                      <canvas
                        ref={canvasRef}
                        width={500}
                        height={320}
                        className="w-full rounded-lg cursor-move border border-green-500/20"
                        style={{ background: 'rgba(15, 23, 42, 0.8)' }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                      />
                      
                      <div className="absolute top-2 right-2 text-xs px-2 py-1 rounded-lg" 
                           style={{ 
                             backgroundColor: 'rgba(34, 197, 94, 0.2)', 
                             color: 'var(--ink-mid)',
                             border: '1px solid rgba(34, 197, 94, 0.3)'
                           }}>
                        🖱️ 拖拽旋转视角
                      </div>

                      {/* 图例 */}
                      <div className="absolute bottom-2 left-2 flex gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-green-500 border border-yellow-400"></div>
                          <span style={{ color: 'var(--ink-mid)' }}>全局峰值 👑</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-yellow-400"></div>
                          <span style={{ color: 'var(--ink-mid)' }}>局部峰值</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeDemo === 'challenge' && (
              <motion.div
                key="challenge"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full overflow-y-auto"
              >
                <div className="space-y-4">
                  {/* 文字说明 */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4 text-sm leading-relaxed" 
                    style={{ color: 'var(--ink-mid)' }}
                  >
                    <div className="bg-gradient-to-r from-orange-500/10 to-purple-500/10 rounded-lg p-4 border border-orange-500/20">
                      <p className="mb-3">
                        非线性彻底改变了优化问题的求解景观，带来了最根本的挑战——
                        <strong className="text-orange-400">局部最优 (Local Optima)</strong> 与 
                        <strong className="text-green-400">全局最优 (Global Optimum)</strong> 的不一致。
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', borderLeft: '3px solid #22c55e' }}>
                        <div className="font-semibold mb-2 text-green-400">
                          🏔️ 在线性（或更广义的凸）世界里
                        </div>
                        <p className="text-xs">
                          任何一个局部最优点，都<strong>必然</strong>是全局最优点。整个优化问题的地形就像一个完美的"碗"，
                          我们从任何地方开始"滚珠子"，最终都必然会到达唯一的碗底。
                        </p>
                      </div>

                      <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid #ef4444' }}>
                        <div className="font-semibold mb-2 text-red-400">
                          ⛰️ 在非线性（非凸）世界里
                        </div>
                        <p className="text-xs">
                          优化问题的地形可能像一个<strong>崎岖的山脉</strong>，充满了大量的山谷（局部最优）和盆地。
                          我们从某个位置开始"滚珠子"（迭代下降），很可能只会滚到离起点最近的那个山谷里，
                          而无法保证能到达整个山脉的最低点（全局最优）。
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500/10 to-orange-500/10 rounded-lg p-3 border border-purple-500/20">
                      <p className="text-xs">
                        这就意味着，对于非线性问题，绝大多数优化算法只能保证
                        <strong className="text-purple-400">收敛到某个局部最优解</strong>，
                        而无法提供全局最优性的证明。最终解的好坏，会严重依赖于
                        <strong className="text-orange-400">初始值的选取</strong>。
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Section4NonlinearWorldStep3