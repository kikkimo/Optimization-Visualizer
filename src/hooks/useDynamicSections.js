import { useState, useEffect, useCallback } from 'react'

export function useDynamicSections() {
  const [currentSection, setCurrentSection] = useState(0)

  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(`dynamic-${sectionId}`)
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      })
    }
  }, [])

  // 为每个dynamic-${i}元素创建对应的section-${i}锚点，供DownHint使用
  useEffect(() => {
    const cleanupElements = []
    
    for (let i = 0; i < 6; i++) {
      const dynamicElement = document.getElementById(`dynamic-${i}`)
      if (dynamicElement && !document.getElementById(`section-${i}`)) {
        // 创建隐藏的锚点元素
        const anchor = document.createElement('span')
        anchor.id = `section-${i}`
        anchor.style.position = 'absolute'
        anchor.style.top = '0'
        anchor.style.left = '0'
        anchor.style.visibility = 'hidden'
        anchor.style.pointerEvents = 'none'
        
        // 将锚点插入到dynamic元素内部的开头
        dynamicElement.insertBefore(anchor, dynamicElement.firstChild)
        cleanupElements.push(anchor)
      }
    }

    return () => {
      cleanupElements.forEach(element => {
        if (element.parentNode) {
          element.parentNode.removeChild(element)
        }
      })
    }
  }, [])

  useEffect(() => {
    let scrollTimeout = null

    const handleScroll = () => {
      // 清除之前的定时器
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }

      // 设置新的定时器，在滚动停止后执行
      scrollTimeout = setTimeout(() => {
        const sections = []
        for (let i = 0; i < 6; i++) {
          const element = document.getElementById(`dynamic-${i}`)
          if (element) {
            sections.push({
              id: i,
              element,
              rect: element.getBoundingClientRect()
            })
          }
        }

        if (sections.length === 0) return

        // 找到当前最接近视口顶部的section（考虑视口中心为参考点）
        const viewportCenter = window.innerHeight / 2
        let closestSection = sections[0]
        let minDistance = Math.abs(sections[0].rect.top + sections[0].rect.height / 2 - viewportCenter)

        sections.forEach(section => {
          const sectionCenter = section.rect.top + section.rect.height / 2
          const distance = Math.abs(sectionCenter - viewportCenter)
          if (distance < minDistance) {
            minDistance = distance
            closestSection = section
          }
        })

        if (closestSection && closestSection.id !== currentSection) {
          setCurrentSection(closestSection.id)
        }
      }, 100)
    }

    // 监听滚动事件
    const container = document.getElementById('snap-container')
    if (container) {
      container.addEventListener('scroll', handleScroll)
    }
    window.addEventListener('scroll', handleScroll)

    // 初始化检查
    handleScroll()

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll)
      }
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
    }
  }, [currentSection])

  return {
    currentSection,
    scrollToSection
  }
}