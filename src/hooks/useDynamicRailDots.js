import { useMemo } from 'react'
import { useDynamicSections } from './useDynamicSections'

export default function useDynamicRailDots() {
  const { currentSection, scrollToSection } = useDynamicSections()

  const sections = useMemo(() => [
    { id: 0, title: '动态与随机问题' },
    { id: 1, title: '核心思想' },
    { id: 2, title: '马尔科夫链&HMM' },
    { id: 3, title: '马尔科夫随机场' },
    { id: 4, title: '卡尔曼滤波' },
    { id: 5, title: '马尔科夫决策过程' }
  ], [])

  const handleDotClick = (section) => {
    scrollToSection(section.id)
  }

  return {
    sections,
    currentSection,
    onDotClick: handleDotClick
  }
}