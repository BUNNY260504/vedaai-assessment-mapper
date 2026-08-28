import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Library as LibraryIcon, ArrowRight, X } from "lucide-react";
import { getLibrary, removeFromLibrary } from "../lib/library.js";

export default function LibraryPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    setEntries(getLibrary());
  }, []);

  function handleRemove(e, examId) {
    e.stopPropagation();
    setEntries(removeFromLibrary(examId));
  }

  if (entries.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-10">
        <div className="w-14 h-14 rounded-full bg-accent-soft border border-accent/30 flex items-center justify-center mb-4">
          <LibraryIcon size={24} className="text-accent" />
        </div>
        <p className="text-base font-semibold mb-1">No saved exams yet</p>
        <p className="text-sm text-muted max-w-xs">
          Graded exams you save will show up here for quick access later.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="text-lg font-bold mb-4">My Library</h1>
      <div className="flex flex-col gap-3 max-w-2xl">
        {entries.map((e) => (
          <button
            key={`${e.examId}-${e.savedAt}`}
            onClick={() => navigate(`/exams/${e.examId}`)}
            className="flex items-center justify-between gap-4 bg-card border border-border rounded-xl px-4 py-3.5 text-left hover:border-accent transition"
          >
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{e.studentName}</p>
              <p className="text-xs text-muted mt-0.5">
                {e.summary
                  ? `${e.summary.totalMarks}/${e.summary.maxMarks} · ${e.summary.answeredCount}/${e.summary.totalQuestions} answered · `
                  : ""}
                {new Date(e.savedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span
                role="button"
                tabIndex={0}
                onClick={(evt) => handleRemove(evt, e.examId)}
                onKeyDown={(evt) => {
                  if (evt.key === "Enter" || evt.key === " ") handleRemove(evt, e.examId);
                }}
                aria-label={`Remove ${e.studentName} from My Library`}
                title="Remove from My Library"
                className="w-7 h-7 rounded-full flex items-center justify-center text-muted hover:bg-surface hover:text-red-600 transition"
              >
                <X size={14} />
              </span>
              <ArrowRight size={16} className="text-muted" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
