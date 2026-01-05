import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const friends = await prisma.friend.findMany({
      where: { userId: user.id },
      orderBy: { birthday: 'asc' },
    })

    return NextResponse.json(friends)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Error fetching friends:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const { name, email, birthday, timezone, reminderDaysOverride, notes } = await request.json()

    if (!name || !birthday) {
      return NextResponse.json(
        { error: 'Name and birthday are required' },
        { status: 400 }
      )
    }

    // Validate birthday format
    const birthdayDate = new Date(birthday)
    if (isNaN(birthdayDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid birthday format' },
        { status: 400 }
      )
    }

    const friend = await prisma.friend.create({
      data: {
        userId: user.id,
        name,
        email,
        birthday: birthdayDate,
        timezone: timezone || 'UTC',
        reminderDaysOverride,
        notes,
      },
    })

    return NextResponse.json(friend, { status: 201 })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Error creating friend:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
