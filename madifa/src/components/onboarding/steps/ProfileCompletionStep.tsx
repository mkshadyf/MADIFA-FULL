import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'

interface ProfileCompletionStepProps {
  onComplete: () => void
}

interface ProfileForm {
  fullName: string
  displayName: string
  preferences: {
    categories: string[]
    languages: string[]
  }
}

export default function ProfileCompletionStep({ onComplete }: ProfileCompletionStepProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>()

  const onSubmit = async (data: ProfileForm) => {
    setIsSubmitting(true)
    try {
      await updateUserProfile(user!.id, data)
      onComplete()
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Complete Your Profile</h2>
        <p className="text-gray-400 mt-2">
          Help us personalize your experience
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400">
            Full Name
          </label>
          <input
            type="text"
            {...register('fullName', { required: 'Full name is required' })}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">
            Display Name
          </label>
          <input
            type="text"
            {...register('displayName', { required: 'Display name is required' })}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
          />
          {errors.displayName && (
            <p className="mt-1 text-sm text-red-500">{errors.displayName.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg
                     hover:bg-indigo-700 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Completing Setup...' : 'Complete Setup'}
          </button>
        </div>
      </form>
    </motion.div>
  )
} 