"use client";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export function useSupabaseUser() {
  const [user, setUser] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setIsLoaded(true);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return { user, isLoaded };
}
