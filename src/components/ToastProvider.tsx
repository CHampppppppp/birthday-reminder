'use client'

import { Toaster, toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--background)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
          borderRadius: '0.75rem',
          boxShadow: 'var(--shadow-lg)',
          fontSize: '0.875rem',
          fontWeight: '500',
        },
        success: {
          icon: '🎂',
          style: {
            background: 'var(--birthday-accent-light)',
            borderColor: 'var(--birthday-accent)',
            color: 'var(--birthday-accent-dark)',
          },
        },
        error: {
          icon: '⚠️',
          style: {
            background: '#fef2f2',
            borderColor: '#fecaca',
            color: '#dc2626',
          },
        },
        loading: {
          style: {
            background: 'var(--muted)',
            borderColor: 'var(--border)',
          },
        },
      }}
      containerStyle={{
        top: '1.5rem',
        right: '1.5rem',
      }}
    />
  )
}

// Toast utilities
export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  loading: (message: string) => toast.loading(message),
  dismiss: (toastId?: string) => toast.dismiss(toastId),
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => {
    return toast.promise(promise, messages)
  },
}
