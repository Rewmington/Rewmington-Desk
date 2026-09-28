"use client";

import GlassCard from "@/components/GlassCard";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/AnimatedEntry";
import { friends } from "@/lib/constants";

export default function FriendsPage() {
  return (
    <main className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-16">
      <StaggerContainer>
        {/* 页面标题 */}
        <StaggerItem>
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
              🔗 友链
            </h1>
            <p className="text-[var(--text-secondary)] text-sm md:text-base">
              互联网上的朋友们
            </p>
          </div>
        </StaggerItem>

        {/* 友链列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {friends.map((friend, i) => {
            const card = (
              <GlassCard className="p-6 h-full">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--accent-secondary)] to-[var(--accent-primary)] flex items-center justify-center text-2xl shrink-0">
                    {friend.avatar}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[var(--text-primary)] font-bold text-base truncate">
                      {friend.name}
                    </h3>
                    <p className="text-[var(--text-secondary)] text-sm truncate">
                      {friend.bio}
                    </p>
                  </div>
                </div>
              </GlassCard>
            );

            // url 为空的是占位卡。以前整页压根没渲染链接，所以"友链"点了没反应 ——
            // 有链接才包 <a>，没链接就明确标成占位，别伪装成真友链。
            return (
              <StaggerItem key={`${friend.name}-${i}`}>
                {friend.url ? (
                  <a
                    href={friend.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full rounded-3xl transition-transform duration-300 hover:-translate-y-1"
                  >
                    {card}
                  </a>
                ) : (
                  <div className="relative h-full">
                    {card}
                    <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[10px] text-[var(--text-tertiary)]">
                      占位
                    </span>
                  </div>
                )}
              </StaggerItem>
            );
          })}
        </div>
      </StaggerContainer>
    </main>
  );
}
