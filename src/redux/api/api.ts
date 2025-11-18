import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseUrl = process.env.NEXT_PUBLIC_API_URL;

const baseQuery = fetchBaseQuery({
  baseUrl: baseUrl,
  credentials: "include",
  prepareHeaders: (headers, { getState, extra, endpoint, type, forced }) => {
    const token = (getState() as { auth: { token?: string } }).auth.token;
    if (token) {
      headers.set("Authorization", `${token}`);
    }
    // RTK Query automatically handles FormData - it won't set Content-Type
    // when body is FormData, allowing browser to set it with boundary
    return headers;
  },
});

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQuery,
  tagTypes: [
    "auth",
    "user",
    "admin",
    "course",
    "enrollment",
    "courseResource",
    "learningPath",
    "note",
    "chat",
  ],
  endpoints: () => ({}),
});
