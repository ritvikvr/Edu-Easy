'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { exportToPdf } from '@/app/lib/exportToPdf';
import { uploadPdf } from '@/app/lib/api';
import FileDropzone from '@/app/components/FileDropzone';

export default function HomePage() {
  const [isUploading, setIsUploading] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const handleExport = useCallback(async () => {
    if (!contentRef.current) return;
    try {
      await exportToPdf(contentRef.current, 'summary.pdf');
    } catch {
      alert('Failed to export PDF.');
    }
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }
    try {
      setIsUploading(true);
      const res = await uploadPdf(file); // fake API; returns { message, jobId }
      // Optional alert:
      // alert(`✅ ${res.message}\nJob ID: ${res.jobId}`);
      // Redirect to summary page with jobId and file name (for display)
      router.push(`/summary?jobId=${encodeURIComponent(res.jobId)}&name=${encodeURIComponent(file.name)}`);
    } catch {
      alert('❌ Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      {/* ...header ... */}
      <main ref={contentRef}>
        {/* ...hero... */}
        <section className="mx-auto max-w-6xl px-4">
          <FileDropzone onFileSelect={handleFileSelect} isUploading={isUploading} />
        </section>
        {/* ...features & CTA... */}
      </main>
      {/* ...footer... */}
    </div>
  );
}
