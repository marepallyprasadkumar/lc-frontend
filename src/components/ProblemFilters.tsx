import type { Difficulty, RecencyPeriod } from "@/lib/problems-data";
import { supportedCompanies } from "@/lib/problems-data";
import { Building2, Flame, Clock } from "lucide-react";

interface ProblemFiltersProps {
  selectedDifficulty: Difficulty | "All";
  onDifficultyChange: (d: Difficulty | "All") => void;
  selectedCompany: string;
  onCompanyChange: (company: string) => void;
  selectedRecency: RecencyPeriod | "all";
  onRecencyChange: (recency: RecencyPeriod | "all") => void;
  onlyHighFrequency: boolean;
  onHighFrequencyToggle: () => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  allTags: string[];
  onResetFilters: () => void;
}

const difficulties: (Difficulty | "All")[] = ["All", "Easy", "Medium", "Hard"];
const recencyOptions: { label: string; value: RecencyPeriod | "all" }[] = [
  { label: "All Time", value: "all" },
  { label: "< 30 Days", value: "30_days" },
  { label: "< 6 Months", value: "6_months" },
  { label: "< 1 Year", value: "1_year" },
];

export function ProblemFilters({
  selectedDifficulty,
  onDifficultyChange,
  selectedCompany,
  onCompanyChange,
  selectedRecency,
  onRecencyChange,
  onlyHighFrequency,
  onHighFrequencyToggle,
  selectedTags,
  onTagToggle,
  allTags,
  onResetFilters,
}: ProblemFiltersProps) {
  const activeFilterCount =
    (selectedDifficulty !== "All" ? 1 : 0) +
    (selectedCompany !== "All" ? 1 : 0) +
    (selectedRecency !== "all" ? 1 : 0) +
    (onlyHighFrequency ? 1 : 0) +
    selectedTags.length;

  return (
    <aside className="w-full shrink-0 space-y-6 rounded-lg border border-border bg-card p-4 lg:w-72">
      {/* Header & Reset */}
      <div className="flex items-center justify-between border-b border-border/70 pb-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Filters</h2>
        {activeFilterCount > 0 && (
          <button
            onClick={onResetFilters}
            className="text-[11px] font-medium text-primary hover:underline"
          >
            Reset all ({activeFilterCount})
          </button>
        )}
      </div>

      {/* High Frequency Flame Toggle */}
      <div>
        <button
          onClick={onHighFrequencyToggle}
          className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-xs font-semibold transition-all ${
            onlyHighFrequency
              ? "border-amber-500/50 bg-amber-500/10 text-amber-400 shadow-sm shadow-amber-500/10"
              : "border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-2">
            <Flame className={`h-4 w-4 ${onlyHighFrequency ? "fill-amber-400 text-amber-400" : "text-amber-500"}`} />
            <span>Top Interview Hot Questions</span>
          </div>
          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">🔥 Top</span>
        </button>
      </div>

      {/* Target Company Filter */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          <Building2 className="h-3.5 w-3.5 text-primary" />
          <span>Target Company</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onCompanyChange("All")}
            className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              selectedCompany === "All"
                ? "border-primary/50 bg-primary/10 text-primary font-semibold"
                : "border-border bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            All Companies
          </button>
          {supportedCompanies.map((c) => (
            <button
              key={c.name}
              onClick={() => onCompanyChange(c.name)}
              className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                selectedCompany === c.name
                  ? "border-primary/50 bg-primary/10 text-primary font-semibold"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Interview Recency Filter */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span>Interview Recency</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {recencyOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onRecencyChange(opt.value)}
              className={`rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                selectedRecency === opt.value
                  ? "border-primary/50 bg-primary/10 text-primary font-semibold"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Difficulty</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => onDifficultyChange(d)}
              className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                selectedDifficulty === d
                  ? "border-primary/50 bg-primary/10 text-primary font-semibold"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Topic Filter */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Topics</h3>
          {selectedTags.length > 0 && <span className="text-[11px] text-primary">{selectedTags.length} active</span>}
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                selectedTags.includes(tag)
                  ? "border-primary/50 bg-primary/10 text-primary font-semibold"
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

