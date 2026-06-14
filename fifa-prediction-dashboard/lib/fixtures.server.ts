import fs from 'fs'
import path from 'path'
import { getTeamByName } from './teams'

export interface Fixture {
  id: string
  homeTeamId: number
  awayTeamId: number
  // date is a local Date object (converted from UTC in CSV)
  date: Date
  time: string
  stadium: string
  status: 'upcoming' | 'live' | 'completed'
  homeGoals?: number
  awayGoals?: number
  // keep original names so UI can fallback when team id not found
  homeTeamName?: string
  awayTeamName?: string
}

function parseCSV(text: string) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '')
  const parseLine = (line: string) => {
    const res: string[] = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++ }
        else inQuotes = !inQuotes
      } else if (ch === ',' && !inQuotes) {
        res.push(cur)
        cur = ''
      } else {
        cur += ch
      }
    }
    res.push(cur)
    return res
  }

  const headers = parseLine(lines[0])
  const rows = lines.slice(1).map((ln) => {
    const cols = parseLine(ln)
    const obj: any = {}
    headers.forEach((h, i) => { obj[h] = cols[i] })
    return obj
  })
  return rows
}

function loadFixturesFromCSV(): Fixture[] {
  const csvPath = path.join(process.cwd(), 'data', 'group_fixtures.csv')
  if (!fs.existsSync(csvPath)) return []
  const txt = fs.readFileSync(csvPath, 'utf8')
  const rows = parseCSV(txt)

  const fixtures = rows.map((r: any) => {
    // parse UTC datetime, then convert to local Date for display
    const dtUtc = new Date(r.date_utc)
    const localDt = new Date(dtUtc.toLocaleString())

    const homeName = r.home_team
    const awayName = r.away_team
    const home = getTeamByName(homeName)
    const away = getTeamByName(awayName)

    const time = dtUtc.toISOString().split('T')[1].replace('Z','').slice(0,5) + ' UTC'

    return {
      id: `match-${r.match_id}`,
      homeTeamId: home?.id ?? 0,
      awayTeamId: away?.id ?? 0,
      date: localDt,
      time,
      stadium: r.venue || '',
      status: 'upcoming',
      homeTeamName: homeName,
      awayTeamName: awayName,
    } as Fixture
  })

  return fixtures.sort((a, b) => a.date.getTime() - b.date.getTime())
}

const fixturesCache = loadFixturesFromCSV()

export function getFixtures(): Fixture[] {
  return fixturesCache
}

export function getTodaysFixtures(): Fixture[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return fixturesCache.filter((f) => {
    const d = new Date(f.date)
    d.setHours(0, 0, 0, 0)
    return d.getTime() === today.getTime()
  })
}

export function getUpcomingFixtures(limit?: number): Fixture[] {
  const upcoming = fixturesCache.filter((f) => f.status === 'upcoming')
  return limit ? upcoming.slice(0, limit) : upcoming
}
