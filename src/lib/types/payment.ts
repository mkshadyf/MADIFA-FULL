export interface PaymentNotification {
  m_payment_id: string
  pf_payment_id: string
  payment_status: string
  amount_gross: string
  amount_fee: string
  amount_net: string
  signature: string
  [key: string]: string
}

export interface PaymentSession {
  sessionId: string
  url: string
}

export interface PaymentVerification {
  success: boolean
  status: string
  error?: string
}
