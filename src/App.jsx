import React, { useEffect, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import NavBar from './components/NavBar'
import HomePage from './components/home/HomePage'
import ConceptPage from './components/concept/ConceptPage'
import EcosystemPage from './components/ecosystem/EcosystemPage'
import WorkflowPage from './components/workflow/WorkflowPage'
import MethodHub from './components/methods/MethodHub'
import MethodCard from './components/methods/MethodCard'
import CasePage from './components/case/CasePage'
import FuturePage from './components/future/FuturePage'

gsap.registerPlugin(ScrollTrigger)

function App() {
  const location = useLocation()
  const appRef = useRef(null)

  useEffect(() => {
    ScrollTrigger.refresh()
  }, [location.pathname])

  return (
    <div ref={appRef} className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/concept" element={<ConceptPage />} />
          <Route path="/ecosystem" element={<EcosystemPage />} />
          <Route path="/workflow" element={<WorkflowPage />} />
          <Route path="/case" element={<CasePage />} />
          <Route path="/future" element={<FuturePage />} />
          <Route path="/methods" element={<MethodHub />} />
          <Route path="/method/:methodId" element={<MethodCard />} />
        </Routes>
      </main>
    </div>
  )
}

export default App