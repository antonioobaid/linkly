"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { User } from "../../../../shared/types";
import Image from "next/image";
import PostFeed from "../components/PostFeed";

export default function MyProfilePage() {
  const { user, isLoaded } = useSupabaseUser();
  const router = useRouter();

  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!isLoaded) return;

      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const { data: userData, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setProfile(userData as User);
      } catch (err) {
        console.error("❌ Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isLoaded, user]);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return <div className="p-6">Kunde inte hitta din profil.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-12 p-6 bg-white rounded-lg shadow">
      <div className="flex items-center gap-4">
        <Image
          src={profile.avatar_url || "/default-avatar.png"}
          alt={profile.full_name || profile.username}
          width={96}
          height={96}
          className="w-24 h-24 rounded-full object-cover"
        />

        <div>
          <h1 className="text-2xl font-bold">
            {profile.full_name || `${profile.first_name} ${profile.last_name}`}
          </h1>

          <p className="text-gray-500">@{profile.username}</p>

          <p className="mt-2">{profile.bio || "Ingen bio ännu"}</p>

          <div className="mt-3">
            <Link
              href="/profile/edit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Redigera profil
            </Link>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-3">Dina inlägg</h2>
      {user && <PostFeed user={user} userId={user.id} />}
    </div>
  );
}
