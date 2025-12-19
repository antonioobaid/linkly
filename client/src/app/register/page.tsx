/*"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { UserInsert } from "../../../../shared/types";

type FormErrors = Record<string, string>;
type RegisterError = { message: string };

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();

  const handleRegister = async () => {
    const newErrors: FormErrors = {};

    // Validering
    if (!firstName) newErrors.firstName = "Fyll i förnamn";
    if (!lastName) newErrors.lastName = "Fyll i efternamn";
    if (!username) newErrors.username = "Fyll i användarnamn";
    if (!email) newErrors.email = "Fyll i email";
    if (!password) newErrors.password = "Fyll i lösenord";
    if (password !== confirmPassword) newErrors.confirmPassword = "Lösenorden matchar inte";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      // Kontrollera email
      const { data: existingEmail } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existingEmail) {
        setErrors({ email: "Email används redan" });
        return;
      }

      // Kontrollera username
      const { data: existingUsername } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      if (existingUsername) {
        setErrors({ username: "Användarnamnet är redan taget" });
        return;
      }

      // Skapa användare i Supabase Auth
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      const user = data.user;
      if (!user) throw { message: "Ingen användare skapad!" };

      // Lägg in användaren i users-tabellen
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

      if (insertError) throw insertError;

      router.push("/");
    } catch (err: unknown) {
      const error = err as RegisterError;
      setErrors({ general: error.message || "Något gick fel vid registreringen" });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full p-3 border rounded mb-2 dark:bg-gray-800 dark:border-gray-600";

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
        Skapa konto
      </h1>

      {errors.general && (
        <p className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow">
          ⚠️ {errors.general}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <input
            placeholder="Förnamn"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
          />
          {errors.firstName && <p className="text-red-600 text-sm">{errors.firstName}</p>}
        </div>

        <div>
          <input
            placeholder="Efternamn"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
          />
          {errors.lastName && <p className="text-red-600 text-sm">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <input
          placeholder="Användarnamn"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={inputClass}
        />
        {errors.username && <p className="text-red-600 text-sm">{errors.username}</p>}
      </div>

      <div>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
        {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
      </div>

      <div>
        <input
          placeholder="Lösenord"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}
      </div>

      <div>
        <input
          placeholder="Bekräfta Lösenord"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputClass}
        />
        {errors.confirmPassword && (
          <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
        )}
      </div>

      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold mt-4"
      >
        {loading ? "Skapar konto..." : "Registrera"}
      </button>
    </div>
  );
}*/







 "use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { UserInsert } from "../../../../shared/types";

type FormErrors = Record<string, string>;

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();

  const handleRegister = async () => {
    const newErrors: FormErrors = {};

    // ✅ Validering
    if (!firstName) newErrors.firstName = "Fyll i förnamn";
    if (!lastName) newErrors.lastName = "Fyll i efternamn";
    if (!username) newErrors.username = "Fyll i användarnamn";
    if (!email) newErrors.email = "Fyll i email";
    if (!password) newErrors.password = "Fyll i lösenord";
    if (password !== confirmPassword) newErrors.confirmPassword = "Lösenorden matchar inte";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      console.log("🚀 Försöker skapa auth user med email:", email);

      // 1️⃣ Skapa Auth user (skickar verifieringsmail automatiskt)
      const { data, error } = await supabase.auth.signUp({ email, password });
      console.log("SignUp data:", data, "error:", error);
      if (error) throw error;

      const user = data.user;
      if (!user) throw new Error("Kunde inte skapa användare");

      console.log("✅ Auth user skapad med id:", user.id);

      // 2️⃣ Skapa post i users-tabellen via backend (Service Role Key)
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          email,
          username,
          first_name: firstName,
          last_name: lastName,
        } as UserInsert),
      });

      console.log("Backend respons status:", res.status);

      let result;
      try {
        result = await res.json();
        console.log("Backend respons JSON:", result);
      } catch (jsonErr) {
        console.error("JSON parse error:", jsonErr);
        result = { error: "Fel vid registrering av användare i backend" };
      }

      if (!res.ok) throw new Error(result.error || "Något gick fel vid registreringen");

      // 3️⃣ Visa alert och informera om email-verifiering
      alert(
        "✅ Kontot är skapat! Du måste verifiera din email innan du kan logga in. " +
        "Kolla din inbox."
      );

      // 4️⃣ Navigera till login-sidan (eftersom användaren inte kan logga in än)
      router.push("/");

    } catch (err: any) {
      setErrors({ general: err.message || "Något gick fel vid registreringen" });
      console.error("Registreringsfel:", err);
      alert("❌ Registreringen misslyckades: " + (err.message || "Okänt fel"));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full p-3 border rounded mb-2 dark:bg-gray-800 dark:border-gray-600";

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
        Skapa konto
      </h1>

      {errors.general && (
        <p className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow">
          ⚠️ {errors.general}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <input
            placeholder="Förnamn"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
          />
          {errors.firstName && <p className="text-red-600 text-sm">{errors.firstName}</p>}
        </div>

        <div>
          <input
            placeholder="Efternamn"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
          />
          {errors.lastName && <p className="text-red-600 text-sm">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <input
          placeholder="Användarnamn"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={inputClass}
        />
        {errors.username && <p className="text-red-600 text-sm">{errors.username}</p>}
      </div>

      <div>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
        {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
      </div>

      <div>
        <input
          placeholder="Lösenord"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}
      </div>

      <div>
        <input
          placeholder="Bekräfta Lösenord"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputClass}
        />
        {errors.confirmPassword && (
          <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
        )}
      </div>

      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold mt-4"
      >
        {loading ? "Skapar konto..." : "Registrera"}
      </button>
    </div>
  );
}
