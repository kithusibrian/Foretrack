import { Label, Pie, PieChart, Cell } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DateRangeType } from "@/components/date-range-select";
import { formatCurrency } from "@/lib/format-currency";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPercentage } from "@/lib/format-percentage";
import { EmptyState } from "@/components/empty-state";
import { useExpensePieChartBreakdownQuery } from "@/features/analytics/analyticsAPI";

const COLORS = [
  "#10906D",
  "#0EA5A3",
  "#F59E0B",
  "#F97316",
  "#E25D48",
  "#3B82F6",
];

const formatKsh = (
  value: number,
  options: Parameters<typeof formatCurrency>[1] = {},
) => formatCurrency(value, options).replace(/^KES/i, "KSh");

const chartConfig = {
  amount: {
    label: "Amount",
  },
} satisfies ChartConfig;

const ExpensePieChart = (props: { dateRange?: DateRangeType }) => {
  const { dateRange } = props;

  const { data, isFetching } = useExpensePieChartBreakdownQuery({
    preset: dateRange?.value,
  });
  const categories = data?.data?.breakdown || [];
  const totalSpent = data?.data?.totalSpent || 0;

  if (isFetching) {
    return <PieChartSkeleton />;
  }

  const CustomLegend = () => {
    return (
      <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2">
        {categories.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            ></div>
            <div className="flex w-full justify-between gap-2">
              <span className="truncate text-xs font-medium capitalize">
                {entry.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {formatKsh(entry.value, { decimalPlaces: 0 })}
                </span>
                <span className="text-xs text-muted-foreground/70">
                  ({formatPercentage(entry.percentage, { decimalPlaces: 0 })})
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="border border-amber-100/80 bg-gradient-to-br from-white via-amber-50/50 to-emerald-50/40 shadow-[0_10px_40px_-24px_rgba(226,93,72,0.6)] dark:border-border dark:from-background dark:via-background dark:to-background">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Expenses Breakdown</CardTitle>
        <CardDescription>Total expenses {dateRange?.label}</CardDescription>
      </CardHeader>
      <CardContent className="h-[313px]">
        <div className="w-full">
          {categories.length === 0 ? (
            <EmptyState
              title="No expenses found"
              description="There are no expenses recorded for this period."
            />
          ) : (
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square h-[300px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, item) => {
                        const percentage = Number(
                          item?.payload?.percentage ?? 0,
                        );
                        return [
                          <div key={name} className="flex items-center gap-2">
                            <span>
                              {formatKsh(Number(value), { decimalPlaces: 2 })}
                            </span>
                            <span className="text-muted-foreground">
                              (
                              {formatPercentage(percentage, {
                                decimalPlaces: 0,
                              })}
                              )
                            </span>
                          </div>,
                          String(name),
                        ];
                      }}
                    />
                  }
                />

                <Pie
                  data={categories}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={64}
                  outerRadius={90}
                  paddingAngle={3}
                  strokeWidth={2}
                  stroke="rgba(255,255,255,0.75)"
                >
                  {categories.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      style={{
                        filter: "drop-shadow(0px 4px 10px rgba(15,23,42,0.15))",
                      }}
                    />
                  ))}

                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-2xl font-bold"
                            >
                              {formatKsh(totalSpent, { decimalPlaces: 0 })}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 20}
                              className="fill-muted-foreground text-xs"
                            >
                              Total Spent
                            </tspan>
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
                </Pie>
                <ChartLegend content={<CustomLegend />} />
              </PieChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const PieChartSkeleton = () => (
  <Card className="border border-amber-100/80 dark:border-border">
    <CardHeader className="pb-2">
      <Skeleton className="mt-1 h-6 w-48" />
      <Skeleton className="mt-1 h-4 w-32" />
    </CardHeader>
    <CardContent className="h-[313px]">
      <div className="flex w-full items-center justify-center">
        <div className="relative h-[200px] w-[200px]">
          <Skeleton className="h-full w-full rounded-full" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Skeleton className="mb-2 h-8 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
      <div className="mt-0 space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default ExpensePieChart;
