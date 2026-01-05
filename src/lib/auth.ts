import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(email: string, password?: string, name?: string) {
  const hashedPassword = password ? await hashPassword(password) : null

  return prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      name: name || email.split('@')[0], // Default name from email prefix
    },
  })
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}

export async function findOrCreateUserByEmail(email: string, name?: string) {
  let user = await findUserByEmail(email)

  if (!user) {
    user = await createUser(email, undefined, name)
  }

  return user
}
