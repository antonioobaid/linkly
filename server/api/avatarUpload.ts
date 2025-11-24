// server/routes/uploadAvatar.ts
import { Router } from "express";
import multer from "multer";
import { supabaseServer } from "../lib/supabaseServerClient";

const router = Router();
const upload = multer(); // Memory storage = rätt

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const userId = req.body.userId;

    if (!file) return res.status(400).json({ error: "Ingen fil skickad" });
    if (!userId) return res.status(400).json({ error: "userId saknas" });

    const fileExt = file.originalname.split(".").pop();
    const fileName = `avatar_${userId}.${fileExt}`;

    console.log("📡 Backend upload path:", fileName);

    const { error: uploadError } = await supabaseServer.storage
      .from("avatars")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      console.error("❌ Upload error:", uploadError);
      return res.status(500).json({ error: uploadError.message });
    }

    const { data: urlData } = supabaseServer
      .storage
      .from("avatars")
      .getPublicUrl(fileName);

    console.log("🔗 Avatar public URL:", urlData.publicUrl);

    return res.json({ url: urlData.publicUrl });
  } catch (err) {
    console.error("❌ Serverfel:", err);
    res.status(500).json({ error: "Serverfel" });
  }
});

export default router;
