import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ListChecks,
  FileText,
  FileX,
  ChevronsDownUp,
  ChevronsUpDown,
  Save,
  Check,
  GripVertical,
} from "lucide-react";
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
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileTab, setMobileTab] = useState("questions");
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(0);
  const [scrollRequest, setScrollRequest] = useState(null);
  const scrollTokenRef = useRef(0);
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  const panelsRef = useRef(null);
  const resizeStateRef = useRef(null);
  const [panelWidth, setPanelWidth] = useState(380);
  const [resizing, setResizing] = useState(false);

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
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  }, [id]);

  function handleResizeStart(e) {
    e.preventDefault();
    resizeStateRef.current = { startX: e.clientX, startWidth: panelWidth };
    setResizing(true);
  }

  useEffect(() => {
    if (!resizing) return;
    const MIN_PANEL_WIDTH = 300;
    const MAX_PANEL_RATIO = 0.7;

    function onMove(e) {
      const dragState = resizeStateRef.current;
      if (!dragState || !panelsRef.current) return;
      const containerWidth = panelsRef.current.clientWidth;
      const maxWidth = containerWidth * MAX_PANEL_RATIO;
      const next = Math.min(
        maxWidth,
        Math.max(MIN_PANEL_WIDTH, dragState.startWidth + (e.clientX - dragState.startX))
      );
      setPanelWidth(next);
    }

    function onUp() {
      resizeStateRef.current = null;
      setResizing(false);
    }

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [resizing]);

  if (loading) {
    return <div className="p-8 text-center text-muted">Loading…</div>;
  }

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-10">
        <div className="w-14 h-14 rounded-full bg-surface border border-border flex items-center justify-center mb-4">
          <FileX size={22} className="text-muted" />
        </div>
        <p className="text-base font-semibold mb-1">This exam is no longer available</p>
        <p className="text-sm text-muted max-w-sm mb-5">
          Exam data isn&apos;t stored permanently — it&apos;s cleared after a couple of hours
          or whenever the server restarts. If this was saved in My Library, you can remove
          the stale entry there.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/library")}
            className="rounded-full bg-ink text-white text-sm font-semibold px-4 py-2 hover:opacity-90 transition"
          >
            Go to My Library
          </button>
          <button
            onClick={() => navigate("/upload")}
            className="rounded-full border border-border text-sm font-semibold px-4 py-2 hover:bg-surface transition"
          >
            Upload a new exam
          </button>
        </div>
      </div>
    );
  }

  const regions =
    selected?.kind === "question"
      ? selected.item.answer?.regions || []
      : selected?.item?.regions || [];
  const highlightStatus =
    selected?.kind === "question" ? selected.item.grading?.status : undefined;
  const isUnanswered = selected?.kind === "question" && regions.length === 0;

  function select(next) {
    setSelected(next);
    setMobileTab("answers");
  }

  function requestScrollToPage(page) {
    scrollTokenRef.current += 1;
    setScrollRequest({ page, token: scrollTokenRef.current });
    setCurrentPage(page);
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
    if (proceed) {
      proceed();
    } else {
      navigate("/library");
    }
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

      <div
        ref={panelsRef}
        className="flex-1 min-h-0 grid grid-cols-1 lg:flex"
        style={{ "--panel-width": `${panelWidth}px` }}
      >
        <div
          className={`${
            mobileTab === "answers" ? "hidden" : ""
          } lg:block border-r border-border overflow-y-auto p-4 flex-col gap-2 lg:flex lg:w-[var(--panel-width)] lg:shrink-0`}
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
          role="separator"
          aria-orientation="vertical"
          aria-label="Drag to resize panels"
          title="Drag to resize panels"
          onMouseDown={handleResizeStart}
          className="hidden lg:flex relative w-4 shrink-0 cursor-col-resize items-center justify-center group touch-none"
        >
          <div
            className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-px transition-colors ${
              resizing ? "bg-accent" : "bg-border group-hover:bg-accent/60"
            }`}
          />
          <div
            className={`relative z-10 w-5 h-14 rounded-full border flex items-center justify-center shadow-sm transition-colors ${
              resizing
                ? "bg-accent border-accent"
                : "bg-card border-border group-hover:border-accent/60 group-hover:bg-accent-soft/50"
            }`}
          >
            <GripVertical
              size={13}
              className={`transition-colors ${
                resizing ? "text-white" : "text-muted group-hover:text-accent"
              }`}
            />
          </div>
        </div>

        <div
          className={`${
            mobileTab === "questions" ? "hidden" : ""
          } lg:block lg:flex-1 lg:min-w-0 overflow-auto bg-surface`}
        >
          <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-ink">
            <span className="text-sm font-bold text-white truncate">Answer Sheet</span>
            <div className="flex items-center gap-3">
              <PageSlider
                page={currentPage}
                pageCount={result.answerPageCount}
                onChange={requestScrollToPage}
              />
              <ZoomControl zoom={zoom} onChange={setZoom} />
            </div>
          </div>
          <AnswerSheetViewer
            examId={result.id}
            pageCount={result.answerPageCount}
            regions={regions}
            status={highlightStatus}
            zoom={zoom}
            unanswered={isUnanswered}
            scrollRequest={scrollRequest}
            onVisiblePageChange={setCurrentPage}
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
