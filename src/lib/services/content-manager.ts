import { supabase } from '@/lib/supabase/client'
import type { Content, ContentMetadata, ContentStatus } from '@/types/content'

export async function getContent(id: string): Promise<Content> {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error('Failed to fetch content')
  }

  return data
}

export async function updateContent(
  id: string,
  updates: Partial<Content>
): Promise<Content> {
  const { data, error } = await supabase
    .from('content')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error('Failed to update content')
  }

  return data
}

export async function deleteContent(id: string): Promise<void> {
  const { error } = await supabase.from('content').delete().eq('id', id)

  if (error) {
    throw new Error('Failed to delete content')
  }
}

export async function updateContentStatus(
  id: string,
  status: ContentStatus
): Promise<void> {
  const { error } = await supabase
    .from('content')
    .update({ status })
    .eq('id', id)

  if (error) {
    throw new Error('Failed to update content status')
  }
}

export async function updateContentMetadata(
  id: string,
  metadata: ContentMetadata
): Promise<void> {
  const { error } = await supabase
    .from('content')
    .update({ metadata })
    .eq('id', id)

  if (error) {
    throw new Error('Failed to update content metadata')
  }
}

export async function batchUpdateContent(
  ids: string[],
  updates: Partial<Content>
): Promise<void> {
  const { error } = await supabase.from('content').update(updates).in('id', ids)

  if (error) {
    throw new Error('Failed to batch update content')
  }
}

export async function batchDeleteContent(ids: string[]): Promise<void> {
  const { error } = await supabase.from('content').delete().in('id', ids)

  if (error) {
    throw new Error('Failed to batch delete content')
  }
}

export async function getContentByCategory(
  category: string
): Promise<Content[]> {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch content by category')
  }

  return data || []
}

export async function getContentByStatus(
  status: ContentStatus
): Promise<Content[]> {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch content by status')
  }

  return data || []
}

export async function getContentMetrics(id: string) {
  const { data, error } = await supabase.rpc('get_content_metrics', {
    content_id: id,
  })

  if (error) {
    throw new Error('Failed to fetch content metrics')
  }

  return data
}

export async function getContentAnalytics(
  startDate?: string,
  endDate?: string
) {
  const query = supabase.rpc('get_content_analytics')

  if (startDate) {
    query.gte('date', startDate)
  }
  if (endDate) {
    query.lte('date', endDate)
  }

  const { data, error } = await query

  if (error) {
    throw new Error('Failed to fetch content analytics')
  }

  return data
}
