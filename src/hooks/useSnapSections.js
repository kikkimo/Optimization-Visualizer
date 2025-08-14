import { useState, useEffect, useCallback, useRef } from 'react';

export default function useSnapSections() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const lastSectionRef = useRef(0);

  const scrollToSection = useCallback((sectionIndex) => {
    if (isScrolling || sectionIndex === currentSection) return;
    
    // 清除之前的定时器
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    setIsScrolling(true);
    const target = document.getElementById(`section-${sectionIndex}`);
    
    if (target) {
      // 使用更快的滚动
      target.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
      
      // 立即更新section状态
      setCurrentSection(sectionIndex);
      lastSectionRef.current = sectionIndex;
      
      // 更新 URL hash
      window.history.replaceState(null, null, `#section-${sectionIndex}`);
      
      // 减少防抖时间
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 300);
    }
  }, [isScrolling, currentSection]);

  useEffect(() => {
    const container = document.getElementById('snap-container');
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrolling) return; // 避免滚动过程中更新状态
        
        // 找到最大可见比例的section
        let maxRatio = 0;
        let targetSection = null;
        
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            const sectionId = entry.target.id;
            const sectionNumber = parseInt(sectionId.replace('section-', ''));
            if (!isNaN(sectionNumber)) {
              targetSection = sectionNumber;
            }
          }
        });
        
        // 只有当可见比例超过40%且不同于当前section时才更新
        if (targetSection !== null && maxRatio > 0.4 && targetSection !== lastSectionRef.current) {
          setCurrentSection(targetSection);
          lastSectionRef.current = targetSection;
        }
      },
      {
        root: container,
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: '-10px 0px -10px 0px' // 减少边缘敏感度
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

    return () => {
      observer.disconnect();
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [scrollToSection, isScrolling]);

  return {
    currentSection,
    scrollToSection,
    isScrolling
  };
}