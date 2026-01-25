"use client";

import { useGetMyEnrollmentsQuery } from "@/redux/features/enrollment/enrollment.api";
import { useGetMyProfileQuery } from "@/redux/features/user/user.api";
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Loader2,
  Sparkles,
  ArrowRight,
  GraduationCap,
  FileText,
  ClipboardList,
  History,
  Lightbulb,
} from "lucide-react";
import {
  useGetMyRecommendationsQuery,
  useGenerateMyRecommendationMutation,
} from "@/redux/features/recommendation/recommendation.api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import {
  DashboardCard,
  DashboardStatCard,
  DashboardPageHeader,
} from "@/components/dashboard/DashboardComponents";
import { motion } from "framer-motion";

export default function UserDashboard() {
  const router = useRouter();
  const { data: userProfile } = useGetMyProfileQuery();
  const { data: enrollments, isLoading: isLoadingEnrollments } =
    useGetMyEnrollmentsQuery();
  const { data: recommendations, isLoading: isLoadingRecs } =
    useGetMyRecommendationsQuery({ showHistory: true });
  const [generateRec, { isLoading: isGenerating }] =
    useGenerateMyRecommendationMutation();

  const enrollmentsArray = Array.isArray(enrollments) ? enrollments : [];
  const activeEnrollments = enrollmentsArray.filter(
    (enrollment) => !enrollment.isDeleted,
  );

  // Calculate stats
  const enrolledCount = activeEnrollments.length;
  const completedCount = activeEnrollments.filter(
    (enrollment) => enrollment.status === "completed",
  ).length;
  const inProgressCount = activeEnrollments.filter(
    (enrollment) => enrollment.status === "in-progress",
  ).length;
  const averageProgress =
    activeEnrollments.length > 0
      ? Math.round(
          activeEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) /
            activeEnrollments.length,
        )
      : 0;

  const stats = [
    {
      title: "Enrolled Courses",
      value: enrolledCount.toString(),
      description: "Active courses",
      icon: BookOpen,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "In Progress",
      value: inProgressCount.toString(),
      description: "Courses started",
      icon: Clock,
      gradient: "from-orange-500 to-red-500",
    },
    {
      title: "Completed",
      value: completedCount.toString(),
      description: "Finished courses",
      icon: Award,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Average Progress",
      value: `${averageProgress}%`,
      description: "Overall completion",
      icon: TrendingUp,
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  // Get recent courses
  const recentCourses = activeEnrollments
    .filter((enrollment) => enrollment.courseId && enrollment.courseId._id)
    .sort((a, b) => {
      const dateA = new Date(b.updatedAt).getTime();
      const dateB = new Date(a.updatedAt).getTime();
      return dateA - dateB;
    })
    .slice(0, 6)
    .map((enrollment) => ({
      id: enrollment._id,
      courseId: enrollment.courseId!._id,
      title: enrollment.courseId!.courseName,
      courseCode: enrollment.courseId!.courseCode,
      progress: enrollment.progress || 0,
      lastAccessed: formatDistanceToNow(new Date(enrollment.updatedAt), {
        addSuffix: true,
      }),
      status: enrollment.status,
    }));

  const quickAccessItems = [
    {
      title: "Courses",
      href: "/user/courses",
      icon: BookOpen,
      gradient: "from-blue-600 to-indigo-600",
    },
    {
      title: "Enrolled",
      href: "/user/enrollments",
      icon: GraduationCap,
      gradient: "from-emerald-600 to-teal-600",
    },
    {
      title: "Learning Path",
      href: "/user/learning-path",
      icon: Sparkles,
      gradient: "from-purple-600 to-fuchsia-600",
    },
    {
      title: "Notes",
      href: "/user/notes",
      icon: FileText,
      gradient: "from-orange-600 to-amber-600",
    },
    {
      title: "Quizzes",
      href: "/user/quizzes",
      icon: ClipboardList,
      gradient: "from-red-600 to-rose-600",
    },
  ];

  const handleGenerateRecommendation = async () => {
    try {
      await generateRec().unwrap();
      toast.success("AI Recommendation generated successfully!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to generate recommendation");
    }
  };

  const latestRecommendation = recommendations?.[0];
  const recommendationHistory = recommendations?.slice(1) || [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <DashboardPageHeader
        title={`Welcome back, ${userProfile?.name || "Learner"}!`}
        description="Continue your learning journey and achieve your goals."
        action={
          <Link href="/user/courses">
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Explore Courses
            </Button>
          </Link>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <DashboardStatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              description={stat.description}
              gradient={stat.gradient}
            />
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Access Section (Left side, takes 2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-black text-foreground">
              Quick Access
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickAccessItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <Link href={item.href}>
                  <div className="group relative overflow-hidden p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer flex items-center gap-4">
                    {/* Background Glow */}
                    <div
                      className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${item.gradient} opacity-10 group-hover:opacity-20 rounded-full blur-2xl transition-opacity animate-pulse`}
                    ></div>

                    <div
                      className={`relative p-4 rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                    >
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div className="relative">
                      <h3 className="text-lg font-black group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium">
                        Manage your {item.title.toLowerCase()}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Recommendations Section (Right side, takes 1/3 width) */}
        <DashboardCard className="flex flex-col h-full bg-gradient-to-b from-background to-primary/5 min-h-[500px]">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-black text-foreground">
                AI Assistant
              </h3>
            </div>

            <Tabs defaultValue="latest" className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="latest">Latest</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="latest" className="flex-1 flex flex-col m-0">
                {isLoadingRecs || isLoadingEnrollments ? (
                  <div className="flex-1 flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : latestRecommendation ? (
                  <div className="flex-1 flex flex-col">
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="h-5 w-5 text-amber-500 mt-1 shrink-0" />
                          <p className="text-sm leading-relaxed text-foreground">
                            {latestRecommendation.recommendationText}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Recommended Actions
                        </h4>
                        <div className="space-y-2">
                          {latestRecommendation.recommendedActions.map(
                            (action, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 text-sm text-foreground"
                              >
                                <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                {action}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-6">
                      <Button
                        onClick={handleGenerateRecommendation}
                        disabled={isGenerating}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Get New Recommendation
                          </>
                        )}
                      </Button>
                      <p className="text-[10px] text-center text-muted-foreground mt-2">
                        Generated{" "}
                        {formatDistanceToNow(
                          new Date(latestRecommendation.generatedAt),
                          { addSuffix: true },
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                    <div className="p-4 bg-muted rounded-full mb-4">
                      <Sparkles className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h4 className="font-bold text-lg mb-2">
                      No Recommendations Yet
                    </h4>
                    <p className="text-sm text-muted-foreground mb-6">
                      {enrolledCount > 0
                        ? "You're enrolled! Click below to let AI analyze your courses and give you a study plan."
                        : "Enroll in courses to get personalized AI suggestions."}
                    </p>
                    <Button
                      onClick={handleGenerateRecommendation}
                      disabled={isGenerating || enrolledCount === 0}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : enrolledCount > 0 ? (
                        "Generate My First Plan"
                      ) : (
                        "Enroll to Unlock"
                      )}
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="flex-1 m-0">
                <div className="overflow-y-auto max-h-[350px] pr-2 space-y-3">
                  {recommendationHistory.length > 0 ? (
                    recommendationHistory.map((rec) => (
                      <div
                        key={rec._id}
                        className="p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
                      >
                        <p className="text-xs line-clamp-2 text-foreground mb-2">
                          {rec.recommendationText}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(rec.generatedAt).toLocaleDateString()}
                          </span>
                          <div className="flex gap-1">
                            <div
                              className={`h-1.5 w-1.5 rounded-full ${
                                rec.priority === "high"
                                  ? "bg-red-500"
                                  : rec.priority === "medium"
                                    ? "bg-amber-500"
                                    : "bg-blue-500"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <History className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-20" />
                      <p className="text-sm text-muted-foreground">
                        No history available
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
