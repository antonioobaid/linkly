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

export default function PostModal({ postId, user, onClose, onCommentChange, onLikeChange }: PostModalProps) {
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

      setComments(commentData);
      setPost(postData);

      if (onCommentChange) onCommentChange(postId, commentData.length);
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
      setComments(prev => prev.map(c => (c.id === id ? { ...c, content: updated.content } : c)));
      setEditId(null);
      setEditText("");
    } catch (err) {
      console.error(err);
    }
  };

  const deleteComment = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/comments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Kunde inte ta bort kommentar");
      const newComments = comments.filter(c => c.id !== id);
      setComments(newComments);
      setOpenMenuId(null);

      if (onCommentChange) onCommentChange(postId, newComments.length);
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

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="animate-spin h-12 w-12 border-b-2 border-white rounded-full" />
    </div>
  );

  if (!post) return null;

  const images = post.image_urls ?? [];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4">
      <button onClick={onClose} className="fixed top-4 right-4 z-50 bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl hover:bg-black">✕</button>

      <div className="bg-white dark:bg-gray-900 w-full h-full sm:h-[95vh] sm:max-w-5xl rounded-none sm:rounded-lg overflow-hidden flex flex-col lg:flex-row">

        {/* LEFT – IMAGE */}
        <div className="lg:w-1/2 bg-black relative flex items-center justify-center">
          {images.length > 0 ? (
            <>
              <img
                src={images[activeImage]}
                alt={`post image ${activeImage + 1}`}
                className="max-w-[1000px] w-full h-auto object-contain"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage(prev => prev === 0 ? images.length - 1 : prev - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 text-white text-3xl w-10 h-10 rounded-full flex items-center justify-center"
                  >‹</button>
                  <button
                    onClick={() => setActiveImage(prev => prev === images.length - 1 ? 0 : prev + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 text-white text-3xl w-10 h-10 rounded-full flex items-center justify-center"
                  >›</button>
                </>
              )}
            </>
          ) : (
            <div className="text-white">Ingen bild</div>
          )}
        </div>

        {/* RIGHT – CONTENT */}
        <div className="lg:w-1/2 flex flex-col overflow-y-auto">

          {/* USER HEADER */}
          <div
            className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
            onClick={() => goToProfile(post.user_id)}
          >
            <div className="relative w-10 h-10">
              <Image src={post.avatar_url || "/default-avatar.png"} alt={post.username || "okänd"} fill sizes="40px" className="rounded-full object-cover" />
            </div>
            <span className="font-semibold text-blue-600">{post.username || "okänd"}</span>
          </div>

          {/* KOMMENTARER LISTA */}
          <div className="p-4 flex-1 overflow-y-auto">
            {comments.map(comment => (
              <div key={comment.id} className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 text-sm w-full bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">

                  <div
                    className="relative w-8 h-8 cursor-pointer"
                    onClick={e => { e.stopPropagation(); goToProfile(comment.user_id); }}
                  >
                    <Image src={comment.avatar_url || "/default-avatar.png"} alt={comment.username || "okänd"} fill sizes="32px" className="rounded-full object-cover" />
                  </div>

                  <div
                    className="cursor-pointer"
                    onClick={() => { if (editId !== comment.id) goToProfile(comment.user_id); }}
                  >
                    <strong className="text-gray-800 dark:text-gray-200">{comment.username || "okänd"}:</strong>{" "}
                    {editId === comment.id ? (
                      <div className="mt-1 flex flex-col gap-1" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          className="border p-1 rounded w-full text-sm dark:bg-gray-700 dark:text-white"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={e => { e.stopPropagation(); saveEdit(comment.id); }}
                            className="text-blue-600 font-semibold text-xs hover:underline"
                          >
                            Spara
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setEditId(null); }}
                            className="text-gray-500 text-xs hover:underline"
                          >
                            Avbryt
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span>{comment.content}</span>
                    )}
                  </div>
                </div>

                {comment.user_id === user?.id && editId !== comment.id && (
                  <div className="relative ml-2">
                    <button onClick={() => setOpenMenuId(openMenuId === comment.id ? null : comment.id)} className="px-2 py-1 text-gray-500 hover:text-gray-900 dark:hover:text-white">⋮</button>
                    {openMenuId === comment.id && (
                      <div className="absolute right-0 mt-1 bg-white dark:bg-gray-700 border rounded shadow-md p-2 w-28 text-sm z-10">
                        <button onClick={() => startEdit(comment)} className="block w-full text-left text-blue-600 hover:underline mb-1">Redigera</button>
                        <button onClick={() => deleteComment(comment.id)} className="block w-full text-left text-red-500 hover:underline">Ta bort</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* COMMENTSECTION */}
          {user && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <CommentSection
                postId={post.id}
                userId={user.id}
                onCommentAdded={handleNewComment}
           
                onLikeChanged={handleLikeChange} // <-- här skickar vi likes tillbaka
                initialCommentCount={comments.length}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
