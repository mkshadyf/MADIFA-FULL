import { DownloadProgress } from '@/components/downloads/DownloadProgress'
import type { Content } from '@/types/content'
import OfflineToggle from './OfflineToggle'

interface ContentViewProps {
  content: Content
}

export default function ContentView({ content }: ContentViewProps) {
  return (
    <div>
      {/* Existing content view code */}

      <div className="mt-4">
        <OfflineToggle contentId={content.id} />
      </div>

      <DownloadProgress contentId={content.id} progress={0} status="pending" />

      {/* Rest of the content view */}
    </div>
  )
}
