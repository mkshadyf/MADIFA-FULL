'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ImageWithFallbackProps {
  src: string
  fallbackSrc: string
  alt: string
  [key: string]: any
}

export function ImageWithFallback({
  src,
  fallbackSrc,
  alt,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src)

  return (
    <Image
      {...props}
      alt={alt}
      src={imgSrc}
      onError={() => setImgSrc(fallbackSrc)}
    />
  )
} 