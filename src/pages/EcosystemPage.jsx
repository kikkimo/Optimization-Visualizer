import React, { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useNavigate } from 'react-router-dom'

gsap.registerPlugin(ScrollTrigger)

const FlowChart = () => {
  const navigate = useNavigate()
  const flowRef = useRef()
  
  const flowSteps = [
    {
      id: 'data-collection',
      title: '数据采集',
      description: '多源传感器数据获取',
      icon: '📡',
      color: 'from-blue-500 to-cyan-500',
      methods: ['GNSS', 'IMU', '激光雷达', '影像']
    },
    {
      id: 'data-fusion',
      title: '数据融合',
      description: '多源数据协同处理',
      icon: '🔗',
      color: 'from-green-500 to-emerald-500',
      methods: ['卡尔曼滤波', '粒子滤波']
    },
    {
      id: 'feature-extraction',
      title: '特征提取',
      description: '关键信息识别与提取',
      icon: '🎯',
      color: 'from-yellow-500 to-orange-500',
      methods: ['SGM匹配', 'MRF分割']
    },
    {
      id: 'optimization',
      title: '参数优化',
      description: '精度提升与误差控制',
      icon: '⚡',
      color: 'from-purple-500 to-pink-500',
      methods: ['BA束平差', '凸优化']
    },
    {
      id: 'modeling',
      title: '建模重建',
      description: '三维模型与地图生成',
      icon: '🏗️',
      color: 'from-indigo-500 to-blue-500',
      methods: ['蚁群算法', '蒙特卡洛']
    }
  ]

  useEffect(() => {
    const cards = flowRef.current.querySelectorAll('.flow-card')
    
    ScrollTrigger.create({
      trigger: flowRef.current,
      start: "top center",
      end: "bottom center",
      onEnter: () => {
        gsap.fromTo(cards,
          { opacity: 0, scale: 0.8, y: 50 },
          { 
            opacity: 1, 
            scale: 1, 
            y: 0, 
            duration: 0.8,
            stagger: 0.2,
            ease: "back.out(1.7)"
          }
        )
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  const handleMethodClick = (methodName) => {
    const methodId = methodName.toLowerCase().replace(/[^a-z]/g, '')
    navigate(`/method/${methodId}`)
  }

  return (
    <div ref={flowRef} className="space-y-8">
      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
        {flowSteps.map((step, index) => (
          <div key={step.id} className="flow-card relative">
            <div className={`bg-gradient-to-br ${step.color} p-6 rounded-xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105`}>
              <div className="text-center space-y-4">
                <div className="text-4xl">{step.icon}</div>
                <h3 className="text-lg font-bold">{step.title}</h3>
                <p className="text-sm opacity-90">{step.description}</p>
                
                <div className="space-y-2">
                  <div className="text-xs font-semibold opacity-80">相关方法:</div>
                  <div className="space-y-1">
                    {step.methods.map((method, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleMethodClick(method)}
                        className="block w-full text-xs bg-white bg-opacity-20 hover:bg-opacity-30 rounded px-2 py-1 transition-all duration-200"
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {index < flowSteps.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                <div className="w-6 h-0.5 bg-gradient-to-r from-gray-400 to-gray-600"></div>
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-600 border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <div className="inline-flex items-center space-x-4 bg-gray-800 px-6 py-3 rounded-full">
          <span className="text-gray-400">点击方法标签跳转到详细演示</span>
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </div>
  )
}

const EcosystemPage = () => {
  const sectionRef = useRef()
  const titleRef = useRef()

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

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <div ref={sectionRef} className="section-container bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto">
        <h2 ref={titleRef} className="section-title mb-16">
          测绘中的优化生态
        </h2>
        
        <div className="space-y-12">
          <div className="text-center max-w-4xl mx-auto space-y-4">
            <p className="text-xl text-gray-300">
              测绘工程是一个典型的多阶段、多约束优化问题
            </p>
            <p className="text-gray-400 leading-relaxed">
              从原始数据采集到最终三维模型生成，每个环节都涉及复杂的数学优化算法。
              下图展示了测绘领域中优化方法的应用流程和相互关系。
            </p>
          </div>

          <FlowChart />

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-6 rounded-xl border border-blue-500/30">
              <h3 className="text-xl font-bold mb-4 text-blue-300">精度驱动</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• 毫米级定位精度要求</li>
                <li>• 严格的质量控制标准</li>
                <li>• 多源数据一致性约束</li>
                <li>• 实时性与精度的平衡</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-6 rounded-xl border border-green-500/30">
              <h3 className="text-xl font-bold mb-4 text-green-300">多源融合</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• GNSS/INS组合导航</li>
                <li>• 激光雷达与影像融合</li>
                <li>• 多时相数据配准</li>
                <li>• 异构传感器标定</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-6 rounded-xl border border-purple-500/30">
              <h3 className="text-xl font-bold mb-4 text-purple-300">大规模计算</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• 海量点云数据处理</li>
                <li>• 稀疏矩阵快速求解</li>
                <li>• 并行算法设计</li>
                <li>• 内存与计算效率优化</li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="inline-block bg-gradient-to-r from-gray-700 to-gray-800 px-8 py-4 rounded-xl">
              <p className="text-gray-300 mb-2">
                <strong className="text-blue-400">测绘优化的特点</strong>
              </p>
              <p className="text-sm text-gray-400">
                高精度要求 × 多约束条件 × 大规模数据 × 实时处理
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EcosystemPage