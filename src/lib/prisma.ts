import { PrismaClient } from '@prisma/client'

// Load environment variables
import 'dotenv/config'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure DATABASE_URL is loaded and log it for debugging
const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  console.error('DATABASE_URL environment variable is not set')
  throw new Error('DATABASE_URL environment variable is not set')
}

console.log('Prisma: Database URL loaded, length:', dbUrl.length)

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
