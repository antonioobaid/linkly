import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";

import postsRouter from "./api/posts";
import uploadsRouter from "./uploads";
import commentsRouter from "./api/comments";
import likesRouter from "./api/likes";
import avatarUploadRouter from "./api/avatarUpload";
import searchRouter from "./api/search";


import { supabaseServer } from "./lib/supabaseServerClient";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// Routes
app.use("/api/posts", postsRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/likes", likesRouter);
app.use("/api/avatarUpload", avatarUploadRouter)
app.use("/api/search", searchRouter);



const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("📡 Ny användare ansluten:", socket.id);

  socket.on("send_message", async (data: { chatId: string; senderId: string; text: string }) => {
    try {
      await supabaseServer.from("messages").insert([{
        chat_id: data.chatId,
        sender_id: data.senderId,
        text: data.text
      }]);
      socket.broadcast.emit("receive_message", data);
      socket.emit("receive_message", data);
    } catch (err) {
      console.error("Fel vid sparande av meddelande:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Användare kopplad från:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Servern körs på port ${PORT}`));
