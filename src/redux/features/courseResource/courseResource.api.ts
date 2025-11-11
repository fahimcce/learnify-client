import { api } from "@/redux/api/api";

export interface CourseResource {
  _id: string;
  courseId: {
    _id: string;
    courseName: string;
    courseCode: string;
    level: string;
  };
  title: string;
  description?: string;
  resourceType: "document" | "video" | "image" | "link" | "other";
  fileUrl?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  externalLink?: string;
  uploadedBy: {
    _id: string;
    name: string;
    email: string;
  };
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourcePayload {
  title: string;
  description?: string;
  resourceType: "document" | "video" | "image" | "link" | "other";
  externalLink?: string;
}

export interface UpdateResourcePayload {
  title?: string;
  description?: string;
  resourceType?: "document" | "video" | "image" | "link" | "other";
  externalLink?: string;
}

const courseResourceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get resources for a course
    getCourseResources: builder.query<
      CourseResource[],
      { courseId: string; resourceType?: string }
    >({
      query: ({ courseId, resourceType }) => ({
        url: `/course-resource/course/${courseId}`,
        method: "GET",
        params: resourceType ? { resourceType } : undefined,
      }),
      transformResponse: (response: { data: CourseResource[] }) =>
        response.data,
      providesTags: ["courseResource"],
    }),

    // Get resource by ID
    getResourceById: builder.query<CourseResource, string>({
      query: (id) => ({
        url: `/course-resource/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { data: CourseResource }) => response.data,
      providesTags: (_result, _error, id) => [{ type: "courseResource", id }],
    }),

    // Admin: Get all resources
    getAllResources: builder.query<
      CourseResource[],
      { courseId?: string; resourceType?: string }
    >({
      query: (params) => ({
        url: "/course-resource",
        method: "GET",
        params,
      }),
      transformResponse: (response: { data: CourseResource[] }) =>
        response.data,
      providesTags: ["courseResource"],
    }),

    // Admin: Upload single resource file
    uploadResourceFile: builder.mutation<
      CourseResource,
      { courseId: string; formData: FormData }
    >({
      query: ({ courseId, formData }) => ({
        url: `/course-resource/course/${courseId}/upload`,
        method: "POST",
        body: formData,
        // RTK Query automatically handles FormData and sets correct headers
      }),
      transformResponse: (response: { data: CourseResource }) => response.data,
      invalidatesTags: ["courseResource"],
    }),

    // Admin: Upload multiple resource files
    uploadMultipleResourceFiles: builder.mutation<
      CourseResource[],
      { courseId: string; formData: FormData }
    >({
      query: ({ courseId, formData }) => ({
        url: `/course-resource/course/${courseId}/upload-multiple`,
        method: "POST",
        body: formData,
        // RTK Query automatically handles FormData and sets correct headers
      }),
      transformResponse: (response: { data: CourseResource[] }) =>
        response.data,
      invalidatesTags: ["courseResource"],
    }),

    // Admin: Add resource (link or without file)
    addResource: builder.mutation<
      CourseResource,
      { courseId: string; data: CreateResourcePayload }
    >({
      query: ({ courseId, data }) => ({
        url: `/course-resource/course/${courseId}/add`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: { data: CourseResource }) => response.data,
      invalidatesTags: ["courseResource"],
    }),

    // Admin: Update resource
    updateResource: builder.mutation<
      CourseResource,
      { id: string; data: UpdateResourcePayload }
    >({
      query: ({ id, data }) => ({
        url: `/course-resource/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: { data: CourseResource }) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "courseResource", id },
        "courseResource",
      ],
    }),

    // Admin: Delete resource (soft delete)
    deleteResource: builder.mutation<CourseResource, string>({
      query: (id) => ({
        url: `/course-resource/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { data: CourseResource }) => response.data,
      invalidatesTags: ["courseResource"],
    }),

    // Admin: Hard delete resource
    hardDeleteResource: builder.mutation<void, string>({
      query: (id) => ({
        url: `/course-resource/${id}/hard-delete`,
        method: "DELETE",
      }),
      invalidatesTags: ["courseResource"],
    }),
  }),
});

export const {
  useGetCourseResourcesQuery,
  useGetResourceByIdQuery,
  useGetAllResourcesQuery,
  useUploadResourceFileMutation,
  useUploadMultipleResourceFilesMutation,
  useAddResourceMutation,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
  useHardDeleteResourceMutation,
} = courseResourceApi;
