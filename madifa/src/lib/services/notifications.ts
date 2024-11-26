import { createClient } from '@/lib/supabase/server'

interface Notification {
  type: 'subscription_sync_error' | 'subscription_expired' | 'payment_failed'
  userId: string
  message: string
  data?: Record<string, any>
}

export async function sendNotification(notification: Notification) {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: notification.userId,
        type: notification.type,
        message: notification.message,
        data: notification.data,
        read: false,
        created_at: new Date().toISOString()
      })

    if (error) throw error

    // If critical error, also send email
    if (notification.type === 'subscription_sync_error') {
      await sendErrorEmail(notification)
    }
  } catch (error) {
    console.error('Error sending notification:', error)
    throw error
  }
}

async function sendErrorEmail(notification: Notification) {
  // Implement email sending logic here
  // This could use SendGrid, AWS SES, etc.
  console.log('Sending error email:', notification)
} 
