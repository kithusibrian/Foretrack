import { apiClient } from "@/app/api-client";
import {
  ChangePasswordPayload,
  ChangePasswordResponse,
  DeleteAccountPayload,
  DeleteAccountResponse,
  UpdateUserResponse,
} from "./userType";

export const userApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    updateUser: builder.mutation<UpdateUserResponse, FormData>({
      query: (formData) => ({
        url: "/user/update",
        method: "PUT",
        body: formData,
      }),
    }),
    changePassword: builder.mutation<
      ChangePasswordResponse,
      ChangePasswordPayload
    >({
      query: (body) => ({
        url: "/user/change-password",
        method: "PUT",
        body,
      }),
    }),
    deleteAccount: builder.mutation<
      DeleteAccountResponse,
      DeleteAccountPayload
    >({
      query: (body) => ({
        url: "/user/delete-account",
        method: "DELETE",
        body,
      }),
    }),
  }),
});

export const {
  useUpdateUserMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
} = userApi;
