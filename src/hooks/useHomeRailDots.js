import { useMemo } from 'react';
import useHomeSections from './useHomeSections';

const sectionTitles = [
  '首屏 Hero',
  '内心弹幕',
  '小时候的优化题',
  '优化无处不在',
  'TSP 配送路径',
  '图像配准对比',
  '总结与引导'
];

export default function useHomeRailDots() {
  const { currentSection, scrollToSection } = useHomeSections();
  
  // 将首页的 sectionTitles 转换为标准化的 sections 格式
  const sections = useMemo(() => {
    return sectionTitles.map((title, index) => ({
      id: index,
      title: title
    }));
  }, []);
  
  // 点击处理函数 - 适配首页的 scrollToSection(index) 调用方式
  const handleDotClick = (section, index) => {
    scrollToSection(index);
  };
  
  return {
    sections,
    currentSection,
    onDotClick: handleDotClick
  };
}