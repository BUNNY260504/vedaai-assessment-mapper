import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PageSlider({ page, pageCount, onChange }) {
  if (!pageCount || pageCount <= 1) return null;

  return (
    <div className="flex items-center gap-1 bg-white/10 border border-white/15 rounded-full px-1 py-1 text-white">
      <button
        onClick={() => onChange(Math.max(0, page - 1))}
        disabled={page <= 0}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent transition"
        aria-label="Previous page"
      >
        <ChevronLeft size={15} />
      </button>

      <span className="text-xs font-bold px-1 whitespace-nowrap">
        Page {page + 1} of {pageCount}
      </span>

      <button
        onClick={() => onChange(Math.min(pageCount - 1, page + 1))}
        disabled={page >= pageCount - 1}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent transition"
        aria-label="Next page"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}
