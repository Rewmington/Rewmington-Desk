"use client";

import { motion, type MotionValue } from "framer-motion";
import { useTiltEffect } from "@/hooks/useTiltEffect";
import { useSpotlight } from "@/hooks/useSpotlight";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  enableTilt?: boolean;
}

function SpotlightOverlay({ spotlightStyle }: { spotlightStyle: MotionValue<string> }) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-20 rounded-3xl"
      style={{ background: spotlightStyle }}
    />
  );
}

export default function GlassCard({
  children,
  className = "",
  enableTilt = true,
}: GlassCardProps) {
  const { rotateX, rotateY, handleMouseMove: tiltMouseMove, handleMouseLeave } = useTiltEffect(10);
  const { spotlightStyle, handleMouseMove: spotlightMouseMove } = useSpotlight();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (enableTilt) tiltMouseMove(e);
    spotlightMouseMove(e);
  };

  if (!enableTilt) {
    return (
      <div
        className={`relative overflow-hidden bg-black/40 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl ${className}`}
        onMouseMove={handleMouseMove}
      >
        <SpotlightOverlay spotlightStyle={spotlightStyle} />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return (
    <motion.div
      className={`relative overflow-hidden bg-black/40 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl ${className}`}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <SpotlightOverlay spotlightStyle={spotlightStyle} />
      <div className="relative z-10" style={{ transform: "translateZ(20px)" }}>
        {children}
      </div>
    </motion.div>
  );
}
