/*"use client";

import { useUser } from "@clerk/nextjs";
import CreatePost from "./components/CreatePost";
import PostFeed from "./components/PostFeed";
import { motion } from "framer-motion";

export default function HomePage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-4">
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CreatePost userId={user.id} />
            </motion.div>

            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <PostFeed />
            </motion.div>
          </>
        ) : (
          <motion.div
            className="text-center space-y-6 bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-lg text-gray-700 font-medium">
              Utforska inlägg från andra användare och bli en del av vårt sociala nätverk!
            </p>

            <div className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white shadow-inner">
              <p className="text-gray-500 italic mb-4 text-sm uppercase tracking-wide">
                Exempel på inlägg
              </p>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-left">
                  <strong className="text-blue-600">Anna:</strong>{" "}
                  <span className="text-gray-700">Hej alla! Jag älskar Linkly 😄</span>
                </div>
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-100 text-left">
                  <strong className="text-purple-600">Erik:</strong>{" "}
                  <span className="text-gray-700">Dela dina bilder och tankar här!</span>
                </div>
              </div>
            </div>

            <p className="text-gray-500 text-sm mt-6">
              Logga in via navbaren för att skapa egna inlägg och chatta med andra.
            </p>

            <button
              onClick={() => (window.location.href = "/sign-in")}
              className="mt-4 px-6 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-all"
            >
              Logga in
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}*/

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
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div className="min-h-screen py-10 px-4">
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
            className="text-center space-y-6 bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-lg text-gray-700 font-medium">
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
