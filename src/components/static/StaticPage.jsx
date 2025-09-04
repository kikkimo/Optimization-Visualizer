import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// 导入各个页面组件
import Section1Functions from './Section1Functions'
import Section2LinearWorld from './Section2LinearWorld'
import Section3LinearSolve from './Section3LinearSolve'
import Section4NonlinearWorld from './Section4NonlinearWorld'
import Section5NonlinearSolve from './Section5NonlinearSolve'
import RailDots from '../shared/RailDots'
import useStaticRailDots from '../../hooks/useStaticRailDots'
import { useStaticSections } from '../../hooks/useStaticSections'
import '../../styles/tokens.css'

const StaticPage = () => {
  const railDotsProps = useStaticRailDots()
  const { currentSection, scrollToSection } = useStaticSections()
  const location = useLocation()

  // 页面配置数据
  const sections = [
    {
      id: 0,
      title: '万物皆可函数',
      summary: '函数表示与转换',
      anchor: 'static-0',
      component: Section1Functions
    },
    {
      id: 1,
      title: '线性世界',
      summary: '线性系统基础',
      anchor: 'static-1',
      component: Section2LinearWorld
    },
    {
      id: 2,
      title: '线性系统求解',
      summary: '线性方程组解法',
      anchor: 'static-2',
      component: Section3LinearSolve
    },
    {
      id: 3,
      title: '非线性世界',
      summary: '非线性系统特性',
      anchor: 'static-3',
      component: Section4NonlinearWorld
    },
    {
      id: 4,
      title: '非线性系统求解',
      summary: '非线性优化方法',
      anchor: 'static-4',
      component: Section5NonlinearSolve
    }
  ]

  // 处理从其他页面导航到静态页的情况
  useEffect(() => {
    const hash = location.hash
    if (hash && hash.includes('static-')) {
      const sectionNumber = parseInt(hash.replace('#static-', ''))
      if (!isNaN(sectionNumber) && sectionNumber >= 0 && sectionNumber < sections.length) {
        setTimeout(() => {
          scrollToSection(sectionNumber)
        }, 200)
      }
    }
  }, [location.hash, scrollToSection])

  useEffect(() => {
    // 键盘导航
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'PageDown':
        case 'ArrowDown':
          e.preventDefault()
          if (currentSection < sections.length - 1) {
            scrollToSection(currentSection + 1)
          }
          break
        case 'PageUp':
        case 'ArrowUp':
          e.preventDefault()
          if (currentSection > 0) {
            scrollToSection(currentSection - 1)
          }
          break
        case 'Enter':
          const activeButton = document.querySelector(
            `#static-${currentSection} button[data-primary="true"]`
          )
          if (activeButton) {
            activeButton.click()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSection, scrollToSection])

  const handleDotClick = (section) => {
    scrollToSection(section.id)
  }

  return (
    <div className="relative" style={{ backgroundColor: 'var(--bg-deep)', color: 'var(--ink-high)' }}>
      <div 
        className="snap-container"
        id="snap-container"
      >
        <RailDots {...railDotsProps} />
        
        {sections.map((section) => {
          const Component = section.component
          return (
            <Component 
              key={section.id}
              id={section.anchor}
              currentSection={section.id}
              totalSections={sections.length}
            />
          )
        })}
      </div>
      
      <style jsx="true" global="true">{`
        /* 滚动容器样式 */
        .snap-container {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
          height: 100vh;
          overflow-y: auto;
          scroll-behavior: smooth;
        }
        
        .snap-container::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        
        /* 确保每个section占据全屏高度 */
        .snap-section {
          min-height: 100vh;
          width: 100%;
        }
      `}</style>
    </div>
  )
}

export default StaticPage