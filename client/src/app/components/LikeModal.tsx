"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { API_URL } from "@/lib/api";

interface LikeUser {
  id: string;
  username: string;
  avatar_url?: string | null;
  full_name?: string;
}

export default function LikeModal({
  postId,
  onClose,
}: {
  postId: string;
  onClose: () => void;
}) {
  const [users, setUsers] = useState<LikeUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchLikes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/likes/${postId}`);
      const data = await res.json();

      setUsers(data.users || []); // <-- users-array med username, avatar, full_name
    } catch (err) {
      console.error("LikeModal fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchLikes();
}, [postId]);


  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-2"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl w-full max-w-md md:max-w-lg lg:max-w-xl max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="flex items-center justify-center p-4 border-b border-gray-200">
          <h2 className="font-semibold">Gilla-markeringar</h2>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-black"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-6 text-center">Laddar...</div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Inga likes ännu
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {users.map((u) => (
              <Link
                key={u.id}
                href={`/profile/${u.id}`}
                className="flex items-center gap-3 p-4 hover:bg-gray-50"
              >
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 bg-gray-100">
                  <Image
                    src={u.avatar_url || "/default-avatar.png"}
                    alt={`Profilbild för ${u.username}`}
                    width={44}
                    height={44}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* User info */}
                <div>
                  <div className="font-medium">{u.username}</div>
                  {u.full_name && (
                    <div className="text-sm text-gray-500">
                      {u.full_name}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
