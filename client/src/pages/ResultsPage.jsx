import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getExamResult } from "../lib/api.js";
import QuestionListItem from "../components/QuestionListItem.jsx";
import AnswerSheetViewer from "../components/AnswerSheetViewer.jsx";
import SummaryBar from "../components/SummaryBar.jsx";

export default function ResultsPage() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(null); // { kind: 'question'|'unmatched', item }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExamResult(id)
      .then((data) => {
        setResult(data);
        if (data.questions?.length) {
          setSelected({ kind: "question", item: data.questions[0] });
        } else if (data.unmatchedAnswers?.length) {
          setSelected({ kind: "unmatched", item: data.unmatchedAnswers[0] });
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-muted">Loading…</div>;
  }

  if (!result) {
    return <div className="p-8 text-center text-muted">Exam not found.</div>;
  }

  const regions =
    selected?.kind === "question"
      ? selected.item.answer?.regions || []
      : selected?.item?.regions || [];

  return (
    <div className="h-full flex flex-col min-h-0">
      <SummaryBar summary={result.summary} />
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[380px_1fr]">
        <div className="border-r border-border overflow-y-auto p-4 flex flex-col gap-2">
          <p className="text-xs font-medium text-muted uppercase tracking-wide px-1 mb-1">
            Questions ({result.questions.length})
          </p>
          {result.questions.map((q) => (
            <QuestionListItem
              key={q.id}
              question={q}
              active={selected?.kind === "question" && selected.item.id === q.id}
              onClick={() => setSelected({ kind: "question", item: q })}
            />
          ))}

          {result.unmatchedAnswers?.length > 0 && (
            <>
              <p className="text-xs font-medium text-muted uppercase tracking-wide px-1 mt-4 mb-1">
                Unmatched Answers ({result.unmatchedAnswers.length})
              </p>
              {result.unmatchedAnswers.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelected({ kind: "unmatched", item: a })}
                  className={`w-full text-left rounded-xl border px-3.5 py-3 transition ${
                    selected?.kind === "unmatched" && selected.item.id === a.id
                      ? "border-accent bg-accent-soft/60"
                      : "border-transparent hover:bg-surface"
                  }`}
                >
                  <p className="text-xs font-medium text-muted mb-1">
                    Doesn&apos;t match any question
                  </p>
                  <p className="text-xs line-clamp-2">{a.transcribedText}</p>
                </button>
              ))}
            </>
          )}
        </div>

        <div className="overflow-y-auto bg-surface">
          <AnswerSheetViewer
            examId={result.id}
            regions={regions}
            emptyMessage={
              selected?.kind === "question"
                ? "This question was not answered on the answer sheet."
                : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}
