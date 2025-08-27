import useConceptSections from './useConceptSections';

export default function useConceptRailDots() {
  const { currentSection, scrollToSection } = useConceptSections();
  
  // 概念页面的 sections 数据 - 与 ConceptPage.jsx 中的定义保持一致
  const sections = [
    {
      id: 0,
      title: '基本概念',
      summary: '定义/术语/无人机任务对照',
      anchor: 'concept-0'
    },
    {
      id: 1,
      title: '直观过程',
      summary: '3D寻找最小值/迭代动画/算法对比',
      anchor: 'concept-1'
    },
    {
      id: 2,
      title: '分类导图',
      summary: '八种分类方式/思维导图/优化算法',
      anchor: 'concept-2'
    },
    {
      id: 3,
      title: '测绘优化建模',
      summary: '测绘领域六大优化问题范式',
      anchor: 'concept-3'
    },
    {
      id: 4,
      title: '通用优化流程', 
      summary: '建模/策略/初始化/迭代/验证',
      anchor: 'concept-4'
    }
  ];
  
  // 点击处理函数 - 适配概念页的 scrollToSection(id) 调用方式
  const handleDotClick = (section) => {
    scrollToSection(section.id);
  };
  
  return {
    sections,
    currentSection,
    onDotClick: handleDotClick
  };
}