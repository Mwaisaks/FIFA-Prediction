import { NextResponse } from 'next/server'
import { predictMatch } from '@/lib/poisson'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { homeTeamId, awayTeamId } = body
    if (typeof homeTeamId !== 'number' || typeof awayTeamId !== 'number') {
      return NextResponse.json({ error: 'homeTeamId and awayTeamId must be numbers' }, { status: 400 })
    }

    const res = predictMatch(homeTeamId, awayTeamId)
    return NextResponse.json(res)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
