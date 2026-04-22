import type { Difficulty } from "@/lib/problems-data";

interface ProblemFiltersProps {
  selectedDifficulty: Difficulty | "All";
  onDifficultyChange: (d: Difficulty | "All") => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  allTags: string[];
}

const difficulties: (Difficulty | "All")[] = ["All", "Easy", "Medium", "Hard"];
const diffColors: Record<string, string> = {
  All: "text-foreground border-border",
  Easy: "text-easy border-easy/40",
  Medium: "text-medium border-medium/40",
  Hard: "text-hard border-hard/40",
};

export function ProblemFilters({ selectedDifficulty, onDifficultyChange, selectedTags, onTagToggle, allTags }: ProblemFiltersProps) {
  return (
    <aside className="w-56 shrink-0 space-y-6">
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Difficulty</h3>
        <div className="space-y-1.5">
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => onDifficultyChange(d)}
              className={`flex w-full items-center rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
                selectedDifficulty === d
                  ? `${diffColors[d]} bg-surface-hover`
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tags</h3>
        <div className="flex flex-wrap gap-1.5">
          {allTags.slice(0, 20).map((tag) => (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${
                selectedTags.includes(tag)
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
