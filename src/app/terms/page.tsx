import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-neutral-300 px-6 py-12 max-w-4xl mx-auto">
      <Link href="/" className="text-xs uppercase tracking-widest text-amber-400 hover:underline">
        &larr; Back to Apex Vault
      </Link>
      <h1 className="text-3xl font-black uppercase text-white mt-6 mb-4">Terms and Conditions</h1>
      <p className="text-xs text-neutral-500 mb-8">Last Updated: November 2026</p>

      <section className="space-y-6 text-sm leading-relaxed">
        <div>
          <h2 className="text-lg font-bold text-amber-400 uppercase mb-2">1. Platform Services</h2>
          <p>
            Apex Vault operates as an independent luxury automotive, superbike, and flagship electronics registry. All ex-showroom benchmarks, regional duties, VAT estimates, and on-road figures are calculated for indicative reference and allocation routing.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-amber-400 uppercase mb-2">2. VIP Booking &amp; Allocation Gateway</h2>
          <p>
            Submitting a VIP booking allocation does not constitute a completed legal purchase contract. All automotive door-step deliveries, test drive authorizations, and security armor packages are executed through authorized regional dealership hubs and escrow providers.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-amber-400 uppercase mb-2">3. External Dealership &amp; Retail Links</h2>
          <p>
            Products redirected to external merchant platforms (such as Amazon and Flipkart) are governed by the respective platform’s terms of service, returns, and buyer guarantees.
          </p>
        </div>
      </section>
    </main>
  );
}
