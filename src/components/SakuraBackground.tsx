"use client";

import { useState, useEffect } from "react";

interface Petal {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
  rotate: number;
}

function generatePetals(): Petal[] {
  return Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 8 + Math.random() * 14,
    duration: 8 + Math.random() * 12,
    delay: Math.random() * 10,
    drift: -30 + Math.random() * 60,
    opacity: 0.3 + Math.random() * 0.5,
    rotate: Math.random() * 360,
  }));
}

export default function SakuraBackground() {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    setPetals(generatePetals());
  }, []);

  if (petals.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden hidden md:block">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute"
          style={{
            left: `${petal.left}%`,
            top: "-20px",
            width: `${petal.size}px`,
            height: `${petal.size}px`,
            opacity: 0,
            borderRadius: "100% 0 100% 0",
            background: `linear-gradient(135deg, rgba(255,183,197,${petal.opacity}), rgba(255,218,233,${petal.opacity}))`,
            animation: `sakuraFall ${petal.duration}s ${petal.delay}s linear infinite`,
            transform: `rotate(${petal.rotate}deg)`,
            ["--drift" as string]: `${petal.drift}vw`,
          }}
        />
      ))}
    </div>
  );
}
