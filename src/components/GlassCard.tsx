"use client";

import { motion, type MotionValue } from "framer-motion";
import { useTiltEffect } from "@/hooks/useTiltEffect";
import { useSpotlight } from "@/hooks/useSpotlight";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  enableTilt?: boolean;
  variant?: "light" | "transparent";
  onClick?: () => void;
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
  variant = "light",
  onClick,
}: GlassCardProps) {
  const { rotateX, rotateY, handleMouseMove: tiltMouseMove, handleMouseLeave } = useTiltEffect(10);
  const { spotlightStyle, handleMouseMove: spotlightMouseMove } = useSpotlight();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (enableTilt) tiltMouseMove(e);
    spotlightMouseMove(e);
  };

  const baseClasses = variant === "transparent"
    ? "relative overflow-hidden bg-[rgba(20,21,23,0.65)] backdrop-blur-[20px] saturate-[1.8] border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
    : "relative overflow-hidden bg-[rgba(20,21,23,0.65)] backdrop-blur-[20px] saturate-[1.8] border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]";

  if (!enableTilt) {
    return (
      <div
        className={`${baseClasses} ${className}`}
        onMouseMove={handleMouseMove}
        onClick={onClick}
      >
        <SpotlightOverlay spotlightStyle={spotlightStyle} />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return (
    <motion.div
      className={`${baseClasses} ${className}`}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <SpotlightOverlay spotlightStyle={spotlightStyle} />
      <div className="relative z-10" style={{ transform: "translateZ(20px)" }}>
        {children}
      </div>
    </motion.div>
  );
}
