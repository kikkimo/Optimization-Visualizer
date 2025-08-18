import { useState, useEffect, useCallback } from 'react';

export default function useSnapSections() {
  const [currentSection, setCurrentSection] = useState(0);

  const scrollToSection = useCallback((sectionIndex) => {
    const target = document.getElementById(`section-${sectionIndex}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  useEffect(() => {
    const container = document.getElementById('snap-container');
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const sectionId = entry.target.id;
            const sectionNumber = parseInt(sectionId.replace('section-', ''));
            if (!isNaN(sectionNumber) && sectionNumber !== currentSection) {
              setCurrentSection(sectionNumber);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.5
      }
    );

    // 观察所有段落
    for (let i = 0; i < 7; i++) {
      const section = document.getElementById(`section-${i}`);
      if (section) {
        observer.observe(section);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, [currentSection]);

  return {
    currentSection,
    scrollToSection
  };
}