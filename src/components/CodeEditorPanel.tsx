import { useState } from "react";
import Editor from "@monaco-editor/react";

interface CodeEditorPanelProps {
  starterCode: Record<string, string>;
}

const languages = ["javascript", "python", "cpp", "java"] as const;
const languageLabels: Record<string, string> = {
  javascript: "JavaScriptandwherejs",
  python: "Python",
  cpp: "C++",
  java: "Java",
};

const monacoLangMap: Record<string, string> = {
  javascript: "javascript",
  python: "python",
  cpp: "cpp",
  java: "java",
};

export function CodeEditorPanel({ starterCode }: CodeEditorPanelProps) {
  const [language, setLanguage] = useState<string>("javascript");
  const [code, setCode] = useState(starterCode.javascript || "");
  const [output, setOutput] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"testcase" | "result">("testcase");

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(starterCode[lang] || "// Write your solution here");
  };

  const handleRun = () => {
    setActiveTab("result");
    setOutput("✓ Accepted\n\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExpected: [0,1]\n\nRuntime: 4 ms\nMemory: 42.3 MB");
  };

  const handleSubmit = () => {
    setActiveTab("result");
    setOutput("✓ Accepted\n\nRuntime: 4 ms — Beats 89.23%\nMemory: 42.3 MB — Beats 76.45%\n\n52/52 test cases passed.");
  };

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border bg-nav px-3 py-1.5">
        <div className="flex items-center gap-1">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                language === lang
                  ? "bg-surface-hover text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {languageLabels[lang]}
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={monacoLangMap[language]}
          value={code}
          onChange={(v) => setCode(v || "")}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: "var(--font-mono)",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 12 },
            lineNumbers: "on",
            renderLineHighlight: "line",
            cursorBlinking: "smooth",
            automaticLayout: true,
            tabSize: 4,
          }}
        />
      </div>

      {/* Output / Console */}
      <div className="border-t border-border">
        <div className="flex items-center justify-between border-b border-border bg-nav px-3">
          <div className="flex">
            <button
              onClick={() => setActiveTab("testcase")}
              className={`border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === "testcase" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Testcase
            </button>
            <button
              onClick={() => setActiveTab("result")}
              className={`border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === "result" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Result
            </button>
          </div>

          <div className="flex items-center gap-2 py-1.5">
            <button
              onClick={handleRun}
              className="rounded-md border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-surface-hover"
            >
              Run
            </button>
            <button
              onClick={handleSubmit}
              className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Submit
            </button>
          </div>
        </div>

        <div className="h-32 overflow-auto bg-background p-3">
          {activeTab === "result" && output ? (
            <pre className="whitespace-pre-wrap font-mono text-xs text-easy">{output}</pre>
          ) : (
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Input:</label>
              <textarea
                className="w-full rounded border border-border bg-input p-2 font-mono text-xs text-foreground outline-none focus:border-primary"
                rows={2}
                defaultValue="nums = [2,7,11,15], target = 9"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
