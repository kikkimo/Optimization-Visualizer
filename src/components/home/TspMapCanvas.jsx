import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { buildLengthTable, sampleAtDistance } from '../../lib/geom';

const TspMapCanvas = forwardRef(({ 
  graph, 
  startId, 
  selectedNodes, 
  planResult,
  animationSpeed,
  showAllRoads,
  onNodeClick,
  isPaused
}, ref) => {
  const canvasRef = useRef(null);
  const animationRef = useRef();
  const [animationProgress, setAnimationProgress] = useState(0);
  const [visitedNodes, setVisitedNodes] = useState(new Set());
  const [courierPosition, setCourierPosition] = useState(null);
  const [courierAngle, setCourierAngle] = useState(0);
  
  // 动画控制
  const lengthTableRef = useRef(null);
  const totalLengthRef = useRef(0);
  const lastTimeRef = useRef(0);

  // 暴露控制方法
  useImperativeHandle(ref, () => ({
    startAnimation: () => {
      setAnimationProgress(0);
      setVisitedNodes(new Set());
      lastTimeRef.current = performance.now();
      animate();
    },
    pauseAnimation: () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    },
    resumeAnimation: () => {
      lastTimeRef.current = performance.now();
      animate();
    },
    resetAnimation: () => {
      setAnimationProgress(0);
      setVisitedNodes(new Set());
      setCourierPosition(null);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }));

  // 动画循环
  const animate = () => {
    if (!planResult || !planResult.stitchedPath || planResult.stitchedPath.length < 2 || isPaused) return;
    
    const currentTime = performance.now();
    const deltaTime = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1); // 限制最大deltaTime
    lastTimeRef.current = currentTime;
    
    // 根据速度计算前进距离
    const speedPxPerSec = animationSpeed; // 120/180/240 px/s
    const distance = speedPxPerSec * deltaTime;
    
    // 更新进度
    const newProgress = Math.min(animationProgress + distance, totalLengthRef.current);
    
    if (newProgress >= totalLengthRef.current) {
      // 动画结束
      setAnimationProgress(totalLengthRef.current);
      updateCourierPosition(totalLengthRef.current);
      markAllNodesVisited();
      return;
    }
    
    setAnimationProgress(newProgress);
    updateCourierPosition(newProgress);
    updateVisitedNodes(newProgress);
    
    // 继续动画循环
    animationRef.current = requestAnimationFrame(animate);
  };

  // 更新外卖员位置
  const updateCourierPosition = (progress) => {
    if (!lengthTableRef.current || !planResult) return;
    
    const sample = sampleAtDistance(
      planResult.stitchedPath,
      lengthTableRef.current,
      progress
    );
    
    setCourierPosition(sample.point);
    setCourierAngle(sample.angle);
  };

  // 更新已访问节点
  const updateVisitedNodes = (progress) => {
    if (!planResult || !graph) return;
    
    // 根据进度计算应该已经访问的节点
    const pathRatio = progress / totalLengthRef.current;
    const nodesCount = Math.floor(pathRatio * planResult.order.length);
    
    const newVisited = new Set();
    for (let i = 0; i < nodesCount; i++) {
      newVisited.add(planResult.order[i]);
    }
    
    setVisitedNodes(newVisited);
  };

  // 标记所有节点已访问
  const markAllNodesVisited = () => {
    if (!planResult) return;
    setVisitedNodes(new Set(planResult.order));
  };

  // 初始化动画数据
  useEffect(() => {
    if (planResult && planResult.stitchedPath && planResult.stitchedPath.length > 0) {
      lengthTableRef.current = buildLengthTable(planResult.stitchedPath);
      totalLengthRef.current = lengthTableRef.current[lengthTableRef.current.length - 1];
    }
  }, [planResult]);

  // 绘制函数
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !graph) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 设置画布大小
    canvas.width = 1000;
    canvas.height = 700;
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景网格
    drawGrid(ctx, canvas.width, canvas.height);
    
    // 绘制道路
    if (showAllRoads) {
      drawRoads(ctx);
    }
    
    // 绘制规划路径
    if (planResult && planResult.stitchedPath) {
      drawPlannedPath(ctx);
    }
    
    // 绘制节点
    drawNodes(ctx);
    
    // 绘制外卖员
    if (courierPosition) {
      drawCourier(ctx);
    }
  };

  // 绘制网格背景
  const drawGrid = (ctx, width, height) => {
    ctx.strokeStyle = 'rgba(48, 53, 55, 0.4)'; // 增强对比度
    ctx.lineWidth = 0.8;
    
    const gridSize = 50;
    
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  // 绘制道路
  const drawRoads = (ctx) => {
    if (!graph) return;
    
    // 先绘制次要道路
    graph.edges.filter(e => e.level === 'secondary').forEach(edge => {
      ctx.strokeStyle = 'rgba(157, 163, 166, 0.8)'; // 使用--ink-mid颜色，增强对比度
      ctx.lineWidth = 2;
      drawPolyline(ctx, edge.polyline);
    });
    
    // 再绘制主要道路
    graph.edges.filter(e => e.level === 'primary').forEach(edge => {
      ctx.strokeStyle = 'rgba(157, 163, 166, 1)'; // 完全不透明
      ctx.lineWidth = 3;
      drawPolyline(ctx, edge.polyline);
    });
  };

  // 绘制折线
  const drawPolyline = (ctx, points) => {
    if (points.length < 2) return;
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.stroke();
  };

  // 绘制规划路径
  const drawPlannedPath = (ctx) => {
    if (!planResult || !planResult.stitchedPath) return;
    
    // 绘制路径阴影/边框增强可见性
    ctx.strokeStyle = 'rgba(12, 15, 16, 0.8)'; // 深色边框
    ctx.lineWidth = 6;
    ctx.globalAlpha = 0.9;
    drawPolyline(ctx, planResult.stitchedPath);
    
    // 绘制主路径
    ctx.strokeStyle = '#F5B248'; // --amber-signal
    ctx.lineWidth = 4;
    ctx.globalAlpha = 1;
    drawPolyline(ctx, planResult.stitchedPath);
    
    ctx.globalAlpha = 1;
  };

  // 绘制节点
  const drawNodes = (ctx) => {
    if (!graph) return;
    
    graph.nodes.forEach(node => {
      const isStart = node.id === startId;
      const isSelected = selectedNodes.has(node.id);
      const isVisited = visitedNodes.has(node.id);
      
      // 绘制外圈（选中效果）
      if (isSelected) {
        // 背景圆增强可见性
        ctx.fillStyle = 'rgba(60, 230, 192, 0.2)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, 18, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#3CE6C0'; // --tech-mint
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.6 + 0.4 * Math.sin(Date.now() * 0.003);
        ctx.beginPath();
        ctx.arc(node.x, node.y, 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      
      // 绘制节点本体
      if (isStart) {
        // 起点背景光圈
        ctx.fillStyle = 'rgba(245, 178, 72, 0.3)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // 起点 - 琥珀色
        ctx.fillStyle = '#F5B248';
        ctx.strokeStyle = '#0C0F10';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 绘制起点标记
        ctx.fillStyle = '#0C0F10';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('起', node.x, node.y);
      } else if (isSelected) {
        // 目的地 - 电薄荷
        ctx.fillStyle = isVisited ? '#3DDC97' : '#3CE6C0';
        ctx.strokeStyle = '#0C0F10';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 已访问的打勾
        if (isVisited) {
          ctx.strokeStyle = '#0C0F10';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(node.x - 4, node.y);
          ctx.lineTo(node.x - 1, node.y + 3);
          ctx.lineTo(node.x + 4, node.y - 3);
          ctx.stroke();
        }
      } else {
        // 普通节点 - 增强可见性
        ctx.fillStyle = 'rgba(157, 163, 166, 0.8)';
        ctx.strokeStyle = 'rgba(157, 163, 166, 1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    });
  };

  // 绘制外卖员
  const drawCourier = (ctx) => {
    if (!courierPosition) return;
    
    ctx.save();
    ctx.translate(courierPosition.x, courierPosition.y);
    ctx.rotate(courierAngle);
    
    // 背景发光效果
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fillStyle = '#F5B248';
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // 车身阴影
    ctx.fillStyle = 'rgba(12, 15, 16, 0.5)';
    ctx.beginPath();
    ctx.moveTo(-11, -4);
    ctx.lineTo(11, -4);
    ctx.lineTo(13, 1);
    ctx.lineTo(11, 6);
    ctx.lineTo(-11, 6);
    ctx.lineTo(-13, 1);
    ctx.closePath();
    ctx.fill();
    
    // 车身主体
    ctx.fillStyle = '#F5B248';
    ctx.strokeStyle = '#0C0F10';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, -5);
    ctx.lineTo(10, -5);
    ctx.lineTo(12, 0);
    ctx.lineTo(10, 5);
    ctx.lineTo(-10, 5);
    ctx.lineTo(-12, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 外卖箱
    ctx.fillStyle = '#3CE6C0';
    ctx.strokeStyle = '#0C0F10';
    ctx.lineWidth = 1.5;
    ctx.fillRect(-6, -3, 8, 6);
    ctx.strokeRect(-6, -3, 8, 6);
    
    // 外卖箱标记
    ctx.fillStyle = '#0C0F10';
    ctx.font = 'bold 6px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('外', -2, 0);
    
    ctx.restore();
  };

  // 处理点击
  const handleCanvasClick = (e) => {
    if (!graph || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
    const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);
    
    // 查找点击的节点
    const clickedNode = graph.nodes.find(node => {
      const dist = Math.hypot(node.x - x, node.y - y);
      return dist < 15;
    });
    
    if (clickedNode && clickedNode.id !== startId) {
      onNodeClick(clickedNode.id);
    }
  };

  // 绘制循环
  useEffect(() => {
    draw();
  }, [graph, selectedNodes, planResult, showAllRoads, courierPosition, visitedNodes]);

  // 清理动画
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-pointer"
      onClick={handleCanvasClick}
      style={{ 
        background: 'var(--bg-deep)',
        maxWidth: '1000px',
        maxHeight: '700px'
      }}
    />
  );
});

TspMapCanvas.displayName = 'TspMapCanvas';

export default TspMapCanvas;