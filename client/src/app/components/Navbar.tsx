"use client";

import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b bg-white">
      <Link href="/" className="text-2xl font-bold text-blue-600">
        Linkly
      </Link>

      <div className="flex items-center gap-4">
        <SignedIn>
          <Link href="/chat" className="text-gray-700 hover:text-blue-600">Chat</Link>
          <Link href="/profile" className="text-gray-700 hover:text-blue-600">Profil</Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Logga in
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </nav>
  );
}
