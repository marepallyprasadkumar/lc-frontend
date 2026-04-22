import { Link } from "@tanstack/react-router";
import type { Problem } from "@/lib/problems-data";
import { DifficultyBadge } from "./DifficultyBadge";
import { StatusIcon } from "./StatusIcon";

interface ProblemTableProps {
  problems: Problem[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ProblemTable({ problems, currentPage, totalPages, onPageChange }: ProblemTableProps) {
  return (
    <div className="flex-1">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="w-12 pb-3 pl-4">Status</th>
            <th className="pb-3 pl-4">Title</th>
            <th className="w-24 pb-3">Difficulty</th>
            <th className="w-28 pb-3 pr-4 text-right">Acceptance</th>
          </tr>
        </thead>
        <tbody>
          {problems.map((problem, i) => (
            <tr
              key={problem.id}
              className={`border-b border-border/50 transition-colors hover:bg-surface-hover ${
                i % 2 === 0 ? "bg-transparent" : "bg-surface/40"
              }`}
            >
              <td className="py-3 pl-4">
                <StatusIcon status={problem.status} />
              </td>
              <td className="py-3 pl-4">
                <Link
                  to="/problems/$problemId"
                  params={{ problemId: String(problem.id) }}
                  className="text-sm text-foreground transition-colors hover:text-primary"
                >
                  {problem.id}. {problem.title}
                </Link>
              </td>
              <td className="py-3">
                <DifficultyBadge difficulty={problem.difficulty} />
              </td>
              <td className="py-3 pr-4 text-right text-sm text-muted-foreground">
                {problem.acceptance.toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 py-4">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`h-7 w-7 rounded text-xs transition-colors ${
                page === currentPage
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
