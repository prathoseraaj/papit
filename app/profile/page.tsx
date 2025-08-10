'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/libs/supabaseClient'
import { useRouter } from 'next/navigation'
import { UserProfile } from '@/types'
import PapitLoader from '@/components/PapitLoader'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState<Partial<UserProfile>>({})
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const checkAuthAndLoadProfile = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          router.push('/signIn')
          return
        }

        if (!session) {
          router.push('/signIn')
          return
        }

        // Load profile from Supabase profiles table
        await loadProfile(session.user.id)
      } catch (error) {
        console.error('Authentication check failed:', error)
        router.push('/signIn')
      }
    }

    checkAuthAndLoadProfile()
  }, [router])

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error loading profile:', error)
        setMessage('Error loading profile')
        return
      }

      if (data) {
        setProfile(data)
        setFormData(data)
      } else {
        // Create a default profile if none exists
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const defaultProfile = {
            id: session.user.id,
            full_name: session.user.user_metadata?.username || '',
            phone_number: '',
            location: '',
            email: session.user.email || '',
            username: session.user.user_metadata?.username || '',
          }
          setProfile(defaultProfile)
          setFormData(defaultProfile)
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setMessage('Error loading profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          ...formData,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving profile:', error)
        setMessage('Error saving profile')
      } else {
        setProfile(formData as UserProfile)
        setIsEditing(false)
        setMessage('Profile saved successfully!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setMessage('Error saving profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData(profile || {})
    setIsEditing(false)
    setMessage('')
  }

  if (loading) {
    return <PapitLoader />
  }

  return (
    <div className="min-h-screen bg-[#131313] text-white">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              title="Back to Editor"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
            </button>
            <h1 className="text-3xl font-bold">Profile</h1>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-3 rounded-lg text-sm ${
            message.includes('Error') 
              ? 'bg-red-900/20 text-red-400 border border-red-500/20' 
              : 'bg-green-900/20 text-green-400 border border-green-500/20'
          }`}>
            {message}
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-[#2a2a2a] rounded-lg p-6 space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="full_name"
                value={formData.full_name || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#131313] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter your full name"
              />
            ) : (
              <div className="px-4 py-3 bg-[#131313] border border-gray-600 rounded-lg text-gray-300">
                {profile?.full_name || 'Not set'}
              </div>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#131313] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter your phone number"
              />
            ) : (
              <div className="px-4 py-3 bg-[#131313] border border-gray-600 rounded-lg text-gray-300">
                {profile?.phone_number || 'Not set'}
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Location
            </label>
            {isEditing ? (
              <input
                type="text"
                name="location"
                value={formData.location || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#131313] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter your location"
              />
            ) : (
              <div className="px-4 py-3 bg-[#131313] border border-gray-600 rounded-lg text-gray-300">
                {profile?.location || 'Not set'}
              </div>
            )}
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <div className="px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-gray-400">
              {profile?.email || 'Not set'}
            </div>
          </div>

          {/* Username (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <div className="px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-gray-400">
              {profile?.username || 'Not set'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}