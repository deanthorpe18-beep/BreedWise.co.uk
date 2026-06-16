"use client";

import { Download } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-2xl bg-[#00BFA5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00a98e] print:hidden"
    >
      <Download className="h-4 w-4" /> Print / Save PDF
    </button>
  );
}
