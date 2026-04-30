import Editor from "@monaco-editor/react";
import { createFileRoute, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { Brain, CheckCircle2, Clock, Lock, Play, Send, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { problemDetails, problems as localProblems, type ProblemDetail, type ProblemTestCase } from "@/lib/problems-data";

export const Route = createFileRoute("/problems/$problemId")({
  component: ProblemPage,
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
type Lang = "python" | "javascript" | "cpp" | "java";
type LearnerLevel = "beginner" | "intermediate" | "advanced";

interface HintSection {
  title: string;
  body: string;
}

interface HintResponse {
  topic: string;
  learnerLevel: LearnerLevel;
  sections: HintSection[];
  adaptiveNudge: string;
}

const languageLabels: Record<Lang, string> = {
  python: "Python",
  javascript: "JavaScript",
  cpp: "C++",
  java: "Java",
};

const monacoLang: Record<Lang, string> = {
  python: "python",
  javascript: "javascript",
  cpp: "cpp",
  java: "java",
};

const learnerLabels: Record<LearnerLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const learnerDescriptions: Record<LearnerLevel, string> = {
  beginner: "Explains the idea, why it works, and what can go wrong.",
  intermediate: "Focuses on tradeoffs, edge cases, and implementation choices.",
  advanced: "Gives compact, high-value direction without overexplaining.",
};

const fallbackStarter: Record<Lang, string> = {
  python: "import sys\n\n# Write your solution here\n",
  javascript: "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8').trim();\n\n// Write your solution here\n",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    return 0;\n}\n",
  java: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n    }\n}\n",
};

const difficultyClass: Record<string, string> = {
  Easy: "text-easy bg-easy/10 border-easy/30",
  Medium: "text-medium bg-medium/10 border-medium/30",
  Hard: "text-hard bg-hard/10 border-hard/30",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

function parseMaybeJson<T>(value: unknown, fallback: T): T {
  if (Array.isArray(value) || (value && typeof value === "object")) return value as T;
  if (typeof value !== "string") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function buildLocalProblem(slug: string) {
  const base = localProblems.find((p) => p.slug === slug || slugify(p.title) === slug);
  if (!base) return null;
  const detail = problemDetails[base.id];

  return {
    ...base,
    description: detail.description,
    examples: detail.examples,
    constraints: detail.constraints,
    starter_code: detail.starterCode,
    test_cases: detail.testCases,
    hints: detail.hints,
  };
}

function formatTime(seconds: number) {
  const clamped = Math.max(0, seconds);
  const h = Math.floor(clamped / 3600);
  const m = Math.floor((clamped % 3600) / 60);
  const s = clamped % 60;
  return [h, m, s].map((x) => String(x).padStart(2, "0")).join(":");
}

function outputForResult(data: any) {
  const rows = Array.isArray(data.results) ? data.results : [];
  if (!rows.length) return data.message || "No test cases were returned by the judge.";

  return rows
    .map(
      (r: any, i: number) =>
        `Case ${i + 1}: ${r.passed ? "Passed" : "Failed"}\nInput:\n${r.input}\nExpected:\n${r.expected}\nOutput:\n${r.output || r.error || ""}`
    )
    .join("\n\n");
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
  const [isRunning, setIsRunning] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"console" | "submissions">("console");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | string | null>(null);

  const [contestActive, setContestActive] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [violationReason, setViolationReason] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(contestMinutes * 60);
  const endTimeRef = useRef<number | null>(null);

  const [hint, setHint] = useState("");
  const [hintResponse, setHintResponse] = useState<HintResponse | null>(null);
  const [hintLevel, setHintLevel] = useState(1);
  const [hintLoading, setHintLoading] = useState(false);
  const [learnerLevel, setLearnerLevel] = useState<LearnerLevel>("beginner");

  useEffect(() => {
    if (!user) navigate({ to: "/login", search: { next: `/problems/${problemId}` } });
  }, [user, navigate, problemId]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${API}/api/problems/slug/${problemId}`);
        if (!res.ok) throw new Error("Problem not found");
        const data = await res.json();
        if (!cancelled && (data.problem || data)?.id) {
          setProblem(data.problem || data);
          return;
        }
      } catch {
        const fallback = buildLocalProblem(problemId);
        if (!cancelled) setProblem(fallback);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [problemId]);

  const localDetail = useMemo<ProblemDetail | undefined>(() => {
    if (!problem?.id) return undefined;
    return problemDetails[Number(problem.id)];
  }, [problem?.id]);

  const examples = useMemo(() => {
    const remote = parseMaybeJson<any[]>(problem?.examples, []);
    return remote.length ? remote : localDetail?.examples || [];
  }, [problem?.examples, localDetail]);

  const constraints = useMemo(() => {
    const remote = parseMaybeJson<string[]>(problem?.constraints, []);
    return remote.length ? remote : localDetail?.constraints || [];
  }, [problem?.constraints, localDetail]);

  const testCases = useMemo<ProblemTestCase[]>(() => {
    const remote = parseMaybeJson<ProblemTestCase[]>(problem?.test_cases, []);
    return remote.length ? remote : localDetail?.testCases || [];
  }, [problem?.test_cases, localDetail]);

  const starterCode = useMemo<Record<string, string>>(() => {
    const remote = parseMaybeJson<Record<string, string>>(problem?.starter_code, {});
    return Object.keys(remote).length ? remote : localDetail?.starterCode || fallbackStarter;
  }, [problem?.starter_code, localDetail]);

  const sampleCases = testCases.filter((test) => test.is_sample);
  const hiddenCount = Math.max(0, testCases.length - sampleCases.length);

  const fullscreenActive = typeof document !== "undefined" && Boolean(document.fullscreenElement);
  const disableActions = isContestMode && (!contestActive || isLocked || !fullscreenActive);

  useEffect(() => {
    if (!problem?.id) return;
    setCode(starterCode[language] || fallbackStarter[language]);
    setOutput("");
    setVerdict("");
    setSelectedSubmissionId(null);
  }, [problem?.id, language, starterCode]);

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

    const lock = (reason: string) => lockContest(reason);
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) lock("Fullscreen exited during contest.");
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") lock("Tab switching detected.");
    };
    const blockClipboard = (event: ClipboardEvent) => {
      event.preventDefault();
      lock("Clipboard action detected.");
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", () => lock("Window focus lost."));
    window.addEventListener("copy", blockClipboard);
    window.addEventListener("paste", blockClipboard);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("copy", blockClipboard);
      window.removeEventListener("paste", blockClipboard);
    };
  }, [isContestMode, contestActive, isLocked]);

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

  const startContestSession = async () => {
    try {
      await document.documentElement.requestFullscreen();
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
    setIsRunning(true);
    setActiveTab("console");
    try {
      const res = await fetch(`${API}/api/code/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, problemId: problem.id, language, testCases: sampleCases, examples }),
      });
      const data = await res.json();
      setVerdict(data.verdict || "Run Complete");
      setOutput(outputForResult(data));
    } catch {
      setVerdict("Judge Offline");
      setOutput("Start the backend server to run code against the configured test cases.");
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async () => {
    if (disableActions) return;
    if (!code.trim()) {
      setActiveTab("console");
      setVerdict("No Code");
      setOutput("Write a solution before submitting.");
      return;
    }

    setIsRunning(true);
    setActiveTab("console");
    try {
      const res = await fetch(`${API}/api/code/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, problemId: problem.id, language, testCases }),
      });
      const data = await res.json();
      setVerdict(data.verdict || "Submitted");
      setOutput(`Passed ${data.passed ?? 0}/${data.total ?? testCases.length} test cases.`);
      if (isContestMode && data.verdict === "Accepted") markContestCompleted("Accepted");
      if (data.submission && !isContestMode) {
        setSubmissions((prev) => [data.submission, ...prev]);
        setSelectedSubmissionId(data.submission.id);
        setActiveTab("submissions");
      }
      setCode(starterCode[language] || fallbackStarter[language]);
    } catch {
      setVerdict("Judge Offline");
      setOutput("Start the backend server to submit against sample and hidden test cases.");
    } finally {
      setIsRunning(false);
    }
  };

  const fetchHint = async () => {
    if (isContestMode) return;
    setHintLoading(true);
    const fallbackHint = localDetail?.hints?.[Math.min(hintLevel - 1, (localDetail?.hints?.length || 1) - 1)];
    try {
      const res = await fetch(`${API}/api/code/hint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemTitle: problem.title, problemDescription: problem.description, code, hintLevel, learnerLevel }),
      });
      const data = await res.json();
      const sections = Array.isArray(data.sections) && data.sections.length
        ? data.sections
        : [
            { title: learnerLabels[learnerLevel], body: data.hint || fallbackHint || "Break the problem into input parsing, core logic, and exact output formatting." },
            { title: "Next step", body: data.adaptiveNudge || "Run the first sample and compare your output carefully." },
          ];

      setHintResponse({
        topic: data.topic || "Problem Solving",
        learnerLevel,
        sections,
        adaptiveNudge: data.adaptiveNudge || "Run the first sample and compare your output carefully.",
      });
      setHint(data.hint || fallbackHint || "");
      setHintLevel(data.nextHint || Math.min(3, hintLevel + 1));
    } catch {
      const fallback = fallbackHint || "Break the problem into input parsing, core logic, and exact output formatting.";
      setHint(fallback);
      setHintResponse({
        topic: "Offline Hint",
        learnerLevel,
        sections: [
          { title: learnerLabels[learnerLevel], body: fallback },
          { title: "Next step", body: "Run one sample, compare expected and actual output, then fix one mismatch at a time." },
        ],
        adaptiveNudge: "Run one sample, compare expected and actual output, then fix one mismatch at a time.",
      });
      setHintLevel(Math.min(3, hintLevel + 1));
    } finally {
      setHintLoading(false);
    }
  };

  if (!problem) {
    return <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center text-sm text-muted-foreground">Loading problem...</div>;
  }

  return (
    <div className="grid h-[calc(100vh-3rem)] grid-cols-1 overflow-hidden bg-background lg:grid-cols-[44%_56%]">
      <section className="overflow-y-auto border-r border-border bg-background">
        <div className="border-b border-border px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className={`rounded border px-2 py-0.5 text-xs font-semibold ${difficultyClass[problem.difficulty] || "border-border text-muted-foreground"}`}>
                  {problem.difficulty}
                </span>
                <span className="text-xs text-muted-foreground">{sampleCases.length} samples</span>
                <span className="text-xs text-muted-foreground">{hiddenCount} hidden tests</span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{problem.title}</h1>
            </div>

            <div className="flex items-center gap-2">
              {isContestMode && contestActive && (
                <span className="inline-flex items-center gap-1 rounded border border-hard/30 bg-hard/10 px-2 py-1 text-xs font-semibold text-hard">
                  <Clock className="h-3.5 w-3.5" /> {formatTime(remainingSeconds)}
                </span>
              )}
              <span className="rounded border border-border bg-surface px-2 py-1 text-xs text-muted-foreground">
                {isContestMode ? "Contest" : "Practice"}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-6 py-5">
          <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">{problem.description}</p>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Examples</h2>
            {examples.map((example: any, index: number) => (
              <div key={index} className="rounded-md border border-border bg-surface p-3">
                <p className="text-xs font-semibold text-foreground">Example {index + 1}</p>
                <pre className="mt-2 whitespace-pre-wrap rounded bg-background p-2 font-mono text-xs text-muted-foreground">Input:
{example.input}</pre>
                <pre className="mt-2 whitespace-pre-wrap rounded bg-background p-2 font-mono text-xs text-muted-foreground">Output:
{example.output}</pre>
                {example.explanation && <p className="mt-2 text-xs leading-5 text-muted-foreground">{example.explanation}</p>}
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground">Constraints</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-muted-foreground">
              {constraints.map((constraint, index) => (
                <li key={index}>{constraint}</li>
              ))}
            </ul>
          </div>

          {isContestMode && (
            <div className="rounded-md border border-hard/30 bg-hard/10 p-3 text-xs leading-5 text-hard">
              <div className="mb-1 flex items-center gap-2 font-semibold">
                <ShieldAlert className="h-4 w-4" /> Assessment mode
              </div>
              {!contestActive ? "Start fullscreen mode to unlock the editor." : isLocked ? violationReason : "Fullscreen, focus, and clipboard protection are active."}
            </div>
          )}
        </div>
      </section>

      <section className="relative flex min-h-0 flex-col bg-[#0d1117]">
        <div className="flex items-center justify-between border-b border-border bg-nav px-4 py-2">
          <div className="flex items-center gap-1">
            {(Object.keys(languageLabels) as Lang[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${language === lang ? "bg-surface-hover text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {languageLabels[lang]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {isContestMode && !contestActive && (
              <button onClick={startContestSession} className="inline-flex items-center gap-2 rounded-md bg-medium px-3 py-1.5 text-xs font-semibold text-background">
                <Lock className="h-3.5 w-3.5" /> Start
              </button>
            )}
            <button onClick={runCode} disabled={disableActions || isRunning} className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-hover disabled:opacity-40">
              <Play className="h-3.5 w-3.5" /> Run
            </button>
            <button onClick={submitCode} disabled={disableActions || isRunning} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40">
              <Send className="h-3.5 w-3.5" /> {isRunning ? "Submitting" : "Submit"}
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1">
          <Editor
            height="100%"
            language={monacoLang[language]}
            value={code}
            onChange={(value) => setCode(value || "")}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "JetBrains Mono, Fira Code, Consolas, monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 14 },
              readOnly: disableActions,
            }}
          />
        </div>

        <div className="h-56 border-t border-border bg-background">
          <div className="flex items-center justify-between border-b border-border bg-nav px-4">
            <div className="flex">
              <button onClick={() => setActiveTab("console")} className={`border-b-2 px-3 py-2 text-xs font-semibold ${activeTab === "console" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}>
                Console
              </button>
              {!isContestMode && (
                <button onClick={() => setActiveTab("submissions")} className={`border-b-2 px-3 py-2 text-xs font-semibold ${activeTab === "submissions" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}>
                  Submissions
                </button>
              )}
            </div>
            {!isContestMode && (
              <div className="flex items-center gap-2">
                <div className="hidden items-center overflow-hidden rounded-md border border-border sm:flex">
                  {(Object.keys(learnerLabels) as LearnerLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setLearnerLevel(level)}
                      className={`px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        learnerLevel === level ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {learnerLabels[level]}
                    </button>
                  ))}
                </div>
                <button onClick={fetchHint} disabled={hintLoading} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50">
                  <Brain className="h-3.5 w-3.5" /> {hintLoading ? "Thinking" : "Get Hint"}
                </button>
              </div>
            )}
          </div>

          <div className="h-[calc(14rem-41px)] overflow-auto p-4">
            {activeTab === "console" ? (
              <div className="space-y-3">
                {verdict && (
                  <div className={`inline-flex items-center gap-2 rounded border px-3 py-1 text-xs font-semibold ${verdict === "Accepted" ? "border-easy/30 bg-easy/10 text-easy" : "border-hard/30 bg-hard/10 text-hard"}`}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> {verdict}
                  </div>
                )}
                <pre className="whitespace-pre-wrap font-mono text-xs leading-5 text-muted-foreground">{output || "Run sample cases or submit to evaluate all configured tests."}</pre>
                {hintResponse ? (
                  <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-primary">{learnerLabels[hintResponse.learnerLevel]} hint</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">{hintResponse.topic} - {learnerDescriptions[hintResponse.learnerLevel]}</p>
                      </div>
                      <span className="rounded border border-primary/20 px-2 py-0.5 text-[11px] font-medium text-primary">Practice only</span>
                    </div>

                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {hintResponse.sections.map((section) => (
                        <div key={section.title} className="rounded border border-border/70 bg-background/70 p-2.5">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground">{section.title}</p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">{section.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : hint ? (
                  <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs leading-5 text-foreground">{hint}</div>
                ) : null}
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.length ? (
                  submissions.map((s, index) => {
                    const isSelected = selectedSubmissionId === s.id || (!selectedSubmissionId && index === 0);
                    return (
                      <div key={s.id || index} className={`rounded border ${isSelected ? "border-primary/40 bg-primary/5" : "border-border bg-surface"}`}>
                        <button
                          onClick={() => setSelectedSubmissionId(s.id)}
                          className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className={`font-semibold ${s.status === "Accepted" ? "text-easy" : "text-hard"}`}>{s.status}</span>
                            <span className="text-muted-foreground">{s.language}</span>
                            <span className="text-muted-foreground">{s.test_cases_passed}/{s.test_cases_total} tests</span>
                          </div>
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {s.created_at ? new Date(s.created_at).toLocaleString() : "Just now"}
                          </span>
                        </button>

                        {isSelected && (
                          <div className="border-t border-border px-3 py-2">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Submitted code</span>
                              <button
                                onClick={() => setCode(s.code || starterCode[language] || fallbackStarter[language])}
                                className="rounded border border-border px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                              >
                                Load in editor
                              </button>
                            </div>
                            <pre className="max-h-40 overflow-auto rounded bg-background p-3 font-mono text-[11px] leading-5 text-muted-foreground">
                              {s.code || "Code is not available for this submission."}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded border border-dashed border-border bg-surface p-4 text-xs text-muted-foreground">
                    No submissions yet. After you submit, your code will appear here and the editor will reset for a fresh attempt.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {isContestMode && isLocked && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/85 p-6">
            <div className="w-full max-w-sm rounded-md border border-hard/40 bg-card p-5 text-center">
              <p className="font-semibold text-hard">Contest Locked</p>
              <p className="mt-2 text-sm text-muted-foreground">{violationReason}</p>
              <button className="mt-4 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background" onClick={() => navigate({ to: "/contest" })}>
                Exit Contest
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default ProblemPage;
