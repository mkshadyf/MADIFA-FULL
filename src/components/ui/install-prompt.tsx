import React from 'react'

import { usePWA } from '../../hooks/usePWA'

export default function InstallPrompt() {
  const { isInstallable, install, updateAvailable, update } = usePWA()

  if (!isInstallable && !updateAvailable) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 rounded-lg bg-indigo-600 p-4 text-white shadow-lg md:left-auto md:right-4 md:max-w-md">
      {isInstallable ? (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Install Madifa</h3>
            <p className="text-sm text-indigo-100">Get the best experience</p>
          </div>
          <button
            onClick={install}
            className="rounded-md bg-white px-4 py-2 font-medium text-indigo-600"
          >
            Install
          </button>
        </div>
      ) : null}

      {updateAvailable ? (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Update Available</h3>
            <p className="text-sm text-indigo-100">Get the latest version</p>
          </div>
          <button
            onClick={update}
            className="rounded-md bg-white px-4 py-2 font-medium text-indigo-600"
          >
            Update
          </button>
        </div>
      ) : null}
    </div>
  )
}
