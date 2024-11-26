import type { CDNConfig } from '@/lib/types/streaming'

export const cdnConfig: CDNConfig = {
  provider: 'cloudflare',
  domain: process.env.NEXT_PUBLIC_CDN_DOMAIN || 'stream.madifa.co.za',
  securityToken: process.env.CDN_SECURITY_TOKEN,
  region: 'af-south-1'
}

export function getCDNUrl(path: string): string {
  return `https://${cdnConfig.domain}/${path}`
}

export function generateSecureUrl(path: string, expiresIn: number = 3600): string {
  if (!cdnConfig.securityToken) {
    return getCDNUrl(path)
  }

  const expires = Math.floor(Date.now() / 1000) + expiresIn
  const signature = generateUrlSignature(path, expires)

  return `${getCDNUrl(path)}?token=${signature}&expires=${expires}`
}

function generateUrlSignature(path: string, expires: number): string {
  const message = `${path}${expires}`
  // Implement HMAC signature generation here
  return 'signature'
} 
