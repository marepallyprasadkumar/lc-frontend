import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getProblems } from "@/lib/api";
import { ProblemFilters } from "@/components/ProblemFilters";
import { ProblemTable } from "@/components/ProblemTable";

const PAGE_SIZE = 12;

export const Route = createFileRoute("/problems/")({
  head: () => ({
    meta: [
      { title: "Problems - CodeArena" },
      {
        name: "description",
        content: "Browse and solve coding problems by difficulty and topic.",
      },
    ],
  }),
  component: ProblemsPage,
});

function ProblemsPage() {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard" | "All">("All");
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
      if (difficulty !== "All" && problem.difficulty !== difficulty) return false;
      if (selectedTags.length > 0 && !(problem.tags || []).some((tag: string) => selectedTags.includes(tag))) return false;
      return true;
    });
  }, [problems, difficulty, selectedTags]);

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

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading problems...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Practice library</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Problems</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Curated DSA problems with sample and hidden test cases for real judge-style evaluation.
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

      <div className="flex flex-col gap-6 lg:flex-row">
        <ProblemFilters
          selectedDifficulty={difficulty}
          onDifficultyChange={handleDifficultyChange}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
          allTags={allTags}
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
