"use client";

import { useEffect } from "react";
import { io, type Socket } from "socket.io-client";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { supabase } from "@/lib/supabaseClient";

export default function ChatNotifications() {
  const { user, isLoaded } = useSupabaseUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    // ✅ 1. OneSignal push-notiser
    if (window.OneSignal) {
      window.OneSignal.push(async () => {
        try {
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

          // Lyssna när användaren ändrar prenumeration
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
          console.error("OneSignal push-fel:", err);
        }
      });
    } else {
      console.warn("OneSignal SDK är inte laddad ännu.");
    }

    // ✅ 2. Realtids-notiser med Socket.IO
    const socket: Socket = io("http://localhost:4000", { transports: ["websocket"] });

    socket.on("connect", () => {
      console.log("🔌 Ansluten till Socket.IO:", socket.id);
    });

    socket.on("receive_message", (msg: any) => {
      console.log("Nytt meddelande:", msg.text);

      // Browser push-notis
      if (Notification.permission === "granted") {
        new Notification("Nytt meddelande", {
          body: msg.text,
          icon: "/default-avatar.png",
        });
      } else {
        // Be om tillstånd en gång
        Notification.requestPermission().then(permission =>
          console.log("Notification permission:", permission)
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isLoaded, user]);

  return null;
}
