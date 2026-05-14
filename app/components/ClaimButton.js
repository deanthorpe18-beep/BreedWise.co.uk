"use client";

import { useState } from "react";
import { UserCheck } from "lucide-react";

export default function ClaimButton({ breederSlug, breederName }) {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const handleClaim = (e) => {
    e.preventDefault();

    // Store claim in localStorage (in a real app, this would be an API call)
    const existingClaims = JSON.parse(localStorage.getItem("breedwise-claims") || "[]");
    const newClaim = {
      id: Date.now().toString(),
      breederSlug,
      breederName,
      email,
      status: "pending",
      submittedAt: new Date().toISOString(),
      type: "claim"
    };

    localStorage.setItem("breedwise-claims", JSON.stringify([...existingClaims, newClaim]));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-[#00BFA5] font-semibold">
        ✓ Claim request submitted
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setSubmitted(true)}
        className="block text-[#00BFA5] hover:text-[#008f7a] mb-2"
      >
        <UserCheck className="inline h-4 w-4 mr-1" />
        Claim this listing
      </button>

      {submitted && (
        <form onSubmit={handleClaim} className="space-y-3 mt-3 p-3 bg-white rounded-lg border">
          <p className="text-xs text-slate-600">Enter your email to submit a claim request:</p>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-[#00BFA5] focus:ring-1 focus:ring-[#00BFA5]"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-3 py-1 bg-[#00BFA5] text-white text-xs rounded hover:bg-[#00a98e]"
            >
              Submit Claim
            </button>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="px-3 py-1 border border-slate-200 text-slate-600 text-xs rounded hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}