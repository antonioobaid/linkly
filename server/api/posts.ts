import { Router } from 'express';
import { supabaseServer } from '../lib/supabaseServerClient';
const { v4: uuidv4 } = require('uuid'); // CommonJS-import för uuid v8

const router = Router();

// GET all posts
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseServer
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err: any) {
    console.error("Fel vid hämtning av posts:", err);
    return res.status(500).json({ error: err.message });
  }
});

// POST create new post
router.post('/', async (req, res) => {
  try {
    const { content, image_url, user_id } = req.body;
    const id = uuidv4();

    const { data, error } = await supabaseServer
      .from('posts')
      .insert([{ id, content, image_url, user_id }]);

    if (error) throw error;
    return res.status(201).json(data?.[0] || null);
  } catch (err: any) {
    console.error("Fel vid skapande av post:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
