import { Router } from "express";
import { supabaseServer } from "../lib/supabaseServerClient";
const { v4: uuidv4 } = require("uuid");

const router = Router();

/* -------------------------------------------------------
   GET: Hämta kommentarer med username (JOIN)
------------------------------------------------------- */
router.get("/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    const { data, error } = await supabaseServer
      .from("comments")
      .select(
        `
        id,
        post_id,
        user_id,
        content,
        created_at,
        users:user_id (
          username
        )
        `
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Forma om resultatet: lägg username direkt på root-objektet
    const formatted = data.map((c: any) => ({
      id: c.id,
      post_id: c.post_id,
      user_id: c.user_id,
      content: c.content,
      created_at: c.created_at,
      username: c.users?.username || null,
    }));



    return res.status(200).json(formatted);
  } catch (error: any) {
    console.error("Fel vid hämtning av kommentarer:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

/* -------------------------------------------------------
   POST: Skapa kommentar + returnera username direkt
------------------------------------------------------- */
router.post("/", async (req, res) => {
  const { post_id, user_id, content } = req.body;
  const id = uuidv4();

  try {
    // Steg 1 — skapa kommentaren
    const { data: commentData, error } = await supabaseServer
      .from("comments")
      .insert([{ id, post_id, user_id, content }])
      .select();

    if (error) throw error;

    const createdComment = commentData[0];

    // Steg 2 — hämta username
    const { data: userData, error: userErr } = await supabaseServer
      .from("users")
      .select("username")
      .eq("id", user_id)
      .single();

    if (userErr) throw userErr;

    return res.status(201).json({
      ...createdComment,
      username: userData?.username || null,
    });
  } catch (error: any) {
    console.error("Fel vid skapande av kommentar:", error.message);
    return res.status(500).json({ error: error.message });
  }
});


// DELETE: Ta bort kommentar
router.delete("/:commentId", async (req, res) => {
  const { commentId } = req.params;

  try {
    const { error } = await supabaseServer
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) throw error;

    return res.status(200).json({ message: "Kommentar borttagen" });
  } catch (error: any) {
    console.error("Fel vid radering av kommentar:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// PUT: Uppdatera kommentar
router.put("/:commentId", async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  try {
    const { data, error } = await supabaseServer
      .from("comments")
      .update({ content })
      .eq("id", commentId)
      .select();

    if (error) throw error;

    return res.status(200).json(data[0]);
  } catch (error: any) {
    console.error("Fel vid uppdatering av kommentar:", error.message);
    return res.status(500).json({ error: error.message });
  }
});



export default router;
