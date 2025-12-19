import { Router } from "express";
import { supabaseServer } from "../lib/supabaseServerClient";

const router = Router();

// GET user by ID
router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) return res.status(400).json({ error: "User ID krävs" });

    const { data, error } = await supabaseServer
      .from("users")
      .select("id, username, full_name, avatar_url")
      .eq("id", userId)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Användare hittades inte" });

    res.status(200).json(data);
  } catch (err: any) {
    console.error("Fel vid hämtning av användare:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
