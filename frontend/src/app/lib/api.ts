// lib/api.ts

export type UploadResponse = {
  message: string;
  jobId: string;
};

export async function uploadPdf(file: File): Promise<UploadResponse> {
  await new Promise((r) => setTimeout(r, 800));
  if (!(file instanceof File) || file.size === 0) {
    throw new Error('Invalid file.');
  }
  const jobId = `job_${Math.random().toString(36).slice(2, 10)}`;
  return { message: 'Upload received. Processing will start shortly.', jobId };
}

// ------- NEW: mock summary API --------

export type SummaryResponse = {
  summaryPoints: string[];
  flashcards: { q: string; a: string }[];
  qa: { q: string; a: string }[];
};

export async function getSummary(jobId: string): Promise<SummaryResponse> {
  // Simulate processing time
  await new Promise((r) => setTimeout(r, 900));

  // Return deterministic-ish mock content
  return {
    summaryPoints: [
      'Key concept 1 explained with a concise takeaway.',
      'Important definition and its practical implication.',
      'Process / workflow summarized in 3–4 steps.',
      'Limitations and common pitfalls to watch out for.',
      'Final recommendation / rule of thumb.',
    ],
    flashcards: [
      { q: 'What is the main idea?', a: 'A short sentence capturing the central concept.' },
      { q: 'Define Term A.', a: 'A crisp definition that is test-friendly.' },
      { q: 'List two advantages of Method X.', a: '1) Advantage one  2) Advantage two' },
      { q: 'When should you avoid Technique Y?', a: 'In scenarios A/B due to constraint C.' },
      { q: 'What are the typical steps?', a: 'Step 1 → Step 2 → Step 3 (briefly).' },
    ],
    qa: [
      { q: 'How does Concept A relate to B?', a: 'A influences B via mechanism M.' },
      { q: 'Why is Limitation L significant?', a: 'It affects accuracy and generalization.' },
      { q: 'What data is ideal?', a: 'Clean, representative, and well-labeled data.' },
    ],
  };
}
