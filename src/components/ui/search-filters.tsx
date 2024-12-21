import React from "react"
import { useState } from 'react'

interface SearchFiltersProps {
  onFilterChange: (filters: FilterState) => void
}

interface FilterState {
  category: string
  language: string
  year: string
  duration: string
  rating: string
}

const initialFilters: FilterState = {
  category: '',
  language: '',
  year: '',
  duration: '',
  rating: '',
}

const categories = ['Movies', 'Series', 'Folk Music', 'Poetry', 'Theatre', 'Documentaries'] as const
const languages = ['English', 'Zulu', 'Xhosa', 'Afrikaans', 'Sotho', 'Tswana'] as const
const years = ['2024', '2023', '2022', '2021', '2020', 'Older'] as const
const durations = ['< 30 min', '30-60 min', '1-2 hrs', '> 2 hrs'] as const
const ratings = ['All Ages', '7+', '13+', '16+', '18+'] as const

export default function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-300 hover:text-white"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
        <span>Filters</span>
      </button>

      {isOpen ? (
        <div className="absolute top-full z-50 mt-2 w-64 rounded-lg bg-gray-800 p-4 shadow-lg">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Category</label>
              <select
                title="Category"
                value={filters.category}
                onChange={e => handleFilterChange('category', e.target.value)}
                className="w-full rounded-md bg-gray-700 px-3 py-2 text-white"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category.toLowerCase()}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Language</label>
              <select
                title="Language"
                value={filters.language}
                onChange={e => handleFilterChange('language', e.target.value)}
                className="w-full rounded-md bg-gray-700 px-3 py-2 text-white"
              >
                <option value="">All Languages</option>
                {languages.map((language) => (
                  <option key={language} value={language.toLowerCase()}>
                    {language}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Year</label>
              <select
                title="Year"
                value={filters.year}
                onChange={e => handleFilterChange('year', e.target.value)}
                className="w-full rounded-md bg-gray-700 px-3 py-2 text-white"
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year.toLowerCase()}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Duration</label>
              <select
                title="Duration"
                value={filters.duration}
                onChange={e => handleFilterChange('duration', e.target.value)}
                className="w-full rounded-md bg-gray-700 px-3 py-2 text-white"
              >
                <option value="">Any Duration</option>
                {durations.map((duration) => (
                  <option key={duration} value={duration.toLowerCase()}>
                    {duration}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Age Rating</label>
              <select
                title="Age Rating"
                value={filters.rating}
                onChange={e => handleFilterChange('rating', e.target.value)}
                className="w-full rounded-md bg-gray-700 px-3 py-2 text-white"
              >
                <option value="">Any Rating</option>
                {ratings.map((rating) => (
                  <option key={rating} value={rating.toLowerCase()}>
                    {rating}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
