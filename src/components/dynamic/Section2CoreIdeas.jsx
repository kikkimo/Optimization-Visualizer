import React from 'react'
import DownHint from '../shared/DownHint'

const Section2CoreIdeas = ({ id, currentSection, totalSections }) => {
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
            <span style={{ color: 'var(--electric-blue)' }}>核心思想</span>
          </h2>
          
          {/* 副标题 */}
          <p className="text-xl md:text-2xl mb-12 leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
            动态优化与概率推理的核心理念
          </p>

          {/* 核心概念卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* 递归思维 */}
            <div className="p-6 rounded-2xl backdrop-blur-sm border border-opacity-20" style={{
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(60, 230, 192, 0.08) 100%)',
              borderColor: 'var(--electric-blue)'
            }}>
              <div className="text-3xl mb-4">🔄</div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>递归思维</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                将复杂问题分解为相似的子问题
              </p>
            </div>

            {/* 状态空间 */}
            <div className="p-6 rounded-2xl backdrop-blur-sm border border-opacity-20" style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(14, 165, 233, 0.08) 100%)',
              borderColor: 'var(--violet-deep)'
            }}>
              <div className="text-3xl mb-4">🗺️</div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>状态空间</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                系统所有可能状态的集合表示
              </p>
            </div>

            {/* 概率推理 */}
            <div className="p-6 rounded-2xl backdrop-blur-sm border border-opacity-20" style={{
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
              borderColor: 'var(--pink-energy)'
            }}>
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>概率推理</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                基于不确定性信息的推断决策
              </p>
            </div>
          </div>

          {/* 占位内容区域 */}
          <div className="mt-12 p-8 rounded-2xl border max-w-2xl mx-auto backdrop-blur-sm" style={{
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)',
            borderColor: 'var(--electric-blue)',
            boxShadow: '0 8px 25px -8px rgba(14, 165, 233, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}>
            <p className="text-base font-medium mb-3" style={{ color: 'var(--ink-high)' }}>
              核心思想 - 页面开发中...
            </p>
            <p className="text-sm" style={{ color: 'var(--electric-blue)' }}>
              这里将展示动态优化的核心理念、设计哲学和问题求解的一般性方法
            </p>
          </div>
        </div>
      </div>

      {/* 下一页提示 */}
      {currentSection < totalSections - 1 && (
        <DownHint targetSection={2} text="向下滚动继续" isStatic={false} />
      )}
    </div>
  )
}

export default Section2CoreIdeas