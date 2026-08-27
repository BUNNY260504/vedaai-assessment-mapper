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

export default function QuestionListItem({ question, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border px-3.5 py-3 transition ${
        active
          ? "border-accent bg-accent-soft/60"
          : "border-transparent hover:bg-surface"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="font-semibold text-sm">{question.number}</span>
        <StatusBadge question={question} />
      </div>
      <p className="text-xs text-muted line-clamp-2">{question.text}</p>
      {question.grading?.feedback && active && (
        <p className="text-xs text-ink/70 mt-2 border-t border-border pt-2">
          {question.grading.feedback}
        </p>
      )}
    </button>
  );
}
