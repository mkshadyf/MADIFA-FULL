import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'


interface CategoryStats {
  name: string
  count: number
  totalViews: number
  averageRating: number
}

interface ViewingData {
  content: {
    category: string
  } | null
}

export default function ContentCategories() {
  const [categories, setCategories] = useState<CategoryStats[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Get content counts by category
        const { data: contentData, error: contentError } = await supabase
          .from('content')
          .select('category')

        if (contentError) throw contentError

        // Get viewing stats by category
        const { data: viewingData, error: viewingError } = await supabase
          .from('viewing_history')
          .select('content(category)') as { data: ViewingData[] | null, error: any }

        if (viewingError) throw viewingError

        // Process data
        const categoryStats = contentData.reduce(
          (acc: Record<string, CategoryStats>, item) => {
            const category = item.category
            if (!acc[category]) {
              acc[category] = {
                name: category,
                count: 0,
                totalViews: 0,
                averageRating: 0,
              }
            }
            acc[category].count++
            return acc
          },
          {}
        )

        // Add viewing stats
        if (viewingData) {
          viewingData.forEach(view => {
            const category = view.content?.category
            if (category && categoryStats[category]) {
              categoryStats[category].totalViews++
            }
          })
        }

        setCategories(Object.values(categoryStats))
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) return <div>Loading categories...</div>

  return (
    <div className="overflow-hidden rounded-lg bg-gray-800">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium text-white">Content Categories</h3>
      </div>
      <div className="border-t border-gray-700">
        <dl>
          {categories.map((category, index) => (
            <div
              key={category.name}
              className={`${
                index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'
              } px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}
            >
              <dt className="text-sm font-medium text-gray-300">
                {category.name}
              </dt>
              <dd className="mt-1 text-sm text-gray-400 sm:col-span-2 sm:mt-0">
                <div className="flex justify-between">
                  <span>{category.count} items</span>
                  <span>{category.totalViews} views</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="h-full bg-indigo-500"
                    style={{
                      width: `${(category.count / Math.max(...categories.map(c => c.count))) * 100}%`,
                    }}
                  />
                </div>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
