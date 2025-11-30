"use client";

import CreatePost from "./components/CreatePost";
import PostFeed from "./components/PostFeed";
import { motion } from "framer-motion";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import Link from "next/link";

export default function HomePage() {
  const { user, isLoaded } = useSupabaseUser();

  if (!isLoaded)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 
                    lg:pl-56 md:pl-20 md:pt-4 sm:pt-4 pt-24 px-4">
      <motion.div
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-600 drop-shadow-sm">
          Linkly – Dela dina tankar 💭
        </h1>

        {user ? (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <CreatePost userId={user.id} />
            </motion.div>

            <motion.div className="mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              <PostFeed user={user} />
            </motion.div>
          </>
        ) : (
          <motion.div
            className="text-center space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-lg text-gray-700 dark:text-gray-300 font-medium">
              Utforska inlägg från andra användare och bli en del av vårt sociala nätverk!
            </p>

            <Link href="/login" className="mt-4 px-6 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-all">
              Logga in
            </Link>
            <Link href="/register" className="mt-2 px-6 py-2 rounded-full bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition-all">
              Registrera
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

