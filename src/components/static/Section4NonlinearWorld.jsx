import React from 'react';
import DownHint from '../shared/DownHint';

const Section4NonlinearWorld = ({ id, currentSection, totalSections }) => {
  return (
    <section
      id={id}
      className="snap-section relative flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: 'var(--bg-deep)' }}
    >
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--ink-high)' }}>
            非线性世界
          </h1>
          <p className="text-lg" style={{ color: 'var(--ink-mid)' }}>
            非线性系统特性 - 待开发
          </p>
        </div>
      </div>
      
      {currentSection < totalSections - 1 && (
        <DownHint targetSection={4} text="向下滚动继续" isStatic={true} />
      )}
    </section>
  );
};

export default Section4NonlinearWorld;