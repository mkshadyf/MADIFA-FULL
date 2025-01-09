import type { NextApiRequest, NextApiResponse } from 'next'
import { captureError } from '../../lib/error'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const report = req.body['csp-report']
    if (!report) {
      return res.status(400).json({ message: 'Invalid CSP report' })
    }

    // Log CSP violation
    captureError('CSP Violation', {
      'document-uri': report['document-uri'],
      'violated-directive': report['violated-directive'],
      'blocked-uri': report['blocked-uri'],
      'source-file': report['source-file'],
      'line-number': report['line-number'],
      'column-number': report['column-number'],
    })

    return res.status(204).end()
  } catch (error) {
    console.error('Error processing CSP report:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
