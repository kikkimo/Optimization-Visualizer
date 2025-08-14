import { useState, useEffect, useCallback, useRef } from 'react';

export default function useSnapSections() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const lastSectionRef = useRef(0);

  const scrollToSection = useCallback((sectionIndex) => {
    // 只检查是否是同一个section，移除isScrolling检查以避免阻塞
    if (sectionIndex === currentSection) return;
    
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
      }, 500); // 稍微增加时间确保滚动完成
    }
  }, [currentSection]); // 移除isScrolling依赖

  useEffect(() => {
    const container = document.getElementById('snap-container');
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
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
        
        // 降低阈值使其更敏感，当可见比例超过30%就更新
        if (targetSection !== null && maxRatio > 0.3 && targetSection !== lastSectionRef.current) {
          setCurrentSection(targetSection);
          lastSectionRef.current = targetSection;
          
          // 总是更新URL hash
          window.history.replaceState(null, null, `#section-${targetSection}`);
        }
      },
      {
        root: container,
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: '0px 0px 0px 0px' // 移除边距限制，提高敏感度
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
    if (hash && hash.includes('section-')) {
      const sectionNumber = parseInt(hash.replace('#section-', ''));
      if (!isNaN(sectionNumber) && sectionNumber >= 0 && sectionNumber < 5) {
        // 立即设置section状态
        setCurrentSection(sectionNumber);
        lastSectionRef.current = sectionNumber;
        // 延迟滚动确保DOM已准备好
        setTimeout(() => scrollToSection(sectionNumber), 100);
      }
    } else {
      // 如果没有hash，确保从第一个section开始
      setCurrentSection(0);
      lastSectionRef.current = 0;
    }

    // 监听 hash 变化
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash && hash.includes('section-')) {
        const sectionNumber = parseInt(hash.replace('#section-', ''));
        if (!isNaN(sectionNumber) && sectionNumber >= 0 && sectionNumber < 5) {
          scrollToSection(sectionNumber);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      observer.disconnect();
      window.removeEventListener('hashchange', handleHashChange);
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