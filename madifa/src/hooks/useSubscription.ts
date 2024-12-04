import { subscriptionService } from '@/lib/services/subscription'
import type { InvalidateQueryFilters } from '@tanstack/react-query'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

export function useSubscription() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const toast = useToast()

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: () => user ? subscriptionService.getCurrentSubscription(user.id) : null,
    enabled: !!user
  })

  const { data: plans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => subscriptionService.getPlans()
  })

  const { mutate: subscribe } = useMutation({
    mutationFn: (planId: string) =>
      subscriptionService.createSubscription(user!.id, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['subscription', user?.id]
      } as InvalidateQueryFilters)
      toast.success('Subscription updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update subscription')
      console.error('Subscription error:', error)
    }
  })

  const { mutate: cancel } = useMutation({
    mutationFn: () => subscriptionService.cancelSubscription(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['subscription', user?.id]
      } as InvalidateQueryFilters)
      toast.success('Subscription cancelled')
    },
    onError: (error) => {
      toast.error('Failed to cancel subscription')
      console.error('Cancellation error:', error)
    }
  })

  const { mutate: reactivate } = useMutation({
    mutationFn: () => subscriptionService.reactivateSubscription(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['subscription', user?.id]
      } as InvalidateQueryFilters)
      toast.success('Subscription reactivated')
    },
    onError: (error) => {
      toast.error('Failed to reactivate subscription')
      console.error('Reactivation error:', error)
    }
  })

  return {
    subscription,
    plans,
    isLoading,
    subscribe,
    cancel,
    reactivate
  }
} 