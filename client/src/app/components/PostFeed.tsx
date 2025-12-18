"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PostModal from "./PostModal";
import EditPostModal from "./EditPostModal";
import LikeModal from "./LikeModal";
import { API_URL } from "@/lib/api";
import { Post, User } from "../../../../shared/types";

interface PostFeedProps {
  user: User | null;
  posts: Post[];
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: (updatedPost: Post) => void;
}

export default function PostFeed({
  user,
  posts,
  onPostDeleted,
  onPostUpdated,
}: PostFeedProps) {
  const [likes, setLikes] = useState<{ [key: string]: number }>({});
  const [userLiked, setUserLiked] = useState<{ [key: string]: boolean }>({});
  const [commentCounts, setCommentCounts] = useState<{ [key: string]: number }>({});
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [likesModalPostId, setLikesModalPostId] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    posts.forEach(async (post) => {
      try {
        const likeRes = await fetch(`${API_URL}/api/likes/${post.id}`);
        const likeData = await likeRes.json();

        setLikes((prev) => ({ ...prev, [post.id]: likeData.count || 0 }));

        if (user && likeData.userIds?.includes(user.id)) {
          setUserLiked((prev) => ({ ...prev, [post.id]: true }));
        }

        const commentRes = await fetch(`${API_URL}/api/comments/${post.id}`);
        const commentData = await commentRes.json();
        setCommentCounts((prev) => ({ ...prev, [post.id]: commentData.length || 0 }));
      } catch (err) {
        console.error(err);
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

      setUserLiked((prev) => ({ ...prev, [postId]: liked }));
      setLikes((prev) => ({
        ...prev,
        [postId]: prev[postId] + (liked ? 1 : -1),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Vill du verkligen radera detta inlägg?")) return;
    try {
      const res = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: "DELETE",
      });
      if (res.ok) onPostDeleted?.(postId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentChange = (postId: string, newCount: number) => {
    setCommentCounts((prev) => ({ ...prev, [postId]: newCount }));
  };

  const nextImage = (postId: string, total: number) => {
    setActiveImageIndex((prev) => ({
      ...prev,
      [postId]: prev[postId] === undefined
        ? 0
        : (prev[postId] + 1) % total,
    }));
  };

  const prevImage = (postId: string, total: number) => {
    setActiveImageIndex((prev) => ({
      ...prev,
      [postId]: prev[postId] === undefined
        ? 0
        : (prev[postId] - 1 + total) % total,
    }));
  };

  return (
    <div className="mt-4 space-y-6 pb-24 md:pb-5">
      {posts.map((post) => {
        const images = post.image_urls || [];
        const activeIndex = activeImageIndex[post.id] || 0;

        return (
          <div
            key={post.id}
            className="relative border p-4 rounded-md bg-white dark:bg-gray-800 shadow-sm cursor-pointer"
            onClick={() => setSelectedPostId(post.id)}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
              <Link
                href={post.user_id === user?.id ? "/profile" : `/profile/${post.user_id}`}
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={post.avatar_url || "/default-avatar.png"}
                  alt={post.username || "okänd"}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-semibold text-blue-600 hover:underline">
                  {post.username || "okänd"}
                </span>
              </Link>

              {user?.id === post.user_id && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === post.id ? null : post.id);
                    }}
                    className="text-xl px-2"
                  >
                    ⋯
                  </button>

                  {menuOpen === post.id && (
                    <div className="absolute right-0 mt-2 bg-white dark:bg-gray-700 shadow-lg rounded-md w-36 p-2 z-10">
                      <button
                        className="block w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPostId(post.id);
                          setMenuOpen(null);
                        }}
                      >
                        ✏️ Redigera
                      </button>
                      <button
                        className="block w-full text-left p-2 hover:bg-red-100 dark:hover:bg-red-600 rounded text-red-600 dark:text-red-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePost(post.id);
                        }}
                      >
                        🗑️ Ta bort
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            <p className="text-gray-800 dark:text-gray-100">{post.content}</p>

            {/* Bilder med bläddring */}
            {images.length > 0 && (
              <div className="mt-2 relative w-full h-64 sm:h-80 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden flex items-center justify-center">
                <img
                  src={images[activeIndex]}
                  alt={`post image ${activeIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage(post.id, images.length);
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/50"
                    >
                      ‹
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage(post.id, images.length);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/50"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Likes & Comments */}
            <div className="flex gap-6 text-gray-500 text-sm mt-2 items-center">
              <div className="flex items-center gap-1 select-none">
                <svg
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(post.id);
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={userLiked[post.id] ? "red" : "white"}
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
                <span
                  className="cursor-pointer text-sm hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLikesModalPostId(post.id);
                  }}
                >
                  {likes[post.id] || 0}
                </span>
              </div>

              <div
                className="flex items-center gap-1 cursor-pointer hover:text-blue-600 select-none"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPostId(post.id);
                }}
              >
                💬 {commentCounts[post.id] || 0}
              </div>
            </div>
          </div>
        );
      })}

      {selectedPostId && user && (
        <PostModal
          postId={selectedPostId}
          user={user}
          onClose={() => setSelectedPostId(null)}
          onCommentChange={handleCommentChange}
          onLikeChange={(postId, newCount, likedByUser) => {
            setLikes((prev) => ({ ...prev, [postId]: newCount }));
            setUserLiked((prev) => ({ ...prev, [postId]: likedByUser }));
          }}
        />
      )}

      {likesModalPostId && (
        <LikeModal
          postId={likesModalPostId}
          onClose={() => setLikesModalPostId(null)}
        />
      )}

      {editingPostId && (
        <EditPostModal
          post={posts.find((p) => p.id === editingPostId)!}
          onClose={() => setEditingPostId(null)}
          onPostUpdated={(updatedPost) => {
            onPostUpdated?.(updatedPost);
            setEditingPostId(null);
          }}
        />
      )}
    </div>
  );
}
