"use client";

import { useMotionValue, useTransform, useMotionTemplate } from "framer-motion";
import { useCallback } from "react";

interface SpotlightValues {
  spotlightStyle: ReturnType<typeof useMotionTemplate>;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function useSpotlight(): SpotlightValues {
  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(50);

  const spotlightStyle = useMotionTemplate`radial-gradient(300px circle at ${mouseX}% ${mouseY}%, rgba(255,255,255,0.15), transparent 60%)`;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * 100;
      const py = ((e.clientY - rect.top) / rect.height) * 100;
      mouseX.set(px);
      mouseY.set(py);
    },
    [mouseX, mouseY]
  );

  return { spotlightStyle, handleMouseMove };
}
