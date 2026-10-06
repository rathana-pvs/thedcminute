'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function VisitorCounter() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Setup global queue
    window._wau = window._wau || []
    window._wau.push(['dynamic', '2xx5m06lml', 's45', 'c4302bffffff', 'small'])

    // 2. Ensure config script exists with exact ID required by whos.amung.us
    if (!document.getElementById('_waus45')) {
      const configScript = document.createElement('script')
      configScript.id = '_waus45'
      configScript.innerHTML = 'var _wau = _wau || []; _wau.push(["dynamic", "2xx5m06lml", "s45", "c4302bffffff", "small"]);'
      document.body.appendChild(configScript)
    }

    // 3. Ensure waust.at/d.js script is loaded
    if (!document.getElementById('_wau_d_js')) {
      const dScript = document.createElement('script')
      dScript.id = '_wau_d_js'
      dScript.async = true
      dScript.src = '//waust.at/d.js'
      document.body.appendChild(dScript)
    }

    // 4. Clear localStorage cache so whos.amung.us doesn't stick to the homepage title
    try {
      localStorage.removeItem('_wautime')
      localStorage.removeItem('_waucount')
    } catch (e) {}

    // 5. Send ping to whos.amung.us with accurate article headline and URL after render
    const timeoutId = setTimeout(() => {
      // Prioritize the actual article <h1> headline, then document.title
      const h1Text = document.querySelector('h1')?.textContent?.trim()
      const rawTitle = h1Text || document.title || 'thedcminute'
      const cleanTitle = rawTitle.replace(/\s*—\s*thedcminute.*$/i, '').trim()
      
      const pageTitle = encodeURIComponent(cleanTitle.substr(0, 80).replace(/(\?=)|(\/)/g, ''))
      const pageUrl = encodeURIComponent(window.location.href)
      const referrer = encodeURIComponent(document.referrer || '')
      const randomId = Math.ceil(99999 * Math.random())

      const pingScript = document.createElement('script')
      pingScript.id = `_wau_ping_${Date.now()}`
      pingScript.async = true
      pingScript.src = `https://whos.amung.us/pingjs/?k=2xx5m06lml&t=${pageTitle}&c=d&x=${pageUrl}&y=${referrer}&a=-1&v=27&r=${randomId}`
      document.head.appendChild(pingScript)
    }, 250)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [pathname])

  return (
    <div
      id="wau-container-hidden"
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
        opacity: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}

declare global {
  interface Window {
    _wau?: any[]
  }
}

