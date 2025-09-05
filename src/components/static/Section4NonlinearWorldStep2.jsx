import React, { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { InlineMath, BlockMath } from 'react-katex'

// 数学工具
function deg2rad(d) { return (d * Math.PI) / 180; }
function matMul(A, B) {
  // 通用矩阵乘法（m×k * k×n = m×n）
  const m = A.length, k = A[0].length, n = B[0].length;
  const out = Array.from({ length: m }, () => Array(n).fill(0));
  for (let i = 0; i < m; i++) {
    for (let t = 0; t < k; t++) {
      const a = A[i][t];
      for (let j = 0; j < n; j++) out[i][j] += a * B[t][j];
    }
  }
  return out;
}
function matVec(A, v) { // (m×n) * (n)
  const m = A.length, n = A[0].length;
  const out = Array(m).fill(0);
  for (let i = 0; i < m; i++) {
    let s = 0;
    for (let j = 0; j < n; j++) s += A[i][j] * v[j];
    out[i] = s;
  }
  return out;
}

// 颜色定义 - 符合非线性世界的配色
const SQUARE_COLORS = {
  top: "#ef4444",     // 红色 - 上边
  right: "#22c55e",   // 绿色 - 右边  
  bottom: "#3b82f6",  // 蓝色 - 下边
  left: "#fbbf24"     // 黄色 - 左边
};
const GRID = "rgba(236, 72, 153, 0.2)";
const AXIS = "rgba(168, 85, 247, 0.6)";

// 坐标系
const W = 600, H = 400;
const ORIGIN = { x: W/2, y: H/2 };
const UNIT = 50;

// 正方形的四个顶点：(-2,2), (-2,-2), (2,-2), (2,2)
const SQUARE_VERTICES = [
  [-2, 2],   // 左上
  [-2, -2],  // 左下
  [2, -2],   // 右下
  [2, 2]     // 右上
];

function toScreen([x, y]) {
  return { cx: ORIGIN.x + x * UNIT, cy: ORIGIN.y - y * UNIT };
}

const Section4NonlinearWorldStep2 = () => {
  // 参数：旋转 / 等比缩放 / 平移 / 激活函数
  const [theta, setTheta] = useState(0);  // -180~180, 中间为0
  const [scaleSlider, setScaleSlider] = useState(0);  // -100~100, 中间为0，对应缩放1.0
  const [tx, setTx] = useState(0);     // -3~3, 中间为0
  const [ty, setTy] = useState(0);     // -3~3, 中间为0
  const [activationFunc, setActivationFunc] = useState('none'); // 激活函数选择

  // 缩放转换：滑块值转换为实际缩放倍数
  const scale = useMemo(() => {
    if (scaleSlider >= 0) {
      // 右侧：0~100 对应 1~4 倍放大
      return 1 + (scaleSlider / 100) * 3;  // 1 到 4
    } else {
      // 左侧：-100~0 对应 1/4~1 倍缩小
      return 1 + (scaleSlider / 100) * 0.75;  // 0.25 到 1
    }
  }, [scaleSlider]);

  // 2×2 A（旋转+缩放），B（平移），3×3 T（齐次）
  const A = useMemo(() => {
    const r = deg2rad(theta);
    return [
      [scale * Math.cos(r), -scale * Math.sin(r)],
      [scale * Math.sin(r),  scale * Math.cos(r)],
    ];
  }, [theta, scale]);

  const B = useMemo(() => [tx, ty], [tx, ty]);

  const T = useMemo(() => [
    [A[0][0], A[0][1], B[0]],
    [A[1][0], A[1][1], B[1]],
    [0, 0, 1],
  ], [A, B]);

  // 激活函数定义
  const activationFunctions = {
    sigmoid: (x) => 1 / (1 + Math.exp(-x)),
    tanh: (x) => Math.tanh(x),
    relu: (x) => Math.max(0, x),
    none: (x) => x
  };

  // 获取当前选择的激活函数
  const currentActivation = activationFunctions[activationFunc];

  // 激活函数信息
  const activationInfo = {
    sigmoid: { name: 'σ', fullName: 'Sigmoid', range: '[0,1]', desc: '压缩到正象限' },
    tanh: { name: 'tanh', fullName: 'Tanh', range: '[-1,1]', desc: '压缩到原点周围' },
    relu: { name: 'ReLU', fullName: 'ReLU', range: '[0,+∞)', desc: '负值归零，正值保持' },
    none: { name: 'f', fullName: '无激活', range: '(-∞,+∞)', desc: '保持线性变换' }
  };

  // 非线性变换矩阵 R = activation(T)
  const R = useMemo(() => {
    return T.map(row => row.map(val => currentActivation(val)));
  }, [T, currentActivation]);

  // 非线性变换后的正方形顶点：Y = activation(A·X + B)
  const TRANS_VERTICES = useMemo(() => {
    return SQUARE_VERTICES.map(vertex => {
      // 先进行线性仿射变换
      const linear_x = A[0][0] * vertex[0] + A[0][1] * vertex[1] + B[0];
      const linear_y = A[1][0] * vertex[0] + A[1][1] * vertex[1] + B[1];
      
      // 再应用选定的激活函数
      return [currentActivation(linear_x), currentActivation(linear_y)];
    });
  }, [A, B, currentActivation]);

  return (
    <div className="h-full w-full flex flex-col gap-4 relative p-2">
      <style jsx global>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          background: linear-gradient(to right, rgba(236, 72, 153, 0.3), rgba(168, 85, 247, 0.3));
          border-radius: 2px;
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: var(--ink-high);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        select option {
          background: rgba(236, 72, 153, 0.8) !important;
          color: var(--ink-high) !important;
          padding: 8px 12px !important;
        }
        select option:hover {
          background: rgba(236, 72, 153, 0.9) !important;
        }
        select option:checked {
          background: rgba(168, 85, 247, 0.8) !important;
        }
      `}</style>

      <div className="flex-1 grid lg:grid-cols-2 gap-4">
        {/* 坐标系与正方形变换 */}
        <div className="rounded-2xl border backdrop-blur-sm p-5 shadow-xl"
             style={{
               background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)',
               borderColor: 'rgba(236, 72, 153, 0.3)',
               boxShadow: '0 8px 32px -8px rgba(236, 72, 153, 0.2)'
             }}>
          <div className="flex items-center justify-between mb-4">
            <div className="font-bold text-lg" style={{ color: 'var(--ink-high)' }}>非线性变换演示</div>
            <div className="text-xs font-medium" style={{ color: 'var(--ink-mid)' }}>
              <span className="inline-block w-2 h-1 border border-red-500 mr-1"></span>原始正方形
              <span className="inline-block w-2 h-1 bg-red-500 ml-2 mr-1 shadow-md"></span>{activationInfo[activationFunc].fullName}变换后
            </div>
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[280px] rounded-xl"
               style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
            {/* 网格 */}
            <g stroke={GRID} strokeWidth={1}>
              {Array.from({ length: 13 }).map((_, i) => (
                <line key={`vx-${i}`} x1={i*(W/12)} y1={0} x2={i*(W/12)} y2={H} />
              ))}
              {Array.from({ length: 9 }).map((_, i) => (
                <line key={`hx-${i}`} x1={0} y1={i*(H/8)} x2={W} y2={i*(H/8)} />
              ))}
            </g>

            {/* 轴 */}
            <g stroke={AXIS} strokeWidth={2}>
              <line x1={0} y1={ORIGIN.y} x2={W} y2={ORIGIN.y} />
              <line x1={ORIGIN.x} y1={0} x2={ORIGIN.x} y2={H} />
            </g>

            {/* 原始正方形（虚线，四种颜色） */}
            <g strokeDasharray="5,3" strokeWidth={2} fill="none">
              {/* 上边：红色 */}
              <line 
                x1={toScreen(SQUARE_VERTICES[0]).cx} y1={toScreen(SQUARE_VERTICES[0]).cy}
                x2={toScreen(SQUARE_VERTICES[3]).cx} y2={toScreen(SQUARE_VERTICES[3]).cy}
                stroke={SQUARE_COLORS.top} opacity={0.7}
              />
              {/* 右边：绿色 */}
              <line 
                x1={toScreen(SQUARE_VERTICES[3]).cx} y1={toScreen(SQUARE_VERTICES[3]).cy}
                x2={toScreen(SQUARE_VERTICES[2]).cx} y2={toScreen(SQUARE_VERTICES[2]).cy}
                stroke={SQUARE_COLORS.right} opacity={0.7}
              />
              {/* 下边：蓝色 */}
              <line 
                x1={toScreen(SQUARE_VERTICES[2]).cx} y1={toScreen(SQUARE_VERTICES[2]).cy}
                x2={toScreen(SQUARE_VERTICES[1]).cx} y2={toScreen(SQUARE_VERTICES[1]).cy}
                stroke={SQUARE_COLORS.bottom} opacity={0.7}
              />
              {/* 左边：黄色 */}
              <line 
                x1={toScreen(SQUARE_VERTICES[1]).cx} y1={toScreen(SQUARE_VERTICES[1]).cy}
                x2={toScreen(SQUARE_VERTICES[0]).cx} y2={toScreen(SQUARE_VERTICES[0]).cy}
                stroke={SQUARE_COLORS.left} opacity={0.7}
              />
            </g>

            {/* 变换后正方形（实线，发光呼吸效果） */}
            <g strokeWidth={3} fill="none">
              {/* 上边：红色发光 */}
              <motion.line 
                x1={toScreen(TRANS_VERTICES[0]).cx} y1={toScreen(TRANS_VERTICES[0]).cy}
                x2={toScreen(TRANS_VERTICES[3]).cx} y2={toScreen(TRANS_VERTICES[3]).cy}
                stroke={SQUARE_COLORS.top}
                initial={false}
                animate={{ 
                  x1: toScreen(TRANS_VERTICES[0]).cx, y1: toScreen(TRANS_VERTICES[0]).cy,
                  x2: toScreen(TRANS_VERTICES[3]).cx, y2: toScreen(TRANS_VERTICES[3]).cy
                }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                style={{ 
                  filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.8))',
                  animation: 'pulse 2s ease-in-out infinite'
                }}
              />
              {/* 右边：绿色发光 */}
              <motion.line 
                x1={toScreen(TRANS_VERTICES[3]).cx} y1={toScreen(TRANS_VERTICES[3]).cy}
                x2={toScreen(TRANS_VERTICES[2]).cx} y2={toScreen(TRANS_VERTICES[2]).cy}
                stroke={SQUARE_COLORS.right}
                initial={false}
                animate={{ 
                  x1: toScreen(TRANS_VERTICES[3]).cx, y1: toScreen(TRANS_VERTICES[3]).cy,
                  x2: toScreen(TRANS_VERTICES[2]).cx, y2: toScreen(TRANS_VERTICES[2]).cy
                }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                style={{ 
                  filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.8))',
                  animation: 'pulse 2s ease-in-out infinite',
                  animationDelay: '0.5s'
                }}
              />
              {/* 下边：蓝色发光 */}
              <motion.line 
                x1={toScreen(TRANS_VERTICES[2]).cx} y1={toScreen(TRANS_VERTICES[2]).cy}
                x2={toScreen(TRANS_VERTICES[1]).cx} y2={toScreen(TRANS_VERTICES[1]).cy}
                stroke={SQUARE_COLORS.bottom}
                initial={false}
                animate={{ 
                  x1: toScreen(TRANS_VERTICES[2]).cx, y1: toScreen(TRANS_VERTICES[2]).cy,
                  x2: toScreen(TRANS_VERTICES[1]).cx, y2: toScreen(TRANS_VERTICES[1]).cy
                }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                style={{ 
                  filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))',
                  animation: 'pulse 2s ease-in-out infinite',
                  animationDelay: '1s'
                }}
              />
              {/* 左边：黄色发光 */}
              <motion.line 
                x1={toScreen(TRANS_VERTICES[1]).cx} y1={toScreen(TRANS_VERTICES[1]).cy}
                x2={toScreen(TRANS_VERTICES[0]).cx} y2={toScreen(TRANS_VERTICES[0]).cy}
                stroke={SQUARE_COLORS.left}
                initial={false}
                animate={{ 
                  x1: toScreen(TRANS_VERTICES[1]).cx, y1: toScreen(TRANS_VERTICES[1]).cy,
                  x2: toScreen(TRANS_VERTICES[0]).cx, y2: toScreen(TRANS_VERTICES[0]).cy
                }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                style={{ 
                  filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))',
                  animation: 'pulse 2s ease-in-out infinite',
                  animationDelay: '1.5s'
                }}
              />
            </g>
          </svg>
          
          {/* 说明文字 */}
          <div className="mt-6 text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg p-4 mb-4 border border-pink-500/20">
              <p className="mb-3 font-medium">
                非线性变换 <InlineMath math="f(\vec{X}) = \sigma(A \cdot \vec{X} + \vec{B})" /> 通过激活函数引入非线性。首先进行标准仿射变换，然后对结果的每个分量应用激活函数函数：
              </p>
              
              <div className="mt-3 mb-4 text-center overflow-x-auto">
                <div className="text-sm">
                  <InlineMath math="\vec{Y} = \sigma(A\vec{X} + \vec{B})" />
                </div>
              </div>
              
              <p className="text-[13px] border-t border-pink-500/20 pt-3 mt-3">
                激活函数的<strong className="text-purple-400">非线性</strong>特性，使得正方形在极端拉伸时会被"压缩"到正象限的有限范围内，产生独特的扭曲效果。
              </p>
            </div>
          </div>
        </div>

        {/* 参数控制 */}
        <div className="rounded-2xl border backdrop-blur-sm p-4 flex flex-col gap-4"
             style={{
               background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(168, 85, 247, 0.06) 100%)',
               borderColor: 'rgba(236, 72, 153, 0.2)'
             }}>
          <div className="flex justify-between items-center">
            <div className="font-semibold" style={{ color: 'var(--ink-high)' }}>参数控制</div>
            <button 
              onClick={()=>{ setTheta(0); setScaleSlider(0); setTx(0); setTy(0); setActivationFunc('none'); }}
              className="px-2 py-1 text-xs rounded-lg border transition-colors shadow-md hover:shadow-pink-500/25"
              style={{
                background: 'rgba(236, 72, 153, 0.15)',
                borderColor: 'rgba(236, 72, 153, 0.4)',
                color: 'var(--ink-high)'
              }}
              onMouseEnter={(e)=>{
                e.target.style.background = 'rgba(236, 72, 153, 0.25)';
              }}
              onMouseLeave={(e)=>{
                e.target.style.background = 'rgba(236, 72, 153, 0.15)';
              }}
            >
              重置
            </button>
          </div>

          {/* 激活函数选择 */}
          <div className="grid grid-cols-1 gap-3">
            <label className="text-sm" style={{ color: 'var(--ink-mid)' }}>激活函数选择</label>
            <div className="relative">
              <select 
                value={activationFunc} 
                onChange={(e) => setActivationFunc(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border text-sm font-medium transition-all appearance-none cursor-pointer pr-10"
                style={{
                  background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.12))',
                  borderColor: 'rgba(236, 72, 153, 0.4)',
                  color: 'var(--ink-high)',
                  boxShadow: '0 2px 8px rgba(236, 72, 153, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = '0 4px 16px rgba(236, 72, 153, 0.5)';
                  e.target.style.borderColor = 'rgba(236, 72, 153, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = '0 2px 8px rgba(236, 72, 153, 0.3)';
                  e.target.style.borderColor = 'rgba(236, 72, 153, 0.4)';
                }}
              >
                <option value="sigmoid" style={{ background: 'rgba(236, 72, 153, 0.8)', color: 'var(--ink-high)' }}>使用Sigmoid激活函数 (0~1)</option>
                <option value="tanh" style={{ background: 'rgba(236, 72, 153, 0.8)', color: 'var(--ink-high)' }}>使用Tanh激活函数 (-1~1)</option>
                <option value="relu" style={{ background: 'rgba(236, 72, 153, 0.8)', color: 'var(--ink-high)' }}>使用ReLU激活函数 (0~+∞)</option>
                <option value="none" style={{ background: 'rgba(236, 72, 153, 0.8)', color: 'var(--ink-high)' }}>不使用激活函数 (线性)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4" style={{ color: 'rgba(236, 72, 153, 0.8)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* 激活函数信息展示 */}
            <div className="text-xs p-2 rounded-lg border" 
                 style={{ 
                   backgroundColor: 'rgba(236, 72, 153, 0.05)', 
                   borderColor: 'rgba(236, 72, 153, 0.2)',
                   color: 'var(--ink-mid)' 
                 }}>
              <strong style={{ color: 'var(--ink-high)' }}>{activationInfo[activationFunc].fullName}</strong>: 
              输出范围 {activationInfo[activationFunc].range}，{activationInfo[activationFunc].desc}
            </div>
          </div>

          {/* 旋转 */}
          <div className="grid grid-cols-[1fr_80px] items-center gap-3">
            <label className="text-sm col-span-2" style={{ color: 'var(--ink-mid)' }}>旋转（°）</label>
            <input type="range" min={-180} max={180} value={theta} 
                   onChange={e=>setTheta(parseFloat(e.target.value))} 
                   className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                   style={{
                     background: 'linear-gradient(to right, rgba(236, 72, 153, 0.3), rgba(168, 85, 247, 0.3))'
                   }} />
            <span className="text-sm font-mono text-center" style={{ color: 'var(--ink-high)' }}>{theta.toFixed(0)}°</span>
          </div>

          {/* 缩放 */}
          <div className="grid grid-cols-[1fr_80px] items-center gap-3">
            <label className="text-sm col-span-2" style={{ color: 'var(--ink-mid)' }}>缩放</label>
            <input type="range" min={-100} max={100} step={1} value={scaleSlider} 
                   onChange={e=>setScaleSlider(parseFloat(e.target.value))} 
                   className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                   style={{
                     background: 'linear-gradient(to right, rgba(236, 72, 153, 0.3), rgba(168, 85, 247, 0.3))'
                   }} />
            <span className="text-sm font-mono text-center" style={{ color: 'var(--ink-high)' }}>×{scale.toFixed(2)}</span>
          </div>

          {/* 平移 X */}
          <div className="grid grid-cols-[1fr_80px] items-center gap-3">
            <label className="text-sm col-span-2" style={{ color: 'var(--ink-mid)' }}>平移 X 方向</label>
            <input type="range" min={-3} max={3} step={0.1} value={tx} 
                   onChange={e=>setTx(parseFloat(e.target.value))} 
                   className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                   style={{
                     background: 'linear-gradient(to right, rgba(236, 72, 153, 0.3), rgba(168, 85, 247, 0.3))'
                   }} />
            <span className="text-sm font-mono text-center" style={{ color: 'var(--ink-high)' }}>{tx.toFixed(1)}</span>
          </div>

          {/* 平移 Y */}
          <div className="grid grid-cols-[1fr_80px] items-center gap-3">
            <label className="text-sm col-span-2" style={{ color: 'var(--ink-mid)' }}>平移 Y 方向</label>
            <input type="range" min={-3} max={3} step={0.1} value={ty} 
                   onChange={e=>setTy(parseFloat(e.target.value))} 
                   className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                   style={{
                     background: 'linear-gradient(to right, rgba(236, 72, 153, 0.3), rgba(168, 85, 247, 0.3))'
                   }} />
            <span className="text-sm font-mono text-center" style={{ color: 'var(--ink-high)' }}>{ty.toFixed(1)}</span>
          </div>

          {/* 非线性变换矩阵 R = tanh(T) */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-3 border border-pink-500/30">
            <div className="text-sm mb-3 text-center" style={{ color: 'var(--ink-mid)' }}>
              非线性变换矩阵 <strong style={{ color: 'var(--ink-high)' }}>R = σ(T)</strong>
            </div>
            
            <div className="flex justify-center items-center">
              <div className="flex flex-col justify-between pr-2 text-lg" style={{ color: 'var(--ink-mid)' }}>[</div>
              <div className="grid grid-cols-3 gap-px rounded-lg overflow-hidden shadow-lg"
                   style={{ background: 'rgba(236, 72, 153, 0.3)' }}>
                {R.map((row, i) => row.map((v, j) => (
                  <div key={`${i}-${j}`} 
                       className="px-3 py-2 font-mono text-xs tabular-nums text-center"
                       style={{ 
                         background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8))',
                         color: 'var(--ink-high)',
                         textShadow: '0 0 3px rgba(236, 72, 153, 0.5)',
                         minWidth: '2.5rem'
                       }}>
                    {v.toFixed(3)}
                  </div>
                )))}
              </div>
              <div className="flex flex-col justify-between pl-2 text-lg" style={{ color: 'var(--ink-mid)' }}>]</div>
            </div>
          </div>

          {/* 状态指示灯 */}
          <div className="flex justify-center space-x-2 mt-3">
            <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '200ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" style={{ animationDelay: '400ms' }}></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            filter: drop-shadow(0 0 8px currentColor) drop-shadow(0 0 16px currentColor);
          }
          50% {
            opacity: 0.7;
            filter: drop-shadow(0 0 4px currentColor) drop-shadow(0 0 8px currentColor);
          }
        }
      `}</style>
    </div>
  )
}

export default Section4NonlinearWorldStep2