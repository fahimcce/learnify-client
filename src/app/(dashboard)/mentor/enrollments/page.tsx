"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  Loader2, 
  Mail, 
  CheckCircle2, 
  Clock, 
  X,
  FileText,
  Calendar
} from "lucide-react";
import { 
  DashboardPageHeader, 
} from "@/components/dashboard/DashboardComponents";
import { useGetMentorEnrollmentsQuery } from "@/redux/features/enrollment/enrollment.api";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function MentorEnrollmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: enrollments, isLoading } = useGetMentorEnrollmentsQuery();

  const enrollmentsArray = Array.isArray(enrollments) ? enrollments : [];

  const filteredEnrollments = enrollmentsArray.filter((enrollment) => {
    const matchesSearch = 
      enrollment.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.courseId?.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.courseId?.courseCode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || enrollment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "in-progress":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "enrolled":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const AnimatedTableRow = motion(TableRow);

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Student Enrollments"
        description="View all students enrolled in your assigned courses"
      />

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-center bg-card p-4 rounded-2xl border border-emerald-500/10 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by student name, email or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-muted/30 border-none focus-visible:ring-emerald-500 transition-all rounded-xl"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          {['all', 'enrolled', 'in-progress', 'completed', 'cancelled'].map((status) => (
            <Button
              key={status}
              onClick={() => setStatusFilter(status)}
              variant={statusFilter === status ? "default" : "ghost"}
              className={cn(
                "capitalize rounded-xl px-5 h-10 transition-all font-bold whitespace-nowrap",
                statusFilter === status 
                  ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                  : "text-muted-foreground hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
              )}
            >
              {status.replace('-', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Enrollment Table */}
      <div className="bg-card rounded-2xl border border-emerald-500/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-emerald-500/5">
              <TableRow className="hover:bg-transparent border-emerald-500/10">
                <TableHead className="font-black text-emerald-600 uppercase tracking-widest text-[11px]">Student Information</TableHead>
                <TableHead className="font-black text-emerald-600 uppercase tracking-widest text-[11px]">Enrolled Course</TableHead>
                <TableHead className="font-black text-emerald-600 uppercase tracking-widest text-[11px]">Enrollment Date</TableHead>
                <TableHead className="font-black text-emerald-600 uppercase tracking-widest text-[11px]">Status</TableHead>
                <TableHead className="font-black text-emerald-600 uppercase tracking-widest text-[11px] text-right">Completion Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {filteredEnrollments.map((enrollment, index) => (
                  <AnimatedTableRow 
                    key={enrollment._id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="hover:bg-emerald-500/5 group border-emerald-500/5 transition-colors"
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                          {enrollment.userId?.name}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <Mail className="h-3 w-3" />
                          {enrollment.userId?.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground line-clamp-1">
                          {enrollment.courseId?.courseName}
                        </span>
                        <span className="text-[10px] font-mono font-black text-muted-foreground/60 flex items-center gap-1.5 mt-0.5">
                          <FileText className="h-3 w-3" />
                          {enrollment.courseId?.courseCode}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-emerald-500/50" />
                        {format(new Date(enrollment.enrollmentDate), 'dd MMM, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("px-2.5 py-0.5 rounded-lg font-bold border-2 text-[10px]", getStatusColor(enrollment.status))}>
                        {enrollment.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {enrollment.completionDate ? (
                        <div className="flex items-center justify-end gap-2 text-sm text-green-600 font-bold">
                          <CheckCircle2 className="h-4 w-4" />
                          {format(new Date(enrollment.completionDate), 'dd MMM, yyyy')}
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground/50 italic">
                          <Clock className="h-3 w-3" />
                          Ongoing
                        </div>
                      )}
                    </TableCell>
                  </AnimatedTableRow>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {filteredEnrollments.length === 0 && (
          <div className="py-20 text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-emerald-500/5 flex items-center justify-center mb-6">
              <Users className="h-10 w-10 text-emerald-500/20" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-2">No students found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto text-sm px-4">
              Try adjusting your search or filter to find specific students.
            </p>
          </div>
        )}
      </div>

       {/* Footer Info */}
       <div className="flex items-center justify-between text-[11px] text-muted-foreground font-black uppercase tracking-tighter px-2">
        <span>Showing {filteredEnrollments.length} of {enrollmentsArray.length} Student Enrollments</span>
        <span>Premium Mentor Access Dashboard</span>
      </div>
    </div>
  );
}
