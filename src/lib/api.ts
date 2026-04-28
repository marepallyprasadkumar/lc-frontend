import { problems as localProblems } from "@/lib/problems-data";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const mapProblem = (p: any) => ({
  id: Number(p.id),
  title: p.title,
  slug: p.slug || slugify(p.title),
  difficulty: p.difficulty,
  tags: p.tags ?? [],
  acceptanceRate: Number(p.acceptance_rate ?? p.acceptance ?? 0),
  status: p.status,
});

const localMapped = () =>
  localProblems.map((p) => ({
    id: Number(p.id),
    title: p.title,
    slug: slugify(p.title),
    difficulty: p.difficulty,
    tags: p.tags ?? [],
    acceptanceRate: Number(p.acceptance ?? 0),
    status: p.status,
  }));

export async function getProblems() {
  const local = localMapped();

  try {
    const res = await fetch(`${API}/api/problems`);
    if (!res.ok) throw new Error("Failed to fetch problems");

    const json = await res.json();
    const remoteRaw = Array.isArray(json) ? json : json.data ?? [];
    const remote = Array.isArray(remoteRaw) ? remoteRaw.map(mapProblem) : [];

    const merged = new Map<string, any>();

    remote.forEach((p) => merged.set(p.slug, p));
    local.forEach((p) => {
      if (!merged.has(p.slug)) merged.set(p.slug, p);
    });

    return Array.from(merged.values()).slice(0, 30);
  } catch {
    return local.slice(0, 30);
  }
}
