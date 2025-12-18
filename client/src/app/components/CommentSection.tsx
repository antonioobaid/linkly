"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import LikeModal from "./LikeModal";

interface CommentSectionProps {
  postId: string;
  userId: string;
  onCommentAdded: () => void;
  onLikeChanged?: (liked: boolean, count: number) => void;
  initialCommentCount?: number;
}

export default function CommentSection({
  postId,
  userId,
  onCommentAdded,
  onLikeChanged,
  initialCommentCount = 0,
}: CommentSectionProps) {
  const [text, setText] = useState("");
  const [likes, setLikes] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [likesModalOpen, setLikesModalOpen] = useState(false);

  const fetchLikes = async () => {
  try {
    const res = await fetch(`${API_URL}/api/likes/${postId}`);
    const data = await res.json();

    setLikes(data.count || 0);
    setUserLiked(data.userIds?.includes(userId) || false); // använd userIds
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

      const newLiked = data.liked;
      const newCount = likes + (newLiked ? 1 : -1);

      setUserLiked(newLiked);
      setLikes(newCount);

      onLikeChanged?.(newLiked, newCount);
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
      setCommentCount(prev => prev + 1);
      onCommentAdded();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 select-none">
        {/* Hjärtat som toggle med SVG */}
        <svg
          onClick={(e) => {
            e.stopPropagation();
            handleLike();
          }}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={userLiked ? "red" : "white"}
          stroke="currentColor"
          className="w-6 h-6 cursor-pointer transition-colors duration-200 hover:fill-red-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>

        {/* Antalet likes */}
        <span
          className="cursor-pointer text-sm hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            setLikesModalOpen(true);
          }}
        >
          {likes || 0}
        </span>

        {/* Kommentarantal */}
        <span className="text-sm ml-4">💬 {commentCount}</span>
      </div>

      {/* Kommentar input */}
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

      {/* LikeModal */}
      {likesModalOpen && (
        <LikeModal postId={postId} onClose={() => setLikesModalOpen(false)} />
      )}
    </div>
  );
}
