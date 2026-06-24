"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import { ADMIN_CATEGORIES } from "@/lib/admin-nav";

function Badge({ count }) {
  if (!count || count <= 0) return null;
  return (
    <span className="ml-1 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-[#FF6B6B] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

const EXTRA_LINKS = [{ href: "/admin/places", label: "Google Cache", icon: Globe }];

export default function AdminTabNav({
  activeCategory,
  activeTab,
  onCategoryChange,
  onTabChange,
  tabBadges = {},
  categoryBadges = {},
}) {
  const currentCategory =
    ADMIN_CATEGORIES.find((c) => c.id === activeCategory) || ADMIN_CATEGORIES[0];

  return (
    <div className="border-b border-slate-200">
      <nav className="flex flex-wrap items-center gap-1 border-b border-slate-100 px-2 py-2">
        {ADMIN_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategoryChange(category.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition whitespace-nowrap ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {category.label}
              <Badge count={categoryBadges[category.id]} />
            </button>
          );
        })}
      </nav>

      <nav className="flex flex-wrap items-center gap-1 px-2 py-2">
        {currentCategory.tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#E6FFFB] text-[#00BFA5]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              <Badge count={tabBadges[tab.id]} />
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-1">
          {EXTRA_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
