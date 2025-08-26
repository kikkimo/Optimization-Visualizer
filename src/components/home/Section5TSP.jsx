import React, { useState, useEffect, useRef } from 'react';
import DownHint from './DownHint';

// TSP配送路径规划组件 - 简化版本（无Worker）
export default function Section5TSP({ id }) {
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
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const [visitedNodes, setVisitedNodes] = useState(new Set());
  const [visitedPaths, setVisitedPaths] = useState([]);
  const [courierPosition, setCourierPosition] = useState(null);
  const [animationSpeed, setAnimationSpeed] = useState('medium');
  const [speedDropdownOpen, setSpeedDropdownOpen] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('heuristic');
  const [algorithmDropdownOpen, setAlgorithmDropdownOpen] = useState(false);
  
  // 地图编辑状态
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedNode, setDraggedNode] = useState(null);
  const [connectingNode, setConnectingNode] = useState(null);
  const [tempEdge, setTempEdge] = useState(null);
  const [selectedNodeForEdit, setSelectedNodeForEdit] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  // 数据反归一化 - 从0-1坐标转换为Canvas尺寸
  const denormalizeGraphData = (graphData) => {
    const CANVAS_WIDTH = 1200;
    const CANVAS_HEIGHT = 800;
    
    return {
      ...graphData,
      nodes: graphData.nodes.map(node => ({
        ...node,
        x: node.x * CANVAS_WIDTH,
        y: node.y * CANVAS_HEIGHT
      })),
      edges: graphData.edges.map(edge => ({
        ...edge,
        polyline: edge.polyline.map(point => ({
          x: point.x * CANVAS_WIDTH,
          y: point.y * CANVAS_HEIGHT
        })),
        length: edge.length * CANVAS_WIDTH // 距离也需要反归一化
      }))
    };
  };

  // 加载固定路网数据
  useEffect(() => {
    console.log('[Graph] === 开始加载图数据 ===');
    
    fetch('/src/assets/graph/tsp_fixed_graph.json')
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
        
        // 检查数据是否需要反归一化（判断坐标是否在0-1范围内）
        const isNormalized = data.nodes.every(node => 
          node.x >= 0 && node.x <= 1 && node.y >= 0 && node.y <= 1
        );
        
        let processedData;
        if (isNormalized) {
          console.log('[Graph] 🔄 检测到归一化数据，转换为Canvas尺寸');
          processedData = denormalizeGraphData(data);
        } else {
          console.log('[Graph] 📏 使用原始Canvas尺寸数据');
          processedData = data;
        }
        
        setGraph({
          ...processedData,
          startId: processedData.startId || 0
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
  }, [graph, selectedNodes, planResult, visitedPaths, courierPosition, tempEdge, connectingNode, selectedNodeForEdit, hoveredNode, draggedNode, isEditMode]);

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

  // Christofides算法 - 保证解不超过最优解的1.5倍
  const christofides = (distanceMatrix) => {
    const n = distanceMatrix.length;
    
    // 1. 构建最小生成树 (Prim算法)
    const mst = [];
    const visited = new Array(n).fill(false);
    const key = new Array(n).fill(Infinity);
    const parent = new Array(n).fill(-1);
    
    key[0] = 0;
    
    for (let count = 0; count < n - 1; count++) {
      let u = -1;
      for (let v = 0; v < n; v++) {
        if (!visited[v] && (u === -1 || key[v] < key[u])) {
          u = v;
        }
      }
      
      visited[u] = true;
      
      for (let v = 0; v < n; v++) {
        if (!visited[v] && distanceMatrix[u][v] < key[v]) {
          parent[v] = u;
          key[v] = distanceMatrix[u][v];
        }
      }
    }
    
    // 构建MST边集
    for (let i = 1; i < n; i++) {
      mst.push([parent[i], i]);
      mst.push([i, parent[i]]); // 无向图
    }
    
    // 2. 找出奇度顶点
    const degree = new Array(n).fill(0);
    mst.forEach(([u, v]) => degree[u]++);
    const oddVertices = [];
    for (let i = 0; i < n; i++) {
      if (degree[i] % 2 === 1) {
        oddVertices.push(i);
      }
    }
    
    // 3. 简化版最小权匹配（贪心近似）
    const matching = [];
    const used = new Set();
    for (let i = 0; i < oddVertices.length; i += 2) {
      if (i + 1 < oddVertices.length) {
        matching.push([oddVertices[i], oddVertices[i + 1]]);
      }
    }
    
    // 4. 构建欧拉图
    const eulerGraph = [...mst];
    matching.forEach(([u, v]) => {
      eulerGraph.push([u, v]);
      eulerGraph.push([v, u]);
    });
    
    // 5. 简化版欧拉回路（DFS遍历）
    const adj = Array.from({ length: n }, () => []);
    eulerGraph.forEach(([u, v]) => adj[u].push(v));
    
    const tour = [0];
    const visitedNodes = new Set([0]);
    
    const dfs = (u) => {
      for (let v of adj[u]) {
        if (!visitedNodes.has(v)) {
          visitedNodes.add(v);
          tour.push(v);
          dfs(v);
        }
      }
    };
    
    dfs(0);
    
    // 如果没有访问完所有节点，用最近邻补充
    for (let i = 0; i < n; i++) {
      if (!visitedNodes.has(i)) {
        tour.push(i);
      }
    }
    
    return { tour, iters: 1 };
  };

  // 遗传算法
  const geneticAlgorithm = (distanceMatrix) => {
    const n = distanceMatrix.length;
    const POPULATION_SIZE = Math.min(50, Math.max(20, n * 2));
    const GENERATIONS = Math.min(100, Math.max(50, n * 3));
    const MUTATION_RATE = 0.1;
    const ELITE_SIZE = Math.max(2, Math.floor(POPULATION_SIZE * 0.1));
    
    const tourDistance = (tour) => {
      let dist = 0;
      for (let i = 1; i < tour.length; i++) {
        dist += distanceMatrix[tour[i - 1]][tour[i]];
      }
      return dist;
    };
    
    // 初始化种群
    let population = [];
    for (let i = 0; i < POPULATION_SIZE; i++) {
      const tour = [0, ...Array.from({ length: n - 1 }, (_, idx) => idx + 1)];
      // 随机打乱除起点外的节点
      for (let j = 1; j < tour.length; j++) {
        const k = 1 + Math.floor(Math.random() * (tour.length - 1));
        [tour[j], tour[k]] = [tour[k], tour[j]];
      }
      population.push({ tour, fitness: 1 / (1 + tourDistance(tour)) });
    }
    
    for (let gen = 0; gen < GENERATIONS; gen++) {
      // 选择精英
      population.sort((a, b) => b.fitness - a.fitness);
      const newPopulation = population.slice(0, ELITE_SIZE);
      
      // 生成新个体
      while (newPopulation.length < POPULATION_SIZE) {
        // 轮盘赌选择
        const parent1 = population[Math.floor(Math.random() * Math.min(20, population.length))];
        const parent2 = population[Math.floor(Math.random() * Math.min(20, population.length))];
        
        // 顺序交叉
        const child = crossover(parent1.tour, parent2.tour);
        
        // 变异
        if (Math.random() < MUTATION_RATE) {
          mutate(child);
        }
        
        newPopulation.push({
          tour: child,
          fitness: 1 / (1 + tourDistance(child))
        });
      }
      
      population = newPopulation;
    }
    
    population.sort((a, b) => b.fitness - a.fitness);
    return { tour: population[0].tour, iters: GENERATIONS };
  };
  
  const crossover = (parent1, parent2) => {
    const n = parent1.length;
    const start = 1 + Math.floor(Math.random() * (n - 2));
    const end = start + Math.floor(Math.random() * (n - start));
    
    const child = new Array(n);
    child[0] = 0; // 固定起点
    
    // 复制片段
    for (let i = start; i <= end; i++) {
      child[i] = parent1[i];
    }
    
    // 填充剩余位置
    const remaining = parent2.filter(node => !child.includes(node));
    let remainingIndex = 0;
    
    for (let i = 1; i < n; i++) {
      if (child[i] === undefined) {
        child[i] = remaining[remainingIndex++];
      }
    }
    
    return child;
  };
  
  const mutate = (tour) => {
    if (tour.length <= 3) return;
    const i = 1 + Math.floor(Math.random() * (tour.length - 1));
    const j = 1 + Math.floor(Math.random() * (tour.length - 1));
    [tour[i], tour[j]] = [tour[j], tour[i]];
  };

  // 模拟退火算法
  const simulatedAnnealing = (distanceMatrix) => {
    const n = distanceMatrix.length;
    const MAX_ITERS = Math.min(1000, Math.max(500, n * 50));
    const INITIAL_TEMP = 1000;
    const COOLING_RATE = 0.995;
    
    const tourDistance = (tour) => {
      let dist = 0;
      for (let i = 1; i < tour.length; i++) {
        dist += distanceMatrix[tour[i - 1]][tour[i]];
      }
      return dist;
    };
    
    // 初始解（最近邻）
    let currentTour = nearestNeighbor(distanceMatrix, 0);
    let currentDistance = tourDistance(currentTour);
    let bestTour = [...currentTour];
    let bestDistance = currentDistance;
    
    let temperature = INITIAL_TEMP;
    
    for (let iter = 0; iter < MAX_ITERS; iter++) {
      // 生成邻居解（2-opt变换）
      const newTour = [...currentTour];
      const i = 1 + Math.floor(Math.random() * (n - 2));
      const j = 1 + Math.floor(Math.random() * (n - 2));
      if (i !== j) {
        [newTour[i], newTour[j]] = [newTour[j], newTour[i]];
      }
      
      const newDistance = tourDistance(newTour);
      const delta = newDistance - currentDistance;
      
      // 接受条件
      if (delta < 0 || Math.random() < Math.exp(-delta / temperature)) {
        currentTour = newTour;
        currentDistance = newDistance;
        
        if (currentDistance < bestDistance) {
          bestTour = [...currentTour];
          bestDistance = currentDistance;
        }
      }
      
      temperature *= COOLING_RATE;
    }
    
    return { tour: bestTour, iters: MAX_ITERS };
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
    
    // 清空上一次规划的路径和配送路径
    setPlanResult(null);
    setVisitedNodes(new Set());
    setVisitedPaths([]);
    setCourierPosition(null);
    setAnimationProgress(0);
    setAnimationCompleted(false);
    setIsAnimating(false);
    
    setIsPlanning(true);
    
    try {
      // 构建节点集合
      const nodeIds = [graph.startId, ...Array.from(selectedNodes)];
      
      console.log('[Plan] 构建距离矩阵...');
      const { matrix, paths } = buildDistanceMatrix(graph, nodeIds);
      
      // 根据选择的算法运行
      let optimizedTour, iters;
      
      switch (selectedAlgorithm) {
        case 'genetic':
          console.log('[Plan] 使用遗传算法');
          ({ tour: optimizedTour, iters } = geneticAlgorithm(matrix));
          break;
        case 'annealing':
          console.log('[Plan] 使用模拟退火算法');
          ({ tour: optimizedTour, iters } = simulatedAnnealing(matrix));
          break;
        default: // 'heuristic'
          console.log('[Plan] 使用启发式算法 (最近邻 + 2-opt)');
          const initialTour = nearestNeighbor(matrix, 0);
          ({ tour: optimizedTour, iters } = twoOpt(initialTour, matrix));
          break;
      }
      
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

  // 编辑模式动画循环（用于橡皮筋效果、节点高亮和拖拽实时显示）
  useEffect(() => {
    if (!isEditMode || (!connectingNode && !selectedNodeForEdit && !draggedNode)) return;
    
    let animationId;
    const animate = () => {
      // 触发重绘以显示动画效果
      const canvas = canvasRef.current;
      if (canvas) {
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        draw(ctx, rect.width, rect.height);
      }
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isEditMode, connectingNode, selectedNodeForEdit, draggedNode, tempEdge]);

  // 动画更新
  useEffect(() => {
    if (!isAnimating || !planResult?.stitchedPath) return;
    // 速度控制
    const speedMap = { slow: 0.06, medium: 0.1, fast: 0.2 };
    const speed = speedMap[animationSpeed];
    
    const animate = () => {
      setAnimationProgress(prev => {
        const newProgress = prev + speed;
        const maxProgress = planResult.stitchedPath.length - 1;
        
        if (newProgress >= maxProgress) {
          // 确保配送车到达最终位置
          setCourierPosition(planResult.stitchedPath[planResult.stitchedPath.length - 1]);
          // 确保完整路径被标记为已访问
          setVisitedPaths(planResult.stitchedPath);
          
          // 确保所有配送点都被标记为已访问
          const deliveryNodes = planResult.order.slice(1);
          setVisitedNodes(prev => {
            const newSet = new Set(prev);
            deliveryNodes.forEach(nodeId => {
              if (!newSet.has(nodeId)) {
                newSet.add(nodeId);
                console.log(`[Animation] 🚩 终点确保送达配送点 ${nodeId}`);
              }
            });
            return newSet;
          });
          
          console.log(`[Animation] ✅ 配送车已到达终点！`);
          setIsAnimating(false);
          setAnimationCompleted(true);
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
              if (node && distance(currentPos, node) < 25) { // 增加检测距离
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

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (speedDropdownOpen && !event.target.closest('.speed-dropdown')) {
        setSpeedDropdownOpen(false);
      }
      if (algorithmDropdownOpen && !event.target.closest('.algorithm-dropdown')) {
        setAlgorithmDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [speedDropdownOpen, algorithmDropdownOpen]);


  // 地图编辑功能 - 数据归一化和本地下载
  const normalizeGraphData = (graphData) => {
    // 将坐标归一化到0-1范围内（基于1200x800画布）
    const normalizedGraph = {
      ...graphData,
      nodes: graphData.nodes.map(node => ({
        ...node,
        x: Math.max(0, Math.min(1, node.x / 1200)),
        y: Math.max(0, Math.min(1, node.y / 800))
      })),
      edges: graphData.edges.map(edge => ({
        ...edge,
        polyline: edge.polyline.map(point => ({
          x: Math.max(0, Math.min(1, point.x / 1200)),
          y: Math.max(0, Math.min(1, point.y / 800))
        })),
        length: edge.length / 1200 // 距离也归一化
      }))
    };
    
    return normalizedGraph;
  };

  const saveEditedGraph = () => {
    try {
      // 归一化数据
      const normalizedGraph = normalizeGraphData(graph);
      
      // 创建JSON字符串
      const jsonString = JSON.stringify(normalizedGraph, null, 2);
      
      // 创建Blob并下载
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tsp_fixed_graph.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      
      console.log('[Edit] 地图数据已下载（坐标归一化到0-1范围）');
      setIsEditMode(false);
      
    } catch (error) {
      console.error('[Edit] 保存错误:', error);
    }
  };

  // 边相交检测
  const doLinesIntersect = (line1, line2) => {
    const [p1, p2] = line1;
    const [p3, p4] = line2;
    
    // 检查端点重合（允许共享端点）
    const tolerance = 5; // 5像素容差
    const shareEndpoint = (
      Math.hypot(p1.x - p3.x, p1.y - p3.y) < tolerance ||
      Math.hypot(p1.x - p4.x, p1.y - p4.y) < tolerance ||
      Math.hypot(p2.x - p3.x, p2.y - p3.y) < tolerance ||
      Math.hypot(p2.x - p4.x, p2.y - p4.y) < tolerance
    );
    
    if (shareEndpoint) {
      return false; // 共享端点不算相交
    }
    
    const denominator = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    
    if (Math.abs(denominator) < 1e-10) {
      return false; // 平行线
    }
    
    const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denominator;
    const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denominator;
    
    // 严格在线段内部相交才算相交（不包括端点）
    return ua > 0.001 && ua < 0.999 && ub > 0.001 && ub < 0.999;
  };

  // 检查新边是否与现有边相交
  const checkEdgeIntersection = (newEdge) => {
    const newLine = [newEdge.start, newEdge.end];
    console.log('[Edit] 🔍 检查边相交:', {
      newEdge: {
        start: { x: Math.round(newEdge.start.x), y: Math.round(newEdge.start.y) },
        end: { x: Math.round(newEdge.end.x), y: Math.round(newEdge.end.y) }
      },
      totalEdges: graph.edges.length
    });
    
    for (const edge of graph.edges) {
      if (edge.polyline.length < 2) continue;
      
      for (let i = 0; i < edge.polyline.length - 1; i++) {
        const existingLine = [edge.polyline[i], edge.polyline[i + 1]];
        
        if (doLinesIntersect(newLine, existingLine)) {
          console.log('[Edit] ❌ 发现相交:', {
            existingEdge: edge.id,
            segment: i,
            existingLine: {
              start: { x: Math.round(existingLine[0].x), y: Math.round(existingLine[0].y) },
              end: { x: Math.round(existingLine[1].x), y: Math.round(existingLine[1].y) }
            }
          });
          return true;
        }
      }
    }
    
    console.log('[Edit] ✅ 无相交，可以添加边');
    return false;
  };

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
      const isEditSelected = selectedNodeForEdit?.id === node.id;
      const isConnecting = connectingNode?.id === node.id;
      const isHovered = hoveredNode?.id === node.id;
      
      // 编辑模式下的特殊高亮
      if (isEditMode) {
        if (isEditSelected || isConnecting) {
          // 选中或连线起点的高亮背景
          ctx.fillStyle = 'rgba(245, 178, 72, 0.3)';
          ctx.beginPath();
          ctx.arc(x, y, 25, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.strokeStyle = '#F5B248';
          ctx.lineWidth = 3;
          ctx.globalAlpha = 0.7 + 0.3 * Math.sin(Date.now() * 0.008);
          ctx.beginPath();
          ctx.arc(x, y, 22, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        } else if (isHovered && connectingNode) {
          // 连线目标节点的捕捉高亮
          ctx.fillStyle = 'rgba(60, 230, 192, 0.4)';
          ctx.beginPath();
          ctx.arc(x, y, 20, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.strokeStyle = '#3CE6C0';
          ctx.lineWidth = 3;
          ctx.globalAlpha = 0.8 + 0.2 * Math.sin(Date.now() * 0.01);
          ctx.beginPath();
          ctx.arc(x, y, 17, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
      
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
      } else if (isSelected && !isEditMode) {
        // 配送点 - 闪烁效果（仅在非编辑模式）
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
        const nodeSize = isEditMode ? 8 : 6;
        const nodeAlpha = isEditMode ? 0.8 : 0.6;
        ctx.fillStyle = `rgba(107, 114, 128, ${nodeAlpha})`;
        ctx.beginPath();
        ctx.arc(x, y, nodeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // 编辑模式下节点的边框
        if (isEditMode) {
          ctx.strokeStyle = '#6B7280';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
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
    
    // 绘制编辑模式的临时边（橡皮筋效果）
    if (isEditMode && tempEdge) {
      console.log('[Draw] 🔗 绘制橡皮筋:', {
        start: tempEdge.start,
        end: tempEdge.end,
        snapped: tempEdge.snapped
      });
      const isSnapped = tempEdge.snapped;
      
      ctx.strokeStyle = isSnapped ? '#3CE6C0' : '#F5B248';
      ctx.lineWidth = isSnapped ? 4 : 3;
      ctx.setLineDash(isSnapped ? [8, 4] : [12, 6]);
      ctx.globalAlpha = isSnapped ? 0.9 : 0.7;
      
      ctx.beginPath();
      ctx.moveTo(tempEdge.start.x * scaleX, tempEdge.start.y * scaleY);
      ctx.lineTo(tempEdge.end.x * scaleX, tempEdge.end.y * scaleY);
      ctx.stroke();
      
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      
      // 如果捕捉到节点，在端点绘制连接指示器
      if (isSnapped) {
        ctx.fillStyle = '#3CE6C0';
        ctx.beginPath();
        ctx.arc(tempEdge.end.x * scaleX, tempEdge.end.y * scaleY, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // 额外的高亮环
        ctx.strokeStyle = '#3CE6C0';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(tempEdge.end.x * scaleX, tempEdge.end.y * scaleY, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
    
    // 绘制连线状态指示 - 连线起点的动画高亮
    if (isEditMode && connectingNode) {
      console.log('[Draw] 🎯 连线模式激活, connectingNode:', connectingNode.id);
      const x = connectingNode.x * scaleX;
      const y = connectingNode.y * scaleY;
      
      // 外圈动画
      ctx.strokeStyle = '#F5B248';
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(Date.now() * 0.008);
      ctx.beginPath();
      ctx.arc(x, y, 28, 0, Math.PI * 2);
      ctx.stroke();
      
      // 内圈固定
      ctx.strokeStyle = '#F5B248';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  };

  // 鼠标事件处理
  const getMousePosition = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const x = (event.clientX - rect.left) / rect.width * 1200;
    const y = (event.clientY - rect.top) / rect.height * 800;
    
    return { x, y };
  };

  const findNodeAt = (position) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / 1200;
    const scaleY = rect.height / 800;
    
    for (const node of graph.nodes) {
      const dist = Math.sqrt(
        Math.pow((position.x - node.x) * scaleX, 2) + 
        Math.pow((position.y - node.y) * scaleY, 2)
      );
      
      if (dist < 20) {
        return node;
      }
    }
    return null;
  };

  const handleMouseDown = (event) => {
    console.log('[MouseDown] 触发鼠标按下事件', { 
      isEditMode, 
      shiftKey: event.shiftKey, 
      ctrlKey: event.ctrlKey,
      button: event.button,
      type: event.type
    });
    
    if (!graph || isPlanning || isAnimating) {
      console.log('[MouseDown] 状态阻止操作:', { graph: !!graph, isPlanning, isAnimating });
      return;
    }
    
    const mousePos = getMousePosition(event);
    const clickedNode = findNodeAt(mousePos);
    console.log('[MouseDown] 鼠标位置和节点:', { mousePos, clickedNode: clickedNode?.id });
    
    if (isEditMode) {
      console.log('[MouseDown] 编辑模式处理');
      if (clickedNode) {
        if (event.shiftKey) {
          // Shift+点击时的连线模式
          console.log(`[Edit] ✨ Shift+点击节点 ${clickedNode.id}, 当前连线状态:`, connectingNode?.id);
          event.preventDefault(); // 防止其他事件干扰
          
          if (!connectingNode) {
            // 开始连线
            console.log(`[Edit] 🎯 开始连线模式，起点: ${clickedNode.id}`);
            setConnectingNode(clickedNode);
            setSelectedNodeForEdit(clickedNode);
            setTempEdge(null); // 清空临时边
          } else if (connectingNode.id !== clickedNode.id) {
            // 完成连线
            console.log(`[Edit] 🔗 尝试连接: ${connectingNode.id} -> ${clickedNode.id}`);
            const newEdge = {
              start: { x: connectingNode.x, y: connectingNode.y },
              end: { x: clickedNode.x, y: clickedNode.y }
            };
            
            if (!checkEdgeIntersection(newEdge)) {
              const edgeId = Math.max(...graph.edges.map(e => e.id)) + 1;
              const newGraphEdge = {
                id: edgeId,
                a: connectingNode.id,
                b: clickedNode.id,
                level: 'secondary',
                polyline: [newEdge.start, newEdge.end],
                length: Math.hypot(newEdge.end.x - newEdge.start.x, newEdge.end.y - newEdge.start.y)
              };
              
              setGraph(prev => ({
                ...prev,
                edges: [...prev.edges, newGraphEdge],
                adjacency: {
                  ...prev.adjacency,
                  [connectingNode.id]: [...(prev.adjacency[connectingNode.id] || []), edgeId],
                  [clickedNode.id]: [...(prev.adjacency[clickedNode.id] || []), edgeId]
                }
              }));
              
              console.log(`[Edit] ✅ 完成连线: ${connectingNode.id} -> ${clickedNode.id}`);
            } else {
              console.log('[Edit] ❌ 边相交，无法添加');
            }
            
            // 清理连线状态
            setConnectingNode(null);
            setTempEdge(null);
            setSelectedNodeForEdit(null);
          } else {
            console.log('[Edit] ⚠️ 点击了同一个节点，取消连线');
            setConnectingNode(null);
            setTempEdge(null);
            setSelectedNodeForEdit(null);
          }
        } else {
          // 普通拖拽模式 - 只有在没有按Shift键时才拖拽
          console.log(`[Edit] 🖱️ 开始拖拽节点: ${clickedNode.id}`);
          // 先清理连线状态
          setConnectingNode(null);
          setTempEdge(null);
          // 开始拖拽
          setDraggedNode(clickedNode);
          setSelectedNodeForEdit(clickedNode);
        }
      } else {
        console.log('[Edit] 点击空白区域，清理所有编辑状态');
        // 点击空白区域，清理所有状态
        setConnectingNode(null);
        setTempEdge(null);
        setSelectedNodeForEdit(null);
        setDraggedNode(null);
      }
    } else {
      console.log('[MouseDown] 非编辑模式处理配送点选择');
      // 非编辑模式 - 处理配送点选择
      if (clickedNode && clickedNode.id !== graph.startId) {
        setSelectedNodes(prev => {
          const newSet = new Set(prev);
          if (newSet.has(clickedNode.id)) {
            newSet.delete(clickedNode.id);
            console.log(`[Select] 取消选择配送点: ${clickedNode.id}`);
          } else if (newSet.size < 12) {
            newSet.add(clickedNode.id);
            console.log(`[Select] 选择配送点: ${clickedNode.id}`);
          }
          return newSet;
        });
        
        setPlanResult(null);
      }
    }
  };

  const handleMouseMove = (event) => {
    if (!isEditMode) return;
    
    const mousePos = getMousePosition(event);
    
    // 检查鼠标悬停的节点
    const hoveredNodeAtPos = findNodeAt(mousePos);
    setHoveredNode(hoveredNodeAtPos);
    
    console.log('[MouseMove] 移动状态:', { 
      mousePos: { x: Math.round(mousePos.x), y: Math.round(mousePos.y) },
      draggedNode: draggedNode?.id, 
      connectingNode: connectingNode?.id,
      hoveredNode: hoveredNodeAtPos?.id
    });
    
    if (draggedNode) {
      // 实时更新拖拽节点位置
      console.log(`[Edit] 拖拽节点 ${draggedNode.id} 到位置:`, mousePos);
      setGraph(prev => ({
        ...prev,
        nodes: prev.nodes.map(node => 
          node.id === draggedNode.id 
            ? { ...node, x: mousePos.x, y: mousePos.y }
            : node
        ),
        edges: prev.edges.map(edge => {
          // 如果边连接了被拖拽的节点，需要更新对应的端点
          if (edge.a === draggedNode.id || edge.b === draggedNode.id) {
            const newPolyline = [...edge.polyline];
            
            // 更新起点
            if (edge.a === draggedNode.id && newPolyline.length > 0) {
              newPolyline[0] = { x: mousePos.x, y: mousePos.y };
            }
            
            // 更新终点
            if (edge.b === draggedNode.id && newPolyline.length > 0) {
              newPolyline[newPolyline.length - 1] = { x: mousePos.x, y: mousePos.y };
            }
            
            // 重新计算边长度
            let newLength = 0;
            for (let i = 1; i < newPolyline.length; i++) {
              const dist = Math.hypot(
                newPolyline[i].x - newPolyline[i-1].x,
                newPolyline[i].y - newPolyline[i-1].y
              );
              newLength += dist;
            }
            
            return {
              ...edge,
              polyline: newPolyline,
              length: newLength
            };
          }
          return edge;
        })
      }));
      
      setDraggedNode({ ...draggedNode, x: mousePos.x, y: mousePos.y });
    } else if (connectingNode) {
      // 连线模式的橡皮筋效果
      console.log('[Edit] 🎯 橡皮筋效果更新, connectingNode:', connectingNode.id, 'hoveredNode:', hoveredNodeAtPos?.id);
      const targetNode = hoveredNodeAtPos && hoveredNodeAtPos.id !== connectingNode.id ? hoveredNodeAtPos : null;
      
      const newTempEdge = {
        start: { x: connectingNode.x, y: connectingNode.y },
        end: targetNode ? { x: targetNode.x, y: targetNode.y } : mousePos,
        snapped: !!targetNode
      };
      
      console.log('[Edit] 🔗 设置临时边:', newTempEdge);
      setTempEdge(newTempEdge);
    }
  };

  const handleMouseUp = () => {
    console.log('[MouseUp] 鼠标释放', { 
      draggedNode: draggedNode?.id, 
      connectingNode: connectingNode?.id 
    });
    
    if (draggedNode) {
      console.log(`[Edit] ✅ 节点 ${draggedNode.id} 移动完成，清理选择状态`);
      setDraggedNode(null);
      setSelectedNodeForEdit(null); // 清除节点选择高亮
      
      // 强制触发重绘确保高亮立即清除
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const container = canvas.parentElement;
          const rect = container.getBoundingClientRect();
          const ctx = canvas.getContext('2d');
          draw(ctx, rect.width, rect.height);
        }
      }, 10);
    }
    
    // 不要在鼠标释放时清理连线状态，因为连线模式需要保持到下次点击
    // 只清理悬停状态
    setHoveredNode(null);
  };


  // 控制函数
  const handleRandomSelect = () => {
    if (!graph) return;
    
    // 先重置所有状态
    handleClearDelivery();
    setPlanResult(null);
    
    const available = graph.nodes.filter(n => n.id !== graph.startId);
    const count = Math.min(6 + Math.floor(Math.random() * 7), available.length, 12); // 6-12个，不超过可用节点数
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    
    setSelectedNodes(new Set(shuffled.slice(0, count).map(n => n.id)));
  };

  // 合并的开始/暂停/继续按钮处理函数
  const handleStartPauseResume = () => {
    if (!planResult?.stitchedPath) return;
    
    if (animationCompleted || (!isAnimating && animationProgress === 0)) {
      // 开始配送（首次或动画完成后重新开始）
      setAnimationProgress(0);
      setVisitedNodes(new Set());
      setVisitedPaths([planResult.stitchedPath[0]]);
      setAnimationCompleted(false);
      
      if (planResult.stitchedPath.length > 0) {
        setCourierPosition(planResult.stitchedPath[0]);
      }
      
      setIsAnimating(true);
    } else {
      // 暂停/继续
      setIsAnimating(!isAnimating);
    }
  };

  // 获取开始/暂停/继续按钮的文本
  const getStartButtonText = () => {
    if (animationCompleted) return '开始配送';
    if (!isAnimating && animationProgress === 0) return '开始配送';
    return isAnimating ? '暂停' : '继续';
  };

  // 清空配送路线（原重置按钮功能）
  const handleClearDelivery = () => {
    setIsAnimating(false);
    setAnimationProgress(0);
    setVisitedNodes(new Set());
    setVisitedPaths([]);
    setCourierPosition(null);
    setAnimationCompleted(false);
  };

  // 新的完全重置按钮
  const handleFullReset = () => {
    setIsAnimating(false);
    setAnimationProgress(0);
    setVisitedNodes(new Set());
    setVisitedPaths([]);
    setCourierPosition(null);
    setAnimationCompleted(false);
    setPlanResult(null);
    setSelectedNodes(new Set());
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
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
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
                请选择配送点（最多12个），规划最优路径
              </p>
            </div>

            {/* 控制按钮 */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleRandomSelect}
                  disabled={isPlanning || isAnimating || isEditMode}
                  className="px-4 py-2 bg-[var(--accent-orange)] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 text-sm font-medium"
                >
                  随机选择
                </button>
                
                <button
                  onClick={runTSPPlanning}
                  disabled={!graph || selectedNodes.size === 0 || isPlanning || isAnimating || isEditMode}
                  className="px-4 py-2 bg-[var(--accent-amber)] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 text-sm font-medium"
                >
                  {isPlanning ? '规划中...' : '路径规划'}
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleStartPauseResume}
                  disabled={!planResult || isEditMode}
                  className="px-4 py-2 bg-[var(--accent-green)] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 text-sm font-medium"
                >
                  {getStartButtonText()}
                </button>
                
                <button
                  onClick={handleClearDelivery}
                  disabled={!planResult || isEditMode}
                  className="px-4 py-2 bg-[var(--accent-blue)] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 text-sm font-medium"
                >
                  清空配送路线
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleFullReset}
                  disabled={isEditMode}
                  className="px-4 py-2 bg-[var(--text-secondary)] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 text-sm font-medium"
                >
                  重置
                </button>
                
                <button
                  onClick={() => {
                    if (isEditMode) {
                      saveEditedGraph();
                    } else {
                      // 进入编辑模式时完全重置状态
                      setIsEditMode(true);
                      setIsAnimating(false);
                      setPlanResult(null);
                      setSelectedNodes(new Set());
                      setVisitedNodes(new Set());
                      setVisitedPaths([]);
                      setCourierPosition(null);
                      setAnimationProgress(0);
                      setAnimationCompleted(false);
                      // 重置编辑状态
                      setDraggedNode(null);
                      setConnectingNode(null);
                      setTempEdge(null);
                      setSelectedNodeForEdit(null);
                      setHoveredNode(null);
                      console.log('[Edit] 进入编辑模式，已重置所有状态');
                    }
                  }}
                  disabled={isPlanning || isAnimating}
                  className="px-4 py-2 bg-[var(--tech-mint)] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 text-sm font-medium"
                >
                  {isEditMode ? '保存' : '地图编辑'}
                </button>
              </div>
            </div>

            {/* 算法选择 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                优化算法
              </label>
              <div className="relative algorithm-dropdown">
                <button
                  onClick={() => setAlgorithmDropdownOpen(!algorithmDropdownOpen)}
                  disabled={isEditMode}
                  className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] text-sm text-left flex justify-between items-center hover:bg-opacity-80 disabled:opacity-50"
                >
                  <span>
                    {selectedAlgorithm === 'heuristic' ? '启发式算法 (快速)' : 
                     selectedAlgorithm === 'genetic' ? '遗传算法 (全局搜索)' : 
                     '模拟退火 (跳出局部最优)'}
                  </span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${algorithmDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {algorithmDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg shadow-lg z-50 backdrop-blur-sm" 
                       style={{ backgroundColor: 'var(--bg-card)' }}>
                    {[
                      { value: 'heuristic', label: '启发式算法 (快速)', desc: '最近邻 + 2-opt局部优化' },
                      { value: 'genetic', label: '遗传算法 (全局搜索)', desc: '进化算法，适合复杂问题' },
                      { value: 'annealing', label: '模拟退火 (跳出局部最优)', desc: '概率接受机制，避免局部最优' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedAlgorithm(option.value);
                          setAlgorithmDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-[var(--bg-primary)] ${
                          selectedAlgorithm === option.value ? 'bg-[var(--bg-primary)] text-[var(--accent-amber)]' : 'text-[var(--text-primary)] bg-[var(--bg-card)]'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 速度控制 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                配送速度
              </label>
              <div className="relative speed-dropdown">
                <button
                  onClick={() => setSpeedDropdownOpen(!speedDropdownOpen)}
                  disabled={isEditMode}
                  className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] text-sm text-left flex justify-between items-center hover:bg-opacity-80 disabled:opacity-50"
                >
                  <span>
                    {animationSpeed === 'slow' ? '慢速' : 
                     animationSpeed === 'medium' ? '中速' : '快速'}
                  </span>
                  <span className={`transform transition-transform ${speedDropdownOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                
                {speedDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg shadow-lg z-50 backdrop-blur-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
                    <button
                      onClick={() => {
                        setAnimationSpeed('slow');
                        setSpeedDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-[var(--bg-primary)] ${
                        animationSpeed === 'slow' ? 'bg-[var(--bg-primary)] text-[var(--accent-amber)]' : 'text-[var(--text-primary)] bg-[var(--bg-card)]'
                      }`}
                    >
                      慢速
                    </button>
                    <button
                      onClick={() => {
                        setAnimationSpeed('medium');
                        setSpeedDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-[var(--bg-primary)] ${
                        animationSpeed === 'medium' ? 'bg-[var(--bg-primary)] text-[var(--accent-amber)]' : 'text-[var(--text-primary)] bg-[var(--bg-card)]'
                      }`}
                    >
                      中速
                    </button>
                    <button
                      onClick={() => {
                        setAnimationSpeed('fast');
                        setSpeedDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-[var(--bg-primary)] ${
                        animationSpeed === 'fast' ? 'bg-[var(--bg-primary)] text-[var(--accent-amber)]' : 'text-[var(--text-primary)] bg-[var(--bg-card)]'
                      }`}
                    >
                      快速
                    </button>
                  </div>
                )}
              </div>
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
                      {(planResult.distance * 3)?.toFixed(0)} m
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
                {isEditMode 
                  ? '编辑模式：直接拖拽节点移动位置，Shift+点击两个节点创建连线。新边不能与现有边相交。'
                  : '点击地图上的节点选择配送点，使用TSP算法计算最优配送路径。动画展示外卖车沿路径配送的过程。'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 底部提示 */}
      <DownHint targetSection={5} />
    </section>
  );
}