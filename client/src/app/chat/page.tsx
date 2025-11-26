/*"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "@clerk/nextjs";

interface Message {
  chatId: string;
  senderId: string;
  text: string;
}

export default function ChatPage() {
  const { user, isLoaded } = useUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState("");

  useEffect(() => {
    if (!isLoaded || !user) return;

    const newSocket = io("http://localhost:4000"); // Socket.io-server
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Ansluten till servern:", newSocket.id);
    });

    // Lyssna på meddelanden från servern
    newSocket.on("receive_message", (message: Message) => {
      console.log("📩 Mottaget meddelande från servern:", message);
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, isLoaded]);

  const handleSend = () => {
    if (!socket || !user || textInput.trim() === "") return;

    const message: Message = {
      chatId: "general", // exempel-chat
      senderId: user.id,
      text: textInput.trim(),
    };

    socket.emit("send_message", message); // matcha serverns event
    setMessages((prev) => [...prev, message]); // visa direkt
    setTextInput("");
  };

  if (!isLoaded) return <p>Laddar användarinfo...</p>;
  if (!user) return <p>Du är inte inloggad.</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4">Chatt</h1>

      <div className="border p-2 mb-4 h-64 overflow-y-auto flex flex-col gap-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded ${
              msg.senderId === user.id ? "bg-blue-200 self-end" : "bg-gray-200 self-start"
            }`}
          >
            <strong>{msg.senderId === user.id ? "Du" : msg.senderId}:</strong> {msg.text}
          </div>
        ))}
      </div>

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
}*/



"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { Message } from "../../../../shared/types";

export default function ChatPage() {
  const { user, isLoaded } = useSupabaseUser();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scrolla automatiskt till senaste meddelandet
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isLoaded || !user) return;

    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Ansluten till servern:", newSocket.id);
    });

    newSocket.on("receive_message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, isLoaded]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!socket || !user || textInput.trim() === "") return;

    // Skicka meddelande i samma fält som Supabase-tabellen
    const messageToSend: Omit<Message, "id" | "created_at"> = {
      chat_id: "general",
      sender_id: user.id,
      text: textInput.trim(),
    };

    socket.emit("send_message", messageToSend);

    // Lägg till lokalt meddelande (id och created_at kan fyllas senare av servern)
    const localMessage: Message = {
      id: "",
      chat_id: "general",
      sender_id: user.id,
      text: textInput.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, localMessage]);
    setTextInput("");
  };

  if (!isLoaded) return <p>Laddar användarinfo...</p>;
  if (!user) return <p>Du är inte inloggad.</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4">Chatt</h1>

      <div className="border p-2 mb-4 h-64 overflow-y-auto flex flex-col gap-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded ${
              msg.sender_id === user.id ? "bg-blue-200 self-end" : "bg-gray-200 self-start"
            }`}
          >
            <strong>{msg.sender_id === user.id ? "Du" : msg.sender_id}:</strong> {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

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
