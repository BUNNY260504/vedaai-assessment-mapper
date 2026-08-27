import { Info, FileX } from "lucide-react";
import PageWithHighlight from "./PageWithHighlight.jsx";

export default function AnswerSheetViewer({
  examId,
  page,
  bbox,
  status,
  zoom = 100,
  note,
  unanswered,
}) {
  if (unanswered) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-10">
        <div className="w-14 h-14 rounded-full bg-card border border-border flex items-center justify-center mb-4">
          <FileX size={26} className="text-muted" />
        </div>
        <p className="text-base font-bold text-ink mb-1">Question not answered by the student</p>
        <p className="text-xs text-muted max-w-xs">
          No matching answer was found on the answer sheet for this question. Use the page
          navigator above to browse manually if you&apos;d like to double-check.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {note && (
        <div className="flex items-start gap-2 text-xs text-muted bg-card border border-border rounded-lg px-3 py-2">
          <Info size={14} className="shrink-0 mt-0.5" />
          <span>{note}</span>
        </div>
      )}
      <div className="shrink-0" style={{ width: `${zoom}%` }}>
        <PageWithHighlight
          examId={examId}
          side="answer"
          page={page}
          bbox={bbox}
          pageLabel={`Page ${page + 1}`}
          status={status}
        />
      </div>
    </div>
  );
}
