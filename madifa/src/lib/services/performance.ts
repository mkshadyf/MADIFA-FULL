import { createClient } from '@/lib/supabase/client'
import { getCLS, getFCP, getFID, getLCP, getTTFB, type Metric } from 'web-vitals'

const supabase = createClient()

export type PerformanceMetric = {
  id?: string
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  navigationType: string
  route: string
  timestamp: string
}

const getRating = (name: string, value: number): PerformanceMetric['rating'] => {
  switch (name) {
    case 'CLS':
      return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor'
    case 'FCP':
      return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor'
    case 'FID':
      return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor'
    case 'LCP':
      return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor'
    case 'TTFB':
      return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor'
    default:
      return 'needs-improvement'
  }
}

const reportMetric = async (metric: Metric) => {
  const performanceMetric: PerformanceMetric = {
    name: metric.name,
    value: metric.value,
    rating: getRating(metric.name, metric.value),
    delta: metric.delta,
    navigationType: metric.navigationType,
    route: window.location.pathname,
    timestamp: new Date().toISOString()
  }

  try {
    await supabase.from('performance_metrics').insert([performanceMetric])
  } catch (error) {
    console.error('Failed to report performance metric:', error)
  }
}

export const initPerformanceMonitoring = () => {
  getCLS(reportMetric)
  getFCP(reportMetric)
  getFID(reportMetric)
  getLCP(reportMetric)
  getTTFB(reportMetric)
}

export const getPerformanceMetrics = async (
  options: {
    startDate?: string
    endDate?: string
    route?: string
    metric?: string
  } = {}
) => {
  let query = supabase.from('performance_metrics').select('*')

  if (options.startDate) {
    query = query.gte('timestamp', options.startDate)
  }
  if (options.endDate) {
    query = query.lte('timestamp', options.endDate)
  }
  if (options.route) {
    query = query.eq('route', options.route)
  }
  if (options.metric) {
    query = query.eq('name', options.metric)
  }

  const { data, error } = await query.order('timestamp', { ascending: false })
  if (error) throw error
  return data
}

export const getPerformanceStats = async () => {
  const { data, error } = await supabase
    .from('performance_metrics')
    .select('name, value, rating')
    .order('timestamp', { ascending: false })
    .limit(1000)

  if (error) throw error

  return data.reduce((acc, metric) => {
    if (!acc[metric.name]) {
      acc[metric.name] = {
        average: 0,
        good: 0,
        needsImprovement: 0,
        poor: 0,
        total: 0
      }
    }

    acc[metric.name].average =
      (acc[metric.name].average * acc[metric.name].total + metric.value) /
      (acc[metric.name].total + 1)
    acc[metric.name].total++

    switch (metric.rating) {
      case 'good':
        acc[metric.name].good++
        break
      case 'needs-improvement':
        acc[metric.name].needsImprovement++
        break
      case 'poor':
        acc[metric.name].poor++
        break
    }

    return acc
  }, {} as Record<string, {
    average: number
    good: number
    needsImprovement: number
    poor: number
    total: number
  }>)
} 