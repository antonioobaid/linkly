import { Router } from "express";
import { supabaseServer } from "../lib/supabaseServerClient";
const { v4: uuidv4 } = require('uuid');
import { Post } from "../../shared/types"; // skapa shared/types.ts som vi pratade om

const router = Router();

// Typ för Supabase "join" resultat
interface PostWithUser {
  id: string;
  user_id: string;
  content: string;
  image_urls?: string[]; 
  created_at: string;
  user?: {
    username?: string;
    full_name?: string;
    avatar_url?: string | null;
  };
}

// GET all posts with user info

// GET all posts (optionally filtered by userId)
router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId as string | undefined;

    let query = supabaseServer
      .from("posts")
      .select(`
        *,
        user:users!user_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const postsData = (data ?? []) as PostWithUser[];

    const formattedPosts: Post[] = postsData.map((post) => ({
      id: post.id,
      content: post.content,
      image_urls: post.image_urls ?? [],
      created_at: post.created_at,
      user_id: post.user_id,
      username: post.user?.username,
      full_name: post.user?.full_name,
      avatar_url: post.user?.avatar_url ?? null,
    }));

    return res.status(200).json(formattedPosts);
  } catch (err: any) {
    console.error("Fel vid hämtning av posts:", err);
    return res.status(500).json({ error: err.message });
  }
});

// POST create new post
router.post("/", async (req, res) => {
  try {
    const { content, image_urls, user_id } = req.body; // ✅ image_urls array

    if (!content || !user_id) {
      return res.status(400).json({ error: "Content och user_id krävs" });
    }

    const id = uuidv4();

    const { data, error } = await supabaseServer
      .from("posts")
      .insert([{ id, content, image_urls, user_id }]) // ✅ insert array
      .select();

    if (error || !data) throw error;

    const postRow = data[0];

    const { data: userData, error: userError } = await supabaseServer
      .from("users")
      .select("username, full_name, avatar_url")
      .eq("id", user_id)
      .single();

    if (userError) throw userError;

    const newPost: Post = {
      id: postRow.id,
      content: postRow.content,
      image_urls: postRow.image_urls ?? [],
      created_at: postRow.created_at,
      user_id,
      username: userData.username,
      full_name: userData.full_name,
      avatar_url: userData.avatar_url ?? null,
    };

    return res.status(201).json(newPost);
  } catch (err: any) {
    console.error("Fel vid skapande av post:", err);
    return res.status(500).json({ error: err.message });
  }
});

// GET post by ID
router.get("/:id", async (req, res) => {
  try {
    const postId = req.params.id;

    const { data, error } = await supabaseServer
      .from("posts")
      .select(`
        *,
        user:users!user_id (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq("id", postId)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Post not found" });

    const post: Post = {
      id: data.id,
      content: data.content,
      image_urls: data.image_urls ?? [],
      created_at: data.created_at,
      user_id: data.user_id,
      username: data.user?.username,
      full_name: data.user?.full_name,
      avatar_url: data.user?.avatar_url ?? null,
    };

    return res.status(200).json(post);
  } catch (err: any) {
    console.error("Fel vid hämtning av post:", err);
    return res.status(500).json({ error: err.message });
  }
});


// DELETE post by ID
router.delete("/:id", async (req, res) => {
  try {
    const postId = req.params.id;

    const { error } = await supabaseServer
      .from("posts")
      .delete()
      .eq("id", postId); // ✅ ändrat från id till post_id

    if (error) throw error;

    return res.status(200).json({ message: "Post raderad" });
  } catch (err: any) {
    console.error("Fel vid radering av post:", err);
    return res.status(500).json({ error: err.message });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const { content, image_urls } = req.body;

    if (!content && (!image_urls || image_urls.length === 0)) 
      return res.status(400).json({ error: "Innehåll eller bilder krävs" });

    const { data, error } = await supabaseServer
      .from("posts")
      .update({ content, image_urls })
      .eq("id", postId)
      .select()
      .single();

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err: any) {
    console.error("Fel vid uppdatering av post:", err);
    return res.status(500).json({ error: err.message });
  }
});




export default router;
