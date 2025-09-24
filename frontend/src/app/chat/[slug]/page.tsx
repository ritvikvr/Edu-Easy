"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UploadChatPage() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const uploadFile = async () => {
    if (!file) return;
    setBusy(true);

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    setBusy(false);

    if (res.ok && data.pdfId) {
      router.push(`/chat/${data.pdfId}`);
    } else {
      alert(data.error || "Upload failed");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Upload a PDF to Start Chatting</h1>
      <Input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <Button onClick={uploadFile} disabled={!file || busy}>
        {busy ? "Processing..." : "Upload"}
      </Button>
    </div>
  );
}
