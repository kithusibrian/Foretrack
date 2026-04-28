import { apiClient } from "@/app/api-client";
import {
  ChartAnalyticsResponse,
  ExpensePieChartBreakdownResponse,
  FilterParams,
  SummaryAnalyticsResponse,
} from "./anayticsType";

export const analyticsApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    summaryAnalytics: builder.query<SummaryAnalyticsResponse, FilterParams>({
      query: ({ preset, from, to }) => ({
        url: "/analytics/summary",
        method: "GET",
        params: { preset, from, to },
      }),
      providesTags: ["analytics"],
    }),
    chartAnalytics: builder.query<ChartAnalyticsResponse, FilterParams>({
      query: ({ preset, from, to }) => ({
        url: "/analytics/chart",
        method: "GET",
        params: { preset, from, to },
      }),
      providesTags: ["analytics"],
    }),
    expensePieChartBreakdown: builder.query<
      ExpensePieChartBreakdownResponse,
      FilterParams
    >({
      query: ({ preset, from, to }) => ({
        url: "/analytics/expense-breakdown",
        method: "GET",
        params: { preset, from, to },
      }),
      providesTags: ["analytics"],
    }),
    coach: builder.mutation<
      { data: { answer: string } },
      { question: string; preset?: string; from?: string; to?: string }
    >({
      query: (body) => ({
        url: "/analytics/coach",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useSummaryAnalyticsQuery,
  useChartAnalyticsQuery,
  useExpensePieChartBreakdownQuery,
  useCoachMutation,
} = analyticsApi;
