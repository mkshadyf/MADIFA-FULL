/**
 * CSP Report handling
 * This module provides a function to handle Content-Security-Policy violation reports
 */

/**
 * Handle CSP violation report
 */
export async function handleCSPReport(report: unknown): Promise<void> {
  // Log CSP violation report to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.warn('CSP Violation:', report);
    return;
  }
  
  // In production, you could send this to your logging service
  // For example with Sentry:
  // sentryService.captureMessage(`CSP Violation: ${JSON.stringify(report)}`);
  
  // Or store in your database, send to a logging service, etc.
}
