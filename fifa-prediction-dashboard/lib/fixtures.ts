export interface Fixture {
  id: string
  homeTeamId: number
  awayTeamId: number
  date: Date
  time: string
  stadium: string
  status: 'upcoming' | 'live' | 'completed'
  homeGoals?: number
  awayGoals?: number
}

const fixtures: Fixture[] = [
  {
    id: 'match-1',
    homeTeamId: 1,
    awayTeamId: 6,
    date: new Date('2024-12-14'),
    time: '14:00 UTC',
    stadium: 'Lusail Stadium',
    status: 'upcoming',
  },
  {
    id: 'match-2',
    homeTeamId: 2,
    awayTeamId: 4,
    date: new Date('2024-12-14'),
    time: '18:00 UTC',
    stadium: 'Al Bayt Stadium',
    status: 'upcoming',
  },
  {
    id: 'match-3',
    homeTeamId: 3,
    awayTeamId: 5,
    date: new Date('2024-12-15'),
    time: '14:00 UTC',
    stadium: 'Khalifa International',
    status: 'upcoming',
  },
  {
    id: 'match-4',
    homeTeamId: 8,
    awayTeamId: 9,
    date: new Date('2024-12-15'),
    time: '18:00 UTC',
    stadium: 'Stadium 974',
    status: 'upcoming',
  },
  {
    id: 'match-5',
    homeTeamId: 7,
    awayTeamId: 10,
    date: new Date('2024-12-16'),
    time: '14:00 UTC',
    stadium: 'Ras Abu Aboud',
    status: 'upcoming',
  },
  {
    id: 'match-6',
    homeTeamId: 11,
    awayTeamId: 12,
    date: new Date('2024-12-16'),
    time: '18:00 UTC',
    stadium: 'Doha Port Stadium',
    status: 'upcoming',
  },
  {
    id: 'match-7',
    homeTeamId: 13,
    awayTeamId: 14,
    date: new Date('2024-12-17'),
    time: '14:00 UTC',
    stadium: 'Al Janoub Stadium',
    status: 'upcoming',
  },
  {
    id: 'match-8',
    homeTeamId: 15,
    awayTeamId: 16,
    date: new Date('2024-12-17'),
    time: '18:00 UTC',
    stadium: 'Thani Bin Jassim',
    status: 'upcoming',
  },
]

export function getFixtures(): Fixture[] {
  return fixtures.sort((a, b) => a.date.getTime() - b.date.getTime())
}

export function getTodaysFixtures(): Fixture[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return fixtures.filter((fixture) => {
    const fixtureDate = new Date(fixture.date)
    fixtureDate.setHours(0, 0, 0, 0)
    return fixtureDate.getTime() === today.getTime()
  })
}

export function getUpcomingFixtures(limit?: number): Fixture[] {
  const upcoming = fixtures
    .filter((f) => f.status === 'upcoming')
    .sort((a, b) => a.date.getTime() - b.date.getTime())
  
  return limit ? upcoming.slice(0, limit) : upcoming
}
