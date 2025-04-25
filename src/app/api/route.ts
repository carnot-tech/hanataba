import { db } from '@/db/drizzle'
import { NextResponse } from 'next/server'

export async function GET() { 
  const users = await db.query.usersTable.findMany();
  return NextResponse.json({ users }, { status: 200 })
}