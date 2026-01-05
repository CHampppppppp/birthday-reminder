'use client'

import { motion } from 'framer-motion'

interface BirthdayDecorationsProps {
  className?: string
}

export function BirthdayDecorations({ className = '' }: BirthdayDecorationsProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Floating balloons */}
      <motion.div
        className="absolute top-10 left-10 text-4xl"
        animate={{
          y: [-10, -30, -10],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        🎈
      </motion.div>

      <motion.div
        className="absolute top-20 right-20 text-3xl"
        animate={{
          y: [-15, -35, -15],
          rotate: [0, -8, 8, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      >
        🎈
      </motion.div>

      {/* Sparkles */}
      <motion.div
        className="absolute top-1/4 left-1/4 text-2xl"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        ✨
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 right-1/4 text-2xl"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        }}
      >
        ✨
      </motion.div>

      {/* Cake decoration */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-5xl"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 2, -2, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      >
        🎂
      </motion.div>
    </div>
  )
}

export function BirthdayConfetti() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full"
          initial={{
            top: -10,
            left: Math.random() * window.innerWidth,
            rotate: 0,
          }}
          animate={{
            top: window.innerHeight + 10,
            rotate: 360,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 2,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  )
}
