import React from 'react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

const Section5NonlinearSolveStep2 = () => {
  return (
    <div className="h-full w-full flex flex-col gap-4 relative p-4">
      {/* 标题区域 */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--ink-high)' }}>
          牛顿法求根迭代法
        </h2>
        <p className="text-lg" style={{ color: 'var(--ink-mid)' }}>
          泰勒展开与局部线性化的数学基石
        </p>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-6 pr-2">
          
          {/* 泰勒展开与局部线性化 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(14, 165, 233, 0.08)',
            borderColor: 'rgba(14, 165, 233, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              1. 核心工具：泰勒展开与局部线性化
            </h3>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              实现"以直代曲"的数学基石是<strong>泰勒展开 (Taylor Series)</strong>。它告诉我们，任何一个足够光滑的函数，在其某个点附近都可以被一个多项式函数来高度近似。对于优化算法，我们最关心的是其<strong>一阶近似</strong>，即线性部分。
            </p>
            
            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)' }}>
              <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                单变量函数的泰勒展开
              </h4>
              
              <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
                对于单变量函数 <InlineMath math="f(x)" />，在点 <InlineMath math="x_k" /> 附近，其一阶泰勒展开为：
              </p>
              
              <div className="text-center my-6">
                <BlockMath math="f(x) \approx f(x_k) + f'(x_k)(x - x_k)" />
              </div>
              
              <p className="text-sm" style={{ color: 'var(--ink-mid)' }}>
                这是一个以 <InlineMath math="f'(x_k)" /> 为斜率、经过点 <InlineMath math="(x_k, f(x_k))" /> 的<strong>直线（仿射函数）</strong>。
              </p>
            </div>
            
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
              <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                多变量函数的推广
              </h4>
              
              <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
                对于多变量向量函数 <InlineMath math="\vec{f}(\vec{x})" />：输入为 n 维向量 <InlineMath math="\vec{x}" />、输出为 m 维向量 <InlineMath math="\vec{y}" /> 的函数 <InlineMath math="\vec{y} = \vec{f}(\vec{x})" />，其在点 <InlineMath math="\vec{x}_k" /> 附近的一阶泰勒展开为：
              </p>
              
              <div className="text-center my-6">
                <BlockMath math="\vec{f}(\vec{x}) \approx \vec{f}(\vec{x}_k) + J_{\vec{f}}(\vec{x}_k)(\vec{x} - \vec{x}_k)" />
              </div>
              
              <p className="text-sm" style={{ color: 'var(--ink-mid)' }}>
                这里的 <InlineMath math="J_{\vec{f}}(\vec{x}_k)" /> 就是 <InlineMath math="\vec{f}(\vec{x})" /> 在 <InlineMath math="\vec{x}_k" /> 处的<strong>雅可比矩阵 (Jacobian Matrix)</strong>，它是单变量导数向多变量的推广。这个展开式同样是一个<strong>仿射函数</strong>，是 <InlineMath math="\vec{f}(\vec{x})" /> 在局部的线性近似。
              </p>
            </div>
          </div>

          {/* 牛顿法基本思想 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(6, 182, 212, 0.08)',
            borderColor: 'rgba(6, 182, 212, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              2. 奠基算法：牛顿法 (Newton's Method)
            </h3>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              有了泰勒展开这一利器，我们便可以构建求解非线性问题的奠基性算法——牛顿法。我们从最简单的情形入手：求解单个非线性方程 <InlineMath math="f(x) = 0" />。
            </p>
            
            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
              <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                核心思想
              </h4>
              
              <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
                牛顿法的思想非常直观：
              </p>
              
              <ol className="text-sm space-y-2 mb-4" style={{ color: 'var(--ink-mid)' }}>
                <li>1. 在当前的猜测解 <InlineMath math="x_k" /> 处，用一条<strong>切线</strong>（即一阶泰勒展开）来近似原函数 <InlineMath math="f(x)" />。</li>
                <li>2. 计算这条切线与 x 轴的交点，将这个交点作为<strong>下一次的猜测解</strong> <InlineMath math="x_{k+1}" />。</li>
                <li>3. 重复此过程，直到函数值 <InlineMath math="f(x_k)" /> 足够接近于零。</li>
              </ol>
            </div>
          </div>

          {/* 牛顿法推导 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(30, 58, 138, 0.08)',
            borderColor: 'rgba(30, 58, 138, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              3. 牛顿法公式推导
            </h3>
            
            <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
              Step 1: 建立切线方程
            </h4>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              数学上，我们将 <InlineMath math="f(x)" /> 在 <InlineMath math="x_k" /> 处的泰勒展开 <InlineMath math="f(x_k) + f'(x_k)(x - x_k)" /> 设为零，并令此时的 <InlineMath math="x" /> 为 <InlineMath math="x_{k+1}" />：
            </p>
            
            <div className="text-center my-6">
              <BlockMath math="0 = f(x_k) + f'(x_k)(x_{k+1} - x_k)" />
            </div>
            
            <h4 className="text-lg font-semibold mb-3 mt-6" style={{ color: 'var(--ink-high)' }}>
              Step 2: 求解迭代公式
            </h4>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              整理上述方程，得到牛顿法的核心迭代公式：
            </p>
            
            <div className="text-center my-6">
              <BlockMath math="x_{k+1} = x_k - \frac{f(x_k)}{f'(x_k)}" />
            </div>
            
            <div className="p-4 rounded-lg mt-4" style={{ backgroundColor: 'rgba(30, 58, 138, 0.1)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                核心迭代公式解释
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                这个公式告诉我们：下一个猜测解 <InlineMath math="x_{k+1}" /> 等于当前解 <InlineMath math="x_k" /> 减去一个修正项 <InlineMath math="\frac{f(x_k)}{f'(x_k)}" />。这个修正项的大小取决于当前函数值与导数的比值，体现了"以直代曲"的精髓。
              </p>
            </div>
          </div>

          {/* 算法流程 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(14, 165, 233, 0.08)',
            borderColor: 'rgba(14, 165, 233, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              4. 牛顿法算法流程
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 算法步骤 */}
              <div className="p-5 rounded-lg border" style={{ 
                backgroundColor: 'rgba(14, 165, 233, 0.1)', 
                borderColor: 'rgba(14, 165, 233, 0.3)' 
              }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  算法步骤
                </h4>
                
                <ol className="text-sm space-y-3" style={{ color: 'var(--ink-mid)' }}>
                  <li><strong>1. 初始化：</strong> 给定初始猜测 <InlineMath math="x_0" />。</li>
                  <li><strong>2. 迭代计算：</strong> 对于 k = 0, 1, 2, ...
                    <ul className="ml-4 mt-2 space-y-1">
                      <li>• 计算当前函数值 <InlineMath math="f(x_k)" /></li>
                      <li>• 计算当前导数值 <InlineMath math="f'(x_k)" /></li>
                      <li>• 更新解：<InlineMath math="x_{k+1} = x_k - \frac{f(x_k)}{f'(x_k)}" /></li>
                    </ul>
                  </li>
                  <li><strong>3. 收敛检查：</strong> 检查是否满足 <InlineMath math="|f(x_k)| < \epsilon" /> 或 <InlineMath math="|x_{k+1} - x_k| < \epsilon" />。</li>
                  <li><strong>4. 输出：</strong> 返回近似解 <InlineMath math="x_{k+1}" />。</li>
                </ol>
              </div>

              {/* 特点分析 */}
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)', border: '1px solid' }}>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                    优点
                  </h4>
                  <ul className="text-xs space-y-1" style={{ color: 'var(--ink-mid)' }}>
                    <li>• <strong>收敛速度快</strong>：二次收敛</li>
                    <li>• 理论基础扎实</li>
                    <li>• 适用于光滑函数</li>
                    <li>• 局部收敛性强</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', border: '1px solid' }}>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                    局限性
                  </h4>
                  <ul className="text-xs space-y-1" style={{ color: 'var(--ink-mid)' }}>
                    <li>• 需要计算导数 <InlineMath math="f'(x)" /></li>
                    <li>• 对初值敏感</li>
                    <li>• 导数为零时失效</li>
                    <li>• 只能保证局部收敛</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                关键洞察
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                牛顿法将复杂的<strong>非线性求根问题</strong>转化为<strong>每次迭代中的简单线性计算</strong>。这正是"迭代线性化"思想的完美体现，为后续更复杂的非线性优化算法奠定了坚实的理论基础。
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
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.6) 0%, rgba(6, 182, 212, 0.6) 100%);
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.8) 0%, rgba(6, 182, 212, 0.8) 100%);
          transform: scaleY(1.1);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: linear-gradient(135deg, rgba(14, 165, 233, 1) 0%, rgba(6, 182, 212, 1) 100%);
        }
      `}</style>
    </div>
  )
}

export default Section5NonlinearSolveStep2