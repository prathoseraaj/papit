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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

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

  const handleInputChange = (field: string, value: string) => {
    if (field === 'username') {
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

    // Check username length
    if (formData.username.length < 3) {
      setUsernameError('Username must be at least 3 characters long');
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

      if (error) throw error;

      setProfile((prev) => prev ? { ...prev, ...formData } : null);
      setIsEditing(false);
      setUsernameError('');
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

  return (
    <div className="min-h-screen bg-[#131313] text-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Go back"
            >
              <ArrowLeftIcon />
            </button>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <EditIcon />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveIcon />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-[#1f1f1f] rounded-xl border border-gray-700 overflow-hidden">
          {/* Avatar Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32 relative">
            <div className="absolute -bottom-12 left-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-[#1f1f1f] overflow-hidden bg-gray-700">
                  {formData.avatar_url ? (
                    <img
                      src={formData.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center text-2xl font-bold ${formData.avatar_url ? "hidden" : ""}`}>
                    {(formData.full_name || formData.username || "U").charAt(0).toUpperCase()}
                  </div>
                </div>

                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                    title="Change avatar"
                  >
                    {uploadingAvatar ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <CameraIcon />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />

          {/* Profile Info */}
          <div className="pt-16 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Username */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Username</label>
                {isEditing ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      className="w-full p-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Enter your username"
                      minLength={3}
                    />
                    {usernameError && (
                      <div className="absolute -top-2 -right-2 text-red-500 text-xs bg-red-50 px-2 py-1 rounded shadow-lg border border-red-200 z-10">
                        {usernameError}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-gray-300">
                    {profile.username || "Not set"}
                  </div>
                )}
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <div className="p-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-gray-400 flex items-center gap-2">
                  <LockIcon className="w-4 h-4" />
                  {profile.email}
                </div>
                <p className="text-xs text-gray-500">Email cannot be changed from here</p>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange("full_name", e.target.value)}
                    className="w-full p-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="p-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-gray-300">
                    {profile.full_name || "Not set"}
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Location</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="w-full p-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Enter your location"
                  />
                ) : (
                  <div className="p-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-gray-300 flex items-center gap-2">
                    <LocationIcon className="w-4 h-4" />
                    {profile.location || "Not set"}
                  </div>
                )}
              </div>

              {/* Phone Number and Prefix */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Phone Number</label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <select
                      value={formData.phone_country_code}
                      onChange={(e) => handleInputChange("phone_country_code", e.target.value)}
                      className="p-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors"
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
                      className="w-full p-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Enter your phone number"
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-[#2a2a2a] border border-gray-600 rounded-lg text-gray-300 flex items-center gap-2">
                    {profile.phone_country_code || ""} {profile.phone_number || "Not set"}
                  </div>
                )}
              </div>
            </div>

            {/* Account Actions */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Account Actions</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => router.push('/change-password')}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
                >
                  <KeyIcon />
                  Change Password
                </button>
                <button
                  onClick={async () => {
                    if (confirm("Are you sure you want to sign out?")) {
                      await supabase.auth.signOut();
                      router.push("/signIn");
                    }
                  }}
                  className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded-lg transition-colors flex items-center gap-2"
                >
                  <SignOutIcon />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Icon Components (Copy from reference code)
const ArrowLeftIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EditIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SaveIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="7,3 7,8 15,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CameraIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const LocationIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const KeyIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="7" cy="17" r="4" stroke="currentColor" strokeWidth="2"/>
    <path d="m21 3-6 6-4-4-6 6" stroke="currentColor" strokeWidth="2"/>
    <path d="m15 3 6 6" stroke="currentColor" strokeWidth="2"/>
    <path d="m9 11 4 4" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const SignOutIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default Page;