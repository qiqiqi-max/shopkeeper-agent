import { ArrowUp, Command, Square } from "lucide-react";
import { FormEvent, KeyboardEvent, useRef } from "react";
import { cn } from "../lib/format";

type ComposerProps = { value: string; disabled: boolean; isStreaming: boolean; onChange: (value: string) => void; onSubmit: () => void; onStop: () => void };

export function Composer({ value, disabled, isStreaming, onChange, onSubmit, onStop }: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const submit = (event: FormEvent) => { event.preventDefault(); if (!disabled) onSubmit(); };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); if (!disabled) onSubmit(); } };
  return <form onSubmit={submit} className="shrink-0 border-t border-ink/10 bg-white/45 px-4 py-4 backdrop-blur-xl lg:px-8"><div className="mx-auto max-w-5xl"><div className="glass-panel flex items-end gap-3 rounded-[12px] border border-white p-2.5"><div className="hidden h-11 w-11 shrink-0 place-items-center rounded-[8px] bg-moss/10 text-moss sm:grid"><Command className="h-4 w-4" aria-hidden="true" /></div><textarea ref={textareaRef} value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={onKeyDown} rows={1} placeholder="问一个电商数据问题…" className="focus-ring max-h-36 min-h-11 flex-1 resize-none bg-transparent px-2 py-3 text-[15px] leading-6 text-ink outline-none placeholder:text-ink/35" /><button type={isStreaming ? "button" : "submit"} onClick={isStreaming ? onStop : undefined} disabled={!isStreaming && disabled} className={cn("focus-ring grid h-11 w-11 shrink-0 place-items-center rounded-[8px] text-white transition active:scale-[0.96]", isStreaming ? "bg-tomato hover:bg-tomato/90" : "bg-ink hover:bg-soot disabled:cursor-not-allowed disabled:bg-ink/25")} title={isStreaming ? "停止分析" : "发送问题"} aria-label={isStreaming ? "停止分析" : "发送问题"}>{isStreaming ? <Square className="h-4 w-4 fill-current" aria-hidden="true" /> : <ArrowUp className="h-5 w-5" aria-hidden="true" />}</button></div><div className="mt-2 text-center text-[11px] text-ink/35">Enter 发送 · Shift + Enter 换行</div></div></form>;
}
