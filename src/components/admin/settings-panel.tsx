import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

interface SystemSettings {
  maxUploadSize: number
  allowedFileTypes: string[]
  storageQuota: number
  maxBandwidthPerUser: number
  maintenanceMode: boolean
  systemNotifications: boolean
  autoBackup: boolean
  backupFrequency: 'daily' | 'weekly' | 'monthly'
}

interface EmailSettings {
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPassword: string
  senderEmail: string
  senderName: string
  emailTemplates: {
    welcome: string
    resetPassword: string
    verifyEmail: string
  }
}

export default function SettingsPanel() {
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(
    null
  )
  const [emailSettings, setEmailSettings] = useState<EmailSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data: systemData, error: systemError } = await supabase
          .from('system_settings')
          .select('*')
          .single()

        if (systemError) throw systemError

        const { data: emailData, error: emailError } = await supabase
          .from('email_settings')
          .select('*')
          .single()

        if (emailError) throw emailError

        setSystemSettings(systemData)
        setEmailSettings(emailData)
      } catch (error) {
        logger.error('Error fetching settings:', error)
        setError('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSystemSettingChange = (key: keyof SystemSettings, value: any) => {
    setSystemSettings(prev => (prev ? { ...prev, [key]: value } : null))
  }

  const handleEmailSettingChange = (key: keyof EmailSettings, value: any) => {
    setEmailSettings(prev => (prev ? { ...prev, [key]: value } : null))
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Update system settings
      const { error: systemError } = await supabase
        .from('system_settings')
        .update(systemSettings)
        .eq('id', 1)

      if (systemError) throw systemError

      // Update email settings
      const { error: emailError } = await supabase
        .from('email_settings')
        .update(emailSettings)
        .eq('id', 1)

      if (emailError) throw emailError

      setSuccess('Settings saved successfully')
    } catch (error) {
      logger.error('Error saving settings:', error)
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading settings...</div>

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-gray-800 p-6">
        <h2 className="mb-4 text-xl font-bold text-white">System Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Max Upload Size (MB)
            </label>
            <input
              type="number"
              value={systemSettings?.maxUploadSize}
              onChange={e =>
                handleSystemSettingChange(
                  'maxUploadSize',
                  parseInt(e.target.value)
                )
              }
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Storage Quota (GB)
            </label>
            <input
              type="number"
              value={systemSettings?.storageQuota}
              onChange={e =>
                handleSystemSettingChange(
                  'storageQuota',
                  parseInt(e.target.value)
                )
              }
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={systemSettings?.maintenanceMode}
                onChange={e =>
                  handleSystemSettingChange('maintenanceMode', e.target.checked)
                }
                className="rounded border-gray-600 bg-gray-700 text-indigo-600"
              />
              <span className="ml-2 text-sm text-gray-300">
                Maintenance Mode
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={systemSettings?.systemNotifications}
                onChange={e =>
                  handleSystemSettingChange(
                    'systemNotifications',
                    e.target.checked
                  )
                }
                className="rounded border-gray-600 bg-gray-700 text-indigo-600"
              />
              <span className="ml-2 text-sm text-gray-300">
                System Notifications
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={systemSettings?.autoBackup}
                onChange={e =>
                  handleSystemSettingChange('autoBackup', e.target.checked)
                }
                className="rounded border-gray-600 bg-gray-700 text-indigo-600"
              />
              <span className="ml-2 text-sm text-gray-300">Auto Backup</span>
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-gray-800 p-6">
        <h2 className="mb-4 text-xl font-bold text-white">Email Settings</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                SMTP Host
              </label>
              <input
                type="text"
                value={emailSettings?.smtpHost}
                onChange={e =>
                  handleEmailSettingChange('smtpHost', e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                SMTP Port
              </label>
              <input
                type="number"
                value={emailSettings?.smtpPort}
                onChange={e =>
                  handleEmailSettingChange('smtpPort', parseInt(e.target.value))
                }
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Sender Email
              </label>
              <input
                type="email"
                value={emailSettings?.senderEmail}
                onChange={e =>
                  handleEmailSettingChange('senderEmail', e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Sender Name
              </label>
              <input
                type="text"
                value={emailSettings?.senderName}
                onChange={e =>
                  handleEmailSettingChange('senderName', e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {error ? <div className="text-sm text-red-500">{error}</div> : null}

      {success ? <div className="text-sm text-green-500">{success}</div> : null}

      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
