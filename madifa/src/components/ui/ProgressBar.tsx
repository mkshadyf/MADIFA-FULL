import { motion } from 'framer-motion'

interface ProgressBarProps {
  progress: number
  showPercentage?: boolean
  height?: number
  color?: string
  backgroundColor?: string
}

export default function ProgressBar({
  progress,
  showPercentage = true,
  height = 4,
  color = 'bg-indigo-600',
  backgroundColor = 'bg-gray-200'
}: ProgressBarProps) {
  return (
    <div className="relative w-full">
      <div
        className={`w-full ${backgroundColor} rounded-full overflow-hidden`}
        style={{ height }}
      >
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      {showPercentage && (
        <div className="absolute right-0 -top-6 text-sm text-gray-500">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  )
} 