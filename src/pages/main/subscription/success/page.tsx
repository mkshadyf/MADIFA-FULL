import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubscription } from '@/hooks/useSubscription'
import { useToast } from '@/hooks/useToast'

export default function SubscriptionSuccessPage() {
  const { refresh } = useSubscription()
  const { showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const handleSuccess = async () => {
      try {
        await refresh()
        showToast('Subscription activated successfully!', 'success')
        navigate('/dashboard')
      } catch (err) {
        showToast('Failed to verify subscription', 'error')
        navigate('/subscription')
      }
    }

    void handleSuccess()
  }, [refresh, showToast, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold">
          Processing your subscription...
        </h1>
        <p>Please wait while we verify your payment.</p>
      </div>
    </div>
  )
}
