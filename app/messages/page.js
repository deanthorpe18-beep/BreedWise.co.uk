"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@components/AuthProvider";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { MessageCircle, Loader2, Mail, Clock, AlertCircle } from "lucide-react";

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = () => {
      fetch("/api/messages/conversations")
        .then((r) => r.json())
        .then((data) => {
          setConversations(data.conversations || []);
          setLoadingData(false);
        })
        .catch(() => setLoadingData(false));
    };
    load();

    // Realtime: listen for conversation changes affecting this user
    const supabase = createSupabaseClient();
    const channel = supabase
      .channel("conversations:mines")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        (payload) => {
          const conv = payload.new;
          if (conv.buyer_id === user.id || conv.breeder_user_id === user.id) {
            setConversations((prev) => {
              const idx = prev.findIndex((c) => c.id === conv.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = { ...next[idx], ...conv };
                return next.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
              }
              return [conv, ...prev];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading || loadingData) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#00BFA5]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Sign in to view messages</h1>
        <p className="mt-2 text-slate-600">Create a free account to message breeders securely.</p>
        <Link href="/auth/login?redirect=/messages" className="mt-6 inline-block rounded-3xl bg-[#00BFA5] px-6 py-3 text-sm font-bold text-white">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
          <p className="mt-1 text-sm text-slate-500">Secure conversations with breeders.</p>
        </div>
        <Link href="/search" className="rounded-3xl bg-[#00BFA5] px-5 py-2.5 text-sm font-bold text-white">
          New message
        </Link>
      </div>

      {conversations.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Mail className="mx-auto h-12 w-12 text-slate-300" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">No messages yet</h2>
          <p className="mt-1 text-sm text-slate-500">Find a breeder and start a conversation.</p>
          <Link href="/search" className="mt-4 inline-block rounded-3xl bg-[#00BFA5] px-6 py-3 text-sm font-bold text-white">
            Browse breeders
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {conversations.map((conv) => {
            const isBuyer = conv.buyer_id === user?.id;
            const unread = isBuyer ? conv.buyer_unread_count : conv.breeder_unread_count;
            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6FFFB]">
                  <MessageCircle className="h-6 w-6 text-[#00BFA5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 truncate">
                      {conv.subject || `Re: ${conv.breeders?.name || "Breeder"}`}
                    </p>
                    {unread > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unread}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 truncate">
                    {conv.breeders?.name} · {conv.breeders?.town}
                  </p>
                </div>
                <div className="text-right">
                  <p className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    {conv.last_message_at
                      ? new Date(conv.last_message_at).toLocaleDateString("en-GB")
                      : new Date(conv.created_at).toLocaleDateString("en-GB")}
                  </p>
                  {conv.status === "blocked" && (
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle className="h-3 w-3" />
                      Blocked
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
