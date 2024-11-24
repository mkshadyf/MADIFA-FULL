'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile, ProfileUpdate, UserPreferences } from '@/lib/types/profile'

export default function ProfileSettings() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const supabase = createClient()

  // Form state
  const [fullName, setFullName] = useState('')
  const [pinCode, setPinCode] = useState('')
  const [preferences, setPreferences] = useState<UserPreferences>({
    email_notifications: true,
    autoplay: true,
    default_quality: '1080p'
  })

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error) throw error

        setProfile(data)
        setFullName(data.full_name)
        setPinCode(data.pin_code || '')
        setPreferences(data.preferences || {
          email_notifications: true,
          autoplay: true,
          default_quality: '1080p'
        })
      } catch (error) {
        console.error('Error loading profile:', error)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) return

    setSaving(true)
    setError(null)
    setMessage(null)

    try {
      const updates: ProfileUpdate = {
        full_name: fullName,
        pin_code: pinCode || null,
        preferences
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', profile.id)

      if (error) throw error

      setMessage('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">Profile Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Information */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">PIN Code</label>
                <input
                  type="password"
                  maxLength={4}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  placeholder="Optional 4-digit PIN"
                />
              </div>
            </div>
          </div>

          {/* Playback Preferences */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Playback Preferences</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">Autoplay Next Episode</label>
                <input
                  type="checkbox"
                  checked={preferences.autoplay}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    autoplay: e.target.checked
                  }))}
                  className="rounded bg-gray-700 border-gray-600 text-indigo-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Default Quality</label>
                <select
                  value={preferences.default_quality}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    default_quality: e.target.value as '480p' | '720p' | '1080p'
                  }))}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                >
                  <option value="480p">480p</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Notifications</h2>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Email Notifications</label>
              <input
                type="checkbox"
                checked={preferences.email_notifications}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  email_notifications: e.target.checked
                }))}
                className="rounded bg-gray-700 border-gray-600 text-indigo-600"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {message && (
            <div className="text-green-500 text-sm">{message}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={saving}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 