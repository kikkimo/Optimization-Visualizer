import React, { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { InlineMath, BlockMath } from 'react-katex'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const Section4NonlinearWorldStep3 = () => {
  const [activeDemo, setActiveDemo] = useState('source')

  // 多峰函数：基于多个二维高斯分布的叠加
  const surfaceFunction = (x, y) => {
    // 定义多个高斯峰，每个峰有不同的μ(均值)、σ(标准差)、A(幅度)
    const gaussianPeaks = [
      // 全局最大值 - 中心偏右上，幅度最高
      { mu: [2.5, 1.8], sigma: 0.8, A: 8.0 },
      // 局部峰1 - 左上角
      { mu: [-2.2, 2.5], sigma: 0.6, A: 5.5 },
      // 局部峰2 - 右下角  
      { mu: [2.8, -2.2], sigma: 0.7, A: 4.8 },
      // 局部峰3 - 左下角
      { mu: [-2.8, -1.8], sigma: 0.5, A: 4.2 },
      // 局部峰4 - 中心左侧
      { mu: [-0.5, 0.3], sigma: 0.4, A: 3.8 },
      // 局部峰5 - 右上角偏内
      { mu: [1.2, 3.2], sigma: 0.6, A: 4.5 }
    ]
    
    // 计算所有高斯峰的叠加
    let totalValue = 0
    gaussianPeaks.forEach(peak => {
      const dx = x - peak.mu[0]
      const dy = y - peak.mu[1] 
      const exponent = -(dx * dx + dy * dy) / (2 * peak.sigma * peak.sigma)
      totalValue += peak.A * Math.exp(exponent)
    })
    
    // 添加微小的基础波动来增加复杂性
    const baseNoise = 0.2 * Math.sin(0.8 * x) * Math.cos(0.8 * y) + 
                      0.1 * Math.sin(1.2 * x + 0.5) * Math.cos(1.2 * y + 0.3)
    
    return totalValue + baseNoise
  }

  // Three.js曲面组件
  const SmoothSurface = ({ showPeaks = true }) => {
    const meshRef = useRef()
    
    // Rainbow颜色映射函数
    const getRainbowColor = (value, minVal, maxVal) => {
      const normalized = Math.max(0, Math.min(1, (value - minVal) / (maxVal - minVal)))
      const hue = (1 - normalized) * 270 // 270° (紫色) → 0° (红色)
      const saturation = 1.0
      const lightness = 0.6
      
      // HSL转RGB
      const hslToRgb = (h, s, l) => {
        h /= 360
        const a = s * Math.min(l, 1 - l)
        const f = n => {
          const k = (n + h * 12) % 12
          return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
        }
        return [f(0), f(8), f(4)]
      }
      
      return hslToRgb(hue, saturation, lightness)
    }
    
    // 创建曲面几何
    const surfaceGeometry = useMemo(() => {
      const geometry = new THREE.BufferGeometry()
      const vertices = []
      const indices = []
      const colors = []
      
      const size = 60 // 网格密度
      const xRange = 4.0 // X范围 [-4, 4]
      const yRange = 4.0 // Y范围 [-4, 4]
      
      // 预计算所有Z值以确定颜色范围
      let minZ = Infinity, maxZ = -Infinity
      const allPoints = []
      
      for (let i = 0; i <= size; i++) {
        for (let j = 0; j <= size; j++) {
          const x = -xRange + (i / size) * (2 * xRange)
          const y = -yRange + (j / size) * (2 * yRange)
          const z = surfaceFunction(x, y)
          
          minZ = Math.min(minZ, z)
          maxZ = Math.max(maxZ, z)
          allPoints.push({ x, y, z })
        }
      }
      
      // 生成顶点和颜色
      allPoints.forEach(point => {
        vertices.push(point.x, point.z, point.y) // Three.js中Y是垂直轴
        
        // Rainbow颜色映射
        const [r, g, b] = getRainbowColor(point.z, minZ, maxZ)
        colors.push(r, g, b)
      })
      
      // 创建面的索引
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const a = i * (size + 1) + j
          const b = a + size + 1
          const c = a + 1
          const d = b + 1
          
          indices.push(a, b, c)
          indices.push(b, d, c)
        }
      }
      
      geometry.setIndex(indices)
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
      geometry.computeVertexNormals()
      
      return geometry
    }, [])
    
    return (
      <>
        <mesh ref={meshRef} geometry={surfaceGeometry}>
          <meshPhongMaterial 
            vertexColors={true}
            transparent={true}
            opacity={0.8}
            side={THREE.DoubleSide}
            shininess={30}
          />
        </mesh>
        
        {/* 峰值点标记 */}
        {showPeaks && (
          <>
            {/* 全局最大值点 */}
            <mesh position={[2.5, surfaceFunction(2.5, 1.8), 1.8]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshPhongMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} />
            </mesh>
            
            {/* 局部峰值点 */}
            {[
              [-2.2, 2.5], [2.8, -2.2], [-2.8, -1.8], 
              [-0.5, 0.3], [1.2, 3.2]
            ].map((pos, index) => (
              <mesh key={index} position={[pos[0], surfaceFunction(pos[0], pos[1]), pos[1]]}>
                <sphereGeometry args={[0.12, 16, 16]} />
                <meshPhongMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.2} />
              </mesh>
            ))}
          </>
        )}
      </>
    )
  }
  
  // Rainbow颜色映射函数 - 保持向后兼容
  const getRainbow = (t) => {
    t = Math.max(0, Math.min(1, t))
    const h = (1 - t) * 270
    const s = 80
    const l = 55
    return { h, s, l }
  }



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
               background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 50%, rgba(51, 65, 85, 0.3) 100%)',
               borderColor: 'rgba(34, 197, 94, 0.3)',
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
                className="h-full relative"
              >
                <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-20 text-sm font-medium px-3 py-1 rounded-md" 
                     style={{ 
                       color: 'var(--ink-mid)',
                       backgroundColor: 'rgba(15, 23, 42, 0.8)',
                       border: '1px solid rgba(34, 197, 94, 0.3)'
                     }}>
                  3D非凸优化地形：全局峰值 vs 局部峰值
                </div>
                
                <Canvas 
                  camera={{ position: [8, 6, 8], fov: 60 }}
                  style={{ 
                    width: '100%',
                    height: '100%',
                    background: 'rgba(15, 23, 42, 0.1)'
                  }}
                >
                  <ambientLight intensity={0.4} />
                  <pointLight position={[10, 10, 10]} intensity={1.2} />
                  <pointLight position={[-5, -5, -5]} intensity={0.4} />
                  
                  <SmoothSurface showPeaks={true} />
                  
                  <OrbitControls
                    enableZoom={true}
                    enablePan={true}
                    enableRotate={true}
                    maxPolarAngle={Math.PI * 0.8}
                    minDistance={5}
                    maxDistance={20}
                  />
                </Canvas>
                
                <div className="absolute top-2 right-2 text-xs px-2 py-1 rounded-lg z-20" 
                     style={{ 
                       backgroundColor: 'rgba(34, 197, 94, 0.2)', 
                       color: 'var(--ink-mid)',
                       border: '1px solid rgba(34, 197, 94, 0.3)'
                     }}>
                  🖱️ 鼠标控制：旋转/缩放/漫游
                </div>

                {/* 图例 */}
                <div className="absolute bottom-2 left-2 flex gap-3 text-xs z-20">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md" 
                       style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                    <div className="w-3 h-3 rounded-full bg-green-500 border border-yellow-400"></div>
                    <span style={{ color: 'var(--ink-mid)' }}>全局峰值 👑</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md" 
                       style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-yellow-400"></div>
                    <span style={{ color: 'var(--ink-mid)' }}>局部峰值</span>
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