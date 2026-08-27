import { Info } from "lucide-react";
import PageWithHighlight from "./PageWithHighlight.jsx";

export default function AnswerSheetViewer({ examId, page, bbox, status, zoom = 100, note }) {
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
