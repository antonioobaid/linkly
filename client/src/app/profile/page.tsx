// client/src/app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { User, Post } from "../../../../shared/types";

export default function MyProfilePage() {
  const { user, isLoaded } = useSupabaseUser();
  const router = useRouter();

  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!isLoaded) return;

      if (!user) {
        console.log("⛔ No user -> redirect to login");
        router.push("/login");
        return;
      }

      try {
        console.log("🔍 Fetching profile for:", user.id);

        const { data: userData, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        console.log("✅ Profile loaded:", userData);

        const { data: postData, error: postsError } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (postsError) throw postsError;

        console.log("📄 Posts loaded:", postData);

        setProfile(userData as User);
        setPosts(postData as Post[]);
      } catch (err: any) {
        console.error("❌ Error loading profile:", err);
        alert("Fel: " + err.message);
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
        <img
          src={profile.avatar_url || "/default-avatar.png"}
          alt={profile.full_name || profile.username}
          className="w-24 h-24 rounded-full object-cover"
        />

        <div>
          <h1 className="text-2xl font-bold">
            {profile.full_name || `${profile.first_name} ${profile.last_name}`}
          </h1>

          <p className="text-gray-500">@{profile.username}</p>

          <p className="mt-2">
            {profile.bio ? profile.bio : "Ingen bio ännu"}
          </p>

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

      {/* POSTS */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Dina inlägg</h2>

        {posts.length === 0 && (
          <p className="text-gray-500">Du har inga inlägg ännu.</p>
        )}

        <div className="space-y-4">
          {posts.map((p) => (
            <div key={p.id} className="border p-4 rounded bg-gray-50">
              <p>{p.content}</p>

              {p.image_url && (
                <img
                  src={p.image_url}
                  className="mt-2 w-full rounded"
                  alt="post"
                />
              )}

              <p className="text-xs text-gray-400 mt-2">
                {new Date(p.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

