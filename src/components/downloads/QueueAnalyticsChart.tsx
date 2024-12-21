import React from "react"
 import {
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

 import { useQueueAnalytics } from '@/hooks/useQueueAnalytics'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface QueueAnalyticsChartProps {
  className?: string
}

export default function QueueAnalyticsChart ({ className = '' }: QueueAnalyticsChartProps) {
  const { history, isLoading } = useQueueAnalytics()

  if (isLoading || !history) {
    return (
      <div className={`${className} flex h-64 items-center justify-center rounded-lg bg-gray-900`}>
        <span className="text-gray-400">Loading analytics...</span>
      </div>
    )
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#9CA3AF',
        },
      },
      title: {
        display: true,
        text: 'Queue Performance Metrics',
        color: '#D1D5DB',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y
            const label = context.dataset.label
            return `${label}: ${(value * 100).toFixed(1)}%`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: '#374151',
        },
        ticks: {
          color: '#9CA3AF',
        },
      },
      y: {
        grid: {
          color: '#374151',
        },
        ticks: {
          color: '#9CA3AF',
          callback: (value: number) => `${(value * 100).toFixed(0)}%`,
        },
      },
    },
  }

  const data = {
    labels: history.dates.map(date =>
      new Date(date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    ),
    datasets: [
      {
        label: 'Space Efficiency',
        data: history.metrics.spaceEfficiency,
        borderColor: '#10B981',
        backgroundColor: '#10B98140',
        tension: 0.3,
      },
      {
        label: 'Time Efficiency',
        data: history.metrics.timeEfficiency,
        borderColor: '#3B82F6',
        backgroundColor: '#3B82F640',
        tension: 0.3,
      },
      {
        label: 'Priority Alignment',
        data: history.metrics.priorityAlignment,
        borderColor: '#8B5CF6',
        backgroundColor: '#8B5CF640',
        tension: 0.3,
      },
    ],
  }

  return (
    <div className={className}>
      <div className="h-64">
        <Line data={data} options={options as ChartOptions<'line'>} />
      </div>
    </div>
  )
}
