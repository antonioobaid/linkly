"use client";

import { useState } from "react";
import { Post, User } from "../../../../shared/types";
import { API_URL } from "@/lib/api";

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
  onPostUpdated?: (updatedPost: Post) => void;
}

export default function EditPostModal({ post, onClose, onPostUpdated }: EditPostModalProps) {
  const [content, setContent] = useState(post.content);
  const [existingImages, setExistingImages] = useState<string[]>(post.image_urls || []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const removeExistingImage = (url: string) => setExistingImages(prev => prev.filter(u => u !== url));
  const removeNewImage = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!content.trim() && existingImages.length === 0 && newFiles.length === 0) {
      return alert("Innehållet kan inte vara tomt.");
    }

    try {
      let uploadedUrls: string[] = [];
      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach(file => formData.append("files", file));
        const uploadRes = await fetch(`${API_URL}/api/uploads`, { method: "POST", body: formData });
        if (!uploadRes.ok) throw new Error("Fel vid filuppladdning");
        const uploadData = await uploadRes.json();
        uploadedUrls = uploadData.urls;
      }

      const finalImages = [...existingImages, ...uploadedUrls];

      const res = await fetch(`${API_URL}/api/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, image_urls: finalImages }),
      });

      if (!res.ok) throw new Error("Kunde inte uppdatera posten");
      const updatedPost: Post = await res.json();
      onPostUpdated?.(updatedPost);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-md w-full max-w-lg">
        <h2 className="text-lg font-semibold mb-4">Redigera inlägg</h2>
        <textarea
          className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="mt-2 flex gap-2 items-center">
          <label className="cursor-pointer bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
            Lägg till bilder
            <input type="file" multiple accept="image/*" className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setNewFiles(prev => [...prev, ...files]);
                setNewPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {existingImages.map((url, idx) => (
            <div key={idx} className="relative group">
              <img src={url} alt={`existing-${idx}`} className="w-full h-24 object-cover rounded border" />
              <button onClick={() => removeExistingImage(url)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">×</button>
            </div>
          ))}
          {newPreviews.map((url, idx) => (
            <div key={idx} className="relative group">
              <img src={url} alt={`new-${idx}`} className="w-full h-24 object-cover rounded border" />
              <button onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">×</button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4 justify-end">
          <button onClick={handleSave} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Spara</button>
          <button onClick={onClose} className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white px-3 py-1 rounded hover:bg-gray-400">Avbryt</button>
        </div>
      </div>
    </div>
  );
}
