import type { UseMutationOptions } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createErrorContext, handleError } from '@/lib/utils/error-handler'

interface MutationContext {
  previousData?: unknown
}

interface MutationOptions<TData, TVariables>
  extends Omit<
    UseMutationOptions<TData, Error, TVariables, MutationContext>,
    'mutationFn'
  > {
  invalidateQueries?: string[]
  optimisticUpdate?: {
    queryKey: string[]
    updateFn: (oldData: any, variables: TVariables) => any
  }
}

export function useDataMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: MutationOptions<TData, TVariables> = {}
) {
  const queryClient = useQueryClient()
  const { invalidateQueries, optimisticUpdate, ...mutationOptions } = options

  return useMutation<TData, Error, TVariables, MutationContext>({
    mutationFn: async variables => {
      try {
        return await mutationFn(variables)
      } catch (error) {
        throw handleError(error, createErrorContext('DataMutation', 'update', {
          operation: 'mutate',
          variables
        }))
      }
    },
    onMutate: async (variables): Promise<MutationContext> => {
      if (optimisticUpdate) {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: optimisticUpdate.queryKey })

        // Snapshot the previous value
        const previousData = queryClient.getQueryData(optimisticUpdate.queryKey)

        // Optimistically update to the new value
        queryClient.setQueryData(optimisticUpdate.queryKey, (old: any) =>
          optimisticUpdate.updateFn(old, variables)
        )

        // Return a context object with the snapshotted value
        return { previousData }
      }
      return {}
    },
    onError: (err, variables, context) => {
      if (optimisticUpdate && context?.previousData) {
        // If the mutation fails, use the context returned from onMutate to roll back
        queryClient.setQueryData(
          optimisticUpdate.queryKey,
          context.previousData
        )
      }
      if (options.onError) {
        options.onError(err, variables, context)
      }
    },
    onSuccess: async (data, variables, context) => {
      if (invalidateQueries) {
        await Promise.all(
          invalidateQueries.map(query =>
            queryClient.invalidateQueries({ queryKey: [query] })
          )
        )
      }
      if (options.onSuccess) {
        options.onSuccess(data, variables, context)
      }
    },
    ...mutationOptions,
  })
}

// Helper function to create a mutation function
export function createMutation<TData = any, TVariables = any>(
  url: string,
  method: string = 'POST',
  options: RequestInit = {}
): (variables: TVariables) => Promise<TData> {
  return async (variables: TVariables) => {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(variables),
      ...options,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'An error occurred while updating data')
    }

    return response.json()
  }
}
