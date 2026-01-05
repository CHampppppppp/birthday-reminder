'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { ButtonHTMLAttributes, InputHTMLAttributes, forwardRef } from 'react'

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, className = '', variant = 'primary', size = 'md', isLoading, ...props }, ref) => {
    const baseClasses = 'relative overflow-hidden font-medium transition-all duration-300 ease-out'
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm rounded-md',
      md: 'px-6 py-3 text-base rounded-lg',
      lg: 'px-8 py-4 text-lg rounded-xl'
    }
    const variantClasses = {
      primary: 'bg-gradient-to-br from-gray-900 to-gray-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
      secondary: 'bg-white text-gray-900 border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 hover:-translate-y-0.5 active:translate-y-0'
    }

    return (
      <motion.button
        ref={ref}
        className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        disabled={isLoading}
        {...(props as HTMLMotionProps<"button">)}
      >
        {isLoading && (
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-20 rounded-inherit flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        )}
        <span className={isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-200'}>
          {children}
        </span>
      </motion.button>
    )
  }
)

AnimatedButton.displayName = 'AnimatedButton'

interface AnimatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {label && (
          <motion.label
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {label}
          </motion.label>
        )}
        <motion.div
          whileFocus={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <motion.input
            ref={ref}
            className={`w-full px-4 py-3 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 ${error ? 'border-red-300 focus:ring-red-500' : ''} ${className}`}
            whileFocus={{
              boxShadow: "0 0 0 3px rgba(245, 158, 11, 0.1)"
            }}
            {...(props as HTMLMotionProps<"input">)}
          />
        </motion.div>
        {error && (
          <motion.p
            className="text-sm text-red-600 dark:text-red-400"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    )
  }
)

AnimatedInput.displayName = 'AnimatedInput'

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function AnimatedCard({ children, className = '', delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut"
      }}
      whileHover={{
        y: -2,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
    >
      {children}
    </motion.div>
  )
}
