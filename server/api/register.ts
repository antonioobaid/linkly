import express from "express";
import { supabaseServer } from "../lib/supabaseServerClient";
import { UserInsert } from "../../shared/types";


const router = express.Router();

router.post("/", async (req, res) => {
  const { id, email, username, first_name, last_name } = req.body as UserInsert;

  if (!id || !email || !username || !first_name || !last_name) {
    return res.status(400).json({ error: "Fält saknas" });
  }

  try {
    const { error } = await supabaseServer
      .from("users")
      .insert<UserInsert>([{ id, email, username, first_name, last_name, avatar_url: null, bio: null }]);

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Något gick fel" });
  }
});

export default router;
