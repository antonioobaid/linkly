"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { UserInsert } from "../../../../shared/types";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    console.log("🚀 Startar registreringsprocess...");

    if (!firstName || !lastName || !username || !email || !password) {
      console.warn("⚠️ Alla fält måste fyllas i!");
      return alert("Fyll i alla fält!");
    }

    if (password !== confirmPassword) {
      console.warn("⚠️ Lösenorden matchar inte!");
      return alert("Lösenorden matchar inte!");
    }

    setLoading(true);

    try {
      // 1️⃣ Auth
      console.log("📨 Skickar signUp request till Supabase Auth...");
      const { data, error } = await supabase.auth.signUp({ email, password });
      console.log("📩 SignUp Response:", data, error);

      if (error) throw error;

      const user = data.user;
      console.log("👤 Auth User:", user);

      if (!user) throw new Error("Ingen användare skapad!");

      // 2️⃣ Lägg in i users-tabellen
      console.log("📤 Lägger till användare i users-tabellen...");

      const { error: insertError } = await supabase
        .from("users")
        .insert<UserInsert>([
          {
            id: user.id,
            email,
            username,
            first_name: firstName,
            last_name: lastName,
            avatar_url: null,
            bio: null,
          },
        ]);

      console.log("📥 Insert Response:", insertError || "OK");

      if (insertError) throw insertError;

      console.log("🎉 Registrering komplett!");
      alert("Registrering lyckades!");
      router.push("/login");
    } catch (err: any) {
      console.error("❌ FEL:", err);
      alert(err.message);
    } finally {
      console.log("⏳ Avslutar registreringsprocess...");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Skapa konto</h1>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          placeholder="Förnamn"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="p-3 border rounded"
        />
        <input
          placeholder="Efternamn"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="p-3 border rounded"
        />
      </div>
      <input
        placeholder="Användarnamn"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full p-3 border rounded mb-4"
      />
      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 border rounded mb-4"
      />
      <input
        placeholder="Lösenord"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-3 border rounded mb-4"
      />
      <input
        placeholder="Bekräfta Lösenord"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full p-3 border rounded mb-4"
      />
      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition-colors"
      >
        {loading ? "Skapar konto..." : "Registrera"}
      </button>
    </div>
  );
}
