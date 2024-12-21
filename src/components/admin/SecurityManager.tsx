import React, { useState } from 'react'

interface ContentSecurity {
  privacy: {
    view: 'disable' | 'nobody' | 'unlisted' | 'anybody'
    embed: 'private' | 'public'
    comments: 'nobody' | 'all'
    download: boolean
    add: boolean
  }
}

interface SecurityManagerProps {
  videoId: string
  currentSecurity?: ContentSecurity['privacy']
  onUpdate: (security: ContentSecurity['privacy']) => Promise<void>
  loading?: boolean
}

export function SecurityManager({
   currentSecurity,
  onUpdate,
  loading,
}: SecurityManagerProps) {
  const [security, setSecurity] = useState<ContentSecurity['privacy']>(
    currentSecurity || {
      view: 'disable',
      embed: 'private',
      comments: 'nobody',
      download: false,
      add: false,
    }
  )

  const handleChange = <K extends keyof ContentSecurity['privacy']>(
    field: K,
    value: ContentSecurity['privacy'][K]
  ): void => {
    setSecurity(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div>
          <label htmlFor="view-privacy" className="block text-sm font-medium text-gray-700">
            View Privacy
          </label>
          <select
            id="view-privacy"
            value={security.view}
            onChange={e =>
              handleChange('view', e.target.value as ContentSecurity['privacy']['view'])
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            aria-label="Select view privacy setting"
          >
            <option value="disable">Disable</option>
            <option value="nobody">Nobody</option>
            <option value="unlisted">Unlisted</option>
            <option value="anybody">Anybody</option>
          </select>
        </div>

        <div>
          <label htmlFor="embed-privacy" className="block text-sm font-medium text-gray-700">
            Embed Privacy
          </label>
          <select
            id="embed-privacy"
            value={security.embed}
            onChange={e =>
              handleChange('embed', e.target.value as ContentSecurity['privacy']['embed'])
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            aria-label="Select embed privacy setting"
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </div>

        <div>
          <label htmlFor="comments-privacy" className="block text-sm font-medium text-gray-700">
            Comments
          </label>
          <select
            id="comments-privacy"
            value={security.comments}
            onChange={e =>
              handleChange('comments', e.target.value as ContentSecurity['privacy']['comments'])
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            aria-label="Select comments privacy setting"
          >
            <option value="nobody">Nobody</option>
            <option value="anybody">Anybody</option>
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <input
              id="download-toggle"
              type="checkbox"
              checked={security.download}
              onChange={e => handleChange('download', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              aria-label="Allow download"
            />
            <label htmlFor="download-toggle" className="ml-2 block text-sm text-gray-900">
              Allow download
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="add-toggle"
              type="checkbox"
              checked={security.add}
              onChange={e => handleChange('add', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              aria-label="Allow adding to collections"
            />
            <label htmlFor="add-toggle" className="ml-2 block text-sm text-gray-900">
              Allow adding to collections
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => onUpdate(security)}
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

export default SecurityManager
