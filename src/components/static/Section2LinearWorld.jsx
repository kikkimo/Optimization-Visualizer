import React from 'react'
import DownHint from '../shared/DownHint'

const Section2LinearWorld = ({ id, currentSection, totalSections }) => {
  return (
    <section
      id={id}
      className="snap-section relative flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: 'var(--bg-deep)' }}
    >
      {/* 背景动画 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-deep)]">
        {/* 线性网格背景 */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.3]" viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="linearGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: 'rgb(147, 51, 234)', stopOpacity: 0.4 }} />
            </linearGradient>
            <pattern id="linearGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1"/>
            </pattern>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#linearGrid)" />
          
          {/* 线性直线 */}
          <line x1="0" y1="600" x2="1400" y2="200" 
                stroke="url(#linearGradient)" 
                strokeWidth="4"
                className="animate-pulse" />
          <line x1="0" y1="200" x2="1400" y2="600" 
                stroke="url(#linearGradient)" 
                strokeWidth="3"
                className="animate-pulse"
                style={{ animationDelay: '1s' }} />
          
          {/* 矩阵表示 */}
          <text x="100" y="150" fontSize="36" fill="rgba(59, 130, 246, 0.5)" className="animate-pulse">Ax = b</text>
          <text x="1200" y="700" fontSize="32" fill="rgba(147, 51, 234, 0.5)" className="animate-pulse">y = mx + c</text>
        </svg>
        
        {/* 浮动线性代数符号 */}
        <div className="absolute inset-0 opacity-[0.25]">
          <div className="floating-math-symbol absolute top-[15%] left-[15%] text-5xl text-blue-400 animate-math-float">A</div>
          <div className="floating-math-symbol absolute top-[70%] right-[10%] text-4xl text-purple-400 animate-math-float" style={{ animationDelay: '2s' }}>x</div>
          <div className="floating-math-symbol absolute bottom-[40%] left-[25%] text-6xl text-indigo-400 animate-math-float" style={{ animationDelay: '4s' }}>∑</div>
          <div className="floating-math-symbol absolute top-[50%] right-[30%] text-3xl text-cyan-400 animate-math-float" style={{ animationDelay: '6s' }}>det</div>
        </div>
      </div>
      
      {/* 主要内容 */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center space-y-8">
            <h1 className="text-5xl font-bold" style={{ color: 'var(--ink-high)' }}>
              线性世界
            </h1>
            <p className="text-xl italic" style={{ color: 'var(--ink-mid)' }}>
              The Linear World
            </p>
            <p className="text-lg max-w-4xl mx-auto leading-relaxed" style={{ color: 'var(--ink-high)' }}>
              线性代数是现代数学和工程的基石。在线性世界中，叠加原理成立，
              问题可以分解为更简单的组成部分。从图像处理中的滤波器到机器学习中的特征变换，
              线性变换无处不在，为我们理解和操作多维数据提供了强大的工具。
            </p>
            
            {/* 占位内容区域 */}
            <div className="mt-16 p-8 rounded-xl border" style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--carbon-line)'
            }}>
              <p className="text-lg" style={{ color: 'var(--ink-mid)' }}>
                内容开发中...
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--ink-low)' }}>
                这里将展示线性变换、矩阵运算、向量空间等核心概念及其应用
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 下一页提示 */}
      {currentSection < totalSections - 1 && (
        <DownHint targetSection={2} text="向下滚动到线性系统求解" isStatic={true} />
      )}
      
      {/* CSS 样式 */}
      <style jsx>{`
        @keyframes math-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-12px) rotate(1.5deg); }
          50% { transform: translateY(-6px) rotate(-1deg); }
          75% { transform: translateY(-18px) rotate(0.5deg); }
        }
        
        .animate-math-float {
          animation: math-float 10s ease-in-out infinite;
        }
        
        .floating-math-symbol {
          font-family: 'Times New Roman', serif;
          user-select: none;
          pointer-events: none;
        }
      `}</style>
    </section>
  )
}

export default Section2LinearWorld