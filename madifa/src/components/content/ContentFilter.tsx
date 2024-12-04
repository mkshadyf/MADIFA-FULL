import React, { useState, useEffect } from 'react'
import { useContent } from '@/hooks/useContent'
import type { Content } from '@/types'

interface ContentFilterProps {
  className?: string
  onFilter: (filteredContent: Content[]) => void
}

export default function ContentFilter({ className = '', onFilter }: ContentFilterProps) {
  const { contents } = useContent()
  const [filters, setFilters] = useState({
    category: '',
    minDuration: '',
    maxDuration: '',
    releaseYear: '',
    searchTerm: ''
  })
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableYears, setAvailableYears] = useState<number[]>([])

  useEffect(() => {
    if (!contents) return

    // Extract unique categories and years
    const categories = new Set(contents.map(c => c.category))
    const years = new Set(contents.map(c => c.release_year))

    setAvailableCategories(Array.from(categories).sort())
    setAvailableYears(Array.from(years).sort((a, b) => b - a))
  }, [contents])

  useEffect(() => {
    if (!contents) return

    const filteredContent = contents.filter(content => {
      const matchesCategory = !filters.category || content.category === filters.category
      const matchesYear = !filters.releaseYear || content.release_year === Number(filters.releaseYear)
      const matchesDuration = (!filters.minDuration || content.duration >= Number(filters.minDuration)) &&
        (!filters.maxDuration || content.duration <= Number(filters.maxDuration))
      const matchesSearch = !filters.searchTerm || 
        content.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        content.description.toLowerCase().includes(filters.searchTerm.toLowerCase())

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
      searchTerm: ''
    })
  }

  return (
    <div className={`${className} bg-gray-900 rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-4">
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
            className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Category</label>
            <select
              value={filters.category}
              onChange={e => handleFilterChange('category', e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700"
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
            <label className="text-sm text-gray-400 block mb-1">Release Year</label>
            <select
              value={filters.releaseYear}
              onChange={e => handleFilterChange('releaseYear', e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700"
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
            <label className="text-sm text-gray-400 block mb-1">Min Duration (min)</label>
            <input
              type="number"
              value={filters.minDuration}
              onChange={e => handleFilterChange('minDuration', e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Max Duration (min)</label>
            <input
              type="number"
              value={filters.maxDuration}
              onChange={e => handleFilterChange('maxDuration', e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 