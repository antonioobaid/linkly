"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { User, Post } from "../../../../../shared/types";
import PostFeed from "../../components/PostFeed";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { API_URL } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

export default function OtherProfilePage() {
  const { user: currentUser, isLoaded } = useSupabaseUser();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);

  // Load profile
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

  // Load posts
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

  // Skicka meddelande
  const handleSendMessage = async () => {
    if (!currentUser || !profile) return;

    try {
      const { data: existingChats } = await supabase
        .from("chats")
        .select("*")
        .or(
          `and(user1_id.eq.${currentUser.id},user2_id.eq.${profile.id}),and(user1_id.eq.${profile.id},user2_id.eq.${currentUser.id})`
        )
        .limit(1);

      let chatId: string;
      if (existingChats && existingChats.length > 0) {
        chatId = existingChats[0].id;
      } else {
        const { data: newChat, error } = await supabase
          .from("chats")
          .insert([{ user1_id: currentUser.id, user2_id: profile.id }])
          .select()
          .single();
        if (error || !newChat) throw error || new Error("Kunde inte skapa chat");
        chatId = newChat.id;
      }

      router.push(`/inbox/${chatId}`);
    } catch (err) {
      console.error(err);
      alert("Kunde inte starta chat");
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
        Kunde inte hitta användaren.
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-56 md:pl-20 pt-24 px-4 pb-20">
        <div className="max-w-4xl mx-auto"> {/* Centrerar allt innehåll */}

         <div className="flex items-center mb-4 md:hidden"> {/* Endast synlig på mobil */}
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition"
            aria-label="Tillbaka"
          >
            <ArrowLeft className="w-6 h-6 text-gray-800 dark:text-gray-100" />
          </button>
        </div>

          {/* Profile Header – profilbild vänster, info höger */}
          <div className="flex flex-row flex-wrap items-center gap-4 mb-6">
            <div
              className="w-28 h-28 relative cursor-pointer flex-shrink-0"
              onClick={() => setShowImageModal(true)}
            >
              <Image
                src={profile.avatar_url || "/default-avatar.png"}
                alt={profile.username}
                fill
                className="rounded-full object-cover"
              />
            </div>

            <div className="flex flex-col items-start text-left flex-1 min-w-[150px]">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {profile.full_name || profile.username}
              </h1>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                @{profile.username}
              </span>
              {profile.bio && (
                <p className="mt-1 text-gray-600 dark:text-gray-300 max-w-md">
                  {profile.bio}
                </p>
              )}

              {currentUser && currentUser.id !== profile.id && (
                <button
                  onClick={handleSendMessage}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold"
                >
                  Skicka meddelande
                </button>
              )}
            </div>
          </div>

          {/* Posts */}
          {loadingPosts ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin h-10 w-10 border-b-2 border-blue-500 rounded-full"></div>
            </div>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">Inga inlägg ännu...</p>
          ) : (
            <div className="max-w-4xl mx-auto">
              <PostFeed user={currentUser} posts={posts} />
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div
          onClick={() => setShowImageModal(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
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
