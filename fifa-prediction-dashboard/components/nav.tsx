'use client'

import { useEffect, useState } from 'react'

export function Nav() {
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const utcTime = now.toLocaleString('en-US', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      setTime(utcTime)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-pitch-dark/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="text-2xl">⚽</div>
          <h1 className="font-display text-xl tracking-wider text-gold sm:text-2xl">
            WORLD CUP
          </h1>
        </div>
        <div className="text-sm font-mono text-text-secondary">
          UTC: {time || '--:--:--'}
        </div>
      </div>
    </nav>
  )
}
