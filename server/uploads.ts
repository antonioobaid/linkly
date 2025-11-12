import { Router } from 'express';
import multer from 'multer';
import { supabaseServer } from './lib/supabaseServerClient';

const router = Router();
const upload = multer(); // Memory storage

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "Ingen fil skickad" });

    const fileName = `${Date.now()}_${file.originalname}`;
    const { error } = await supabaseServer
      .storage.from('post-images')
      .upload(fileName, file.buffer, { contentType: file.mimetype });

    if (error) return res.status(500).json({ error: error.message });

    const { data: publicData } = supabaseServer
      .storage.from('post-images')
      .getPublicUrl(fileName);

    return res.status(200).json({ url: publicData.publicUrl });
  } catch (err) {
    console.error("Fel vid filuppladdning:", err);
    return res.status(500).json({ error: "Serverfel" });
  }
});

export default router;
