'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { PageTransition, FadeIn, SlideIn } from '@/components/PageTransition'
import { AnimatedInput, AnimatedButton, AnimatedCard } from '@/components/AnimatedComponents'
import { showToast } from '@/components/ToastProvider'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const loadingToast = showToast.loading('Signing you in...')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        showToast.error('Invalid email or password')
        setError('Invalid email or password')
      } else {
        showToast.success('Welcome back! 🎂')
        // Refresh session and redirect
        await getSession()
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

  const handleGitHubSignIn = () => {
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
            <h1 className="text-3xl font-light tracking-tight">Welcome Back</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Sign in to your account</p>
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
              label="Email"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              error={error}
            />

            <AnimatedInput
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                {isLoading ? 'Signing in...' : 'Sign In'}
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
              onClick={handleGitHubSignIn}
              variant="secondary"
              size="lg"
              className="w-full mt-4"
              disabled={isLoading}
            >
              Sign in with GitHub
            </AnimatedButton>
          </SlideIn>

          <FadeIn delay={0.4} className="mt-6 text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
            <Link
              href="/auth/signup"
              className="text-gray-900 dark:text-gray-100 font-medium hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-200"
            >
              Sign up
            </Link>
          </FadeIn>
        </AnimatedCard>
      </div>
    </PageTransition>
  )
}
