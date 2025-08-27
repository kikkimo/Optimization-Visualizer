import React, { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useNavigate } from 'react-router-dom'

gsap.registerPlugin(ScrollTrigger)

const FuturePage = () => {
  const sectionRef = useRef()
  const titleRef = useRef()
  const trendsRef = useRef()
  const navigate = useNavigate()
  const [activeQA, setActiveQA] = useState(null)

  const trends = [
    {
      title: 'GPU并行计算',
      description: '利用GPU加速大规模矩阵运算',
      icon: '🚀',
      color: 'from-blue-500 to-cyan-500',
      keywords: ['CUDA', 'OpenCL', 'GPU加速', '并行算法']
    },
    {
      title: '深度学习融合',
      description: '神经网络与传统优化算法结合',
      icon: '🧠',
      color: 'from-green-500 to-emerald-500',
      keywords: ['深度学习', '端到端优化', '可微分编程', 'AutoML']
    },
    {
      title: '云端协同计算',
      description: '分布式优化与云计算平台',
      icon: '☁️',
      color: 'from-purple-500 to-pink-500',
      keywords: ['云计算', '分布式优化', '边缘计算', '实时处理']
    },
    {
      title: '量子优化算法',
      description: '量子计算在组合优化中的应用',
      icon: '⚛️',
      color: 'from-orange-500 to-red-500',
      keywords: ['量子计算', '量子退火', '组合优化', '未来技术']
    }
  ]

  const qaList = [
    {
      question: '优化算法在测绘中的最大挑战是什么？',
      answer: '主要挑战包括：大规模数据处理的计算复杂度、多约束条件下的全局最优解搜索、实时性要求与精度的平衡、以及不同传感器数据的一致性融合。'
    },
    {
      question: '如何选择合适的优化方法？',
      answer: '选择标准主要考虑：问题规模和维度、约束类型和复杂度、精度要求、计算资源限制、以及实时性需求。线性问题优选线性规划，非线性问题考虑梯度方法或启发式算法。'
    },
    {
      question: '优化算法的收敛性如何保证？',
      answer: '收敛性保证措施包括：合理的初值选择、自适应步长调整、多起点搜索策略、收敛判据设定、以及算法参数的经验调优。对于非凸问题，可采用全局优化方法。'
    },
    {
      question: '测绘优化与传统数值优化有何区别？',
      answer: '测绘优化的特点：数据量大且稀疏、几何约束强、精度要求极高、多源异构数据、实际物理意义约束。因此更注重稀疏矩阵处理、鲁棒性设计和实际可行性。'
    }
  ]

  const keyPoints = [
    {
      title: '算法创新',
      points: ['自适应参数调整', '混合优化策略', '多目标优化平衡', '鲁棒性增强']
    },
    {
      title: '技术融合',
      points: ['AI与优化结合', '多传感器协同', '边缘-云协同', '软硬件一体化']
    },
    {
      title: '应用拓展',
      points: ['智慧城市建设', '自动驾驶导航', '虚拟现实重建', '数字孪生系统']
    },
    {
      title: '性能提升',
      points: ['实时性优化', '精度持续提升', '计算效率改进', '能耗优化设计']
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

    const trendCards = trendsRef.current.querySelectorAll('.trend-card')
    ScrollTrigger.create({
      trigger: trendsRef.current,
      start: "top center",
      onEnter: () => {
        gsap.fromTo(trendCards,
          { opacity: 0, scale: 0.8, y: 50 },
          { 
            opacity: 1, 
            scale: 1, 
            y: 0, 
            duration: 0.6,
            stagger: 0.15,
            ease: "back.out(1.7)"
          }
        )
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  const toggleQA = (index) => {
    setActiveQA(activeQA === index ? null : index)
  }

  return (
    <div ref={sectionRef} className="section-container bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto">
        <h2 ref={titleRef} className="section-title mb-16">
          发展趋势与未来展望
        </h2>
        
        <div className="space-y-16">
          <div className="text-center max-w-4xl mx-auto space-y-4">
            <p className="text-xl text-gray-300">
              优化算法与新兴技术的深度融合
            </p>
            <p className="text-gray-400">
              随着计算能力的提升和新技术的涌现，测绘领域的优化算法正朝着更加智能化、
              高效化和实用化的方向发展。
            </p>
          </div>

          <div ref={trendsRef} className="grid md:grid-cols-2 gap-8">
            {trends.map((trend, index) => (
              <div key={index} className="trend-card bg-gray-800 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${trend.color} rounded-full mb-4`}>
                  <span className="text-2xl">{trend.icon}</span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3">{trend.title}</h3>
                <p className="text-gray-300 mb-4">{trend.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {trend.keywords.map((keyword, idx) => (
                    <span key={idx} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-center mb-8 text-white">核心要点回顾</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {keyPoints.map((category, index) => (
                <div key={index} className="text-center space-y-3">
                  <h4 className="text-lg font-semibold text-blue-400">{category.title}</h4>
                  <ul className="space-y-2">
                    {category.points.map((point, idx) => (
                      <li key={idx} className="text-sm text-gray-300 flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-center text-white">常见问题解答</h3>
            <div className="space-y-4">
              {qaList.map((qa, index) => (
                <div key={index} className="bg-gray-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleQA(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-700 transition-colors duration-200"
                  >
                    <span className="text-lg font-medium text-white">{qa.question}</span>
                    <svg 
                      className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
                        activeQA === index ? 'rotate-180' : ''
                      }`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {activeQA === index && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-300 leading-relaxed">{qa.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center space-y-6">
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-8 border border-blue-500/30">
              <h3 className="text-2xl font-bold text-blue-300 mb-4">感谢观看</h3>
              <p className="text-gray-300 mb-6">
                希望通过本演示，您对数学优化问题在测绘领域的应用有了更深入的理解。
                优化算法作为测绘工程的核心技术，将继续推动行业的创新发展。
              </p>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => navigate('/methods')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  🔍 探索更多方法
                </button>
                
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-full font-medium hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  🏠 返回首页
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FuturePage