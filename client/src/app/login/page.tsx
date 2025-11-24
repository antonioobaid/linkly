"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Fyll i alla fält!");
      return;
    }

    setLoading(true);

    try {
      // Inloggning med Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        alert("Inloggning lyckades!");
        router.push("/"); // redirect till homepage
      } else {
        alert("Inloggning misslyckades. Kontrollera email och lösenord.");
      }
    } catch (err: any) {
      console.error("Fel vid inloggning:", err);
      alert("Fel: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Logga in</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 border rounded mb-4"
      />

      <input
        type="password"
        placeholder="Lösenord"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-3 border rounded mb-4"
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? "Loggar in..." : "Logga in"}
      </button>

      <p className="mt-4 text-gray-500 text-sm text-center">
        Saknar du konto? <a href="/register" className="text-blue-600 hover:underline">Skapa ett här</a>
      </p>
    </div>
  );
}
