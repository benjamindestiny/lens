import { ButtonLink } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-base font-semibold tracking-tight text-foreground">lens</span>
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <ButtonLink href="/pricing" variant="ghost" size="sm">
              Pricing
            </ButtonLink>
            <ButtonLink href="/login" variant="ghost" size="sm">
              Log in
            </ButtonLink>
            <ButtonLink href="/signup" size="sm">
              Get started
            </ButtonLink>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-5xl items-center gap-16 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Understand your lecture material, not just read it.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              Upload a PDF or PowerPoint from class. lens finds the topics inside it and
              turns each one into a short lesson you can actually follow.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/signup" size="lg">
                Upload your first lecture
              </ButtonLink>
              <ButtonLink href="/login" variant="secondary" size="lg">
                Log in
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm text-muted">Free to start. No card required.</p>
          </div>

          <HeroVisual />
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold text-foreground">
                From a 90-slide deck to something you can study.
              </h2>
              <p className="mt-3 text-base text-muted">
                Lecturers hand out more material than anyone can revise from. lens breaks it
                into pieces small enough to actually understand.
              </p>
            </div>
            <div className="mt-12 grid gap-10 md:grid-cols-3">
              <Step
                number="1"
                title="Upload your material"
                body="A PDF or PowerPoint from your lecturer. No reformatting, no copying and pasting."
              />
              <Step
                number="2"
                title="Review the topics"
                body="lens finds the topics inside the document. You decide which ones become lessons."
              />
              <Step
                number="3"
                title="Learn topic by topic"
                body="Each topic becomes its own short lesson, so you can focus on the parts you don't understand yet."
              />
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  Built around the material your lecturer gave you.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted">
                  Generic AI assistants will happily explain photosynthesis, but they
                  don&apos;t know what your CSC 103 lecturer emphasised, which examples they
                  used, or what&apos;s actually on your syllabus.
                </p>
                <p className="mt-4 text-base leading-relaxed text-muted">
                  lens reads your document. It keeps your lecturer&apos;s terminology and
                  stays inside the material instead of inventing explanations that sound
                  right but don&apos;t match your course.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-6">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  What lens won&apos;t do
                </p>
                <ul className="mt-4 space-y-3 text-sm text-foreground">
                  <Line>Add content that isn&apos;t in your document.</Line>
                  <Line>Rewrite your lecturer&apos;s terminology.</Line>
                  <Line>Guess what&apos;s going to be on the exam.</Line>
                </ul>
                <p className="mt-6 border-t border-border pt-4 text-xs text-muted">
                  If it isn&apos;t in your lecture material, lens doesn&apos;t make it up.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <div className="grid gap-12 md:grid-cols-2">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Who it&apos;s for</h2>
                <p className="mt-3 text-base text-muted">
                  Students who already have the material and are tired of rereading it
                  without understanding it.
                </p>
              </div>
              <div className="space-y-4">
                <Audience>
                  You get lecture notes as PDFs or PowerPoints and revise from a screen.
                </Audience>
                <Audience>
                  You understand some topics but get stuck on specific sections.
                </Audience>
                <Audience>
                  You learn better from a clear explanation than from reading bullet points.
                </Audience>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-5xl px-6 py-20 text-center">
            <h2 className="text-2xl font-semibold text-foreground">
              Start free. Pay only if it helps.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted">
              The free plan covers your first documents. If lens becomes part of how you
              study, the paid plan gives you more room — higher upload limits and more
              lessons per document.
            </p>
            <div className="mt-8 flex justify-center">
              <ButtonLink href="/signup" size="lg">
                Get started free
              </ButtonLink>
            </div>
            <p className="mt-3 text-sm text-muted">No card required.</p>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <div className="grid gap-12 md:grid-cols-2">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  Your lecture material stays yours
                </h2>
                <p className="mt-3 text-base text-muted">
                  Uploaded files are private to your account. Only you can see your
                  documents, topics, and lessons.
                </p>
              </div>
              <ul className="space-y-3">
                <Line>Files are stored in your own account, not shared.</Line>
                <Line>You can delete any document at any time.</Line>
                <Line>Deleting a document removes its lessons too.</Line>
              </ul>
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-5xl px-6 py-24 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              Upload a lecture. See what comes back.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-muted">
              The fastest way to judge lens is to put one of your own documents into it.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <ButtonLink href="/signup" size="lg">
                Get started
              </ButtonLink>
              <ButtonLink href="/login" variant="secondary" size="lg">
                Log in
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8">
          <span className="text-sm font-medium text-foreground">lens</span>
          <span className="text-sm text-muted">
            Built for students, not for slide converters.
          </span>
        </div>
      </footer>
    </div>
  );
}

function HeroVisual() {
  const topics = [
    "Generations of Computers",
    "Computer Constituents",
    "Input Devices",
    "Output Devices",
  ];

  return (
    <div className="relative">
      <div className="rounded-2xl border border-border bg-surface p-2 shadow-sm">
        <div className="rounded-xl bg-background p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted">CSC 103 Lecture 2.pptx</p>
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
              4 topics
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {topics.map((topic, i) => (
              <div
                key={topic}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-accent bg-accent text-[10px] font-bold text-white">
                  ✓
                </span>
                <span className="truncate text-sm text-foreground">{topic}</span>
                {i === 0 && (
                  <span className="ml-auto shrink-0 text-xs text-muted">lesson ready</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <span className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white">
              Generate lessons
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
        {number}
      </div>
      <h3 className="mt-4 text-base font-medium text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function Line({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted" />
      <span>{children}</span>
    </li>
  );
}

function Audience({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 text-sm leading-relaxed text-foreground">
      {children}
    </div>
  );
}
