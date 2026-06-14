export async function fetchTeams() {
  try {
    const res = await fetch('/api/teams')
    if (!res.ok) throw new Error('Network error')
    return res.json()
  } catch (e) {
    // fallback to local import to keep app working
    const mod = await import('./teams')
    return mod.teams
  }
}

export async function fetchFixtures() {
  try {
    const res = await fetch('/api/fixtures')
    if (!res.ok) throw new Error('Network error')
    return res.json()
  } catch (e) {
    const mod = await import('./fixtures')
    return mod.getUpcomingFixtures(10).map((f: any) => ({ ...f, date: f.date.toISOString() }))
  }
}

export async function fetchPrediction(homeTeamId: number, awayTeamId: number) {
  try {
    const res = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ homeTeamId, awayTeamId }),
    })
    if (!res.ok) throw new Error('Network error')
    return res.json()
  } catch (e) {
    const mod = await import('./poisson')
    return mod.predictMatch(homeTeamId, awayTeamId)
  }
}
