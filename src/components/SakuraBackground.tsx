"use client";

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

// 固定种子的伪随机：服务端与客户端算出完全相同的粒子布局，所以可以在模块加载时
// 一次算完。用 Math.random + effect 会让首屏没有粒子、且 SSR/CSR 结果不一致。
function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generatePetals(): Petal[] {
  const random = mulberry32(20260714);
  return Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: random() * 100,
    size: 8 + random() * 14,
    duration: 8 + random() * 12,
    delay: random() * 10,
    drift: -30 + random() * 60,
    opacity: 0.3 + random() * 0.5,
    rotate: random() * 360,
  }));
}

const petals = generatePetals();

export default function SakuraBackground() {
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
            // 通过 CSS 变量读取主题粒子色（RGB 分量），自动响应主题切换
            background: `linear-gradient(135deg, rgba(var(--particle-start),${petal.opacity}), rgba(var(--particle-end),${petal.opacity}))`,
            animation: `sakuraFall ${petal.duration}s ${petal.delay}s linear infinite`,
            transform: `rotate(${petal.rotate}deg)`,
            ["--drift" as string]: `${petal.drift}vw`,
          }}
        />
      ))}
    </div>
  );
}
