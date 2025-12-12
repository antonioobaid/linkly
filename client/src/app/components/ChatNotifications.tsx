/*"use client";

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
}*/

/*
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
    window.OneSignal = window.OneSignal || [];
    window.OneSignal.push(async () => {
      try {
        const isSubscribed = await window.OneSignal.isPushNotificationsEnabled();
        const playerId = await window.OneSignal.getUserId();

        if (playerId) {
          await supabase
            .from("users")
            .update({ onesignal_player_id: playerId })
            .eq("id", user.id);
        }

        // Lyssna på prenumerationsändringar
        window.OneSignal.on("subscriptionChange", async (isSubscribed: boolean) => {
          const newPlayerId = await window.OneSignal.getUserId();
          if (newPlayerId) {
            await supabase
              .from("users")
              .update({ onesignal_player_id: newPlayerId })
              .eq("id", user.id);
          }
        });
      } catch (err) {
        console.error("OneSignal push-fel:", err);
      }
    });

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
        Notification.requestPermission().then((permission) =>
          console.log("Notification permission:", permission)
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isLoaded, user]);

  return null;
}*/



"use client";

import { useEffect } from "react";
import { io, type Socket } from "socket.io-client";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { supabase } from "@/lib/supabaseClient";
import { Message } from "../../../../shared/types";


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function ChatNotifications() {
  const { user, isLoaded } = useSupabaseUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    // 1️⃣ OneSignal push-notiser
    const initOneSignal = async () => {
      if (!window.OneSignal) return;

      window.OneSignal = window.OneSignal || [];
      window.OneSignal.push(async () => {
        try {
          // Initiera OneSignal (bara om det inte redan initierats i layout)
          const playerId = await window.OneSignal.getUserId();
          if (playerId) {
            await supabase
              .from("users")
              .update({ onesignal_player_id: playerId })
              .eq("id", user.id);
          }

          // Lyssna på prenumerationsändringar
          window.OneSignal.on("subscriptionChange", async (isSubscribed: boolean) => {
            if (isSubscribed) {
              const newPlayerId = await window.OneSignal.getUserId();
              if (newPlayerId) {
                await supabase
                  .from("users")
                  .update({ onesignal_player_id: newPlayerId })
                  .eq("id", user.id);
              }
            }
          });
        } catch (err) {
          console.error("OneSignal push-fel:", err);
        }
      });
    };

    initOneSignal();

    // 2️⃣ Socket.IO realtids-notiser
    const socket: Socket = io(API_URL, { transports: ["websocket"] });

    socket.on("connect", () => console.log("🔌 Ansluten till Socket.IO:", socket.id));

    socket.on("receive_message", (msg: Message) => {
      console.log("Nytt meddelande:", msg.text);

      // Browser push-notis
      if (Notification.permission === "granted") {
        new Notification("Nytt meddelande", {
          body: msg.text,
          icon: "/default-avatar.png",
        });
      } else {
        Notification.requestPermission().then((permission) =>
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




