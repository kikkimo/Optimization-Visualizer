import React, { useEffect, useRef, useState } from 'react';
import BridgeFieldCanvas from './BridgeFieldCanvas';
import DownHint from './DownHint';

export default function Section2Bridge({ id }) {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id={id}
      ref={sectionRef}
      className="snap-section relative flex items-center justify-center overflow-hidden"
    >
      {/* 背景Canvas - 线网过渡 */}
      <div className="absolute inset-0 z-0">
        <BridgeFieldCanvas isActive={isVisible} />
      </div>

      {/* 主内容 */}
      <div className="relative z-10 text-center px-8 max-w-6xl mx-auto">
        <h2 
          className={`mb-4 font-bold transition-all duration-700 transform
                     ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
          style={{
            fontSize: 'clamp(28px, 4vw, 56px)',
            letterSpacing: '-0.5%',
            color: 'var(--ink-high)'
          }}
        >
          优化无处不在
        </h2>
        
        <p 
          className={`text-xl mb-12 transition-all duration-700 delay-200 transform
                     ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
          style={{ color: 'var(--ink-mid)' }}
        >
          让我们从两个例子开始理解优化问题
        </p>

        {/* 示例卡片 */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* TSP 卡片 */}
          <div 
            className={`group relative p-6 rounded-lg transition-all duration-500 delay-300
                       ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--carbon-line)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--tech-mint)';
              e.currentTarget.style.boxShadow = 'var(--shadow-glow-mint)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--carbon-line)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div className="mb-4">
              <svg className="w-12 h-12" style={{ color: 'var(--tech-mint)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
              外卖员最佳配送路径
            </h3>
            <p className="text-sm" style={{ color: 'var(--ink-mid)' }}>
              TSP问题：如何规划最短的配送路线
            </p>
          </div>

          {/* 最短路径卡片 */}
          <div 
            className={`group relative p-6 rounded-lg transition-all duration-500 delay-400
                       ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--carbon-line)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--amber-signal)';
              e.currentTarget.style.boxShadow = 'var(--shadow-glow-amber)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--carbon-line)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div className="mb-4">
              <svg className="w-12 h-12" style={{ color: 'var(--amber-signal)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
              出行导航最短路径
            </h3>
            <p className="text-sm" style={{ color: 'var(--ink-mid)' }}>
              图论算法：城市道路网络中的最优路线
            </p>
          </div>
        </div>

        <p className={`mt-12 transition-all duration-700 delay-500
                      ${isVisible ? 'opacity-100' : 'opacity-0'}`}
           style={{ color: 'var(--ink-mid)' }}>
          向下滚动，看看一个具体例子
        </p>
      </div>

      {/* 底部提示 */}
      <DownHint targetSection={2} text="查看TSP示例" />
    </section>
  );
}