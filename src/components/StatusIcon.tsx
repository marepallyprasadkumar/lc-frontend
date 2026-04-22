import type { Status } from "@/lib/problems-data";

export function StatusIcon({ status }: { status: Status }) {
  if (status === "solved") {
    return (
      <svg className="h-4 w-4 text-easy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === "attempted") {
    return (
      <div className="h-2.5 w-2.5 rounded-full border-2 border-medium" />
    );
  }
  return <div className="h-4 w-4" />;
}
