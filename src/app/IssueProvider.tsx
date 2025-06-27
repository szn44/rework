"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/types/database";

type Issue = Database["public"]["Tables"]["issues"]["Row"];
type Comment = Database["public"]["Tables"]["issue_comments"]["Row"];

interface IssueContextType {
  issue: Issue | null;
  comments: Comment[];
  loading: boolean;
  error: string | null;
  updateIssue: (updates: Partial<Issue>) => Promise<void>;
  addComment: (content: any) => Promise<void>;
  updateComment: (commentId: string, content: any) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
}

const IssueContext = createContext<IssueContextType | undefined>(undefined);

export function useIssue() {
  const context = useContext(IssueContext);
  if (context === undefined) {
    throw new Error("useIssue must be used within an IssueProvider");
  }
  return context;
}

interface IssueProviderProps {
  children: ReactNode;
  issueId: string;
}

export function IssueProvider({ children, issueId }: IssueProviderProps) {
  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Parse issue ID to find the actual issue
  useEffect(() => {
    async function fetchIssue() {
      try {
        setLoading(true);
        setError(null);

        // Parse the issue ID to extract workspace/space slug and number
        let workspaceSlug: string;
        let issueNumber: number;
        let spaceSlug: string | null = null;

        // Parse issue ID format: WORKSPACE-NUMBER or SPACE-NUMBER
        const issueMatch = issueId.match(/^([A-Z]+)-(\d+)$/);
        if (!issueMatch) {
          throw new Error("Invalid issue ID format");
        }

        const slug = issueMatch[1];
        issueNumber = parseInt(issueMatch[2]);

        // First, try to find it as a workspace issue
        const { data: workspace } = await supabase
          .from("workspaces")
          .select("slug")
          .eq("slug", slug)
          .single();

        if (workspace) {
          // It's a workspace issue
          workspaceSlug = slug;
          spaceSlug = null;
        } else {
          // Try to find it as a space issue
          const { data: space } = await supabase
            .from("spaces")
            .select("slug, workspaces(slug)")
            .ilike("slug", slug.toLowerCase())
            .single();
          
          if (space) {
            // It's a space issue
            spaceSlug = space.slug;
            workspaceSlug = (space.workspaces as any)?.slug;
          } else {
            throw new Error(`No workspace or space found with slug: ${slug}`);
          }
        }

        // Find the issue in the database
        let query = supabase
          .from("issues")
          .select("*")
          .eq("workspace_slug", workspaceSlug)
          .eq("issue_number", issueNumber);

        if (spaceSlug) {
          // Space issue - must have space_id
          const { data: spaceData } = await supabase
            .from("spaces")
            .select("id")
            .eq("slug", spaceSlug)
            .single();
          
          if (spaceData) {
            query = query.eq("space_id", spaceData.id);
          }
        } else {
          // Workspace issue - space_id must be null
          query = query.is("space_id", null);
        }

        const { data: issueData, error: issueError } = await query.single();

        if (issueError || !issueData) {
          throw new Error("Issue not found");
        }

        setIssue(issueData);

        // Try to fetch comments for this issue (table may not exist yet)
        try {
          const { data: commentsData, error: commentsError } = await supabase
            .from("issue_comments")
            .select("*")
            .eq("issue_id", issueData.id)
            .order("created_at", { ascending: true });

          if (commentsError) {
            console.log("Comments table not available yet:", commentsError.message);
            setComments([]);
          } else {
            setComments(commentsData || []);
          }
        } catch (error) {
          console.log("Comments feature not available yet");
          setComments([]);
        }


      } catch (err) {
        console.error("Error fetching issue:", err);
        setError(err instanceof Error ? err.message : "Failed to load issue");
      } finally {
        setLoading(false);
      }
    }

    fetchIssue();
  }, [issueId]);

  const updateIssue = async (updates: Partial<Issue>) => {
    if (!issue) return;

    try {
      // Optimistic update
      setIssue(prev => prev ? { ...prev, ...updates } : null);

      const { error } = await supabase
        .from("issues")
        .update(updates)
        .eq("id", issue.id);

      if (error) {
        // Revert optimistic update on error
        setIssue(issue);
        throw error;
      }
    } catch (err) {
      console.error("Error updating issue:", err);
      throw err;
    }
  };

  const addComment = async (content: any) => {
    if (!issue) return;

    try {
      const { data, error } = await supabase
        .from("issue_comments")
        .insert({
          issue_id: issue.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;

      // Optimistic update (real-time will also update)
      setComments(prev => [...prev, data]);
    } catch (err) {
      console.error("Error adding comment:", err);
      throw err;
    }
  };

  const updateComment = async (commentId: string, content: any) => {
    try {
      const { error } = await supabase
        .from("issue_comments")
        .update({ content })
        .eq("id", commentId);

      if (error) throw error;
    } catch (err) {
      console.error("Error updating comment:", err);
      throw err;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("issue_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
    } catch (err) {
      console.error("Error deleting comment:", err);
      throw err;
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Issue not found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <a 
            href="/" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block"
          >
            ← Back to issue list
          </a>
        </div>
      </div>
    );
  }

  if (loading || !issue) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading issue...</p>
        </div>
      </div>
    );
  }

  return (
    <IssueContext.Provider value={{
      issue,
      comments,
      loading,
      error,
      updateIssue,
      addComment,
      updateComment,
      deleteComment,
    }}>
      {children}
    </IssueContext.Provider>
  );
}