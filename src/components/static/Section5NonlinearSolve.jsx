import React, { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import DownHint from '../shared/DownHint'
import Section5NonlinearSolveStep1 from './Section5NonlinearSolveStep1'
import Section5NonlinearSolveStep2 from './Section5NonlinearSolveStep2'
import Section5NonlinearSolveStep3 from './Section5NonlinearSolveStep3'
import Section5NonlinearSolveStep4 from './Section5NonlinearSolveStep4'
import Section5NonlinearSolveStep5 from './Section5NonlinearSolveStep5'
import Section5NonlinearSolveStep6 from './Section5NonlinearSolveStep6'

gsap.registerPlugin(ScrollTrigger)

const Section5NonlinearSolve = ({ id, currentSection, totalSections }) => {
  const sectionRef = useRef()
  
  // 状态管理
  const [currentStage, setCurrentStage] = useState('page1')
  
  // 导航项定义 - 非线性求解方法主题（使用蓝-青-绿配色）
  const navigationItems = [
    { id: 'page1', label: '1', title: '认识非线性函数', description: '一个简单的例子了解非线性函数' },
    { id: 'page2', label: '2', title: '牛顿法与拟牛顿法', description: 'Hessian矩阵 / BFGS / L-BFGS' },
    { id: 'page3', label: '3', title: '共轭梯度法', description: '共轭方向 / Fletcher-Reeves / 线性收敛' },
    { id: 'page4', label: '4', title: '信赖域方法', description: '局部模型 / 信赖域半径 / 二次逼近' },
    { id: 'page5', label: '5', title: '约束优化', description: 'KKT条件 / 拉格朗日乘数 / 序列二次规划' },
    { id: 'page6', label: '6', title: '全局优化', description: '模拟退火 / 遗传算法 / 粒子群优化' }
  ]

  // 处理阶段切换
  const handleStageChange = (stageId) => {
    gsap.killTweensOf('.stage-content')
    
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
      once: true,
      onEnter: () => {
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
    gsap.killTweensOf('.stage-content')
    
    gsap.fromTo('.stage-content',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    )
  }, [currentStage])

  // 渲染页面内容
  const renderStageContent = () => {
    switch (currentStage) {
      case 'page1':
        return <Section5NonlinearSolveStep1 />
      case 'page2':
        return <Section5NonlinearSolveStep2 />
      case 'page3':
        return <Section5NonlinearSolveStep3 />
      case 'page4':
        return <Section5NonlinearSolveStep4 />
      case 'page5':
        return <Section5NonlinearSolveStep5 />
      case 'page6':
        return <Section5NonlinearSolveStep6 />
      default:
        return <Section5NonlinearSolveStep1 />
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
      {/* 非线性求解主题背景动画 - 采用蓝-青-绿冷色调 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-deep)]">
        {/* 优化算法收敛轨迹 */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.25]" viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="solveGradient1" cx="25%" cy="35%">
              <stop offset="0%" style={{ stopColor: 'rgb(14, 165, 233)', stopOpacity: 0.8 }} />
              <stop offset="50%" style={{ stopColor: 'rgb(6, 182, 212)', stopOpacity: 0.5 }} />
              <stop offset="100%" style={{ stopColor: 'transparent', stopOpacity: 0 }} />
            </radialGradient>
            <radialGradient id="solveGradient2" cx="75%" cy="65%">
              <stop offset="0%" style={{ stopColor: 'rgb(34, 197, 94)', stopOpacity: 0.7 }} />
              <stop offset="50%" style={{ stopColor: 'rgb(14, 165, 233)', stopOpacity: 0.4 }} />
              <stop offset="100%" style={{ stopColor: 'transparent', stopOpacity: 0 }} />
            </radialGradient>
            <linearGradient id="convergenceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'rgb(14, 165, 233)', stopOpacity: 0.9 }} />
              <stop offset="50%" style={{ stopColor: 'rgb(6, 182, 212)', stopOpacity: 0.7 }} />
              <stop offset="100%" style={{ stopColor: 'rgb(34, 197, 94)', stopOpacity: 0.5 }} />
            </linearGradient>
          </defs>
          
          {/* 算法收敛椭圆 */}
          <ellipse cx="380" cy="320" rx="200" ry="120" 
                   fill="url(#solveGradient1)" 
                   className="animate-solve-convergence" 
                   style={{ animationDelay: '0s' }} />
          <ellipse cx="380" cy="320" rx="140" ry="85" 
                   fill="none" 
                   stroke="rgba(14, 165, 233, 0.6)" 
                   strokeWidth="2" 
                   strokeDasharray="8,4"
                   className="animate-solve-convergence" 
                   style={{ animationDelay: '1s' }} />
          
          <ellipse cx="1020" cy="480" rx="180" ry="110" 
                   fill="url(#solveGradient2)" 
                   className="animate-solve-convergence" 
                   style={{ animationDelay: '2.5s' }} />
          <ellipse cx="1020" cy="480" rx="120" ry="75" 
                   fill="none" 
                   stroke="rgba(34, 197, 94, 0.6)" 
                   strokeWidth="2" 
                   strokeDasharray="6,3"
                   className="animate-solve-convergence" 
                   style={{ animationDelay: '3.5s' }} />
          
          {/* 优化收敛路径 */}
          <path d="M 100 700 Q 250 500, 380 320 Q 500 200, 650 350 Q 800 480, 1020 320 Q 1150 200, 1280 250"
                fill="none" 
                stroke="url(#convergenceGradient)" 
                strokeWidth="3"
                strokeDasharray="0 2200"
                className="animate-convergence-path"
                style={{ animationDuration: '20s' }} />
          
          {/* 算法收敛点 */}
          <circle r="8" fill="rgb(14, 165, 233)" className="animate-solve-particle">
            <animateMotion dur="20s" repeatCount="indefinite" begin="0.5s">
              <mpath href="#convergence-particle-path" />
            </animateMotion>
            <animate attributeName="r" values="8;12;8" dur="1.5s" repeatCount="indefinite" />
          </circle>
          
          <circle r="6" fill="rgb(34, 197, 94)" opacity="0.8" className="animate-solve-particle">
            <animateMotion dur="24s" repeatCount="indefinite" begin="3s">
              <mpath href="#convergence-particle-path" />
            </animateMotion>
            <animate attributeName="r" values="6;9;6" dur="1.2s" repeatCount="indefinite" />
          </circle>
          
          {/* 隐藏路径定义 */}
          <path id="convergence-particle-path" d="M 100 700 Q 250 500, 380 320 Q 500 200, 650 350 Q 800 480, 1020 320 Q 1150 200, 1280 250" fill="none" stroke="none" />
        </svg>
        
        {/* 数学符号群 - 优化算法主题 */}
        <div className="absolute inset-0 opacity-[0.22]">
          {/* 优化算法符号群 */}
          <div className="floating-math-symbol absolute top-[15%] left-[8%] text-5xl text-sky-400 animate-math-float-solve">∇f</div>
          <div className="floating-math-symbol absolute top-[25%] right-[12%] text-4xl text-cyan-400 animate-math-float-solve" style={{ animationDelay: '2s' }}>H⁻¹</div>
          <div className="floating-math-symbol absolute bottom-[40%] left-[15%] text-6xl text-emerald-400 animate-math-float-solve" style={{ animationDelay: '4s' }}>α</div>
          <div className="floating-math-symbol absolute bottom-[30%] right-[10%] text-4xl text-blue-400 animate-math-float-solve" style={{ animationDelay: '6s' }}>λ</div>
          <div className="floating-math-symbol absolute top-[70%] left-[5%] text-5xl text-teal-400 animate-math-float-solve" style={{ animationDelay: '1s' }}>∇²</div>
          <div className="floating-math-symbol absolute top-[80%] right-[20%] text-4xl text-green-400 animate-math-float-solve" style={{ animationDelay: '3s' }}>β</div>
          
          {/* 额外的算法符号 */}
          <div className="floating-math-symbol absolute top-[40%] left-[25%] text-3xl text-cyan-400 animate-math-float-solve" style={{ animationDelay: '5s' }}>δ</div>
          <div className="floating-math-symbol absolute top-[50%] right-[30%] text-3xl text-sky-400 animate-math-float-solve" style={{ animationDelay: '7s' }}>∇L</div>
          <div className="floating-math-symbol absolute bottom-[60%] left-[38%] text-4xl text-emerald-400 animate-math-float-solve" style={{ animationDelay: '8s' }}>η</div>
          <div className="floating-math-symbol absolute bottom-[50%] right-[42%] text-3xl text-teal-400 animate-math-float-solve" style={{ animationDelay: '9s' }}>μ</div>
        </div>
        
        {/* 简洁背景纹理 */}
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="w-full h-full animate-solve-pulse" style={{
            backgroundImage: `
              linear-gradient(45deg, transparent 48%, rgba(6, 182, 212, 0.1) 49%, rgba(6, 182, 212, 0.1) 51%, transparent 52%)
            `,
            backgroundSize: '200px 200px',
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
                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.06) 0%, rgba(6, 182, 212, 0.04) 100%)',
                border: '1px solid rgba(14, 165, 233, 0.2)',
                boxShadow: '0 10px 30px -10px rgba(14, 165, 233, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
              }}
            >
              {renderStageContent()}
            </div>
          </div>

          {/* 右侧导航面板（25%） - 圆形几何风格 */}
          <div style={{ minWidth: '280px', maxWidth: '320px' }}>
            <div 
              className="h-full backdrop-blur-sm overflow-hidden relative rounded-3xl"
              style={{
                background: 'linear-gradient(145deg, rgba(14, 165, 233, 0.05) 0%, rgba(6, 182, 212, 0.03) 40%, rgba(34, 197, 94, 0.02) 80%, rgba(15, 23, 42, 0.85) 100%)',
                border: '2px solid rgba(14, 165, 233, 0.3)',
                boxShadow: '0 20px 40px -15px rgba(14, 165, 233, 0.3), inset 0 1px 0 rgba(14, 165, 233, 0.1)'
              }}
            >
              {/* 简洁几何背景 */}
              <div className="absolute inset-0 opacity-[0.08]">
                <div 
                  className="w-full h-full"
                  style={{
                    backgroundImage: `linear-gradient(135deg, transparent 40%, rgba(14, 165, 233, 0.15) 50%, transparent 60%)`,
                    backgroundSize: '60px 60px',
                    animation: 'gentleFlow 20s ease-in-out infinite'
                  }}
                />
              </div>

              {/* 边框发光效果 */}
              <div 
                className="absolute inset-0 pointer-events-none rounded-3xl"
                style={{
                  border: '2px solid',
                  borderColor: 'rgba(14, 165, 233, 0.6)',
                  animation: 'solveBorderGlow 4s ease-in-out infinite alternate'
                }}
              />

              {/* 主标题区域 */}
              <div className="relative p-6 text-center">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold mb-3" style={{ color: '#E8EAED', letterSpacing: '0.8px' }}>
                    非线性求解
                  </h1>
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-sky-400 to-transparent border border-sky-400/30" />
                    <div className="text-xs font-mono tracking-widest" style={{ color: 'rgba(14, 165, 233, 0.9)' }}>
                      OPTIMIZE_SOLVE
                    </div>
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-cyan-400 to-transparent border border-cyan-400/30" />
                  </div>
                </div>
                
                {/* 科技感装饰 */}
                <div className="absolute top-2 right-4 opacity-30">
                  <div className="w-6 h-6 border-2 border-sky-400 rounded-full animate-spin-slow">
                    <div className="absolute inset-1 bg-sky-400/20 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="absolute bottom-2 left-4 opacity-20">
                  <div className="text-xs font-mono text-cyan-400 tracking-wider">{'{ ∇f = 0 }'}</div>
                </div>
              </div>
              
              {/* 导航按钮区域 - 圆形按钮风格 */}
              <div className="relative px-5 pb-6 space-y-3">
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
                        className="relative p-3 rounded-2xl"
                        style={{
                          background: isActive 
                            ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)'
                            : 'rgba(15, 23, 42, 0.2)',
                          border: '1px solid',
                          borderColor: isActive 
                            ? 'rgba(14, 165, 233, 0.6)' 
                            : 'rgba(75, 85, 99, 0.3)',
                          boxShadow: isActive 
                            ? '0 8px 25px -8px rgba(14, 165, 233, 0.4), inset 0 0 20px rgba(14, 165, 233, 0.05)' 
                            : '0 4px 15px -4px rgba(0, 0, 0, 0.2)',
                        }}
                      >
                        {/* 扫描线效果 */}
                        {isActive && (
                          <div 
                            className="absolute inset-0 pointer-events-none rounded-2xl"
                            style={{
                              background: 'linear-gradient(90deg, transparent 0%, rgba(14, 165, 233, 0.3) 50%, transparent 100%)',
                              animation: 'scanLine 3s ease-in-out infinite'
                            }}
                          />
                        )}
                        
                        <div className="relative flex items-center space-x-3">
                          {/* 圆形图标 */}
                          <div className="flex-shrink-0">
                            <div style={{
                              width: '40px',
                              height: '40px',
                              background: isActive 
                                ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.3) 0%, rgba(6, 182, 212, 0.2) 100%)'
                                : 'rgba(75, 85, 99, 0.4)',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              border: '2px solid',
                              borderColor: isActive ? 'rgba(14, 165, 233, 0.8)' : 'rgba(75, 85, 99, 0.6)',
                            }}>
                              {/* 内部脉冲 */}
                              {isActive && (
                                <div 
                                  className="absolute inset-1 rounded-full"
                                  style={{
                                    background: 'radial-gradient(ellipse, rgba(14, 165, 233, 0.4) 0%, transparent 70%)',
                                    animation: 'circlePulse 2s ease-in-out infinite'
                                  }}
                                />
                              )}
                              <span 
                                className="relative z-10 font-bold text-sm"
                                style={{ color: isActive ? '#0EA5E9' : 'rgba(156, 163, 175, 0.9)' }}
                              >
                                {item.label}
                              </span>
                            </div>
                          </div>
                          
                          {/* 文字内容 - 只显示标题 */}
                          <div className="flex-1 min-w-0">
                            <div style={{ 
                              fontSize: '14px',
                              fontWeight: '700',
                              color: isActive ? '#E8EAED' : 'rgba(229, 231, 235, 0.85)',
                              letterSpacing: '0.3px',
                              fontFamily: 'system-ui, -apple-system, sans-serif',
                              lineHeight: '1.3'
                            }}>
                              {item.title}
                            </div>
                          </div>
                          
                          {/* 状态指示器 */}
                          <div className="flex-shrink-0 flex flex-col items-center space-y-1">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{
                                background: isActive ? '#0EA5E9' : 'rgba(75, 85, 99, 0.6)',
                                boxShadow: isActive ? '0 0 10px rgba(14, 165, 233, 0.8)' : 'none',
                                animation: isActive ? 'statusPulse 1.5s ease-in-out infinite' : 'none'
                              }}
                            />
                            {isActive && (
                              <div className="w-0.5 h-6 bg-gradient-to-b from-sky-400 via-cyan-400 to-transparent opacity-70" />
                            )}
                          </div>
                        </div>
                        
                        {/* 底部装饰线 */}
                        {isActive && (
                          <div 
                            className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-60"
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
                  className="h-1 bg-gradient-to-r from-sky-400/20 via-cyan-400/30 to-emerald-400/20 rounded-full overflow-hidden"
                  style={{ backdropFilter: 'blur(10px)' }}
                >
                  <div 
                    className="h-full bg-gradient-to-r from-sky-400 to-cyan-400"
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
        <DownHint targetSection={5} text="向下滚动继续" isStatic={true} />
      )}
      
      {/* 动效样式 - 非线性求解主题 */}
      <style jsx>{`
        /* 求解算法浮动动画 */
        @keyframes math-float-solve {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg) scale(1); 
            opacity: 0.4; 
            filter: brightness(1);
          }
          25% { 
            transform: translateY(-20px) rotate(2deg) scale(1.08); 
            opacity: 0.7; 
            filter: brightness(1.3);
          }
          50% { 
            transform: translateY(-12px) rotate(-1.5deg) scale(1.04); 
            opacity: 0.8; 
            filter: brightness(1.5);
          }
          75% { 
            transform: translateY(-25px) rotate(1.5deg) scale(1.12); 
            opacity: 0.6; 
            filter: brightness(1.2);
          }
        }
        
        @keyframes solve-convergence {
          0%, 100% { 
            transform: scale(1) rotate(0deg); 
            opacity: 0.3; 
          }
          33% { 
            transform: scale(1.12) rotate(1deg); 
            opacity: 0.5; 
          }
          66% { 
            transform: scale(0.92) rotate(-1deg); 
            opacity: 0.4; 
          }
        }
        
        @keyframes convergence-path {
          0% { 
            stroke-dasharray: 0 2200; 
            opacity: 0.4; 
            filter: brightness(1);
          }
          30% { 
            stroke-dasharray: 660 2200; 
            opacity: 0.8; 
            filter: brightness(1.5) drop-shadow(0 0 8px currentColor);
          }
          80% { 
            stroke-dasharray: 1760 2200; 
            opacity: 0.6; 
            filter: brightness(1.3) drop-shadow(0 0 6px currentColor);
          }
          100% { 
            stroke-dasharray: 2200 2200; 
            opacity: 0.3; 
            filter: brightness(1);
          }
        }
        
        @keyframes solve-pulse {
          0%, 100% { 
            transform: scale(1) rotate(0deg); 
            opacity: 0.12; 
          }
          50% { 
            transform: scale(1.02) rotate(0.5deg); 
            opacity: 0.25; 
          }
        }
        
        .animate-math-float-solve {
          animation: math-float-solve 14s ease-in-out infinite;
        }
        
        .animate-solve-convergence {
          animation: solve-convergence 12s ease-in-out infinite;
        }
        
        .animate-convergence-path {
          animation: convergence-path infinite linear;
        }
        
        .animate-solve-particle {
          filter: drop-shadow(0 0 8px currentColor);
        }
        
        .animate-solve-pulse {
          animation: solve-pulse 16s ease-in-out infinite;
        }
        
        @keyframes gentleFlow {
          0%, 100% { 
            backgroundPosition: 0 0;
            opacity: 0.08;
          }
          50% { 
            backgroundPosition: 30px 30px;
            opacity: 0.12;
          }
        }
        
        @keyframes solveBorderGlow {
          0% { opacity: 0.4; filter: brightness(1); }
          100% { opacity: 0.8; filter: brightness(1.4) saturate(1.2); }
        }
        
        @keyframes scanLine {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes circlePulse {
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

        .animate-spin-slow {
          animation: rotate 12s linear infinite;
        }
        
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .floating-math-symbol {
          font-family: 'Times New Roman', serif;
          user-select: none;
          pointer-events: none;
        }

        /* 无障碍支持 */
        @media (prefers-reduced-motion: reduce) {
          .animate-math-float-solve,
          .animate-solve-convergence,
          .animate-convergence-path,
          .animate-solve-particle,
          .animate-solve-pulse {
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
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </section>
  )
}

export default Section5NonlinearSolve