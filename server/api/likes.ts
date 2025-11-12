import { Router } from "express";
import { supabaseServer } from "../lib/supabaseServerClient";
const { v4: uuidv4 } = require('uuid');

const router = Router();

/**
 * 🔹 GET /api/likes/:postId
 * Hämtar alla likes för en specifik post
 */
router.get("/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    const { data, error } = await supabaseServer
      .from("likes")
      .select("*")
      .eq("post_id", postId);

    if (error) throw error;

    return res.status(200).json({
      count: data.length,
      users: data.map((like) => like.user_id),
    });
  } catch (error: any) {
    console.error("Fel vid hämtning av likes:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 🔹 POST /api/likes
 * Gillar eller tar bort en like på en post
 */
router.post("/", async (req, res) => {
  const { post_id, user_id } = req.body;

  try {
    // Kontrollera om användaren redan gillat
    const { data: existingLike } = await supabaseServer
      .from("likes")
      .select("*")
      .eq("post_id", post_id)
      .eq("user_id", user_id)
      .maybeSingle();

    if (existingLike) {
      // ❌ Ta bort like om den redan finns (toggle)
      await supabaseServer
        .from("likes")
        .delete()
        .eq("post_id", post_id)
        .eq("user_id", user_id);

      return res.status(200).json({ liked: false });
    }

    // ✅ Annars skapa ny like
    const id = uuidv4();
    const { data, error } = await supabaseServer
      .from("likes")
      .insert([{ id, post_id, user_id }])
      .select();

    if (error) throw error;

    return res.status(201).json({ liked: true });
  } catch (error: any) {
    console.error("Fel vid gilla:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
