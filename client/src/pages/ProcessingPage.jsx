import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sparkles, AlertCircle } from "lucide-react";
import { getExamStatus } from "../lib/api.js";

const STEP_LABELS = {
  extracting: "Reading the question paper…",
  mapping: "Matching answers to questions…",
  grading: "Grading answers…",
  done: "Done",
};

export default function ProcessingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("extracting");
  const [error, setError] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    async function poll() {
      try {
        const data = await getExamStatus(id);
        if (data.status === "error") {
          setError(data.error || "Something went wrong while processing.");
          return;
        }
        setStatus(data.status);
        if (data.status === "done") {
          navigate(`/exams/${id}`, { replace: true });
          return;
        }
      } catch (err) {
        setError(err.message);
        return;
      }
      timer.current = setTimeout(poll, 1500);
    }
    poll();
    return () => clearTimeout(timer.current);
  }, [id, navigate]);

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="flex flex-col items-center text-center max-w-sm">
        {error ? (
          <>
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mb-4">
              <AlertCircle size={24} className="text-red-500" />
            </div>
            <h2 className="text-lg font-semibold mb-1">Extraction failed</h2>
            <p className="text-sm text-muted">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="mt-5 rounded-full bg-ink text-white text-sm font-medium px-5 py-2.5"
            >
              Try again
            </button>
          </>
        ) : (
          <>
            <Sparkles size={40} className="text-accent animate-pulse mb-4" />
            <h2 className="text-xl font-semibold mb-1">Extracting…</h2>
            <p className="text-sm text-muted">{STEP_LABELS[status] || "This may take a while"}</p>
          </>
        )}
      </div>
    </div>
  );
}
