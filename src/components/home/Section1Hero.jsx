import React, { useEffect, useRef } from 'react';
import HeroFieldCanvas from './HeroFieldCanvas';
import DownHint from '../shared/DownHint';

export default function Section1Hero({ id }) {
  const sectionRef = useRef(null);

  const handleExploreClick = () => {
    const section2 = document.getElementById('section-1');
    if (section2) {
      section2.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id={id}
      ref={sectionRef}
      className="snap-section relative flex items-center justify-center overflow-hidden"
    >
      {/* 背景Canvas */}
      <div className="absolute inset-0 z-0">
        <HeroFieldCanvas />
      </div>

      {/* 主内容 */}
      <div className="relative z-10 text-center px-8 max-w-5xl mx-auto">
        <h1 
          className="mb-8"
          style={{
            fontSize: 'clamp(40px, 6vw, 96px)',
            letterSpacing: '-0.5%',
            lineHeight: 'var(--leading-tight)'
          }}
        >
          <span className="block font-extrabold mb-2" 
                style={{ 
                  background: 'linear-gradient(135deg, #3CE6C0, #F5B248)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
            数学优化问题
          </span>
          <span className="block font-bold opacity-90" 
                style={{ 
                  color: 'var(--ink-high)',
                  fontSize: 'clamp(18px, 3vw, 36px)'
                }}>
            及其在测绘领域的应用
          </span>
        </h1>

        <button
          onClick={handleExploreClick}
          data-primary="true"
          className="group relative px-8 py-4 font-semibold text-lg rounded-lg transition-all duration-300"
          style={{
            backgroundColor: 'var(--tech-mint)',
            color: 'var(--bg-deep)',
            boxShadow: '0 4px 14px 0 rgba(60, 230, 192, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--ink-high)';
            e.currentTarget.style.boxShadow = 'var(--shadow-glow-mint)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--tech-mint)';
            e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(60, 230, 192, 0.3)';
          }}
          aria-label="开始探索数学优化问题"
        >
          开始探索
        </button>

      </div>

      {/* 底部提示 */}
      <DownHint targetSection={1} />
    </section>
  );
}