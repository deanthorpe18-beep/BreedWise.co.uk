"use client";

import { useState, useEffect } from "react";
import { Mail, Loader2, Sparkles, Send, CheckCircle } from "lucide-react";

export default function AdminNewsletterPanel() {
  const [campaigns, setCampaigns] = useState([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/newsletter");
      const data = await res.json();
      if (res.ok) {
        setCampaigns(data.campaigns || []);
        setSubscriberCount(data.subscriberCount || 0);
        if (!selected && data.campaigns?.[0]) setSelected(data.campaigns[0]);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const generate = async (topic) => {
    setGenerating(true);
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
        setMsg("Draft generated from live site data.");
        await load();
      } else {
        setError(data.error || "Generation failed");
      }
    } catch {
      setError("Generation failed");
    }
    setGenerating(false);
  };

  const send = async () => {
    if (!selected?.id) return;
    if (!confirm(`Send "${selected.subject}" to ${subscriberCount} subscribers?`)) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", campaignId: selected.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`Sent to ${data.sent} subscribers.`);
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#00BFA5]" />
              Newsletter
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {subscriberCount} active subscriber{subscriberCount !== 1 ? "s" : ""}. Generate content from site data and send in one click.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => generate("weekly")}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-3xl bg-[#00BFA5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00a98e] disabled:opacity-50"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate weekly draft
            </button>
            <button
              onClick={() => generate("buyer")}
              disabled={generating}
              className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Buyer tips draft
            </button>
          </div>
        </div>
        {msg && <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-700 flex items-center gap-2"><CheckCircle className="h-4 w-4" />{msg}</div>}
        {error && <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Drafts & sent</p>
          {campaigns.length === 0 ? (
            <p className="text-sm text-slate-500">No campaigns yet. Generate one above.</p>
          ) : (
            campaigns.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(c)}
                className={`w-full rounded-2xl border p-3 text-left text-sm transition ${
                  selected?.id === c.id ? "border-[#00BFA5] bg-[#E6FFFB]" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <p className="font-semibold text-slate-900 truncate">{c.subject}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {c.status === "sent" ? `Sent to ${c.recipient_count}` : "Draft"} · {new Date(c.created_at).toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>

        {selected && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <input
              type="text"
              value={selected.subject || ""}
              onChange={(e) => setSelected({ ...selected, subject: e.target.value })}
              disabled={selected.status === "sent"}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold focus:border-[#00BFA5] focus:outline-none disabled:bg-slate-50"
            />
            <textarea
              value={selected.html_body || ""}
              onChange={(e) => setSelected({ ...selected, html_body: e.target.value })}
              disabled={selected.status === "sent"}
              rows={12}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs font-mono focus:border-[#00BFA5] focus:outline-none disabled:bg-slate-50"
            />
            <div
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: selected.html_body || "" }}
            />
            {selected.status !== "sent" && (
              <div className="flex flex-wrap gap-2">
                <button onClick={save} className="rounded-3xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Save edits
                </button>
                <button
                  onClick={send}
                  disabled={sending || subscriberCount === 0}
                  className="inline-flex items-center gap-2 rounded-3xl bg-[#FF6B6B] px-5 py-2 text-sm font-bold text-white hover:bg-[#e85555] disabled:opacity-50"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send to {subscriberCount} subscribers
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
