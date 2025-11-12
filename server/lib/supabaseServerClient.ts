import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config(); // ✅ Säkerställ att .env läses

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY saknas. Kontrollera server/.env"
  );
}

export const supabaseServer = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
