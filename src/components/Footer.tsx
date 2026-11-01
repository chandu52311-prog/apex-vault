import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black py-8 mt-16 text-neutral-500 text-xs">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>&copy; {new Date().getFullYear()} Apex Vault. All Rights Reserved.</p>
        <div className="flex flex-wrap gap-6 text-neutral-400">
          <Link href="/about" className="hover:text-amber-400 transition">About Us</Link>
          <Link href="/contact" className="hover:text-amber-400 transition">Contact</Link>
          <Link href="/privacy-policy" className="hover:text-amber-400 transition">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-amber-400 transition">Terms &amp; Conditions</Link>
        </div>
      </div>
    </footer>
  );
}
