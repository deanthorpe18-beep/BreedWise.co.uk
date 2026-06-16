"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumbs({ items }) {
  // items: array of { label, href? }
  if (!items || items.length === 0) return null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://breedwise.co.uk/" }].concat(
      items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.label,
        item: item.href ? `https://breedwise.co.uk${item.href}` : undefined,
      }))
    ),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
          <li>
            <Link href="/" className="inline-flex items-center gap-1 transition hover:text-[#00BFA5]">
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              {item.href && index < items.length - 1 ? (
                <Link href={item.href} className="transition hover:text-[#00BFA5]">
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-slate-700">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
