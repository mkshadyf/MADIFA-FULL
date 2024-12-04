import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

interface FilterOption {
  id: string
  label: string
  value: string
}

interface ContentFiltersProps {
  onFilterChange?: (filters: FilterState) => void
  initialFilters?: Partial<FilterState>
}

interface FilterState {
  category: string
  language: string
  quality: string
  sort: string
  duration?: 'short' | 'medium' | 'long'
  rating?: number
  releaseYear?: number
}

interface LanguageData {
  language: string
}

export default function ContentFilters({ onFilterChange, initialFilters }: ContentFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [categories, setCategories] = useState<FilterOption[]>([])
  const [languages, setLanguages] = useState<FilterOption[]>([])
  const [qualities, setQualities] = useState<FilterOption[]>([])
  const supabase = createClient()

  const currentFilters = {
    category: searchParams.get('category') || '',
    language: searchParams.get('language') || '',
    quality: searchParams.get('quality') || '',
    sort: searchParams.get('sort') || 'newest',
    duration: searchParams.get('duration') as FilterState['duration'],
    rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
    releaseYear: searchParams.get('year') ? Number(searchParams.get('year')) : undefined
  }

  useEffect(() => {
    const fetchFilterOptions = async () => {
      // Fetch categories
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name')

      if (categoryData) {
        setCategories(categoryData.map(cat => ({
          id: cat.id,
          label: cat.name,
          value: cat.slug
        })))
      }

      // Fetch available languages
      const { data: langData } = await supabase
        .from('content_metadata')
        .select('language')
        .not('language', 'is', null)
        .order('language')
        .then(({ data }) => {
          const uniqueLanguages = Array.from(
            new Set((data || []).map(d => d.language as string))
          )
          return { 
            data: uniqueLanguages.map(lang => ({ language: lang })) 
          }
        })

      if (langData) {
        setLanguages(langData.map(lang => ({
          id: lang.language,
          label: new Intl.DisplayNames(['en'], { type: 'language' }).of(lang.language) || lang.language,
          value: lang.language
        })))
      }

      // Set available qualities
      setQualities([
        { id: 'hd', label: 'HD', value: 'hd' },
        { id: 'fhd', label: 'Full HD', value: 'fhd' },
        { id: '4k', label: '4K', value: '4k' }
      ])
    }

    fetchFilterOptions()
  }, [])

  const handleFilterChange = (key: keyof FilterState, value: string | number | undefined) => {
    const newParams = new URLSearchParams(searchParams)
    
    if (value) {
      newParams.set(key, String(value))
    } else {
      newParams.delete(key)
    }
    
    setSearchParams(newParams)
    
    if (onFilterChange) {
      onFilterChange({
        ...currentFilters,
        [key]: value
      })
    }
  }

  const clearFilters = () => {
    setSearchParams(new URLSearchParams())
    if (onFilterChange) {
      onFilterChange({
        category: '',
        language: '',
        quality: '',
        sort: 'newest'
      })
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Filters</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-400 hover:text-white"
          >
            {isOpen ? 'Hide Filters' : 'Show Filters'}
          </button>
          {Object.values(currentFilters).some(Boolean) && (
            <button
              onClick={clearFilters}
              className="text-red-400 hover:text-red-300"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Category
            </label>
            <select
              value={currentFilters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md px-3 py-2"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Language
            </label>
            <select
              value={currentFilters.language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md px-3 py-2"
            >
              <option value="">All Languages</option>
              {languages.map((language) => (
                <option key={language.id} value={language.value}>
                  {language.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quality Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Quality
            </label>
            <select
              value={currentFilters.quality}
              onChange={(e) => handleFilterChange('quality', e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md px-3 py-2"
            >
              <option value="">All Qualities</option>
              {qualities.map((quality) => (
                <option key={quality.id} value={quality.value}>
                  {quality.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Sort By
            </label>
            <select
              value={currentFilters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md px-3 py-2"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setSearchParams(new URLSearchParams())}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Clear Filters
          </button>
        </div>
      </motion.div>
    </div>
  )
} 