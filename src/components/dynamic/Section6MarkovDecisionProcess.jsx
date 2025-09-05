import React from 'react'
import DownHint from '../shared/DownHint'

const Section6MarkovDecisionProcess = ({ id, currentSection, totalSections }) => {
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
            <span style={{ color: 'var(--tech-mint)' }}>马尔科夫决策过程</span>
          </h2>
          
          {/* 副标题 */}
          <p className="text-xl md:text-2xl mb-12 leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
            序贯决策优化与强化学习基础
          </p>

          {/* 核心概念卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* 策略函数 */}
            <div className="p-6 rounded-2xl backdrop-blur-sm border border-opacity-20" style={{
              background: 'linear-gradient(135deg, rgba(60, 230, 192, 0.08) 0%, rgba(14, 165, 233, 0.08) 100%)',
              borderColor: 'var(--tech-mint)'
            }}>
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>策略函数</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                状态到行动的映射决策规则
              </p>
            </div>

            {/* 奖励函数 */}
            <div className="p-6 rounded-2xl backdrop-blur-sm border border-opacity-20" style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(60, 230, 192, 0.08) 100%)',
              borderColor: 'var(--amber-signal)'
            }}>
              <div className="text-3xl mb-4">🏆</div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>奖励函数</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                量化行动质量的即时反馈机制
              </p>
            </div>

            {/* 值函数 */}
            <div className="p-6 rounded-2xl backdrop-blur-sm border border-opacity-20" style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
              borderColor: 'var(--violet-deep)'
            }}>
              <div className="text-3xl mb-4">💎</div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>值函数</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                长期累积奖励的期望价值评估
              </p>
            </div>
          </div>

          {/* 占位内容区域 */}
          <div className="mt-12 p-8 rounded-2xl border max-w-2xl mx-auto backdrop-blur-sm" style={{
            background: 'linear-gradient(135deg, rgba(60, 230, 192, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)',
            borderColor: 'var(--tech-mint)',
            boxShadow: '0 8px 25px -8px rgba(60, 230, 192, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}>
            <p className="text-base font-medium mb-3" style={{ color: 'var(--ink-high)' }}>
              马尔科夫决策过程 - 页面开发中...
            </p>
            <p className="text-sm" style={{ color: 'var(--tech-mint)' }}>
              这里将展示MDP的数学框架、动态规划算法和强化学习应用
            </p>
          </div>
        </div>
      </div>

      {/* 页面指示器 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-2">
          <span className="text-sm" style={{ color: 'var(--ink-mid)' }}>
            {currentSection + 1} / {totalSections}
          </span>
        </div>
      </div>

      {/* 下一页提示 */}
      {currentSection < totalSections - 1 && (
        <DownHint targetSection={currentSection + 1} text="向下滚动继续" isStatic={false} />
      )}
    </div>
  )
}

export default Section6MarkovDecisionProcess