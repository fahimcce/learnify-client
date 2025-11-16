import { api } from "@/redux/api/api";

export interface Note {
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
  } | null;
  title: string;
  content?: string;
  noteType: "text" | "pdf" | "image";
  fileUrl?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTextNotePayload {
  title: string;
  content?: string;
  courseId?: string;
}

export interface CreateFileNotePayload {
  file: File;
  title?: string;
  courseId?: string;
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
}

export interface GetNotesFilters {
  courseId?: string | null;
  noteType?: "text" | "pdf" | "image";
}

const noteApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get my notes (all notes or filtered)
    getMyNotes: builder.query<Note[], GetNotesFilters | void>({
      query: (filters) => ({
        url: "/note",
        method: "GET",
        params: filters || undefined,
      }),
      transformResponse: (response: { data: Note[] }) => response.data,
      providesTags: ["note"],
    }),

    // Get my random notes
    getMyRandomNotes: builder.query<
      Note[],
      { noteType?: "text" | "pdf" | "image" } | void
    >({
      query: (params) => ({
        url: "/note/random",
        method: "GET",
        params: params || undefined,
      }),
      transformResponse: (response: { data: Note[] }) => response.data,
      providesTags: ["note"],
    }),

    // Get my course-specific notes
    getMyCourseNotes: builder.query<
      Note[],
      { courseId: string; noteType?: "text" | "pdf" | "image" }
    >({
      query: ({ courseId, noteType }) => ({
        url: `/note/course/${courseId}`,
        method: "GET",
        params: noteType ? { noteType } : undefined,
      }),
      transformResponse: (response: { data: Note[] }) => response.data,
      providesTags: (_result, _error, { courseId }) => [
        { type: "note", id: courseId },
        "note",
      ],
    }),

    // Get my note by ID
    getMyNoteById: builder.query<Note, string>({
      query: (id) => ({
        url: `/note/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { data: Note }) => response.data,
      providesTags: (_result, _error, id) => [{ type: "note", id }],
    }),

    // Create text note
    createTextNote: builder.mutation<Note, CreateTextNotePayload>({
      query: (data) => ({
        url: "/note/text",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: { data: Note }) => response.data,
      invalidatesTags: ["note"],
    }),

    // Create file note (PDF or image)
    createFileNote: builder.mutation<Note, CreateFileNotePayload>({
      query: ({ file, title, courseId }) => {
        const formData = new FormData();
        formData.append("file", file);
        if (title) formData.append("title", title);
        if (courseId) formData.append("courseId", courseId);

        return {
          url: "/note/file",
          method: "POST",
          body: formData,
          // RTK Query automatically handles FormData
        };
      },
      transformResponse: (response: { data: Note }) => response.data,
      invalidatesTags: ["note"],
    }),

    // Update my note
    updateMyNote: builder.mutation<
      Note,
      { id: string; data: UpdateNotePayload }
    >({
      query: ({ id, data }) => ({
        url: `/note/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: { data: Note }) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "note", id },
        "note",
      ],
    }),

    // Delete my note (soft delete)
    deleteMyNote: builder.mutation<Note, string>({
      query: (id) => ({
        url: `/note/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { data: Note }) => response.data,
      invalidatesTags: (_result, _error, id) => [{ type: "note", id }, "note"],
    }),

    // Hard delete my note
    hardDeleteMyNote: builder.mutation<void, string>({
      query: (id) => ({
        url: `/note/${id}/hard-delete`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "note", id }, "note"],
    }),
  }),
});

export const {
  useGetMyNotesQuery,
  useGetMyRandomNotesQuery,
  useGetMyCourseNotesQuery,
  useGetMyNoteByIdQuery,
  useCreateTextNoteMutation,
  useCreateFileNoteMutation,
  useUpdateMyNoteMutation,
  useDeleteMyNoteMutation,
  useHardDeleteMyNoteMutation,
} = noteApi;
