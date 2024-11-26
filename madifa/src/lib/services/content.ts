import { api } from '@/lib/api/client'
import type { Content } from '@/types'

export async function getContent(id: string) {
  return api.get<Content>('content', { query: { id } })
}

export async function searchContent(query: string) {
  return api.get<Content[]>('content', {
    query: { title: `ilike.%${query}%` }
  })
}

export async function getFavorites(userId: string) {
  return api.get<Content[]>('favorites', {
    query: { user_id: userId }
  })
}

export async function addToFavorites(userId: string, contentId: string) {
  return api.post('favorites', { user_id: userId, content_id: contentId })
}

export async function removeFromFavorites(userId: string, contentId: string) {
  return api.delete('favorites', `${userId}_${contentId}`)
} 
