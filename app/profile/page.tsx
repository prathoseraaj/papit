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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading profile</p>
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
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-10">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-200"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="flex-1 flex flex-col max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-10">
        {/* Header */}
        <div className="text-center pt-16 pb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Profile Settings
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage your profile information and account settings
          </p>
        </div>

        {/* Profile Form */}
        <div className="bg-white shadow-sm rounded-lg p-6 flex-1 overflow-y-auto">
          {/* Edit/Save Buttons */}
          <div className="flex justify-end mb-4">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={saveProfile}
                  disabled={saving || usernameAvailable === false}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="flex items-center">
                      <div className="animate-spin -ml-1 mr-2 h-4 w-4 text-white">
                        <LoadingIcon />
                      </div>
                      Saving...
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Profile Picture Section */}
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-100 mx-auto relative ring-4 ring-white shadow-lg">
                {formData.avatar_url ? (
                  <img 
                    src={formData.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-blue-600">
                    {(formData.full_name || formData.username || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity rounded-full">
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
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                />
              )}
            </div>
            <h3 className="text-lg font-bold mt-3 mb-1 text-gray-900">{formData.full_name || "User"}</h3>
            <p className="text-sm text-gray-500">@{formData.username || "username"}</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Username *</label>
                {isEditing ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      className={`block w-full px-3 py-2 bg-white text-gray-900 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        getUsernameInputStatus() === 'error' || getUsernameInputStatus() === 'taken'
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : getUsernameInputStatus() === 'available'
                          ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                          : 'border-gray-300'
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
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {usernameError || (usernameAvailable === false ? 'Username is taken' : 'Username is available')}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="block w-full px-3 py-2 bg-gray-50 text-gray-900 border border-gray-200 rounded-md sm:text-sm">
                    {formData.username || "Not set"}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
                <div className="block w-full px-3 py-2 bg-gray-50 text-gray-500 border border-gray-200 rounded-md sm:text-sm">
                  {profile.email}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange("full_name", e.target.value)}
                    className="block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter full name"
                  />
                ) : (
                  <div className="block w-full px-3 py-2 bg-gray-50 text-gray-900 border border-gray-200 rounded-md sm:text-sm">
                    {formData.full_name || "Not set"}
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Location</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter location"
                  />
                ) : (
                  <div className="block w-full px-3 py-2 bg-gray-50 text-gray-900 border border-gray-200 rounded-md sm:text-sm">
                    {formData.location || "Not set"}
                  </div>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Phone Number</label>
              {isEditing ? (
                <div className="flex gap-2">
                  <select
                    value={formData.phone_country_code}
                    onChange={(e) => handleInputChange("phone_country_code", e.target.value)}
                    className="px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm min-w-[120px]"
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
                    className="flex-1 px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter phone number"
                  />
                </div>
              ) : (
                <div className="block w-full px-3 py-2 bg-gray-50 text-gray-900 border border-gray-200 rounded-md sm:text-sm">
                  {formData.phone_country_code && formData.phone_number 
                    ? `${formData.phone_country_code} ${formData.phone_number}` 
                    : "Not set"}
                </div>
              )}
            </div>
          </div>

          {/* Account Actions */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Account Actions</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => router.push('/change-password')}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors font-medium text-sm flex items-center justify-center"
              >
                <KeyIcon className="w-4 h-4 mr-2" />
                Change Password
              </button>
              <button 
                onClick={async () => {
                  if (confirm("Are you sure you want to sign out?")) {
                    await supabase.auth.signOut();
                    router.push("/signIn");
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-colors font-medium text-sm flex items-center justify-center"
              >
                <SignOutIcon className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Icon Components
const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

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

const KeyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const SignOutIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const LoadingIcon: React.FC = () => (
  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default Page;