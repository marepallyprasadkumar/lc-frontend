import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CodeArena — Master Coding Challenges" },
      { name: "description", content: "Practice algorithms, data structures, and coding interviews with CodeArena." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Over 2,500+ problems available
        </div>

        <h1 className="text-5xl font-bold leading-tight tracking-tight text-foreground">
          A Better Way to <br />
          <span className="text-primary">Prepare for Coding Interviews</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground">
          Solve curated problems, track your progress, and sharpen your skills
          across algorithms, data structures, and system design.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            to="/problems"
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
          >
            Start Solving
          </Link>
          <Link
            to="/problems"
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
          >
            Explore Problems
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-24 grid grid-cols-3 gap-6">
        {[
          { label: "Problems", value: "2,500+", sub: "Across all difficulty levels" },
          { label: "Active Users", value: "150K+", sub: "Growing community" },
          { label: "Submissions", value: "10M+", sub: "Solutions submitted daily" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-6 text-center transition-colors hover:border-primary/30">
            <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            <div className="mt-1 text-sm font-medium text-primary">{stat.label}</div>
            <div className="mt-1 text-xs text-muted-foreground">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="mt-20 grid grid-cols-3 gap-6">
        {[
          { icon: "📝", title: "Rich Problem Set", desc: "Curated problems from easy to hard covering all major topics." },
          { icon: "⚡", title: "Instant Feedback", desc: "Run code and get results instantly with our powerful judge." },
          { icon: "📊", title: "Track Progress", desc: "Detailed stats and streaks to keep you motivated." },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30">
            <div className="text-2xl">{f.icon}</div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">{f.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
