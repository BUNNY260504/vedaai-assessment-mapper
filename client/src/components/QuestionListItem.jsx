import { AlertTriangle, ChevronDown } from "lucide-react";

const SCORE_PILL_STYLES = {
  correct: "bg-emerald-50 text-emerald-600",
  partial: "bg-amber-50 text-amber-600",
  incorrect: "bg-red-50 text-red-600",
  ungraded: "bg-slate-50 text-slate-600",
};

function ScorePill({ question }) {
  if (question.status === "unanswered") {
    return (
      <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-500 whitespace-nowrap">
        Unanswered
      </span>
    );
  }
  const g = question.grading;
  if (!g) {
    return (
      <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-50 text-slate-600 whitespace-nowrap">
        Answered
      </span>
    );
  }
  return (
    <span
      className={`text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap ${
        SCORE_PILL_STYLES[g.status] || SCORE_PILL_STYLES.ungraded
      }`}
    >
      {g.maxMarks != null ? `${g.marksAwarded}/${g.maxMarks}` : g.status}
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
      className={`w-full rounded-2xl border-2 p-4 transition ${
        active ? "border-accent" : "border-transparent hover:bg-surface"
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className="w-full text-left cursor-pointer flex items-start gap-3"
      >
        <div className="min-w-[44px] h-11 px-2 rounded-full bg-accent text-white font-bold flex items-center justify-center shrink-0">
          {question.number}
        </div>
        <p className="flex-1 min-w-0 text-xs font-semibold text-ink leading-snug pt-2">
          {question.text}
        </p>
        <div className="flex items-center gap-2 shrink-0 pt-1">
          {question.needsReview && (
            <span
              title="This match was inferred, not explicitly labelled by the student — please verify"
              className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200"
            >
              <AlertTriangle size={11} />
              Verify
            </span>
          )}
          <ScorePill question={question} />
          {hasFeedback && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              aria-label={expanded ? "Hide AI feedback" : "Show AI feedback"}
              title={expanded ? "Hide AI feedback" : "Show AI feedback"}
              className="w-8 h-8 rounded-full bg-surface hover:bg-border flex items-center justify-center transition shrink-0"
            >
              <ChevronDown
                size={16}
                className={`transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>
      </div>

      {question.needsReview && active && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
          The student didn&apos;t label this answer — we matched it by content/position. Double-check the highlighted region is correct.
        </p>
      )}

      {hasFeedback && expanded && (
        <div className="mt-3 bg-surface rounded-xl p-4">
          <p className="font-bold text-sm text-ink mb-1.5">AI Feedback</p>
          <p className="text-sm text-ink/80 leading-relaxed">{question.grading.feedback}</p>
        </div>
      )}
    </div>
  );
}
