'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getSummary, type SummaryResponse } from '@/app/lib/api';
import { exportToPdf } from '@/app/lib/exportToPdf';

export default function SummaryPage() {
  const params = useSearchParams();
  const router = useRouter();
  const jobId = params.get('jobId') ?? '';
  const fileName = params.get('name') ?? 'Your PDF';

  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // The section we export
  const exportId = useMemo(() => 'summary-export-root', []);

  useEffect(() => {
    if (!jobId) {
      // If no jobId, go back home
      router.replace('/');
      return;
    }
    (async () => {
      try {
        const res = await getSummary(jobId);
        setData(res);
      } catch {
        alert('Failed to load summary');
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId, router]);

  const handleExport = async () => {
    const el = document.getElementById(exportId);
    if (el) {
      await exportToPdf(el, 'summary.pdf');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/')}
              className="rounded-md border px-2 py-1 text-sm hover:bg-slate-100"
            >
              ← Home
            </button>
            <h1 className="text-lg font-semibold">Summary</h1>
          </div>
          <button
            onClick={handleExport}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 active:scale-[0.99]"
          >
            Export to PDF
          </button>
        </div>
      </header>

      <main id={exportId}>
        <section className="mx-auto max-w-6xl px-4 pt-10 pb-4">
          <h2 className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-pink-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
            {fileName}
          </h2>
          <p className="mt-2 text-slate-600">Job ID: <span className="font-mono">{jobId}</span></p>
        </section>

        {loading ? (
          <section className="mx-auto max-w-6xl px-4 pb-16">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <p className="animate-pulse text-slate-600">Processing your PDF…</p>
            </div>
          </section>
        ) : (
          <>
            {/* Summary */}
            <section className="mx-auto max-w-6xl px-4 py-6">
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">Smart Summary</h3>
                <ul className="mt-3 list-disc pl-5 text-slate-700">
                  {data?.summaryPoints.map((p, i) => (
                    <li key={i} className="mb-1">{p}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Flashcards */}
            <section className="mx-auto max-w-6xl px-4 py-6">
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">Flashcards</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {data?.flashcards.map((fc, i) => (
                    <div key={i} className="rounded-xl border p-4">
                      <p className="font-medium">Q: {fc.q}</p>
                      <p className="mt-1 text-slate-600">A: {fc.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Q&A */}
            <section className="mx-auto max-w-6xl px-4 py-6 pb-16">
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold">Q&amp;A</h3>
                <div className="mt-3 space-y-3">
                  {data?.qa.map((qa, i) => (
                    <div key={i} className="rounded-lg border p-4">
                      <p className="font-medium">Q: {qa.q}</p>
                      <p className="mt-1 text-slate-600">A: {qa.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
