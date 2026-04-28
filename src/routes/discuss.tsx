import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getProblems } from "@/lib/api";
import { getToken, getCurrentUser } from "@/lib/auth";

export const Route = createFileRoute("/discuss")({
  component: DiscussPage,
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

type Discussion = {
  id: number;
  title: string;
  content: string;
  upvotes: number;
  created_at: string;
  users?: { username?: string; profile_picture_url?: string };
};

function DiscussPage() {
  const user = getCurrentUser();
  const [problems, setProblems] = useState<any[]>([]);
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);

  const [threads, setThreads] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getProblems().then((list) => {
      setProblems(list);
      if (list.length > 0) setSelectedProblemId(Number(list[0].id));
    });
  }, []);

  const selectedProblem = useMemo(() => problems.find((p) => Number(p.id) === selectedProblemId), [problems, selectedProblemId]);

  const loadThreads = async () => {
    if (!selectedProblemId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/discussions/problem/${selectedProblemId}`);
      const json = await res.json();
      setThreads(Array.isArray(json.data) ? json.data : []);
    } catch {
      setThreads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, [selectedProblemId]);

  const postThread = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedProblemId) {
      setError("Select a problem first.");
      return;
    }

    if (!user) {
      setError("Sign in required to create discussion.");
      return;
    }

    setPosting(true);
    try {
      const token = getToken();
      const res = await fetch(`${API}/api/discussions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ problemId: selectedProblemId, title, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to post");

      setTitle("");
      setContent("");
      await loadThreads();
    } catch (err: any) {
      setError(err.message || "Failed to post thread");
    } finally {
      setPosting(false);
    }
  };

  const vote = async (discussionId: number, action: "upvote" | "downvote") => {
    try {
      await fetch(`${API}/api/discussions/${discussionId}/${action}`, { method: "POST" });
      await loadThreads();
    } catch {}
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold text-foreground">Discuss</h1>
      <p className="mt-1 text-sm text-muted-foreground">Community discussions by problem</p>

      <div className="mt-5 rounded-xl border border-border bg-card p-4">
        <label className="block text-xs text-muted-foreground">Select Problem</label>
        <select
          value={selectedProblemId ?? ""}
          onChange={(e) => setSelectedProblemId(Number(e.target.value))}
          className="mt-2 w-full rounded border border-border bg-input p-2 text-sm text-foreground"
        >
          {problems.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Create Thread</h2>
          <p className="text-xs text-muted-foreground">Problem: {selectedProblem?.title || "-"}</p>

          <form className="mt-3 space-y-3" onSubmit={postThread}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Thread title"
              className="w-full rounded border border-border bg-input p-2 text-sm"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your approach, doubt, or optimization idea"
              rows={6}
              className="w-full rounded border border-border bg-input p-2 text-sm"
            />
            {!!error && <p className="text-xs text-red-400">{error}</p>}
            <button className="rounded bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground" disabled={posting}>
              {posting ? "Posting..." : "Post Thread"}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Threads</h2>

          {loading ? (
            <p className="mt-3 text-sm text-muted-foreground">Loading discussions...</p>
          ) : threads.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No discussions yet for this problem.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {threads.map((t) => (
                <div key={t.id} className="rounded border border-border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{t.title}</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{t.content}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">by {t.users?.username || "anonymous"}</p>
                    <div className="flex items-center gap-2">
                      <button className="rounded border border-border px-2 py-1 text-xs" onClick={() => vote(t.id, "upvote")}>?</button>
                      <span className="text-xs">{t.upvotes}</span>
                      <button className="rounded border border-border px-2 py-1 text-xs" onClick={() => vote(t.id, "downvote")}>?</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
