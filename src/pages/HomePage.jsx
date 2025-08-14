import React, { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const HomePage = () => {
  const heroRef = useRef()
  const titleRef = useRef()
  const buttonRef = useRef()
  const scrollHintRef = useRef()
  const examplesRef = useRef()
  const dailyExampleRef = useRef()
  const mappingExampleRef = useRef()
  const revealRef = useRef()
  
  const [currentView, setCurrentView] = useState('before') // before, after
  const [gamePoints, setGamePoints] = useState([
    { id: 1, x: 100, y: 200, label: 'A' },
    { id: 2, x: 300, y: 150, label: 'B' },
    { id: 3, x: 250, y: 300, label: 'C' },
    { id: 4, x: 450, y: 250, label: 'D' }
  ])
  const [dragPoint, setDragPoint] = useState(null)
  const [pathLength, setPathLength] = useState(0)

  useEffect(() => {
    // 首页标题动画
    const tl = gsap.timeline()
    tl.fromTo(titleRef.current, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.5, ease: "power3.out" }
    )
    .fromTo(buttonRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)" },
      "-=0.5"
    )
    .fromTo(scrollHintRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 },
      "-=0.3"
    )

    // 滚动触发例子展示
    ScrollTrigger.create({
      trigger: examplesRef.current,
      start: "top 80%",
      end: "bottom 20%",
      onEnter: () => {
        gsap.fromTo(dailyExampleRef.current,
          { opacity: 0, x: -100 },
          { opacity: 1, x: 0, duration: 1, ease: "power2.out" }
        )
        gsap.fromTo(mappingExampleRef.current,
          { opacity: 0, x: 100 },
          { opacity: 1, x: 0, duration: 1, ease: "power2.out", delay: 0.3 }
        )
      }
    })

    // 主题揭示动画
    ScrollTrigger.create({
      trigger: revealRef.current,
      start: "top 80%",
      onEnter: () => {
        const keywords = revealRef.current.querySelectorAll('.keyword')
        gsap.fromTo(keywords,
          { opacity: 0, scale: 0.5 },
          { 
            opacity: 1, 
            scale: 1, 
            duration: 0.8,
            stagger: 0.2,
            ease: "back.out(1.7)"
          }
        )
      }
    })

    // 计算路径长度
    calculatePathLength()

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [gamePoints])

  const calculatePathLength = () => {
    let totalLength = 0
    for (let i = 0; i < gamePoints.length - 1; i++) {
      const dx = gamePoints[i + 1].x - gamePoints[i].x
      const dy = gamePoints[i + 1].y - gamePoints[i].y
      totalLength += Math.sqrt(dx * dx + dy * dy)
    }
    setPathLength(Math.round(totalLength))
  }

  const handleStartExploring = () => {
    gsap.to(window, {
      duration: 1.5,
      scrollTo: examplesRef.current,
      ease: "power2.out"
    })
  }

  const handleMouseDown = (point, e) => {
    e.preventDefault()
    setDragPoint(point.id)
  }

  const handleMouseMove = (e) => {
    if (dragPoint && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      setGamePoints(prev => prev.map(p => 
        p.id === dragPoint ? { ...p, x: Math.max(20, Math.min(x, 480)), y: Math.max(20, Math.min(y, 280)) } : p
      ))
    }
  }

  const handleMouseUp = () => {
    setDragPoint(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700">
      {/* Hero Section - 简洁的标题页 */}
      <section ref={heroRef} className="min-h-screen flex flex-col items-center justify-center relative">
        <div ref={titleRef} className="text-center space-y-8 px-4">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              数学优化问题
            </span>
            <span className="block text-3xl md:text-5xl mt-4 text-gray-300">
              及其在测绘领域的应用
            </span>
          </h1>
        </div>

        <div ref={buttonRef} className="mt-16">
          <button
            onClick={handleStartExploring}
            className="group relative px-12 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-semibold rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <span className="flex items-center space-x-3">
              <span>开始探索</span>
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m0 0V3" />
              </svg>
            </span>
          </button>
        </div>

        <div ref={scrollHintRef} className="absolute bottom-8 text-center">
          <p className="text-gray-400 text-sm mb-4">或使用鼠标滚轮继续</p>
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center mx-auto">
            <div className="w-1 h-3 bg-gray-400 rounded-full animate-bounce mt-2"></div>
          </div>
        </div>
      </section>

      {/* 破冰与引入 - 两个例子 */}
      <section ref={examplesRef} className="min-h-screen py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">优化无处不在</h2>
            <p className="text-xl text-gray-300">让我们从两个例子开始理解优化问题</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* 日常生活例子 - 路径优化小游戏 */}
            <div ref={dailyExampleRef} className="bg-gray-800 rounded-xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-blue-400 mb-3">日常类比：最短路径规划</h3>
                <p className="text-gray-300">拖动下方地图上的点，观察路径长度的变化</p>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <svg
                  width="500"
                  height="300"
                  className="w-full h-auto cursor-move"
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {/* 背景网格 */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* 路径线 */}
                  {gamePoints.map((point, index) => {
                    if (index === gamePoints.length - 1) return null
                    const nextPoint = gamePoints[index + 1]
                    return (
                      <line
                        key={`line-${index}`}
                        x1={point.x}
                        y1={point.y}
                        x2={nextPoint.x}
                        y2={nextPoint.y}
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    )
                  })}
                  
                  {/* 点 */}
                  {gamePoints.map((point) => (
                    <g key={point.id}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="12"
                        fill="#10b981"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                        onMouseDown={(e) => handleMouseDown(point, e)}
                      />
                      <text
                        x={point.x}
                        y={point.y + 5}
                        textAnchor="middle"
                        fill="white"
                        fontSize="12"
                        fontWeight="bold"
                        className="pointer-events-none select-none"
                      >
                        {point.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-500/20 rounded-lg p-3 inline-block">
                  <span className="text-blue-300 font-semibold">
                    当前路径长度: {pathLength} 像素
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  🎯 拖动点位，尝试找到最短路径
                </p>
              </div>
            </div>

            {/* 测绘领域例子 - 图像拼接对比 */}
            <div ref={mappingExampleRef} className="bg-gray-800 rounded-xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-green-400 mb-3">测绘应用：图像拼接优化</h3>
                <p className="text-gray-300">点击按钮查看优化前后的航拍影像拼接效果</p>
              </div>
              
              <div className="relative bg-gray-900 rounded-lg overflow-hidden h-64 mb-4">
                {currentView === 'before' ? (
                  // 优化前 - 明显错位
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 opacity-70"></div>
                    <div className="absolute inset-4 border-4 border-dashed border-red-300 rounded">
                      <div className="w-full h-full relative overflow-hidden">
                        {/* 模拟错位的图像块 */}
                        <div className="absolute w-32 h-32 bg-red-500 opacity-60 transform rotate-3 translate-x-2 translate-y-2"></div>
                        <div className="absolute w-32 h-32 bg-orange-500 opacity-60 transform -rotate-2 translate-x-20 translate-y-8"></div>
                        <div className="absolute w-32 h-32 bg-yellow-500 opacity-60 transform rotate-1 translate-x-40 translate-y-4"></div>
                        <div className="absolute bottom-4 left-4 text-red-200 text-sm font-bold">
                          ❌ 图像块错位严重
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // 优化后 - 完美拼接
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 opacity-70"></div>
                    <div className="absolute inset-4 border-4 border-solid border-green-300 rounded">
                      <div className="w-full h-full relative overflow-hidden">
                        {/* 模拟完美拼接的图像 */}
                        <div className="absolute w-32 h-32 bg-green-500 opacity-60"></div>
                        <div className="absolute w-32 h-32 bg-blue-500 opacity-60 translate-x-20"></div>
                        <div className="absolute w-32 h-32 bg-cyan-500 opacity-60 translate-x-40"></div>
                        <div className="absolute bottom-4 left-4 text-green-200 text-sm font-bold">
                          ✅ 完美无缝拼接
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 切换按钮 */}
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  <button
                    onClick={() => setCurrentView('before')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                      currentView === 'before' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    优化前
                  </button>
                  <button
                    onClick={() => setCurrentView('after')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                      currentView === 'after' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    优化后
                  </button>
                </div>
              </div>
              
              <div className="text-center">
                <div className={`rounded-lg p-3 inline-block transition-all duration-300 ${
                  currentView === 'before' 
                    ? 'bg-red-500/20 text-red-300' 
                    : 'bg-green-500/20 text-green-300'
                }`}>
                  <span className="font-semibold">
                    {currentView === 'before' 
                      ? '误差: ±15.2m RMSE' 
                      : '误差: ±0.8m RMSE'
                    }
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  🔧 通过数学优化算法大幅提升拼接精度
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 主题揭示 */}
      <section ref={revealRef} className="py-20 bg-gradient-to-t from-gray-900 to-gray-800">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            数学优化是测绘精度的核心驱动力
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {[
              { text: '精度', color: 'text-blue-400 border-blue-400' },
              { text: '数据融合', color: 'text-green-400 border-green-400' },
              { text: '最优解', color: 'text-purple-400 border-purple-400' },
              { text: '算法收敛', color: 'text-pink-400 border-pink-400' },
              { text: '约束优化', color: 'text-yellow-400 border-yellow-400' },
              { text: '误差最小化', color: 'text-cyan-400 border-cyan-400' },
              { text: '参数估计', color: 'text-indigo-400 border-indigo-400' },
              { text: '全局最优', color: 'text-red-400 border-red-400' }
            ].map((keyword, index) => (
              <div
                key={index}
                className={`keyword border-2 rounded-xl p-4 ${keyword.color} hover:scale-110 transition-transform cursor-pointer`}
              >
                <span className="font-bold text-lg">{keyword.text}</span>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-8 border border-blue-500/30">
            <p className="text-xl text-gray-300 leading-relaxed">
              从日常的路径规划到复杂的测绘数据处理，
              <span className="text-blue-400 font-semibold"> 数学优化算法</span>
              为我们提供了寻找最佳解决方案的系统性方法。
            </p>
            <p className="text-lg text-gray-400 mt-4">
              接下来，让我们深入探索这些算法在测绘领域的精彩应用...
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage