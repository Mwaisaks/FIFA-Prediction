import { NextResponse } from 'next/server'
import { teams } from '@/lib/teams'

export async function GET() {
  return NextResponse.json(teams)
}
