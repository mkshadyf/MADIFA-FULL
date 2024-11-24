import { createServerClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const category = searchParams.get('category')
  const limit = parseInt(searchParams.get('limit') || '20')

  const supabase = createServerClient()

  try {
    let queryBuilder = supabase
      .from('content')
      .select(`
        *,
        categories (
          name,
          slug
        ),
        content_stats (
          views,
          rating
        )
      `)
      .limit(limit)

    if (query) {
      queryBuilder = queryBuilder.or(`
        title.ilike.%${query}%,
        description.ilike.%${query}%,
        categories.name.ilike.%${query}%
      `)
    }

    if (category) {
      queryBuilder = queryBuilder.eq('category', category)
    }

    const { data, error } = await queryBuilder

    if (error) throw error

    return NextResponse.json({ results: data })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
} 