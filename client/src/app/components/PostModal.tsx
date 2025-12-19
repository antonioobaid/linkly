"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";
import { Post, User, Comment } from "../../../../shared/types";
import CommentSection from "./CommentSection";

interface PostModalProps {
  postId: string;
  user: User | null;
  onClose: () => void;
  onCommentChange?: (postId: string, newCount: number) => void;
  onLikeChange?: (postId: string, newCount: number, likedByUser: boolean) => void;
}

export default function PostModal({
  postId,
  user,
  onClose,
  onCommentChange,
  onLikeChange,
}: PostModalProps) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchPostData = async () => {
    try {
      const postRes = await fetch(`${API_URL}/api/posts/${postId}`);
      if (!postRes.ok) throw new Error("Post hittades inte");
      const postData: Post = await postRes.json();

      const commentRes = await fetch(`${API_URL}/api/comments/${postId}`);
      const commentData: Comment[] = await commentRes.json();

      setPost(postData);
      setComments(commentData);
      onCommentChange?.(postId, commentData.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostData();
  }, [postId]);

  const startEdit = (comment: Comment) => {
    setEditId(comment.id);
    setEditText(comment.content);
    setOpenMenuId(null);
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editText }),
      });
      const updated = await res.json();
      setComments(prev =>
        prev.map(c => (c.id === id ? { ...c, content: updated.content } : c))
      );
      setEditId(null);
      setEditText("");
    } catch (err) {
      console.error(err);
    }
  };

  const deleteComment = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/comments/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Kunde inte ta bort kommentar");
      const newComments = comments.filter(c => c.id !== id);
      setComments(newComments);
      setOpenMenuId(null);
      onCommentChange?.(postId, newComments.length);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewComment = () => {
    fetchPostData();
  };

  const handleLikeChange = (liked: boolean, count: number) => {
    if (post && onLikeChange) {
      onLikeChange(post.id, count, liked);
    }
  };

  const goToProfile = (userId: string) => {
    if (userId === user?.id) router.push("/profile");
    else router.push(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="animate-spin h-12 w-12 border-b-2 border-white rounded-full" />
      </div>
    );
  }

  if (!post) return null;

  const images = post.image_urls ?? [];
  const totalImages = images.length;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4">
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-50 bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl hover:bg-black"
      >
        ✕
      </button>

      <div className="bg-white dark:bg-gray-900 w-full h-full sm:h-[95vh] sm:max-w-5xl overflow-hidden flex flex-col lg:flex-row">

        {/* IMAGE SECTION – ENDAST MOBIL-HÖJD ÄNDRAD */}
        <div
          className="
            relative
            w-full
            h-[45vh]
            sm:h-[50vh]
            lg:h-auto
            lg:w-1/2
            bg-black
            flex
            items-center
            justify-center
          "
        >
          {images.length > 0 ? (
            <>
              <img
                src={images[activeImage]}
                alt={`post image ${activeImage + 1}`}
                className="w-full h-full object-contain"
              />

              {totalImages > 1 && (
                <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                  {activeImage + 1} / {totalImages}
                </div>
              )}

              {activeImage > 0 && (
                <button
                  onClick={() => setActiveImage(prev => prev - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl"
                >
                  ‹
                </button>
              )}

              {activeImage < totalImages - 1 && (
                <button
                  onClick={() => setActiveImage(prev => prev + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl"
                >
                  ›
                </button>
              )}
            </>
          ) : (
            <div className="text-white">Ingen bild</div>
          )}
        </div>

        {/* CONTENT */}
        <div className="lg:w-1/2 flex flex-col overflow-y-auto">

          {/* USER HEADER */}
          <div
            className="flex items-center gap-3 px-4 py-3 border-b cursor-pointer"
            onClick={() => goToProfile(post.user_id)}
          >
            <div className="relative w-10 h-10">
              <Image
                src={post.avatar_url || "/default-avatar.png"}
                alt={post.username || "okänd"}
                fill
                sizes="40px"
                className="rounded-full object-cover"
              />
            </div>
            <span className="font-semibold text-blue-600">
              {post.username}
            </span>
          </div>

          {/* POST CONTENT */}
          {post.content && (
            <div className="px-4 py-3 text-sm border-b dark:border-gray-700 bg-gray-100 dark:bg-gray-800 rounded-t-lg">
              <strong className="mr-2 text-blue-600">{post.username}</strong>
              <span className="text-gray-800 dark:text-gray-100">{post.content}</span>
            </div>
          )}

         {/* COMMENTS */}
<div className="p-4 flex-1 overflow-y-auto space-y-3">
  {comments.map(comment => (
    <div key={comment.id} className="flex items-start justify-between">
      <div className="flex items-start gap-3 w-full">
        {/* Avatar + username klickbar */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => goToProfile(comment.user_id)}
        >
          <div className="relative w-8 h-8 flex-shrink-0">
            <Image
              src={comment.avatar_url || "/default-avatar.png"}
              alt={comment.username || "okänd"}
              fill
              sizes="32px"
              className="rounded-full object-cover"
            />
          </div>
          <strong className="text-blue-600">{comment.username}</strong>
        </div>

        {/* Comment text */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg relative group">
          {editId === comment.id ? (
            <div>
              <input
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className="border p-1 rounded w-full text-sm"
              />
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => saveEdit(comment.id)}
                  className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                >
                  Spara
                </button>
                <button
                  onClick={() => setEditId(null)}
                  className="px-2 py-1 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded hover:bg-gray-400 text-xs"
                >
                  Avbryt
                </button>
              </div>
            </div>
          ) : (
            <span>{comment.content}</span>
          )}

          {/* Dropdown meny för ägare */}
          {comment.user_id === user?.id && editId !== comment.id && (
            <div className="absolute top-1 right-1">
              <button
                onClick={() =>
                  setOpenMenuId(openMenuId === comment.id ? null : comment.id)
                }
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
              >
                ⋮
              </button>
              {openMenuId === comment.id && (
                <div className="absolute right-0 mt-2 w-28 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10">
                  <button
                    onClick={() => startEdit(comment)}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    ✏️ Redigera
                  </button>
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="block w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-700"
                  >
                    🗑️ Ta bort
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  ))}
</div>


          {/* COMMENT SECTION */}
          {user && (
            <div className="border-t p-4">
              <CommentSection
                postId={post.id}
                userId={user.id}
                onCommentAdded={handleNewComment}
                onLikeChanged={handleLikeChange}
                initialCommentCount={comments.length}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
