import React from 'react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

const Section3LinearSolveStep3 = () => {
  return (
    <div className="h-full w-full flex flex-col gap-4 relative p-4">
      {/* 标题区域 */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--ink-high)' }}>
          超定系统求解 (m > n)
        </h2>
        <p className="text-lg" style={{ color: 'var(--ink-mid)' }}>
          观测方程多于未知参数，寻求最佳近似解的经典方法
        </p>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-6 pr-2">
          
          {/* 问题背景 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(251, 146, 60, 0.08)',
            borderColor: 'rgba(251, 146, 60, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              1. 问题背景与特点
            </h3>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              观测方程的数量<strong>多于</strong>未知参数的数量。由于观测噪声的存在，这些方程通常是矛盾的，系统<strong>不存在精确解</strong>。这是所有测量平差问题的典型场景。
            </p>
            
            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'rgba(251, 146, 60, 0.1)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                典型特征
              </p>
              <ul className="text-sm space-y-1" style={{ color: 'var(--ink-mid)' }}>
                <li>• 系统矩阵 A 的维度：<InlineMath math="m \times n" />，其中 <InlineMath math="m > n" /></li>
                <li>• 由于观测噪声，方程组通常无精确解</li>
                <li>• 需要寻找"最佳"的近似解</li>
                <li>• 测量平差、参数估计的标准问题</li>
              </ul>
            </div>
          </div>

          {/* 求解目标 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            borderColor: 'rgba(59, 130, 246, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              2. 求解目标：线性最小二乘
            </h3>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              既然无法让 <InlineMath math="A\vec{x} - \vec{b}" /> 精确等于零，我们的目标退而求其次，寻找一个 <InlineMath math="\vec{x}" />，使得残差向量 <InlineMath math="\vec{r} = A\vec{x} - \vec{b}" /> 的<strong>长度（范数）最小</strong>。
            </p>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              最常用的准则是最小化其L2范数的平方，即求解<strong>线性最小二乘 (Linear Least Squares)</strong> 问题：
            </p>
            
            <div className="text-center my-6">
              <BlockMath math="\min_{\vec{x}} \|A\vec{x} - \vec{b}\|_2^2" />
            </div>
            
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                几何解释
              </p>
              <p className="text-sm" style={{ color: 'var(--ink-mid)' }}>
                寻找向量 <InlineMath math="A\vec{x}" /> 使其在 A 的列空间中最接近目标向量 <InlineMath math="\vec{b}" />，即寻找 <InlineMath math="\vec{b}" /> 在 A 的列空间上的<strong>正交投影</strong>。
              </p>
            </div>
          </div>

          {/* 法方程推导 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(34, 197, 94, 0.08)',
            borderColor: 'rgba(34, 197, 94, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              3. 法方程（正规方程）的完整推导
            </h3>
            
            <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
              Step 1: 目标函数展开
            </h4>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              将目标函数 <InlineMath math="f(\vec{x}) = \|A\vec{x} - \vec{b}\|_2^2" /> 展开：
            </p>
            
            <div className="text-center my-6">
              <BlockMath math="f(\vec{x}) = (A\vec{x} - \vec{b})^T (A\vec{x} - \vec{b})" />
            </div>
            
            <div className="text-center my-6">
              <BlockMath math="= (A\vec{x})^T (A\vec{x}) - (A\vec{x})^T \vec{b} - \vec{b}^T (A\vec{x}) + \vec{b}^T \vec{b}" />
            </div>
            
            <div className="text-center my-6">
              <BlockMath math="= \vec{x}^T A^T A \vec{x} - 2\vec{b}^T A\vec{x} + \vec{b}^T \vec{b}" />
            </div>
            
            <h4 className="text-lg font-semibold mb-3 mt-6" style={{ color: 'var(--ink-high)' }}>
              Step 2: 梯度计算
            </h4>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              对 <InlineMath math="\vec{x}" /> 求偏导，得到梯度：
            </p>
            
            <div className="text-center my-6">
              <BlockMath math="\nabla f(\vec{x}) = 2A^T A \vec{x} - 2A^T \vec{b}" />
            </div>
            
            <h4 className="text-lg font-semibold mb-3 mt-6" style={{ color: 'var(--ink-high)' }}>
              Step 3: 最优解条件
            </h4>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              令梯度为零以找到最小值点：
            </p>
            
            <div className="text-center my-6">
              <BlockMath math="\nabla f(\vec{x}) = 0 \quad \Rightarrow \quad 2A^T A \vec{x} - 2A^T \vec{b} = 0" />
            </div>
            
            <div className="text-center my-6">
              <BlockMath math="A^T A \vec{x} = A^T \vec{b}" />
            </div>
            
            <div className="p-4 rounded-lg mt-4" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                法方程（正规方程）
              </p>
              <p className="text-sm mb-3" style={{ color: 'var(--ink-mid)' }}>
                上述最小二乘问题的解，等价于求解方阵线性系统 <InlineMath math="(A^T A) \vec{x} = A^T \vec{b}" />。这里的 <InlineMath math="A^T A" /> 是一个 <InlineMath math="n \times n" /> 的对称（半）正定矩阵。
              </p>
              
              <h5 className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                为什么叫"法方程"？
              </h5>
              <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--ink-mid)' }}>
                在几何意义上，最小二乘就是在寻找向量 <InlineMath math="A\vec{x}" /> 到 <InlineMath math="\vec{b}" /> 的投影。条件 <InlineMath math="A^T(A\vec{x} - \vec{b}) = 0" /> 表示残差 <InlineMath math="\vec{r} = \vec{b} - A\vec{x}" /> 与 A 的列空间正交。
              </p>
              <p className="text-xs" style={{ color: 'var(--ink-mid)' }}>
                "正交"在中文里有时也叫"成法向（normal）"，所以称为<strong>法方程</strong>。这就是"Normal Equation"中文翻译的由来。
              </p>
            </div>
          </div>

          {/* 问题转化的意义 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(147, 51, 234, 0.08)',
            borderColor: 'rgba(147, 51, 234, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              4. 问题转化的重要意义
            </h3>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              这意味着，我们成功地将一个无解的超定问题，<strong>转化</strong>为了一个有唯一解（在 <InlineMath math="A" /> 列满秩的情况下）的<strong>方阵系统</strong>！
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(147, 51, 234, 0.1)' }}>
                <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                  原问题
                </h4>
                <ul className="text-sm space-y-1" style={{ color: 'var(--ink-mid)' }}>
                  <li>• 矩阵维度：<InlineMath math="m \times n" /> (<InlineMath math="m > n" />)</li>
                  <li>• 系统：<InlineMath math="A\vec{x} = \vec{b}" /></li>
                  <li>• 通常无精确解</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(147, 51, 234, 0.1)' }}>
                <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                  转化后
                </h4>
                <ul className="text-sm space-y-1" style={{ color: 'var(--ink-mid)' }}>
                  <li>• 矩阵维度：<InlineMath math="n \times n" /></li>
                  <li>• 系统：<InlineMath math="A^T A \vec{x} = A^T \vec{b}" /></li>
                  <li>• 有唯一解（A列满秩时）</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 求解方法 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(168, 85, 247, 0.08)',
            borderColor: 'rgba(168, 85, 247, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              5. 具体求解方法
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 法方程方法 */}
              <div className="p-5 rounded-lg border" style={{ 
                backgroundColor: 'rgba(34, 197, 94, 0.125)', 
                borderColor: 'rgba(34, 197, 94, 0.25)' 
              }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  方法 1: 法方程求解
                </h4>
                
                <div className="text-center my-4">
                  <BlockMath math="(A^T A) \vec{x} = A^T \vec{b}" />
                </div>
                
                <div className="space-y-3">
                  <div className="p-3 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--ink-high)' }}>
                      优点
                    </p>
                    <ul className="text-xs space-y-1" style={{ color: 'var(--ink-mid)' }}>
                      <li>• 理论简单直观</li>
                      <li>• 可用Cholesky分解</li>
                      <li>• 可用共轭梯度法</li>
                      <li>• 测量平差经典解法</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--ink-high)' }}>
                      缺点
                    </p>
                    <ul className="text-xs space-y-1" style={{ color: 'var(--ink-mid)' }}>
                      <li>• 计算 <InlineMath math="A^T A" /> 会平方条件数</li>
                      <li>• 数值稳定性较差</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* QR分解方法 */}
              <div className="p-5 rounded-lg border" style={{ 
                backgroundColor: 'rgba(59, 130, 246, 0.125)', 
                borderColor: 'rgba(59, 130, 246, 0.25)' 
              }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  方法 2: QR分解
                </h4>
                
                <div className="text-center my-4">
                  <BlockMath math="A = QR" />
                </div>
                
                <p className="text-sm mb-3" style={{ color: 'var(--ink-mid)' }}>
                  其中 <InlineMath math="Q" /> 是正交矩阵，<InlineMath math="R" /> 是上三角矩阵
                </p>
                
                <div className="space-y-3">
                  <div className="p-3 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--ink-high)' }}>
                      优点
                    </p>
                    <ul className="text-xs space-y-1" style={{ color: 'var(--ink-mid)' }}>
                      <li>• <strong>数值上更稳定</strong></li>
                      <li>• 不计算 <InlineMath math="A^T A" /></li>
                      <li>• 条件数不会平方</li>
                      <li>• 适用于病态问题</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded" style={{ backgroundColor: 'rgba(251, 146, 60, 0.1)' }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--ink-high)' }}>
                      求解步骤
                    </p>
                    <ul className="text-xs space-y-1" style={{ color: 'var(--ink-mid)' }}>
                      <li>• 1. 计算 <InlineMath math="A = QR" /></li>
                      <li>• 2. 解 <InlineMath math="R\vec{x} = Q^T\vec{b}" /></li>
                      <li>• 3. 回代求解</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                实际应用建议
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                对于<strong>一般工程问题</strong>，建议使用 QR 分解；对于<strong>大规模稀疏系统</strong>，法方程结合共轭梯度法仍然是主流选择；对于<strong>高精度要求或病态问题</strong>，QR 分解提供了更可靠的数值稳定性。
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

export default Section3LinearSolveStep3