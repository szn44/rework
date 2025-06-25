"use client";

import { useState } from "react";
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

  const renderAccountSection = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Account</h2>
        <p className="text-sm text-gray-600">Manage your personal account settings and preferences.</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Profile Information</h3>
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              JD
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200">
              <UserIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  defaultValue="John"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  defaultValue="Dominos"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                defaultValue="johndoe@gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors duration-200">
                Save Changes
              </button>
              <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-200">
                Cancel
              </button>
            </div>
          </div>
        </div>
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