import React, { useState } from 'react';

const sectionTitles = [
  '首屏 Hero',
  '优化无处不在',
  'TSP 配送路径',
  '图像配准对比',
  '总结与引导'
];

export default function RailDots({ currentSection, onDotClick }) {
  const [hoveredDot, setHoveredDot] = useState(null);

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4"
         style={{ transform: 'translateY(-50%)', zIndex: 50 }}>
      {sectionTitles.map((title, index) => (
        <div key={index} className="relative group">
          <button
            onClick={() => onDotClick(index)}
            onMouseEnter={() => setHoveredDot(index)}
            onMouseLeave={() => setHoveredDot(null)}
            className="w-3 h-3 rounded-full border-2 transition-all duration-300"
            style={{
              backgroundColor: currentSection === index ? 'var(--tech-mint)' : 'transparent',
              borderColor: currentSection === index ? 'var(--tech-mint)' : 'var(--ink-mid)',
              transform: currentSection === index ? 'scale(1.25)' : 'scale(1)'
            }}
            aria-label={`跳转到${title}`}
          />
          
          {/* Tooltip */}
          {hoveredDot === index && (
            <div className="absolute right-full mr-4 top-1/2 px-3 py-1.5 rounded-md
                          text-sm whitespace-nowrap animate-fade-in pointer-events-none"
                 style={{
                   backgroundColor: 'var(--bg-elevated)',
                   color: 'var(--ink-high)',
                   transform: 'translateY(-50%)'
                 }}>
              {title}
              <div className="absolute left-full top-1/2 border-t-4 border-b-4 border-l-4"
                   style={{
                     borderTopColor: 'transparent',
                     borderBottomColor: 'transparent',
                     borderLeftColor: 'var(--bg-elevated)',
                     transform: 'translateY(-50%)'
                   }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}