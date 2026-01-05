'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Friend {
  id: string
  name: string
  email?: string
  birthday: string
  timezone: string
  reminderDaysOverride?: number
  notes?: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Friend[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchFriends()
    }
  }, [session])

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends')
      if (response.ok) {
        const data = await response.json()
        setFriends(data)
        calculateUpcomingBirthdays(data)
      }
    } catch (error) {
      console.error('Error fetching friends:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateUpcomingBirthdays = (friendsList: Friend[]) => {
    const today = new Date()
    const upcoming: Friend[] = []

    friendsList.forEach(friend => {
      const birthday = new Date(friend.birthday)
      const currentYear = today.getFullYear()
      let nextBirthday = new Date(currentYear, birthday.getMonth(), birthday.getDate())

      if (nextBirthday < today) {
        nextBirthday.setFullYear(currentYear + 1)
      }

      const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntil <= 30) { // Show birthdays within next 30 days
        upcoming.push(friend)
      }
    })

    // Sort by upcoming birthday
    upcoming.sort((a, b) => {
      const aBirthday = new Date(a.birthday)
      const bBirthday = new Date(b.birthday)
      const today = new Date()

      const aNext = new Date(today.getFullYear(), aBirthday.getMonth(), aBirthday.getDate())
      const bNext = new Date(today.getFullYear(), bBirthday.getMonth(), bBirthday.getDate())

      if (aNext < today) aNext.setFullYear(today.getFullYear() + 1)
      if (bNext < today) bNext.setFullYear(today.getFullYear() + 1)

      return aNext.getTime() - bNext.getTime()
    })

    setUpcomingBirthdays(upcoming)
  }

  const formatBirthday = (birthday: string) => {
    const date = new Date(birthday)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    })
  }

  const getDaysUntilBirthday = (birthday: string) => {
    const today = new Date()
    const birthdayDate = new Date(birthday)
    const currentYear = today.getFullYear()
    let nextBirthday = new Date(currentYear, birthdayDate.getMonth(), birthdayDate.getDate())

    if (nextBirthday < today) {
      nextBirthday.setFullYear(currentYear + 1)
    }

    const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntil
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="birthday-icon"></div>
            <h1 className="text-xl font-light">Birthday Reminder</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/dashboard/friends" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Manage Friends
            </Link>
            <Link href="/dashboard/settings" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-light mb-2">Welcome back, {session.user?.name || 'User'}!</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Here are the upcoming birthdays you need to remember.
          </p>
        </div>

        {upcomingBirthdays.length === 0 ? (
          <div className="text-center py-12">
            <div className="birthday-icon mx-auto mb-4 opacity-50"></div>
            <h3 className="text-xl font-light mb-2">No upcoming birthdays</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add some friends to start getting birthday reminders.
            </p>
            <Link href="/dashboard/friends" className="btn-primary">
              Add Friends
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingBirthdays.map((friend) => {
              const daysUntil = getDaysUntilBirthday(friend.birthday)
              return (
                <div key={friend.id} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium">{friend.name}</h3>
                    <div className="birthday-icon"></div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>Birthday: {formatBirthday(friend.birthday)}</p>
                    {daysUntil === 0 ? (
                      <p className="text-red-600 dark:text-red-400 font-medium">🎂 Today!</p>
                    ) : (
                      <p>In {daysUntil} day{daysUntil !== 1 ? 's' : ''}</p>
                    )}
                    {friend.email && <p>Email: {friend.email}</p>}
                  </div>

                  {friend.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{friend.notes}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/dashboard/friends" className="btn-secondary">
            Manage All Friends ({friends.length})
          </Link>
        </div>
      </main>
    </div>
  )
}
