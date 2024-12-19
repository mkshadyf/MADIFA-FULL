import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'

import { subscriptionService } from '@/lib/services/subscription'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'

export default function InvoiceViewer () {
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { showToast } = useToast()

  useEffect(() => {
    if (user) {
      loadInvoices()
    }
  }, [user])

  const loadInvoices = async () => {
    try {
      setIsLoading(true)
      const data = await subscriptionService.getInvoices(user!.id)
      setInvoices(data)
    } catch (error) {
      logger.error('Error loading invoices:', error)
      showToast('Failed to load invoices', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (invoiceId: string) => {
    try {
      const blob = await subscriptionService.downloadInvoice(invoiceId)
      const url = window.URL.createObjectURL(blob)
      a')
      a.href = url
      a.download = `invoice-${invoiceId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      logger.error('Error downloading invoice:', error)
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
              <p className="font-medium text-white">Invoice #{invoice.invoice_number}</p>
              <p className="text-sm text-gray-400">
                Issued: {new Date(invoice.issued_date).toLocaleDateString()}
              </p>
              <p className="text-sm font-medium text-white">Amount: ${invoice.amount}</p>
            </div>

            <Button variant="secondary" onClick={() => handleDownload(invoice.id)}>
              Download
            </Button>
          </div>
        ))}

        {invoices.length === 0 && <p className="text-center text-gray-400">No invoices found</p>}
      </div>
    </div>
  )
}
