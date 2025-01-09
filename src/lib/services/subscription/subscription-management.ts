import type {
  SubscriptionInterval,
  SubscriptionPlan,
} from '@/types/subscription'
import { Stripe } from 'stripe'

export class SubscriptionManagementService {
  private stripe: Stripe

  constructor(stripeClient: Stripe) {
    this.stripe = stripeClient
  }

  async getSubscriptionTiers(): Promise<SubscriptionPlan[]> {
    try {
      const products = await this.stripe.products.list({
        active: true,
        type: 'service',
        expand: ['data.default_price'],
      })

      return products.data
        .filter(
          (
            product
          ): product is Stripe.Product & { default_price: Stripe.Price } =>
            !!product.default_price && !!product.metadata?.features
        )
        .map(product => {
          const interval = (product.default_price as Stripe.Price).recurring
            ?.interval as SubscriptionInterval
          const features = (product.metadata.features as string)
            .split(',')
            .map(f => f.trim())

          return {
            id: product.id,
            name: product.name,
            description: product.description || '',
            price: (product.default_price as Stripe.Price).unit_amount! / 100,
            currency: (product.default_price as Stripe.Price).currency,
            interval,
            features,
            metadata: product.metadata,
          }
        })
    } catch (error) {
      throw this.handleError(error)
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error
    }
    return new Error('An unknown error occurred')
  }
}
