const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export async function getProblems() {
  const res = await fetch(`${API}/api/problems`);
  if (!res.ok) throw new Error("Failed to fetch problems");

  const json = await res.json();

  // ✅ HANDLE BOTH CASES SAFELY
  const problems = Array.isArray(json) ? json : json.data ?? [];

  return problems.map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    difficulty: p.difficulty,
    tags: p.tags ?? [],
    acceptanceRate: Number(p.acceptance_rate ?? 0),
    status: p.status,
  }));
}