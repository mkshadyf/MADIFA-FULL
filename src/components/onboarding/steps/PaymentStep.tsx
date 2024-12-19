import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { motion } from 'framer-motion'
import md5 from 'md5'

import type { OnboardingState } from '@/lib/services/onboarding'
import { subscriptionService } from '@/lib/services/subscription'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'

interface PaymentStepProps {
  onNext: (data: Partial<OnboardingState>) => Promise<void>
  onBack: () => void
  data: Partial<OnboardingState>
}

interface Plan {
  id: string
  name: string
  price: number
}

interface PaymentData {
  merchant_id: string
  merchant_key: string
  return_url: string
  cancel_url: string
  notify_url: string
  name_first: string
  name_last: string
  email_address: string
  m_payment_id: string
  amount: string
  item_name: string
  subscription_type: string
  billing_date: string
  recurring_amount: string
  frequency: string
  cycles: string
  signature?: string
}

export default function PaymentStep ({ onNext, onBack, data }: PaymentStepProps) {
  const [plan, setPlan] = useState<Plan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const { user, profile } = useAuth()
  const { showToast } = useToast()

  useEffect(() => {
    loadPlanDetails()
  }, [])

  const loadPlanDetails = async () => {
    try {
      if (!data.planId) {
        showToast('No plan selected', 'error')
        onBack()
        return
      }

      const plans = await subscriptionService.getSubscriptionTiers()
      const selectedPlan = plans.find(p => p.id === data.planId)

      if (!selectedPlan) {
        showToast('Selected plan not found', 'error')
        onBack()
        return
      }

      setPlan(selectedPlan)
    } catch (error) {
      logger.error('Error loading plan details:', error)
      showToast('Failed to load plan details', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const generatePaymentSignature = (data: PaymentData): string => {
    const passPhrase = import.meta.env.VITE_PAYFAST_PASSPHRASE
    const dataString = Object.entries(data)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${key}=${encodeURIComponent(value.trim())}`)
      .join('&')

    return md5(dataString + '&passphrase=' + passPhrase)
  }

  const handlePayment = async () => {
    if (!plan || !user) return

    try {
      setIsProcessing(true)

      '
       ')
      '
       ') || ''

      const paymentData: PaymentData = {
        merchant_id: import.meta.env.VITE_PAYFAST_MERCHANT_ID,
        merchant_key: import.meta.env.VITE_PAYFAST_MERCHANT_KEY,
        return_url: import.meta.env.VITE_PAYFAST_RETURN_URL,
        cancel_url: import.meta.env.VITE_PAYFAST_CANCEL_URL,
        notify_url: import.meta.env.VITE_PAYFAST_NOTIFY_URL,
        name_first: firstName,
        name_last: lastName,
        email_address: user.email || '',
        m_payment_id: `${user.id}_${plan.id}_${Date.now()}`,
        amount: plan.price.toString(),
        item_name: `${plan.name} Subscription`,
        subscription_type: '1',
        billing_date: new Date().toISOString().split('T')[0],
        recurring_amount: plan.price.toString(),
        frequency: '3',
        cycles: '0',
      }

      // Add signature
      paymentData.signature = generatePaymentSignature(paymentData)

      // Create form and submit
      form')
      form.method = 'POST'
      form.action =
        import.meta.env.VITE_PAYFAST_TEST_MODE === 'true'
          ? 'https://sandbox.payfast.co.za/eng/process'
          : 'https://www.payfast.co.za/eng/process'

      Object.entries(paymentData).forEach(([key, value]) => {
        input')
        input.type = 'hidden'
        input.name = key
        input.value = value
        form.appendChild(input)
      })

      document.body.appendChild(form)
      form.submit()
    } catch (error) {
      logger.error('Payment error:', error)
      showToast('Payment processing failed', 'error')
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return <div className="py-12 text-center">Loading payment details...</div>
  }

  if (!plan) {
    return <div className="py-12 text-center">Plan not found</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Complete Your Purchase</h2>
        <p className="mt-2 text-gray-400">You're just one step away from premium content</p>
      </div>

      <div className="mx-auto max-w-md rounded-xl border border-gray-700 bg-gray-800/50 p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Plan</span>
            <span className="font-medium text-white">{plan.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Price</span>
            <span className="font-medium text-white">${plan.price}/month</span>
          </div>
          <div className="my-4 border-t border-gray-700" />
          <div className="flex items-center justify-between text-lg font-medium">
            <span className="text-gray-400">Total</span>
            <span className="text-white">${plan.price}</span>
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-between">
        <Button variant="secondary" onClick={onBack} disabled={isProcessing}>
          Back
        </Button>
        <Button variant="primary" onClick={handlePayment} isLoading={isProcessing}>
          Complete Payment
        </Button>
      </div>
    </motion.div>
  )
}
