import { Router } from "express";
import { supabaseServer } from "../lib/supabaseServerClient";
const { v4: uuidv4 } = require('uuid');

const router = Router();

// Typ för chat
interface Chat {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at?: string;
}

// Skapa eller hämta chat
router.post("/", async (req, res) => {
  try {
    const { user1_id, user2_id } = req.body;

    if (!user1_id || !user2_id) {
      return res.status(400).json({ error: "user1_id och user2_id krävs" });
    }

    // Kolla om chat redan finns
    const { data: existingChats, error: existingError } = await supabaseServer
      .from("chats")
      .select("*")
      .or(
        `and(user1_id.eq.${user1_id},user2_id.eq.${user2_id}),and(user1_id.eq.${user2_id},user2_id.eq.${user1_id})`
      )
      .limit(1);

    if (existingError) throw existingError;

    if (existingChats && existingChats.length > 0) {
      return res.status(200).json(existingChats[0]);
    }

    // Skapa ny chat
    const { data: newChat, error: newError } = await supabaseServer
      .from("chats")
      .insert([{ id: uuidv4(), user1_id, user2_id }])
      .select()
      .single();

    if (newError) throw newError;

    return res.status(201).json(newChat as Chat);
  } catch (err: any) {
    console.error("Fel vid chat:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
