import type { NextApiRequest, NextApiResponse } from 'next'
import { captureError } from '../../lib/error'

// Define the CSP report structure
interface CSPReport {
  'document-uri'?: string;
  'referrer'?: string;
  'violated-directive'?: string;
  'effective-directive'?: string;
  'original-policy'?: string;
  'blocked-uri'?: string;
  'source-file'?: string;
  'line-number'?: number;
  'column-number'?: number;
  'status-code'?: number;
  'script-sample'?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Correctly check method with type guard
  if (req.method as string !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Use a type assertion to properly handle the body
    const reportData = req.body as unknown;
    
    // Now validate and safely access csp-report
    if (typeof reportData !== 'object' || reportData === null) {
      return res.status(400).json({ message: 'Invalid report format' });
    }
    
    const reportObj = reportData as Record<string, unknown>;
    const report = reportObj['csp-report'] as CSPReport;
    
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
