import React from 'react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

const Section5NonlinearSolveStep5 = () => {
  return (
    <div className="h-full w-full flex flex-col gap-4 relative p-4">
      {/* 标题区域 */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--ink-high)' }}>
          高阶方法与哈雷法
        </h2>
        <p className="text-lg" style={{ color: 'var(--ink-mid)' }}>
          超越牛顿法：更高阶泰勒展开的威力与代价
        </p>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-6 pr-2">
          
          {/* 引言部分 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(14, 165, 233, 0.08)',
            borderColor: 'rgba(14, 165, 233, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              超越二阶收敛：高阶方法的动机
            </h3>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              牛顿法使用一阶泰勒展开，具有<strong>二阶收敛</strong>性（在解附近，每次迭代的有效数字位数约翻一倍），这已经非常快了。一个自然的问题是：<strong>如果我们使用更高阶的泰勒展开来近似原函数，能否获得更快的收敛速度？</strong>
            </p>
            
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)' }}>
              <p className="text-base leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                答案是肯定的，这类方法统称为<strong>高阶方法</strong>。其中最著名的是基于二阶泰勒展开的<strong>哈雷法 (Halley's Method)</strong>，它能够实现三阶收敛。
              </p>
            </div>
          </div>

          {/* 二阶泰勒展开 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(6, 182, 212, 0.08)',
            borderColor: 'rgba(6, 182, 212, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              1. 二阶泰勒展开：从直线到抛物线
            </h3>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              对于单变量方程 <InlineMath math="f(x)=0" />，其<strong>二阶泰勒展开</strong>为：
            </p>
            
            <div className="text-center my-6">
              <BlockMath math="f(x) \approx f(x_k) + f'(x_k)(x - x_k) + \frac{f''(x_k)}{2}(x - x_k)^2" />
            </div>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              这是在 <InlineMath math="x_k" /> 附近的一个<strong>抛物线近似</strong>。若记 <InlineMath math="\Delta x = x - x_k" />，则需要解的二次方程为：
            </p>
            
            <div className="text-center my-6">
              <BlockMath math="f(x_k) + f'(x_k)\Delta x + \tfrac{1}{2} f''(x_k)(\Delta x)^2 = 0" />
            </div>

            <div className="p-4 rounded-lg mt-4" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                <strong>关键洞察：</strong>牛顿法使用切线（直线）逼近，而高阶方法使用抛物线逼近。抛物线能更好地捕捉函数的局部弯曲特性，理论上应该提供更准确的近似。
              </p>
            </div>
          </div>

          {/* 哈雷法推导 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(30, 58, 138, 0.08)',
            borderColor: 'rgba(30, 58, 138, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              2. 哈雷法推导：求解二次方程
            </h3>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(30, 58, 138, 0.1)' }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  Step 1: 标准二次方程形式
                </h4>
                
                <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
                  设置系数：
                </p>
                
                <div className="text-center my-4">
                  <BlockMath math="a = \tfrac{1}{2} f''(x_k), \quad b = f'(x_k), \quad c = f(x_k)" />
                </div>
                
                <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
                  则方程为：
                </p>
                
                <div className="text-center my-4">
                  <BlockMath math="a (\Delta x)^2 + b \Delta x + c = 0" />
                </div>
                
                <p className="text-base leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                  使用二次公式求解：
                </p>
                
                <div className="text-center my-4">
                  <BlockMath math="\Delta x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  Step 2: 代入系数并选择合适的根
                </h4>
                
                <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
                  代入 <InlineMath math="a,b,c" /> 得：
                </p>
                
                <div className="text-center my-4">
                  <BlockMath math="\Delta x = \frac{-f'(x_k) \pm \sqrt{(f'(x_k))^2 - f(x_k) f''(x_k)}}{f''(x_k)}" />
                </div>
                
                <p className="text-base leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                  我们要选取更靠近 <InlineMath math="\Delta x = 0" /> 的那个根（泰勒展开在小范围内才有效）。
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  Step 3: 代数化简与有理化
                </h4>
                
                <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
                  选择"负号"对应的根并进行有理化处理，经过复杂的代数运算，最终得到一个纯有理式：
                </p>
                
                <div className="text-center my-4">
                  <BlockMath math="\Delta x = -\frac{2 f(x_k) f'(x_k)}{2[f'(x_k)]^2 - f(x_k) f''(x_k)}" />
                </div>
                
                <div className="p-3 rounded bg-green-900/20 border border-green-400/30 mt-4">
                  <p className="text-sm" style={{ color: 'var(--ink-mid)' }}>
                    <strong>重要：</strong>公式中最终<strong>没有出现开方项</strong>，是因为通过选取合适的根并进行代数化简，平方根被消掉，化为一个纯分式形式，这也是哈雷法计算简便的原因之一。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 哈雷法迭代公式 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(14, 165, 233, 0.08)',
            borderColor: 'rgba(14, 165, 233, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              3. 哈雷法最终迭代公式
            </h3>
            
            <div className="text-center my-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(14, 165, 233, 0.15)' }}>
              <BlockMath math="x_{k+1} = x_k - \frac{2 f(x_k) f'(x_k)}{2[f'(x_k)]^2 - f(x_k) f''(x_k)}" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* 收敛性特点 */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)', border: '1px solid' }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  收敛性特点
                </h4>
                <ul className="text-sm space-y-2" style={{ color: 'var(--ink-mid)' }}>
                  <li>• 利用了<strong>二阶导数</strong>信息</li>
                  <li>• 实现<strong>三阶收敛</strong>（vs 牛顿法的二阶收敛）</li>
                  <li>• 在根附近通常收敛更快</li>
                  <li>• 每次迭代有效数字位数约增加两倍</li>
                </ul>
              </div>

              {/* 计算要求 */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', border: '1px solid' }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  计算要求
                </h4>
                <ul className="text-sm space-y-2" style={{ color: 'var(--ink-mid)' }}>
                  <li>• 需要计算二阶导数 <InlineMath math="f''(x)" /></li>
                  <li>• 计算复杂度比牛顿法更高</li>
                  <li>• 对初值敏感性可能更强</li>
                  <li>• 实现复杂度显著增加</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 多维推广的挑战 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            borderColor: 'rgba(239, 68, 68, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              4. 多维推广的巨大挑战
            </h3>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              将二阶近似推广到多变量方程组 <InlineMath math="\vec{f}(\vec{x})=\vec{0}" /> 是非常复杂的。它不仅需要计算雅可比矩阵 <InlineMath math="J" />，还需要计算一个三维的<strong>Hessian张量</strong>（二阶导数）。求解每一步的更新量 <InlineMath math="\Delta\vec{x}" /> 不再是解一个线性方程组，而是解一个<strong>二次方程组</strong>，计算成本急剧增加。
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 优势 */}
              <div className="p-5 rounded-lg border" style={{ 
                backgroundColor: 'rgba(34, 197, 94, 0.1)', 
                borderColor: 'rgba(34, 197, 94, 0.3)' 
              }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  理论优势
                </h4>
                <ul className="text-sm space-y-2" style={{ color: 'var(--ink-mid)' }}>
                  <li>• 理论上具有更高的收敛阶数</li>
                  <li>• 在需要极高精度解的特定低维问题中可能被采用</li>
                  <li>• 某些科学计算领域有应用价值</li>
                  <li>• 数学理论上的完美性</li>
                </ul>
              </div>

              {/* 劣势 */}
              <div className="p-5 rounded-lg border" style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                borderColor: 'rgba(239, 68, 68, 0.3)' 
              }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  压倒性的劣势
                </h4>
                <ul className="text-sm space-y-2" style={{ color: 'var(--ink-mid)' }}>
                  <li>• <strong>计算成本极高：</strong>高阶导数的计算、存储和处理成本爆炸性增长</li>
                  <li>• <strong>实现复杂：</strong>算法实现比牛顿法复杂得多</li>
                  <li>• <strong>收益递减：</strong>二阶到更高阶的提升有限，代价巨大</li>
                  <li>• <strong>维度灾难：</strong>随维度增加而快速恶化</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 结论与实践指导 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(168, 85, 247, 0.08)',
            borderColor: 'rgba(168, 85, 247, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              5. 实践结论：平衡的艺术
            </h3>
            
            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}>
              <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
                从一阶（梯度下降）到二阶（牛顿法）的性能提升是<strong>革命性的</strong>，但从二阶到更高阶的提升，在付出巨大计算代价后，带来的实际好处相对有限。
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 理论研究 */}
              <div className="p-4 rounded-lg border" style={{ 
                backgroundColor: 'rgba(14, 165, 233, 0.1)', 
                borderColor: 'rgba(14, 165, 233, 0.3)' 
              }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  理论价值
                </h4>
                <ul className="text-sm space-y-2" style={{ color: 'var(--ink-mid)' }}>
                  <li>• 数学理论的完善</li>
                  <li>• 特殊领域的精确计算</li>
                  <li>• 低维问题的高精度需求</li>
                  <li>• 算法设计的理论指导</li>
                </ul>
              </div>

              {/* 工程实践 */}
              <div className="p-4 rounded-lg border" style={{ 
                backgroundColor: 'rgba(34, 197, 94, 0.1)', 
                borderColor: 'rgba(34, 197, 94, 0.3)' 
              }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  工程选择
                </h4>
                <ul className="text-sm space-y-2" style={{ color: 'var(--ink-mid)' }}>
                  <li>• 牛顿法及其变体为主流</li>
                  <li>• 高斯-牛顿法</li>
                  <li>• Levenberg-Marquardt算法</li>
                  <li>• 准牛顿方法（BFGS等）</li>
                </ul>
              </div>

              {/* 应用领域 */}
              <div className="p-4 rounded-lg border" style={{ 
                backgroundColor: 'rgba(6, 182, 212, 0.1)', 
                borderColor: 'rgba(6, 182, 212, 0.3)' 
              }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  适用场景
                </h4>
                <ul className="text-sm space-y-2" style={{ color: 'var(--ink-mid)' }}>
                  <li>• 测绘与遥感</li>
                  <li>• 大规模优化问题</li>
                  <li>• 实时计算需求</li>
                  <li>• 工程实践应用</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                黄金标准
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                在测绘与遥感等领域的大多数高维优化问题中，<strong>基于一阶近似的牛顿类方法（特别是其变体，如高斯-牛顿法和LM算法）是在收敛速度和计算成本之间达到最佳平衡的黄金标准</strong>。高阶方法更多地停留在理论研究和少数特殊应用中，并非主流的工程实践选择。
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

export default Section5NonlinearSolveStep5