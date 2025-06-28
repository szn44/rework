"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { X, Hash, Lock, Globe } from "lucide-react";

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpaceCreated: (space: any) => void;
  user: User;
  workspaceId: string;
}

export function CreateSpaceModal({ 
  isOpen, 
  onClose, 
  onSpaceCreated, 
  user, 
  workspaceId 
}: CreateSpaceModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPrivate: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  if (!isOpen) return null;

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Space name is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const slug = generateSlug(formData.name);
      
      // Check if slug already exists
      const { data: existingSpace } = await supabase
        .from("spaces")
        .select("id")
        .eq("slug", slug)
        .eq("team_id", workspaceId)
        .single();

      if (existingSpace) {
        setError("A space with this name already exists");
        setIsLoading(false);
        return;
      }

      // Create the space
      const { data: newSpace, error: spaceError } = await supabase
        .from("spaces")
        .insert({
          name: formData.name.trim(),
          slug: slug,
          description: formData.description.trim() || null,
          team_id: workspaceId,
          created_by: user.id,
          is_private: formData.isPrivate
        })
        .select()
        .single();

      if (spaceError) {
        console.error("Error creating space:", spaceError);
        setError("Failed to create space. Please try again.");
        return;
      }

      // Add creator as member
      const { error: memberError } = await supabase
        .from("space_members")
        .insert({
          space_id: newSpace.id,
          user_id: user.id,
          role: "admin"
        });

      if (memberError) {
        console.error("Error adding space member:", memberError);
        // Don't fail the creation, just log the error
      }

      onSpaceCreated(newSpace);
      onClose();
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        isPrivate: false
      });
    } catch (error) {
      console.error("Error creating space:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setError(null);
      setFormData({
        name: "",
        description: "",
        isPrivate: false
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create a space</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Space name */}
          <div>
            <label htmlFor="spaceName" className="block text-sm font-medium text-gray-700 mb-2">
              Space name
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="spaceName"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. general, design, engineering"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                disabled={isLoading}
                maxLength={50}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Spaces are where your team communicates. They're best when organized around a topic — #marketing, for example.
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="spaceDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              id="spaceDescription"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What's this space about?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
              rows={3}
              disabled={isLoading}
              maxLength={200}
            />
          </div>

          {/* Privacy settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Privacy
            </label>
            <div className="space-y-3">
              {/* Public option */}
              <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="privacy"
                  checked={!formData.isPrivate}
                  onChange={() => setFormData(prev => ({ ...prev, isPrivate: false }))}
                  className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">Public</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Anyone in your workspace can join and see all messages
                  </p>
                </div>
              </label>

              {/* Private option */}
              <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="privacy"
                  checked={formData.isPrivate}
                  onChange={() => setFormData(prev => ({ ...prev, isPrivate: true }))}
                  className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">Private</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Only invited members can join and see messages
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Creating..." : "Create Space"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}