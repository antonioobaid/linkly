"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-white py-6 mt-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center px-4 text-sm text-gray-600">
        {/* Vänster sida */}
        <p className="mb-3 sm:mb-0">
          © {new Date().getFullYear()} <span className="font-semibold text-blue-600">Linkly</span>. Alla rättigheter reserverade.
        </p>

        {/* Höger sida */}
        <div className="flex gap-4">
          <Link href="/about" className="hover:text-blue-600 transition">
            Om oss
          </Link>
          <Link href="/contact" className="hover:text-blue-600 transition">
            Kontakt
          </Link>
          <Link href="/terms" className="hover:text-blue-600 transition">
            Villkor
          </Link>
        </div>
      </div>
    </footer>
  );
}
