"use client";

import { useEffect, useState } from "react";

type Post = {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  created_at: string;
};

export default function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch("http://localhost:4000/api/posts");
      const data = await res.json();
      console.log("Hämtade poster:", data); // ✅ Kontrollera poster i console
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
        </div>
      ))}
    </div>
  );
}
