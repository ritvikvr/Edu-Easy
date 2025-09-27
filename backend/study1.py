
import os
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import numpy as np
import pickle
import faiss
import logging
from sentence_transformers import SentenceTransformer
from langchain.schema import Document
from langchain.chains import ConversationalRetrievalChain
import google.generativeai as genai
import json

def pdf_to_images(pdf_path):
    return convert_from_path(pdf_path, dpi=300)

def ocr_image(image: Image.Image):
    return pytesseract.image_to_string(image)

def ocr_pdf(pdf_path):
    images = pdf_to_images(pdf_path)
    return [ocr_image(img) for img in images]

def chunk_text(text, chunk_size=500, overlap=50):
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
    return chunks

def chunk_pdf_texts(texts, filename):
    all_chunks = []
    for page_no, text in enumerate(texts, 1):
        for chunk in chunk_text(text):
            all_chunks.append({
                "text": chunk,
                "metadata": {"filename": filename, "page_no": page_no}
            })
    return all_chunks

model = SentenceTransformer('all-MiniLM-L6-v2')

def get_local_embedding(text):
    return model.encode(text)

def build_faiss_index(chunks):
    embeddings = [get_local_embedding(chunk['text']) for chunk in chunks]
    embeddings = np.array(embeddings).astype('float32')
    faiss.normalize_L2(embeddings)
    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings)
    return index, embeddings

def save_index(index, chunks, path="faiss_index"):
    os.makedirs(path, exist_ok=True)
    faiss.write_index(index, f"{path}/index.faiss")
    with open(f"{path}/metadata.pkl", "wb") as f:
        pickle.dump(chunks, f)

def search_faiss(query, index, chunks, k=5):
    query_vector = model.encode([query])
    faiss.normalize_L2(query_vector)
    D, I = index.search(query_vector.astype('float32'), k)
    return [chunks[i] for i in I[0] if i != -1]

def search_bm25(query, chunks, k=5):
    return []

with open(".env", "w") as f:
    f.write("GOOGLE_API_KEY=GOOGLE_API_KEY")

from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    raise ValueError("API key not found")

import google.generativeai as genai
genai.configure(api_key=api_key)

import google.generativeai as genai
from dotenv import load_dotenv
import os

class ChatService:
    def __init__(self):

        load_dotenv()
        api_key = os.getenv("GOOGLE_API_KEY")

        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in .env file.")


        genai.configure(api_key=api_key)


        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.chat = self.model.start_chat(history=[])

    def ask(self, prompt):
        response = self.chat.send_message(prompt)
        return response.text


class LocalRetriever:
    def __init__(self, index, chunks):
        self.index = index
        self.chunks = chunks

    def get_relevant_documents(self, query):
        results = search_faiss(query, self.index, self.chunks)
        if not results:
            results = search_bm25(query, self.chunks)
        return [Document(page_content=chunk['text'], metadata=chunk['metadata']) for chunk in results]

from dotenv import load_dotenv
import os

def pdf_to_images(pdf_path):
    return convert_from_path(pdf_path, dpi=300)

def ocr_image(image: Image.Image):
    return pytesseract.image_to_string(image)

def ocr_pdf(pdf_path):
    images = pdf_to_images(pdf_path)
    return [ocr_image(img) for img in images]

def chunk_text(text, chunk_size=500, overlap=50):
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
    return chunks

def chunk_pdf_texts(texts, filename):
    all_chunks = []
    for page_no, text in enumerate(texts, 1):
        for chunk in chunk_text(text):
            all_chunks.append({
                "text": chunk,
                "metadata": {"filename": filename, "page_no": page_no}
            })
    return all_chunks



load_dotenv()


pdf_path = "/content/DBMS Unit 5.pdf"
ocr_results = ocr_pdf(pdf_path)
filename = os.path.basename(pdf_path)
chunks = chunk_pdf_texts(ocr_results, filename)


index, _ = build_faiss_index(chunks)
save_index(index, chunks)

retriever = LocalRetriever(index, chunks)
gemini_chat = ChatService()


query = "What are CRUD Operations?"
docs = retriever.get_relevant_documents(query)

context = "\n\n".join([doc.page_content for doc in docs])


final_response = gemini_chat.ask(f"Given the following context, answer this: {query}\n\n{context}")


print("Answer:", final_response)

# ------------------------------
# EXTRA FUNCTIONS ADDED
# ------------------------------

def summarize_pdf(chunks, gemini_chat, max_pages=5):
    """
    Summarize the PDF by giving Gemini a chunked context.
    You can limit pages using `max_pages` to control size.
    """
    summaries = []
    for i, chunk in enumerate(chunks[:max_pages]):
        context = chunk["text"]
        prompt = f"Summarize the following text from page {chunk['metadata']['page_no']}:\n\n{context}"
        response = gemini_chat.ask(prompt)
        summaries.append(f"Page {chunk['metadata']['page_no']} Summary:\n{response}\n")
    return "\n".join(summaries)


def generate_mcqs(chunks, gemini_chat, num_mcqs=5):
    """
    Generate MCQs based on the PDF chunks.
    """
    # Take all text as one big context
    context = "\n".join([chunk["text"] for chunk in chunks[:10]])  # first 10 chunks for efficiency
    prompt = f"""
    Based on the following study material, generate {num_mcqs} multiple-choice questions (MCQs).
    Each MCQ should have 4 options (A, B, C, D) and specify the correct answer clearly.

    Context:
    {context}
    """
    response = gemini_chat.ask(prompt)
    return response


# ------------------------------
# USAGE
# ------------------------------

# Summarization
print("\n--- PDF SUMMARY ---\n")
pdf_summary = summarize_pdf(chunks, gemini_chat)
print(pdf_summary)

# MCQ Generation
print("\n--- GENERATED MCQs ---\n")
mcqs = generate_mcqs(chunks, gemini_chat, num_mcqs=5)
print(mcqs)

# ------------------------------
# JSON WRAPPER FUNCTION
# ------------------------------
def create_json_output(pdf_summary, user_query, final_answer, mcqs):
    """
    Wraps summarizer, user query & answer, and MCQs into a JSON object.
    """
    output = {
        "summariser": pdf_summary,
        "user_query": {
            "query": user_query,
            "answer": final_answer
        },
        "mcqs": mcqs
    }
    return json.dumps(output, indent=4)


def save_json_to_file(json_data, filename="results.json"):
    """
    Saves JSON string to a file and triggers download in Colab.
    """
    with open(filename, "w", encoding="utf-8") as f:
        f.write(json_data)
        


# ------------------------------
# EXISTING PIPELINE FUNCTIONS
# ------------------------------

def summarize_pdf(chunks, gemini_chat, max_pages=5):
    """
    Summarize the PDF by giving Gemini a chunked context.
    You can limit pages using `max_pages` to control size.
    """
    summaries = []
    for i, chunk in enumerate(chunks[:max_pages]):
        context = chunk["text"]
        prompt = f"Summarize the following text from page {chunk['metadata']['page_no']}:\n\n{context}"
        response = gemini_chat.ask(prompt)
        summaries.append(f"Page {chunk['metadata']['page_no']} Summary:\n{response}\n")
    return "\n".join(summaries)


def generate_mcqs(chunks, gemini_chat, num_mcqs=5):
    """
    Generate MCQs based on the PDF chunks.
    """
    # Take first 10 chunks for efficiency
    context = "\n".join([chunk["text"] for chunk in chunks[:10]])
    prompt = f"""
    Based on the following study material, generate {num_mcqs} multiple-choice questions (MCQs).
    Each MCQ should have 4 options (A, B, C, D) and specify the correct answer clearly.

    Context:
    {context}
    """
    response = gemini_chat.ask(prompt)
    return response


# ------------------------------
# RUN PIPELINE
# ------------------------------

# Example user query
user_query = "What are CRUD Operations?"
docs = retriever.get_relevant_documents(user_query)
context = "\n\n".join([doc.page_content for doc in docs])

# Get answer from Gemini
final_answer = gemini_chat.ask(f"Given the following context, answer this: {user_query}\n\n{context}")

# Generate PDF summary
pdf_summary = summarize_pdf(chunks, gemini_chat)

# Generate MCQs
mcqs = generate_mcqs(chunks, gemini_chat, num_mcqs=5)

# ------------------------------
# CREATE JSON OUTPUT
# ------------------------------
result_json = create_json_output(pdf_summary, user_query, final_answer, mcqs)

# Print JSON
print(result_json)

# Save and download JSON
save_json_to_file(result_json)
