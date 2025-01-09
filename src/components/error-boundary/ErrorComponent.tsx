interface ErrorComponentProps {
  error?: Error
  resetErrorBoundary?: () => void
}

export function ErrorComponent({
  error,
  resetErrorBoundary,
}: ErrorComponentProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4 text-center">
      <div className="rounded-lg bg-white p-8 shadow-xl">
        <h2 className="mb-4 text-2xl font-bold text-red-600">
          Something went wrong
        </h2>
        <p className="mb-4 text-gray-600">
          {error?.message || 'An unexpected error occurred'}
        </p>
        {resetErrorBoundary && (
          <button
            onClick={resetErrorBoundary}
            className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  )
}

export default ErrorComponent
