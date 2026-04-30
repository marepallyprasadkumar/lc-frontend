import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, CalendarDays, CheckCircle2, Flame, Target, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { getProblems } from "@/lib/api";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard - Coding Platform" },
      { name: "description", content: "Track coding progress, submissions, streaks, and topic performance." },
    ],
  }),
  component: DashboardPage,
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

type Difficulty = "Easy" | "Medium" | "Hard";

type Submission = {
  id: number;
  problem_id: number;
  status: string;
  language: string;
  test_cases_passed: number;
  test_cases_total: number;
  created_at: string;
  submitted_at?: string;
};

type CalendarCell = {
  key: string;
  date: Date;
  value: number;
};

const difficultyColors: Record<Difficulty, string> = {
  Easy: "bg-easy text-easy",
  Medium: "bg-medium text-medium",
  Hard: "bg-hard text-hard",
};

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function activityClass(value: number) {
  if (value >= 5) return "bg-easy";
  if (value >= 3) return "bg-easy/70";
  if (value >= 1) return "bg-easy/35";
  return "bg-secondary";
}

function percent(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
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
          fetch(`${API}/api/code/submissions`),
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

  const byProblem = useMemo(() => {
    const map = new Map<number, any>();
    problems.forEach((problem) => map.set(Number(problem.id), problem));
    return map;
  }, [problems]);

  const acceptedProblemIds = useMemo(() => {
    const solved = new Set<number>();
    submissions.forEach((submission) => {
      if (submission.status === "Accepted") solved.add(Number(submission.problem_id));
    });
    problems.forEach((problem) => {
      if (problem.status === "solved") solved.add(Number(problem.id));
    });
    return solved;
  }, [submissions, problems]);

  const solvedCount = acceptedProblemIds.size;
  const totalProblems = problems.length;
  const acceptedCount = submissions.filter((submission) => submission.status === "Accepted").length;
  const acceptanceRate = submissions.length > 0 ? Math.round((acceptedCount / submissions.length) * 100) : 0;

  const difficultyProgress = useMemo(() => {
    const totals: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };
    const solved: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };

    problems.forEach((problem) => {
      const difficulty = problem.difficulty as Difficulty;
      if (!totals[difficulty]) return;
      totals[difficulty] += 1;
      if (acceptedProblemIds.has(Number(problem.id))) solved[difficulty] += 1;
    });

    return (["Easy", "Medium", "Hard"] as Difficulty[]).map((difficulty) => ({
      difficulty,
      total: totals[difficulty],
      solved: solved[difficulty],
      percentage: percent(solved[difficulty], totals[difficulty]),
    }));
  }, [problems, acceptedProblemIds]);

  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    submissions.forEach((submission) => {
      const rawDate = submission.created_at || submission.submitted_at;
      if (!rawDate) return;
      const key = dateKey(new Date(rawDate));
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [submissions]);

  const calendarCells = useMemo<CalendarCell[]>(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 364);

    const cells: CalendarCell[] = [];
    const leadingBlanks = start.getDay();

    for (let i = 0; i < leadingBlanks; i++) {
      const blankDate = new Date(start);
      blankDate.setDate(start.getDate() - (leadingBlanks - i));
      cells.push({ key: `blank-${i}`, date: blankDate, value: -1 });
    }

    for (let i = 0; i < 365; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      const key = dateKey(current);
      cells.push({ key, date: current, value: activityMap.get(key) || 0 });
    }

    return cells;
  }, [activityMap]);

  const monthLabels = useMemo(() => {
    const labels: { label: string; column: number }[] = [];
    let lastMonth = "";

    calendarCells.forEach((cell, index) => {
      if (cell.value < 0) return;
      const month = cell.date.toLocaleDateString(undefined, { month: "short" });
      if (month !== lastMonth) {
        labels.push({ label: month, column: Math.floor(index / 7) + 1 });
        lastMonth = month;
      }
    });

    return labels;
  }, [calendarCells]);

  const streak = useMemo(() => {
    let count = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const current = new Date(today);
      current.setDate(today.getDate() - i);
      if ((activityMap.get(dateKey(current)) || 0) > 0) count += 1;
      else break;
    }

    return count;
  }, [activityMap]);

  const topicProgress = useMemo(() => {
    const topics = new Map<string, { total: number; solved: number }>();

    problems.forEach((problem) => {
      (problem.tags || []).forEach((tag: string) => {
        const current = topics.get(tag) || { total: 0, solved: 0 };
        current.total += 1;
        if (acceptedProblemIds.has(Number(problem.id))) current.solved += 1;
        topics.set(tag, current);
      });
    });

    return Array.from(topics.entries())
      .map(([topic, values]) => ({ topic, ...values, percentage: percent(values.solved, values.total) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [problems, acceptedProblemIds]);

  const recentSubmissions = useMemo(() => submissions.slice(0, 7), [submissions]);

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to view progress, streaks, topic strength, and submissions.</p>
        <Link to="/login" className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading dashboard...</div>;
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Performance overview</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">Track solved problems, daily activity, difficulty balance, and recent judge results.</p>
        </div>
        <div className="rounded-md border border-border bg-card px-4 py-2 text-sm">
          <span className="text-muted-foreground">Signed in as </span>
          <span className="font-semibold text-foreground">{user.username}</span>
        </div>
      </div>

      <section className="mt-6 grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="rounded-md border border-border bg-card p-5">
          <div className="flex items-center gap-5">
            <div className="relative grid h-36 w-36 place-items-center rounded-full border border-border bg-background">
              <div
                className="absolute inset-3 rounded-full"
                style={{
                  background: `conic-gradient(var(--primary) ${percent(solvedCount, totalProblems) * 3.6}deg, var(--secondary) 0deg)`,
                }}
              />
              <div className="relative grid h-24 w-24 place-items-center rounded-full bg-card text-center">
                <div>
                  <p className="text-3xl font-semibold text-foreground">{solvedCount}</p>
                  <p className="text-[11px] text-muted-foreground">Solved</p>
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              {difficultyProgress.map((item) => (
                <div key={item.difficulty}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className={difficultyColors[item.difficulty].split(" ")[1]}>{item.difficulty}</span>
                    <span className="text-muted-foreground">{item.solved}/{item.total}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div className={`h-full rounded-full ${difficultyColors[item.difficulty].split(" ")[0]}`} style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Metric icon={Flame} label="Streak" value={streak} suffix="days" />
            <Metric icon={Target} label="Acceptance" value={acceptanceRate} suffix="%" />
            <Metric icon={Activity} label="Submissions" value={submissions.length} suffix="total" />
            <Metric icon={Trophy} label="Rank" value={solvedCount ? Math.max(1, totalProblems - solvedCount + 1) : "-"} suffix="local" />
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Submission Calendar</h2>
              <p className="mt-1 text-xs text-muted-foreground">Last 365 days of coding activity</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span>Less</span>
              {[0, 1, 3, 5].map((value) => (
                <span key={value} className={`h-3 w-3 rounded-sm ${activityClass(value)}`} />
              ))}
              <span>More</span>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="relative min-w-[780px] pl-8">
              <div className="mb-2 grid grid-cols-[repeat(54,12px)] gap-1 text-[10px] text-muted-foreground">
                {monthLabels.map((month) => (
                  <span key={`${month.label}-${month.column}`} style={{ gridColumnStart: month.column }}>
                    {month.label}
                  </span>
                ))}
              </div>
              <div className="absolute left-0 top-7 grid grid-rows-7 gap-1 text-[10px] text-muted-foreground">
                <span />
                <span>Mon</span>
                <span />
                <span>Wed</span>
                <span />
                <span>Fri</span>
                <span />
              </div>
              <div className="grid grid-flow-col grid-rows-7 gap-1">
                {calendarCells.map((cell) => (
                  <div
                    key={cell.key}
                    title={cell.value < 0 ? "" : `${formatShortDate(cell.date)}: ${cell.value} submissions`}
                    className={`h-3 w-3 rounded-sm ${cell.value < 0 ? "bg-transparent" : activityClass(cell.value)}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_420px]">
        <div className="rounded-md border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Topic Progress</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {topicProgress.map((topic) => (
              <div key={topic.topic} className="rounded-md border border-border bg-background p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{topic.topic}</span>
                  <span className="text-xs text-muted-foreground">{topic.solved}/{topic.total}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${topic.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">Recent Submissions</h2>
          <div className="mt-4 space-y-2">
            {recentSubmissions.length === 0 ? (
              <div className="rounded-md border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
                No submissions yet. Solve a problem to start filling the calendar.
              </div>
            ) : (
              recentSubmissions.map((submission) => {
                const problem = byProblem.get(Number(submission.problem_id));
                const title = problem?.title || `Problem ${submission.problem_id}`;
                const slug = problem?.slug;

                return (
                  <div key={submission.id} className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2">
                    <div className="min-w-0">
                      {slug ? (
                        <Link to="/problems/$problemId" params={{ problemId: slug }} className="block truncate text-sm font-medium text-foreground hover:text-primary">
                          {title}
                        </Link>
                      ) : (
                        <p className="truncate text-sm font-medium text-foreground">{title}</p>
                      )}
                      <p className="mt-0.5 text-xs text-muted-foreground">{submission.language} · {new Date(submission.created_at || submission.submitted_at || Date.now()).toLocaleString()}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold ${submission.status === "Accepted" ? "bg-easy/10 text-easy" : "bg-hard/10 text-hard"}`}>
                        <CheckCircle2 className="h-3 w-3" /> {submission.status}
                      </span>
                      <p className="mt-1 text-[11px] text-muted-foreground">{submission.test_cases_passed}/{submission.test_cases_total}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ icon: Icon, label, value, suffix }: { icon: typeof Activity; label: string; value: number | string; suffix: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-xl font-semibold text-foreground">{value}</span>
        <span className="text-[11px] text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );
}
