import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PageSlider({ page, pageCount, onChange }) {
  if (!pageCount || pageCount <= 1) return null;

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onChange(Math.max(0, page - 1))}
        disabled={page <= 0}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface disabled:opacity-30 disabled:hover:bg-transparent transition"
        aria-label="Previous page"
      >
        <ChevronLeft size={15} />
      </button>

      <input
        type="range"
        min={0}
        max={pageCount - 1}
        value={page}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 sm:w-28 accent-accent cursor-pointer"
        aria-label="Answer sheet page"
      />

      <span className="text-xs font-medium text-muted w-14 text-center shrink-0">
        Page {page + 1}/{pageCount}
      </span>

      <button
        onClick={() => onChange(Math.min(pageCount - 1, page + 1))}
        disabled={page >= pageCount - 1}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface disabled:opacity-30 disabled:hover:bg-transparent transition"
        aria-label="Next page"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}
