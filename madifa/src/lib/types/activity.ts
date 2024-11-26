export interface ActivityData {
  date: string
  views: number
  searches: number
  interactions: number
}

export interface ActivityMetrics {
  totalActivities: number
  uniqueUsers: number
  averageActivitiesPerUser: number
  mostActiveHour: number
  activityByHour: number[]
  activityByDay: number[]
  topUsers: {
    userId: string
    activityCount: number
    lastActive: string
  }[]
} 
