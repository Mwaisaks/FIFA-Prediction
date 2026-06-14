import { NextResponse } from 'next/server'
import { getFixtures } from '@/lib/fixtures.server'

function serializeFixtures(fixtures: any[]) {
  return fixtures.map((f) => ({
    ...f,
    date: f.date instanceof Date ? f.date.toISOString() : new Date(f.date).toISOString(),
  }))
}

export async function GET() {
  const fixtures = getFixtures()
  return NextResponse.json(serializeFixtures(fixtures))
}
