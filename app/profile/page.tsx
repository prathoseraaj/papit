"use client"
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/libs/supabaseClient";
import { useRouter } from "next/navigation";
import PapitLoader from "@/components/PapitLoader";
import { phonePrefixes } from "@/utils/countryCode"; 

interface UserProfile {
  id: string;
  username: string;
  email: string;
  full_name: string;
  phone_number: string;
  phone_country_code: string;
  location: string;
  avatar_url: string;
}
  
const Page: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    location: "",
    avatar_url: "",
    phone_number: "",
    phone_country_code: "+1",
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  // Debounced username availability check
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (formData.username && formData.username.length >= 3 && formData.username !== profile?.username) {
        await checkUsernameAvailability(formData.username);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.username, profile?.username]);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/signIn");
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;

      setProfile(data);
      setFormData({
        username: data.username || "",
        full_name: data.full_name || "",
        location: data.location || "",
        avatar_url: data.avatar_url || "",
        phone_number: data.phone_number || "",
        phone_country_code: data.phone_country_code || "+1",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    setCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .neq("id", profile?.id);
      
      if (error) throw error;
      
      setUsernameAvailable(data.length === 0);
    } catch (error) {
      console.error("Error checking username:", error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'username') {
      // Reset availability check
      setUsernameAvailable(null);
      
      // Check if input contains invalid characters before cleaning
      const hasInvalidChars = /[^a-z0-9_]/.test(value);
      
      if (hasInvalidChars) {
        setUsernameError('Only lowercase letters, numbers, and underscores allowed');
      } else {
        setUsernameError('');
      }
      
      // Convert to lowercase and remove invalid characters
      const cleanedValue = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
      setFormData((prev) => ({
        ...prev,
        [field]: cleanedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB.");
      return;
    }
    
    setUploadingAvatar(true);
    try {
      // Delete old avatar if exists
      if (formData.avatar_url && formData.avatar_url.includes('avatars/')) {
        const oldPath = formData.avatar_url.split('/avatars/')[1];
        if (oldPath) {
          await supabase.storage.from("avatars").remove([`avatars/${oldPath}`]);
        }
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${profile?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setFormData((prev) => ({
        ...prev,
        avatar_url: data.publicUrl,
      }));
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Error uploading avatar. Please try again.");
    } finally {
      setUploadingAvatar(false);
      if (event.target) event.target.value = "";
    }
  };

  const saveProfile = async () => {
    if (!profile) return;

    // Validation
    if (formData.username.length < 3) {
      setUsernameError('Username must be at least 3 characters long');
      return;
    }

    if (usernameAvailable === false) {
      setUsernameError('Username is already taken');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: formData.username,
          full_name: formData.full_name,
          location: formData.location,
          avatar_url: formData.avatar_url,
          phone_number: formData.phone_number,
          phone_country_code: formData.phone_country_code,
        })
        .eq("id", profile.id);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setUsernameError('Username is already taken');
          return;
        }
        throw error;
      }

      setProfile((prev) => prev ? { ...prev, ...formData } : null);
      setIsEditing(false);
      setUsernameError('');
      setUsernameAvailable(null);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error saving profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    if (!profile) return;
    setFormData({
      username: profile.username || "",
      full_name: profile.full_name || "",
      location: profile.location || "",
      avatar_url: profile.avatar_url || "",
      phone_number: profile.phone_number || "",
      phone_country_code: profile.phone_country_code || "+1",
    });
    setUsernameError('');
    setUsernameAvailable(null);
    setIsEditing(false);
  };

  if (loading) {
    return <PapitLoader />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#131313] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading profile</p>
          <button
            onClick={loadProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const getUsernameInputStatus = () => {
    if (usernameError) return 'error';
    if (checkingUsername) return 'checking';
    if (usernameAvailable === true) return 'available';
    if (usernameAvailable === false) return 'taken';
    return 'default';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-8">
        {/* Page Title and Edit Button */}
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                disabled={saving || usernameAvailable === false}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        {/* Profile Picture Section */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-orange-200 mx-auto relative">
              {formData.avatar_url ? (
                <img 
                  src={formData.avatar_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-700">
                  {(formData.full_name || formData.username || "U").charAt(0).toUpperCase()}
                </div>
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                  {uploadingAvatar ? (
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <CameraIcon className="w-8 h-8 text-white" />
                  )}
                </div>
              )}
            </div>
            {isEditing && (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            )}
          </div>
          <h2 className="text-2xl font-bold mt-4 mb-2">{formData.full_name || "User"}</h2>
          <p className="text-gray-400">Manage your profile information</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">Username</label>
              {isEditing ? (
                <div className="relative">
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:outline-none transition-all ${
                      getUsernameInputStatus() === 'error' || getUsernameInputStatus() === 'taken'
                        ? 'border-red-500 focus:border-red-500'
                        : getUsernameInputStatus() === 'available'
                        ? 'border-green-500 focus:border-green-500'
                        : 'border-gray-700 focus:border-blue-500'
                    }`}
                    placeholder="Enter username"
                  />
                  
                  {/* Status indicator */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {checkingUsername ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : getUsernameInputStatus() === 'available' ? (
                      <CheckIcon className="w-4 h-4 text-green-500" />
                    ) : (getUsernameInputStatus() === 'taken' || getUsernameInputStatus() === 'error') ? (
                      <XIcon className="w-4 h-4 text-red-500" />
                    ) : null}
                  </div>
                  
                  {/* Error/success message */}
                  {(usernameError || usernameAvailable !== null) && (
                    <div className={`text-xs mt-1 ${
                      usernameError || usernameAvailable === false 
                        ? 'text-red-400' 
                        : 'text-green-400'
                    }`}>
                      {usernameError || (usernameAvailable === false ? 'Username is taken' : 'Username is available')}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300">
                  {formData.username || "Not set"}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">Email</label>
              <div className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300">
                {profile.email}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter full name"
                />
              ) : (
                <div className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300">
                  {formData.full_name || "Not set"}
                </div>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-300">Location</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter location"
                />
              ) : (
                <div className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300">
                  {formData.location || "Not set"}
                </div>
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-300">Phone Number</label>
            {isEditing ? (
              <div className="flex gap-2">
                <select
                  value={formData.phone_country_code}
                  onChange={(e) => handleInputChange("phone_country_code", e.target.value)}
                  className="px-3 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-w-[120px]"
                >
                  {phonePrefixes.map((prefix: { code: string; country: string }) => (
                    <option key={prefix.code} value={prefix.code}>
                      {prefix.country} ({prefix.code})
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange("phone_number", e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter phone number"
                />
              </div>
            ) : (
              <div className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300">
                {formData.phone_country_code && formData.phone_number 
                  ? `${formData.phone_country_code} ${formData.phone_number}` 
                  : "Not set"}
              </div>
            )}
          </div>
        </div>

        {/* Account Actions */}
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-6">Account Actions</h3>
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => router.push('/change-password')}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-medium text-center"
            >
              Change Password
            </button>
            <button 
              onClick={async () => {
                if (confirm("Are you sure you want to sign out?")) {
                  await supabase.auth.signOut();
                  router.push("/signIn");
                }
              }}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-medium text-center"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none">
    <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none">
    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export default Page;