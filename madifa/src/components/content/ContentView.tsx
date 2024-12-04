import { type Content } from '@/lib/supabase/database.types'
import OfflineToggle from './OfflineToggle'
import DownloadProgress from '../downloads/DownloadProgress'

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
      
      <DownloadProgress contentId={content.id} />
      
      {/* Rest of the content view */}
    </div>
  )
} 