import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getProblems } from "@/lib/api";

export const Route = createFileRoute("/contest")({
  component: ContestPage,
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

type LeaderboardRow = {
  userId: number;
  username: string;
  solved: number;
  score: number;
  penalty: number;
  lastAcceptedAt: string | null;
};

function ContestPage() {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [boardLoading, setBoardLoading] = useState(true);

  const problemIds = useMemo(() => problems.map((p) => Number(p.id)).filter((n) => Number.isFinite(n)), [problems]);

  useEffect(() => {
    getProblems()
      .then((all) => {
        const picked = all.slice(0, 30);
        setProblems(picked);

        const status: Record<string, boolean> = {};
        picked.forEach((p: any) => {
          status[p.slug] = localStorage.getItem(`contest_status_${p.slug}`) === "completed";
        });
        setCompletedMap(status);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (problemIds.length === 0) {
      setLeaderboard([]);
      setBoardLoading(false);
      return;
    }

    let mounted = true;

    const loadBoard = async () => {
      setBoardLoading(true);
      try {
        const query = encodeURIComponent(problemIds.join(","));
        const res = await fetch(`${API}/api/code/leaderboard?problemIds=${query}`);
        const json = await res.json();
        if (!mounted) return;
        setLeaderboard(Array.isArray(json.data) ? json.data : []);
      } catch {
        if (!mounted) return;
        setLeaderboard([]);
      } finally {
        if (mounted) setBoardLoading(false);
      }
    };

    loadBoard();
    const timer = window.setInterval(loadBoard, 15000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [problemIds]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold text-foreground">Coding Assessment</h1>
      <p className="mt-2 text-sm text-muted-foreground">Contest runs in fullscreen with strict anti-cheat controls.</p>

      <div className="mt-6 rounded-lg border border-border p-4">
        <h2 className="text-lg font-semibold">Instructions</h2>
        <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
          <li>Only Run, Submit, Timer, Exit, Description and Testcases are visible.</li>
          <li>Tab switch / copy-paste / fullscreen exit locks the contest.</li>
          <li>Locked or timed-out contests are marked as completed.</li>
        </ul>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Problems ({problems.length})</h2>
        {loading ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading contest problems...</p>
        ) : problems.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No problems available.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {problems.map((p) => (
              <div key={p.slug} className="flex items-center justify-between rounded border border-border p-3">
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.difficulty}</p>
                </div>
                <div className="flex items-center gap-2">
                  {completedMap[p.slug] && (
                    <span className="rounded border border-green-700 bg-green-900/40 px-2 py-1 text-xs font-semibold text-green-300">Completed</span>
                  )}
                  <Link to="/problems/$problemId" params={{ problemId: p.slug }} search={{ mode: "contest" }} className="rounded bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
                    {completedMap[p.slug] ? "View" : "Start"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Leaderboard</h2>
          <span className="text-xs text-muted-foreground">Auto refresh: 15s</span>
        </div>

        {boardLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading leaderboard...</p>
        ) : leaderboard.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No submissions yet for this contest set.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2">Rank</th>
                  <th className="py-2">User</th>
                  <th className="py-2">Solved</th>
                  <th className="py-2">Score</th>
                  <th className="py-2">Penalty</th>
                  <th className="py-2">Last Accepted</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row, idx) => (
                  <tr key={`${row.userId}-${idx}`} className="border-b border-border/60">
                    <td className="py-2 font-semibold">#{idx + 1}</td>
                    <td className="py-2">{row.username}</td>
                    <td className="py-2">{row.solved}</td>
                    <td className="py-2">{row.score}</td>
                    <td className="py-2">{row.penalty}</td>
                    <td className="py-2">{row.lastAcceptedAt ? new Date(row.lastAcceptedAt).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
