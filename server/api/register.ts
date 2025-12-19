/*import express from "express";
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

export default router;*/

import express from "express";
import { supabaseServer } from "../lib/supabaseServerClient";

const router = express.Router();

interface UserInsert {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  bio?: string | null;
}

router.post("/", async (req, res) => {
  const { id, email, username, first_name, last_name } = req.body as UserInsert;

  if (!id || !email || !username || !first_name || !last_name) {
    return res.status(400).json({ error: "Fält saknas" });
  }

  try {
    // Insert i users-tabellen via Service Role Key (ignorerar RLS)
    const { data: insertedUser, error } = await supabaseServer
      .from("users")
      .insert([{ id, email, username, first_name, last_name, avatar_url: null, bio: null }])
      .select(); // select() för att få JSON tillbaka

    if (error) throw error;

    // Skicka ett meddelande om verifiering krävs
    return res.status(200).json({
      success: true,
      message: "Kontot är skapat! Bekräfta din email innan du loggar in.",
      user: insertedUser,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Något gick fel" });
  }
});

export default router;
