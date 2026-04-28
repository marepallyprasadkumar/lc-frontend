import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getProblems } from "@/lib/api";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

type Submission = {
  id: number;
  problem_id: number;
  status: string;
  language: string;
  test_cases_passed: number;
  test_cases_total: number;
  created_at: string;
};

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function DashboardPage() {
  const user = getCurrentUser();
  const [problems, setProblems] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [problemData, submissionRes] = await Promise.all([
          getProblems(),
          fetch("http://localhost:5000/api/code/submissions"),
        ]);

        const submissionData = submissionRes.ok ? await submissionRes.json() : [];

        setProblems(problemData || []);
        setSubmissions(Array.isArray(submissionData) ? submissionData : []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const acceptedProblemIds = useMemo(() => {
    const set = new Set<number>();
    submissions.forEach((s) => {
      if (s.status === "Accepted") set.add(Number(s.problem_id));
    });
    return set;
  }, [submissions]);

  const solvedCount = acceptedProblemIds.size;

  const difficultyTotals = useMemo(() => {
    const totals = { Easy: 0, Medium: 0, Hard: 0 };
    const solved = { Easy: 0, Medium: 0, Hard: 0 };

    const byId = new Map<number, any>();
    problems.forEach((p) => byId.set(Number(p.id), p));

    problems.forEach((p) => {
      if (p.difficulty === "Easy" || p.difficulty === "Medium" || p.difficulty === "Hard") {
        totals[p.difficulty] += 1;
      }
    });

    acceptedProblemIds.forEach((id) => {
      const p = byId.get(id);
      if (!p) return;
      if (p.difficulty === "Easy" || p.difficulty === "Medium" || p.difficulty === "Hard") {
        solved[p.difficulty] += 1;
      }
    });

    return { totals, solved };
  }, [problems, acceptedProblemIds]);

  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    submissions.forEach((s) => {
      const key = dayKey(new Date(s.created_at));
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [submissions]);

  const streak = useMemo(() => {
    let count = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = dayKey(d);
      if ((activityMap.get(key) || 0) > 0) {
        count += 1;
      } else {
        break;
      }
    }
    return count;
  }, [activityMap]);

  const calendarDays = useMemo(() => {
    const days: { key: string; value: number; label: string }[] = [];
    const now = new Date();
    for (let i = 34; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = dayKey(d);
      days.push({
        key,
        value: activityMap.get(key) || 0,
        label: d.toLocaleDateString(),
      });
    }
    return days;
  }, [activityMap]);

  const byProblem = useMemo(() => {
    const map = new Map<number, any>();
    problems.forEach((p) => map.set(Number(p.id), p));
    return map;
  }, [problems]);

  const recentSubmissions = submissions.slice(0, 8);

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to view real performance, streaks, and submissions.</p>
        <Link to="/login" className="mt-4 inline-block rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-lg font-bold text-foreground">Dashboard</h1>
      <p className="mt-1 text-xs text-muted-foreground">Live coding progress and activity</p>

      <div className="mt-8 grid grid-cols-4 gap-4">
        {[
          { label: "Solved", value: solvedCount, sub: `/ ${problems.length}` },
          { label: "Streak", value: streak, sub: "days" },
          { label: "Submissions", value: submissions.length, sub: "total" },
          { label: "Accepted", value: submissions.filter((s) => s.status === "Accepted").length, sub: "runs" },
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

      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Progress by Difficulty</h2>
        <div className="space-y-4">
          {["Easy", "Medium", "Hard"].map((level) => {
            const solved = difficultyTotals.solved[level as keyof typeof difficultyTotals.solved];
            const total = difficultyTotals.totals[level as keyof typeof difficultyTotals.totals];
            const barColor = level === "Easy" ? "bg-easy" : level === "Medium" ? "bg-medium" : "bg-hard";
            return (
              <div key={level}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-foreground">{level}</span>
                  <span className="text-muted-foreground">{solved} / {total}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${total > 0 ? (solved / total) * 100 : 0}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Streak Calendar (Last 35 Days)</h2>
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((d) => {
            const intensity = d.value >= 4 ? "bg-green-500" : d.value >= 2 ? "bg-green-700" : d.value >= 1 ? "bg-green-900" : "bg-secondary";
            return <div key={d.key} title={`${d.label}: ${d.value} submissions`} className={`h-8 rounded ${intensity}`} />;
          })}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Recent Submissions</h2>
        <div className="space-y-2">
          {recentSubmissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No submissions yet.</p>
          ) : (
            recentSubmissions.map((s) => {
              const p = byProblem.get(Number(s.problem_id));
              const title = p?.title || `Problem ${s.problem_id}`;
              const difficulty = p?.difficulty || "-";
              return (
                <div key={s.id} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-surface-hover">
                  <div className="flex items-center gap-3">
                    <span className={s.status === "Accepted" ? "text-easy" : "text-hard"}>{s.status === "Accepted" ? "?" : "?"}</span>
                    <span className="text-sm text-foreground">{title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{difficulty}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
