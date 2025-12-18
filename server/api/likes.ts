import { Router } from "express";
import { supabaseServer } from "../lib/supabaseServerClient";
const { v4: uuidv4 } = require("uuid");

const router = Router();

/**
 * GET /api/likes/:postId
 * Returnerar likes + user-info
 */
router.get("/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    // 1️⃣ Hämta likes
    const { data: likes, error: likesError } = await supabaseServer
      .from("likes")
      .select("user_id")
      .eq("post_id", postId);

    if (likesError) throw likesError;

    console.log("LIKES RAW:", likes);

    if (!likes || likes.length === 0) {
      return res.status(200).json({ count: 0, users: [] });
    }

    const userIds = likes.map((l) => l.user_id);

    // 2️⃣ Hämta users
    const { data: users, error: usersError } = await supabaseServer
      .from("users")
      .select("id, username, first_name, last_name, avatar_url")
      .in("id", userIds);

    if (usersError) throw usersError;

    console.log("USERS FROM LIKES:", users);

    const formattedUsers = users.map((u) => ({
      id: u.id,
      username: u.username,
      avatar_url: u.avatar_url,
      full_name: `${u.first_name} ${u.last_name}`,
    }));

    return res.status(200).json({
      count: formattedUsers.length,
      userIds: formattedUsers.map(u => u.id),
      users: formattedUsers,

    });
  } catch (error: any) {
    console.error("Fel vid hämtning av likes:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/likes (toggle)
 */
router.post("/", async (req, res) => {
  const { post_id, user_id } = req.body;

  try {
    const { data: existingLike } = await supabaseServer
      .from("likes")
      .select("*")
      .eq("post_id", post_id)
      .eq("user_id", user_id)
      .maybeSingle();

    if (existingLike) {
      await supabaseServer
        .from("likes")
        .delete()
        .eq("post_id", post_id)
        .eq("user_id", user_id);

      return res.status(200).json({ liked: false });
    }

    const id = uuidv4();
    await supabaseServer
      .from("likes")
      .insert([{ id, post_id, user_id }]);

    return res.status(201).json({ liked: true });
  } catch (error: any) {
    console.error("Fel vid gilla:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
