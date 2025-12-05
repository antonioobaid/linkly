"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import CreatePost from "./components/CreatePost";
import PostFeed from "./components/PostFeed";
import { Post } from "../../../shared/types";
import Link from "next/link";
import { API_URL } from "@/lib/api";

export default function HomePage() {
  const { user, isLoaded } = useSupabaseUser();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Hämta alla gamla posts vid mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/posts`);
        const data: Post[] = await res.json();
        setPosts(data.reverse()); // visa nyast först
      } catch (err) {
        console.error("Fel vid hämtning av posts:", err);
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchPosts();
  }, []);

  const handleNewPost = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]); // lägg till ny post överst
  };

  const handleLogin = async () => {
    if (!email || !password) return alert("Fyll i alla fält!");
    setLoadingLogin(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) alert(error.message);
    else router.push("/");

    setLoadingLogin(false);
  };

  if (!isLoaded || loadingPosts)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  if (user)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-56 md:pl-20 md:pt-4 sm:pt-4 pt-24 px-4">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-600 drop-shadow-sm">
            Linkly – Dela dina tankar 💭
          </h1>

          <CreatePost userId={user.id} onPostCreated={handleNewPost} />
          <div className="mt-8">
            <PostFeed user={user} posts={posts} />
          </div>
        </motion.div>
      </div>
    );

  // Inloggningssidan
  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center px-6 bg-gray-50 dark:bg-gray-900">
      <motion.div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-6xl font-extrabold text-blue-600 drop-shadow mb-6">Linkly</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 max-w-md">
          Ett socialt nätverk där du kan dela tankar, följa vänner och skapa gemenskap.
        </p>
      </motion.div>

      <motion.div className="md:w-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Logga in</h2>

        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border rounded mb-4 dark:bg-gray-700 dark:border-gray-600" />
        <input type="password" placeholder="Lösenord" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border rounded mb-4 dark:bg-gray-700 dark:border-gray-600" />

        <button onClick={handleLogin} disabled={loadingLogin} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
          {loadingLogin ? "Loggar in..." : "Logga in"}
        </button>

        <p className="mt-4 text-center text-gray-600 dark:text-gray-300">
          Inget konto?
          <Link href="/register" className="text-blue-600 hover:underline ml-1">Skapa ett här</Link>
        </p>
      </motion.div>
    </div>
  );
}


