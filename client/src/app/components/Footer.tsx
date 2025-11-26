"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-white dark:bg-gray-900 py-6 mt-10
                       lg:pl-56 md:pl-20 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-300">
        {/* Vänster sida */}
        <p className="mb-3 sm:mb-0 text-center sm:text-left">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-blue-600">Linkly</span>. Alla rättigheter reserverade.
        </p>

        {/* Höger sida */}
        <div className="flex gap-4 justify-center sm:justify-end">
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
