import React, { useState } from 'react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

const Section3LinearSolveStep1 = () => {
  const [activeMethod, setActiveMethod] = useState('direct')

  const renderDirectMethods = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold" style={{ color: 'var(--ink-high)' }}>
        主要方法
      </h4>
        
      {/* LU分解 */}
      <div className="p-4 rounded-lg border" style={{ 
        backgroundColor: 'rgba(59, 130, 246, 0.125)', 
        borderColor: 'rgba(59, 130, 246, 0.25)' 
      }}>
        <h5 className="font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
          1. 高斯消元法 / LU分解
        </h5>
        <div className="text-center mb-3">
          <BlockMath math="A = LU" />
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
          将矩阵分解为下三角矩阵 L 和上三角矩阵 U，转化为两次三角系统求解：
        </p>
        <div className="text-center mt-2">
          <InlineMath math="L\vec{y} = \vec{b} \Rightarrow U\vec{x} = \vec{y}" />
        </div>
      </div>

      {/* Cholesky分解 */}
      <div className="p-4 rounded-lg border" style={{ 
        backgroundColor: 'rgba(59, 130, 246, 0.125)', 
        borderColor: 'rgba(59, 130, 246, 0.25)' 
      }}>
        <h5 className="font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
          2. Cholesky分解
        </h5>
        <div className="text-center mb-3">
          <BlockMath math="A = LL^{T}" />
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
          适用于<strong>对称正定</strong>矩阵，计算速度比 LU 分解快约一倍，数值稳定性更好
        </p>
      </div>
    </div>
  )

  const renderIterativeMethods = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold" style={{ color: 'var(--ink-high)' }}>
        主要方法
      </h4>
        
      {/* 梯度下降法 */}
      <div className="p-4 rounded-lg border" style={{ 
        backgroundColor: 'rgba(34, 197, 94, 0.125)', 
        borderColor: 'rgba(34, 197, 94, 0.25)' 
      }}>
        <h5 className="font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
          1. 梯度下降法 (最速下降法)
        </h5>
        <p className="text-sm mb-3" style={{ color: 'var(--ink-mid)' }}>
          通过问题转化，将 <InlineMath math="A\vec{x} = \vec{b}" /> 转化为优化问题：
        </p>
        <div className="text-center mb-3">
          <BlockMath math="\min_{\vec{x}} \phi(\vec{x}) = \frac{1}{2}\vec{x}^T A \vec{x} - \vec{b}^T \vec{x}" />
        </div>
        <p className="text-sm mb-2" style={{ color: 'var(--ink-mid)' }}>
          迭代公式：
        </p>
        <div className="text-center">
          <BlockMath math="\vec{x}_{k+1} = \vec{x}_k - \alpha_k (A \vec{x}_k - \vec{b})" />
        </div>
      </div>

      {/* 共轭梯度法 */}
      <div className="p-4 rounded-lg border" style={{ 
        backgroundColor: 'rgba(34, 197, 94, 0.125)', 
        borderColor: 'rgba(34, 197, 94, 0.25)' 
      }}>
        <h5 className="font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
          2. 共轭梯度法 (CG)
        </h5>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
          对梯度下降法的<strong>根本性改进</strong>，通过构造 A-共轭的搜索方向，避免"走回头路"，极大抑制震荡，快速收敛
        </p>
        <div className="mt-3 p-3 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
          <p className="text-xs" style={{ color: 'var(--ink-mid)' }}>
            <strong>现代大规模稀疏线性系统求解的绝对主力</strong>
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-full w-full flex flex-col gap-4 relative p-4">
      {/* 标题区域 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--ink-high)' }}>
          方阵系统求解 (m = n)
        </h2>
        <p className="text-lg" style={{ color: 'var(--ink-mid)' }}>
          当矩阵 A 是非奇异的，存在唯一解 <InlineMath math="\vec{x} = A^{-1} \vec{b}" />
        </p>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 flex gap-6">
        {/* 左侧控制区域 */}
        <div className="flex flex-col" style={{ width: '120px' }}>
          {/* 按钮区域 */}
          <div className="flex flex-col gap-2 mb-4">
            <button
              onClick={() => setActiveMethod('direct')}
              className={`relative px-3 py-3 rounded-xl text-center transition-all duration-300 overflow-hidden ${
                activeMethod === 'direct' ? 'shadow-lg' : 'hover:shadow-md'
              }`}
              style={{
                background: activeMethod === 'direct' 
                  ? 'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(99, 102, 241) 100%)'
                  : 'var(--bg-surface)',
                border: `1px solid ${activeMethod === 'direct' ? 'transparent' : 'var(--carbon-line)'}`,
                color: activeMethod === 'direct' ? 'white' : 'var(--ink-high)',
              }}
            >
              <span className="text-base font-bold relative z-10">直接法</span>
              {activeMethod === 'direct' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer" />
              )}
            </button>

            <button
              onClick={() => setActiveMethod('iterative')}
              className={`relative px-3 py-3 rounded-xl text-center transition-all duration-300 overflow-hidden ${
                activeMethod === 'iterative' ? 'shadow-lg' : 'hover:shadow-md'
              }`}
              style={{
                background: activeMethod === 'iterative' 
                  ? 'linear-gradient(135deg, rgb(34, 197, 94) 0%, rgb(16, 185, 129) 100%)'
                  : 'var(--bg-surface)',
                border: `1px solid ${activeMethod === 'iterative' ? 'transparent' : 'var(--carbon-line)'}`,
                color: activeMethod === 'iterative' ? 'white' : 'var(--ink-high)',
              }}
            >
              <span className="text-base font-bold relative z-10">迭代法</span>
              {activeMethod === 'iterative' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer" />
              )}
            </button>
          </div>

          {/* 核心思想区域 */}
          <div className="p-4 rounded-xl border transition-all duration-300"
               style={{
                 backgroundColor: activeMethod === 'direct' 
                   ? 'rgba(59, 130, 246, 0.125)' 
                   : 'rgba(34, 197, 94, 0.125)',
                 borderColor: activeMethod === 'direct' 
                   ? 'rgba(59, 130, 246, 0.2)' 
                   : 'rgba(34, 197, 94, 0.2)',
               }}>
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
              核心思想
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
              {activeMethod === 'direct' 
                ? '通过有限步的精确代数运算得到解，对矩阵 A 进行因式分解'
                : <>从初始猜测 <InlineMath math="\vec{x}_0" /> 开始，通过简单迭代公式逐步逼近真解，核心只涉及矩阵-向量乘法</>
              }
            </p>
          </div>
        </div>

        {/* 右侧内容区域 */}
        <div className="flex-1 rounded-2xl border backdrop-blur-sm p-6 overflow-y-auto"
             style={{
               backgroundColor: activeMethod === 'direct' 
                 ? 'rgba(59, 130, 246, 0.03)'
                 : 'rgba(34, 197, 94, 0.03)',
               borderColor: activeMethod === 'direct' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(34, 197, 94, 0.2)',
               boxShadow: activeMethod === 'direct' 
                 ? '0 8px 32px -8px rgba(59, 130, 246, 0.15)' 
                 : '0 8px 32px -8px rgba(34, 197, 94, 0.15)'
             }}>

          {/* 动态内容 */}
          {activeMethod === 'direct' ? renderDirectMethods() : renderIterativeMethods()}
        </div>
      </div>

      {/* 动画样式 */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default Section3LinearSolveStep1