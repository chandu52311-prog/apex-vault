import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-black text-neutral-300 px-6 py-12 max-w-4xl mx-auto">
      <Link href="/" className="text-xs uppercase tracking-widest text-amber-400 hover:underline">
        &larr; Back to Apex Vault
      </Link>
      <h1 className="text-3xl font-black uppercase text-white mt-6 mb-4">Privacy Policy</h1>
      <p className="text-xs text-neutral-500 mb-8">Effective Date: November 2026</p>

      <section className="space-y-6 text-sm leading-relaxed">
        <div>
          <h2 className="text-lg font-bold text-amber-400 uppercase mb-2">1. Information We Collect</h2>
          <p>
            When you utilize Apex Vault to request VIP allocation, test drives, or premium luxury quotes, we collect customer contact details including your full name, contact phone number, and delivery city. We do not store sensitive payment card information on our servers.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-amber-400 uppercase mb-2">2. Cookies &amp; Advertising Partners</h2>
          <p>
            Apex Vault uses cookies and local device identifiers to personalize regional pricing, analyze traffic patterns, and deliver verified partner listings. Third-party vendors, including Google AdSense, use cookies (such as the DoubleClick cookie) to serve relevant ads based on prior visits to our site and other internet portals.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-amber-400 uppercase mb-2">3. Affiliate Disclosure</h2>
          <p>
            Some links on this portal are affiliate links (including Amazon Associates, Flipkart Affiliate Network, and verified master dealership programs). If you purchase or finalize booking allocations through these links, Apex Vault may earn an affiliate commission at no extra cost to you.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-amber-400 uppercase mb-2">4. Data Protection &amp; Security</h2>
          <p>
            We implement strict database escrow safeguards via Supabase to protect customer lead allocations against unauthorized access, distribution, or alteration.
          </p>
        </div>
      </section>
    </main>
  );
}
