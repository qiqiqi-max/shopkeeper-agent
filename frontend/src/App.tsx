import {
  Activity,
  BarChart3,
  CheckCircle2,
  Eraser,
  History,
  Menu,
  MessageSquarePlus,
  Server,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Composer } from "./components/Composer";
import { EmptyState } from "./components/EmptyState";
import { MessageBubble } from "./components/MessageBubble";
import { streamQuery } from "./lib/agentApi";
import { cn, summarizeResult } from "./lib/format";
import type { AgentEvent, ChatMessage, StepState } from "./types/agent";

const examples = [
  "统计 2025 年第一季度各大区的 GMV，并按 GMV 从高到低排序",
  "统计 2025 年 3 月各商品品类的销量和销售额",
  "查询华东地区 2025 年第一季度销售额最高的前 5 个商品",
  "按会员等级统计 2025 年第一季度的订单数和销售额",
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "Vite /api proxy";

function makeId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function upsertStep(steps: StepState[] = [], event: Extract<AgentEvent, { type: "progress" }>) {
  return [...steps.filter((item) => item.step !== event.step), { step: event.step, status: event.status, updatedAt: Date.now() }];
}

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [activeController, setActiveController] = useState<AbortController | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isStreaming = Boolean(activeController);
  const canSubmit = draft.trim().length > 0 && !isStreaming;
  const completedCount = useMemo(() => messages.filter((message) => message.role === "assistant" && message.status === "done").length, [messages]);

  useEffect(() => {
    if (messages.length === 0) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const startQuery = async (rawQuery = draft) => {
    const query = rawQuery.trim();
    if (!query || isStreaming) return;
    const userMessage: ChatMessage = { id: makeId(), role: "user", content: query, createdAt: Date.now() };
    const assistantId = makeId();
    const assistantMessage: ChatMessage = { id: assistantId, role: "assistant", content: "正在连接问数智能体…", createdAt: Date.now(), status: "streaming", steps: [] };
    const controller = new AbortController();
    setActiveController(controller);
    setDraft("");
    setMobileNavOpen(false);
    setMessages((current) => [...current, userMessage, assistantMessage]);

    const onEvent = (event: AgentEvent) => {
      setMessages((current) => current.map((message) => {
        if (message.id !== assistantId) return message;
        if (event.type === "progress") return { ...message, content: event.status === "running" ? `正在执行：${event.step}` : message.content, steps: upsertStep(message.steps, event) };
        if (event.type === "result") return { ...message, status: "done", content: summarizeResult(event.data), result: event.data };
        return { ...message, status: "error", content: "这次查询没有成功", error: event.message };
      }));
    };

    try {
      await streamQuery(query, { signal: controller.signal, onEvent });
      setMessages((current) => current.map((message) => message.id === assistantId && message.status === "streaming" ? { ...message, status: "done", content: "流程已结束，后端未返回查询结果。" } : message));
    } catch (error) {
      const isAbort = error instanceof DOMException && error.name === "AbortError";
      setMessages((current) => current.map((message) => message.id === assistantId ? { ...message, status: isAbort ? "done" : "error", content: isAbort ? "已停止本次查询" : "无法连接问数接口。", error: isAbort ? undefined : error instanceof Error ? error.message : String(error) } : message));
    } finally {
      setActiveController(null);
    }
  };

  const clearConversation = () => {
    if (isStreaming) return;
    setMessages([]);
    setDraft("");
  };

  const sidebar = (
    <aside className="sidebar-shell flex min-h-0 h-full flex-col border-r border-ink/10">
      <div className="border-b border-ink/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-ink text-white shadow-line"><BarChart3 className="h-5 w-5" aria-hidden="true" /></div>
          <div><div className="text-[15px] font-bold tracking-[0.01em] text-ink">电商问数</div><div className="mt-0.5 text-xs text-ink/45">shopkeeper-agent</div></div>
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-5">
        <button type="button" onClick={clearConversation} disabled={isStreaming} className="focus-ring flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-ink text-sm font-semibold text-white transition hover:bg-soot active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-ink/35"><MessageSquarePlus className="h-4 w-4" aria-hidden="true" />新建查询</button>
        <section>
          <div className="mb-3 flex items-center gap-2 px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-ink/45"><History className="h-3.5 w-3.5" aria-hidden="true" />示例问题</div>
          <div className="space-y-2">{examples.map((example) => <button key={example} type="button" disabled={isStreaming} onClick={() => startQuery(example)} className="focus-ring w-full rounded-[8px] border border-ink/10 bg-white/65 px-3 py-3 text-left text-[13px] leading-5 text-ink/75 transition hover:border-moss/35 hover:bg-white disabled:cursor-not-allowed disabled:opacity-55">{example}</button>)}</div>
        </section>
      </div>
      <div className="border-t border-ink/10 p-4"><div className="grid gap-3 text-xs text-ink/55"><div className="flex items-center justify-between gap-3"><span className="inline-flex items-center gap-2"><Server className="h-3.5 w-3.5" aria-hidden="true" />API</span><span className="truncate font-mono text-[10px]">{API_BASE_URL}</span></div><div className="flex items-center justify-between"><span className="inline-flex items-center gap-2"><Activity className="h-3.5 w-3.5" aria-hidden="true" />已完成</span><span className="font-semibold text-ink">{completedCount}</span></div></div></div>
    </aside>
  );

  return (
    <div className="app-shell h-[100dvh] overflow-hidden text-ink">
      <div className="grain pointer-events-none fixed inset-0" />
      <div className="relative grid h-full min-h-0 overflow-hidden lg:grid-cols-[272px_minmax(0,1fr)]">
        <div className="hidden lg:block">{sidebar}</div>
        <main className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-ink/10 bg-white/55 px-4 backdrop-blur-xl lg:px-7">
            <div className="flex min-w-0 items-center gap-3"><button type="button" onClick={() => setMobileNavOpen(true)} className="focus-ring grid h-10 w-10 place-items-center rounded-[8px] border border-ink/10 bg-white text-ink lg:hidden" aria-label="打开导航"><Menu className="h-4 w-4" /></button><div className="min-w-0"><div className="truncate text-sm font-bold text-ink">智能数据分析 Agent</div><div className="mt-0.5 truncate text-xs text-ink/45">自然语言 → 检索 → SQL → 结果</div></div></div>
            <div className="flex items-center gap-3"><div className={cn("hidden items-center gap-2 text-xs font-semibold sm:flex", isStreaming ? "text-brass" : "text-moss")}><span className={cn("h-2 w-2 rounded-full", isStreaming ? "animate-pulse bg-brass" : "bg-moss")} />{isStreaming ? "分析中" : "系统就绪"}</div><button type="button" onClick={clearConversation} disabled={messages.length === 0 || isStreaming} className="focus-ring grid h-10 w-10 place-items-center rounded-[8px] text-ink/50 transition hover:bg-ink/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30" title="清空对话" aria-label="清空对话"><Eraser className="h-4 w-4" /></button></div>
          </header>
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {messages.length === 0 ? <EmptyState examples={examples} onUseExample={(example) => setDraft(example)} /> : <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-7 lg:px-8 lg:py-9">{messages.map((message) => <MessageBubble key={message.id} message={message} />)}</div>}
          </div>
          <div className="flex shrink-0 items-center justify-center gap-2 border-t border-ink/10 bg-white/40 px-4 py-2 text-[11px] text-ink/45"><CheckCircle2 className="h-3.5 w-3.5 text-moss" aria-hidden="true" />结果会展示执行流程与可核对的数据表</div>
          <Composer value={draft} disabled={!canSubmit} isStreaming={isStreaming} onChange={setDraft} onSubmit={() => startQuery()} onStop={() => activeController?.abort()} />
        </main>
      </div>
      {mobileNavOpen && <div className="fixed inset-0 z-50 lg:hidden"><button type="button" className="absolute inset-0 bg-ink/25" aria-label="关闭导航" onClick={() => setMobileNavOpen(false)} /><div className="relative h-full w-[min(86vw,320px)]">{sidebar}<button type="button" onClick={() => setMobileNavOpen(false)} className="focus-ring absolute right-3 top-4 grid h-9 w-9 place-items-center rounded-[8px] bg-white text-ink" aria-label="关闭导航"><X className="h-4 w-4" /></button></div></div>}
    </div>
  );
}
