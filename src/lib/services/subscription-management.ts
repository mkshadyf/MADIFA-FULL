import { env } from '@/config/env'
import { handleStripeError } from '@/lib/utils/error-handler'
import type {
  CustomerData,
  InvoiceData,
  PaymentMethodData,
  SetupIntentData,
  SubscriptionData,
} from '@/types/stripe'
import Stripe from 'stripe'

const stripe = new Stripe(env.VITE_STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia' as Stripe.LatestApiVersion,
})

function mapCustomerToData(customer: Stripe.Customer): CustomerData {
  return {
    id: customer.id,
    email: customer.email || null,
    name: customer.name || null,
    phone: customer.phone || null,
    address: customer.address || null,
    metadata: customer.metadata || {},
    created: customer.created,
    subscriptions: [],
    default_payment_method: null,
    invoice_settings: {
      default_payment_method: typeof customer.invoice_settings?.default_payment_method === 'string'
        ? customer.invoice_settings.default_payment_method
        : null,
    },
  }
}

function mapSubscriptionToData(
  subscription: Stripe.Subscription
): SubscriptionData {
  return {
    id: subscription.id,
    customer: subscription.customer as string,
    status: subscription.status,
    current_period_start: subscription.current_period_start,
    current_period_end: subscription.current_period_end,
    created: subscription.created,
    ended_at: subscription.ended_at,
    cancel_at: subscription.cancel_at,
    canceled_at: subscription.canceled_at,
    trial_start: subscription.trial_start,
    trial_end: subscription.trial_end,
    prices: subscription.items.data.map(item => ({
      id: item.price.id,
      product: item.price.product as string,
      active: item.price.active,
      currency: item.price.currency,
      type: item.price.type,
      unit_amount: item.price.unit_amount,
      recurring: item.price.recurring,
      metadata: item.price.metadata || {},
    })),
    products: [],
    metadata: subscription.metadata || {},
  }
}

function mapInvoiceToData(
  invoice: Stripe.Invoice | Stripe.UpcomingInvoice
): InvoiceData {
  return {
    id: 'id' in invoice ? invoice.id : 'upcoming',
    customer: invoice.customer as string,
    subscription: invoice.subscription as string | null,
    status: invoice.status || 'draft',
    currency: invoice.currency,
    amount_due: invoice.amount_due,
    amount_paid: invoice.amount_paid,
    amount_remaining: invoice.amount_remaining,
    created: invoice.created,
    due_date: invoice.due_date,
    lines: {
      data: invoice.lines.data.map(line => ({
        id: line.id,
        amount: line.amount,
        currency: line.currency,
        description: line.description || '',
        period: {
          start: line.period.start,
          end: line.period.end,
        },
        price: {
          id: line.price?.id || '',
          product: line.price?.product as string,
          active: line.price?.active || false,
          currency: line.price?.currency || '',
          type: line.price?.type || 'one_time',
          unit_amount: line.price?.unit_amount || null,
          recurring: line.price?.recurring || null,
          metadata: line.price?.metadata || {},
        },
        proration: line.proration,
        quantity: line.quantity || 1,
      })),
    },
    metadata: invoice.metadata || {},
  }
}

export async function createCustomer(
  email: string,
  name?: string
): Promise<CustomerData> {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
    })

    return mapCustomerToData(customer)
  } catch (error) {
    throw handleStripeError(error as any)
  }
}

export async function getCustomer(customerId: string): Promise<CustomerData> {
  try {
    const customer = await stripe.customers.retrieve(customerId, {
      expand: ['subscriptions'],
    })

    if (customer.deleted) {
      throw new Error('Customer not found')
    }

    return mapCustomerToData(customer as Stripe.Customer)
  } catch (error) {
    throw handleStripeError(error as any)
  }
}

export async function updateCustomer(
  customerId: string,
  data: {
    email?: string
    name?: string
    phone?: string
    address?: {
      line1?: string
      line2?: string
      city?: string
      state?: string
      postal_code?: string
      country?: string
    }
    metadata?: Record<string, string>
  }
): Promise<CustomerData> {
  try {
    const customer = await stripe.customers.update(customerId, data)
    return mapCustomerToData(customer)
  } catch (error) {
    throw handleStripeError(error as any)
  }
}

export async function deleteCustomer(customerId: string): Promise<void> {
  try {
    await stripe.customers.del(customerId)
  } catch (error) {
    throw handleStripeError(error as any)
  }
}

export async function createSubscription(
  customerId: string,
  priceId: string,
  paymentMethodId?: string,
  trialDays?: number
): Promise<SubscriptionData> {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
      trial_period_days: trialDays,
      default_payment_method: paymentMethodId,
    })

    return mapSubscriptionToData(subscription)
  } catch (error) {
    throw handleStripeError(error as any)
  }
}

export async function getSubscription(
  subscriptionId: string
): Promise<SubscriptionData> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return mapSubscriptionToData(subscription)
  } catch (error) {
    throw handleStripeError(error as any)
  }
}

export async function updateSubscription(
  subscriptionId: string,
  data: {
    cancel_at_period_end?: boolean
    proration_behavior?: 'create_prorations' | 'none'
    items?: Array<{
      id?: string
      price?: string
      quantity?: number
    }>
    metadata?: Record<string, string>
  }
): Promise<SubscriptionData> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, data)
    return mapSubscriptionToData(subscription)
  } catch (error) {
    throw handleStripeError(error as any)
  }
}

export async function cancelSubscription(
  subscriptionId: string,
  cancelImmediately = false
): Promise<SubscriptionData> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: !cancelImmediately,
    })

    if (cancelImmediately) {
      await stripe.subscriptions.cancel(subscriptionId)
    }

    return mapSubscriptionToData(subscription)
  } catch (error) {
    throw handleStripeError(error as any)
  }
}

export async function resumeSubscription(
  subscriptionId: string
): Promise<SubscriptionData> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })
    return mapSubscriptionToData(subscription)
  } catch (error) {
    throw handleStripeError(error as any)
  }
}

export async function createSetupIntent(
  customerId: string
): Promise<SetupIntentData> {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    })
    return setupIntent as SetupIntentData
  } catch (error) {
    throw handleStripeError(error as any)
  }
}

export async function listPaymentMethods(
  customerId: string
): Promise<PaymentMethodData[]> {
  try {
    const paymentMethods = await stripe.customers.listPaymentMethods(
      customerId,
      {
        type: 'card',
      }
    )
    return paymentMethods.data as PaymentMethodData[]
  } catch (error) {
    throw handleStripeError(error as any)
  }
}

export async function attachPaymentMethod(
  customerId: string,
  paymentMethodId: string
): Promise<PaymentMethodData> {
  try {
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    })
    return paymentMethod as PaymentMethodData
  } catch (error) {
    throw handleStripeError(error as any)
  }
}

export async function detachPaymentMethod(
  paymentMethodId: string
): Promise<PaymentMethodData> {
  try {
    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId)
    return paymentMethod as PaymentMethodData
  } catch (error) {
    throw handleStripeError(error as any)
  }
}

export async function updateDefaultPaymentMethod(
  customerId: string,
  paymentMethodId: string
): Promise<CustomerData> {
  try {
    const customer = await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })
    return mapCustomerToData(customer)
  } catch (error) {
    throw handleStripeError(error as any)
  }
}

export async function listInvoices(customerId: string): Promise<InvoiceData[]> {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
    })
    return invoices.data.map(mapInvoiceToData)
  } catch (error) {
    throw handleStripeError(error as any)
  }
}

export async function getInvoice(invoiceId: string): Promise<InvoiceData> {
  try {
    const invoice = await stripe.invoices.retrieve(invoiceId)
    return mapInvoiceToData(invoice)
  } catch (error) {
    throw handleStripeError(error as any)
  }
}

export async function getUpcomingInvoice(
  customerId: string,
  subscriptionId?: string
): Promise<InvoiceData> {
  try {
    const invoice = await stripe.invoices.retrieveUpcoming({
      customer: customerId,
      subscription: subscriptionId,
    })
    return mapInvoiceToData(invoice)
  } catch (error) {
    throw handleStripeError(error as any)
  }
}

export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<{ url: string }> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })
    return { url: session.url }
  } catch (error) {
    throw handleStripeError(error as any)
  }
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ url: string | null }> {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    })
    return { url: session.url }
  } catch (error) {
    throw handleStripeError(error as any)
  }
}

export async function getBillingHistory(customerId: string): Promise<InvoiceData[]> {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 24, // Last 2 years
      status: 'paid'
    })
    return invoices.data.map(mapInvoiceToData)
  } catch (error) {
    throw handleStripeError(error as any)
  }
}

export async function getCurrentSubscription(customerId: string): Promise<SubscriptionData | null> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1
    })
    return subscriptions.data[0] ? mapSubscriptionToData(subscriptions.data[0]) : null
  } catch (error) {
    throw handleStripeError(error as any)
  }
}

export async function getSubscriptionPlans(): Promise<Array<{
  id: string
  name: string
  description: string
  price: number
  interval: 'month' | 'year'
  features: string[]
}>> {
  try {
    const prices = await stripe.prices.list({
      active: true,
      type: 'recurring',
      expand: ['data.product']
    })

    return prices.data.map(price => {
      const product = price.product as Stripe.Product
      return {
        id: price.id,
        name: product.name,
        description: product.description || '',
        price: price.unit_amount || 0,
        interval: price.recurring?.interval || 'month',
        features: product.features?.map(f => f.name) || []
      }
    })
  } catch (error) {
    throw handleStripeError(error as any)
  }
}

export async function upgradePlan(
  subscriptionId: string,
  newPriceId: string,
  immediateUpgrade = false
): Promise<SubscriptionData> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
      proration_behavior: immediateUpgrade ? 'create_prorations' : 'none',
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }]
    })
    return mapSubscriptionToData(updatedSubscription)
  } catch (error) {
    throw handleStripeError(error as any)
  }
}

export async function subscribe(
  customerId: string,
  priceId: string,
  paymentMethodId: string
): Promise<SubscriptionData> {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      expand: ['latest_invoice.payment_intent']
    })
    return mapSubscriptionToData(subscription)
  } catch (error) {
    throw handleStripeError(error as any)
  }
}
