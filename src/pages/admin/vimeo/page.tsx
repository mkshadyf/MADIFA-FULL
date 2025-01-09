import VimeoContentManager from '@/components/admin/Content/vimeo-content-manager'
import VimeoFolderBrowser from '@/components/admin/Content/vimeo-folder-browser'

export default function VimeoPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-2xl font-bold text-white">
          Vimeo Content Management
        </h1>

        <div className="space-y-8">
          <VimeoContentManager />
          <VimeoFolderBrowser />
        </div>
      </div>
    </div>
  )
}
