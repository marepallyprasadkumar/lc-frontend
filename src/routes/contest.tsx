import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarDays, ExternalLink, Globe2, LockKeyhole, Play, Plus, ShieldCheck, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getProblems } from "@/lib/api";

export const Route = createFileRoute("/contest")({
  head: () => ({
    meta: [
      { title: "Contest - Coding Platform" },
      { name: "description", content: "Create fullscreen coding contests and discover real-world external contests." },
    ],
  }),
  component: ContestPage,
});

type ProblemItem = {
  id: number;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags?: string[];
};

type LocalContest = {
  id: string;
  title: string;
  duration: number;
  problemSlugs: string[];
  createdAt: string;
};

const STORAGE_KEY = "coding_platform_contests";

const contestPlatforms = [
  { name: "Codeforces", url: "https://codeforces.com/contests", type: "Rated rounds", schedule: "Frequent global contests", accent: "border-sky-400/30 bg-sky-400/10 text-sky-300" },
  { name: "LeetCode", url: "https://leetcode.com/contest/", type: "Weekly contests", schedule: "Weekly and biweekly contests", accent: "border-medium/30 bg-medium/10 text-medium" },
  { name: "CodeChef", url: "https://www.codechef.com/contests", type: "Starters", schedule: "Regular rated contests", accent: "border-primary/30 bg-primary/10 text-primary" },
  { name: "AtCoder", url: "https://atcoder.jp/contests/?lang=en", type: "ABC / ARC / AGC", schedule: "Upcoming contests listed live", accent: "border-violet-400/30 bg-violet-400/10 text-violet-300" },
  { name: "HackerRank", url: "https://www.hackerrank.com/contests", type: "Challenges", schedule: "Active and archived contests", accent: "border-easy/30 bg-easy/10 text-easy" },
  { name: "HackerEarth", url: "https://www.hackerearth.com/challenges/", type: "Hackathons", schedule: "Live and upcoming challenges", accent: "border-hard/30 bg-hard/10 text-hard" },
];

const difficultyClass: Record<string, string> = {
  Easy: "text-easy",
  Medium: "text-medium",
  Hard: "text-hard",
};

function readContests(): LocalContest[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveContests(contests: LocalContest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contests));
}

function ContestPage() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [contests, setContests] = useState<LocalContest[]>([]);
  const [title, setTitle] = useState("Weekly Coding Assessment");
  const [duration, setDuration] = useState(60);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setContests(readContests());
    getProblems()
      .then((data) => {
        const mapped = data as ProblemItem[];
        setProblems(mapped);
        setSelectedSlugs(mapped.slice(0, 3).map((problem) => problem.slug));
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedProblems = useMemo(
    () => problems.filter((problem) => selectedSlugs.includes(problem.slug)),
    [problems, selectedSlugs]
  );

  const latestContest = contests[0];

  const toggleProblem = (slug: string) => {
    setSelectedSlugs((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]
    );
  };

  const createContest = () => {
    if (!title.trim() || selectedSlugs.length === 0) return;

    const contest: LocalContest = {
      id: String(Date.now()),
      title: title.trim(),
      duration,
      problemSlugs: selectedSlugs,
      createdAt: new Date().toISOString(),
    };

    const next = [contest, ...contests].slice(0, 6);
    setContests(next);
    saveContests(next);
  };

  const startContest = (contest: LocalContest) => {
    const firstProblem = contest.problemSlugs[0];
    if (!firstProblem) return;

    navigate({
      to: "/problems/$problemId",
      params: { problemId: firstProblem },
      search: { mode: "contest", duration: String(contest.duration), contestId: contest.id },
    });
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Contest workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Create Fullscreen Coding Contests</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Create a contest using platform problems, set the duration, and start it in fullscreen assessment mode with hints disabled.
          </p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Fullscreen assessment
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Tab switch, clipboard use, or fullscreen exit locks the session.</p>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[420px_1fr]">
        <div className="rounded-md border border-border bg-card p-5">
          <h2 className="text-lg font-semibold text-foreground">Contest setup</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Contest name</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Duration</label>
              <select
                value={duration}
                onChange={(event) => setDuration(Number(event.target.value))}
                className="mt-2 h-10 w-full rounded-md border border-border bg-input px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>120 minutes</option>
              </select>
            </div>

            <div className="rounded-md border border-border bg-background p-3">
              <p className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <LockKeyhole className="h-3.5 w-3.5 text-primary" />
                Contest rules
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-muted-foreground">
                <li>Contest opens problem solving page in fullscreen mode.</li>
                <li>AI hints and submissions history are hidden during contest mode.</li>
                <li>Leaving fullscreen, switching tabs, or using clipboard locks the contest.</li>
              </ul>
            </div>

            <button
              onClick={createContest}
              disabled={!title.trim() || selectedSlugs.length === 0}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
            >
              <Plus className="h-4 w-4" /> Create Contest
            </button>
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Select problems</h2>
              <p className="mt-1 text-xs text-muted-foreground">{selectedSlugs.length} selected for this contest</p>
            </div>
            {latestContest && (
              <button
                onClick={() => startContest(latestContest)}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Play className="h-4 w-4" /> Start Latest
              </button>
            )}
          </div>

          {loading ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading problems...</p>
          ) : (
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {problems.map((problem) => (
                <label key={problem.slug} className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-background p-3 hover:bg-surface-hover">
                  <input
                    type="checkbox"
                    checked={selectedSlugs.includes(problem.slug)}
                    onChange={() => toggleProblem(problem.slug)}
                    className="h-4 w-4 accent-primary"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{problem.title}</p>
                    <p className={`mt-1 text-xs font-semibold ${difficultyClass[problem.difficulty]}`}>{problem.difficulty}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-md border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Created contests</h2>
          <span className="text-xs text-muted-foreground">Stored locally for demo and assessment flow</span>
        </div>

        {contests.length === 0 ? (
          <p className="mt-4 rounded-md border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
            No contests created yet. Select problems and create one to begin fullscreen assessment mode.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {contests.map((contest) => {
              const contestProblems = problems.filter((problem) => contest.problemSlugs.includes(problem.slug));
              return (
                <div key={contest.id} className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-border bg-background p-4">
                  <div>
                    <p className="font-semibold text-foreground">{contest.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {contest.duration} minutes - {contest.problemSlugs.length} problems - Created {new Date(contest.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {contestProblems.map((problem) => problem.title).join(", ") || "Selected problems"}
                    </p>
                  </div>
                  <button
                    onClick={() => startContest(contest)}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    <Play className="h-4 w-4" /> Start Fullscreen
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">External contest links</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {contestPlatforms.map((platform) => (
            <article key={platform.name} className="rounded-md border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className={`inline-flex rounded border px-2 py-1 text-[11px] font-semibold ${platform.accent}`}>
                    {platform.type}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-foreground">{platform.name}</h3>
                </div>
                <Trophy className="h-5 w-5 text-primary" />
              </div>

              <div className="mt-4 flex gap-3 rounded border border-border bg-background p-3">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Contest schedule</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{platform.schedule}</p>
                </div>
              </div>

              <a
                href={platform.url}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-hover"
              >
                Open Official Contests <ExternalLink className="h-4 w-4" />
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
