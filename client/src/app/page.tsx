"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "@clerk/nextjs";

type Message = {
  chatId: string;
  senderId: string;
  text: string;
};

let socket: Socket;

export default function ChatPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    console.log("🔄 Försöker ansluta till Socket.io-server...");

    socket = io("http://localhost:4000");

    socket.on("connect", () => {
      console.log("✅ Ansluten till servern:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket.io-anslutningsfel:", err.message);
    });

    socket.on("receive_message", (message: Message) => {
      console.log("📩 Mottaget meddelande från servern:", message);
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      console.log("🔌 Kopplar från Socket.io...");
      socket.disconnect();
    };
  }, []);

  const sendMessage = async () => {
    console.log("🚀 Försöker skicka meddelande...");

    if (!user) {
      console.warn("⚠️ Ingen användare inloggad!");
    }

    if (!newMessage.trim()) {
      console.warn("⚠️ Inget meddelande skrivet!");
      return;
    }

    console.log("📡 Socket connected?", socket?.connected);
    console.log("👤 User ID:", user?.id);
    console.log("💬 Text:", newMessage);

    const messageData: Message = {
      chatId: "general",
      senderId: user?.id || "testuser",
      text: newMessage,
    };

    try {
      console.log("➡️ Skickar till servern:", messageData);
      socket.emit("send_message", messageData);
      setNewMessage("");
    } catch (err) {
      console.error("❌ Fel vid sändning:", err);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Linkly Chat</h1>

      <div className="border p-2 h-80 overflow-y-auto mb-4">
        {messages.length === 0 && (
          <p className="text-gray-500 text-sm">Inga meddelanden ännu...</p>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-2">
            <strong>{msg.senderId.substring(0, 6)}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="border p-2 flex-1"
          placeholder="Skriv ett meddelande..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Skicka
        </button>
      </div>
    </div>
  );
}
