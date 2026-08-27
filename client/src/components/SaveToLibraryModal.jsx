import { useState } from "react";
import { X } from "lucide-react";

export default function SaveToLibraryModal({ open, defaultName, onCancel, onSave }) {
  const [name, setName] = useState(defaultName || "");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40" onClick={onCancel} />
      <div className="relative bg-card rounded-2xl shadow-xl border border-border w-full max-w-sm p-6">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface transition"
          aria-label="Close"
        >
          <X size={16} />
        </button>
        <h2 className="text-lg font-semibold mb-1">Save to My Library</h2>
        <p className="text-sm text-muted mb-4">
          Enter the student&apos;s name to save this graded exam for later.
        </p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Student name"
          className="w-full border border-border rounded-lg px-3 py-2 text-sm mb-5 focus:outline-none focus:border-accent"
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) onSave(name.trim());
          }}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-full px-4 py-2 text-sm font-medium text-muted hover:bg-surface transition"
          >
            Cancel
          </button>
          <button
            disabled={!name.trim()}
            onClick={() => onSave(name.trim())}
            className="rounded-full bg-accent text-white text-sm font-semibold px-5 py-2 disabled:opacity-40 hover:opacity-90 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
