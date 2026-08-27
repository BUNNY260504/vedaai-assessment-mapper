import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ListChecks, FileText, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { getExamResult } from "../lib/api.js";
import QuestionListItem from "../components/QuestionListItem.jsx";
import AnswerSheetViewer from "../components/AnswerSheetViewer.jsx";
import SummaryBar from "../components/SummaryBar.jsx";
import ZoomControl from "../components/ZoomControl.jsx";
import PageSlider from "../components/PageSlider.jsx";

export default function ResultsPage() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(null); // { kind: 'question'|'unmatched', item }
  const [loading, setLoading] = useState(true);
  const [mobileTab, setMobileTab] = useState("questions"); // 'questions' | 'answers'
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(0);
  const [manualPage, setManualPage] = useState(false);
  const [expandedIds, setExpandedIds] = useState(() => new Set());

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

  // Jump the page viewer to wherever the newly selected answer lives.
  useEffect(() => {
    if (!selected) return;
    const regs =
      selected.kind === "question"
        ? selected.item.answer?.regions || []
        : selected.item?.regions || [];
    setCurrentPage(regs[0]?.page ?? 0);
    setManualPage(false);
  }, [selected]);

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
  const highlightStatus =
    selected?.kind === "question" ? selected.item.grading?.status : undefined;
  const currentRegion = regions.find((r) => r.page === currentPage);
  const isUnanswered = selected?.kind === "question" && regions.length === 0 && !manualPage;

  let note;
  if (selected?.kind === "question" && regions.length === 0 && manualPage) {
    note = "This question has no matched answer — you're browsing the answer sheet manually.";
  } else if (regions.length > 1) {
    note = `This answer spans ${regions.length} pages — use the page navigator to see every part.`;
  }

  function select(next) {
    setSelected(next);
    setMobileTab("answers");
  }

  function toggleExpand(qid) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(qid) ? next.delete(qid) : next.add(qid);
      return next;
    });
  }

  const expandableIds = result.questions.filter((q) => q.grading?.feedback).map((q) => q.id);
  const allExpanded =
    expandableIds.length > 0 && expandableIds.every((qid) => expandedIds.has(qid));

  function toggleExpandAll() {
    setExpandedIds(allExpanded ? new Set() : new Set(expandableIds));
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
          <div className="flex items-center justify-between gap-2 px-1 mb-1">
            <p className="text-xs font-bold text-muted uppercase tracking-wide">
              Questions Extracted ({result.questions.length})
            </p>
            {expandableIds.length > 0 && (
              <button
                onClick={toggleExpandAll}
                className="flex items-center gap-1 text-[11px] font-medium text-muted hover:text-ink transition shrink-0"
              >
                {allExpanded ? <ChevronsDownUp size={12} /> : <ChevronsUpDown size={12} />}
                {allExpanded ? "Collapse all" : "Expand all"}
              </button>
            )}
          </div>
          {result.questions.map((q) => (
            <QuestionListItem
              key={q.id}
              question={q}
              active={selected?.kind === "question" && selected.item.id === q.id}
              expanded={expandedIds.has(q.id)}
              onClick={() => select({ kind: "question", item: q })}
              onToggleExpand={() => toggleExpand(q.id)}
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
                      ? "border-accent bg-card"
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
          } lg:block overflow-auto bg-surface`}
        >
          <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-ink">
            <span className="text-xs font-medium text-white/80 truncate">
              {selected?.kind === "question" ? selected.item.number : "Unmatched answer"}
            </span>
            <div className="flex items-center gap-3">
              <PageSlider
                page={currentPage}
                pageCount={result.answerPageCount}
                onChange={(p) => {
                  setCurrentPage(p);
                  setManualPage(true);
                }}
              />
              <ZoomControl zoom={zoom} onChange={setZoom} />
            </div>
          </div>
          <AnswerSheetViewer
            examId={result.id}
            page={currentPage}
            bbox={currentRegion?.bbox}
            status={highlightStatus}
            zoom={zoom}
            note={note}
            unanswered={isUnanswered}
          />
        </div>
      </div>
    </div>
  );
}
