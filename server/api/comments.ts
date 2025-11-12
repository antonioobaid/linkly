import { Router } from "express";
import { supabaseServer } from "../lib/supabaseServerClient";
const { v4: uuidv4 } = require('uuid');

const router = Router();

// GET: Hämta alla kommentarer för en specifik post
router.get("/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    const { data, error } = await supabaseServer
      .from("comments") // ✅ rätt tabellnamn
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Fel vid hämtning av kommentarer:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// POST: Skapa ny kommentar
router.post("/", async (req, res) => {
  const { post_id, user_id, text } = req.body;
  const id = uuidv4();

  try {
    const { data, error } = await supabaseServer
      .from("comments") // ✅ rätt tabellnamn
      .insert([{ id, post_id, user_id, text }])
      .select();

    if (error) throw error;

    console.log("Kommentar skapad:", data?.[0]);
    return res.status(201).json(data?.[0] || null);
  } catch (error: any) {
    console.error("Fel vid skapande av kommentar:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
