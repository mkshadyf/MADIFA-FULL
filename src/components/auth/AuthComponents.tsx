import React from 'react'
import { Link } from 'react-router-dom'

interface AuthCardProps {
  children: React.ReactNode
  title: string
  subtitle?: React.ReactNode
}

export function AuthCard ({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <Link to="/" className="flex justify-center" aria-label="Go to homepage">
            <img className="h-12 w-auto" src="/logo.svg" alt="Madifa" />
          </Link>
          <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">{title}</h1>
          {subtitle ? (
            <div className="mt-2 text-center text-sm text-gray-400">{subtitle}</div>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  )
}

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function AuthInput ({ label, error, id, ...props }: AuthInputProps) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          id={id}
          className={`relative block w-full rounded-lg border-0 bg-gray-800 p-3 text-white ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6 ${
            error ? 'ring-red-500' : 'ring-gray-700'
          }`}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {error ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="h-5 w-5 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        ) : null}
      </div>
      {error ? (
        <p className="mt-2 text-sm text-red-500" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  loadingText?: string
}

export function AuthButton ({
  children,
  isLoading,
  loadingText = 'Processing...',
  ...props
}: AuthButtonProps) {
  return (
    <button
      {...props}
      className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={isLoading || props.disabled}
    >
      {isLoading ? (
        <span className="flex items-center space-x-2">
          <svg
            className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{loadingText}</span>
        </span>
      ) : (
        children
      )}
    </button>
  )
}
