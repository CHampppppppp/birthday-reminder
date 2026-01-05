'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { PageTransition, FadeIn, SlideIn } from '@/components/PageTransition'
import { BirthdayDecorations } from '@/components/BirthdayDecorations'
import { AnimatedCard, AnimatedButton } from '@/components/AnimatedComponents'
import { showToast } from '@/components/ToastProvider'

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
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <BirthdayDecorations className="opacity-20" />
        <div className="text-center relative z-10">
          <motion.div
            className="birthday-icon mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.p
            className="text-lg font-light"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading your birthday magic...
          </motion.p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <PageTransition className="min-h-screen relative overflow-hidden">
      <BirthdayDecorations className="opacity-10" />

      {/* Header */}
      <header className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <FadeIn className="flex items-center space-x-4">
            <motion.div
              className="birthday-icon birthday-decoration"
              whileHover={{ scale: 1.1, rotate: 5 }}
            />
            <div>
              <h1 className="text-2xl font-light tracking-tight">Birthday Reminder</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Dashboard</p>
            </div>
          </FadeIn>

          <SlideIn direction="left" delay={0.2} className="flex items-center space-x-6">
            <Link href="/dashboard/friends">
              <motion.span
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200 font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Manage Friends
              </motion.span>
            </Link>
            <Link href="/dashboard/settings">
              <motion.span
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200 font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Settings
              </motion.span>
            </Link>
            <motion.button
              onClick={() => {
                showToast.success('See you soon! 🎂')
                signOut({ callbackUrl: '/' })
              }}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200 font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign Out
            </motion.button>
          </SlideIn>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 relative z-10">
        <FadeIn delay={0.1} className="text-center mb-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-4xl font-light mb-4 tracking-tight">
              Welcome back, <span className="text-amber-600 dark:text-amber-400 font-normal">{session.user?.name || 'Friend'}</span>!
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              Here are the upcoming birthdays you need to remember
            </p>
          </motion.div>
        </FadeIn>

        {upcomingBirthdays.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div
              className="birthday-icon mx-auto mb-8 opacity-60"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <h3 className="text-3xl font-light mb-4 tracking-tight">No upcoming birthdays</h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Add some friends to start getting birthday reminders and spread the joy!
            </p>
            <Link href="/dashboard/friends">
              <AnimatedButton variant="primary" size="lg" className="px-8 py-4">
                Add Your First Friend
              </AnimatedButton>
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {upcomingBirthdays.map((friend, index) => {
              const daysUntil = getDaysUntilBirthday(friend.birthday)
              const isToday = daysUntil === 0

              return (
                <AnimatedCard key={friend.id} delay={index * 0.1}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-medium">{friend.name}</h3>
                    <motion.div
                      className={`birthday-icon ${isToday ? 'birthday-decoration' : ''}`}
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 dark:text-gray-400">Birthday:</span>
                      <span className="font-medium">{formatBirthday(friend.birthday)}</span>
                    </div>

                    <motion.div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        isToday
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                    >
                      {isToday ? (
                        <>
                          <span className="mr-1">🎂</span>
                          Today!
                        </>
                      ) : (
                        <>
                          <span className="mr-1">📅</span>
                          In {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                        </>
                      )}
                    </motion.div>

                    {friend.email && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 dark:text-gray-400">Email:</span>
                        <span className="font-medium">{friend.email}</span>
                      </div>
                    )}
                  </div>

                  {friend.notes && (
                    <motion.div
                      className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                    >
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{friend.notes}"</p>
                    </motion.div>
                  )}
                </AnimatedCard>
              )
            })}
          </div>
        )}

        <SlideIn direction="up" delay={0.6} className="mt-16 text-center">
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-2xl font-light mb-4">Manage Your Friends</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You have <span className="font-semibold text-amber-600 dark:text-amber-400">{friends.length}</span> friend{friends.length !== 1 ? 's' : ''} in your birthday list
            </p>
            <Link href="/dashboard/friends">
              <AnimatedButton variant="secondary" size="lg" className="px-8 py-4">
                View All Friends
              </AnimatedButton>
            </Link>
          </div>
        </SlideIn>
      </main>
    </PageTransition>
  )
}
