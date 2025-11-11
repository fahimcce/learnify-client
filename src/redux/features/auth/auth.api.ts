import { api } from "@/redux/api/api";

const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    SignUp: builder.mutation({
      query: (post) => ({
        url: "/auth/signup",
        method: "POST",
        body: post,
      }),
      invalidatesTags: ["auth"],
    }),

    Login: builder.mutation({
      query: (post) => ({
        url: "/auth/login",
        method: "POST",
        body: post,
      }),
      invalidatesTags: ["auth"],
    }),

    changePassword: builder.mutation({
      query: (post) => ({
        url: "/auth/change-password",
        method: "POST",
        body: post,
      }),
      invalidatesTags: ["auth"],
    }),
    forgotPassword: builder.mutation({
      query: (post) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: post,
      }),
      invalidatesTags: ["auth"],
    }),
    resetPassword: builder.mutation({
      query: (post) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: post,
      }),
      invalidatesTags: ["auth"],
    }),
  }),
});

export const {
  useSignUpMutation,
  useLoginMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
