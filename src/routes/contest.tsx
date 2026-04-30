import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, ExternalLink, Globe2, Trophy } from "lucide-react";

export const Route = createFileRoute("/contest")({
  head: () => ({
    meta: [
      { title: "Real-World Contests - Coding Platform" },
      { name: "description", content: "Discover real-world coding contests from popular competitive programming platforms." },
    ],
  }),
  component: ContestPage,
});

const contestPlatforms = [
  {
    name: "Codeforces",
    url: "https://codeforces.com/contests",
    type: "Rated rounds and educational rounds",
    schedule: "Frequent global contests",
    bestFor: "Competitive programming ratings, Div. 1/2/3 rounds, and virtual participation.",
    accent: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  },
  {
    name: "LeetCode",
    url: "https://leetcode.com/contest/",
    type: "Weekly and biweekly contests",
    schedule: "Weekly contest practice",
    bestFor: "Interview-style contest problems and global ranking.",
    accent: "border-medium/30 bg-medium/10 text-medium",
  },
  {
    name: "CodeChef",
    url: "https://www.codechef.com/contests",
    type: "Starters and rated contests",
    schedule: "Regular beginner to advanced contests",
    bestFor: "Practice across divisions with long and short contest formats.",
    accent: "border-primary/30 bg-primary/10 text-primary",
  },
  {
    name: "AtCoder",
    url: "https://atcoder.jp/contests/?lang=en",
    type: "ABC, ARC, AGC, and heuristic contests",
    schedule: "Upcoming contests listed live",
    bestFor: "High-quality algorithmic problems with consistent contest structure.",
    accent: "border-violet-400/30 bg-violet-400/10 text-violet-300",
  },
  {
    name: "HackerRank",
    url: "https://www.hackerrank.com/contests",
    type: "Coding competitions and archived contests",
    schedule: "Active and archived contests",
    bestFor: "Contest practice, college events, and challenge-based scoring.",
    accent: "border-easy/30 bg-easy/10 text-easy",
  },
  {
    name: "HackerEarth",
    url: "https://www.hackerearth.com/challenges/",
    type: "Programming challenges, hackathons, and hiring contests",
    schedule: "Live and upcoming challenges",
    bestFor: "Competitive challenges, hackathons, hiring events, and university contests.",
    accent: "border-hard/30 bg-hard/10 text-hard",
  },
];

function ContestPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Contest hub</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Real-World Coding Contests</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Explore live and upcoming contests from popular competitive programming platforms. Use this page to discover external contests, register on the official platform, and continue practice here.
          </p>
        </div>

        <div className="rounded-md border border-border bg-card px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Globe2 className="h-4 w-4 text-primary" />
            External contest discovery
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Links open official platforms.</p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {contestPlatforms.map((platform) => (
          <article key={platform.name} className="rounded-md border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className={`inline-flex rounded border px-2 py-1 text-[11px] font-semibold ${platform.accent}`}>
                  {platform.type}
                </span>
                <h2 className="mt-4 text-xl font-semibold text-foreground">{platform.name}</h2>
              </div>
              <Trophy className="h-5 w-5 text-primary" />
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex gap-3 rounded border border-border bg-background p-3">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Contest schedule</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{platform.schedule}</p>
                </div>
              </div>

              <p className="min-h-16 text-sm leading-6 text-muted-foreground">{platform.bestFor}</p>
            </div>

            <a
              href={platform.url}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Open Official Contests <ExternalLink className="h-4 w-4" />
            </a>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-md border border-border bg-card p-5">
        <h2 className="text-lg font-semibold text-foreground">How this module supports the project</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-md border border-border bg-background p-4">
            <p className="text-sm font-semibold text-foreground">Contest awareness</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Users can find real competitions instead of only solving local practice questions.</p>
          </div>
          <div className="rounded-md border border-border bg-background p-4">
            <p className="text-sm font-semibold text-foreground">Practice bridge</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Users can prepare on this platform and then participate in official external contests.</p>
          </div>
          <div className="rounded-md border border-border bg-background p-4">
            <p className="text-sm font-semibold text-foreground">Professional scope</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">The module connects the project with real competitive programming ecosystems.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
