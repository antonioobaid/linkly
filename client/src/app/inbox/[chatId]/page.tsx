"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { supabase } from "@/lib/supabaseClient";
import { Message, User } from "../../../../../shared/types";
import { useParams } from "next/navigation";

export default function ChatWindow() {
  const params = useParams();
  let chatId = params.chatId;

  if (!chatId) return <p>Ingen chat vald</p>;
  if (Array.isArray(chatId)) chatId = chatId[0]; // Säkerställ att det är string
  const safeChatId: string = chatId;

  const { user, isLoaded } = useSupabaseUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [recipient, setRecipient] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // 1️⃣ Hämta mottagarens info
  useEffect(() => {
    if (!user) return;

    const fetchRecipient = async () => {
      const { data: chat } = await supabase
        .from("chats")
        .select("user1_id, user2_id")
        .eq("id", safeChatId)
        .single();

      if (!chat) return;

      const otherId = chat.user1_id === user.id ? chat.user2_id : chat.user1_id;

      const { data: otherUser } = await supabase
        .from("users")
        .select("*")
        .eq("id", otherId)
        .single();

      setRecipient(otherUser || null);
    };

    fetchRecipient();
  }, [safeChatId, user]);

  // 2️⃣ Hämta tidigare meddelanden
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", safeChatId)
        .order("created_at", { ascending: true });

      setMessages(data || []);
    };

    if (safeChatId) fetchMessages();
  }, [safeChatId]);

  // 3️⃣ Socket.io setup
  useEffect(() => {
    if (!isLoaded || !user) return;

    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);

    newSocket.on("connect", () =>
      console.log("🔌 Ansluten till servern:", newSocket.id)
    );

    newSocket.on("receive_message", (msg: Message) => {
      if (msg.chat_id === safeChatId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, isLoaded, safeChatId]);

  useEffect(() => scrollToBottom(), [messages]);

  const handleSend = () => {
    if (!socket || !user || !recipient || textInput.trim() === "") return;

    const messageToSend = {
      chat_id: safeChatId,
      sender_id: user.id,
      recipient_id: recipient.id,
      text: textInput.trim(),
    };

    socket.emit("send_message", messageToSend);

    const localMessage: Message = {
      id: "",
      chat_id: safeChatId,
      sender_id: user.id,
      text: textInput.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, localMessage]);
    setTextInput("");
  };

  if (!isLoaded) return <p>Laddar chat...</p>;
  if (!user) return <p>Du är inte inloggad.</p>;
  if (!recipient) return <p>Laddar mottagare...</p>;

  return (
    <div className="border p-2 rounded max-w-md mx-auto mt-6">
      {/* Mottagare info */}
      <div className="flex items-center gap-2 mb-3 p-2 border-b">
        <img
          src={recipient.avatar_url || "/default-avatar.png"}
          alt={recipient.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        <h1 className="text-lg font-bold">{recipient.username}</h1>
      </div>

      {/* Meddelanden */}
      <div className="h-64 overflow-y-auto flex flex-col gap-2 mb-2 border p-2 rounded">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded ${
              msg.sender_id === user.id
                ? "bg-blue-200 self-end"
                : "bg-gray-200 self-start"
            }`}
          >
            <strong>{msg.sender_id === user.id ? "Du" : recipient.username}:</strong>{" "}
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Skicka meddelande */}
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border px-2 py-1 rounded"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Skicka
        </button>
      </div>
    </div>
  );
}
