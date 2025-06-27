"use client";

import { useState, useEffect } from "react";
import { useIssue } from "@/app/IssueProvider";
import { createClient } from "@/utils/supabase/client";

interface Comment {
  id: string;
  content: any;
  user_id: string;
  created_at: string;
  thread_id?: string;
  resolved: boolean;
}

export function AIComments() {
  const { issue } = useIssue();
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // For now, just add to local state until database table is created
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        content: { type: "text", text: newComment },
        user_id: "current-user", // Will be replaced with actual user ID
        created_at: new Date().toISOString(),
        resolved: false
      };
      
      setLocalComments(prev => [...prev, newCommentObj]);
      setNewComment("");
      
      // TODO: Save to database when issue_comments table is created
      console.log("Comment would be saved:", newCommentObj);
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="font-medium">Comments</div>
      
      {/* Comments List */}
      <div className="space-y-4 my-6">
        {localComments.length > 0 ? (
          localComments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))
        ) : (
          <div className="text-gray-500 text-sm italic">
            No comments yet. Be the first to add one!
          </div>
        )}
      </div>

      {/* Add Comment Form */}
      <form 
        onSubmit={handleSubmit}
        className="border border-neutral-200 rounded-lg overflow-hidden shadow-sm bg-white my-4"
      >
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full px-4 py-3 resize-none outline-none text-sm"
          rows={3}
          disabled={isSubmitting}
        />
        <div className="px-4 py-2 bg-gray-50 border-t flex justify-end">
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Adding..." : "Add Comment"}
          </button>
        </div>
      </form>
    </>
  );
}

function CommentCard({ comment }: { comment: Comment }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    }
    getCurrentUser();
  }, []);

  const getCommentText = () => {
    if (typeof comment.content === 'string') return comment.content;
    if (comment.content?.text) return comment.content.text;
    return JSON.stringify(comment.content);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {currentUser?.email?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-sm">
              {currentUser?.email || "You"}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="text-sm text-gray-700">
            {getCommentText()}
          </div>
        </div>
      </div>
    </div>
  );
} 