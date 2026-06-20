"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@components/AuthProvider";
import { Menu, X, User, LogOut, Shield, ChevronDown, Settings, Heart, MessageCircle, Store, Search } from "lucide-react";

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(/[\s@]+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function UserDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isSuper = user?.role === "super_admin";
  const hasBreeder = !!user?.breederSlug;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00BFA5] text-xs font-bold text-white">
          {getInitials(user.displayName || user.email)}
        </span>
        <span className="hidden sm:inline max-w-[140px] truncate">
          {user.displayName || user.email}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        {isAdmin && (
          <span className="ml-1 inline-flex items-center rounded-full bg-[#00BFA5]/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#00BFA5]">
            {isSuper ? "SUPER" : "ADMIN"}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white py-2 shadow-xl z-50">
          <div className="px-4 py-2 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {user.displayName || user.email}
            </p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          <div className="py-1">
            <Link
              href="/account/saved-searches"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Search className="h-4 w-4 text-slate-400" />
              Search alerts
            </Link>
            <Link
              href="/account/saved-breeders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Heart className="h-4 w-4 text-slate-400" />
              Saved breeders
            </Link>
            <Link
              href="/messages"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <MessageCircle className="h-4 w-4 text-slate-400" />
              Messages
            </Link>
            {hasBreeder && (
              <Link
                href="/breeder/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50"
              >
                <Store className="h-4 w-4 text-purple-500" />
                My listing
              </Link>
            )}
            <Link
              href="/account/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              Account settings
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[#00BFA5] hover:bg-[#E6FFFB]"
              >
                <Shield className="h-4 w-4" />
                Admin dashboard
              </Link>
            )}
          </div>
          <div className="border-t border-slate-100 py-1">
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MainNav() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Search" },
    { href: "/near-me", label: "Near me" },
    { href: "/claim", label: "Claim" },
    { href: "/education", label: "Guides" },
  ];

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-3 justify-end">
        <nav className="hidden gap-5 md:flex text-sm font-medium text-slate-600 items-center">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/search" && pathname?.startsWith("/search")) ||
              (item.href === "/near-me" && pathname === "/near-me");
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
          {!loading && (
            <div className="ml-2 pl-3 border-l border-slate-200">
              {user ? (
                <UserDropdown user={user} onLogout={logout} />
              ) : (
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F4F6] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  <User className="h-4 w-4" />
                  Log in
                </Link>
              )}
            </div>
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

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
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
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            {!loading && user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2 border-t border-slate-100 mt-1">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00BFA5] text-xs font-bold text-white">
                    {getInitials(user.displayName || user.email)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user.displayName || user.email}</p>
                    {(user.role === "admin" || user.role === "super_admin") && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#00BFA5]">
                        {user.role === "super_admin" ? "Super Admin" : "Admin"}
                      </span>
                    )}
                  </div>
                </div>
                <Link href="/account/saved-searches" className="rounded-2xl px-4 py-3 hover:bg-slate-50 flex items-center gap-2" onClick={() => setIsOpen(false)}><Search className="h-4 w-4" /> Search alerts</Link>
                <Link href="/account/saved-breeders" className="rounded-2xl px-4 py-3 hover:bg-slate-50 flex items-center gap-2" onClick={() => setIsOpen(false)}><Heart className="h-4 w-4" /> Saved breeders</Link>
                <Link href="/messages" className="rounded-2xl px-4 py-3 hover:bg-slate-50 flex items-center gap-2" onClick={() => setIsOpen(false)}><MessageCircle className="h-4 w-4" /> Messages</Link>
                {user.breederSlug && (
                  <Link href="/breeder/dashboard" className="rounded-2xl px-4 py-3 text-purple-700 font-semibold hover:bg-purple-50 flex items-center gap-2" onClick={() => setIsOpen(false)}><Store className="h-4 w-4" /> My listing</Link>
                )}
                <Link href="/account/claims" className="rounded-2xl px-4 py-3 hover:bg-slate-50 flex items-center gap-2" onClick={() => setIsOpen(false)}><Shield className="h-4 w-4" /> My claims</Link>
                <Link href="/account/settings" className="rounded-2xl px-4 py-3 hover:bg-slate-50" onClick={() => setIsOpen(false)}>Account settings</Link>
                {(user.role === "admin" || user.role === "super_admin") && (
                  <Link href="/admin" className="rounded-2xl px-4 py-3 text-[#00BFA5] font-semibold hover:bg-[#E6FFFB]" onClick={() => setIsOpen(false)}>Admin dashboard</Link>
                )}
                <button onClick={() => { logout(); setIsOpen(false); }} className="rounded-2xl px-4 py-3 text-left text-red-500 hover:bg-red-50">Log out</button>
              </>
            ) : (
              <Link href="/auth/login" className="rounded-2xl px-4 py-3 bg-[#F1F4F6] text-slate-700 font-semibold hover:bg-slate-200" onClick={() => setIsOpen(false)}>Log in</Link>
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
}
