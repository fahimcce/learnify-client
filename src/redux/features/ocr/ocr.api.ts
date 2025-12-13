import { api } from "@/redux/api/api";

// ==================== Type Definitions ====================

export interface ExtractedQuestion {
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

export interface OCRResponse {
  success: boolean;
  message: string;
  data: ExtractedQuestion[];
}

// ==================== OCR API ====================

export const ocrApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Extract questions from images
    extractQuestions: builder.mutation<ExtractedQuestion[], File[]>({
      query: (files) => {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("images", file);
        });

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
