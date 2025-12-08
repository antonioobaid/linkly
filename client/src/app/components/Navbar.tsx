"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Home, Search, MessageCircle, X } from "lucide-react";
import { User } from "../../../../shared/types";
import { getAvatarUrl } from "@/lib/getAvatarUrl";

interface NavItemProps {
  label?: string;
  href?: string;
  avatarUrl?: string | null;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export default function Navbar() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ===================== FETCH USER =====================
  useEffect(() => {
  // Lyssna på auth state changes
  const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user?.id) {
      // Hämta användardata
      supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single()
        .then(({ data, error }) => {
          if (error) console.error(error);
          setCurrentUser(data as User);
          setLoading(false);
        });
    } else {
      setCurrentUser(null);
      setLoading(false);
    }
  });

  return () => {
    listener.subscription.unsubscribe();
  };
}, []);

  // ===================== LOGOUT =====================
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="flex justify-between items-center px-6 py-4 border-b bg-white dark:bg-black">
        <div className="text-2xl font-bold text-blue-600">Linkly</div>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* ================================================
          DESKTOP SIDEBAR
      ================================================= */}
      <div className="hidden lg:flex fixed left-0 top-0 h-full w-56 border-r bg-white dark:bg-black dark:text-white p-6 flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-extrabold mb-6 
                     bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text"
        >
          <span>🔗</span> Linkly
        </Link>

        {currentUser && (
          <>
            <NavItem icon={<Home />} label="Home" href="/" />
            <NavItem icon={<Search />} label="Sök" href="/search" />
            <NavItem icon={<MessageCircle />} label="Chat" href="/inbox" />
            <NavItem href="/profile" avatarUrl={currentUser.avatar_url} label="Profil" />
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
            >
              Logga ut
            </button>
          </>
        )}
      </div>

      {/* ===================== TABLET HEADER (md → lg) ===================== */}
      <div className="hidden md:flex lg:hidden w-full fixed top-0 left-0 z-50 justify-center
                      border-b bg-white dark:bg-black dark:text-white py-4">
        <Link
          href="/"
          className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text"
        >
          Linkly
        </Link>
      </div>

      {/* Spacer */}
      <div className="hidden md:block lg:hidden h-16" />

      {/* ===================== TABLET SIDEBAR (ICONS ONLY) ===================== */}
      <div className="hidden md:flex lg:hidden fixed left-0 top-16 h-[calc(100%-4rem)] w-20 border-r
                      bg-white dark:bg-black dark:text-white p-4 flex-col items-center gap-6">
        {currentUser && (
          <>
            <IconOnly icon={<Home />} href="/" />
            <IconOnly icon={<Search />} href="/search" />
            <IconOnly icon={<MessageCircle />} href="/inbox" />
            <IconOnly href="/profile" avatarUrl={currentUser.avatar_url} />
            <IconOnly
              icon={<X className="text-red-500 w-6 h-6" />}
              onClick={handleLogout}
            />
          </>
        )}
      </div>

      {/* ================================================
          MOBILE BOTTOM NAV
      ================================================= */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-black 
                      border-t flex justify-around py-3 dark:text-white z-50 h-16
                      ">
        {currentUser && (
          <>
            <IconOnly icon={<Home />} href="/" />
            <IconOnly icon={<Search />} href="/search" />
            <IconOnly icon={<MessageCircle />} href="/inbox" />
            <IconOnly href="/profile" avatarUrl={currentUser.avatar_url} />
          </>
        )}
      </div>

      {/* HEADER (Mobile) */}
      <div className="md:hidden w-full flex justify-between items-center px-4 py-3 
                      border-b bg-white dark:bg-black dark:text-white fixed top-0 left-0 z-50">
                        
        <Link
          href="/"
          className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text"
        >
          Linkly
        </Link>

        {currentUser && (
          <button onClick={handleLogout} aria-label="Logga ut">
            <X className="w-7 h-7 text-red-500" />
          </button>
        )}
      </div>
    </>
  );
}

/* ===================================================
   COMPONENTS
=================================================== */

// Desktop items (text + icon)
function NavItem({ icon, label, href, avatarUrl }: NavItemProps) {

  <Image src={getAvatarUrl(avatarUrl)} alt="Profil" fill className="object-cover" />

  return (
    <Link
      href={href || "/"}
      className="flex items-center gap-3 text-lg font-medium hover:bg-gray-100 
                 dark:hover:bg-gray-800 p-2 rounded-xl"
    >
      {label === "Profil" ? (
        <div className="w-8 h-8 relative rounded-full overflow-hidden">
            <Image src={getAvatarUrl(avatarUrl)} alt="Profil" fill className="object-cover" />
        </div>
      ) : (
        <div className="w-6 h-6">{icon}</div>
      )}

      {label && <span>{label}</span>}
    </Link>
  );
}

// Tablet / Mobile Icons only
function IconOnly({ icon, href, avatarUrl, onClick }: NavItemProps & { onClick?: () => void }) {
  // Om avatarUrl finns, visa den, annars visa icon (om finns)
  const content = avatarUrl || href === "/profile" ? (
    <div className="w-8 h-8 relative rounded-full overflow-hidden">
      <Image src={getAvatarUrl(avatarUrl)} alt="Profil" fill className="object-cover" />
    </div>
  ) : (
    <div className="w-6 h-6">{icon}</div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
    >
      {content}
    </button>
  );
}
