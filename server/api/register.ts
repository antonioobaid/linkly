import { Router } from "express";
import { supabaseServer } from "../lib/supabaseServerClient";

const router = Router();

interface UserInsert {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  avatar_url?: string | null;
  bio?: string | null;
}

router.post("/", async (req, res) => {
  try {
    const { id, email, username, first_name, last_name } = req.body as UserInsert;

    if (!id || !email || !username || !first_name || !last_name) {
      return res.status(400).json({ error: "Fält saknas" });
    }

    const { data: insertedUser, error } = await supabaseServer
    .from("users")
    .insert([{
        id,
        email,
        username,
        first_name,
        last_name,
        avatar_url: null,
        bio: null,
    }])
    .select();

    if (error) throw error;

    return res.status(201).json({ success: true, user: insertedUser });

  } catch (err: any) {
    console.error("Fel vid registrering:", err);
    return res.status(500).json({ error: err.message || "Något gick fel" });
  }
});

export default router;
