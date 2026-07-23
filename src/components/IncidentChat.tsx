import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Bot, Check, Clipboard, Code2, Maximize2, Minimize2, Send, Sparkles, User } from "lucide-react";
import { requestChatResponse } from "../api/chat";
import { useIncidents } from "../hooks/useIncidents";
import type { ChatMessage } from "../types/incident";
import { SectionHeading } from "./ui";
import { useParams } from "react-router-dom";

let nextMessageId = 0;

export function IncidentChat({ isEnabled: enabledOverride }: { isEnabled?: boolean }) {
  const { id } = useParams();
  const { analysis } = useIncidents();
  const analysisState = id ? analysis[id] : undefined;
  const analysisId = analysisState?.status === "success" ? analysisState.response?.analysisId : undefined;
  const isEnabled = enabledOverride ?? Boolean(analysisId);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimizing, setIsMinimizing] = useState(false);
  const conversationRef = useRef<HTMLDivElement>(null);
  const canSend = isEnabled && draft.trim().length > 0 && !isWaiting;

  useEffect(() => {
    const conversation = conversationRef.current;
    conversation?.scrollTo?.({ top: conversation.scrollHeight, behavior: "smooth" });
  }, [messages.length, isWaiting, isExpanded]);

  async function sendMessage() {
    const question = draft.trim();
    if (!question || isWaiting || !isEnabled || !analysisId) return;
    setMessages((current) => [...current, { id: `user-${nextMessageId++}`, role: "user", content: question }]);
    setDraft("");
    setError(null);
    setIsWaiting(true);
    try {
      const response = await requestChatResponse(analysisId, question);
      setMessages((current) => [...current, { id: `assistant-${nextMessageId++}`, role: "assistant", content: response.answer, response }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The assistant could not respond. Please try again.");
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

  function minimizeWindow() {
    setIsMinimizing(true);
    window.setTimeout(() => {
      setIsExpanded(false);
      setIsMinimizing(false);
    }, 220);
  }

  return (
    <>
      {isExpanded && <button aria-label="Close expanded assistant" onClick={minimizeWindow} className="fixed inset-0 z-40 cursor-default bg-slate-950/55 backdrop-blur-sm" />}
      <section aria-label="Incident assistant window" aria-modal={isExpanded || undefined} className={`panel overflow-hidden p-5 sm:p-6 ${isExpanded ? `incident-chat-expanded fixed inset-x-4 top-6 z-50 mx-auto flex h-[calc(100vh-3rem)] w-auto max-w-5xl flex-col ${isMinimizing ? "incident-chat-minimizing" : ""}` : "mt-6"}`}>
      <SectionHeading eyebrow="Ask a question" title="About this incident" action={<button type="button" aria-label={isExpanded ? "Minimize assistant window" : "Expand assistant window"} onClick={isExpanded ? minimizeWindow : () => setIsExpanded(true)} className="icon-button border border-cyan-400/20 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/20">{isExpanded ? <Minimize2 size={17} /> : <Maximize2 size={17} />}</button>} />
      <p className="mt-2 text-xs leading-5 text-slate-500">Ask for investigation guidance, code impact, or next steps.</p>
      {!isEnabled && <p className="mt-3 rounded-lg border border-amber-300/15 bg-amber-300/5 px-3 py-2 text-xs leading-5 text-amber-100">Complete “Analyze with AI” to unlock the incident assistant.</p>}
      <div ref={conversationRef} aria-live="polite" className={`chat-scroll mt-5 space-y-3 overflow-y-auto pr-2 ${isExpanded ? "min-h-0 flex-1" : "max-h-96"}`}>
        {messages.length === 0 && !isWaiting && <div className="rounded-2xl border border-dashed border-cyan-300/15 bg-cyan-300/3 p-6 text-center"><span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-cyan-300/10 text-cyan-100"><Sparkles size={18} /></span><p className="mt-3 text-sm font-medium text-slate-300">Investigation context is ready</p><p className="mt-1 text-xs leading-5 text-slate-500">Ask about the current evidence, probable causes, or safe next actions.</p></div>}
        {messages.map((message) => (
          <article key={message.id} className={`rounded-xl border p-3 ${message.role === "user" ? "ml-5 border-indigo-400/20 bg-indigo-400/10" : "mr-2 border-white/10 bg-slate-950/60"}`}>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.12em] text-slate-400">
              {message.role === "user" ? <User size={13} /> : <Bot size={13} className="text-cyan-200" />}
              {message.role === "user" ? "You" : "Incident assistant"}
            </div>
            {message.role === "assistant" && <p className="mt-3 flex items-center gap-2 text-xs font-medium text-cyan-100"><Sparkles size={14} />Suggested answer</p>}
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-200">{message.content}</p>
            {message.response?.agentSummary && <AgentSummary summary={message.response.agentSummary} />}
            {message.response?.codeChanges && <CodeChanges code={message.response.codeChanges} />}
          </article>
        ))}
        {isWaiting && <div role="status" className="mr-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-xs text-slate-400"><Bot size={15} className="text-cyan-200" /><span className="sr-only">Incident assistant is thinking…</span><span aria-hidden="true" className="typing-dots"><i/><i/><i/></span></div>}
      </div>
      {error && <p role="alert" className="mt-3 text-xs text-rose-200">{error}</p>}
      <form onSubmit={handleSubmit} className="mt-4">
        <label className="sr-only" htmlFor="incident-chat-question">Ask the incident assistant</label>
        <textarea id="incident-chat-question" disabled={!isEnabled} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={handleKeyDown} placeholder={isEnabled ? "Ask a question about this incident…" : "Analyze the incident to unlock chat…"} rows={3} className="w-full resize-y rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-50" />
        <div className="mt-2 flex items-center justify-between gap-3"><span className="text-[11px] text-slate-500">Enter to send · Shift+Enter for a new line</span><button type="submit" disabled={!canSend} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-cyan-300 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"><Send size={14} />Send</button></div>
      </form>
      </section>
    </>
  );
}

function AgentSummary({ summary }: { summary: string }) {
  return <div className="mt-4 rounded-xl border border-indigo-400/15 bg-indigo-400/6 p-3.5"><p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.12em] text-indigo-100"><Bot size={14} />What the system checked</p><p className="mt-2 text-xs leading-5 text-slate-300">{summary}</p></div>;
}

function CodeChanges({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const lines = code.split("\n");
  const language = /\b(public|private|class|import java)\b/.test(code) ? "Java" : "Code";

  async function copyCode() {
    await navigator.clipboard?.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return <div className="chat-code-editor mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#0b1322]">
    <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/4 px-3 py-2"><span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.12em] text-cyan-100"><Code2 size={14} />Suggested code changes <span className="rounded bg-white/8 px-1.5 py-0.5 text-[10px] text-slate-400">{language}</span></span><button type="button" aria-label="Copy code changes" onClick={() => void copyCode()} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-300 transition hover:bg-white/8 hover:text-white">{copied ? <Check size={13} className="text-emerald-300" /> : <Clipboard size={13} />} {copied ? "Copied" : "Copy"}</button></div>
    <pre className="chat-code-scroll max-h-96 overflow-auto p-3 text-xs leading-6 text-slate-200"><code>{lines.map((line, index) => <span key={index} className="block min-w-max"><span className="mr-4 inline-block w-7 select-none text-right text-slate-600">{index + 1}</span>{line || " "}</span>)}</code></pre>
  </div>;
}

