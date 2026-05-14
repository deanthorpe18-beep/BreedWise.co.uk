"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/claim", label: "Claim" },
  { href: "/search", label: "Search" },
  { href: "/privacy", label: "Privacy" },
];

export default function MainNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-[#00BFA5] md:hidden"
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <nav className="hidden gap-4 md:flex text-sm font-medium text-slate-600">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/search" && pathname?.startsWith("/search"));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition ${isActive ? "text-[#00BFA5] font-semibold" : "hover:text-[#00BFA5]"}`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-3xl border border-slate-200 bg-white p-4 shadow-lg md:hidden z-50">
          <div className="flex flex-col gap-3 text-sm font-medium text-slate-700">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === "/search" && pathname?.startsWith("/search"));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-2xl px-4 py-3 transition ${isActive ? "bg-[#E6FFFB] text-[#00BFA5] font-semibold" : "hover:bg-slate-50 hover:text-[#00BFA5]"}`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
