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

// ------- NEW: Mock summary + flashcards APIs --------

export type SummaryResponse = {
  summaryPoints: string[];
  qa: { q: string; a: string }[];
};

export type FlashcardResponse = {
  flashcards: { q: string; a: string }[];
};

export async function getSummary(jobId: string): Promise<SummaryResponse> {
  await new Promise((r) => setTimeout(r, 900));
  return {
    summaryPoints: [
      'Key concept explained concisely.',
      'Definition of the core idea.',
      'Process/workflow in 3 steps.',
      'Common limitations or pitfalls.',
      'Rule of thumb / best practice.',
    ],
    qa: [
      { q: 'How does Concept A work?', a: 'It interacts with B via mechanism M.' },
      { q: 'What’s a limitation?', a: 'Constraint L reduces accuracy.' },
    ],
  };
}

export async function getFlashcards(jobId: string): Promise<FlashcardResponse> {
  await new Promise((r) => setTimeout(r, 900));
  return {
    flashcards: [
      { q: 'What is the main idea?', a: 'A concise central concept.' },
      { q: 'Define Term A.', a: 'A crisp definition.' },
      { q: 'List two advantages of Method X.', a: '1) Advantage one  2) Advantage two' },
      { q: 'When avoid Technique Y?', a: 'In scenario Z due to limitation L.' },
      { q: 'Steps involved?', a: 'Step 1 → Step 2 → Step 3.' },
    ],
  };
}
