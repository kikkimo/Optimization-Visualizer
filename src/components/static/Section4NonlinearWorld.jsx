import React, { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import DownHint from '../shared/DownHint'
import Section4NonlinearWorldStep1 from './Section4NonlinearWorldStep1'
import Section4NonlinearWorldStep2 from './Section4NonlinearWorldStep2'
import Section4NonlinearWorldStep3 from './Section4NonlinearWorldStep3'

gsap.registerPlugin(ScrollTrigger)

const Section4NonlinearWorld = ({ id, currentSection, totalSections }) => {
  const sectionRef = useRef()
  
  // 状态管理
  const [currentStage, setCurrentStage] = useState('page3')
  
  // 导航项定义 - 非线性系统主题
  const navigationItems = [
    { id: 'page1', label: '1', title: '非线性特性', description: '叠加原理失效 / 比例关系被打破' },
    { id: 'page2', label: '2', title: '非线性变换的几何视角', description: '弯曲 / 折叠 / 扭曲' },
    { id: 'page3', label: '3', title: '测绘遥感中非线性来源', description: '几何投影 / 坐标变换 / 局部最优' }
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
              <Section4NonlinearWorldStep1 />
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
              <Section4NonlinearWorldStep2 />
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
              <Section4NonlinearWorldStep3 />
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
                background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.12) 0%, rgba(236, 72, 153, 0.08) 100%)',
                borderColor: 'rgba(251, 146, 60, 0.3)',
                boxShadow: '0 8px 25px -8px rgba(251, 146, 60, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
              }}>
                <p className="text-base font-medium" style={{ color: 'rgba(229, 231, 235, 0.9)' }}>
                  {currentItem?.title} - 内容开发中...
                </p>
                <p className="text-sm mt-2" style={{ color: 'rgba(251, 146, 60, 0.7)' }}>
                  这里将展示具体的非线性分析和交互效果
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
      {/* 非线性主题背景动画 - 采用暖色调 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-deep)]">
        {/* 非线性函数曲线 */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.28]" viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="nonlinearGradient1" cx="20%" cy="30%">
              <stop offset="0%" style={{ stopColor: 'rgb(251, 146, 60)', stopOpacity: 0.7 }} />
              <stop offset="50%" style={{ stopColor: 'rgb(236, 72, 153)', stopOpacity: 0.4 }} />
              <stop offset="100%" style={{ stopColor: 'transparent', stopOpacity: 0 }} />
            </radialGradient>
            <radialGradient id="nonlinearGradient2" cx="80%" cy="70%">
              <stop offset="0%" style={{ stopColor: 'rgb(168, 85, 247)', stopOpacity: 0.6 }} />
              <stop offset="50%" style={{ stopColor: 'rgb(251, 146, 60)', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: 'transparent', stopOpacity: 0 }} />
            </radialGradient>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'rgb(251, 146, 60)', stopOpacity: 0.9 }} />
              <stop offset="50%" style={{ stopColor: 'rgb(236, 72, 153)', stopOpacity: 0.7 }} />
              <stop offset="100%" style={{ stopColor: 'rgb(168, 85, 247)', stopOpacity: 0.5 }} />
            </linearGradient>
          </defs>
          
          {/* 非线性函数曲面 */}
          <ellipse cx="350" cy="280" rx="220" ry="140" 
                   fill="url(#nonlinearGradient1)" 
                   className="animate-nonlinear-surface" 
                   style={{ animationDelay: '0s' }} />
          <ellipse cx="350" cy="280" rx="160" ry="100" 
                   fill="none" 
                   stroke="rgba(251, 146, 60, 0.6)" 
                   strokeWidth="2" 
                   strokeDasharray="10,5"
                   className="animate-nonlinear-surface" 
                   style={{ animationDelay: '1.5s' }} />
          
          <ellipse cx="1050" cy="520" rx="200" ry="120" 
                   fill="url(#nonlinearGradient2)" 
                   className="animate-nonlinear-surface" 
                   style={{ animationDelay: '3s' }} />
          <ellipse cx="1050" cy="520" rx="140" ry="85" 
                   fill="none" 
                   stroke="rgba(168, 85, 247, 0.6)" 
                   strokeWidth="2" 
                   strokeDasharray="8,4"
                   className="animate-nonlinear-surface" 
                   style={{ animationDelay: '4.5s' }} />
          
          {/* 非线性迭代轨迹 - 复杂曲线 */}
          <path d="M 150 650 Q 300 400, 400 350 Q 600 250, 750 380 Q 900 500, 1100 280 Q 1200 150, 1300 200"
                fill="none" 
                stroke="url(#curveGradient)" 
                strokeWidth="3"
                strokeDasharray="0 2500"
                className="animate-nonlinear-path"
                style={{ animationDuration: '18s' }} />
          
          {/* 非线性收敛粒子 */}
          <circle r="6" fill="rgb(251, 146, 60)" className="animate-nonlinear-particle">
            <animateMotion dur="18s" repeatCount="indefinite" begin="1s">
              <mpath href="#nonlinear-particle-path" />
            </animateMotion>
            <animate attributeName="r" values="6;10;6" dur="1.2s" repeatCount="indefinite" />
          </circle>
          
          <circle r="4" fill="rgb(236, 72, 153)" opacity="0.8" className="animate-nonlinear-particle">
            <animateMotion dur="21s" repeatCount="indefinite" begin="4s">
              <mpath href="#nonlinear-particle-path" />
            </animateMotion>
            <animate attributeName="r" values="4;7;4" dur="1s" repeatCount="indefinite" />
          </circle>
          
          {/* 隐藏路径定义 */}
          <path id="nonlinear-particle-path" d="M 150 650 Q 300 400, 400 350 Q 600 250, 750 380 Q 900 500, 1100 280 Q 1200 150, 1300 200" fill="none" stroke="none" />
        </svg>
        
        {/* 数学符号群 - 非线性主题 */}
        <div className="absolute inset-0 opacity-[0.25]">
          {/* 非线性符号群 */}
          <div className="floating-math-symbol absolute top-[12%] left-[6%] text-5xl text-orange-400 animate-math-float-enhanced">f(x)</div>
          <div className="floating-math-symbol absolute top-[20%] right-[10%] text-4xl text-pink-400 animate-math-float-enhanced" style={{ animationDelay: '2s' }}>∇²</div>
          <div className="floating-math-symbol absolute bottom-[35%] left-[12%] text-6xl text-purple-400 animate-math-float-enhanced" style={{ animationDelay: '4s' }}>∂/∂x</div>
          <div className="floating-math-symbol absolute bottom-[25%] right-[8%] text-4xl text-orange-400 animate-math-float-enhanced" style={{ animationDelay: '6s' }}>H</div>
          <div className="floating-math-symbol absolute top-[65%] left-[3%] text-5xl text-fuchsia-400 animate-math-float-enhanced" style={{ animationDelay: '1s' }}>J</div>
          <div className="floating-math-symbol absolute top-[75%] right-[18%] text-4xl text-violet-400 animate-math-float-enhanced" style={{ animationDelay: '3s' }}>∞</div>
          
          {/* 额外的非线性符号 */}
          <div className="floating-math-symbol absolute top-[35%] left-[22%] text-3xl text-amber-400 animate-math-float-enhanced" style={{ animationDelay: '5s' }}>∂f</div>
          <div className="floating-math-symbol absolute top-[45%] right-[28%] text-3xl text-rose-400 animate-math-float-enhanced" style={{ animationDelay: '7s' }}>∇f</div>
          <div className="floating-math-symbol absolute bottom-[55%] left-[35%] text-4xl text-indigo-400 animate-math-float-enhanced" style={{ animationDelay: '8s' }}>exp</div>
          <div className="floating-math-symbol absolute bottom-[45%] right-[40%] text-3xl text-yellow-400 animate-math-float-enhanced" style={{ animationDelay: '9s' }}>log</div>
        </div>
        
        {/* 非线性脉冲网格 */}
        <div className="absolute inset-0 opacity-[0.15]">
          <div className="w-full h-full animate-nonlinear-pulse" style={{
            backgroundImage: `
              radial-gradient(circle at 20% 25%, rgba(251, 146, 60, 0.5) 2px, transparent 3px),
              radial-gradient(circle at 80% 75%, rgba(236, 72, 153, 0.4) 2px, transparent 3px),
              linear-gradient(60deg, transparent 48%, rgba(168, 85, 247, 0.25) 49%, rgba(168, 85, 247, 0.25) 51%, transparent 52%)
            `,
            backgroundSize: '90px 90px, 120px 120px, 180px 180px',
          }} />
        </div>
      </div>

      {/* 内容容器 */}
      <div className="relative z-10 h-full mx-auto" style={{ width: '92%', maxWidth: '1400px' }}>
        {/* 主要内容区域 */}
        <div className="flex gap-6" style={{ height: 'calc(100vh - 180px)' }}>
          {/* 主内容面板（75%） */}
          <div className="flex-1">
            <div 
              className="h-full rounded-2xl backdrop-blur-sm p-8"
              style={{
                background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.06) 0%, rgba(236, 72, 153, 0.04) 100%)',
                border: '1px solid rgba(251, 146, 60, 0.2)',
                boxShadow: '0 10px 30px -10px rgba(251, 146, 60, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
              }}
            >
              {renderStageContent()}
            </div>
          </div>

          {/* 右侧导航面板（25%） - 六边形蜂巢式风格 */}
          <div style={{ minWidth: '280px', maxWidth: '320px' }}>
            <div 
              className="h-full backdrop-blur-sm overflow-hidden relative"
              style={{
                background: 'linear-gradient(145deg, rgba(251, 146, 60, 0.05) 0%, rgba(236, 72, 153, 0.03) 40%, rgba(168, 85, 247, 0.02) 80%, rgba(15, 23, 42, 0.85) 100%)',
                border: '2px solid transparent',
                backgroundClip: 'padding-box',
                clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0 calc(100% - 20px), 0 20px)',
                boxShadow: '0 20px 40px -15px rgba(251, 146, 60, 0.3), inset 0 1px 0 rgba(251, 146, 60, 0.1)'
              }}
            >
              {/* 六边形网格背景 */}
              <div className="absolute inset-0 opacity-10">
                <div 
                  className="w-full h-full"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle at center, rgba(251, 146, 60, 0.6) 3px, transparent 3px),
                      radial-gradient(circle at 50% 0%, rgba(236, 72, 153, 0.4) 2px, transparent 2px),
                      radial-gradient(circle at 100% 50%, rgba(168, 85, 247, 0.5) 2px, transparent 2px)
                    `,
                    backgroundSize: '40px 35px, 35px 30px, 45px 40px',
                    backgroundPosition: '0 0, 20px 15px, 10px 20px',
                    animation: 'hexGrid 20s linear infinite'
                  }}
                />
              </div>

              {/* 边框发光效果 */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0 calc(100% - 20px), 0 20px)',
                  border: '2px solid',
                  borderImage: 'linear-gradient(135deg, rgba(251, 146, 60, 0.8) 0%, rgba(236, 72, 153, 0.6) 50%, rgba(168, 85, 247, 0.4) 100%) 1',
                  animation: 'borderGlow 3s ease-in-out infinite alternate'
                }}
              />

              {/* 主标题区域 */}
              <div className="relative p-6 text-center">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold mb-3" style={{ color: '#E8EAED', letterSpacing: '0.8px' }}>
                    非线性世界
                  </h1>
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className="w-3 h-3 rotate-45 bg-gradient-to-br from-orange-400 to-transparent border border-orange-400/30" />
                    <div className="text-xs font-mono tracking-widest" style={{ color: 'rgba(251, 146, 60, 0.9)' }}>
                      NONLINEAR_SYS
                    </div>
                    <div className="w-3 h-3 rotate-45 bg-gradient-to-br from-pink-400 to-transparent border border-pink-400/30" />
                  </div>
                </div>
                
                {/* 科技感装饰 */}
                <div className="absolute top-2 right-4 opacity-30">
                  <div className="w-6 h-6 border-2 border-orange-400 rotate-45 animate-spin-slow">
                    <div className="absolute inset-1 bg-orange-400/20 animate-pulse" />
                  </div>
                </div>
                <div className="absolute bottom-2 left-4 opacity-20">
                  <div className="text-xs font-mono text-pink-400 tracking-wider">{'{ ∂f/∂x }'}</div>
                </div>
              </div>
              
              {/* 导航按钮区域 - 六边形按钮风格 */}
              <div className="relative px-5 pb-6 space-y-5">
                {navigationItems.map((item, index) => {
                  const isActive = currentStage === item.id
                  
                  return (
                    <button
                      key={item.id}
                      className="nav-item w-full text-left transition-all duration-700 transform relative overflow-hidden group"
                      onClick={() => handleStageChange(item.id)}
                      style={{
                        padding: '0',
                        background: 'transparent',
                        border: 'none',
                        transform: isActive ? 'translateX(8px) scale(1.02)' : 'translateX(0) scale(1)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.transform = 'translateX(4px) scale(1.01)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.transform = 'translateX(0) scale(1)'
                        }
                      }}
                    >
                      <div 
                        className="relative p-4"
                        style={{
                          background: isActive 
                            ? 'linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(236, 72, 153, 0.08) 100%)'
                            : 'rgba(15, 23, 42, 0.2)',
                          clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0 calc(100% - 15px), 0 15px)',
                          border: '1px solid',
                          borderColor: isActive 
                            ? 'rgba(251, 146, 60, 0.6)' 
                            : 'rgba(75, 85, 99, 0.3)',
                          boxShadow: isActive 
                            ? '0 8px 25px -8px rgba(251, 146, 60, 0.4), inset 0 0 20px rgba(251, 146, 60, 0.05)' 
                            : '0 4px 15px -4px rgba(0, 0, 0, 0.2)',
                        }}
                      >
                        {/* 扫描线效果 */}
                        {isActive && (
                          <div 
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background: 'linear-gradient(90deg, transparent 0%, rgba(251, 146, 60, 0.3) 50%, transparent 100%)',
                              animation: 'scanLine 3s ease-in-out infinite'
                            }}
                          />
                        )}
                        
                        <div className="relative flex items-center space-x-4">
                          {/* 六边形图标 */}
                          <div className="flex-shrink-0">
                            <div style={{
                              width: '48px',
                              height: '42px',
                              background: isActive 
                                ? 'linear-gradient(135deg, rgba(251, 146, 60, 0.3) 0%, rgba(236, 72, 153, 0.2) 100%)'
                                : 'rgba(75, 85, 99, 0.4)',
                              clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              border: '2px solid',
                              borderColor: isActive ? 'rgba(251, 146, 60, 0.8)' : 'rgba(75, 85, 99, 0.6)',
                            }}>
                              {/* 内部脉冲 */}
                              {isActive && (
                                <div 
                                  className="absolute inset-1"
                                  style={{
                                    background: 'radial-gradient(ellipse, rgba(251, 146, 60, 0.4) 0%, transparent 70%)',
                                    clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                                    animation: 'hexPulse 2s ease-in-out infinite'
                                  }}
                                />
                              )}
                              <span 
                                className="relative z-10 font-bold text-sm"
                                style={{ color: isActive ? '#FB923C' : 'rgba(156, 163, 175, 0.9)' }}
                              >
                                {item.label}
                              </span>
                            </div>
                          </div>
                          
                          {/* 文字内容 */}
                          <div className="flex-1 min-w-0">
                            <div style={{ 
                              fontSize: '15px',
                              fontWeight: '700',
                              color: isActive ? '#E8EAED' : 'rgba(229, 231, 235, 0.85)',
                              marginBottom: '4px',
                              letterSpacing: '0.3px',
                              fontFamily: 'system-ui, -apple-system, sans-serif'
                            }}>
                              {item.title}
                            </div>
                            <div style={{ 
                              fontSize: '11px',
                              color: isActive ? 'rgba(251, 146, 60, 0.9)' : 'rgba(156, 163, 175, 0.7)',
                              lineHeight: '1.4',
                              letterSpacing: '0.2px',
                              fontFamily: 'ui-monospace, "Cascadia Code", monospace'
                            }}>
                              {item.description}
                            </div>
                          </div>
                          
                          {/* 状态指示器 */}
                          <div className="flex-shrink-0 flex flex-col items-center space-y-1">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{
                                background: isActive ? '#FB923C' : 'rgba(75, 85, 99, 0.6)',
                                boxShadow: isActive ? '0 0 10px rgba(251, 146, 60, 0.8)' : 'none',
                                animation: isActive ? 'statusPulse 1.5s ease-in-out infinite' : 'none'
                              }}
                            />
                            {isActive && (
                              <div className="w-0.5 h-8 bg-gradient-to-b from-orange-400 via-pink-400 to-transparent opacity-70" />
                            )}
                          </div>
                        </div>
                        
                        {/* 底部装饰线 */}
                        {isActive && (
                          <div 
                            className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-60"
                            style={{ animation: 'bottomGlow 2s ease-in-out infinite' }}
                          />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
              
              {/* 底部状态栏 */}
              <div className="absolute bottom-4 left-4 right-4">
                <div 
                  className="h-1 bg-gradient-to-r from-orange-400/20 via-pink-400/30 to-purple-400/20 rounded-full overflow-hidden"
                  style={{ backdropFilter: 'blur(10px)' }}
                >
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 to-pink-400"
                    style={{
                      width: `${((navigationItems.findIndex(item => item.id === currentStage) + 1) / navigationItems.length) * 100}%`,
                      transition: 'width 0.5s ease-out',
                      animation: 'progressGlow 2s ease-in-out infinite'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 下一页提示 */}
      {currentSection < totalSections - 1 && (
        <DownHint targetSection={4} text="向下滚动继续" isStatic={true} />
      )}
      
      {/* 动效样式 - 非线性主题 */}
      <style jsx>{`
        /* 非线性浮动动画 */}
        @keyframes math-float-enhanced {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg) scale(1); 
            opacity: 0.4; 
            filter: brightness(1);
          }
          25% { 
            transform: translateY(-25px) rotate(3deg) scale(1.1); 
            opacity: 0.7; 
            filter: brightness(1.2);
          }
          50% { 
            transform: translateY(-15px) rotate(-2deg) scale(1.05); 
            opacity: 0.8; 
            filter: brightness(1.4);
          }
          75% { 
            transform: translateY(-30px) rotate(2deg) scale(1.15); 
            opacity: 0.6; 
            filter: brightness(1.1);
          }
        }
        
        @keyframes nonlinear-surface {
          0%, 100% { 
            transform: scale(1) rotate(0deg); 
            opacity: 0.25; 
          }
          33% { 
            transform: scale(1.15) rotate(1.5deg); 
            opacity: 0.4; 
          }
          66% { 
            transform: scale(0.9) rotate(-1.5deg); 
            opacity: 0.35; 
          }
        }
        
        @keyframes nonlinear-path {
          0% { 
            stroke-dasharray: 0 2500; 
            opacity: 0.3; 
            filter: brightness(1);
          }
          25% { 
            stroke-dasharray: 625 2500; 
            opacity: 0.7; 
            filter: brightness(1.4) drop-shadow(0 0 8px currentColor);
          }
          75% { 
            stroke-dasharray: 1875 2500; 
            opacity: 0.5; 
            filter: brightness(1.2) drop-shadow(0 0 6px currentColor);
          }
          100% { 
            stroke-dasharray: 2500 2500; 
            opacity: 0.25; 
            filter: brightness(1);
          }
        }
        
        @keyframes nonlinear-pulse {
          0%, 100% { 
            transform: scale(1) rotate(0deg); 
            opacity: 0.15; 
          }
          50% { 
            transform: scale(1.03) rotate(1deg); 
            opacity: 0.3; 
          }
        }
        
        .animate-math-float-enhanced {
          animation: math-float-enhanced 12s ease-in-out infinite;
        }
        
        .animate-nonlinear-surface {
          animation: nonlinear-surface 10s ease-in-out infinite;
        }
        
        .animate-nonlinear-path {
          animation: nonlinear-path infinite linear;
        }
        
        .animate-nonlinear-particle {
          filter: drop-shadow(0 0 8px currentColor);
        }
        
        .animate-nonlinear-pulse {
          animation: nonlinear-pulse 15s ease-in-out infinite;
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
          animation: rotate 10s linear infinite;
        }
        
        .floating-math-symbol {
          font-family: 'Times New Roman', serif;
          user-select: none;
          pointer-events: none;
        }
        
        /* 六边形导航栏专用动画 */
        @keyframes hexGrid {
          0% { backgroundPosition: 0 0, 20px 15px, 10px 20px; }
          100% { backgroundPosition: 40px 35px, 60px 50px, 50px 60px; }
        }
        
        @keyframes borderGlow {
          0% { opacity: 0.3; filter: brightness(1); }
          100% { opacity: 0.8; filter: brightness(1.5) saturate(1.2); }
        }
        
        @keyframes scanLine {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes hexPulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        
        @keyframes statusPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        
        @keyframes bottomGlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        @keyframes progressGlow {
          0%, 100% { filter: brightness(1) saturate(1); }
          50% { filter: brightness(1.3) saturate(1.4); }
        }

        /* 无障碍支持 */
        @media (prefers-reduced-motion: reduce) {
          .animate-math-float-enhanced,
          .animate-nonlinear-surface,
          .animate-nonlinear-path,
          .animate-nonlinear-particle,
          .animate-nonlinear-pulse {
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

export default Section4NonlinearWorld