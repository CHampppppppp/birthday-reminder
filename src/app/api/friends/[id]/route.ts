import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireOwnership } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params

    const friend = await prisma.friend.findUnique({
      where: { id },
    })

    if (!friend) {
      return NextResponse.json({ error: 'Friend not found' }, { status: 404 })
    }

    // Check ownership
    requireOwnership(friend.userId, user.id)

    return NextResponse.json(friend)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.error('Error fetching friend:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params

    // Check if friend exists and user owns it
    const existingFriend = await prisma.friend.findUnique({
      where: { id },
    })

    if (!existingFriend) {
      return NextResponse.json({ error: 'Friend not found' }, { status: 404 })
    }

    requireOwnership(existingFriend.userId, user.id)

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

    const updatedFriend = await prisma.friend.update({
      where: { id },
      data: {
        name,
        email,
        birthday: birthdayDate,
        timezone: timezone || 'UTC',
        reminderDaysOverride,
        notes,
      },
    })

    return NextResponse.json(updatedFriend)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.error('Error updating friend:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id } = await params

    // Check if friend exists and user owns it
    const existingFriend = await prisma.friend.findUnique({
      where: { id },
    })

    if (!existingFriend) {
      return NextResponse.json({ error: 'Friend not found' }, { status: 404 })
    }

    requireOwnership(existingFriend.userId, user.id)

    await prisma.friend.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Friend deleted successfully' })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.error('Error deleting friend:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
