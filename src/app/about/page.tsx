import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-neutral-300 px-6 py-12 max-w-4xl mx-auto">
      <Link href="/" className="text-xs uppercase tracking-widest text-amber-400 hover:underline">
        &larr; Back to Apex Vault
      </Link>
      <h1 className="text-3xl font-black uppercase text-white mt-6 mb-4">About Apex Vault</h1>
      <p className="text-xs text-neutral-500 mb-8">Verified Supercars, Superbikes &amp; Flagship Hardware</p>

      <section className="space-y-6 text-sm leading-relaxed">
        <p>
          Apex Vault is an elite automotive registry and luxury technology curation platform engineered for High Net-Worth Individuals (HNIs), automotive enthusiasts, and tech connoisseurs across 200+ global hubs and 28 Indian states.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="border border-white/10 bg-neutral-900/60 p-4 rounded-xl">
            <h3 className="text-amber-400 font-bold uppercase text-xs mb-2">Live Regional Engine</h3>
            <p className="text-xs text-neutral-400">Dynamic duty, VAT, and on-road pricing tailored to your city hub.</p>
          </div>
          <div className="border border-white/10 bg-neutral-900/60 p-4 rounded-xl">
            <h3 className="text-amber-400 font-bold uppercase text-xs mb-2">Direct Hub Concierge</h3>
            <p className="text-xs text-neutral-400">Direct doorstep logistics routed to authorized manufacturer partners.</p>
          </div>
          <div className="border border-white/10 bg-neutral-900/60 p-4 rounded-xl">
            <h3 className="text-amber-400 font-bold uppercase text-xs mb-2">Curated Flagships</h3>
            <p className="text-xs text-neutral-400">Verified official store deals for top-tier silicon and custom hardware.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
