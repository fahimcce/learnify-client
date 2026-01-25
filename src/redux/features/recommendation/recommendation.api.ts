import { api } from "@/redux/api/api";

export interface Recommendation {
  _id: string;
  userId: string;
  recommendationText: string;
  recommendedActions: string[];
  priority: "high" | "medium" | "low";
  category: "study" | "practice" | "review" | "explore" | "project";
  relatedCourses: any[];
  generatedAt: string;
  expiresAt: string;
  isRead: boolean;
}

const recommendationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get my recommendations
    getMyRecommendations: builder.query<
      Recommendation[],
      { showHistory?: boolean } | void
    >({
      query: (params) => ({
        url: "/recommendation/my-recommendations",
        method: "GET",
        params: params || {},
      }),
      transformResponse: (response: { data: Recommendation[] }) =>
        response.data,
      providesTags: ["recommendation"],
    }),

    // Generate my recommendation
    generateMyRecommendation: builder.mutation<Recommendation, void>({
      query: () => ({
        url: "/recommendation/generate-my-recommendation",
        method: "POST",
      }),
      transformResponse: (response: { data: Recommendation }) => response.data,
      invalidatesTags: ["recommendation"],
    }),

    // Mark recommendation as read
    markAsRead: builder.mutation<
      Recommendation,
      { id: string; isRead: boolean }
    >({
      query: ({ id, isRead }) => ({
        url: `/recommendation/my-recommendations/${id}/read-status`,
        method: "PATCH",
        body: { isRead },
      }),
      transformResponse: (response: { data: Recommendation }) => response.data,
      invalidatesTags: ["recommendation"],
    }),
  }),
});

export const {
  useGetMyRecommendationsQuery,
  useGenerateMyRecommendationMutation,
  useMarkAsReadMutation,
} = recommendationApi;
