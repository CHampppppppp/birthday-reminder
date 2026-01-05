import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="container max-w-md text-center">
        <div className="mb-8">
          <div className="birthday-icon mx-auto mb-6"></div>
          <h1 className="text-4xl font-light mb-4">Birthday Reminder</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            Never miss a friend's birthday again. Get timely reminders via email.
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/auth/signin" className="btn-primary w-full block text-center">
            Sign In
          </Link>
          <Link href="/auth/signup" className="btn-secondary w-full block text-center">
            Create Account
          </Link>
        </div>

        <div className="mt-12 text-sm text-gray-500 dark:text-gray-500">
          <p>✨ Simple • Reliable • Private</p>
        </div>
      </div>
    </div>
  )
}
