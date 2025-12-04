"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CommentSection from "./CommentSection";
import { Post, User } from "../../../../shared/types";
import { API_URL } from "@/lib/api";

interface PostFeedProps {
  user: User | null;
  userId?: string; // Om vi vill filtrera posts per användare
}

export default function PostFeed({ user, userId }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [likes, setLikes] = useState<{ [key: string]: number }>({});
  const [userLiked, setUserLiked] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const query = userId ? `?userId=${userId}` : "";
        const res = await fetch(`${API_URL}/api/posts${query}`);
        const data: Post[] = await res.json();
        setPosts(data);

        // Hämtar likes per post
        data.forEach(async (post: Post) => {
          const res = await fetch(`${API_URL}/api/likes/${post.id}`);
          const likeData = await res.json();

          setLikes((prev) => ({ ...prev, [post.id]: likeData.count || 0 }));

          if (user && likeData.users?.includes(user.id)) {
            setUserLiked((prev) => ({ ...prev, [post.id]: true }));
          }
        });
      } catch (err) {
        console.error("Fel vid hämtning av posts:", err);
      }
    };

    fetchPosts();
  }, [user, userId]);

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

      setUserLiked((prev) => ({ ...prev, [postId]: liked }));
      setLikes((prev) => ({
        ...prev,
        [postId]: prev[postId] + (liked ? 1 : -1),
      }));
    } catch (err) {
      console.error("Fel vid like:", err);
    }
  };

  return (
    <div className="mt-4 space-y-4 pb-24 md:pb-5">
      {posts.map((post) => (
        <div
          key={post.id}
          className="border p-4 rounded-md bg-white dark:bg-gray-800 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <Link href={`/profile/${post.user_id}`} className="flex items-center gap-2">
              <img
                src={post.avatar_url || "/default-avatar.png"}
                alt={post.username || "okänd"}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="font-semibold text-blue-600 hover:underline">
                {post.username || "okänd"}
              </span>
            </Link>
          </div>

          <p className="text-gray-800 dark:text-gray-100">{post.content}</p>

          {post.image_url && (
            <img
              src={post.image_url}
              alt="post image"
              className="mt-2 max-h-64 w-full object-cover rounded"
            />
          )}

          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => handleLike(post.id)}
              className={`px-3 py-1 rounded transition ${
                userLiked[post.id]
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              ❤️ {likes[post.id] || 0}
            </button>

            <p className="text-gray-400 text-sm">
              {new Date(post.created_at).toLocaleString()}
            </p>
          </div>

          {user && <CommentSection postId={post.id} userId={user.id} />}
        </div>
      ))}
    </div>
  );
}



