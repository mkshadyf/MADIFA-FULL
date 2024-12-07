import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { useToast } from '@/hooks/useToast'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    showToast('Payment successful! Your subscription is now active.', 'success')
    // Redirect to browse page after 3 seconds
    const timer = setTimeout(() => {
      navigate('/browse')
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigate, showToast])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-green-500 text-6xl mb-6">✓</div>
        <h1 className="text-3xl font-bold text-white">Payment Successful!</h1>
        <p className="text-gray-400">
          Thank you for your subscription. You will be redirected shortly...
        </p>
      </div>
    </div>
  )
} 