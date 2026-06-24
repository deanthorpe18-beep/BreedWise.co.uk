"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Baby, LayoutDashboard } from "lucide-react";
import { useBreederAdminContext } from "./useBreederAdminContext";

export default function AdminBreederPreviewBar() {
  const router = useRouter();
  const { adminBreederName, adminQuery, exitAdminPreview } = useBreederAdminContext();

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#00BFA5]/30 bg-[#E6FFFB] px-4 py-3 text-sm text-slate-700">
        <span>
          Managing as <strong className="text-slate-900">{adminBreederName || "breeder"}</strong> — same tools they use
        </span>
        <button
          type="button"
          onClick={() => {
            exitAdminPreview();
            router.push("/admin?tab=breeders");
          }}
          className="font-semibold text-[#00BFA5] hover:underline"
        >
          Exit preview
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/breeder/dashboard${adminQuery}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#00BFA5]"
        >
          <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
        </Link>
        <Link
          href={`/breeder/portal${adminQuery}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#00BFA5]"
        >
          <Baby className="h-3.5 w-3.5" /> Breeding portal
        </Link>
        <Link
          href="/admin?tab=breeders"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-[#00BFA5]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Admin panel
        </Link>
      </div>
    </div>
  );
}
