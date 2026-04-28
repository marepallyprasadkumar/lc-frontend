import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/contest")({
  component: ContestPage,
});

function ContestPage() {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/problems")
      .then((res) => res.json())
      .then((data) => {
        const safe = Array.isArray(data) ? data : data.data || [];
        setProblems(safe.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-bold text-foreground">Coding Assessment</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Start a contest session. During assessment, only core coding controls are shown.
      </p>

      <div className="mt-6 rounded-lg border border-border p-4">
        <h2 className="text-lg font-semibold">Instructions</h2>
        <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
          <li>Contest opens in focused assessment mode.</li>
          <li>AI hints are disabled for fairness.</li>
          <li>Use Run and Submit to complete each task.</li>
        </ul>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Problems</h2>
        {loading ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading contest problems...</p>
        ) : problems.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No problems available.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {problems.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded border border-border p-3">
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.difficulty}</p>
                </div>
                <Link
                  to="/problems/$problemId"
                  params={{ problemId: p.slug }}
                  search={{ mode: "contest" }}
                  className="rounded bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
                >
                  Start
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
