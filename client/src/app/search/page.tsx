"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { User} from "../../../../shared/types";

export interface SearchResult {
  users: User[];
}

export default function SearchPage() {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResult>({ users: [] });
  const [loading, setLoading] = useState<boolean>(false);
  

  useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [] });
      return;
    }
    const delay = setTimeout(() => handleSearch(), 400);
    return () => clearTimeout(delay);
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(`http://localhost:4000/api/search?q=${query}`);
      const data: SearchResult = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-4 pt-6">
      <h1 className="text-2xl font-bold mb-4">🔍 Sök</h1>

      {/* Search bar */}
      <div className="flex gap-2 mb-6 bg-white rounded-xl shadow px-3 py-2 border">
        <Search className="w-5 h-5 text-gray-500 mt-1" />
        <input
          className="flex-1 outline-none bg-transparent"
          placeholder="Sök användare..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
      )}

      {/* USERS */}
      {results.users.length > 0 && !loading && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Användare</h2>
          <div className="space-y-3">
            {results.users.map((u: User) => (
              <Link
                key={u.id}
                href={`/profile/${u.id}`}
                className="flex items-center gap-3 p-3 bg-white rounded-xl shadow hover:bg-gray-50 transition"
              >
                {/* Avatar */}
                <div className="relative w-14 h-14">
                  <Image
                    src={u.avatar_url ?? "/default-avatar.png"}
                    alt="avatar"
                    fill
                    className="rounded-full object-cover border"
                  />
                </div>

                {/* Username + full name */}
                <div>
                  <p className="font-bold text-gray-800">{u.username}</p>
                  <p className="text-sm text-gray-500">{u.full_name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
