"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, LogOut } from "lucide-react";

export default function MainNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Search" },
    { href: "/claim", label: "Claim" },
    { href: "/education", label: "Guides" },
  ];

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-3 justify-end">
        <nav className="hidden gap-4 md:flex text-sm font-medium text-slate-600 items-center">
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
          {!loading && user ? (
            <div className="flex items-center gap-3 ml-2 pl-3 border-l border-slate-200">
              <span className="text-xs text-slate-500 truncate max-w-[120px]">{user.displayName || user.email}</span>
              {user.role === "admin" && (
                <Link href="/admin" className="text-xs font-semibold text-[#00BFA5] hover:text-[#008f7a]">Admin</Link>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-[#FF6B6B] transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                Log out
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-[#F1F4F6] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              <User className="h-4 w-4" />
              Log in
            </Link>
          )}
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-[#00BFA5] md:hidden"
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
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
            {!loading && user ? (
              <>
                {user.role === "admin" && (
                  <Link href="/admin" className="rounded-2xl px-4 py-3 text-[#00BFA5] font-semibold hover:bg-[#E6FFFB]" onClick={() => setIsOpen(false)}>Admin</Link>
                )}
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="rounded-2xl px-4 py-3 text-left text-red-500 hover:bg-red-50">Log out</button>
              </>
            ) : (
              <Link href="/auth/login" className="rounded-2xl px-4 py-3 bg-[#F1F4F6] text-slate-700 font-semibold hover:bg-slate-200" onClick={() => setIsOpen(false)}>Log in</Link>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
