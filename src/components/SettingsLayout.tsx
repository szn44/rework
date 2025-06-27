"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import classNames from "classnames";
import {
  UserIcon,
  CreditCardIcon,
  UsersIcon,
  PuzzlePieceIcon,
} from "@heroicons/react/24/outline";

type SettingsSection = 
  | "my-account" 
  | "plan-billing"
  | "team"
  | "integrations";

interface SettingsTab {
  id: SettingsSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const settingsTabs: SettingsTab[] = [
  { id: "my-account", label: "My Account", icon: UserIcon },
  { id: "plan-billing", label: "Plan & Billing", icon: CreditCardIcon },
  { id: "team", label: "Team", icon: UsersIcon },
  { id: "integrations", label: "Integrations", icon: PuzzlePieceIcon },
];

export function SettingsLayout() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("my-account");
  const [profile, setProfile] = useState({
    display_name: "",
    email: "",
    avatar_url: "",
    loading: true,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setProfile(prev => ({ ...prev, loading: false }));
        return;
      }

      console.log("Loading profile for user:", user.id);
      console.log("User email:", user.email);
      console.log("User metadata:", user.user_metadata);

      // Try to get existing profile
      const { data: existingProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      console.log("Profile query result:", { existingProfile, profileError });

      if (existingProfile) {
        setProfile({
          display_name: existingProfile.display_name || "",
          email: user.email || "",  // Always use auth email as source of truth
          avatar_url: existingProfile.avatar_url || user.user_metadata?.avatar_url || "",
          loading: false,
        });
      } else if (profileError?.code === 'PGRST116') {
        // Table doesn't exist or no profile found - use auth data
        console.log("No profile found, using auth data");
        setProfile({
          display_name: user.user_metadata?.name || user.email?.split('@')[0] || "",
          email: user.email || "",
          avatar_url: user.user_metadata?.avatar_url || "",
          loading: false,
        });
      } else {
        // Try to create profile if table exists
        console.log("Attempting to create profile");
        const newProfile = {
          user_id: user.id,
          email: user.email,
          display_name: user.user_metadata?.name || user.email?.split('@')[0] || "",
          avatar_url: user.user_metadata?.avatar_url || "",
        };

        const { data: createdProfile, error: createError } = await supabase
          .from("user_profiles")
          .insert(newProfile)
          .select()
          .single();

        console.log("Profile creation result:", { createdProfile, createError });

        if (createdProfile) {
          setProfile({
            display_name: createdProfile.display_name || "",
            email: user.email || "",
            avatar_url: createdProfile.avatar_url || "",
            loading: false,
          });
        } else {
          // Fallback to auth data if profile creation fails
          setProfile({
            display_name: user.user_metadata?.name || user.email?.split('@')[0] || "",
            email: user.email || "",
            avatar_url: user.user_metadata?.avatar_url || "",
            loading: false,
          });
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      // Always show user auth data as fallback
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfile({
          display_name: user.user_metadata?.name || user.email?.split('@')[0] || "",
          email: user.email || "",
          avatar_url: user.user_metadata?.avatar_url || "",
          loading: false,
        });
      } else {
        setProfile(prev => ({ ...prev, loading: false }));
      }
    }
  };

  const uploadAvatar = async (file: File) => {
    setUploadingAvatar(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setMessage("Not authenticated");
        return;
      }

      // Generate unique filename with user folder structure
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;
      
      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting previous avatars
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setMessage(`Upload failed: ${uploadError.message}`);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      
      setMessage("Avatar uploaded successfully!");
      setTimeout(() => setMessage(null), 3000);

    } catch (error) {
      console.error("Error uploading avatar:", error);
      setMessage("Error uploading avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage("Please select an image file");
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setMessage("Image must be smaller than 2MB");
        return;
      }
      
      uploadAvatar(file);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setMessage("Not authenticated");
        return;
      }

      console.log("Saving profile:", {
        display_name: profile.display_name.trim(),
        avatar_url: profile.avatar_url,
        user_id: user.id
      });

      // Try to update first
      const { error: updateError, count } = await supabase
        .from("user_profiles")
        .update({
          display_name: profile.display_name.trim(),
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select();

      console.log("Update result:", { updateError, count });

      if (updateError) {
        console.log("Update failed, trying upsert:", updateError);
        
        // If update fails, try to insert (upsert)
        const { error: upsertError } = await supabase
          .from("user_profiles")
          .upsert({
            user_id: user.id,
            display_name: profile.display_name.trim(),
            avatar_url: profile.avatar_url,
            email: user.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          });

        console.log("Upsert result:", { upsertError });

        if (upsertError) {
          console.error("Both update and upsert failed:", upsertError);
          setMessage(`Error saving profile: ${upsertError.message || 'Profile table may not exist'}`);
          return;
        }
      }

      setMessage("Profile saved successfully!");
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);

    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage("Error saving profile. The user_profiles table may not exist yet.");
    } finally {
      setSaving(false);
    }
  };

  const renderAccountSection = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Account</h2>
        <p className="text-sm text-gray-600">Manage your personal account settings and preferences.</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Profile Information</h3>
        {profile.loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-gray-500">Loading profile...</div>
          </div>
        ) : (
          <div className="flex items-start gap-6">
            <div className="relative">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {(profile.display_name || profile.email || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
                {uploadingAvatar ? (
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UserIcon className="w-4 h-4" />
                )}
              </label>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Display Name</label>
                <input
                  type="text"
                  value={profile.display_name}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
                  placeholder="Enter your display name"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This name will appear in assignment dropdowns and issue cards
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              
              {message && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.includes('Error') 
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-green-100 text-green-700 border border-green-200'
                }`}>
                  {message}
                </div>
              )}
              
              <div className="flex gap-3">
                <button 
                  onClick={saveProfile}
                  disabled={saving || !profile.display_name.trim()}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button 
                  onClick={loadProfile}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Password Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Change Password</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Current Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
            />
          </div>
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors duration-200">
            Update Password
          </button>
        </div>
      </div>
    </div>
  );

  const renderTeamSection = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Team Settings</h2>
        <p className="text-sm text-gray-600">Manage and view your coworkers and guests</p>
      </div>

      {/* Invite Section */}
      <div className="bg-gradient-to-r from-purple-50 to-orange-50 border border-purple-200 rounded-xl p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Invite Team Members</h3>
        <div className="flex gap-3 mb-4">
          <input
            type="email"
            placeholder="Add emails..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
          />
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm">
            <option>Guest</option>
            <option>Member</option>
            <option>Admin</option>
          </select>
          <button className="px-6 py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors duration-200">
            Invite (1)
          </button>
        </div>
        <div className="flex gap-3 text-xs">
          <button className="px-3 py-1 bg-white bg-opacity-60 hover:bg-opacity-80 rounded-lg transition-colors duration-200">
            📝 Personalize your invitation
          </button>
          <button className="px-3 py-1 bg-white bg-opacity-60 hover:bg-opacity-80 rounded-lg transition-colors duration-200">
            📤 Upload CSV
          </button>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-base font-semibold text-gray-900">Team Members</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {[
            { name: "Josh Achiam", email: "josh@openai.com", role: "Can view", date: "Jan 6, 2025", avatar: "J" },
            { name: "Amie Ross (You)", email: "amie@acme.com", role: "Owner", date: "Nov 2, 2024", avatar: "A" },
            { name: "Oliver House", email: "oliver@acme.com", role: "Member", date: "Jan 24, 2025", avatar: "O" },
            { name: "Diana Mounter", email: "diana@acme.com", role: "Member", date: "Jan 22, 2025", avatar: "D" },
          ].map((member, index) => (
            <div key={index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {member.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-xs text-gray-500">{member.date}</span>
                <span className={classNames(
                  "px-2 py-1 rounded-lg text-xs font-medium",
                  member.role === "Owner" ? "bg-purple-100 text-purple-700" :
                  member.role === "Member" ? "bg-blue-100 text-blue-700" :
                  member.role === "Guest" ? "bg-gray-100 text-gray-700" :
                  "bg-green-100 text-green-700"
                )}>{member.role}</span>
                <button className="text-gray-400 hover:text-gray-600">⋯</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "my-account":
        return renderAccountSection();
      case "team":
        return renderTeamSection();
      case "plan-billing":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Plan & Billing</h2>
              <p className="text-sm text-gray-600">Manage your subscription and billing information.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <p className="text-sm text-gray-500">Billing settings will be configured here.</p>
            </div>
          </div>
        );
      case "integrations":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Integrations</h2>
              <p className="text-sm text-gray-600">Connect and manage your third-party integrations.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <p className="text-sm text-gray-500">Integration settings will be configured here.</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Settings</h2>
              <p className="text-sm text-gray-600">This section is coming soon.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <p className="text-sm text-gray-500">Settings for {activeSection} will be available here.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 p-6">
        <div className="space-y-1">
          {settingsTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={classNames(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-all duration-200",
                activeSection === tab.id
                  ? "bg-gray-800 text-white"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
} 