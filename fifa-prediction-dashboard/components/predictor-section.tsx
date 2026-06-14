'use client'

import { useEffect, useState } from 'react'
import { teams } from '@/lib/teams'
import { useReveal } from '@/hooks/useReveal'
import { fetchPrediction } from '@/lib/api'

export function PredictorSection() {
  const { ref, isVisible } = useReveal()
  const [homeTeamId, setHomeTeamId] = useState<number>(1)
  const [awayTeamId, setAwayTeamId] = useState<number>(6)
  const [prediction, setPrediction] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchPrediction(homeTeamId, awayTeamId).then((p) => {
      if (!mounted) return
      setPrediction(p)
      setLoading(false)
    }).catch(() => setLoading(false))
    return () => { mounted = false }
  }, [homeTeamId, awayTeamId])

  const homeTeam = teams.find((t) => t.id === homeTeamId)
  const awayTeam = teams.find((t) => t.id === awayTeamId)

  const homeWin = prediction ? prediction.homeWinProb ?? prediction.hw ?? null : null
  const draw = prediction ? prediction.drawProb ?? prediction.dp ?? null : null
  const awayWin = prediction ? prediction.awayWinProb ?? prediction.aw ?? null : null
  const grid = prediction ? prediction.grid ?? (prediction.score_grid ? Object.entries(prediction.score_grid).map(([k,v])=>({homeGoals: Number(k.split('–')[0]), awayGoals: Number(k.split('–')[1]), probability: v/100})) : []) : []

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
          MATCH PREDICTOR
        </h3>

        <div className="mt-12 rounded-lg border border-border bg-card p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gold mb-2">
                Home Team
              </label>
              <select
                value={homeTeamId}
                onChange={(e) => setHomeTeamId(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-pitch-dark px-4 py-2 text-text-primary focus:border-gold focus:outline-none"
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.flag} {team.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gold mb-2">
                Away Team
              </label>
              <select
                value={awayTeamId}
                onChange={(e) => setAwayTeamId(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-pitch-dark px-4 py-2 text-text-primary focus:border-gold focus:outline-none"
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.flag} {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-pitch-dark p-4 text-center hover:border-gold transition-colors">
              <div className="text-xl font-semibold text-text-primary mb-2">
                {homeTeam?.flag} {homeTeam?.name}
              </div>
              <div className="text-2xl font-bold text-gold">
                {loading || homeWin == null ? '—' : `${(homeWin * 100).toFixed(1)}%`}
              </div>
              <div className="mt-2 text-xs text-text-secondary">Win</div>
            </div>

            <div className="rounded-lg border border-border bg-pitch-dark p-4 text-center hover:border-gold transition-colors">
              <div className="text-xl font-semibold text-text-primary mb-2">
                Draw
              </div>
              <div className="text-2xl font-bold text-gold">
                {loading || draw == null ? '—' : `${(draw * 100).toFixed(1)}%`}
              </div>
              <div className="mt-2 text-xs text-text-secondary">Equal Chance</div>
            </div>

            <div className="rounded-lg border border-border bg-pitch-dark p-4 text-center hover:border-gold transition-colors">
              <div className="text-xl font-semibold text-text-primary mb-2">
                {awayTeam?.flag} {awayTeam?.name}
              </div>
              <div className="text-2xl font-bold text-gold">
                {loading || awayWin == null ? '—' : `${(awayWin * 100).toFixed(1)}%`}
              </div>
              <div className="mt-2 text-xs text-text-secondary">Win</div>
            </div>
          </div>

          <div className="mt-12">
            <h4 className="text-lg font-semibold text-text-primary mb-6">
              Most Likely Outcomes
            </h4>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {grid.slice(0,9).map((outcome: any) => (
                <div
                  key={`${outcome.homeGoals}-${outcome.awayGoals}`}
                  className="rounded-lg border border-border bg-pitch-dark p-3 text-center hover:border-gold transition-colors"
                >
                  <div className="text-lg font-bold text-gold">
                    {outcome.homeGoals}-{outcome.awayGoals}
                  </div>
                  <div className="mt-1 text-xs text-text-secondary">
                    {outcome.probability != null ? `${(outcome.probability * 100).toFixed(1)}%` : '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
