import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "@/lib/auth";

const navLinks = [
  { to: "/", label: "Explore" },
  { to: "/problems", label: "Problems" },
  { to: "/contest", label: "Contest" },
  { to: "/discuss", label: "Discuss" },
] as const;

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const onStorage = () => setUser(getCurrentUser());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

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
        <span className="text-sm font-bold tracking-tight text-foreground">CodeArena</span>
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
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-52 rounded-md border border-border bg-input pl-8 pr-3 text-xs text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/50"
          />
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
