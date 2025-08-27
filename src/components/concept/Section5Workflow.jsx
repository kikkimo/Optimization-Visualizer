import React, { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const WorkflowDemo = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [speed, setSpeed] = useState(1.0)
  
  // 检测用户偏好的动画设置
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    
    const handler = (e) => setReducedMotion(e.matches)
    mediaQuery.addListener?.(handler) || mediaQuery.addEventListener('change', handler)
    
    return () => {
      mediaQuery.removeListener?.(handler) || mediaQuery.removeEventListener('change', handler)
    }
  }, [])

  // 工作流程步骤定义
  const workflowSteps = [
    {
      id: 'modeling',
      title: '问题建模',
      summary: '明确变量、目标、约束与问题性质（连续/离散/动态/随机）',
      keyPoints: [
        { id: 'variables', label: '变量与域', detail: '连续/离散/混合（布尔/整数）', active: false },
        { id: 'objective', label: '目标', detail: '可微/不可微；是否"求和结构"（数据驱动）', active: false },
        { id: 'constraints', label: '约束', detail: '等式/不等式/逻辑（图结构）/物理（PDE）', active: false },
        { id: 'nature', label: '问题性质', detail: '连续优化 / 组合优化 / 动态规划 / 滤波/贝叶斯', active: false }
      ],
      completed: false
    },
    {
      id: 'selection',
      title: '方法选择',
      summary: '依据结构、规模、精度、资源与在线性，选定求解范式与候选算法',
      switches: [
        { id: 'integer', label: '含整数变量', active: false },
        { id: 'convex', label: '凸且有梯度', active: true },
        { id: 'online', label: '在线/时序', active: false },
        { id: 'largescale', label: '大规模数据', active: false }
      ],
      methods: [],
      completed: false
    },
    {
      id: 'initialization',
      title: '初始化',
      summary: '设定初始解/候选集与停止条件、关键超参与资源边界',
      parameters: {
        stepSize: 0.5,
        tolerance: 1e-6,
        maxIterations: 1000,
        trustRegion: 1.0
      },
      completed: false
    },
    {
      id: 'iteration',
      title: '搜索与迭代',
      summary: '在解空间进行系统搜索或递推更新，直至满足停止/最优性判据',
      algorithms: [
        { name: '连续优化', type: 'continuous' },
        { name: 'MILP/图算法', type: 'discrete' },
        { name: '启发式算法', type: 'heuristic' },
        { name: '时序/滤波', type: 'temporal' }
      ],
      stopCriteria: { gradient: 0, gap: 1.0, iterations: 0, converged: false },
      completed: false
    },
    {
      id: 'validation',
      title: '结果验证与评估',
      summary: '评估可行性、最优性、稳健性与对比表现；不达标则回到②/③调法调参',
      metrics: {
        accuracy: 0.85,
        time: 120,
        memory: 64,
        feasibility: 0.92,
        gap: 0.03
      },
      completed: false
    }
  ]

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          setCurrentStep(prev => Math.max(0, prev - 1))
          break
        case 'ArrowDown':
          e.preventDefault()
          setCurrentStep(prev => Math.min(workflowSteps.length - 1, prev + 1))
          break
        case 'Enter':
          e.preventDefault()
          // 展开/收起当前步骤
          break
        case ' ':
          e.preventDefault()
          setIsPlaying(prev => !prev)
          break
        case 'r':
        case 'R':
          e.preventDefault()
          setReducedMotion(prev => !prev)
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // 自动播放控制
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= workflowSteps.length - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 3000 / speed)

    return () => clearInterval(interval)
  }, [isPlaying, speed])

  return (
    <div className="flex h-full">
      {/* 左侧：线性流程栏 */}
      <div 
        className="w-80 bg-gray-900/50 border-r border-gray-700 p-6"
        role="tablist"
        aria-orientation="vertical"
      >
        <h3 className="text-lg font-bold mb-6 text-center" style={{ color: 'var(--tech-mint)' }}>
          五步求解框架
        </h3>
        
        <div className="space-y-4">
          {workflowSteps.map((step, index) => (
            <button
              key={step.id}
              role="tab"
              aria-selected={currentStep === index}
              aria-controls={`panel-${step.id}`}
              className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
                currentStep === index 
                  ? 'bg-blue-500/20 border border-blue-400' 
                  : 'bg-gray-800/50 hover:bg-gray-800 border border-gray-600'
              }`}
              onClick={() => setCurrentStep(index)}
            >
              <div className="flex items-start gap-3">
                {/* 步骤指示器 */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step.completed 
                    ? 'bg-green-500 text-white' 
                    : currentStep === index
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-600 text-gray-300'
                }`}>
                  {step.completed ? '✓' : index + 1}
                </div>
                
                <div className="flex-1">
                  <h4 className={`font-semibold mb-1 ${
                    currentStep === index ? 'text-blue-300' : 'text-gray-300'
                  }`}>
                    {step.title}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {step.summary}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* 控制面板 */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm transition-colors"
            >
              {isPlaying ? '⏸️' : '▶️'} {isPlaying ? '暂停' : '播放'}
            </button>
            
            <select
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-gray-300"
            >
              <option value={0.75}>0.75×</option>
              <option value={1.0}>1×</option>
              <option value={1.25}>1.25×</option>
            </select>
          </div>
          
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              className="rounded"
            />
            减少动画
          </label>
        </div>
      </div>

      {/* 右侧：演示舞台 */}
      <div className="flex-1 relative overflow-hidden">
        {workflowSteps.map((step, index) => (
          <div
            key={step.id}
            id={`panel-${step.id}`}
            role="tabpanel"
            className={`absolute inset-0 p-8 transition-all duration-300 ${
              currentStep === index ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'
            }`}
            style={{
              transition: reducedMotion ? 'opacity 0.15s ease-in-out' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* 步骤一：问题建模 */}
            {step.id === 'modeling' && (
              <div className="h-full flex flex-col">
                <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--ink-high)' }}>
                  问题建模：数学表达
                </h2>
                
                <div className="flex-1 grid grid-cols-2 gap-8">
                  {/* 左侧：可视化区域 */}
                  <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 text-blue-300">可行域与等高线</h3>
                    
                    {/* 简化的可行域可视化 */}
                    <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                      {!reducedMotion ? (
                        <svg width="100%" height="100%" viewBox="0 0 300 200" className="absolute inset-0">
                          {/* 可行域 */}
                          <polygon
                            points="50,150 200,150 180,50 70,70"
                            fill="rgba(34, 197, 94, 0.2)"
                            stroke="rgb(34, 197, 94)"
                            strokeWidth="2"
                            className="animate-pulse"
                          />
                          {/* 等高线 */}
                          <ellipse cx="120" cy="100" rx="30" ry="20" 
                                   fill="none" stroke="rgb(59, 130, 246)" strokeWidth="1" />
                          <ellipse cx="120" cy="100" rx="50" ry="35" 
                                   fill="none" stroke="rgb(59, 130, 246)" strokeWidth="1" opacity="0.7" />
                          <ellipse cx="120" cy="100" rx="70" ry="50" 
                                   fill="none" stroke="rgb(59, 130, 246)" strokeWidth="1" opacity="0.4" />
                          {/* 最优点 */}
                          <circle cx="120" cy="100" r="4" fill="rgb(239, 68, 68)" />
                        </svg>
                      ) : (
                        <div className="text-gray-400 text-center">
                          <div className="text-4xl mb-2">📐</div>
                          <div>问题建模可视化</div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded text-sm border border-blue-500/30">
                        连续变量
                      </button>
                      <button className="px-3 py-1 bg-gray-600/20 text-gray-400 rounded text-sm border border-gray-600/30">
                        离散格点
                      </button>
                    </div>
                  </div>
                  
                  {/* 右侧：要点清单 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-green-300">建模要点</h3>
                    {step.keyPoints.map((point, idx) => (
                      <div
                        key={point.id}
                        className={`p-4 rounded-lg border transition-all duration-300 ${
                          currentStep === index 
                            ? 'bg-green-500/10 border-green-500/30' 
                            : 'bg-gray-800/50 border-gray-600'
                        }`}
                        style={{
                          transitionDelay: reducedMotion ? '0ms' : `${idx * 100}ms`
                        }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <h4 className="font-semibold" style={{ color: 'var(--ink-high)' }}>{point.label}</h4>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--ink-mid)' }}>{point.detail}</p>
                      </div>
                    ))}
                    
                    <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <p className="font-medium" style={{ color: 'var(--tech-mint)' }}>
                        💡 核心思路：把业务变成变量/目标/约束的数学对象
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 步骤二：方法选择 */}
            {step.id === 'selection' && (
              <div className="h-full flex flex-col">
                <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--ink-high)' }}>
                  方法选择：分流决策
                </h2>
                
                <div className="flex-1 grid grid-cols-3 gap-6">
                  {/* 左侧：决策开关 */}
                  <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 text-orange-300">问题特征</h3>
                    <div className="space-y-3">
                      {step.switches.map((sw, idx) => (
                        <label key={sw.id} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sw.active}
                            onChange={() => {}}
                            className="w-4 h-4 text-blue-500 rounded"
                          />
                          <span className="text-sm" style={{ color: 'var(--ink-mid)' }}>{sw.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* 中间：候选方法 */}
                  <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 text-blue-300">候选算法</h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <div className="font-medium text-blue-300">二次规划 (QP)</div>
                        <div className="text-xs text-gray-400">内点法 / 有效集</div>
                      </div>
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="font-medium text-green-300">信赖域方法</div>
                        <div className="text-xs text-gray-400">凸优化收敛保证</div>
                      </div>
                      <div className="p-3 bg-gray-600/10 border border-gray-600/30 rounded-lg opacity-60">
                        <div className="font-medium text-gray-400">启发式算法</div>
                        <div className="text-xs text-gray-500">非凸问题备选</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 右侧：方法演示 */}
                  <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 text-purple-300">收敛过程</h3>
                    <div className="h-32 bg-gray-800 rounded-lg flex items-center justify-center">
                      {!reducedMotion ? (
                        <div className="text-purple-300">
                          <div className="animate-bounce text-2xl mb-2">🎯</div>
                          <div className="text-xs">内点法轨迹</div>
                        </div>
                      ) : (
                        <div className="text-purple-300 text-center">
                          <div className="text-2xl mb-2">📊</div>
                          <div className="text-xs">算法演示</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                      <p className="text-sm font-medium" style={{ color: 'var(--tech-mint)' }}>
                        💡 先看结构再定算法，不反过来
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 步骤三：初始化 */}
            {step.id === 'initialization' && (
              <div className="h-full flex flex-col">
                <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--ink-high)' }}>
                  初始化：参数设定
                </h2>
                
                <div className="flex-1 grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4 text-green-300">✅ 好的初始化</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm" style={{ color: 'var(--ink-mid)' }}>初始点位置</span>
                          <span className="text-green-300 font-mono text-xs">可行域内</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm" style={{ color: 'var(--ink-mid)' }}>步长设置</span>
                          <span className="text-green-300 font-mono text-xs">0.01-0.1</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm" style={{ color: 'var(--ink-mid)' }}>容差设置</span>
                          <span className="text-green-300 font-mono text-xs">1e-6</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                      <h3 className="text-lg font-semibold mb-4 text-red-300">❌ 坏的初始化</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm" style={{ color: 'var(--ink-mid)' }}>初始点位置</span>
                          <span className="text-red-300 font-mono text-xs">远离可行域</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm" style={{ color: 'var(--ink-mid)' }}>步长设置</span>
                          <span className="text-red-300 font-mono text-xs">10.0+</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm" style={{ color: 'var(--ink-mid)' }}>容差设置</span>
                          <span className="text-red-300 font-mono text-xs">过松/过紧</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 text-blue-300">参数调节</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-mid)' }}>
                          步长: {step.parameters.stepSize}
                        </label>
                        <input
                          type="range"
                          min="0.001"
                          max="1.0"
                          step="0.001"
                          value={step.parameters.stepSize}
                          className="w-full"
                          onChange={() => {}}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink-mid)' }}>
                          最大迭代: {step.parameters.maxIterations}
                        </label>
                        <input
                          type="range"
                          min="100"
                          max="5000"
                          step="100"
                          value={step.parameters.maxIterations}
                          className="w-full"
                          onChange={() => {}}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-sm font-medium" style={{ color: 'var(--tech-mint)' }}>
                        💡 初始化 = 把轨迹放到可能通往好解的路上
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 步骤四：搜索与迭代 */}
            {step.id === 'iteration' && (
              <div className="h-full flex flex-col">
                <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--ink-high)' }}>
                  搜索与迭代：算法演示
                </h2>
                
                <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 mb-4">
                  {step.algorithms.map((algo, idx) => (
                    <div key={algo.type} className="bg-gray-900/30 rounded-xl p-4 border border-gray-700">
                      <h4 className="font-semibold mb-3 text-cyan-300">{algo.name}</h4>
                      <div className="h-24 bg-gray-800 rounded-lg flex items-center justify-center">
                        {!reducedMotion ? (
                          <div className="text-center">
                            <div className="text-2xl animate-pulse">
                              {idx === 0 ? '📈' : idx === 1 ? '🌳' : idx === 2 ? '🔄' : '📊'}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">运行中</div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="text-2xl">
                              {idx === 0 ? '📈' : idx === 1 ? '🌳' : idx === 2 ? '🔄' : '📊'}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">静态显示</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* 停止判据仪表盘 */}
                <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold mb-4 text-green-300">停止判据监控</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl mb-1">∇</div>
                      <div className="text-xs text-gray-400">梯度模长</div>
                      <div className="text-sm font-mono text-yellow-300">1e-4</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">📏</div>
                      <div className="text-xs text-gray-400">KKT残差</div>
                      <div className="text-sm font-mono text-yellow-300">2e-5</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">🎯</div>
                      <div className="text-xs text-gray-400">Gap</div>
                      <div className="text-sm font-mono text-green-300">0.001</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl mb-1 ${step.stopCriteria.converged ? 'text-green-400' : 'text-yellow-400'}`}>
                        {step.stopCriteria.converged ? '✅' : '⏳'}
                      </div>
                      <div className="text-xs text-gray-400">状态</div>
                      <div className={`text-sm font-semibold ${step.stopCriteria.converged ? 'text-green-300' : 'text-yellow-300'}`}>
                        {step.stopCriteria.converged ? '可停机' : '迭代中'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-sm font-medium" style={{ color: 'var(--tech-mint)' }}>
                      💡 看到的不只是动起来，而是'为什么现在可以/不可以停'
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 步骤五：结果验证 */}
            {step.id === 'validation' && (
              <div className="h-full flex flex-col">
                <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--ink-high)' }}>
                  结果验证：性能评估
                </h2>
                
                <div className="flex-1 grid grid-cols-2 gap-8">
                  {/* 左侧：性能指标 */}
                  <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 text-blue-300">性能指标</h3>
                    
                    <div className="space-y-4">
                      {Object.entries(step.metrics).map(([key, value]) => {
                        const labels = {
                          accuracy: '精度',
                          time: '时间 (秒)',
                          memory: '内存 (MB)',
                          feasibility: '可行性',
                          gap: '对偶间隙'
                        }
                        
                        const isGood = key === 'accuracy' || key === 'feasibility' 
                          ? value > 0.8 
                          : key === 'gap' 
                            ? value < 0.05 
                            : value < 200
                        
                        return (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: 'var(--ink-mid)' }}>{labels[key]}</span>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${isGood ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                              <span className={`font-mono text-sm ${isGood ? 'text-green-300' : 'text-yellow-300'}`}>
                                {typeof value === 'number' && value < 1 ? value.toFixed(3) : value}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-2 text-green-300">
                        <span>🎉</span>
                        <span className="font-semibold">整体评估：优秀</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">所有关键指标达标</p>
                    </div>
                  </div>
                  
                  {/* 右侧：对比与建议 */}
                  <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 text-purple-300">基准对比</h3>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                        <span className="text-sm" style={{ color: 'var(--ink-mid)' }}>当前方案</span>
                        <span className="text-blue-300 font-semibold">85.2%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-600/10 rounded-lg">
                        <span className="text-sm" style={{ color: 'var(--ink-mid)' }}>基线方法</span>
                        <span className="text-gray-400 font-semibold">78.9%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                        <span className="text-sm" style={{ color: 'var(--ink-mid)' }}>提升幅度</span>
                        <span className="text-green-300 font-semibold">+6.3%</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-300 mb-2">
                        <span>🔄</span>
                        <span className="font-semibold">优化建议</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        若指标不达标，可回到步骤②调整方法或步骤③优化参数
                      </p>
                    </div>

                    <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                      <p className="text-sm font-medium" style={{ color: 'var(--tech-mint)' }}>
                        💡 评价 = 可信性与可复现性；不达标就回路迭代
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const Section5Workflow = ({ id }) => {
  const sectionRef = useRef()
  const titleRef = useRef()

  useEffect(() => {
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top center",
      onEnter: () => {
        gsap.fromTo(titleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
        )
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id={id}
      className="snap-section relative overflow-hidden"
      style={{ 
        backgroundColor: 'var(--bg-deep)',
        minHeight: '100vh',
        paddingTop: '80px', // 为顶部导航留出空间
        paddingBottom: '60px' // 底部留白
      }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-8 h-full">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 ref={titleRef} className="font-bold mb-4"
              style={{ 
                fontSize: 'clamp(28px, 4vw, 48px)',
                color: 'var(--ink-high)',
                letterSpacing: '-0.02em'
              }}>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              通用优化求解流程
            </span>
          </h1>
          <p className="text-lg" style={{ color: 'var(--ink-mid)' }}>
            从问题建模到结果验证的完整五步框架
          </p>
        </div>

        {/* 主要内容区域 */}
        <div className="bg-gray-900/20 rounded-2xl border border-gray-700/50 backdrop-blur-sm" 
             style={{ height: 'calc(100vh - 280px)' }}>
          <WorkflowDemo />
        </div>
      </div>

      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>
    </section>
  )
}

export default Section5Workflow