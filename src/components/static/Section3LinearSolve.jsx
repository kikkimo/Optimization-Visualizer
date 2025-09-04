import React, { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import DownHint from '../shared/DownHint'
import Section3LinearSolveStep1 from './Section3LinearSolveStep1'
import Section3LinearSolveStep2 from './Section3LinearSolveStep2'
import Section3LinearSolveStep3 from './Section3LinearSolveStep3'
import Section3LinearSolveStep4 from './Section3LinearSolveStep4'

gsap.registerPlugin(ScrollTrigger)

const Section3LinearSolve = ({ id, currentSection, totalSections }) => {
  const sectionRef = useRef()
  
  // 状态管理
  const [currentStage, setCurrentStage] = useState('page1')
  
  // 导航项定义 - 线性求解主题
  const navigationItems = [
    { id: 'page1', label: '1', title: 'm=n, 非奇异', description: '直接发 / 迭代法 / 共轭梯度' },
    { id: 'page2', label: '2', title: '梯度下降法', description: '系统化的求解策略' },
    { id: 'page3', label: '3', title: 'm > n, 列满秩', description: '方程法化 / Cholesky / QR 分解' },
    { id: 'page4', label: '4', title: 'm < n, 行满秩', description: 'SVD / 伪逆' }
  ]

  // 处理阶段切换
  const handleStageChange = (stageId) => {
    // 先取消现有动画
    gsap.killTweensOf('.stage-content')
    
    // 淡出当前内容
    gsap.to('.stage-content', {
      opacity: 0,
      y: -10,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setCurrentStage(stageId)
      }
    })
  }

  // 初始滚动动画
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top center",
      once: true, // 只触发一次
      onEnter: () => {
        // 导航项入场动画
        gsap.fromTo('.nav-item',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
        )
      }
    })

    return () => {
      trigger.kill()
    }
  }, [])
  
  // 阶段切换时的内容动画
  useEffect(() => {
    // 取消任何现有的动画
    gsap.killTweensOf('.stage-content')
    
    // 内容淡入动画
    gsap.fromTo('.stage-content',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    )
  }, [currentStage])

  // 渲染页面内容
  const renderStageContent = () => {
    const currentItem = navigationItems.find(item => item.id === currentStage)
    
    switch (currentStage) {
      case 'page1':
        try {
          return (
            <div className="stage-content h-full w-full">
              <Section3LinearSolveStep1 />
            </div>
          )
        } catch (error) {
          return (
            <div className="stage-content h-full flex flex-col items-center justify-center">
              <div className="text-center text-red-400">
                <h3>组件加载错误</h3>
                <p>{error.message}</p>
              </div>
            </div>
          )
        }
      case 'page2':
        try {
          return (
            <div className="stage-content h-full w-full">
              <Section3LinearSolveStep2 />
            </div>
          )
        } catch (error) {
          return (
            <div className="stage-content h-full flex flex-col items-center justify-center">
              <div className="text-center text-red-400">
                <h3>组件加载错误</h3>
                <p>{error.message}</p>
              </div>
            </div>
          )
        }
      case 'page3':
        try {
          return (
            <div className="stage-content h-full w-full">
              <Section3LinearSolveStep3 />
            </div>
          )
        } catch (error) {
          return (
            <div className="stage-content h-full flex flex-col items-center justify-center">
              <div className="text-center text-red-400">
                <h3>组件加载错误</h3>
                <p>{error.message}</p>
              </div>
            </div>
          )
        }
      case 'page4':
        try {
          return (
            <div className="stage-content h-full w-full">
              <Section3LinearSolveStep4 />
            </div>
          )
        } catch (error) {
          return (
            <div className="stage-content h-full flex flex-col items-center justify-center">
              <div className="text-center text-red-400">
                <h3>组件加载错误</h3>
                <p>{error.message}</p>
              </div>
            </div>
          )
        }
      default:
        return (
          <div className="stage-content h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--ink-high)' }}>
                {currentItem?.title}
              </h2>
              <p className="text-lg mb-8" style={{ color: 'var(--ink-mid)' }}>
                {currentItem?.description}
              </p>
              
              {/* 占位内容区域 */}
              <div className="mt-12 p-8 rounded-2xl border max-w-2xl backdrop-blur-sm" style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)',
                borderColor: 'rgba(34, 197, 94, 0.3)',
                boxShadow: '0 8px 25px -8px rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
              }}>
                <p className="text-base font-medium" style={{ color: 'rgba(229, 231, 235, 0.9)' }}>
                  {currentItem?.title} - 内容开发中...
                </p>
                <p className="text-sm mt-2" style={{ color: 'rgba(34, 197, 94, 0.7)' }}>
                  这里将展示具体的求解算法和交互效果
                </p>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <section
      ref={sectionRef}
      id={id}
      className="snap-section relative overflow-hidden"
      style={{ 
        backgroundColor: 'var(--bg-deep)',
        minHeight: '100vh',
        paddingTop: '75px',
        paddingBottom: '95px'
      }}
    >
      {/* 线性求解主题背景动画 - 采用 Section1Definition 风格 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-deep)]">
        {/* 线性变换等高线 - 表示线性方程组解空间 */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.32]" viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="linearSolveGradient1" cx="30%" cy="40%">
              <stop offset="0%" style={{ stopColor: 'rgb(34, 197, 94)', stopOpacity: 0.6 }} />
              <stop offset="50%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: 'transparent', stopOpacity: 0 }} />
            </radialGradient>
            <radialGradient id="linearSolveGradient2" cx="70%" cy="60%">
              <stop offset="0%" style={{ stopColor: 'rgb(168, 85, 247)', stopOpacity: 0.5 }} />
              <stop offset="50%" style={{ stopColor: 'rgb(236, 72, 153)', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: 'transparent', stopOpacity: 0 }} />
            </radialGradient>
            <linearGradient id="solutionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'rgb(60, 230, 192)', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: 'rgb(34, 197, 94)', stopOpacity: 0.4 }} />
            </linearGradient>
          </defs>
          
          {/* 解空间等高线椭圆 - 动态缩放 */}
          <ellipse cx="420" cy="320" rx="200" ry="120" 
                   fill="url(#linearSolveGradient1)" 
                   className="animate-solution-contour-pulse" 
                   style={{ animationDelay: '0s' }} />
          <ellipse cx="420" cy="320" rx="150" ry="90" 
                   fill="none" 
                   stroke="rgba(34, 197, 94, 0.5)" 
                   strokeWidth="2" 
                   strokeDasharray="8,4"
                   className="animate-solution-contour-pulse" 
                   style={{ animationDelay: '1s' }} />
          
          <ellipse cx="980" cy="480" rx="180" ry="100" 
                   fill="url(#linearSolveGradient2)" 
                   className="animate-solution-contour-pulse" 
                   style={{ animationDelay: '2s' }} />
          <ellipse cx="980" cy="480" rx="130" ry="75" 
                   fill="none" 
                   stroke="rgba(168, 85, 247, 0.5)" 
                   strokeWidth="2" 
                   strokeDasharray="6,3"
                   className="animate-solution-contour-pulse" 
                   style={{ animationDelay: '3s' }} />
          
          {/* 求解迭代轨迹 - 梯度下降收敛路径 */}
          <path d="M 200 600 Q 350 500, 420 320 Q 500 200, 650 180 Q 800 160, 980 180 Q 1100 200, 1200 150"
                fill="none" 
                stroke="url(#solutionGradient)" 
                strokeWidth="3"
                strokeDasharray="0 2000"
                className="animate-solution-path"
                style={{ animationDuration: '15s' }} />
          
          {/* 解向量收敛粒子 - 沿路径运动 */}
          <circle r="5" fill="rgb(60, 230, 192)" className="animate-solution-particle">
            <animateMotion dur="15s" repeatCount="indefinite" begin="1s">
              <mpath href="#solution-particle-path" />
            </animateMotion>
            <animate attributeName="r" values="5;8;5" dur="1s" repeatCount="indefinite" />
          </circle>
          
          {/* 辅助解粒子 */}
          <circle r="3" fill="rgb(34, 197, 94)" opacity="0.7" className="animate-solution-particle">
            <animateMotion dur="18s" repeatCount="indefinite" begin="3s">
              <mpath href="#solution-particle-path" />
            </animateMotion>
            <animate attributeName="r" values="3;6;3" dur="0.8s" repeatCount="indefinite" />
          </circle>
          
          {/* 隐藏路径定义 */}
          <path id="solution-particle-path" d="M 200 600 Q 350 500, 420 320 Q 500 200, 650 180 Q 800 160, 980 180 Q 1100 200, 1200 150" fill="none" stroke="none" />
        </svg>
        
        {/* 数学符号群 - 采用 Section1Definition 风格 */}
        <div className="absolute inset-0 opacity-[0.32]">
          {/* 线性代数符号群 */}
          <div className="floating-math-symbol absolute top-[15%] left-[8%] text-5xl text-teal-400 animate-math-float-enhanced">Ax=b</div>
          <div className="floating-math-symbol absolute top-[25%] right-[12%] text-4xl text-blue-400 animate-math-float-enhanced" style={{ animationDelay: '2s' }}>det</div>
          <div className="floating-math-symbol absolute bottom-[30%] left-[15%] text-6xl text-green-400 animate-math-float-enhanced" style={{ animationDelay: '4s' }}>LU</div>
          <div className="floating-math-symbol absolute bottom-[20%] right-[8%] text-4xl text-purple-400 animate-math-float-enhanced" style={{ animationDelay: '6s' }}>QR</div>
          <div className="floating-math-symbol absolute top-[60%] left-[5%] text-5xl text-yellow-400 animate-math-float-enhanced" style={{ animationDelay: '1s' }}>SVD</div>
          <div className="floating-math-symbol absolute top-[70%] right-[20%] text-4xl text-pink-400 animate-math-float-enhanced" style={{ animationDelay: '3s' }}>λᵢ</div>
          
          {/* 额外的求解符号 */}
          <div className="floating-math-symbol absolute top-[40%] left-[25%] text-3xl text-cyan-400 animate-math-float-enhanced" style={{ animationDelay: '5s' }}>rank</div>
          <div className="floating-math-symbol absolute top-[50%] right-[30%] text-3xl text-emerald-400 animate-math-float-enhanced" style={{ animationDelay: '7s' }}>κ(A)</div>
          <div className="floating-math-symbol absolute bottom-[50%] left-[40%] text-4xl text-indigo-400 animate-math-float-enhanced" style={{ animationDelay: '8s' }}>‖x‖</div>
          <div className="floating-math-symbol absolute bottom-[40%] right-[45%] text-3xl text-orange-400 animate-math-float-enhanced" style={{ animationDelay: '9s' }}>A⁻¹</div>
        </div>
        
        {/* 解空间脉冲网格 */}
        <div className="absolute inset-0 opacity-[0.18]">
          <div className="w-full h-full animate-solution-region-pulse" style={{
            backgroundImage: `
              radial-gradient(circle at 25% 30%, rgba(60, 230, 192, 0.4) 2px, transparent 3px),
              radial-gradient(circle at 75% 70%, rgba(34, 197, 94, 0.3) 2px, transparent 3px),
              linear-gradient(45deg, transparent 48%, rgba(60, 230, 192, 0.2) 49%, rgba(60, 230, 192, 0.2) 51%, transparent 52%)
            `,
            backgroundSize: '80px 80px, 100px 100px, 160px 160px',
          }} />
        </div>
        
      </div>

      {/* 内容容器 - 参考 Section2LinearWorld.jsx */}
      <div className="relative z-10 h-full mx-auto" style={{ width: '92%', maxWidth: '1400px' }}>
        {/* 主要内容区域 */}
        <div className="flex gap-6" style={{ height: 'calc(100vh - 180px)' }}>
          {/* 主内容面板（75%） */}
          <div className="flex-1">
            <div 
              className="h-full rounded-2xl backdrop-blur-sm p-8"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.06) 0%, rgba(59, 130, 246, 0.04) 100%)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                boxShadow: '0 10px 30px -10px rgba(34, 197, 94, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
              }}
            >
              {renderStageContent()}
            </div>
          </div>

          {/* 右侧导航面板（25%） */}
          <div style={{ minWidth: '280px', maxWidth: '320px' }}>
            <div 
              className="h-full rounded-2xl backdrop-blur-sm overflow-hidden relative"
              style={{
                background: 'linear-gradient(145deg, rgba(34, 197, 94, 0.12) 0%, rgba(59, 130, 246, 0.08) 60%, rgba(15, 23, 42, 0.9) 100%)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                boxShadow: '0 15px 35px -10px rgba(34, 197, 94, 0.25)'
              }}
            >
              {/* 装饰性渐变背景 */}
              <div className="absolute inset-0 opacity-25">
                <div 
                  className="absolute top-0 left-0 w-full h-20"
                  style={{
                    background: 'radial-gradient(ellipse at top, rgba(34, 197, 94, 0.4) 0%, transparent 70%)'
                  }}
                />
                <div 
                  className="absolute bottom-0 right-0 w-24 h-24"
                  style={{
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
                    filter: 'blur(20px)'
                  }}
                />
              </div>

              {/* 主标题区域 */}
              <div className="relative p-6 text-center">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold mb-2" style={{ color: '#E8EAED', letterSpacing: '0.5px' }}>
                    线性求解
                  </h1>
                  <div className="flex items-center justify-center space-x-1 mb-4">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent" />
                    <div className="text-xs" style={{ color: 'rgba(34, 197, 94, 0.8)', letterSpacing: '1px' }}>
                      LINEAR SOLVE
                    </div>
                    <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
                  </div>
                </div>
                
                {/* 数学装饰符号 - 求解主题 */}
                <div className="absolute -top-2 -right-2 opacity-20">
                  <div className="text-3xl text-green-400 animate-spin-slow">⊕</div>
                </div>
                <div className="absolute -bottom-1 -left-1 opacity-15">
                  <div className="text-2xl text-teal-400 animate-pulse">∇²</div>
                </div>
              </div>
              
              {/* 导航按钮区域 - 采用 Section2LinearWorld 的按钮风格但使用系统主题色 */}
              <div className="relative px-4 pb-6 space-y-3">
                {navigationItems.map((item, index) => {
                  const isActive = currentStage === item.id
                  
                  return (
                    <button
                      key={item.id}
                      className="nav-item w-full text-left rounded-2xl transition-all duration-500 transform relative overflow-hidden group"
                      onClick={() => handleStageChange(item.id)}
                      style={{
                        padding: '18px 14px',
                        background: isActive 
                          ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(59, 130, 246, 0.15) 100%)'
                          : 'rgba(15, 23, 42, 0.4)',
                        border: '1px solid',
                        borderColor: isActive 
                          ? 'rgba(34, 197, 94, 0.4)' 
                          : 'rgba(75, 85, 99, 0.2)',
                        boxShadow: isActive 
                          ? '0 8px 25px -8px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)' 
                          : '0 4px 15px -4px rgba(0, 0, 0, 0.1)',
                        transform: isActive ? 'scale(1.02) translateY(-2px)' : 'scale(1)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(59, 130, 246, 0.05) 100%)'
                          e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.3)'
                          e.currentTarget.style.transform = 'scale(1.01) translateY(-1px)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(15, 23, 42, 0.4)'
                          e.currentTarget.style.borderColor = 'rgba(75, 85, 99, 0.2)'
                          e.currentTarget.style.transform = 'scale(1)'
                        }
                      }}
                    >
                      {/* 发光效果 */}
                      {isActive && (
                        <div 
                          className="absolute inset-0 opacity-30"
                          style={{
                            background: 'linear-gradient(45deg, transparent 30%, rgba(34, 197, 94, 0.1) 50%, transparent 70%)',
                            animation: 'shimmer 2s ease-in-out infinite'
                          }}
                        />
                      )}
                      
                      <div className="relative flex items-center space-x-4">
                        {/* 几何图标 */}
                        <div className="flex-shrink-0">
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: isActive 
                              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(59, 130, 246, 0.2) 100%)'
                              : 'rgba(75, 85, 99, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            fontWeight: '700',
                            color: isActive ? '#34D399' : 'rgba(156, 163, 175, 0.8)',
                            border: '1px solid',
                            borderColor: isActive ? 'rgba(34, 197, 94, 0.4)' : 'rgba(75, 85, 99, 0.3)',
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            {/* 背景动效 */}
                            {isActive && (
                              <div 
                                className="absolute inset-0 opacity-50"
                                style={{
                                  background: 'conic-gradient(from 0deg, transparent, rgba(34, 197, 94, 0.2), transparent)',
                                  animation: 'rotate 3s linear infinite'
                                }}
                              />
                            )}
                            <span className="relative z-10">{item.label}</span>
                          </div>
                        </div>
                        
                        {/* 文字内容 */}
                        <div className="flex-1 min-w-0">
                          <div style={{ 
                            fontSize: '13px',
                            fontWeight: '600',
                            color: isActive ? '#E8EAED' : 'rgba(229, 231, 235, 0.8)',
                            marginBottom: '4px',
                            letterSpacing: '0.3px'
                          }}>
                            {item.title}
                          </div>
                          <div style={{ 
                            fontSize: '10px',
                            color: isActive ? 'rgba(52, 211, 153, 0.8)' : 'rgba(156, 163, 175, 0.6)',
                            lineHeight: '1.4',
                            letterSpacing: '0.2px'
                          }}>
                            {item.description}
                          </div>
                        </div>
                        
                        {/* 激活指示器 */}
                        {isActive && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-8 rounded-full bg-gradient-to-b from-green-400 to-blue-500 animate-pulse" />
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 下一页提示 */}
      {currentSection < totalSections - 1 && (
        <DownHint targetSection={3} text="向下滚动继续" isStatic={true} />
      )}
      
      {/* 动效样式 - 采用 Section1Definition 风格 */}
      <style jsx>{`
        /* 数学符号增强浮动动画 - 复用 Section1Definition 风格 */
        @keyframes math-float-enhanced {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg) scale(1); 
            opacity: 0.5; 
            filter: brightness(1);
          }
          25% { 
            transform: translateY(-20px) rotate(2.5deg) scale(1.08); 
            opacity: 0.7; 
            filter: brightness(1.15);
          }
          50% { 
            transform: translateY(-12px) rotate(-1.5deg) scale(1.04); 
            opacity: 0.8; 
            filter: brightness(1.3);
          }
          75% { 
            transform: translateY(-25px) rotate(1.5deg) scale(1.12); 
            opacity: 0.6; 
            filter: brightness(1.08);
          }
        }
        
        @keyframes solution-contour-pulse {
          0%, 100% { 
            transform: scale(1) rotate(0deg); 
            opacity: 0.3; 
          }
          33% { 
            transform: scale(1.1) rotate(1deg); 
            opacity: 0.5; 
          }
          66% { 
            transform: scale(0.95) rotate(-1deg); 
            opacity: 0.4; 
          }
        }
        
        @keyframes solution-path {
          0% { 
            stroke-dasharray: 0 2000; 
            opacity: 0.35; 
            filter: brightness(1);
          }
          30% { 
            stroke-dasharray: 600 2000; 
            opacity: 0.7; 
            filter: brightness(1.3) drop-shadow(0 0 6px currentColor);
          }
          70% { 
            stroke-dasharray: 1400 2000; 
            opacity: 0.55; 
            filter: brightness(1.15) drop-shadow(0 0 4px currentColor);
          }
          100% { 
            stroke-dasharray: 2000 2000; 
            opacity: 0.3; 
            filter: brightness(1);
          }
        }
        
        @keyframes solution-region-pulse {
          0%, 100% { 
            transform: scale(1) rotate(0deg); 
            opacity: 0.2; 
          }
          50% { 
            transform: scale(1.02) rotate(0.5deg); 
            opacity: 0.4; 
          }
        }
        
        .animate-math-float-enhanced {
          animation: math-float-enhanced 10s ease-in-out infinite;
        }
        
        .animate-solution-contour-pulse {
          animation: solution-contour-pulse 8s ease-in-out infinite;
        }
        
        .animate-solution-path {
          animation: solution-path infinite linear;
        }
        
        .animate-solution-particle {
          filter: drop-shadow(0 0 6px currentColor);
        }
        
        .animate-solution-region-pulse {
          animation: solution-region-pulse 12s ease-in-out infinite;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: rotate 8s linear infinite;
        }
        
        .floating-math-symbol {
          font-family: 'Times New Roman', serif;
          user-select: none;
          pointer-events: none;
        }
        
        /* 无障碍支持 */
        @media (prefers-reduced-motion: reduce) {
          .animate-math-float-enhanced,
          .animate-solution-contour-pulse,
          .animate-solution-path,
          .animate-solution-particle,
          .animate-solution-region-pulse {
            animation: none !important;
          }
          
          .floating-math-symbol {
            opacity: 0.1 !important;
            transform: none !important;
          }
          
          circle[class*="animate"] {
            animation: none !important;
          }
          
          * {
            transition: none !important;
            filter: none !important;
          }
        }
      `}</style>
    </section>
  )
}

export default Section3LinearSolve