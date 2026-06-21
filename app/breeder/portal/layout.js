"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { LayoutDashboard, Dog, Baby, ArrowLeft, Users, Shield } from "lucide-react";
import { usePortalApi } from "./usePortalApi";

const NAV = [
  { href: "/breeder/portal", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/breeder/portal/animals", label: "Breeding stock", icon: Dog },
  { href: "/breeder/portal/litters", label: "Litters", icon: Baby },
  { href: "/breeder/portal/waitlist", label: "Wait list", icon: Users },
];

function PortalNav() {
  const pathname = usePathname();
  const { adminAs, portalQuery } = usePortalApi();

  return (
    <>
      {adminAs && (
        <div className="mb-6 rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 font-semibold">
              <Shield className="h-4 w-4" />
              Admin view — managing this breeder&apos;s portal
            </p>
            <Link href="/admin?tab=breeding" className="font-semibold text-purple-700 hover:underline">
              Back to admin panel
            </Link>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={adminAs ? "/admin?tab=breeding" : "/breeder/dashboard"}
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-[#00BFA5]"
          >
            <ArrowLeft className="h-4 w-4" /> {adminAs ? "Back to admin" : "Back to dashboard"}
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Breeding portal</h1>
          <p className="text-sm text-slate-600">Manage dogs, litters, and pups in one place.</p>
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

export default function BreederPortalLayout({ children }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8">
      <Suspense fallback={<div className="mb-8 h-24 animate-pulse rounded-2xl bg-slate-100" />}>
        <PortalNav />
      </Suspense>
      <Suspense>{children}</Suspense>
    </div>
  );
}
