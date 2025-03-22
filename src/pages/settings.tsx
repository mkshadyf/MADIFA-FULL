import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { sentryService } from '@/lib/services/sentry';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { usePWA } from '@/hooks/usePWA';

type Settings = {
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  download_quality: 'auto' | 'high' | 'medium' | 'low';
  autoplay: boolean;
  language: string;
};

const defaultSettings: Settings = {
  theme: 'system',
  notifications_enabled: true,
  download_quality: 'auto',
  autoplay: true,
  language: 'en',
};

export default function Settings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  const { isInstallable, install, updateAvailable, update, isInstalled } = usePWA();

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        setUserId(user.id);
        
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            // No settings found, use defaults
            return;
          }
          throw error;
        }
        
        if (data) {
          setSettings({
            theme: data.theme || defaultSettings.theme,
            notifications_enabled: data.notifications_enabled !== undefined 
              ? data.notifications_enabled 
              : defaultSettings.notifications_enabled,
            download_quality: data.download_quality || defaultSettings.download_quality,
            autoplay: data.autoplay !== undefined 
              ? data.autoplay 
              : defaultSettings.autoplay,
            language: data.language || defaultSettings.language,
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load settings';
        setError(errorMessage);
        sentryService.captureException(err instanceof Error ? err : new Error('Unknown error'), {
          context: 'Settings page',
          extra: { location: 'fetchSettings' }
        });
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    if (!userId) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString(),
        });
        
      if (error) throw error;
      
      setSuccess('Settings saved successfully');
      
      // Apply theme
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (settings.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings';
      setError(errorMessage);
      sentryService.captureException(err instanceof Error ? err : new Error('Unknown error'), {
        context: 'Settings page',
        extra: { location: 'handleSaveSettings' }
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setError(null);
      
      // Get the user's email
      const { data } = await supabase.auth.getSession();
      const email = data.session?.user.email;
      
      if (!email) {
        throw new Error('Cannot determine user email');
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/update-password`,
        }
      );
      
      if (error) throw error;
      
      setSuccess('Password reset email sent. Please check your inbox.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate password reset';
      setError(errorMessage);
      sentryService.captureException(err instanceof Error ? err : new Error('Unknown error'), {
        context: 'Settings page',
        extra: { location: 'handleChangePassword' }
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Settings</h1>
      
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{success}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {/* App Settings */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">App Settings</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your app preferences and installation options.
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {/* App Installation Section */}
              <div className="rounded-md bg-gray-50 p-4">
                <h3 className="text-md font-medium text-gray-900">App Installation</h3>
                
                {isInstalled ? (
                  <p className="mt-2 text-sm text-gray-600">
                    This app is installed on your device.
                  </p>
                ) : isInstallable ? (
                  <div className="mt-3 flex items-center">
                    <p className="mr-4 text-sm text-gray-600">
                      Install this app on your device for a better experience
                    </p>
                    <button
                      onClick={install}
                      className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Install
                    </button>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-600">
                    This app can be installed from your browser menu.
                  </p>
                )}
                
                {updateAvailable && (
                  <div className="mt-3 flex items-center">
                    <p className="mr-4 text-sm text-gray-600">
                      A new version of the app is available
                    </p>
                    <button
                      onClick={update}
                      className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                    >
                      Update
                    </button>
                  </div>
                )}
              </div>
              
              {/* Theme */}
              <div>
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                  Theme
                </label>
                <select
                  id="theme"
                  name="theme"
                  value={settings.theme}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value as 'light' | 'dark' | 'system' })}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm"
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              
              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
                  <p className="text-sm text-gray-500">Receive push notifications</p>
                </div>
                <button
                  type="button"
                  className={`${
                    settings.notifications_enabled ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                  onClick={() => setSettings({
                    ...settings,
                    notifications_enabled: !settings.notifications_enabled,
                  })}
                >
                  <span className="sr-only">Toggle notifications</span>
                  <span
                    className={`${
                      settings.notifications_enabled ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>
              
              {/* Download Quality */}
              <div>
                <label htmlFor="download-quality" className="block text-sm font-medium text-gray-700">
                  Download Quality
                </label>
                <select
                  id="download-quality"
                  name="download-quality"
                  value={settings.download_quality}
                  onChange={(e) => setSettings({ ...settings, download_quality: e.target.value as 'auto' | 'high' | 'medium' | 'low' })}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm"
                >
                  <option value="auto">Auto (Recommended)</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Higher quality uses more storage space.
                </p>
              </div>
              
              {/* Autoplay */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Autoplay</h3>
                  <p className="text-sm text-gray-500">Automatically play videos</p>
                </div>
                <button
                  type="button"
                  className={`${
                    settings.autoplay ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                  onClick={() => setSettings({
                    ...settings,
                    autoplay: !settings.autoplay,
                  })}
                >
                  <span className="sr-only">Toggle autoplay</span>
                  <span
                    className={`${
                      settings.autoplay ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>
              
              {/* Language */}
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                  Language
                </label>
                <select
                  id="language"
                  name="language"
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none sm:text-sm"
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {saving ? <LoadingSpinner size="sm" variant="white" text="" /> : 'Save Settings'}
            </button>
          </div>
        </div>
        
        {/* Account Settings */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Account Settings</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your account security.
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Change Password</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Update your password to keep your account secure.
                </p>
                <button
                  type="button"
                  onClick={handleChangePassword}
                  className="mt-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Reset Password
                </button>
              </div>
              
              <div className="pt-4">
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Delete Account</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                      </div>
                      <div className="mt-4">
                        <button
                          type="button"
                          className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
