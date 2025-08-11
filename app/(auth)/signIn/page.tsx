'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/libs/supabaseClient'
import { AuthError } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        handleSuccessfulLogin()
      }
    }
    checkUser()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSuccessfulLogin = () => {
    const redirectUrl = localStorage.getItem('redirectAfterLogin')
    if (redirectUrl) {
      localStorage.removeItem('redirectAfterLogin')
      router.push(redirectUrl)
    } else {
      router.push('/')
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else if (data.user) {
        setMessage('Sign in successful!')
        // Small delay to show success message
        setTimeout(() => {
          handleSuccessfulLogin()
        }, 500)
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 backdrop-blur-3xl">
      <div className="w-full max-w-md px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sign in
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

        <form onSubmit={handleSignIn} className="space-y-4">
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
            placeholder="••••••••"
            required
            className="w-full px-4 py-4 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-gray-600">Remember me</span>
            </label>
            <button 
              type="button"
              onClick={handlePasswordReset}
              className="text-gray-900 underline hover:no-underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="text-center mt-8">
          <span className="text-gray-600">or</span>
        </div>

        <div className="text-center mt-4">
          <a href="/signUp" className="text-gray-900 underline hover:no-underline font-medium">
            Create an account
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