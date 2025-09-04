import React, { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import DownHint from '../shared/DownHint'
import Section2LinearWorldStep1 from './Section2LinearWorldStep1'

gsap.registerPlugin(ScrollTrigger)

const Section2LinearWorld = ({ id, currentSection, totalSections }) => {
  const sectionRef = useRef()
  
  // 状态管理
  const [currentStage, setCurrentStage] = useState('page1')
  
  // 导航项定义
  const navigationItems = [
    { id: 'page1', label: '1', title: '可加性与齐次性', description: '线性的本质与公理' },
    { id: 'page2', label: '2', title: '页面2', description: '线性 vs 仿射：一线之差' },
    { id: 'page3', label: '3', title: '页面3', description: '齐次坐标的升维魔法' }
  ]

  // 处理阶段切换
  const handleStageChange = (stageId) => {
    setCurrentStage(stageId)
    
    // 添加切换动画
    const stageContent = document.querySelector('.stage-content')
    if (stageContent) {
      gsap.fromTo('.stage-content',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      )
    }
  }

  // 动画效果
  useEffect(() => {
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top center",
      onEnter: () => {
        // 导航项入场动画
        gsap.fromTo('.nav-item',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
        )
        
        // 内容入场动画
        gsap.fromTo('.stage-content',
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.8, delay: 0.3, ease: "power2.out" }
        )
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [currentStage])

  // 渲染页面内容
  const renderStageContent = () => {
    const currentItem = navigationItems.find(item => item.id === currentStage)
    
    console.log('Debug - Current Stage:', currentStage)
    console.log('Debug - Current Item:', currentItem)
    
    if (currentStage === 'page1') {
      console.log('Debug - Rendering Section2LinearWorldStep1')
      try {
        return (
          <div className="stage-content h-full w-full">
            <Section2LinearWorldStep1 />
          </div>
        )
      } catch (error) {
        console.error('Debug - Error rendering Section2LinearWorldStep1:', error)
        return (
          <div className="stage-content h-full flex flex-col items-center justify-center">
            <div className="text-center text-red-400">
              <h3>组件加载错误</h3>
              <p>{error.message}</p>
            </div>
          </div>
        )
      }
    }
    
    console.log('Debug - Rendering placeholder content for:', currentStage)
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
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(147, 51, 234, 0.08) 100%)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            boxShadow: '0 8px 25px -8px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}>
            <p className="text-base font-medium" style={{ color: 'rgba(229, 231, 235, 0.9)' }}>
              {currentItem?.title} - 内容开发中...
            </p>
            <p className="text-sm mt-2" style={{ color: 'rgba(96, 165, 250, 0.7)' }}>
              这里将展示具体的可视化内容和交互效果
            </p>
          </div>
        </div>
      </div>
    )
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
      {/* 线性世界背景动画 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 线性网格背景 */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.15]" viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="linearGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 0.6 }} />
              <stop offset="100%" style={{ stopColor: 'rgb(147, 51, 234)', stopOpacity: 0.3 }} />
            </linearGradient>
            <pattern id="linearGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="1"/>
            </pattern>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#linearGrid)" />
          
          {/* 线性直线 */}
          <line x1="0" y1="600" x2="1400" y2="200" 
                stroke="url(#linearGradient)" 
                strokeWidth="3"
                className="animate-pulse" />
          <line x1="0" y1="200" x2="1400" y2="600" 
                stroke="url(#linearGradient)" 
                strokeWidth="2"
                className="animate-pulse"
                style={{ animationDelay: '1s' }} />
        </svg>
        
        {/* 浮动数学符号 */}
        <div className="absolute inset-0 opacity-[0.1]">
          <div className="floating-math-symbol absolute top-[15%] left-[15%] text-4xl text-blue-400 animate-math-float">A</div>
          <div className="floating-math-symbol absolute top-[70%] right-[10%] text-3xl text-purple-400 animate-math-float" style={{ animationDelay: '2s' }}>x</div>
          <div className="floating-math-symbol absolute bottom-[40%] left-[25%] text-5xl text-indigo-400 animate-math-float" style={{ animationDelay: '4s' }}>∑</div>
          <div className="floating-math-symbol absolute top-[50%] right-[30%] text-3xl text-cyan-400 animate-math-float" style={{ animationDelay: '6s' }}>det</div>
        </div>
        
        {/* 模糊装饰 */}
        <div 
          className="absolute rounded-full opacity-20"
          style={{
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
            top: '10%',
            left: '10%',
            filter: 'blur(60px)'
          }}
        />
        <div 
          className="absolute rounded-full opacity-20"
          style={{
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.08) 0%, transparent 70%)',
            bottom: '10%',
            right: '10%',
            filter: 'blur(80px)'
          }}
        />
      </div>

      {/* 内容容器 */}
      <div className="relative z-10 h-full mx-auto" style={{ width: '92%', maxWidth: '1400px' }}>
        {/* 主要内容区域 */}
        <div className="flex gap-6" style={{ height: 'calc(100vh - 180px)' }}>
          {/* 主内容面板（82%） */}
          <div className="flex-1">
            <div 
              className="h-full rounded-2xl backdrop-blur-sm p-8"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.06) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                boxShadow: '0 10px 30px -10px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
              }}
            >
              {renderStageContent()}
            </div>
          </div>

          {/* 右侧导航面板（18%） */}
          <div style={{ minWidth: '200px', maxWidth: '240px' }}>
            <div 
              className="h-full rounded-2xl backdrop-blur-sm overflow-hidden relative"
              style={{
                background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.12) 0%, rgba(147, 51, 234, 0.08) 60%, rgba(15, 23, 42, 0.9) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                boxShadow: '0 15px 35px -10px rgba(59, 130, 246, 0.3)'
              }}
            >
              {/* 装饰性渐变背景 */}
              <div className="absolute inset-0 opacity-30">
                <div 
                  className="absolute top-0 left-0 w-full h-20"
                  style={{
                    background: 'radial-gradient(ellipse at top, rgba(59, 130, 246, 0.4) 0%, transparent 70%)'
                  }}
                />
                <div 
                  className="absolute bottom-0 right-0 w-24 h-24"
                  style={{
                    background: 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 70%)',
                    filter: 'blur(20px)'
                  }}
                />
              </div>

              {/* 主标题区域 */}
              <div className="relative p-6 text-center">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold mb-2" style={{ color: '#E8EAED', letterSpacing: '0.5px' }}>
                    线性世界
                  </h1>
                  <div className="flex items-center justify-center space-x-1 mb-4">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
                    <div className="text-xs" style={{ color: 'rgba(59, 130, 246, 0.8)', letterSpacing: '1px' }}>
                      LINEAR WORLD
                    </div>
                    <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
                  </div>
                </div>
                
                {/* 数学装饰符号 */}
                <div className="absolute -top-2 -right-2 opacity-20">
                  <div className="text-3xl text-blue-400 animate-spin-slow">∑</div>
                </div>
                <div className="absolute -bottom-1 -left-1 opacity-15">
                  <div className="text-2xl text-purple-400 animate-pulse">∇</div>
                </div>
              </div>
              
              {/* 导航按钮区域 */}
              <div className="relative px-4 pb-6 space-y-4">
                {navigationItems.map((item, index) => {
                  const isActive = currentStage === item.id
                  
                  return (
                    <button
                      key={item.id}
                      className="nav-item w-full text-left rounded-2xl transition-all duration-500 transform relative overflow-hidden group"
                      onClick={() => handleStageChange(item.id)}
                      style={{
                        padding: '20px 16px',
                        background: isActive 
                          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(147, 51, 234, 0.15) 100%)'
                          : 'rgba(15, 23, 42, 0.4)',
                        border: '1px solid',
                        borderColor: isActive 
                          ? 'rgba(59, 130, 246, 0.4)' 
                          : 'rgba(75, 85, 99, 0.2)',
                        boxShadow: isActive 
                          ? '0 8px 25px -8px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)' 
                          : '0 4px 15px -4px rgba(0, 0, 0, 0.1)',
                        transform: isActive ? 'scale(1.02) translateY(-2px)' : 'scale(1)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.05) 100%)'
                          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)'
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
                            background: 'linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.1) 50%, transparent 70%)',
                            animation: 'shimmer 2s ease-in-out infinite'
                          }}
                        />
                      )}
                      
                      <div className="relative flex items-center space-x-4">
                        {/* 几何图标 */}
                        <div className="flex-shrink-0">
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: isActive 
                              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.2) 100%)'
                              : 'rgba(75, 85, 99, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            fontWeight: '700',
                            color: isActive ? '#60A5FA' : 'rgba(156, 163, 175, 0.8)',
                            border: '1px solid',
                            borderColor: isActive ? 'rgba(59, 130, 246, 0.4)' : 'rgba(75, 85, 99, 0.3)',
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            {/* 背景动效 */}
                            {isActive && (
                              <div 
                                className="absolute inset-0 opacity-50"
                                style={{
                                  background: 'conic-gradient(from 0deg, transparent, rgba(59, 130, 246, 0.2), transparent)',
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
                            color: isActive ? 'rgba(96, 165, 250, 0.8)' : 'rgba(156, 163, 175, 0.6)',
                            lineHeight: '1.4',
                            letterSpacing: '0.2px'
                          }}>
                            {item.description}
                          </div>
                        </div>
                        
                        {/* 激活指示器 */}
                        {isActive && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-8 rounded-full bg-gradient-to-b from-blue-400 to-purple-500 animate-pulse" />
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
        <DownHint targetSection={2} text="向下滚动继续" isStatic={true} />
      )}
      
      {/* CSS 样式 */}
      <style jsx>{`
        @keyframes math-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(1deg); }
          50% { transform: translateY(-4px) rotate(-0.5deg); }
          75% { transform: translateY(-12px) rotate(0.5deg); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .animate-math-float {
          animation: math-float 12s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: rotate 8s linear infinite;
        }
        
        .floating-math-symbol {
          font-family: 'Times New Roman', serif;
          user-select: none;
          pointer-events: none;
        }
      `}</style>
    </section>
  )
}

export default Section2LinearWorld