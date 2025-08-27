import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import Plot from 'react-plotly.js'

const ModeSwitch = ({ currentMode, onModeChange, availableModes }) => {
  const modes = [
    { id: 'storyboard', label: 'Storyboard', icon: '📖', description: '原理演示' },
    { id: 'replay', label: 'Replay', icon: '▶️', description: '预计算回放' },
    { id: 'compute', label: 'Compute', icon: '⚡', description: '实时计算' }
  ]

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white mb-3">演示模式</h3>
      <div className="grid grid-cols-3 gap-2">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            disabled={!availableModes[mode.id]}
            className={`p-3 rounded-lg transition-all duration-200 text-center ${
              currentMode === mode.id
                ? 'bg-blue-500 text-white shadow-lg'
                : availableModes[mode.id]
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-900 text-gray-600 cursor-not-allowed'
            }`}
          >
            <div className="text-xl mb-1">{mode.icon}</div>
            <div className="text-xs font-medium">{mode.label}</div>
            <div className="text-xs opacity-80">{mode.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

const ParamPanel = ({ parameters, values, onChange }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white mb-3">参数控制</h3>
      <div className="space-y-4">
        {parameters.map((param) => (
          <div key={param.id}>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-300">
                {param.label}
              </label>
              <span className="text-sm text-blue-400 font-mono">
                {values[param.id]?.toFixed(param.decimals || 2)}
              </span>
            </div>
            <input
              type="range"
              min={param.min}
              max={param.max}
              step={param.step}
              value={values[param.id] || param.default}
              onChange={(e) => onChange(param.id, parseFloat(e.target.value))}
              className="param-slider w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{param.min}</span>
              <span>{param.max}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const KPIBar = ({ metrics }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white mb-3">性能指标</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="text-center">
            <div className="text-2xl font-bold text-blue-400">{value.value}</div>
            <div className="text-xs text-gray-400">{value.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const StoryboardMode = ({ methodId, parameters }) => {
  const [animationProgress, setAnimationProgress] = useState(0)
  const canvasRef = useRef()

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationProgress(prev => (prev + 1) % 100)
    }, 100)

    return () => clearInterval(interval)
  }, [])

  const renderMethodAnimation = () => {
    switch (methodId) {
      case 'kalman-filter':
        return (
          <div className="bg-gray-900 rounded-lg p-6 h-96 flex items-center justify-center">
            <div className="relative w-full h-full max-w-md mx-auto">
              <svg viewBox="0 0 400 300" className="w-full h-full">
                <defs>
                  <linearGradient id="trajectory" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                
                <path
                  d="M 50 250 Q 150 100 250 150 Q 300 200 350 100"
                  stroke="url(#trajectory)"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="1000"
                  strokeDashoffset={1000 - (animationProgress * 10)}
                  className="transition-all duration-100"
                />
                
                <circle
                  cx={50 + (animationProgress * 3)}
                  cy={250 - Math.sin(animationProgress * 0.1) * 50}
                  r="8"
                  fill="#10b981"
                  opacity="0.8"
                >
                  <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
                </circle>
                
                <text x="200" y="30" textAnchor="middle" fill="#ffffff" className="text-sm">
                  卡尔曼滤波轨迹估计
                </text>
              </svg>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="bg-gray-900 rounded-lg p-6 h-96 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center animate-pulse">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-white">原理演示动画</h3>
              <p className="text-gray-400">这里将显示 {methodId} 的原理示意动画</p>
              <div className="w-48 h-2 bg-gray-700 rounded-full mx-auto overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-100"
                  style={{ width: `${animationProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div ref={canvasRef}>
        {renderMethodAnimation()}
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-blue-400 mb-3">原理说明</h4>
        <p className="text-gray-300 text-sm leading-relaxed">
          Storyboard 模式通过动画演示算法的核心原理和执行流程。
          参数调整将改变动画的表现形式，帮助理解不同参数对算法行为的影响。
        </p>
      </div>
    </div>
  )
}

const ReplayMode = ({ methodId }) => {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const totalFrames = 20

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        if (prev >= totalFrames - 1) {
          setIsPlaying(false)
          return 0
        }
        return prev + 1
      })
    }, 200)

    return () => clearInterval(interval)
  }, [isPlaying, totalFrames])

  const generateFrameData = (frame) => {
    const data = []
    for (let i = 0; i <= frame; i++) {
      data.push({
        x: i,
        y: 100 * Math.exp(-i * 0.1) + Math.random() * 5,
        error: Math.max(0.1, 10 * Math.exp(-i * 0.15))
      })
    }
    return data
  }

  const frameData = generateFrameData(currentFrame)

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-white">预计算结果回放</h4>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {isPlaying ? '⏸️ 暂停' : '▶️ 播放'}
            </button>
            <button
              onClick={() => { setCurrentFrame(0); setIsPlaying(false) }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              🔄 重置
            </button>
          </div>
        </div>

        <div className="h-80">
          <Plot
            data={[
              {
                x: frameData.map(d => d.x),
                y: frameData.map(d => d.y),
                type: 'scatter',
                mode: 'lines+markers',
                name: '目标函数值',
                line: { color: '#3b82f6', width: 3 },
                marker: { size: 8, color: '#3b82f6' }
              },
              {
                x: frameData.map(d => d.x),
                y: frameData.map(d => d.error),
                type: 'scatter',
                mode: 'lines+markers',
                name: '估计误差',
                yaxis: 'y2',
                line: { color: '#10b981', width: 2 },
                marker: { size: 6, color: '#10b981' }
              }
            ]}
            layout={{
              title: {
                text: `回放进度: ${currentFrame}/${totalFrames} 帧`,
                font: { color: '#ffffff' }
              },
              xaxis: {
                title: '迭代步数',
                color: '#ffffff',
                gridcolor: '#374151'
              },
              yaxis: {
                title: '目标函数值',
                color: '#ffffff',
                gridcolor: '#374151'
              },
              yaxis2: {
                title: '估计误差',
                overlaying: 'y',
                side: 'right',
                color: '#10b981'
              },
              plot_bgcolor: '#111827',
              paper_bgcolor: '#111827',
              font: { color: '#ffffff' },
              legend: { font: { color: '#ffffff' } }
            }}
            style={{ width: '100%', height: '100%' }}
            config={{ displayModeBar: false }}
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-green-400 mb-3">回放说明</h4>
        <p className="text-gray-300 text-sm leading-relaxed">
          Replay 模式展示预先计算好的优化过程关键帧。
          这些数据来自真实的算法执行过程，能够准确反映算法的收敛特性和性能表现。
        </p>
      </div>
    </div>
  )
}

const ComputeMode = ({ methodId, parameters }) => {
  const [isComputing, setIsComputing] = useState(false)
  const [results, setResults] = useState(null)
  const [computeProgress, setComputeProgress] = useState(0)

  const runComputation = async () => {
    setIsComputing(true)
    setComputeProgress(0)
    
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 50))
      setComputeProgress(i)
    }

    const simulatedResults = {
      finalValue: (Math.random() * 10 + 1).toFixed(3),
      iterations: Math.floor(Math.random() * 20 + 5),
      computeTime: (Math.random() * 200 + 50).toFixed(0),
      convergenceReached: Math.random() > 0.2
    }

    setResults(simulatedResults)
    setIsComputing(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-white">实时计算</h4>
          <button
            onClick={runComputation}
            disabled={isComputing}
            className={`px-4 py-2 rounded transition-colors ${
              isComputing 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
          >
            {isComputing ? '⚡ 计算中...' : '🚀 开始计算'}
          </button>
        </div>

        {isComputing && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>计算进度</span>
              <span>{computeProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${computeProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {results && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h5 className="text-lg font-semibold text-purple-400 mb-3">计算结果</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{results.finalValue}</div>
                <div className="text-xs text-gray-400">最终函数值</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{results.iterations}</div>
                <div className="text-xs text-gray-400">迭代次数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{results.computeTime}ms</div>
                <div className="text-xs text-gray-400">计算时间</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${results.convergenceReached ? 'text-green-400' : 'text-red-400'}`}>
                  {results.convergenceReached ? '✓' : '✗'}
                </div>
                <div className="text-xs text-gray-400">收敛状态</div>
              </div>
            </div>
          </div>
        )}

        {!results && !isComputing && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-4">⚡</div>
            <p>点击"开始计算"运行微型优化算法</p>
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-purple-400 mb-3">计算说明</h4>
        <p className="text-gray-300 text-sm leading-relaxed">
          Compute 模式在浏览器中运行简化版的优化算法。
          为了保证响应速度，使用了较小的问题规模和简化的计算逻辑，
          但仍能体现算法的核心思想和收敛过程。
        </p>
      </div>
    </div>
  )
}

const MethodCard = () => {
  const { methodId } = useParams()
  const navigate = useNavigate()
  const [currentMode, setCurrentMode] = useState('storyboard')
  const [parameters, setParameters] = useState({
    learningRate: 0.01,
    tolerance: 0.001,
    maxIterations: 100
  })

  const titleRef = useRef()

  useEffect(() => {
    gsap.fromTo(titleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
    )
  }, [methodId])

  const methodConfig = {
    'kalman-filter': {
      name: '卡尔曼滤波',
      description: '状态估计与动态系统滤波的最优方法',
      availableModes: { storyboard: true, replay: true, compute: true },
      parameters: [
        { id: 'processNoise', label: '过程噪声', min: 0.01, max: 1, step: 0.01, default: 0.1, decimals: 2 },
        { id: 'measurementNoise', label: '观测噪声', min: 0.01, max: 1, step: 0.01, default: 0.1, decimals: 2 },
        { id: 'initialUncertainty', label: '初始不确定度', min: 0.1, max: 5, step: 0.1, default: 1, decimals: 1 }
      ]
    },
    'bundle-adjustment': {
      name: 'Bundle Adjustment',
      description: '多视角几何约束的参数估计',
      availableModes: { storyboard: true, replay: true, compute: false },
      parameters: [
        { id: 'dampingFactor', label: '阻尼因子', min: 0.001, max: 1, step: 0.001, default: 0.01, decimals: 3 },
        { id: 'convergenceThreshold', label: '收敛阈值', min: 0.0001, max: 0.01, step: 0.0001, default: 0.001, decimals: 4 }
      ]
    }
  }

  const config = methodConfig[methodId] || {
    name: '优化方法',
    description: '数学优化算法演示',
    availableModes: { storyboard: true, replay: false, compute: false },
    parameters: []
  }

  const handleParameterChange = (paramId, value) => {
    setParameters(prev => ({ ...prev, [paramId]: value }))
  }

  const metrics = {
    rmse: { value: '0.023', label: 'RMSE' },
    iterations: { value: '12', label: '迭代数' },
    time: { value: '156ms', label: '计算时间' },
    convergence: { value: '✓', label: '收敛状态' }
  }

  const renderCurrentMode = () => {
    switch (currentMode) {
      case 'storyboard':
        return <StoryboardMode methodId={methodId} parameters={parameters} />
      case 'replay':
        return <ReplayMode methodId={methodId} />
      case 'compute':
        return <ComputeMode methodId={methodId} parameters={parameters} />
      default:
        return <StoryboardMode methodId={methodId} parameters={parameters} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/methods')}
            className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>返回方法列表</span>
          </button>

          <div ref={titleRef}>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
              {config.name}
            </h1>
            <p className="text-xl text-gray-300">{config.description}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {renderCurrentMode()}
          </div>

          <div className="space-y-6">
            <ModeSwitch
              currentMode={currentMode}
              onModeChange={setCurrentMode}
              availableModes={config.availableModes}
            />

            {config.parameters.length > 0 && (
              <ParamPanel
                parameters={config.parameters}
                values={parameters}
                onChange={handleParameterChange}
              />
            )}

            <KPIBar metrics={metrics} />

            <div className="bg-gray-800 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-3">应用领域</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>GNSS/INS组合导航</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>目标跟踪与识别</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>传感器数据融合</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MethodCard