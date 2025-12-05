import { Router } from 'express';
import multer from 'multer';
import { supabaseServer } from './lib/supabaseServerClient';

const router = Router();
const upload = multer(); // Memory storage

// ✅ Byt från .single('file') till .array('files')
router.post('/', upload.array('files'), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "Inga filer skickade" });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileName = `${Date.now()}_${file.originalname}`;
      const { error } = await supabaseServer
        .storage.from('post-images')
        .upload(fileName, file.buffer, { contentType: file.mimetype });

      if (error) return res.status(500).json({ error: error.message });

      const { data: publicData } = supabaseServer
        .storage.from('post-images')
        .getPublicUrl(fileName);

      uploadedUrls.push(publicData.publicUrl);
    }

    return res.status(200).json({ urls: uploadedUrls });
  } catch (err) {
    console.error("Fel vid filuppladdning:", err);
    return res.status(500).json({ error: "Serverfel" });
  }
});

export default router;
