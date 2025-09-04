import { useMemo } from 'react'
import { useStaticSections } from './useStaticSections'

export default function useStaticRailDots() {
  const { currentSection, scrollToSection } = useStaticSections()

  const sections = useMemo(() => [
    { id: 0, title: '万物皆可函数' },
    { id: 1, title: '线性世界' },
    { id: 2, title: '线性系统求解' },
    { id: 3, title: '非线性世界' },
    { id: 4, title: '非线性系统求解' }
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