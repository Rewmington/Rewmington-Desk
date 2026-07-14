"use client";

import { useMotionValue, useTransform, useSpring } from "framer-motion";
import { useCallback } from "react";

interface TiltValues {
  rotateX: ReturnType<typeof useSpring>;
  rotateY: ReturnType<typeof useSpring>;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseLeave: () => void;
}

export function useTiltEffect(maxTilt = 10): TiltValues {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]), {
    stiffness: 300,
    damping: 30,
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      x.set(px);
      y.set(py);
    },
    [x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return { rotateX, rotateY, handleMouseMove, handleMouseLeave };
}
