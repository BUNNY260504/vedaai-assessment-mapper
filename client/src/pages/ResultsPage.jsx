import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ListChecks, FileText, ChevronsDownUp, ChevronsUpDown, Save, Check } from "lucide-react";
import { getExamResult } from "../lib/api.js";
import QuestionListItem from "../components/QuestionListItem.jsx";
import AnswerSheetViewer from "../components/AnswerSheetViewer.jsx";
import SummaryBar from "../components/SummaryBar.jsx";
import ZoomControl from "../components/ZoomControl.jsx";
import PageSlider from "../components/PageSlider.jsx";
import SaveToLibraryModal from "../components/SaveToLibraryModal.jsx";
import { usePageActions } from "../lib/PageActionsContext.jsx";
import { findLibraryEntry, saveToLibrary } from "../lib/library.js";

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

  const existingEntry = findLibraryEntry(id);
  const [saved, setSaved] = useState(!!existingEntry);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const pendingProceedRef = useRef(null);
  const { setHeaderAction, setBackGuard, markNotified } = usePageActions();

  const extractionDone = result?.status === "done";

  useEffect(() => {
    if (!extractionDone) {
      setHeaderAction(null);
      setBackGuard(null);
      return;
    }
    setHeaderAction(
      <button
        onClick={() => setShowSaveModal(true)}
        className="flex items-center gap-1.5 rounded-lg bg-accent text-white text-sm font-semibold px-4 py-2 hover:opacity-90 transition"
      >
        {saved ? <Check size={15} /> : <Save size={15} />}
        {saved ? "Saved" : "Save"}
      </button>
    );
    setBackGuard((proceed) => {
      if (saved) {
        proceed();
        return;
      }
      pendingProceedRef.current = proceed;
      setShowSaveModal(true);
    });
    return () => {
      setHeaderAction(null);
      setBackGuard(null);
    };
  }, [extractionDone, saved, setHeaderAction, setBackGuard]);

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

  function handleSave(studentName) {
    saveToLibrary({ examId: result.id, studentName, summary: result.summary });
    setSaved(true);
    markNotified();
    setShowSaveModal(false);
    const proceed = pendingProceedRef.current;
    pendingProceedRef.current = null;
    if (proceed) proceed();
  }

  function handleCancelSave() {
    setShowSaveModal(false);
    pendingProceedRef.current = null;
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <SummaryBar summary={result.summary} />

      <div className="lg:hidden bg-card border-b border-border px-4 py-2.5">
        <div className="flex bg-surface rounded-full p-1 gap-1">
          {[
            { key: "questions", label: "Questions", icon: ListChecks },
            { key: "answers", label: "Answer Sheet", icon: FileText },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setMobileTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium rounded-full py-2 transition ${
                mobileTab === key
                  ? "bg-card text-ink shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[380px_1fr]">
        <div
          className={`${
            mobileTab === "answers" ? "hidden" : ""
          } lg:block border-r border-border overflow-y-auto p-4 flex-col gap-2 lg:flex`}
        >
          <div className="flex items-center justify-between gap-2 bg-card border border-border rounded-xl px-3 py-2.5 mb-3">
            <div className="flex items-center gap-1.5 min-w-0">
              <ListChecks size={14} className="text-accent shrink-0" />
              <p className="text-xs font-bold text-ink uppercase tracking-wide truncate">
                Questions Extracted ({result.questions.length})
              </p>
            </div>
            {expandableIds.length > 0 && (
              <button
                onClick={toggleExpandAll}
                className="flex items-center gap-1.5 text-xs font-medium text-ink bg-surface border border-border rounded-full px-3 py-1.5 hover:border-accent/50 hover:bg-accent-soft/40 transition shrink-0"
              >
                {allExpanded ? <ChevronsDownUp size={13} /> : <ChevronsUpDown size={13} />}
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
              <p className="text-xs font-bold text-ink uppercase tracking-wide px-1 mt-4 mb-2">
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

      <SaveToLibraryModal
        open={showSaveModal}
        defaultName={existingEntry?.studentName || ""}
        onCancel={handleCancelSave}
        onSave={handleSave}
      />
    </div>
  );
}
