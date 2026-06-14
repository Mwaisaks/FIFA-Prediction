'use client'

import { useEffect, useState } from 'react'
import { getTeamById } from '@/lib/teams'
import { useReveal } from '@/hooks/useReveal'
import { fetchFixtures } from '@/lib/api'

export function FixturesSection() {
  const { ref, isVisible } = useReveal()
  const [fixtures, setFixtures] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    fetchFixtures().then((data) => {
      if (!mounted) return
      // ensure dates are Date objects
      const parsed = data.map((f: any) => ({ ...f, date: new Date(f.date) }))
      setFixtures(parsed.slice(0, 4))
    })
    return () => { mounted = false }
  }, [])

  return (
    <section
      ref={ref}
      className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'all 0.6s ease-out',
      }}
    >
      <div className="mx-auto max-w-7xl">
        <h3 className="font-display text-3xl tracking-wider text-gold sm:text-4xl">
          UPCOMING MATCHES
        </h3>
        <div className="mt-12 flex flex-col gap-4">
          {fixtures.map((fixture) => {
            const homeTeam = getTeamById(fixture.homeTeamId)
            const awayTeam = getTeamById(fixture.awayTeamId)

            if (!homeTeam || !awayTeam) return null

            return (
              <div
                key={fixture.id}
                className="rounded-lg border border-border bg-card/95 p-6 hover:border-gold hover:shadow-lg hover:shadow-gold/20 transition-all max-w-md"
              >
                <div className="text-xs text-text-secondary mb-2">
                  {fixture.date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  • {fixture.time}
                </div>

                <div className="flex items-center justify-between gap-2 py-4">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-2xl">{homeTeam.flag}</span>
                    <span className="text-sm font-semibold text-text-primary">
                      {homeTeam.name}
                    </span>
                  </div>

                  <div className="text-text-secondary font-display text-xl tracking-wide">
                    vs
                  </div>

                  <div className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-2xl">{awayTeam.flag}</span>
                    <span className="text-sm font-semibold text-text-primary">
                      {awayTeam.name}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border pt-2 text-xs text-text-secondary">
                  {fixture.stadium}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
