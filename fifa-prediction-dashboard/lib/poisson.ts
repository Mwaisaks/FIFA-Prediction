import { teams } from './teams'

function factorial(n: number): number {
  if (n === 0 || n === 1) return 1
  let result = 1
  for (let i = 2; i <= n; i++) {
    result *= i
  }
  return result
}

function poissonPMF(lambda: number, k: number): number {
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k)
}

export interface MatchPrediction {
  homeTeamId: number
  awayTeamId: number
  homeWinProb: number
  drawProb: number
  awayWinProb: number
  grid: GridProbability[]
}

export interface GridProbability {
  homeGoals: number
  awayGoals: number
  probability: number
}

export function predictMatch(homeTeamId: number, awayTeamId: number): MatchPrediction {
  const homeTeam = teams.find((t) => t.id === homeTeamId)
  const awayTeam = teams.find((t) => t.id === awayTeamId)

  if (!homeTeam || !awayTeam) {
    throw new Error('Team not found')
  }

  const homeStrength = homeTeam.strength / 100
  const awayStrength = awayTeam.strength / 100

  const homeLambda = homeStrength * 2.5 * (1 + (homeStrength - awayStrength) * 0.5)
  const awayLambda = awayStrength * 2.5 * (1 - (homeStrength - awayStrength) * 0.5)

  const grid: GridProbability[] = []
  let homeWinProb = 0
  let drawProb = 0
  let awayWinProb = 0

  for (let h = 0; h <= 8; h++) {
    for (let a = 0; a <= 8; a++) {
      const prob = poissonPMF(homeLambda, h) * poissonPMF(awayLambda, a)
      grid.push({
        homeGoals: h,
        awayGoals: a,
        probability: prob,
      })

      if (h > a) {
        homeWinProb += prob
      } else if (h === a) {
        drawProb += prob
      } else {
        awayWinProb += prob
      }
    }
  }

  return {
    homeTeamId,
    awayTeamId,
    homeWinProb: Math.min(homeWinProb, 1),
    drawProb: Math.min(drawProb, 1),
    awayWinProb: Math.min(awayWinProb, 1),
    grid: grid.sort((a, b) => b.probability - a.probability).slice(0, 9),
  }
}
