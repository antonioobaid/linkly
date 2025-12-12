"use client";
import { useEffect } from "react";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { supabase } from "@/lib/supabaseClient";

export default function OneSignalClient() {
  const { user, isLoaded } = useSupabaseUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    // ALLT måste ligga inuti push
    window.OneSignal = window.OneSignal || [];
    window.OneSignal.push(async () => {
      const isSubscribed = await window.OneSignal.isPushNotificationsEnabled();
      const playerId = await window.OneSignal.getUserId();

      if (playerId) {
        await supabase
          .from("users")
          .update({ onesignal_player_id: playerId })
          .eq("id", user.id);
      }

      window.OneSignal.on("subscriptionChange", async (isSubscribed: boolean) => {
        const newPlayerId = await window.OneSignal.getUserId();
        if (newPlayerId) {
          await supabase
            .from("users")
            .update({ onesignal_player_id: newPlayerId })
            .eq("id", user.id);
        }
      });
    });
  }, [isLoaded, user]);

  return null;
}
