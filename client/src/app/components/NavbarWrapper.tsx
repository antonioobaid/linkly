"use client";

import { useSupabaseUser } from "@/lib/useSupabaseUser";
import Navbar from "./Navbar";


export default function NavbarWrapper() {
  const { user, isLoaded } = useSupabaseUser();

  if (!isLoaded) return null; // väntar på auth

  if (!user) return null; // ej inloggad → ingen navbar

  return <Navbar />;
}
