import { Router } from "express";
import { supabaseServer } from "../lib/supabaseServerClient";

const router = Router();

// GET profile by ID
router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const { data, error } = await supabaseServer
      .from("users")
      .select("id, username, full_name, avatar_url, bio")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(404).json({ error: "Kunde inte hämta profil" });
    }

    if (!data) return res.status(404).json({ error: "Profil hittades inte" });

    return res.status(200).json(data);
  } catch (err: any) {
    console.error("Fel vid hämtning av profil:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
