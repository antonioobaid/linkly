// client/src/app/profile/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { User } from "../../../../../shared/types";
import Image from "next/image";
import { API_URL } from "@/lib/api";


export default function EditProfilePage() {
  const { user, isLoaded } = useSupabaseUser();
  const router = useRouter();

  const [profile, setProfile] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  // Load profile from Supabase
  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push("/");
      return;
    }

    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setProfile(data);
        setUsername(data.username || "");
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setBio(data.bio || "");
      } catch (err) {
        console.error("❌ Error loading profile:", err);
      }
    };

    loadProfile();
  }, [isLoaded, user, router]);

  // Handle avatar selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    if (!file) return;

    // -- FRONTEND VALIDATION --
    const maxSize = 2 * 1024 * 1024; // 2 MB max
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Endast JPEG, PNG eller WEBP tillåts.");
      return;
    }

    if (file.size > maxSize) {
      alert("Filen är för stor. Max 2 MB.");
      return;
    }

    setAvatarFile(file);
  };

  // Save profile changes and upload avatar
  const handleSave = async () => {
    if (!user) return alert("Ingen användare inloggad");
    setLoading(true);

    try {
      let avatar_url = profile?.avatar_url ?? null;

      // Upload avatar via backend
      if (avatarFile) {
        console.log("📤 Uploading avatar via backend...");

        const formData = new FormData();
        formData.append("file", avatarFile);
        formData.append("userId", user.id);

        const res = await fetch(`${API_URL}/api/avatarUpload`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          console.error("❌ Backend avatar upload error:", data);
          throw new Error(data.error || "Kunde inte ladda upp avatar");
        }

        avatar_url = data.url;
      }

      // Update Supabase user profile
      const full_name =
        `${firstName} ${lastName}`.trim() === "" ? null : `${firstName} ${lastName}`;
      
      const { error } = await supabase
        .from("users")
        .update({
          username,
          first_name: firstName,
          last_name: lastName,
          bio,
          avatar_url,
        })
        .eq("id", user.id);

      if (error) throw error;

      alert("Profil uppdaterad!");
      router.push("/profile");
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      if (error instanceof Error) {
        alert("Fel: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return <div className="p-6">Laddar auth...</div>;
  if (!user) return <div className="p-6">Du måste logga in.</div>;
  if (!profile) return <div className="p-6">Laddar profil...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-12 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Redigera profil</h1>

      <div className="space-y-4">

        {/* Avatar */}
        <div>
          <label className="block text-sm font-medium">Profilbild</label>
          <div className="flex items-center gap-4 mt-2">
             <Image
              src={profile.avatar_url || "/default-avatar.png"}
              alt="Avatar"
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
            <input type="file" accept="image/*" onChange={handleAvatarChange} />
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium">Användarnamn</label>
          <input
            className="w-full p-2 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* Names */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium">Förnamn</label>
            <input
              className="w-full p-2 border rounded"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Efternamn</label>
            <input
              className="w-full p-2 border rounded"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium">Bio</label>
          <textarea
            className="w-full p-2 border rounded"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? "Sparar..." : "Spara"}
          </button>

          <button
            onClick={() => router.push("/profile")}
            className="px-4 py-2 border rounded"
          >
            Avbryt
          </button>
        </div>

      </div>
    </div>
  );
}
