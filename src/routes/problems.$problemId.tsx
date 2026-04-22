import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import axios from "axios";

export const Route = createFileRoute("/problems/$problemId")({
  component: ProblemPage,
});

function ProblemPage() {
  // Get slug from URL
  const { problemId } = useParams({ strict: false }) as {
    problemId: string;
  };

  const slug = problemId;

  // State
  const [problem, setProblem] = useState<any>(null);
  const [code, setCode] = useState("print('Hello')");
  const [output, setOutput] = useState("");
  const [verdict, setVerdict] = useState("");

  // Fetch problem from backend
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/problems/slug/${slug}`)
      .then((res) => {
        // ✅ FIXED HERE (IMPORTANT)
        setProblem(res.data.problem);
      })
      .catch((err) => {
        console.error("Error fetching problem:", err);
        setProblem(null);
      });
  }, [slug]);

  // Loading state
  if (!problem) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-2 h-screen">

      {/* LEFT SIDE */}
      <div className="p-6 overflow-y-auto border-r">
        <h1 className="text-2xl font-bold">{problem.title}</h1>
        <p className="mt-4">{problem.description}</p>
        <p className="mt-2 font-semibold">
          Difficulty: {problem.difficulty}
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="bg-black text-white p-4 flex flex-col">

        {/* CODE EDITOR */}
        <textarea
          className="flex-1 bg-black text-white p-2 font-mono outline-none"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        {/* RUN BUTTON */}
        <button
          className="bg-green-500 hover:bg-green-600 mt-2 p-2 rounded"
          onClick={async () => {
            try {
              const res = await fetch("http://localhost:5000/api/code/run", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  code,
                  problemId: problem.id,
                }),
              });

              const data = await res.json();

              if (data.success) {
                setVerdict(data.verdict);

                const formatted = data.results
                  .map((r: any, i: number) => {
                    return `Test ${i + 1}:
Input: ${r.input}
Expected: ${r.expected}
Output: ${r.output}
Result: ${r.passed ? "✅ Passed" : "❌ Failed"}`;
                  })
                  .join("\n\n");

                setOutput(formatted);
              } else {
                setOutput(data.error || "Error running code");
              }
            } catch (err) {
              console.error(err);
              setOutput("Server error");
            }
          }}
        >
          Run Code
        </button>

        {/* VERDICT */}
        {verdict && (
          <div
            className={`mt-2 p-2 rounded text-center font-bold ${
              verdict === "Accepted"
                ? "bg-green-700"
                : "bg-red-700"
            }`}
          >
            {verdict}
          </div>
        )}

        {/* OUTPUT */}
        <pre className="mt-3 bg-gray-900 p-3 text-green-400 min-h-[150px] rounded whitespace-pre-wrap">
          {output}
        </pre>

      </div>
    </div>
  );
}

export default ProblemPage;