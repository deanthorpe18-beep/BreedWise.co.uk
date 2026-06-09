"use client";

import { Award } from "lucide-react";

export function isJustClaimed(claimedAt) {
  if (!claimedAt) return false;
  const claimed = new Date(claimedAt);
  const now = new Date();
  const daysDiff = (now - claimed) / (1000 * 60 * 60 * 24);
  return daysDiff <= 14;
}

export function getDaysRemaining(claimedAt) {
  if (!claimedAt) return 0;
  const claimed = new Date(claimedAt);
  const now = new Date();
  const daysDiff = (now - claimed) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(14 - daysDiff));
}

export default function JustClaimedBadge({ claimedAt, size = "default" }) {
  if (!isJustClaimed(claimedAt)) return null;

  const days = getDaysRemaining(claimedAt);
  const sizeClasses = size === "small"
    ? "text-[10px] px-2 py-0.5 gap-1"
    : "text-xs px-3 py-1 gap-1.5";

  return (
    <span
      className={`inline-flex items-center rounded-full bg-purple-100 font-bold text-purple-700 ${sizeClasses}`}
      title={`Recently claimed profile — ${days} days remaining`}
    >
      <Award className={size === "small" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      Just Claimed
      {days > 0 && <span className="text-purple-500 font-medium">· {days}d</span>}
    </span>
  );
}
