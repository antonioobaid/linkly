import { Router } from 'express';
import multer from 'multer';
import { supabaseServer } from './lib/supabaseServerClient';

const router = Router();
const upload = multer(); // Memory storage

const sanitizeFileName = (name: string) =>
  name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');

router.post('/', upload.array('files'), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "Inga filer skickade" });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileName = `${Date.now()}_${sanitizeFileName(file.originalname)}`;

      const { error: uploadError } = await supabaseServer
        .storage
        .from('post-images')
        .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: false });

      if (uploadError) {
        console.error("Fel vid uppladdning:", uploadError);
        return res.status(500).json({ error: uploadError.message });
      }

      const { data } = supabaseServer
        .storage
        .from('post-images')
        .getPublicUrl(fileName);

      uploadedUrls.push(data.publicUrl);
    }

    return res.status(200).json({ urls: uploadedUrls });
  } catch (err) {
    console.error("Fel vid filuppladdning:", err);
    return res.status(500).json({ error: "Serverfel" });
  }
});

export default router;

