interface StepIndicatorProps {
  steps: string[]
  currentStep: number
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center
              ${
                index <= currentStep
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-400'
              }`}
          >
            {index + 1}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-16 h-1 mx-2
                ${
                  index < currentStep
                    ? 'bg-indigo-600'
                    : 'bg-gray-700'
                }`}
            />
          )}
        </div>
      ))}
    </div>
  )
} 