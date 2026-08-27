import { Minus, Plus } from "lucide-react";

const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const STEP = 10;

const OPTIONS = [];
for (let z = MIN_ZOOM; z <= MAX_ZOOM; z += STEP) OPTIONS.push(z);

export default function ZoomControl({ zoom, onChange }) {
  const clamp = (v) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v));

  return (
    <div className="flex items-center gap-1 bg-card border border-border rounded-full px-1 py-1">
      <button
        onClick={() => onChange(clamp(zoom - STEP))}
        disabled={zoom <= MIN_ZOOM}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface disabled:opacity-30 disabled:hover:bg-transparent transition"
        aria-label="Zoom out"
      >
        <Minus size={14} />
      </button>

      <select
        value={zoom}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className="text-xs font-medium bg-transparent px-1 py-1 rounded-md hover:bg-surface focus:outline-none cursor-pointer appearance-none text-center"
        aria-label="Zoom level"
      >
        {OPTIONS.map((z) => (
          <option key={z} value={z}>
            {z}%
          </option>
        ))}
      </select>

      <button
        onClick={() => onChange(clamp(zoom + STEP))}
        disabled={zoom >= MAX_ZOOM}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface disabled:opacity-30 disabled:hover:bg-transparent transition"
        aria-label="Zoom in"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
