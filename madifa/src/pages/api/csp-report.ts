import { createAPIError } from '@/lib/error'
import { supabase } from '@/lib/supabase/client'
import type { NextApiRequest, NextApiResponse } from 'next'

interface CSPViolation {
  'csp-report': {
    'document-uri': string
    'referrer': string
    'violated-directive': string
    'effective-directive': string
    'original-policy': string
    'blocked-uri': string
    'status-code': number
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const violation: CSPViolation = req.body

    // Store violation report
    const { error } = await supabase
      .from('csp_violations')
      .insert({
        document_uri: violation['csp-report']['document-uri'],
        referrer: violation['csp-report']['referrer'],
        violated_directive: violation['csp-report']['violated-directive'],
        effective_directive: violation['csp-report']['effective-directive'],
        original_policy: violation['csp-report']['original-policy'],
        blocked_uri: violation['csp-report']['blocked-uri'],
        status_code: violation['csp-report']['status-code'],
        user_agent: req.headers['user-agent'],
        ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        created_at: new Date().toISOString()
      })

    if (error) throw error

    // Log violation for monitoring
    console.warn('CSP Violation:', {
      ...violation['csp-report'],
      userAgent: req.headers['user-agent'],
      ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    })

    return res.status(204).end()
  } catch (error) {
    console.error('Error processing CSP violation:', error)
    throw createAPIError(500, 'Failed to process CSP violation', 'CSP_VIOLATION_ERROR', error)
  }
} 