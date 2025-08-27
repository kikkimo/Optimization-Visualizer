import React, { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useNavigate } from 'react-router-dom'

gsap.registerPlugin(ScrollTrigger)

const CasePage = () => {
  const sectionRef = useRef()
  const titleRef = useRef()
  const chainRef = useRef()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const methodChain = [
    {
      id: 'data-collection',
      name: '数据采集',
      description: '多源传感器数据获取',
      icon: '📡',
      color: 'from-blue-500 to-cyan-500',
      duration: 2000,
      methods: []
    },
    {
      id: 'bundle-adjustment',
      name: 'Bundle Adjustment',
      description: '相机参数与三维点联合优化',
      icon: '📷',
      color: 'from-green-500 to-emerald-500',
      duration: 3000,
      methods: ['bundle-adjustment']
    },
    {
      id: 'sgm-stereo',
      name: 'SGM 立体匹配',
      description: '稠密视差图生成',
      icon: '🔍',
      color: 'from-purple-500 to-pink-500',
      duration: 2500,
      methods: ['sgm-stereo']
    },
    {
      id: 'mrf-segmentation',
      name: 'MRF 图像分割',
      description: '语义分割与分类',
      icon: '🗺️',
      color: 'from-orange-500 to-red-500',
      duration: 2000,
      methods: ['mrf-segmentation']
    },
    {
      id: 'kalman-filter',
      name: '卡尔曼滤波',
      description: '轨迹优化与状态估计',
      icon: '🎯',
      color: 'from-indigo-500 to-purple-500',
      duration: 2500,
      methods: ['kalman-filter']
    },
    {
      id: 'final-model',
      name: '三维重建',
      description: '最终三维模型生成',
      icon: '🏗️',
      color: 'from-pink-500 to-rose-500',
      duration: 2000,
      methods: []
    }
  ]

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

  const startPlayback = () => {
    setIsPlaying(true)
    setCurrentStep(0)
    
    const playStep = (stepIndex) => {
      if (stepIndex >= methodChain.length) {
        setIsPlaying(false)
        return
      }
      
      setCurrentStep(stepIndex)
      
      const step = methodChain[stepIndex]
      setTimeout(() => {
        playStep(stepIndex + 1)
      }, step.duration)
    }
    
    playStep(0)
  }

  const stopPlayback = () => {
    setIsPlaying(false)
    setCurrentStep(0)
  }

  const handleMethodClick = (methodId) => {
    navigate(`/method/${methodId}`)
  }

  return (
    <div ref={sectionRef} className="section-container bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto">
        <h2 ref={titleRef} className="section-title mb-16">
          综合案例：方法链回放
        </h2>
        
        <div className="space-y-12">
          <div className="text-center max-w-4xl mx-auto space-y-4">
            <p className="text-xl text-gray-300">
              从原始数据到三维模型：完整的测绘优化流水线
            </p>
            <p className="text-gray-400">
              下方展示了一个典型的测绘项目中，多种优化方法如何协同工作，
              从数据采集到最终成果的完整过程。点击播放按钮开始演示。
            </p>
          </div>

          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={startPlayback}
              disabled={isPlaying}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                isPlaying 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isPlaying ? '演示进行中...' : '▶️ 开始演示'}
            </button>
            
            <button
              onClick={stopPlayback}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-full font-medium hover:from-red-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              ⏹️ 停止演示
            </button>
          </div>

          <div ref={chainRef} className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {methodChain.map((step, index) => {
                const isActive = currentStep === index
                const isPast = currentStep > index
                const isFuture = currentStep < index
                
                return (
                  <div
                    key={step.id}
                    className={`relative transform transition-all duration-500 ${
                      isActive ? 'scale-105 z-10' : isPast ? 'scale-95 opacity-70' : 'scale-90 opacity-50'
                    }`}
                  >
                    <div className={`bg-gradient-to-br ${step.color} p-6 rounded-xl text-white shadow-xl relative overflow-hidden`}>
                      {isActive && (
                        <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                      )}
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-3xl">{step.icon}</div>
                          <div className="text-sm bg-black bg-opacity-30 px-2 py-1 rounded">
                            步骤 {index + 1}
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-2">{step.name}</h3>
                        <p className="text-sm opacity-90 mb-4">{step.description}</p>
                        
                        {step.methods.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-xs font-semibold opacity-80">相关方法:</div>
                            {step.methods.map((methodId) => (
                              <button
                                key={methodId}
                                onClick={() => handleMethodClick(methodId)}
                                className="block w-full text-xs bg-white bg-opacity-20 hover:bg-opacity-30 rounded px-3 py-2 transition-all duration-200 text-left"
                              >
                                点击查看详细演示 →
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {isActive && (
                          <div className="mt-4 pt-3 border-t border-white border-opacity-30">
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                              <span>正在执行...</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {isPast && (
                        <div className="absolute top-2 right-2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {index < methodChain.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                        <div className={`w-8 h-0.5 transition-all duration-500 ${
                          isPast ? 'bg-green-400' : isActive ? 'bg-white animate-pulse' : 'bg-gray-600'
                        }`}></div>
                        <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-t-2 border-b-2 border-t-transparent border-b-transparent transition-all duration-500 ${
                          isPast ? 'border-l-green-400' : isActive ? 'border-l-white' : 'border-l-gray-600'
                        }`}></div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-center mb-6 text-white">方法链核心价值</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">🔗</span>
                </div>
                <h4 className="text-lg font-semibold text-blue-400">协同优化</h4>
                <p className="text-sm text-gray-300">各算法环节相互配合，整体性能优于单独使用</p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">📈</span>
                </div>
                <h4 className="text-lg font-semibold text-green-400">精度提升</h4>
                <p className="text-sm text-gray-300">逐步优化，最终达到毫米级测量精度</p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">⚡</span>
                </div>
                <h4 className="text-lg font-semibold text-purple-400">效率平衡</h4>
                <p className="text-sm text-gray-300">在保证精度的前提下，优化计算效率</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CasePage