import type { ChartData, ChartOptions } from 'chart.js'

export interface LineChartProps {
  data: ChartData<'line'>
  options?: ChartOptions<'line'>
}

export interface ChartDataPoint {
  x: string | number
  y: number
}

export interface DatasetConfig {
  label: string
  data: ChartDataPoint[]
  borderColor: string
  backgroundColor?: string
  tension?: number
  fill?: boolean
} 