import React from 'react'
import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  read: boolean
  created_at: string
}

export default function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showAll, setShowAll] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(showAll ? 50 : 5)

        if (error) throw error

        setNotifications(data || [])
        setUnreadCount(data?.filter(n => !n.read).length || 0)
      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()

    // Subscribe to new notifications
    const channel = supabase
      .channel('admin_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications',
        },
        payload => {
          setNotifications(prev => [payload.new as Notification, ...prev])
          setUnreadCount(count => count + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [showAll])

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('id', id)

      if (error) throw error

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      )
      setUnreadCount(count => count - 1)
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('read', false)

      if (error) throw error

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  if (loading) return <div>Loading notifications...</div>

  return (
    <div className="rounded-lg bg-gray-800 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-white">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 rounded-full bg-indigo-600 px-2 py-1 text-xs text-white">
              {unreadCount} new
            </span>
          )}
        </h2>
        <div className="flex space-x-4">
          <button
            onClick={markAllAsRead}
            className="text-sm text-gray-400 hover:text-white"
            disabled={unreadCount === 0}
          >
            Mark all as read
          </button>
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-gray-400 hover:text-white"
          >
            {showAll ? 'Show less' : 'View all'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`rounded-lg p-4 ${notification.read ? 'bg-gray-750' : 'bg-gray-700'}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-white">{notification.title}</h3>
                <p className="mt-1 text-sm text-gray-400">
                  {notification.message}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  Mark as read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="py-8 text-center text-gray-400">No notifications</div>
      )}
    </div>
  )
}
