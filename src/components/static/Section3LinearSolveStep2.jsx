import React from 'react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

const Section3LinearSolveStep2 = () => {
  return (
    <div className="h-full w-full flex flex-col gap-4 relative p-4">
      {/* 标题区域 */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--ink-high)' }}>
          迭代法的思想基石：梯度下降法
        </h2>
        <p className="text-lg" style={{ color: 'var(--ink-mid)' }}>
          通过"问题转化"思想，将线性方程组求解转化为优化问题
        </p>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-6 pr-2">
          
          {/* 核心思想介绍 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(34, 197, 94, 0.08)',
            borderColor: 'rgba(34, 197, 94, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              1. 基本假设与核心思想（A对称正定）
            </h3>
            
            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                基本假设
              </p>
              <p className="text-sm" style={{ color: 'var(--ink-mid)' }}>
                我们首先假设矩阵 <InlineMath math="\mathbf{A}" /> 是<strong>对称正定</strong>的，这是梯度下降法最理想的应用场景。
              </p>
            </div>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              梯度下降法本身是为求解优化问题而设计的，但它可以通过一个巧妙的<strong>"问题转化"</strong>思想，成为求解特定线性系统的理论起点，并由此衍生出整个迭代法家族。
            </p>
            
            <p className="text-base leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
              核心思想：为线性方程组 <InlineMath math="A\vec{x}=\vec{b}" /> 找到一个与之等价的<strong>二次型优化问题</strong>。
            </p>
          </div>

          {/* 目标函数构造 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            borderColor: 'rgba(59, 130, 246, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              2. 目标函数构造
            </h3>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              我们构造如下的目标函数 <InlineMath math="\phi(\vec{x})" />：
            </p>
            
            <div className="text-center my-6">
              <BlockMath math="\phi(\vec{x}) = \frac{1}{2}\vec{x}^T A \vec{x} - \vec{b}^T \vec{x}" />
            </div>
            
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--ink-high)' }}>
                关键性质：<strong>最小化 <InlineMath math="\phi(\vec{x})" /> 与求解 <InlineMath math="A\vec{x}=\vec{b}" /> 是完全等价的。</strong>
              </p>
            </div>
          </div>

          {/* 梯度推导 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(147, 51, 234, 0.08)',
            borderColor: 'rgba(147, 51, 234, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              3. 梯度推导与等价性证明
            </h3>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              其<strong>原因</strong>在于，一个可微函数（<InlineMath math="\phi(\vec{x})" /> 是二次的，因此是光滑可微的）达到最小值的<strong>必要条件</strong>是其<strong>梯度为零</strong>。我们来计算 <InlineMath math="\phi(\vec{x})" /> 的梯度：
            </p>
            
            <div className="text-center my-6">
              <BlockMath math="\nabla \phi(\vec{x}) = \frac{1}{2}(A^T \vec{x} + A \vec{x}) - \vec{b}" />
            </div>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              由于 <InlineMath math="\mathbf{A}" /> 是对称的 (<InlineMath math="A^T=A" />)，上式简化为：
            </p>
            
            <div className="text-center my-6">
              <BlockMath math="\nabla \phi(\vec{x}) = A \vec{x} - \vec{b}" />
            </div>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              令梯度为零以寻找最小值点，<InlineMath math="\nabla\phi(\vec{x}) = \vec{0}" />，我们立刻得到：
            </p>
            
            <div className="text-center my-6">
              <BlockMath math="A \vec{x} - \vec{b} = 0 \quad \Rightarrow \quad A \vec{x} = \vec{b}" />
            </div>
          </div>

          {/* 等价性说明 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(168, 85, 247, 0.08)',
            borderColor: 'rgba(168, 85, 247, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              4. 问题转化的完整性
            </h3>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              这个推导完美地证明了，我们已经成功地将一个<strong>求解线性方程组</strong>的任务，转化为了一个<strong>最小化二次函数</strong>的任务。
            </p>
          </div>

          {/* A不对称的情况 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(251, 146, 60, 0.08)',
            borderColor: 'rgba(251, 146, 60, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              5. 如果 A 不是对称矩阵怎么办？
            </h3>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              这时，我们常用的思路就是构造 <strong>正规方程 (Normal Equation)</strong>：
            </p>
            
            <div className="text-center my-6">
              <BlockMath math="A^T A \vec{x} = A^T \vec{b}" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(251, 146, 60, 0.1)' }}>
                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                  关键性质
                </p>
                <ul className="text-sm space-y-1" style={{ color: 'var(--ink-mid)' }}>
                  <li>• <InlineMath math="A^T A" /> 一定是对称半正定矩阵</li>
                  <li>• 如果 A 满列秩，那么 <InlineMath math="A^T A" /> 就是正定的</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(251, 146, 60, 0.1)' }}>
                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                  适用条件
                </p>
                <p className="text-sm" style={{ color: 'var(--ink-mid)' }}>
                  当 A 满列秩（列向量线性无关）时，可以继续用梯度下降来解
                </p>
              </div>
            </div>
            
            <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
              解释方式：最小二乘观点
            </h4>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              当 A 非对称时，直接构造二次型不保证凸性，但我们可以考虑最小二乘意义下的优化：
            </p>
            
            <div className="text-center my-6">
              <BlockMath math="\min_{\vec{x}} \|\|A \vec{x} - \vec{b}\|\|^2" />
            </div>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              这就是把"解线性方程组"转化为"残差平方最小化"。其展开形式就是：
            </p>
            
            <div className="text-center my-6">
              <BlockMath math="\phi(\vec{x}) = \frac{1}{2}\|\|A \vec{x} - \vec{b}\|\|^2 = \frac{1}{2}\vec{x}^T (A^T A) \vec{x} - (A^T \vec{b})^T \vec{x} + \frac{1}{2}\|\|\vec{b}\|\|^2" />
            </div>
            
            <p className="text-base leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
              这里的 Hessian 矩阵就是 <InlineMath math="A^T A" />，它对称半正定。当 A 满秩时，<InlineMath math="A^T A" /> 正定，从而问题又变成了一个凸二次优化问题。
            </p>
          </div>

          {/* A半正定的情况 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(236, 72, 153, 0.08)',
            borderColor: 'rgba(236, 72, 153, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              6. 如果 A 半正定但不可逆怎么办？
            </h3>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              如果 A 半正定但不可逆（有零特征值），情况会变得更加复杂：
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)' }}>
                <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  可能的情况
                </h4>
                <ul className="text-sm space-y-2" style={{ color: 'var(--ink-mid)' }}>
                  <li>• <strong>无解</strong>：如果 <InlineMath math="\vec{b}" /> 不在 A 的列空间里</li>
                  <li>• <strong>无穷多解</strong>：如果 <InlineMath math="\vec{b}" /> 在 A 的列空间里</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)' }}>
                <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  求解策略
                </h4>
                <p className="text-sm" style={{ color: 'var(--ink-mid)' }}>
                  通常选择<strong>最小范数解</strong>，它在所有可能解中具有最小的欧几里得范数
                </p>
              </div>
            </div>
            
            <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
              最小范数解的表达式
            </h4>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              对于方程 <InlineMath math="A\vec{x} = \vec{b}" />，最小范数解为：
            </p>
            
            <div className="text-center my-6">
              <BlockMath math="\vec{x}^* = A^+ \vec{b}" />
            </div>
            
            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                Moore–Penrose 广义逆的性质
              </p>
              <ul className="text-sm space-y-1" style={{ color: 'var(--ink-mid)' }}>
                <li>• <InlineMath math="A^+" /> 是矩阵 A 的 Moore–Penrose 广义逆</li>
                <li>• 当 A 可逆时，<InlineMath math="A^+ = A^{-1}" /></li>
                <li>• 当 A 不可逆时，<InlineMath math="A^+" /> 给出最小范数解</li>
                <li>• 对于超定系统，<InlineMath math="A^+" /> 给出最小二乘解</li>
              </ul>
            </div>
            
            <p className="text-base leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
              在这种情况下，梯度下降法仍然可以收敛到一个解，但收敛的解取决于初始点的选择。从 <InlineMath math="\vec{x}_0 = \vec{0}" /> 开始的梯度下降法会收敛到最小范数解 <InlineMath math="\vec{x}^*" />。
            </p>
          </div>

          {/* 迭代公式 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(34, 197, 94, 0.08)',
            borderColor: 'rgba(34, 197, 94, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              7. 梯度下降迭代公式的统一形式
            </h3>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              无论是对称正定、非对称还是半正定的情况，我们都可以通过构造合适的优化问题，运用梯度下降法的统一迭代公式：
            </p>
            
            <div className="text-center my-6">
              <BlockMath math="\vec{x}_{k+1} = \vec{x}_k - \alpha_k \nabla \phi(\vec{x}_k) = \vec{x}_k - \alpha_k (A \vec{x}_k - \vec{b})" />
            </div>
            
            <div className="p-4 rounded-lg mt-4" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                统一的理论框架
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                这里的 <InlineMath math="\vec{r}_k = A\vec{x}_k - \vec{b}" /> 正是第 k 步的<strong>残差 (Residual)</strong>。无论矩阵 A 的性质如何，这个算法的每一步都是在<strong>沿着当前残差的反方向进行修正</strong>，体现了梯度下降法的统一性和广泛适用性。
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

export default Section3LinearSolveStep2