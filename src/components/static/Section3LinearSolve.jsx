import React from 'react';
import DownHint from '../shared/DownHint';

const Section3LinearSolve = ({ id, currentSection, totalSections }) => {
  return (
    <section
      id={id}
      className="snap-section relative flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: 'var(--bg-deep)' }}
    >
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--ink-high)' }}>
            线性系统求解
          </h1>
          <p className="text-lg" style={{ color: 'var(--ink-mid)' }}>
            线性方程组解法 - 待开发
          </p>
        </div>
      </div>
      
      {currentSection < totalSections - 1 && (
        <DownHint targetSection={3} text="向下滚动继续" isStatic={true} />
      )}
    </section>
  );
};

export default Section3LinearSolve;