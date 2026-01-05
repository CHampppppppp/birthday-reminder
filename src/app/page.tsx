'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { PageTransition, FadeIn, SlideIn } from '@/components/PageTransition'
import { BirthdayDecorations } from '@/components/BirthdayDecorations'
import { AnimatedButton } from '@/components/AnimatedComponents'

export default function Home() {
  return (
    <PageTransition className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <BirthdayDecorations className="opacity-30" />

      <div className="container max-w-md text-center relative z-10">
        <FadeIn delay={0.1} className="mb-8">
          <motion.div
            className="birthday-icon mx-auto mb-6 birthday-decoration"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-6xl">🎂</span>
          </motion.div>
          <h1 className="text-5xl font-light mb-4 tracking-tight text-gray-900 dark:text-gray-100">
            Birthday Reminder
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            Never miss a friend's birthday again. Get timely reminders via email.
          </p>
        </FadeIn>

        <SlideIn direction="up" delay={0.3} className="space-y-4">
          <Link href="/auth/signin">
            <AnimatedButton variant="primary" size="lg" className="w-full">
              Sign In
            </AnimatedButton>
          </Link>
          <Link href="/auth/signup">
            <AnimatedButton variant="secondary" size="lg" className="w-full">
              Create Account
            </AnimatedButton>
          </Link>
        </SlideIn>

        <FadeIn delay={0.5} className="mt-12">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-500">
            <span>✨</span>
            <span>Simple</span>
            <span>•</span>
            <span>Reliable</span>
            <span>•</span>
            <span>Private</span>
            <span>✨</span>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  )
}
