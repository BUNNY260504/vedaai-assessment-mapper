import { Minus, Plus } from "lucide-react";

const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const STEP = 10;

const OPTIONS = [];
for (let z = MIN_ZOOM; z <= MAX_ZOOM; z += STEP) OPTIONS.push(z);

export default function ZoomControl({ zoom, onChange }) {
  const clamp = (v) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v));

  return (
    <div className="flex items-center gap-1 bg-white/10 border border-white/15 rounded-full px-1 py-1 text-white">
      <button
        onClick={() => onChange(clamp(zoom - STEP))}
        disabled={zoom <= MIN_ZOOM}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent transition"
        aria-label="Zoom out"
      >
        <Minus size={14} />
      </button>

      <select
        value={zoom}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className="text-xs font-medium bg-transparent text-white px-1 py-1 rounded-md hover:bg-white/15 focus:outline-none cursor-pointer appearance-none text-center [color-scheme:dark]"
        aria-label="Zoom level"
      >
        {OPTIONS.map((z) => (
          <option key={z} value={z} className="text-ink">
            {z}%
          </option>
        ))}
      </select>

      <button
        onClick={() => onChange(clamp(zoom + STEP))}
        disabled={zoom >= MAX_ZOOM}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent transition"
        aria-label="Zoom in"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
