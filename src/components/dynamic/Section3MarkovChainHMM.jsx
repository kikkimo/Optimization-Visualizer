import React from 'react'
import DownHint from '../shared/DownHint'

const Section3MarkovChainHMM = ({ id, currentSection, totalSections }) => {
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
            <span style={{ color: 'var(--violet-deep)' }}>马尔科夫链&HMM</span>
          </h2>
          
          {/* 副标题 */}
          <p className="text-xl md:text-2xl mb-12 leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
            马尔科夫过程与隐马尔科夫模型理论
          </p>

          {/* 核心概念卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* 马尔科夫性质 */}
            <div className="p-6 rounded-2xl backdrop-blur-sm border border-opacity-20" style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(14, 165, 233, 0.08) 100%)',
              borderColor: 'var(--violet-deep)'
            }}>
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>马尔科夫性质</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                未来状态只依赖于当前状态，无关历史
              </p>
            </div>

            {/* 转移矩阵 */}
            <div className="p-6 rounded-2xl backdrop-blur-sm border border-opacity-20" style={{
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
              borderColor: 'var(--pink-energy)'
            }}>
              <div className="text-3xl mb-4">🔢</div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>转移矩阵</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                描述状态之间转换概率的矩阵
              </p>
            </div>

            {/* 隐状态 */}
            <div className="p-6 rounded-2xl backdrop-blur-sm border border-opacity-20" style={{
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(60, 230, 192, 0.08) 100%)',
              borderColor: 'var(--electric-blue)'
            }}>
              <div className="text-3xl mb-4">👁️</div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>隐状态</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                不可直接观测但影响观测结果的状态
              </p>
            </div>
          </div>

          {/* 占位内容区域 */}
          <div className="mt-12 p-8 rounded-2xl border max-w-2xl mx-auto backdrop-blur-sm" style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(236, 72, 153, 0.08) 100%)',
            borderColor: 'var(--violet-deep)',
            boxShadow: '0 8px 25px -8px rgba(168, 85, 247, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}>
            <p className="text-base font-medium mb-3" style={{ color: 'var(--ink-high)' }}>
              马尔科夫链&HMM - 页面开发中...
            </p>
            <p className="text-sm" style={{ color: 'var(--violet-deep)' }}>
              这里将展示马尔科夫链的数学理论、HMM算法实现和序列建模应用
            </p>
          </div>
        </div>
      </div>

      {/* 下一页提示 */}
      {currentSection < totalSections - 1 && (
        <DownHint targetSection={3} text="向下滚动继续" isStatic={false} />
      )}
    </div>
  )
}

export default Section3MarkovChainHMM