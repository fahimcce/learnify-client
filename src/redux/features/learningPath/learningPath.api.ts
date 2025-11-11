import { api } from "@/redux/api/api";

export interface LearningPathStep {
  stepNumber: number;
  title: string;
  description: string;
  resources: string[];
  estimatedTime: string;
  learningObjectives: string[];
}

export interface LearningPath {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  courseId: {
    _id: string;
    courseName: string;
    courseCode: string;
    level: string;
  };
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  prerequisites: string[];
  outcomes: string[];
  steps: LearningPathStep[];
  recommendedResources: string[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateLearningPathPayload {
  courseCode: string;
}

export interface RegenerateLearningPathPayload {
  courseCode: string;
  previousPathId?: string;
}

const learningPathApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // User: Get my learning paths
    getMyLearningPaths: builder.query<LearningPath[], void>({
      query: () => ({
        url: "/learning-path/my-paths",
        method: "GET",
      }),
      transformResponse: (response: { data: LearningPath[] }) => response.data,
      providesTags: ["learningPath"],
    }),

    // User: Get my learning path by ID
    getMyLearningPathById: builder.query<LearningPath, string>({
      query: (id) => ({
        url: `/learning-path/my-paths/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { data: LearningPath }) => response.data,
      providesTags: (_result, _error, id) => [{ type: "learningPath", id }],
    }),

    // User: Generate learning path
    generateLearningPath: builder.mutation<
      LearningPath,
      GenerateLearningPathPayload
    >({
      query: (data) => ({
        url: "/learning-path/generate",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: { data: LearningPath }) => response.data,
      invalidatesTags: ["learningPath"],
    }),

    // User: Regenerate learning path
    regenerateLearningPath: builder.mutation<
      LearningPath,
      RegenerateLearningPathPayload
    >({
      query: (data) => ({
        url: "/learning-path/regenerate",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: { data: LearningPath }) => response.data,
      invalidatesTags: ["learningPath"],
    }),

    // User: Delete my learning path
    deleteMyLearningPath: builder.mutation<void, string>({
      query: (id) => ({
        url: `/learning-path/my-paths/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["learningPath"],
    }),

    // Admin: Get all learning paths
    getAllLearningPaths: builder.query<
      LearningPath[],
      { userId?: string; courseCode?: string }
    >({
      query: (params) => ({
        url: "/learning-path",
        method: "GET",
        params,
      }),
      transformResponse: (response: { data: LearningPath[] }) => response.data,
      providesTags: ["learningPath"],
    }),

    // Admin: Get learning path by ID
    getLearningPathById: builder.query<LearningPath, string>({
      query: (id) => ({
        url: `/learning-path/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { data: LearningPath }) => response.data,
      providesTags: (_result, _error, id) => [{ type: "learningPath", id }],
    }),

    // Admin: Get learning paths by user
    getLearningPathsByUser: builder.query<LearningPath[], string>({
      query: (userId) => ({
        url: `/learning-path/user/${userId}`,
        method: "GET",
      }),
      transformResponse: (response: { data: LearningPath[] }) => response.data,
      providesTags: ["learningPath"],
    }),

    // Admin: Delete learning path
    deleteLearningPath: builder.mutation<void, string>({
      query: (id) => ({
        url: `/learning-path/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["learningPath"],
    }),

    // Admin: Hard delete learning path
    hardDeleteLearningPath: builder.mutation<void, string>({
      query: (id) => ({
        url: `/learning-path/${id}/hard-delete`,
        method: "DELETE",
      }),
      invalidatesTags: ["learningPath"],
    }),
  }),
});

export const {
  useGetMyLearningPathsQuery,
  useGetMyLearningPathByIdQuery,
  useGenerateLearningPathMutation,
  useRegenerateLearningPathMutation,
  useDeleteMyLearningPathMutation,
  useGetAllLearningPathsQuery,
  useGetLearningPathByIdQuery,
  useGetLearningPathsByUserQuery,
  useDeleteLearningPathMutation,
  useHardDeleteLearningPathMutation,
} = learningPathApi;
