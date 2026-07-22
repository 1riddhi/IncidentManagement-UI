import { FormEvent, KeyboardEvent, useState } from "react";
import { Bot, LoaderCircle, MessageCircle, Send, User } from "lucide-react";
import { requestChatResponse } from "../api/chat";
import { useIncidents } from "../hooks/useIncidents";
import type { ChatMessage, ChatResponse } from "../types/incident";
import { SectionHeading } from "./ui";
import { useParams } from "react-router-dom";

let nextMessageId = 0;

export function IncidentChat({ isEnabled: enabledOverride }: { isEnabled?: boolean }) {
  const { id } = useParams();
  const { analysis } = useIncidents();
  const isEnabled = enabledOverride ?? Boolean(id && analysis[id]?.status === "success");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canSend = isEnabled && draft.trim().length > 0 && !isWaiting;

  async function sendMessage() {
    const question = draft.trim();
    if (!question || isWaiting || !isEnabled) return;
    setMessages((current) => [...current, { id: `user-${nextMessageId++}`, role: "user", content: question }]);
    setDraft("");
    setError(null);
    setIsWaiting(true);
    try {
      const response = await requestChatResponse(question);
      setMessages((current) => [...current, { id: `assistant-${nextMessageId++}`, role: "assistant", content: response.answer, response }]);
    } catch {
      setError("The assistant could not respond. Please try again.");
    } finally {
      setIsWaiting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <section className="panel mt-6 overflow-hidden p-5 sm:p-6">
      <SectionHeading eyebrow="Incident assistant" title="Ask about this incident" />
      <p className="mt-2 text-xs leading-5 text-slate-500">Ask for investigation guidance, code impact, or next steps.</p>
      {!isEnabled && <p className="mt-3 rounded-lg border border-amber-300/15 bg-amber-300/5 px-3 py-2 text-xs leading-5 text-amber-100">Complete “Analyze with AI” to unlock the incident assistant.</p>}
      <div aria-live="polite" className="mt-5 max-h-96 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && !isWaiting && <div className="rounded-xl border border-dashed border-white/10 bg-white/3 p-4 text-center text-xs leading-5 text-slate-500">Your questions and investigation guidance will appear here.</div>}
        {messages.map((message) => (
          <article key={message.id} className={`rounded-xl border p-3 ${message.role === "user" ? "ml-5 border-indigo-400/20 bg-indigo-400/10" : "mr-2 border-white/10 bg-slate-950/60"}`}>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.12em] text-slate-400">
              {message.role === "user" ? <User size={13} /> : <Bot size={13} className="text-cyan-200" />}
              {message.role === "user" ? "You" : "Incident assistant"}
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-200">{message.content}</p>
            {message.response && <ResponseDetails response={message.response} />}
          </article>
        ))}
        {isWaiting && <div className="mr-8 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 p-3 text-xs text-slate-400"><LoaderCircle size={15} className="animate-spin text-cyan-200" />Incident assistant is thinking…</div>}
      </div>
      {error && <p role="alert" className="mt-3 text-xs text-rose-200">{error}</p>}
      <form onSubmit={handleSubmit} className="mt-4">
        <label className="sr-only" htmlFor="incident-chat-question">Ask the incident assistant</label>
        <textarea id="incident-chat-question" disabled={!isEnabled} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={handleKeyDown} placeholder={isEnabled ? "Ask a question about this incident…" : "Analyze the incident to unlock chat…"} rows={3} className="w-full resize-y rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-50" />
        <div className="mt-2 flex items-center justify-between gap-3"><span className="text-[11px] text-slate-500">Enter to send · Shift+Enter for a new line</span><button type="submit" disabled={!canSend} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-cyan-300 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"><Send size={14} />Send</button></div>
      </form>
    </section>
  );
}

function ResponseDetails({ response }: { response: ChatResponse }) {
  return <details className="mt-3 rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-xs"><summary className="cursor-pointer list-none font-medium text-cyan-100"><span className="inline-flex items-center gap-2"><MessageCircle size={13} />Response details</span></summary><div className="mt-3 space-y-3 text-slate-400"><DetailList label="Sources" items={response.sources} /><div><p className="font-medium text-slate-300">New findings</p><ul className="mt-1.5 space-y-2">{response.newFindings.map((finding) => <li key={`${finding.agentName}-${finding.status}`}><span className="font-medium text-cyan-100">{finding.agentName}</span><span className="ml-1 text-slate-500">({finding.status})</span><p className="mt-0.5 leading-5">{finding.summary}</p></li>)}</ul></div><DetailList label="Agent calls" items={response.agentCalls} mono /></div></details>;
}

function DetailList({ label, items, mono = false }: { label: string; items: string[]; mono?: boolean }) {
  return <div><p className="font-medium text-slate-300">{label}</p><ul className={`mt-1.5 space-y-1 break-all ${mono ? "font-mono" : ""}`}>{items.map((item) => <li key={item}>{item}</li>)}</ul></div>;
}
