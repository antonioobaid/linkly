/*"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CommentSection from "./CommentSection";
import { API_URL } from "@/lib/api";
import { Post, User } from "../../../../shared/types";

interface PostFeedProps {
  user: User | null;
  userId?: string;
  posts: Post[]; // posts kommer från parent
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: (updatedPost: Post) => void; // Parent ska uppdatera state
}

export default function PostFeed({ user, posts, onPostDeleted, onPostUpdated }: PostFeedProps) {
  const [likes, setLikes] = useState<{ [key: string]: number }>({});
  const [userLiked, setUserLiked] = useState<{ [key: string]: boolean }>({});
  const [commentCounts, setCommentCounts] = useState<{ [key: string]: number }>({});
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");

  // ✨ Separera gamla och nya bilder vid redigering
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

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

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Vill du verkligen radera detta inlägg?")) return;
    try {
      const res = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onPostDeleted?.(postId);
      }
    } catch (err) {
      console.error("Fel vid radering:", err);
    }
  };

  // UPDATE POST (text + bilder)
  const handleUpdatePost = async (postId: string) => {
    if (!editingContent.trim() && existingImages.length === 0 && newImageFiles.length === 0) {
      return alert("Innehållet kan inte vara tomt.");
    }

    try {
      let uploadedUrls: string[] = [];

      // Ladda upp nya bilder
      if (newImageFiles.length > 0) {
        const formData = new FormData();
        newImageFiles.forEach(file => formData.append("files", file));

        const uploadRes = await fetch(`${API_URL}/api/uploads`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Fel vid filuppladdning");

        const uploadData = await uploadRes.json();
        uploadedUrls = uploadData.urls;
      }

      // Kombinera gamla och nya bilder
      const finalImageUrls = [...existingImages, ...uploadedUrls];

      const res = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editingContent, image_urls: finalImageUrls }),
      });

      if (!res.ok) throw new Error("Kunde inte uppdatera posten");

      const updatedPost: Post = await res.json();

      // Skicka till parent så att state uppdateras
      onPostUpdated?.(updatedPost);

      // Rensa redigeringsstate
      setEditingPostId(null);
      setEditingContent("");
      setExistingImages([]);
      setNewImageFiles([]);
      setNewImagePreviews([]);
    } catch (err) {
      console.error("Fel vid uppdatering:", err);
    }
  };

  const handleNewComment = (postId: string) => {
    setCommentCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
  };

  const removeExistingImage = (url: string) => {
    setExistingImages(prev => prev.filter(u => u !== url));
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-4 space-y-6 pb-24 md:pb-5">
      {posts.map(post => (
        <div key={post.id} className="relative border p-4 rounded-md bg-white dark:bg-gray-800 shadow-sm">

          <div className="flex justify-between items-start mb-2">
            <Link href={`/profile/${post.user_id}`} className="flex items-center gap-2">
              <img
                src={post.avatar_url || "/default-avatar.png"}
                alt={post.username || "okänd"}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="font-semibold text-blue-600 hover:underline">{post.username || "okänd"}</span>
            </Link>

            {user?.id === post.user_id && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(menuOpen === post.id ? null : post.id)}
                  className="text-xl px-2"
                >
                  ⋯
                </button>

                {menuOpen === post.id && (
                  <div className="absolute right-0 mt-2 bg-white dark:bg-gray-700 shadow-lg rounded-md w-36 p-2 z-10">
                    <button
                      className="block w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                      onClick={() => {
                        setEditingPostId(post.id);
                        setEditingContent(post.content);
                        setExistingImages(post.image_urls || []);
                        setNewImageFiles([]);
                        setNewImagePreviews([]);
                        setMenuOpen(null);
                      }}
                    >
                      ✏️ Redigera
                    </button>
                    <button
                      className="block w-full text-left p-2 hover:bg-red-100 dark:hover:bg-red-600 rounded text-red-600 dark:text-red-300"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      🗑️ Ta bort
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

      
          {editingPostId === post.id ? (
            <div className="mt-2">
              <textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white"
                rows={3}
              />

       
              <div className="mt-2 flex gap-2 items-center">
                <label className="cursor-pointer bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                  Lägg till bilder
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setNewImageFiles(prev => [...prev, ...files]);
                      const urls = files.map(f => URL.createObjectURL(f));
                      setNewImagePreviews(prev => [...prev, ...urls]);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>

              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {existingImages.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img src={url} alt={`existing-${idx}`} className="w-full h-24 object-cover rounded border" />
                    <button
                      onClick={() => removeExistingImage(url)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {newImagePreviews.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img src={url} alt={`new-${idx}`} className="w-full h-24 object-cover rounded border" />
                    <button
                      onClick={() => removeNewImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleUpdatePost(post.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Spara
                </button>
                <button
                  onClick={() => setEditingPostId(null)}
                  className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white px-3 py-1 rounded hover:bg-gray-400"
                >
                  Avbryt
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-800 dark:text-gray-100">{post.content}</p>
          )}

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
                userLiked[post.id]
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
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
}*/


/*
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CommentSection from "./CommentSection";
import { API_URL } from "@/lib/api";
import { Post, User } from "../../../../shared/types";
import PostModal from "./PostModal";


interface PostFeedProps {
  user: User | null;
  posts: Post[];
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: (updatedPost: Post) => void;
}

export default function PostFeed({ user, posts, onPostDeleted, onPostUpdated }: PostFeedProps) {
  const [likes, setLikes] = useState<{ [key: string]: number }>({});
  const [userLiked, setUserLiked] = useState<{ [key: string]: boolean }>({});
  const [commentCounts, setCommentCounts] = useState<{ [key: string]: number }>({});
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Hämta likes och comment-count
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

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Vill du verkligen radera detta inlägg?")) return;
    try {
      const res = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: "DELETE",
      });
      if (res.ok) onPostDeleted?.(postId);
    } catch (err) {
      console.error("Fel vid radering:", err);
    }
  };

  const handleUpdatePost = async (postId: string) => {
    if (!editingContent.trim() && existingImages.length === 0 && newImageFiles.length === 0) {
      return alert("Innehållet kan inte vara tomt.");
    }

    try {
      let uploadedUrls: string[] = [];

      if (newImageFiles.length > 0) {
        const formData = new FormData();
        newImageFiles.forEach(file => formData.append("files", file));

        const uploadRes = await fetch(`${API_URL}/api/uploads`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Fel vid filuppladdning");

        const uploadData = await uploadRes.json();
        uploadedUrls = uploadData.urls;
      }

      const finalImageUrls = [...existingImages, ...uploadedUrls];

      const res = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editingContent, image_urls: finalImageUrls }),
      });

      if (!res.ok) throw new Error("Kunde inte uppdatera posten");

      const updatedPost: Post = await res.json();
      onPostUpdated?.(updatedPost);

      setEditingPostId(null);
      setEditingContent("");
      setExistingImages([]);
      setNewImageFiles([]);
      setNewImagePreviews([]);
    } catch (err) {
      console.error("Fel vid uppdatering:", err);
    }
  };

  const handleNewComment = (postId: string) => {
    setCommentCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
  };

  const removeExistingImage = (url: string) => {
    setExistingImages(prev => prev.filter(u => u !== url));
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-4 space-y-6 pb-24 md:pb-5">
      {posts.map(post => (
        <div
          key={post.id}
          className="relative border p-4 rounded-md bg-white dark:bg-gray-800 shadow-sm cursor-pointer"
          onClick={() => setSelectedPostId(post.id)}
        >
          <div className="flex justify-between items-start mb-2">
            <Link href={`/profile/${post.user_id}`} className="flex items-center gap-2">
              <img
                src={post.avatar_url || "/default-avatar.png"}
                alt={post.username || "okänd"}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="font-semibold text-blue-600 hover:underline">{post.username || "okänd"}</span>
            </Link>

            {user?.id === post.user_id && (
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === post.id ? null : post.id); }}
                  className="text-xl px-2"
                >⋯</button>

                {menuOpen === post.id && (
                  <div className="absolute right-0 mt-2 bg-white dark:bg-gray-700 shadow-lg rounded-md w-36 p-2 z-10">
                    <button
                      className="block w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPostId(post.id);
                        setEditingContent(post.content);
                        setExistingImages(post.image_urls || []);
                        setNewImageFiles([]);
                        setNewImagePreviews([]);
                        setMenuOpen(null);
                      }}
                    >✏️ Redigera</button>
                    <button
                      className="block w-full text-left p-2 hover:bg-red-100 dark:hover:bg-red-600 rounded text-red-600 dark:text-red-300"
                      onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                    >🗑️ Ta bort</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {editingPostId === post.id ? (
            <div className="mt-2">
              <textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white"
                rows={3}
              />
              <div className="mt-2 flex gap-2 items-center">
                <label className="cursor-pointer bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                  Lägg till bilder
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setNewImageFiles(prev => [...prev, ...files]);
                      const urls = files.map(f => URL.createObjectURL(f));
                      setNewImagePreviews(prev => [...prev, ...urls]);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>

              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {existingImages.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img src={url} alt={`existing-${idx}`} className="w-full h-24 object-cover rounded border" />
                    <button
                      onClick={() => removeExistingImage(url)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >×</button>
                  </div>
                ))}

                {newImagePreviews.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img src={url} alt={`new-${idx}`} className="w-full h-24 object-cover rounded border" />
                    <button
                      onClick={() => removeNewImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >×</button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleUpdatePost(post.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >Spara</button>
                <button
                  onClick={() => setEditingPostId(null)}
                  className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white px-3 py-1 rounded hover:bg-gray-400"
                >Avbryt</button>
              </div>
            </div>
          ) : (
            <p className="text-gray-800 dark:text-gray-100">{post.content}</p>
          )}

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
              onClick={(e) => { e.stopPropagation(); handleLike(post.id); }}
              className={`flex items-center gap-1 px-3 py-1 rounded transition ${
                userLiked[post.id] ? "bg-red-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >❤️ Gilla</button>

            <button
              onClick={(e) => { e.stopPropagation(); setOpenComments(openComments === post.id ? null : post.id); }}
              className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            >💬 Kommentar</button>

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

      {selectedPostId && (
        <PostModal postId={selectedPostId} onClose={() => setSelectedPostId(null)} />
      )}
    </div>
  );
}*/





"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CommentSection from "./CommentSection";
import PostModal from "./PostModal";
import EditPostModal from "./EditPostModal"; // Importera vår nya modal
import { API_URL } from "@/lib/api";
import { Post, User } from "../../../../shared/types";

interface PostFeedProps {
  user: User | null;
  posts: Post[];
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: (updatedPost: Post) => void;
}

export default function PostFeed({ user, posts, onPostDeleted, onPostUpdated }: PostFeedProps) {
  const [likes, setLikes] = useState<{ [key: string]: number }>({});
  const [userLiked, setUserLiked] = useState<{ [key: string]: boolean }>({});
  const [commentCounts, setCommentCounts] = useState<{ [key: string]: number }>({});
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Hämta likes och comment-count
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
      setUserLiked(prev => ({ ...prev, [postId]: liked }));
      setLikes(prev => ({ ...prev, [postId]: prev[postId] + (liked ? 1 : -1) }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Vill du verkligen radera detta inlägg?")) return;
    try {
      const res = await fetch(`${API_URL}/api/posts/${postId}`, { method: "DELETE" });
      if (res.ok) onPostDeleted?.(postId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewComment = (postId: string) => {
    setCommentCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
  };

  return (
    <div className="mt-4 space-y-6 pb-24 md:pb-5">
      {posts.map(post => (
        <div
          key={post.id}
          className="relative border p-4 rounded-md bg-white dark:bg-gray-800 shadow-sm cursor-pointer"
          onClick={() => setSelectedPostId(post.id)}
        >
          <div className="flex justify-between items-start mb-2">
            <Link href={`/profile/${post.user_id}`} className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <img src={post.avatar_url || "/default-avatar.png"} alt={post.username || "okänd"} className="w-8 h-8 rounded-full object-cover" />
              <span className="font-semibold text-blue-600 hover:underline">{post.username || "okänd"}</span>
            </Link>

            {user?.id === post.user_id && (
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === post.id ? null : post.id); }}
                  className="text-xl px-2"
                >⋯</button>

                {menuOpen === post.id && (
                  <div className="absolute right-0 mt-2 bg-white dark:bg-gray-700 shadow-lg rounded-md w-36 p-2 z-10">
                    <button
                      className="block w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                      onClick={(e) => { e.stopPropagation(); setEditingPostId(post.id); setMenuOpen(null); }}
                    >✏️ Redigera</button>
                    <button
                      className="block w-full text-left p-2 hover:bg-red-100 dark:hover:bg-red-600 rounded text-red-600 dark:text-red-300"
                      onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                    >🗑️ Ta bort</button>
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-gray-800 dark:text-gray-100">{post.content}</p>

          {post.image_urls && post.image_urls.length > 0 && (
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {post.image_urls.map((url, index) => (
                <img key={index} src={url} alt={`post image ${index + 1}`} className="max-h-64 w-full object-cover rounded" />
              ))}
            </div>
          )}

          <div className="flex gap-4 text-gray-500 text-sm mt-2 items-center">
            <div>❤️ {likes[post.id] || 0}</div>
            <div>💬 {commentCounts[post.id] || 0}</div>
          </div>

          <div className="flex gap-4 mt-3">
            <button onClick={(e) => { e.stopPropagation(); handleLike(post.id); }}
              className={`flex items-center gap-1 px-3 py-1 rounded transition ${userLiked[post.id] ? "bg-red-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"}`}
            >❤️ Gilla</button>

            <button onClick={(e) => { e.stopPropagation(); setOpenComments(openComments === post.id ? null : post.id); }}
              className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            >💬 Kommentar</button>
          </div>

          {openComments === post.id && user && (
            <div className="mt-3 border-t pt-3">
              <CommentSection postId={post.id} userId={user.id} onCommentAdded={() => handleNewComment(post.id)} />
            </div>
          )}
        </div>
      ))}

      {/* Visa PostModal */}
      {selectedPostId && user && (
        <PostModal postId={selectedPostId} user={user} onClose={() => setSelectedPostId(null)} />
      )}

      {/* Visa EditPostModal */}
      {editingPostId && (
        <EditPostModal
          post={posts.find(p => p.id === editingPostId)!}
          onClose={() => setEditingPostId(null)}
          onPostUpdated={onPostUpdated}
        />
      )}
    </div>
  );
}
