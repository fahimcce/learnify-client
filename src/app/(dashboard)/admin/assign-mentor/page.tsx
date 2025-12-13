"use client";

import { useState } from "react";
import { useGetAllMentorsQuery } from "@/redux/features/mentor/mentor.api";
import {
  useGetAllCoursesQuery,
  useAssignCoursesToMentorMutation,
  useUnassignCoursesFromMentorMutation,
  Course,
} from "@/redux/features/course/course.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GraduationCap,
  BookOpen,
  Search,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import UnassignCourseDialog from "./_components/UnassignCourseDialog";
import MentorRegistrationDialog from "./_components/MentorRegistrationDialog";
import { UserPlus } from "lucide-react";

export default function AssignMentorPage() {
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [unassignCourseId, setUnassignCourseId] = useState<string | null>(null);
  const [isRegistrationDialogOpen, setIsRegistrationDialogOpen] =
    useState(false);

  const {
    data: mentors,
    isLoading: isLoadingMentors,
    refetch: refetchMentors,
  } = useGetAllMentorsQuery();
  const {
    data: courses,
    isLoading: isLoadingCourses,
    refetch: refetchCourses,
  } = useGetAllCoursesQuery();
  const [assignCourses, { isLoading: isAssigning }] =
    useAssignCoursesToMentorMutation();
  const [unassignCourses, { isLoading: isUnassigning }] =
    useUnassignCoursesFromMentorMutation();

  const mentorsArray = Array.isArray(mentors) ? mentors : [];
  const coursesArray = Array.isArray(courses) ? courses : [];

  const filteredMentors = mentorsArray.filter((mentor) => {
    if (!mentor.isDeleted && !mentor.isBlocked) {
      const query = searchTerm.toLowerCase();
      return (
        mentor.name.toLowerCase().includes(query) ||
        mentor.email.toLowerCase().includes(query)
      );
    }
    return false;
  });

  const activeCourses = coursesArray.filter((course) => !course.isDeleted);

  // Get already assigned courses for selected mentor
  const alreadyAssignedCourses = selectedMentorId
    ? activeCourses.filter((course) => {
        const mentorId =
          typeof course.mentorId === "string"
            ? course.mentorId
            : course.mentorId?._id || course.mentorId;
        return mentorId === selectedMentorId;
      })
    : [];

  const handleMentorSelect = (mentorId: string) => {
    setSelectedMentorId(mentorId);
    setSelectedCourseIds([]);
  };

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleAssign = async () => {
    if (!selectedMentorId || selectedCourseIds.length === 0) {
      toast.error("Please select a mentor and at least one course");
      return;
    }

    const toastId = toast.loading("Assigning courses...");
    try {
      await assignCourses({
        mentorId: selectedMentorId,
        courseIds: selectedCourseIds,
      }).unwrap();
      toast.success("Courses assigned successfully!", { id: toastId });
      setSelectedCourseIds([]);
      refetchCourses();
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to assign courses. Please try again.",
        { id: toastId }
      );
    }
  };

  const handleUnassign = async () => {
    if (!selectedMentorId || !unassignCourseId) {
      toast.error("Please select a course to unassign");
      return;
    }

    const toastId = toast.loading("Unassigning course...");
    try {
      await unassignCourses({
        mentorId: selectedMentorId,
        courseIds: [unassignCourseId],
      }).unwrap();
      toast.success("Course unassigned successfully!", { id: toastId });
      setUnassignCourseId(null);
      refetchCourses();
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to unassign course. Please try again.",
        { id: toastId }
      );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getProfilePhotoUrl = (profilePhoto?: string) => {
    if (!profilePhoto) return null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const photoPath = profilePhoto.startsWith("/")
      ? profilePhoto
      : `/${profilePhoto}`;
    return `${apiUrl}${photoPath}`;
  };

  const selectedMentor = mentorsArray.find((m) => m._id === selectedMentorId);

  if (isLoadingMentors || isLoadingCourses) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assign Mentor to Courses</h1>
        <p className="text-muted-foreground mt-2">
          Select a mentor and assign multiple courses to them
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Mentors List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Select Mentor</CardTitle>
                <CardDescription>
                  Choose a mentor to assign courses
                </CardDescription>
              </div>
              <Button
                onClick={() => setIsRegistrationDialogOpen(true)}
                size="sm"
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Mentor Registration
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mentors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredMentors.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No mentors found
                </p>
              ) : (
                filteredMentors.map((mentor) => (
                  <div
                    key={mentor._id}
                    onClick={() => handleMentorSelect(mentor._id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedMentorId === mentor._id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {mentor.profilePhoto ? (
                          <AvatarImage
                            src={
                              getProfilePhotoUrl(mentor.profilePhoto) ||
                              undefined
                            }
                            alt={mentor.name}
                          />
                        ) : null}
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(mentor.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{mentor.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {mentor.email}
                        </p>
                      </div>
                      {selectedMentorId === mentor._id && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Courses Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Courses</CardTitle>
            <CardDescription>
              Choose courses to assign to the selected mentor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedMentorId ? (
              <div className="text-center py-12 text-muted-foreground">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Please select a mentor first</p>
              </div>
            ) : (
              <>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Selected Mentor:</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedMentor?.name}
                  </p>
                </div>

                {/* Already Assigned Courses */}
                {alreadyAssignedCourses.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Already Assigned ({alreadyAssignedCourses.length})
                    </p>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {alreadyAssignedCourses.map((course) => {
                        const mentorId =
                          typeof course.mentorId === "string"
                            ? course.mentorId
                            : course.mentorId?._id || course.mentorId;
                        const isAssigned = mentorId === selectedMentorId;
                        return (
                          <div
                            key={course._id}
                            className="flex items-center gap-3 p-3 rounded-lg border border-green-500/50 bg-green-50 dark:bg-green-950/20"
                          >
                            <div className="h-5 w-5 rounded border-2 border-green-500 bg-green-500 flex items-center justify-center">
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">
                                    {course.courseName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {course.courseCode}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setUnassignCourseId(course._id);
                              }}
                              disabled={isUnassigning}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available Courses to Assign */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Available Courses
                  </p>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {activeCourses.filter((course) => {
                      const mentorId =
                        typeof course.mentorId === "string"
                          ? course.mentorId
                          : course.mentorId?._id || course.mentorId;
                      return mentorId !== selectedMentorId;
                    }).length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No available courses to assign
                      </p>
                    ) : (
                      activeCourses
                        .filter((course) => {
                          const mentorId =
                            typeof course.mentorId === "string"
                              ? course.mentorId
                              : course.mentorId?._id || course.mentorId;
                          return mentorId !== selectedMentorId;
                        })
                        .map((course) => {
                          const isSelected = selectedCourseIds.includes(
                            course._id
                          );
                          return (
                            <div
                              key={course._id}
                              onClick={() => handleCourseToggle(course._id)}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:bg-accent"
                              }`}
                            >
                              <div
                                className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                                  isSelected
                                    ? "border-primary bg-primary"
                                    : "border-muted-foreground"
                                }`}
                              >
                                {isSelected && (
                                  <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">
                                      {course.courseName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {course.courseCode}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleAssign}
                  disabled={selectedCourseIds.length === 0 || isAssigning}
                  className="w-full"
                >
                  {isAssigning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Assign {selectedCourseIds.length} Course
                      {selectedCourseIds.length !== 1 ? "s" : ""}
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <UnassignCourseDialog
        open={!!unassignCourseId}
        onOpenChange={(open) => !open && setUnassignCourseId(null)}
        mentorName={selectedMentor?.name}
        onConfirm={handleUnassign}
        isLoading={isUnassigning}
      />

      <MentorRegistrationDialog
        open={isRegistrationDialogOpen}
        onOpenChange={setIsRegistrationDialogOpen}
        onSuccess={() => {
          refetchMentors();
        }}
      />
    </div>
  );
}
