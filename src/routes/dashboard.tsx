import { createFileRoute } from "@tanstack/react-router";
import { problems } from "@/lib/problems-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — CodeArena" },
      { name: "description", content: "Track your coding progress and statistics." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const solved = problems.filter((p) => p.status === "solved");
  const easySolved = solved.filter((p) => p.difficulty === "Easy").length;
  const medSolved = solved.filter((p) => p.difficulty === "Medium").length;
  const hardSolved = solved.filter((p) => p.difficulty === "Hard").length;
  const totalEasy = problems.filter((p) => p.difficulty === "Easy").length;
  const totalMed = problems.filter((p) => p.difficulty === "Medium").length;
  const totalHard = problems.filter((p) => p.difficulty === "Hard").length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-lg font-bold text-foreground">Dashboard</h1>
      <p className="mt-1 text-xs text-muted-foreground">Your coding progress overview</p>

      {/* Stats cards */}
      <div className="mt-8 grid grid-cols-4 gap-4">
        {[
          { label: "Solved", value: solved.length, sub: `/ ${problems.length}` },
          { label: "Ranking", value: "#12,847", sub: "Top 15%" },
          { label: "Streak", value: "14", sub: "days" },
          { label: "Submissions", value: "284", sub: "total" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-foreground">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bars */}
      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Progress by Difficulty</h2>
        <div className="space-y-4">
          {[
            { label: "Easy", solved: easySolved, total: totalEasy, color: "bg-easy" },
            { label: "Medium", solved: medSolved, total: totalMed, color: "bg-medium" },
            { label: "Hard", solved: hardSolved, total: totalHard, color: "bg-hard" },
          ].map((bar) => (
            <div key={bar.label}>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-foreground">{bar.label}</span>
                <span className="text-muted-foreground">{bar.solved} / {bar.total}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full ${bar.color} transition-all`}
                  style={{ width: `${bar.total > 0 ? (bar.solved / bar.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent submissions */}
      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Recent Submissions</h2>
        <div className="space-y-2">
          {solved.slice(0, 8).map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-surface-hover">
              <div className="flex items-center gap-3">
                <svg className="h-3.5 w-3.5 text-easy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm text-foreground">{p.title}</span>
              </div>
              <span className={`text-xs font-medium ${
                p.difficulty === "Easy" ? "text-easy" : p.difficulty === "Medium" ? "text-medium" : "text-hard"
              }`}>
                {p.difficulty}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
