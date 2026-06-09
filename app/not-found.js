import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:px-8 text-center">
      <h1 className="text-4xl font-bold text-slate-900">404</h1>
      <p className="mt-4 text-lg text-slate-600">
        We could not find the page you were looking for.
      </p>
      <p className="mt-2 text-sm text-slate-500">
        The breeder or page may have been removed, or the URL might be incorrect.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="rounded-3xl bg-[#00BFA5] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#00a98e]"
        >
          Go home
        </Link>
        <Link
          href="/search"
          className="rounded-3xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Search breeders
        </Link>
      </div>
    </div>
  );
}
