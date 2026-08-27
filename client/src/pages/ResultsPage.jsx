import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ListChecks, FileText } from "lucide-react";
import { getExamResult } from "../lib/api.js";
import QuestionListItem from "../components/QuestionListItem.jsx";
import AnswerSheetViewer from "../components/AnswerSheetViewer.jsx";
import SummaryBar from "../components/SummaryBar.jsx";

export default function ResultsPage() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(null); // { kind: 'question'|'unmatched', item }
  const [loading, setLoading] = useState(true);
  const [mobileTab, setMobileTab] = useState("questions"); // 'questions' | 'answers'

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

  function select(next) {
    setSelected(next);
    setMobileTab("answers");
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <SummaryBar summary={result.summary} />

      <div className="lg:hidden flex border-b border-border bg-card px-4 pt-2 gap-1">
        {[
          { key: "questions", label: "Questions", icon: ListChecks },
          { key: "answers", label: "Answer Sheet", icon: FileText },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setMobileTab(key)}
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 border-b-2 transition ${
              mobileTab === key
                ? "border-accent text-ink"
                : "border-transparent text-muted"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[380px_1fr]">
        <div
          className={`${
            mobileTab === "answers" ? "hidden" : ""
          } lg:block border-r border-border overflow-y-auto p-4 flex-col gap-2 lg:flex`}
        >
          <p className="text-xs font-medium text-muted uppercase tracking-wide px-1 mb-1">
            Questions ({result.questions.length})
          </p>
          {result.questions.map((q) => (
            <QuestionListItem
              key={q.id}
              question={q}
              active={selected?.kind === "question" && selected.item.id === q.id}
              onClick={() => select({ kind: "question", item: q })}
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
                  onClick={() => select({ kind: "unmatched", item: a })}
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

        <div
          className={`${
            mobileTab === "questions" ? "hidden" : ""
          } lg:block overflow-y-auto bg-surface`}
        >
          {selected?.kind === "question" && (
            <p className="lg:hidden text-xs font-medium text-muted px-4 pt-3">
              {selected.item.number}
            </p>
          )}
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
