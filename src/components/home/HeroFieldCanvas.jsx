import React, { useEffect, useRef } from 'react';

export default function HeroFieldCanvas() {
  const canvasRef = useRef(null);
  const animationRef = useRef();
  const particlesRef = useRef([]);
  const peaksRef = useRef([]);
  const timeRef = useRef(0);
  const constraintPolygonRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeField();
    };

    const initializeField = () => {
      // 初始化高斯峰
      peaksRef.current = [
        { x: 0.3, y: 0.4, amplitude: 0.8, sigma: 0.15 },
        { x: 0.7, y: 0.3, amplitude: 0.6, sigma: 0.12 },
        { x: 0.5, y: 0.7, amplitude: 0.7, sigma: 0.18 }
      ];

      // 初始化粒子
      particlesRef.current = Array.from({ length: 60 }, () => ({
        x: 0.3 + Math.random() * 0.4,
        y: 0.3 + Math.random() * 0.4,
        vx: (Math.random() - 0.5) * 0.002,
        vy: (Math.random() - 0.5) * 0.002,
        trail: [],
        life: 0,  // 生命周期计数器
        maxLife: 60 + Math.random() * 60  // 1-2秒的生命周期（60fps）
      }));

      // 初始化约束多边形
      const vertices = 5 + Math.floor(Math.random() * 3);
      constraintPolygonRef.current = Array.from({ length: vertices }, (_, i) => {
        const angle = (i / vertices) * Math.PI * 2;
        const radius = 0.3 + Math.random() * 0.1;
        return {
          x: 0.5 + radius * Math.cos(angle),
          y: 0.5 + radius * Math.sin(angle)
        };
      });
    };

    // 计算场函数值
    const fieldValue = (x, y) => {
      return peaksRef.current.reduce((sum, peak) => {
        const dx = x - peak.x;
        const dy = y - peak.y;
        const dist2 = dx * dx + dy * dy;
        return sum + peak.amplitude * Math.exp(-dist2 / (2 * peak.sigma * peak.sigma));
      }, 0);
    };

    // 计算梯度
    const gradient = (x, y) => {
      const h = 0.001;
      const fx = fieldValue(x, y);
      const gx = (fieldValue(x + h, y) - fx) / h;
      const gy = (fieldValue(x, y + h) - fx) / h;
      return { gx, gy };
    };

    // 绘制等高线
    const drawContours = () => {
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--grid-ink');
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;

      const levels = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7];
      const resolution = 50;
      
      levels.forEach(level => {
        ctx.beginPath();
        for (let i = 0; i < resolution; i++) {
          for (let j = 0; j < resolution; j++) {
            const x1 = i / resolution;
            const y1 = j / resolution;
            const x2 = (i + 1) / resolution;
            const y2 = (j + 1) / resolution;

            const v1 = fieldValue(x1, y1);
            const v2 = fieldValue(x2, y1);
            const v3 = fieldValue(x2, y2);
            const v4 = fieldValue(x1, y2);

            // 简化的 marching squares
            if ((v1 > level) !== (v2 > level)) {
              const t = (level - v1) / (v2 - v1);
              const px = x1 + t * (x2 - x1);
              ctx.lineTo(px * canvas.width, y1 * canvas.height);
            }
            if ((v2 > level) !== (v3 > level)) {
              const t = (level - v2) / (v3 - v2);
              const py = y1 + t * (y2 - y1);
              ctx.lineTo(x2 * canvas.width, py * canvas.height);
            }
          }
        }
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    };

    // 绘制约束多边形
    const drawConstraintPolygon = () => {
      if (Math.sin(timeRef.current * 0.5) > 0.5) {
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--grid-ink');
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.2;
        ctx.setLineDash([5, 5]);
        
        ctx.beginPath();
        constraintPolygonRef.current.forEach((point, i) => {
          const x = point.x * canvas.width;
          const y = point.y * canvas.height;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.stroke();
        
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }
    };

    // 重置粒子函数
    const resetParticle = (particle) => {
      particle.x = 0.3 + Math.random() * 0.4;
      particle.y = 0.3 + Math.random() * 0.4;
      particle.vx = (Math.random() - 0.5) * 0.002;
      particle.vy = (Math.random() - 0.5) * 0.002;
      particle.trail = [];
      particle.life = 0;
      particle.maxLife = 60 + Math.random() * 60;  // 1-2秒生命周期
    };

    // 更新粒子
    const updateParticles = () => {
      particlesRef.current.forEach(particle => {
        // 更新生命周期
        particle.life++;
        
        // 检查粒子是否需要重置（生命周期结束或到达边缘）
        if (particle.life >= particle.maxLife || 
            particle.x < 0 || particle.x > 1 || 
            particle.y < 0 || particle.y > 1) {
          resetParticle(particle);
          return;
        }

        // 计算负梯度（下降方向）
        const { gx, gy } = gradient(particle.x, particle.y);
        const speed = 0.002;
        
        // 计算生命周期衰减因子（随着时间推移速度逐渐减慢）
        const lifeFactor = Math.max(0.1, 1 - (particle.life / particle.maxLife) * 0.7);
        
        particle.vx = particle.vx * 0.9 - gx * speed * lifeFactor;
        particle.vy = particle.vy * 0.9 - gy * speed * lifeFactor;
        
        particle.x += particle.vx;
        particle.y += particle.vy;

        // 更新尾迹
        particle.trail.push({ 
          x: particle.x, 
          y: particle.y, 
          alpha: lifeFactor  // 透明度也随生命周期衰减
        });
        
        particle.trail = particle.trail.slice(-20).map(point => ({
          ...point,
          alpha: point.alpha * 0.95
        }));
      });
    };

    // 绘制粒子
    const drawParticles = () => {
      const mintColor = getComputedStyle(document.documentElement).getPropertyValue('--tech-mint');
      ctx.fillStyle = mintColor;
      
      particlesRef.current.forEach(particle => {
        // 绘制尾迹
        particle.trail.forEach((point, i) => {
          if (i > 0) {
            const prev = particle.trail[i - 1];
            ctx.strokeStyle = `rgba(60, 230, 192, ${point.alpha * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(prev.x * canvas.width, prev.y * canvas.height);
            ctx.lineTo(point.x * canvas.width, point.y * canvas.height);
            ctx.stroke();
          }
        });

        // 绘制粒子
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(
          particle.x * canvas.width,
          particle.y * canvas.height,
          3,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.globalAlpha = 1;
      });
    };

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 更新时间
      timeRef.current += 0.016;
      
      // 缓慢调整峰参数（呼吸感）
      if (Math.floor(timeRef.current) % 3 === 0) {
        peaksRef.current.forEach(peak => {
          peak.amplitude = 0.5 + 0.3 * Math.sin(timeRef.current * 0.3);
          peak.sigma = 0.1 + 0.08 * Math.cos(timeRef.current * 0.2);
        });
      }

      drawContours();
      drawConstraintPolygon();
      updateParticles();
      drawParticles();
      
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full canvas-layer"
      style={{ background: 'var(--bg-deep)' }}
    />
  );
}