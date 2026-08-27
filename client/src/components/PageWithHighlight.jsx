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

export default function PageWithHighlight({ examId, side, page, bbox, pageLabel }) {
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
          className="absolute border-2 border-accent bg-accent/15 rounded-sm transition-all duration-300"
          style={bboxToStyle(bbox)}
        />
      )}
    </div>
  );
}
