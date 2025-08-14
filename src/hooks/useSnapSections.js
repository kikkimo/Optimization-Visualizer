import { useState, useEffect, useCallback } from 'react';

export default function useSnapSections() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  const scrollToSection = useCallback((sectionIndex) => {
    if (isScrolling) return;
    
    setIsScrolling(true);
    const container = document.getElementById('snap-container');
    const target = document.getElementById(`section-${sectionIndex}`);
    
    if (container && target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // 更新 URL hash
      window.location.hash = `section-${sectionIndex}`;
      
      setTimeout(() => {
        setIsScrolling(false);
        setCurrentSection(sectionIndex);
      }, 600);
    }
  }, [isScrolling]);

  useEffect(() => {
    const container = document.getElementById('snap-container');
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const sectionId = entry.target.id;
            const sectionNumber = parseInt(sectionId.replace('section-', ''));
            if (!isNaN(sectionNumber)) {
              setCurrentSection(sectionNumber);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.5,
        rootMargin: '0px'
      }
    );

    // 观察所有段落
    for (let i = 0; i < 5; i++) {
      const section = document.getElementById(`section-${i}`);
      if (section) {
        observer.observe(section);
      }
    }

    // 处理初始 hash
    const hash = window.location.hash;
    if (hash) {
      const sectionNumber = parseInt(hash.replace('#section-', ''));
      if (!isNaN(sectionNumber) && sectionNumber >= 0 && sectionNumber < 5) {
        setTimeout(() => scrollToSection(sectionNumber), 100);
      }
    }

    return () => observer.disconnect();
  }, [scrollToSection]);

  return {
    currentSection,
    scrollToSection,
    isScrolling
  };
}