import React, { useState, useRef, useEffect } from 'react';
import DownHint from './DownHint';

export default function Section6Registration({ id }) {
  const [mode, setMode] = useState('before');
  const [splitPosition, setSplitPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const leftImage = mode === 'before' 
    ? '/src/assets/registration/before_left.jpg'
    : '/src/assets/registration/after_left.jpg';
  
  const rightImage = mode === 'before'
    ? '/src/assets/registration/before_right.jpg'
    : '/src/assets/registration/after_right.jpg';

  const handleModeChange = (newMode) => {
    if (newMode !== mode) {
      setMode(newMode);
      // 移除 setSplitPosition(50); 保持当前卷帘位置不变
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setSplitPosition(Math.max(0, Math.min(100, percentage)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // 正方形背景动画效果
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let squares = [];
    let gridLines = [];
    let time = 0;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // 初始化正方形
    const initSquares = () => {
      // 格网线位置：垂直线在14.3%, 28.6%, 42.9%, 57.2%, 71.5%, 85.8%
      // 水平线位置：18%, 41.33%, 64.67%, 88%
      const vLines = [0.143, 0.286, 0.429, 0.572, 0.715, 0.858];
      const hLines = [0.18, 0.4133, 0.6467, 0.88];
      
      squares = [
        {
          // 左上格网：竖线1-2，水平线1-2区域
          x: canvas.width * (vLines[0] + 0.02),
          y: canvas.height * (hLines[0] + 0.02),
          vx: 0.3,
          vy: 0.2,
          size: 48,
          borderColor: 'rgba(60, 230, 192, 0.8)',
          minX: canvas.width * vLines[0],
          maxX: canvas.width * vLines[1],
          minY: canvas.height * hLines[0],
          maxY: canvas.height * hLines[1]
        },
        {
          // 右下格网：竖线5-6，水平线3-4区域  
          x: canvas.width * (vLines[4] + 0.02),
          y: canvas.height * (hLines[2] + 0.02),
          vx: -0.25,
          vy: -0.3,
          size: 48,
          borderColor: 'rgba(245, 178, 72, 0.8)',
          minX: canvas.width * vLines[4],
          maxX: canvas.width * vLines[5],
          minY: canvas.height * hLines[2],
          maxY: canvas.height * hLines[3]
        }
      ];
    };

    // 初始化黑客帝国风格格网线
    const initGridLines = () => {
      const vLines = [0.143, 0.286, 0.429, 0.572, 0.715, 0.858];
      const hLines = [0.18, 0.4133, 0.6467, 0.88];
      
      gridLines = [];
      
      // 垂直线
      vLines.forEach((x, i) => {
        gridLines.push({
          type: 'vertical',
          x: canvas.width * x,
          y1: 0,
          y2: canvas.height,
          opacity: 0.3,
          pulseSpeed: Math.random() * 0.8 + 0.2, // 更快的脉动速度
          phase: Math.random() * Math.PI * 2,
          minOpacity: 0.05, // 几乎完全透明
          maxOpacity: Math.random() * 0.15 + 0.1 // 黑客帝国风格低透明度
        });
      });
      
      // 水平线
      hLines.forEach((y, i) => {
        gridLines.push({
          type: 'horizontal',
          x1: 0,
          x2: canvas.width,
          y: canvas.height * y,
          opacity: 0.3,
          pulseSpeed: Math.random() * 0.8 + 0.2, // 更快的脉动速度
          phase: Math.random() * Math.PI * 2,
          minOpacity: 0.05, // 几乎完全透明
          maxOpacity: Math.random() * 0.15 + 0.1 // 黑客帝国风格低透明度
        });
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.05; // 加快时间流逝
      
      // 绘制黑客帝国风格格网线
      gridLines.forEach(line => {
        // 更新透明度（若隐若现效果）
        const pulse = Math.sin(time * line.pulseSpeed + line.phase);
        line.opacity = line.minOpacity + (line.maxOpacity - line.minOpacity) * (pulse + 1) * 0.5;
        
        // 绘制线条 - 使用#00ff41黑客帝国绿色
        ctx.strokeStyle = `rgba(0, 255, 65, ${line.opacity})`;
        ctx.lineWidth = 1;
        ctx.shadowColor = `rgba(0, 255, 65, ${line.opacity * 0.6})`;
        ctx.shadowBlur = 4;
        
        ctx.beginPath();
        if (line.type === 'vertical') {
          ctx.moveTo(line.x, line.y1);
          ctx.lineTo(line.x, line.y2);
        } else {
          ctx.moveTo(line.x1, line.y);
          ctx.lineTo(line.x2, line.y);
        }
        ctx.stroke();
        
        // 清除阴影
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      });
      
      squares.forEach(square => {
        // 更新位置
        square.x += square.vx;
        square.y += square.vy;
        
        // 边界反弹
        if (square.x <= square.minX || square.x + square.size >= square.maxX) {
          square.vx *= -1;
          square.x = Math.max(square.minX, Math.min(square.maxX - square.size, square.x));
        }
        if (square.y <= square.minY || square.y + square.size >= square.maxY) {
          square.vy *= -1;
          square.y = Math.max(square.minY, Math.min(square.maxY - square.size, square.y));
        }
        
        // 绘制透明正方形（仅边框+外发光）
        ctx.strokeStyle = square.borderColor;
        ctx.lineWidth = 1;
        ctx.shadowColor = square.borderColor;
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // 圆角矩形边框
        ctx.beginPath();
        const radius = 12;
        ctx.roundRect(square.x, square.y, square.size, square.size, radius);
        ctx.stroke();
        
        // 清除阴影设置
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initSquares();
    initGridLines();
    window.addEventListener('resize', () => {
      resizeCanvas();
      initSquares();
      initGridLines();
    });
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <section
      id={id}
      className="snap-section relative flex flex-col items-center justify-center overflow-hidden px-8"
    >
      {/* 背景Canvas动画 */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />
      
      {/* 主内容区域 */}
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        {/* 标题 */}
        <h2 className="text-center mb-8 font-bold"
            style={{ 
              fontSize: 'clamp(28px, 4vw, 48px)',
              color: 'var(--ink-high)'
            }}>
          图像配准：前后对比
        </h2>

        {/* 按钮组 */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => handleModeChange('before')}
            aria-pressed={mode === 'before'}
            className="px-6 py-3 font-medium rounded-lg transition-all duration-200"
            style={{
              backgroundColor: mode === 'before' ? 'var(--tech-mint)' : 'var(--bg-elevated)',
              color: mode === 'before' ? 'var(--bg-deep)' : 'var(--ink-mid)',
              border: mode === 'before' ? 'none' : '1px solid var(--carbon-line)'
            }}
          >
            配准前
          </button>
          <button
            onClick={() => handleModeChange('after')}
            aria-pressed={mode === 'after'}
            className="px-6 py-3 font-medium rounded-lg transition-all duration-200"
            style={{
              backgroundColor: mode === 'after' ? 'var(--tech-mint)' : 'var(--bg-elevated)',
              color: mode === 'after' ? 'var(--bg-deep)' : 'var(--ink-mid)',
              border: mode === 'after' ? 'none' : '1px solid var(--carbon-line)'
            }}
          >
            配准后
          </button>
        </div>

        {/* 卷帘对比容器 */}
        <div 
          ref={containerRef}
          className="relative mx-auto overflow-hidden rounded-lg select-none"
          style={{ 
            width: '632px', 
            height: '404px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--carbon-line)'
          }}
        >
          {/* 左侧图片 */}
          <div className="absolute inset-0">
            <img
              src={leftImage}
              alt={`${mode} left`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* 右侧图片（被裁剪） */}
          <div 
            className="absolute inset-0"
            style={{
              clipPath: `polygon(${splitPosition}% 0, 100% 0, 100% 100%, ${splitPosition}% 100%)`
            }}
          >
            <img
              src={rightImage}
              alt={`${mode} right`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* 分割线和把手 */}
          <div
            className="absolute top-0 bottom-0 w-1 cursor-col-resize"
            style={{ 
              left: `${splitPosition}%`, 
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--tech-mint)'
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
          >
            {/* 把手 */}
            <div className="absolute top-1/2 left-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                 style={{
                   transform: 'translate(-50%, -50%)',
                   backgroundColor: 'var(--tech-mint)'
                 }}>
              <svg className="w-6 h-6" style={{ color: 'var(--bg-deep)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8 9l-3 3m0 0l3 3m-3-3h12m-7-3l3-3m0 0l-3-3" />
              </svg>
            </div>

            {/* 百分比显示 */}
            {isDragging && (
              <div className="absolute -top-12 left-1/2 px-3 py-1.5 rounded-md text-sm font-mono"
                   style={{
                     transform: 'translateX(-50%)',
                     backgroundColor: 'var(--bg-elevated)',
                     color: 'var(--ink-high)'
                   }}>
                {splitPosition.toFixed(0)}%
              </div>
            )}
          </div>
        </div>

        {/* 说明文字 */}
        <p className="text-center mt-6 mb-16" style={{ color: 'var(--ink-mid)' }}>
          拖动中线对比左右图像
        </p>
      </div>

      {/* 底部提示 */}
      <DownHint targetSection={6} />
      
    </section>
  );
}