"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@components/AuthProvider";
import { ArrowLeft, Send, Loader2, AlertTriangle, MapPin } from "lucide-react";

export default function ConversationPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = async () => {
    const res = await fetch(`/api/messages/conversations/${id}`);
    const data = await res.json();
    setConversation(data.conversation);
    setMessages(data.messages || []);
    setLoading(false);
  };

  useEffect(() => {
    if (id) load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation_id: id, content: content.trim() }),
    });
    setContent("");
    await load();
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
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto p-2">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">No messages yet. Start the conversation below.</p>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    isMe
                      ? "bg-[#00BFA5] text-white rounded-br-md"
                      : "bg-[#F1F4F6] text-slate-800 rounded-bl-md"
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`mt-1 text-[10px] ${isMe ? "text-white/70" : "text-slate-400"}`}>
                      {new Date(msg.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      {msg.read_at && isMe && " · Read"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={send} className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-3xl border border-slate-200 bg-[#F1F4F6] px-4 py-3 text-sm outline-none focus:border-[#00BFA5] focus:ring-2 focus:ring-[#00BFA5]/20"
          />
          <button
            type="submit"
            disabled={sending || !content.trim()}
            className="inline-flex items-center gap-2 rounded-3xl bg-[#00BFA5] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#00a98e] disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>

      {/* Report */}
      <div className="mt-4 text-center">
        <button
          onClick={async () => {
            const reason = window.prompt("Why are you reporting this conversation?");
            if (!reason) return;
            await fetch(`/api/messages/${messages[0]?.id}/report`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reason }),
            });
            alert("Report submitted. Thank you.");
          }}
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-500"
        >
          <AlertTriangle className="h-3 w-3" />
          Report abuse
        </button>
      </div>
    </div>
  );
}
