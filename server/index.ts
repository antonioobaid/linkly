import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

io.on("connection", (socket) => {
  console.log("Ny användare ansluten:", socket.id);

  socket.on("send_message", async (data: { chatId: string; senderId: string; text: string }) => {
    const { chatId, senderId, text } = data;
    await supabase.from("messages").insert([{ chat_id: chatId, sender_id: senderId, text }]);
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("Användare kopplad från:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Servern körs på port ${PORT}`));
