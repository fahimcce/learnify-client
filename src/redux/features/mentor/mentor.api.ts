import { api } from "@/redux/api/api";

export interface MentorProfile {
  _id: string;
  name: string;
  phone: string;
  email: string;
  profilePhoto?: string;
  isDeleted: boolean;
  isBlocked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MentorStatistics {
  assignedCoursesCount: number;
  totalEnrollments: number;
  activeStudents: number;
}

export interface UpdateMentorProfilePayload {
  name?: string;
  phone?: string;
}

const mentorApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMentorProfile: builder.query<MentorProfile, void>({
      query: () => ({
        url: "/user/my-profile",
        method: "GET",
      }),
      transformResponse: (response: { data: MentorProfile }) => response.data,
      providesTags: [{ type: "mentor", id: "PROFILE" }, "mentor"],
    }),

    getMentorStatistics: builder.query<MentorStatistics, void>({
      query: () => ({
        url: "/mentor/statistics",
        method: "GET",
      }),
      transformResponse: (response: { data: MentorStatistics }) =>
        response.data,
      providesTags: ["mentor"],
    }),

    getAllMentors: builder.query<MentorProfile[], void>({
      query: () => ({
        url: "/mentor",
        method: "GET",
      }),
      transformResponse: (response: { data: MentorProfile[] }) => response.data,
      providesTags: ["mentor"],
    }),

    updateMentorProfile: builder.mutation<
      MentorProfile,
      { id: string; data: UpdateMentorProfilePayload }
    >({
      query: ({ id, data }) => ({
        url: `/user/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: { data: MentorProfile }) => response.data,
      invalidatesTags: [
        { type: "mentor", id: "PROFILE" },
        { type: "user", id: "PROFILE" },
        "mentor",
        "user",
      ],
    }),

    updateMentorProfilePhoto: builder.mutation<
      MentorProfile,
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
      transformResponse: (response: { data: MentorProfile }) => response.data,
      invalidatesTags: [
        { type: "mentor", id: "PROFILE" },
        { type: "user", id: "PROFILE" },
        "mentor",
        "user",
      ],
    }),
  }),
});

export const {
  useGetMentorProfileQuery,
  useGetMentorStatisticsQuery,
  useGetAllMentorsQuery,
  useUpdateMentorProfileMutation,
  useUpdateMentorProfilePhotoMutation,
} = mentorApi;
