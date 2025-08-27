import React, { useState } from 'react';

const ConceptRailDots = ({ sections, currentSection, onDotClick }) => {
  const [hoveredDot, setHoveredDot] = useState(null);

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4"
         style={{ transform: 'translateY(-50%)', zIndex: 50 }}>
      {sections.map((section, index) => (
        <div key={section.id} className="relative group">
          <button
            onClick={() => onDotClick(section)}
            onMouseEnter={() => setHoveredDot(section.id)}
            onMouseLeave={() => setHoveredDot(null)}
            className="w-3 h-3 rounded-full border-2 transition-all duration-300"
            style={{
              backgroundColor: currentSection === section.id ? 'var(--tech-mint)' : 'transparent',
              borderColor: currentSection === section.id ? 'var(--tech-mint)' : 'var(--ink-mid)',
              transform: currentSection === section.id ? 'scale(1.25)' : 'scale(1)'
            }}
            aria-label={`跳转到${section.title}`}
          />
          
          {/* Tooltip */}
          {hoveredDot === section.id && (
            <div className="absolute right-full mr-4 top-1/2 px-3 py-1.5 rounded-md
                          text-sm whitespace-nowrap animate-fade-in pointer-events-none"
                 style={{
                   backgroundColor: 'var(--bg-elevated)',
                   color: 'var(--ink-high)',
                   transform: 'translateY(-50%)'
                 }}>
              {section.title}
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
      
      {/* CSS animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-50%) translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        /* 响应式调整 */
        @media (max-width: 1024px) {
          .fixed.right-8 {
            right: 1rem;
          }
        }
        
        @media (max-width: 768px) {
          .fixed.right-8 {
            right: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ConceptRailDots;