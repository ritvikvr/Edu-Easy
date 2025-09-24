type ChatBody = {
  pdfId?: string;      // required for "this PDF" scope
  question: string;
  topK?: number;
  pastedContext?: string; // optional if you add a "Paste text" scope
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatBody;
    const { pdfId, question } = body;

    if (!question?.trim()) {
      return Response.json({ error: "Question is required" }, { status: 400 });
    }

    // ---- TEMP: Fake a vector search result ----
    // Later: call `${process.env.AI_BASE_URL}/search`
    const results = [
      { chunkId: `${pdfId ?? "global"}-p6-c0`, score: 0.873, page: 6 },
      { chunkId: `${pdfId ?? "global"}-p2-c3`, score: 0.842, page: 2 },
    ];

    // ---- TEMP: Fake chunk text (normally fetched from DB by chunkId) ----
    const chunks = [
      { id: results[0].chunkId, page: results[0].page, text: "LSTM uses gates and a cell state to manage long-term dependencies..." },
      { id: results[1].chunkId, page: results[1].page, text: "GRU merges reset and update gates, often comparable to LSTM but lighter..." },
    ];

    // ---- TEMP: Fake LLM answer (normally: build prompt with chunks + call OpenAI/Gemini) ----
    const answer =
      `**Demo answer**: LSTMs keep a separate cell state with input/forget/output gates, ` +
      `while GRUs merge gates and use fewer parameters. (See pages ${results.map(r => r.page).join(", ")})`;

    return Response.json({
      answer,
      citations: chunks.map(c => ({ page: c.page, chunkId: c.id })),
      search: {
        results,
        model: "sentence-transformers/all-MiniLM-L6-v2",
        metric: "cosine" as const,
      },
    });
  } catch (e: any) {
    return Response.json({ error: e?.message ?? "Chat error" }, { status: 500 });
  }
}
