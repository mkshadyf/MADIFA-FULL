// madifa/src/pages/auth/signup/index.tsx

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../providers/AuthProvider'

export default function SignUp() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [fullName, setFullName] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    try {
      await signUp({ email, password, fullName })
      navigate('/browse')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up')
    }
  }

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.currentTarget.value)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.currentTarget.value)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.currentTarget.value)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Sign Up</h1>
      {error && (
        <div className="bg-red-500/10 text-red-500 p-3 rounded-lg">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={fullName}
          onChange={handleFullNameChange}
          placeholder="Full Name"
          className="w-full p-2 rounded bg-gray-800 text-white"
        />
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="Email"
          className="w-full p-2 rounded bg-gray-800 text-white"
        />
        <input
          type="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="Password"
          className="w-full p-2 rounded bg-gray-800 text-white"
        />
        <button
          type="submit"
          className="w-full p-2 rounded bg-indigo-600 text-white"
        >
          Sign Up
        </button>
      </form>
    </div>
  )
}