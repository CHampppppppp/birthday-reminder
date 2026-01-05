'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition, FadeIn, SlideIn } from '@/components/PageTransition'
import { BirthdayDecorations } from '@/components/BirthdayDecorations'
import { AnimatedCard, AnimatedButton, AnimatedInput } from '@/components/AnimatedComponents'
import { AvatarUpload } from '@/components/AvatarUpload'
import { showToast } from '@/components/ToastProvider'

interface Friend {
  id: string
  name: string
  email?: string
  birthday: string
  timezone: string
  reminderDaysOverride?: number
  notes?: string
  image?: string
}

export default function Friends() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    birthday: '',
    timezone: 'UTC',
    reminderDaysOverride: '',
    notes: ''
  })

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
      }
    } catch (error) {
      console.error('Error fetching friends:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      birthday: '',
      timezone: 'UTC',
      reminderDaysOverride: '',
      notes: ''
    })
    setEditingFriend(null)
    setShowAddForm(false)
  }

  const handleEdit = (friend: Friend) => {
    setEditingFriend(friend)
    setFormData({
      name: friend.name,
      email: friend.email || '',
      birthday: new Date(friend.birthday).toISOString().split('T')[0],
      timezone: friend.timezone,
      reminderDaysOverride: friend.reminderDaysOverride?.toString() || '',
      notes: friend.notes || ''
    })
    setShowAddForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      name: formData.name,
      email: formData.email || undefined,
      birthday: formData.birthday,
      timezone: formData.timezone,
      reminderDaysOverride: formData.reminderDaysOverride ? parseInt(formData.reminderDaysOverride) : undefined,
      notes: formData.notes || undefined,
    }

    const loadingToast = showToast.loading(editingFriend ? 'Updating friend...' : 'Adding friend...')

    try {
      let response
      if (editingFriend) {
        response = await fetch(`/api/friends/${editingFriend.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      } else {
        response = await fetch('/api/friends', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      }

      if (response.ok) {
        showToast.success(editingFriend ? 'Friend updated successfully! 🎂' : 'Friend added successfully! 🎂')
        resetForm()
        fetchFriends()
      } else {
        const error = await response.json()
        showToast.error(error.error || 'An error occurred')
      }
    } catch (error) {
      console.error('Error saving friend:', error)
      showToast.error('An error occurred while saving')
    } finally {
      showToast.dismiss(loadingToast)
    }
  }

  const handleDelete = async (friendId: string) => {
    try {
      const response = await fetch(`/api/friends/${friendId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchFriends()
        return Promise.resolve()
      } else {
        throw new Error('Failed to delete friend')
      }
    } catch (error) {
      console.error('Error deleting friend:', error)
      throw error
    }
  }

  const formatBirthday = (birthday: string) => {
    return new Date(birthday).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
            Loading your friends...
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
        <div className="flex justify-between items-center mb-12">
          <FadeIn>
            <h1 className="text-4xl font-light tracking-tight">Manage Friends</h1>
          </FadeIn>
          <SlideIn direction="left" delay={0.2}>
            <AnimatedButton
              onClick={() => setShowAddForm(!showAddForm)}
              variant="primary"
              size="lg"
              className="px-8 py-4"
            >
              {showAddForm ? 'Cancel' : '+ Add Friend'}
            </AnimatedButton>
          </SlideIn>
        </div>

        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-12"
            >
              <AnimatedCard className="w-full">
                <div className="flex items-center space-x-3 mb-6">
                  <motion.div
                    className="birthday-icon"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  />
                  <h2 className="text-2xl font-light">
                    {editingFriend ? 'Edit Friend' : 'Add New Friend'}
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Avatar Upload - Only show when editing existing friend */}
                  {editingFriend && (
                    <div className="flex justify-center mb-6">
                      <AvatarUpload
                        currentAvatar={editingFriend.image}
                        onAvatarUpdate={(avatarUrl) => {
                          // Update the friend in state immediately for preview
                          setFriends(prev => prev.map(f =>
                            f.id === editingFriend.id
                              ? { ...f, image: avatarUrl }
                              : f
                          ))
                          setEditingFriend(prev => prev ? { ...prev, image: avatarUrl } : null)
                        }}
                        uploadUrl={`/api/friends/${editingFriend.id}/avatar`}
                        size={120}
                      />
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <AnimatedInput
                      label="Name *"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />

                    <AnimatedInput
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Birthday *</label>
                      <motion.input
                        type="date"
                        value={formData.birthday}
                        onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                        className="input-field"
                        required
                        whileFocus={{ scale: 1.01 }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Timezone</label>
                      <motion.select
                        value={formData.timezone}
                        onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                        className="input-field"
                        whileFocus={{ scale: 1.01 }}
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="Europe/London">London</option>
                        <option value="Europe/Paris">Paris</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                      </motion.select>
                    </div>
                  </div>

                  <AnimatedInput
                    label="Reminder Days (leave empty for default)"
                    type="number"
                    value={formData.reminderDaysOverride}
                    onChange={(e) => setFormData(prev => ({ ...prev, reminderDaysOverride: e.target.value }))}
                    min="0"
                    max="365"
                    placeholder="e.g., 1 for 1 day before"
                  />

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Notes</label>
                    <motion.textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="input-field"
                      rows={4}
                      placeholder="Any special notes about your friend..."
                      whileFocus={{ scale: 1.01 }}
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <AnimatedButton type="submit" variant="primary" size="lg" className="px-8">
                      {editingFriend ? 'Update Friend' : 'Add Friend'}
                    </AnimatedButton>
                    <AnimatedButton
                      type="button"
                      onClick={resetForm}
                      variant="secondary"
                      size="lg"
                      className="px-8"
                    >
                      Cancel
                    </AnimatedButton>
                  </div>
                </form>
              </AnimatedCard>
            </motion.div>
          )}
        </AnimatePresence>

        {friends.length === 0 ? (
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
            <h3 className="text-3xl font-light mb-4 tracking-tight">No friends yet</h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Start by adding your first friend to get birthday reminders and spread the joy!
            </p>
            <AnimatedButton
              onClick={() => setShowAddForm(true)}
              variant="primary"
              size="lg"
              className="px-8 py-4"
            >
              Add Your First Friend
            </AnimatedButton>
          </motion.div>
        ) : (
          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {friends.map((friend, index) => (
              <AnimatedCard key={friend.id} delay={index * 0.1}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {friend.image ? (
                        <img
                          src={friend.image}
                          alt={friend.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-lg">
                          {friend.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-medium">{friend.name}</h3>
                  </div>
                  <motion.div
                    className="birthday-icon"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                </div>

                <div className="space-y-3 text-sm mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 dark:text-gray-400">🎂</span>
                    <span>{formatBirthday(friend.birthday)}</span>
                  </div>

                  {friend.email && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 dark:text-gray-400">✉️</span>
                      <span>{friend.email}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 dark:text-gray-400">🌍</span>
                    <span>{friend.timezone}</span>
                  </div>

                  {friend.reminderDaysOverride && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 dark:text-gray-400">⏰</span>
                      <span>{friend.reminderDaysOverride} days before</span>
                    </div>
                  )}
                </div>

                {friend.notes && (
                  <motion.div
                    className="mb-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{friend.notes}"</p>
                  </motion.div>
                )}

                <div className="flex space-x-3 pt-2">
                  <motion.button
                    onClick={() => handleEdit(friend)}
                    className="flex-1 py-3 px-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg font-medium transition-all duration-200 border border-blue-200 dark:border-blue-800"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this friend?')) {
                        showToast.promise(
                          handleDelete(friend.id),
                          {
                            loading: 'Removing friend...',
                            success: 'Friend removed successfully!',
                            error: 'Failed to remove friend'
                          }
                        )
                      }
                    }}
                    className="flex-1 py-3 px-4 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg font-medium transition-all duration-200 border border-red-200 dark:border-red-800"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Delete
                  </motion.button>
                </div>
              </AnimatedCard>
            ))}
          </motion.div>
        )}
      </main>
    </PageTransition>
  )
}
