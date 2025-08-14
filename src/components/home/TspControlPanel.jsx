import React from 'react';

export default function TspControlPanel({
  selectedCount,
  isPlanning,
  isAnimating,
  isPaused,
  planResult,
  animationSpeed,
  showAllRoads,
  onRandomSelect,
  onPlan,
  onPlayPause,
  onReset,
  onSpeedChange,
  onToggleRoads
}) {
  // 计算KPI
  const distanceKm = planResult ? (planResult.distance / 100).toFixed(2) : '0.00';
  const timeMinutes = planResult ? (planResult.distance / 100 / 18 * 60).toFixed(1) : '0.0'; // 18km/h速度
  const improvementPct = planResult ? planResult.improvementPct.toFixed(1) : '0.0';
  const turnCount = planResult ? planResult.turnCount : 0;
  const iterations = planResult ? planResult.iters : 0;

  return (
    <div className="h-full flex flex-col p-6">
      <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--ink-high)' }}>
        外卖配送路径优化
      </h3>

      {/* 控制按钮组 */}
      <div className="space-y-4 mb-6">
        <button
          onClick={onRandomSelect}
          disabled={isPlanning || isAnimating}
          className="w-full px-4 py-3 rounded-lg transition-all duration-200"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            color: 'var(--ink-high)',
            border: '1px solid var(--carbon-line)',
            opacity: (isPlanning || isAnimating) ? 0.5 : 1,
            cursor: (isPlanning || isAnimating) ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!isPlanning && !isAnimating) {
              e.currentTarget.style.borderColor = 'var(--tech-mint)';
              e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--carbon-line)';
            e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
          }}
        >
          随机选择配送点
        </button>

        <button
          onClick={onPlan}
          disabled={selectedCount < 1 || isPlanning || isAnimating}
          data-primary="true"
          className="w-full px-4 py-3 font-semibold rounded-lg transition-all duration-200"
          style={{
            backgroundColor: (selectedCount < 1 || isPlanning || isAnimating) 
              ? 'var(--bg-elevated)' 
              : 'var(--tech-mint)',
            color: (selectedCount < 1 || isPlanning || isAnimating)
              ? 'var(--ink-mid)'
              : 'var(--bg-deep)',
            opacity: (selectedCount < 1 || isPlanning || isAnimating) ? 0.5 : 1,
            cursor: (selectedCount < 1 || isPlanning || isAnimating) ? 'not-allowed' : 'pointer',
            boxShadow: (selectedCount >= 1 && !isPlanning && !isAnimating) 
              ? '0 4px 14px 0 rgba(60, 230, 192, 0.3)' 
              : 'none'
          }}
        >
          {isPlanning ? '规划中...' : '规划路线'}
        </button>

        {/* 播放/暂停按钮 */}
        {planResult && isAnimating && (
          <button
            onClick={onPlayPause}
            className="w-full px-4 py-3 rounded-lg transition-all duration-200"
            style={{
              backgroundColor: 'var(--amber-signal)',
              color: 'var(--bg-deep)'
            }}
          >
            {isPaused ? '继续播放' : '暂停动画'}
          </button>
        )}

        <button
          onClick={onReset}
          disabled={isPlanning}
          className="w-full px-4 py-3 rounded-lg transition-all duration-200"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            color: 'var(--danger-red)',
            border: '1px solid var(--carbon-line)',
            opacity: isPlanning ? 0.5 : 1,
            cursor: isPlanning ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!isPlanning) {
              e.currentTarget.style.borderColor = 'var(--danger-red)';
              e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--carbon-line)';
            e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
          }}
        >
          重置
        </button>
      </div>

      {/* 速度控制 */}
      <div className="mb-6">
        <label className="block text-sm mb-2" style={{ color: 'var(--ink-mid)' }}>
          动画速度
        </label>
        <div className="flex gap-2">
          {[
            { value: 120, label: '慢' },
            { value: 180, label: '中' },
            { value: 240, label: '快' }
          ].map(speed => (
            <button
              key={speed.value}
              onClick={() => onSpeedChange(speed.value)}
              className="flex-1 py-2 rounded-md transition-all duration-200"
              style={{
                backgroundColor: animationSpeed === speed.value 
                  ? 'var(--tech-mint)' 
                  : 'var(--bg-elevated)',
                color: animationSpeed === speed.value 
                  ? 'var(--bg-deep)' 
                  : 'var(--ink-mid)'
              }}
              onMouseEnter={(e) => {
                if (animationSpeed !== speed.value) {
                  e.currentTarget.style.color = 'var(--ink-high)';
                }
              }}
              onMouseLeave={(e) => {
                if (animationSpeed !== speed.value) {
                  e.currentTarget.style.color = 'var(--ink-mid)';
                }
              }}
            >
              {speed.label}
            </button>
          ))}
        </div>
      </div>

      {/* 显示选项 */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showAllRoads}
            onChange={(e) => onToggleRoads(e.target.checked)}
            className="w-4 h-4 rounded"
            style={{
              accentColor: 'var(--tech-mint)'
            }}
          />
          <span className="text-sm" style={{ color: 'var(--ink-mid)' }}>
            显示所有道路
          </span>
        </label>
      </div>

      {/* KPI 统计 */}
      <div className="flex-1 flex flex-col justify-end">
        <div className="space-y-3 p-4 rounded-lg" style={{
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--carbon-line)'
        }}>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: 'var(--ink-mid)' }}>选中配送点</span>
            <span className="font-mono" style={{ color: 'var(--ink-high)' }}>
              {selectedCount} 个
            </span>
          </div>

          {planResult && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'var(--ink-mid)' }}>总距离</span>
                <span className="font-mono" style={{ color: 'var(--amber-signal)' }}
                      aria-label={`总距离 ${distanceKm} 公里`}>
                  {distanceKm} km
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'var(--ink-mid)' }}>预计时间</span>
                <span className="font-mono" style={{ color: 'var(--amber-signal)' }}
                      aria-label={`预计时间 ${timeMinutes} 分钟`}>
                  {timeMinutes} min
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'var(--ink-mid)' }}>优化提升</span>
                <span className="font-mono" style={{ color: 'var(--success-green)' }}
                      aria-label={`提升 ${improvementPct}%`}>
                  +{improvementPct}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'var(--ink-mid)' }}>拐点数</span>
                <span className="font-mono" style={{ color: 'var(--ink-high)' }}
                      aria-label={`拐点数 ${turnCount} 个`}>
                  {turnCount} 个
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'var(--ink-mid)' }}>迭代次数</span>
                <span className="font-mono" style={{ color: 'var(--ink-high)' }}
                      aria-label={`迭代 ${iterations} 次`}>
                  {iterations} 次
                </span>
              </div>
            </>
          )}
        </div>

        {/* 图例说明 */}
        <div className="mt-4 p-3 rounded-lg text-xs" style={{
          backgroundColor: 'var(--bg-elevated)',
          color: 'var(--ink-mid)',
          border: '1px solid var(--carbon-line)'
        }}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: 'var(--amber-signal)' }}></span>
              <span>起点</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: 'var(--tech-mint)' }}></span>
              <span>配送点</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-0.5" 
                    style={{ backgroundColor: 'var(--amber-signal)' }}></span>
              <span>配送路径</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}