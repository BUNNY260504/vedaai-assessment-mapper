import { FileQuestion } from "lucide-react";
import PageWithHighlight from "./PageWithHighlight.jsx";

export default function AnswerSheetViewer({ examId, regions, emptyMessage }) {
  if (!regions || regions.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center text-muted p-8">
        <FileQuestion size={32} className="mb-3 opacity-60" />
        <p className="text-sm max-w-xs">
          {emptyMessage || "No answer found on the answer sheet for this question."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {regions.map((r, i) => (
        <PageWithHighlight
          key={`${r.page}-${i}`}
          examId={examId}
          side="answer"
          page={r.page}
          bbox={r.bbox}
          pageLabel={regions.length > 1 ? `Page ${r.page + 1} · part ${i + 1}` : `Page ${r.page + 1}`}
        />
      ))}
    </div>
  );
}
