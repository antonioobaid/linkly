"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import { Post, User } from "../../../../shared/types";
import CommentSection from "./CommentSection";

interface PostModalProps {
  postId: string;
  user: User | null;
  onClose: () => void;
}

export default function PostModal({ postId, user, onClose }: PostModalProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState<number>(0);
  const [userLiked, setUserLiked] = useState<boolean>(false);
  const [commentCount, setCommentCount] = useState<number>(0);

  // Hämta post, likes och comment-count
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const postRes = await fetch(`${API_URL}/api/posts/${postId}`);
        if (!postRes.ok) throw new Error("Post hittades inte");
        const postData: Post = await postRes.json();
        setPost(postData);

        const likeRes = await fetch(`${API_URL}/api/likes/${postId}`);
        const likeData = await likeRes.json();
        setLikes(likeData.count || 0);
        if (user && likeData.users?.includes(user.id)) setUserLiked(true);

        const commentRes = await fetch(`${API_URL}/api/comments/${postId}`);
        const commentData = await commentRes.json();
        setCommentCount(commentData.length || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPostData();
  }, [postId, user]);

  const handleLike = async () => {
    if (!user || !post) return;
    try {
      const res = await fetch(`${API_URL}/api/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: post.id, user_id: user.id }),
      });
      const data = await res.json();
      setUserLiked(data.liked);
      setLikes(prev => prev + (data.liked ? 1 : -1));
    } catch (err) {
      console.error("Fel vid like:", err);
    }
  };

  const handleCommentAdded = () => {
    setCommentCount(prev => prev + 1);
  };

  const handleCommentDeleted = () => {
    setCommentCount(prev => Math.max(prev - 1, 0)); // så att det aldrig blir negativt
  };

  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  if (!post) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-4xl flex flex-col lg:flex-row max-h-[90vh] overflow-hidden relative shadow-lg">
        {/* Vänster: bild */}
        <div className="lg:w-1/2 bg-black flex items-center justify-center overflow-hidden">
          {post.image_urls && post.image_urls.length > 0 ? (
            <img
              src={post.image_urls[0]}
              alt="post image"
              className="object-contain max-h-[90vh] w-full"
            />
          ) : (
            <div className="text-white">Ingen bild</div>
          )}
        </div>

        {/* Höger: innehåll */}
        <div className="lg:w-1/2 flex flex-col p-4 overflow-y-auto relative">
          {/* Stäng-knapp */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-2xl font-bold text-white lg:text-black hover:text-red-500"
          >
            ✕
          </button>

          {/* Användare */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src={post.avatar_url || "/default-avatar.png"}
              alt={post.username || "okänd"}
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="font-semibold text-blue-600">{post.username || "okänd"}</span>
          </div>

          {/* Postens text */}
          <p className="mb-4 text-gray-800 dark:text-gray-100">{post.content}</p>

          {/* Likes och kommentarer */}
          <div className="flex items-center gap-4 mb-4 text-gray-600 dark:text-gray-300">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-sm px-3 py-1 rounded transition ${
                userLiked
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {userLiked ? "❤️" : "🤍"} {likes}
            </button>
            <div className="flex items-center gap-1 text-sm">
              💬 {commentCount}
            </div>
          </div>

          {/* Kommentarer */}
          {user && (
            <div className="mt-auto">
              <CommentSection
                postId={post.id}
                userId={user.id}
                onCommentAdded={handleCommentAdded}
                onCommentDeleted={handleCommentDeleted} // <-- här
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
