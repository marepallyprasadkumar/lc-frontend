import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { getProblems } from "@/lib/api";
import { ProblemTable } from "@/components/ProblemTable";
import { ProblemFilters } from "@/components/ProblemFilters";

const PAGE_SIZE = 15;

export const Route = createFileRoute("/problems/")({
  head: () => ({
    meta: [
      { title: "Problems — CodeArena" },
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

  const [difficulty, setDifficulty] = useState<
    "Easy" | "Medium" | "Hard" | "All"
  >("All");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  // ✅ FIXED FETCH
  useEffect(() => {
    getProblems()
      .then((data) => {
        console.log("PROBLEMS:", data); // debug
        setProblems(data); // ✅ IMPORTANT FIX
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  // Extract tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    problems.forEach((p) =>
      (p.tags || []).forEach((t: string) => tagSet.add(t))
    );
    return Array.from(tagSet);
  }, [problems]);

  // Filtering
  const filtered = useMemo(() => {
    return problems.filter((p) => {
      if (difficulty !== "All" && p.difficulty !== difficulty) return false;

      if (
        selectedTags.length > 0 &&
        !(p.tags || []).some((t: string) => selectedTags.includes(t))
      ) {
        return false;
      }

      return true;
    });
  }, [problems, difficulty, selectedTags]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
    setPage(1);
  };

  const handleDifficultyChange = (
    d: "Easy" | "Medium" | "Hard" | "All"
  ) => {
    setDifficulty(d);
    setPage(1);
  };

  // Counts
  const counts = useMemo(
    () => ({
      total: problems.length,
      easy: problems.filter((p) => p.difficulty === "Easy").length,
      medium: problems.filter((p) => p.difficulty === "Medium").length,
      hard: problems.filter((p) => p.difficulty === "Hard").length,
    }),
    [problems]
  );

  // Loading UI
  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-lg font-bold text-foreground">Problems</h1>

        <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
          <span>
            All{" "}
            <span className="text-foreground font-medium">
              {counts.total}
            </span>
          </span>

          <span>
            Easy{" "}
            <span className="text-easy font-medium">
              {counts.easy}
            </span>
          </span>

          <span>
            Medium{" "}
            <span className="text-medium font-medium">
              {counts.medium}
            </span>
          </span>

          <span>
            Hard{" "}
            <span className="text-hard font-medium">
              {counts.hard}
            </span>
          </span>
        </div>
      </div>

      <div className="flex gap-8">
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