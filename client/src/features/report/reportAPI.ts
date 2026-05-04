import { apiClient } from "@/app/api-client";
import {
  GenerateManualReportParams,
  GenerateManualReportResponse,
  GetAllReportResponse,
  UpdateReportSettingParams,
} from "./reportType";

export const reportApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    getAllReports: builder.query<
      GetAllReportResponse,
      { pageNumber: number; pageSize: number }
    >({
      query: (params) => {
        const { pageNumber = 1, pageSize = 20 } = params;
        return {
          url: "/report/all",
          method: "GET",
          params: { pageNumber, pageSize },
        };
      },
    }),

    updateReportSetting: builder.mutation<void, UpdateReportSettingParams>({
      query: (payload) => ({
        url: "/report/update-setting",
        method: "PUT",
        body: payload,
      }),
    }),

    generateManualReport: builder.mutation<
      GenerateManualReportResponse,
      GenerateManualReportParams
    >({
      query: (payload = {}) => ({
        url: "/report/generate-manual",
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const {
  useGetAllReportsQuery,
  useUpdateReportSettingMutation,
  useGenerateManualReportMutation,
} = reportApi;
