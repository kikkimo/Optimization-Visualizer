import React, { useState, useRef, useEffect, useCallback } from 'react';
import DownHint from './DownHint';
import TspMapCanvas from './TspMapCanvas';
import TspControlPanel from './TspControlPanel';
import { generateGraph, getStartNode, isConnected } from '../../lib/graph';

export default function Section3TSP({ id }) {
  // 状态管理
  const [graph, setGraph] = useState(null);
  const [startId, setStartId] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState(new Set());
  const [planResult, setPlanResult] = useState(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(180); // 默认中速
  const [showAllRoads, setShowAllRoads] = useState(true);
  
  // 引用
  const canvasRef = useRef(null);
  const workerRef = useRef(null);

  // 初始化路网
  useEffect(() => {
    const newGraph = generateGraph(1000, 700);
    
    // 验证连通性
    if (!isConnected(newGraph)) {
      console.warn('Generated graph is not connected, regenerating...');
      // 重新生成直到连通
      let attempts = 0;
      while (!isConnected(newGraph) && attempts < 10) {
        setGraph(generateGraph(1000, 700));
        attempts++;
      }
    }
    
    setGraph(newGraph);
    const start = getStartNode(newGraph);
    setStartId(start);
  }, []);

  // 初始化Worker
  useEffect(() => {
    try {
      workerRef.current = new Worker(
        new URL('../../workers/tspPlanner.ts', import.meta.url),
        { type: 'module' }
      );
    } catch (error) {
      console.warn('Worker creation failed, using fallback:', error);
      // Worker创建失败的降级处理
      return;
    }

    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'RESULT') {
        setPlanResult(e.data.payload);
        setIsPlanning(false);
        
        // 自动开始动画
        setTimeout(() => {
          if (canvasRef.current) {
            setIsAnimating(true);
            setIsPaused(false);
            canvasRef.current.startAnimation();
          }
        }, 100);
      } else if (e.data.type === 'ERROR') {
        console.error('Planning error:', e.data.payload.message);
        setIsPlanning(false);
      }
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // 随机选择配送点
  const handleRandomSelect = useCallback(() => {
    if (!graph) return;
    
    const count = 6 + Math.floor(Math.random() * 5); // 6-10个
    const available = graph.nodes
      .filter(n => n.id !== startId)
      .map(n => n.id);
    
    const selected = new Set();
    for (let i = 0; i < count && available.length > 0; i++) {
      const idx = Math.floor(Math.random() * available.length);
      selected.add(available[idx]);
      available.splice(idx, 1);
    }
    
    setSelectedNodes(selected);
    setPlanResult(null);
    setIsAnimating(false);
  }, [graph, startId]);

  // 手动选择节点
  const handleNodeClick = useCallback((nodeId) => {
    if (nodeId === startId) return;
    
    setSelectedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
    
    setPlanResult(null);
    setIsAnimating(false);
  }, [startId]);

  // 规划路线
  const handlePlan = useCallback(() => {
    if (!graph || selectedNodes.size === 0 || !workerRef.current) return;
    
    setIsPlanning(true);
    setPlanResult(null);
    setIsAnimating(false);
    
    workerRef.current.postMessage({
      type: 'PLAN',
      payload: {
        graph,
        startId,
        destinationIds: Array.from(selectedNodes),
        timeBudgetMs: 100
      }
    });
  }, [graph, startId, selectedNodes]);

  // 播放/暂停控制
  const handlePlayPause = useCallback(() => {
    if (!canvasRef.current) return;
    
    if (isPaused) {
      setIsPaused(false);
      canvasRef.current.resumeAnimation();
    } else {
      setIsPaused(true);
      canvasRef.current.pauseAnimation();
    }
  }, [isPaused]);

  // 重置
  const handleReset = useCallback(() => {
    setSelectedNodes(new Set());
    setPlanResult(null);
    setIsAnimating(false);
    setIsPaused(false);
    
    if (canvasRef.current) {
      canvasRef.current.resetAnimation();
    }
  }, []);

  return (
    <section id={id} className="snap-section relative flex overflow-hidden">
      {/* 添加顶部间距避免与导航栏重叠 */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[var(--bg-deep)] to-transparent z-10 pointer-events-none"></div>
      
      <div className="flex flex-1 pt-16">
        {/* 左侧地图画布 */}
        <div className="flex-1 relative" style={{ backgroundColor: 'var(--bg-deep)' }}>
          <TspMapCanvas
            ref={canvasRef}
            graph={graph}
            startId={startId}
            selectedNodes={selectedNodes}
            planResult={planResult}
            animationSpeed={animationSpeed}
            showAllRoads={showAllRoads}
            onNodeClick={handleNodeClick}
            isPaused={isPaused}
          />
        </div>

        {/* 右侧控制面板 */}
        <div className="w-80" style={{ 
          backgroundColor: 'var(--bg-surface)',
          borderLeft: '1px solid var(--carbon-line)'
        }}>
          <TspControlPanel
            selectedCount={selectedNodes.size}
            isPlanning={isPlanning}
            isAnimating={isAnimating}
            isPaused={isPaused}
            planResult={planResult}
            animationSpeed={animationSpeed}
            showAllRoads={showAllRoads}
            onRandomSelect={handleRandomSelect}
            onPlan={handlePlan}
            onPlayPause={handlePlayPause}
            onReset={handleReset}
            onSpeedChange={setAnimationSpeed}
            onToggleRoads={setShowAllRoads}
          />
        </div>
      </div>

      <DownHint targetSection={3} text="查看图像配准" />
    </section>
  );
}