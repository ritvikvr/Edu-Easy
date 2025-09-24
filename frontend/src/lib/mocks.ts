import { 
  SummaryJobResult, 
  QAResponse, 
  UploadResponse,
  Flashcard 
} from "./schemas";

// Mock data for consistent testing
const mockFlashcards: Flashcard[] = [
  {
    id: "1",
    front: "What is React?",
    back: "A JavaScript library for building user interfaces, particularly web applications with interactive UIs.",
    difficulty: "easy"
  },
  {
    id: "2", 
    front: "What are React Hooks?",
    back: "Functions that let you use state and other React features in functional components.",
    difficulty: "medium"
  },
  {
    id: "3",
    front: "What is the Virtual DOM?",
    back: "A programming concept where a virtual representation of the UI is kept in memory and synced with the real DOM.",
    difficulty: "hard"
  },
  {
    id: "4",
    front: "What is JSX?",
    back: "A syntax extension for JavaScript that allows you to write HTML-like code in React components.",
    difficulty: "easy"
  }
];

const mockSummary = `This document provides a comprehensive overview of React, a popular JavaScript library for building user interfaces. React was developed by Facebook and has become one of the most widely used frontend frameworks in modern web development.

The document covers key concepts including components, state management, the virtual DOM, and React Hooks. It explains how React's component-based architecture allows developers to build reusable UI elements and manage application state effectively.

Key topics discussed include the importance of the virtual DOM for performance optimization, the introduction of Hooks in React 16.8, and best practices for component design and state management.`;

const mockKeyPoints = [
  "React is a JavaScript library for building user interfaces",
  "Components are the building blocks of React applications",
  "The Virtual DOM enables efficient updates and rendering",
  "React Hooks allow state management in functional components",
  "JSX provides a convenient syntax for writing React components",
  "React follows a unidirectional data flow pattern"
];

export const mockApi = {
  async uploadPdf(file: File): Promise<UploadResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      jobId: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: `Successfully uploaded ${file.name} for processing`
    };
  },

  async getJob(jobId: string): Promise<SummaryJobResult> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate different states based on time
    const now = Date.now();
    const jobCreated = now - 30000; // 30 seconds ago
    const timePassed = now - jobCreated;
    
    if (timePassed < 5000) {
      return {
        jobId,
        status: "pending",
        fileName: "sample-document.pdf",
        progress: 10,
        createdAt: new Date(jobCreated).toISOString(),
      };
    } else if (timePassed < 15000) {
      return {
        jobId,
        status: "processing", 
        fileName: "sample-document.pdf",
        progress: Math.min(90, (timePassed / 15000) * 100),
        createdAt: new Date(jobCreated).toISOString(),
      };
    } else {
      return {
        jobId,
        status: "completed",
        fileName: "sample-document.pdf",
        summary: mockSummary,
        keyPoints: mockKeyPoints,
        flashcards: mockFlashcards,
        progress: 100,
        createdAt: new Date(jobCreated).toISOString(),
        completedAt: new Date().toISOString(),
      };
    }
  },

  async askQuestion(jobId: string, question: string): Promise<QAResponse> {
    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Generate contextual answers based on question content
    const lowerQuestion = question.toLowerCase();
    
    let answer = "Based on the document content, ";
    let confidence = 0.85;
    
    if (lowerQuestion.includes("react")) {
      answer += "React is a JavaScript library for building user interfaces. It uses a component-based architecture and virtual DOM for efficient rendering.";
      confidence = 0.95;
    } else if (lowerQuestion.includes("component")) {
      answer += "components are reusable pieces of UI that can manage their own state and props. They are the building blocks of React applications.";
      confidence = 0.90;
    } else if (lowerQuestion.includes("hook")) {
      answer += "Hooks are functions that let you use state and other React features in functional components. They were introduced in React 16.8.";
      confidence = 0.88;
    } else {
      answer += "I can provide information based on the uploaded document. Please ask more specific questions about the content for better answers.";
      confidence = 0.65;
    }
    
    return {
      answer,
      confidence,
      sources: ["Page 1", "Page 3", "Section 2.1"]
    };
  }
};