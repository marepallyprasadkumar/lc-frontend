import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getProblems } from "@/lib/api";
import { ProblemFilters } from "@/components/ProblemFilters";
import { ProblemTable } from "@/components/ProblemTable";
import type { RecencyPeriod } from "@/lib/problems-data";
import { supportedCompanies } from "@/lib/problems-data";
import { Building2, Sparkles, Flame, ShieldAlert } from "lucide-react";

const PAGE_SIZE = 12;

export const Route = createFileRoute("/problems/")({
  head: () => ({
    meta: [
      { title: "Problems - CodeArena" },
      {
        name: "description",
        content: "Browse and solve coding problems by difficulty, company tags, interview frequency, and topic.",
      },
    ],
  }),
  component: ProblemsPage,
});

function ProblemsPage() {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard" | "All">("All");
  const [selectedCompany, setSelectedCompany] = useState<string>("All");
  const [selectedRecency, setSelectedRecency] = useState<RecencyPeriod | "all">("all");
  const [onlyHighFrequency, setOnlyHighFrequency] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getProblems()
      .then((data) => setProblems(data))
      .catch(() => setProblems([]))
      .finally(() => setLoading(false));
  }, []);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    problems.forEach((p) => (p.tags || []).forEach((tag: string) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [problems]);

  const filtered = useMemo(() => {
    return problems.filter((problem) => {
      // Difficulty filter
      if (difficulty !== "All" && problem.difficulty !== difficulty) return false;

      // High Frequency filter
      if (onlyHighFrequency && (problem.flameRating || 1) < 2 && (problem.frequencyScore || 0) < 85) {
        return false;
      }

      // Company filter
      if (selectedCompany !== "All") {
        const matchesCompany = (problem.companies || []).some(
          (c: any) => c.company.toLowerCase() === selectedCompany.toLowerCase()
        );
        if (!matchesCompany) return false;
      }

      // Recency filter
      if (selectedRecency !== "all") {
        const matchesRecency = (problem.companies || []).some((c: any) => {
          if (selectedCompany !== "All" && c.company.toLowerCase() !== selectedCompany.toLowerCase()) {
            return false;
          }
          if (selectedRecency === "30_days") return c.recency === "30_days";
          if (selectedRecency === "6_months") return c.recency === "30_days" || c.recency === "6_months";
          if (selectedRecency === "1_year") return c.recency !== "all_time";
          return true;
        });
        if (!matchesRecency) return false;
      }

      // Tags filter
      if (selectedTags.length > 0 && !(problem.tags || []).some((tag: string) => selectedTags.includes(tag))) {
        return false;
      }

      return true;
    });
  }, [problems, difficulty, selectedCompany, selectedRecency, onlyHighFrequency, selectedTags]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = useMemo(
    () => ({
      total: problems.length,
      easy: problems.filter((p) => p.difficulty === "Easy").length,
      medium: problems.filter((p) => p.difficulty === "Medium").length,
      hard: problems.filter((p) => p.difficulty === "Hard").length,
    }),
    [problems]
  );

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]));
    setPage(1);
  };

  const handleDifficultyChange = (value: "Easy" | "Medium" | "Hard" | "All") => {
    setDifficulty(value);
    setPage(1);
  };

  const resetAllFilters = () => {
    setDifficulty("All");
    setSelectedCompany("All");
    setSelectedRecency("all");
    setOnlyHighFrequency(false);
    setSelectedTags([]);
    setPage(1);
  };

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading problems...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header & Quick Stats */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
              <Flame className="h-3.5 w-3.5 fill-amber-400" /> Company Tagging & Frequency Active
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Problems Library</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Filter questions by real-world tech interview recency, frequency heat indicators, and target companies.
          </p>
        </div>

        <div className="grid grid-cols-4 overflow-hidden rounded-md border border-border bg-surface text-center">
          <div className="px-4 py-2">
            <p className="text-lg font-semibold text-foreground">{counts.total}</p>
            <p className="text-[11px] text-muted-foreground">All</p>
          </div>
          <div className="border-l border-border px-4 py-2">
            <p className="text-lg font-semibold text-easy">{counts.easy}</p>
            <p className="text-[11px] text-muted-foreground">Easy</p>
          </div>
          <div className="border-l border-border px-4 py-2">
            <p className="text-lg font-semibold text-medium">{counts.medium}</p>
            <p className="text-[11px] text-muted-foreground">Medium</p>
          </div>
          <div className="border-l border-border px-4 py-2">
            <p className="text-lg font-semibold text-hard">{counts.hard}</p>
            <p className="text-[11px] text-muted-foreground">Hard</p>
          </div>
        </div>
      </div>

      {/* Featured Company Assessment Banner */}
      <div className="mb-6 rounded-lg border border-primary/30 bg-gradient-to-r from-primary/10 via-background to-amber-500/10 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Prepare for Target Company Interview Rounds</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Simulate timed Online Assessments (OA) and Onsite rounds for Google, Meta, Amazon, Microsoft, and Apple.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {supportedCompanies.slice(0, 5).map((comp) => (
              <button
                key={comp.name}
                onClick={() => {
                  setSelectedCompany(comp.name);
                  setPage(1);
                }}
                className={`rounded border px-2.5 py-1 text-xs font-semibold transition-all ${
                  selectedCompany === comp.name
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {comp.name}
              </button>
            ))}
            <Link
              to="/company-assessment"
              className="ml-2 inline-flex items-center gap-1.5 rounded bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Sparkles className="h-3.5 w-3.5" /> Start Mock Interview
            </Link>
          </div>
        </div>
      </div>

      {/* Main Filter & Table Grid */}
      <div className="flex flex-col gap-6 lg:flex-row">
        <ProblemFilters
          selectedDifficulty={difficulty}
          onDifficultyChange={handleDifficultyChange}
          selectedCompany={selectedCompany}
          onCompanyChange={(c) => {
            setSelectedCompany(c);
            setPage(1);
          }}
          selectedRecency={selectedRecency}
          onRecencyChange={(r) => {
            setSelectedRecency(r);
            setPage(1);
          }}
          onlyHighFrequency={onlyHighFrequency}
          onHighFrequencyToggle={() => {
            setOnlyHighFrequency((prev) => !prev);
            setPage(1);
          }}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
          allTags={allTags}
          onResetFilters={resetAllFilters}
        />

        <ProblemTable
          problems={paginated}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

