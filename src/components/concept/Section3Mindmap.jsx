import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import DownHint from '../home/DownHint';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const Section3Mindmap = ({ id }) => {
  const svgRef = useRef();
  const markdownRef = useRef();
  const [selectedNode, setSelectedNode] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [highlightedSection, setHighlightedSection] = useState('root');

  // 自定义滚动条状态管理
  const [scrollbarVisible, setScrollbarVisible] = useState(false);
  const hideScrollbarTimeout = useRef(null);


  // 添加自定义滚动条样式和数学公式样式
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'custom-scrollbar-style';
    style.textContent = `
      /* 确保KaTeX数学公式正常显示 */
      .katex {
        color: var(--ink-mid) !important;
      }
      
      .katex .base {
        color: var(--ink-mid) !important;
      }
      
      /* 只针对块级数学公式居中显示 */
      .katex-display {
        text-align: center !important;
        margin: 1.5rem 0 !important;
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 12px;
        background: transparent;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 6px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: ${scrollbarVisible ? 'rgba(16, 185, 129, 0.7)' : 'transparent'};
        border-radius: 6px;
        border: 2px solid transparent;
        background-clip: content-box;
        transition: all 0.3s ease;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(16, 185, 129, 1);
        border: 2px solid transparent;
        background-clip: content-box;
      }
      
      .custom-scrollbar.scrollbar-visible::-webkit-scrollbar-thumb {
        background: rgba(16, 185, 129, 0.7);
        border: 2px solid transparent;
        background-clip: content-box;
      }
      
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: ${scrollbarVisible ? 'rgba(16, 185, 129, 0.7)' : 'transparent'} transparent;
      }
    `;
    
    const existingStyle = document.getElementById('custom-scrollbar-style');
    if (existingStyle) {
      existingStyle.textContent = style.textContent;
    } else {
      document.head.appendChild(style);
    }
    
    return () => {
      const styleElement = document.getElementById('custom-scrollbar-style');
      if (styleElement && !scrollbarVisible) {
        document.head.removeChild(styleElement);
      }
    };
  }, [scrollbarVisible]);

  // 处理滚动条显示逻辑
  useEffect(() => {
    const scrollContainer = markdownRef.current;
    if (!scrollContainer) return;

    let isScrolling = false;
    let scrollTimeout;
    let isMouseInContainer = false;

    const showScrollbar = () => {
      setScrollbarVisible(true);
      if (hideScrollbarTimeout.current) {
        clearTimeout(hideScrollbarTimeout.current);
      }
    };

    const hideScrollbarWithDelay = () => {
      // 只有在鼠标不在容器内且没有滚动时才延迟隐藏
      if (!isScrolling && !isMouseInContainer) {
        hideScrollbarTimeout.current = setTimeout(() => {
          setScrollbarVisible(false);
        }, 350);
      }
    };

    // 监听滚动事件
    const handleScroll = () => {
      isScrolling = true;
      showScrollbar();
      
      // 清除之前的滚动超时
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      // 滚动停止后标记为非滚动状态
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        // 滚动结束后，如果鼠标不在容器内，则延迟隐藏滚动条
        hideScrollbarWithDelay();
      }, 150);
    };

    // 监听鼠标进入markdown容器
    const handleMouseEnter = () => {
      isMouseInContainer = true;
      showScrollbar();
    };

    // 监听鼠标离开markdown容器
    const handleMouseLeave = () => {
      isMouseInContainer = false;
      hideScrollbarWithDelay();
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      if (hideScrollbarTimeout.current) {
        clearTimeout(hideScrollbarTimeout.current);
      }
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, []);

  // 思维导图数据，添加sectionId作为定位标识
  const mindmapData = {
    name: "数学优化方法的分类",
    type: "root",
    sectionId: "root",
    children: [
      {
        name: "1. 按决策变量类型",
        type: "category",
        sectionId: "decision-variable-type",
        children: [
          {
            name: "连续优化",
            type: "method",
            sectionId: "decision-variable-type-continuous"
          },
          {
            name: "离散优化",
            type: "method", 
            sectionId: "decision-variable-type-discrete"
          },
          {
            name: "混合整数优化",
            type: "method",
            sectionId: "decision-variable-type-mixed"
          },
          {
            name: "组合优化",
            type: "method",
            sectionId: "decision-variable-type-combinatorial"
          }
        ]
      },
      {
        name: "2. 按约束与可行域结构",
        type: "category",
        sectionId: "constraint-feasible-region",
        children: [
          {
            name: "无约束优化",
            type: "method",
            sectionId: "constraint-unconstrained"
          },
          {
            name: "有约束优化",
            type: "method",
            sectionId: "constraint-constrained"
          }
        ]
      },
      {
        name: "3. 按目标与模型结构",
        type: "category",
        sectionId: "objective-model-structure",
        children: [
          {
            name: "非线性规划",
            type: "framework",
            sectionId: "objective-nlp",
            children: [
              {
                name: "凸优化",
                type: "subframework",
                sectionId: "objective-convex",
                children: [
                  {
                    name: "线性规划",
                    type: "method",
                    sectionId: "objective-lp"
                  },
                  {
                    name: "二次规划",
                    type: "method",
                    sectionId: "objective-qp"
                  },
                  {
                    name: "锥规划",
                    type: "method",
                    sectionId: "objective-conic"
                  },
                  {
                    name: "几何规划",
                    type: "method",
                    sectionId: "objective-gp"
                  }
                ]
              },
              {
                name: "非凸优化",
                type: "subframework",
                sectionId: "objective-nonconvex"
              }
            ]
          },
          {
            name: "特殊结构问题",
            type: "framework",
            sectionId: "objective-special",
            children: [
              {
                name: "非线性最小二乘",
                type: "method",
                sectionId: "objective-nlls"
              },
              {
                name: "复合 / 非光滑优化",
                type: "method",
                sectionId: "objective-composite"
              }
            ]
          }
        ]
      },
      {
        name: "4. 按不确定性与信息结构",
        type: "category",
        sectionId: "uncertainty-information",
        children: [
          {
            name: "确定性优化",
            type: "method",
            sectionId: "uncertainty-deterministic"
          },
          {
            name: "随机优化",
            type: "method",
            sectionId: "uncertainty-stochastic"
          },
          {
            name: "鲁棒优化",
            type: "method",
            sectionId: "uncertainty-robust"
          },
          {
            name: "分布鲁棒优化",
            type: "method",
            sectionId: "uncertainty-dro"
          }
        ]
      },
      {
        name: "5. 按时域与决策流程",
        type: "category",
        sectionId: "time-decision-process",
        children: [
          {
            name: "静态优化",
            type: "method",
            sectionId: "time-static"
          },
          {
            name: "动态优化",
            type: "method",
            sectionId: "time-dynamic"
          },
          {
            name: "动态规划",
            type: "method",
            sectionId: "time-dp"
          },
          {
            name: "在线/流式优化",
            type: "method",
            sectionId: "time-online"
          },
          {
            name: "探索型序贯优化",
            type: "method",
            sectionId: "time-bayesian"
          }
        ]
      },
      {
        name: "6. 按目标个数与解的概念",
        type: "category",
        sectionId: "objective-count-solution",
        children: [
          {
            name: "单目标优化",
            type: "method",
            sectionId: "objective-single"
          },
          {
            name: "多目标优化",
            type: "method",
            sectionId: "objective-multi"
          },
          {
            name: "解的质量层级",
            type: "framework",
            sectionId: "objective-quality",
            children: [
              {
                name: "全局最优解",
                type: "method",
                sectionId: "objective-global"
              },
              {
                name: "局部最优解",
                type: "method",
                sectionId: "objective-local"
              },
              {
                name: "近似最优解",
                type: "method",
                sectionId: "objective-approximate"
              },
              {
                name: "工程可用解",
                type: "method",
                sectionId: "objective-engineering"
              }
            ]
          }
        ]
      },
      {
        name: "7. 按求解策略与算法范式",
        type: "category",
        sectionId: "solving-strategy-algorithm",
        children: [
          {
            name: "目标函数光滑可微",
            type: "framework",
            sectionId: "algorithm-differentiable",
            children: [
              {
                name: "一阶方法",
                type: "method",
                sectionId: "algorithm-first-order"
              },
              {
                name: "二阶与拟二阶方法",
                type: "method",
                sectionId: "algorithm-second-order"
              },
              {
                name: "利用特殊结构的算法",
                type: "method",
                sectionId: "algorithm-structure"
              },
              {
                name: "高阶优化方法",
                type: "method",
                sectionId: "algorithm-higher-order"
              }
            ]
          },
          {
            name: "函数不可导",
            type: "framework",
            sectionId: "algorithm-nondifferentiable",
            children: [
              {
                name: "元启发式算法",
                type: "method",
                sectionId: "algorithm-metaheuristics"
              },
              {
                name: "模型驱动的黑箱优化",
                type: "method",
                sectionId: "algorithm-blackbox"
              }
            ]
          },
          {
            name: "组合策略",
            type: "framework",
            sectionId: "algorithm-combined",
            children: [
              {
                name: "最优性条件与对偶理论",
                type: "method",
                sectionId: "algorithm-optimality"
              },
              {
                name: "约束处理策略",
                type: "method",
                sectionId: "algorithm-constraints"
              },
              {
                name: "分解与分布式方法",
                type: "method",
                sectionId: "algorithm-decomposition"
              },
              {
                name: "全局确定性方法",
                type: "method",
                sectionId: "algorithm-global"
              }
            ]
          }
        ]
      },
      {
        name: "8. 按规模与结构可利用性",
        type: "category",
        sectionId: "scale-structure-utility",
        children: [
          {
            name: "稀疏性",
            type: "method",
            sectionId: "scale-sparsity"
          },
          {
            name: "几何流形结构",
            type: "method",
            sectionId: "scale-manifold"
          },
          {
            name: "数据驱动的求和结构",
            type: "method",
            sectionId: "scale-data-driven"
          },
          {
            name: "并行与分布式计算",
            type: "method",
            sectionId: "scale-parallel"
          }
        ]
      }
    ]
  };

  // 完整的Markdown内容
  const fullMarkdownContent = `
## 1.3 数学优化方法的分类

对数学优化问题进行系统性分类，通常遵循两条逻辑主线：首先，从多个维度剖析问题的内在特征（定义其**是什么**）；其次，根据这些特征匹配相应的求解策略与算法范式（决定其**怎么解**）。根据这两条逻辑主线，数学优化问题的分类方法如下：

### 1.3.1 按决策变量类型（What Is Being chosen?） {#decision-variable-type}

决策变量的取值空间是优化问题的最基本分类维度，它从根本上决定了问题的数学特性和求解范式。

#### 1.3.1.1 连续优化 (Continuous Optimization) {#decision-variable-type-continuous}

 - 决策变量在**连续的实数域**上取值（例如，$x \\in \\mathbb{R}^n$）。求解的核心在于分析和利用目标与约束函数的光滑性（可导性）、凸性以及数值稳定性（条件数）。

 - *示例*: 非线性最小二乘、凸优化、光束法平差 (Bundle Adjustment) 中的相机位姿与三维点坐标。

#### 1.3.1.2 离散/整数优化 (Discrete / Integer Optimization) {#decision-variable-type-discrete}

- 决策变量的取值范围是**离散的**，例如整数集（$x \\in \\mathbb{Z}^n$）或一个有限的符号集合。由于解空间具有**组合爆炸**的特性，这类问题通常是 NP-hard 的，其求解依赖于组合搜索（如分支定界）或连续松弛等技巧。

- *示例*: 影像镶嵌中的最佳接缝线搜索、语义分割中为每个像素分配类别标签。

#### 1.3.1.3 混合整数优化 (Mixed-Integer Optimization, MIP/MICP) {#decision-variable-type-mixed}

- 问题中同时包含**连续变量**和**离散/整数变量**，是工业应用中最常见也最具挑战性的问题之一。通常采用**分支定界法 (Branch and Bound)**，并结合对整数变量的**连续松弛 (Continuous Relaxation)** 来进行求解。
- *示例*: 在确定测站是否建立（0-1决策）的同时，优化已建测站的具体坐标（连续决策）。

#### 1.3.1.4 类别/排列/集合优化 (Categorical / Permutation / Set Optimization) {#decision-variable-type-combinatorial}

- 决策变量本身是**非数值的组合对象**，如一个类别的选择、一个任务的排列顺序、或一个项目子集的选取。这类问题在建模阶段，通常通过引入**指示变量（如 0-1 变量）**，将其**等价地转化为整数规划或图论问题**（如旅行商问题、指派问题）来求解。
- *示例*: 多个控制点的最佳观测顺序规划（旅行商问题）、特征点集合的最优匹配（图匹配问题）。

#### 1.3.1.5 小结

> **NOTE**：
>
> - 连续变量便于使用导数信息；离散变量更依赖图搜索、分支定界或元启发式。
> - 变量类型的差异导致了求解范式的根本不同：**连续优化**的核心是利用**梯度**等导数信息在光滑的空间中进行迭代搜索；而**离散优化**的本质是在组合结构中进行**系统性的搜索、剪枝与枚举**。
> - 变量是类别、排列或集合；这类问题本质上具有**组合特性**，因此常通过引入二进制变量等方式，将其**转化为整数规划或图优化问题**（如图匹配、旅行商问题等）来建模求解。

### 1.3.2 按约束与可行域结构（Where Can We choose?） {#constraint-feasible-region}

约束条件定义了决策变量的合法取值范围，即**可行域 (Feasible Region)**。这个区域的几何结构是决定优化问题求解难度的核心因素，也是区分不同算法策略的根本依据。

#### 1.3.2.1 无约束优化（Unconstrained Optimization） {#constraint-unconstrained}

- **定义**: 决策变量的选取不受任何等式或不等式限制，可以在其完整的定义域（如 $\\mathbb{R}^n$）内自由移动。

- **核心**: 仅优化目标函数，不涉及等式或不等式约束；优化的焦点完全集中在目标函数自身的分析性质上，例如其光滑性（梯度）、曲率（Hessian 矩阵）、[强凸性](https://zh.wikipedia.org/wiki/%E5%87%B8%E5%87%BD%E6%95%B0)、[Lipschitz 常数](https://zh.wikipedia.org/zh-cn/%E5%88%A9%E6%99%AE%E5%B8%8C%E8%8C%A8%E9%80%A3%E7%BA%8C)等性质。

- *示例*:
  - 无任何先验限制的最小二乘曲线拟合。
  - 使用 L-BFGS 等算法优化深度学习模型中的网络权重。

#### 1.3.2.2 有约束优化（Constrained Optimization） {#constraint-constrained}

- **定义**: 存在等式、不等式或边界条件，这些条件共同“雕刻”出可行域。算法的每一步迭代都必须确保解的有效性，即始终停留在可行域内或向其逼近。

- **核心分水岭**: 可行域的**凸性**是该领域最重要的分界线，它直接将有约束优化问题划分为性质截然不同的两大类。
  - **凸可行域**（Convex Feasible Region）
    - **特点**: 可行域是一个**凸集**（集合内任意两点的连线段仍在该集合内）。当目标函数也是凸函数时，问题便构成了**凸优化**，其最显著的优点是：**任何局部最优解都必定是全局最优解**。

    - **求解范式**: 这种优良性质使得投影法、内点法、对偶方法等一系列高效算法能够被应用，从而可靠地找到全局最优解。

    - *示例*:
      - 测绘数据配准中，要求变换参数必须使所有控制点落在某个预定义的**凸包**内。
      - 地物优化选取时，要求选取目标的中心点必须位于一个**凸多边形**边界内。

  - **非凸可行域**（Non-Convex Feasible Region）
    - **特点**: 可行域是**非凸**的，其几何形状可能包含“凹陷”、孔洞，甚至由多个不相连的子区域构成。这导致优化过程极易陷入**局部最优解**——即在小邻域内最优，但并非全局最佳。

    - **求解范式**: 求解这类问题极具挑战性，通常依赖于复杂的全局优化算法（如分支定界）、启发式策略（如模拟退火），或者对可行域进行**凸松弛 (Convex Relaxation)** 来寻找一个近似解。

    - *示例*:
      - 影像镶嵌中，搜索一条避开特定障碍物区域（非凸区域）的最佳路径。
      - 在复杂三维城市模型中，因地形或建筑遮挡（导致非凸可行域）而进行的无人机飞行路径优化。

#### 1.3.2.3 小结 {#constraint-summary}


> **NOTE**：可行域的几何结构是算法选择的**核心路标**。一个**凸**的可行域通常意味着问题是**“易解的” (Tractable)**，存在通向全局最优的可靠路径；而一个**非凸**的可行域则往往意味着问题是**“难解”的 (Intractable)**，求解时必须在**解的质量**与**计算效率**之间做出权衡。


### 1.3.3 按目标与模型结构（What Does the Cost Look like?） {#objective-model-structure}

目标函数与约束的数学形式是决定优化问题难度和求解方法的核心。该分类下的最重要分界线是**凸性（Convexity）**，它直接关系到我们能否保证找到全局最优解。

#### 1.3.3.1 通用框架：非线性规划 (NLP) {#objective-nlp}

非线性规划 (Nonlinear Programming) 是最广泛的优化问题模型，涵盖了所有目标函数或约束中至少存在一个非线性项的场景。

- **公式**：$ \\min\\{ f(x) \\;|\\; g_i(x) \\le 0,\\ h_j(x) = 0 \\}$
- **特点**: 目标或约束中至少有一个是非线性的；可分为凸与非凸两类，求解方法多样（梯度法、牛顿法、SQP 等）。
- **核心属性**: NLP 的核心分野在于**凸性**。
  - **凸优化**: 若目标函数 $f(x)$ 与不等式约束函数 $g_i(x)$ 均为凸函数，且等式约束 $h_j(x)$ 均为仿射函数，则该问题为凸优化问题。其关键优势是**任何局部最优解即为全局最优解**。
  - **非凸优化**: 不满足以上条件的问题。求解通常只能保证收敛到局部最优，寻找全局解极具挑战性。
- *示例*: 复杂地形条件下的无人机能耗最优航迹规划，其能耗模型与地形约束通常是非线性的。

#### 1.3.3.2 核心类别：凸优化及其特例 {#objective-convex}

凸优化问题因其优良的理论性质和高效的求解算法，在工程与科研中扮演着至关重要的角色。以下是其最重要的子类，按结构从简单到复杂排列。

##### 1.3.3.2.1 线性规划（Linear Programming, LP） {#objective-lp}
  - **公式**：$ \\max\\{ c^\\top x \\;|\\; x \\in \\mathbb{R}^n, \\; A x \\le b, \\; x \\ge 0 \\}$
  - **特点：**目标函数和所有约束条件均为**线性**表达式。这是理论最成熟、求解效率最高的优化问题类型。
  - **求解方法**: 单纯形法 (Simplex Method)、内点法 (Interior-Point Methods)。
  - *示例*: 已知多名内页作业员，每人完成标准图幅的工作量、所需时间和人工成本已知。目标是在满足总作业面积、交付时间等约束条件的前提下，合理分配任务给不同的作业员，使**总人工成本最小**。

##### 1.3.3.2.2 二次规划（Quadratic Programming, QP） {#objective-qp}
  - **公式**：$ \\min\\{ \\tfrac12 x^\\top Q x + c^\\top x \\;|\\; x \\in \\mathbb{R}^n, \\; A x \\le b, \\; x \\ge 0 \\}$
  - **特点：**约束条件为线性，但目标函数是**二次**的。当目标函数的二次型矩阵 $Q$ 为半正定（$Q \\succeq 0$） 时，该 QP 问题是凸的。
  - *示例*: GNSS 单历元定位的**加权最小二乘**问题，其本质就是一个无约束的凸 QP 问题。

##### 1.3.3.2.3 二次约束二次规划（Quadratically Constrained Quadratic Programming, QCQP） {#objective-qcqp}
  - **公式**：$ \\min\\{ \\tfrac12 x^\\top Q_0 x + c_0^\\top x \\;|\\; x \\in \\mathbb{R}^n, \\; x^\\top Q_i x + d_i^\\top x + e_i \\le 0,\\ i=1,\\dots,m \\}$
  - **特点：**目标函数和不等式约束函数均为二次形式。当所有相关的二次型矩阵均为半正定时，问题是凸的。
  - *示例*: 在地理围栏（由多个圆形或椭球区域定义）约束下的最优基站位置选择。

##### 1.3.3.2.4 锥规划（Conic Programming: SOCP / SDP / ExpCone 等） {#objective-conic}
  - **公式（统一标准形）**：$ \\min\\{ c^\\top x \\;|\\; A x + s = b,\\; s \\in \\mathcal{K} \\}$ ，其中 $\\mathcal{K}$ 为标准锥（如二阶锥、半正定锥、指数锥）。
  - **特点：**椎规划是LP, QP, QCQP 的一个强大推广和**统一框架**。它将可行域定义在一个凸锥上，能够优雅地处理更多类型的约束。
  - **重要子类**：
    - **二阶锥规划 (SOCP)**: 当 $\\mathcal{K}$ 是二阶锥（Lorentz cone）时，可以建模形如 $ \\|A_i x + b_i\\|_2 \\le c_i^\\top x + d_i $ 的约束，如 GNSS 椭球误差约束定位问题；
    - **半定规划 (SDP)**: 当 $\\mathcal{K}$ 是半正定矩阵锥时，变量是矩阵且被约束为半正定。建模为 $ \\min\\{ \\langle C, X \\rangle \\;|\\; \\langle A_j, X \\rangle = b_j,\\ X \\succeq 0 \\}$，如影像匹配的图匹配 SDP 松弛。

##### 1.3.3.2.5 几何规划（Geometric Programming, GP） {#objective-gp}
  - **公式**（正变量 $x>0$）：$ \\min\\{ f_0(x) \\;|\\; f_i(x) \\le 1,\\ g_j(x) = 1 \\}$ ，其中 $f_i$ 为 正项式，$g_j$ 为 单项式；经对数变量变换可转为凸优化问题。

  - **特点**: 变量为正，函数由**正项式 (Posynomial)** 和**单项式 (Monomial)** 构成。虽然其原始形式非凸，但可通过对数变换**转化为一个标准的凸优化问题**。

  - *示例*: 基于功率与信噪比模型（通常是乘积与比例关系）的最优传感器布设。

#### 1.3.3.3 非凸优化及其挑战 {#objective-nonconvex}

非凸优化问题是指目标函数或约束函数中至少存在一个非凸函数的优化问题。这类问题的主要特征是可能存在多个局部最优解，且局部最优解不一定是全局最优解。

- **特点**: 问题的可行域或目标函数为非凸，导致优化过程容易陷入局部最优解
- **求解挑战**: 需要专门的全局优化算法，如分支定界、遗传算法、模拟退火等
- *示例*: 复杂地形下的多无人机协同路径规划，涉及避障约束和多目标优化

#### 1.3.3.4 具有特殊结构的非线性问题 {#objective-special}

##### 1.3.3.4.1 非线性最小二乘（Nonlinear Least Squares, NLLS） {#objective-nlls}
  - **公式**：$ \\min\\{ \\tfrac12 \\sum_{i=1}^{N} \\| W_i^{1/2} r_i(x) \\|_2^2 \\}$
  - **特点**: 目标函数是**一系列非线性残差项的平方和**。这是测量数据处理领域最常见的问题形式。
  - **求解方法**: 高斯-牛顿法 (Gauss-Newton)、列文伯格-马夸尔特法 (LM)。这些算法利用了问题的一阶导数（雅可比矩阵）信息来高效地近似二阶（Hessian）信息。
  - *示例*: **光束法平差 (Bundle Adjustment, BA)**、点云迭代最近点配准 (ICP)。

##### 1.3.3.4.2 复合 / 非光滑优化（Composite / Nonsmooth Optimization） {#objective-composite}
  - **公式**：$ \\min\\{ g(x) + h(x) \\}$，其中 $g$ 光滑（且 $\\nabla g$ 具 Lipschitz 连续），$h$ 为非光滑凸正则或指示函数。
  - **特点：**目标函数可拆分为一个**光滑项**和一个**非光滑但结构简单**的项（如 $L_1$ 范数）。这类模型在引入稀疏性、低秩等正则化先验时非常有效。
  - **求解方法**: 近端梯度法 (ISTA, FISTA)、交替方向乘子法 (ADMM)。

#### 1.3.3.5 小结

> **NOTE**：“锥规划”是凸优化的重要统一框架，LP、SOCP、SDP 都是它的特例，尤其适合处理几何、矩阵与不等式混合约束。

### 1.3.4 按不确定性与信息结构（What Do We know?） {#uncertainty-information}

在现实世界的决策问题中，模型参数往往并非完全已知。我们对不确定性信息的掌握程度，决定了优化建模的哲学和方法。

#### 1.3.4.1 确定性优化 (Deterministic) {#uncertainty-deterministic}

- **核心假设**: 模型中的所有参数（如成本、资源、物理系数）都被假定为**精确已知且固定不变**的数值。
- **建模范式**: 这是最经典的优化框架，我们直接基于这些已知的、确定的数据构建模型并求解。它为分析问题提供了一个理想化的基准。

#### 1.3.4.2 随机优化（Stochastic） {#uncertainty-stochastic}

- **核心假设**: 参数的不确定性可以通过一个**已知的概率分布**来精确刻画（例如，某个测量误差服从高斯分布）。我们虽然不知道下一次观测的具体值，但了解其统计规律。
- **建模范式**: 我们的目标不再是针对某一个特定场景优化，而是追求**期望性能的最优** ($\\min_x \\mathbb{E}[f(x, \\xi)]$) 或保证决策在**大概率下是可行**的（机会约束：$\\Pr\\{g(x, \\xi) \\le 0\\} \\ge 1 - \\alpha$）。它本质上是一种"押注于大概率事件"的策略。
- **特点**: 利用统计分布信息优化平均性能或满足概率性需求。在随机规划中，参数服从已知分布的假设成立时，可以基于期望做决策优化。
- *示例*: 调度车辆时，假设行驶时间服从某个已知的交通流量分布，目标是最小化平均总耗时。

#### 1.3.4.3 鲁棒优化（Robust） {#uncertainty-robust}

- **核心假设**: 我们对参数的概率分布信息掌握很少，甚至一无所知，唯一可知的是它所属的一个**有界的不确定集** $\\mathcal{U}$。（例如，传感器误差的范围在 $[-1, 1]$ 内，但具体如何分布未知）。
- **建模范式**: 这是一种**风险规避**的、偏向保守的策略。其目标是制定一个能够**抵御一切可能的最坏情况**的决策，即求解 min-max 问题：$\\min_x \\max_{\\xi \\in \\mathcal{U}} f(x, \\xi)$ 解的性能可能不是平均最好的，但它提供了一个**绝对的安全保证**。
- **特点**: 无需精确分布，只需参数可能范围，即可保证解对最坏情形的稳健性。鲁棒方法强调最差表现保障，与随机方法不同。
- *示例*: 设计桥梁时，必须确保其结构能够承受在所有可能的最极端风力、载荷组合（不确定集）下的最大应力。

#### 1.3.4.4 分布鲁棒优化（Distributionally Robust Optimization, DRO） {#uncertainty-dro}  

- **核心假设**: 它是随机优化与鲁棒优化的精妙结合。我们既不知道确切的概率分布，但又不仅仅只知道一个简单的边界。我们掌握了部分统计信息（如均值、方差），从而可以将真实的、未知的分布限定在一个 **"分布族"**（一个由许多可能分布组成的集合）之内。
- **建模范式**: 目标是在这个**最坏的可能分布**下，使期望性能达到最优。它在利用已有统计信息的同时，也考虑了分布本身的误差，从而寻求一种**数据驱动的稳健性**。 
- **特点**: 兼顾分布信息与最坏期望性能，提升模型可靠性。

#### 1.3.4.5 小结

> **NOTE:**
>
> - **随机优化**是一种"乐观"的平均主义：相信基于已知的概率分布进行决策，长期来看是最佳的。
> - **鲁棒优化**是一种"悲观"的绝对主义：不相信任何概率信息，只为最坏的情况做准备，追求绝对安全。
> - **分布鲁棒优化**是一种"现实"的折衷主义：承认我们拥有的概率信息可能不完美，并在此基础上寻求最稳健的决策。

### 1.3.5 按时域与决策流程（When Do We choose ?） {#time-decision-process}

决策是在一个时间点上一次性完成，还是随着时间的推移和信息的更新而逐步进行，这构成了优化问题的另一重要维度。

#### 1.3.5.1 静态优化（Static Optimization） {#time-static}

- **定义**: 所有决策变量在一个**单一、整体**的优化过程中被同时确定。这类问题不考虑时间的演化，假设所有必需信息在决策之初就已完全掌握。
- *示例*: 在一次性的成本预算和精度要求下，为一片区域规划**最佳的地面控制点布局**，这是一个典型的静态资源配置问题。

#### 1.3.5.2 动态优化（Dynamic Optimization） {#time-dynamic}

- **定义**: 描述一个系统在连续或离散的时间阶段中，其状态 $x_t$ 如何根据当前状态和施加的控制 $u_t$ 演化到下一状态 $x_{t+1} = f(x_t, u_t, t)$。目标是寻找最优的控制序列 $\\{u_0, u_1, \\ldots, u_{T-1}\\}$，以最小化总代价。其模型可以表示为：

    $$\\min_{u_{0:T-1}} \\sum_{t=0}^{T-1} \\ell(x_t, u_t, t) + \\phi(x_T), \\quad \\text{s.t. } x_{t+1} = f(x_t, u_t, t)$$

- **最优控制**是研究此类问题的数学分支，尤其在连续时间系统上，它提供了如**庞特里亚金最大值原理**或**HJB方程**等强大的理论分析工具。

#### 1.3.5.3 动态规划（Dynamic Programming, DP） {#time-dp}

- **定义**: 这并非一类问题，而是一种强大的**求解方法论**，专门用于解决具有**最优子结构**性质的多阶段决策问题。其核心思想（贝尔曼最优性原理）是将一个复杂的全局问题，**递归地分解**为一系列更简单的、嵌套的子问题来求解。
- **典型模型**: **马尔可夫决策过程(MDP)** 是动态规划在随机环境下的经典应用模型，常通过价值迭代、策略迭代等DP算法求解最优策略。

#### 1.3.5.4 在线/流式优化（Online/Streaming Optimization） {#time-online}

- **定义**: 决策者必须在信息**逐步到达**的过程中，**顺序地、不可撤销地**做出决策，且在任一时刻都无法预知未来的信息。
- **评估标准**: 其性能优劣通常不与某个固定的最优值比较，而是通过 **"遗憾"(Regret)** 来衡量——即在线算法的总代价与一个"事后诸葛亮"（能看到所有未来信息的离线最优算法）的总代价之间的差距。目标是最小化累积遗憾。

#### 1.3.5.5 探索型序贯优化（Exploration-based/Bayesian-type Optimization） {#time-bayesian}

- **定义**: 适用于目标函数本身是 **"黑箱"**（无解析形式、不可导）且 **评估代价高昂** 的场景。决策过程是一个 **"边做边学"** 的序列，每一步都需要在两个目标间权衡：
  - **探索(Explore)**: 在不确定的区域进行尝试，以期发现更好的解。
  - **利用(Exploit)**: 在当前已知的最优区域附近进行挖掘，以优化现有最佳解。
- **典型范式**: **贝叶斯优化(Bayesian Optimization)**、**多臂老虎机(Multi-Armed Bandit)**。

#### 1.3.5.6 小结

> **NOTE**: 动态优化 vs. 动态规划
>
> - **动态优化**指一类随时间演化的问题建模范畴，着重于系统如何跨时间决策与状态演化。  
> - **动态规划**是解决这类问题（以及其他具有最优子结构问题）的一种核心**方法**，本质是用来解决具有阶段性决策结构的问题，并不等同于动态优化本身。  

### 1.3.6 按目标个数与解的概念（What Is optimal?） {#objective-count-solution}

"最优"的定义并非一成不变。它取决于我们是在追求单一维度的极致，还是在多个冲突的目标间寻求平衡。同时，根据问题的复杂性和求解能力，我们对解的"最优性"也有着不同层次的定义。

#### 1.3.6.1 单目标优化（Single-Objective） {#objective-single}

- **定义**: 整个优化过程致力于最小化或最大化一个**单一的、明确的标量性能指标**（如成本、误差、效率）。目标是找到一个或一组使该指标达到极致的决策变量。
- **解的形态**: 寻求一个在整个可行域上最优的**点**。
- *示例*: 测绘中最小化总测量误差，或最大化控制网的精度。

#### 1.3.6.2 多目标优化（Multi-Objective/Vector Optimization） {#objective-multi}

- **定义**: 同时优化两个或更多**相互冲突**的目标函数（例如，成本vs.精度，时效vs.覆盖范围）。由于目标间的冲突，不存在能使所有目标同时达到最优的单一"完美解"。
- **解的形态**: 优化的结果不是一个点，而是一个**解的集合**，被称为 **帕累托最优集(Pareto Optimal Set)**。此集合中的任何一个解都无法在不牺牲其他目标性能的前提下，改进任何一个目标。这些解在目标函数空间中构成的边界被称为 **帕累托前沿(Pareto Front)**。
- *示例*: 无人机路径规划中同时优化飞行时间、能耗和覆盖区域面积。

#### 1.3.6.3 解的质量层级 {#objective-quality}

对于一个给定的优化问题，我们找到的解可能处于以下不同的质量层级：

##### 1.3.6.3.1 全局最优解(Global Optimum) {#objective-global}
  - **定义**: 在**整个可行域**内，使得目标函数值达到最优的解。这是优化理论追求的终极目标，但对于非凸问题，寻找并验证全局最优解通常极其困难。

##### 1.3.6.3.2 局部最优解(Local Optimum) {#objective-local}
  - **定义**: 在其邻近的一个小区域内，该解对应的目标函数值优于所有其他相邻解。绝大多数通用的非线性优化算法，其收敛性保证都止步于局部最优。

##### 1.3.6.3.3 近似最优解(Approximate/Near-Optimal Solution) {#objective-approximate}
  - **定义**: 一个可行解，其目标函数值被证明在全局最优值的某个可接受的误差范围（$\\epsilon$）之内。在处理NP-难问题或需要快速获得高质量解的场景中，这是一个非常实用的目标。

##### 1.3.6.3.4 工程可用解(Pragmatic/Engineering Solution) {#objective-engineering}
  - **定义**: 一个在实践中被接受的解，它可能并非严格的数学最优，但在**计算成本、实现复杂度、鲁棒性和模型可解释性**等多个工程维度上达到了最佳的综合平衡。

#### 1.3.6.4 小结

> **NOTE**: 从单目标到多目标的转变是一种核心的**思维范式转换**。优化的目的不再是给出一个唯一的"答案"，而是**描绘出所有最优权衡的全貌（即帕累托前沿）**，从而将最终的决策权交给设计者，让他们可以根据外部的、更高层次的偏好，在这个"最优菜单"中进行选择。

### 1.3.7 按求解策略与算法范式（How To solve?） {#solving-strategy-algorithm}

一旦问题被数学化地定义，我们就需要选择合适的算法"引擎"来求解。算法范式根据其利用的信息（如导数）、处理问题的策略以及适用范围而异。

#### 1.3.7.1 目标函数光滑可微 {#algorithm-differentiable}

对于目标函数和约束光滑可微的场景，利用导数信息是最高效的途径。算法的效率和成本与其利用导数的阶数密切相关。

##### 1.3.7.1.1 一阶方法(First-Order Methods) {#algorithm-first-order}
- **核心思想**: 仅利用目标函数的**一阶导数（梯度）** 信息来确定下降方向。这类方法每次迭代的计算成本极低，内存占用小，特别适合于**大规模**和**超大规模**问题。
- **代表算法**: 梯度下降法(Gradient Descent)、投影梯度法、近端梯度法(ISTA, FISTA)、随机梯度下降(SGD)及其变体(Adam, RMSProp)。
##### 1.3.7.1.2 二阶与拟二阶方法(Second-Order & Quasi-Newton Methods) {#algorithm-second-order}
- **核心思想**: 同时利用**一阶导数（梯度）** 和**二阶导数（Hessian矩阵）** 信息。Hessian矩阵描述了函数的局部曲率，使得算法能够更精准地走向最优解，从而具有更快的收敛速度（如二次收敛）。
- **分类**:
    - **牛顿法(Newton's Method)**: 直接计算并使用真实的Hessian矩阵。收敛快，但Hessian矩阵的计算和求逆成本极高，限制了其在大规模问题中的应用。
    - **拟牛顿法(Quasi-Newton Methods)**: 通过梯度在迭代过程中的变化，来**近似** Hessian矩阵或其逆。它们在收敛速度和计算成本之间取得了绝佳的平衡，是中等规模优化问题的**主力算法**。代表有BFGS, L-BFGS。
##### 1.3.7.1.3 利用特殊结构的算法(Structure-Exploiting Methods) {#algorithm-structure}
- **核心思想**: 针对**非线性最小二乘(NLLS)** 这类具有"残差平方和"特殊结构的问题，可以通过其**一阶雅可比矩阵**，构造出对Hessian矩阵的有效近似。
- **代表算法**: 高斯-牛顿法(Gauss-Newton)和列文伯格-马夸尔特法(LM)，它们比标准的拟牛顿法更高效地利用了问题结构，是求解BA、ICP等问题的黄金标准。
##### 1.3.7.1.4 高阶优化方法(Higher-Order Methods) {#algorithm-higher-order}
- **核心思想**: 利用三阶或更高阶的导数信息来构造迭代，以期获得比二阶方法更快的收敛阶数（如三阶收敛）。
- **典型方法**:
    - **Halley类方法（第三阶）**: 在某些条件下迭代收敛速度可达三阶，计算量大于牛顿法但提升显著。
    - **高级d阶Newton方法**: 以d阶Taylor展开并通过Sum-of-Squares+半定规划求解每步更新，具有局部d阶收敛性能。
- **局限性**: 高阶导数张量的计算、存储和处理会带来**指数级的计算复杂度**，导致其在实践中，尤其是在测绘等高维应用领域，几乎**不被使用**，主要停留在理论研究和特定的低维高精度计算中。

#### 1.3.7.2 函数不可导 {#algorithm-nondifferentiable}

当函数的导数不可计算、不存在，或函数评估成本极高时，我们需要不依赖梯度的优化方法。

##### 1.3.7.2.1 元启发式算法(Metaheuristics) {#algorithm-metaheuristics}
- **核心思想**: 受自然界（如进化、退火、鸟群觅食）或社会现象启发的随机搜索算法。它们通过**全局搜索**与**局部探索**的平衡，致力于在复杂解空间中找到高质量的解。
- **特点**: 适用性广，不要求函数有任何良好数学性质。但其**不保证收敛到全局最优**，且结果通常具有随机性。
- **代表算法**: 遗传算法(GA)、粒子群优化(PSO)、模拟退火(SA)。
##### 1.3.7.2.2 模型驱动的黑箱优化(Model-Based Black-Box Optimization) {#algorithm-blackbox}
- **核心思想**: 针对评估成本极高的"黑箱"函数，通过少量采样点构建一个**代理模型(Surrogate Model)** 来近似原函数，然后在廉价的代理模型上进行优化，以智能地决定下一个评估点。
- **代表算法**: 贝叶斯优化(Bayesian Optimization)、CMA-ES。

#### 1.3.7.3 组合策略 {#algorithm-combined}

以下是更高层次的方法论，它们通常与上述具体算法相结合，用于处理约束、分解问题或分析最优性。

##### 1.3.7.3.1 最优性条件与对偶理论(Optimality Conditions & Duality) {#algorithm-optimality}
- **定义**: 这不是求解算法，而是**分析和验证解的理论基石**。**KKT（Karush–Kuhn–Tucker）条件** 为有约束优化问题提供了最优解所必须满足的充要条件。**拉格朗日对偶** 则通过将原问题转化为一个对偶问题，为分析问题、获得最优值的下界以及设计算法（如ADMM）提供了强大工具。
##### 1.3.7.3.2 约束处理策略(Constraint Handling Strategies) {#algorithm-constraints}
- **核心思想**: 将复杂的**有约束问题**转化为一系列更易于求解的**无约束（或简单约束）问题**。
- **主要方法**: 惩罚法(Penalty Methods)、障碍法(Barrier Methods, 内点法的基础)、增广拉格朗日法(Augmented Lagrangian Methods)。
##### 1.3.7.3.3 分解与分布式方法(Decomposition & Distributed Methods) {#algorithm-decomposition}
- **核心思想**: 将一个耦合的、大规模的全局问题，**分解**为多个可以**并行或独立求解**的、规模更小的子问题，并通过一个协调机制来整合子问题的解。
- **代表算法**: 交替方向乘子法(ADMM)、丹茨格-沃尔夫分解(Dantzig-Wolfe Decomposition)。
##### 1.3.7.3.4 全局确定性方法(Deterministic Global Optimization) {#algorithm-global}
- **核心思想**: 针对非凸问题，通过系统性的空间划分和剪枝（如区间算法、分支定界法），在有限时间内**保证找到全局最优解**并提供其最优性证明。
- **局限性**: 计算成本随问题维度指数增长，通常只适用于小到中等规模的问题。

#### 1.3.7.4 小结

> **NOTE**:
>
> - **一阶vs.二阶**: 本质上是**扩展性(Scalability)** 与**收敛速度(Convergence Speed)** 之间的权衡。
> - **梯度vs.黑箱**: 是利用**问题结构**的高效率与**模型普适性**之间的权衡。
> - **启发式vs.确定性**: 是在复杂问题上快速获得**高质量解**与在特定问题上追求**理论最优保证**之间的权衡。

### 1.3.8 按规模与结构可利用性（How Big and structured?） {#scale-structure-utility}

在现代应用中，优化问题不仅类型各异，其规模和内部结构更是千差万别。高效的求解方案往往不是选择一个通用算法，而是深度利用问题特有的结构，并匹配相应的计算范式。

#### 1.3.8.1 稀疏性 (Sparsity) {#scale-sparsity}

- **背景**: 在许多大规模问题中，绝大多数变量之间没有直接的相互作用。这种关系体现在问题的关键矩阵（如雅可比矩阵、Hessian 矩阵）上，即矩阵中绝大部分元素为零。
- **策略**: 利用稀疏性是**大规模优化的第一准则**。通过使用稀疏矩阵存储格式和专门的代数库，可以避免无效的零元素存储和计算。更重要的是，它使得像**共轭梯度法 (CG)** 及其预条件版本 (PCG) 等迭代求解器变得极为高效，因为这些方法的核心仅依赖于（稀疏）矩阵与向量的乘法操作。
- *示例*: 在**光束法平差 (Bundle Adjustment, BA)** 中，一个三维点仅与观测到它的少数几个相机位姿相关，这使得整个问题的雅可比矩阵和高斯-牛顿近似的 Hessian 矩阵呈现出鲜明的**块稀疏**结构。利用此结构是实现大规模 BA 的关键。

#### 1.3.8.2 几何流形结构 (Geometric Manifold Structure) {#scale-manifold}

- **背景**: 当决策变量天然地存在于一个**非欧几里得的弯曲空间**（即流形）上时，传统的优化方法可能会失效。例如，旋转矩阵必须保持其正交性，不能简单地当作普通向量来处理。
- **策略**: **黎曼优化 (Riemannian Optimization)** 将经典的优化算法（如梯度下降、信赖域法）从欧氏空间推广到了流形上。它通过在流形的“切空间”上进行计算，并利用“收缩 (Retraction)”操作将更新后的点拉回到流形上，从而在整个优化过程中严格保持变量的几何约束。
- *示例*: 在机器人学或 SLAM 的姿态估计中，需要在旋转矩阵构成的特殊正交群 **SO(3)** 流形上进行优化，以确保得到的姿态是物理有效的。

#### 1.3.8.3 数据驱动的求和结构 (Data-Driven Summation Structure) {#scale-data-driven}

- **背景**: 在机器学习和现代数据科学中，目标函数常常是一个在海量数据集上**所有样本损失之和**的形式：$F\\left( x \\right) = \\sum\\limits_{i = 1}^N {{f_i}\\left( x \\right)} $，其中 $N$ 可能达到数百万甚至数十亿。

- **策略**: **随机与小批量方法 (Stochastic / Mini-batch Methods)** 是应对此结构的核心武器。其思想是，在每次迭代中，不计算完整的、昂贵的真实梯度（需要遍历所有 $N$ 个样本），而是随机抽取一小部分样本（一个 mini-batch）来计算一个**梯度的无偏估计**。虽然每一步的更新方向带有噪声，但其极低的计算成本使得算法可以极快地进行大量迭代，从而在宏观上实现高效收敛。

- **代表算法**: **随机梯度下降 (SGD)** 及其各种先进的变体 (Adam, AdaGrad, RMSProp)，以及方差缩减方法 (SVRG, SAGA)。

#### 1.3.8.4 并行与分布式计算 (Parallel & Distributed Computing) {#scale-parallel}

- **背景**: 当单台计算机的计算能力或内存已无法承载问题的规模时，利用多核、GPU 或计算机集群进行协同计算成为必然选择。
- **策略**: 这是实现大规模优化的**计算范式**。它可以是：
  - **数据并行**: 将海量数据分布到不同节点上，各节点并行计算其上的梯度分量，最后汇总更新（常见于深度学习训练）。
  - **模型并行**: 将巨大的模型（如参数矩阵）本身切分到不同节点上。
  - **算法分解**: 采用像 **ADMM** 这样的算法，将一个大的耦合问题，在数学上分解为多个可以并行求解、再通过消息传递来协调的子问题。
- *示例*: 在一个多 GPU 服务器上，并行处理不同批次的遥感影像数据，以加速一个大规模深度学习分类模型的训练。

#### 1.3.8.5 小结 {#scale-summary}

> **NOTE:**
>
> 解决前沿的大规模问题，往往需要将上述策略**协同设计**：例如，利用 **ADMM** 将一个大规模 **BA 问题**分解到**分布式集群**上，每个节点内部再利用**稀疏线性代数**和 **LM 算法**进行高效求解。这体现了**问题结构、优化算法、计算架构**三者的深度融合。

`;

  // 滚动定位到指定章节并高亮标题
  const scrollToSection = (sectionId) => {
    const element = markdownRef.current?.querySelector(`#${sectionId}`);
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // 高亮所有标题的默认样式
      markdownRef.current.querySelectorAll('h2, h3').forEach(h => {
        h.style.backgroundColor = 'transparent';
        h.style.padding = '0';
      });
      
      // 高亮当前标题
      element.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
      element.style.padding = '0.5rem';
      element.style.borderRadius = '0.5rem';
      
      setHighlightedSection(sectionId);
      
      // 3秒后移除高亮
      setTimeout(() => {
        element.style.backgroundColor = 'transparent';
        element.style.padding = '0';
      }, 3000);
    }
  };

  // 创建思维导图
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const container = svgRef.current.parentElement;
    const width = container.clientWidth || 700;
    const height = container.clientHeight || 450;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };

    svg.attr("width", width).attr("height", height);

    // 创建力导向布局
    const simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(d => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    // 转换数据为图结构
    const nodes = [];
    const links = [];
    let nodeId = 0;

    const processNode = (node, parentId = null, level = 0) => {
      const currentId = nodeId++;
      nodes.push({
        id: currentId,
        name: node.name,
        type: node.type,
        case: node.case,
        anchor: node.anchor,
        sectionId: node.sectionId,
        level: level,
        expanded: isExpanded
      });

      if (parentId !== null) {
        links.push({
          source: parentId,
          target: currentId
        });
      }

      if (node.children && (isExpanded || level < 4)) {
        node.children.forEach(child => {
          processNode(child, currentId, level + 1);
        });
      }

      return currentId;
    };

    processNode(mindmapData);

    // 创建连接线
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#4a5568")
      .attr("stroke-width", 2)
      .attr("opacity", 0.6);

    // 创建节点组
    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("cursor", "pointer")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // 根据节点类型设置样式
    node.each(function(d) {
      const g = d3.select(this);
      
      // 节点背景
      const rect = g.append("rect")
        .attr("width", d => d.name.length * 12 + 20)
        .attr("height", 35)
        .attr("x", d => -(d.name.length * 6 + 10))
        .attr("y", -17.5)
        .attr("rx", 8)
        .attr("fill", d => {
          switch(d.type) {
            case "root": return "#3b82f6";           // 蓝色
            case "category": return "#10b981";       // 绿色
            case "framework": return "#f59e0b";      // 橙色
            case "subframework": return "#8b5cf6";   // 紫色
            case "method": return "#ef4444";         // 橘红色
            default: return "#64748b";
          }
        })
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.9);

      // 节点文本
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("font-size", d => d.type === "root" ? "14px" : "12px")
        .attr("font-weight", d => d.type === "root" ? "bold" : "normal")
        .attr("fill", "white")
        .text(d.name);

      // 添加悬停效果
      g.on("mouseenter", function(event, d) {
        setSelectedNode(d);
        d3.select(this).select("rect")
          .transition()
          .duration(200)
          .attr("opacity", 1)
          .attr("stroke-width", 2);
      })
      .on("mouseleave", function() {
        d3.select(this).select("rect")
          .transition()
          .duration(200)
          .attr("opacity", 0.9)
          .attr("stroke-width", 1.5);
      })
      .on("click", function(event, d) {
        // 点击节点时，滚动定位到对应章节
        if (d.sectionId) {
          scrollToSection(d.sectionId);
          // 高亮当前选中的节点
          svg.selectAll('rect')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1.5);
          
          d3.select(this).select('rect')
            .attr('stroke', '#fbbf24')
            .attr('stroke-width', 3);
        }
      });
    });

    // 拖拽功能
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // 启动仿真
    simulation
      .nodes(nodes)
      .on("tick", () => {
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

        node
          .attr("transform", d => `translate(${d.x},${d.y})`);
      });

    simulation.force("link").links(links);

  }, [isExpanded]);

  return (
    <section
      id={id}
      className="snap-section relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg-deep)' }}
    >
      <div className="relative z-10 w-full h-screen flex flex-col pt-[51px] pb-[96px]">

        {/* 主要内容区域 - 左右布局 */}
        <div className="flex-1 flex gap-6 px-8 pt-6 overflow-hidden justify-between" style={{ pointerEvents: 'auto' }}>
          {/* 左侧：思维导图区域 */}
          <div className="flex flex-col" style={{ width: '45%', marginLeft: '5%' }}>
            <div className="flex-1 bg-black/10 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
              <div className="p-4 h-full">
                <svg 
                  ref={svgRef}
                  className="w-full h-full"
                />
              </div>
            </div>
            
            <div className="mt-3 bg-black/10 backdrop-blur-sm p-3 rounded-lg border border-white/10">
              <div className="flex justify-between items-center">
                <div className="flex gap-3 text-xs flex-wrap">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded"></div>
                    <span style={{ color: 'var(--ink-mid)' }}>根节点</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded"></div>
                    <span style={{ color: 'var(--ink-mid)' }}>分类维度</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded"></div>
                    <span style={{ color: 'var(--ink-mid)' }}>框架层</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded"></div>
                    <span style={{ color: 'var(--ink-mid)' }}>子框架</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded"></div>
                    <span style={{ color: 'var(--ink-mid)' }}>具体方法</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="px-3 py-1 rounded text-xs font-medium transition-all duration-300"
                  style={{
                    backgroundColor: 'var(--tech-mint)',
                    color: 'var(--bg-deep)'
                  }}
                >
                  {isExpanded ? '折叠' : '展开'}
                </button>
              </div>
            </div>
          </div>

          {/* 右侧：Markdown文本区域 */}
          <div className="bg-black/10 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden relative" style={{ width: '45%', marginRight: '5%' }}>
            <div className="h-full flex flex-col">
              <div className="flex-shrink-0 p-4 border-b border-white/10">
                <h3 className="text-center text-xl font-bold" 
                    style={{ 
                      color: 'var(--ink-high)',
                      fontSize: 'clamp(20px, 3vw, 28px)',
                      letterSpacing: '-0.02em'
                    }}>
                  优化问题的完整分类
                </h3>
              </div>
              <div 
                className={`flex-1 overflow-y-auto overflow-x-hidden p-4 custom-scrollbar ${scrollbarVisible ? 'scrollbar-visible' : ''}`} 
                ref={markdownRef}
              >
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[[rehypeKatex, { displayMode: true }]]}  
                    components={{
                    p: ({node, ...props}) => (
                      <p 
                        {...props} 
                        style={{
                          color: 'var(--ink-mid)',
                          margin: '1rem 0',
                          lineHeight: '1.8'
                        }}
                      />
                    ),
                    h2: ({node, children, ...props}) => {
                      // 从标题文本中提取ID
                      const text = children?.[0];
                      let id = 'root';
                      if (typeof text === 'string' && text.includes('1.3 ')) {
                        id = 'root';
                      }
                      
                      return (
                        <h2 
                          {...props}
                          id={id}
                          style={{
                            color: 'var(--tech-mint)',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            margin: '1.5rem 0 1rem 0',
                            scrollMarginTop: '2rem'
                          }}
                        >
                          {children}
                        </h2>
                      );
                    },
                    h3: ({node, children, ...props}) => {
                      // 从标题文本中提取ID
                      const text = Array.isArray(children) ? children.join('') : children;
                      let id = '';
                      
                      if (typeof text === 'string') {
                        // 先尝试从 {#id} 语法中提取
                        const idMatch = text.match(/\{#([^}]+)\}/);
                        if (idMatch) {
                          id = idMatch[1];
                        } else {
                          // 如果没有 {#id} 语法，根据内容匹配
                          if (text.includes('按决策变量类型')) id = 'decision-variable-type';
                          else if (text.includes('按约束与可行域结构')) id = 'constraint-feasible-region';
                          else if (text.includes('按目标与模型结构')) id = 'objective-model-structure';
                          else if (text.includes('按不确定性与信息结构')) id = 'uncertainty-information';
                          else if (text.includes('按时域与决策流程')) id = 'time-decision-process';
                          else if (text.includes('按目标个数与解的概念')) id = 'objective-count-solution';
                          else if (text.includes('按求解策略与算法范式')) id = 'solving-strategy-algorithm';
                          else if (text.includes('按规模与结构可利用性')) id = 'scale-structure-utility';
                        }
                      }
                      
                      // 清理标题文本，移除 {#id} 部分
                      const cleanText = typeof text === 'string' ? text.replace(/\s*\{#[^}]+\}/g, '') : text;
                      
                      return (
                        <h3 
                          {...props}
                          id={id}
                          style={{
                            color: 'var(--ink-high)',
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            margin: '1.25rem 0 0.75rem 0',
                            scrollMarginTop: '2rem'
                          }}
                        >
                          {cleanText}
                        </h3>
                      );
                    },
                    h4: ({node, children, ...props}) => {
                      // 从标题文本中提取ID
                      const text = Array.isArray(children) ? children.join('') : children;
                      let id = '';
                      
                      if (typeof text === 'string') {
                        // 先尝试从 {#id} 语法中提取
                        const idMatch = text.match(/\{#([^}]+)\}/);
                        if (idMatch) {
                          id = idMatch[1];
                        }
                      }
                      
                      // 清理标题文本，移除 {#id} 部分
                      const cleanText = typeof text === 'string' ? text.replace(/\s*\{#[^}]+\}/g, '') : text;
                      
                      return (
                        <h4 
                          {...props}
                          id={id}
                          style={{
                            color: 'var(--ink-high)',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            margin: '1rem 0 0.5rem 0',
                            scrollMarginTop: '2rem'
                          }}
                        >
                          {cleanText}
                        </h4>
                      );
                    },
                    h5: ({node, children, ...props}) => {
                      // 从标题文本中提取ID
                      const text = Array.isArray(children) ? children.join('') : children;
                      let id = '';
                      
                      if (typeof text === 'string') {
                        // 先尝试从 {#id} 语法中提取
                        const idMatch = text.match(/\{#([^}]+)\}/);
                        if (idMatch) {
                          id = idMatch[1];
                        }
                      }
                      
                      // 清理标题文本，移除 {#id} 部分
                      const cleanText = typeof text === 'string' ? text.replace(/\s*\{#[^}]+\}/g, '') : text;
                      
                      return (
                        <h5 
                          {...props}
                          id={id}
                          style={{
                            color: 'var(--ink-high)',
                            fontSize: '1rem',
                            fontWeight: '600',
                            margin: '0.875rem 0 0.375rem 0',
                            scrollMarginTop: '2rem'
                          }}
                        >
                          {cleanText}
                        </h5>
                      );
                    },
                    strong: ({node, ...props}) => (
                      <strong 
                        {...props} 
                        style={{
                          color: 'var(--ink-high)',
                          fontWeight: '600'
                        }}
                      />
                    ),
                    em: ({node, ...props}) => (
                      <em 
                        {...props} 
                        style={{
                          color: 'var(--tech-mint)',
                          fontStyle: 'italic'
                        }}
                      />
                    ),
                    ul: ({node, ...props}) => (
                      <ul 
                        {...props} 
                        style={{
                          color: 'var(--ink-mid)',
                          margin: '0.75rem 0',
                          paddingLeft: '1.5rem',
                          listStyleType: 'disc'
                        }}
                      />
                    ),
                    ol: ({node, ...props}) => (
                      <ol 
                        {...props} 
                        style={{
                          color: 'var(--ink-mid)',
                          margin: '0.75rem 0',
                          paddingLeft: '1.5rem',
                          listStyleType: 'decimal'
                        }}
                      />
                    ),
                    li: ({node, ...props}) => (
                      <li 
                        {...props} 
                        style={{
                          color: 'var(--ink-mid)',
                          margin: '0.5rem 0',
                          lineHeight: '1.8'
                        }}
                      />
                    ),
                    blockquote: ({node, ...props}) => (
                      <blockquote 
                        {...props} 
                        style={{
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          borderLeft: '4px solid var(--tech-mint)',
                          margin: '1rem 0',
                          padding: '0.75rem 1rem',
                          borderRadius: '0 0.5rem 0.5rem 0',
                          fontStyle: 'italic'
                        }}
                      />
                    ),
                    pre: ({node, ...props}) => (
                      <pre 
                        {...props} 
                        style={{
                          backgroundColor: 'rgba(30, 41, 59, 0.8)',
                          color: 'var(--ink-high)',
                          padding: '1rem',
                          borderRadius: '0.5rem',
                          margin: '1rem 0',
                          overflow: 'auto',
                          fontSize: '0.9em',
                          lineHeight: '1.4'
                        }}
                      />
                    ),
                    a: ({node, href, children, ...props}) => (
                      <a 
                        {...props}
                        href={href}
                        target={href && href.startsWith('http') ? '_blank' : undefined}
                        rel={href && href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        style={{
                          color: 'var(--tech-mint)',
                          textDecoration: 'none',
                          cursor: 'pointer',
                          transition: 'color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#10b981';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--tech-mint)';
                        }}
                      >
                        {children}
                      </a>
                    ),
                    }}
                  >
                    {fullMarkdownContent}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      
      <div className="absolute bottom-0 left-0 right-0 z-50">
        <button
          onClick={() => {
            const target = document.getElementById('concept-3');
            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          className="absolute bottom-8 left-1/2 flex flex-col items-center gap-2 
                     transition-colors duration-300 group"
          style={{
            transform: 'translateX(-50%)',
            color: 'var(--ink-mid)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--tech-mint)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--ink-mid)';
          }}
        >
          <span className="text-sm">向下滚动继续</span>
          <svg 
            className="w-6 h-6 animate-bounce"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      </div>
    </section>
  );
};

export const meta = {
  id: 3,
  title: '分类导图',
  summary: '四主干分类/测绘案例/导航跳转',
  anchor: 'concept-3',
};

export default Section3Mindmap;