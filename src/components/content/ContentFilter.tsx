import { useEffect, useState } from 'react'
import type { Content } from '@/types'

import { useContent } from '@/hooks/useContent'

interface ContentFilterProps {
  className?: string
  onFilter: (filteredContent: Content[]) => void
}

export default function ContentFilter({
  className = '',
  onFilter,
}: ContentFilterProps) {
  const { data: contents } = useContent()
  const [filters, setFilters] = useState({
    category: '',
    minDuration: '',
    maxDuration: '', 
    releaseYear: '',
    searchTerm: '',
  })
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableYears, setAvailableYears] = useState<number[]>([])

  useEffect(() => {
    if (!contents) return

    // Extract unique categories and years from valid content
    const categories = new Set(
      contents
        .filter((c: Content) => c.category !== undefined)
        .map((c: Content) => c.category)
    )
    const years = new Set(
      contents
        .filter((c: Content) => c.release_year !== undefined)
        .map((c: Content) => c.release_year)
    )

    setAvailableCategories(
      Array.from(categories)
        .filter((c): c is string => typeof c === 'string')
        .sort()
    )
    setAvailableYears(
      Array.from(years)
        .filter((y): y is number => typeof y === 'number')
        .sort((a, b) => b - a)
    )
  }, [contents])

  useEffect(() => {
    if (!contents) return

    const filteredContent = contents.filter((content: Content) => {
      const matchesCategory =
        !filters.category || content.category === filters.category
      const matchesYear =
        !filters.releaseYear ||
        content.release_year === Number(filters.releaseYear)
      const matchesDuration =
        (!filters.minDuration ||
          (content.duration ?? 0) >= Number(filters.minDuration)) &&
        (!filters.maxDuration ||
          (content.duration ?? 0) <= Number(filters.maxDuration))
      const matchesSearch =
        !filters.searchTerm ||
        content.title
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) ||
        content.description?.toLowerCase().includes(filters.searchTerm.toLowerCase())

      return matchesCategory && matchesYear && matchesDuration && matchesSearch
    })

    onFilter(filteredContent)
  }, [contents, filters, onFilter])

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      minDuration: '',
      maxDuration: '',
      releaseYear: '',
      searchTerm: '',
    })
  }

  return (
    <div className={`${className} rounded-lg bg-gray-900 p-4`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Filter Content</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-gray-400 hover:text-white"
        >
          Clear Filters
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Search content..."
            value={filters.searchTerm}
            onChange={e => handleFilterChange('searchTerm', e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-gray-400">Category</label>
            <select
              title="Category"
              value={filters.category}
              onChange={e => handleFilterChange('category', e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-white"
            >
              <option value="">All Categories</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-400">
              Release Year
            </label>
            <select
              title="Release Year"
              value={filters.releaseYear}
              onChange={e => handleFilterChange('releaseYear', e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-white"
            >
              <option value="">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-gray-400">
              Min Duration (min)
            </label>
            <input
              type="number"
              title="Min Duration"
              value={filters.minDuration}
              onChange={e => handleFilterChange('minDuration', e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">
              Max Duration (min)
            </label>
            <input
              type="number"
              title="Max Duration"
              value={filters.maxDuration}
              onChange={e => handleFilterChange('maxDuration', e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-white"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
