import { ArrowUpRight, BarChart3, Database, Search, Sparkles } from "lucide-react";

type EmptyStateProps = { examples: string[]; onUseExample: (example: string) => void };

const highlights = [
  { label: "混合检索", detail: "字段、指标、取值协同召回", icon: Search },
  { label: "SQL 闭环", detail: "生成、校验、修正、执行", icon: Database },
  { label: "过程可见", detail: "SSE 实时展示 Agent 节点", icon: BarChart3 },
];

export function EmptyState({ examples, onUseExample }: EmptyStateProps) {
  return <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col justify-start px-4 py-10 lg:justify-center lg:px-8 lg:py-14">
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,.85fr)] lg:items-end">
      <div>
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-moss/20 bg-moss/8 px-3 py-1.5 text-xs font-bold tracking-[0.04em] text-moss"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" />SHOPKEEPER AGENT</div>
        <h1 className="max-w-2xl text-balance text-4xl font-bold leading-[1.08] tracking-[-0.03em] text-ink sm:text-6xl">让数据回答<br /><span className="text-moss">业务问题。</span></h1>
        <p className="mt-5 max-w-xl text-[15px] leading-7 text-ink/60">用自然语言查询电商数仓。Agent 会自动理解问题、召回元数据、生成并校验 SQL，再把结果和执行过程交给你核对。</p>
      </div>
      <div className="glass-panel rounded-[12px] border border-white/80 p-5 lg:mb-1"><div className="mb-5 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[0.14em] text-ink/45">Workflow</span><span className="inline-flex items-center gap-1.5 text-xs font-semibold text-moss"><span className="h-1.5 w-1.5 rounded-full bg-moss" />Ready</span></div><div className="space-y-3">{["理解自然语言问题", "召回字段与指标", "生成并校验 SQL", "返回可核对结果"].map((step, index) => <div key={step} className="flex items-center gap-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-moss/10 text-xs font-bold text-moss">0{index + 1}</span><span className="text-sm font-medium text-ink/75">{step}</span><span className="ml-auto h-px w-8 bg-moss/20" /></div>)}</div></div>
    </div>
    <div className="mt-10 grid gap-3 sm:grid-cols-3">{highlights.map(({ label, detail, icon: Icon }) => <div key={label} className="rounded-[10px] border border-ink/10 bg-white/55 p-4"><Icon className="mb-6 h-5 w-5 text-moss" aria-hidden="true" /><div className="text-sm font-bold text-ink">{label}</div><div className="mt-1 text-xs leading-5 text-ink/50">{detail}</div></div>)}</div>
    <div className="mt-7"><div className="mb-3 flex items-center justify-between"><div className="text-xs font-bold uppercase tracking-[0.14em] text-ink/45">从一个问题开始</div><div className="hidden text-xs text-ink/40 sm:block">点击示例即可填入输入框</div></div><div className="grid gap-3 md:grid-cols-2">{examples.map((example) => <button key={example} type="button" onClick={() => onUseExample(example)} className="focus-ring group flex min-h-16 items-center justify-between gap-4 rounded-[10px] border border-ink/10 bg-white/70 px-4 py-3 text-left text-[14px] leading-6 text-ink/75 transition hover:-translate-y-0.5 hover:border-moss/35 hover:bg-white hover:shadow-line"><span>{example}</span><ArrowUpRight className="h-4 w-4 shrink-0 text-ink/25 transition group-hover:text-moss" aria-hidden="true" /></button>)}</div></div>
  </div>;
}
