import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// 导入各个页面组件
import Section1DynamicProblems from './Section1DynamicProblems'
import Section2CoreIdeas from './Section2CoreIdeas'
import Section3MarkovChainHMM from './Section3MarkovChainHMM'
import Section4MarkovRandomField from './Section4MarkovRandomField'
import Section5KalmanFilter from './Section5KalmanFilter'
import Section6MarkovDecisionProcess from './Section6MarkovDecisionProcess'
import RailDots from '../shared/RailDots'
import useDynamicRailDots from '../../hooks/useDynamicRailDots'
import { useDynamicSections } from '../../hooks/useDynamicSections'
import '../../styles/tokens.css'

const DynamicPage = () => {
  const railDotsProps = useDynamicRailDots()
  const { currentSection, scrollToSection } = useDynamicSections()
  const location = useLocation()

  // 页面配置数据
  const sections = [
    {
      id: 0,
      title: '动态与随机问题',
      summary: '动态系统基础概念',
      anchor: 'dynamic-0',
      component: Section1DynamicProblems
    },
    {
      id: 1,
      title: '核心思想',
      summary: '动态优化核心理念',
      anchor: 'dynamic-1',
      component: Section2CoreIdeas
    },
    {
      id: 2,
      title: '马尔科夫链&HMM',
      summary: '马尔科夫过程与隐马尔科夫模型',
      anchor: 'dynamic-2',
      component: Section3MarkovChainHMM
    },
    {
      id: 3,
      title: '马尔科夫随机场',
      summary: '概率图模型理论',
      anchor: 'dynamic-3',
      component: Section4MarkovRandomField
    },
    {
      id: 4,
      title: '卡尔曼滤波',
      summary: '状态估计与滤波算法',
      anchor: 'dynamic-4',
      component: Section5KalmanFilter
    },
    {
      id: 5,
      title: '马尔科夫决策过程',
      summary: '动态决策与强化学习',
      anchor: 'dynamic-5',
      component: Section6MarkovDecisionProcess
    }
  ]

  // 处理从其他页面导航到动态页的情况
  useEffect(() => {
    const hash = location.hash
    if (hash && hash.includes('dynamic-')) {
      const sectionNumber = parseInt(hash.replace('#dynamic-', ''))
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
            `#dynamic-${currentSection} button[data-primary="true"]`
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

export default DynamicPage