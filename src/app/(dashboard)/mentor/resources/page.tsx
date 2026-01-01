"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Loader2, 
  BookOpen, 
  ArrowLeft, 
  Upload, 
  Download, 
  Trash2, 
  FolderOpen, 
  ClipboardList 
} from "lucide-react";
import { DashboardCard, DashboardPageHeader } from "@/components/dashboard/DashboardComponents";
import { useGetMyAssignedCoursesQuery } from "@/redux/features/course/course.api";
import { 
  useGetCourseResourcesQuery, 
  useUploadResourceFileMutation,
  useDeleteResourceMutation
} from "@/redux/features/courseResource/courseResource.api";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ResourceForm } from "@/components/resource/ResourceForm";
import { toast } from "sonner";
import { DeleteResourceDialog } from "../courses/[id]/_components/DeleteResourceDialog";

export default function MentorResourcesPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"resource" | "question-bank" | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [deleteResourceId, setDeleteResourceId] = useState<string | null>(null);

  // Fetch mentor's assigned courses
  const { data: courses, isLoading: isLoadingCourses } = useGetMyAssignedCoursesQuery();

  // Fetch resources for selected course
  const { data: resources, isLoading: isLoadingResources, refetch: refetchResources } = useGetCourseResourcesQuery(
    { courseId: selectedCourseId! },
    { skip: !selectedCourseId }
  );

  const [uploadResource, { isLoading: isUploading }] = useUploadResourceFileMutation();
  const [deleteResource, { isLoading: isDeleting }] = useDeleteResourceMutation();

  const coursesArray = Array.isArray(courses) ? courses : [];
  const resourcesArray = Array.isArray(resources) ? resources.filter((r: any) => !r.isDeleted) : [];

  const handleUpload = async (data: {
    courseId: string;
    title: string;
    description?: string;
    file: File;
    category?: "resource" | "question-bank";
  }) => {
    try {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("title", data.title);
      if (data.description) formData.append("description", data.description);
      
      // Use the active category if not specified in form, or default to resource
      const categoryToUse = data.category || selectedCategory || "resource";
      formData.append("category", categoryToUse);

      await uploadResource({
        courseId: data.courseId,
        formData,
      }).unwrap();
      
      toast.success("Resource uploaded successfully!");
      setIsUploadDialogOpen(false);
      refetchResources();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to upload resource");
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deleteResourceId) return;
    try {
      await deleteResource(deleteResourceId).unwrap();
      toast.success("Resource deleted successfully");
      setDeleteResourceId(null);
      refetchResources();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete resource");
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${kb.toFixed(2)} KB`;
  };

  // 1. Course Selection View
  if (!selectedCourseId) {
    return (
      <div className="space-y-6">
        <DashboardPageHeader
          title="Resources"
          description="Select a course to manage its resources and question bank"
        />

        {isLoadingCourses ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : coursesArray.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {coursesArray.map((course: any, index: number) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div
                  className="cursor-pointer"
                  onClick={() => setSelectedCourseId(course._id)}
                >
                  <DashboardCard className="hover:scale-105 hover:border-emerald-500/50 transition-all border-dashed">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-500/20">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground truncate">{course.courseName}</h3>
                        <p className="text-xs text-muted-foreground mt-1 font-mono tracking-wider">
                          {course.courseCode}
                        </p>
                      </div>
                    </div>
                  </DashboardCard>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <DashboardCard>
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="mx-auto h-16 w-16 mb-4 opacity-20" />
              <h3 className="text-lg font-bold text-foreground">No assigned courses</h3>
              <p>Contact admin if you think this is a mistake.</p>
            </div>
          </DashboardCard>
        )}
      </div>
    );
  }

  const selectedCourse = coursesArray.find((c: any) => c._id === selectedCourseId);

  // 2. Category Selection View (Resource vs Question Bank)
  if (!selectedCategory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedCourseId(null)} className="rounded-full h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-black text-foreground">{selectedCourse?.courseName}</h2>
            <p className="text-sm text-muted-foreground">Select material type to manage</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Resources Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            className="cursor-pointer"
            onClick={() => setSelectedCategory("resource")}
          >
            <DashboardCard className="relative overflow-hidden h-48 flex items-center p-8 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20 group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <FolderOpen className="h-32 w-32 -mr-8 -mt-8" />
              </div>
              <div className="flex items-center gap-6 relative z-10">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-xl shadow-blue-500/20">
                  <FolderOpen className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-foreground">Resources</h3>
                  <p className="text-muted-foreground mt-1">Course documents, videos, and files</p>
                  <p className="text-xs font-bold text-blue-500 mt-2 uppercase tracking-widest">
                    {resourcesArray.filter(r => r.category === "resource").length} Items
                  </p>
                </div>
              </div>
            </DashboardCard>
          </motion.div>

          {/* Question Bank Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            className="cursor-pointer"
            onClick={() => setSelectedCategory("question-bank")}
          >
            <DashboardCard className="relative overflow-hidden h-48 flex items-center p-8 bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20 group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ClipboardList className="h-32 w-32 -mr-8 -mt-8" />
              </div>
              <div className="flex items-center gap-6 relative z-10">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl shadow-purple-500/20">
                  <ClipboardList className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-foreground">Question Bank</h3>
                  <p className="text-muted-foreground mt-1">Quizzes and exam preparation materials</p>
                  <p className="text-xs font-bold text-purple-500 mt-2 uppercase tracking-widest">
                    {resourcesArray.filter(r => r.category === "question-bank").length} Items
                  </p>
                </div>
              </div>
            </DashboardCard>
          </motion.div>
        </div>
      </div>
    );
  }

  // 3. Item List View (Filtered by Category)
  const filteredResources = resourcesArray.filter(r => r.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedCategory(null)} className="rounded-full h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-black text-foreground">
              {selectedCategory === "resource" ? "Course Resources" : "Question Bank"}
            </h2>
            <p className="text-sm text-muted-foreground">{selectedCourse?.courseName}</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsUploadDialogOpen(true)}
          className={`bg-gradient-to-r ${selectedCategory === 'resource' ? 'from-blue-600 to-cyan-600' : 'from-purple-600 to-pink-600'} text-white shadow-lg`}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload {selectedCategory === "resource" ? "Resource" : "Question Bank"}
        </Button>
      </div>

      {isLoadingResources ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredResources.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource: any, index: number) => (
            <motion.div
              key={resource._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <DashboardCard className="group hover:border-primary/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedCategory === 'resource' ? 'bg-blue-500/10 text-blue-600' : 'bg-purple-500/10 text-purple-600'}`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground truncate">{resource.title}</h3>
                      <p className="text-xs text-muted-foreground">{formatFileSize(resource.fileSize)}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {resource.resourceType}
                  </Badge>
                </div>
                
                {resource.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 italic">
                    {resource.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-4 uppercase tracking-tighter">
                  <span>Added {formatDistanceToNow(new Date(resource.createdAt), { addSuffix: true })}</span>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 rounded-lg hover:bg-primary hover:text-white transition-colors"
                    asChild
                  >
                    <a 
                      href={resource.fileUrl?.startsWith('http') ? resource.fileUrl : `${process.env.NEXT_PUBLIC_API_URL}${resource.fileUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Download className="w-3.5 h-3.5 mr-2" />
                      Download
                    </a>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="text-destructive hover:bg-destructive hover:text-white rounded-lg shrink-0 transition-all"
                    onClick={() => setDeleteResourceId(resource._id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </DashboardCard>
            </motion.div>
          ))}
        </div>
      ) : (
        <DashboardCard className="border-dashed">
          <div className="text-center py-20">
            <div className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-6 ${selectedCategory === 'resource' ? 'bg-blue-500/5 text-blue-500' : 'bg-purple-500/5 text-purple-500'}`}>
              {selectedCategory === 'resource' ? <FolderOpen className="h-10 w-10 text-blue-400" /> : <ClipboardList className="h-10 w-10 text-purple-400" />}
            </div>
            <h3 className="text-xl font-black text-foreground mb-2">Empty Category</h3>
            <p className="text-muted-foreground mb-8 text-sm max-w-xs mx-auto">
              No {selectedCategory === "resource" ? "resources" : "question bank materials"} found for this course. Start by uploading one!
            </p>
            <Button 
              onClick={() => setIsUploadDialogOpen(true)}
              className={`bg-gradient-to-r ${selectedCategory === 'resource' ? 'from-blue-600 to-cyan-600' : 'from-purple-600 to-pink-600'} text-white shadow-xl px-8`}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Now
            </Button>
          </div>
        </DashboardCard>
      )}

      {selectedCourseId && (
        <>
          <ResourceForm
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
            onSubmit={handleUpload}
            courses={coursesArray.filter((c: any) => !c.isDeleted)}
            defaultCourseId={selectedCourseId}
            defaultCategory={selectedCategory || "resource"}
            isLoading={isUploading}
          />
          <DeleteResourceDialog
            open={!!deleteResourceId}
            onOpenChange={(open: boolean) => !open && setDeleteResourceId(null)}
            onConfirm={handleDelete}
            isLoading={isDeleting}
          />
        </>
      )}
    </div>
  );
}
