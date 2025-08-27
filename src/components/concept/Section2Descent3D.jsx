import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { InlineMath, BlockMath } from 'react-katex';

// 可行域随机点组件
const FeasibleRegionPoints = ({ 
  currentActiveTerm, 
  objectiveFunction,
  showConstraints,
  constraintType 
}) => {
  const [points, setPoints] = useState([]);
  const timeoutRef = useRef(null);
  
  // 生成可行域内的随机点
  const generateRandomPoint = useCallback(() => {
    let x, z, y;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
      // 在95%范围内随机选点
      x = (Math.random() - 0.5) * 2 * 50 * 0.95; // X: [-47.5, 47.5]
      z = (Math.random() - 0.5) * 2 * 30 * 0.95; // Z: [-28.5, 28.5]
      attempts++;
      
      // 检查约束条件
      if (!showConstraints) {
        break; // 没有约束条件，直接使用
      }
      
      if (constraintType === 'inequality') {
        // 不等式约束: x^2 + z^2 ≤ 25^2
        const distance = Math.sqrt(x * x + z * z);
        if (distance <= 25) break;
      } else if (constraintType === 'equality') {
        // 等式约束: x - 2z² = 0，在抛物线附近选点
        const targetX = 2 * z * z;
        if (Math.abs(x - targetX) < 5 && targetX <= 47.5) {
          x = targetX; // 投影到抛物线上
          break;
        }
      }
    } while (attempts < maxAttempts);
    
    y = objectiveFunction(x, z);
    return [x, y + 0.15, z];
  }, [objectiveFunction, showConstraints, constraintType]);
  
  // 管理随机点的生成和移除 - 前一个点消失后才生成下一个
  useEffect(() => {
    if (currentActiveTerm === 'feasible-solution') {
      const addNextPoint = () => {
        const newPoint = generateRandomPoint();
        const pointId = Date.now() + Math.random();
        
        setPoints([{ id: pointId, position: newPoint }]); // 只保持一个点
        
        // 3秒后移除这个点，然后生成下一个点
        timeoutRef.current = setTimeout(() => {
          setPoints([]); // 移除当前点
          // 等待0.5秒后生成下一个点
          setTimeout(addNextPoint, 500);
        }, 3000);
      };
      
      // 立即添加第一个点
      addNextPoint();
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    } else {
      // 清除所有点
      setPoints([]);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [currentActiveTerm, generateRandomPoint]);

  return (
    <>
      {points.map(point => (
        <BreathingBall 
          key={point.id}
          position={point.position}
          size={0.9}
          intensity={0.6}
        />
      ))}
    </>
  );
};

// 最优解点组件
const OptimalSolutionPoint = ({ currentActiveTerm, objectiveFunction }) => {
  if (currentActiveTerm !== 'optimal-solution') return null;
  
  const optimalPosition = [0, objectiveFunction(0, 0) + 0.2, 0];
  
  return (
    <BreathingBall 
      position={optimalPosition}
      size={0.9}
      intensity={0.8}
    />
  );
};

// 呼吸定义域组件
const BreathingDomain = ({ currentActiveTerm }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && currentActiveTerm === 'domain') {
      const time = state.clock.getElapsedTime();
      const breathingCycle = Math.sin(time * 1.5); // 缓慢的呼吸周期
      
      // 透明度变化 (0.1 到 0.6) - 渐变消失到完全出现
      const opacity = 0.1 + 0.5 * (0.5 + 0.5 * breathingCycle);
      
      meshRef.current.material.opacity = opacity;
    }
  });

  if (currentActiveTerm !== 'domain') return null;

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <boxGeometry args={[100, 0.5, 60]} />
      <meshBasicMaterial 
        color="#22c55e" 
        transparent 
        opacity={0.3}
        wireframe
      />
    </mesh>
  );
};

// 呼吸可行域组件
const BreathingFeasibleRegion = ({ currentActiveTerm }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current && currentActiveTerm === 'feasible-region') {
      const time = state.clock.getElapsedTime();
      const breathingCycle = Math.sin(time * 1.5); // 缓慢的呼吸周期
      
      // 透明度变化 (0.1 到 0.6) - 渐变消失到完全出现
      const opacity = 0.1 + 0.5 * (0.5 + 0.5 * breathingCycle);
      
      meshRef.current.material.opacity = opacity;
    }
  });

  if (currentActiveTerm !== 'feasible-region') return null;

  return (
    <mesh ref={meshRef} position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]}>
      <planeGeometry args={[100, 60]} />
      <meshBasicMaterial 
        color="#3ce6c0" 
        transparent 
        opacity={0.3}
      />
    </mesh>
  );
};

// 呼吸约束组件
const BreathingConstraints = ({ 
  constraintType, 
  currentActiveTerm, 
  objectiveFunction,
  showConstraints 
}) => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current && (currentActiveTerm === 'inequality' || currentActiveTerm === 'equality')) {
      const time = state.clock.getElapsedTime();
      const breathingCycle = Math.sin(time * 2);
      
      // 更强的透明度变化 (0.1 到 0.9) - 从几乎完全透明到几乎完全不透明
      const opacity = 0.1 + 0.8 * (0.5 + 0.5 * breathingCycle);
      
      // 大小变化效果
      const scale = 0.95 + 0.1 * (0.5 + 0.5 * breathingCycle);
      
      groupRef.current.children.forEach(child => {
        if (child.material) {
          child.material.opacity = opacity;
        }
        // 为线条和面片添加缩放效果
        child.scale.setScalar(scale);
      });
    }
  });

  const shouldShow = currentActiveTerm === 'inequality' || currentActiveTerm === 'equality' || showConstraints;
  if (!shouldShow) return null;

  const activeConstraintType = currentActiveTerm === 'inequality' ? 'inequality' : 
                              currentActiveTerm === 'equality' ? 'equality' : 
                              constraintType;

  return (
    <group ref={groupRef}>
      {activeConstraintType === 'inequality' && (
        // 圆盘约束 x^2 + y^2 ≤ R^2
        <>
          {/* 填充的圆盘 */}
          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]}>
            <circleGeometry args={[25, 32]} />
            <meshBasicMaterial 
              color={currentActiveTerm === 'feasible-region' ? "#3ce6c0" : "#f59e0b"} 
              transparent 
              opacity={0.3}
            />
          </mesh>
          
          {/* 虚线圆圈边界 */}
          <Line
            points={(() => {
              const radius = 25;
              const points = [];
              const numPoints = 64;
              for (let i = 0; i <= numPoints; i++) {
                const angle = (i / numPoints) * 2 * Math.PI;
                const x = radius * Math.cos(angle);
                const z = radius * Math.sin(angle);
                points.push([x, 0.1, z]);
              }
              return points;
            })()}
            color={currentActiveTerm === 'feasible-region' ? "#3ce6c0" : "#f59e0b"}
            lineWidth={4}
            dashed={true}
            dashSize={2}
            gapSize={1}
          />
          
          {/* 曲面上的约束弧线 */}
          <Line
            points={(() => {
              const radius = 25;
              const points = [];
              const numPoints = 64;
              for (let i = 0; i <= numPoints; i++) {
                const angle = (i / numPoints) * 2 * Math.PI;
                const x = radius * Math.cos(angle);
                const z = radius * Math.sin(angle);
                const y = objectiveFunction(x, z) + 0.2;
                points.push([x, y, z]);
              }
              return points;
            })()}
            color={currentActiveTerm === 'feasible-region' ? "#3ce6c0" : "#f59e0b"}
            lineWidth={4}
            transparent
            opacity={0.8}
          />
        </>
      )}
      
      {activeConstraintType === 'equality' && (
        // 抛物线约束 x - 2y² = 0
        <>
          {/* 平面投影抛物线 */}
          <Line
            points={(() => {
              const points = [];
              const numPoints = 100;
              const yRange = 30;
              for (let i = 0; i <= numPoints; i++) {
                const z = ((i / numPoints) - 0.5) * 2 * yRange;
                const x = 2 * z * z;
                if (x <= 50) {
                  points.push([x, 0.1, z]);
                }
              }
              return points;
            })()}
            color={currentActiveTerm === 'feasible-region' ? "#3ce6c0" : "#ef4444"}
            lineWidth={4}
            dashed={true}
            dashSize={2}
            gapSize={1}
          />
          
          {/* 曲面上的约束弧线 */}
          <Line
            points={(() => {
              const points = [];
              const numPoints = 80;
              const yRange = 30;
              for (let i = 0; i <= numPoints; i++) {
                const z = ((i / numPoints) - 0.5) * 2 * yRange;
                const x = 2 * z * z;
                if (x <= 50) {
                  const y = objectiveFunction(x, z) + 0.2;
                  points.push([x, y, z]);
                }
              }
              return points;
            })()}
            color={currentActiveTerm === 'feasible-region' ? "#3ce6c0" : "#ef4444"}
            lineWidth={4}
            transparent
            opacity={0.8}
          />
        </>
      )}
    </group>
  );
};

// 呼吸曲面组件
const BreathingSurface = ({ geometry, currentActiveTerm, showGradientField }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      // 梯度场模式下：原曲面呼吸闪烁（完全透明到半透明）
      if (showGradientField) {
        const time = state.clock.getElapsedTime();
        const breathingCycle = Math.sin(time * 1); // 降低呼吸频率 1Hz
        
        // 透明度变化 (0.0 到 0.5) - 从完全透明到半透明
        // 使用 (1 + sin(t)) / 2 确保范围是 0 到 1，然后乘以 0.5
        const opacity = 0.5 * (1 + breathingCycle) / 2;
        meshRef.current.material.opacity = opacity;
      }
      // 普通模式下：原有的objective呼吸效果
      else if (currentActiveTerm === 'objective') {
        const time = state.clock.getElapsedTime();
        const breathingCycle = Math.sin(time * 2); // 呼吸周期 2Hz，稍微慢一点
        
        // 透明度变化 (0.1 到 1.0) - 从几乎完全透明到完全不透明
        const opacity = 0.1 + 0.9 * (0.5 + 0.5 * breathingCycle);
        meshRef.current.material.opacity = opacity;
      }
      // 关闭梯度场后，恢复默认透明度
      else {
        meshRef.current.material.opacity = currentActiveTerm === 'objective' ? 0.95 : 0.85;
      }
    }
  });

  return (
    <mesh 
      ref={meshRef}
      geometry={geometry}
      visible={currentActiveTerm !== 'domain'}
    >
      <meshPhongMaterial 
        vertexColors 
        transparent 
        opacity={currentActiveTerm === 'objective' ? 0.95 : 0.85}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// 简单呼吸小球组件 - 基于正常小球的1.5倍大小，呼吸效果在1.2-1.5倍之间
const BreathingBall = ({ position, size = 0.9, intensity = 0.4 }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const breathingCycle = Math.sin(time * 2.5); // 呼吸周期
      
      // 呼吸缩放：基础是size，在1.2倍到1.5倍之间变化
      const scale = 1.2 + 0.3 * (0.5 + 0.5 * breathingCycle); // 1.2 到 1.5
      
      // 发光强度变化
      const currentIntensity = intensity * (0.6 + 0.4 * (0.5 + 0.5 * breathingCycle));
      
      meshRef.current.scale.setScalar(scale);
      meshRef.current.material.emissiveIntensity = currentIntensity;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshPhongMaterial 
        color="#4facfe"      // 清新的蓝色
        emissive="#00d4ff"   // 亮青色发光
        emissiveIntensity={intensity}
        shininess={80}
        transparent={true}
        opacity={0.85}
      />
    </mesh>
  );
};

// 呼吸灯轨迹组件
const BreathingTrajectory = ({ trajectory }) => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      // 使用正弦函数创建呼吸效果，周期为2.5秒
      const time = state.clock.getElapsedTime();
      const breathingCycle = Math.sin(time * 2.5); // 呼吸周期
      
      // 光晕透明度：0（完全透明/不发光）到 0.7（强光晕/发光）
      const glowOpacity = Math.max(0, breathingCycle * 0.7);
      
      // 遍历所有子对象更新材质
      groupRef.current.traverse((child) => {
        if (child.material) {
          if (child.name.includes('glow')) {
            // 光晕层 - 呼吸透明度变化（琥珀色光晕）
            child.material.opacity = glowOpacity;
          }
          // 主线条和主轨迹点保持原色不变，不参与呼吸效果
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* 3D轨迹 - 主线条（保持原色不变） */}
      <Line
        name="main-3d"
        points={trajectory.map(point => [point[0], point[1] + 0.05, point[2]])}
        color="#f59e0b"
        lineWidth={3}
      />
      {/* 3D轨迹 - 琥珀色光晕层 */}
      <Line
        name="glow-3d"
        points={trajectory.map(point => [point[0], point[1] + 0.05, point[2]])}
        color="#fbbf24"
        lineWidth={10}
        transparent
        opacity={0.0}
      />
      
      {/* 地面投影轨迹 - 主虚线（保持原色不变） */}
      <Line
        name="main-2d"
        points={trajectory.map(point => [point[0], 0.03, point[2]])}
        color="#f59e0b"
        lineWidth={2}
        transparent
        opacity={0.8}
        dashed={true}
        dashSize={0.5}
        gapSize={0.3}
      />
      {/* 地面投影轨迹 - 琥珀色光晕层 */}
      <Line
        name="glow-2d"
        points={trajectory.map(point => [point[0], 0.03, point[2]])}
        color="#fbbf24"
        lineWidth={8}
        transparent
        opacity={0.0}
        dashed={true}
        dashSize={0.5}
        gapSize={0.3}
      />
      
      {/* 曲面上轨迹点 - 琥珀色圆点（保持原色不变） */}
      {trajectory.map((point, index) => (
        <group key={`surface-point-group-${index}`} position={[point[0], point[1] + 0.1, point[2]]}>
          {/* 主轨迹点 - 保持原色 */}
          <mesh name={`surface-point-main-${index}`}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshPhongMaterial 
              color="#f59e0b"
              transparent
              opacity={0.9}
            />
          </mesh>
          {/* 光晕球体 - 琥珀色光晕 */}
          <mesh name={`surface-point-glow-${index}`}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshBasicMaterial 
              color="#fbbf24"
              transparent
              opacity={0.0}
            />
          </mesh>
        </group>
      ))}
      
      {/* XOY平面轨迹点 - 琥珀色圆点（保持原色不变） */}
      {trajectory.map((point, index) => (
        <group key={`projection-point-group-${index}`} position={[point[0], 0.08, point[2]]}>
          {/* 主轨迹点 - 保持原色 */}
          <mesh name={`projection-point-main-${index}`}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshPhongMaterial 
              color="#f59e0b"
              transparent
              opacity={0.8}
            />
          </mesh>
          {/* 光晕球体 - 琥珀色光晕 */}
          <mesh name={`projection-point-glow-${index}`}>
            <sphereGeometry args={[0.22, 8, 8]} />
            <meshBasicMaterial 
              color="#fbbf24"
              transparent
              opacity={0.0}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// 梯度场组件 - 在XOY平面显示等值线和梯度向量，以及切平面
const GradientField = ({ ballPosition, algorithm, stepSize, dampingFactor }) => {
  const groupRef = useRef();
  
  // 目标函数定义
  const targetFunction = (x, z) => {
    return 0.01 * x * x + 0.02 * x * z + 0.04 * z * z;
  };

  // 梯度计算 - f(x,y) = 0.01x² + 0.02xy + 0.04y²
  // 注意：Three.js中Y是垂直轴，我们的函数中y对应Three.js的z轴
  const computeGradient = (x, y) => {
    // ∂f/∂x = 0.02x + 0.02y
    // ∂f/∂y = 0.02x + 0.08y
    const gradX = 0.02 * x + 0.02 * y;
    const gradY = 0.02 * x + 0.08 * y;
    return [gradX, gradY]; // 返回XOY平面的梯度向量
  };

  // 生成等值线数据 - f(x,y) = 常数，Z从0到60，间隔5
  // 考虑到显示范围，只显示合理大小的等值线
  const contourLevels = Array.from({length: 10}, (_, i) => (i + 1) * 5); // [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
  const gridSize = 200;
  const range = 60;
  
  // 基于最外层等值线边界的格网梯度向量场
  const generateGradientVectorsOnGrid = () => {
    const vectors = [];
    const scale = 1.0; // 缩放系数，使向量长度合适
    const gridStep = 5; // 格网大小参数（可修改：2=密集，4=适中，6=稀疏）
    
    // 找到最外层等值线的边界
    const maxLevel = Math.max(...contourLevels);
    
    // 计算最外层椭圆的参数
    const a = 0.01, b = 0.01, c = 0.04;
    const trace = a + c;
    const det = a * c - b * b;
    
    const discriminant = Math.sqrt(trace * trace - 4 * det);
    const lambda1 = (trace + discriminant) / 2;
    const lambda2 = (trace - discriminant) / 2;
    
    const semiAxisA = Math.sqrt(maxLevel / lambda1);
    const semiAxisB = Math.sqrt(maxLevel / lambda2);
    
    // 旋转角度
    let rotationAngle = 0;
    if (Math.abs(b) > 1e-10) {
      rotationAngle = Math.atan2(lambda1 - a, b);
    }
    
    // 计算最外层椭圆的XY边界范围
    // 对于旋转椭圆，需要计算包围框
    const cosAngle = Math.cos(rotationAngle);
    const sinAngle = Math.sin(rotationAngle);
    
    // 椭圆包围框计算
    const xExtent = Math.sqrt((semiAxisA * cosAngle) ** 2 + (semiAxisB * sinAngle) ** 2);
    const yExtent = Math.sqrt((semiAxisA * sinAngle) ** 2 + (semiAxisB * cosAngle) ** 2);
    
    const xMin = Math.floor(-xExtent);
    const xMax = Math.ceil(xExtent);
    const yMin = Math.floor(-yExtent);
    const yMax = Math.ceil(yExtent);
    
    // 在边界矩形内按格网生成梯度向量
    for (let x = xMin; x <= xMax; x += gridStep) {
      for (let y = yMin; y <= yMax; y += gridStep) {
        // 计算该点的梯度
        const [gradX, gradY] = computeGradient(x, y);
        const magnitude = Math.sqrt(gradX * gradX + gradY * gradY);
        
        if (magnitude > 0.001) {
          vectors.push({
            startPosition: [x, 0.1, y], // Three.js坐标：(x, 0.1, z)对应数学坐标(x, y)
            endPosition: [x + gradX * scale, 0.1, y + gradY * scale], // 向量终点
            direction: [gradX, 0, gradY], // Three.js中的方向向量
            magnitude: magnitude
          });
        }
      }
    }
    
    return vectors;
  };

  const vectors = useMemo(() => generateGradientVectorsOnGrid(), []);

  // 梯度场模式：梯度向量和等值线始终显示，不呼吸闪烁

  return (
    <group ref={groupRef}>
      {/* 等值线 - 呼吸效果 */}
      {contourLevels.map((level, index) => (
        <ContourLine key={index} level={level} showGradientField={true} />
      ))}
      
      {/* 梯度向量箭头 - 始终显示 */}
      {vectors.map((vector, index) => (
        <GradientArrow
          key={index}
          startPosition={vector.startPosition}
          endPosition={vector.endPosition}
          direction={vector.direction}
          magnitude={vector.magnitude}
        />
      ))}
      
      {/* 切平面和交线 */}
      <TangentPlaneAndIntersection ballPosition={ballPosition} />
      
      {/* 修正向量 */}
      <CorrectionVector 
        ballPosition={ballPosition}
        algorithm={algorithm}
        stepSize={stepSize}
        dampingFactor={dampingFactor}
      />
    </group>
  );
};

// 切平面和交线组件
// 修正向量组件
const CorrectionVector = ({ ballPosition, algorithm, stepSize, dampingFactor }) => {
  if (!ballPosition) return null;
  
  const x0 = ballPosition[0];       // x0
  const y0 = ballPosition[2];       // y0 (Three.js中z对应数学y)
  
  // 计算当前点的梯度 ∇f(x0,y0)
  const computeGradient = (x, y) => {
    const gradX = 0.02 * x + 0.02 * y;
    const gradY = 0.02 * x + 0.08 * y;
    return [gradX, gradY];
  };
  
  // 计算海塞矩阵 H(x0,y0)
  const computeHessian = () => {
    // f(x,y) = 0.01(x² + 2xy + 4y²)
    // ∂²f/∂x² = 0.02, ∂²f/∂x∂y = 0.02, ∂²f/∂y² = 0.08
    return [[0.02, 0.02], [0.02, 0.08]];
  };
  
  // 矩阵求逆函数 (2x2矩阵)
  const invertMatrix2x2 = (matrix) => {
    const [[a, b], [c, d]] = matrix;
    const det = a * d - b * c;
    if (Math.abs(det) < 1e-10) return null; // 矩阵奇异
    return [[d / det, -b / det], [-c / det, a / det]];
  };
  
  // 矩阵向量乘法
  const multiplyMatrixVector = (matrix, vector) => {
    const [x, y] = vector;
    return [
      matrix[0][0] * x + matrix[0][1] * y,
      matrix[1][0] * x + matrix[1][1] * y
    ];
  };
  
  const [gradX, gradY] = computeGradient(x0, y0);
  let correctionX, correctionY;
  
  if (algorithm === 'gradient') {
    // 梯度下降法：修正向量 = -α∇f(x0,y0)
    correctionX = -stepSize * gradX;
    correctionY = -stepSize * gradY;
  } else if (algorithm === 'newton' || algorithm === 'damped-newton') {
    // 牛顿法：修正向量 = -η H^(-1)∇f(x0,y0)
    // 注意：牛顿法也使用阻尼系数（dampingFactor）
    const hessian = computeHessian();
    const hessianInverse = invertMatrix2x2(hessian);
    
    if (hessianInverse) {
      const hInvGrad = multiplyMatrixVector(hessianInverse, [gradX, gradY]);
      // 牛顿法和阻尼牛顿法都使用阻尼系数
      correctionX = -dampingFactor * hInvGrad[0];
      correctionY = -dampingFactor * hInvGrad[1];
    } else {
      // 如果海塞矩阵奇异，回退到梯度下降
      correctionX = -stepSize * gradX;
      correctionY = -stepSize * gradY;
    }
  }
  
  // 向量起点是当前点(x0, y0)，终点是(x0 + correctionX, y0 + correctionY)
  const startPoint = new THREE.Vector3(x0, 0.1, y0); // 在XOY平面稍高处
  const endPoint = new THREE.Vector3(x0 + correctionX, 0.1, y0 + correctionY);
  
  // 计算向量方向和长度
  const direction = new THREE.Vector3().subVectors(endPoint, startPoint);
  const length = direction.length();
  
  if (length < 1e-6) return null; // 向量太短，不绘制
  
  direction.normalize();
  
  return (
    <group>
      {/* 使用ArrowHelper绘制蓝色箭头 */}
      <primitive 
        object={new THREE.ArrowHelper(
          direction,          // 方向
          startPoint,         // 起点
          length,            // 长度
          0x0066ff,          // 蓝色
          length * 0.2,      // 箭头头部长度
          length * 0.1       // 箭头头部宽度
        )}
      />
    </group>
  );
};
const TangentPlaneAndIntersection = ({ ballPosition }) => {
  if (!ballPosition) return null;
  
  const x0 = ballPosition[0];       // x0
  const y0 = ballPosition[2];       // y0 (Three.js中z对应数学y)
  const z0 = ballPosition[1];       // z0 = f(x0,y0) 曲面高度
  
  // 根据公式：f(x,y) = 0.01(x² + 2xy + 4y²)
  // 切平面方程：z = 0.02(x0+y0)x + (0.02x0+0.08y0)y - 0.01x0² - 0.02x0y0 - 0.04y0²
  
  const A = 0.02 * (x0 + y0);           // x的系数
  const B = 0.02 * x0 + 0.08 * y0;     // y的系数  
  const C = 0.01 * x0 * x0 + 0.02 * x0 * y0 + 0.04 * y0 * y0; // 常数项
  
  // 切平面法向量：[A, B, -1] -> Three.js坐标系 [A, -1, B]
  const normal = new THREE.Vector3(A, -1, B);
  normal.normalize();
  
  // 交线方程（z=0时）：2(x0+y0)x + (2x0+8y0)y = x0²+2x0y0+4y0²
  const intersectionA = 2 * (x0 + y0);        // x的系数
  const intersectionB = 2 * x0 + 8 * y0;      // y的系数
  const intersectionC = x0 * x0 + 2 * x0 * y0 + 4 * y0 * y0; // 右边常数
  
  const planeSize = 60; // 增大平面尺寸，确保穿过XOY平面
  
  // 创建旋转矩阵来设置平面方向
  const meshRef = useRef();
  
  useEffect(() => {
    if (meshRef.current) {
      // 设置平面朝向法向量方向
      const lookAtTarget = new THREE.Vector3(x0 + normal.x, z0 + normal.y, y0 + normal.z);
      meshRef.current.lookAt(lookAtTarget);
    }
  }, [x0, y0, z0, normal.x, normal.y, normal.z]);
  
  return (
    <group>
      {/* 半透明切平面 */}
      <mesh ref={meshRef} position={[x0, z0, y0]}>
        <planeGeometry args={[planeSize, planeSize]} />
        <meshBasicMaterial 
          color="#87ceeb" 
          transparent 
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* 切平面与XOY平面的交线（琥珀色虚线） */}
      <IntersectionLine 
        A={intersectionA} 
        B={intersectionB} 
        C={intersectionC} 
      />
    </group>
  );
};

// 交线组件
const IntersectionLine = ({ A, B, C }) => {
  const points = useMemo(() => {
    const linePoints = [];
    
    if (Math.abs(B) > 1e-6) {
      // 如果B != 0，用x参数化：y = (C - A*x) / B
      for (let x = -50; x <= 50; x += 2) {
        const y = (C - A * x) / B;
        if (Math.abs(y) <= 50) { // 限制在合理范围内
          linePoints.push(new THREE.Vector3(x, 0.2, y)); // 稍高于XOY平面
        }
      }
    } else if (Math.abs(A) > 1e-6) {
      // 如果A != 0，用y参数化：x = C / A
      const x = C / A;
      if (Math.abs(x) <= 50) {
        for (let y = -50; y <= 50; y += 2) {
          linePoints.push(new THREE.Vector3(x, 0.2, y));
        }
      }
    }
    
    return linePoints;
  }, [A, B, C]);

  if (points.length < 2) return null;

  return (
    <Line
      points={points.map(p => [p.x, p.y, p.z])}
      color="#00ff00" // 绿色
      lineWidth={3}
      transparent
      opacity={0.8}
      dashed={true}
      dashSize={0.5}
      gapSize={0.3}
    />
  );
};

// 等值线组件 - 基于二次型的椭圆等值线
const ContourLine = ({ level, showGradientField }) => {
  const [breathingOpacity, setBreathingOpacity] = useState(0.8);
  
  // 呼吸效果动画
  useFrame((state) => {
    if (showGradientField) {
      const time = state.clock.getElapsedTime();
      const opacity = 0.4 + 0.4 * (1 + Math.sin(time * 1)) / 2; // 降低频率到1Hz，透明度0.4-0.8之间
      setBreathingOpacity(opacity);
    } else {
      setBreathingOpacity(0.8); // 默认透明度
    }
  });
  
  const points = useMemo(() => {
    if (level === 0) {
      // level=0时，只有原点(0,0)满足条件
      return [new THREE.Vector3(0, 0.05, 0)];
    }
    
    const contourPoints = [];
    const resolution = 360; // 增加分辨率获得更光滑的曲线
    
    // 对于二次型 f(x,y) = 0.01x² + 0.02xy + 0.04y² = level
    // 矩阵形式 A = [[0.01, 0.01], [0.01, 0.04]]
    
    // 计算特征值
    const a = 0.01, b = 0.01, c = 0.04;
    const trace = a + c; // 0.05
    const det = a * c - b * b; // 0.0003
    
    const discriminant = Math.sqrt(trace * trace - 4 * det);
    const lambda1 = (trace + discriminant) / 2; // ≈ 0.0447
    const lambda2 = (trace - discriminant) / 2; // ≈ 0.0053
    
    // 椭圆的半轴长度
    const semiAxisA = Math.sqrt(level / lambda1);
    const semiAxisB = Math.sqrt(level / lambda2);
    
    // 检查椭圆是否过大（避免显示过大的椭圆）
    const maxRadius = Math.max(semiAxisA, semiAxisB);
    if (maxRadius > 100) {
      return []; // 椭圆太大，不显示
    }
    
    // 旋转角度 - 第一特征向量的角度
    let rotationAngle = 0;
    if (Math.abs(b) > 1e-10) {
      rotationAngle = Math.atan2(lambda1 - a, b);
    }
    
    // 生成完整的椭圆点
    for (let i = 0; i <= resolution; i++) {
      const t = (i / resolution) * 2 * Math.PI;
      
      // 标准椭圆上的点
      const u = semiAxisA * Math.cos(t);
      const v = semiAxisB * Math.sin(t);
      
      // 旋转变换
      const x = u * Math.cos(rotationAngle) - v * Math.sin(rotationAngle);
      const y = u * Math.sin(rotationAngle) + v * Math.cos(rotationAngle);
      
      contourPoints.push(new THREE.Vector3(x, 0.05, y));
    }
    
    return contourPoints;
  }, [level]);

  if (points.length <= 1) return null;

  // 根据等值线级别设置颜色 - 更明显的颜色区分
  const getColorByLevel = (level) => {
    if (level === 0) return "#ffffff";
    const intensity = Math.min(level / 50, 1); // 归一化到0-1
    const hue = 180 + intensity * 80; // 从青色(180)到紫色(260)
    return `hsl(${hue}, 80%, 65%)`;
  };

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial 
        color={getColorByLevel(level)}
        transparent
        opacity={breathingOpacity}
        linewidth={2}
      />
    </line>
  );
};

// 梯度箭头组件 - 使用THREE.ArrowHelper绘制XOY平面内的梯度向量
// 带呼吸效果的坐标轴组件
const BreathingAxes = ({ showGradientField }) => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      if (showGradientField) {
        const time = state.clock.getElapsedTime();
        const breathingCycle = Math.sin(time * 1); // 降低呼吸频率 1Hz
        
        // 透明度变化 (0.0 到 0.5) - 从完全透明到半透明
        // 使用 (1 + sin(t)) / 2 确保范围是 0 到 1，然后乘以 0.5
        const opacity = 0.5 * (1 + breathingCycle) / 2;
        
        // 遍历所有子对象更新材质
        groupRef.current.traverse((child) => {
          if (child.material) {
            child.material.opacity = opacity;
            child.material.transparent = true;
          }
        });
      } else {
        // 非梯度场模式，恢复正常显示（完全不透明）
        groupRef.current.traverse((child) => {
          if (child.material) {
            child.material.opacity = 1.0;
            child.material.transparent = false;
          }
        });
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* X轴 */}
      <Line
        points={[[-60, 0, 0], [60, 0, 0]]}
        color="#ffffff"
        lineWidth={2}
      />
      {/* X轴箭头 */}
      <mesh position={[60, 0, 0]} rotation={[0, 0, -Math.PI/2]}>
        <coneGeometry args={[1, 3, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* X轴标签 */}
      <Text
        position={[63, 0, 0]}
        fontSize={1.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        X
      </Text>
      
      {/* Y轴 (在XOY平面中，Y对应Z方向) */}
      <Line
        points={[[0, 0, -35], [0, 0, 35]]}
        color="#ffffff"
        lineWidth={2}
      />
      {/* Y轴箭头 */}
      <mesh position={[0, 0, 35]} rotation={[Math.PI/2, 0, 0]}>
        <coneGeometry args={[1, 3, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Y轴标签 */}
      <Text
        position={[0, 0, 38]}
        fontSize={1.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Y
      </Text>
    </group>
  );
};
const GradientArrow = ({ startPosition, endPosition, direction, magnitude }) => {
  const arrowRef = useRef();
  
  // 提取XOY平面的起点和终点坐标
  const startX = startPosition[0];    // x
  const startZ = startPosition[2];    // y (Three.js中z对应数学y)
  const endX = endPosition[0];        // x + Δx
  const endZ = endPosition[2];        // y + Δy
  
  // 计算梯度向量
  const gradientVector = [endX - startX, 0, endZ - startZ]; // XOY平面内的向量
  const vectorLength = Math.sqrt(gradientVector[0] * gradientVector[0] + gradientVector[2] * gradientVector[2]);
  
  if (vectorLength < 0.1) return null; // 太短的向量不显示
  
  // 单位向量
  const unitVector = [
    gradientVector[0] / vectorLength,
    0, // Y方向为0，保持在XOY平面内
    gradientVector[2] / vectorLength
  ];
  
  // 根据梯度大小设置颜色
  const intensity = Math.min(magnitude * 15, 1);
  const red = 255;
  const green = Math.floor(100 * (1 - intensity));
  const blue = Math.floor(100 * (1 - intensity));
  
  // 将RGB转换为十六进制颜色值
  const hexColor = (red << 16) | (green << 8) | blue;

  return (
    <group position={[startX, 0.1, startZ]} ref={arrowRef}>
      {/* 使用THREE.ArrowHelper绘制梯度向量箭头 */}
      <primitive
        object={new THREE.ArrowHelper(
          new THREE.Vector3(unitVector[0], unitVector[1], unitVector[2]), // 方向向量
          new THREE.Vector3(0, 0, 0), // 起点（相对于group位置）
          vectorLength, // 箭头总长度
          hexColor, // 颜色
          vectorLength * 0.2, // 箭头头部长度
          vectorLength * 0.1  // 箭头头部宽度
        )}
      />
    </group>
  );
};

// 3D函数曲面组件
const FunctionSurface = ({ 
  currentActiveTerm, 
  algorithm, 
  stepSize, 
  dampingFactor,
  showTrajectory, 
  ballPosition, 
  setBallPosition, 
  trajectory, 
  setTrajectory,
  showConstraints,
  constraintType,
  isOptimal,
  gradientVector,
  showVectors,
  showGradientField
}) => {
  const meshRef = useRef();
  const ballRef = useRef();
  const gradientRef = useRef();
  const descentRef = useRef();

  // 二次强凸目标函数: f(x,y) = 1/100*(x^2 + 2xy + 4y^2) = 0.01*x^2 + 0.02*xy + 0.04*y^2
  const objectiveFunction = (x, y) => {
    return 0.01 * x * x + 0.02 * x * y + 0.04 * y * y;
  };

  // 计算解析梯度: ∇f(x,y) = [0.02(x+y), 0.02(x+4y)]
  const gradient = (x, y) => {
    return [0.02 * (x + y), 0.02 * (x + 4 * y)];
  };

  // 海塞矩阵 (常数矩阵): H = (1/50)*[[1,1],[1,4]] = [[0.02,0.02],[0.02,0.08]]
  const hessian = (x, y) => {
    // 对于二次函数，海塞矩阵为常数，与(x,y)无关
    return [[0.02, 0.02], [0.02, 0.08]];
  };

  // Rainbow颜色映射函数：紫色(低值) → 红色(高值)
  const getRainbowColor = (value, minVal, maxVal) => {
    const normalized = Math.max(0, Math.min(1, (value - minVal) / (maxVal - minVal)));
    const hue = (1 - normalized) * 270; // 270° (紫色) → 0° (红色)
    const saturation = 1.0;
    const lightness = 0.6;
    
    // HSL转RGB
    const hslToRgb = (h, s, l) => {
      h /= 360;
      const a = s * Math.min(l, 1 - l);
      const f = n => {
        const k = (n + h * 12) % 12;
        return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      };
      return [f(0), f(8), f(4)];
    };
    
    return hslToRgb(hue, saturation, lightness);
  };

  // 创建曲面几何
  const surfaceGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    const colors = [];
    
    const size = 80; // 增加网格密度
    const xRange = 50; // X范围 [-50, 50]
    const zRange = 30; // Z范围 [-30, 30]
    
    // 预计算所有Z值以确定颜色范围
    let minZ = Infinity, maxZ = -Infinity;
    const allPoints = [];
    
    for (let i = 0; i <= size; i++) {
      for (let j = 0; j <= size; j++) {
        const x = (i / size - 0.5) * 2 * xRange;
        const z = (j / size - 0.5) * 2 * zRange;
        const y = objectiveFunction(x, z);
        
        allPoints.push({ x, y, z });
        minZ = Math.min(minZ, y);
        maxZ = Math.max(maxZ, y);
      }
    }
    
    // 生成顶点和颜色
    allPoints.forEach(point => {
      vertices.push(point.x, point.y, point.z);
      
      // Rainbow颜色映射
      const [r, g, b] = getRainbowColor(point.y, minZ, maxZ);
      colors.push(r, g, b);
    });
    
    // 创建面的索引
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const a = i * (size + 1) + j;
        const b = a + size + 1;
        const c = a + 1;
        const d = b + 1;
        
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    
    return geometry;
  }, []);


  return (
    <>
      {/* 梯度场显示模式 */}
      {showGradientField && (
        <GradientField 
          ballPosition={ballPosition} 
          algorithm={algorithm}
          stepSize={stepSize}
          dampingFactor={dampingFactor || 1.0}
        />
      )}
      
      {/* 函数曲面 - 始终显示，根据模式调整呼吸效果 */}
      <BreathingSurface 
        geometry={surfaceGeometry}
        currentActiveTerm={currentActiveTerm}
        showGradientField={showGradientField}
      />
      
      {/* 曲面经纬线网格 - 梯度场模式时隐藏 */}
      {currentActiveTerm !== 'domain' && !showGradientField && (
        <>
          {/* 经线 (X方向的曲线) */}
          {Array.from({ length: 51 }, (_, i) => {
            const xPos = ((i / 50) - 0.5) * 100; // X从-50到50，每隔2画一条线
            const points = [];
            const numPoints = 60;
            for (let j = 0; j <= numPoints; j++) {
              const z = ((j / numPoints) - 0.5) * 60; // Z从-30到30
              const y = objectiveFunction(xPos, z);
              points.push([xPos, y + 0.1, z]); // 稍微提升避免z-fighting
            }
            return (
              <Line
                key={`meridian-${i}`}
                points={points}
                color="#ffffff"
                lineWidth={0.5}
                transparent
                opacity={0.3}
              />
            );
          })}
          
          {/* 纬线 (Z方向的曲线) */}
          {Array.from({ length: 31 }, (_, i) => {
            const zPos = ((i / 30) - 0.5) * 60; // Z从-30到30，每隔2画一条线
            const points = [];
            const numPoints = 100;
            for (let j = 0; j <= numPoints; j++) {
              const x = ((j / numPoints) - 0.5) * 100; // X从-50到50
              const y = objectiveFunction(x, zPos);
              points.push([x, y + 0.1, zPos]); // 稍微提升避免z-fighting
            }
            return (
              <Line
                key={`parallel-${i}`}
                points={points}
                color="#ffffff"
                lineWidth={0.5}
                transparent
                opacity={0.3}
              />
            );
          })}
        </>
      )}
      
      {/* 定义域边界 - 支持呼吸效果 */}
      <BreathingDomain currentActiveTerm={currentActiveTerm} />
      
      {/* 可行域高亮 */}
      {currentActiveTerm === 'feasible-region' && !showConstraints && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <planeGeometry args={[100, 60]} />
          <meshBasicMaterial 
            color="#3ce6c0" 
            transparent 
            opacity={0.2}
          />
        </mesh>
      )}
      
      {/* 悬浮时的呼吸约束效果 */}
      <BreathingConstraints 
        constraintType={constraintType}
        currentActiveTerm={currentActiveTerm}
        objectiveFunction={objectiveFunction}
        showConstraints={showConstraints}
      />
      
      {/* 约束可视化 */}
      {showConstraints && (
        <>
          {constraintType === 'inequality' && (
            // 圆盘约束 x^2 + y^2 ≤ R^2
            <>
              {/* 填充的圆盘 */}
              <mesh position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]}>
                <circleGeometry args={[25, 32]} />
                <meshBasicMaterial 
                  color={currentActiveTerm === 'feasible-region' ? "#3ce6c0" : "#f59e0b"} 
                  transparent 
                  opacity={0.3}
                />
              </mesh>
              
              {/* 虚线圆圈边界 */}
              <Line
                points={(() => {
                  const radius = 25;
                  const points = [];
                  const numPoints = 64;
                  for (let i = 0; i <= numPoints; i++) {
                    const angle = (i / numPoints) * 2 * Math.PI;
                    const x = radius * Math.cos(angle);
                    const z = radius * Math.sin(angle);
                    points.push([x, 0.1, z]);
                  }
                  return points;
                })()}
                color={currentActiveTerm === 'feasible-region' ? "#3ce6c0" : "#f59e0b"}
                lineWidth={4}
                dashed={true}
                dashSize={2}
                gapSize={1}
              />
            </>
          )}
          {constraintType === 'equality' && (
            // 抛物线约束 x - 2y² = 0，即 x = 2y² - 虚线
            <Line
              points={(() => {
                const points = [];
                const numPoints = 100;
                const yRange = 30; // Y范围 [-30, 30]
                for (let i = 0; i <= numPoints; i++) {
                  const z = ((i / numPoints) - 0.5) * 2 * yRange; // z从-30到30，对应数学中的y
                  const x = 2 * z * z; // x = 2y²
                  if (x <= 50) { // 确保在X范围内
                    points.push([x, 0.1, z]);
                  }
                }
                return points;
              })()}
              color={currentActiveTerm === 'feasible-region' ? "#3ce6c0" : "#ef4444"}
              lineWidth={4}
              dashed={true}
              dashSize={2}
              gapSize={1}
            />
          )}
        </>
      )}
      
      {/* 约束条件在曲面上的弧线 */}
      {showConstraints && (
        <>
          {constraintType === 'inequality' && (
            // 不等式约束 x^2 + y^2 = 25^2 在曲面上的圆弧
            <Line
              points={(() => {
                const radius = 25;
                const points = [];
                const numPoints = 64;
                for (let i = 0; i <= numPoints; i++) {
                  const angle = (i / numPoints) * 2 * Math.PI;
                  const x = radius * Math.cos(angle);
                  const z = radius * Math.sin(angle);
                  const y = objectiveFunction(x, z) + 0.2; // 在曲面上稍微提升
                  points.push([x, y, z]);
                }
                return points;
              })()}
              color={currentActiveTerm === 'feasible-region' ? "#3ce6c0" : "#f59e0b"}
              lineWidth={4}
              transparent
              opacity={0.8}
            />
          )}
          {constraintType === 'equality' && (
            // 等式约束 x - 2y² = 0 在曲面上的抛物线
            <Line
              points={(() => {
                const points = [];
                const numPoints = 80;
                const yRange = 30; // Y范围 [-30, 30]
                for (let i = 0; i <= numPoints; i++) {
                  const z = ((i / numPoints) - 0.5) * 2 * yRange; // z从-30到30，对应数学中的y
                  const x = 2 * z * z; // x = 2y²
                  if (x <= 50) { // 确保在X范围内
                    const y = objectiveFunction(x, z) + 0.2; // 在曲面上稍微提升
                    points.push([x, y, z]);
                  }
                }
                return points;
              })()}
              color={currentActiveTerm === 'feasible-region' ? "#3ce6c0" : "#ef4444"}
              lineWidth={4}
              transparent
              opacity={0.8}
            />
          )}
        </>
      )}
      
      {/* 当前解小球 - 根据悬浮状态改变颜色 */}
      {currentActiveTerm === 'decision-var' ? (
        // 决策变量悬浮时的琥珀色呼吸小球
        <BreathingBall 
          position={[ballPosition[0], ballPosition[1] + 0.5, ballPosition[2]]}
          size={0.9}
          intensity={0.5}
        />
      ) : (
        // 正常状态的薄荷绿小球
        <mesh 
          ref={ballRef} 
          position={[ballPosition[0], ballPosition[1] + 0.5, ballPosition[2]]}
        >
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshPhongMaterial 
            color="#00FFB3"
            emissive="#00FFB3"
            emissiveIntensity={0.6}
            shininess={100}
            transparent={true}
            opacity={0.9}
          />
        </mesh>
      )}
      
      {/* 曲面法向量 - 从球心出发，双向显示 */}
      {showVectors && gradientVector && (
        (() => {
          // 球心坐标
          const ballCenter = [ballPosition[0], ballPosition[1] + 0.5, ballPosition[2]];
          
          // 计算球心所在点的曲面法向量
          // 对于 f(x,y) = 0.01x² + 0.02xy + 0.04y²
          // ∂f/∂x = 0.02x + 0.02y 
          // ∂f/∂y = 0.02x + 0.08y
          
          // 计算偏导数
          const x = ballCenter[0];  // Three.js的x对应数学的x
          const y = ballCenter[2];  // Three.js的z对应数学的y
          const dfx = 0.02 * x + 0.02 * y;  // ∂f/∂x
          const dfy = 0.02 * x + 0.08 * y;  // ∂f/∂y
          
          // Three.js坐标系中，曲面z=f(x,y)的法向量是[∂f/∂x, -1, ∂f/∂y]
          // 向上法向量: [-∂f/∂x, 1, -∂f/∂y]
          const upwardVector = [-dfx, 1, -dfy];
          const upLength = Math.sqrt(upwardVector[0]*upwardVector[0] + upwardVector[1]*upwardVector[1] + upwardVector[2]*upwardVector[2]);
          const unitUpward = [upwardVector[0]/upLength, upwardVector[1]/upLength, upwardVector[2]/upLength];
          
          // 向下法向量: [∂f/∂x, -1, ∂f/∂y]
          const downwardVector = [dfx, -1, dfy];
          const downLength = Math.sqrt(downwardVector[0]*downwardVector[0] + downwardVector[1]*downwardVector[1] + downwardVector[2]*downwardVector[2]);
          const unitDownward = [downwardVector[0]/downLength, downwardVector[1]/downLength, downwardVector[2]/downLength];
          
          // 确定向量长度
          const vectorLength = 4;
          
          // 向上方向的法向量（红色N）
          const upwardNormal = [unitUpward[0] * vectorLength, unitUpward[1] * vectorLength, unitUpward[2] * vectorLength];
          
          // 向下方向的法向量（蓝色S）
          const downwardNormal = [unitDownward[0] * vectorLength, unitDownward[1] * vectorLength, unitDownward[2] * vectorLength];
          
          return (
            <group position={ballCenter}>
              {/* 向上红色法向量箭头 */}
              <primitive
                object={new THREE.ArrowHelper(
                  new THREE.Vector3(unitUpward[0], unitUpward[1], unitUpward[2]),
                  new THREE.Vector3(0, 0, 0),
                  vectorLength,
                  0xef4444,  // 红色
                  vectorLength * 0.2,  // 箭头长度
                  vectorLength * 0.1   // 箭头宽度
                )}
              />
              
              {/* 向下蓝色法向量箭头 */}
              <primitive
                object={new THREE.ArrowHelper(
                  new THREE.Vector3(unitDownward[0], unitDownward[1], unitDownward[2]),
                  new THREE.Vector3(0, 0, 0),
                  vectorLength,
                  0x3b82f6,  // 蓝色
                  vectorLength * 0.2,  // 箭头长度
                  vectorLength * 0.1   // 箭头宽度
                )}
              />
            </group>
          );
        })()
      )}
      
      {/* 轨迹线 */}
      {showTrajectory && trajectory.length > 1 && (
        <BreathingTrajectory trajectory={trajectory} />
      )}
      
      {/* 可行解示例点 */}
      {currentActiveTerm === 'feasible-solution' && trajectory.length > 3 && (
        <mesh position={[trajectory[Math.floor(trajectory.length/2)][0], trajectory[Math.floor(trajectory.length/2)][1] + 0.15, trajectory[Math.floor(trajectory.length/2)][2]]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshPhongMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.3} />
        </mesh>
      )}
      
      {/* 最优解标记 */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.02, 16]} />
          <meshBasicMaterial 
            color={currentActiveTerm === 'optimal-solution' ? "#3ce6c0" : "#22c55e"} 
            transparent 
            opacity={currentActiveTerm === 'optimal-solution' ? 0.8 : 0.3}
          />
        </mesh>
        {(currentActiveTerm === 'optimal-solution' || isOptimal) && (
          <Text
            position={[0, 0.3, 0]}
            fontSize={0.2}
            color="#22c55e"
            anchorX="center"
            anchorY="middle"
          >
            {isOptimal ? "Converged!" : "Optimum"}
          </Text>
        )}
      </group>
      
      {/* 网格底面 */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[120, 80, 40, 30]} />
        <meshBasicMaterial 
          color="#374151" 
          wireframe 
          opacity={0.2}
          transparent
        />
      </mesh>
      
      {/* XOY平面坐标轴 - 带呼吸效果 */}
      <BreathingAxes showGradientField={showGradientField} />
      
      {/* 可行域随机点 */}
      <FeasibleRegionPoints 
        currentActiveTerm={currentActiveTerm}
        objectiveFunction={objectiveFunction}
        showConstraints={showConstraints}
        constraintType={constraintType}
      />
      
      {/* 最优解点 */}
      <OptimalSolutionPoint 
        currentActiveTerm={currentActiveTerm}
        objectiveFunction={objectiveFunction}
      />
      
      {/* 呼吸可行域 */}
      <BreathingFeasibleRegion currentActiveTerm={currentActiveTerm} />
    </>
  );
};

// 主组件
const Section2Descent3D = ({ id }) => {
  // 核心状态管理
  const [algorithm, setAlgorithm] = useState('gradient');
  const [stepSize, setStepSize] = useState(15.0);
  const [dampingFactor, setDampingFactor] = useState(1.0);
  const [isRunning, setIsRunning] = useState(false);
  const [showTrajectory, setShowTrajectory] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [ballPosition, setBallPosition] = useState([25, 0, 15]); // 95%范围内随机位置
  const [trajectory, setTrajectory] = useState([]);
  const [iteration, setIteration] = useState(0);
  const [functionValue, setFunctionValue] = useState(0);
  const [gradientNorm, setGradientNorm] = useState(0);
  const [isOptimal, setIsOptimal] = useState(false);
  const [gradientVector, setGradientVector] = useState([0, 0]);
  
  // 概念标签状态管理
  const [hoveredTerm, setHoveredTerm] = useState(null);
  const [showTooltip, setShowTooltip] = useState(null);
  
  // 约束演示状态
  const [showConstraints, setShowConstraints] = useState(false);
  const [constraintType, setConstraintType] = useState('inequality'); // inequality, equality
  const [constraintDropdownOpen, setConstraintDropdownOpen] = useState(false);
  
  // 梯度场显示状态
  const [showGradientField, setShowGradientField] = useState(false);
  const [algorithmDropdownOpen, setAlgorithmDropdownOpen] = useState(false);
  
  // 深度思考状态
  const [showThinkingBubble, setShowThinkingBubble] = useState(false);
  
  // 思考问题内容
  const thinkingQuestions = [
    '约束条件是否会影响利普希茨常数 L，进而影响收敛区间？为什么？',
    '曲面上任意一点的梯度向量反应了什么？对应地，二维图像的梯度反应了什么？',
    '曲面上任意一点的海塞矩阵反应了什么？对应地，二维图像的海塞矩阵反应了什么？',
    '为什么目标函数是二次函数时，牛顿法的迭代点在 XOY 平面上是一条直线？',
    '既然牛顿迭代法迭代效率高，求解速度快，为什么在很多具体的优化问题中（如深度学习领域）仍然使用一阶梯度下降法？',
    '迭代法对连续性和光滑性有什么要求？初值在最优解附近的非常小的领域内时一定能收敛吗？'
    ];
  
  // 收敛阈值状态 (范围: 0.001 ~ 0.00000001)
  const [convergenceThreshold, setConvergenceThreshold] = useState(0.001);
  
  // 上一次随机位置状态
  const [lastRandomPosition, setLastRandomPosition] = useState([25, 0, 15]);
  
  // 非线性滑动条转换函数：指数映射
  const sliderToThreshold = (sliderValue) => {
    // sliderValue: 0-100, 映射到 0.001 - 1e-8
    // 0 -> 0.001 (1e-3), 100 -> 1e-8
    // 使用对数映射: threshold = 10^(-3 - 5*sliderValue/100)
    const exponent = -3 - 5 * sliderValue / 100; // -3 到 -8
    return Math.pow(10, exponent);
  };
  
  const thresholdToSlider = (threshold) => {
    // 逆映射: 已知 threshold = 10^(-3 - 5*sliderValue/100)
    // log10(threshold) = -3 - 5*sliderValue/100
    // sliderValue = (-log10(threshold) - 3) * 100 / 5
    const clampedThreshold = Math.max(1e-8, Math.min(0.001, threshold));
    const exponent = Math.log10(clampedThreshold);
    const sliderValue = (-exponent - 3) * 100 / 5;
    return Math.max(0, Math.min(100, sliderValue));
  };
  
  const animationRef = useRef();

  // 二次强凸目标函数: f(x,y) = 1/100*(x^2 + 2xy + 4y^2) = 0.01*x^2 + 0.02*xy + 0.04*y^2
  const objectiveFunction = (x, y) => {
    return 0.01 * x * x + 0.02 * x * y + 0.04 * y * y;
  };

  // 计算解析梯度: ∇f(x,y) = [0.02(x+y), 0.02(x+4y)]
  const gradient = (x, y) => {
    return [0.02 * (x + y), 0.02 * (x + 4 * y)];
  };

  // 海塞矩阵 (常数矩阵): H = (1/50)*[[1,1],[1,4]] = [[0.02,0.02],[0.02,0.08]]
  const hessian = (x, y) => {
    // 对于二次函数，海塞矩阵为常数，与(x,y)无关
    return [[0.02, 0.02], [0.02, 0.08]];
  };

  // 矩阵求逆 (2x2)
  const invertMatrix2x2 = (matrix) => {
    const [[a, b], [c, d]] = matrix;
    const det = a * d - b * c;
    return [[d/det, -b/det], [-c/det, a/det]];
  };

  // 投影到约束集
  const projectToConstraints = (x, y) => {
    if (!showConstraints) return [x, y];
    
    if (constraintType === 'inequality') {
      // 圆盘约束 x^2 + y^2 ≤ R^2, R = 25 (适配新的显示范围)
      const R = 25;
      const dist = Math.sqrt(x*x + y*y);
      if (dist > R) {
        return [x * R / dist, y * R / dist];
      }
      return [x, y];
    } else if (constraintType === 'equality') {
      // 等式约束 x - 2y² = 0 的投影，即投影到抛物线 x = 2y²
      // 找到距离 (x,y) 最近的抛物线上的点
      
      // 抛物线上的点可以参数化为 (2t², t)，其中 t 是参数
      // 我们需要找到使 ||(x,y) - (2t², t)||² 最小的 t
      // 距离平方 = (x - 2t²)² + (y - t)²
      // 对 t 求导并令其为 0：d/dt[(x - 2t²)² + (y - t)²] = 0
      // = 2(x - 2t²)(-4t) + 2(y - t)(-1) = 0
      // = -8t(x - 2t²) - 2(y - t) = 0
      // = -8tx + 16t³ - 2y + 2t = 0
      // = 16t³ + 2t - 8tx - 2y = 0
      // = 16t³ + t(2 - 8x) - 2y = 0
      
      // 这是一个三次方程，我们使用数值方法求解
      // 为简化，我们使用牛顿法迭代求解
      let t = y; // 初始猜测
      for (let i = 0; i < 10; i++) {
        const f = 16 * t * t * t + t * (2 - 8 * x) - 2 * y;
        const df = 48 * t * t + (2 - 8 * x);
        if (Math.abs(df) < 1e-10) break;
        t = t - f / df;
      }
      
      // 投影点为 (2t², t)
      return [2 * t * t, t];
    }
    
    return [x, y];
  };

  // 术语标签定义
  const termChips = [
    { id: 'decision-var', label: '决策变量', concept: 'decision variables' },
    { id: 'objective', label: '目标函数', concept: 'objective function' },
    { id: 'inequality', label: '不等式约束', concept: 'inequality constraints' },
    { id: 'equality', label: '等式约束', concept: 'equality constraints' },
    { id: 'domain', label: '定义域', concept: 'domain' },
    { id: 'feasible-region', label: '可行域', concept: 'feasible region' },
    { id: 'feasible-solution', label: '可行解', concept: 'feasible solution' },
    { id: 'optimal-solution', label: '最优解', concept: 'optimal solution' }
  ];

  // 术语提示信息
  const termTooltips = {
    'decision-var': '决策变量 xₖ(x,y)：绿色小球的当前位置坐标',
    'objective': '目标函数：二次强凸函数，椭圆碗形曲面，唯一最小值在(0,0)',
    'inequality': '不等式约束：x²+y²≤25²',
    'equality': '等式约束：x-2y²=0',
    'domain': '定义域：展示窗口内所有可取点的集合',
    'feasible-region': '可行域：满足所有约束的决策变量集合',
    'feasible-solution': '可行解：可行域内的任意一个具体解',
    'optimal-solution': '最优解：(x,y)=(0,0)，使目标函数达到全局最小值'
  };

  // 优化步骤
  const optimizationStep = useCallback(() => {
    setBallPosition(prevPos => {
      const [x, , z] = prevPos;
      const [gx, gz] = gradient(x, z);
      
      let newX, newZ;
      
      if (algorithm === 'gradient') {
        // 梯度下降法
        newX = x - stepSize * gx;
        newZ = z - stepSize * gz;
      } else if (algorithm === 'newton') {
        // 牛顿法 - 使用预计算的 H^{-1} = 50*(1/3)*[[4,-1],[-1,1]] = [[200/3, -50/3], [-50/3, 50/3]]
        // H^{-1} = [[66.667, -16.667], [-16.667, 16.667]]
        const HInv = [[200/3, -50/3], [-50/3, 50/3]];
        const newtonStep = [
          -(HInv[0][0] * gx + HInv[0][1] * gz),
          -(HInv[1][0] * gx + HInv[1][1] * gz)
        ];
        // 使用阻尼因子：x_{k+1} = x_k + dampingFactor * newtonStep
        newX = x + dampingFactor * newtonStep[0];
        newZ = z + dampingFactor * newtonStep[1];
      }
      
      // 投影到约束集
      [newX, newZ] = projectToConstraints(newX, newZ);
      
      const newY = objectiveFunction(newX, newZ);
      const newPos = [newX, newY, newZ];
      
      // 更新轨迹
      setTrajectory(prev => [...prev, newPos]);
      
      // 更新统计信息
      const newGrad = gradient(newX, newZ);
      const newGradNorm = Math.sqrt(newGrad[0]*newGrad[0] + newGrad[1]*newGrad[1]);
      
      // 迭代次数更新移到外部避免StrictMode重复执行
      setFunctionValue(newY);
      setGradientNorm(newGradNorm);
      setGradientVector(newGrad);
      
      // 检查收敛 - 迭代条件：梯度模 ≤ 收敛阈值
      if (newGradNorm <= convergenceThreshold) {
        setIsOptimal(true);
        setIsRunning(false);
      }
      
      return newPos;
    });
    
    // 在外部更新迭代次数，避免StrictMode重复执行
    setIteration(prev => {
      return prev + 1;
    });
    
  }, [algorithm, stepSize, dampingFactor, showConstraints, constraintType, convergenceThreshold]);

  // 悬停处理 - 使用稳定的状态管理避免闪烁
  const tooltipStateRef = useRef({
    activeId: null,
    hoverTimer: null,
    leaveTimer: null,
    isLeaving: false
  });

  const handleTermHover = useCallback((termId) => {
    const state = tooltipStateRef.current;
    
    // 如果正在离开同一个元素，取消离开
    if (state.activeId === termId && state.isLeaving) {
      if (state.leaveTimer) {
        clearTimeout(state.leaveTimer);
        state.leaveTimer = null;
      }
      state.isLeaving = false;
      return;
    }
    
    // 清除之前的定时器
    if (state.hoverTimer) {
      clearTimeout(state.hoverTimer);
      state.hoverTimer = null;
    }
    if (state.leaveTimer) {
      clearTimeout(state.leaveTimer);
      state.leaveTimer = null;
    }
    
    // 更新状态
    state.activeId = termId;
    state.isLeaving = false;
    
    // 立即显示
    setHoveredTerm(termId);
    setShowTooltip(termId);
    
    // 4秒后自动隐藏
    state.hoverTimer = setTimeout(() => {
      if (state.activeId === termId && !state.isLeaving) {
        setShowTooltip(null);
        state.activeId = null;
        state.hoverTimer = null;
      }
    }, 4000);
  }, []);

  const handleTermLeave = useCallback(() => {
    const state = tooltipStateRef.current;
    
    if (!state.activeId || state.isLeaving) return;
    
    state.isLeaving = true;
    
    // 延迟清除，给用户时间重新悬浮
    state.leaveTimer = setTimeout(() => {
      if (state.isLeaving) {
        setHoveredTerm(null);
        setShowTooltip(null);
        state.activeId = null;
        state.isLeaving = false;
        state.leaveTimer = null;
      }
    }, 200);
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      const state = tooltipStateRef.current;
      if (state.hoverTimer) clearTimeout(state.hoverTimer);
      if (state.leaveTimer) clearTimeout(state.leaveTimer);
    };
  }, []);

  // 自动运行逻辑
  useEffect(() => {
    if (isRunning && !isOptimal) {
      animationRef.current = setInterval(() => {
        optimizationStep();
      }, 300);
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isRunning, isOptimal, optimizationStep]);

  // 重置功能 - 回到上一次随机的位置
  const handleReset = () => {
    setIsRunning(false);
    setIsOptimal(false);
    
    // 回到上一次随机的位置
    const resetY = objectiveFunction(lastRandomPosition[0], lastRandomPosition[2]);
    const resetPosition = [lastRandomPosition[0], resetY, lastRandomPosition[2]];
    
    setBallPosition(resetPosition);
    setTrajectory([resetPosition]);
    setIteration(0);
    setFunctionValue(resetY);
    setGradientNorm(0);
    setGradientVector([0, 0]);
  };

  // 随机起点 - 包含重置逻辑且改变小球起点位置
  const handleRandomStart = () => {
    setIsRunning(false);
    setIsOptimal(false);
    
    let initialPos;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
      // 在95%范围内随机选点
      initialPos = [
        (Math.random() - 0.5) * 2 * 50 * 0.95, // X: 95% of [-50, 50] = [-47.5, 47.5]
        0,
        (Math.random() - 0.5) * 2 * 30 * 0.95  // Z: 95% of [-30, 30] = [-28.5, 28.5]
      ];
      attempts++;
      
      // 检查约束条件
      if (!showConstraints) {
        break; // 没有约束条件，直接使用
      }
      
      if (constraintType === 'inequality') {
        // 不等式约束: x^2 + y^2 ≤ 25^2
        const distance = Math.sqrt(initialPos[0] * initialPos[0] + initialPos[2] * initialPos[2]);
        if (distance <= 25) {
          break; // 满足约束条件
        }
      } else if (constraintType === 'equality') {
        // 等式约束: x - 2y² = 0，即 x = 2y²
        // 在抛物线上随机选点
        const z = (Math.random() - 0.5) * 2 * 28.5; // Y范围对应Z
        const x = 2 * z * z; // x = 2y²
        if (x <= 47.5) { // 确保在X范围内
          initialPos = [x, 0, z];
          break;
        }
      }
    } while (attempts < maxAttempts);
    
    // 如果尝试太多次仍不满足约束，使用约束区域中心点
    if (attempts >= maxAttempts) {
      if (constraintType === 'inequality') {
        // 在圆盘内选择随机点
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * 25;
        initialPos = [radius * Math.cos(angle), 0, radius * Math.sin(angle)];
      } else if (constraintType === 'equality') {
        // 在抛物线约束线上选择点
        initialPos = [0, 0, 0]; // 原点，满足 x - 2y² = 0
      }
    }
    
    initialPos[1] = objectiveFunction(initialPos[0], initialPos[2]);
    
    // 保存为上一次随机位置
    setLastRandomPosition(initialPos);
    
    setBallPosition(initialPos);
    setTrajectory([initialPos]);
    setIteration(0);
    setFunctionValue(initialPos[1]);
    setGradientNorm(0);
    setGradientVector([0, 0]);
  };

  // 初始化
  useEffect(() => {
    const initialY = objectiveFunction(ballPosition[0], ballPosition[2]);
    setBallPosition([ballPosition[0], initialY, ballPosition[2]]);
    setTrajectory([[ballPosition[0], initialY, ballPosition[2]]]);
    setFunctionValue(initialY);
    
    const initialGrad = gradient(ballPosition[0], ballPosition[2]);
    setGradientVector(initialGrad);
    setGradientNorm(Math.sqrt(initialGrad[0]*initialGrad[0] + initialGrad[1]*initialGrad[1]));
  }, []);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (constraintDropdownOpen && !event.target.closest('.constraint-dropdown')) {
        setConstraintDropdownOpen(false);
      }
      if (algorithmDropdownOpen && !event.target.closest('.algorithm-dropdown')) {
        setAlgorithmDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [constraintDropdownOpen, algorithmDropdownOpen]);

  // 获取当前活跃术语
  const currentActiveTerm = hoveredTerm;

  return (
    <section
      id={id}
      className="snap-section relative flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: 'var(--bg-deep)' }}
    >
      {/* 九曲十八弯重力轨道背景动画 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-deep)]">
        <svg className="absolute inset-0 w-full h-full opacity-[0.75]" viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            {/* 科幻虫洞事件视界 - 深邃高冷，中心透明到深蓝 */}
            <radialGradient id="blackholeEventHorizon">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.0" />
              <stop offset="10%" stopColor="#0a0f2b" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#1a1a2e" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#0d1a33" stopOpacity="0.8" />
              <stop offset="80%" stopColor="#00a8e1" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#aaffff" stopOpacity="0.4" />
            </radialGradient>
            
            {/* 虫洞核心 - 深渊未知，纯黑透明 */}
            <radialGradient id="blackholeCore">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.0" />
              <stop offset="30%" stopColor="#000000" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0a0f2b" stopOpacity="0.8" />
            </radialGradient>
            
            {/* 吸积盘渐变 - 外层 (深蓝到冰蓝) */}
            <radialGradient id="accretionDisk" gradientUnits="userSpaceOnUse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0a0f2b" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#1a1a2e" stopOpacity="0.7" />
              <stop offset="80%" stopColor="#00a8e1" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#aaffff" stopOpacity="0.5" />
            </radialGradient>
            
            {/* 吸积盘渐变 - 中层 (深蓝到霓虹紫) */}
            <radialGradient id="accretionDisk2" gradientUnits="userSpaceOnUse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0d1a33" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#00a8e1" stopOpacity="0.7" />
              <stop offset="80%" stopColor="#a100ff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#8a2be2" stopOpacity="0.5" />
            </radialGradient>
            
            {/* 吸积盘渐变 - 内层 (深邃蓝紫到霓虹光) */}
            <radialGradient id="accretionDisk3" gradientUnits="userSpaceOnUse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1a1a2e" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#6A0FAD" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#00FFFF" stopOpacity="0.5" />
            </radialGradient>
            
            {/* Apple风格轨道渐变 - 低透明度版本 */}
            <linearGradient id="trackGlow">
              <stop offset="0%" stopColor="#007AFF" stopOpacity="0.4" />
              <stop offset="20%" stopColor="#5856D6" stopOpacity="0.4" />
              <stop offset="40%" stopColor="#AF52DE" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#FF2D92" stopOpacity="0.4" />
              <stop offset="80%" stopColor="#FF9500" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#32D74B" stopOpacity="0.4" />
            </linearGradient>
            
            {/* 霓虹能量光晕 - 高对比强光环 */}
            <radialGradient id="energyGlow">
              <stop offset="0%" stopColor="#00ffff" stopOpacity="0.0" />
              <stop offset="70%" stopColor="#00ffff" stopOpacity="0.0" />
              <stop offset="85%" stopColor="#00ffff" stopOpacity="0.6" />
              <stop offset="95%" stopColor="#a100ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FF1493" stopOpacity="0.4" />
            </radialGradient>
            
            {/* 完整小球动画路径 - 4阶段连续路径 */}
            <path id="ballCompletePath" d="
              M 50 170 
              L 50 175 L 50 180 L 50 185 L 50 190 L 50 195 L 50 200
              C 100 220, 150 240, 200 260
              C 250 280, 300 300, 350 280
              C 400 260, 450 220, 500 180
              C 550 140, 600 100, 650 120
              C 700 140, 750 180, 800 200
              C 850 220, 900 240, 950 220
              C 1000 200, 1100 180, 1200 200 
              Q 1250 160, 1300 220 
              Q 1320 280, 1280 340 
              Q 1240 400, 1200 360 
              Q 1100 280, 1000 380 
              Q 900 480, 800 420 
              Q 700 360, 600 460 
              Q 500 560, 400 500 
              Q 300 440, 200 540 
              Q 100 640, 80 680
              Q 82 695, 80 710
              L 80 710 L 80 710 L 80 710
            " fill="none" />
          </defs>
          
          {/* 九曲十八弯轨道 - 从高到低的蜿蜒路径，穿过各功能区域 */}
          <path 
            d="M 50 200 
               C 100 220, 150 240, 200 260
               C 250 280, 300 300, 350 280
               C 400 260, 450 220, 500 180
               C 550 140, 600 100, 650 120
               C 700 140, 750 180, 800 200
               C 850 220, 900 240, 950 220
               C 1000 200, 1100 180, 1200 200 
               Q 1250 160, 1300 220 
               Q 1320 280, 1280 340 
               Q 1240 400, 1200 360 
               Q 1100 280, 1000 380 
               Q 900 480, 800 420 
               Q 700 360, 600 460 
               Q 500 560, 400 500 
               Q 300 440, 200 540 
               Q 100 640, 80 680
               Q 82 695, 80 710"
            fill="none" 
            stroke="url(#trackGlow)" 
            strokeWidth="4"
            className="animate-track-glow"
            opacity="0.15"
            id="curved-track" 
          />
          
          {/* 轨道阴影效果 */}
          <path 
            d="M 50 200 
               C 100 220, 150 240, 200 260
               C 250 280, 300 300, 350 280
               C 400 260, 450 220, 500 180
               C 550 140, 600 100, 650 120
               C 700 140, 750 180, 800 200
               C 850 220, 900 240, 950 220
               C 1000 200, 1100 180, 1200 200 
               Q 1250 160, 1300 220 
               Q 1320 280, 1280 340 
               Q 1240 400, 1200 360 
               Q 1100 280, 1000 380 
               Q 900 480, 800 420 
               Q 700 360, 600 460 
               Q 500 560, 400 500 
               Q 300 440, 200 540 
               Q 100 640, 80 680
               Q 82 695, 80 710"
            fill="none" 
            stroke="rgba(255, 255, 255, 0.1)" 
            strokeWidth="8"
            opacity="0.1"
          />
          
          {/* 起点虫洞 - 科幻发射点，位于曲线起点正上方 */}
          <g transform="translate(50,170) rotate(-25) scale(0.8, 0.4)">
            <g className="animate-wormhole-rotation">
              {/* 黑洞事件视界 - 侧视椭圆 */}
              <ellipse rx="35" ry="20" fill="url(#blackholeEventHorizon)" opacity="0.85" className="animate-blackhole-event-horizon" />
              <ellipse rx="30" ry="18" fill="none" stroke="url(#energyGlow)" strokeWidth="2" strokeDasharray="10,5" className="animate-blackhole-accretion" opacity="0.7" />
              
              {/* 外层霓虹能量光环 - 科幻脉冲效果 */}
              <ellipse rx="42" ry="25" fill="none" stroke="url(#energyGlow)" strokeWidth="2" opacity="0.5" className="animate-energy-halo" strokeDasharray="6,3" />
              
              {/* 立体吸积盘 - 侧视多层椭圆 */}
              <g className="animate-blackhole-disk">
                {Array.from({ length: 2 }, (_, i) => (
                  <ellipse key={i} rx={38 - i * 8} ry={8 - i * 2} 
                           fill="none" 
                           stroke="url(#accretionDisk)" 
                           strokeWidth="3"
                           className="animate-blackhole-disk-ring" 
                           opacity={0.8 - i * 0.1}
                           style={{ animationDelay: `${i * 0.4}s` }} />
                ))}
                {Array.from({ length: 2 }, (_, i) => (
                  <ellipse key={`inner-${i}`} rx={28 - i * 5} ry={6 - i * 1} 
                           fill="none" 
                           stroke="url(#accretionDisk2)" 
                           strokeWidth="2"
                           className="animate-blackhole-disk" 
                           opacity={0.9 - i * 0.1}
                           style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </g>
              
              {/* 黑洞核心 */}
              <ellipse rx="15" ry="9" fill="url(#blackholeCore)" className="animate-blackhole-core" opacity="1.0" />
              
              {/* 霍金辐射粒子 - 较少数量 */}
              {Array.from({ length: 6 }, (_, i) => {
                const angle = (i * Math.PI / 3);
                const radius = 45;
                const x = radius * Math.cos(angle);
                const y = radius * Math.sin(angle) * 0.5;
                const colors = ['#00FFFF', '#a100ff', '#FF1493', '#00a8e1', '#aaffff', '#8a2be2'];
                return (
                  <circle key={i} r="2" fill={colors[i]} className="animate-hawking-radiation" opacity="0.9"
                         style={{ animationDelay: `${i * 0.3}s` }}>
                    <animateMotion dur="3s" repeatCount="indefinite" begin={`${i * 0.3}s`}>
                      <path d={`M ${x} ${y} Q ${x*0.3} ${y*0.3} 0 0`} />
                    </animateMotion>
                  </circle>
                );
              })}
              
            </g>
          </g>
          
          {/* 底部虫洞 - 侧视倾斜旋转视角，绚丽多彩，反向倾斜 */}
          <g transform="translate(80,710) rotate(25) scale(1, 0.5)">
            <g className="animate-wormhole-rotation" style={{ animationDirection: 'reverse' }}>
              {/* 黑洞事件视界 - 侧视椭圆，更清晰更大 */}
              <ellipse rx="48" ry="24" fill="url(#blackholeEventHorizon)" opacity="0.95" className="animate-blackhole-event-horizon" />
              <ellipse rx="42" ry="21" fill="none" stroke="url(#energyGlow)" strokeWidth="4" strokeDasharray="12,6" className="animate-blackhole-accretion" opacity="0.85" />
              
              {/* 外层霓虹能量光环 - 科幻脉冲效果 */}
              <ellipse rx="60" ry="30" fill="none" stroke="url(#energyGlow)" strokeWidth="4" opacity="0.7" className="animate-energy-halo" strokeDasharray="10,5" />
              
              {/* 立体吸积盘 - 侧视多层椭圆，超级绚丽彩虹色 */}
              <g className="animate-blackhole-disk">
                {Array.from({ length: 3 }, (_, i) => (
                  <ellipse key={i} rx={55 - i * 10} ry={11 - i * 3} 
                           fill="none" 
                           stroke="url(#accretionDisk)" 
                           strokeWidth="5"
                           className="animate-blackhole-disk-ring" 
                           opacity={0.95 - i * 0.1}
                           style={{ animationDelay: `${i * 0.5}s` }} />
                ))}
                {Array.from({ length: 3 }, (_, i) => (
                  <ellipse key={`inner-${i}`} rx={42 - i * 7} ry={9 - i * 2} 
                           fill="none" 
                           stroke="url(#accretionDisk2)" 
                           strokeWidth="4"
                           className="animate-blackhole-disk" 
                           opacity={1.0 - i * 0.1}
                           style={{ animationDelay: `${i * 0.3}s` }} />
                ))}
                {Array.from({ length: 2 }, (_, i) => (
                  <ellipse key={`core-${i}`} rx={35 - i * 8} ry={6 - i * 2} 
                           fill="none" 
                           stroke="url(#accretionDisk3)" 
                           strokeWidth="3"
                           className="animate-blackhole-accretion" 
                           opacity={1.0 - i * 0.05}
                           style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </g>
              
              {/* 黑洞核心 - 侧视椭圆，超清晰 */}
              <ellipse rx="22" ry="11" fill="url(#blackholeCore)" className="animate-blackhole-core" opacity="1.0" />
              
              {/* 霍金辐射粒子 - 3D螺旋轨道，银河系色彩 */}
              {Array.from({ length: 10 }, (_, i) => {
                const angle = (i * Math.PI / 5);
                const radius = 62;
                const x = radius * Math.cos(angle);
                const y = radius * Math.sin(angle) * 0.5;
                const colors = ['#00FFFF', '#a100ff', '#FF1493', '#00a8e1', '#aaffff', '#8a2be2', '#6A0FAD', '#0a0f2b', '#1a1a2e', '#0d1a33'];
                return (
                  <circle key={i} r="3" fill={colors[i]} className="animate-hawking-radiation" opacity="0.95"
                         style={{ animationDelay: `${i * 0.2}s` }}>
                    <animateMotion dur="4s" repeatCount="indefinite" begin={`${i * 0.2}s`}>
                      <path d={`M ${x} ${y} Q ${x*0.5} ${y*0.5} 0 0`} />
                    </animateMotion>
                  </circle>
                );
              })}
              
              {/* 能量波动环 - 侧视极度扁平，多彩渐变 */}
              {Array.from({ length: 4 }, (_, i) => (
                <ellipse key={`wave-${i}`} rx={30 + i * 10} ry={(30 + i * 10) * 0.5} fill="none" 
                        stroke="url(#accretionDisk2)" strokeWidth="2" opacity={0.8 - i * 0.15}
                        className="animate-wormhole-particles"
                        style={{ animationDelay: `${i * 0.3}s` }} />
              ))}
              
              {/* 虫洞深度指示线 - 创造隧道深度感，彩色 */}
              {Array.from({ length: 8 }, (_, i) => (
                <line key={`depth-${i}`}
                     x1={28 * Math.cos(i * Math.PI / 4)} y1={14 * Math.sin(i * Math.PI / 4)}
                     x2={18 * Math.cos(i * Math.PI / 4)} y2={9 * Math.sin(i * Math.PI / 4)}
                     stroke="url(#accretionDisk3)" strokeWidth="1.5" opacity="0.7"
                     className="animate-blackhole-accretion"
                     style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
              
              {/* 额外的能量闪光层 */}
              {Array.from({ length: 6 }, (_, i) => (
                <ellipse key={`flash-${i}`} rx={25 + i * 5} ry={(25 + i * 5) * 0.5} fill="url(#energyGlow)" 
                        opacity={0.4 - i * 0.05} className="animate-wormhole-pulse"
                        style={{ animationDelay: `${i * 0.25}s` }} />
              ))}
            </g>
          </g>
          
          {/* 统一小球 - animateMotion方案解决路径贴合问题 */}
          <circle r="8" fill="rgb(60, 230, 192)">
            {/* 主要路径动画 - 使用精确的SVG路径 */}
            <animateMotion dur="10s" repeatCount="indefinite" 
                          calcMode="linear" 
                          keyTimes="0;0.07;0.93;1" 
                          keyPoints="0;0;1;1">
              <mpath href="#ballCompletePath" />
            </animateMotion>
            
            {/* 透明度动画 - 4个关键阶段 */}
            <animate attributeName="opacity" 
              values="0;1;1;0" 
              keyTimes="0;0.07;0.93;1"
              dur="10s" repeatCount="indefinite" />
            
            {/* 尺寸动画 - 弹出和吸入时的缩放效果 */}
            <animate attributeName="r" 
              values="2;8;8;2" 
              keyTimes="0;0.07;0.93;1"
              dur="10s" repeatCount="indefinite" />
            
            {/* 颜色动画 - 不同阶段的颜色变化 */}
            <animate attributeName="fill" 
              values="rgb(0,255,255);rgb(60,230,192);rgb(236,72,153);rgb(255,100,100)" 
              keyTimes="0;0.07;0.93;1"
              dur="10s" repeatCount="indefinite" />
          </circle>
          
          {/* 粒子轨迹效果 */}
          {Array.from({ length: 8 }, (_, i) => (
            <circle key={i} r="2" opacity="0.6">
              <animateMotion dur="12s" repeatCount="indefinite" calcMode="linear" begin={`${i * 0.3}s`}>
                <mpath href="#curved-track" />
              </animateMotion>
              <animate attributeName="fill" 
                values="rgba(60, 230, 192, 0.5);rgba(34, 197, 94, 0.5);rgba(59, 130, 246, 0.5);rgba(168, 85, 247, 0.5);rgba(236, 72, 153, 0.5);rgba(60, 230, 192, 0.5)" 
                dur="12s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite" />
            </circle>
          ))}
        </svg>
        
        {/* 环境粒子效果 */}
        <div className="absolute inset-0 opacity-[0.15]">
          <div className="w-full h-full animate-env-particles" style={{
            backgroundImage: `
              radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.3) 1px, transparent 2px),
              radial-gradient(circle at 80% 30%, rgba(59, 130, 246, 0.25) 1px, transparent 2px),
              radial-gradient(circle at 60% 70%, rgba(34, 197, 94, 0.2) 1px, transparent 2px),
              radial-gradient(circle at 30% 80%, rgba(236, 72, 153, 0.25) 1px, transparent 2px)
            `,
            backgroundSize: '150px 150px, 180px 180px, 200px 200px, 160px 160px',
          }} />
        </div>
      </div>
      <div className="relative z-10 w-full h-full" style={{ padding: '60px 24px' }}>
        <div className="w-full max-w-7xl mx-auto h-full">
          
          {/* 主要内容区域 - 左侧概念标签，中间动画区，右侧控制面板 */}
          <div className="flex gap-6" style={{ height: 'calc(100% - 35px)', marginTop: '5px' }}>
            
            {/* 左侧：标题 + 函数公式 + 实时信息 + 核心概念 */}
            <div className="flex-shrink-0 flex flex-col space-y-4" style={{ width: '235px' }}>
              
              {/* 1. 目标函数公式 */}
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg border text-center" style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--carbon-line)'
                }}>
                  <h4 className="text-xs font-semibold mb-3 text-center" style={{ color: 'var(--tech-mint)' }}>
                    目标函数
                  </h4>
                  <div>
                    <BlockMath math="f(x,y) =" />
                    <BlockMath math="0.01x^2 + 0.02xy + 0.04y^2" />
                  </div>
                </div>
              </div>
              
              {/* 2. 实时信息 HUD */}
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg border" style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--carbon-line)'
                }}>
                  <h4 className="text-xs font-semibold mb-3 text-center" style={{ color: 'var(--tech-mint)' }}>
                    实时信息
                  </h4>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--ink-mid)' }}>迭代次数:</span>
                      <span className="font-mono" style={{ color: 'var(--ink-high)' }}>{iteration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--ink-mid)' }}>位置:</span>
                      <span className="font-mono" style={{ color: 'var(--ink-high)' }}>
                        ({ballPosition[0].toFixed(3)}, {ballPosition[2].toFixed(3)})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--ink-mid)' }}>函数值:</span>
                      <span className="font-mono" style={{ color: 'var(--ink-high)' }}>{functionValue.toFixed(9)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--ink-mid)' }}>梯度模:</span>
                      <span className="font-mono" style={{ color: 'var(--ink-high)' }}>{gradientNorm.toFixed(9)}</span>
                    </div>
                    {isOptimal && (
                      <div className="mt-2 p-2 rounded text-center" style={{ backgroundColor: 'var(--tech-mint)', color: 'var(--bg-deep)' }}>
                        <span className="text-xs font-semibold">✓ 已收敛到最优解!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* 3. 核心概念按钮 */}
              <div className="flex-1 flex flex-col justify-start">
                <div className="flex-1 flex flex-col justify-between">
                    {termChips.map((chip, index) => {
                      const isActive = currentActiveTerm === chip.id;
                      
                      return (
                        <div key={chip.id} className="relative">
                          <button
                            className={`concept-chip w-full px-3 py-2 rounded-lg text-xs font-medium focus:outline-none ${
                              isActive ? 'active' : ''
                            }`}
                            style={{
                              backgroundColor: isActive ? 'var(--tech-mint)' : 'var(--bg-surface)',
                              color: isActive ? 'var(--bg-deep)' : 'var(--ink-high)',
                              border: `1px solid var(--carbon-line)`
                            }}
                            onMouseEnter={() => handleTermHover(chip.id)}
                            onMouseLeave={() => handleTermLeave()}
                            tabIndex={0}
                            aria-label={chip.label}
                          >
                            {chip.label}
                          </button>
                          
                          {/* 气泡提示 */}
                          {showTooltip === chip.id && (
                            <div 
                              className="absolute z-50 px-3 py-2 text-xs rounded-lg shadow-lg animate-fade-in"
                              style={{
                                backgroundColor: 'var(--tech-mint)',
                                color: 'var(--bg-deep)',
                                border: '2px solid #22d3ee',
                                boxShadow: '0 0 12px rgba(34, 211, 238, 0.6)',
                                top: '50%',
                                left: '100%',
                                transform: 'translateY(-50%)',
                                marginLeft: '12px',
                                minWidth: 'max-content',
                                maxWidth: '350px',
                                whiteSpace: 'pre-line',
                                backdropFilter: 'blur(4px)',
                                pointerEvents: 'none' // 防止tooltip本身触发鼠标事件
                              }}
                            >
                              {termTooltips[chip.id]}
                              
                              {/* 气泡箭头 */}
                              <div 
                                className="absolute"
                                style={{
                                  top: '50%',
                                  left: '0',
                                  transform: 'translate(-100%, -50%)',
                                  width: 0,
                                  height: 0,
                                  borderTop: '6px solid transparent',
                                  borderBottom: '6px solid transparent',
                                  borderRight: '6px solid var(--tech-mint)'
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
            
            {/* 中间：3D可视化区域 */}
            <div className="flex-1 min-h-0 relative">
              <div className="h-full rounded-xl border" style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--carbon-line)'
              }}>
                
                {/* 右上角深度思考和梯度场按钮 */}
                <div className="absolute top-0 right-0 z-10 flex">
                  {/* 深度思考按钮 */}
                  <div className="relative">
                    <button
                      className="px-3 py-2 text-xs font-medium rounded-tl-none rounded-br-none rounded-tr-none rounded-bl-lg transition-all duration-200 hover:scale-105"
                      style={{
                        backgroundColor: 'var(--tech-mint)',
                        color: 'var(--bg-deep)',
                        border: `1px solid var(--tech-mint)`,
                        borderRight: 'none',
                        boxShadow: showThinkingBubble ? '0 0 12px rgba(34, 211, 238, 0.4)' : '0 0 6px rgba(34, 211, 238, 0.2)'
                      }}
                      onMouseEnter={() => setShowThinkingBubble(true)}
                      onMouseLeave={() => setShowThinkingBubble(false)}
                    >
                      💭 深度思考
                    </button>
                    
                    {/* 思考问题气泡 */}
                    {showThinkingBubble && (
                      <div 
                        className="absolute top-full left-0 mt-2 w-80 p-4 rounded-lg shadow-lg z-20"
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--tech-mint)',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                        }}
                      >
                        <div className="text-sm font-semibold mb-3" style={{ color: 'var(--ink-high)' }}>
                          🤔 优化算法深度思考
                        </div>
                        <ul className="space-y-2 text-xs" style={{ color: 'var(--ink-medium)' }}>
                          {thinkingQuestions.map((question, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="font-bold mt-0.5" style={{ color: 'var(--tech-mint)' }}>•</span>
                              <span>{question}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {/* 梯度场显示按钮 */}
                  <button
                    className="px-3 py-2 text-xs font-medium rounded-tl-none rounded-br-none rounded-tr-xl rounded-bl-none transition-all duration-200 hover:scale-105"
                    style={{
                      backgroundColor: showGradientField ? 'var(--tech-mint)' : 'var(--bg-elevated)',
                      color: showGradientField ? 'var(--bg-deep)' : 'var(--ink-high)',
                      border: `1px solid ${showGradientField ? 'var(--tech-mint)' : 'var(--carbon-line)'}`,
                      boxShadow: showGradientField ? '0 0 12px rgba(34, 211, 238, 0.4)' : 'none'
                    }}
                    onClick={() => setShowGradientField(!showGradientField)}
                  >
                    {showGradientField ? '关闭梯度场' : '显示梯度场'}
                  </button>
                </div>
                
                <Canvas camera={{ position: [80, 50, 80], fov: 60 }}>
                  <ambientLight intensity={0.5} />
                  <pointLight position={[8, 8, 8]} intensity={1.0} />
                  <pointLight position={[-4, -4, -4]} intensity={0.3} />
                  
                  <FunctionSurface
                    currentActiveTerm={currentActiveTerm}
                    algorithm={algorithm}
                    stepSize={stepSize}
                    dampingFactor={dampingFactor}
                    showTrajectory={showTrajectory}
                    ballPosition={ballPosition}
                    setBallPosition={setBallPosition}
                    trajectory={trajectory}
                    setTrajectory={setTrajectory}
                    showConstraints={showConstraints}
                    constraintType={constraintType}
                    isOptimal={isOptimal}
                    gradientVector={gradientVector}
                    showVectors={showVectors}
                    showGradientField={showGradientField}
                  />
                  
                  <OrbitControls
                    enableZoom={true}
                    enablePan={true}
                    enableRotate={true}
                    maxDistance={150}
                    minDistance={20}
                  />
                </Canvas>
              </div>
            </div>
            
            {/* 右侧：控制面板 */}
            <div className="flex-shrink-0 flex flex-col" style={{ width: '255px' }}>

              {/* 控制面板 */}
              <div className="flex-shrink-0 flex flex-col space-y-3 mb-4">
                
                {/* 算法选择 */}
                <div className="space-y-2">
                  <label className="text-xs" style={{ color: 'var(--ink-mid)' }}>优化算法</label>
                  <div className="relative algorithm-dropdown">
                    <button
                      onClick={() => setAlgorithmDropdownOpen(!algorithmDropdownOpen)}
                      className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] text-xs text-left flex justify-between items-center hover:bg-opacity-80"
                    >
                      <span>
                        {algorithm === 'gradient' ? '梯度下降' : 
                         algorithm === 'newton' ? '牛顿法' : 
                         algorithm === 'damped-newton' ? '阻尼牛顿法' : '梯度下降'}
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
                        <button
                          onClick={() => {
                            setAlgorithm('gradient');
                            setAlgorithmDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs hover:bg-[var(--bg-primary)] ${
                            algorithm === 'gradient' ? 'bg-[var(--bg-primary)] text-[var(--accent-amber)]' : 'text-[var(--text-primary)] bg-[var(--bg-card)]'
                          }`}
                        >
                          梯度下降
                        </button>
                        <button
                          onClick={() => {
                            setAlgorithm('newton');
                            setAlgorithmDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs hover:bg-[var(--bg-primary)] ${
                            algorithm === 'newton' ? 'bg-[var(--bg-primary)] text-[var(--accent-amber)]' : 'text-[var(--text-primary)] bg-[var(--bg-card)]'
                          }`}
                        >
                          牛顿法
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 算法介绍区域 */}
                <div className="space-y-2">
                  <div className="p-3 rounded-lg border text-xs" style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--carbon-line)'
                  }}>
                    {algorithm === 'gradient' ? (
                      <div>
                        <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                          迭代公式
                        </h3>
                        <div className="mb-2">
                          <BlockMath math="x_{k+1} = x_k - \alpha \nabla f(x_k)" />
                        </div>
                        
                        <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                          关键信息解释
                        </h3>
                        <div className="text-xs space-y-1" style={{ color: 'var(--ink-mid)' }}>
                          <div>
                            <strong style={{ color: 'var(--ink-high)' }}>方向：</strong>
                            <InlineMath math="-\nabla f(x_k)" />，最陡下降方向，由一阶导数决定。
                          </div>
                          <div>
                            <strong style={{ color: 'var(--ink-high)' }}>步长 <InlineMath math="\alpha" />：</strong>
                            沿梯度方向下降的距离，控制走多远，太小收敛慢，太大可能震荡或发散。
                          </div>
                          <div>
                            <strong style={{ color: 'var(--ink-high)' }}>收敛范围：</strong>
                            当 <InlineMath math="\alpha \in (0, \frac{2}{L})" />（<InlineMath math="L" /> 为梯度 Lipschitz 常数）时保证收敛。
                          </div>
                          <div>
                            <strong style={{ color: 'var(--ink-high)' }}>总结：</strong>
                            沿着最陡下降方向走固定步长，简单稳健但收敛速度依赖步长选择。
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--ink-high)' }}>
                          迭代公式
                        </h3>
                        <div className="mb-2">
                          <BlockMath math="x_{k+1} = x_k - \eta \, H(x_k)^{-1} \nabla f(x_k)" />
                        </div>
                        
                        <div className="text-xs space-y-1" style={{ color: 'var(--ink-mid)' }}>
                          <div>
                            <strong style={{ color: 'var(--ink-high)' }}>方向：</strong>
                            <InlineMath math="- \eta \, H(x_k)^{-1} \nabla f(x_k)" />，相当于在二阶泰勒展开下的最优下降方向，更准确地对齐最优方向。
                          </div>
                          <div>
                            <strong style={{ color: 'var(--ink-high)' }}>阻尼系数 <InlineMath math="\eta" />：</strong>
                            调节在牛顿方向上的前进幅度；<InlineMath math="\eta=1" /> 是标准牛顿法，<InlineMath math="\eta<1" /> 是更为稳定性的阻尼牛顿法。
                          </div>
                          <div>
                            <strong style={{ color: 'var(--ink-high)' }}>Hessian <InlineMath math="H(x_k)" />：</strong>
                            函数的二阶导数矩阵，描述了曲面的弯曲程度；其逆调整了"各方向的合适步长"。
                          </div>
                          <div>
                            <strong style={{ color: 'var(--ink-high)' }}>总结：</strong>
                            在考虑二阶曲率的最优方向上下降，并通过阻尼控制步幅，兼顾快速收敛和稳定性。
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 步长控制 - 牛顿法不需要 */}
                {algorithm !== 'newton' && (
                  <div className="space-y-2">
                    <label className="text-xs" style={{ 
                      color: (() => {
                        // 根据约束条件类型确定阈值
                        const isEqualityConstraint = showConstraints && constraintType === 'equality';
                        const convergenceThreshold = isEqualityConstraint ? 24.9 : 23.25;
                        const stableUpperBound = isEqualityConstraint ? 23 : 20;
                        
                        if (stepSize > convergenceThreshold) {
                          return '#ef4444'; // 红色 - 不收敛
                        } else if (stepSize < 5 || stepSize > stableUpperBound) {
                          return '#f59e0b'; // 黄色 - 不稳定
                        } else {
                          return '#3b82f6'; // 蓝色 - 稳定收敛
                        }
                      })()
                    }}>
                      步长: {stepSize.toFixed(3)} {
                        (() => {
                          const isEqualityConstraint = showConstraints && constraintType === 'equality';
                          const convergenceThreshold = isEqualityConstraint ? 24.9 : 23.25;
                          const stableUpperBound = isEqualityConstraint ? 23 : 20;
                          
                          if (stepSize > convergenceThreshold) {
                            return '(不收敛)';
                          } else if (stepSize < 5 || stepSize > stableUpperBound) {
                            return '(不稳定)';
                          } else {
                            return '';
                          }
                        })()
                      }
                    </label>
                    <input
                      type="range"
                      min="0.001"
                      max="30"
                      step="0.001"
                      value={stepSize}
                      onChange={(e) => setStepSize(parseFloat(e.target.value))}
                      className="w-full"
                      style={{
                        accentColor: (() => {
                          const isEqualityConstraint = showConstraints && constraintType === 'equality';
                          const convergenceThreshold = isEqualityConstraint ? 24.9 : 23.25;
                          const stableUpperBound = isEqualityConstraint ? 23 : 20;
                          
                          if (stepSize > convergenceThreshold) {
                            return '#ef4444'; // 红色 - 不收敛
                          } else if (stepSize < 5 || stepSize > stableUpperBound) {
                            return '#f59e0b'; // 黄色 - 不稳定
                          } else {
                            return '#3b82f6'; // 蓝色 - 稳定收敛
                          }
                        })()
                      }}
                    />
                  </div>
                )}


                {/* 牛顿法专用参数 */}
                {algorithm === 'newton' && (
                  <div className="space-y-2">
                    <label className="text-xs" style={{ color: 'var(--ink-mid)' }}>
                      阻尼系数: {dampingFactor.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={dampingFactor}
                      onChange={(e) => setDampingFactor(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                )}

                {/* 显示选项 */}
                <div className="flex flex-wrap gap-3 text-xs">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showTrajectory}
                      onChange={(e) => setShowTrajectory(e.target.checked)}
                    />
                    <span style={{ color: 'var(--ink-mid)' }}>轨迹</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showVectors}
                      onChange={(e) => setShowVectors(e.target.checked)}
                    />
                    <span style={{ color: 'var(--ink-mid)' }}>向量</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showConstraints}
                      onChange={(e) => setShowConstraints(e.target.checked)}
                    />
                    <span style={{ color: 'var(--ink-mid)' }}>约束条件</span>
                  </label>
                </div>

                {/* 约束演示 */}
                <div className="space-y-2">
                  {showConstraints && (
                    <div className="relative constraint-dropdown">
                      <button
                        onClick={() => setConstraintDropdownOpen(!constraintDropdownOpen)}
                        className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] text-xs text-left flex justify-between items-center hover:bg-opacity-80"
                      >
                        <span>
                          {constraintType === 'inequality' ? '不等式约束：x²+y²≤25²' : '等式约束：x-2y²=0'}
                        </span>
                        <svg 
                          className={`w-4 h-4 transition-transform duration-200 ${constraintDropdownOpen ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {constraintDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg shadow-lg z-50 backdrop-blur-sm" 
                             style={{ backgroundColor: 'var(--bg-card)' }}>
                          <button
                            onClick={() => {
                              setConstraintType('inequality');
                              setConstraintDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-xs hover:bg-[var(--bg-primary)] ${
                              constraintType === 'inequality' ? 'bg-[var(--bg-primary)] text-[var(--accent-amber)]' : 'text-[var(--text-primary)] bg-[var(--bg-card)]'
                            }`}
                          >
                            不等式约束：x²+y²≤25²
                          </button>
                          <button
                            onClick={() => {
                              setConstraintType('equality');
                              setConstraintDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-xs hover:bg-[var(--bg-primary)] ${
                              constraintType === 'equality' ? 'bg-[var(--bg-primary)] text-[var(--accent-amber)]' : 'text-[var(--text-primary)] bg-[var(--bg-card)]'
                            }`}
                          >
                            等式约束：x-2y²=0
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 收敛阈值滑动条 */}
                <div className="space-y-2">
                  <label className="text-xs" style={{ color: 'var(--ink-mid)' }}>
                    收敛阈值: {convergenceThreshold.toExponential(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={thresholdToSlider(convergenceThreshold)}
                    onChange={(e) => {
                      const newThreshold = sliderToThreshold(parseFloat(e.target.value));
                      setConvergenceThreshold(newThreshold);
                    }}
                    className="w-full"
                  />
                </div>

                {/* 控制按钮 */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIsRunning(!isRunning)}
                    disabled={isOptimal}
                    className="py-2 px-3 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: isRunning ? 'var(--amber-signal)' : 'var(--tech-mint)',
                      color: 'var(--bg-deep)'
                    }}
                  >
                    {isRunning ? '暂停' : '运行'}
                  </button>
                  
                  <button
                    onClick={optimizationStep}
                    disabled={isRunning || isOptimal}
                    className="py-2 px-3 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50"
                    style={{
                      borderColor: 'var(--tech-mint)',
                      color: 'var(--tech-mint)',
                      backgroundColor: 'transparent'
                    }}
                  >
                    单步
                  </button>
                  
                  <button
                    onClick={handleRandomStart}
                    className="py-2 px-3 rounded-lg text-xs font-medium border transition-colors"
                    style={{
                      borderColor: 'var(--ink-mid)',
                      color: 'var(--ink-mid)',
                      backgroundColor: 'transparent'
                    }}
                  >
                    随机起点
                  </button>
                  
                  <button
                    onClick={handleReset}
                    className="py-2 px-3 rounded-lg text-xs font-medium border transition-colors"
                    style={{
                      borderColor: 'var(--ink-mid)',
                      color: 'var(--ink-mid)',
                      backgroundColor: 'transparent'
                    }}
                  >
                    重置
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部提示 */}
      <button
        onClick={() => {
          const target = document.getElementById('concept-2');
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}
        className="absolute bottom-8 left-1/2 flex flex-col items-center gap-2 
                   transition-colors duration-300 group"
        style={{
          transform: 'translateX(-50%)',
          color: 'var(--ink-mid)',
          zIndex: 100
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--tech-mint)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--ink-mid)';
        }}
        aria-label="向下滚动继续"
      >
        <span className="text-sm">向下滚动继续</span>
        <svg 
          className="w-6 h-6 animate-bounce"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>

      {/* 动效样式 */}
      <style jsx="true">{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-50%) translateX(8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(-50%) translateX(0) scale(1);
          }
        }
        
        @keyframes fade-out {
          from {
            opacity: 1;
            transform: translateY(-50%) translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(-50%) translateX(-8px) scale(0.95);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          animation-fill-mode: both;
        }
        
        .animate-fade-out {
          animation: fade-out 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          animation-fill-mode: both;
        }
        
        /* 优化按钮悬浮效果 */
        .concept-chip {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .concept-chip:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(34, 211, 238, 0.3);
        }
        
        .concept-chip.active {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(34, 211, 238, 0.4);
        }
        
        /* 九曲十八弯重力轨道动画样式 */
        @keyframes track-glow {
          0%, 100% { 
            filter: brightness(1) drop-shadow(0 0 2px currentColor); 
            opacity: 0.8; 
          }
          50% { 
            filter: brightness(1.3) drop-shadow(0 0 6px currentColor); 
            opacity: 1; 
          }
        }
        
        @keyframes wormhole-pulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.7; 
          }
          33% { 
            transform: scale(1.15); 
            opacity: 1; 
          }
          66% { 
            transform: scale(0.9); 
            opacity: 0.8; 
          }
        }
        
        @keyframes wormhole-rotation {
          0% { 
            transform: rotate(0deg) scale(1); 
          }
          25% { 
            transform: rotate(90deg) scale(1.1); 
          }
          50% { 
            transform: rotate(180deg) scale(1); 
          }
          75% { 
            transform: rotate(270deg) scale(1.1); 
          }
          100% { 
            transform: rotate(360deg) scale(1); 
          }
        }
        
        @keyframes wormhole-ring {
          0% { 
            transform: rotate(0deg) scale(1); 
            opacity: 0.8; 
          }
          50% { 
            transform: rotate(180deg) scale(1.2); 
            opacity: 0.4; 
          }
          100% { 
            transform: rotate(360deg) scale(1); 
            opacity: 0.8; 
          }
        }
        
        @keyframes wormhole-outer-ring {
          0%, 100% { 
            transform: scale(1) rotate(0deg); 
            opacity: 0.6; 
          }
          50% { 
            transform: scale(1.1) rotate(180deg); 
            opacity: 0.3; 
          }
        }
        
        @keyframes wormhole-core {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.9; 
          }
          25% { 
            transform: scale(1.3); 
            opacity: 1; 
          }
          50% { 
            transform: scale(0.8); 
            opacity: 0.7; 
          }
          75% { 
            transform: scale(1.1); 
            opacity: 0.95; 
          }
        }
        
        @keyframes wormhole-particles {
          0%, 100% { 
            opacity: 0.8; 
          }
          50% { 
            opacity: 0.3; 
          }
        }
        
        /* 黑洞特效动画 */
        @keyframes blackhole-event-horizon {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.6; 
          }
          50% { 
            transform: scale(1.05); 
            opacity: 0.8; 
          }
        }
        
        @keyframes blackhole-accretion {
          0% { 
            transform: rotate(0deg); 
            stroke-dashoffset: 0; 
          }
          100% { 
            transform: rotate(360deg); 
            stroke-dashoffset: -54; 
          }
        }
        
        @keyframes blackhole-disk {
          0% { 
            transform: rotate(0deg) scale(1); 
            opacity: 0.5; 
          }
          100% { 
            transform: rotate(360deg) scale(1); 
            opacity: 0.5; 
          }
        }
        
        @keyframes blackhole-disk-ring {
          0% { 
            transform: rotate(0deg) scaleY(1); 
          }
          25% { 
            transform: rotate(90deg) scaleY(0.3); 
          }
          50% { 
            transform: rotate(180deg) scaleY(1); 
          }
          75% { 
            transform: rotate(270deg) scaleY(0.3); 
          }
          100% { 
            transform: rotate(360deg) scaleY(1); 
          }
        }
        
        @keyframes blackhole-core {
          0%, 100% { 
            transform: scale(1); 
            opacity: 0.95; 
          }
          50% { 
            transform: scale(1.2); 
            opacity: 0.8; 
          }
        }
        
        @keyframes hawking-radiation {
          0%, 100% { 
            opacity: 0.8; 
          }
          50% { 
            opacity: 0.3; 
          }
        }
        
        @keyframes ball-teleport {
          0%, 100% { 
            filter: brightness(1) drop-shadow(0 0 4px currentColor); 
          }
          50% { 
            filter: brightness(2) drop-shadow(0 0 12px currentColor); 
          }
        }
        
        @keyframes ball-freefall {
          0% { 
            filter: brightness(1.5) drop-shadow(0 0 6px currentColor); 
          }
          100% { 
            filter: brightness(1) drop-shadow(0 0 4px currentColor); 
          }
        }
        
        @keyframes ball-journey {
          0% { 
            filter: brightness(1) drop-shadow(0 0 4px currentColor); 
          }
          50% { 
            filter: brightness(1.4) drop-shadow(0 0 8px currentColor); 
          }
          100% { 
            filter: brightness(1) drop-shadow(0 0 4px currentColor);
          }
        }
        
        /* 霓虹能量脉冲动画 */
        @keyframes energy-pulse {
          0%, 100% { 
            stroke-opacity: 0.4;
            filter: brightness(1) drop-shadow(0 0 8px currentColor);
          }
          50% { 
            stroke-opacity: 0.8;
            filter: brightness(1.5) drop-shadow(0 0 16px currentColor); 
          }
        }
        
        .animate-energy-halo {
          animation: energy-pulse 4s ease-in-out infinite;
        }
        
        @keyframes teleport-effect {
          0% { 
            opacity: 0; 
            stroke-width: 3; 
          }
          50% { 
            opacity: 1; 
            stroke-width: 6; 
            filter: drop-shadow(0 0 8px currentColor); 
          }
          100% { 
            opacity: 0; 
            stroke-width: 3; 
          }
        }
        
        @keyframes env-particles {
          0%, 100% { 
            transform: translateX(0px) translateY(0px) rotate(0deg); 
            opacity: 0.15; 
          }
          25% { 
            transform: translateX(3px) translateY(-2px) rotate(1deg); 
            opacity: 0.2; 
          }
          50% { 
            transform: translateX(-2px) translateY(3px) rotate(-1deg); 
            opacity: 0.18; 
          }
          75% { 
            transform: translateX(2px) translateY(-1px) rotate(0.5deg); 
            opacity: 0.22; 
          }
        }
        
        .animate-track-glow {
          animation: track-glow 8s ease-in-out infinite;
        }
        
        .animate-wormhole-pulse {
          animation: wormhole-pulse 4s ease-in-out infinite;
        }
        
        .animate-wormhole-rotation {
          animation: wormhole-rotation 6s linear infinite;
        }
        
        .animate-wormhole-ring {
          animation: wormhole-ring 3s linear infinite;
        }
        
        .animate-wormhole-outer-ring {
          animation: wormhole-outer-ring 8s ease-in-out infinite;
        }
        
        .animate-wormhole-core {
          animation: wormhole-core 1.5s ease-in-out infinite;
        }
        
        .animate-wormhole-particles {
          animation: wormhole-particles 1s ease-in-out infinite;
        }
        
        .animate-blackhole-event-horizon {
          animation: blackhole-event-horizon 3s ease-in-out infinite;
        }
        
        .animate-blackhole-accretion {
          animation: blackhole-accretion 4s linear infinite;
        }
        
        .animate-blackhole-disk {
          animation: blackhole-disk 8s linear infinite;
        }
        
        .animate-blackhole-disk-ring {
          animation: blackhole-disk-ring 6s linear infinite;
        }
        
        .animate-blackhole-core {
          animation: blackhole-core 2s ease-in-out infinite;
        }
        
        .animate-hawking-radiation {
          animation: hawking-radiation 1.5s ease-in-out infinite;
        }
        
        .animate-ball-teleport {
          animation: ball-teleport 0.5s ease-in-out infinite;
        }
        
        .animate-ball-freefall {
          animation: ball-freefall 1.3s ease-out infinite;
        }
        
        .animate-ball-journey {
          animation: ball-journey 2s ease-in-out infinite;
        }
        
        .animate-teleport-effect {
          animation: teleport-effect 0.5s ease-in-out;
        }
        
        .animate-env-particles {
          animation: env-particles 20s ease-in-out infinite;
        }
        
        .floating-math-symbol {
          font-family: 'Times New Roman', serif;
          user-select: none;
          pointer-events: none;
        }
        
        /* 无障碍支持 - 减少动画 */
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in,
          .animate-fade-out,
          .animate-track-glow,
          .animate-wormhole-pulse,
          .animate-wormhole-rotation,
          .animate-wormhole-ring,
          .animate-wormhole-outer-ring,
          .animate-wormhole-core,
          .animate-wormhole-particles,
          .animate-ball-journey,
          .animate-env-particles {
            animation: none !important;
          }
          
          circle[class*="animate"] {
            animation: none !important;
          }
          
          animateTransform {
            animation: none !important;
          }
          
          * {
            transition: none !important;
            filter: none !important;
          }
        }
      `}</style>
    </section>
  );
};


export const meta = {
  id: 2,
  title: '交互实验',
  summary: '3D算法演示/概念标签/约束可视化',
  anchor: 'concept-2',
};

export default Section2Descent3D;