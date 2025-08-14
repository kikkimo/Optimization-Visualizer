import React, { useEffect, useRef, useState } from 'react';

export default function Section5Summary({ id }) {
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

  const handleScrollToTop = () => {
    const section0 = document.getElementById('section-0');
    if (section0) {
      section0.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleMethodHub = () => {
    // 导航到方法Hub页面
    window.location.href = '/method-hub';
  };

  return (
    <section
      id={id}
      ref={sectionRef}
      className="snap-section relative flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: 'var(--bg-deep)' }}
    >
      {/* 主内容 */}
      <div className="relative z-10 text-center px-8 max-w-4xl mx-auto">
        {/* 总结文案 */}
        <div className="space-y-6 mb-12">
          <p className={`text-xl leading-relaxed transition-all duration-700 transform
                       ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
             style={{ color: 'var(--ink-high)' }}>
            从日常的路径规划到复杂的测绘数据处理，
            <span className="inline-block w-2 h-2 mx-2 rounded-full animate-pulse" 
                  style={{ backgroundColor: 'var(--amber-signal)' }} />
          </p>
          
          <p className={`text-xl leading-relaxed transition-all duration-700 delay-200 transform
                       ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
             style={{ color: 'var(--ink-high)' }}>
            数学优化算法为我们提供了寻找最佳解决方案的系统性方法。
            <span className="inline-block w-2 h-2 mx-2 rounded-full animate-pulse" 
                  style={{ backgroundColor: 'var(--amber-signal)', animationDelay: '200ms' }} />
          </p>
          
          <p className={`text-xl leading-relaxed transition-all duration-700 delay-300 transform
                       ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
             style={{ color: 'var(--ink-high)' }}>
            接下来，让我们深入了解这些算法，并探索它们在测绘领域的精彩应用……
            <span className="inline-block w-2 h-2 mx-2 rounded-full animate-pulse" 
                  style={{ backgroundColor: 'var(--amber-signal)', animationDelay: '400ms' }} />
          </p>
        </div>

        {/* CTA 按钮 */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-16
                       transition-all duration-700 delay-500 transform
                       ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <button
            onClick={handleMethodHub}
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
          >
            进入方法 Hub
          </button>

          <button 
            className="underline underline-offset-4 transition-colors duration-200"
            style={{ color: 'var(--ink-mid)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--tech-mint)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ink-mid)'}
          >
            了解更多
          </button>
        </div>

        {/* 页脚快捷链接 */}
        <div className={`flex justify-center gap-6 text-sm transition-all duration-700 delay-700
                       ${isVisible ? 'opacity-100' : 'opacity-0'}`}
             style={{ color: 'var(--ink-mid)' }}>
          <a href="/concept" className="hover:text-[var(--tech-mint)] transition-colors">
            概念页
          </a>
          <span style={{ color: 'var(--carbon-line)' }}>|</span>
          <a href="/method-hub" className="hover:text-[var(--tech-mint)] transition-colors">
            方法 Hub
          </a>
          <span style={{ color: 'var(--carbon-line)' }}>|</span>
          <a href="/cases" className="hover:text-[var(--tech-mint)] transition-colors">
            综合案例
          </a>
        </div>

        {/* 返回顶部 */}
        <button
          onClick={handleScrollToTop}
          className="absolute bottom-8 right-8 p-3 rounded-full transition-all duration-200 group"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--carbon-line)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--tech-mint)';
            e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--carbon-line)';
            e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
          }}
          aria-label="返回顶部"
        >
          <svg 
            className="w-6 h-6"
            style={{ color: 'var(--ink-mid)' }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}