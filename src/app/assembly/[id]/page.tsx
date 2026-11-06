'use client';

import React, { Suspense } from 'react';
import InteractiveAssemblyGame from '@/components/InteractiveAssemblyGame';

function AssemblyStudioContent() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white p-4 sm:p-8">
      <InteractiveAssemblyGame />
    </main>
  );
}

export default function AssemblyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black text-amber-400">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
            <p className="text-xs font-semibold tracking-widest uppercase">Loading Assembly Studio...</p>
          </div>
        </div>
      }
    >
      <AssemblyStudioContent />
    </Suspense>
  );
}
