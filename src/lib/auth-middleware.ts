import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth-config'
import { prisma } from './prisma'

export async function getCurrentUser(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  return user
}

export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser(request)

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

export async function requireOwnership(resourceUserId: string, currentUserId: string) {
  if (resourceUserId !== currentUserId) {
    throw new Error('Forbidden')
  }
}
