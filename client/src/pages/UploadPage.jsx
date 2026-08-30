import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, GraduationCap, AlertCircle } from "lucide-react";
import FileDropSlot from "../components/FileDropSlot.jsx";
import { uploadExam } from "../lib/api.js";

function isSameFile(a, b) {
  return a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
}

function findDuplicateFileName(questionFiles, answerFiles) {
  for (const q of questionFiles) {
    for (const a of answerFiles) {
      if (isSameFile(q, a)) return q.name;
    }
  }
  return null;
}

export default function UploadPage() {
  const navigate = useNavigate();
  const [questionFiles, setQuestionFiles] = useState([]);
  const [answerFiles, setAnswerFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const duplicateFileName = findDuplicateFileName(questionFiles, answerFiles);

  const canStart =
    questionFiles.length > 0 && answerFiles.length > 0 && !duplicateFileName && !submitting;

  async function handleStart() {
    setSubmitting(true);
    setError(null);
    try {
      const { id } = await uploadExam({ questionFiles, answerFiles }, setProgress);
      navigate(`/exams/${id}/processing`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Upload failed");
      setSubmitting(false);
    }
  }

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-gradient-to-b from-accent-soft/60 to-transparent rounded-3xl border border-border p-8 md:p-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-accent-soft border border-accent/30 flex items-center justify-center mb-4">
            <GraduationCap size={28} className="text-accent" />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Upload <span className="text-accent">Question Paper &amp; Answer Sheets</span>
          </h1>
          <p className="text-muted text-sm mt-2">Upload both files to get started</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <FileDropSlot
            label="Question Paper"
            accept=".pdf,image/*"
            files={questionFiles}
            onChange={setQuestionFiles}
          />
          <FileDropSlot
            label="Answer Sheet"
            accept=".pdf,image/*"
            files={answerFiles}
            onChange={setAnswerFiles}
          />
        </div>

        {duplicateFileName && (
          <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            <AlertCircle size={16} />
            &quot;{duplicateFileName}&quot; was added to both slots — the question paper and
            answer sheet must be different files.
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="flex flex-col items-center mt-8">
          <button
            disabled={!canStart}
            onClick={handleStart}
            className="flex items-center gap-2 rounded-full bg-ink text-white text-sm font-medium px-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition"
          >
            {submitting ? `Uploading… ${progress}%` : "Start Mapping"}
            {!submitting && <ArrowRight size={16} />}
          </button>
          <p className="text-xs text-muted mt-3 text-center max-w-sm">
            Once both files are uploaded, you&apos;ll be able to map answers with questions
          </p>
        </div>
      </div>
    </div>
  );
}
