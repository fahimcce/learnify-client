"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, StickyNote, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseTabsProps {
  activeTab: "learning-path" | "notes" | "resources" | null;
  onTabChange: (tab: "learning-path" | "notes" | "resources") => void;
}

export function CourseTabs({ activeTab, onTabChange }: CourseTabsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 border-b">
            <Button
              variant="ghost"
              className={cn(
                "rounded-b-none border-b-2",
                activeTab === "learning-path"
                  ? "border-primary text-primary"
                  : "border-transparent"
              )}
              onClick={() => onTabChange("learning-path")}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Learning Path
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "rounded-b-none border-b-2",
                activeTab === "notes"
                  ? "border-primary text-primary"
                  : "border-transparent"
              )}
              onClick={() => onTabChange("notes")}
            >
              <StickyNote className="mr-2 h-4 w-4" />
              View Notes
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "rounded-b-none border-b-2",
                activeTab === "resources"
                  ? "border-primary text-primary"
                  : "border-transparent"
              )}
              onClick={() => onTabChange("resources")}
            >
              <FileText className="mr-2 h-4 w-4" />
              View Resources
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
