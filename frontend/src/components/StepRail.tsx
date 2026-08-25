/**
 * 智能体执行流程组件
 * 用紧凑的轨迹列表替代大画布流程图，更适合工作台场景
 */
import { Check, Circle, LoaderCircle, X } from "lucide-react";
import { cn, formatTime } from "../lib/format";
import type { ProgressStatus, StepState } from "../types/agent";

const stepOrder = [
  "抽取关键词",
  "召回字段信息",
  "召回指标信息",
  "召回字段取值",
  "合并召回信息",
  "过滤指标信息",
  "过滤表信息",
  "增加额外上下文",
  "生成SQL",
  "校验SQL",
  "校正SQL",
  "执行SQL",
];

type FlowStatus = ProgressStatus | "pending";

function getStatusMap(steps: StepState[]) {
  return steps.reduce<Record<string, StepState>>((map, item) => {
    map[item.step] = item;
    return map;
  }, {});
}

function statusFor(step: string, map: Record<string, StepState>): FlowStatus {
  return map[step]?.status ?? "pending";
}

function StatusIcon({ status }: { status: FlowStatus }) {
  if (status === "running") {
    return <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />;
  }
  if (status === "success") {
    return <Check className="h-4 w-4" aria-hidden="true" />;
  }
  if (status === "error") {
    return <X className="h-4 w-4" aria-hidden="true" />;
  }
  return <Circle className="h-4 w-4" aria-hidden="true" />;
}

export function StepRail({ steps = [] }: { steps?: StepState[] }) {
  if (steps.length === 0) return null;

  const statusMap = getStatusMap(steps);
  const completed = steps.filter((item) => item.status === "success").length;
  const running = steps.find((item) => item.status === "running");
  const latestUpdatedAt = steps.reduce(
    (max, item) => Math.max(max, item.updatedAt),
    steps[0]?.updatedAt ?? Date.now(),
  );

  return (
    <section className="mt-4 border-t border-slate-200 pt-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">执行轨迹</div>
          <div className="mt-1 text-xs text-slate-500">
            {completed}/{stepOrder.length} 完成
          </div>
        </div>
        <div className="text-xs text-slate-400">
          {running ? `当前：${running.step}` : "流程已结束"}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {stepOrder.map((step) => {
          const status = statusFor(step, statusMap);
          return (
            <div
              key={step}
              className={cn(
                "flex items-center gap-3 border px-3 py-2.5 text-sm",
                status === "pending" && "border-slate-200 bg-white/70 text-slate-500",
                status === "running" && "border-brass/35 bg-brass/10 text-slate-900",
                status === "success" && "border-moss/20 bg-moss/10 text-slate-900",
                status === "error" && "border-tomato/30 bg-tomato/10 text-tomato",
              )}
            >
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full",
                  status === "pending" && "bg-slate-100 text-slate-400",
                  status === "running" && "bg-brass/15 text-brass",
                  status === "success" && "bg-moss/15 text-moss",
                  status === "error" && "bg-tomato/15 text-tomato",
                )}
              >
                <StatusIcon status={status} />
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">{step}</span>
              <span className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                {status === "pending" ? "waiting" : status}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-slate-400">更新于 {formatTime(latestUpdatedAt)}</div>
    </section>
  );
}
