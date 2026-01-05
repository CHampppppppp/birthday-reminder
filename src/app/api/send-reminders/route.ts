import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendBirthdayReminder } from '@/lib/mailer'
import { getUpcomingBirthdays, getDaysUntilBirthday } from '@/lib/date-utils'

// Verify webhook secret or Vercel cron
function verifyWebhookSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const expectedSecret = process.env.REMINDER_WEBHOOK_SECRET

  // Check for Vercel cron header (Vercel adds this for scheduled functions)
  const vercelCronHeader = request.headers.get('x-vercel-cron')

  if (vercelCronHeader) {
    // Additional verification can be added here if needed
    return true
  }

  // Check for manual webhook calls with Bearer token
  if (!expectedSecret) {
    console.error('REMINDER_WEBHOOK_SECRET not configured')
    return false
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }

  const providedSecret = authHeader.substring(7) // Remove 'Bearer ' prefix
  return providedSecret === expectedSecret
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    if (!verifyWebhookSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentDate = new Date()
    console.log(`Starting birthday reminder check for ${currentDate.toISOString()}`)

    // Get all users and their friends
    const users = await prisma.user.findMany({
      include: {
        friends: true,
      },
    })

    let totalRemindersSent = 0
    let errors: string[] = []

    for (const user of users) {
      for (const friend of user.friends) {
        try {
          // Determine reminder days (use override if set, otherwise use user default)
          const reminderDays = friend.reminderDaysOverride ?? user.reminderDefaultDays

          // Get upcoming reminder dates
          const reminderDates = getUpcomingBirthdays(
            friend.birthday,
            currentDate,
            reminderDays
          )

          // Check if we need to send a reminder today
          const shouldSendToday = reminderDates.some(date =>
            date.toDateString() === currentDate.toDateString()
          )

          if (!shouldSendToday) {
            continue
          }

          // Check if we've already sent a reminder for this date
          const existingLog = await prisma.reminderLog.findUnique({
            where: {
              userId_friendId_remindForDate: {
                userId: user.id,
                friendId: friend.id,
                remindForDate: friend.birthday,
              },
            },
          })

          if (existingLog) {
            console.log(`Reminder already sent for ${friend.name}'s birthday to ${user.email}`)
            continue
          }

          // Calculate days until birthday
          const daysUntil = getDaysUntilBirthday(friend.birthday, currentDate)

          // Send reminder email
          const success = await sendBirthdayReminder({
            friendName: friend.name,
            birthday: friend.birthday,
            daysUntil,
            userName: user.name || user.email,
            userEmail: user.email,
          })

          if (success) {
            // Log the sent reminder
            await prisma.reminderLog.create({
              data: {
                userId: user.id,
                friendId: friend.id,
                remindForDate: friend.birthday,
                status: 'sent',
              },
            })

            totalRemindersSent++
            console.log(`Sent birthday reminder for ${friend.name} to ${user.email}`)
          } else {
            // Log failed attempt
            await prisma.reminderLog.create({
              data: {
                userId: user.id,
                friendId: friend.id,
                remindForDate: friend.birthday,
                status: 'failed',
                errorMessage: 'Email sending failed',
              },
            })

            errors.push(`Failed to send reminder for ${friend.name} to ${user.email}`)
          }
        } catch (error) {
          console.error(`Error processing reminder for friend ${friend.id}:`, error)
          errors.push(`Error processing friend ${friend.id}: ${error}`)
        }
      }
    }

    return NextResponse.json({
      message: 'Birthday reminders processed',
      totalRemindersSent,
      errors,
      timestamp: currentDate.toISOString(),
    })
  } catch (error) {
    console.error('Error in send-reminders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
