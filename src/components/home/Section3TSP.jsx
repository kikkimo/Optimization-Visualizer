import React, { useState, useEffect, useRef } from 'react';

// TSP配送路径规划组件 - 简化版本（无Worker）
export default function Section3TSPSimple({ id }) {
  // 引用
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  // 状态管理
  const [graph, setGraph] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState(new Set());
  const [planResult, setPlanResult] = useState(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [visitedNodes, setVisitedNodes] = useState(new Set());
  const [visitedPaths, setVisitedPaths] = useState([]);
  const [courierPosition, setCourierPosition] = useState(null);
  const [animationSpeed, setAnimationSpeed] = useState('medium');

  // 加载固定路网数据
  useEffect(() => {
    console.log('[Graph] === 开始加载图数据 ===');
    
    fetch('/assets/graph/tsp_fixed_graph.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('[Graph] ✅ 图数据加载成功:', {
          nodeCount: data.nodes?.length,
          edgeCount: data.edges?.length,
          hasAdjacency: !!data.adjacency,
          startId: data.startId
        });
        
        setGraph({
          ...data,
          startId: data.startId || 0
        });
      })
      .catch(error => {
        console.error('[Graph] ❌ 图数据加载失败:', error);
      });
  }, []);

  // Canvas绘制设置
  useEffect(() => {
    if (!graph) return;
    
    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      
      // 设置Canvas尺寸，考虑设备像素比
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      
      draw(ctx, rect.width, rect.height);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [graph, selectedNodes, planResult, visitedPaths, courierPosition]);

  // TSP算法实现
  const distance = (p1, p2) => Math.hypot(p2.x - p1.x, p2.y - p1.y);
  
  const dijkstra = (graph, source) => {
    const distances = new Map();
    const predecessors = new Map();
    const visited = new Set();
    
    // 初始化
    for (const node of graph.nodes) {
      distances.set(node.id, Infinity);
      predecessors.set(node.id, null);
    }
    distances.set(source, 0);
    
    // 优先队列
    const queue = [source];
    
    while (queue.length > 0) {
      // 找最小距离节点
      let minIndex = 0;
      let minDist = distances.get(queue[0]);
      
      for (let i = 1; i < queue.length; i++) {
        const dist = distances.get(queue[i]);
        if (dist < minDist) {
          minDist = dist;
          minIndex = i;
        }
      }
      
      const current = queue.splice(minIndex, 1)[0];
      
      if (visited.has(current)) continue;
      visited.add(current);
      
      // 更新邻居
      const edgeIds = graph.adjacency[current.toString()] || [];
      
      for (const edgeId of edgeIds) {
        const edge = graph.edges.find(e => e.id === edgeId);
        if (!edge) continue;
        
        const neighbor = edge.a === current ? edge.b : edge.a;
        if (visited.has(neighbor)) continue;
        
        const alt = distances.get(current) + edge.length;
        
        if (alt < distances.get(neighbor)) {
          distances.set(neighbor, alt);
          predecessors.set(neighbor, current);
          
          if (!queue.includes(neighbor)) {
            queue.push(neighbor);
          }
        }
      }
    }
    
    return { distances, predecessors };
  };
  
  const buildDistanceMatrix = (graph, nodeIds) => {
    const n = nodeIds.length;
    const matrix = Array(n).fill(0).map(() => Array(n).fill(Infinity));
    const paths = new Map();
    
    for (let i = 0; i < n; i++) {
      const source = nodeIds[i];
      const { distances, predecessors } = dijkstra(graph, source);
      
      for (let j = 0; j < n; j++) {
        const target = nodeIds[j];
        matrix[i][j] = distances.get(target) || Infinity;
        
        if (i !== j && distances.get(target) < Infinity) {
          const path = [];
          let current = target;
          
          while (current !== null) {
            path.unshift(current);
            current = predecessors.get(current);
          }
          
          paths.set(`${source}-${target}`, path);
        }
      }
    }
    
    return { matrix, paths };
  };
  
  const nearestNeighbor = (distanceMatrix, startIndex) => {
    const n = distanceMatrix.length;
    const visited = new Array(n).fill(false);
    const tour = [startIndex];
    visited[startIndex] = true;
    
    let current = startIndex;
    
    for (let i = 1; i < n; i++) {
      let nearest = -1;
      let minDist = Infinity;
      
      for (let j = 0; j < n; j++) {
        if (!visited[j] && distanceMatrix[current][j] < minDist) {
          minDist = distanceMatrix[current][j];
          nearest = j;
        }
      }
      
      if (nearest !== -1) {
        tour.push(nearest);
        visited[nearest] = true;
        current = nearest;
      }
    }
    
    return tour;
  };
  
  const twoOpt = (tour, distanceMatrix) => {
    let improved = true;
    let iters = 0;
    let bestTour = [...tour];
    
    const tourDistance = (t) => {
      let dist = 0;
      for (let i = 1; i < t.length; i++) {
        dist += distanceMatrix[t[i - 1]][t[i]];
      }
      return dist;
    };
    
    let bestDistance = tourDistance(bestTour);
    
    while (improved && iters < 100) {
      improved = false;
      
      for (let i = 1; i < bestTour.length - 1; i++) {
        for (let j = i + 1; j < bestTour.length; j++) {
          const newTour = [
            ...bestTour.slice(0, i),
            ...bestTour.slice(i, j + 1).reverse(),
            ...bestTour.slice(j + 1)
          ];
          
          const newDistance = tourDistance(newTour);
          
          if (newDistance < bestDistance) {
            bestTour = newTour;
            bestDistance = newDistance;
            improved = true;
          }
        }
      }
      
      iters++;
    }
    
    return { tour: bestTour, iters };
  };
  
  const stitchPath = (graph, tour, nodeIds, paths) => {
    const segments = [];
    
    for (let i = 1; i < tour.length; i++) {
      const fromId = nodeIds[tour[i - 1]];
      const toId = nodeIds[tour[i]];
      const pathKey = `${fromId}-${toId}`;
      const nodePath = paths.get(pathKey);
      
      if (!nodePath || nodePath.length < 2) continue;
      
      const segment = [];
      
      for (let j = 1; j < nodePath.length; j++) {
        const edgeNodeA = nodePath[j - 1];
        const edgeNodeB = nodePath[j];
        
        const edge = graph.edges.find(e =>
          (e.a === edgeNodeA && e.b === edgeNodeB) ||
          (e.b === edgeNodeA && e.a === edgeNodeB)
        );
        
        if (!edge) continue;
        
        if (edge.a === edgeNodeA) {
          segment.push(...edge.polyline);
        } else {
          segment.push(...[...edge.polyline].reverse());
        }
      }
      
      if (segment.length > 0) {
        segments.push(segment);
      }
    }
    
    // 合并路径段
    if (segments.length === 0) return [];
    if (segments.length === 1) return segments[0];
    
    const merged = [...segments[0]];
    
    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i];
      if (segment.length > 0) {
        const lastPoint = merged[merged.length - 1];
        const firstPoint = segment[0];
        
        if (distance(lastPoint, firstPoint) < 0.01) {
          merged.push(...segment.slice(1));
        } else {
          merged.push(...segment);
        }
      }
    }
    
    return merged;
  };

  // 路径规划主函数
  const runTSPPlanning = async () => {
    console.log('[Plan] === 开始路径规划 ===');
    
    if (!graph || selectedNodes.size === 0) {
      console.error('[Plan] ❌ 图数据或选择节点为空');
      return;
    }
    
    setIsPlanning(true);
    setPlanResult(null);
    
    try {
      // 构建节点集合
      const nodeIds = [graph.startId, ...Array.from(selectedNodes)];
      
      console.log('[Plan] 构建距离矩阵...');
      const { matrix, paths } = buildDistanceMatrix(graph, nodeIds);
      
      // 生成初始解
      const initialTour = nearestNeighbor(matrix, 0);
      
      // 2-opt优化
      const { tour: optimizedTour, iters } = twoOpt(initialTour, matrix);
      
      // 计算距离
      let totalDistance = 0;
      for (let i = 1; i < optimizedTour.length; i++) {
        totalDistance += matrix[optimizedTour[i - 1]][optimizedTour[i]];
      }
      
      // 拼接路径
      console.log('[Plan] 拼接路径...');
      const stitchedPath = stitchPath(graph, optimizedTour, nodeIds, paths);
      
      const result = {
        order: optimizedTour.map(i => nodeIds[i]),
        stitchedPath,
        distance: totalDistance,
        iters
      };
      
      console.log('[Plan] ✅ 规划完成:', {
        orderLength: result.order.length,
        pathPoints: result.stitchedPath.length,
        distance: result.distance.toFixed(2),
        iterations: result.iters
      });
      
      setPlanResult(result);
      
    } catch (error) {
      console.error('[Plan] ❌ 规划失败:', error);
    } finally {
      setIsPlanning(false);
    }
  };

  // 动画更新
  useEffect(() => {
    if (!isAnimating || !planResult?.stitchedPath) return;
    
    const speedMap = { slow: 0.5, medium: 1, fast: 2 };
    const speed = speedMap[animationSpeed];
    
    const animate = () => {
      setAnimationProgress(prev => {
        const newProgress = prev + speed;
        const maxProgress = planResult.stitchedPath.length - 1;
        
        if (newProgress >= maxProgress) {
          setIsAnimating(false);
          return maxProgress;
        }
        
        // 更新小车位置
        const currentIndex = Math.floor(newProgress);
        if (currentIndex < planResult.stitchedPath.length) {
          setCourierPosition(planResult.stitchedPath[currentIndex]);
          
          // 更新已访问路径
          setVisitedPaths(planResult.stitchedPath.slice(0, currentIndex + 1));
          
          // 检查是否经过配送点
          const deliveryNodes = planResult.order.slice(1); // 排除起点
          const currentPos = planResult.stitchedPath[currentIndex];
          
          for (const nodeId of deliveryNodes) {
            if (!visitedNodes.has(nodeId)) {
              const node = graph.nodes.find(n => n.id === nodeId);
              if (node && distance(currentPos, node) < 15) {
                setVisitedNodes(prev => new Set([...prev, nodeId]));
                console.log(`[Animation] 🚩 已送达配送点 ${nodeId}`);
              }
            }
          }
        }
        
        return newProgress;
      });
      
      if (isAnimating) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, animationSpeed, planResult, graph, visitedNodes]);

  // 绘制函数
  const draw = (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    
    // 计算缩放比例
    const scaleX = width / 1200;
    const scaleY = height / 800;
    
    // 绘制网格
    drawGrid(ctx, width, height);
    
    // 绘制道路
    if (graph) {
      drawRoads(ctx, scaleX, scaleY);
      
      // 绘制规划路径
      if (planResult) {
        drawPlannedPath(ctx, scaleX, scaleY);
      }
      
      // 绘制节点
      drawNodes(ctx, scaleX, scaleY);
    }
  };

  const drawGrid = (ctx, width, height) => {
    ctx.strokeStyle = 'rgba(48, 53, 55, 0.3)';
    ctx.lineWidth = 1;
    
    const gridSize = 40;
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

  const drawRoads = (ctx, scaleX, scaleY) => {
    graph.edges.forEach(edge => {
      ctx.strokeStyle = edge.level === 'primary' ? 'rgba(157, 163, 166, 1)' : 'rgba(157, 163, 166, 0.6)';
      ctx.lineWidth = edge.level === 'primary' ? 3 : 2;
      
      ctx.beginPath();
      edge.polyline.forEach((point, i) => {
        const x = point.x * scaleX;
        const y = point.y * scaleY;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  };

  const drawPlannedPath = (ctx, scaleX, scaleY) => {
    if (!planResult?.stitchedPath) return;
    
    // 绘制规划路径（琥珀色）
    ctx.strokeStyle = '#F5B248';
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    planResult.stitchedPath.forEach((point, i) => {
      const x = point.x * scaleX;
      const y = point.y * scaleY;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.globalAlpha = 1;
    
    // 绘制已经过的路径（红色）
    if (visitedPaths.length > 1) {
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 6;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      visitedPaths.forEach((point, i) => {
        const x = point.x * scaleX;
        const y = point.y * scaleY;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  };

  const drawNodes = (ctx, scaleX, scaleY) => {
    graph.nodes.forEach(node => {
      const x = node.x * scaleX;
      const y = node.y * scaleY;
      const isSelected = selectedNodes.has(node.id);
      const isVisited = visitedNodes.has(node.id);
      
      if (node.id === graph.startId) {
        // 起点标记S
        ctx.fillStyle = '#F5B248';
        ctx.strokeStyle = '#0C0F10';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#0C0F10';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('S', x, y);
      } else if (isSelected) {
        // 配送点 - 闪烁效果
        ctx.fillStyle = 'rgba(60, 230, 192, 0.2)';
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#3CE6C0';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.6 + 0.4 * Math.sin(Date.now() * 0.005);
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // 配送点主体
        if (isVisited) {
          // 已送达 - 红色旗帜
          ctx.fillStyle = '#DC2626';
          ctx.strokeStyle = '#0C0F10';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🚩', x, y);
        } else {
          // 未访问 - 薄荷色
          ctx.fillStyle = '#3CE6C0';
          ctx.strokeStyle = '#0C0F10';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      } else {
        // 普通节点
        ctx.fillStyle = 'rgba(107, 114, 128, 0.6)';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    // 绘制外卖车
    if (courierPosition) {
      const x = courierPosition.x * scaleX;
      const y = courierPosition.y * scaleY;
      
      ctx.fillStyle = '#F97316';
      ctx.strokeStyle = '#0C0F10';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#0C0F10';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚗', x, y);
    }
  };

  // 点击处理
  const handleCanvasClick = (event) => {
    if (!graph || isPlanning || isAnimating) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const dpr = window.devicePixelRatio || 1;
    const canvasX = (event.clientX - rect.left) * dpr;
    const canvasY = (event.clientY - rect.top) * dpr;
    
    const scaleX = (rect.width * dpr) / 1200;
    const scaleY = (rect.height * dpr) / 800;
    
    // 查找点击的节点
    let foundNode = null;
    let minDistance = Infinity;
    
    for (const node of graph.nodes) {
      const nodeX = node.x * scaleX;
      const nodeY = node.y * scaleY;
      const dist = Math.sqrt((canvasX - nodeX) ** 2 + (canvasY - nodeY) ** 2);
      
      if (dist < 35 && node.id !== graph.startId && dist < minDistance) {
        foundNode = node;
        minDistance = dist;
      }
    }
    
    if (foundNode) {
      setSelectedNodes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(foundNode.id)) {
          newSet.delete(foundNode.id);
        } else if (newSet.size < 10) {
          newSet.add(foundNode.id);
        }
        return newSet;
      });
      
      setPlanResult(null);
    }
  };

  // 控制函数
  const handleRandomSelect = () => {
    if (!graph) return;
    
    const available = graph.nodes.filter(n => n.id !== graph.startId);
    const count = 5 + Math.floor(Math.random() * 6);
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    
    setSelectedNodes(new Set(shuffled.slice(0, count).map(n => n.id)));
    setPlanResult(null);
    setIsAnimating(false);
  };

  const handleStartAnimation = () => {
    if (!planResult?.stitchedPath) return;
    
    setAnimationProgress(0);
    setVisitedNodes(new Set());
    setVisitedPaths([planResult.stitchedPath[0]]);
    
    if (planResult.stitchedPath.length > 0) {
      setCourierPosition(planResult.stitchedPath[0]);
    }
    
    setIsAnimating(true);
  };

  const handlePauseResume = () => {
    setIsAnimating(!isAnimating);
  };

  const handleReset = () => {
    setIsAnimating(false);
    setAnimationProgress(0);
    setVisitedNodes(new Set());
    setVisitedPaths([]);
    setCourierPosition(null);
  };

  return (
    <section
      id={id}
      ref={sectionRef}
      className="snap-section relative flex items-center justify-center overflow-hidden"
    >
      {/* 背景区域 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-deep)]" />
      
      {/* 主内容区域 */}
      <div className="relative z-10 w-full h-full flex" style={{ padding: '80px 24px' }}>
        {/* 左侧Canvas区域 */}
        <div className="flex-1 relative bg-[var(--bg-deep)] rounded-xl shadow-2xl" style={{ marginRight: '320px' }}>
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-pointer rounded-xl"
            onClick={handleCanvasClick}
            style={{ display: 'block' }}
          />
        </div>

        {/* 右侧控制面板 */}
        <div className="w-80 bg-[var(--bg-card)] rounded-xl p-6 shadow-2xl border border-[var(--border-subtle)] absolute right-6 top-20 bottom-20 overflow-y-auto">
          <div className="flex flex-col h-full">
            {/* 标题 */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                🚚 外卖员最佳配送路径
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                智能优化算法 - 点击选择配送点，规划最优路径
              </p>
            </div>

            {/* 控制按钮 */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleRandomSelect}
                  disabled={isPlanning || isAnimating}
                  className="px-4 py-2 bg-[var(--accent-orange)] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 text-sm font-medium"
                >
                  随机选择
                </button>
                
                <button
                  onClick={runTSPPlanning}
                  disabled={!graph || selectedNodes.size === 0 || isPlanning || isAnimating}
                  className="px-4 py-2 bg-[var(--accent-amber)] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 text-sm font-medium"
                >
                  {isPlanning ? '规划中...' : '路径规划'}
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleStartAnimation}
                  disabled={!planResult || isAnimating}
                  className="px-4 py-2 bg-[var(--accent-green)] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 text-sm font-medium"
                >
                  开始配送
                </button>
                
                <button
                  onClick={handlePauseResume}
                  disabled={!planResult}
                  className="px-4 py-2 bg-[var(--accent-blue)] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 text-sm font-medium"
                >
                  {isAnimating ? '暂停' : '继续'}
                </button>
              </div>
              
              <button
                onClick={handleReset}
                disabled={!planResult}
                className="w-full px-4 py-2 bg-[var(--text-secondary)] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 text-sm font-medium"
              >
                重置
              </button>
            </div>

            {/* 速度控制 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                配送速度
              </label>
              <select
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] text-sm"
              >
                <option value="slow">慢速</option>
                <option value="medium">中速</option>
                <option value="fast">快速</option>
              </select>
            </div>

            {/* KPI显示 */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">配送点:</span>
                <span className="text-[var(--text-primary)] font-medium">
                  {visitedNodes.size}/{selectedNodes.size}
                </span>
              </div>
              
              {planResult && (
                <>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">总距离:</span>
                    <span className="text-[var(--text-primary)] font-medium">
                      {planResult.distance?.toFixed(0)}px
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">优化迭代:</span>
                    <span className="text-[var(--text-primary)] font-medium">
                      {planResult.iters}次
                    </span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">进度:</span>
                <span className="text-[var(--text-primary)] font-medium">
                  {planResult ? Math.round((animationProgress / (planResult.stitchedPath?.length - 1)) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* 说明 */}
            <div className="mt-auto pt-4 border-t border-[var(--border-subtle)]">
              <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                点击地图上的节点选择配送点，使用TSP算法计算最优配送路径。动画展示外卖车沿路径配送的过程。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}