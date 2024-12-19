import { paymentService } from '@/lib/services/payment'
import type { PaymentNotification } from '@/lib/types/payment'

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const formData = await req.formData()
    const paymentData = Object.fromEntries(
      formData.entries()
    ) as unknown as PaymentNotification

    // Validate required fields
    const requiredFields: (keyof PaymentNotification)[] = [
      'm_payment_id',
      'pf_payment_id',
      'payment_status',
      'amount_gross',
      'amount_fee',
      'amount_net',
      'signature',
    ]

    for (const field of requiredFields) {
      if (!paymentData[field]) {
        return new Response(`Missing required field: ${field}`, { status: 400 })
      }
    }

    await paymentService.handlePaymentNotification(paymentData)
    return new Response('OK', { status: 200 })
  } catch (error) {
    logger.error('Payment notification error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
