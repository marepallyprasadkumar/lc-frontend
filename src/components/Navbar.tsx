import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCurrentUser, logout } from "@/lib/auth";
import { getProblems } from "@/lib/api";

const navLinks = [
  { to: "/", label: "Explore" },
  { to: "/problems", label: "Problems" },
  { to: "/company-assessment", label: "Company Assessments" },
  { to: "/contest", label: "Contest" },
  { to: "/discuss", label: "Discuss" },
] as const;

type SearchProblem = {
  id: number;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags?: string[];
};

const difficultyColor: Record<string, string> = {
  Easy: "text-easy",
  Medium: "text-medium",
  Hard: "text-hard",
};

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [problems, setProblems] = useState<SearchProblem[]>([]);
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const onStorage = () => setUser(getCurrentUser());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getProblems()
      .then((data) => {
        if (!cancelled) setProblems(data as SearchProblem[]);
      })
      .catch(() => {
        if (!cancelled) setProblems([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const results = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return problems
      .filter((problem) => {
        const searchable = [
          problem.title,
          problem.slug,
          problem.difficulty,
          ...(problem.tags || []),
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);
      })
      .slice(0, 6);
  }, [searchQuery, problems]);

  const goToProblem = (problem: SearchProblem) => {
    setSearchQuery("");
    setSearchOpen(false);
    navigate({ to: "/problems/$problemId", params: { problemId: problem.slug } });
  };

  const onSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    const first = results[0];
    if (first) goToProblem(first);
  };

  const onLogout = () => {
    logout();
    setUser(null);
    navigate({ to: "/" });
  };

  return (
    <nav className="sticky top-0 z-50 flex h-12 items-center border-b border-nav-border bg-nav px-4">
      <Link to="/" className="mr-6 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M8 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 13h-8" strokeLinecap="round" />
          </svg>
        </div>
        <span className="text-sm font-bold tracking-tight text-foreground">Coding Platform</span>
      </Link>

      <div className="flex items-center gap-1">
        {navLinks.map((link) => {
          const isActive = link.to === "/" ? location.pathname === "/" : location.pathname.startsWith(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div ref={searchRef} className="relative">
          <form onSubmit={onSearchSubmit}>
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search problems..."
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSearchOpen(true);
              }}
              className="h-8 w-64 rounded-md border border-border bg-input pl-8 pr-8 text-xs text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchOpen(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </form>

          {searchOpen && searchQuery.trim() && (
            <div className="absolute right-0 top-10 w-96 overflow-hidden rounded-md border border-border bg-card shadow-xl shadow-black/25">
              {results.length > 0 ? (
                <div className="py-1">
                  {results.map((problem) => (
                    <button
                      key={problem.slug}
                      onClick={() => goToProblem(problem)}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-surface-hover"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {problem.id}. {problem.title}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {(problem.tags || []).slice(0, 3).join(" - ") || "Coding problem"}
                        </p>
                      </div>
                      <span className={`shrink-0 text-xs font-semibold ${difficultyColor[problem.difficulty] || "text-muted-foreground"}`}>
                        {problem.difficulty}
                      </span>
                    </button>
                  ))}
                  <div className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
                    Press Enter to open the first result.
                  </div>
                </div>
              ) : (
                <div className="px-3 py-4 text-sm text-muted-foreground">
                  No problems found for "{searchQuery.trim()}".
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
            Dashboard
          </Link>

          {user ? (
            <>
              <span className="text-xs text-muted-foreground">{user.username}</span>
              <button
                onClick={onLogout}
                className="rounded-md border border-border px-3 py-1.5 text-[13px] font-semibold text-foreground"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              search={{ next: location.pathname }}
              className="rounded-md bg-primary px-3.5 py-1.5 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
