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

export interface PendingMentor {
  _id: string;
  name: string;
  phone: string;
  email: string;
  profilePhoto?: string;
  isVerified: boolean;
  isBlocked: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get admin profile
    getAdminProfile: builder.query<AdminProfile, void>({
      query: () => ({
        url: "/admin/my-profile",
        method: "GET",
      }),
      transformResponse: (response: { data: AdminProfile }) => response.data,
      providesTags: [{ type: "admin", id: "PROFILE" }, "admin"],
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
        { type: "admin", id: "PROFILE" },
        { type: "user", id: "PROFILE" },
        "admin",
        "user",
      ],
    }),

    // Update admin profile photo
    updateAdminProfilePhoto: builder.mutation<
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
      invalidatesTags: [
        { type: "admin", id: "PROFILE" },
        { type: "user", id: "PROFILE" },
        "admin",
        "user",
      ],
    }),

    // Get pending mentor verification requests
    getPendingMentors: builder.query<PendingMentor[], void>({
      query: () => ({
        url: "/admin/mentor-verification/pending",
        method: "GET",
      }),
      transformResponse: (response: { data: PendingMentor[] }) => response.data,
      providesTags: ["mentor-verification"],
    }),

    // Get all mentors (verified and unverified) for admin verification
    getAllMentorsForVerification: builder.query<PendingMentor[], void>({
      query: () => ({
        url: "/admin/mentor-verification/all",
        method: "GET",
      }),
      transformResponse: (response: { data: PendingMentor[] }) => response.data,
      providesTags: ["mentor-verification"],
    }),

    // Approve mentor verification
    approveMentor: builder.mutation<PendingMentor, string>({
      query: (mentorId) => ({
        url: `/admin/mentor-verification/approve/${mentorId}`,
        method: "PATCH",
      }),
      transformResponse: (response: { data: PendingMentor }) => response.data,
      invalidatesTags: ["mentor-verification", "user"],
    }),

    // Unverify (revoke) mentor access
    unverifyMentor: builder.mutation<PendingMentor, string>({
      query: (mentorId) => ({
        url: `/admin/mentor-verification/unverify/${mentorId}`,
        method: "PATCH",
      }),
      transformResponse: (response: { data: PendingMentor }) => response.data,
      invalidatesTags: ["mentor-verification", "user"],
    }),

    // Reject mentor verification
    rejectMentor: builder.mutation<PendingMentor, string>({
      query: (mentorId) => ({
        url: `/admin/mentor-verification/reject/${mentorId}`,
        method: "PATCH",
      }),
      transformResponse: (response: { data: PendingMentor }) => response.data,
      invalidatesTags: ["mentor-verification", "user"],
    }),
  }),
});

export const {
  useGetAdminProfileQuery,
  useUpdateAdminProfileMutation,
  useUpdateAdminProfilePhotoMutation,
  useGetPendingMentorsQuery,
  useGetAllMentorsForVerificationQuery,
  useApproveMentorMutation,
  useUnverifyMentorMutation,
  useRejectMentorMutation,
} = adminApi;
