"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { supabase } from "@/lib/supabaseClient";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { API_URL } from "@/lib/api";
import { User, Post } from "../../../../shared/types";
import PostFeed from "../components/PostFeed";

export default function MyProfilePage() {
  const { user, isLoaded } = useSupabaseUser();
  const router = useRouter();

  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [showImageModal, setShowImageModal] = useState(false);

  // Ladda profil
  useEffect(() => {
    const loadProfile = async () => {
      if (!isLoaded) return;

      if (!user) {
        router.push("/");
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
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [isLoaded, user]);

  // Ladda användarens posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user) return;

      try {
        const res = await fetch(`${API_URL}/api/posts?userId=${user.id}`);
        const data: Post[] = await res.json();
        setPosts(data.reverse());
      } catch (err) {
        console.error("❌ Fel vid hämtning av dina inlägg:", err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchUserPosts();
  }, [user]);

  if (!isLoaded || loadingProfile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return <div className="p-6">Kunde inte hitta din profil.</div>;
  }

  return (
    <>
      {/* PAGE CONTAINER - samma stil som HomePage */}
      <div
        className="
          min-h-screen
          bg-gray-50 
          dark:bg-gray-900
          lg:pl-56 
          md:pl-20
          pt-24
          px-4
          pb-20
        "
      >
        <div className="max-w-3xl mx-auto">

          {/* PROFIL HEADER */}
          <div className="flex items-center gap-6">
            <Image
              src={profile.avatar_url || "/default-avatar.png"}
              alt={profile.full_name || profile.username}
              width={120}
              height={120}
              className="w-28 h-28 rounded-full object-cover cursor-pointer hover:opacity-90 transition"
              onClick={() => setShowImageModal(true)}
            />

            <div>
              <h1 className="text-3xl font-bold dark:text-white">
                {profile.full_name || `${profile.first_name} ${profile.last_name}`}
              </h1>

              <p className="text-gray-500 dark:text-gray-400">@{profile.username}</p>

              <p className="mt-2 dark:text-gray-300">
                {profile.bio || "Ingen bio ännu"}
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
          <h2 className="text-lg font-semibold mt-10 mb-3 dark:text-white">Dina inlägg</h2>

          {loadingPosts ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : posts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Du har inga inlägg än.</p>
          ) : (
            <PostFeed user={user} posts={posts} />
          )}
        </div>
      </div>

      {/* IMAGE MODAL (Instagram style) */}
      {showImageModal && (
        <div
          onClick={() => setShowImageModal(false)}
          className="
            fixed inset-0 bg-black/70 backdrop-blur-sm 
            flex items-center justify-center z-50
          "
        >
          <Image
            src={profile.avatar_url || "/default-avatar.png"}
            alt="Profile Big"
            width={500}
            height={500}
            className="rounded-xl object-cover max-w-[90%] max-h-[90%]"
          />
        </div>
      )}
    </>
  );
}
