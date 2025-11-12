"use client";

import { useState } from "react";

export default function CreatePost({ userId }: { userId: string }) {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    let imageUrl = "";

    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);

      const uploadRes = await fetch("http://localhost:4000/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        console.error("Fel vid filuppladdning:", await uploadRes.text());
        return;
      }

      const uploadData = await uploadRes.json();
      imageUrl = uploadData.url;
    }

    const res = await fetch("http://localhost:4000/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, image_url: imageUrl, user_id: userId }),
    });

    const data = await res.json();
    console.log("Skapad post:", data); // ✅ Se posten direkt i console

    if (res.ok) {
      setContent("");
      setImageFile(null);
      alert("Post skapad!");
    } else {
      console.error("Fel vid skapande av post:", data);
    }
  };

  return (
    <div className="p-4 border rounded-md mb-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Vad tänker du på?"
        className="w-full border p-2 rounded"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        className="w-full mt-2"
      />
      <button
        onClick={handleSubmit}
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Skapa inlägg
      </button>
    </div>
  );
}
