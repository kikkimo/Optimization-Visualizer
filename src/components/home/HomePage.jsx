import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Section1Hero from './Section1Hero';
import Section2MindBarrage from './Section2MindBarrage';
import Section2Bridge from './Section2Bridge';
import Section3TSP from './Section3TSP';
import Section4Registration from './Section4Registration';
import Section5Summary from './Section5Summary';
import RailDots from './RailDots';
import useSnapSections from '../../hooks/useSnapSections';
import '../../styles/tokens.css';

export default function HomePage() {
  const { currentSection, scrollToSection } = useSnapSections();
  const location = useLocation();

  // 处理从其他页面导航到首页的情况
  useEffect(() => {
    // 如果URL中有hash，延迟处理确保组件完全加载
    const hash = location.hash;
    if (hash && hash.includes('section-')) {
      const sectionNumber = parseInt(hash.replace('#section-', ''));
      if (!isNaN(sectionNumber) && sectionNumber >= 0 && sectionNumber < 6) {
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
          if (currentSection < 5) {
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
        <Section2Bridge id="section-2" />
        <Section3TSP id="section-3" />
        <Section4Registration id="section-4" />
        <Section5Summary id="section-5" />
      </div>
    </div>
  );
}