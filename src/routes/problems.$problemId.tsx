import { createFileRoute, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { problemDetails, problems as localProblems } from "@/lib/problems-data";

export const Route = createFileRoute("/problems/$problemId")({
  component: ProblemPage,
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

type Lang = "python" | "javascript" | "cpp" | "java";

const starterTemplates: Record<Lang, string> = {
  python: "# Write your solution here",
  javascript: "// Write your solution here",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}",
  java: "public class Main {\n    public static void main(String[] args) throws Exception {\n        // Write your solution here\n    }\n}",
};

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

function buildLocalProblem(slug: string) {
  const base = localProblems.find((p) => slugify(p.title) === slug);
  if (!base) return null;
  const details = problemDetails[base.id as keyof typeof problemDetails];

  return {
    id: base.id,
    title: base.title,
    slug,
    difficulty: base.difficulty,
    description: details?.description || `${base.title} practice problem.`,
    examples: details?.examples || [],
    constraints: details?.constraints || [],
  };
}

function parseMaybeJson<T>(value: unknown, fallback: T): T {
  if (Array.isArray(value)) return value as T;
  if (typeof value !== "string") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function formatTime(seconds: number) {
  const clamped = Math.max(0, seconds);
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  return [h, m, s].map((x) => String(x).padStart(2, "0")).join(":");
}

function ProblemPage() {
  const { problemId } = useParams({ strict: false }) as { problemId: string };
  const search = useSearch({ strict: false }) as { mode?: "practice" | "contest"; duration?: string };
  const navigate = useNavigate();

  const user = getCurrentUser();
  const isContestMode = search.mode === "contest";
  const contestMinutes = Number(search.duration || 90);

  const [problem, setProblem] = useState<any>(null);
  const [language, setLanguage] = useState<Lang>("python");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [verdict, setVerdict] = useState("");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"run" | "submissions">("run");

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [contestActive, setContestActive] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [violationReason, setViolationReason] = useState("");

  const [hint, setHint] = useState("");
  const [hintLoading, setHintLoading] = useState(false);
  const [hintLevel, setHintLevel] = useState(1);

  const [remainingSeconds, setRemainingSeconds] = useState(contestMinutes * 60);
  const endTimeRef = useRef<number | null>(null);

  const codeKey = useMemo(
    () => `${isContestMode ? "contest" : "practice"}_${language}_code_${problem?.id ?? ""}`,
    [isContestMode, language, problem?.id]
  );

  const examples = useMemo(() => parseMaybeJson<any[]>(problem?.examples, []).filter((e) => e && (e.input || e.output)), [problem?.examples]);
  const constraints = useMemo(() => parseMaybeJson<string[]>(problem?.constraints, []).filter(Boolean), [problem?.constraints]);

  const markContestCompleted = (reason: string) => {
    localStorage.setItem(`contest_status_${problemId}`, "completed");
    localStorage.setItem(`contest_reason_${problemId}`, reason);
    localStorage.setItem(`contest_completed_at_${problemId}`, new Date().toISOString());
  };

  const lockContest = (reason: string) => {
    setIsLocked(true);
    setViolationReason(reason);
    markContestCompleted(reason);
  };

  useEffect(() => {
    if (!user) navigate({ to: "/login", search: { next: `/problems/${problemId}` } });
  }, [user, navigate, problemId]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${API}/api/problems/slug/${problemId}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        const remote = data.problem || data;
        if (!cancelled && remote?.id) {
          setProblem(remote);
          return;
        }
      } catch {}

      const fallback = buildLocalProblem(problemId);
      if (!cancelled && fallback) setProblem(fallback);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [problemId]);

  useEffect(() => {
    if (!problem?.id) return;
    const saved = localStorage.getItem(codeKey);
    setCode(saved || starterTemplates[language]);
  }, [problem?.id, codeKey, language]);

  useEffect(() => {
    if (!problem?.id) return;
    localStorage.setItem(codeKey, code);
  }, [code, codeKey, problem?.id]);

  useEffect(() => {
    if (!problem?.id || isContestMode) return;
    fetch(`${API}/api/code/submissions/${problem.id}`)
      .then((res) => res.json())
      .then((data) => setSubmissions(Array.isArray(data) ? data : data.data || []))
      .catch(() => setSubmissions([]));
  }, [problem?.id, isContestMode]);

  useEffect(() => {
    if (!isContestMode || !contestActive || isLocked) return;

    const interval = window.setInterval(() => {
      if (!endTimeRef.current) return;
      const diff = Math.floor((endTimeRef.current - Date.now()) / 1000);
      setRemainingSeconds(diff);
      if (diff <= 0) {
        lockContest("Contest time completed.");
        window.clearInterval(interval);
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isContestMode, contestActive, isLocked]);

  useEffect(() => {
    if (!isContestMode || !contestActive || isLocked) return;

    const onFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (!active) lockContest("Fullscreen exited during contest.");
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") lockContest("Tab switching detected.");
    };
    const onBlur = () => lockContest("Window focus lost.");
    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      lockContest("Copy action detected.");
    };
    const onPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      lockContest("Paste action detected.");
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("copy", onCopy);
    window.addEventListener("paste", onPaste);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("copy", onCopy);
      window.removeEventListener("paste", onPaste);
    };
  }, [isContestMode, contestActive, isLocked]);

  if (!problem) return <div className="p-6">Loading...</div>;

  const disableActions = isContestMode && (!contestActive || isLocked || !isFullscreen);

  const startContestSession = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      setContestActive(true);
      setIsLocked(false);
      setViolationReason("");
      setRemainingSeconds(contestMinutes * 60);
      endTimeRef.current = Date.now() + contestMinutes * 60 * 1000;
    } catch {
      setViolationReason("Fullscreen permission denied. Allow fullscreen and try again.");
    }
  };

  const runCode = async () => {
    if (disableActions) return;
    const res = await fetch(`${API}/api/code/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, problemId: problem.id, language, examples }),
    });
    const data = await res.json();
    setVerdict(data.verdict || "Run Complete");
    const formatted = (data.results || [])
      .map((r: any, i: number) => `\nTest ${i + 1}\nInput: ${r.input}\nExpected: ${r.expected}\nOutput: ${r.output || r.error || ""}\nResult: ${r.passed ? "Passed" : "Failed"}`)
      .join("\n");
    setOutput(formatted || "No sample tests configured yet for this problem. Add examples/test_cases for exact validation.");
  };

  const submitCode = async () => {
    if (disableActions) return;
    const res = await fetch(`${API}/api/code/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, problemId: problem.id, language }),
    });
    const data = await res.json();
    setVerdict(data.verdict || "Submitted");
    setOutput(`Passed ${data.passed}/${data.total}`);

    if (isContestMode && data.verdict === "Accepted") markContestCompleted("Accepted");
    if (data.submission && !isContestMode) setSubmissions((prev) => [data.submission, ...prev]);
  };

  const fetchHint = async () => {
    if (isContestMode) return;
    setHintLoading(true);
    setHint("");
    try {
      const res = await fetch(`${API}/api/code/hint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemTitle: problem.title, problemDescription: problem.description, code, hintLevel }),
      });
      const data = await res.json();
      setHint(`${data.hint}\n\nNudge: ${data.adaptiveNudge}`);
      setHintLevel(data.nextHint || 3);
    } catch {
      setHint("Could not fetch hint.");
    } finally {
      setHintLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-3rem)] overflow-hidden grid grid-cols-2">
      <div className="overflow-y-auto border-r border-gray-800 p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">{problem.title}</h1>
          <div className="flex items-center gap-2">
            {isContestMode && contestActive && <span className="rounded bg-red-900/50 px-2 py-1 text-xs font-semibold text-red-300">{formatTime(remainingSeconds)}</span>}
            <span className="rounded bg-gray-800 px-2 py-1 text-xs uppercase tracking-wide text-gray-200">{isContestMode ? "Contest Mode" : "Practice Mode"}</span>
          </div>
        </div>

        <p className="mt-2 whitespace-pre-wrap">{problem.description}</p>
        <p className="mt-3 font-semibold">Difficulty: {problem.difficulty}</p>

        {examples.length > 0 && (
          <div className="mt-6 space-y-3">
            {examples.map((ex: any, index: number) => (
              <div key={index} className="rounded border border-gray-800 bg-gray-900/40 p-3">
                <p className="text-sm font-semibold text-gray-100">Example {index + 1}</p>
                <p className="mt-2 text-xs text-gray-300"><span className="font-semibold">Input:</span> {String(ex.input || "")}</p>
                <p className="mt-1 text-xs text-gray-300"><span className="font-semibold">Output:</span> {String(ex.output || "")}</p>
                {ex.explanation && <p className="mt-1 text-xs text-gray-400"><span className="font-semibold">Explanation:</span> {String(ex.explanation)}</p>}
              </div>
            ))}
          </div>
        )}

        {constraints.length > 0 && (
          <div className="mt-5 rounded border border-gray-800 bg-gray-900/40 p-3">
            <p className="text-sm font-semibold text-gray-100">Constraints</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-gray-300">
              {constraints.map((c, i) => <li key={i}>{String(c)}</li>)}
            </ul>
          </div>
        )}

        {isContestMode && (
          <div className="mt-4 rounded border border-gray-700 bg-gray-900/40 p-3 text-xs text-gray-200">
            {!contestActive ? "Click Enter Fullscreen & Start Contest to begin." : isLocked ? violationReason : "Contest protection active."}
          </div>
        )}
      </div>

      <div className="relative min-h-0 flex flex-col bg-black p-4 text-white">
        {!isContestMode && (
          <div className="mb-2 flex gap-6 border-b border-gray-700">
            <button onClick={() => setActiveTab("run")} className={activeTab === "run" ? "text-green-400" : "text-gray-400"}>Run</button>
            <button onClick={() => setActiveTab("submissions")} className={activeTab === "submissions" ? "text-green-400" : "text-gray-400"}>Submissions</button>
          </div>
        )}

        {isContestMode || activeTab === "run" ? (
          <>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs text-gray-400">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Lang)}
                disabled={disableActions}
                className="rounded border border-gray-700 bg-gray-900 px-2 py-1 text-xs text-white"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
            </div>

            <textarea className="min-h-0 flex-1 rounded border border-gray-800 bg-black p-2 font-mono text-white" value={code} onChange={(e) => setCode(e.target.value)} disabled={disableActions} />

            <div className="mt-2 shrink-0 flex flex-wrap gap-2">
              {isContestMode && !contestActive && <button className="rounded bg-amber-600 px-3 py-2" onClick={startContestSession}>Enter Fullscreen & Start Contest</button>}
              <button className="rounded bg-green-500 px-3 py-2 disabled:opacity-50" onClick={runCode} disabled={disableActions}>Run</button>
              <button className="rounded bg-blue-600 px-3 py-2 disabled:opacity-50" onClick={submitCode} disabled={disableActions}>Submit</button>
              {!isContestMode && <button className="rounded bg-indigo-600 px-3 py-2" onClick={fetchHint} disabled={hintLoading}>{hintLoading ? "Getting Hint..." : "Need Hint"}</button>}
              {isContestMode && <button className="rounded bg-gray-700 px-3 py-2" onClick={() => navigate({ to: "/contest" })}>Exit Contest</button>}
            </div>

            {!!verdict && <div className={`mt-2 rounded p-2 text-center font-bold ${verdict === "Accepted" ? "bg-green-700" : "bg-red-700"}`}>{verdict}</div>}
            {!!output && <pre className="mt-2 max-h-32 overflow-auto rounded bg-gray-900 p-3 text-green-400">{output}</pre>}
            {!isContestMode && !!hint && <pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap rounded bg-indigo-950 p-3 text-indigo-200">{hint}</pre>}
          </>
        ) : (
          <div className="mt-3 bg-gray-900 p-3">
            {submissions.length > 0 ? submissions.map((s) => (
              <div key={s.id} className="flex justify-between border-b py-2">
                <div>
                  <span className={s.status === "Accepted" ? "text-green-400" : "text-red-400"}>{s.status}</span>
                  <span className="ml-2">{s.language}</span>
                  <span className="ml-2">{s.test_cases_passed}/{s.test_cases_total}</span>
                </div>
                <div className="text-xs">{new Date(s.created_at).toLocaleString()}</div>
              </div>
            )) : <div>No submissions yet</div>}
          </div>
        )}

        {isContestMode && isLocked && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/75 p-6">
            <div className="w-full max-w-sm rounded border border-red-700 bg-red-950/70 p-4 text-center">
              <p className="text-sm font-semibold text-red-200">Contest Locked</p>
              <p className="mt-2 text-xs text-red-100">{violationReason}</p>
              <button className="mt-4 rounded bg-gray-100 px-4 py-2 text-sm font-semibold text-black" onClick={() => navigate({ to: "/contest" })}>Exit Contest</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProblemPage;
