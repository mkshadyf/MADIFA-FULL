import React from 'react'
interface StepIndicatorProps {
  steps: string[]
  currentStep: number
}

export default function StepIndicator({
  steps,
  currentStep,
}: StepIndicatorProps) {
  return (
    <div className="mb-8 flex justify-center">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full
              ${index <= currentStep ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400'}`}
          >
            {index + 1}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`mx-2 h-1 w-16
                ${index < currentStep ? 'bg-indigo-600' : 'bg-gray-700'}`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
