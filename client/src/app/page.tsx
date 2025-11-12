"use client";

import { useUser } from "@clerk/nextjs";
import CreatePost from "./components/CreatePost";
import PostFeed from "./components/PostFeed";

export default function HomePage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <p>Laddar...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
        Välkommen till Linkly!
      </h1>

      {user ? (
        <>
          <CreatePost userId={user.id} />
          <PostFeed />
        </>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-lg text-gray-700">
            Utforska inlägg från andra användare och bli en del av vårt sociala nätverk!
          </p>

          <div className="border rounded-md p-4 bg-gray-50">
            <p className="text-gray-500 italic mb-2">Exempel på inlägg:</p>
            <div className="space-y-2">
              <div className="border p-2 rounded bg-white shadow-sm">
                <strong>Anna:</strong> Hej alla! Jag älskar Linkly 😄
              </div>
              <div className="border p-2 rounded bg-white shadow-sm">
                <strong>Erik:</strong> Dela dina bilder och tankar här!
              </div>
            </div>
          </div>

          <p className="text-gray-500 mt-4">
            Logga in via navbaren för att skapa egna inlägg och chatta med andra.
          </p>
        </div>
      )}
    </div>
  );
}
