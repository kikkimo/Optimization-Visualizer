import React, { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

const Section4NonlinearWorldStep1 = () => {
  const [activeDemo, setActiveDemo] = useState('superposition')
  const [animationPhase, setAnimationPhase] = useState('initial') // initial, elastic, plastic, comparison
  const [currentObjects, setCurrentObjects] = useState([])
  const [stretch, setStretch] = useState(0) // 拉伸量，对应刻度
  const [springAnimation, setSpringAnimation] = useState('') // 弹簧动画类名
  const [isAnimationRunning, setIsAnimationRunning] = useState(false)
  const animationControlRef = useRef({ shouldStop: false })
  const springRef = useRef()
  const objectRefs = useRef([])
  const scaleRef = useRef()
  const hookRef = useRef()

  // 监控springAnimation状态变化
  useEffect(() => {
    console.log(`springAnimation状态变化: "${springAnimation}"`)
  }, [springAnimation])

  // 监控stretch状态变化
  useEffect(() => {
    console.log(`stretch状态变化: ${stretch}`)
  }, [stretch])

  // 可用物体定义
  const availableObjects = [
    { id: 'A', weight: 1, color: '#3b82f6' },
    { id: 'B', weight: 2, color: '#10b981' },
    { id: 'C', weight: 10, color: '#ef4444' }
  ]

  // 弹簧物理效果触发器
  const triggerSpringPhysics = (isStretching) => {
    const isDamaged = animationPhase === 'plastic' || animationPhase === 'comparison' || animationPhase === 'completed'
    console.log(`触发弹簧物理效果: ${isStretching ? '拉伸' : '释放'}, 弹簧状态: ${isDamaged ? '已损坏' : '正常'}`)
    
    if (isDamaged) {
      // 损坏后的弹簧：生硬，没有弹性效果
      if (isStretching) {
        setSpringAnimation('spring-damaged-stretch')
        console.log('设置弹簧动画类: spring-damaged-stretch (无弹性)')
      } else {
        setSpringAnimation('spring-damaged-release') 
        console.log('设置弹簧动画类: spring-damaged-release (无弹性)')
      }
    } else {
      // 正常弹簧：有弹性效果
      if (isStretching) {
        setSpringAnimation('spring-physics')
        console.log('设置弹簧动画类: spring-physics (有弹性)')
      } else {
        setSpringAnimation('spring-release') 
        console.log('设置弹簧动画类: spring-release (有弹性)')
      }
    }
    
    // 动画结束后清除类名
    setTimeout(() => {
      setSpringAnimation('')
      console.log('清除弹簧动画类')
    }, isDamaged ? 800 : 1500) // 损坏的弹簧动画更短
  }

  // 完整的拉伸式弹簧天平演示序列
  const runFullDemo = async () => {
    console.log('开始完整演示')
    // 重置到初始状态
    animationControlRef.current.shouldStop = false
    setIsAnimationRunning(true)
    setAnimationPhase('initial')
    setCurrentObjects([])
    setStretch(0)
    setSpringAnimation('')
    console.log('重置到初始状态')
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (animationControlRef.current.shouldStop) return // 检查是否被重置
    
    // ========== 阶段1：演示弹性变形的可加性 ==========
    setAnimationPhase('elastic')
    console.log('进入弹性阶段')
    
    // 1.1 测试物体A的单独效果 (1个刻度)
    console.log('测试物体A')
    setCurrentObjects([availableObjects[0]]) // A物体
    triggerSpringPhysics(true) // 触发拉伸动画
    setStretch(1)
    console.log('设置拉伸为1')
    await new Promise(resolve => setTimeout(resolve, 2000))
    if (animationControlRef.current.shouldStop) return
    
    // 1.2 移除物体A，弹簧回到刻度0
    setCurrentObjects([])
    triggerSpringPhysics(false) // 触发释放动画
    setStretch(0)
    await new Promise(resolve => setTimeout(resolve, 2000))
    if (animationControlRef.current.shouldStop) return
    
    // 1.3 测试物体B的单独效果 (2个刻度)
    setCurrentObjects([availableObjects[1]]) // B物体
    triggerSpringPhysics(true) // 触发拉伸动画
    setStretch(2)
    await new Promise(resolve => setTimeout(resolve, 2000))
    if (animationControlRef.current.shouldStop) return
    
    // 1.4 移除物体B
    setCurrentObjects([])
    triggerSpringPhysics(false) // 触发释放动画
    setStretch(0)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 1.5 测试A+B组合 (应该是3个刻度，验证可加性)
    setCurrentObjects([availableObjects[0], availableObjects[1]]) // A + B
    triggerSpringPhysics(true) // 触发拉伸动画
    setStretch(3) // 1+2=3，完美可加性
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // 1.6 移除所有物体，回到刻度0
    setCurrentObjects([])
    triggerSpringPhysics(false) // 触发释放动画
    setStretch(0)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // ========== 阶段2：超重物C造成塑性变形 ==========
    setAnimationPhase('plastic')
    
    // 2.1 超重物C移动到钩子上 (10个刻度的重量)
    setCurrentObjects([availableObjects[2]]) // C物体
    triggerSpringPhysics(true) // 触发强力拉伸动画
    setStretch(10) // 极度拉伸
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // 2.2 移除超重物C，但弹簧无法完全恢复
    // 塑性变形的关键特征：静止状态不再是刻度0，而是在刻度1.5
    setCurrentObjects([])
    // 塑性变形后不完全释放，只是部分回弹
    setStretch(1.5) // 永久变形，无法回到0
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    // ========== 阶段3：验证可加性失效 ==========
    setAnimationPhase('comparison')
    
    // 3.1 重新测试A+B组合（现在弹簧已损坏）
    // 3.2 现在A+B不再是刻度3，而是到了刻度4.5！
    // 这证明了可加性失效：f(A+B) ≠ f(A) + f(B)
    setCurrentObjects([availableObjects[0], availableObjects[1]]) // A + B
    triggerSpringPhysics(true) // 触发拉伸动画（但已损坏的弹簧响应不同）
    setStretch(4.5) // 1.5基线 + 3实际 = 4.5，证明可加性失效
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // 演示结束，标记完成
    if (!animationControlRef.current.shouldStop) {
      setAnimationPhase('completed')
    }
    setIsAnimationRunning(false)
  }

  // 单独的演示函数（保留原有功能）
  const runSpringDemo = (phase) => {
    if (phase === 'full') {
      runFullDemo()
    }
  }

  // 重置动画
  const resetAnimation = () => {
    animationControlRef.current.shouldStop = true // 立即标记停止
    setIsAnimationRunning(false)
    setAnimationPhase('initial')
    setCurrentObjects([])
    setStretch(0)
    setSpringAnimation('') // 清除弹簧动画类
  }

  // 弹簧可视化组件
  const SpringSystem = () => {
    // 计算弹簧拉伸长度（基础长度 + 拉伸）
    const springLength = 80 + stretch * 15 // 基础80px + 拉伸量
    const isDamaged = animationPhase === 'plastic' || animationPhase === 'comparison' || animationPhase === 'completed'
    
    return (
      <div className="relative flex justify-between items-start" style={{ height: '350px', width: '500px' }}>
        {/* 左侧物体存储区 */}
        <div className="flex flex-col gap-2 items-center" style={{ width: '120px' }}>
          <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
            物体存储区
          </h4>
          {availableObjects.map((obj, index) => (
            <div
              key={`stored-${obj.id}`}
              className="rounded-lg border-2 flex items-center justify-center text-sm font-semibold transition-all duration-500"
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: obj.color,
                borderColor: 'var(--ink-high)',
                color: 'white',
                opacity: currentObjects.find(o => o.id === obj.id) ? 0.3 : 1,
                transform: currentObjects.find(o => o.id === obj.id) ? 'scale(0.8)' : 'scale(1)'
              }}
            >
              {obj.weight}
            </div>
          ))}
        </div>
        
        {/* 中间天平系统 */}
        <div className="relative flex flex-col items-center" style={{ height: '350px', width: '180px' }}>
          {/* 固定支撑 */}
          <div 
            className="w-16 h-4 rounded-t border-2"
            style={{ 
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--ink-high)',
              position: 'absolute',
              top: '10px'
            }}
          />
          
          {/* 弹簧 */}
          <svg 
            width="40" 
            height={springLength} 
            className={springAnimation}
            style={{ 
              position: 'absolute',
              top: '20px',
              transition: animationPhase === 'plastic' 
                ? 'all 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)' 
                : 'all 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)', // 弹性缓动
              transformOrigin: 'top center'
            }}
          >
            <defs>
              <linearGradient id="springGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: isDamaged ? '#dc2626' : '#059669', stopOpacity: 0.8 }} />
                <stop offset="50%" style={{ stopColor: isDamaged ? '#f87171' : '#34d399', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: isDamaged ? '#dc2626' : '#059669', stopOpacity: 0.8 }} />
              </linearGradient>
              <filter id="springGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path
              d={`M 20 0 ${Array.from({ length: Math.floor(springLength / 10) }, (_, i) => 
                `L ${i % 2 === 0 ? 12 : 28} ${(i + 1) * 10}`
              ).join(' ')} L 20 ${springLength}`}
              stroke="url(#springGradient)"
              strokeWidth={isDamaged ? "5" : "4"}
              fill="none"
              filter="url(#springGlow)"
              className={animationPhase === 'plastic' ? 'animate-pulse' : ''}
              style={{ 
                transition: 'all 0.5s ease-in-out'
              }}
            />
            {/* 弹簧反光效果 */}
            <path
              d={`M 20 0 ${Array.from({ length: Math.floor(springLength / 10) }, (_, i) => 
                `L ${i % 2 === 0 ? 14 : 26} ${(i + 1) * 10}`
              ).join(' ')} L 20 ${springLength}`}
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="1"
              fill="none"
              style={{ 
                transition: 'all 0.5s ease-in-out'
              }}
            />
          </svg>
          
          {/* 挂篮 */}
          <div 
            className={`border-2 rounded-b-lg relative overflow-hidden ${springAnimation.includes('physics') ? 'basket-bounce' : springAnimation.includes('release') ? 'basket-settle' : springAnimation.includes('damaged') ? 'basket-rigid' : ''}`}
            style={{ 
              width: '40px', // 比36px物体略大4px
              height: '40px', // 比36px物体略高4px
              background: 'linear-gradient(145deg, #f3f4f6 0%, #d1d5db 50%, #9ca3af 100%)',
              borderColor: '#6b7280',
              borderTop: 'none',
              position: 'absolute',
              top: `${25 + springLength}px`, // 挂篮底部与刻度对齐，初始状态为0刻度
              transition: animationPhase === 'plastic' 
                ? 'all 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)' 
                : 'all 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // 弹性下降
              boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.1), inset -2px -2px 4px rgba(255,255,255,0.7), 0 4px 8px rgba(0,0,0,0.2)'
            }}
          >
            {/* 篮子内部阴影 */}
            <div 
              className="absolute inset-1 rounded-b"
              style={{
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 50%, transparent 100%)'
              }}
            />
            {/* 篮子高光 */}
            <div 
              className="absolute top-0 left-1 right-1 h-1 rounded-b"
              style={{
                background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)'
              }}
            />
          </div>
          
          {/* 挂篮内外的物体 */}
          <div 
            className={`absolute flex flex-col-reverse items-center gap-1 ${springAnimation.includes('physics') ? 'objects-bounce' : springAnimation.includes('release') ? 'objects-settle' : springAnimation.includes('damaged') ? 'objects-rigid' : ''}`}
            style={{
              top: `${25 + springLength - (currentObjects.length - 1) * 37}px`, // 与挂篮底部对齐，然后向上堆叠
              transition: animationPhase === 'plastic' 
                ? 'all 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)' 
                : 'all 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' // 弹性效果
            }}
          >
            {currentObjects.map((obj, index) => (
              <div
                key={`${obj.id}-${index}`}
                className={`rounded-lg border-2 flex items-center justify-center text-sm font-semibold transition-all duration-800 ${springAnimation.includes('physics') ? 'object-wobble' : springAnimation.includes('release') ? 'object-settle' : springAnimation.includes('damaged') ? 'object-rigid' : ''}`}
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: obj.color,
                  borderColor: 'var(--ink-high)',
                  color: 'white',
                  '--object-scale': obj.id === 'C' ? 1.2 : 1,
                  transform: `scale(${obj.id === 'C' ? 1.2 : 1})`,
                  boxShadow: `0 4px 12px ${obj.color}40`
                }}
              >
                {obj.weight}
              </div>
            ))}
          </div>
          
          {/* 运动轨迹指示线 */}
          <div 
            className="absolute w-0.5 bg-gradient-to-b from-transparent via-gray-400 to-transparent opacity-30"
            style={{
              height: '200px',
              left: '50%',
              top: '50px',
              transform: 'translateX(-50%)'
            }}
          />
        </div>
        
        {/* 右侧刻度尺 */}
        <div 
          className="relative"
          style={{ width: '100px', height: '350px' }}
        >
          <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
            重量刻度
          </h4>
          {/* 刻度尺底板 */}
          <div 
            className="absolute rounded-lg"
            style={{
              top: '30px',
              left: '8px',
              width: '20px',
              height: '280px',
              background: 'linear-gradient(to right, #e5e7eb 0%, #f9fafb 50%, #d1d5db 100%)',
              boxShadow: 'inset 2px 0 4px rgba(0,0,0,0.1), inset -2px 0 4px rgba(255,255,255,0.8), 2px 0 8px rgba(0,0,0,0.1)',
              border: '1px solid #9ca3af'
            }}
          />
          <div 
            className="absolute"
            style={{ top: '40px', left: '10px' }}
          >
            {/* 刻度线和数字 */}
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div 
                key={i}
                className="flex items-center"
                style={{ 
                  height: '20px',
                  transform: `translateY(${i * 20}px)`
                }}
              >
                <div 
                  className="transition-all duration-300 rounded-sm"
                  style={{ 
                    backgroundColor: Math.abs(i - stretch) < 0.3 ? '#dc2626' : '#4b5563',
                    width: Math.abs(i - stretch) < 0.3 ? '14px' : '10px',
                    height: '2px',
                    boxShadow: Math.abs(i - stretch) < 0.3 
                      ? '0 0 4px rgba(220, 38, 38, 0.5), inset 0 1px 2px rgba(0,0,0,0.2)' 
                      : 'inset 0 1px 2px rgba(0,0,0,0.2)'
                  }}
                />
                <span 
                  className="ml-3 text-sm transition-all duration-300 font-mono"
                  style={{ 
                    color: Math.abs(i - stretch) < 0.3 ? '#dc2626' : '#4b5563',
                    fontWeight: Math.abs(i - stretch) < 0.3 ? 'bold' : 'normal',
                    fontSize: Math.abs(i - stretch) < 0.3 ? '16px' : '14px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  {i}
                </span>
              </div>
            ))}
            
            {/* 当前读数指示器 - 三角形+矩形 */}
            <div className="absolute flex items-center" style={{
              right: '-18px',
              top: `${stretch * 40 + 4}px`, // 修正对齐：使用20px间距匹配刻度
              transition: 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
              zIndex: 10
            }}>
              {/* 指示三角形 */}
              <div 
                className="relative"
                style={{
                  width: '0',
                  height: '0',
                  borderTop: '6px solid transparent',
                  borderBottom: '6px solid transparent',
                  borderRight: `10px solid ${stretch > 5 ? '#dc2626' : stretch > 0 ? '#f59e0b' : '#059669'}`,
                  filter: `drop-shadow(0 2px 4px ${stretch > 5 ? 'rgba(220, 38, 38, 0.3)' : stretch > 0 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(5, 150, 105, 0.3)'})`
                }}
              />
              {/* 指示矩形 */}
              <div 
                style={{
                  width: '8px',
                  height: '12px',
                  background: `linear-gradient(145deg, ${stretch > 5 ? '#ef4444' : stretch > 0 ? '#f59e0b' : '#10b981'}, ${stretch > 5 ? '#dc2626' : stretch > 0 ? '#d97706' : '#059669'})`,
                  borderRadius: '0 2px 2px 0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.2)'
                }}
              />
            </div>
            
            {/* 读数文字 */}
            <div 
              className="absolute text-xs font-bold px-3 py-1 rounded-lg font-mono"
              style={{
                color: 'white',
                background: `linear-gradient(145deg, ${stretch > 5 ? '#ef4444' : stretch > 0 ? '#f59e0b' : '#10b981'}, ${stretch > 5 ? '#dc2626' : stretch > 0 ? '#d97706' : '#059669'})`,
                right: '-60px',
                top: `${stretch * 40}px`, // 修正对齐：使用20px间距匹配刻度
                transition: 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                minWidth: '44px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.2)',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}
            >
              {stretch.toFixed(1)}
            </div>
          </div>
        </div>
        
        {/* 播放和重置按钮 - 在动画矩形右上角 */}
        <div className="absolute flex gap-2" style={{ top: '-80px', right: '-48px' }}>
          <button
            onClick={() => runSpringDemo('full')}
            disabled={animationPhase !== 'initial' && animationPhase !== 'completed'}
            className="px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
            style={{
              backgroundColor: (animationPhase !== 'initial' && animationPhase !== 'completed') 
                ? 'rgba(156, 163, 175, 0.5)' 
                : 'rgba(34, 197, 94, 0.2)',
              border: `1px solid ${(animationPhase !== 'initial' && animationPhase !== 'completed') 
                ? 'rgba(156, 163, 175, 0.3)' 
                : 'rgba(34, 197, 94, 0.4)'}`,
              color: (animationPhase !== 'initial' && animationPhase !== 'completed') 
                ? 'rgba(156, 163, 175, 0.8)' 
                : 'var(--ink-high)',
              cursor: (animationPhase !== 'initial' && animationPhase !== 'completed') 
                ? 'not-allowed' 
                : 'pointer'
            }}
          >
            {(animationPhase !== 'initial' && animationPhase !== 'completed') ? '播放中' : '播放'}
          </button>
          
          <button
            onClick={resetAnimation}
            className="px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: 'var(--ink-high)',
              cursor: 'pointer'
            }}
          >
            重置
          </button>
        </div>
        
        {/* 当前阶段说明 - 在动画矩形底部 */}
        <div 
          className="absolute left-0 right-0 p-3 rounded-lg"
          style={{ 
            backgroundColor: 'rgba(251, 146, 60, 0.15)',
            bottom: '-50px'
          }}
        >
          <div className="text-sm leading-relaxed" style={{ color: 'var(--ink-high)' }}>
            {animationPhase === 'initial' && (
              <>
                <strong>准备阶段：</strong>弹簧处于自然静止状态，刻度显示为0。左侧存储区有三个测试物体，重量分别为1、2、10个刻度单位。
              </>
            )}
            {animationPhase === 'elastic' && (
              <>
                <strong>弹性阶段：</strong>正在验证弹性变形下的可加性。先测试物体1显示1刻度，再测试物体2显示2刻度，最后测试1+2组合应显示3刻度，证明 f(1+2) = f(1) + f(2)。
              </>
            )}
            {animationPhase === 'plastic' && (
              <>
                <strong>塑性阶段：</strong>超重物体10正在对弹簧造成塑性变形。注意弹簧颜色变红并发生永久损坏，移除后弹簧无法回到0刻度，而是停在1.5刻度位置。
              </>
            )}
            {animationPhase === 'comparison' && (
              <>
                <strong>失效阶段：</strong>用损坏的弹簧重新测试1+2组合。读数显示4.5而非预期的3，证明可加性失效：f(1+2) ≠ f(1) + f(2)。这就是非线性系统的核心特征。
              </>
            )}
            {animationPhase === 'completed' && (
              <>
                <strong>演示完成：</strong>成功展示了系统从线性到非线性的转变过程。弹簧的塑性变形破坏了叠加原理，这是理解非线性系统与线性系统根本差异的关键。
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col gap-4 relative p-4">
      {/* 标题区域 */}
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--ink-high)' }}>
          非线性特性：可加性与齐次性的失效
        </h2>
        <p className="text-lg" style={{ color: 'var(--ink-mid)' }}>
          通过弹簧的塑性变形理解非线性系统的核心特征
        </p>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 flex gap-6">
        {/* 左侧控制区域 */}
        <div className="flex flex-col" style={{ width: '140px' }}>
          {/* 按钮区域 */}
          <div className="flex flex-col gap-2 mb-4">
            <button
              onClick={() => setActiveDemo('superposition')}
              className={`relative px-3 py-3 rounded-xl text-center transition-all duration-300 overflow-hidden ${
                activeDemo === 'superposition' ? 'shadow-lg' : 'hover:shadow-md'
              }`}
              style={{
                background: activeDemo === 'superposition' 
                  ? 'linear-gradient(135deg, rgb(251, 146, 60) 0%, rgb(236, 72, 153) 100%)'
                  : 'var(--bg-surface)',
                border: `1px solid ${activeDemo === 'superposition' ? 'transparent' : 'var(--carbon-line)'}`,
                color: activeDemo === 'superposition' ? 'white' : 'var(--ink-high)',
              }}
            >
              <span className="text-sm font-bold relative z-10">叠加失效</span>
              {activeDemo === 'superposition' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer" />
              )}
            </button>

            <button
              onClick={() => setActiveDemo('proportionality')}
              className={`relative px-3 py-3 rounded-xl text-center transition-all duration-300 overflow-hidden ${
                activeDemo === 'proportionality' ? 'shadow-lg' : 'hover:shadow-md'
              }`}
              style={{
                background: activeDemo === 'proportionality' 
                  ? 'linear-gradient(135deg, rgb(168, 85, 247) 0%, rgb(251, 146, 60) 100%)'
                  : 'var(--bg-surface)',
                border: `1px solid ${activeDemo === 'proportionality' ? 'transparent' : 'var(--carbon-line)'}`,
                color: activeDemo === 'proportionality' ? 'white' : 'var(--ink-high)',
              }}
            >
              <span className="text-sm font-bold relative z-10">比例打破</span>
              {activeDemo === 'proportionality' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer" />
              )}
            </button>
          </div>

          {/* 直观理解信息栏 - 只在比例打破模式下显示 */}
          {activeDemo === 'proportionality' && (
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(251, 146, 60, 0.1)' }}>
              <h5 className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                直观理解
              </h5>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                "双倍的输入"可能得到<strong>小于或大于双倍</strong>的输出。系统存在"规模效应"或"饱和效应"，违背了简单的比例关系。
              </p>
            </div>
          )}
        </div>

        {/* 右侧内容区域 */}
        <div className="flex-1 rounded-2xl border backdrop-blur-sm p-6 overflow-hidden"
             style={{
               backgroundColor: activeDemo === 'superposition' 
                 ? 'rgba(251, 146, 60, 0.04)'
                 : 'rgba(168, 85, 247, 0.04)',
               borderColor: activeDemo === 'superposition' ? 'rgba(251, 146, 60, 0.2)' : 'rgba(168, 85, 247, 0.2)',
               boxShadow: activeDemo === 'superposition' 
                 ? '0 8px 32px -8px rgba(251, 146, 60, 0.15)' 
                 : '0 8px 32px -8px rgba(168, 85, 247, 0.15)'
             }}>

          {activeDemo === 'superposition' ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
                  1. 叠加原理失效 (Superposition Principle Fails)
                </h4>
                
                <div className="text-center mb-6">
                  <BlockMath math="f(x+y) \neq f(x)+f(y)" />
                </div>

                {/* 弹簧天平可视化区域 */}
                <div className="flex justify-center mb-4">
                  <SpringSystem />
                </div>


              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
                  2. 比例关系被打破 (Proportionality is Broken)
                </h4>
                
                <div className="text-center mb-6">
                  <BlockMath math="f(\alpha x) \neq \alpha f(x)" />
                </div>

                {/* 弹性vs塑性变形对比图 */}
                <div className="flex justify-center mb-6">
                  <div className="relative" style={{ width: '450px', height: '320px' }}>
                    <svg viewBox="0 0 450 320" className="w-full h-full border border-gray-600 rounded bg-gray-900/50">
                      {/* X轴（力） */}
                      <line x1="50" y1="270" x2="380" y2="270" stroke="#6b7280" strokeWidth="2"/>
                      {/* X轴箭头 */}
                      <polygon points="380,270 374,266 374,274" fill="#6b7280"/>
                      
                      {/* Y轴（形变） */}
                      <line x1="50" y1="50" x2="50" y2="270" stroke="#6b7280" strokeWidth="2"/>
                      {/* Y轴箭头 */}
                      <polygon points="50,50 46,56 54,56" fill="#6b7280"/>
                      
                      {/* 弹性变形阶段（虚线） */}
                      <line 
                        x1="50" 
                        y1="270" 
                        x2="200" 
                        y2="150" 
                        stroke="#22c55e" 
                        strokeWidth="3" 
                        strokeDasharray="8,4"
                      />
                      
                      {/* 塑性变形阶段（实线） - 符合真实物理的应变硬化曲线 */}
                      <path 
                        d="M200 150 Q220 140 240 133 Q270 123 300 117 Q330 113 350 110 Q370 108 380 107" 
                        stroke="#ef4444" 
                        strokeWidth="3" 
                        fill="none"
                      />
                      
                      {/* 弹性极限标记点 */}
                      <circle cx="200" cy="150" r="5" fill="#fbbf24" stroke="white" strokeWidth="2"/>
                      
                      {/* 网格线 */}
                      <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="1" opacity="0.3"/>
                        </pattern>
                      </defs>
                      <rect x="50" y="50" width="330" height="220" fill="url(#grid)" opacity="0.5"/>
                      
                      {/* 坐标轴标签 */}
                      <text x="20" y="30" fill="#e5e7eb" fontSize="14" className="font-semibold">形变</text>
                      <text x="390" y="285" fill="#e5e7eb" fontSize="14" className="font-semibold">力</text>
                      
                      {/* 弹性阶段标签 */}
                      <text x="102" y="180" fill="#22c55e" fontSize="12" className="font-medium">弹性变形</text>
                      <text x="105" y="195" fill="#22c55e" fontSize="10">(成比例)</text>
                      
                      {/* 塑性阶段标签 */}
                      <text x="272" y="90" fill="#ef4444" fontSize="12" className="font-medium">塑性变形</text>
                      <text x="275" y="105" fill="#ef4444" fontSize="10">(不成比例)</text>
                      
                      {/* 弹性极限标注 */}
                      <text x="160" y="140" fill="#fbbf24" fontSize="11" className="font-semibold">弹性极限</text>
                      <line x1="200" y1="145" x2="180" y2="135" stroke="#fbbf24" strokeWidth="1"/>
                      
                      {/* 比例关系说明 */}
                      <text x="60" y="300" fill="#94a3b8" fontSize="11">弹性区：f(2x) = 2f(x) ✓</text>
                      <text x="220" y="300" fill="#94a3b8" fontSize="11">塑性区：f(2x) ≠ 2f(x) ✗</text>
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}>
                    <h5 className="font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                      规模效应
                    </h5>
                    <p className="text-sm" style={{ color: 'var(--ink-mid)' }}>
                      系统在不同规模下表现出不同的行为特性，"双倍输入"可能产生小于或大于双倍的输出。
                    </p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}>
                    <h5 className="font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                      饱和效应
                    </h5>
                    <p className="text-sm" style={{ color: 'var(--ink-mid)' }}>
                      在遥感模型中，植被覆盖度加倍时，其反射率的变化通常不会严格加倍，存在饱和现象。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 动画样式 */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        
        @keyframes springStretch {
          0% { 
            transform: scaleY(1) scaleX(1);
          }
          20% { 
            transform: scaleY(0.95) scaleX(1.05); /* 压缩反弹 */
          }
          40% { 
            transform: scaleY(1.1) scaleX(0.98); /* 过度拉伸 */
          }
          60% { 
            transform: scaleY(0.98) scaleX(1.02); /* 反向震荡 */
          }
          80% { 
            transform: scaleY(1.02) scaleX(0.999); /* 细微调整 */
          }
          100% { 
            transform: scaleY(1) scaleX(1); /* 稳定 */
          }
        }
        
        @keyframes springCompress {
          0% { 
            transform: scaleY(1) scaleX(1);
          }
          30% { 
            transform: scaleY(1.05) scaleX(0.98); /* 拉伸 */
          }
          60% { 
            transform: scaleY(0.9) scaleX(1.08); /* 压缩 */
          }
          85% { 
            transform: scaleY(1.01) scaleX(0.999); /* 微调 */
          }
          100% { 
            transform: scaleY(1) scaleX(1);
          }
        }
        
        .spring-physics {
          animation: springStretch 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
        
        .spring-release {
          animation: springCompress 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        
        /* 损坏弹簧的生硬动画 - 没有弹性效果 */
        @keyframes springDamagedStretch {
          0% { 
            transform: scaleY(1) scaleX(1);
          }
          100% { 
            transform: scaleY(1) scaleX(1); /* 完全没有形变，生硬 */
          }
        }
        
        @keyframes springDamagedRelease {
          0% { 
            transform: scaleY(1) scaleX(1);
          }
          50% { 
            transform: scaleY(0.98) scaleX(1.01); /* 只有微小的僵硬变形 */
          }
          100% { 
            transform: scaleY(1) scaleX(1);
          }
        }
        
        .spring-damaged-stretch {
          animation: springDamagedStretch 0.8s linear forwards;
        }
        
        .spring-damaged-release {
          animation: springDamagedRelease 0.8s ease-out forwards;
        }
        
        /* 挂篮动画 */
        @keyframes basketBounce {
          0% { transform: translateY(0) rotate(0deg); }
          15% { transform: translateY(-2px) rotate(-0.5deg); }
          30% { transform: translateY(1px) rotate(0.3deg); }
          45% { transform: translateY(-1px) rotate(-0.2deg); }
          60% { transform: translateY(0.5px) rotate(0.1deg); }
          75% { transform: translateY(-0.2px) rotate(-0.05deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        
        @keyframes basketSettle {
          0% { transform: translateY(0) rotate(0deg); }
          30% { transform: translateY(-1px) rotate(0.2deg); }
          70% { transform: translateY(0.5px) rotate(-0.1deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        
        @keyframes basketRigid {
          0% { transform: translateY(0); }
          50% { transform: translateY(-0.2px); }
          100% { transform: translateY(0); }
        }
        
        .basket-bounce {
          animation: basketBounce 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
        
        .basket-settle {
          animation: basketSettle 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        
        .basket-rigid {
          animation: basketRigid 0.8s linear forwards;
        }
        
        /* 物体容器动画 */
        .objects-bounce {
          animation: basketBounce 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
        
        .objects-settle {
          animation: basketSettle 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        
        .objects-rigid {
          animation: basketRigid 0.8s linear forwards;
        }
        
        /* 单个物体动画 */
        @keyframes objectWobble {
          0% { transform: scale(var(--object-scale, 1)) rotate(0deg); }
          20% { transform: scale(calc(var(--object-scale, 1) * 1.05)) rotate(-1deg); }
          40% { transform: scale(calc(var(--object-scale, 1) * 0.98)) rotate(0.8deg); }
          60% { transform: scale(calc(var(--object-scale, 1) * 1.02)) rotate(-0.5deg); }
          80% { transform: scale(calc(var(--object-scale, 1) * 0.99)) rotate(0.2deg); }
          100% { transform: scale(var(--object-scale, 1)) rotate(0deg); }
        }
        
        @keyframes objectSettle {
          0% { transform: scale(var(--object-scale, 1)) rotate(0deg); }
          40% { transform: scale(calc(var(--object-scale, 1) * 1.02)) rotate(0.3deg); }
          100% { transform: scale(var(--object-scale, 1)) rotate(0deg); }
        }
        
        @keyframes objectRigid {
          0% { transform: scale(var(--object-scale, 1)); }
          100% { transform: scale(var(--object-scale, 1)); }
        }
        
        .object-wobble {
          animation: objectWobble 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
        
        .object-settle {
          animation: objectSettle 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        
        .object-rigid {
          animation: objectRigid 0.8s linear forwards;
        }
      `}</style>
    </div>
  )
}

export default Section4NonlinearWorldStep1