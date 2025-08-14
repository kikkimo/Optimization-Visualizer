import React, { useRef, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const FunctionSurface = ({ constraintRange }) => {
  const meshRef = useRef()
  const ballRef = useRef()
  const [ballPosition, setBallPosition] = useState([2, 1, 2])

  const createSurfaceGeometry = () => {
    const geometry = []
    const size = 50
    const step = 0.2
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const x = (i - size/2) * step
        const z = (j - size/2) * step
        const y = 0.1 * (x*x + z*z) + 0.05 * Math.sin(x*2) * Math.cos(z*2)
        
        geometry.push([x, y, z])
      }
    }
    return geometry
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setBallPosition(prev => {
        const [x, y, z] = prev
        const newX = x + (Math.random() - 0.5) * 0.1 - x * 0.1
        const newZ = z + (Math.random() - 0.5) * 0.1 - z * 0.1
        const newY = 0.1 * (newX*newX + newZ*newZ) + 0.05 * Math.sin(newX*2) * Math.cos(newZ*2) + 0.3
        return [newX, newY, newZ]
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  const surfacePoints = createSurfaceGeometry()
  
  return (
    <>
      <group ref={meshRef}>
        {surfacePoints.filter((_, index) => index % 5 === 0).map((point, index) => {
          const [x, y, z] = point
          const inConstraint = x >= -constraintRange && x <= constraintRange && 
                              z >= -constraintRange && z <= constraintRange
          
          return (
            <mesh key={index} position={[x, y, z]}>
              <boxGeometry args={[0.05, 0.05, 0.05]} />
              <meshBasicMaterial 
                color={inConstraint ? '#3b82f6' : '#6b7280'} 
                opacity={inConstraint ? 0.8 : 0.3}
                transparent
              />
            </mesh>
          )
        })}
      </group>
      
      <mesh ref={ballRef} position={ballPosition}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>
      
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[20, 20, 20, 20]} />
        <meshBasicMaterial 
          color="#1f2937" 
          wireframe 
          opacity={0.3}
          transparent
        />
      </mesh>
    </>
  )
}

const ConceptPage = () => {
  const sectionRef = useRef()
  const titleRef = useRef()
  const [constraintRange, setConstraintRange] = useState(3)
  const [showFeasibleRegion, setShowFeasibleRegion] = useState(true)

  useEffect(() => {
    const section = sectionRef.current
    
    ScrollTrigger.create({
      trigger: section,
      start: "top center",
      end: "bottom center",
      onEnter: () => {
        gsap.fromTo(titleRef.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
        )
      },
      onLeave: () => {
        gsap.to(titleRef.current, {
          opacity: 0.7,
          duration: 0.5
        })
      },
      onEnterBack: () => {
        gsap.to(titleRef.current, {
          opacity: 1,
          duration: 0.5
        })
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <div ref={sectionRef} className="section-container bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto">
        <h2 ref={titleRef} className="section-title mb-12">
          概念与直观理解
        </h2>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-blue-400">函数优化的几何理解</h3>
              <p className="text-gray-300 leading-relaxed">
                右侧的3D可视化展示了一个典型的优化问题：寻找函数的最小值点。
                绿色小球代表当前解，它会逐渐向最低点（全局最小值）移动。
              </p>
            </div>

            <div className="space-y-6 bg-gray-800 p-6 rounded-xl">
              <h4 className="text-xl font-semibold text-purple-400">约束与可行域</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    约束范围: ±{constraintRange.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={constraintRange}
                    onChange={(e) => setConstraintRange(parseFloat(e.target.value))}
                    className="param-slider w-full"
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="feasible-region"
                    checked={showFeasibleRegion}
                    onChange={(e) => setShowFeasibleRegion(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="feasible-region" className="text-gray-300">
                    显示可行域（蓝色区域）
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm font-medium">可行解</span>
                </div>
                <p className="text-xs text-gray-400">满足约束条件的解</p>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">当前解</span>
                </div>
                <p className="text-xs text-gray-400">迭代过程中的解</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 rounded-xl border border-blue-500/30">
              <h4 className="text-lg font-semibold mb-3 text-blue-300">核心概念</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>目标函数</strong>：需要最小化（或最大化）的函数</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>约束条件</strong>：解必须满足的限制条件</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>可行域</strong>：所有满足约束的解的集合</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span><strong>最优解</strong>：可行域内目标函数的最小值点</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="h-96 lg:h-[600px] bg-gray-800 rounded-xl overflow-hidden">
            <Canvas camera={{ position: [8, 6, 8], fov: 60 }}>
              <ambientLight intensity={0.6} />
              <pointLight position={[10, 10, 10]} intensity={0.8} />
              <pointLight position={[-10, -10, -10]} intensity={0.3} />
              
              <FunctionSurface 
                constraintRange={showFeasibleRegion ? constraintRange : 0}
              />
              
              <OrbitControls
                enableZoom={true}
                enablePan={true}
                enableRotate={true}
                maxDistance={15}
                minDistance={5}
              />
            </Canvas>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConceptPage