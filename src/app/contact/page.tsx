import React from 'react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black text-neutral-300 px-6 py-12 max-w-4xl mx-auto">
      <Link href="/" className="text-xs uppercase tracking-widest text-amber-400 hover:underline">
        &larr; Back to Apex Vault
      </Link>
      <h1 className="text-3xl font-black uppercase text-white mt-6 mb-4">Contact Concierge</h1>
      <p className="text-xs text-neutral-500 mb-8">Authorized Registry Hub Communications</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-white/10 bg-neutral-900/40 p-6 rounded-2xl space-y-4">
          <h2 className="text-amber-400 font-bold uppercase text-sm">Official Desk</h2>
          <p className="text-xs text-neutral-400">
            For dealership allocations, affiliate partner inquiries, and showroom listings:
          </p>
          <div className="text-xs text-neutral-300 space-y-2">
            <p><span className="text-neutral-500">Official Inquiries:</span> concierge@apexvault.luxury</p>
            <p><span className="text-neutral-500">Registry Operations:</span> Hyderabad &amp; Bangalore, India</p>
            <p><span className="text-neutral-500">Response Window:</span> Under 24 Business Hours</p>
          </div>
        </div>

        <div className="border border-white/10 bg-neutral-900/40 p-6 rounded-2xl space-y-4">
          <h2 className="text-amber-400 font-bold uppercase text-sm">Escrow &amp; Security Support</h2>
          <p className="text-xs text-neutral-400">
            For active VIP doorstep tracking, anti-theft immobilizer integration, or verified auto loan escrows:
          </p>
          <div className="text-xs text-neutral-300 space-y-2">
            <p><span className="text-neutral-500">Escrow Desk:</span> verify@apexvault.luxury</p>
            <p><span className="text-neutral-500">Live Support:</span> Direct WhatsApp Concierge in Allocation Modal</p>
          </div>
        </div>
      </div>
    </main>
  );
}
