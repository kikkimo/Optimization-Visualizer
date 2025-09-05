import React from 'react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

const Section3LinearSolveStep4 = () => {
  return (
    <div className="h-full w-full flex flex-col gap-4 relative p-4">
      {/* 标题区域 */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--ink-high)' }}>
          欠定系统求解 (m &lt; n)
        </h2>
        <p className="text-lg" style={{ color: 'var(--ink-mid)' }}>
          观测方程少于未知参数，从无穷多解中寻找最优解
        </p>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-6 pr-2">
          
          {/* 问题背景 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(236, 72, 153, 0.08)',
            borderColor: 'rgba(236, 72, 153, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              1. 问题背景与特点
            </h3>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              观测方程的数量<strong>少于</strong>未知参数的数量。系统存在<strong>无穷多组解</strong>。这在现代数据科学和信号处理中是一个非常重要的场景。
            </p>
            
            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                典型特征
              </p>
              <ul className="text-sm space-y-1" style={{ color: 'var(--ink-mid)' }}>
                <li>• 系统矩阵 A 的维度：<InlineMath math="m \times n" />，其中 <InlineMath math="m < n" /></li>
                <li>• 方程组存在无穷多组解</li>
                <li>• 解空间维度为 <InlineMath math="n - \text{rank}(A)" /></li>
                <li>• 需要额外的约束来选择唯一解</li>
              </ul>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)' }}>
                <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                  典型应用场景
                </h4>
                <ul className="text-xs space-y-1" style={{ color: 'var(--ink-mid)' }}>
                  <li>• 压缩感知 (Compressed Sensing)</li>
                  <li>• 图像去噪与重建</li>
                  <li>• 稀疏信号恢复</li>
                  <li>• 机器学习中的正则化</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)' }}>
                <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                  解的结构
                </h4>
                <p className="text-xs" style={{ color: 'var(--ink-mid)' }}>
                  一般解为：<InlineMath math="\vec{x} = \vec{x}_p + \vec{x}_h" />，其中 <InlineMath math="\vec{x}_p" /> 是特解，<InlineMath math="\vec{x}_h" /> 是齐次方程 <InlineMath math="A\vec{x}_h = 0" /> 的解
                </p>
              </div>
            </div>
          </div>

          {/* 求解目标 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(168, 85, 247, 0.08)',
            borderColor: 'rgba(168, 85, 247, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              2. 求解目标：选择最优解
            </h3>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              从无穷多解中，选出一个具有特定优良性质的解。最常见的准则是寻找所有解中，自身长度（L2范数）<strong>最小</strong>的那个，即<strong>最小范数解 (Minimum Norm Solution)</strong>。
            </p>
            
            <div className="text-center my-6">
              <BlockMath math="\min_{\vec{x}} \|\vec{x}\|_2^2 \quad \text{subject to} \quad A\vec{x} = \vec{b}" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div className="p-5 rounded-lg border" style={{ 
                backgroundColor: 'rgba(34, 197, 94, 0.125)', 
                borderColor: 'rgba(34, 197, 94, 0.25)' 
              }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  L2 范数最小化
                </h4>
                
                <div className="text-center my-4">
                  <BlockMath math="\|\vec{x}\|_2^2 = \sum_{i=1}^n x_i^2" />
                </div>
                
                <div className="p-3 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                  <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                    特点
                  </p>
                  <ul className="text-xs space-y-1" style={{ color: 'var(--ink-mid)' }}>
                    <li>• 解析解存在且唯一</li>
                    <li>• 数学处理简便</li>
                    <li>• 几何意义清晰</li>
                    <li>• 传统方法的首选</li>
                  </ul>
                </div>
              </div>

              <div className="p-5 rounded-lg border" style={{ 
                backgroundColor: 'rgba(59, 130, 246, 0.125)', 
                borderColor: 'rgba(59, 130, 246, 0.25)' 
              }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  L1 范数最小化
                </h4>
                
                <div className="text-center my-4">
                  <BlockMath math="\|\vec{x}\|_1 = \sum_{i=1}^n |x_i|" />
                </div>
                
                <div className="p-3 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                  <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                    特点
                  </p>
                  <ul className="text-xs space-y-1" style={{ color: 'var(--ink-mid)' }}>
                    <li>• 促进解的<strong>稀疏性</strong></li>
                    <li>• 压缩感知的核心</li>
                    <li>• 需要优化算法求解</li>
                    <li>• 现代应用的热点</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 最小范数解的推导 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(34, 197, 94, 0.08)',
            borderColor: 'rgba(34, 197, 94, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              3. 最小范数解的数学推导
            </h3>
            
            <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
              拉格朗日乘数法
            </h4>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              建立拉格朗日函数求解约束优化问题：
            </p>
            
            <div className="text-center my-6">
              <BlockMath math="L(\vec{x}, \vec{\lambda}) = \frac{1}{2}\vec{x}^T\vec{x} + \vec{\lambda}^T(A\vec{x} - \vec{b})" />
            </div>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              求偏导并令其为零：
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-center my-4">
                  <BlockMath math="\frac{\partial L}{\partial \vec{x}} = \vec{x} + A^T\vec{\lambda} = 0" />
                </div>
                <div className="text-center my-4">
                  <BlockMath math="\frac{\partial L}{\partial \vec{\lambda}} = A\vec{x} - \vec{b} = 0" />
                </div>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                  解得
                </p>
                <p className="text-xs mb-2" style={{ color: 'var(--ink-mid)' }}>
                  由第一个方程：<InlineMath math="\vec{x} = -A^T\vec{\lambda}" />
                </p>
                <p className="text-xs" style={{ color: 'var(--ink-mid)' }}>
                  代入第二个方程：<InlineMath math="A(-A^T\vec{\lambda}) = \vec{b}" />
                </p>
              </div>
            </div>
            
            <h4 className="text-lg font-semibold mb-3 mt-6" style={{ color: 'var(--ink-high)' }}>
              最终结果
            </h4>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              求解 <InlineMath math="\vec{\lambda}" /> 后，得到最小范数解：
            </p>
            
            <div className="text-center my-6">
              <BlockMath math="\vec{x}^* = A^T(AA^T)^{-1}\vec{b} = A^+\vec{b}" />
            </div>
            
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                Moore-Penrose 伪逆
              </p>
              <p className="text-sm" style={{ color: 'var(--ink-mid)' }}>
                这里的 <InlineMath math="A^+ = A^T(AA^T)^{-1}" /> 就是矩阵 A 的 Moore-Penrose 伪逆，它给出了欠定系统的最小范数解。
              </p>
            </div>
          </div>

          {/* 求解方法 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(251, 146, 60, 0.08)',
            borderColor: 'rgba(251, 146, 60, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              4. 实际求解方法
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SVD方法 */}
              <div className="p-5 rounded-lg border" style={{ 
                backgroundColor: 'rgba(147, 51, 234, 0.125)', 
                borderColor: 'rgba(147, 51, 234, 0.25)' 
              }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  方法 1: 奇异值分解 (SVD)
                </h4>
                
                <div className="text-center my-4">
                  <BlockMath math="A = U\Sigma V^T" />
                </div>
                
                <div className="space-y-3">
                  <div className="p-3 rounded" style={{ backgroundColor: 'rgba(147, 51, 234, 0.1)' }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--ink-high)' }}>
                      优点
                    </p>
                    <ul className="text-xs space-y-1" style={{ color: 'var(--ink-mid)' }}>
                      <li>• <strong>数值最稳定</strong>的方法</li>
                      <li>• 适用于任何矩阵</li>
                      <li>• 自动处理奇异情况</li>
                      <li>• 提供完整的数学洞察</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded" style={{ backgroundColor: 'rgba(251, 146, 60, 0.1)' }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--ink-high)' }}>
                      伪逆计算
                    </p>
                    <div className="text-center text-xs mt-2">
                      <InlineMath math="A^+ = V\Sigma^+U^T" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 直接计算方法 */}
              <div className="p-5 rounded-lg border" style={{ 
                backgroundColor: 'rgba(59, 130, 246, 0.125)', 
                borderColor: 'rgba(59, 130, 246, 0.25)' 
              }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  方法 2: 直接计算伪逆
                </h4>
                
                <div className="text-center my-4">
                  <BlockMath math="A^+ = A^T(AA^T)^{-1}" />
                </div>
                
                <div className="space-y-3">
                  <div className="p-3 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--ink-high)' }}>
                      优点
                    </p>
                    <ul className="text-xs space-y-1" style={{ color: 'var(--ink-mid)' }}>
                      <li>• 计算相对简单</li>
                      <li>• 直观易理解</li>
                      <li>• 适用于行满秩情况</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--ink-high)' }}>
                      注意事项
                    </p>
                    <ul className="text-xs space-y-1" style={{ color: 'var(--ink-mid)' }}>
                      <li>• 需要 <InlineMath math="AA^T" /> 可逆</li>
                      <li>• 数值稳定性不如SVD</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 现代应用 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(168, 85, 247, 0.08)',
            borderColor: 'rgba(168, 85, 247, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              5. 现代应用：压缩感知与稀疏重建
            </h3>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              在引入稀疏性先验的压缩感知等现代问题中，通常求解 <InlineMath math="L_1" /> 范数最小化问题，以获得稀疏解：
            </p>
            
            <div className="text-center my-6">
              <BlockMath math="\min_{\vec{x}} \|\vec{x}\|_1 \quad \text{subject to} \quad A\vec{x} = \vec{b}" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}>
                <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                  压缩感知
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                  从少量测量中恢复稀疏信号，广泛应用于MRI成像、雷达等领域
                </p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}>
                <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                  图像处理
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                  图像去噪、超分辨率重建、图像修复等任务中的核心技术
                </p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}>
                <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                  机器学习
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                  特征选择、正则化、稀疏编码等机器学习任务的基础
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                求解算法
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                <InlineMath math="L_1" /> 最小化是凸优化问题，可使用<strong>内点法、ADMM、软阈值迭代</strong>等现代优化算法求解。这些方法在大规模问题中表现出色。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 自定义滚动条样式 */}
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(75, 85, 99, 0.5) transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.1);
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.6) 0%, rgba(59, 130, 246, 0.6) 100%);
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(59, 130, 246, 0.8) 100%);
          transform: scaleY(1.1);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: linear-gradient(135deg, rgba(34, 197, 94, 1) 0%, rgba(59, 130, 246, 1) 100%);
        }
      `}</style>
    </div>
  )
}

export default Section3LinearSolveStep4