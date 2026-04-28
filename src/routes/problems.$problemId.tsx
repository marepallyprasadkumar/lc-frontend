import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/problems/$problemId")({
  component: ProblemPage,
});

function ProblemPage() {
  const { problemId } = useParams({ strict: false }) as {
    problemId: string;
  };

  const slug = problemId;

  const [problem, setProblem] = useState<any>(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [verdict, setVerdict] = useState("");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"run" | "submissions">("run");

  /* ================= FETCH PROBLEM ================= */
  useEffect(() => {
    fetch(`http://localhost:5000/api/problems/slug/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setProblem(data.problem);
      })
      .catch(console.error);
  }, [slug]);

  /* ================= LOAD SAVED CODE ================= */
  useEffect(() => {
    if (!problem?.id) return;

    const saved = localStorage.getItem(`code_${problem.id}`);
    if (saved) {
      setCode(saved);
    } else {
      setCode("# Write your solution here");
    }
  }, [problem?.id]);

  /* ================= AUTO SAVE CODE ================= */
  useEffect(() => {
    if (!problem?.id) return;
    localStorage.setItem(`code_${problem.id}`, code);
  }, [code, problem?.id]);

  /* ================= FETCH SUBMISSIONS ================= */
  useEffect(() => {
    if (!problem?.id) return;

    fetch(`http://localhost:5000/api/code/submissions/${problem.id}`)
      .then((res) => res.json())
      .then((data) => {
        const safe = Array.isArray(data) ? data : data.data || [];
        setSubmissions(safe);
      })
      .catch(console.error);
  }, [problem?.id]);

  if (!problem) return <div className="p-6">Loading...</div>;

  return (
    <div className="grid grid-cols-2 h-screen">

      {/* LEFT */}
      <div className="p-6 overflow-y-auto border-r border-gray-800">
        <h1 className="text-2xl font-bold">{problem.title}</h1>
        <p className="mt-4">{problem.description}</p>
        <p className="mt-2 font-semibold">
          Difficulty: {problem.difficulty}
        </p>
      </div>

      {/* RIGHT */}
      <div className="bg-black text-white p-4 flex flex-col">

        {/* TABS */}
        <div className="flex gap-6 border-b border-gray-700 mb-2">
          <button onClick={() => setActiveTab("run")}
            className={activeTab === "run" ? "text-green-400" : "text-gray-400"}>
            Run
          </button>

          <button onClick={() => setActiveTab("submissions")}
            className={activeTab === "submissions" ? "text-green-400" : "text-gray-400"}>
            Submissions
          </button>
        </div>

        {activeTab === "run" ? (
          <>
            <textarea
              className="flex-1 bg-black text-white p-2 font-mono border border-gray-800 rounded"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            {/* RUN */}
            <button
              className="bg-green-500 mt-2 p-2 rounded"
              onClick={async () => {
                const res = await fetch("http://localhost:5000/api/code/run", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ code, problemId: problem.id }),
                });

                const data = await res.json();

                setVerdict(data.verdict);

                const formatted = (data.results || [])
                  .map((r: any, i: number) => `
Test ${i + 1}
Input: ${r.input}
Expected: ${r.expected}
Output: ${r.output}
Result: ${r.passed ? "✅" : "❌"}
`).join("\n");

                setOutput(formatted);
              }}
            >
              Run Code
            </button>

            {/* SUBMIT */}
            <button
              className="bg-blue-600 mt-2 p-2 rounded"
              onClick={async () => {
                const res = await fetch("http://localhost:5000/api/code/submit", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ code, problemId: problem.id }),
                });

                const data = await res.json();

                setVerdict(data.verdict);
                setOutput(`Passed ${data.passed}/${data.total}`);

                if (data.submission) {
                  setSubmissions((prev) => [data.submission, ...prev]);
                }
              }}
            >
              Submit
            </button>

            {verdict && (
              <div className={`mt-2 p-2 text-center font-bold ${
                verdict === "Accepted" ? "bg-green-700" : "bg-red-700"
              }`}>
                {verdict}
              </div>
            )}

            <pre className="mt-3 bg-gray-900 p-3 text-green-400">
              {output}
            </pre>
          </>
        ) : (
          <div className="mt-3 bg-gray-900 p-3">
            {submissions.length > 0 ? (
              submissions.map((s) => (
                <div key={s.id} className="flex justify-between border-b py-2">
                  <div>
                    <span className={s.status === "Accepted" ? "text-green-400" : "text-red-400"}>
                      {s.status}
                    </span>
                    <span className="ml-2">{s.language}</span>
                    <span className="ml-2">{s.test_cases_passed}/{s.test_cases_total}</span>
                  </div>
                  <div className="text-xs">
                    {new Date(s.created_at).toLocaleString()}
                  </div>
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