import React from 'react'
import DownHint from '../shared/DownHint'

const Section4MarkovRandomField = ({ id, currentSection, totalSections }) => {
  return (
    <div 
      id={id}
      className="snap-section flex flex-col relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, var(--bg-deep) 0%, var(--bg-moderate) 100%)',
        color: 'var(--ink-high)'
      }}
    >
      {/* 主要内容区域 */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* 标题 */}
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">
            <span style={{ color: 'var(--pink-energy)' }}>马尔科夫随机场</span>
          </h2>
          
          {/* 副标题 */}
          <p className="text-xl md:text-2xl mb-12 leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
            无向概率图模型与局部相关性
          </p>

          {/* 核心概念卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* 团和势函数 */}
            <div className="p-6 rounded-2xl backdrop-blur-sm border border-opacity-20" style={{
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
              borderColor: 'var(--pink-energy)'
            }}>
              <div className="text-3xl mb-4">🔗</div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>团和势函数</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                局部相关性的数学表达与能量函数
              </p>
            </div>

            {/* 无向图模型 */}
            <div className="p-6 rounded-2xl backdrop-blur-sm border border-opacity-20" style={{
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%)',
              borderColor: 'var(--electric-blue)'
            }}>
              <div className="text-3xl mb-4">🕸️</div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>无向图模型</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                节点间对称相关性的图结构表示
              </p>
            </div>

            {/* 吉布斯分布 */}
            <div className="p-6 rounded-2xl backdrop-blur-sm border border-opacity-20" style={{
              background: 'linear-gradient(135deg, rgba(60, 230, 192, 0.08) 0%, rgba(14, 165, 233, 0.08) 100%)',
              borderColor: 'var(--tech-mint)'
            }}>
              <div className="text-3xl mb-4">⚖️</div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>吉布斯分布</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                基于能量函数的概率分布表示
              </p>
            </div>
          </div>

          {/* 占位内容区域 */}
          <div className="mt-12 p-8 rounded-2xl border max-w-2xl mx-auto backdrop-blur-sm" style={{
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.12) 0%, rgba(60, 230, 192, 0.08) 100%)',
            borderColor: 'var(--pink-energy)',
            boxShadow: '0 8px 25px -8px rgba(236, 72, 153, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}>
            <p className="text-base font-medium mb-3" style={{ color: 'var(--ink-high)' }}>
              马尔科夫随机场 - 页面开发中...
            </p>
            <p className="text-sm" style={{ color: 'var(--pink-energy)' }}>
              这里将展示MRF的理论基础、推理算法和图像处理等实际应用
            </p>
          </div>
        </div>
      </div>

      {/* 下一页提示 */}
      {currentSection < totalSections - 1 && (
        <DownHint targetSection={4} text="向下滚动继续" isStatic={false} />
      )}
    </div>
  )
}

export default Section4MarkovRandomField