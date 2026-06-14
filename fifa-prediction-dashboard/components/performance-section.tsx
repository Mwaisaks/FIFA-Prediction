'use client'

import { useEffect, useState } from 'react'
import { useReveal } from '@/hooks/useReveal'

interface StatCardProps {
  title: string
  value: string
  description: string
}

function StatCard({ title, value, description }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isLoading, setIsLoading] = useState(true)
  const { ref, isVisible } = useReveal()

  useEffect(() => {
    if (!isVisible) return

    setIsLoading(true)
    const timer = setTimeout(() => {
      setDisplayValue(value)
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [isVisible, value])

  return (
    <div
      ref={ref}
      className="rounded-lg border border-border bg-card p-6 hover:border-gold transition-colors"
      style={{
        opacity: isVisible ? 1 : 0.5,
        transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'all 0.5s ease-out',
      }}
    >
      <h4 className="font-display text-xl text-gold tracking-wide">{title}</h4>
      <div className="mt-4 text-3xl font-bold text-text-primary sm:text-4xl h-10">
        {isLoading ? (
          <div className="h-9 w-24 bg-gradient-to-r from-gold/20 via-gold/50 to-gold/20 rounded animate-pulse" />
        ) : (
          displayValue
        )}
      </div>
      <p className="mt-2 text-sm text-text-secondary">{description}</p>
    </div>
  )
}

export function PerformanceSection() {
  const { ref, isVisible } = useReveal()

  return (
    <section
      ref={ref}
      className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'all 0.6s ease-out',
      }}
    >
      <div className="mx-auto max-w-7xl">
        <h3 className="font-display text-3xl tracking-wider text-gold sm:text-4xl">
          TOURNAMENT STATS
        </h3>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Matches"
            value="64"
            description="Games across all stages"
          />
          <StatCard
            title="Avg Goals/Match"
            value="2.8"
            description="Based on historical data"
          />
          <StatCard
            title="Prediction Accuracy"
            value="68%"
            description="Poisson model validation"
          />
          <StatCard
            title="Teams Competing"
            value="32"
            description="From all continents"
          />
        </div>
      </div>
    </section>
  )
}
