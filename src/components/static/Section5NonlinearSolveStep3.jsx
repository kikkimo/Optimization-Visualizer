import React, { useState, useEffect, useRef } from 'react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

const Section5NonlinearSolveStep3 = () => {
  const [targetY, setTargetY] = useState(50) // 目标函数值
  const [initialX, setInitialX] = useState(80) // 初始猜测值
  const [isAnimating, setIsAnimating] = useState(false)
  const [iterations, setIterations] = useState([])
  const [currentIteration, setCurrentIteration] = useState(0)
  const canvasRef = useRef(null)
  const animationRef = useRef(null)

  // 原函数 f(x) = 15*e^(0.06*x - 1.5) - 15*e^(-1.5) - targetY
  const f = (x, target = 0) => 15 * Math.exp(0.06 * x - 1.5) - 15 * Math.exp(-1.5) - target
  
  // 导数 f'(x) = 15 * 0.06 * e^(0.06*x - 1.5) = 0.9 * e^(0.06*x - 1.5)
  const fPrime = (x) => 0.9 * Math.exp(0.06 * x - 1.5)

  // 牛顿迭代函数
  const newtonStep = (x, target) => {
    const fx = f(x, target)
    const fpx = fPrime(x)
    if (Math.abs(fpx) < 1e-10) return x // 避免除零
    return x - fx / fpx
  }

  // 计算完整的迭代序列
  const calculateIterations = (x0, target, maxIter = 20, tolerance = 1e-6) => {
    const steps = []
    let x = x0
    
    for (let i = 0; i < maxIter; i++) {
      const fx = f(x, target)
      const fpx = fPrime(x)
      
      steps.push({
        iteration: i,
        x: x,
        fx: fx,
        fpx: fpx,
        converged: Math.abs(fx) < tolerance
      })
      
      if (Math.abs(fx) < tolerance) break
      
      x = newtonStep(x, target)
      
      // 防止发散
      if (Math.abs(x) > 200) break
    }
    
    return steps
  }

  // 绘制函数和迭代过程
  const drawVisualization = (canvas, steps, currentStep) => {
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)
    
    const margin = 60
    const chartWidth = width - 2 * margin
    const chartHeight = height - 2 * margin
    
    // 坐标范围
    const xMin = 0, xMax = 120
    const yMin = -100, yMax = 200
    
    const xToCanvas = (x) => margin + ((x - xMin) / (xMax - xMin)) * chartWidth
    const yToCanvas = (y) => margin + chartHeight - ((y - yMin) / (yMax - yMin)) * chartHeight
    
    // 绘制坐标轴
    ctx.strokeStyle = '#666'
    ctx.lineWidth = 2
    
    // x轴
    const xAxisY = yToCanvas(0)
    ctx.beginPath()
    ctx.moveTo(margin, xAxisY)
    ctx.lineTo(width - margin - 10, xAxisY)
    ctx.stroke()
    
    // x轴箭头
    ctx.beginPath()
    ctx.moveTo(width - margin, xAxisY)
    ctx.lineTo(width - margin - 10, xAxisY - 5)
    ctx.lineTo(width - margin - 10, xAxisY + 5)
    ctx.closePath()
    ctx.fillStyle = '#666'
    ctx.fill()
    
    // y轴
    ctx.beginPath()
    ctx.moveTo(xToCanvas(0), height - margin)
    ctx.lineTo(xToCanvas(0), margin + 10)
    ctx.stroke()
    
    // y轴箭头
    ctx.beginPath()
    ctx.moveTo(xToCanvas(0), margin)
    ctx.lineTo(xToCanvas(0) - 5, margin + 10)
    ctx.lineTo(xToCanvas(0) + 5, margin + 10)
    ctx.closePath()
    ctx.fill()
    
    // 坐标轴标签
    ctx.fillStyle = '#E8EAED'
    ctx.font = '14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('x', width - margin + 15, xAxisY + 5)
    ctx.fillText('y', xToCanvas(0) - 15, margin - 5)
    
    // 绘制网格
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 0.5
    ctx.setLineDash([2, 2])
    
    // 垂直网格线
    for (let x = 0; x <= xMax; x += 20) {
      ctx.beginPath()
      ctx.moveTo(xToCanvas(x), margin)
      ctx.lineTo(xToCanvas(x), height - margin)
      ctx.stroke()
    }
    
    // 水平网格线
    for (let y = -100; y <= 200; y += 50) {
      ctx.beginPath()
      ctx.moveTo(margin, yToCanvas(y))
      ctx.lineTo(width - margin, yToCanvas(y))
      ctx.stroke()
    }
    
    ctx.setLineDash([])
    
    // 绘制原函数曲线 f(x) = 15*e^(0.06*x - 1.5) - 15*e^(-1.5)
    ctx.strokeStyle = '#00d4ff'
    ctx.lineWidth = 2
    ctx.beginPath()
    
    for (let x = xMin; x <= xMax; x += 0.5) {
      const originalY = 15 * Math.exp(0.06 * x - 1.5) - 15 * Math.exp(-1.5)
      const canvasX = xToCanvas(x)
      const canvasY = yToCanvas(originalY)
      
      if (x === xMin) {
        ctx.moveTo(canvasX, canvasY)
      } else {
        ctx.lineTo(canvasX, canvasY)
      }
    }
    ctx.stroke()
    
    // 绘制目标水平线
    ctx.strokeStyle = '#ff6b6b'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(margin, yToCanvas(targetY))
    ctx.lineTo(width - margin, yToCanvas(targetY))
    ctx.stroke()
    ctx.setLineDash([])
    
    // 目标线标签
    ctx.fillStyle = '#ff6b6b'
    ctx.font = '12px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(`目标值: ${targetY}`, margin + 10, yToCanvas(targetY) - 10)
    
    // 绘制迭代过程
    if (steps.length > 0 && currentStep >= 0) {
      for (let i = 0; i <= Math.min(currentStep, steps.length - 1); i++) {
        const step = steps[i]
        const x = step.x
        const fx = f(x, targetY)
        const fpx = step.fpx
        
        // 当前点
        ctx.fillStyle = i === currentStep ? '#ff4757' : '#ffa502'
        ctx.beginPath()
        ctx.arc(xToCanvas(x), yToCanvas(fx + targetY), 6, 0, 2 * Math.PI)
        ctx.fill()
        
        // 绘制切线（只显示当前步骤）
        if (i === currentStep && i < steps.length - 1) {
          const tangentStart = x - 30
          const tangentEnd = x + 30
          const tangentYStart = fx + fpx * (tangentStart - x)
          const tangentYEnd = fx + fpx * (tangentEnd - x)
          
          ctx.strokeStyle = '#26de81'
          ctx.lineWidth = 2
          ctx.setLineDash([3, 3])
          ctx.beginPath()
          ctx.moveTo(xToCanvas(tangentStart), yToCanvas(tangentYStart + targetY))
          ctx.lineTo(xToCanvas(tangentEnd), yToCanvas(tangentYEnd + targetY))
          ctx.stroke()
          ctx.setLineDash([])
          
          // 切线与目标线的交点（下一个迭代点）
          if (i + 1 < steps.length) {
            const nextX = steps[i + 1].x
            ctx.fillStyle = '#26de81'
            ctx.beginPath()
            ctx.arc(xToCanvas(nextX), yToCanvas(targetY), 4, 0, 2 * Math.PI)
            ctx.fill()
            
            // 垂直虚线
            ctx.strokeStyle = '#26de81'
            ctx.setLineDash([2, 2])
            ctx.beginPath()
            ctx.moveTo(xToCanvas(nextX), yToCanvas(targetY))
            ctx.lineTo(xToCanvas(nextX), yToCanvas(f(nextX, targetY) + targetY))
            ctx.stroke()
            ctx.setLineDash([])
          }
        }
        
        // 标注迭代次数
        ctx.fillStyle = '#E8EAED'
        ctx.font = '10px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(`${i}`, xToCanvas(x), yToCanvas(fx + targetY) - 10)
      }
    }
  }

  // 开始动画
  const startAnimation = () => {
    if (isAnimating) return
    
    setIsAnimating(true)
    setCurrentIteration(0)
    
    const steps = calculateIterations(initialX, targetY)
    setIterations(steps)
    
    let frame = 0
    const animate = () => {
      if (frame < steps.length) {
        setCurrentIteration(frame)
        if (canvasRef.current) {
          drawVisualization(canvasRef.current, steps, frame)
        }
        frame++
        animationRef.current = setTimeout(animate, 1500) // 1.5秒间隔
      } else {
        setIsAnimating(false)
      }
    }
    
    animate()
  }

  // 停止动画
  const stopAnimation = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current)
    }
    setIsAnimating(false)
  }

  // 重置
  const resetAnimation = () => {
    stopAnimation()
    setCurrentIteration(0)
    setIterations([])
    if (canvasRef.current) {
      drawVisualization(canvasRef.current, [], -1)
    }
  }

  // 初始绘制
  useEffect(() => {
    if (canvasRef.current) {
      drawVisualization(canvasRef.current, iterations, currentIteration)
    }
  }, [targetY, initialX, iterations, currentIteration])

  // 清理动画
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="h-full flex flex-col px-6 py-4">
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full">
        
        {/* 公式展示区域 */}
        <div className="mb-4 p-3 rounded-xl" style={{
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%)',
          border: '1px solid rgba(14, 165, 233, 0.2)'
        }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-center">
            <div>
              <h4 className="text-xs font-semibold mb-1" style={{ color: 'var(--ink-high)' }}>原函数</h4>
              <div className="text-sm">
                <BlockMath>{'f(x) = 15e^{0.06x - 1.5} - 15e^{-1.5}'}</BlockMath>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold mb-1" style={{ color: 'var(--ink-high)' }}>一阶导数</h4>
              <div className="text-sm">
                <BlockMath>{"f'(x) = 0.9e^{0.06x - 1.5}"}</BlockMath>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold mb-1" style={{ color: 'var(--ink-high)' }}>牛顿迭代公式</h4>
              <div className="text-sm">
                <BlockMath>{'x_{k+1} = x_k - \\frac{f(x_k) - y_{target}}{f\'(x_k)}'}</BlockMath>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容区域：左右布局 */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
          
          {/* 左侧：可视化区域 */}
          <div className="lg:col-span-2 p-3 rounded-xl backdrop-blur-sm relative min-h-0" style={{
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%)',
            border: '1px solid rgba(14, 165, 233, 0.2)'
          }}>
            <canvas
              ref={canvasRef}
              width={800}
              height={400}
              className="w-full h-full border rounded"
              style={{
                borderColor: 'rgba(14, 165, 233, 0.3)',
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 58, 138, 0.15) 100%)'
              }}
            />
            
            {/* 迭代信息覆盖层 */}
            {iterations.length > 0 && currentIteration < iterations.length && (
              <div className="absolute top-4 left-4 p-3 rounded bg-black/70 text-white text-sm">
                <div>迭代次数: {currentIteration}</div>
                <div>当前 x: {iterations[currentIteration]?.x?.toFixed(4)}</div>
                <div>函数值: {(iterations[currentIteration]?.fx + targetY)?.toFixed(4)}</div>
                <div>误差: {Math.abs(iterations[currentIteration]?.fx)?.toFixed(6)}</div>
                {iterations[currentIteration]?.converged && (
                  <div className="text-green-400 font-bold">已收敛！</div>
                )}
              </div>
            )}
          </div>

          {/* 右侧：控制面板和说明 */}
          <div className="flex flex-col space-y-4">
            
            {/* 控制面板 */}
            <div className="p-4 rounded-xl" style={{
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%)',
              border: '1px solid rgba(14, 165, 233, 0.2)'
            }}>
              <h3 className="text-lg font-semibold mb-3 text-center" style={{ color: 'rgba(14, 165, 233, 0.9)' }}>
                参数控制
              </h3>
              
              {/* 参数设置 */}
              <div className="space-y-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium block" style={{ color: 'var(--ink-mid)' }}>
                    目标值: {targetY}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="150"
                    step="1"
                    value={targetY}
                    onChange={(e) => setTargetY(parseFloat(e.target.value))}
                    className="w-full slider"
                    disabled={isAnimating}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium block" style={{ color: 'var(--ink-mid)' }}>
                    初始值: {initialX}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="110"
                    step="1"
                    value={initialX}
                    onChange={(e) => setInitialX(parseFloat(e.target.value))}
                    className="w-full slider"
                    disabled={isAnimating}
                  />
                </div>
              </div>
              
              {/* 控制按钮 */}
              <div className="flex flex-col space-y-3">
                <button
                  onClick={startAnimation}
                  disabled={isAnimating}
                  className="w-full px-4 py-2 rounded-lg font-medium transition-all"
                  style={{
                    background: isAnimating ? 'rgba(107, 114, 128, 0.5)' : 'rgba(34, 197, 94, 0.2)',
                    border: '1px solid rgba(34, 197, 94, 0.5)',
                    color: isAnimating ? '#9CA3AF' : '#10B981'
                  }}
                >
                  {isAnimating ? '动画中...' : '开始迭代'}
                </button>
                
                <div className="flex space-x-3">
                  <button
                    onClick={stopAnimation}
                    disabled={!isAnimating}
                    className="flex-1 px-4 py-2 rounded-lg font-medium transition-all"
                    style={{
                      background: !isAnimating ? 'rgba(107, 114, 128, 0.5)' : 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.5)',
                      color: !isAnimating ? '#9CA3AF' : '#EF4444'
                    }}
                  >
                    停止
                  </button>
                  
                  <button
                    onClick={resetAnimation}
                    className="flex-1 px-4 py-2 rounded-lg font-medium transition-all"
                    style={{
                      background: 'rgba(14, 165, 233, 0.2)',
                      border: '1px solid rgba(14, 165, 233, 0.5)',
                      color: '#0EA5E9'
                    }}
                  >
                    重置
                  </button>
                </div>
              </div>
            </div>

            {/* 说明文字 */}
            <div className="p-3 rounded-lg" style={{
              background: 'rgba(14, 165, 233, 0.05)',
              border: '1px solid rgba(14, 165, 233, 0.2)'
            }}>
              <h4 className="text-sm font-semibold mb-2 text-center" style={{ color: 'var(--ink-high)' }}>
                图例说明
              </h4>
              <div className="space-y-2 text-xs" style={{ color: 'var(--ink-mid)' }}>
                <div className="flex items-center">
                  <span className="text-cyan-400 mr-2">——</span>
                  <span>原函数曲线</span>
                </div>
                <div className="flex items-center">
                  <span className="text-red-400 mr-2">- - -</span>
                  <span>目标水平线</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-400 mr-2">- - -</span>
                  <span>切线逼近</span>
                </div>
                <div className="flex items-center">
                  <span className="text-orange-400 mr-2">●</span>
                  <span>迭代点序列</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #0EA5E9;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(14, 165, 233, 0.5);
        }
        
        .slider::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #0EA5E9;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(14, 165, 233, 0.5);
          border: none;
        }

        .slider {
          height: 4px;
          background: rgba(107, 114, 128, 0.3);
          border-radius: 2px;
          appearance: none;
        }
      `}</style>
    </div>
  )
}

export default Section5NonlinearSolveStep3