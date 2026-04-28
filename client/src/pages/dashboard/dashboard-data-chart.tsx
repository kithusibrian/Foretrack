import * as React from "react";
import { format } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
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
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { EmptyState } from "@/components/empty-state";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { DateRangeType } from "@/components/date-range-select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format-currency";
import { useChartAnalyticsQuery } from "@/features/analytics/analyticsAPI";

interface PropsType {
  dateRange?: DateRangeType;
}

const COLORS = ["#059669", "#ef4444"]; // slightly richer green and red for contrast
const TRANSACTION_TYPES = ["income", "expenses"];

const chartConfig = {
  income: {
    label: "Income",
    color: COLORS[0],
  },
  expenses: {
    label: "Expenses",
    color: COLORS[1],
  },
} satisfies ChartConfig;

const formatKsh = (
  value: number,
  options: Parameters<typeof formatCurrency>[1] = {},
) => formatCurrency(value, options).replace(/^KES/i, "KSh");

const DashboardDataChart: React.FC<PropsType> = (props) => {
  const { dateRange } = props;
  const isMobile = useIsMobile();

  const { data, isFetching } = useChartAnalyticsQuery({
    preset: dateRange?.value,
  });
  const chartData = data?.data?.chartData || [];
  const totalExpenseCount = data?.data?.totalExpenseCount || 0;
  const totalIncomeCount = data?.data?.totalIncomeCount || 0;
  const maxValue = React.useMemo(() => {
    return Math.max(
      ...chartData.map((item) =>
        Math.max(Number(item.income || 0), Number(item.expenses || 0)),
      ),
      0,
    );
  }, [chartData]);

  if (isFetching) {
    return <ChartSkeleton />;
  }

  return (
    <Card className="!pt-0 border border-emerald-100/80 bg-gradient-to-br from-emerald-50/70 via-white to-amber-50/40 shadow-[0_10px_40px_-24px_rgba(16,144,109,0.6)] dark:border-border dark:from-background dark:to-background">
      <CardHeader
        className="flex flex-col items-stretch !space-y-0 border-b border-emerald-100/80
      dark:border-border !p-0 pr-1 sm:flex-row"
      >
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-0 sm:py-0">
          <CardTitle className="text-lg">Transaction Overview</CardTitle>
          <CardDescription>
            <span>Showing total transactions {dateRange?.label}</span>
          </CardDescription>
        </div>
        <div className="flex">
          {TRANSACTION_TYPES.map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <div
                key={chart}
                className="flex flex-1 flex-col justify-center gap-1 px-6 py-4 text-center even:border-l 
                sm:border-l border-gray-100 dark:border-border sm:px-4 sm:py-6 min-w-36"
              >
                <span className="w-full block text-xs text-muted-foreground">
                  No of {chartConfig[chart].label}
                </span>
                <span className="flex items-center justify-center gap-2 text-base sm:text-lg md:text-2xl lg:text-3xl font-semibold leading-none">
                  {key === TRANSACTION_TYPES[0] ? (
                    <TrendingUpIcon className="size-3 ml-2 text-primary" />
                  ) : (
                    <TrendingDownIcon className="size-3 ml-2 text-destructive" />
                  )}
                  {key === TRANSACTION_TYPES[0]
                    ? totalIncomeCount
                    : totalExpenseCount}
                </span>
              </div>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-2 sm:px-6 sm:pt-2 h-[250px] sm:h-[280px] md:h-[313px]">
        {chartData?.length === 0 ? (
          <EmptyState
            title="No transaction data"
            description="There are no transactions recorded for this period."
          />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] sm:h-[280px] md:h-[313px] w-full"
          >
            <BarChart
              data={chartData || []}
              barGap={4}
              barCategoryGap={isMobile ? "4%" : "8%"}
            >
              <defs>
                <linearGradient
                  id="incomeBarGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={COLORS[0]} stopOpacity={0.95} />
                  <stop
                    offset="100%"
                    stopColor={COLORS[0]}
                    stopOpacity={0.35}
                  />
                </linearGradient>
                <linearGradient
                  id="expenseBarGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={COLORS[1]} stopOpacity={0.95} />
                  <stop
                    offset="100%"
                    stopColor={COLORS[1]}
                    stopOpacity={0.35}
                  />
                </linearGradient>
                <filter
                  id="barShadow"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feDropShadow
                    dx="0"
                    dy="4"
                    stdDeviation="6"
                    floodColor="#0f172a"
                    floodOpacity="0.08"
                  />
                </filter>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="4 4"
                stroke="rgba(15,23,42,0.06)"
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={isMobile ? 20 : 25}
                tickFormatter={(value) =>
                  format(new Date(value), isMobile ? "MMM d" : "MMMM d, yyyy")
                }
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={isMobile ? 56 : 72}
                tickFormatter={(value) =>
                  formatKsh(Number(value), { compact: true, decimalPlaces: 0 })
                }
                domain={[0, Math.ceil(maxValue * 1.2)]}
              />
              <ReferenceLine y={0} stroke="var(--border)" />
              <ChartTooltip
                cursor={{
                  fill: "rgba(15,23,42,0.04)",
                  strokeWidth: 1,
                }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      format(new Date(value), "MMM d, yyyy")
                    }
                    indicator="line"
                    formatter={(value, name) => {
                      const isExpense = name === "expenses";
                      const color = isExpense ? COLORS[1] : COLORS[0];
                      return [
                        <span key={name} style={{ color }}>
                          {formatCurrency(Number(value), {
                            showSign: true,
                            compact: true,
                            isExpense,
                          })}
                        </span>,
                        isExpense ? "Expenses" : "Income",
                      ];
                    }}
                  />
                }
              />
              <Bar
                dataKey="income"
                name="income"
                fill="url(#incomeBarGradient)"
                radius={[8, 8, 0, 0]}
                maxBarSize={isMobile ? 48 : 80}
                stroke={COLORS[0]}
                strokeWidth={1.5}
                strokeOpacity={0.95}
                style={{ filter: "url(#barShadow)" }}
              />
              <Bar
                dataKey="expenses"
                name="expenses"
                fill="url(#expenseBarGradient)"
                radius={[8, 8, 0, 0]}
                maxBarSize={isMobile ? 48 : 80}
                stroke={COLORS[1]}
                strokeWidth={1.5}
                strokeOpacity={0.95}
                style={{ filter: "url(#barShadow)" }}
              />
              <ChartLegend
                verticalAlign="bottom"
                content={<ChartLegendContent />}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

const ChartSkeleton = () => (
  <Card className="!shadow-none border-1 border-gray-100 dark:border-border !pt-0">
    <CardHeader className="flex flex-col items-stretch !space-y-0 border-b border-gray-100 dark:border-border !p-0 pr-1 sm:flex-row">
      <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-0 sm:py-0">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32 mt-1" />
      </div>
      <div className="flex">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex flex-1 flex-col justify-center gap-1 px-6 py-4 text-center even:border-l 
            sm:border-l border-gray-100 dark:border-border sm:px-4 sm:py-6 min-w-36"
          >
            <Skeleton className="h-4 w-20 mx-auto" />
            <Skeleton className="h-8 w-24 mx-auto mt-1 sm:h-12" />
          </div>
        ))}
      </div>
    </CardHeader>
    <CardContent className="px-2 pt-2 sm:px-6 sm:pt-2 h-[280px]">
      <Skeleton className="h-full w-full" />
    </CardContent>
  </Card>
);

export default DashboardDataChart;

