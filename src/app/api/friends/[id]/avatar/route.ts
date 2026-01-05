import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireOwnership } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { uploadToR2, generateAvatarKey } from '@/lib/r2-client'
import sharp from 'sharp'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id: friendId } = await params

    // Check if friend exists and user owns it
    const existingFriend = await prisma.friend.findUnique({
      where: { id: friendId },
    })

    if (!existingFriend) {
      return NextResponse.json({ error: 'Friend not found' }, { status: 404 })
    }

    requireOwnership(existingFriend.userId, user.id)

    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Process image with Sharp (resize and compress)
    const processedImage = await sharp(buffer)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer()

    // Generate unique filename
    const avatarKey = generateAvatarKey(user.id, 'friend', friendId)

    // Upload to R2
    const avatarUrl = await uploadToR2(processedImage, avatarKey, 'image/jpeg')

    // Update friend in database
    const updatedFriend = await prisma.friend.update({
      where: { id: friendId },
      data: { image: avatarUrl },
      select: { id: true, image: true }
    })

    return NextResponse.json({
      success: true,
      avatarUrl: updatedFriend.image
    })

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.error('Friend avatar upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id: friendId } = await params

    // Check if friend exists and user owns it
    const existingFriend = await prisma.friend.findUnique({
      where: { id: friendId },
    })

    if (!existingFriend) {
      return NextResponse.json({ error: 'Friend not found' }, { status: 404 })
    }

    requireOwnership(existingFriend.userId, user.id)

    // Remove avatar URL from database
    await prisma.friend.update({
      where: { id: friendId },
      data: { image: null },
    })

    return NextResponse.json({
      success: true,
      message: 'Avatar removed successfully'
    })

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.error('Friend avatar delete error:', error)
    return NextResponse.json(
      { error: 'Failed to remove avatar' },
      { status: 500 }
    )
  }
}
