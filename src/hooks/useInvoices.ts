import { useAuth } from '@/hooks/useAuth'
import { subscriptionService } from '@/lib/services/subscription'
import type { Invoice } from '@/types/subscription'
import { useCallback, useEffect, useState } from 'react'

export function useInvoices() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadInvoices = useCallback(async () => {
    if (!user) {
      setInvoices([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const userInvoices = await subscriptionService.getInvoices()
      setInvoices(userInvoices)
      setError(null)
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load invoices')
      )
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void loadInvoices()
  }, [loadInvoices])

  const downloadInvoice = useCallback(async (invoiceId: string) => {
    try {
      setLoading(true)
      const blob = await subscriptionService.downloadInvoice()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${invoiceId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setError(null)
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to download invoice')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    invoices,
    loading,
    error,
    downloadInvoice,
    refresh: loadInvoices,
  }
}
