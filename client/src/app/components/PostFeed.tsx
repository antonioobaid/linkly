/*"use client";

import { Post } from "@/types/types";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import CommentSection from "./CommentSection"; // 👈 Importera komponenten

export default function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const { user } = useUser();

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch("http://localhost:4000/api/posts");
      const data = await res.json();
      console.log("Hämtade poster:", data);
      setPosts(data);
    };
    fetchPosts();
  }, []);

  return (
    <div className="mt-4 space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="border p-4 rounded-md bg-white shadow-sm">
          <p>{post.content}</p>

          {post.image_url && (
            <img
              src={post.image_url}
              alt=""
              className="mt-2 max-h-64 w-full object-cover rounded"
            />
          )}

          <p className="text-gray-400 text-sm mt-2">
            {new Date(post.created_at).toLocaleString()}
          </p>

       
          {user && <CommentSection postId={post.id} userId={user.id} />}
        </div>
      ))}
    </div>
  );
}*/


"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import CommentSection from "./CommentSection";
import { Post } from "@/types/types";

export default function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const { user } = useUser();
  const [likes, setLikes] = useState<{ [key: string]: number }>({});
  const [userLiked, setUserLiked] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch("http://localhost:4000/api/posts");
      const data = await res.json();
      setPosts(data);

      // Hämta likes för varje post
      data.forEach(async (post: Post) => {
        const res = await fetch(`http://localhost:4000/api/likes/${post.id}`);
        const likeData = await res.json();
        setLikes((prev) => ({ ...prev, [post.id]: likeData.count }));

        if (user && likeData.users.includes(user.id)) {
          setUserLiked((prev) => ({ ...prev, [post.id]: true }));
        }
      });
    };
    fetchPosts();
  }, [user]);

  const handleLike = async (postId: string) => {
    if (!user) return alert("Du måste vara inloggad för att gilla!");

    const res = await fetch("http://localhost:4000/api/likes", {
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
  };

  return (
    <div className="mt-4 space-y-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="border p-4 rounded-md bg-white shadow-sm"
        >
          <p>{post.content}</p>

          {post.image_url && (
            <img
              src={post.image_url}
              alt=""
              className="mt-2 max-h-64 w-full object-cover rounded"
            />
          )}

          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => handleLike(post.id)}
              className={`px-3 py-1 rounded transition ${
                userLiked[post.id]
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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


