import { api } from "@/redux/api/api";

// ==================== Type Definitions ====================

export interface ExtractedQuestion {
  question: string;
  type: "mcq" | "boolean" | "short_answer";
  options?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  rightAnswer?: "A" | "B" | "C" | "D";
  booleanAnswer?: boolean;
  expectedAnswer?: string;
  shortAnswerKeywords?: string[];
  mark: number;
}

export interface OCRResponse {
  success: boolean;
  message: string;
  data: ExtractedQuestion[];
}

// ==================== OCR API ====================

export const ocrApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Extract questions from images
    extractQuestions: builder.mutation<
      ExtractedQuestion[],
      { files: File[]; type: string }
    >({
      query: ({ files, type }) => {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("images", file);
        });
        formData.append("type", type);

        return {
          url: "/ocr/extract-questions",
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response: OCRResponse) => response.data,
    }),
  }),
});

// ==================== Export Hooks ====================

export const { useExtractQuestionsMutation } = ocrApi;
