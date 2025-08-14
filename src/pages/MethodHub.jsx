import React, { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const MethodHub = () => {
  const hubRef = useRef()
  const titleRef = useRef()
  const navigate = useNavigate()

  const methods = [
    {
      id: 'bundle-adjustment',
      name: 'Bundle Adjustment',
      title: 'BA 束平差',
      description: '多视角几何约束的参数估计',
      applications: ['航空摄影测量', '近景摄影测量', 'SLAM'],
      difficulty: 'High',
      icon: '📷',
      color: 'from-blue-500 to-cyan-500',
      modes: { storyboard: true, replay: true, compute: true },
      tags: ['非线性优化', '稀疏矩阵', 'LM算法']
    },
    {
      id: 'kalman-filter',
      name: 'Kalman Filter',
      title: '卡尔曼滤波',
      description: '状态估计与动态系统滤波',
      applications: ['GNSS/INS组合导航', '目标跟踪', '传感器融合'],
      difficulty: 'Medium',
      icon: '🎯',
      color: 'from-green-500 to-emerald-500',
      modes: { storyboard: true, replay: true, compute: true },
      tags: ['状态估计', '递归滤波', '最优估计']
    },
    {
      id: 'sgm-stereo',
      name: 'SGM Stereo',
      title: 'SGM 立体匹配',
      description: '半全局匹配的稠密视差估计',
      applications: ['数字高程模型', '三维重建', '自动驾驶'],
      difficulty: 'High',
      icon: '🔍',
      color: 'from-purple-500 to-pink-500',
      modes: { storyboard: true, replay: true, compute: false },
      tags: ['动态规划', '能量优化', '视差估计']
    },
    {
      id: 'mrf-segmentation',
      name: 'MRF Segmentation',
      title: 'MRF 图像分割',
      description: '马尔科夫随机场的图像分割',
      applications: ['土地利用分类', '建筑物提取', '变化检测'],
      difficulty: 'High',
      icon: '🗺️',
      color: 'from-orange-500 to-red-500',
      modes: { storyboard: true, replay: true, compute: false },
      tags: ['图割算法', '概率模型', '图像分析']
    },
    {
      id: 'ant-colony',
      name: 'Ant Colony',
      title: '蚁群算法',
      description: '仿生智能优化算法',
      applications: ['路径规划', '网络优化', '资源分配'],
      difficulty: 'Medium',
      icon: '🐜',
      color: 'from-yellow-500 to-orange-500',
      modes: { storyboard: true, replay: true, compute: true },
      tags: ['群体智能', '路径优化', '启发式算法']
    },
    {
      id: 'monte-carlo',
      name: 'Monte Carlo',
      title: '蒙特卡洛滤波',
      description: '粒子滤波与随机采样',
      applications: ['非线性滤波', '参数估计', '不确定性量化'],
      difficulty: 'Medium',
      icon: '🎲',
      color: 'from-indigo-500 to-purple-500',
      modes: { storyboard: true, replay: true, compute: true },
      tags: ['粒子滤波', '随机采样', '贝叶斯估计']
    },
    {
      id: 'convex-optimization',
      name: 'Convex Optimization',
      title: '凸优化',
      description: '凸函数的全局最优化',
      applications: ['信号处理', '机器学习', '资源分配'],
      difficulty: 'Medium',
      icon: '📈',
      color: 'from-teal-500 to-blue-500',
      modes: { storyboard: true, replay: true, compute: true },
      tags: ['内点法', '对偶理论', '线性规划']
    },
    {
      id: 'particle-filter',
      name: 'Particle Filter',
      title: '粒子滤波',
      description: '非线性非高斯系统状态估计',
      applications: ['目标跟踪', '机器人定位', '故障诊断'],
      difficulty: 'High',
      icon: '⚡',
      color: 'from-pink-500 to-rose-500',
      modes: { storyboard: true, replay: true, compute: true },
      tags: ['序贯蒙特卡洛', '重采样', '权重更新']
    },
    {
      id: 'other-methods',
      name: 'Other Methods',
      title: '其他经典方法',
      description: '遗传算法、模拟退火等',
      applications: ['全局优化', '组合优化', '多目标优化'],
      difficulty: 'Varies',
      icon: '🔬',
      color: 'from-gray-500 to-slate-500',
      modes: { storyboard: true, replay: false, compute: false },
      tags: ['启发式算法', '全局搜索', '进化计算']
    }
  ]

  useEffect(() => {
    const cards = hubRef.current.querySelectorAll('.method-card-item')
    
    gsap.fromTo(titleRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
    )

    ScrollTrigger.create({
      trigger: hubRef.current,
      start: "top center",
      onEnter: () => {
        gsap.fromTo(cards,
          { opacity: 0, scale: 0.8, y: 50 },
          { 
            opacity: 1, 
            scale: 1, 
            y: 0, 
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.7)"
          }
        )
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  const handleMethodClick = (methodId) => {
    navigate(`/method/${methodId}`)
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Low': return 'text-green-400'
      case 'Medium': return 'text-yellow-400'
      case 'High': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="min-h-screen section-container bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 ref={titleRef} className="section-title">
            优化方法展示中心
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            探索测绘领域中的主要优化算法，每种方法都提供三种演示模式：
            <span className="text-blue-400 font-semibold"> Storyboard（原理动画）</span>、
            <span className="text-green-400 font-semibold"> Replay（预计算回放）</span>、
            <span className="text-purple-400 font-semibold"> Compute（实时计算）</span>
          </p>
        </div>

        <div ref={hubRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {methods.map((method) => (
            <div
              key={method.id}
              className="method-card-item method-card cursor-pointer transform transition-all duration-300 hover:scale-105"
              onClick={() => handleMethodClick(method.id)}
            >
              <div className={`h-2 bg-gradient-to-r ${method.color} rounded-t-xl`}></div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${method.color} rounded-lg flex items-center justify-center text-2xl`}>
                      {method.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{method.title}</h3>
                      <p className="text-sm text-gray-400">{method.name}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getDifficultyColor(method.difficulty)}`}>
                      {method.difficulty}
                    </div>
                  </div>
                </div>

                <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                  {method.description}
                </p>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-blue-400 mb-2">应用领域</h4>
                    <div className="flex flex-wrap gap-1">
                      {method.applications.map((app, idx) => (
                        <span key={idx} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-purple-400 mb-2">技术标签</h4>
                    <div className="flex flex-wrap gap-1">
                      {method.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-700">
                    <h4 className="text-sm font-semibold text-green-400 mb-2">可用演示模式</h4>
                    <div className="flex space-x-2">
                      {method.modes.storyboard && (
                        <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                          📖 Story
                        </span>
                      )}
                      {method.modes.replay && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                          ▶️ Replay
                        </span>
                      )}
                      {method.modes.compute && (
                        <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                          ⚡ Compute
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>点击进入详细演示</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-gray-800 to-gray-700 px-8 py-4 rounded-xl">
            <div className="text-gray-300">
              <p className="text-sm">
                💡 <strong>提示:</strong> 每个方法卡片都包含完整的理论介绍、实际应用案例和交互式演示
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MethodHub