import React, { useEffect, useState } from 'react'

import { performanceService } from '@/lib/services/performance'

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png' | 'avif'
  blur?: boolean
  alt: string
}

export function OptimizedImage({
  src,
  width,
  height,
  quality = 80,
  format = 'webp',
  blur = false,
  alt,
  ...props
}: Props) {
  const [optimizedSrc, setOptimizedSrc] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function optimizeImage() {
      try {
        setIsLoading(true)
        const optimized = await performanceService.optimizeImage(src, {
          width,
          height,
          quality,
          format,
          blur,
        })
        setOptimizedSrc(optimized)
      } catch (err) {
        logger.error('Failed to optimize image:', err)
        setError(
          err instanceof Error ? err : new Error('Failed to optimize image')
        )
        setOptimizedSrc(src) // Fallback to original source
      } finally {
        setIsLoading(false)
      }
    }

    optimizeImage()
  }, [src, width, height, quality, format, blur])

  if (error) {
    logger.warn('Image optimization failed, using original source:', error)
  }

  return (
    <div className="relative inline-block">
      <img
        src={optimizedSrc || src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        {...props}
        className={`${props.className || ''} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setIsLoading(false)}
        onError={e => {
          logger.error('Image failed to load:', e)
          setError(new Error('Failed to load image'))
          setIsLoading(false)
          // If optimized version fails, fall back to original
          if (optimizedSrc !== src) {
            setOptimizedSrc(src)
          }
        }}
      />
      {isLoading ? (
        <div
          className="absolute inset-0 animate-pulse bg-gray-200"
          style={{ width: width || '100%', height: height || '100%' }}
          role="presentation"
        />
      ) : null}
    </div>
  )
}
