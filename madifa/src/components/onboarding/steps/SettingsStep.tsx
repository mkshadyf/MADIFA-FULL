interface SettingsStepProps {
  settings: {
    notifications: boolean
    quality: string
  }
  onUpdate: (settings: { notifications: boolean; quality: string }) => void
  onComplete: () => void
  onBack: () => void
}

export function SettingsStep({
  settings,
  onUpdate,
  onComplete,
  onBack
}: SettingsStepProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg border border-gray-700">
          <div>
            <h3 className="font-medium text-white">Notifications</h3>
            <p className="text-sm text-gray-400">Get updates about new content</p>
          </div>
          <button
            onClick={() => onUpdate({ ...settings, notifications: !settings.notifications })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notifications ? 'bg-indigo-500' : 'bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="p-4 rounded-lg border border-gray-700">
          <h3 className="font-medium text-white mb-4">Video Quality</h3>
          <div className="space-y-2">
            {['Auto', '1080p', '720p', '480p'].map((quality) => (
              <button
                key={quality}
                onClick={() => onUpdate({ ...settings, quality })}
                className={`w-full p-3 rounded-lg transition-colors ${
                  settings.quality === quality
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {quality}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary">
          Back
        </button>
        <button onClick={onComplete} className="btn-primary">
          Complete Setup
        </button>
      </div>
    </div>
  )
} 
