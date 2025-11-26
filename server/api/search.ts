import { Router } from "express";
import { supabaseServer } from "../lib/supabaseServerClient";


const router = Router();


// 🔍 Sök users & posts
router.get("/", async (req, res) => {
try {
const query = (req.query.q as string) ?? "";


if (query.trim() === "") {
return res.status(200).json({ users: [], posts: [] });
}


// --- SÖK ANVÄNDARE ---
const { data: users, error: userError } = await supabaseServer
.from("users")
.select("id, username, full_name, avatar_url, bio")
.ilike("username", `%${query}%`);


if (userError) throw userError;


// --- SÖK POSTS ---
const { data: posts, error: postError } = await supabaseServer
.from("posts")
.select(`
id,
content,
image_url,
created_at,
user:users!user_id (id, username, avatar_url)
`)
.ilike("content", `%${query}%`);


if (postError) throw postError;


return res.status(200).json({ users, posts });


} catch (err: any) {
console.error("❌ Search API error:", err);
return res.status(500).json({ error: err.message });
}
});


export default router;