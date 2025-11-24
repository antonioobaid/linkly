"use client";
import Link from "next/link";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const { user, isLoaded } = useSupabaseUser();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Optional: redirect to home page after logout
    window.location.href = "/";
  };

  if (!isLoaded) {
    return (
      <nav className="flex justify-between items-center px-6 py-4 border-b bg-white">
        <div className="text-2xl font-bold text-blue-600">Linkly</div>
        <div>Loading...</div>
      </nav>
    );
  }

  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b bg-white">
      <Link href="/" className="text-2xl font-bold text-blue-600">Linkly</Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link href="/chat" className="text-gray-700 hover:text-blue-600">Chat</Link>
            <Link href={`/profile`} className="text-gray-700 hover:text-blue-600">Profil</Link>
            <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Logga ut</button>
          </>
        ) : (
          <>
            <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Logga in</Link>
            <Link href="/register" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Registrera</Link>
          </>
        )}
      </div>
    </nav>
  );
}
