import React from "react"
interface GenreSelectionStepProps {
  selectedGenres: string[]
  onSelect: (genres: string[]) => void
  onNext: () => void
  onBack: () => void
}

export function GenreSelectionStep({
  selectedGenres,
  onSelect,
  onNext,
  onBack,
}: GenreSelectionStepProps) {
  const genres = [
    'Action',
    'Comedy',
    'Drama',
    'Documentary',
    'Horror',
    'Romance',
    'Sci-Fi',
    'Thriller',
    'Animation',
    'Family',
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {genres.map(genre => (
          <button
            key={genre}
            onClick={() => {
              const newGenres = selectedGenres.includes(genre)
                ? selectedGenres.filter(g => g !== genre)
                : [...selectedGenres, genre]
              onSelect(newGenres)
            }}
            className={`rounded-lg border p-4 transition-all duration-200 ${
              selectedGenres.includes(genre)
                ? 'border-indigo-500 bg-indigo-500/20 text-white'
                : 'border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary">
          Back
        </button>
        <button
          onClick={onNext}
          disabled={selectedGenres.length === 0}
          className="btn-primary"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
