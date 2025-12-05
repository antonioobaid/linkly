import { Router } from "express";
import { supabaseServer } from "../lib/supabaseServerClient";

const router = Router();

// 🔍 Sök users + posts
router.get("/", async (req, res) => {
  try {
    const query = (req.query.q as string) ?? "";

    if (query.trim() === "") {
      return res.status(200).json({ users: [], posts: [] });
    }

    // --- 🔹 SÖK USERS ---
    const { data: users, error: userError } = await supabaseServer
      .from("users")
      .select("id, username, full_name, avatar_url, bio")
      .ilike("username", `%${query}%`);

    if (userError) throw userError;

    // --- 🔹 SÖK POSTS (utan relation först) ---
    const { data: postsRaw, error: postError } = await supabaseServer
      .from("posts")
      .select("id, content, image_urls, created_at, user_id")
      .ilike("content", `%${query}%`)
      .order("created_at", { ascending: false });

    if (postError) throw postError;

    // --- 🔹 HÄMTA USER-INFO FÖR VARJE POST ---
    const postsWithUser = await Promise.all(
      postsRaw.map(async (p) => {
        const { data: user } = await supabaseServer
          .from("users")
          .select("id, username, avatar_url")
          .eq("id", p.user_id)
          .single();

        return {
          ...p,
          user,
        };
      })
    );

    return res.status(200).json({
      users,
      posts: postsWithUser,
    });
  } catch (err: any) {
    console.error("❌ Search API error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
