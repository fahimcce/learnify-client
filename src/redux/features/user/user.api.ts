import { api } from "@/redux/api/api";

export interface UserProfile {
  _id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  profilePhoto?: string;
  isDeleted: boolean;
  isBlocked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfilePayload {
  name?: string;
  phone?: string;
  email?: string;
}

const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get my profile
    getMyProfile: builder.query<UserProfile, void>({
      query: () => ({
        url: "/user/my-profile",
        method: "GET",
      }),
      transformResponse: (response: { data: UserProfile }) => response.data,
      providesTags: ["user"],
    }),

    // Update user profile
    updateUserProfile: builder.mutation<
      UserProfile,
      { id: string; data: UpdateUserProfilePayload }
    >({
      query: ({ id, data }) => ({
        url: `/user/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: { data: UserProfile }) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "user", id },
        "user",
      ],
    }),

    // Update profile photo
    updateProfilePhoto: builder.mutation<
      UserProfile,
      { id: string; file: File }
    >({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append("profilePhoto", file);
        return {
          url: `/user/${id}/profile-photo`,
          method: "PATCH",
          body: formData,
        };
      },
      transformResponse: (response: { data: UserProfile }) => response.data,
      invalidatesTags: ["user"],
    }),

    // Admin: Get all users
    getAllUsers: builder.query<UserProfile[], void>({
      query: () => ({
        url: "/user",
        method: "GET",
      }),
      transformResponse: (response: { data: UserProfile[] }) => response.data,
      providesTags: ["user"],
    }),

    // Admin: Get user by ID
    getUserById: builder.query<UserProfile, string>({
      query: (id) => ({
        url: `/user/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { data: UserProfile }) => response.data,
      providesTags: (_result, _error, id) => [{ type: "user", id }],
    }),

    // Admin: Block/Unblock user
    blockUser: builder.mutation<
      UserProfile,
      { id: string; isBlocked: boolean }
    >({
      query: ({ id, isBlocked }) => ({
        url: `/user/${id}/block-status`,
        method: "PATCH",
        body: { isBlocked },
      }),
      transformResponse: (response: { data: UserProfile }) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "user", id },
        "user",
      ],
    }),

    // Admin: Delete user (soft delete)
    deleteUser: builder.mutation<UserProfile, string>({
      query: (id) => ({
        url: `/user/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { data: UserProfile }) => response.data,
      invalidatesTags: (_result, _error, id) => [{ type: "user", id }, "user"],
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useUpdateUserProfileMutation,
  useUpdateProfilePhotoMutation,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useBlockUserMutation,
  useDeleteUserMutation,
} = userApi;
