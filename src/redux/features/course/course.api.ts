import { api } from "@/redux/api/api";

export interface Course {
  _id: string;
  courseName: string;
  courseCode: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCoursePayload {
  courseName: string;
  courseCode: string;
}

export interface UpdateCoursePayload {
  courseName?: string;
  courseCode?: string;
}

const courseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all courses
    getAllCourses: builder.query<Course[], void>({
      query: () => ({
        url: "/course",
        method: "GET",
      }),
      transformResponse: (response: { data: Course[] }) => response.data,
      providesTags: ["course"],
    }),

    // Get course by ID
    getCourseById: builder.query<Course, string>({
      query: (id) => ({
        url: `/course/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { data: Course }) => response.data,
      providesTags: (_result, _error, id) => [{ type: "course", id }],
    }),

    // Create course (admin only)
    createCourse: builder.mutation<Course, CreateCoursePayload>({
      query: (data) => ({
        url: "/course",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: { data: Course }) => response.data,
      invalidatesTags: ["course"],
    }),

    // Update course (admin only)
    updateCourse: builder.mutation<
      Course,
      { id: string; data: UpdateCoursePayload }
    >({
      query: ({ id, data }) => ({
        url: `/course/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: { data: Course }) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "course", id },
        "course",
      ],
    }),

    // Activate/Deactivate course (admin only)
    toggleCourseStatus: builder.mutation<Course, string>({
      query: (id) => ({
        url: `/course/${id}/active-status`,
        method: "PATCH",
      }),
      transformResponse: (response: { data: Course }) => response.data,
      invalidatesTags: (_result, _error, id) => [
        { type: "course", id },
        "course",
      ],
    }),

    // Hard delete course (admin only)
    deleteCourse: builder.mutation<void, string>({
      query: (id) => ({
        url: `/course/${id}/hard-delete`,
        method: "DELETE",
      }),
      invalidatesTags: ["course"],
    }),
  }),
});

export const {
  useGetAllCoursesQuery,
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useToggleCourseStatusMutation,
  useDeleteCourseMutation,
} = courseApi;
