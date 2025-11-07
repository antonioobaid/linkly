"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
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
    // Connecta till Socket.io-server
    socket = io("http://localhost:4000"); // ändra till din server-URL i produktion

    socket.on("receive_message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    const messageData: Message = {
      chatId: "general", // enkel kanal, du kan ändra till dynamiskt chatId
      senderId: user.id,
      text: newMessage,
    };

    socket.emit("send_message", messageData);
    setNewMessage("");
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Linkly Chat</h1>
      <div className="border p-2 h-80 overflow-y-auto mb-4">
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
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2">
          Skicka
        </button>
      </div>
    </div>
  );
}
