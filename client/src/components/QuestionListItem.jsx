import { AlertTriangle, ChevronDown } from "lucide-react";

const STATUS_STYLES = {
  correct: "bg-emerald-50 text-emerald-700 border-emerald-200",
  partial: "bg-amber-50 text-amber-700 border-amber-200",
  incorrect: "bg-red-50 text-red-700 border-red-200",
  unanswered: "bg-gray-100 text-gray-500 border-gray-200",
  ungraded: "bg-slate-50 text-slate-600 border-slate-200",
};

function StatusBadge({ question }) {
  if (question.status === "unanswered") {
    return (
      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES.unanswered}`}>
        Unanswered
      </span>
    );
  }
  const g = question.grading;
  if (!g) {
    return (
      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES.ungraded}`}>
        Answered
      </span>
    );
  }
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[g.status] || STATUS_STYLES.ungraded}`}>
      {g.status.charAt(0).toUpperCase() + g.status.slice(1)}
      {g.maxMarks ? ` · ${g.marksAwarded}/${g.maxMarks}` : ""}
    </span>
  );
}

export default function QuestionListItem({ question, active, expanded, onClick, onToggleExpand }) {
  const hasFeedback = !!question.grading?.feedback;

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  }

  return (
    <div
      className={`w-full rounded-xl border px-3.5 py-3 transition ${
        active ? "border-accent bg-card" : "border-transparent hover:bg-surface"
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className="w-full text-left cursor-pointer"
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1 min-w-0">
            <span className="font-semibold text-sm shrink-0">{question.number}</span>
            {hasFeedback && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand();
                }}
                aria-label={expanded ? "Hide AI response" : "Show AI response"}
                title={expanded ? "Hide AI response" : "Show AI response"}
                className="w-5 h-5 flex items-center justify-center rounded-full text-muted hover:bg-surface hover:text-ink transition shrink-0"
              >
                <ChevronDown
                  size={14}
                  className={`transition-transform ${expanded ? "rotate-180" : ""}`}
                />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {question.needsReview && (
              <span
                title="This match was inferred, not explicitly labelled by the student — please verify"
                className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200"
              >
                <AlertTriangle size={11} />
                Verify
              </span>
            )}
            <StatusBadge question={question} />
          </div>
        </div>
        <p className="text-xs font-semibold text-ink">{question.text}</p>
        {question.needsReview && active && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 mt-2">
            The student didn&apos;t label this answer — we matched it by content/position. Double-check the highlighted region is correct.
          </p>
        )}
      </div>
      {hasFeedback && expanded && (
        <p className="text-xs font-bold text-ink mt-2 border-t border-border pt-2">
          {question.grading.feedback}
        </p>
      )}
    </div>
  );
}
