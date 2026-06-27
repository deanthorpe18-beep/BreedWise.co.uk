"use client";

import { useState, useEffect } from "react";
import { Mail, Loader2, Sparkles, Send, CheckCircle, ChevronDown, ChevronUp, Trash2 } from "lucide-react";

const TOPICS = [
  { id: "weekly", label: "Weekly roundup", desc: "Stats, trending breeds & site news", color: "#00BFA5", icon: "📬" },
  { id: "buyer-tips", label: "Buyer safety", desc: "Red flags, questions & viewing tips", color: "#FF6B6B", icon: "🛡️" },
  { id: "breed-spotlight", label: "Breed spotlight", desc: "One breed with encyclopedia photo", color: "#9333ea", icon: "🐾" },
  { id: "featured-breeders", label: "Featured breeders", desc: "Gold members with profile photos", color: "#FFB545", icon: "⭐" },
  { id: "new-listings", label: "New listings", desc: "Fresh breeders added this week", color: "#0ea5e9", icon: "✨" },
  { id: "multi-pet", label: "Beyond dogs", desc: "Cats, birds, reptiles & small pets", color: "#ec4899", icon: "🦜" },
  { id: "seasonal", label: "Seasonal tips", desc: "Timely advice for the season", color: "#059669", icon: "🌿" },
  { id: "breeder-promo", label: "For breeders", desc: "Claim profile & upgrade benefits", color: "#f97316", icon: "🏠" },
  { id: "compare-tool", label: "Compare tool", desc: "Promote side-by-side compare", color: "#6366f1", icon: "⚖️" },
  { id: "location-picks", label: "Location picks", desc: "Popular towns & regional search", color: "#14b8a6", icon: "📍" },
  { id: "education", label: "Education", desc: "Guides, checklists & contracts", color: "#8b5cf6", icon: "📚" },
  { id: "surprise", label: "Surprise me", desc: "Random template each time", color: "#64748b", icon: "🎲" },
];

export default function AdminNewsletterPanel() {
  const [campaigns, setCampaigns] = useState([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);
  const [sending, setSending] = useState(false);
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [showHtml, setShowHtml] = useState(false);
  const [extraEmails, setExtraEmails] = useState("");
  const [deleting, setDeleting] = useState(null);

  const draftCount = campaigns.filter((c) => c.status === "draft").length;

  const parseExtraCount = () =>
    extraEmails
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)).length;

  const totalRecipients = subscriberCount + parseExtraCount();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/newsletter");
      const data = await res.json();
      if (res.ok) {
        const list = data.campaigns || [];
        setCampaigns(list);
        setSubscriberCount(data.subscriberCount || 0);
        setSelected((prev) => {
          if (prev && list.some((c) => c.id === prev.id)) return prev;
          return list[0] || null;
        });
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const generate = async (topic) => {
    setGenerating(topic);
    setError("");
    setMsg("");
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", topic }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelected(data.campaign);
        const label = TOPICS.find((t) => t.id === topic)?.label || topic;
        setMsg(`"${label}" draft generated with live data, photos & colour.`);
        await load();
      } else {
        setError(data.error || "Generation failed");
      }
    } catch {
      setError("Generation failed");
    }
    setGenerating(null);
  };

  const send = async () => {
    if (!selected?.id) return;
    const extraCount = parseExtraCount();
    const total = subscriberCount + extraCount;
    if (total === 0) {
      setError("Add subscribers or enter at least one extra email address.");
      return;
    }
    const extraNote = extraCount > 0 ? ` (+ ${extraCount} extra)` : "";
    if (!confirm(`Send "${selected.subject}" to ${total} recipient${total !== 1 ? "s" : ""}${extraNote}?`)) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", campaignId: selected.id, extraEmails }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`Sent to ${data.sent} recipient${data.sent !== 1 ? "s" : ""}${data.extraCount ? ` (${data.extraCount} extra)` : ""}.`);
        setExtraEmails("");
        await load();
      } else {
        setError(data.error || "Send failed");
      }
    } catch {
      setError("Send failed");
    }
    setSending(false);
  };

  const save = async () => {
    if (!selected?.id) return;
    const res = await fetch("/api/admin/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save",
        campaignId: selected.id,
        subject: selected.subject,
        html_body: selected.html_body,
        preview_text: selected.preview_text,
      }),
    });
    if (res.ok) setMsg("Draft saved.");
  };

  const deleteDraft = async (campaign, e) => {
    e?.stopPropagation?.();
    if (!campaign?.id || campaign.status === "sent") return;
    if (!confirm(`Delete draft "${campaign.subject}"? This cannot be undone.`)) return;
    setDeleting(campaign.id);
    setError("");
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", campaignId: campaign.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Draft deleted.");
        await load();
      } else {
        setError(data.error || "Delete failed");
      }
    } catch {
      setError("Delete failed");
    }
    setDeleting(null);
  };

  const deleteAllDrafts = async () => {
    if (draftCount === 0) return;
    if (!confirm(`Delete all ${draftCount} draft${draftCount !== 1 ? "s" : ""}? Sent campaigns will be kept.`)) return;
    setDeleting("all");
    setError("");
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete-all-drafts" }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`Deleted ${data.deletedCount} draft${data.deletedCount !== 1 ? "s" : ""}.`);
        await load();
      } else {
        setError(data.error || "Delete failed");
      }
    } catch {
      setError("Delete failed");
    }
    setDeleting(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#00BFA5]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#00BFA5]" />
            Newsletter composer
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {subscriberCount} active subscriber{subscriberCount !== 1 ? "s" : ""}. Pick a template — each generates unique content with photos and colour from live site data.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => generate(t.id)}
              disabled={!!generating}
              className="group rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50"
              style={{ borderTopWidth: 3, borderTopColor: t.color }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xl">{t.icon}</span>
                {generating === t.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                ) : (
                  <Sparkles className="h-4 w-4 text-slate-300 transition group-hover:text-[#00BFA5]" />
                )}
              </div>
              <p className="mt-2 text-sm font-bold text-slate-900">{t.label}</p>
              <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{t.desc}</p>
            </button>
          ))}
        </div>

        {msg && (
          <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            {msg}
          </div>
        )}
        {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Drafts & sent</p>
            {draftCount > 0 && (
              <button
                type="button"
                onClick={deleteAllDrafts}
                disabled={!!deleting}
                className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                {deleting === "all" ? "Deleting…" : `Delete all drafts (${draftCount})`}
              </button>
            )}
          </div>
          {campaigns.length === 0 ? (
            <p className="text-sm text-slate-500">No campaigns yet. Generate one above.</p>
          ) : (
            campaigns.map((c) => (
              <div
                key={c.id}
                className={`flex items-start gap-1 rounded-2xl border transition ${
                  selected?.id === c.id ? "border-[#00BFA5] bg-[#E6FFFB]" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelected(c)}
                  className="min-w-0 flex-1 p-3 text-left text-sm"
                >
                  <p className="font-semibold text-slate-900 truncate">{c.subject}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {c.status === "sent" ? `Sent to ${c.recipient_count}` : "Draft"} · {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </button>
                {c.status === "draft" && (
                  <button
                    type="button"
                    onClick={(e) => deleteDraft(c, e)}
                    disabled={deleting === c.id}
                    className="shrink-0 p-3 text-slate-400 hover:text-red-600 disabled:opacity-50"
                    aria-label={`Delete draft ${c.subject}`}
                  >
                    {deleting === c.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {selected && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Subject line</label>
              <input
                type="text"
                value={selected.subject || ""}
                onChange={(e) => setSelected({ ...selected, subject: e.target.value })}
                disabled={selected.status === "sent"}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold focus:border-[#00BFA5] focus:outline-none disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Preview text</label>
              <input
                type="text"
                value={selected.preview_text || ""}
                onChange={(e) => setSelected({ ...selected, preview_text: e.target.value })}
                disabled={selected.status === "sent"}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#00BFA5] focus:outline-none disabled:bg-slate-50"
              />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email preview</p>
              <p className="mb-2 text-xs text-slate-500">Scroll inside the preview to see the full email. Regenerate a draft to pick up layout updates.</p>
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-100">
                <iframe
                  title="Newsletter email preview"
                  srcDoc={selected.html_body || ""}
                  className="w-full border-0 bg-white"
                  style={{ height: 720, minHeight: 480 }}
                  sandbox="allow-same-origin"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHtml((p) => !p)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              {showHtml ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showHtml ? "Hide" : "Show"} HTML source
            </button>
            {showHtml && (
              <textarea
                value={selected.html_body || ""}
                onChange={(e) => setSelected({ ...selected, html_body: e.target.value })}
                disabled={selected.status === "sent"}
                rows={10}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs font-mono focus:border-[#00BFA5] focus:outline-none disabled:bg-slate-50"
              />
            )}

            {selected.status !== "sent" && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Extra recipients (optional)
                </label>
                <p className="mt-1 text-xs text-slate-500">
                  Add email addresses not on the subscriber list — one per line or comma-separated. Useful for test sends or one-off contacts.
                </p>
                <textarea
                  value={extraEmails}
                  onChange={(e) => setExtraEmails(e.target.value)}
                  placeholder={"you@example.com\nfriend@example.com"}
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-[#00BFA5] focus:outline-none"
                />
                {parseExtraCount() > 0 && (
                  <p className="mt-1 text-xs text-[#00BFA5] font-semibold">
                    + {parseExtraCount()} extra address{parseExtraCount() !== 1 ? "es" : ""} · {totalRecipients} total recipients
                  </p>
                )}
              </div>
            )}

            {selected.status !== "sent" && (
              <div className="flex flex-wrap gap-2 pt-2">
                <button onClick={save} className="rounded-3xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Save edits
                </button>
                <button
                  onClick={() => deleteDraft(selected)}
                  disabled={!!deleting}
                  className="inline-flex items-center gap-2 rounded-3xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {deleting === selected.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Delete draft
                </button>
                <button
                  onClick={send}
                  disabled={sending || totalRecipients === 0}
                  className="inline-flex items-center gap-2 rounded-3xl bg-[#FF6B6B] px-5 py-2 text-sm font-bold text-white hover:bg-[#e85555] disabled:opacity-50"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send to {totalRecipients} recipient{totalRecipients !== 1 ? "s" : ""}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
