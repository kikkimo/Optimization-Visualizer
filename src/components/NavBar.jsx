import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollToPlugin)

const NavBar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeSection, setActiveSection] = useState('home')
  const [isScrolled, setIsScrolled] = useState(false)

  const navItems = [
    { id: 'home', label: '首页', href: '/' },
    { id: 'concept', label: '概念', href: '/concept' },
    { id: 'static', label: '静态', href: '/static' },
    { id: 'ecosystem', label: '生态', href: '/ecosystem' },
    { id: 'methods', label: '方法', href: '/methods' },
    { id: 'case', label: '案例', href: '/case' },
    { id: 'future', label: '趋势', href: '/future' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 50)
    }

    // 根据当前路径设置活动状态
    const setActiveByPath = () => {
      if (location.pathname === '/') {
        setActiveSection('home')
      } else if (location.pathname === '/concept') {
        setActiveSection('concept')
      } else if (location.pathname === '/ecosystem') {
        setActiveSection('ecosystem')
      } else if (location.pathname === '/static') {
        setActiveSection('static')
      } else if (location.pathname === '/methods') {
        setActiveSection('methods')
      } else if (location.pathname.startsWith('/method/')) {
        setActiveSection('methods')
      } else if (location.pathname === '/case') {
        setActiveSection('case')
      } else if (location.pathname === '/future') {
        setActiveSection('future')
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    setActiveByPath()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [location.pathname])

  const handleNavClick = (item) => {
    if (item.id === 'home') {
      // 特殊处理首页导航
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          window.location.hash = '#section-0';
        }, 100);
      } else {
        window.location.hash = '#section-0';
      }
    } else {
      navigate(item.href);
    }
    setActiveSection(item.id);
  }

  const scrollToTop = () => {
    if (location.pathname !== '/') {
      navigate('/')
      // 延迟执行滚动确保页面已切换
      setTimeout(() => {
        window.location.hash = '#section-0';
        gsap.to(window, { duration: 1.5, scrollTo: 0, ease: "power2.out" });
      }, 100);
    } else {
      // 在首页时直接滚动到第一个section
      window.location.hash = '#section-0';
      gsap.to(window, { duration: 1.5, scrollTo: 0, ease: "power2.out" });
    }
    setActiveSection('home');
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass-effect shadow-xl' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-16">
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeSection === item.id
                    ? 'text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                style={activeSection === item.id ? {
                  background: 'var(--tech-mint)',
                  boxShadow: '0 4px 14px 0 rgba(60, 230, 192, 0.3)'
                } : {}}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="absolute right-4">
            <button
              onClick={scrollToTop}
              className={`p-2 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 ${
                isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
              style={{
                background: 'linear-gradient(135deg, var(--tech-mint), var(--amber-signal))',
                boxShadow: '0 4px 14px 0 rgba(60, 230, 192, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-glow-mint)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(60, 230, 192, 0.3)';
              }}
              title="回到顶部"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden px-4 pb-2">
        <div className="flex flex-wrap gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                activeSection === item.id
                  ? 'text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
              style={activeSection === item.id ? {
                background: 'var(--tech-mint)'
              } : {}}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default NavBar