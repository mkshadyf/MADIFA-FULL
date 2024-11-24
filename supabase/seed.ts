import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import type { Database } from '../types/supabase'

config({ path: '.env.local' })

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seedCategories() {
  const categories = [
    {
      name: 'Movies',
      slug: 'movies',
      description: 'Feature-length films',
      thumbnail_url: '/images/categories/movies.jpg'
    },
    {
      name: 'Series',
      slug: 'series',
      description: 'TV shows and web series',
      thumbnail_url: '/images/categories/series.jpg'
    },
    {
      name: 'Documentaries',
      slug: 'documentaries',
      description: 'Non-fiction content',
      thumbnail_url: '/images/categories/documentaries.jpg'
    }
  ]

  const { error } = await supabase.from('categories').upsert(categories)
  if (error) throw error
  console.log('✓ Categories seeded')
}

async function seedContent() {
  // Get category IDs
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, slug')
  
  if (catError) throw catError

  const content = [
    {
      title: 'Sample Movie 1',
      slug: 'sample-movie-1',
      description: 'A sample movie description',
      vimeo_id: '123456789',
      thumbnail_url: '/images/content/sample-movie-1.jpg',
      duration: 7200, // 2 hours in seconds
      category_id: categories.find(c => c.slug === 'movies')?.id
    },
    {
      title: 'Sample Series 1',
      slug: 'sample-series-1',
      description: 'A sample series description',
      vimeo_id: '987654321',
      thumbnail_url: '/images/content/sample-series-1.jpg',
      duration: 1800, // 30 minutes in seconds
      category_id: categories.find(c => c.slug === 'series')?.id
    }
  ]

  const { error } = await supabase.from('content').upsert(content)
  if (error) throw error
  console.log('✓ Content seeded')
}

async function main() {
  try {
    await seedCategories()
    await seedContent()
    console.log('✓ Database seeded successfully')
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

main() 