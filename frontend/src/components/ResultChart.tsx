/**
 * 查询结果图表
 * 从表格结果中识别一列维度和一列数值，生成轻量柱状图。
 */
import { BarChart3 } from "lucide-react";

type ChartRow = {
  label: string;
  value: number;
};

function normalizeRows(data: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(data)) return [];

  return data.filter(
    (item): item is Record<string, unknown> =>
      Boolean(item) && typeof item === "object" && !Array.isArray(item),
  );
}

function pickChartRows(data: unknown): ChartRow[] {
  const rows = normalizeRows(data);
  if (rows.length === 0) return [];

  const columns = Array.from(
    rows.reduce((keys, row) => {
      Object.keys(row).forEach((key) => keys.add(key));
      return keys;
    }, new Set<string>()),
  );
  const numberColumn = columns.find((column) =>
    rows.some((row) => typeof row[column] === "number"),
  );
  const labelColumn = columns.find((column) => column !== numberColumn);

  if (!numberColumn || !labelColumn) return [];

  return rows
    .map((row) => ({
      label: String(row[labelColumn] ?? "-"),
      value: Number(row[numberColumn] ?? 0),
    }))
    .filter((row) => Number.isFinite(row.value))
    .slice(0, 8);
}

export function ResultChart({ data }: { data: unknown }) {
  const rows = pickChartRows(data);
  if (rows.length === 0) return null;

  const max = Math.max(...rows.map((row) => row.value), 1);

  return (
    <section className="mt-4 border border-slate-200 bg-white/88">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <BarChart3 className="h-4 w-4 text-moss" aria-hidden="true" />
          图表
        </div>
        <div className="text-xs text-slate-500">Top {rows.length}</div>
      </div>
      <div className="space-y-3 px-4 py-4">
        {rows.map((row) => {
          const width = `${Math.max((row.value / max) * 100, 4)}%`;

          return (
            <div key={row.label} className="grid grid-cols-[80px_minmax(0,1fr)_72px] items-center gap-3 text-sm">
              <div className="truncate text-slate-600" title={row.label}>
                {row.label}
              </div>
              <div className="h-8 bg-slate-100">
                <div className="h-full bg-moss/75" style={{ width }} />
              </div>
              <div className="truncate text-right font-mono text-xs text-slate-700">
                {row.value.toLocaleString("zh-CN")}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
