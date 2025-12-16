"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

interface CommentSectionProps {
  postId: string;
  userId: string;
  onCommentAdded: () => void; // callback för att uppdatera PostModal
  onCommentDeleted?: () => void; // callback när en kommentar tas bort
  onLikeChanged?: (liked: boolean, count: number) => void;
  initialCommentCount?: number; // initialt antal kommentarer
}

export default function CommentSection({
  postId,
  userId,
  onCommentAdded,
  onCommentDeleted,
  onLikeChanged,
  initialCommentCount = 0,
}: CommentSectionProps) {
  const [text, setText] = useState("");
  const [likes, setLikes] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [commentCount, setCommentCount] = useState(initialCommentCount);

  const fetchLikes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/likes/${postId}`);
      const data = await res.json();
      setLikes(data.count || 0);
      setUserLiked(data.users?.includes(userId) || false);
    } catch (err) {
      console.error("Fel vid hämtning av likes:", err);
    }
  };

  useEffect(() => {
    fetchLikes();
  }, [postId, userId]);

  const handleLike = async () => {
    try {
      const res = await fetch(`${API_URL}/api/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, user_id: userId }),
      });
      const data = await res.json();
      setUserLiked(data.liked);
      setLikes(prev => prev + (data.liked ? 1 : -1));
      onLikeChanged?.(data.liked, likes + (data.liked ? 1 : -1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, user_id: userId, content: text }),
      });
      await res.json();
      setText("");
      setCommentCount(prev => prev + 1); // öka antalet direkt
      onCommentAdded(); // låt PostModal uppdatera sin state
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <button
          onClick={handleLike}
          className={`px-3 py-1 rounded text-sm ${
            userLiked ? "bg-red-500 text-white" : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          {userLiked ? "❤️" : "🤍"} {likes}
        </button>
        {/* Här visar vi bara antalet kommentarer */}
        <span className="text-sm">💬 {commentCount}</span>
      </div>

      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Skriv en kommentar..."
          className="border p-2 rounded-lg flex-1 text-sm dark:bg-gray-700 dark:text-white dark:text-gray-200"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Skicka
        </button>
      </div>
    </div>
  );
}
