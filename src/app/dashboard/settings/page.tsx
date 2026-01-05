'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

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

    try {
      // For now, just show a success message
      // In a real app, you'd make an API call to update settings
      alert('Settings saved successfully! (Note: This is a demo - settings are not actually saved yet)')

      // TODO: Implement settings API and save to database
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
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
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              ← Back to Dashboard
            </Link>
          </div>

          <div className="birthday-icon"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-light mb-8 text-center">Settings</h1>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Your Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                  className="input-field"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Default Reminder Days
                </label>
                <select
                  value={settings.reminderDefaultDays}
                  onChange={(e) => setSettings(prev => ({ ...prev, reminderDefaultDays: parseInt(e.target.value) }))}
                  className="input-field"
                >
                  <option value="1">1 day before</option>
                  <option value="2">2 days before</option>
                  <option value="3">3 days before</option>
                  <option value="7">1 week before</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  This is the default for all friends unless overridden individually.
                </p>
              </div>

              <button
                type="submit"
                className="btn-primary w-full"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="mb-4">Account: {session.user?.email}</p>
              <p>
                Need help? Check out our{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  documentation
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
