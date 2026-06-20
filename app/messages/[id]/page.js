"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@components/AuthProvider";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { ArrowLeft, Send, Loader2, AlertTriangle, MapPin, Check, CheckCheck } from "lucide-react";

export default function ConversationPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const bottomRef = useRef(null);

  const load = async () => {
    try {
      const res = await fetch(`/api/messages/conversations/${id}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setConversation(data.conversation);
      setMessages(data.messages || []);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();

    // Supabase Realtime subscription for new messages
    const supabase = createSupabaseClient();
    const channel = supabase
      .channel(`messages:${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${id}`,
        },
        (payload) => {
          const newMsg = payload.new;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setConversation((prev) => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when opening conversation
  useEffect(() => {
    if (!id || !user) return;
    fetch(`/api/messages/conversations/${id}/read`, { method: "POST" })
      .catch(() => {}); // silent fail
  }, [id, user]);

  const send = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    setSendError("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: id, content: content.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSendError(data.error || "Failed to send message.");
        setSending(false);
        return;
      }
      setContent("");
      await load();
    } catch {
      setSendError("Network error. Please try again.");
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#00BFA5]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link href="/messages" className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            {conversation?.breeders?.name || "Conversation"}
          </h1>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {conversation?.breeders?.town}
            {conversation?.status === "blocked" && (
              <span className="ml-2 text-red-500">· Blocked</span>
            )}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm min-h-[300px] max-h-[60vh] overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-8">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  isMine
                    ? "bg-[#00BFA5] text-white"
                    : "bg-slate-100 text-slate-700"
                }`}>
                  <p>{msg.content}</p>
                  <div className={`mt-1 flex items-center gap-1 text-[10px] ${isMine ? "text-white/70" : "text-slate-400"}`}>
                    <span>{new Date(msg.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                    {isMine && (
                      msg.read_at ? (
                        <CheckCheck className="h-3 w-3" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Send error */}
      {sendError && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertTriangle className="h-3.5 w-3.5" />
          {sendError}
        </div>
      )}

      {/* Input */}
      <form onSubmit={send} className="mt-4 flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          disabled={sending || conversation?.status === "blocked"}
          className="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || !content.trim() || conversation?.status === "blocked"}
          className="inline-flex items-center gap-2 rounded-3xl bg-[#00BFA5] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#00a98e] disabled:opacity-50"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
