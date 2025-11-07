// lib/supabaseServerClient.ts
import { createClient } from "@supabase/supabase-js";

// Skapar en Supabase-klient med service role key
export const supabaseServer = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

// Kontroll för att säkerställa att nycklarna finns
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY saknas. Kontrollera server/.env");
}

