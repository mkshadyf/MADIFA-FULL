import type { Content } from '@/types/content'
import BaseGrid, { type BaseGridProps } from './BaseGrid'

type ContentGridProps = Omit<
  BaseGridProps,
  'renderItem' | 'renderOverlay' | 'renderActions'
>

export default function ContentGrid(props: ContentGridProps) {
  return <BaseGrid {...props} />
}
