import React from "react"
interface LanguageSelectionStepProps {
  selectedLanguages: string[]
  onSelect: (languages: string[]) => void
  onNext: () => void
  onBack: () => void
}

export function LanguageSelectionStep({
  selectedLanguages,
  onSelect,
  onNext,
  onBack,
}: LanguageSelectionStepProps) {
  const languages = [
    'English',
    'French',
    'Swahili',
    'Arabic',
    'Zulu',
    'Yoruba',
    'Amharic',
    'Portuguese',
    'Hausa',
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {languages.map(language => (
          <button
            key={language}
            onClick={() => {
              const newLanguages = selectedLanguages.includes(language)
                ? selectedLanguages.filter(l => l !== language)
                : [...selectedLanguages, language]
              onSelect(newLanguages)
            }}
            className={`rounded-lg border p-4 transition-all duration-200 ${
              selectedLanguages.includes(language)
                ? 'border-indigo-500 bg-indigo-500/20 text-white'
                : 'border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            {language}
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary">
          Back
        </button>
        <button
          onClick={onNext}
          disabled={selectedLanguages.length === 0}
          className="btn-primary"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
