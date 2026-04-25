import { apiClient } from "@/app/api-client";
import {
  BudgetFilterParams,
  BudgetListResponse,
  BudgetProgressResponse,
  CreateBudgetBody,
  UpdateBudgetPayload,
} from "./budgetType";

export const budgetApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    getAllBudgets: builder.query<BudgetListResponse, BudgetFilterParams>({
      query: ({ month, year }) => ({
        url: "/budget/all",
        method: "GET",
        params: { month, year },
      }),
      providesTags: ["budgets"],
    }),

    getBudgetProgress: builder.query<
      BudgetProgressResponse,
      BudgetFilterParams
    >({
      query: ({ month, year, alertThreshold }) => ({
        url: "/budget/progress",
        method: "GET",
        params: { month, year, alertThreshold },
      }),
      providesTags: ["budgets", "analytics"],
    }),

    createBudget: builder.mutation<void, CreateBudgetBody>({
      query: (body) => ({
        url: "/budget/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["budgets", "analytics"],
    }),

    updateBudget: builder.mutation<void, UpdateBudgetPayload>({
      query: ({ id, body }) => ({
        url: `/budget/update/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["budgets", "analytics"],
    }),

    deleteBudget: builder.mutation<void, string>({
      query: (id) => ({
        url: `/budget/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["budgets", "analytics"],
    }),
  }),
});

export const {
  useGetAllBudgetsQuery,
  useGetBudgetProgressQuery,
  useCreateBudgetMutation,
  useUpdateBudgetMutation,
  useDeleteBudgetMutation,
} = budgetApi;
