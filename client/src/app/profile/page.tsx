"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@/types/types";

export default function Profile() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [profileUser, setProfileUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    // Säker konvertering till string för alla fält som kräver string
    const profile: User = {
      id: user.id,
      username: (user.username as string) || (user.publicMetadata?.username as string) || "",
      full_name: (user.fullName as string) || "",
      avatar_url: (user.imageUrl as string) || "",
      bio: (user.publicMetadata?.bio as string) || "",
      created_at: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
    };

    setProfileUser(profile);

    const saveUser = async () => {
      const { error } = await supabase
        .from("users")
        .upsert([
          {
            id: profile.id,
            username: profile.username,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            bio: profile.bio,
            created_at: profile.created_at,
          },
        ]);
      if (error) console.error("Supabase upsert error:", error.message);
    };

    saveUser();
  }, [user, isLoaded]);

  if (!isLoaded) return <p>Laddar användarinfo...</p>;
  if (!user) return <p>Du är inte inloggad.</p>;
  if (!profileUser) return <p>Laddar profil...</p>;

  return (
    <div className="p-6 max-w-md mx-auto mt-10 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Din profil</h1>

      {profileUser.avatar_url && (
        <img
          src={profileUser.avatar_url}
          alt={profileUser.full_name}
          className="w-24 h-24 rounded-full mb-4"
        />
      )}

      <div className="mb-4">
        <p>
          <strong>Namn:</strong> {profileUser.full_name}
        </p>
        <p>
          <strong>Användarnamn:</strong> {profileUser.username || "Inte satt"}
        </p>
        <p>
          <strong>Bio:</strong> {profileUser.bio || "Ingen bio satt"}
        </p>
        <p>
          <strong>UserID:</strong> {profileUser.id}
        </p>
        <p>
          <strong>Skapad:</strong>{" "}
          {new Date(profileUser.created_at).toLocaleDateString()}
        </p>
      </div>

      <div>
        <button
          onClick={() => signOut()}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logga ut
        </button>
      </div>
    </div>
  );
}
