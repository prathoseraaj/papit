'use client'

import React, { useState } from 'react'
import { supabase } from '@/libs/supabaseClient'
import { AuthError } from '@supabase/supabase-js'

export default function Page() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [usernameError, setUsernameError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Special handling for username field
    if (name === 'username') {
      // Check if input contains invalid characters before cleaning
      const hasInvalidChars = /[^a-z0-9_]/.test(value)
      
      if (hasInvalidChars) {
        setUsernameError('Only lowercase letters, numbers, and underscores allowed')
      } else {
        setUsernameError('')
      }
      
      // Convert to lowercase and remove invalid characters
      const cleanedValue = value.toLowerCase().replace(/[^a-z0-9_]/g, '')
      setFormData({
        ...formData,
        [name]: cleanedValue
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setUsernameError('')

    // Check username length
    if (formData.username.length < 3) {
      setUsernameError('Username must be at least 3 characters long')
      setLoading(false)
      return
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setMessage('Error: Passwords do not match')
      setLoading(false)
      return
    }

    try {
      // Sign up with Supabase Auth
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
          }
        }
      })

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Check your email for the confirmation link!')
        // Optionally clear form
        setFormData({ username: '', email: '', password: '', confirmPassword: '' })
      }
    } catch (error: unknown) {
      const authError = error as AuthError
      setMessage(`Error: ${authError.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 backdrop-blur-3xl">
      <div className="w-full max-w-md px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Account
          </h1>
          <p className="text-gray-600 text-lg">
            Join teams already working with Papit.
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-3 rounded-lg text-sm text-center ${
            message.includes('Error') 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Username"
              required
              minLength={3}
              className="w-full px-4 py-4 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
            />
            {usernameError && (
              <div className="absolute -top-2 -right-2 text-red-500 text-xs bg-red-50 px-2 py-1 rounded shadow-lg border border-red-200 z-10">
                {usernameError}
              </div>
            )}
          </div>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="youremail@example.com"
            required
            className="w-full px-4 py-4 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
          />

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password"
            required
            minLength={6}
            className="w-full px-4 py-4 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
          />

          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm Password"
            required
            className="w-full px-4 py-4 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-8">
          <span className="text-gray-600">or</span>
        </div>

        <div className="text-center mt-4">
          <a href="/signIn" className="text-gray-900 underline hover:no-underline font-medium">
            Already have an account? Sign in
          </a>
        </div>

        <div className="text-center mt-16 text-sm text-gray-500 space-x-2">
          <a href="#" className="hover:underline">Legal Notice</a>
          <span>·</span>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <span>·</span>
          <a href="#" className="hover:underline">Terms of Service</a>
        </div>
      </div>
    </div>
  )
}