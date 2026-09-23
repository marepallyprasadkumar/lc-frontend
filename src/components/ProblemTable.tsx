import { Link } from "@tanstack/react-router";
import { DifficultyBadge } from "./DifficultyBadge";
import { StatusIcon } from "./StatusIcon";
import { Flame } from "lucide-react";
import type { CompanyTag } from "@/lib/problems-data";

type Status = "solved" | "attempted" | "unsolved";

interface Problem {
  id: number;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status?: string;
  tags?: string[];
  companies?: CompanyTag[];
  frequencyScore?: number;
  flameRating?: 1 | 2 | 3;
  acceptance_rate?: number;
  acceptanceRate?: number;
}

interface ProblemTableProps {
  problems: Problem[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const companyBadgeColor: Record<string, string> = {
  Google: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  Meta: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  Amazon: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  Microsoft: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  Apple: "bg-zinc-400/10 text-zinc-300 border-zinc-400/30",
  Netflix: "bg-red-500/10 text-red-400 border-red-500/30",
  Uber: "bg-stone-500/10 text-stone-300 border-stone-400/30",
};

export function ProblemTable({ problems, currentPage, totalPages, onPageChange }: ProblemTableProps) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px]">
          <thead>
            <tr className="border-b border-border bg-surface text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="w-14 px-4 py-3">Status</th>
              <th className="px-4 py-3">Title & Hot Frequency</th>
              <th className="w-48 px-4 py-3">Asked By Companies</th>
              <th className="w-36 px-4 py-3">Topics</th>
              <th className="w-28 px-4 py-3">Difficulty</th>
              <th className="w-28 px-4 py-3 text-right">Acceptance</th>
            </tr>
          </thead>

          <tbody>
            {problems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No problems match your current filters. Try changing or resetting filters.
                </td>
              </tr>
            ) : (
              problems.map((problem) => {
                const acceptance = problem.acceptanceRate ?? problem.acceptance_rate ?? 0;
                const safeStatus: Status = problem.status === "solved" || problem.status === "attempted" ? problem.status : "unsolved";
                const flameCount = problem.flameRating || (problem.frequencyScore && problem.frequencyScore > 90 ? 3 : problem.frequencyScore && problem.frequencyScore > 80 ? 2 : 1) || 1;

                return (
                  <tr key={problem.id} className="border-b border-border/60 transition-colors last:border-b-0 hover:bg-surface-hover">
                    <td className="px-4 py-3">
                      <StatusIcon status={safeStatus} />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to="/problems/$problemId"
                          params={{ problemId: problem.slug }}
                          className="text-sm font-medium text-foreground transition-colors hover:text-primary"
                        >
                          {problem.id}. {problem.title}
                        </Link>

                        {/* Flame Indicator */}
                        <div className="flex items-center text-amber-400" title={`Interview Frequency Score: ${problem.frequencyScore || 80}/100`}>
                          {Array.from({ length: flameCount }).map((_, i) => (
                            <Flame key={i} className="h-3.5 w-3.5 fill-amber-400 stroke-amber-500" />
                          ))}
                        </div>
                      </div>
                    </td>

                    {/* Asked by Companies */}
                    <td className="px-4 py-3">
                      <div className="flex max-w-56 flex-wrap gap-1">
                        {(problem.companies || []).slice(0, 3).map((comp) => (
                          <span
                            key={comp.company}
                            title={`${comp.company} - Frequency ${comp.frequency}% (${comp.recency.replace("_", " ")})`}
                            className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${
                              companyBadgeColor[comp.company] || "border-border bg-background text-muted-foreground"
                            }`}
                          >
                            {comp.company}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex max-w-36 flex-wrap gap-1">
                        {(problem.tags || []).slice(0, 2).map((tag) => (
                          <span key={tag} className="rounded border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <DifficultyBadge difficulty={problem.difficulty} />
                    </td>

                    <td className="px-4 py-3 text-right text-sm text-muted-foreground font-mono">
                      {Number(acceptance).toFixed(1)}%
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

