"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense } from "react";
import { LayoutDashboard, Dog, Baby, ArrowLeft, Users, Receipt } from "lucide-react";
import { usePortalApi } from "./usePortalApi";
import AdminBreederPortalPicker from "@components/AdminBreederPortalPicker";
import { useAuth } from "@components/AuthProvider";

const NAV = [
  { href: "/breeder/portal", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/breeder/portal/animals", label: "My dogs", icon: Dog },
  { href: "/breeder/portal/litters", label: "Litters", icon: Baby },
  { href: "/breeder/portal/waitlist", label: "Wait list", icon: Users },
  { href: "/breeder/portal/settings/receipts", label: "Receipt forms", icon: Receipt },
];

function PortalNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const { adminAs, adminBreederName, adminPreview, portalQuery, exitAdminPreview } = usePortalApi();

  if (isAdmin && !adminPreview && !user?.breederSlug) {
    return (
      <div className="space-y-6">
        <Link href="/admin?tab=breeding" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-[#00BFA5]">
          <ArrowLeft className="h-4 w-4" /> Back to admin
        </Link>
        <AdminBreederPortalPicker compact />
      </div>
    );
  }

  const displayName = adminBreederName || user?.breederName;

  return (
    <>
      {adminPreview && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <span>
            Viewing as <strong className="text-slate-900">{displayName || "breeder"}</strong> — same portal breeders use
          </span>
          <button
            type="button"
            onClick={() => {
              exitAdminPreview();
              router.push("/admin?tab=breeding");
            }}
            className="font-semibold text-[#00BFA5] hover:underline"
          >
            Exit preview
          </button>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={adminPreview ? `/breeder/dashboard${portalQuery}` : "/breeder/dashboard"}
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-[#00BFA5]"
          >
            <ArrowLeft className="h-4 w-4" /> {adminPreview ? "Breeder dashboard" : "Back to dashboard"}
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Breeding portal</h1>
          <p className="text-sm text-slate-600">
            {adminPreview && displayName
              ? `Managing ${displayName}'s breeding records`
              : "Manage your dogs, litters, and pups in one place."}
          </p>
        </div>
      </div>

      <nav className="mb-8 flex flex-wrap gap-2">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={`${href}${portalQuery}`}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                active ? "bg-[#00BFA5] text-white" : "border border-slate-200 bg-white text-slate-700 hover:border-[#00BFA5]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function PortalBody({ children }) {
  const { user } = useAuth();
  const { adminPreview } = usePortalApi();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  if (isAdmin && !adminPreview && !user?.breederSlug) {
    return null;
  }

  return children;
}

export default function BreederPortalLayout({ children }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8">
      <Suspense fallback={<div className="mb-8 h-24 animate-pulse rounded-2xl bg-slate-100" />}>
        <PortalNav />
      </Suspense>
      <Suspense>
        <PortalBody>{children}</PortalBody>
      </Suspense>
    </div>
  );
}
