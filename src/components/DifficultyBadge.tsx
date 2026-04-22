import type { Difficulty } from "@/lib/problems-data";

const difficultyStyles: Record<Difficulty, string> = {
  Easy: "text-easy",
  Medium: "text-medium",
  Hard: "text-hard",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`text-xs font-medium ${difficultyStyles[difficulty]}`}>
      {difficulty}
    </span>
  );
}
