"use client";

import { useState } from "react";

export function FixMembershipButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFixMembership = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/fix-membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ ${data.message}. Added ${data.addedMemberships?.length || 0} memberships.`);
        // Refresh the page after a short delay to update the UI
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
      <h3 className="font-medium text-amber-800 mb-2">
        Assignment Dropdown Empty?
      </h3>
      <p className="text-sm text-amber-700 mb-3">
        If you can't see yourself in the assignment dropdown, click below to fix your workspace membership.
      </p>
      <button
        onClick={handleFixMembership}
        disabled={loading}
        className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {loading ? "Fixing..." : "Fix Membership"}
      </button>
      {result && (
        <div className="mt-2 text-sm font-medium">
          {result}
        </div>
      )}
    </div>
  );
}