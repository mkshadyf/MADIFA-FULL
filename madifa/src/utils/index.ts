export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${padZero(minutes)}:${padZero(remainingSeconds)}`
  }
  return `${minutes}:${padZero(remainingSeconds)}`
}

function padZero(num: number): string {
  return num.toString().padStart(2, '0')
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function generateThumbnailUrl(videoUrl: string): string {
  // Add your thumbnail generation logic here
  return videoUrl.replace('/video/', '/thumbnail/')
} 