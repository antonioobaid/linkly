import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";

import { supabaseServer } from "./lib/supabaseServerClient";


import postsRouter from "./api/posts";
import uploadsRouter from "./uploads";
import commentsRouter from "./api/comments";
import likesRouter from "./api/likes";
import avatarUploadRouter from "./api/avatarUpload";
import searchRouter from "./api/search";


dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://linkly-snowy.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);


app.use(express.json());

app.use("/api/posts", postsRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/likes", likesRouter);
app.use("/api/avatarUpload", avatarUploadRouter);
app.use("/api/search", searchRouter);

app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

// Skapa HTTP-server

const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});


io.on("connection", (socket) => {
  console.log("📡 Ny användare ansluten:", socket.id);

  socket.on(
  "send_message",
  async (data: { sender_id: string; recipient_id: string; text: string }) => {
    if (!data.sender_id || !data.recipient_id) return;

    try {
      // 1️⃣ Kolla om chat redan finns mellan två användare
      const { data: existingChats, error: chatErr } = await supabaseServer
        .from("chats")
        .select("*")
        .or(
          `and(user1_id.eq.${data.sender_id},user2_id.eq.${data.recipient_id}),and(user1_id.eq.${data.recipient_id},user2_id.eq.${data.sender_id})`
        )
        .limit(1);

      if (chatErr) throw chatErr;

      let chatId: string;

      if (existingChats && existingChats.length > 0) {
        chatId = existingChats[0].id; // använd befintlig chat
      } else {
        // 2️⃣ Skapa ny chat
        const { data: newChat, error: newChatErr } = await supabaseServer
          .from("chats")
          .insert([{ user1_id: data.sender_id, user2_id: data.recipient_id }])
          .select()
          .single();

        if (newChatErr || !newChat) throw newChatErr || new Error("Kunde inte skapa chat");
        chatId = newChat.id;
      }

      // 3️⃣ Spara meddelandet
      const { data: savedMessage, error: msgError } = await supabaseServer
        .from("messages")
        .insert([{ chat_id: chatId, sender_id: data.sender_id, text: data.text }])
        .select()
        .single();

      if (msgError || !savedMessage) throw msgError || new Error("Kunde inte spara meddelande");

      // 4️⃣ Skicka meddelandet via Socket.IO
      socket.emit("receive_message", savedMessage); // till avsändaren
      socket.broadcast.emit("receive_message", savedMessage); // till mottagaren
    } catch (err) {
      console.error("❌ Fel vid sparande:", err);
    }
  }
);


  socket.on("disconnect", () => {
    console.log("❌ Användare kopplad från:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Servern körs på port ${PORT}`));

