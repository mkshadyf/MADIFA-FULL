import React, { useState } from 'react'
import { useContent } from '@/hooks/useContent'
import { contentManager } from '@/lib/services/content-manager'
import { useToast } from '@/hooks/useToast'
import type { Content } from '@/types/content'

interface OrganizationSuggestion {
  type: 'category' | 'tag' | 'metadata'
  content: Content
  suggestion: string
  reason: string
}

export default function ContentOrganizationHelper() {
  const { data: contents } = useContent()
  const { showToast } = useToast()
  const [suggestions, setSuggestions] = useState<OrganizationSuggestion[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeCategorization = async () => {
    if (!contents || isAnalyzing) return

    setIsAnalyzing(true)
    try {
      // Analyze content for potential improvements
      const newSuggestions: OrganizationSuggestion[] = []

      // Check for uncategorized content
      contents.forEach(content => {
        if (!content.category || content.category === 'uncategorized') {
          newSuggestions.push({
            type: 'category',
            content,
            suggestion: 'Add category',
            reason: 'Content is uncategorized'
          })
        }

        // Check for missing tags
        if (!content.tags || content.tags.length === 0) {
          newSuggestions.push({
            type: 'tag',
            content,
            suggestion: 'Add tags',
            reason: 'No tags specified'
          })
        }

        // Check for incomplete metadata
        if (!content.duration || !content.size) {
          newSuggestions.push({
            type: 'metadata',
            content,
            suggestion: 'Complete metadata',
            reason: 'Missing important metadata'
          })
        }
      })

      setSuggestions(newSuggestions)
    } catch (error) {
      console.error('Failed to analyze content:', error)
      showToast('Failed to analyze content organization', 'error')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Organization Helper</h3>
        <button
          onClick={analyzeCategorization}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {suggestions.length > 0 ? (
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.content.id}-${index}`}
              className="p-3 bg-gray-800 rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-white font-medium">{suggestion.content.title}</h4>
                  <p className="text-sm text-gray-400">{suggestion.reason}</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-indigo-500/10 text-indigo-400">
                  {suggestion.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center">
          {isAnalyzing ? 'Analyzing content...' : 'No suggestions yet'}
        </p>
      )}
    </div>
  )
} 