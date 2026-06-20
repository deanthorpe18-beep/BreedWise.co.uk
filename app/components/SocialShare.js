"use client";

import { useState } from "react";
import { Facebook, Twitter, Link as LinkIcon, CheckCircle, MessageCircle } from "lucide-react";
import { trackCtaClick } from "@lib/analytics-client";

export default function SocialShare({ url, title, breederSlug }) {
  const [copied, setCopied] = useState(false);
  const baseUrl = url || (typeof window !== "undefined" ? window.location.href.split("?")[0] : "");
  const shareUrl = breederSlug ? `${baseUrl}?ref=share` : baseUrl;
  const shareText = title ? `Check out ${title} on BreedWise` : "Check out this breeder on BreedWise";

  const trackShare = () => {
    if (breederSlug) trackCtaClick(breederSlug, "share");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      trackShare();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Share</span>
      <button
        onClick={() => { trackShare(); window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank", "width=600,height=400"); }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-blue-100 hover:text-blue-600"
        title="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </button>
      <button
        onClick={() => { trackShare(); window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, "_blank", "width=600,height=400"); }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-sky-100 hover:text-sky-500"
        title="Share on X"
      >
        <Twitter className="h-4 w-4" />
      </button>
      <button
        onClick={() => { trackShare(); window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, "_blank"); }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-green-100 hover:text-green-600"
        title="Share on WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
      </button>
      <button
        onClick={handleCopy}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-[#E6FFFB] hover:text-[#00BFA5]"
        title="Copy link"
      >
        {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <LinkIcon className="h-4 w-4" />}
      </button>
    </div>
  );
}
