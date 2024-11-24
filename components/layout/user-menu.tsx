'use client'

import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import Image from 'next/image'

export function UserMenu() {
  const router = useRouter()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/signin')
  }

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
          {user?.email?.[0].toUpperCase()}
        </div>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-black/80 backdrop-blur-sm shadow-lg ring-1 ring-white/10 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => router.push('/profile')}
                  className={`${
                    active ? 'bg-gray-800 text-white' : 'text-gray-300'
                  } group flex w-full items-center px-4 py-2 text-sm`}
                >
                  Profile
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => router.push('/settings')}
                  className={`${
                    active ? 'bg-gray-800 text-white' : 'text-gray-300'
                  } group flex w-full items-center px-4 py-2 text-sm`}
                >
                  Settings
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleSignOut}
                  className={`${
                    active ? 'bg-gray-800 text-white' : 'text-gray-300'
                  } group flex w-full items-center px-4 py-2 text-sm`}
                >
                  Sign out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
} 