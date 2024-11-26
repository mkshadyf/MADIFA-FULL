

import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'

interface ChartData {
  labels: string[]
  values: number[]
}

interface AnalyticsChartsProps {
  viewingData: ChartData
  categoryData: ChartData
  subscriptionData: ChartData
}

export default function AnalyticsCharts({ viewingData, categoryData, subscriptionData }: AnalyticsChartsProps) {
  const viewingChartRef = useRef<HTMLCanvasElement>(null)
  const categoryChartRef = useRef<HTMLCanvasElement>(null)
  const subscriptionChartRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (viewingChartRef.current) {
      const ctx = viewingChartRef.current.getContext('2d')
      if (ctx) {
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: viewingData.labels,
            datasets: [{
              label: 'Views',
              data: viewingData.values,
              borderColor: 'rgb(99, 102, 241)',
              tension: 0.1
            }]
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

    if (categoryChartRef.current) {
      const ctx = categoryChartRef.current.getContext('2d')
      if (ctx) {
        new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: categoryData.labels,
            datasets: [{
              data: categoryData.values,
              backgroundColor: [
                'rgb(99, 102, 241)',
                'rgb(167, 139, 250)',
                'rgb(139, 92, 246)',
                'rgb(124, 58, 237)',
                'rgb(109, 40, 217)'
              ]
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
                labels: { color: 'white' }
              }
            }
          }
        })
      }
    }

    if (subscriptionChartRef.current) {
      const ctx = subscriptionChartRef.current.getContext('2d')
      if (ctx) {
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: subscriptionData.labels,
            datasets: [{
              label: 'Subscriptions',
              data: subscriptionData.values,
              backgroundColor: 'rgb(99, 102, 241)'
            }]
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
  }, [viewingData, categoryData, subscriptionData])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-4">Views Over Time</h3>
        <canvas ref={viewingChartRef} />
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-4">Content by Category</h3>
        <canvas ref={categoryChartRef} />
      </div>

      <div className="bg-gray-800 p-6 rounded-lg lg:col-span-2">
        <h3 className="text-lg font-medium text-white mb-4">Subscription Growth</h3>
        <canvas ref={subscriptionChartRef} />
      </div>
    </div>
  )
} 
