'use client'

import { useEffect, useState } from 'react'
import { useReveal } from '@/hooks/useReveal'

interface CounterProps {
  end: number
  label: string
  suffix?: string
}

function Counter({ end, label, suffix = '' }: CounterProps) {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const { ref, isVisible } = useReveal()

  useEffect(() => {
    if (!isVisible) return

    setIsLoading(true)
    let current = 0
    const increment = Math.ceil(end / 50)
    const interval = setInterval(() => {
      current += increment
      if (current >= end) {
        setCount(end)
        setIsLoading(false)
        clearInterval(interval)
      } else {
        setCount(current)
      }
    }, 20)

    return () => clearInterval(interval)
  }, [isVisible, end])

  return (
    <div
      ref={ref}
      className="text-center transition-all duration-500"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      }}
    >
      <div className="font-display text-4xl text-gold sm:text-5xl relative">
        {isLoading && !isVisible ? (
          <div className="inline-block">
            <div className="h-10 w-20 sm:h-12 sm:w-28 bg-gradient-to-r from-gold/20 via-gold/50 to-gold/20 rounded animate-pulse" />
          </div>
        ) : (
          <>
            {count.toLocaleString()}
            {suffix}
          </>
        )}
      </div>
      <div className="mt-2 text-sm text-text-secondary sm:text-base">{label}</div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-pitch-dark to-surface px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-pitch-light via-transparent to-pitch-dark" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="font-display text-4xl tracking-wider text-gold sm:text-5xl md:text-6xl">
            FIFA WORLD CUP
          </h2>
          <p className="mt-4 text-lg text-text-secondary sm:text-xl">
            Live Tournament Tracker & Predictions
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <Counter end={32} label="Teams" />
          <Counter end={64} label="Matches" />
          <Counter end={150} label="Goals Predicted" suffix="+" />
        </div>
      </div>
    </section>
  )
}
