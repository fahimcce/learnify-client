import { api } from "@/redux/api/api";

export interface AdminProfile {
  _id: string;
  name: string;
  phone: string;
  email: string;
  profilePhoto?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAdminProfilePayload {
  name?: string;
  phone?: string;
}

const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get my profile
    getMyProfile: builder.query<AdminProfile, void>({
      query: () => ({
        url: "/admin/my-profile",
        method: "GET",
      }),
      transformResponse: (response: { data: AdminProfile }) => response.data,
      providesTags: ["admin"],
    }),

    // Update admin profile
    updateAdminProfile: builder.mutation<
      AdminProfile,
      { id: string; data: UpdateAdminProfilePayload }
    >({
      query: ({ id, data }) => ({
        url: `/admin/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: { data: AdminProfile }) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "admin", id },
        "admin",
      ],
    }),

    // Update profile photo
    updateProfilePhoto: builder.mutation<
      AdminProfile,
      { id: string; file: File }
    >({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append("profilePhoto", file);
        return {
          url: `/admin/${id}/profile-photo`,
          method: "PATCH",
          body: formData,
        };
      },
      transformResponse: (response: { data: AdminProfile }) => response.data,
      invalidatesTags: ["admin"],
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useUpdateAdminProfileMutation,
  useUpdateProfilePhotoMutation,
} = adminApi;
