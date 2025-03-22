import React from 'react';

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  style?: React.CSSProperties;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Custom Image component as a replacement for Next.js Image
 * This component provides a similar API but uses the standard img element underneath
 */
export function Image({
  src,
  alt,
  width,
  height,
  className,
  style,
  loading = 'lazy',
  onLoad,
  onError,
  ...rest
}: ImageProps) {
  const imgStyle: React.CSSProperties = {
    ...style,
    objectFit: rest.fill ? 'cover' : 'initial',
    position: rest.fill ? 'absolute' : 'relative',
    width: rest.fill ? '100%' : undefined,
    height: rest.fill ? '100%' : undefined,
  };

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={imgStyle}
      loading={loading}
      onLoad={onLoad}
      onError={onError}
    />
  );
}

export default Image;
