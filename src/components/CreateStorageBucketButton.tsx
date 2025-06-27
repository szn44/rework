"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function CreateStorageBucketButton() {
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const createBucket = async () => {
    setCreating(true);
    setResult(null);

    try {
      const supabase = createClient();
      
      // Try to create the bucket
      const { data, error } = await supabase.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 2097152, // 2MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });

      if (error) {
        if (error.message.includes('already exists')) {
          setResult("✅ Avatars bucket already exists!");
        } else {
          setResult(`❌ Error: ${error.message}`);
        }
      } else {
        setResult("✅ Avatars bucket created successfully!");
      }

    } catch (error) {
      setResult(`❌ Network error: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
      <h3 className="font-medium text-orange-800 mb-2">
        Storage Bucket Setup
      </h3>
      <p className="text-sm text-orange-700 mb-3">
        If avatar upload fails with "Bucket not found", click below to create the storage bucket.
      </p>
      <button
        onClick={createBucket}
        disabled={creating}
        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {creating ? "Creating..." : "Create Avatars Bucket"}
      </button>
      {result && (
        <div className="mt-2 text-sm font-medium">
          {result}
        </div>
      )}
      <p className="text-xs text-orange-600 mt-2">
        <strong>Alternative:</strong> Run the SQL migration 006_create_avatars_bucket.sql in your Supabase dashboard.
      </p>
    </div>
  );
}