"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2, User, Building2, AlertCircle, RefreshCw } from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  lastMessageAt: string;
  lastMessage?: string;
  talentName?: string;
  talentLastName?: string;
  companyName?: string;
  companyLogo?: string;
}

export function MessagingUI({ 
  currentUserId,
  userRole 
}: { 
  currentUserId: string;
  userRole: "TALENT" | "COMPANY" 
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.id);
    }
  }, [selectedConv]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function fetchConversations() {
    try {
      const res = await fetch("/api/conversations");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setConversations(data);
      setLoadError(null);
    } catch (err) {
      // Without this the spinner never resolves and the user is told there
      // are no conversations when the truth is that the request failed.
      console.error(err);
      setLoadError("Impossible de charger vos conversations.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(id: string) {
    try {
      const res = await fetch(`/api/conversations/${id}/messages`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages(data);
      setSendError(null);
    } catch (err) {
      console.error(err);
      setSendError("Impossible de charger les messages de cette conversation.");
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedConv || !newMessage.trim()) return;

    setSending(true);
    setSendError(null);
    try {
      const res = await fetch(`/api/conversations/${selectedConv.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Keep the draft so the user does not lose what they typed.
        setSendError(data.error || "Message non envoyé.");
        return;
      }
      setMessages([...messages, data]);
      setNewMessage("");
      fetchConversations(); // refresh list
    } catch (err) {
      console.error(err);
      setSendError("Erreur réseau. Votre message n'a pas été envoyé.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div role="status" className="flex items-center justify-center h-96">
        <Loader2 aria-hidden="true" className="w-8 h-8 animate-spin text-[#f47b00]" />
        <span className="sr-only">Chargement…</span>
      </div>
    );
  }

  /* A failed request must not masquerade as "you have no conversations". */
  if (loadError) {
    return (
      <div role="alert" className="bg-white rounded-2xl border border-[#e5e5e5] px-6 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
          <AlertCircle aria-hidden="true" className="w-6 h-6" />
        </div>
        <p className="font-semibold mt-4">{loadError}</p>
        <p className="text-sm text-[#737373] mt-2">
          Vérifiez votre connexion, puis réessayez.
        </p>
        <button type="button" onClick={fetchConversations} className="btn-primary mt-6">
          <RefreshCw aria-hidden="true" className="w-4 h-4" />
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden flex h-[600px]">
      {/* Sidebar List */}
      <div className="w-1/3 border-r border-[#e5e5e5] flex flex-col">
        <div className="p-4 font-bold border-b border-[#e5e5e5]">Conversations</div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#737373]">
              Aucune conversation pour le moment.
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedConv(c)}
                aria-current={selectedConv?.id === c.id ? "true" : undefined}
                className={`w-full text-left p-4 hover:bg-[#fafafa] transition-colors border-b border-[#f1f1f1] ${
                  selectedConv?.id === c.id ? "bg-[#fff8ee]" : ""
                }`}
              >
                <div className="font-semibold truncate">
                  {userRole === "COMPANY" ? `${c.talentName} ${c.talentLastName}` : c.companyName}
                </div>
                <div className="text-xs text-[#737373] truncate mt-1">
                  {c.lastMessage || "Nouveau message"}
                </div>
                <div className="text-[10px] text-[#a3a3a3] mt-2">
                  {timeAgo(c.lastMessageAt)}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col bg-[#fafafa]">
        {selectedConv ? (
          <>
            <div className="p-4 bg-white border-b border-[#e5e5e5] flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#f47b00]/10 flex items-center justify-center text-[#f47b00]">
                {userRole === "COMPANY" ? <User aria-hidden="true" className="w-4 h-4" /> : <Building2 aria-hidden="true" className="w-4 h-4" />}
              </div>
              <div className="font-bold">
                {userRole === "COMPANY" ? `${selectedConv.talentName} ${selectedConv.talentLastName}` : selectedConv.companyName}
              </div>
            </div>
            
            <div ref={scrollRef} role="log" aria-live="polite" className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m) => (
                <div 
                  key={m.id} 
                  className={`flex ${m.senderId === currentUserId ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      m.senderId === currentUserId 
                        ? "bg-[#f47b00] text-white rounded-tr-none" 
                        : "bg-white border border-[#e5e5e5] rounded-tl-none shadow-sm"
                    }`}
                  >
                    {m.content}
                    <div className={`text-[10px] mt-1 opacity-60 ${m.senderId === currentUserId ? "text-white" : "text-[#737373]"}`}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {sendError && (
              <div role="alert" className="px-4 pt-3 flex items-start gap-2 text-sm text-red-600">
                <AlertCircle aria-hidden="true" className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{sendError}</span>
              </div>
            )}
            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-[#e5e5e5] flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Votre message…"
                aria-label="Votre message"
                aria-invalid={!!sendError}
                className="input"
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                aria-label="Envoyer le message"
                className="btn-primary p-3"
              >
                {sending ? <Loader2 aria-hidden="true" className="w-5 h-5 animate-spin" /> : <Send aria-hidden="true" className="w-5 h-5" />}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#737373]">
            <MessageCircle aria-hidden="true" className="w-12 h-12 mb-2 opacity-20" />
            <p>Sélectionnez une conversation pour commencer.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageCircle({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" 
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
    </svg>
  );
}
