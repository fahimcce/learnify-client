import { api } from "@/redux/api/api";

export interface Enrollment {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  courseId: {
    _id: string;
    courseName: string;
    courseCode: string;
    level: string;
  };
  status: "enrolled" | "in-progress" | "completed" | "cancelled";
  progress: number;
  userLevel?: number;
  enrollmentDate: string;
  completionDate?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnrollmentPayload {
  courseId: string;
  userLevel?: number;
}

export interface UpdateProgressPayload {
  progress: number;
}

export interface UpdateUserLevelPayload {
  userLevel: number;
}

export interface UpdateEnrollmentStatusPayload {
  status: "enrolled" | "in-progress" | "completed" | "cancelled";
  progress?: number;
}

export interface EnrollmentStatistics {
  totalEnrollments: number;
  enrollmentsByStatus: Array<{
    _id: string;
    count: number;
  }>;
  enrollmentsByCourse: Array<{
    courseId: string;
    courseName: string;
    courseCode: string;
    enrollmentCount: number;
  }>;
}

const enrollmentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // User: Get my enrollments
    getMyEnrollments: builder.query<Enrollment[], void>({
      query: () => ({
        url: "/enrollment/my-enrollments",
        method: "GET",
      }),
      transformResponse: (response: { data: Enrollment[] }) => response.data,
      providesTags: ["enrollment"],
    }),

    // User: Get my enrollment by ID
    getMyEnrollmentById: builder.query<Enrollment, string>({
      query: (id) => ({
        url: `/enrollment/my-enrollments/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { data: Enrollment }) => response.data,
      providesTags: (_result, _error, id) => [{ type: "enrollment", id }],
    }),

    // User: Enroll in course
    enrollInCourse: builder.mutation<Enrollment, CreateEnrollmentPayload>({
      query: (data) => ({
        url: "/enrollment",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: { data: Enrollment }) => response.data,
      invalidatesTags: ["enrollment", "course"],
    }),

    // User: Update progress
    updateProgress: builder.mutation<
      Enrollment,
      { id: string; data: UpdateProgressPayload }
    >({
      query: ({ id, data }) => ({
        url: `/enrollment/my-enrollments/${id}/progress`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: { data: Enrollment }) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "enrollment", id },
        "enrollment",
      ],
    }),

    // User: Update user level
    updateUserLevel: builder.mutation<
      Enrollment,
      { id: string; data: UpdateUserLevelPayload }
    >({
      query: ({ id, data }) => ({
        url: `/enrollment/my-enrollments/${id}/user-level`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: { data: Enrollment }) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "enrollment", id },
        "enrollment",
      ],
    }),

    // User: Unenroll from course
    unenrollFromCourse: builder.mutation<Enrollment, string>({
      query: (id) => ({
        url: `/enrollment/my-enrollments/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { data: Enrollment }) => response.data,
      invalidatesTags: ["enrollment", "course"],
    }),

    // Admin: Get all enrollments
    getAllEnrollments: builder.query<
      Enrollment[],
      { status?: string; courseId?: string; userId?: string }
    >({
      query: (params) => ({
        url: "/enrollment",
        method: "GET",
        params,
      }),
      transformResponse: (response: { data: Enrollment[] }) => response.data,
      providesTags: ["enrollment"],
    }),

    // Admin: Get enrollment by ID
    getEnrollmentById: builder.query<Enrollment, string>({
      query: (id) => ({
        url: `/enrollment/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { data: Enrollment }) => response.data,
      providesTags: (_result, _error, id) => [{ type: "enrollment", id }],
    }),

    // Admin: Get enrollments by course
    getEnrollmentsByCourse: builder.query<Enrollment[], string>({
      query: (courseId) => ({
        url: `/enrollment/course/${courseId}`,
        method: "GET",
      }),
      transformResponse: (response: { data: Enrollment[] }) => response.data,
      providesTags: ["enrollment"],
    }),

    // Admin: Get enrollments by user
    getEnrollmentsByUser: builder.query<Enrollment[], string>({
      query: (userId) => ({
        url: `/enrollment/user/${userId}`,
        method: "GET",
      }),
      transformResponse: (response: { data: Enrollment[] }) => response.data,
      providesTags: ["enrollment"],
    }),

    // Admin: Update enrollment status
    updateEnrollmentStatus: builder.mutation<
      Enrollment,
      { id: string; data: UpdateEnrollmentStatusPayload }
    >({
      query: ({ id, data }) => ({
        url: `/enrollment/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: { data: Enrollment }) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "enrollment", id },
        "enrollment",
      ],
    }),

    // Admin: Delete enrollment (soft delete)
    deleteEnrollment: builder.mutation<Enrollment, string>({
      query: (id) => ({
        url: `/enrollment/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { data: Enrollment }) => response.data,
      invalidatesTags: ["enrollment"],
    }),

    // Admin: Hard delete enrollment
    hardDeleteEnrollment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/enrollment/${id}/hard-delete`,
        method: "DELETE",
      }),
      invalidatesTags: ["enrollment"],
    }),

    // Admin: Get enrollment statistics
    getEnrollmentStatistics: builder.query<EnrollmentStatistics, void>({
      query: () => ({
        url: "/enrollment/statistics",
        method: "GET",
      }),
      transformResponse: (response: { data: EnrollmentStatistics }) =>
        response.data,
      providesTags: ["enrollment"],
    }),
  }),
});

export const {
  useGetMyEnrollmentsQuery,
  useGetMyEnrollmentByIdQuery,
  useEnrollInCourseMutation,
  useUpdateProgressMutation,
  useUpdateUserLevelMutation,
  useUnenrollFromCourseMutation,
  useGetAllEnrollmentsQuery,
  useGetEnrollmentByIdQuery,
  useGetEnrollmentsByCourseQuery,
  useGetEnrollmentsByUserQuery,
  useUpdateEnrollmentStatusMutation,
  useDeleteEnrollmentMutation,
  useHardDeleteEnrollmentMutation,
  useGetEnrollmentStatisticsQuery,
} = enrollmentApi;
