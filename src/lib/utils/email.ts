interface EmailOptions {
  to: string
  subject: string
  template: string
  data: Record<string, any>
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  // Implement email sending logic
  console.log('Sending email:', options)
}
