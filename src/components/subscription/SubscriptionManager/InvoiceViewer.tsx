import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/useToast'
import type { Invoice } from '@/types/subscription'

interface InvoiceViewerProps {
  userId: string
  subscriptionService: {
    getInvoices: (userId: string) => Promise<Invoice[]>
    downloadInvoice: (invoiceId: string) => Promise<Blob>
  }
}

export default function InvoiceViewer({
  userId,
  subscriptionService,
}: InvoiceViewerProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    if (userId) {
      void loadInvoices()
    }
  }, [userId])

  const loadInvoices = async () => {
    try {
      setIsLoading(true)
      const data = await subscriptionService.getInvoices(userId)
      setInvoices(data)
    } catch (error) {
      console.error('Error loading invoices:', error)
      showToast('Failed to load invoices', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (invoiceId: string) => {
    try {
      const blob = await subscriptionService.downloadInvoice(invoiceId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoiceId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading invoice:', error)
      showToast('Failed to download invoice', 'error')
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Invoices</h2>

      <div className="space-y-4">
        {invoices.map(invoice => (
          <div
            key={invoice.id}
            className="flex items-center justify-between rounded-lg bg-gray-800 p-4"
          >
            <div>
              <p className="font-medium text-white">Invoice #{invoice.id}</p>
              <p className="text-sm text-gray-400">
                Issued: {new Date(invoice.created).toLocaleDateString()}
              </p>
              <p className="text-sm font-medium text-white">
                Amount: ${invoice.amount}
              </p>
            </div>

            <Button
              variant="secondary"
              onClick={() => handleDownload(invoice.id)}
            >
              Download
            </Button>
          </div>
        ))}

        {invoices.length === 0 && (
          <p className="text-center text-gray-400">No invoices found</p>
        )}
      </div>
    </div>
  )
}
