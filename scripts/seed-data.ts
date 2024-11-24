import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seedCategories() {
  const categories = [
    {
      name: 'Movies',
      slug: 'movies',
      description: 'Feature-length films'
    },
    {
      name: 'Series',
      slug: 'series',
      description: 'TV shows and web series'
    },
    {
      name: 'Documentaries',
      slug: 'documentaries',
      description: 'Non-fiction content'
    },
    {
      name: 'Kids',
      slug: 'kids',
      description: 'Child-friendly content'
    },
    {
      name: 'Educational',
      slug: 'educational',
      description: 'Learning materials and courses'
    }
  ]

  const { error } = await supabase.from('categories').upsert(categories)
  if (error) throw error
  console.log('Categories seeded successfully')
}

async function seedUserPreferences() {
  const preferences = {
    preferred_categories: ['movies', 'series'],
    preferred_languages: ['en'],
    email_notifications: true,
    push_notifications: true,
    theme: 'system'
  }

  // This is just an example - you'll need to get actual user IDs
  const { data: users } = await supabase.auth.admin.listUsers()

  for (const user of users.users) {
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        ...preferences
      })
    if (error) throw error
  }
  console.log('User preferences seeded successfully')
}

async function main() {
  try {
    await seedCategories()
    await seedUserPreferences()
    console.log('Database seeded successfully')
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

main() 