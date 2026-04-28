import type { Status } from "@/lib/problems-data";

export function StatusIcon({ status }: { status?: string }) {
  if (status === "solved") {
    return <span className="text-green-400">✔</span>;
  }

  if (status === "attempted") {
    return <span className="text-yellow-400">●</span>;
  }

  return <span className="text-gray-500">○</span>;
}