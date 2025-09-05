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

// 颜色定义 - 适配系统主题
const RED = "#ef4444";
const BLUE = "#3b82f6";
const GRID = "rgba(59, 130, 246, 0.2)";
const AXIS = "rgba(96, 165, 250, 0.6)";

// 坐标系与点阵
const W = 600, H = 400;
const ORIGIN = { x: W/2, y: H/2 };
const UNIT = 50;

// 4×5 点阵
const Xs = [-1.5, -0.5, 0.5, 1.5];
const Ys = [-2, -1, 0, 1, 2];
const BASE_POINTS = Xs.flatMap(x => Ys.map(y => [x, y]));

function toScreen([x, y]) {
  return { cx: ORIGIN.x + x * UNIT, cy: ORIGIN.y - y * UNIT };
}

const Section2LinearWorldStep3 = () => {
  // 参数：旋转 / 等比缩放 / 平移
  const [theta, setTheta] = useState(0);  // -180~180, 中间为0
  const [scaleSlider, setScaleSlider] = useState(0);  // -100~100, 中间为0，对应缩放1.0
  const [tx, setTx] = useState(0);     // -3~3, 中间为0
  const [ty, setTy] = useState(0);     // -3~3, 中间为0

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

  // 变换后的点：Y = A·X + B
  const TRANS_POINTS = useMemo(() => {
    return BASE_POINTS.map(p => [
      A[0][0] * p[0] + A[0][1] * p[1] + B[0],
      A[1][0] * p[0] + A[1][1] * p[1] + B[1],
    ]);
  }, [A, B]);

  // 自检用例
  const [testResult, setTestResult] = useState({ ok: true, details: [] });
  useEffect(() => {
    const eps = 1e-9;
    const details = [];
    let ok = true;

    // 用例 1：通用一致性 — 对若干点，验证 [Y;1] = T · [X;1]
    const samplePts = [[0,0], [1,2], [-1.5, 0.5]];
    for (const X of samplePts) {
      const direct = [
        A[0][0] * X[0] + A[0][1] * X[1] + B[0],
        A[1][0] * X[0] + A[1][1] * X[1] + B[1],
        1,
      ];
      const Tv = matVec(T, [X[0], X[1], 1]);
      const pass = Math.abs(direct[0] - Tv[0]) < eps && Math.abs(direct[1] - Tv[1]) < eps && Math.abs(1 - Tv[2]) < eps;
      details.push({ case: `Consistency @ X=${JSON.stringify(X)}`, pass });
      ok = ok && pass;
    }

    setTestResult({ ok, details });
    console.table(details);
  }, [A, B, T]);

  return (
    <div className="h-full w-full flex flex-col gap-4 relative p-2">
      <style jsx global>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          background: linear-gradient(to right, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3));
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
      `}</style>

      <div className="flex-1 grid lg:grid-cols-2 gap-4">
        {/* 坐标系与点阵 */}
        <div className="rounded-2xl border backdrop-blur-sm p-5 shadow-xl"
             style={{
               background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(147, 51, 234, 0.08) 100%)',
               borderColor: 'rgba(59, 130, 246, 0.3)',
               boxShadow: '0 8px 32px -8px rgba(59, 130, 246, 0.2)'
             }}>
          <div className="flex items-center justify-between mb-4">
            <div className="font-bold text-lg" style={{ color: 'var(--ink-high)' }}>坐标系与点阵</div>
            <div className="text-xs font-medium" style={{ color: 'var(--ink-mid)' }}>
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1"></span>原始点
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 ml-2 mr-1"></span>仿射后
            </div>
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[280px] rounded-xl"
               style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
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

            {/* 原始点（红） */}
            {BASE_POINTS.map((p, idx) => {
              const { cx, cy } = toScreen(p);
              return <circle key={`r-${idx}`} cx={cx} cy={cy} r={2.5} fill={RED} opacity={0.7} />;
            })}

            {/* 变换点（蓝） */}
            {TRANS_POINTS.map((p, idx) => {
              const { cx, cy } = toScreen(p);
              return (
                <motion.circle key={`b-${idx}`} cx={cx} cy={cy} r={3} fill={BLUE} 
                                initial={false} animate={{ cx, cy }} 
                                transition={{ type: "spring", stiffness: 120, damping: 20 }} 
                                style={{ filter: 'drop-shadow(0 0 3px rgba(59, 130, 246, 0.5))' }} />
              );
            })}
          </svg>
          
          {/* 说明文字 */}
          <div className="mt-6 text-sm leading-relaxed" style={{ color: 'var(--ink-mid)' }}>
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 mb-4 border border-blue-500/20">
              <p className="mb-3 font-medium">
                仿射变换 <InlineMath math="f(\vec{X}) = A \cdot \vec{X} + \vec{B}" /> 不是线性的，但通过齐次坐标升维，可以将其表示为线性变换。把二维向量 <InlineMath math="\vec{X} = (x, y)^T" /> 扩充为齐次向量 <InlineMath math="\vec{X}_{aug} = (x, y, 1)^T" />，则仿射变换可写作:
              </p>
              
              <div className="mt-3 mb-4 text-center overflow-x-auto">
                <div className="text-sm">
                  <InlineMath math=" \begin{pmatrix} \vec{Y} \\ 1 \end{pmatrix} = \begin{pmatrix} A & \vec{B} \\ \vec{0}^T & 1 \end{pmatrix} \begin{pmatrix} \vec{X} \\ 1 \end{pmatrix} = \begin{pmatrix} A\vec{X} + \vec{B} \\ 1 \end{pmatrix}" />
                </div>
              </div>
              
              <p className="text-[13px] border-t border-blue-500/20 pt-3 mt-3">
                齐次坐标的优势在于：多个连续的仿射变换可以通过<strong className="text-blue-400">矩阵连乘</strong>统一处理，避免了繁琐的分步计算。这就是为什么在计算机图形学和机器人学中普遍采用齐次坐标系统。
              </p>
            </div>
          </div>
        </div>

        {/* 仿射变换控制 */}
        <div className="rounded-2xl border backdrop-blur-sm p-4 flex flex-col gap-4"
             style={{
               background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.06) 100%)',
               borderColor: 'rgba(59, 130, 246, 0.2)'
             }}>
          <div className="flex justify-between items-center">
            <div className="font-semibold" style={{ color: 'var(--ink-high)' }}>仿射变换控制</div>
            <button 
              onClick={()=>{ setTheta(0); setScaleSlider(0); setTx(0); setTy(0); }}
              className="px-2 py-1 text-xs rounded-lg border transition-colors shadow-md hover:shadow-blue-500/25"
              style={{
                background: 'rgba(59, 130, 246, 0.15)',
                borderColor: 'rgba(59, 130, 246, 0.4)',
                color: 'var(--ink-high)'
              }}
              onMouseEnter={(e)=>{
                e.target.style.background = 'rgba(59, 130, 246, 0.25)';
              }}
              onMouseLeave={(e)=>{
                e.target.style.background = 'rgba(59, 130, 246, 0.15)';
              }}
            >
              重置
            </button>
          </div>

          {/* 旋转 */}
          <div className="grid grid-cols-[1fr_80px] items-center gap-3">
            <label className="text-sm col-span-2" style={{ color: 'var(--ink-mid)' }}>旋转（°）</label>
            <input type="range" min={-180} max={180} value={theta} 
                   onChange={e=>setTheta(parseFloat(e.target.value))} 
                   className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                   style={{
                     background: 'linear-gradient(to right, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))'
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
                     background: 'linear-gradient(to right, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))'
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
                     background: 'linear-gradient(to right, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))'
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
                     background: 'linear-gradient(to right, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))'
                   }} />
            <span className="text-sm font-mono text-center" style={{ color: 'var(--ink-high)' }}>{ty.toFixed(1)}</span>
          </div>

          {/* 线性部分A和平移向量B - 左右布局 */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-3 border border-blue-500/30">
            <div className="text-sm mb-3 text-center" style={{ color: 'var(--ink-mid)' }}>
              <strong style={{ color: 'var(--ink-high)' }}>A = 缩放 · 旋转</strong> 与平移向量 <strong style={{ color: 'var(--ink-high)' }}>B</strong>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* 左侧：矩阵 A */}
              <div className="flex justify-center items-center">
                <div className="flex flex-col justify-between pr-1 text-base" style={{ color: 'var(--ink-mid)' }}>[</div>
                <div className="grid grid-cols-2 gap-px rounded-lg overflow-hidden shadow-lg"
                     style={{ background: 'rgba(59, 130, 246, 0.3)' }}>
                  <div className="px-3 py-2 font-mono text-xs tabular-nums text-center"
                       style={{ 
                         background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8))',
                         color: 'var(--ink-high)',
                         textShadow: '0 0 5px rgba(59, 130, 246, 0.5)',
                         minWidth: '2.5rem'
                       }}>{A[0][0].toFixed(2)}</div>
                  <div className="px-3 py-2 font-mono text-xs tabular-nums text-center"
                       style={{ 
                         background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8))',
                         color: 'var(--ink-high)',
                         textShadow: '0 0 5px rgba(59, 130, 246, 0.5)',
                         minWidth: '2.5rem'
                       }}>{A[0][1].toFixed(2)}</div>
                  <div className="px-3 py-2 font-mono text-xs tabular-nums text-center"
                       style={{ 
                         background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8))',
                         color: 'var(--ink-high)',
                         textShadow: '0 0 5px rgba(59, 130, 246, 0.5)',
                         minWidth: '2.5rem'
                       }}>{A[1][0].toFixed(2)}</div>
                  <div className="px-3 py-2 font-mono text-xs tabular-nums text-center"
                       style={{ 
                         background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8))',
                         color: 'var(--ink-high)',
                         textShadow: '0 0 5px rgba(59, 130, 246, 0.5)',
                         minWidth: '2.5rem'
                       }}>{A[1][1].toFixed(2)}</div>
                </div>
                <div className="flex flex-col justify-between pl-1 text-base" style={{ color: 'var(--ink-mid)' }}>]</div>
              </div>
              
              {/* 右侧：平移向量 B */}
              <div className="flex justify-center items-center">
                <div className="flex items-center space-x-1">
                  <span style={{ color: 'var(--ink-mid)' }}>(</span>
                  <span className="font-mono text-sm px-2 py-1 rounded bg-purple-500/20" style={{ color: 'var(--ink-high)' }}>
                    {B[0].toFixed(1)}
                  </span>
                  <span style={{ color: 'var(--ink-mid)' }}>,</span>
                  <span className="font-mono text-sm px-2 py-1 rounded bg-purple-500/20" style={{ color: 'var(--ink-high)' }}>
                    {B[1].toFixed(1)}
                  </span>
                  <span style={{ color: 'var(--ink-mid)' }}>)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3×3 齐次矩阵 T */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-3 border border-cyan-500/30">
            <div className="text-sm mb-3 text-center" style={{ color: 'var(--ink-mid)' }}>
              齐次矩阵 <strong style={{ color: 'var(--ink-high)' }}>T = [A B; 0ᵀ 1]</strong>
            </div>
            
            <div className="flex justify-center items-center">
              <div className="flex flex-col justify-between pr-2 text-lg" style={{ color: 'var(--ink-mid)' }}>[</div>
              <div className="grid grid-cols-3 gap-px rounded-lg overflow-hidden shadow-lg"
                   style={{ background: 'rgba(34, 211, 238, 0.3)' }}>
                {T.map((row, i) => row.map((v, j) => (
                  <div key={`${i}-${j}`} 
                       className="px-3 py-2 font-mono text-xs tabular-nums text-center"
                       style={{ 
                         background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8))',
                         color: 'var(--ink-high)',
                         textShadow: '0 0 3px rgba(34, 211, 238, 0.5)',
                         minWidth: '2.5rem'
                       }}>
                    {v.toFixed(2)}
                  </div>
                )))}
              </div>
              <div className="flex flex-col justify-between pl-2 text-lg" style={{ color: 'var(--ink-mid)' }}>]</div>
            </div>
          </div>


          {/* 状态指示灯 */}
          <div className="flex justify-center space-x-2 mt-3">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '200ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '400ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Section2LinearWorldStep3