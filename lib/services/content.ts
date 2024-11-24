import { createClient } from '@/lib/supabase/server'
import type { Content } from '@/types/content'

export async function getContent(contentId: string): Promise<Content> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('id', contentId)
      .single()

    if (error) throw error
    if (!data) throw new Error('Content not found')

    return data as Content
  } catch (error) {
    console.error('Error fetching content:', error)
    throw error
  }
} 