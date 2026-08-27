export default function SummaryBar({ summary }) {
  if (!summary) return null;
  return (
    <div className="border-b border-border bg-card px-5 py-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div>
          <p className="text-2xl font-semibold leading-none">
            {summary.totalMarks}
            <span className="text-muted text-base font-normal">/{summary.maxMarks}</span>
          </p>
          <p className="text-xs text-muted mt-1">Total score</p>
        </div>
        <Stat label="Answered" value={`${summary.answeredCount}/${summary.totalQuestions}`} />
        <Stat label="Correct" value={summary.correctCount} tone="text-emerald-600" />
        <Stat label="Partial" value={summary.partialCount} tone="text-amber-600" />
        <Stat label="Incorrect" value={summary.incorrectCount} tone="text-red-600" />
        <Stat label="Unanswered" value={summary.unansweredCount} tone="text-gray-500" />
      </div>
      {summary.overallFeedback && (
        <p className="text-sm text-muted mt-3 max-w-3xl">{summary.overallFeedback}</p>
      )}
    </div>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div>
      <p className={`text-lg font-semibold leading-none ${tone || ""}`}>{value}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  );
}
