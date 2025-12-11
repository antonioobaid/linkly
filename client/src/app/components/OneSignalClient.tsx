/*"use client";

import { useEffect } from "react";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { supabase } from "@/lib/supabaseClient";

export default function OneSignalClient() {
  const { user, isLoaded } = useSupabaseUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    if (!window.OneSignal) {
      console.warn("OneSignal SDK är inte laddad än.");
      return;
    }

    // Lägg allt i push för att säkerställa att SDK:n är redo
    window.OneSignal.push(async () => {
      try {
        // Initiera OneSignal (om det redan initierats, ignoreras det)
        await window.OneSignal.init({
          appId: "2dcf0f6a-552a-4a3c-af6e-eea3a5319bf3", // Ditt OneSignal App ID
          allowLocalhostAsSecureOrigin: true,
          notifyButton: { enable: true },
        });

        // Kolla prenumeration direkt
        const isSubscribed = await window.OneSignal.isPushNotificationsEnabled();
        if (isSubscribed) {
          const playerId = await window.OneSignal.getUserId();
          if (playerId && user?.id) {
            await supabase
              .from("users")
              .update({ onesignal_player_id: playerId })
              .eq("id", user.id);
          }
        }

        // Lyssna på prenumerationsändringar
        window.OneSignal.on("subscriptionChange", async (isSubscribed: boolean) => {
          if (isSubscribed) {
            const playerId = await window.OneSignal.getUserId();
            if (playerId && user?.id) {
              await supabase
                .from("users")
                .update({ onesignal_player_id: playerId })
                .eq("id", user.id);
            }
          }
        });
      } catch (error) {
        console.error("OneSignal init/funktion misslyckades:", error);
      }
    });
  }, [isLoaded, user]);

  return null; // Ingen UI, bara logik
}*/



"use client";

import { useEffect } from "react";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { supabase } from "@/lib/supabaseClient";

export default function OneSignalClient() {
  const { user, isLoaded } = useSupabaseUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    if (!window.OneSignal) {
      console.warn("OneSignal SDK är inte laddad ännu.");
      return;
    }

    // Allt måste ligga i push för att SDK:n ska vara redo
    window.OneSignal.push(async () => {
      try {
        // Kolla prenumeration direkt
        const isSubscribed = await window.OneSignal.isPushNotificationsEnabled();
        console.log("OneSignal prenumeration:", isSubscribed);

        if (isSubscribed) {
          const playerId = await window.OneSignal.getUserId();
          if (playerId) {
            await supabase
              .from("users")
              .update({ onesignal_player_id: playerId })
              .eq("id", user.id);
          }
        }

        // Lyssna på prenumerationsändringar
        window.OneSignal.on("subscriptionChange", async (isSubscribed: boolean) => {
          console.log("Subscription ändrades:", isSubscribed);
          if (isSubscribed) {
            const playerId = await window.OneSignal.getUserId();
            if (playerId) {
              await supabase
                .from("users")
                .update({ onesignal_player_id: playerId })
                .eq("id", user.id);
            }
          }
        });
      } catch (err) {
        console.error("OneSignal init/funktion misslyckades:", err);
      }
    });
  }, [isLoaded, user]);

  return null; // Ingen UI, bara logik
}

