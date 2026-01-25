"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetAttemptForGradingQuery,
  useGradeShortAnswerMutation,
  GradingAnswer,
} from "@/redux/features/quiz/quiz.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MessageSquare,
  HelpCircle,
  CheckSquare,
  User,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function GradingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const {
    data: attempt,
    isLoading,
    refetch,
  } = useGetAttemptForGradingQuery(attemptId);
  const [gradeShortAnswer, { isLoading: isGrading }] =
    useGradeShortAnswerMutation();

  const [selectedAnswer, setSelectedAnswer] = useState<GradingAnswer | null>(
    null
  );
  const [gradeData, setGradeData] = useState({
    markObtained: 0,
    isCorrect: false,
    feedback: "",
  });

  const handleOpenGradeDialog = (answer: GradingAnswer) => {
    setSelectedAnswer(answer);
    setGradeData({
      markObtained: answer.markObtained || 0,
      isCorrect: answer.isCorrect || false,
      feedback: answer.feedback || "",
    });
  };

  const handleGrade = async () => {
    if (!selectedAnswer) return;

    try {
      await gradeShortAnswer({
        attemptId,
        questionId: selectedAnswer.questionId,
        data: gradeData,
      }).unwrap();
      toast.success("Answer graded successfully!");
      setSelectedAnswer(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to grade answer");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="border-destructive max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive">Attempt not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const shortAnswerQuestions = attempt.answers.filter(
    (a) => a.type === "short_answer"
  );
  const gradedCount = shortAnswerQuestions.filter((a) => a.isGraded).length;
  const totalShortAnswers = shortAnswerQuestions.length;

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "mcq":
        return <HelpCircle className="h-4 w-4" />;
      case "boolean":
        return <CheckSquare className="h-4 w-4" />;
      case "short_answer":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (answer: GradingAnswer) => {
    if (answer.type !== "short_answer") {
      return answer.isCorrect ? (
        <Badge className="bg-green-500">Correct</Badge>
      ) : (
        <Badge variant="destructive">Incorrect</Badge>
      );
    }

    if (!answer.isGraded) {
      return (
        <Badge variant="outline" className="text-orange-600 border-orange-500">
          Not Graded
        </Badge>
      );
    }

    return answer.isCorrect ? (
      <Badge className="bg-green-500">Correct</Badge>
    ) : answer.markObtained > 0 ? (
      <Badge className="bg-yellow-500">Partial</Badge>
    ) : (
      <Badge variant="destructive">Incorrect</Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Grade Submission</h1>
          <p className="text-muted-foreground">
            {typeof attempt.quizSet === "object"
              ? attempt.quizSet.title
              : "Quiz"}
          </p>
        </div>
        <Badge
          variant={attempt.status === "completed" ? "default" : "secondary"}
          className="text-sm"
        >
          {attempt.status === "grading-pending"
            ? "Grading Pending"
            : attempt.status}
        </Badge>
      </div>

      {/* Student Info & Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {attempt.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{attempt.user.name}</h3>
                <p className="text-muted-foreground">{attempt.user.email}</p>
                <p className="text-sm text-muted-foreground">
                  Submitted: {format(new Date(attempt.submittedAt), "PPP p")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <CardContent className="py-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{attempt.score}</p>
                <p className="text-xs text-muted-foreground">Current Score</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{attempt.totalMarks}</p>
                <p className="text-xs text-muted-foreground">Total Marks</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {gradedCount}/{totalShortAnswers}
                </p>
                <p className="text-xs text-muted-foreground">
                  Short Answers Graded
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Answers List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Answers</h2>
        {attempt.answers.map((answer, index) => (
          <Card
            key={answer.questionId}
            className={
              answer.type === "short_answer" && !answer.isGraded
                ? "border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20"
                : ""
            }
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Q{index + 1}</Badge>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {getQuestionTypeIcon(answer.type)}
                    {answer.type === "mcq"
                      ? "MCQ"
                      : answer.type === "boolean"
                      ? "True/False"
                      : "Short Answer"}
                  </Badge>
                  <Badge>{answer.mark} marks</Badge>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(answer)}
                  <span className="font-semibold">
                    {answer.markObtained}/{answer.mark}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium">{answer.question}</p>

              {/* MCQ Answer */}
              {answer.type === "mcq" && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Selected: </span>
                  <span
                    className={
                      answer.isCorrect
                        ? "text-green-600 font-semibold"
                        : "text-red-600"
                    }
                  >
                    {answer.selectedAnswer || "No answer"}
                  </span>
                </div>
              )}

              {/* Boolean Answer */}
              {answer.type === "boolean" && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Selected: </span>
                  <span
                    className={
                      answer.isCorrect
                        ? "text-green-600 font-semibold"
                        : "text-red-600"
                    }
                  >
                    {answer.booleanAnswer === true
                      ? "True"
                      : answer.booleanAnswer === false
                      ? "False"
                      : "No answer"}
                  </span>
                </div>
              )}

              {/* Short Answer */}
              {answer.type === "short_answer" && (
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Student's Answer:
                    </p>
                    <p className="text-sm">
                      {answer.shortAnswer || (
                        <em className="text-muted-foreground">
                          No answer provided
                        </em>
                      )}
                    </p>
                  </div>

                  {answer.expectedAnswer && (
                    <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
                      <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                        Expected Answer:
                      </p>
                      <p className="text-sm text-green-800 dark:text-green-300">
                        {answer.expectedAnswer}
                      </p>
                    </div>
                  )}

                  {answer.shortAnswerKeywords &&
                    answer.shortAnswerKeywords.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          Keywords:
                        </span>
                        {answer.shortAnswerKeywords.map((keyword, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}

                  {answer.feedback && (
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-900">
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
                        Feedback:
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        {answer.feedback}
                      </p>
                    </div>
                  )}

                  <Button
                    variant={answer.isGraded ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleOpenGradeDialog(answer)}
                  >
                    <Award className="h-4 w-4 mr-2" />
                    {answer.isGraded ? "Edit Grade" : "Grade This Answer"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grade Dialog */}
      <Dialog
        open={!!selectedAnswer}
        onOpenChange={(open) => !open && setSelectedAnswer(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Short Answer</DialogTitle>
            <DialogDescription>
              Assign marks and provide feedback for this answer.
            </DialogDescription>
          </DialogHeader>

          {selectedAnswer && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Question:</p>
                <p className="text-sm">{selectedAnswer.question}</p>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Student's Answer:</p>
                <p className="text-sm">
                  {selectedAnswer.shortAnswer || <em>No answer</em>}
                </p>
              </div>

              {selectedAnswer.expectedAnswer && (
                <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                    Expected Answer:
                  </p>
                  <p className="text-sm">{selectedAnswer.expectedAnswer}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Marks Obtained (Max: {selectedAnswer.mark})</Label>
                  <Input
                    type="number"
                    min={0}
                    max={selectedAnswer.mark}
                    step={0.5}
                    value={gradeData.markObtained}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setGradeData({
                        ...gradeData,
                        markObtained: Math.min(val, selectedAnswer.mark),
                        isCorrect: val >= selectedAnswer.mark,
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Is Correct?</Label>
                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant={gradeData.isCorrect ? "default" : "outline"}
                      className={
                        gradeData.isCorrect
                          ? "bg-green-600 hover:bg-green-700"
                          : ""
                      }
                      onClick={() =>
                        setGradeData({ ...gradeData, isCorrect: true })
                      }
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Yes
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={!gradeData.isCorrect ? "destructive" : "outline"}
                      onClick={() =>
                        setGradeData({ ...gradeData, isCorrect: false })
                      }
                    >
                      <XCircle className="h-4 w-4 mr-1" /> No
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Feedback (Optional)</Label>
                <Textarea
                  placeholder="Provide feedback to the student..."
                  value={gradeData.feedback}
                  onChange={(e) =>
                    setGradeData({ ...gradeData, feedback: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedAnswer(null)}
              disabled={isGrading}
            >
              Cancel
            </Button>
            <Button onClick={handleGrade} disabled={isGrading}>
              {isGrading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Grade"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
