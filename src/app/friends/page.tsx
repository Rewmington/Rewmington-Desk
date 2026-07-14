"use client";

import GlassCard from "@/components/GlassCard";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/AnimatedEntry";

const friends = [
  {
    name: "添加友链",
    url: "",
    avatar: "➕",
    bio: "欢迎交换友链，请在关于页联系我",
  },
];

export default function FriendsPage() {
  return (
    <main className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-16">
      <StaggerContainer>
        {/* 页面标题 */}
        <StaggerItem>
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-2">
              🔗 友链
            </h1>
            <p className="text-white/60 text-sm md:text-base">
              互联网上的朋友们
            </p>
          </div>
        </StaggerItem>

        {/* 友链列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {friends.map((friend) => (
            <StaggerItem key={friend.name}>
              <GlassCard className="p-6 h-full">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-2xl shrink-0">
                    {friend.avatar}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-bold text-base truncate">
                      {friend.name}
                    </h3>
                    <p className="text-white/50 text-sm truncate">
                      {friend.bio}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </StaggerItem>
          ))}
        </div>
      </StaggerContainer>
    </main>
  );
}
