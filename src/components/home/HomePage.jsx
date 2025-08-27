import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Section1Hero from './Section1Hero';
import Section2MindBarrage from './Section2MindBarrage';
import Section4Bridge from './Section4Bridge';
import Section3Olympiad from './Section3Olympiad';
import Section5TSP from './Section5TSP';
import Section6Registration from './Section6Registration';
import Section7Summary from './Section7Summary';
import RailDots from './RailDots';
import useHomeSections from '../../hooks/useHomeSections';
import '../../styles/tokens.css';

export default function HomePage() {
  const { currentSection, scrollToSection } = useHomeSections();
  const location = useLocation();

  // 处理从其他页面导航到首页的情况
  useEffect(() => {
    // 如果URL中有hash，延迟处理确保组件完全加载
    const hash = location.hash;
    if (hash && hash.includes('section-')) {
      const sectionNumber = parseInt(hash.replace('#section-', ''));
      if (!isNaN(sectionNumber) && sectionNumber >= 0 && sectionNumber < 7) {
        setTimeout(() => {
          scrollToSection(sectionNumber);
        }, 200); // 给更多时间确保DOM准备好
      }
    }
  }, [location.hash, scrollToSection]);

  useEffect(() => {
    // 键盘导航
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'PageDown':
        case 'ArrowDown':
          e.preventDefault();
          if (currentSection < 6) {
            scrollToSection(currentSection + 1);
          }
          break;
        case 'PageUp':
        case 'ArrowUp':
          e.preventDefault();
          if (currentSection > 0) {
            scrollToSection(currentSection - 1);
          }
          break;
        case 'Enter':
          // 激活当前段落的主按钮
          const activeButton = document.querySelector(
            `#section-${currentSection} button[data-primary="true"]`
          );
          if (activeButton) {
            activeButton.click();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSection, scrollToSection]);

  return (
    <div className="relative" style={{ backgroundColor: 'var(--bg-deep)', color: 'var(--ink-high)' }}>
      <div 
        className="snap-container"
        id="snap-container"
      >
        <RailDots 
          currentSection={currentSection} 
          onDotClick={scrollToSection}
        />
        
        <Section1Hero id="section-0" />
        <Section2MindBarrage id="section-1" />
        <Section3Olympiad id="section-2" />
        <Section4Bridge id="section-3" scrollToSection={scrollToSection} />
        <Section5TSP id="section-4" />
        <Section6Registration id="section-5" />
        <Section7Summary id="section-6" />
      </div>
      
      <style jsx="true" global="true">{`
        /* 隐藏系统滚动条但保留滚动功能 */
        .snap-container {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        
        .snap-container::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
    </div>
  );
}