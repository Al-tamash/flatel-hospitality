import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-6 py-16 text-center text-foreground">
      <p className="font-sans text-sm font-semibold uppercase tracking-[0.16em] text-primary">FLATEL HOSPITALITY</p>
      <p className="mt-10 font-heading text-6xl font-medium text-primary">404</p>
      <h1 className="mt-3 font-heading text-3xl font-normal">We couldn’t find that page</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        The address may be incorrect, or the page may have moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Flatel
      </Link>
    </main>
  );
}
