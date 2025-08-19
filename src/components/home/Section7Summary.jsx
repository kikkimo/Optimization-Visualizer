import React, { useEffect, useRef, useState } from 'react';

export default function Section7Summary({ id }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const animationRef = useRef();

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

  // 粒子动画效果
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const particles = [];
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // 初始化粒子
    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < 15; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: 2 + Math.random() * 3,
          opacity: 0.3 + Math.random() * 0.4,
          trail: []
        });
      }
    };

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;
      
      particles.forEach(particle => {
        // 更新位置
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // 边界反弹
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1;
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -1;
          particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        }
        
        // 更新尾迹
        particle.trail.push({ x: particle.x, y: particle.y, alpha: 1 });
        particle.trail = particle.trail.slice(-8).map((point, i) => ({
          ...point,
          alpha: point.alpha * 0.9
        }));
        
        // 绘制尾迹
        particle.trail.forEach((point, i) => {
          if (i > 0) {
            const prev = particle.trail[i - 1];
            ctx.strokeStyle = `rgba(60, 230, 192, ${point.alpha * particle.opacity * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
          }
        });
        
        // 绘制粒子
        ctx.fillStyle = `rgba(60, 230, 192, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制发光效果
        ctx.fillStyle = `rgba(60, 230, 192, ${particle.opacity * 0.2})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        ctx.fill();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initParticles();
    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    });
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleScrollToTop = () => {
    const section0 = document.getElementById('section-0');
    if (section0) {
      section0.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleConcept = () => {
    // 导航到概念页面
    window.location.href = '/concept';
  };

  return (
    <section
      id={id}
      ref={sectionRef}
      className="snap-section relative flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: 'var(--bg-deep)' }}
    >
      {/* 背景Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />

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
            onClick={handleConcept}
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
            开始了解概念
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