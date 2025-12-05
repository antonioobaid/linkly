"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CommentSection from "./CommentSection";
import { API_URL } from "@/lib/api";
import { Post, User } from "../../../../shared/types";

interface PostFeedProps {
  user: User | null;
  userId?: string;
  posts: Post[]; // posts kommer från HomePage
}

export default function PostFeed({ user, userId, posts }: PostFeedProps) {
  const [likes, setLikes] = useState<{ [key: string]: number }>({});
  const [userLiked, setUserLiked] = useState<{ [key: string]: boolean }>({});
  const [commentCounts, setCommentCounts] = useState<{ [key: string]: number }>({});
  const [openComments, setOpenComments] = useState<string | null>(null);

  // Hämta likes + comment-count
  useEffect(() => {
    posts.forEach(async (post) => {
      try {
        const likeRes = await fetch(`${API_URL}/api/likes/${post.id}`);
        const likeData = await likeRes.json();
        setLikes(prev => ({ ...prev, [post.id]: likeData.count || 0 }));
        if (user && likeData.users?.includes(user.id)) {
          setUserLiked(prev => ({ ...prev, [post.id]: true }));
        }

        const commentRes = await fetch(`${API_URL}/api/comments/${post.id}`);
        const commentData = await commentRes.json();
        setCommentCounts(prev => ({ ...prev, [post.id]: commentData.length || 0 }));
      } catch (err) {
        console.error("Fel vid hämtning av likes/comments:", err);
      }
    });
  }, [posts, user]);

  const handleLike = async (postId: string) => {
    if (!user) return alert("Du måste vara inloggad för att gilla!");
    try {
      const res = await fetch(`${API_URL}/api/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, user_id: user.id }),
      });
      const data = await res.json();
      const liked = data.liked;

      setUserLiked(prev => ({ ...prev, [postId]: liked }));
      setLikes(prev => ({ ...prev, [postId]: prev[postId] + (liked ? 1 : -1) }));
    } catch (err) {
      console.error("Fel vid like:", err);
    }
  };

  const handleNewComment = (postId: string) => {
    setCommentCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
  };

  return (
    <div className="mt-4 space-y-6 pb-24 md:pb-5">
      {posts.map(post => (
        <div key={post.id} className="border p-4 rounded-md bg-white dark:bg-gray-800 shadow-sm">
          <Link href={`/profile/${post.user_id}`} className="flex items-center gap-2 mb-2">
            <img
              src={post.avatar_url || "/default-avatar.png"}
              alt={post.username || "okänd"}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-semibold text-blue-600 hover:underline">{post.username || "okänd"}</span>
          </Link>

          <p className="text-gray-800 dark:text-gray-100">{post.content}</p>

          {post.image_urls && post.image_urls.length > 0 && (
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {post.image_urls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`post image ${index + 1}`}
                  className="max-h-64 w-full object-cover rounded"
                />
              ))}
            </div>
          )}

          <div className="flex gap-4 text-gray-500 text-sm mt-2 items-center">
            <div>❤️ {likes[post.id] || 0}</div>
            <div>💬 {commentCounts[post.id] || 0}</div>
          </div>

          <div className="flex gap-4 mt-3">
            <button
              onClick={() => handleLike(post.id)}
              className={`flex items-center gap-1 px-3 py-1 rounded transition ${
                userLiked[post.id] ? "bg-red-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              ❤️ Gilla
            </button>

            <button
              onClick={() => setOpenComments(openComments === post.id ? null : post.id)}
              className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              💬 Kommentar
            </button>

            <button className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">
              🔗 Dela
            </button>
          </div>

          {openComments === post.id && user && (
            <div className="mt-3 border-t pt-3">
              <CommentSection postId={post.id} userId={user.id} onCommentAdded={() => handleNewComment(post.id)} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
