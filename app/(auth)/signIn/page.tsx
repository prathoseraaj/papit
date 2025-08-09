'use client'

import React, { useState } from 'react'
import { supabase } from '@/libs/supabaseClient'
import { AuthError } from '@supabase/supabase-js'

export default function page() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Sign in successful!')
        // Redirect to dashboard or home page
        window.location.href = '/'
      }
    } catch (error: unknown) {
      const authError = error as AuthError
      setMessage(`Error: ${authError.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!formData.email) {
      setMessage('Please enter your email address first')
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email)
      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Password reset email sent!')
      }
    } catch (error: unknown) {
      const authError = error as AuthError
      setMessage(`Error: ${authError.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="w-full max-w-sm px-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Sign in to Papit</h1>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-4 p-3 rounded-md text-sm ${
            message.includes('Error') 
              ? 'bg-red-900 text-red-300 border border-red-700' 
              : 'bg-green-900 text-green-300 border border-green-700'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-gray-900 font-semibold py-3 px-4 rounded-md hover:bg-gray-100 transition-colors duration-200 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6">
          <button 
            onClick={handlePasswordReset}
            className="text-gray-400 text-sm hover:text-white hover:underline transition-colors"
          >
            Forgot your password?
          </button>
        </div>

        <div className="text-center mt-4">
          <span className="text-gray-400 text-sm">
            Don&apos;t have an account?{' '}
            <a href="/signUp" className="text-white hover:underline">
              Sign up
            </a>
          </span>
        </div>
      </div>
    </div>
  )
}