"use client";

import { useEffect, useState } from "react";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { supabase } from "@/lib/supabaseClient";
import { Chat, User, Message } from "../../../../shared/types";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";

export default function InboxPage() {
  const { user, isLoaded } = useSupabaseUser();
  const [chats, setChats] = useState<Chat[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, User>>({});
  const [lastMessages, setLastMessages] = useState<Record<string, Message>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const router = useRouter();

  // 🟢 Hämta chattar och användare
  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchChats = async () => {
      const { data: chatsData, error } = await supabase
        .from("chats")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) return console.error(error);
      setChats(chatsData || []);

      const otherIds = (chatsData || [])
        .map((chat) => (chat.user1_id === user.id ? chat.user2_id : chat.user1_id))
        .filter(Boolean);

      // Hämta användare
      if (otherIds.length > 0) {
        const { data: usersData } = await supabase
          .from("users")
          .select("*")
          .in("id", otherIds);
        if (usersData) {
          const map: Record<string, User> = {};
          usersData.forEach((u) => (map[u.id] = u));
          setUsersMap(map);
        }
      }

      // Hämta senaste meddelanden per chat
      if (chatsData && chatsData.length > 0) {
        const promises = chatsData.map(async (chat) => {
          const { data: msgs } = await supabase
            .from("messages")
            .select("*")
            .eq("chat_id", chat.id)
            .order("created_at", { ascending: false })
            .limit(1);
          return { chatId: chat.id, message: msgs?.[0] };
        });

        const results = await Promise.all(promises);
        const messagesMap: Record<string, Message> = {};
        results.forEach((r) => {
          if (r.message) messagesMap[r.chatId] = r.message;
        });
        setLastMessages(messagesMap);
      }
    };

    fetchChats();
  }, [user, isLoaded]);

  // 🟢 Sök användare (username eller full_name)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
        .neq("id", user?.id);

      if (error) console.error(error);
      else setSearchResults(data || []);
    };

    fetchUsers();
  }, [searchTerm, user]);

  // 🟢 Starta chat
  const startChat = async (otherUserId: string) => {
    if (!user) return;

    try {
      const { data: existingChats } = await supabase
        .from("chats")
        .select("*")
        .or(
          `and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`
        )
        .limit(1);

      let chatId: string;

      if (existingChats && existingChats.length > 0) chatId = existingChats[0].id;
      else {
        const { data: newChat, error } = await supabase
          .from("chats")
          .insert([{ user1_id: user.id, user2_id: otherUserId }])
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

  // 🟢 Hjälpfunktion: formatera tid
  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff}s sedan`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m sedan`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h sedan`;
    return `${Math.floor(diff / 86400)}d sedan`;
  };

  if (!isLoaded) return <p>Laddar chattar...</p>;
  if (!user) return <p>Du är inte inloggad.</p>;

  return (
    <div className="max-w-md mx-auto mt-6 p-4">
      <h1 className="text-2xl font-bold mb-4">Mina Chattar</h1>

      {/* Sök användare */}
      <div className="mb-6 relative">
        <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400">
          <FiSearch className="text-gray-400 mr-2" size={20} />
          <input
            type="text"
            placeholder="Sök användare..."
            className="w-full focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
            {searchResults.map((u) => (
              <div
                key={u.id}
                className="p-3 cursor-pointer hover:bg-gray-100 flex items-center gap-3"
                onClick={() => startChat(u.id)}
              >
                <img
                  src={u.avatar_url || "/default-avatar.png"}
                  alt={u.full_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <span className="font-semibold">{u.full_name}</span>
                  <span className="text-gray-500 text-sm">@{u.username}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chattar */}
      <div className="flex flex-col gap-3">
        {chats.length > 0 ? (
          chats.map((chat) => {
            const otherUserId = chat.user1_id === user.id ? chat.user2_id : chat.user1_id;
            const otherUser = usersMap[otherUserId];
            const lastMessage = lastMessages[chat.id];

            let lastMessageText = "";
            if (lastMessage) {
              lastMessageText =
                lastMessage.sender_id === user.id
                  ? `Du: ${lastMessage.text}`
                  : lastMessage.text;
            }

            return (
              <div
                key={chat.id}
                className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-100 transition"
                onClick={() => router.push(`/inbox/${chat.id}`)}
              >
                <img
                  src={otherUser?.avatar_url || "/default-avatar.png"}
                  alt={otherUser?.full_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex flex-col w-full">
                  <div className="flex justify-between">
                    <span className="font-semibold">{otherUser?.full_name}</span>
                    {lastMessage && (
                      <span className="text-gray-400 text-sm">
                        {timeAgo(lastMessage.created_at)}
                      </span>
                    )}
                  </div>
                  {lastMessage && (
                    <span className="text-gray-500 text-sm truncate">
                      {lastMessageText}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p>Ingen chat ännu</p>
        )}
      </div>
    </div>
  );
}
