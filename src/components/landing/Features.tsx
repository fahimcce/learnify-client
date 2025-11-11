"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  FolderOpen,
  TrendingUp,
  Sparkles,
  Bell,
  StickyNote,
  MessageCircle,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Course Management",
    description:
      "Browse and enroll in courses across different skill levels (beginner, intermediate, advanced). Access comprehensive course catalogs with detailed information.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: FolderOpen,
    title: "Course Resources",
    description:
      "Access rich learning materials including documents, videos, images, and external links. All resources are organized and easily accessible for each course.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Track your learning progress from 0-100% and set your skill level (1-10) for each course. Monitor your enrollment status and achievements in real-time.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Sparkles,
    title: "AI Learning Paths",
    description:
      "Generate personalized learning paths powered by Google Gemini AI. Get step-by-step guidance tailored to your enrolled courses and learning goals.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Bell,
    title: "Daily Recommendations",
    description:
      "Receive AI-powered recommendations 4 times daily. Get personalized suggestions categorized as study, practice, review, explore, or project activities.",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: StickyNote,
    title: "Smart Notes",
    description:
      "Create and organize notes in multiple formats - text, PDF, or images. Organize notes by course or keep them as random notes for quick access.",
    color: "from-teal-500 to-cyan-500",
  },
  {
    icon: MessageCircle,
    title: "Real-time Chat",
    description:
      "Connect with peers through real-time messaging. Share files, images, and PDFs. Build study groups and collaborate seamlessly with Socket.IO technology.",
    color: "from-pink-500 to-rose-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function Features() {
  return (
    <section id="features" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Comprehensive{" "}
            <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Learning Platform
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need for effective learning - from course management
            to AI-powered recommendations, all in one place.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 group border-2 hover:border-primary/20">
                  <CardHeader>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-12 h-12 rounded-lg bg-linear-to-br ${feature.color} p-3 mb-4 flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <CardTitle className="text-xl mb-2">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
