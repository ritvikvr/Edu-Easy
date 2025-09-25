# study.py — local VS Code runtime (Windows-safe, no Colab, no FAISS)

import os
import json
import pickle
import logging
import numpy as np

from PIL import Image
import pytesseract
from pdf2image import convert_from_path

from sentence_transformers import SentenceTransformer
from langchain.schema import Document
import google.generativeai as genai
from dotenv import load_dotenv

# Portable nearest-neighbor search for Windows (avoid FAISS headaches)
from sklearn.neighbors import NearestNeighbors


# ---------- Config ----------
# If Poppler / Tesseract are not on PATH, set absolute paths here:
POPPLER_BIN = r"C:\path\to\poppler\bin"  # e.g., C:\poppler-24.02.0\Library\bin
TESSERACT_EXE = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

if os.path.isfile(TESSERACT_EXE):
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_EXE
# ---------------------------


from pdf2image import convert_from_path

# Set this once, at the top of your script
POPPLER_BIN = r"C:\poppler-24.08.0\bin"   # change to your real Poppler bin path

from pdf2image import convert_from_path

# Set this once, at the top of your script
POPPLER_BIN = r"C:\poppler-24.08.0\bin"   # change to your real Poppler bin path

def pdf_to_images(pdf_path, dpi=300):
    """Render PDF pages to PIL images using Poppler."""
    return convert_from_path(pdf_path, dpi=dpi, poppler_path=POPPLER_BIN)


def ocr_image(image: Image.Image) -> str:
    """OCR a single PIL image."""
    return pytesseract.image_to_string(image)


def ocr_pdf(pdf_path: str):
    """OCR all pages of a PDF into a list of page texts."""
    images = pdf_to_images(pdf_path, dpi=300)
    return [ocr_image(img) for img in images]


def chunk_text(text: str, chunk_size=500, overlap=50):
    """Simple word-based chunking with overlap."""
    words = text.split()
    chunks = []
    step = max(1, chunk_size - overlap)
    for i in range(0, len(words), step):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk:
            chunks.append(chunk)
    return chunks


def chunk_pdf_texts(page_texts, filename):
    """Attach metadata (filename, page_no) to chunks."""
    all_chunks = []
    for page_no, text in enumerate(page_texts, 1):
        for chunk in chunk_text(text):
            all_chunks.append({
                "text": chunk,
                "metadata": {"filename": filename, "page_no": page_no}
            })
    return all_chunks


# Embeddings model (CPU is fine)
model = SentenceTransformer('all-MiniLM-L6-v2')


def build_vector_index(chunks, n_neighbors=5):
    """Build a cosine-distance KNN index using scikit-learn."""
    embeddings = [model.encode(c['text']) for c in chunks]
    X = np.asarray(embeddings, dtype=np.float32)
    nn = NearestNeighbors(n_neighbors=n_neighbors, metric='cosine')
    nn.fit(X)
    return nn, X


def search_vector(query, nn_index, X, chunks, k=5):
    """Return top-k chunks for a query."""
    q = np.asarray([model.encode(query)], dtype=np.float32)
    distances, indices = nn_index.kneighbors(q, n_neighbors=k)
    return [chunks[i] for i in indices[0]]


def save_index_sklearn(nn_index, X, chunks, path="vector_index"):
    """Optional: persist index + embeddings + metadata."""
    os.makedirs(path, exist_ok=True)
    with open(os.path.join(path, "nn.pkl"), "wb") as f:
        pickle.dump(nn_index, f)
    with open(os.path.join(path, "embeddings.npy"), "wb") as f:
        np.save(f, X)
    with open(os.path.join(path, "metadata.pkl"), "wb") as f:
        pickle.dump(chunks, f)


class ChatService:
    def __init__(self):
        load_dotenv()
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in .env file.")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.chat = self.model.start_chat(history=[])

    def ask(self, prompt: str) -> str:
        resp = self.chat.send_message(prompt)
        return resp.text


class LocalRetriever:
    def __init__(self, nn_index, X, chunks):
        self.nn_index = nn_index
        self.X = X
        self.chunks = chunks

    def get_relevant_documents(self, query, k=5):
        results = search_vector(query, self.nn_index, self.X, self.chunks, k)
        return [Document(page_content=c["text"], metadata=c["metadata"]) for c in results]


def summarize_pdf(chunks, gemini_chat, max_pages=5):
    summaries = []
    for chunk in chunks[:max_pages]:
        context = chunk["text"]
        page = chunk["metadata"]["page_no"]
        prompt = f"Summarize the following text from page {page}:\n\n{context}"
        summaries.append(f"Page {page} Summary:\n{gemini_chat.ask(prompt)}\n")
    return "\n".join(summaries)


def generate_mcqs(chunks, gemini_chat, num_mcqs=5):
    context = "\n".join(c["text"] for c in chunks[:10])  # first 10 chunks for efficiency
    prompt = f"""
    Based on the following study material, generate {num_mcqs} multiple-choice questions (MCQs).
    Each MCQ should have 4 options (A, B, C, D) and specify the correct answer clearly.

    Context:
    {context}
    """
    return gemini_chat.ask(prompt)


def create_json_output(pdf_summary, user_query, final_answer, mcqs):
    return json.dumps({
        "summariser": pdf_summary,
        "user_query": {
            "query": user_query,
            "answer": final_answer
        },
        "mcqs": mcqs
    }, indent=4, ensure_ascii=False)


def save_json_to_file(json_data, filename="results.json"):
    with open(filename, "w", encoding="utf-8") as f:
        f.write(json_data)
    print(f"✅ Saved {filename} in current folder")


if __name__ == "__main__":
    # 1) Point to a REAL local PDF path (update this)
    pdf_path = r"C:\Users\sanja\Downloads\AI NOTES.pdf"
    if not os.path.isfile(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    # 2) OCR → chunks
    page_texts = ocr_pdf(pdf_path)
    filename = os.path.basename(pdf_path)
    chunks = chunk_pdf_texts(page_texts, filename)

    # 3) Build vector index
    nn_index, X = build_vector_index(chunks)

    # 4) Retrieval + Gemini
    retriever = LocalRetriever(nn_index, X, chunks)
    gemini_chat = ChatService()

    user_query = "What is the summary of the document?"
    docs = retriever.get_relevant_documents(user_query)
    context = "\n\n".join(d.page_content for d in docs)

    final_answer = gemini_chat.ask(
        f"Given the following context, answer this: {user_query}\n\n{context}"
    )

    # 5) Summaries + MCQs
    pdf_summary = summarize_pdf(chunks, gemini_chat)
    mcqs = generate_mcqs(chunks, gemini_chat, num_mcqs=5)

    # 6) JSON output
    result_json = create_json_output(pdf_summary, user_query, final_answer, mcqs)
    print(result_json)
    save_json_to_file(result_json)
