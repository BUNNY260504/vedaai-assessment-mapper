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
  return (
    <div className="relative rounded-xl overflow-hidden border border-border bg-white">
      {pageLabel && (
        <div className="absolute top-2 left-2 z-10 bg-ink/80 text-white text-[11px] px-2 py-0.5 rounded-full">
          {pageLabel}
        </div>
      )}
      <img
        src={pageImageUrl(examId, side, page)}
        alt={`Page ${page + 1}`}
        className="w-full h-auto block"
      />
      {bbox && (
        <div
          className={`absolute border-2 rounded-sm transition-all duration-300 ${highlightClass}`}
          style={bboxToStyle(bbox)}
        />
      )}
    </div>
  );
}
