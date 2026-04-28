import { apiClient } from "@/app/api-client";

export const goalApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    getAllGoals: builder.query<any, void>({
      query: () => ({
        url: "/goal/all",
        method: "GET",
      }),
      providesTags: ["goals"],
    }),
    getGoal: builder.query<any, string>({
      query: (id) => ({
        url: `/goal/${id}`,
        method: "GET",
      }),
      providesTags: ["goals"],
    }),
    createGoal: builder.mutation<any, { title: string; targetAmount: number; description?: string; targetDate?: string }>(
      {
        query: (body) => ({
          url: "/goal/create",
          method: "POST",
          body,
        }),
        invalidatesTags: ["goals"],
      },
    ),
    updateGoal: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/goal/update/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["goals"],
    }),
    deleteGoal: builder.mutation<any, string>({
      query: (id) => ({
        url: `/goal/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["goals"],
    }),
    contributeToGoal: builder.mutation<any, { id: string; amount: number; transactionId?: string }>(
      {
        query: ({ id, ...body }) => ({
          url: `/goal/${id}/contribute`,
          method: "POST",
          body,
        }),
        invalidatesTags: ["goals", "transactions"],
      },
    ),
  }),
});

export const {
  useGetAllGoalsQuery,
  useGetGoalQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useDeleteGoalMutation,
  useContributeToGoalMutation,
} = goalApi;
