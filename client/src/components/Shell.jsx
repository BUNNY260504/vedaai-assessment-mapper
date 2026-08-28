import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  FileText,
  ClipboardList,
  Library,
  Sparkles,
  ArrowLeft,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Home,
  HelpCircle,
  Bell,
  ChevronDown,
  Settings,
  Shield,
} from "lucide-react";
import { usePageActions } from "../lib/PageActionsContext.jsx";

const NAV = [
  { label: "Home", icon: LayoutGrid, to: "/" },
  { label: "My Classroom", icon: Users },
  { label: "Assignments", icon: FileText },
  { label: "Exams", icon: ClipboardList, to: "/upload" },
  { label: "My Library", icon: Library, to: "/library" },
];

const HEADER_LABELS = {
  "/": "Home",
  "/library": "My Library",
};

function isActive(to, pathname) {
  if (!to) return false;
  return to === "/" ? pathname === "/" : pathname.startsWith(to);
}

function backTargetFor(pathname) {
  if (pathname === "/") return null;
  if (pathname === "/upload" || pathname === "/library") return "/";
  return "/upload";
}

function helpTextFor(pathname) {
  if (pathname === "/") {
    return "This is the home screen. Click \"Upload Question Paper & Answer Sheet\" to grade a new exam.";
  }
  if (pathname === "/upload") {
    return "Upload a question paper and a student's answer sheet (PDF or images), then click Start Mapping to begin AI extraction.";
  }
  if (pathname === "/library") {
    return "Exams you've saved show up here. Click any entry to reopen its graded results.";
  }
  if (/^\/exams\/[^/]+\/processing$/.test(pathname)) {
    return "VedaAI is extracting questions, matching the answer sheet to them, and grading each one — this usually takes under a minute.";
  }
  if (/^\/exams\/[^/]+$/.test(pathname)) {
    return "Click a question on the left to highlight where its answer appears on the right. Use Save to add this result to My Library.";
  }
  return "VedaAI helps you extract, map, and grade handwritten answer sheets with AI.";
}

function LogoMark() {
  return (
    <div className="w-8 h-8 shrink-0 rounded-lg bg-ink flex items-center justify-center text-white font-bold text-sm">
      V
    </div>
  );
}

function NavContent({ collapsed, pathname, onNavigate }) {
  return (
    <>
      <button
        title={collapsed ? "AI Teacher's Toolkit" : undefined}
        className={`flex items-center justify-center gap-2 rounded-full border border-accent/40 bg-ink text-white text-sm font-medium mb-6 hover:opacity-90 transition ${
          collapsed ? "w-10 h-10 mx-auto" : "w-full py-2.5"
        }`}
      >
        <Sparkles size={16} className="text-accent shrink-0" />
        {!collapsed && "AI Teacher's Toolkit"}
      </button>
      <nav className="flex flex-col gap-1">
        {NAV.map(({ label, icon: Icon, to }) => {
          const active = isActive(to, pathname);
          const className = `flex items-center rounded-xl text-sm font-bold ${
            collapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3 py-2.5"
          } ${
            active
              ? "bg-ink text-white"
              : `text-ink ${to ? "hover:bg-surface/70 cursor-pointer" : "cursor-default"}`
          }`;
          const content = (
            <>
              <Icon size={18} className="shrink-0" />
              {!collapsed && label}
            </>
          );
          return to ? (
            <Link
              key={label}
              to={to}
              onClick={onNavigate}
              title={collapsed ? label : undefined}
              className={className}
            >
              {content}
            </Link>
          ) : (
            <div key={label} title={collapsed ? label : undefined} className={className}>
              {content}
            </div>
          );
        })}
      </nav>

      <div className="mt-auto pt-4">
        <div
          title={collapsed ? "Settings" : undefined}
          className={`flex items-center rounded-xl text-sm font-bold text-ink hover:bg-surface/70 cursor-pointer mb-2 ${
            collapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3 py-2.5"
          }`}
        >
          <Settings size={18} className="shrink-0" />
          {!collapsed && "Settings"}
        </div>
        <div
          title={collapsed ? "Delhi Public School, Bokaro Steel City" : undefined}
          className={`bg-surface rounded-2xl ${
            collapsed ? "p-2 flex justify-center" : "flex items-center gap-3 p-3"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-white border-2 border-emerald-600 flex items-center justify-center shrink-0">
            <Shield size={18} className="text-emerald-700" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">Delhi Public School</p>
              <p className="text-xs text-muted truncate">Bokaro Steel City</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function Shell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const backTarget = backTargetFor(location.pathname);
  const headerLabel = HEADER_LABELS[location.pathname] || "Exams";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { headerAction, backGuard, hasNotification } = usePageActions();

  function handleBack() {
    if (backGuard) {
      backGuard(() => navigate(backTarget));
    } else {
      navigate(backTarget);
    }
  }

  return (
    <div className="h-screen flex bg-surface overflow-hidden">
      <aside
        className={`hidden md:flex shrink-0 flex-col border-r border-border bg-card py-5 transition-[width] duration-200 ${
          collapsed ? "w-20 px-2" : "w-64 px-4"
        }`}
      >
        <div
          className={`flex items-center mb-6 ${
            collapsed ? "justify-center" : "justify-between px-2"
          }`}
        >
          <Link to="/" className="flex items-center gap-2 min-w-0" aria-label="Go to home page">
            <LogoMark />
            {!collapsed && (
              <span className="font-semibold text-lg tracking-tight truncate">VedaAI</span>
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="w-7 h-7 shrink-0 flex items-center justify-center rounded-md text-muted hover:bg-surface hover:text-ink transition"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>
        <NavContent collapsed={collapsed} pathname={location.pathname} />
        {collapsed && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="mt-3 w-10 h-10 mx-auto shrink-0 flex items-center justify-center rounded-md text-muted hover:bg-surface hover:text-ink transition"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen size={16} />
          </button>
        )}
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-card px-4 py-5 flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <Link
                to="/"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-2"
                aria-label="Go to home page"
              >
                <LogoMark />
                <span className="font-semibold text-lg tracking-tight">VedaAI</span>
              </Link>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface transition"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <NavContent
              collapsed={false}
              pathname={location.pathname}
              onNavigate={() => setDrawerOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-4 md:px-6 py-4 border-b border-border bg-card">
          {backTarget ? (
            <button
              onClick={handleBack}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-surface hover:bg-border transition"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <Home size={18} className="text-muted" />
          )}
          <span className="text-ink font-bold flex-1">{headerLabel}</span>

          {headerAction}

          <div className="hidden md:flex items-center gap-2">
            <div className="relative group">
              <button
                className="w-9 h-9 rounded-full bg-surface hover:bg-border flex items-center justify-center transition"
                aria-label="Help"
              >
                <HelpCircle size={18} className="text-ink" />
              </button>
              <div className="pointer-events-none absolute right-0 top-full mt-2 w-64 origin-top-right scale-95 opacity-0 transition-all duration-150 group-hover:scale-100 group-hover:opacity-100 z-20">
                <div className="bg-ink text-white text-xs leading-relaxed rounded-lg px-3 py-2.5 shadow-lg">
                  {helpTextFor(location.pathname)}
                </div>
              </div>
            </div>
            <div className="relative group">
              <button
                onClick={() => navigate("/library")}
                className="relative w-9 h-9 rounded-full bg-surface hover:bg-border flex items-center justify-center transition"
                aria-label="Notifications"
              >
                <Bell size={18} className="text-ink" />
                {hasNotification && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                )}
              </button>
              <div className="pointer-events-none absolute right-0 top-full mt-2 w-64 origin-top-right scale-95 opacity-0 transition-all duration-150 group-hover:scale-100 group-hover:opacity-100 z-20">
                <div className="bg-ink text-white text-xs leading-relaxed rounded-lg px-3 py-2.5 shadow-lg">
                  {hasNotification
                    ? "You have a new save. Click to view it in My Library."
                    : "Notifications about saved exams show up here. Click to open My Library."}
                </div>
              </div>
            </div>
            <button
              className="w-9 h-9 rounded-full bg-surface hover:bg-border flex items-center justify-center transition"
              aria-label="AI Assistant"
            >
              <Sparkles size={18} className="text-ink" />
            </button>
            <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-border">
              <div className="w-7 h-7 rounded-full bg-ink flex items-center justify-center text-white text-[11px] font-semibold shrink-0">
                MR
              </div>
              <span className="text-sm font-medium text-ink whitespace-nowrap">
                Madhukar Reddy
              </span>
              <ChevronDown size={16} className="text-muted" />
            </div>
          </div>

          <button
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface transition md:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </header>

        <main className="flex-1 min-h-0">{children}</main>
      </div>
    </div>
  );
}
