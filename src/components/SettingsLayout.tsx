"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import classNames from "classnames";
import { ThemeSwitcher } from "./ThemeSwitcher";
import {
  UserIcon,
  CreditCardIcon,
  UsersIcon,
  PuzzlePieceIcon,
  MagnifyingGlassIcon as Search,
  FunnelIcon as Filter,
  ArrowDownTrayIcon as Download,
  DocumentTextIcon as FileText,
  EyeIcon as Eye,
  TableCellsIcon as FileSpreadsheet,
  ChevronDownIcon,
  EllipsisHorizontalIcon as MoreHorizontal,
  CheckIcon as Check,
} from "@heroicons/react/24/outline";

const plans = [
  {
    name: "Basic plan",
    description: "Up to 10 team members.",
    price: 99,
    isCurrent: true,
  },
  {
    name: "Business plan",
    description: "Up to 20 team members.",
    price: 199,
    isCurrent: false,
  },
  {
    name: "Enterprise plan",
    description: "Up to 40 team members.",
    price: 299,
    isCurrent: false,
  },
];

const invoices = [
  {
    id: "Invoice_March_2025",
    date: "Mar 6, 2025",
    plan: "Basic plan",
    users: 8,
  },
  {
    id: "Invoice_February_2025",
    date: "Feb 6, 2025",
    plan: "Basic plan",
    users: 8,
  },
  {
    id: "Invoice_January_2025",
    date: "Jan 6, 2025",
    plan: "Basic plan",
    users: 8,
  },
  {
    id: "Invoice_December_2024",
    date: "Dec 6, 2024",
    plan: "Basic plan",
    users: 7,
  },
  {
    id: "Invoice_November_2024",
    date: "Nov 6, 2024",
    plan: "Basic plan",
    users: 7,
  },
  {
    id: "Invoice_October_2024",
    date: "Oct 6, 2024",
    plan: "Basic plan",
    users: 6,
  },
  {
    id: "Invoice_September_2024",
    date: "Sep 6, 2024",
    plan: "Basic plan",
    users: 6,
  },
];

const integrations = [
  {
    name: "Lovable",
    description: "Idea to app in seconds, with your personal full stack engineer.",
    icon: "lovable",
    isNew: true,
    isConnected: true,
  },
  {
    name: "Warp",
    description: "Become a command line power user on day one with Warp's fast, intuitive terminal.",
    icon: "warp",
    isNew: true,
    isConnected: false,
  },
  {
    name: "Arc",
    description: "A modern web browser focused on productivity and custom workflows.",
    icon: "arc",
    isNew: true,
    isConnected: false,
  },
  {
    name: "Raycast",
    description: "A productivity tool that acts like a command bar to streamline tasks and app interactions.",
    icon: "raycast",
    isNew: false,
    isConnected: true,
  },
  {
    name: "v0",
    description: "Describe your ideas in natural language and generate code and UI for your project.",
    icon: "v0",
    isNew: false,
    isConnected: true,
  },
  {
    name: "ChatGPT",
    description: "ChatGPT helps you get answers, find inspiration and be more productive.",
    icon: "chatgpt",
    isNew: false,
    isConnected: false,
  },
  {
    name: "Bolt.new",
    description: "Prompt, run, edit, and deploy full-stack web and mobile apps.",
    icon: "bolt",
    isNew: false,
    isConnected: false,
  },
  {
    name: "Loom",
    description: "Share flawless videos without lifting a finger with Loom.",
    icon: "loom",
    isNew: false,
    isConnected: false,
  },
  {
    name: "Supabase",
    description: "Supabase is an open source Firebase alternative",
    icon: "supabase",
    isNew: false,
    isConnected: false,
  },
];

const categories = ["View all", "Developer tools", "Design tools", "Communication", "Productivity", "Browser tools"];

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

const getIconComponent = (iconType: string) => {
  const iconClasses = "w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-lg";

  switch (iconType) {
    case "lovable":
      return <div className={`${iconClasses} bg-gradient-to-br from-orange-500 to-purple-600`}>L</div>;
    case "warp":
      return (
        <div className={`${iconClasses} bg-black`}>
          <div className="w-6 h-6 border-2 border-white rounded-sm"></div>
        </div>
      );
    case "arc":
      return (
        <div className={`${iconClasses} bg-gradient-to-br from-red-500 to-blue-500`}>
          <div className="w-6 h-6 rounded-full border-2 border-white"></div>
        </div>
      );
    case "raycast":
      return (
        <div className={`${iconClasses} bg-black`}>
          <div className="w-6 h-6 bg-red-500 rounded-sm"></div>
        </div>
      );
    case "v0":
      return (
        <div className={`${iconClasses} bg-black`}>
          <span className="text-white font-mono">v0</span>
        </div>
      );
    case "chatgpt":
      return (
        <div className={`${iconClasses} bg-gradient-to-br from-green-400 to-blue-500`}>
          <div className="w-6 h-6 rounded-full bg-white/20"></div>
        </div>
      );
    case "bolt":
      return (
        <div className={`${iconClasses} bg-black`}>
          <span className="text-yellow-400 text-xl">⚡</span>
        </div>
      );
    case "loom":
      return (
        <div className={`${iconClasses} bg-gradient-to-br from-purple-500 to-pink-500`}>
          <div className="w-6 h-6 rounded-full bg-white/30"></div>
        </div>
      );
    case "supabase":
      return (
        <div className={`${iconClasses} bg-black`}>
          <div className="w-6 h-6 bg-green-500 rounded-sm"></div>
        </div>
      );
    default:
      return <div className={`${iconClasses} bg-gray-600`}>{iconType.charAt(0).toUpperCase()}</div>;
  }
};

export function SettingsLayout() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("my-account");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [profile, setProfile] = useState({
    display_name: "",
    email: "",
    avatar_url: "",
    loading: true,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInvoices(invoices.map((invoice) => invoice.id));
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleSelectInvoice = (invoiceId: string, checked: boolean) => {
    if (checked) {
      setSelectedInvoices([...selectedInvoices, invoiceId]);
    } else {
      setSelectedInvoices(selectedInvoices.filter((id) => id !== invoiceId));
    }
  };

  const filteredInvoices = invoices.filter((invoice) => 
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">Account</h2>
        <p className="text-sm text-gray-600 dark:text-dark-text-secondary">Manage your personal account settings and preferences.</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white dark:bg-dark-bg-secondary max-w-[600px] border border-gray-200 dark:border-dark-bg-tertiary rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 dark:text-dark-text-primary mb-4">Profile Information</h3>
        {profile.loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-gray-500 dark:text-dark-text-secondary">Loading profile...</div>
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
                <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary mb-2">Display Name</label>
                <input
                  type="text"
                  value={profile.display_name}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-dark-bg-tertiary dark:bg-dark-bg-primary dark:text-dark-text-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
                  placeholder="Enter your display name"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-1">
                  This name will appear in assignment dropdowns and issue cards
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-dark-bg-tertiary rounded-lg bg-gray-50 dark:bg-dark-bg-tertiary text-gray-500 dark:text-dark-text-tertiary cursor-not-allowed text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-1">Email cannot be changed</p>
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
      <div className="bg-white dark:bg-dark-bg-secondary max-w-[600px] border border-gray-200 dark:border-dark-bg-tertiary rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 dark:text-dark-text-primary mb-4">Change Password</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary mb-2">Current Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-bg-tertiary dark:bg-dark-bg-primary dark:text-dark-text-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary mb-2">New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-bg-tertiary dark:bg-dark-bg-primary dark:text-dark-text-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary mb-2">Confirm New Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-bg-tertiary dark:bg-dark-bg-primary dark:text-dark-text-primary rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
            />
          </div>
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors duration-200">
            Update Password
          </button>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="bg-white dark:bg-dark-bg-secondary max-w-[600px] border border-gray-200 dark:border-dark-bg-tertiary rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 dark:text-dark-text-primary mb-4">Appearance</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-dark-text-secondary mb-3">Theme Preference</label>
            <ThemeSwitcher />
            <p className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-2">
              Choose your preferred theme for the application interface
            </p>
          </div>
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
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
                <p className="text-gray-600 mt-1">Manage your plan and billing history here.</p>
              </div>
              <div className="relative">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Pricing Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.name} className="relative bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-gray-600 ml-2">per month</span>
                    </div>
                    <button
                      className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        plan.isCurrent
                          ? "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {plan.isCurrent ? "Current plan" : "Upgrade plan"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Billing History */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    Billing history <span className="text-gray-500 font-normal">44</span>
                  </h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      <Filter className="h-4 w-4" />
                      Filters
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      <Download className="h-4 w-4" />
                      Download all
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="w-12 px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.length === invoices.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          Billing date
                          <ChevronDownIcon className="h-4 w-4" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                      <th className="w-12 px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedInvoices.includes(invoice.id)}
                            onChange={(e) => handleSelectInvoice(invoice.id, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                              <FileText className="h-4 w-4 text-red-600" />
                            </div>
                            <span className="font-medium text-sm">{invoice.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{invoice.date}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {invoice.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{invoice.users}</td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case "integrations":
        return (
          <div className="max-w-5xl mx-auto px-6 py-8 bg-white min-h-screen">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-3xl font-semibold text-gray-900 mb-3 tracking-tight">Add integrations</h1>
              <p className="text-gray-500 text-lg">Supercharge your workflow and connect the tool you use every day.</p>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-2">
                {categories.map((category, index) => (
                  <button
                    key={category}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      index === 0
                        ? "bg-gray-900 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-150 hover:text-gray-700"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-150 transition-all duration-200">
                <MoreHorizontal className="w-4 h-4" />
                <span>Recent</span>
              </button>
            </div>

            {/* Integrations list */}
            <div className="space-y-3">
              {integrations.map((integration, index) => (
                <div
                  key={integration.name}
                  className="flex items-center justify-between px-6 py-5 bg-gray-50/50 rounded-2xl hover:bg-gray-50 transition-all duration-200 border border-gray-100/50"
                >
                  <div className="flex items-center gap-4">
                    {getIconComponent(integration.icon)}

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{integration.name}</h3>
                        {integration.isNew && (
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed max-w-2xl">{integration.description}</p>
                    </div>
                  </div>

                  {/* Connect button or Connected status */}
                  <div className="flex-shrink-0">
                    {integration.isConnected ? (
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-medium text-sm">
                        <Check className="w-4 h-4" />
                        <span>Connected</span>
                      </div>
                    ) : (
                      <button className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-sm">
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Partially visible blurred integration at bottom */}
              <div className="flex items-center justify-between px-6 py-5 bg-gray-50/30 rounded-2xl border border-gray-100/30 opacity-40 blur-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-200 flex items-center justify-center">
                    <div className="w-6 h-6 bg-orange-400 rounded-sm"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-400 text-lg">Linear</h3>
                    </div>
                    <p className="text-gray-400 text-sm">The issue tracking tool you'll enjoy using</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <button className="px-6 py-2.5 border border-gray-200/50 text-gray-400 rounded-xl font-medium text-sm">
                    Connect
                  </button>
                </div>
              </div>
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
    <div className="flex h-full bg-white dark:bg-dark-bg-primary">
      {/* Sidebar */}
      <div className="w-64 p-6 border-r border-gray-200 dark:border-dark-bg-tertiary">
        <div className="space-y-1">
          {settingsTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={classNames(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-all duration-200",
                activeSection === tab.id
                  ? "bg-gray-800 dark:bg-dark-bg-tertiary text-white dark:text-dark-text-primary"
                  : "text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-secondary hover:text-gray-900 dark:hover:text-dark-text-primary"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto bg-gray-50 dark:bg-dark-bg-primary">
        {renderContent()}
      </div>
    </div>
  );
} 