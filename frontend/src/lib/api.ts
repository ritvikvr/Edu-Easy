import { 
  UploadResponse, 
  SummaryJobResult, 
  QAResponse,
  UploadResponseSchema,
  SummaryJobResultSchema,
  QAResponseSchema
} from "./schemas";
import { mockApi } from "./mocks";

// Since Lovable doesn't support env vars, we'll use mock mode by default
// In a real implementation, this would check process.env.NEXT_PUBLIC_USE_MOCK
const USE_MOCK = true;

class ApiService {
  private baseUrl = "/api"; // Would be real API endpoint

  async uploadPdf(file: File): Promise<UploadResponse> {
    if (USE_MOCK) {
      return mockApi.uploadPdf(file);
    }

    // Real API implementation would go here
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return UploadResponseSchema.parse(data);
  }

  async getJob(jobId: string): Promise<SummaryJobResult> {
    if (USE_MOCK) {
      return mockApi.getJob(jobId);
    }

    // Real API implementation
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get job: ${response.statusText}`);
    }

    const data = await response.json();
    return SummaryJobResultSchema.parse(data);
  }

  async askQuestion(jobId: string, question: string): Promise<QAResponse> {
    if (USE_MOCK) {
      return mockApi.askQuestion(jobId, question);
    }

    // Real API implementation
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error(`Question failed: ${response.statusText}`);
    }

    const data = await response.json();
    return QAResponseSchema.parse(data);
  }
}

export const api = new ApiService();