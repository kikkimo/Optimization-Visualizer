import React from 'react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

const Section5NonlinearSolveStep6 = () => {
  return (
    <div className="h-full w-full flex flex-col gap-4 relative p-4">
      {/* 标题区域 */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--ink-high)' }}>
          约束最小二乘平差
        </h2>
        <p className="text-lg" style={{ color: 'var(--ink-mid)' }}>
          附有限制条件的间接平差法方程推导
        </p>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-6 pr-2">
          
          {/* 问题建立 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(14, 165, 233, 0.08)',
            borderColor: 'rgba(14, 165, 233, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              1. 问题建立与数学模型
            </h3>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              在测绘平差中，经常遇到需要在满足某些约束条件下求解最小二乘问题的情况。这类问题被称为<strong>附有限制条件的间接平差</strong>。
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 观测方程 */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)' }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  观测方程
                </h4>
                <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
                  观测值误差方程为：
                </p>
                <div className="text-center my-4">
                  <BlockMath math="v = Ax - l" />
                </div>
                <p className="text-sm" style={{ color: 'var(--ink-mid)' }}>
                  其中 <InlineMath math="v" /> 为观测值改正数，<InlineMath math="A" /> 为系数矩阵，<InlineMath math="x" /> 为未知参数，<InlineMath math="l" /> 为观测值。
                </p>
              </div>

              {/* 约束方程 */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  约束条件
                </h4>
                <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
                  约束方程为：
                </p>
                <div className="text-center my-4">
                  <BlockMath math="Bx - w = 0" />
                </div>
                <p className="text-sm" style={{ color: 'var(--ink-mid)' }}>
                  其中 <InlineMath math="B" /> 为约束系数矩阵，<InlineMath math="w" /> 为约束常数项。
                </p>
              </div>
            </div>
          </div>

          {/* 法方程建立 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(6, 182, 212, 0.08)',
            borderColor: 'rgba(6, 182, 212, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              2. 附有限制条件的法方程
            </h3>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              采用拉格朗日乘数法，在约束条件下建立法方程。引入拉格朗日乘数 <InlineMath math="K_s" />，得到法方程组：
            </p>

            <div className="space-y-6">
              {/* 法方程组 */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  法方程组
                </h4>
                
                <div className="text-center my-4">
                  <BlockMath math="A^T PA x + B^T K_s - A^T P l = 0 \qquad (1)" />
                </div>
                
                <div className="text-center my-4">
                  <BlockMath math="Bx - w = 0 \qquad (2)" />
                </div>
                
                <p className="text-sm mt-4" style={{ color: 'var(--ink-mid)' }}>
                  其中 <InlineMath math="s" /> 为未知数的联系数，<InlineMath math="P" /> 为权矩阵。
                </p>
              </div>

              {/* 矩阵形式 */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(30, 58, 138, 0.1)' }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  联合法方程的矩阵表达形式
                </h4>
                
                <div className="text-center my-6">
                  <BlockMath math="\begin{bmatrix} A^T PA & B^T \\ B & 0 \end{bmatrix} \begin{bmatrix} x \\ K_s \end{bmatrix} = \begin{bmatrix} A^T P l \\ w \end{bmatrix}" />
                </div>
                
                <p className="text-base leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                  记该法方程为 <InlineMath math="N\hat{x} = U" />，当 <InlineMath math="N" /> 可逆时，<InlineMath math="\hat{x} = N^{-1}U" />。
                </p>
              </div>
            </div>
          </div>

          {/* 矩阵可逆性分析 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(30, 58, 138, 0.08)',
            borderColor: 'rgba(30, 58, 138, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              3. 矩阵可逆性分析
            </h3>
            
            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'rgba(30, 58, 138, 0.1)' }}>
              <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                关键假设
              </h4>
              
              <ul className="text-base space-y-2" style={{ color: 'var(--ink-mid)' }}>
                <li>• 一般情况下，<InlineMath math="A" /> 矩阵列向量线性无关，<InlineMath math="A^T PA" /> 一定可逆</li>
                <li>• <InlineMath math="R(B(A^T PA)^{-1}B^T) = R(B) = s" /></li>
                <li>• <InlineMath math="(B(A^T PA)^{-1}B^T)^T = B(A^T PA)^{-1}B^T" /></li>
              </ul>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)', border: '1px solid' }}>
              <p className="text-base leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                <strong>重要结论：</strong><InlineMath math="B(A^T PA)^{-1}B^T" /> 为 <InlineMath math="s" /> 阶满秩对称阵，是可逆矩阵。
              </p>
            </div>
          </div>

          {/* 解的推导过程 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(168, 85, 247, 0.08)',
            borderColor: 'rgba(168, 85, 247, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              4. 解的推导过程
            </h3>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  Step 1: 消元求解拉格朗日乘数
                </h4>
                
                <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
                  用 <InlineMath math="B(A^T PA)^{-1}" /> 左乘式 (1) 同时减去式 (2) 可得：
                </p>
                
                <div className="text-center my-4">
                  <BlockMath math="B(A^T PA)^{-1}B^T K_s + w - B(A^T PA)^{-1}A^T P l = 0" />
                </div>
                
                <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
                  因此拉格朗日乘数为：
                </p>
                
                <div className="text-center my-4">
                  <BlockMath math="K_s = (B(A^T PA)^{-1}B^T)^{-1}(B(A^T PA)^{-1}A^T P l - w)" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  Step 2: 回代求解参数
                </h4>
                
                <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
                  将 <InlineMath math="K_s" /> 代入式 (1) 可得：
                </p>
                
                <div className="text-center my-6">
                  <BlockMath math="\begin{align}
                    x &= (A^T PA)^{-1}[A^T P l - B^T(B(A^T PA)^{-1}B^T)^{-1}(B(A^T PA)^{-1}A^T P l - w)] \\
                    &= [(A^T PA)^{-1} - (A^T PA)^{-1}B^T(B(A^T PA)^{-1}B^T)^{-1}B(A^T PA)^{-1}]A^T P l \\
                    &\quad + (A^T PA)^{-1}B^T(B(A^T PA)^{-1}B^T)^{-1}w
                  \end{align}" />
                </div>
              </div>
            </div>
          </div>

          {/* 最终结果 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(14, 165, 233, 0.08)',
            borderColor: 'rgba(14, 165, 233, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              5. 最终解的简洁表达式
            </h3>
            
            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)' }}>
              <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                引入简化记号
              </h4>
              
              <div className="text-center my-4">
                <BlockMath math="\begin{align}
                  N_{AA} &= A^T PA \\
                  N_{BB} &= B(A^T PA)^{-1}B^T
                \end{align}" />
              </div>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(14, 165, 233, 0.15)' }}>
              <h4 className="text-lg font-semibold mb-3 text-center" style={{ color: 'var(--ink-high)' }}>
                约束最小二乘的最终解
              </h4>
              
              <div className="text-center my-6">
                <BlockMath math="x = (N_{AA}^{-1} - N_{AA}^{-1}B^T N_{BB}^{-1}B N_{AA}^{-1})A^T P l + N_{AA}^{-1}B^T N_{BB}^{-1}w" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* 解的组成 */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)', border: '1px solid' }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  解的组成分析
                </h4>
                <ul className="text-sm space-y-2" style={{ color: 'var(--ink-mid)' }}>
                  <li>• <strong>第一项：</strong>考虑约束条件修正的观测项</li>
                  <li>• <strong>第二项：</strong>由约束条件直接贡献的项</li>
                  <li>• 体现了约束对无约束解的修正作用</li>
                  <li>• 当约束矩阵 <InlineMath math="B = 0" /> 时，退化为无约束最小二乘解</li>
                </ul>
              </div>

              {/* 计算特点 */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', borderColor: 'rgba(168, 85, 247, 0.3)', border: '1px solid' }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  计算特点
                </h4>
                <ul className="text-sm space-y-2" style={{ color: 'var(--ink-mid)' }}>
                  <li>• 需要计算两个矩阵的逆：<InlineMath math="N_{AA}^{-1}" /> 和 <InlineMath math="N_{BB}^{-1}" /></li>
                  <li>• 计算复杂度比无约束情况显著增加</li>
                  <li>• 适用于测量平差中的各种约束问题</li>
                  <li>• 保证了解满足所有给定约束条件</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                应用意义
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                这一解法为测绘平差中处理<strong>附有限制条件的间接平差问题</strong>提供了严格的数学基础。在实际工程中，约束条件常用于表达几何约束、物理约束或先验知识，使得平差结果更加符合实际情况。
              </p>
            </div>
          </div>

          {/* 实际应用示例 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(34, 197, 94, 0.08)',
            borderColor: 'rgba(34, 197, 94, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              6. 典型应用场景
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 几何约束 */}
              <div className="p-4 rounded-lg border" style={{ 
                backgroundColor: 'rgba(14, 165, 233, 0.1)', 
                borderColor: 'rgba(14, 165, 233, 0.3)' 
              }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  几何约束
                </h4>
                <ul className="text-sm space-y-2" style={{ color: 'var(--ink-mid)' }}>
                  <li>• 控制点坐标固定</li>
                  <li>• 角度和距离关系</li>
                  <li>• 共线性约束</li>
                  <li>• 平行性约束</li>
                </ul>
              </div>

              {/* 物理约束 */}
              <div className="p-4 rounded-lg border" style={{ 
                backgroundColor: 'rgba(6, 182, 212, 0.1)', 
                borderColor: 'rgba(6, 182, 212, 0.3)' 
              }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  物理约束
                </h4>
                <ul className="text-sm space-y-2" style={{ color: 'var(--ink-mid)' }}>
                  <li>• 高程基准约束</li>
                  <li>• 重力场约束</li>
                  <li>• 大地水准面约束</li>
                  <li>• 地球曲率约束</li>
                </ul>
              </div>

              {/* 先验约束 */}
              <div className="p-4 rounded-lg border" style={{ 
                backgroundColor: 'rgba(168, 85, 247, 0.1)', 
                borderColor: 'rgba(168, 85, 247, 0.3)' 
              }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  先验约束
                </h4>
                <ul className="text-sm space-y-2" style={{ color: 'var(--ink-mid)' }}>
                  <li>• 历史观测数据</li>
                  <li>• 设计参数约束</li>
                  <li>• 精度指标要求</li>
                  <li>• 可靠性约束</li>
                </ul>
              </div>
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

export default Section5NonlinearSolveStep6