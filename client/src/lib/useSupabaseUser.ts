"use client";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import type { User } from "../../../shared/types"; // Din fulla User-typ

export function useSupabaseUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      // Hämta Auth User
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user?.id) {
        setIsLoaded(true);
        return;
      }

      // Hämta full user från users-tabellen
      const { data, error } = await supabase
        .from("users")         // tabellnamnet som string
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (error) console.error(error);

      // Cast till din User-typ
      setUser(data as User | null);
      setIsLoaded(true);
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.id) fetchUser();
      else setUser(null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return { user, isLoaded };
}
