"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Dog, Baby, ArrowLeft } from "lucide-react";

const NAV = [
  { href: "/breeder/portal", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/breeder/portal/animals", label: "Breeding stock", icon: Dog },
  { href: "/breeder/portal/litters", label: "Litters", icon: Baby },
];

export default function BreederPortalLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/breeder/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-[#00BFA5]">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Breeding portal</h1>
          <p className="text-sm text-slate-600">Manage your dogs, litters, and pups in one place.</p>
        </div>
      </div>

      <nav className="mb-8 flex flex-wrap gap-2">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
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

      {children}
    </div>
  );
}
