import { Link } from "@tanstack/react-router";
import { DifficultyBadge } from "./DifficultyBadge";
import { StatusIcon } from "./StatusIcon";

type Status = "solved" | "attempted" | "unsolved";

interface Problem {
  id: number;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status?: string;
  tags?: string[];
  acceptance_rate?: number;
  acceptanceRate?: number;
}

interface ProblemTableProps {
  problems: Problem[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ProblemTable({ problems, currentPage, totalPages, onPageChange }: ProblemTableProps) {
  return (
    <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-border bg-surface text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="w-14 px-4 py-3">Status</th>
              <th className="px-4 py-3">Title</th>
              <th className="w-40 px-4 py-3">Topics</th>
              <th className="w-28 px-4 py-3">Difficulty</th>
              <th className="w-28 px-4 py-3 text-right">Acceptance</th>
            </tr>
          </thead>

          <tbody>
            {problems.map((problem) => {
              const acceptance = problem.acceptanceRate ?? problem.acceptance_rate ?? 0;
              const safeStatus: Status = problem.status === "solved" || problem.status === "attempted" ? problem.status : "unsolved";

              return (
                <tr key={problem.id} className="border-b border-border/60 transition-colors last:border-b-0 hover:bg-surface-hover">
                  <td className="px-4 py-3">
                    <StatusIcon status={safeStatus} />
                  </td>

                  <td className="px-4 py-3">
                    <Link
                      to="/problems/$problemId"
                      params={{ problemId: problem.slug }}
                      className="text-sm font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {problem.id}. {problem.title}
                    </Link>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex max-w-48 flex-wrap gap-1">
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

                  <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                    {Number(acceptance).toFixed(1)}%
                  </td>
                </tr>
              );
            })}
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
