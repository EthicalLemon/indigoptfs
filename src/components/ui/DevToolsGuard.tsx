'use client'
import { useEffect, useState } from 'react'

export function DevToolsGuard() {
  const [devOpen, setDevOpen] = useState(false)

  useEffect(() => {
    let count = 0
    const threshold = 160

    // Method 1: Window size detection
    const checkSize = () => {
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        setDevOpen(true)
        spamConsole()
      } else {
        setDevOpen(false)
      }
    }

    // Method 2: Debugger timing trick
    const debuggerCheck = () => {
      const start = performance.now()
      // eslint-disable-next-line no-debugger
      debugger
      const end = performance.now()
      if (end - start > 100) {
        setDevOpen(true)
        spamConsole()
      }
    }

    // Method 3: Console count trick
    let devToolsOpen = false
    const element = new Image()
    Object.defineProperty(element, 'id', {
      get: function () {
        devToolsOpen = true
        setDevOpen(true)
        spamConsole()
        return 'indigo-guard'
      }
    })

    const spamConsole = () => {
      const msgs = [
        '%c👀 Nice try buddy!',
        '%c🔍 Looking for secrets?',
        '%c✈️ IndiGo Airlines is watching...',
        '%c🛡️ This console is monitored',
        '%c⚠️ Unauthorized access detected!',
      ]
      const styles = 'color: #6366f1; font-size: 20px; font-weight: bold; text-shadow: 0 0 10px #6366f1;'
      msgs.forEach((m, i) => setTimeout(() => console.log(m, styles), i * 300))
    }

    // Clear and setup spam interval
    const spamInterval = setInterval(() => {
      if (devToolsOpen || window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
        console.clear()
        console.log('%c👀 Nice try buddy!', 'color: #6366f1; font-size: 24px; font-weight: bold;')
        console.log('%c✈️ IndiGo Airlines Security System Active', 'color: #fbbf24; font-size: 16px;')
        console.log('%c🛡️ All console activity is logged', 'color: #f87171; font-size: 14px;')
      }
    }, 1000)

    window.addEventListener('resize', checkSize)
    checkSize()

    // Print logo in console
    console.log('%c ✈ NOVA AIRLINES ', 'background: linear-gradient(135deg, #1d2fb5, #6366f1); color: white; font-size: 18px; padding: 10px 20px; border-radius: 8px; font-weight: bold;')
    console.log('%cWelcome to IndiGo Airlines! 🌐', 'color: #6366f1; font-size: 14px;')

    return () => {
      window.removeEventListener('resize', checkSize)
      clearInterval(spamInterval)
    }
  }, [])

  if (!devOpen) return null

  return (
    <div id="devtools-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.97)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
      <div style={{ fontSize: '80px', animation: 'spin 2s linear infinite' }}>✈️</div>
      <h1 style={{ color: '#6366f1', fontFamily: 'JetBrains Mono, monospace', fontSize: '32px', fontWeight: 'bold' }}>
        👀 Nice try buddy!
      </h1>
      <p style={{ color: '#b8b4ac', fontFamily: 'DM Sans, sans-serif', fontSize: '16px', textAlign: 'center', maxWidth: '400px', lineHeight: '1.6' }}>
        DevTools detected. IndiGo Airlines security system is active.<br />
        <span style={{ color: '#6366f1' }}>Close DevTools to continue.</span>
      </p>
      <div style={{ padding: '12px 32px', background: 'linear-gradient(135deg, #1d2fb5, #6366f1)', borderRadius: '10px', color: 'white', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', cursor: 'pointer' }}
        onClick={() => window.location.reload()}>
        🔄 Close DevTools & Refresh
      </div>
    </div>
  )
}
