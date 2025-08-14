import React, { useEffect, useRef } from 'react';

export default function BridgeFieldCanvas({ isActive }) {
  const canvasRef = useRef(null);
  const animationRef = useRef();
  const nodesRef = useRef([]);
  const transitionProgressRef = useRef(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeNodes();
    };

    const initializeNodes = () => {
      // 创建网格节点
      const cols = 8;
      const rows = 6;
      const nodes = [];
      
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = (i + 0.5) / cols;
          const y = (j + 0.5) / rows;
          nodes.push({
            x: x + (Math.random() - 0.5) * 0.05,
            y: y + (Math.random() - 0.5) * 0.05,
            connections: [],
            glow: 0
          });
        }
      }

      // 创建连接（最近邻）
      nodes.forEach((node, i) => {
        const distances = nodes
          .map((other, j) => ({
            index: j,
            dist: Math.hypot(node.x - other.x, node.y - other.y)
          }))
          .filter(d => d.index !== i)
          .sort((a, b) => a.dist - b.dist);
        
        // 连接最近的2-3个节点
        const connectionCount = 2 + Math.floor(Math.random() * 2);
        node.connections = distances.slice(0, connectionCount).map(d => d.index);
      });

      nodesRef.current = nodes;
    };

    // 绘制曲线（等高线风格）
    const drawCurves = (progress) => {
      const gridInk = getComputedStyle(document.documentElement).getPropertyValue('--grid-ink');
      ctx.strokeStyle = gridInk;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3 * (1 - progress);

      const resolution = 30;
      for (let i = 0; i < resolution; i++) {
        const t = i / resolution;
        ctx.beginPath();
        for (let j = 0; j < canvas.width; j += 10) {
          const x = j / canvas.width;
          const y = 0.5 + 0.2 * Math.sin(x * 10 + t * Math.PI * 2 + timeRef.current);
          if (j === 0) {
            ctx.moveTo(j, y * canvas.height);
          } else {
            // 曲线逐渐变直
            const curveY = y * (1 - progress) + (0.5 + (t - 0.5) * 0.3) * progress;
            ctx.lineTo(j, curveY * canvas.height);
          }
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    // 绘制节点和连接
    const drawNetwork = (progress) => {
      if (progress < 0.3) return;
      
      const alpha = Math.min(1, (progress - 0.3) / 0.3);
      
      // 绘制连接线
      ctx.strokeStyle = `rgba(157, 163, 166, ${alpha * 0.3})`;
      ctx.lineWidth = 1;
      
      nodesRef.current.forEach((node, i) => {
        node.connections.forEach(j => {
          const other = nodesRef.current[j];
          if (other && i < j) {
            ctx.beginPath();
            ctx.moveTo(node.x * canvas.width, node.y * canvas.height);
            
            // 线条从曲线过渡到直线
            const midX = (node.x + other.x) / 2;
            const midY = (node.y + other.y) / 2;
            const curveOffset = (1 - progress) * 0.05 * Math.sin(timeRef.current + i);
            
            ctx.quadraticCurveTo(
              midX * canvas.width,
              (midY + curveOffset) * canvas.height,
              other.x * canvas.width,
              other.y * canvas.height
            );
            ctx.stroke();
          }
        });
      });

      // 绘制节点
      nodesRef.current.forEach((node, i) => {
        // 更新发光效果
        if (Math.random() < 0.01) {
          node.glow = 1;
        }
        node.glow *= 0.95;

        // 绘制节点
        ctx.fillStyle = `rgba(245, 178, 72, ${alpha * (0.5 + node.glow * 0.5)})`;
        ctx.beginPath();
        ctx.arc(
          node.x * canvas.width,
          node.y * canvas.height,
          3 + node.glow * 2,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // 绘制光晕
        if (node.glow > 0.1) {
          ctx.fillStyle = `rgba(245, 178, 72, ${alpha * node.glow * 0.2})`;
          ctx.beginPath();
          ctx.arc(
            node.x * canvas.width,
            node.y * canvas.height,
            10 + node.glow * 5,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      });
    };

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      timeRef.current += 0.016;

      // 过渡进度
      if (isActive && transitionProgressRef.current < 1) {
        transitionProgressRef.current = Math.min(1, transitionProgressRef.current + 0.016 / 0.56);
      }

      const progress = transitionProgressRef.current;
      
      drawCurves(progress);
      drawNetwork(progress);
      
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
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full canvas-layer"
      style={{ background: 'var(--bg-deep)' }}
    />
  );
}