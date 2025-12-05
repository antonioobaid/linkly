"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";
import { Post } from "../../../../shared/types";

interface CreatePostProps {
  userId: string;
  onPostCreated?: (newPost: Post) => void; // tar Post som argument
}

export default function CreatePost({ userId, onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Hantera filval
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setImageFiles(prev => [...prev, ...files]);
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...urls]);

    // Nollställ input så man kan välja samma fil igen
    e.target.value = "";
  };

  // Ta bort en bild
  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Skapa post
  const handleSubmit = async () => {
    if (!content.trim() && imageFiles.length === 0) {
      return alert("Du måste skriva något eller ladda upp minst en bild.");
    }

    setLoading(true);

    try {
      let imageUrls: string[] = [];

      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach(file => formData.append("files", file));

        const uploadRes = await fetch(`${API_URL}/api/uploads`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          console.error("Fel vid filuppladdning:", await uploadRes.text());
          setLoading(false);
          return;
        }

        const uploadData = await uploadRes.json();
        imageUrls = uploadData.urls;
      }

      const res = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, image_urls: imageUrls, user_id: userId }),
      });

      const createdPost = await res.json();

      if (res.ok) {
        onPostCreated?.(createdPost); // ✅ Lägg till posten direkt i feed
        setContent("");
        setImageFiles([]);
        setPreviewUrls([]);
      } else {
        console.error("Fel vid skapande av post:", createdPost);
      }
    } catch (err) {
      console.error("Fel vid skapande av post:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md mb-6 bg-white dark:bg-gray-800 shadow-md">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Vad tänker du på?"
        className="w-full border p-2 rounded resize-none focus:outline-blue-400 dark:bg-gray-700 dark:text-white"
        rows={3}
      />

      <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2">
        <label className="cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition">
          Välj bilder
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Laddar..." : "Skapa inlägg"}
        </button>
      </div>

      {previewUrls.length > 0 && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {previewUrls.map((url, idx) => (
            <div key={idx} className="relative group">
              <img
                src={url}
                alt={`preview-${idx}`}
                className="w-full h-24 object-cover rounded border"
              />
              <button
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

