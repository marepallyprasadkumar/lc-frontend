import { createFileRoute, useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/problems/$problemId")({
  component: ProblemPage,
});

function ProblemPage() {
  const { problemId } = useParams({ strict: false }) as {
    problemId: string;
  };
  const search = useSearch({ strict: false }) as {
    mode?: "practice" | "contest";
  };
  const navigate = useNavigate();

  const mode = search.mode === "contest" ? "contest" : "practice";
  const isContestMode = mode === "contest";

  const slug = problemId;

  const [problem, setProblem] = useState<any>(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [verdict, setVerdict] = useState("");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"run" | "submissions">("run");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hint, setHint] = useState("");
  const [hintLoading, setHintLoading] = useState(false);

  const codeKey = useMemo(
    () => `${isContestMode ? "contest" : "practice"}_code_${problem?.id ?? ""}`,
    [isContestMode, problem?.id]
  );

  useEffect(() => {
    fetch(`http://localhost:5000/api/problems/slug/${slug}`)
      .then((res) => res.json())
      .then((data) => setProblem(data.problem))
      .catch(console.error);
  }, [slug]);

  useEffect(() => {
    if (!problem?.id) return;
    const saved = localStorage.getItem(codeKey);
    setCode(saved || "# Write your solution here");
  }, [problem?.id, codeKey]);

  useEffect(() => {
    if (!problem?.id) return;
    localStorage.setItem(codeKey, code);
  }, [code, problem?.id, codeKey]);

  useEffect(() => {
    if (!problem?.id || isContestMode) return;

    fetch(`http://localhost:5000/api/code/submissions/${problem.id}`)
      .then((res) => res.json())
      .then((data) => {
        const safe = Array.isArray(data) ? data : data.data || [];
        setSubmissions(safe);
      })
      .catch(console.error);
  }, [problem?.id, isContestMode]);

  useEffect(() => {
    if (!isContestMode) return;

    const enterFullscreen = async () => {
      if (document.fullscreenElement) {
        setIsFullscreen(true);
        return;
      }

      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch {
        setIsFullscreen(false);
      }
    };

    enterFullscreen();

    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [isContestMode]);

  if (!problem) return <div className="p-6">Loading...</div>;

  const runCode = async () => {
    const res = await fetch("http://localhost:5000/api/code/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, problemId: problem.id, language: "python" }),
    });

    const data = await res.json();
    setVerdict(data.verdict);

    const formatted = (data.results || [])
      .map(
        (r: any, i: number) => `\nTest ${i + 1}\nInput: ${r.input}\nExpected: ${r.expected}\nOutput: ${r.output}\nResult: ${r.passed ? "Passed" : "Failed"}`
      )
      .join("\n");

    setOutput(formatted || "No sample tests available.");
  };

  const submitCode = async () => {
    const res = await fetch("http://localhost:5000/api/code/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, problemId: problem.id, language: "python" }),
    });

    const data = await res.json();

    setVerdict(data.verdict);
    setOutput(`Passed ${data.passed}/${data.total}`);

    if (data.submission && !isContestMode) {
      setSubmissions((prev) => [data.submission, ...prev]);
    }
  };

  const fetchHint = async () => {
    if (isContestMode) return;

    setHintLoading(true);
    setHint("");

    try {
      const res = await fetch("http://localhost:5000/api/code/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemTitle: problem.title,
          problemDescription: problem.description,
          code,
        }),
      });

      const data = await res.json();
      setHint(data.hint || "Hint unavailable right now.");
    } catch {
      setHint("Could not fetch hint. Please try again.");
    } finally {
      setHintLoading(false);
    }
  };

  return (
    <div className="grid h-screen grid-cols-2">
      <div className="overflow-y-auto border-r border-gray-800 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{problem.title}</h1>
          <span className="rounded bg-gray-800 px-2 py-1 text-xs uppercase tracking-wide text-gray-200">
            {isContestMode ? "Contest Mode" : "Practice Mode"}
          </span>
        </div>

        <p className="mt-2">{problem.description}</p>
        <p className="mt-3 font-semibold">Difficulty: {problem.difficulty}</p>

        {isContestMode && !isFullscreen && (
          <p className="mt-4 rounded bg-yellow-900/40 p-2 text-sm text-yellow-300">
            Full-screen exited. Re-enter full-screen for assessment integrity.
          </p>
        )}
      </div>

      <div className="flex flex-col bg-black p-4 text-white">
        {!isContestMode && (
          <div className="mb-2 flex gap-6 border-b border-gray-700">
            <button
              onClick={() => setActiveTab("run")}
              className={activeTab === "run" ? "text-green-400" : "text-gray-400"}
            >
              Run
            </button>
            <button
              onClick={() => setActiveTab("submissions")}
              className={activeTab === "submissions" ? "text-green-400" : "text-gray-400"}
            >
              Submissions
            </button>
          </div>
        )}

        {(isContestMode || activeTab === "run") ? (
          <>
            <textarea
              className="flex-1 rounded border border-gray-800 bg-black p-2 font-mono text-white"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <div className="mt-2 flex flex-wrap gap-2">
              <button className="rounded bg-green-500 p-2" onClick={runCode}>Run</button>
              <button className="rounded bg-blue-600 p-2" onClick={submitCode}>Submit</button>
              {!isContestMode && (
                <button
                  className="rounded bg-purple-600 p-2"
                  onClick={fetchHint}
                  disabled={hintLoading}
                >
                  {hintLoading ? "Getting Hint..." : "AI Hint"}
                </button>
              )}
              {isContestMode && (
                <button
                  className="rounded bg-gray-700 p-2"
                  onClick={() => navigate({ to: "/contest" })}
                >
                  Exit Contest
                </button>
              )}
            </div>

            {verdict && (
              <div className={`mt-2 p-2 text-center font-bold ${verdict === "Accepted" ? "bg-green-700" : "bg-red-700"}`}>
                {verdict}
              </div>
            )}

            {!!output && <pre className="mt-3 bg-gray-900 p-3 text-green-400">{output}</pre>}
            {!isContestMode && !!hint && <div className="mt-3 rounded bg-indigo-950 p-3 text-indigo-200">{hint}</div>}
          </>
        ) : (
          <div className="mt-3 bg-gray-900 p-3">
            {submissions.length > 0 ? (
              submissions.map((s) => (
                <div key={s.id} className="flex justify-between border-b py-2">
                  <div>
                    <span className={s.status === "Accepted" ? "text-green-400" : "text-red-400"}>{s.status}</span>
                    <span className="ml-2">{s.language}</span>
                    <span className="ml-2">{s.test_cases_passed}/{s.test_cases_total}</span>
                  </div>
                  <div className="text-xs">{new Date(s.created_at).toLocaleString()}</div>
                </div>
              ))
            ) : (
              <div>No submissions yet</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProblemPage;
