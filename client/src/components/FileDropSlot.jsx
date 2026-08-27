import { useRef } from "react";
import { FileText, X, UploadCloud, Image as ImageIcon } from "lucide-react";

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function FileDropSlot({ label, accept, files, onChange }) {
  const inputRef = useRef(null);

  function addFiles(fileList) {
    const incoming = Array.from(fileList);
    onChange([...files, ...incoming]);
  }

  function removeFile(index) {
    onChange(files.filter((_, i) => i !== index));
  }

  function handleDrop(e) {
    e.preventDefault();
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }

  return (
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-ink mb-2">{label}</p>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-2xl bg-card p-4 flex flex-col gap-2 cursor-pointer hover:border-accent/50 transition min-h-32"
      >
        {files.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center gap-2 py-6 text-muted">
            <UploadCloud size={22} />
            <span className="text-sm">Click or drag files here</span>
            <span className="text-xs">PDF, JPG or PNG</span>
          </div>
        )}
        {files.map((f, i) => (
          <div
            key={`${f.name}-${i}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-3 bg-surface rounded-xl px-3 py-2.5"
          >
            <div className="w-9 h-9 rounded-lg bg-accent-soft flex items-center justify-center shrink-0">
              {f.type === "application/pdf" ? (
                <FileText size={16} className="text-accent" />
              ) : (
                <ImageIcon size={16} className="text-accent" />
              )}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-medium truncate">{f.name}</p>
              <p className="text-xs text-muted">{formatSize(f.size)}</p>
            </div>
            <button
              onClick={() => removeFile(i)}
              className="w-6 h-6 rounded-full bg-border/70 hover:bg-border flex items-center justify-center shrink-0"
              aria-label={`Remove ${f.name}`}
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
