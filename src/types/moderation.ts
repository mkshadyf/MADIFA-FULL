export type ContentFlag = {
  type: 'text' | 'image' | 'video'
  rule_id: string
  severity: 'low' | 'medium' | 'high'
  details: string
  content_id?: string
  created_at?: Date
}

export type ModerationAction = {
  content_id: string
  type: 'remove' | 'restrict' | 'warn'
  reason: string
  message?: string
  restrictions?: string[]
  created_at?: Date
}

export type ModerationRule = {
  id: string
  name: string
  description: string
  type: 'text' | 'image' | 'video'
  pattern: string
  severity: 'low' | 'medium' | 'high'
  enabled: boolean
  created_at: Date
  updated_at: Date
}
