'use client'

import { useSession } from 'next-auth/react'
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
        resetForm()
        fetchFriends()
      } else {
        const error = await response.json()
        alert(error.error || 'An error occurred')
      }
    } catch (error) {
      console.error('Error saving friend:', error)
      alert('An error occurred')
    }
  }

  const handleDelete = async (friendId: string) => {
    if (!confirm('Are you sure you want to delete this friend?')) {
      return
    }

    try {
      const response = await fetch(`/api/friends/${friendId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchFriends()
      } else {
        alert('Failed to delete friend')
      }
    } catch (error) {
      console.error('Error deleting friend:', error)
      alert('An error occurred')
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-light">Manage Friends</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary"
          >
            {showAddForm ? 'Cancel' : 'Add Friend'}
          </button>
        </div>

        {showAddForm && (
          <div className="card mb-8">
            <h2 className="text-xl font-medium mb-4">
              {editingFriend ? 'Edit Friend' : 'Add New Friend'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Birthday *</label>
                  <input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Timezone</label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
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
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Reminder Days (leave empty for default)
                </label>
                <input
                  type="number"
                  value={formData.reminderDaysOverride}
                  onChange={(e) => setFormData(prev => ({ ...prev, reminderDaysOverride: e.target.value }))}
                  className="input-field"
                  min="0"
                  max="365"
                  placeholder="e.g., 1 for 1 day before"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="input-field"
                  rows={3}
                  placeholder="Any special notes..."
                />
              </div>

              <div className="flex space-x-4">
                <button type="submit" className="btn-primary">
                  {editingFriend ? 'Update Friend' : 'Add Friend'}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {friends.length === 0 ? (
          <div className="text-center py-12">
            <div className="birthday-icon mx-auto mb-4 opacity-50"></div>
            <h3 className="text-xl font-light mb-2">No friends yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start by adding your first friend to get birthday reminders.
            </p>
            <button onClick={() => setShowAddForm(true)} className="btn-primary">
              Add Your First Friend
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {friends.map((friend) => (
              <div key={friend.id} className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium">{friend.name}</h3>
                  <div className="birthday-icon"></div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <p>Birthday: {formatBirthday(friend.birthday)}</p>
                  {friend.email && <p>Email: {friend.email}</p>}
                  <p>Timezone: {friend.timezone}</p>
                  {friend.reminderDaysOverride && (
                    <p>Reminder: {friend.reminderDaysOverride} days before</p>
                  )}
                </div>

                {friend.notes && (
                  <div className="mb-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{friend.notes}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(friend)}
                    className="btn-secondary flex-1 text-sm py-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(friend.id)}
                    className="btn-secondary flex-1 text-sm py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
