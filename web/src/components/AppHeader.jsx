import { useEffect, useRef } from 'react'
import { BrandMark, Icon } from './Icon.jsx'

function ServiceStatus({ status }) {
  const label = status === 'connected' ? 'Service ready' : status === 'offline' ? 'Service offline' : 'Checking service'
  return <span className={`service-status service-status--${status}`} role="status">{label}</span>
}

export default function AppHeader({ currentView, hasAnalysis, menuOpen, onMenuToggle, onNavigate, serviceStatus }) {
  const headerRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return undefined
    const closeMenu = (event) => {
      if (event.type === 'keydown' && event.key !== 'Escape') return
      if (event.type === 'pointerdown' && headerRef.current?.contains(event.target)) return
      onMenuToggle()
    }
    document.addEventListener('keydown', closeMenu)
    document.addEventListener('pointerdown', closeMenu)
    return () => {
      document.removeEventListener('keydown', closeMenu)
      document.removeEventListener('pointerdown', closeMenu)
    }
  }, [menuOpen, onMenuToggle])

  const navigate = (view) => {
    onNavigate(view)
    if (menuOpen) onMenuToggle()
  }

  return (
    <header className="app-header" ref={headerRef}>
      <div className="app-header__inner">
        <a className="brand" href="#app-content" aria-label="Resume Lens home">
          <BrandMark />
          <span>Resume Lens</span>
        </a>
        <nav className="desktop-nav" aria-label="Application">
          <button type="button" className={currentView === 'analyze' ? 'header-link header-link--active' : 'header-link'} onClick={() => navigate('analyze')} aria-current={currentView === 'analyze' ? 'page' : undefined}>Analyze</button>
          <button type="button" className={currentView === 'results' ? 'header-link header-link--active' : 'header-link'} onClick={() => navigate('results')} disabled={!hasAnalysis} aria-current={currentView === 'results' ? 'page' : undefined}>Results</button>
        </nav>
        <div className="app-header__status"><ServiceStatus status={serviceStatus} /></div>
        <button className="menu-button" type="button" onClick={onMenuToggle} aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}>
          <Icon name={menuOpen ? 'close' : 'menu'} size={24} />
        </button>
      </div>
      {menuOpen ? (
        <nav className="mobile-menu" id="mobile-menu" aria-label="Mobile application">
          <button type="button" onClick={() => navigate('analyze')} aria-current={currentView === 'analyze' ? 'page' : undefined}>Analyze</button>
          <button type="button" onClick={() => navigate('results')} disabled={!hasAnalysis} aria-current={currentView === 'results' ? 'page' : undefined}>Results</button>
          <ServiceStatus status={serviceStatus} />
        </nav>
      ) : null}
    </header>
  )
}
