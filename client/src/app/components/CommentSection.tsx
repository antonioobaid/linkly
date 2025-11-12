"use client";

import { useEffect, useState } from "react";
import { Comment } from "@/types/types";

export default function CommentSection({
  postId,
  userId,
}: {
  postId: string;
  userId: string;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");

  const fetchComments = async () => {
    const res = await fetch(`http://localhost:4000/api/comments/${postId}`);
    const data = await res.json();
    setComments(data);
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;

    const res = await fetch("http://localhost:4000/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId, user_id: userId, text }),
    });

    const newComment = await res.json();
    console.log("Ny kommentar:", newComment);

    setComments((prev) => [...prev, newComment]);
    setText("");
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return (
    <div className="mt-3 border-t pt-3">
      <h3 className="text-sm font-semibold mb-2">Kommentarer:</h3>

      {comments.length === 0 && (
        <p className="text-gray-400 text-sm">Inga kommentarer ännu...</p>
      )}

      {comments.map((c) => (
        <div key={c.id} className="text-sm mb-1">
          <strong>{c.user_id.substring(0, 6)}:</strong> {c.text}
        </div>
      ))}

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
