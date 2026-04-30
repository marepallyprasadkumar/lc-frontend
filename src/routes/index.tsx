import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Brain, Code2, ShieldCheck, Trophy } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Coding Platform" },
      { name: "description", content: "Practice problems, run code, join contests, and learn with guided hints." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <section className="flex min-h-[calc(100vh-9rem)] flex-col justify-center">
        <div className="max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Coding platform</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-foreground lg:text-6xl">
            Practice, compete, and improve problem-solving skills.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            A focused coding platform with curated problems, real code execution, hidden test evaluation, contest mode, and guided learning support for practice.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/problems" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Start Solving <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/contest" className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-hover">
              Contest Mode
            </Link>
          </div>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-4">
          {[
            { icon: Code2, title: "Online judge", desc: "Run and submit code against sample and hidden test cases." },
            { icon: Brain, title: "Guided hints", desc: "Beginner, intermediate, and advanced hints for learning." },
            { icon: ShieldCheck, title: "Exam control", desc: "Fullscreen contest mode keeps assessments focused." },
            { icon: Trophy, title: "Progress tracking", desc: "Dashboard, submissions, streaks, and topic progress." },
          ].map((item) => (
            <div key={item.title} className="rounded-md border border-border bg-card p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-primary">
                <item.icon className="h-4 w-4" />
              </div>
              <h2 className="mt-4 text-sm font-semibold text-foreground">{item.title}</h2>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
