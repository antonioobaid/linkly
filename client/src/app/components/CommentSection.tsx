"use client";

import { useEffect, useState } from "react";
import { Comment} from "../../../../shared/types";
import { API_URL } from "@/lib/api";

export default function CommentSection({
  postId,
  userId,
}: {
  postId: string;
  userId: string;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // ----------------------------------------------------
  // HÄMTA KOMMENTARER
  // ----------------------------------------------------
  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/comments/${postId}`);
      const data = await res.json();
      setComments(data);
    } catch (error) {
      console.error("Fel vid hämtning av kommentarer:", error);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // SKAPA KOMMENTAR
  // ----------------------------------------------------
  const handleSubmit = async () => {
    if (!text.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: postId,
          user_id: userId,
          content: text,
        }),
      });

      const newComment = await res.json();
      setComments((prev) => [...prev, newComment]);
      setText("");
    } catch (error) {
      console.error("Fel vid kommentar:", error);
    }
  };

  const startEdit = (comment: Comment) => {
    setEditId(comment.id);
    setEditText(comment.content);
    setOpenMenuId(null);
  };

  const saveEdit = async (id: string) => {
    const res = await fetch(`${API_URL}/api/comments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editText }),
    });

    const updated = await res.json();

    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, content: updated.content } : c))
    );

    // avsluta editering
    setEditId(null);
    setEditText("");
  };

    // 🗑️ DELETE kommentar
  const deleteComment = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/comments/${id}`, {
        method: "DELETE",
      });

      setComments((prev) => prev.filter((c) => c.id !== id));
      setOpenMenuId(null);
    } catch (err) {
      console.error("Fel vid radering:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  // ----------------------------------------------------
  // RENDERING
  // ----------------------------------------------------
  return (
     <div className="mt-3 border-t pt-3">
      <h3 className="text-sm font-semibold mb-2">Kommentarer:</h3>

      {loading && <p className="text-gray-400 text-sm">Laddar...</p>}
      {!loading && comments.length === 0 && (
        <p className="text-gray-400 text-sm">Inga kommentarer ännu...</p>
      )}

      {/* Kommentarlista */}
      {!loading &&
        comments.map((c) => (
          <div key={c.id} className="flex items-start justify-between mb-2">
            <div className="text-sm w-full">
              <strong>{c.username ?? "okänd"}:</strong>

              {/* ✏️ EDIT MODE */}
              {editId === c.id ? (
                <div className="mt-1">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="border p-1 rounded w-full text-sm"
                  />
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => saveEdit(c.id)}
                      className="text-blue-600 font-semibold text-xs"
                    >
                      Spara
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="text-gray-500 text-xs"
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              ) : (
                <span> {c.content}</span>
              )}
            </div>

            {/* Meny ⋮ (bara för ägaren) */}
            {c.user_id === userId && editId !== c.id && (
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenMenuId(openMenuId === c.id ? null : c.id)
                  }
                  className="px-2 py-1 text-gray-500 hover:text-black"
                >
                  ⋮
                </button>

                {openMenuId === c.id && (
                  <div className="absolute right-0 mt-1 bg-white border rounded shadow-md p-2 w-28 text-sm z-10">
                    <button
                      onClick={() => startEdit(c)}
                      className="block w-full text-left text-blue-600 hover:underline mb-1"
                    >
                      Redigera
                    </button>

                    <button
                      onClick={() => deleteComment(c.id)}
                      className="block w-full text-left text-red-500 hover:underline"
                    >
                      Ta bort
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

      {/* Ny kommentar */}
      <div className="flex mt-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Skriv en kommentar..."
          className="border p-1 rounded flex-1 mr-2"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          Skicka
        </button>
      </div>
    </div>
  );
}
