"use client";

import { useState, useEffect } from "react";

export function DebugWorkspaceUsers() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaceUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching workspace users...");
      const response = await fetch('/api/workspace-users');
      const result = await response.json();
      
      console.log("Workspace users API response:", result);
      console.log("Response status:", response.status);
      
      if (response.ok) {
        setData(result);
      } else {
        setError(`API Error: ${result.error}`);
      }
    } catch (err) {
      console.error("Network error:", err);
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchDebugInfo = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching debug info...");
      const response = await fetch('/api/debug-users');
      const result = await response.json();
      
      console.log("Debug API response:", result);
      
      if (response.ok) {
        setData(result);
      } else {
        setError(`Debug API Error: ${result.error}`);
      }
    } catch (err) {
      console.error("Debug network error:", err);
      setError(`Debug network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg mb-4">
      <h3 className="font-medium text-blue-800 mb-2">
        Debug Assignment Dropdown
      </h3>
      <p className="text-sm text-blue-700 mb-3">
        Check what the workspace-users API is returning and debug why you don't appear in the assignment dropdown.
      </p>
      
      <div className="flex gap-2 mb-3">
        <button
          onClick={fetchWorkspaceUsers}
          disabled={loading}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Test Workspace Users API"}
        </button>
        
        <button
          onClick={fetchDebugInfo}
          disabled={loading}
          className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Get Debug Info"}
        </button>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <div className="bg-white border rounded p-3 max-h-96 overflow-y-auto">
          <h4 className="font-medium mb-2">API Response:</h4>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
          
          {data.users && (
            <div className="mt-3">
              <h5 className="font-medium text-sm">Users found: {data.users.length}</h5>
              {data.users.map((user: any, index: number) => (
                <div key={index} className="text-sm border-b py-1">
                  <strong>{user.name}</strong> - {user.email} (ID: {user.id})
                </div>
              ))}
            </div>
          )}
          
          {data.currentUser && (
            <div className="mt-3 p-2 bg-yellow-100 rounded">
              <h5 className="font-medium text-sm">Current User:</h5>
              <div className="text-sm">
                <strong>{data.currentUser.email}</strong> (ID: {data.currentUser.id})
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}