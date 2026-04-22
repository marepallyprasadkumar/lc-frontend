import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contest")({
  component: () => (
    <div className="mx-auto max-w-5xl px-6 py-20 text-center">
      <h1 className="text-2xl font-bold text-foreground">Contests</h1>
      <p className="mt-2 text-sm text-muted-foreground">Weekly and biweekly contests coming soon.</p>
    </div>
  ),
});
