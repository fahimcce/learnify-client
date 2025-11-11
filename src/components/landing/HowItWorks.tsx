"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Sign Up & Browse Courses",
    description:
      "Create your account and explore our comprehensive course catalog. Browse courses by skill level - beginner, intermediate, or advanced.",
    details: [
      "Quick registration process",
      "Browse course catalog",
      "View course details and levels",
    ],
  },
  {
    number: "02",
    title: "Enroll & Access Resources",
    description:
      "Enroll in courses that interest you and gain immediate access to course resources including documents, videos, images, and links.",
    details: [
      "One-click enrollment",
      "Access course resources",
      "Download learning materials",
    ],
  },
  {
    number: "03",
    title: "Generate AI Learning Paths",
    description:
      "Get personalized learning paths powered by Google Gemini AI. Receive step-by-step guidance tailored to your enrolled courses.",
    details: [
      "AI-generated learning paths",
      "Step-by-step guidance",
      "Personalized recommendations",
    ],
  },
  {
    number: "04",
    title: "Receive Daily Recommendations",
    description:
      "Get AI-powered recommendations 4 times daily. Receive personalized suggestions for study, practice, review, explore, and project activities.",
    details: [
      "Daily AI recommendations",
      "Categorized suggestions",
      "Priority-based activities",
    ],
  },
  {
    number: "05",
    title: "Track Progress & Take Notes",
    description:
      "Monitor your learning progress (0-100%) and set your skill level. Create notes in text, PDF, or image format for each course.",
    details: [
      "Track progress percentage",
      "Set skill levels (1-10)",
      "Create course-specific notes",
    ],
  },
  {
    number: "06",
    title: "Collaborate & Chat",
    description:
      "Connect with peers through real-time chat. Share files, images, and collaborate on your learning journey together.",
    details: [
      "Real-time messaging",
      "File sharing (PDF, images)",
      "Study group collaboration",
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const stepVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-muted/30">
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
            How It{" "}
            <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Start your learning journey in minutes. From enrollment to
            AI-powered recommendations, we guide you every step of the way.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-5xl mx-auto space-y-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={stepVariants}
              className="relative"
            >
              <Card className="hover:shadow-lg transition-shadow duration-300 border-2">
                <CardContent className="p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Step Number */}
                    <div className="shrink-0">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-20 h-20 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-lg"
                      >
                        {step.number}
                      </motion.div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                      <p className="text-muted-foreground mb-4 text-lg">
                        {step.description}
                      </p>
                      <ul className="space-y-2">
                        {step.details.map((detail, detailIndex) => (
                          <li
                            key={detailIndex}
                            className="flex items-center gap-2 text-sm"
                          >
                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Arrow (hidden on mobile, shown on desktop) */}
                    {index < steps.length - 1 && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="hidden lg:flex items-center justify-center absolute -right-8 top-1/2 transform -translate-y-1/2 text-primary"
                      >
                        <ArrowRight className="w-8 h-8" />
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
