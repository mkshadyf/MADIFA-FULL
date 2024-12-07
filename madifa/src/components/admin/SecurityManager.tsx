import { useState } from 'react'
import type { ContentSecurity } from '@/types/vimeo'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/Button'
import { ErrorBoundary } from '@/components/ui/error-boundary'


interface SecurityManagerProps {
  videoId: string;
  currentSecurity: ContentSecurity['privacy'];
  onUpdate: (privacy: ContentSecurity['privacy']) => Promise<void>;
  loading?: boolean;
}

function SecurityManagerContent({ videoId, currentSecurity, onUpdate, loading }: SecurityManagerProps) {
  const [security, setSecurity] = useState<ContentSecurity>({
    privacy: {
      view: 'anybody',
      embed: 'public',
      comments: 'anybody',
      download: false,
      add: false
    },
    embed_settings: {
      buttons: {
        like: true,
        share: true,
        embed: true,
        watchlater: true,
        hd: true
      },
      logos: {
        vimeo: true,
        custom: {
          active: false
        }
      },
      title: {
        name: true,
        owner: true,
        portrait: true
      }
    },
    domain_restrictions: {
      allowed_domains: [],
      whitelist_enabled: false
    },
    type: 'jwt',
    key: '',
    secret: '',
    ...currentSecurity
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handlePrivacyChange = (field: keyof ContentSecurity['privacy'], value: any) => {
    setHasChanges(true)
    setSecurity(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: value
      }
    }))
  }

  const handleEmbedSettingsChange = (field: string, value: boolean) => {
    setHasChanges(true)
    setSecurity(prev => ({
      ...prev,
      embed_settings: {
        ...prev.embed_settings,
        buttons: {
          ...prev.embed_settings.buttons,
          [field]: value
        }
      }
    }))
  }

  const handleDomainChange = (enabled: boolean) => {
    setHasChanges(true)
    setSecurity(prev => ({
      ...prev,
      domain_restrictions: {
        ...prev.domain_restrictions,
        whitelist_enabled: enabled
      }
    }))
  }

  const handleReset = () => {
    if (currentSecurity) {
      setSecurity(currentSecurity)
      setHasChanges(false)
      toast.success('Settings reset to original values')
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      await onUpdate(security.privacy)
      setHasChanges(false)
      toast.success('Security settings updated successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update security settings')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Privacy Settings</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="view-privacy" className="block text-sm font-medium">
              Who can view this video?
            </label>
            <select
              id="view-privacy"
              value={security.privacy.view}
              onChange={e => handlePrivacyChange('view', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              disabled={isSubmitting}
            >
              <option value="anybody">Anybody</option>
              <option value="nobody">Nobody</option>
              <option value="password">Password protected</option>
              <option value="disable">Disable</option>
              <option value="unlisted">Unlisted</option>
            </select>
          </div>

          <div>
            <label htmlFor="embed-privacy" className="block text-sm font-medium">
              Who can embed this video?
            </label>
            <select
              id="embed-privacy"
              value={security.privacy.embed}
              onChange={e => handlePrivacyChange('embed', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              disabled={isSubmitting}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div>
            <label htmlFor="comments-privacy" className="block text-sm font-medium">
              Who can comment on this video?
            </label>
            <select
              id="comments-privacy"
              value={security.privacy.comments}
              onChange={e => handlePrivacyChange('comments', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              disabled={isSubmitting}
            >
              <option value="anybody">Anybody</option>
              <option value="nobody">Nobody</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              id="download-privacy"
              type="checkbox"
              checked={security.privacy.download}
              onChange={e => handlePrivacyChange('download', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              disabled={isSubmitting}
            />
            <label htmlFor="download-privacy" className="ml-3 block text-sm font-medium">
              Allow downloads
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="add-privacy"
              type="checkbox"
              checked={security.privacy.add}
              onChange={e => handlePrivacyChange('add', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              disabled={isSubmitting}
            />
            <label htmlFor="add-privacy" className="ml-3 block text-sm font-medium">
              Allow adding to collections
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Embed Settings</h3>
        <div className="mt-4 space-y-4">
          {Object.entries(security.embed_settings.buttons).map(([key, value]) => (
            <div key={key} className="flex items-center">
              <input
                type="checkbox"
                id={`embed-${key}`}
                checked={value}
                onChange={e => handleEmbedSettingsChange(key, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                disabled={isSubmitting}
              />
              <label htmlFor={`embed-${key}`} className="ml-3 block text-sm font-medium">
                Show {key} button
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Domain Restrictions</h3>
        <div className="mt-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="domain-whitelist"
              checked={security.domain_restrictions.whitelist_enabled}
              onChange={e => handleDomainChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              disabled={isSubmitting}
            />
            <label htmlFor="domain-whitelist" className="ml-3 block text-sm font-medium">
              Enable domain whitelist
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        {hasChanges && (
          <Button
            type="button"
            onClick={handleReset}
            variant="secondary"
            disabled={isSubmitting || !currentSecurity}
          >
            Reset
          </Button>
        )}
        <Button
          type="button"
          onClick={handleSubmit}
          variant="primary"
          disabled={isSubmitting || !hasChanges}
          loading={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}

export function SecurityManager(props: SecurityManagerProps) {
  return (
    <ErrorBoundary>
      <SecurityManagerContent {...props} />
    </ErrorBoundary>
  )
} 