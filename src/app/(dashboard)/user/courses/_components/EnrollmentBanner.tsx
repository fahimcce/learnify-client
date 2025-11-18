"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Enrollment } from "@/redux/features/enrollment/enrollment.api";

interface EnrollmentBannerProps {
  enrollment: Enrollment;
}

export function EnrollmentBanner({ enrollment }: EnrollmentBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-primary/10 border border-primary/20 rounded-lg p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold">You are enrolled in this course</p>
            <p className="text-sm text-muted-foreground">
              Status: {enrollment.status}
            </p>
          </div>
        </div>
        <Link href={`/user/enrollments/${enrollment._id}`}>
          <Button variant="outline" size="sm">
            View Enrollment
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
