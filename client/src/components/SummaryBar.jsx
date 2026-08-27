import { Sparkles } from "lucide-react";

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
          <p className="text-xs font-bold text-ink mt-1">Total score</p>
        </div>
        <Stat label="Answered" value={`${summary.answeredCount}/${summary.totalQuestions}`} />
        <Stat label="Correct" value={summary.correctCount} tone="text-emerald-600" />
        <Stat label="Partial" value={summary.partialCount} tone="text-amber-600" />
        <Stat label="Incorrect" value={summary.incorrectCount} tone="text-red-600" />
        <Stat label="Unanswered" value={summary.unansweredCount} tone="text-gray-500" />
      </div>
      {summary.overallFeedback && (
        <div className="mt-4 flex gap-3 bg-accent-soft/50 border border-accent/20 rounded-xl px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-white border border-accent/30 flex items-center justify-center shrink-0">
            <Sparkles size={15} className="text-accent" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-accent uppercase tracking-wide mb-1">
              Overall Performance
            </p>
            <p className="text-sm text-ink leading-relaxed">{summary.overallFeedback}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div>
      <p className={`text-lg font-semibold leading-none ${tone || ""}`}>{value}</p>
      <p className="text-xs font-bold text-ink mt-1">{label}</p>
    </div>
  );
}
