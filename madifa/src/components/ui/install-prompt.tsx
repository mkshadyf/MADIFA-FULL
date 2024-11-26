import React from 'react'
import { usePWA } from '../../hooks/usePWA'

export default function InstallPrompt() {
  const { isInstallable, install, updateAvailable, update } = usePWA()

  if (!isInstallable && !updateAvailable) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-indigo-600 text-white rounded-lg p-4 shadow-lg md:max-w-md md:left-auto md:right-4">
      {isInstallable && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Install Madifa</h3>
            <p className="text-sm text-indigo-100">Get the best experience</p>
          </div>
          <button
            onClick={install}
            className="px-4 py-2 bg-white text-indigo-600 rounded-md font-medium"
          >
            Install
          </button>
        </div>
      )}

      {updateAvailable && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Update Available</h3>
            <p className="text-sm text-indigo-100">Get the latest version</p>
          </div>
          <button
            onClick={update}
            className="px-4 py-2 bg-white text-indigo-600 rounded-md font-medium"
          >
            Update
          </button>
        </div>
      )}
    </div>
  )
} 