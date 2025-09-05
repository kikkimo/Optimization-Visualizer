import React, { useState, useEffect, useRef } from 'react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

const Section5NonlinearSolveStep1 = () => {
  const [xValue, setXValue] = useState(25)
  const leftCanvasRef = useRef(null)
  const rightCanvasRef = useRef(null)

  // 左侧函数 f1(x) = x
  const f1 = (x) => x

  // 右侧函数 f2(x) = 15*e^(0.06*x - 1.5) - 15*e^(-1.5)
  const f2 = (x) => 15 * Math.exp(0.06 * x - 1.5) - 15 * Math.exp(-1.5)

  // 绘制坐标系和曲线
  const drawChart = (canvas, func, mainPoint, ghostPoint) => {
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    
    // 清空画布
    ctx.clearRect(0, 0, width, height)
    
    // 设置坐标系参数
    const margin = 60
    const chartWidth = width - 2 * margin
    const chartHeight = height - 2 * margin
    
    // 计算该函数的 y 轴范围（各自独立的比例）
    const xMax = 100
    const yValues = []
    for (let x = 0; x <= xMax; x += 1) {
      yValues.push(func(x))
    }
    const yMin = Math.min(...yValues)
    const yMax = Math.max(...yValues)
    const yRange = yMax - yMin
    
    // 坐标转换函数
    const xToCanvas = (x) => margin + (x / xMax) * chartWidth
    const yToCanvas = (y) => margin + chartHeight - ((y - yMin) / yRange) * chartHeight
    
    // 绘制坐标轴
    ctx.strokeStyle = '#666'
    ctx.lineWidth = 2
    
    // x轴（带箭头）
    const xAxisY = yToCanvas(Math.max(yMin, 0))
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
    
    // y轴（带箭头）
    ctx.strokeStyle = '#666'
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
    ctx.fillStyle = '#666'
    ctx.fill()
    
    // 坐标轴标签
    ctx.fillStyle = '#E8EAED'
    ctx.font = '16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('x', width - margin + 15, xAxisY + 5)
    ctx.fillText('y', xToCanvas(0) , margin - 10)
    
    // X轴刻度和标签（0, 50, 100）
    ctx.fillStyle = '#E8EAED'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    const xTicks = [0, 50, 100]
    xTicks.forEach(x => {
      const canvasX = xToCanvas(x)
      // 刻度线
      ctx.beginPath()
      ctx.moveTo(canvasX, xAxisY - 5)
      ctx.lineTo(canvasX, xAxisY + 5)
      ctx.stroke()
      // 标签
      ctx.fillText(x.toString(), canvasX, xAxisY + 18)
    })
    
    // Y轴刻度和标签（显示3个点位）
    ctx.textAlign = 'right'
    const yTicks = [yMin, (yMin + yMax) / 2, yMax]
    yTicks.forEach(y => {
      const canvasY = yToCanvas(y)
      // 刻度线
      ctx.beginPath()
      ctx.moveTo(xToCanvas(0) - 5, canvasY)
      ctx.lineTo(xToCanvas(0) + 5, canvasY)
      ctx.stroke()
      // 标签
      ctx.fillText(y.toFixed(1), xToCanvas(0) - 8, canvasY + 4)
    })
    
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
    const yStep = yRange / 5
    for (let i = 0; i <= 5; i++) {
      const y = yMin + i * yStep
      ctx.beginPath()
      ctx.moveTo(margin, yToCanvas(y))
      ctx.lineTo(width - margin, yToCanvas(y))
      ctx.stroke()
    }
    
    ctx.setLineDash([])
    
    // 绘制函数曲线
    ctx.strokeStyle = '#00d4ff'
    ctx.lineWidth = 2
    ctx.beginPath()
    
    for (let x = 0; x <= xMax; x += 0.5) {
      const y = func(x)
      const canvasX = xToCanvas(x)
      const canvasY = yToCanvas(y)
      
      if (x === 0) {
        ctx.moveTo(canvasX, canvasY)
      } else {
        ctx.lineTo(canvasX, canvasY)
      }
    }
    ctx.stroke()
    
    // 绘制主要点（实点）
    ctx.fillStyle = mainPoint.color
    ctx.beginPath()
    ctx.arc(xToCanvas(mainPoint.x), yToCanvas(mainPoint.y), 6, 0, 2 * Math.PI)
    ctx.fill()
    
    // 绘制幽灵点（虚点）
    if (ghostPoint) {
      // 绘制虚点（颜色更淡）
      let ghostFillColor = ghostPoint.color
      if (ghostFillColor === '#ff0000') {
        ghostFillColor = 'rgba(255, 0, 0, 0.3)'
      } else if (ghostFillColor === '#0066ff') {
        ghostFillColor = 'rgba(0, 102, 255, 0.3)'
      }
      
      ctx.fillStyle = ghostFillColor
      ctx.beginPath()
      ctx.arc(xToCanvas(ghostPoint.x), yToCanvas(ghostPoint.y), 5, 0, 2 * Math.PI)
      ctx.fill()
      
      // 绘制虚线边框
      ctx.strokeStyle = ghostPoint.color
      ctx.lineWidth = 2
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.arc(xToCanvas(ghostPoint.x), yToCanvas(ghostPoint.y), 5, 0, 2 * Math.PI)
      ctx.stroke()
      ctx.setLineDash([])
    }
    
  }


  // 更新画布
  useEffect(() => {
    if (leftCanvasRef.current && rightCanvasRef.current) {
      // 计算两个函数在当前 x 值的 y 值
      const y1 = f1(xValue)  // 左侧函数值
      const y2 = f2(xValue)  // 右侧函数值
      
      // 左侧坐标系：实红点（f1） + 虚蓝点（f2）
      const leftMainPoint = { x: xValue, y: y1, color: '#ff0000' }
      const leftGhostPoint = { x: xValue, y: y2, color: '#0066ff' }
      
      // 右侧坐标系：实蓝点（f2） + 虚红点（f1）
      const rightMainPoint = { x: xValue, y: y2, color: '#0066ff' }
      const rightGhostPoint = { x: xValue, y: y1, color: '#ff0000' }
      
      drawChart(leftCanvasRef.current, f1, leftMainPoint, leftGhostPoint)
      drawChart(rightCanvasRef.current, f2, rightMainPoint, rightGhostPoint)
    }
  }, [xValue])

  return (
    <div className="h-full flex flex-col px-6 py-4">
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full">
        <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: 'var(--ink-high)' }}>
          认识非线性函数 - 函数对比演示
        </h2>
        
        {/* 双坐标系容器 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 mb-4 min-h-0">
          {/* 左侧坐标系 */}
          <div className="p-3 rounded-xl backdrop-blur-sm relative flex-1 min-h-0" style={{
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%)',
            border: '1px solid rgba(14, 165, 233, 0.2)'
          }}>
            <canvas
              ref={leftCanvasRef}
              width={400}
              height={300}
              className="w-full h-full border rounded"
              style={{
                borderColor: 'rgba(14, 165, 233, 0.3)',
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 58, 138, 0.15) 100%)'
              }}
            />
            {/* 左侧函数公式覆盖层 */}
            <div className="absolute top-4 right-4 px-2 py-1 text-white">
              <InlineMath>{'f_1(x) = x'}</InlineMath>
            </div>
          </div>

          {/* 右侧坐标系 */}
          <div className="p-3 rounded-xl backdrop-blur-sm relative flex-1 min-h-0" style={{
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%)',
            border: '1px solid rgba(14, 165, 233, 0.2)'
          }}>
            <canvas
              ref={rightCanvasRef}
              width={400}
              height={300}
              className="w-full h-full border rounded"
              style={{
                borderColor: 'rgba(14, 165, 233, 0.3)',
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 58, 138, 0.15) 100%)'
              }}
            />
            {/* 右侧函数公式覆盖层 */}
            <div className="absolute top-4 right-4 px-2 py-1 text-white">
              <InlineMath>{'f_2(x) = 15e^{0.06x - 1.5} - 15e^{-1.5}'}</InlineMath>
            </div>
          </div>
        </div>

        {/* 滑动条控制 */}
        <div className="p-4 rounded-xl backdrop-blur-sm" style={{
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%)',
          border: '1px solid rgba(14, 165, 233, 0.2)'
        }}>
          <h3 className="text-lg font-semibold mb-3 text-center" style={{ color: 'rgba(14, 165, 233, 0.9)' }}>
            参数控制
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium min-w-20" style={{ color: 'var(--ink-mid)' }}>
                x 值:
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={xValue}
                onChange={(e) => setXValue(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="min-w-16 text-sm font-mono" style={{ color: 'var(--ink-high)' }}>
                {xValue}
              </span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 rounded-lg" style={{
                background: 'rgba(14, 165, 233, 0.1)',
                border: '1px solid rgba(14, 165, 233, 0.3)'
              }}>
                <div className="text-sm" style={{ color: 'rgba(14, 165, 233, 0.7)' }}>左侧函数值</div>
                <div className="text-lg text-red-400">
                  <InlineMath>{`f_1(${xValue}) = ${f1(xValue).toFixed(2)}`}</InlineMath>
                </div>
              </div>
              <div className="text-center p-3 rounded-lg" style={{
                background: 'rgba(14, 165, 233, 0.1)',
                border: '1px solid rgba(14, 165, 233, 0.3)'
              }}>
                <div className="text-sm" style={{ color: 'rgba(14, 165, 233, 0.7)' }}>右侧函数值</div>
                <div className="text-lg text-blue-400">
                  <InlineMath>{`f_2(${xValue}) = ${f2(xValue).toFixed(2)}`}</InlineMath>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 说明文字 */}
        <div className="mt-2 p-3 rounded-lg" style={{
          background: 'rgba(14, 165, 233, 0.05)',
          border: '1px solid rgba(14, 165, 233, 0.2)'
        }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-center" style={{ color: 'var(--ink-mid)' }}>
            <div>
              <span className="text-red-400">●</span> 实红点：线性函数值
            </div>
            <div>
              <span className="text-blue-400">●</span> 实蓝点：指数函数值
            </div>
            <div>
              <span className="text-red-400">◯</span> 虚红点：对应函数在相同x的值
            </div>
            <div>
              <span className="text-blue-400">◯</span> 虚蓝点：对应函数在相同x的值
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #00d4ff;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #00d4ff;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
          border: none;
        }
      `}</style>
    </div>
  )
}

export default Section5NonlinearSolveStep1