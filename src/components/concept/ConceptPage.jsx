import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// 导入各个页面组件
import Section1Definition from './Section1Definition'
import Section2Descent3D from './Section2Descent3D'
import Section3Mindmap from './Section3Mindmap'
import Section4Surveying from './Section4Surveying'
import Section5QP from './Section5QP'
import RailDots from '../shared/RailDots'
import useConceptRailDots from '../../hooks/useConceptRailDots'
import useConceptSections from '../../hooks/useConceptSections'
import '../../styles/tokens.css'


const ConceptPage = () => {
  const railDotsProps = useConceptRailDots()
  const { currentSection, scrollToSection } = useConceptSections()
  const location = useLocation()

  // 页面配置数据
  const sections = [
    {
      id: 0,
      title: '基本概念',
      summary: '定义/术语/无人机任务对照',
      anchor: 'concept-0',
      component: Section1Definition
    },
    {
      id: 1,
      title: '直观过程',
      summary: '3D寻找最小值/迭代动画/算法对比',
      anchor: 'concept-1', 
      component: Section2Descent3D
    },
    {
      id: 2,
      title: '分类导图',
      summary: '八种分类方式/思维导图/优化算法',
      anchor: 'concept-2',
      component: Section3Mindmap
    },
    {
      id: 3,
      title: '测绘优化建模',
      summary: '测绘领域六大优化问题范式',
      anchor: 'concept-3',
      component: Section4Surveying
    },
    {
      id: 4,
      title: 'QP 二次规划', 
      summary: '二次目标/线性约束/最小二乘',
      anchor: 'concept-4',
      component: Section5QP
    }
  ]

  // 处理从其他页面导航到概念页的情况
  useEffect(() => {
    const hash = location.hash
    if (hash && hash.includes('concept-')) {
      const sectionNumber = parseInt(hash.replace('#concept-', ''))
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
            `#concept-${currentSection} button[data-primary="true"]`
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
            />
          )
        })}
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
  )
}

export default ConceptPage