import React, { useState, useRef, useEffect } from 'react';
import DownHint from './DownHint';

export default function Section6Registration({ id }) {
  const [mode, setMode] = useState('before');
  const [splitPosition, setSplitPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const leftImage = mode === 'before' 
    ? '/assets/registration/before_left.jpg'
    : '/assets/registration/after_left.jpg';
  
  const rightImage = mode === 'before'
    ? '/assets/registration/before_right.jpg'
    : '/assets/registration/after_right.jpg';

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

  return (
    <section
      id={id}
      className="snap-section relative flex flex-col items-center justify-center overflow-hidden px-8"
    >
      <div className="w-full max-w-5xl mx-auto">
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