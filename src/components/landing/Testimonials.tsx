"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Computer Science Student",
    image: "SJ",
    rating: 5,
    text: "Learnify's AI learning paths have completely transformed how I approach courses. The personalized recommendations help me stay on track, and I love tracking my progress from 0-100%!",
  },
  {
    name: "Michael Chen",
    role: "Medical Student",
    image: "MC",
    rating: 5,
    text: "The course resources are fantastic - having all documents, videos, and links in one place makes studying so much easier. The daily AI recommendations keep me motivated!",
  },
  {
    name: "Emily Rodriguez",
    role: "Business Student",
    image: "ER",
    rating: 5,
    text: "I love how I can create notes for each course - text, PDF, or images. The real-time chat feature lets me collaborate with classmates seamlessly. Highly recommend!",
  },
  {
    name: "David Kim",
    role: "Engineering Student",
    image: "DK",
    rating: 5,
    text: "The progress tracking feature is amazing. Being able to set my skill level and see my progress percentage helps me understand exactly where I am in each course.",
  },
  {
    name: "Jessica Martinez",
    role: "Psychology Student",
    image: "JM",
    rating: 5,
    text: "The AI-powered learning paths are incredible. They give me step-by-step guidance tailored to my enrolled courses. Combined with daily recommendations, I've never been more organized!",
  },
  {
    name: "Alex Thompson",
    role: "Mathematics Student",
    image: "AT",
    rating: 5,
    text: "Enrolling in courses is so easy, and accessing all the resources is seamless. The chat feature with file sharing makes group projects a breeze. This platform is amazing!",
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

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 lg:py-32 bg-background">
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
            What Students Are{" "}
            <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Saying
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of successful students who are achieving their
            learning goals.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={cardVariants}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-2 hover:border-primary/20 relative">
                <CardContent className="p-6 lg:p-8">
                  {/* Quote Icon */}
                  <div className="absolute top-4 right-4 opacity-10">
                    <Quote className="w-12 h-12 text-primary" />
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <p className="text-muted-foreground mb-6 leading-relaxed relative z-10">
                    "{testimonial.text}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.image}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
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
