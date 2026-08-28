import { useEffect, useRef } from "react";
import { FileX } from "lucide-react";
import PageWithHighlight from "./PageWithHighlight.jsx";

export default function AnswerSheetViewer({
  examId,
  pageCount,
  regions,
  status,
  zoom = 100,
  unanswered,
  scrollRequest,
  onVisiblePageChange,
}) {
  const wrapperRef = useRef(null);
  const pageElsRef = useRef({});

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const root = wrapper?.closest(".overflow-auto, .overflow-y-auto, .overflow-scroll");
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let best = null;
        for (const entry of entries) {
          if (entry.isIntersecting && (!best || entry.intersectionRatio > best.intersectionRatio)) {
            best = entry;
          }
        }
        if (best) {
          const idx = Number(best.target.dataset.page);
          if (!Number.isNaN(idx)) onVisiblePageChange?.(idx);
        }
      },
      { root, threshold: [0.25, 0.5, 0.75] }
    );

    Object.values(pageElsRef.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [pageCount]);

  useEffect(() => {
    if (!scrollRequest) return;
    const el = pageElsRef.current[scrollRequest.page];
    el?.scrollIntoView({ behavior: "instant", block: "start" });
  }, [scrollRequest?.token]);

  const pages = Array.from({ length: pageCount || 0 }, (_, i) => i);

  return (
    <div ref={wrapperRef} className="flex flex-col gap-4 p-4">
      {unanswered && (
        <div className="flex items-center gap-3 bg-card border-2 border-dashed border-border rounded-xl px-4 py-3.5">
          <div className="w-9 h-9 rounded-full bg-surface flex items-center justify-center shrink-0">
            <FileX size={18} className="text-muted" />
          </div>
          <div>
            <p className="text-sm font-bold text-ink">Question not answered by the student</p>
            <p className="text-xs text-muted mt-0.5">
              No matching answer was found on the sheet — scroll below to check manually.
            </p>
          </div>
        </div>
      )}
      {pages.map((p) => {
        const region = regions.find((r) => r.page === p);
        return (
          <div
            key={p}
            data-page={p}
            ref={(el) => {
              if (el) pageElsRef.current[p] = el;
              else delete pageElsRef.current[p];
            }}
            className="shrink-0"
            style={{ width: `${zoom}%` }}
          >
            <PageWithHighlight
              examId={examId}
              side="answer"
              page={p}
              bbox={region?.bbox}
              pageLabel={`Page ${p + 1}`}
              status={status}
            />
          </div>
        );
      })}
    </div>
  );
}
