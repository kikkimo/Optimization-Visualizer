import React from 'react';

export default function DownHint({ targetSection, text = '向下滚动继续' }) {
  const handleClick = () => {
    const target = document.getElementById(`section-${targetSection}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <button
      onClick={handleClick}
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
      aria-label={text}
    >
      <span className="text-sm">{text}</span>
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
  );
}