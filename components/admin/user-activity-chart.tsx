'use client'

import { useEffect, useRef } from 'react'
import Chart from 'chart.js/index'
import { createClient } from '@/lib/supabase/client'

interface ActivityData {
  date: string
  views: number
  searches: number
  interactions: number
}

export default function UserActivityChart() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data, error } = await supabase
          .from('user_activity')
          .select('action, created_at')
          .gte('created_at', thirtyDaysAgo.toISOString())

        if (error) throw error

        // Process data into daily counts
        const activityByDate = data.reduce((acc: Record<string, ActivityData>, item) => {
          const date = new Date(item.created_at).toLocaleDateString()
          if (!acc[date]) {
            acc[date] = {
              date,
              views: 0,
              searches: 0,
              interactions: 0
            }
          }

          switch (item.action) {
            case 'view':
              acc[date].views++
              break
            case 'search':
              acc[date].searches++
              break
            default:
              acc[date].interactions++
          }

          return acc
        }, {})

        const sortedData = Object.values(activityByDate).sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )

        if (chartRef.current) {
          const ctx = chartRef.current.getContext('2d')
          if (ctx) {
            new Chart(ctx, {
              type: 'line',
              data: {
                labels: sortedData.map(d => d.date),
                datasets: [
                  {
                    label: 'Views',
                    data: sortedData.map(d => d.views),
                    borderColor: 'rgb(99, 102, 241)',
                    tension: 0.1
                  },
                  {
                    label: 'Searches',
                    data: sortedData.map(d => d.searches),
                    borderColor: 'rgb(139, 92, 246)',
                    tension: 0.1
                  },
                  {
                    label: 'Other Interactions',
                    data: sortedData.map(d => d.interactions),
                    borderColor: 'rgb(167, 139, 250)',
                    tension: 0.1
                  }
                ]
              },
              options: {
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: { color: 'white' }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { color: 'white' }
                  },
                  x: {
                    ticks: { color: 'white' }
                  }
                }
              }
            })
          }
        }
      } catch (error) {
        console.error('Error fetching activity data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-semibold text-white mb-4">User Activity</h2>
      <canvas ref={chartRef} />
    </div>
  )
} 