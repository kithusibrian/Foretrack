import { formatCurrency } from "@/lib/format-currency";
import { CalendarDays, Flag, Wallet } from "lucide-react";

export type GoalCardData = {
  _id: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
};

type Props = {
  goal: GoalCardData;
};

export default function GoalCard({ goal }: Props) {
  const target = goal.targetAmount ?? 0;
  const current = goal.currentAmount ?? 0;
  const percent = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const remaining = Math.max(target - current, 0);
  const isCompleted = percent >= 100;

  const ringSize = 52;
  const ringStroke = 5;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (percent / 100) * ringCircumference;

  const fmt = (v: number) => formatCurrency(v).replace(/^KES/i, "KSh");
  const hasDate = Boolean(goal.targetDate);

  const formattedDate = hasDate
    ? new Intl.DateTimeFormat("en-KE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(goal.targetDate as string))
    : "No deadline";

  const progressTone =
    isCompleted
      ? "from-emerald-500 to-green-500"
      : percent >= 70
        ? "from-cyan-500 to-sky-500"
        : "from-amber-500 to-orange-500";

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-b from-white to-slate-50/80 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      {isCompleted ? (
        <div className="absolute right-3 top-3 inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
          Goal Reached
        </div>
      ) : null}
      <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-cyan-100/60 blur-2xl transition-transform duration-300 group-hover:scale-110" />
      {isCompleted ? (
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 animate-pulse rounded-full bg-emerald-200/50 blur-2xl" />
      ) : null}

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-900">{goal.title}</h3>
          {goal.description ? (
            <p className="line-clamp-1 text-xs text-slate-500">{goal.description}</p>
          ) : null}

          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-2 py-1 text-[11px] font-medium text-slate-600">
            <CalendarDays className="h-3.5 w-3.5 text-cyan-600" />
            {formattedDate}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-2">
          <div className="flex items-center gap-2">
            <div className="relative grid place-items-center">
              <svg width={ringSize} height={ringSize} className="-rotate-90">
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringRadius}
                  strokeWidth={ringStroke}
                  className="fill-none stroke-slate-200"
                />
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringRadius}
                  strokeWidth={ringStroke}
                  strokeLinecap="round"
                  className={
                    isCompleted
                      ? "fill-none stroke-emerald-500"
                      : "fill-none stroke-cyan-500"
                  }
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={Math.max(0, ringOffset)}
                  style={{ transition: "stroke-dashoffset 0.55s ease" }}
                />
              </svg>
              <span className="absolute text-[10px] font-semibold text-slate-700">
                {Math.round(percent)}%
              </span>
            </div>

            <div className="text-right">
              <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Saved
              </div>
              <div className="text-sm font-semibold text-slate-900">{fmt(current)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-4 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Flag className="h-3.5 w-3.5" />
            Target {fmt(target)}
          </span>
          <span className="font-semibold text-slate-700">{percent.toFixed(1)}%</span>
        </div>

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/70">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${progressTone} transition-all duration-500`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5" />
            Remaining
          </span>
          <span className="font-medium text-slate-700">{fmt(remaining)}</span>
        </div>
      </div>
    </div>
  );
}
