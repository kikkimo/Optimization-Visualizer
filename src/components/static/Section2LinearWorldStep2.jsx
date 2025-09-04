import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { InlineMath } from 'react-katex'

// 数学工具
function deg2rad(d) { return (d * Math.PI) / 180; }
function matMul(A, B) {
  return [
    [A[0][0]*B[0][0] + A[0][1]*B[1][0], A[0][0]*B[0][1] + A[0][1]*B[1][1]],
    [A[1][0]*B[0][0] + A[1][1]*B[1][0], A[1][0]*B[0][1] + A[1][1]*B[1][1]],
  ];
}
function matVec(A, v) {
  return [A[0][0]*v[0] + A[0][1]*v[1], A[1][0]*v[0] + A[1][1]*v[1]];
}
function percentToScale(p) { return Math.pow(2, p / 100); }

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

const Section2LinearWorldStep2 = () => {
  const [theta, setTheta] = useState(0);
  const [scaleP, setScaleP] = useState(0);
  const [shearKx, setShearKx] = useState(0);
  const [shearKy, setShearKy] = useState(0);

  // 组装线性变换：A = R(θ) · S(s) · Sh(kx, ky)
  const A = useMemo(() => {
    const s = percentToScale(scaleP);
    const r = deg2rad(theta);
    const R = [[Math.cos(r), -Math.sin(r)], [Math.sin(r), Math.cos(r)]];
    const S = [[s, 0], [0, s]];
    const Sh = [[1, shearKx], [shearKy, 1]];
    return matMul(R, matMul(S, Sh));
  }, [theta, scaleP, shearKx, shearKy]);

  const TRANS_POINTS = useMemo(() => BASE_POINTS.map(p => matVec(A, p)), [A]);
  const sFactor = percentToScale(scaleP);

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
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 ml-2 mr-1"></span>变换后
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
                一个从 n 维向量 <InlineMath math="\vec{X}" /> 到 m 维向量 <InlineMath math="\vec{Y}" /> 的映射 f 是线性的，当且仅当存在一个 m×n 的矩阵 <InlineMath math="A" />，使得 <InlineMath math="\vec{Y} = A \cdot \vec{X}" />。在二维情形，<InlineMath math="A" /> 为 2×2 矩阵。矩阵的每一列，都对应 <InlineMath math="A" /> 对一个基向量的作用，因此完全刻画了该线性变换。
              </p>
              <p className="text-[13px] border-t border-blue-500/20 pt-3 mt-3">
                从几何视角看，矩阵给出的线性变换是"规整"的空间操作：<strong className="text-blue-400">旋转（Rotation）</strong>、<strong className="text-purple-400">缩放（Scaling）</strong>、<strong className="text-cyan-400">剪切（Shearing）</strong>……它们都保持原点不动。
              </p>
            </div>
          </div>
        </div>

        {/* 线性变换控制 */}
        <div className="rounded-2xl border backdrop-blur-sm p-4 flex flex-col gap-4"
             style={{
               background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.06) 100%)',
               borderColor: 'rgba(59, 130, 246, 0.2)'
             }}>
          <div className="flex justify-between items-center">
            <div className="font-semibold" style={{ color: 'var(--ink-high)' }}>线性变换控制</div>
            <button 
              onClick={()=>{ setTheta(0); setScaleP(0); setShearKx(0); setShearKy(0); }}
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
            <label className="text-sm col-span-2" style={{ color: 'var(--ink-mid)' }}>缩放（对数映射）</label>
            <input type="range" min={-100} max={100} value={scaleP} 
                   onChange={e=>setScaleP(parseFloat(e.target.value))} 
                   className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                   style={{
                     background: 'linear-gradient(to right, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))'
                   }} />
            <span className="text-sm font-mono text-center" style={{ color: 'var(--ink-high)' }}>×{sFactor.toFixed(2)}</span>
          </div>

          {/* 剪切 X */}
          <div className="grid grid-cols-[1fr_80px] items-center gap-3">
            <label className="text-sm col-span-2" style={{ color: 'var(--ink-mid)' }}>剪切 X 方向</label>
            <input type="range" min={-1.5} max={1.5} step={0.01} value={shearKx} 
                   onChange={e=>setShearKx(parseFloat(e.target.value))} 
                   className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                   style={{
                     background: 'linear-gradient(to right, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))'
                   }} />
            <span className="text-sm font-mono text-center" style={{ color: 'var(--ink-high)' }}>{shearKx.toFixed(2)}</span>
          </div>

          {/* 剪切 Y */}
          <div className="grid grid-cols-[1fr_80px] items-center gap-3">
            <label className="text-sm col-span-2" style={{ color: 'var(--ink-mid)' }}>剪切 Y 方向</label>
            <input type="range" min={-1.5} max={1.5} step={0.01} value={shearKy} 
                   onChange={e=>setShearKy(parseFloat(e.target.value))} 
                   className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                   style={{
                     background: 'linear-gradient(to right, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))'
                   }} />
            <span className="text-sm font-mono text-center" style={{ color: 'var(--ink-high)' }}>{shearKy.toFixed(2)}</span>
          </div>

          {/* 矩阵显示 */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-3 border border-blue-500/30">
            <div className="text-sm mb-3 text-center" style={{ color: 'var(--ink-mid)' }}>
              当前矩阵 <strong style={{ color: 'var(--ink-high)' }}>A = R·S·Sₕ</strong>
            </div>
            
            <div className="flex justify-center items-center">
              <div className="flex flex-col justify-between pr-2 text-lg" style={{ color: 'var(--ink-mid)' }}>[</div>
              <div className="grid grid-cols-2 gap-px rounded-lg overflow-hidden shadow-lg"
                   style={{ background: 'rgba(59, 130, 246, 0.3)' }}>
                <div className="px-4 py-3 font-mono text-sm tabular-nums text-center"
                     style={{ 
                       background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8))',
                       color: 'var(--ink-high)',
                       textShadow: '0 0 5px rgba(59, 130, 246, 0.5)',
                       minWidth: '3rem'
                     }}>{A[0][0].toFixed(2)}</div>
                <div className="px-4 py-3 font-mono text-sm tabular-nums text-center"
                     style={{ 
                       background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8))',
                       color: 'var(--ink-high)',
                       textShadow: '0 0 5px rgba(59, 130, 246, 0.5)',
                       minWidth: '3rem'
                     }}>{A[0][1].toFixed(2)}</div>
                <div className="px-4 py-3 font-mono text-sm tabular-nums text-center"
                     style={{ 
                       background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8))',
                       color: 'var(--ink-high)',
                       textShadow: '0 0 5px rgba(59, 130, 246, 0.5)',
                       minWidth: '3rem'
                     }}>{A[1][0].toFixed(2)}</div>
                <div className="px-4 py-3 font-mono text-sm tabular-nums text-center"
                     style={{ 
                       background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8))',
                       color: 'var(--ink-high)',
                       textShadow: '0 0 5px rgba(59, 130, 246, 0.5)',
                       minWidth: '3rem'
                     }}>{A[1][1].toFixed(2)}</div>
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

          {/* 线性与仿射对比表格 */}
          <div className="mt-4 text-xs" style={{ color: 'var(--ink-mid)' }}>
            <div className="font-semibold mb-3 text-center" style={{ color: 'var(--ink-high)' }}>线性与仿射对比</div>
            <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-lg border border-purple-500/20 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                    <th className="text-left py-2 px-2 text-[11px] font-bold" style={{ color: 'var(--ink-high)' }}>关系类型</th>
                    <th className="text-left py-2 px-2 text-[11px] font-bold" style={{ color: 'var(--ink-high)' }}>标量形式</th>
                    <th className="text-left py-2 px-2 text-[11px] font-bold" style={{ color: 'var(--ink-high)' }}>向量形式</th>
                    <th className="text-left py-2 px-2 text-[11px] font-bold" style={{ color: 'var(--ink-high)' }}>几何意义</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-purple-500/10 hover:bg-blue-500/5 transition-colors">
                    <td className="py-2 px-2 font-bold" style={{ color: 'var(--ink-high)' }}>线性 (Linear)</td>
                    <td className="py-2 px-2 font-mono text-[10px]" style={{ color: '#60a5fa' }}><InlineMath math="y = mx" /></td>
                    <td className="py-2 px-2 font-mono text-[10px]" style={{ color: '#60a5fa' }}><InlineMath math="\vec{Y} = A \cdot \vec{X}" /></td>
                    <td className="py-2 px-2 text-[10px] leading-tight">保持原点不动的空间变换</td>
                  </tr>
                  <tr className="hover:bg-purple-500/5 transition-colors">
                    <td className="py-2 px-2 font-bold" style={{ color: 'var(--ink-high)' }}>仿射 (Affine)</td>
                    <td className="py-2 px-2 font-mono text-[10px]" style={{ color: '#a78bfa' }}><InlineMath math="y = mx + b" /></td>
                    <td className="py-2 px-2 font-mono text-[10px]" style={{ color: '#a78bfa' }}><InlineMath math="\vec{Y} = A \cdot \vec{X} + \vec{B}" /></td>
                    <td className="py-2 px-2 text-[10px] leading-tight">线性变换 + 平移</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Section2LinearWorldStep2