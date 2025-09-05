import React from 'react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

const Section5NonlinearSolveStep4 = () => {
  return (
    <div className="h-full w-full flex flex-col gap-4 relative p-4">
      {/* 标题区域 */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--ink-high)' }}>
          梯度与雅可比矩阵
        </h2>
        <p className="text-lg" style={{ color: 'var(--ink-mid)' }}>
          牛顿法的数学基础：矩阵求导与局部线性化
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
              矩阵求导的重要性
            </h3>
            
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
              要应用牛顿法及其变体（如高斯-牛顿法），我们必须能够计算函数的<strong>梯度 (Gradient)</strong> 和<strong>雅可比矩阵 (Jacobian Matrix)</strong>。这需要掌握基本的矩阵求导规则。
            </p>
            
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)' }}>
              <p className="text-base leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                矩阵求导的核心是<strong>将多元微积分的求导法则，用矩阵和向量的形式进行简洁地组织和表达</strong>。掌握梯度和雅可比矩阵的计算，是应用现代优化算法解决非线性问题的必备前提。
              </p>
            </div>
          </div>

          {/* 梯度部分 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(6, 182, 212, 0.08)',
            borderColor: 'rgba(6, 182, 212, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              1. 梯度 (Gradient)：标量函数对向量求导
            </h3>
            
            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
              <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                定义与表达式
              </h4>
              
              <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
                给定一个函数 <InlineMath math="y = f(\vec{x})" />，其中 <InlineMath math="y" /> 是标量，<InlineMath math="\vec{x} = (x_1, \dots, x_n)^T" /> 是 n 维列向量。
              </p>
              
              <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
                <InlineMath math="f" /> 对 <InlineMath math="\vec{x}" /> 的梯度 <InlineMath math="\nabla f(\vec{x})" /> 是一个<strong>列向量</strong>，由所有偏导数构成：
              </p>
              
              <div className="text-center my-6">
                <BlockMath math="\nabla f(\vec{x}) = \frac{\partial f}{\partial \vec{x}} = \begin{pmatrix} \partial f / \partial x_1 \\ \partial f / \partial x_2 \\ \vdots \\ \partial f / \partial x_n \end{pmatrix}" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 几何意义 */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)', border: '1px solid' }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  几何意义
                </h4>
                <ul className="text-sm space-y-2" style={{ color: 'var(--ink-mid)' }}>
                  <li>• 梯度向量指向函数值<strong>上升最快</strong>的方向</li>
                  <li>• 负梯度 <InlineMath math="-\nabla f(\vec{x})" /> 是下降最快的方向</li>
                  <li>• 这是梯度下降法的理论基础</li>
                  <li>• 梯度的模长表示变化率的大小</li>
                </ul>
              </div>

              {/* 示例 */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', borderColor: 'rgba(168, 85, 247, 0.3)', border: '1px solid' }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  经典示例
                </h4>
                <p className="text-sm mb-3" style={{ color: 'var(--ink-mid)' }}>
                  对于二次函数：
                </p>
                <div className="text-center mb-2">
                  <BlockMath math="\phi(\vec{x}) = \frac{1}{2}\vec{x}^T A \vec{x} - \vec{b}^T \vec{x}" />
                </div>
                <p className="text-sm mb-2" style={{ color: 'var(--ink-mid)' }}>
                  其梯度为（假设A对称）：
                </p>
                <div className="text-center">
                  <BlockMath math="\nabla\phi(\vec{x}) = A\vec{x} - \vec{b}" />
                </div>
              </div>
            </div>
          </div>

          {/* 雅可比矩阵部分 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(30, 58, 138, 0.08)',
            borderColor: 'rgba(30, 58, 138, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              2. 雅可比矩阵 (Jacobian Matrix)：向量函数对向量求导
            </h3>
            
            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'rgba(30, 58, 138, 0.1)' }}>
              <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                定义与结构
              </h4>
              
              <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
                给定一个函数 <InlineMath math="\vec{y} = \vec{f}(\vec{x})" />，其中 <InlineMath math="\vec{y} = (y_1, \dots, y_m)^T" /> 是 m 维向量，<InlineMath math="\vec{x} = (x_1, \dots, x_n)^T" /> 是 n 维向量。
              </p>
              
              <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--ink-mid)' }}>
                <InlineMath math="\vec{f}" /> 对 <InlineMath math="\vec{x}" /> 的雅可比矩阵 <InlineMath math="J_{\vec{f}}(\vec{x})" /> 是一个 <strong>m × n 的矩阵</strong>。它的<strong>第 i 行</strong>是输出分量 <InlineMath math="y_i" /> 对输入向量 <InlineMath math="\vec{x}" /> 的<strong>梯度转置</strong>。
              </p>
              
              <div className="text-center my-6">
                <BlockMath math="J_{\vec{f}}(\vec{x}) = \frac{\partial \vec{f}}{\partial \vec{x}} = \left[ \begin{array}{cccc}
                  \frac{\partial y_1}{\partial x_1} & \frac{\partial y_1}{\partial x_2} & \cdots & \frac{\partial y_1}{\partial x_n} \\
                  \frac{\partial y_2}{\partial x_1} & \frac{\partial y_2}{\partial x_2} & \cdots & \frac{\partial y_2}{\partial x_n} \\
                  \vdots & \vdots & \ddots & \vdots \\
                  \frac{\partial y_m}{\partial x_1} & \frac{\partial y_m}{\partial x_2} & \cdots & \frac{\partial y_m}{\partial x_n}
                \end{array} \right]" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 几何意义 */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)', border: '1px solid' }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  几何意义
                </h4>
                <ul className="text-sm space-y-2" style={{ color: 'var(--ink-mid)' }}>
                  <li>• 多维空间中的<strong>最佳局部线性近似</strong></li>
                  <li>• 描述输入微小变化对输出的影响</li>
                  <li>• 牛顿法进行线性化的数学基础</li>
                  <li>• 泰勒展开中的一阶项系数矩阵</li>
                </ul>
              </div>

              {/* 特殊情况 */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', border: '1px solid' }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  特殊情况
                </h4>
                <div className="text-sm space-y-2" style={{ color: 'var(--ink-mid)' }}>
                  <div>
                    <strong>当 m = 1 时：</strong><br/>
                    雅可比矩阵退化为梯度的转置
                  </div>
                  <div>
                    <strong>当 n = m 时：</strong><br/>
                    雅可比矩阵是方阵，其行列式称为雅可比行列式
                  </div>
                  <div>
                    <strong>线性函数：</strong><br/>
                    雅可比矩阵就是系数矩阵，处处相等
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 应用与总结 */}
          <div className="p-6 rounded-2xl border" style={{
            backgroundColor: 'rgba(14, 165, 233, 0.08)',
            borderColor: 'rgba(14, 165, 233, 0.25)'
          }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-high)' }}>
              3. 在优化算法中的应用
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 梯度下降法 */}
              <div className="p-5 rounded-lg border" style={{ 
                backgroundColor: 'rgba(14, 165, 233, 0.1)', 
                borderColor: 'rgba(14, 165, 233, 0.3)' 
              }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  梯度下降法
                </h4>
                <ul className="text-sm space-y-2" style={{ color: 'var(--ink-mid)' }}>
                  <li>• 利用负梯度方向进行迭代</li>
                  <li>• <InlineMath math="\vec{x}_{k+1} = \vec{x}_k - \alpha \nabla f(\vec{x}_k)" /></li>
                  <li>• 适用于标量目标函数的优化</li>
                </ul>
              </div>

              {/* 牛顿法 */}
              <div className="p-5 rounded-lg border" style={{ 
                backgroundColor: 'rgba(6, 182, 212, 0.1)', 
                borderColor: 'rgba(6, 182, 212, 0.3)' 
              }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  多维牛顿法
                </h4>
                <ul className="text-sm space-y-2" style={{ color: 'var(--ink-mid)' }}>
                  <li>• 使用雅可比矩阵进行局部线性化</li>
                  <li>• 求解线性方程组 <InlineMath math="J \Delta \vec{x} = -\vec{f}" /></li>
                  <li>• 适用于求解非线性方程组</li>
                </ul>
              </div>

              {/* 高斯-牛顿法 */}
              <div className="p-5 rounded-lg border" style={{ 
                backgroundColor: 'rgba(168, 85, 247, 0.1)', 
                borderColor: 'rgba(168, 85, 247, 0.3)' 
              }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                  高斯-牛顿法
                </h4>
                <ul className="text-sm space-y-2" style={{ color: 'var(--ink-mid)' }}>
                  <li>• 结合梯度和雅可比矩阵</li>
                  <li>• 近似海塞矩阵：<InlineMath math="H \approx J^T J" /></li>
                  <li>• 适用于非线性最小二乘问题</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                关键洞察
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
                梯度和雅可比矩阵是现代优化理论的数学基石。它们将复杂的<strong>多维非线性问题</strong>转化为<strong>线性代数问题</strong>，使得我们能够用成熟的矩阵运算来设计高效的迭代算法。掌握这些概念，就掌握了从理论到实践的关键桥梁。
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

export default Section5NonlinearSolveStep4