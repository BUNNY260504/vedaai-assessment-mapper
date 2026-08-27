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
} from "lucide-react";

const NAV = [
  { label: "Home", icon: LayoutGrid, to: "/" },
  { label: "My Classroom", icon: Users },
  { label: "Assignments", icon: FileText },
  { label: "Exams", icon: ClipboardList, to: "/upload" },
  { label: "My Library", icon: Library },
];

function isActive(to, pathname) {
  if (!to) return false;
  return to === "/" ? pathname === "/" : pathname.startsWith(to);
}

function backTargetFor(pathname) {
  if (pathname === "/") return null;
  if (pathname === "/upload") return "/";
  return "/upload"; // processing / results pages
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
          const className = `flex items-center rounded-xl text-sm ${
            collapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3 py-2.5"
          } ${
            active
              ? "bg-ink text-white font-medium"
              : `text-muted ${to ? "hover:bg-surface/70 cursor-pointer" : "cursor-default"}`
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
    </>
  );
}

export default function Shell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const backTarget = backTargetFor(location.pathname);
  const headerLabel = location.pathname === "/" ? "Home" : "Exams";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen flex bg-surface overflow-hidden">
      <aside
        className={`hidden md:flex shrink-0 flex-col border-r border-border bg-card py-5 transition-[width] duration-200 ${
          collapsed ? "w-20 px-2" : "w-64 px-4"
        }`}
      >
        <div
          className={`flex items-center mb-6 ${
            collapsed ? "flex-col gap-2" : "justify-between px-2"
          }`}
        >
          <Link to="/" className="flex items-center gap-2 min-w-0" aria-label="Go to home page">
            <LogoMark />
            {!collapsed && (
              <span className="font-semibold text-lg tracking-tight truncate">VedaAI</span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="w-7 h-7 shrink-0 flex items-center justify-center rounded-md text-muted hover:bg-surface hover:text-ink transition"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>
        <NavContent collapsed={collapsed} pathname={location.pathname} />
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
              onClick={() => navigate(backTarget)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-surface hover:bg-border transition"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <Home size={18} className="text-muted" />
          )}
          <span className="text-muted font-medium flex-1">{headerLabel}</span>
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
