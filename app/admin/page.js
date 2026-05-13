import AdminQueue from "@/app/components/AdminQueue";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:px-8">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-[#00BFA5]">Admin dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Listing approval queues</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Review incoming listing, claim, and edit requests. Approve or reject each item to keep the directory accurate.</p>
        </div>
        <AdminQueue />
      </div>
    </div>
  );
}
