'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { PageTransition, FadeIn, SlideIn } from '@/components/PageTransition'
import { BirthdayDecorations } from '@/components/BirthdayDecorations'
import { AnimatedCard, AnimatedButton, AnimatedInput } from '@/components/AnimatedComponents'
import { AvatarUpload } from '@/components/AvatarUpload'
import { showToast } from '@/components/ToastProvider'

interface UserSettings {
  timezone: string
  reminderDefaultDays: number
}

export default function Settings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<UserSettings>({
    timezone: 'UTC',
    reminderDefaultDays: 2,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      // For now, we'll use default settings since we don't have a settings API yet
      // In a real app, you'd fetch user settings from the API
      setSettings({
        timezone: 'UTC',
        reminderDefaultDays: 2,
      })
      setLoading(false)
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const loadingToast = showToast.loading('Saving your preferences...')

    try {
      // For now, just show a success message
      // In a real app, you'd make an API call to update settings
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      showToast.success('Settings saved successfully! ✨')

      // TODO: Implement settings API and save to database
    } catch (error) {
      console.error('Error saving settings:', error)
      showToast.error('Failed to save settings')
    } finally {
      setSaving(false)
      showToast.dismiss(loadingToast)
    }
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
            Loading settings...
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

      <header className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <FadeIn className="flex items-center space-x-4">
            <Link href="/dashboard">
              <motion.span
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200 font-medium"
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>←</span>
                <span>Back to Dashboard</span>
              </motion.span>
            </Link>
          </FadeIn>

          <SlideIn direction="left" delay={0.2}>
            <motion.div
              className="birthday-icon"
              whileHover={{ scale: 1.1, rotate: 5 }}
            />
          </SlideIn>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-2xl mx-auto">
          <FadeIn className="text-center mb-12">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-4xl font-light mb-4 tracking-tight">Settings</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Customize your birthday reminder experience
              </p>
            </motion.div>
          </FadeIn>

          <AnimatedCard className="w-full mb-8">
            <div className="flex items-center space-x-3 mb-8">
              <motion.div
                className="birthday-icon"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              />
              <h2 className="text-2xl font-light">Profile Picture</h2>
            </div>

            <div className="flex justify-center mb-8">
              <AvatarUpload
                currentAvatar={session.user?.image}
                onAvatarUpdate={(avatarUrl) => {
                  // Update session with new avatar
                  // Note: In a real app, you might need to refresh the session
                  showToast.success('头像更新成功！')
                }}
                uploadUrl="/api/upload/avatar"
                size={150}
              />
            </div>
          </AnimatedCard>

          <AnimatedCard className="w-full">
            <div className="flex items-center space-x-3 mb-8">
              <motion.div
                className="birthday-icon"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              />
              <h2 className="text-2xl font-light">Personal Preferences</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                    🌍 Your Timezone
                  </label>
                  <motion.select
                    value={settings.timezone}
                    onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                    className="input-field text-base py-3"
                    whileFocus={{ scale: 1.01 }}
                  >
                    <option value="UTC">🌍 UTC</option>
                    <option value="America/New_York">🇺🇸 Eastern Time</option>
                    <option value="America/Chicago">🇺🇸 Central Time</option>
                    <option value="America/Denver">🇺🇸 Mountain Time</option>
                    <option value="America/Los_Angeles">🇺🇸 Pacific Time</option>
                    <option value="Europe/London">🇬🇧 London</option>
                    <option value="Europe/Paris">🇫🇷 Paris</option>
                    <option value="Asia/Tokyo">🇯🇵 Tokyo</option>
                  </motion.select>
                  <p className="text-xs text-gray-500 mt-2">
                    Used for calculating reminder times
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                    ⏰ Default Reminder Days
                  </label>
                  <motion.select
                    value={settings.reminderDefaultDays}
                    onChange={(e) => setSettings(prev => ({ ...prev, reminderDefaultDays: parseInt(e.target.value) }))}
                    className="input-field text-base py-3"
                    whileFocus={{ scale: 1.01 }}
                  >
                    <option value="1">1 day before 🎂</option>
                    <option value="2">2 days before 📅</option>
                    <option value="3">3 days before 📆</option>
                    <option value="7">1 week before 📅</option>
                  </motion.select>
                  <p className="text-xs text-gray-500 mt-2">
                    Default reminder timing for all friends
                  </p>
                </motion.div>
              </div>

              <SlideIn direction="up" delay={0.5} className="pt-4">
                <AnimatedButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full py-4"
                  isLoading={saving}
                >
                  {saving ? 'Saving Settings...' : 'Save Preferences'}
                </AnimatedButton>
              </SlideIn>
            </form>
          </AnimatedCard>

          <SlideIn direction="up" delay={0.6} className="mt-12">
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-center">
                <motion.div
                  className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <span className="text-2xl">👤</span>
                </motion.div>
                <h3 className="text-xl font-light mb-2">Account Information</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Logged in as: <span className="font-medium text-amber-600 dark:text-amber-400">{session.user?.email}</span>
                </p>
                <div className="flex justify-center space-x-4 text-sm">
                  <a href="#" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200">
                    📖 Documentation
                  </a>
                  <span className="text-gray-400">•</span>
                  <a href="#" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200">
                    💬 Support
                  </a>
                </div>
              </div>
            </div>
          </SlideIn>
        </div>
      </main>
    </PageTransition>
  )
}
