import type { Difficulty } from "@/lib/problems-data";

interface ProblemFiltersProps {
  selectedDifficulty: Difficulty | "All";
  onDifficultyChange: (d: Difficulty | "All") => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  allTags: string[];
}

const difficulties: (Difficulty | "All")[] = ["All", "Easy", "Medium", "Hard"];

export function ProblemFilters({ selectedDifficulty, onDifficultyChange, selectedTags, onTagToggle, allTags }: ProblemFiltersProps) {
  return (
    <aside className="w-full shrink-0 rounded-md border border-border bg-card p-4 lg:w-64">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Difficulty</h3>
        <div className="mt-3 grid grid-cols-4 gap-1 lg:grid-cols-1">
          {difficulties.map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => onDifficultyChange(difficulty)}
              className={`rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                selectedDifficulty === difficulty
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {difficulty}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Topics</h3>
          {selectedTags.length > 0 && <span className="text-[11px] text-primary">{selectedTags.length} selected</span>}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                selectedTags.includes(tag)
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
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
