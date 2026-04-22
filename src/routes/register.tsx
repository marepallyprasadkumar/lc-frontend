import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Sign Up — CodeArena" },
      { name: "description", content: "Create your CodeArena account." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-border bg-card p-8">
          <h1 className="text-xl font-bold text-foreground">Create account</h1>
          <p className="mt-1 text-xs text-muted-foreground">Start your coding journey today</p>

          <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/50"
                placeholder="codearena_user"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/50"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/50"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
