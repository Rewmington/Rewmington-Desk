"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 20,
      mass: 0.8,
    },
  },
};

export function StaggerContainer({ children, className = "" }: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }: StaggerContainerProps) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
