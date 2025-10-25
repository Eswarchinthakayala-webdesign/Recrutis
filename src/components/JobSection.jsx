"use client";
import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Briefcase, Users } from "lucide-react";

export default function JobSection() {
  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" },
    }),
    hover: {
      scale: 1.03,
      boxShadow:
        "0 12px 30px rgba(100,100,100,0.1), 0 0 20px rgba(255,255,255,0.05)",
      transition: { duration: 0.35 },
    },
  };

  const cards = [
    {
      title: "For Job Seekers",
      icon: (
        <Briefcase className="w-10 h-10 text-gray-700 dark:text-gray-200 drop-shadow-sm" />
      ),
      content: "Search and apply for jobs, track applications, and more.",
      gradient:
        "from-gray-50/70 via-gray-100/60 to-gray-200/40 dark:from-gray-800/60 dark:via-gray-900/80 dark:to-gray-950/90",
    },
    {
      title: "For Employers",
      icon: (
        <Users className="w-10 h-10 text-gray-700 dark:text-gray-200 drop-shadow-sm" />
      ),
      content: "Post jobs, manage applications, and find the best candidates.",
      gradient:
        "from-gray-50/70 via-gray-100/60 to-gray-200/40 dark:from-gray-800/60 dark:via-gray-900/80 dark:to-gray-950/90",
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 px-4 gap-6 py-10">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          whileHover="hover"
          viewport={{ once: true }}
          custom={i}
        >
          <Card
            className={`relative overflow-hidden rounded-2xl border border-gray-200/70 dark:border-gray-800/70 
              bg-gradient-to-br ${card.gradient} backdrop-blur-md transition-all duration-300`}
          >
            {/* Subtle glowing overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent dark:from-white/5 rounded-2xl pointer-events-none"
              animate={{ opacity: [0.1, 0.35, 0.1], scale: [1, 1.05, 1] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <CardHeader className="flex items-center gap-3">
              {card.icon}
              <CardTitle className="font-semibold text-lg text-gray-900 dark:text-gray-100 tracking-tight">
                {card.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {card.content}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </section>
  );
}
