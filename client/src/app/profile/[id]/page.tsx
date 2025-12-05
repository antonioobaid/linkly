"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { User, Post } from "../../../../../shared/types";
import PostFeed from "../../components/PostFeed";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { API_URL } from "@/lib/api";

export default function OtherProfilePage() {
  const { user, isLoaded } = useSupabaseUser();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Load profile data
  useEffect(() => {
    if (!id) {
      router.push("/");
      return;
    }

    const loadProfile = async () => {
      try {
        const { data: userData, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setProfile(userData ?? null);
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id, router]);

  // Load posts for this user
  useEffect(() => {
    if (!id) return;

    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/posts?userId=${id}`);
        const data: Post[] = await res.json();
        setPosts(data.reverse());
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [id]);

  if (!isLoaded || loading) {
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
        <Image
          src={profile.avatar_url || "/default-avatar.png"}
          width={80}
          height={80}
          alt="avatar"
          className="rounded-full object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold">
            {profile.full_name || profile.username}
          </h1>
          <p className="text-gray-500">@{profile.username}</p>
          <p className="mt-2">{profile.bio}</p>
          <div className="mt-3">
            <Link href="/profile" className="px-3 py-1 border rounded">
              Till min profil
            </Link>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-3">Inlägg</h2>

      {loadingPosts ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin h-10 w-10 border-b-2 border-blue-500 rounded-full"></div>
        </div>
      ) : (
        <PostFeed user={user} posts={posts} />
      )}
    </div>
  );
}
