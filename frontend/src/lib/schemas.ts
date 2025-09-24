import { z } from "zod";

export const UploadResponseSchema = z.object({
  jobId: z.string(),
  message: z.string(),
});

export const JobStatus = z.enum(["pending", "processing", "completed", "failed"]);

export const FlashcardSchema = z.object({
  id: z.string(),
  front: z.string(),
  back: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});

export const SummaryJobResultSchema = z.object({
  jobId: z.string(),
  status: JobStatus,
  fileName: z.string(),
  summary: z.string().optional(),
  keyPoints: z.array(z.string()).optional(),
  flashcards: z.array(FlashcardSchema).optional(),
  progress: z.number().min(0).max(100).optional(),
  error: z.string().optional(),
  createdAt: z.string(),
  completedAt: z.string().optional(),
});

export const QAResponseSchema = z.object({
  answer: z.string(),
  confidence: z.number().min(0).max(1),
  sources: z.array(z.string()).optional(),
});

export type UploadResponse = z.infer<typeof UploadResponseSchema>;
export type SummaryJobResult = z.infer<typeof SummaryJobResultSchema>;
export type Flashcard = z.infer<typeof FlashcardSchema>;
export type QAResponse = z.infer<typeof QAResponseSchema>;
export type JobStatusType = z.infer<typeof JobStatus>;