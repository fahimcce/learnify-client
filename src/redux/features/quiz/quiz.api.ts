import { api } from "@/redux/api/api";

// ==================== Type Definitions ====================

export interface Course {
  _id: string;
  courseName: string;
  courseCode: string;
}

export interface QuizSet {
  _id: string;
  course: string | Course;
  title: string;
  duration: number;
  totalMarks: number;
  isDeleted?: boolean;
  questionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id: string;
  quizSet: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  rightAnswer: "A" | "B" | "C" | "D";
  mark: number;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionWithoutAnswer {
  _id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  mark: number;
}

export interface ExamAttempt {
  _id: string;
  user: string | { _id: string; name: string; email: string; phone?: string };
  quizSet: string | QuizSet;
  answers: ExamAnswer[];
  score: number;
  totalMarks: number;
  percentage: number;
  startedAt: string;
  submittedAt?: string;
  duration: number;
  status: "in-progress" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface ExamAnswer {
  questionId: string;
  selectedAnswer: "A" | "B" | "C" | "D" | null;
  isCorrect: boolean;
  markObtained: number;
}

export interface DetailedExamAnswer extends ExamAnswer {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  rightAnswer: "A" | "B" | "C" | "D";
  mark: number;
}

export interface ExamResult extends ExamAttempt {
  answers: DetailedExamAnswer[];
}

export interface ExamReport {
  _id: string;
  quizSet: string | QuizSet;
  summary: {
    score: number;
    totalMarks: number;
    percentage: number;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    unanswered: number;
  };
  startedAt: string;
  submittedAt: string;
  duration: number;
  answers: DetailedExamAnswer[];
  createdAt: string;
  updatedAt: string;
}

export interface StartExamResponse {
  attemptId: string;
  quizSet: QuizSet;
  questions: QuestionWithoutAnswer[];
  startedAt: string;
  status: "in-progress";
}

// ==================== Payload Types ====================

export interface CreateQuizSetPayload {
  course: string;
  title: string;
  duration: number;
  totalMarks: number;
}

export interface UpdateQuizSetPayload {
  course?: string;
  title?: string;
  duration?: number;
  totalMarks?: number;
}

export interface CreateQuestionPayload {
  quizSet: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  rightAnswer: "A" | "B" | "C" | "D";
  mark: number;
}

export interface BulkQuestionItem {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  rightAnswer: "A" | "B" | "C" | "D";
  mark: number;
}

export interface CreateBulkQuestionsPayload {
  quizSet: string;
  questions: BulkQuestionItem[];
}

export interface UpdateQuestionPayload {
  quizSet?: string;
  question?: string;
  options?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  rightAnswer?: "A" | "B" | "C" | "D";
  mark?: number;
}

export interface SubmitExamPayload {
  quizSetId: string;
  answers: Array<{
    questionId: string;
    selectedAnswer: "A" | "B" | "C" | "D" | null;
  }>;
}

export interface GetQuizSetsParams {
  course?: string;
}

export interface GetExamHistoryParams {
  course?: string;
}

// ==================== API Endpoints ====================

const quizApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== Admin: Quiz Set Endpoints ====================

    // Get all quiz sets (admin only)
    getAllQuizSets: builder.query<QuizSet[], GetQuizSetsParams | void>({
      query: (params) => ({
        url: "/quiz/set",
        method: "GET",
        params: params || undefined,
      }),
      transformResponse: (response: { data: QuizSet[] }) => response.data,
      providesTags: ["quiz"],
    }),

    // Get quiz set by ID (admin only)
    getQuizSetById: builder.query<QuizSet, string>({
      query: (id) => ({
        url: `/quiz/set/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { data: QuizSet }) => response.data,
      providesTags: (_result, _error, id) => [{ type: "quiz", id }],
    }),

    // Create quiz set (admin only)
    createQuizSet: builder.mutation<QuizSet, CreateQuizSetPayload>({
      query: (data) => ({
        url: "/quiz/set",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: { data: QuizSet }) => response.data,
      invalidatesTags: ["quiz"],
    }),

    // Update quiz set (admin only)
    updateQuizSet: builder.mutation<
      QuizSet,
      { id: string; data: UpdateQuizSetPayload }
    >({
      query: ({ id, data }) => ({
        url: `/quiz/set/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: { data: QuizSet }) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "quiz", id },
        "quiz",
      ],
    }),

    // Delete quiz set (admin only - soft delete)
    deleteQuizSet: builder.mutation<QuizSet, string>({
      query: (id) => ({
        url: `/quiz/set/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { data: QuizSet }) => response.data,
      invalidatesTags: (_result, _error, id) => [{ type: "quiz", id }, "quiz"],
    }),

    // Hard delete quiz set (admin only)
    hardDeleteQuizSet: builder.mutation<void, string>({
      query: (id) => ({
        url: `/quiz/set/${id}/hard-delete`,
        method: "DELETE",
      }),
      invalidatesTags: ["quiz"],
    }),

    // ==================== Admin: Question Endpoints ====================

    // Get all questions for a quiz set (admin only)
    getAllQuestions: builder.query<Question[], string>({
      query: (quizSetId) => ({
        url: `/quiz/question/quiz-set/${quizSetId}`,
        method: "GET",
      }),
      transformResponse: (response: { data: Question[] }) => response.data,
      providesTags: (_result, _error, quizSetId) => [
        { type: "quiz", id: `questions-${quizSetId}` },
        "quiz",
      ],
    }),

    // Get question by ID (admin only)
    getQuestionById: builder.query<Question, string>({
      query: (id) => ({
        url: `/quiz/question/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { data: Question }) => response.data,
      providesTags: (_result, _error, id) => [{ type: "quiz", id }],
    }),

    // Create question (admin only)
    createQuestion: builder.mutation<Question, CreateQuestionPayload>({
      query: (data) => ({
        url: "/quiz/question",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: { data: Question }) => response.data,
      invalidatesTags: (_result, _error, data) => [
        { type: "quiz", id: `questions-${data.quizSet}` },
        "quiz",
      ],
    }),

    // Create bulk questions (admin only)
    createBulkQuestions: builder.mutation<
      Question[],
      CreateBulkQuestionsPayload
    >({
      query: (data) => ({
        url: "/quiz/question/bulk",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: { data: Question[] }) => response.data,
      invalidatesTags: (_result, _error, data) => [
        { type: "quiz", id: `questions-${data.quizSet}` },
        "quiz",
      ],
    }),

    // Update question (admin only)
    updateQuestion: builder.mutation<
      Question,
      { id: string; data: UpdateQuestionPayload }
    >({
      query: ({ id, data }) => ({
        url: `/quiz/question/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: { data: Question }) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "quiz", id },
        "quiz",
      ],
    }),

    // Delete question (admin only - soft delete)
    deleteQuestion: builder.mutation<Question, string>({
      query: (id) => ({
        url: `/quiz/question/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { data: Question }) => response.data,
      invalidatesTags: (_result, _error, id) => [{ type: "quiz", id }, "quiz"],
    }),

    // Hard delete question (admin only)
    hardDeleteQuestion: builder.mutation<void, string>({
      query: (id) => ({
        url: `/quiz/question/${id}/hard-delete`,
        method: "DELETE",
      }),
      invalidatesTags: ["quiz"],
    }),

    // ==================== Learner: Exam Endpoints ====================

    // Get available quiz sets (user only)
    getAvailableQuizSets: builder.query<QuizSet[], GetQuizSetsParams | void>({
      query: (params) => ({
        url: "/quiz/available",
        method: "GET",
        params: params || undefined,
      }),
      transformResponse: (response: { data: QuizSet[] }) => response.data,
      providesTags: ["quiz"],
    }),

    // Start exam (user only)
    startExam: builder.mutation<StartExamResponse, string>({
      query: (quizSetId) => ({
        url: `/quiz/exam/start/${quizSetId}`,
        method: "POST",
      }),
      transformResponse: (response: { data: StartExamResponse }) =>
        response.data,
      invalidatesTags: ["quiz"],
    }),

    // Submit exam (user only)
    submitExam: builder.mutation<ExamAttempt, SubmitExamPayload>({
      query: (data) => ({
        url: "/quiz/exam/submit",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: { data: ExamAttempt }) => response.data,
      invalidatesTags: ["quiz"],
    }),

    // Get exam result (user only)
    getExamResult: builder.query<ExamResult, string>({
      query: (attemptId) => ({
        url: `/quiz/exam/result/${attemptId}`,
        method: "GET",
      }),
      transformResponse: (response: { data: ExamResult }) => response.data,
      providesTags: (_result, _error, attemptId) => [
        { type: "quiz", id: `exam-${attemptId}` },
      ],
    }),

    // Get exam history (user only)
    getExamHistory: builder.query<ExamAttempt[], GetExamHistoryParams | void>({
      query: (params) => ({
        url: "/quiz/exam/history",
        method: "GET",
        params: params || undefined,
      }),
      transformResponse: (response: { data: ExamAttempt[] }) => response.data,
      providesTags: ["quiz"],
    }),

    // Get exam report (user only)
    getExamReport: builder.query<ExamReport, string>({
      query: (attemptId) => ({
        url: `/quiz/exam/report/${attemptId}`,
        method: "GET",
      }),
      transformResponse: (response: { data: ExamReport }) => response.data,
      providesTags: (_result, _error, attemptId) => [
        { type: "quiz", id: `exam-${attemptId}` },
      ],
    }),

    // ==================== Admin: Exam Attempts ====================

    // Get all exam attempts for a quiz set (admin only)
    getAllExamAttemptsByQuizSet: builder.query<ExamAttempt[], string>({
      query: (quizSetId) => ({
        url: `/quiz/exam/attempts/quiz-set/${quizSetId}`,
        method: "GET",
      }),
      transformResponse: (response: { data: ExamAttempt[] }) => response.data,
      providesTags: (_result, _error, quizSetId) => [
        { type: "quiz", id: `attempts-${quizSetId}` },
        "quiz",
      ],
    }),
  }),
});

// ==================== Export Hooks ====================

// Admin: Quiz Set Hooks
export const {
  useGetAllQuizSetsQuery,
  useGetQuizSetByIdQuery,
  useCreateQuizSetMutation,
  useUpdateQuizSetMutation,
  useDeleteQuizSetMutation,
  useHardDeleteQuizSetMutation,
} = quizApi;

// Admin: Question Hooks
export const {
  useGetAllQuestionsQuery,
  useGetQuestionByIdQuery,
  useCreateQuestionMutation,
  useCreateBulkQuestionsMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useHardDeleteQuestionMutation,
} = quizApi;

// Learner: Exam Hooks
export const {
  useGetAvailableQuizSetsQuery,
  useStartExamMutation,
  useSubmitExamMutation,
  useGetExamResultQuery,
  useGetExamHistoryQuery,
  useGetExamReportQuery,
} = quizApi;

// Admin: Exam Attempts Hooks
export const { useGetAllExamAttemptsByQuizSetQuery } = quizApi;
