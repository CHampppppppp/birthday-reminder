'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { PageTransition, FadeIn, SlideIn } from '@/components/PageTransition'
import { AnimatedInput, AnimatedButton, AnimatedCard } from '@/components/AnimatedComponents'
import { showToast } from '@/components/ToastProvider'

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      showToast.error('Passwords do not match')
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      showToast.error('Password must be at least 6 characters')
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    const loadingToast = showToast.loading('Creating your account...')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        showToast.error(data.error || 'Registration failed')
        setError(data.error || 'Registration failed')
        return
      }

      showToast.success('Account created successfully! 🎂')

      // Auto sign in after successful registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        showToast.error('Registration successful, but sign in failed. Please try signing in manually.')
        setError('Registration successful, but sign in failed. Please try signing in manually.')
      } else {
        showToast.success('Welcome to Birthday Reminder! 🎂')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      showToast.error('An error occurred. Please try again.')
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
      showToast.dismiss(loadingToast)
    }
  }

  const handleGitHubSignUp = () => {
    signIn('github', { callbackUrl: '/dashboard' })
  }

  return (
    <PageTransition className="min-h-screen flex items-center justify-center px-4">
      <div className="container max-w-md">
        <AnimatedCard className="w-full">
          <FadeIn className="text-center mb-8">
            <motion.div
              className="birthday-icon mx-auto mb-4"
              whileHover={{ scale: 1.1, rotate: 5 }}
            />
            <h1 className="text-3xl font-light tracking-tight">Create Account</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Join Birthday Reminder</p>
          </FadeIn>

          {error && (
            <motion.div
              className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatedInput
              label="Name"
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />

            <AnimatedInput
              label="Email"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />

            <AnimatedInput
              label="Password"
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              minLength={6}
            />

            <AnimatedInput
              label="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isLoading}
            />

            <SlideIn direction="up" delay={0.2}>
              <AnimatedButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </AnimatedButton>
            </SlideIn>
          </form>

          <SlideIn direction="up" delay={0.3} className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            <AnimatedButton
              onClick={handleGitHubSignUp}
              variant="secondary"
              size="lg"
              className="w-full mt-4"
              disabled={isLoading}
            >
              Sign up with GitHub
            </AnimatedButton>
          </SlideIn>

          <FadeIn delay={0.4} className="mt-6 text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
            <Link
              href="/auth/signin"
              className="text-gray-900 dark:text-gray-100 font-medium hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-200"
            >
              Sign in
            </Link>
          </FadeIn>
        </AnimatedCard>
      </div>
    </PageTransition>
  )
}
