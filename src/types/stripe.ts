import type { Stripe } from 'stripe'

export type StripeCustomer = Stripe.Customer
export type StripeSubscription = Stripe.Subscription
export type StripePlan = Stripe.Price
export type StripePaymentMethod = Stripe.PaymentMethod
export type StripeInvoice = Stripe.Invoice
export type StripePaymentIntent = Stripe.PaymentIntent
export type StripeSetupIntent = Stripe.SetupIntent
export type StripeEvent = Stripe.Event

export interface StripeError {
  type: string
  code?: string
  decline_code?: string
  message?: string
  param?: string
}

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'unpaid'
  | 'paused'

export interface SubscriptionPriceData {
  id: string
  product: string
  active: boolean
  currency: string
  type: 'one_time' | 'recurring'
  unit_amount: number | null
  recurring: {
    interval: 'day' | 'week' | 'month' | 'year'
    interval_count: number
  } | null
  metadata: Record<string, string>
}

export interface SubscriptionProductData {
  id: string
  name: string
  active: boolean
  description: string | null
  metadata: Record<string, string>
}

export interface SubscriptionData {
  id: string
  customer: string
  status: SubscriptionStatus
  current_period_start: number
  current_period_end: number
  created: number
  ended_at: number | null
  cancel_at: number | null
  canceled_at: number | null
  trial_start: number | null
  trial_end: number | null
  prices: SubscriptionPriceData[]
  products: SubscriptionProductData[]
  metadata: Record<string, string>
}

export interface CustomerData {
  id: string
  email: string | null
  name: string | null
  phone: string | null
  address: {
    line1: string | null
    line2: string | null
    city: string | null
    state: string | null
    postal_code: string | null
    country: string | null
  } | null
  metadata: Record<string, string>
  created: number
  subscriptions: SubscriptionData[]
  default_payment_method: string | null
  invoice_settings: {
    default_payment_method: string | null
  }
}

export interface PaymentMethodData {
  id: string
  type: string
  card?: {
    brand: string
    exp_month: number
    exp_year: number
    last4: string
    funding: string
  }
  billing_details: {
    address: {
      city: string | null
      country: string | null
      line1: string | null
      line2: string | null
      postal_code: string | null
      state: string | null
    }
    email: string | null
    name: string | null
    phone: string | null
  }
  metadata: Record<string, string>
}

export interface InvoiceData {
  id: string
  customer: string
  subscription: string | null
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void'
  currency: string
  amount_due: number
  amount_paid: number
  amount_remaining: number
  created: number
  due_date: number | null
  lines: {
    data: Array<{
      id: string
      amount: number
      currency: string
      description: string
      period: {
        start: number
        end: number
      }
      price: SubscriptionPriceData
      proration: boolean
      quantity: number
    }>
  }
  metadata: Record<string, string>
}

export interface SetupIntentData {
  id: string
  client_secret: string | null
  customer: string | null
  payment_method: string | null
  status:
    | 'requires_payment_method'
    | 'requires_confirmation'
    | 'requires_action'
    | 'processing'
    | 'succeeded'
    | 'canceled'
  usage: 'off_session' | 'on_session'
  metadata: Record<string, string>
}

export interface PaymentIntentData {
  id: string
  client_secret: string | null
  customer: string | null
  amount: number
  currency: string
  payment_method: string | null
  status:
    | 'requires_payment_method'
    | 'requires_confirmation'
    | 'requires_action'
    | 'processing'
    | 'succeeded'
    | 'canceled'
  metadata: Record<string, string>
}

export interface WebhookData {
  id: string
  type: string
  data: {
    object: Record<string, any>
  }
  created: number
  metadata: Record<string, string>
}
