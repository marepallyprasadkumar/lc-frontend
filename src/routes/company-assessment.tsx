import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getProblems } from "@/lib/api";
import { supportedCompanies } from "@/lib/problems-data";
import {
  Building2,
  Clock,
  ExternalLink,
  Flame,
  Globe2,
  LockKeyhole,
  Play,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/company-assessment")({
  head: () => ({
    meta: [
      { title: "Company Mock Assessment - CodeArena" },
      {
        name: "description",
        content: "Simulate timed coding interview rounds for Google, Meta, Amazon, Microsoft, and Apple.",
      },
    ],
  }),
  component: CompanyAssessmentPage,
});

type RoundType = "oa" | "phone" | "onsite";

interface AssessmentPreset {
  id: RoundType;
  title: string;
  duration: number; // minutes
  description: string;
  count: number;
  badge: string;
}

const presets: AssessmentPreset[] = [
  {
    id: "oa",
    title: "Online Assessment (OA)",
    duration: 70,
    description: "2 Frequently asked interview questions. Standard timed screening test.",
    count: 2,
    badge: "Most Popular",
  },
  {
    id: "phone",
    title: "Technical Phone Screen",
    duration: 45,
    description: "1 Medium/Hard core algorithmic problem. Speed and optimal complexity focused.",
    count: 1,
    badge: "Speed Test",
  },
  {
    id: "onsite",
    title: "Onsite Technical Loop",
    duration: 90,
    description: "3 Problems (1 Easy, 1 Medium, 1 Hard) simulating a full interview loop.",
    count: 3,
    badge: "Full Challenge",
  },
];

const companyStats: Record<string, { totalQuestions: number; avgPassRate: string; topTopic: string }> = {
  Google: { totalQuestions: 42, avgPassRate: "38%", topTopic: "Arrays & Graphs" },
  Meta: { totalQuestions: 38, avgPassRate: "41%", topTopic: "Sliding Window & Hash" },
  Amazon: { totalQuestions: 56, avgPassRate: "45%", topTopic: "Matrix, BFS & Strings" },
  Microsoft: { totalQuestions: 34, avgPassRate: "48%", topTopic: "Dynamic Programming" },
  Apple: { totalQuestions: 29, avgPassRate: "43%", topTopic: "Prefix Sum & Arrays" },
  Netflix: { totalQuestions: 22, avgPassRate: "35%", topTopic: "Two Pointers & Stack" },
  Uber: { totalQuestions: 26, avgPassRate: "39%", topTopic: "DFS & Matrix" },
};

function CompanyAssessmentPage() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("Google");
  const [selectedRound, setSelectedRound] = useState<RoundType>("oa");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProblems()
      .then((data) => setProblems(data))
      .catch(() => setProblems([]))
      .finally(() => setLoading(false));
  }, []);

  const activePreset = useMemo(
    () => presets.find((p) => p.id === selectedRound) || presets[0],
    [selectedRound]
  );

  const matchedProblems = useMemo(() => {
    return problems.filter((p) =>
      (p.companies || []).some((c: any) => c.company.toLowerCase() === selectedCompany.toLowerCase())
    );
  }, [problems, selectedCompany]);

  const candidateProblems = matchedProblems.length > 0 ? matchedProblems : problems;

  const startAssessment = () => {
    if (candidateProblems.length === 0) return;

    // Pick problems for this contest session based on preset count
    const selected = candidateProblems.slice(0, activePreset.count);
    const targetSlug = selected[0]?.slug || "two-sum";

    navigate({
      to: "/problems/$problemId",
      params: { problemId: targetSlug },
      search: {
        mode: "contest",
        duration: String(activePreset.duration),
        company: selectedCompany,
        round: activePreset.id,
      },
    });
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      {/* Header */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" /> Company Interview Simulation
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            Company Mock Assessment Mode
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Simulate realistic timed coding interviews tailored to target tech giants. Problems are automatically selected based on real interview recency and frequency scores.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Anti-Cheat Protected
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Fullscreen active mode. Tab switching or clipboard actions lock your session.
          </p>
        </div>
      </section>

      {/* Grid Section */}
      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left Column: Selector Cards */}
        <div className="space-y-6">
          {/* Company Selection */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" /> Select Target Tech Company
              </h2>
              <span className="text-xs text-muted-foreground">{candidateProblems.length} questions available</span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {supportedCompanies.map((comp) => {
                const isSelected = selectedCompany === comp.name;
                const stats = companyStats[comp.name] || { totalQuestions: 30, avgPassRate: "40%", topTopic: "DSA" };

                return (
                  <button
                    key={comp.name}
                    onClick={() => setSelectedCompany(comp.name)}
                    className={`relative flex flex-col justify-between rounded-lg border p-4 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                        : "border-border bg-background hover:border-border/80 hover:bg-surface-hover"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground">{comp.name}</span>
                        {isSelected && <Sparkles className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">Top: {stats.topTopic}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/50 pt-2">
                      <span>Pass: {stats.avgPassRate}</span>
                      <span className="flex items-center text-amber-400 font-semibold">
                        <Flame className="h-3 w-3 fill-amber-400" /> Hot
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Round Selection */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Select Interview Format
            </h2>

            <div className="grid gap-3 md:grid-cols-3">
              {presets.map((preset) => {
                const isSelected = selectedRound === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedRound(preset.id)}
                    className={`flex flex-col justify-between rounded-lg border p-4 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                        : "border-border bg-background hover:border-border/80 hover:bg-surface-hover"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase tracking-wide text-primary">
                          {preset.badge}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">{preset.duration}m</span>
                      </div>
                      <h3 className="text-sm font-bold text-foreground">{preset.title}</h3>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">{preset.description}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-2 text-[11px] font-semibold text-foreground">
                      <span>{preset.count} {preset.count === 1 ? "Problem" : "Problems"}</span>
                      <span className="text-primary">{preset.duration} Minutes</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Assessment Launch summary */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-6 sticky top-20">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary mb-1">
                <Trophy className="h-4 w-4" /> Ready to begin
              </div>
              <h2 className="text-xl font-bold text-foreground">{selectedCompany} {activePreset.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Your session will launch in strict interview mode with fullscreen enforcement.
              </p>
            </div>

            <div className="space-y-3 rounded-lg border border-border bg-background p-4 text-xs">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Target Company</span>
                <span className="font-bold text-foreground">{selectedCompany}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-bold text-foreground">{activePreset.duration} Minutes</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Problem Count</span>
                <span className="font-bold text-foreground">{activePreset.count} Questions</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">AI Hints</span>
                <span className="font-semibold text-red-400">Disabled (Mock Mode)</span>
              </div>
            </div>

            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-5 text-amber-300">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <LockKeyhole className="h-4 w-4" /> Exam Environment Rules
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>Fullscreen mode must remain active throughout the session.</li>
                <li>Leaving the tab or using copy-paste locks the interview assessment.</li>
              </ul>
            </div>

            <button
              onClick={startAssessment}
              disabled={loading || candidateProblems.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 disabled:opacity-40"
            >
              <Play className="h-4 w-4 fill-primary-foreground" /> Start {selectedCompany} Mock Interview
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
