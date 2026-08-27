import { useEffect, useRef } from "react";
import { pageImageUrl } from "../lib/api.js";

// bbox is [ymin, xmin, ymax, xmax] normalized 0-1000 (Gemini spatial convention)
function bboxToStyle(bbox) {
  const [ymin, xmin, ymax, xmax] = bbox;
  return {
    top: `${ymin / 10}%`,
    left: `${xmin / 10}%`,
    width: `${(xmax - xmin) / 10}%`,
    height: `${(ymax - ymin) / 10}%`,
  };
}

const HIGHLIGHT_STYLES = {
  correct: "border-emerald-500 bg-emerald-500/15",
  partial: "border-amber-500 bg-amber-500/15",
  incorrect: "border-red-500 bg-red-500/15",
  neutral: "border-accent bg-accent/15",
};

export default function PageWithHighlight({ examId, side, page, bbox, pageLabel, status }) {
  const highlightClass = HIGHLIGHT_STYLES[status] || HIGHLIGHT_STYLES.neutral;
  const highlightRef = useRef(null);
  const imgRef = useRef(null);
  const bboxKey = bbox ? bbox.join(",") : null;

  function scrollHighlightIntoView() {
    const el = highlightRef.current;
    const container = el?.closest(".overflow-auto, .overflow-y-auto, .overflow-scroll");
    if (!el || !container) return;
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const deltaY =
      elRect.top + elRect.height / 2 - (containerRect.top + containerRect.height / 2);
    const deltaX =
      elRect.left + elRect.width / 2 - (containerRect.left + containerRect.width / 2);
    container.scrollBy({ top: deltaY, left: deltaX, behavior: "instant" });
  }

  useEffect(() => {
    if (bboxKey && imgRef.current?.complete) {
      scrollHighlightIntoView();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bboxKey, page]);

  return (
    // No overflow-hidden here: browsers treat it as a scroll-container candidate,
    // which can hijack scroll targeting on the highlight below. Corner clipping is
    // done on the inner img wrapper instead.
    <div className="relative rounded-xl border border-border bg-white">
      {pageLabel && (
        <div className="absolute top-2 left-2 z-10 bg-ink/80 text-white text-[11px] px-2 py-0.5 rounded-full">
          {pageLabel}
        </div>
      )}
      <div className="rounded-xl overflow-hidden">
        <img
          ref={imgRef}
          src={pageImageUrl(examId, side, page)}
          alt={`Page ${page + 1}`}
          className="w-full h-auto block"
          onLoad={() => {
            if (bboxKey) scrollHighlightIntoView();
          }}
        />
      </div>
      {bbox && (
        <div
          ref={highlightRef}
          // Position changes snap instantly (no transition) so scroll-into-view math
          // always measures the final, settled position rather than a mid-animation
          // frame. Only the correctness color fades smoothly.
          className={`absolute border-2 rounded-sm transition-colors duration-300 ${highlightClass}`}
          style={bboxToStyle(bbox)}
        />
      )}
    </div>
  );
}
