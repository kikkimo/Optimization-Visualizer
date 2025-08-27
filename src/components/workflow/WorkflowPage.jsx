import React, { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Plot from 'react-plotly.js'

gsap.registerPlugin(ScrollTrigger)

const IterationChart = ({ isVisible }) => {
  const [data, setData] = useState([])
  const [currentIteration, setCurrentIteration] = useState(0)
  
  useEffect(() => {
    if (!isVisible) return
    
    const generateIterationData = () => {
      const iterations = []
      let currentValue = 100 + Math.random() * 50
      
      for (let i = 0; i <= 20; i++) {
        const noise = (Math.random() - 0.5) * 2
        const decay = Math.exp(-i * 0.15)
        currentValue = Math.max(1, currentValue * (0.95 + noise * 0.02) - decay * 5)
        iterations.push({
          iteration: i,
          objective: currentValue,
          gradient: Math.abs(currentValue - (iterations[i-1]?.objective || currentValue)) * 10
        })
      }
      return iterations
    }

    setData(generateIterationData())
    
    const interval = setInterval(() => {
      setCurrentIteration(prev => prev < 20 ? prev + 1 : 0)
    }, 500)

    return () => clearInterval(interval)
  }, [isVisible])

  const objectiveData = data.slice(0, currentIteration + 1)
  const gradientData = data.slice(0, currentIteration + 1)

  return (
    <div className="bg-gray-800 rounded-xl p-6 h-96">
      <Plot
        data={[
          {
            x: objectiveData.map(d => d.iteration),
            y: objectiveData.map(d => d.objective),
            type: 'scatter',
            mode: 'lines+markers',
            name: '目标函数值',
            line: { color: '#3b82f6', width: 3 },
            marker: { size: 8, color: '#3b82f6' }
          },
          {
            x: gradientData.map(d => d.iteration),
            y: gradientData.map(d => d.gradient),
            type: 'scatter',
            mode: 'lines+markers',
            name: '梯度模长',
            yaxis: 'y2',
            line: { color: '#10b981', width: 2 },
            marker: { size: 6, color: '#10b981' }
          }
        ]}
        layout={{
          title: {
            text: '优化迭代过程',
            font: { color: '#ffffff' }
          },
          xaxis: {
            title: '迭代次数',
            color: '#ffffff',
            gridcolor: '#374151'
          },
          yaxis: {
            title: '目标函数值',
            color: '#ffffff',
            gridcolor: '#374151'
          },
          yaxis2: {
            title: '梯度模长',
            overlaying: 'y',
            side: 'right',
            color: '#10b981'
          },
          plot_bgcolor: '#1f2937',
          paper_bgcolor: '#1f2937',
          font: { color: '#ffffff' },
          legend: {
            font: { color: '#ffffff' }
          }
        }}
        style={{ width: '100%', height: '100%' }}
        config={{ displayModeBar: false }}
      />
    </div>
  )
}

const WorkflowSteps = () => {
  const stepsRef = useRef()
  
  const steps = [
    {
      id: 'modeling',
      title: '问题建模',
      icon: '📐',
      description: '定义目标函数和约束条件',
      details: [
        '确定优化变量',
        '建立目标函数',
        '识别约束条件',
        '选择优化类型'
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'method-selection',
      title: '方法选择',
      icon: '🎯',
      description: '根据问题特征选择合适算法',
      details: [
        '分析问题规模',
        '评估约束复杂度',
        '考虑精度要求',
        '权衡计算资源'
      ],
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'initialization',
      title: '初值设定',
      icon: '🎲',
      description: '设置算法初始参数和起始点',
      details: [
        '选择初始解',
        '设定算法参数',
        '配置收敛准则',
        '预估计算复杂度'
      ],
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'iteration',
      title: '迭代求解',
      icon: '🔄',
      description: '执行优化算法直到收敛',
      details: [
        '计算梯度/搜索方向',
        '确定步长',
        '更新解向量',
        '检查收敛条件'
      ],
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'validation',
      title: '结果验证',
      icon: '✅',
      description: '评估解的质量和可靠性',
      details: [
        '检验最优性条件',
        '分析解的稳定性',
        '评估精度指标',
        '对比基准方法'
      ],
      color: 'from-indigo-500 to-blue-500'
    }
  ]

  useEffect(() => {
    const stepElements = stepsRef.current.querySelectorAll('.workflow-step')
    
    ScrollTrigger.create({
      trigger: stepsRef.current,
      start: "top center",
      end: "bottom center",
      onEnter: () => {
        gsap.fromTo(stepElements,
          { opacity: 0, x: -50 },
          { 
            opacity: 1, 
            x: 0, 
            duration: 0.8,
            stagger: 0.3,
            ease: "power2.out"
          }
        )
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <div ref={stepsRef} className="space-y-6">
      {steps.map((step, index) => (
        <div key={step.id} className="workflow-step flex items-center space-x-6">
          <div className={`flex-shrink-0 w-20 h-20 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center text-2xl shadow-xl`}>
            {step.icon}
          </div>
          
          <div className="flex-1 bg-gray-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-sm font-bold text-gray-400">步骤 {index + 1}</span>
                  <h3 className="text-xl font-bold text-white">{step.title}</h3>
                </div>
                <p className="text-gray-300 mb-4">{step.description}</p>
                
                <div className="grid grid-cols-2 gap-3">
                  {step.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-sm text-gray-400">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex-shrink-0 ml-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${step.color} opacity-20 rounded-lg flex items-center justify-center`}>
                  <span className="text-2xl opacity-60">{step.icon}</span>
                </div>
              </div>
            </div>
          </div>
          
          {index < steps.length - 1 && (
            <div className="absolute left-10 mt-20 w-0.5 h-6 bg-gradient-to-b from-gray-400 to-transparent"></div>
          )}
        </div>
      ))}
    </div>
  )
}

const WorkflowPage = () => {
  const sectionRef = useRef()
  const titleRef = useRef()
  const chartRef = useRef()
  const [showChart, setShowChart] = useState(false)

  useEffect(() => {
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top center",
      onEnter: () => {
        gsap.fromTo(titleRef.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
        )
      }
    })

    ScrollTrigger.create({
      trigger: chartRef.current,
      start: "top center",
      onEnter: () => {
        setShowChart(true)
      },
      onLeave: () => {
        setShowChart(false)
      },
      onEnterBack: () => {
        setShowChart(true)
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <div ref={sectionRef} className="section-container bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto">
        <h2 ref={titleRef} className="section-title mb-16">
          优化求解一般流程
        </h2>
        
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-blue-400 mb-4">标准优化流程</h3>
              <p className="text-gray-300 leading-relaxed">
                无论采用何种具体算法，数学优化问题的求解都遵循相似的基本流程。
                以下五个步骤构成了优化求解的标准框架。
              </p>
            </div>
            
            <WorkflowSteps />
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-green-400 mb-4">收敛过程可视化</h3>
              <p className="text-gray-300 mb-6">
                右侧图表展示了典型优化算法的收敛过程。蓝线表示目标函数值的下降，
                绿线表示梯度模长的变化，两者都趋向于最优值。
              </p>
            </div>
            
            <div ref={chartRef}>
              <IterationChart isVisible={showChart} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-400 mb-2">收敛判据</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 梯度模长 &lt; 阈值</li>
                  <li>• 函数值变化 &lt; 阈值</li>
                  <li>• 达到最大迭代数</li>
                </ul>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-green-400 mb-2">性能指标</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 收敛速度</li>
                  <li>• 最终精度</li>
                  <li>• 计算复杂度</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-6 rounded-xl border border-purple-500/30">
              <h4 className="text-lg font-semibold mb-3 text-purple-300">关键考虑因素</h4>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <div>
                    <strong className="text-purple-300">局部最优 vs 全局最优：</strong>
                    <span className="text-gray-300 ml-1">避免陷入局部最优解</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <div>
                    <strong className="text-purple-300">数值稳定性：</strong>
                    <span className="text-gray-300 ml-1">处理病态矩阵和数值误差</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <div>
                    <strong className="text-purple-300">计算效率：</strong>
                    <span className="text-gray-300 ml-1">平衡精度与计算时间</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkflowPage