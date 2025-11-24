// client/src/app/profile/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { User, Post } from "../../../../../shared/types";

export default function OtherProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      console.warn("OtherProfile: no id param, redirect to /");
      router.push("/");
      return;
    }

    const load = async () => {
      console.log("🔍 OtherProfile: fetching profile for", id);
      try {
        const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

        console.log("✅ OtherProfile: profile:", userData);

        const { data: userPosts, error: postsError } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false });


        if (postsError) throw postsError;
        console.log("✅ OtherProfile: posts:", userPosts);

        setProfile(userData || null);
        setPosts(userPosts || []);
      } catch (err: any) {
        console.error("❌ OtherProfile: error loading:", err);
        alert("Fel vid hämtning: " + err.message);
      } finally {
        setLoading(false);
        console.log("⏳ OtherProfile: finished loading");
      }
    };

    load();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return <div className="p-6">Kunde inte hitta användaren.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <div className="flex items-center gap-4">
        <img src={profile.avatar_url || "/default-avatar.png"} className="w-20 h-20 rounded-full object-cover" />
        <div>
          <h1 className="text-2xl font-bold">{profile.full_name || profile.username}</h1>
          <p className="text-gray-500">@{profile.username}</p>
          <p className="mt-2">{profile.bio}</p>
          <div className="mt-3">
            <Link href="/profile" className="px-3 py-1 border rounded">Till min profil</Link>
          </div>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Inlägg</h2>
        {posts.length === 0 && <p className="text-gray-500">Inga inlägg.</p>}
        <div className="space-y-4">
          {posts.map((p) => (
            <div key={p.id} className="border p-4 rounded bg-gray-50">
              <p>{p.content}</p>
              {p.image_url && <img src={p.image_url} className="mt-2 w-full rounded" alt="post image" />}
              <p className="text-xs text-gray-400 mt-2">{new Date(p.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

