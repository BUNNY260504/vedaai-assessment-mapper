import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  FileText,
  ClipboardList,
  Library,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

const NAV = [
  { label: "Home", icon: LayoutGrid },
  { label: "My Classroom", icon: Users },
  { label: "Assignments", icon: FileText },
  { label: "Exams", icon: ClipboardList, active: true },
  { label: "My Library", icon: Library },
];

export default function Shell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const showBack = location.pathname !== "/";

  return (
    <div className="min-h-screen flex bg-surface">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-card px-4 py-5">
        <div className="flex items-center gap-2 px-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center text-white font-bold text-sm">
            V
          </div>
          <span className="font-semibold text-lg tracking-tight">VedaAI</span>
        </div>

        <button className="flex items-center gap-2 justify-center rounded-full border border-accent/40 bg-ink text-white text-sm font-medium py-2.5 mb-6 hover:opacity-90 transition">
          <Sparkles size={16} className="text-accent" />
          AI Teacher&apos;s Toolkit
        </button>

        <nav className="flex flex-col gap-1">
          {NAV.map(({ label, icon: Icon, active }) => (
            <div
              key={label}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer ${
                active
                  ? "bg-surface font-medium text-ink"
                  : "text-muted hover:bg-surface/70"
              }`}
            >
              <Icon size={18} />
              {label}
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-6 py-4 border-b border-border bg-card">
          {showBack ? (
            <button
              onClick={() => navigate("/")}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-surface hover:bg-border transition"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <ClipboardList size={18} className="text-muted" />
          )}
          <span className="text-muted font-medium">Exams</span>
        </header>

        <main className="flex-1 min-h-0">{children}</main>
      </div>
    </div>
  );
}
