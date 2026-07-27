import SystemTopBar from "@/components/SystemTopBar";
import ProfileCard from "@/components/ProfileCard";
import MusicPlayer from "@/components/MusicPlayer";
import ProjectTracker from "@/components/ProjectTracker";
import PhotoCarousel from "@/components/PhotoCarousel";
import StatusBar from "@/components/StatusBar";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/AnimatedEntry";

export default function Home() {
  return (
    <main className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <StaggerContainer>
        {/* System Top Bar */}
        <StaggerItem className="mb-5">
          <SystemTopBar />
        </StaggerItem>

        {/* Bento Grid - 错落有致的 OS 仪表盘布局 */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5">
          {/* 个人指挥中心 - 2x2 大卡 */}
          <StaggerItem className="md:col-span-2 md:row-span-2">
            <ProfileCard />
          </StaggerItem>

          {/* 项目进度追踪 - 2x1 */}
          <StaggerItem className="md:col-span-2">
            <ProjectTracker />
          </StaggerItem>

          {/* 音乐播放器 - 2x1 */}
          <StaggerItem className="md:col-span-2">
            <MusicPlayer />
          </StaggerItem>

          {/* 照片墙 - 2x2 大卡 */}
          <StaggerItem className="md:col-span-2 md:row-span-2">
            <PhotoCarousel />
          </StaggerItem>

          {/* 快捷信息卡 - 1x1 */}
          <StaggerItem className="md:col-span-1">
            <QuickStat icon="📝" label="文章" value="0" color="from-[#00D1FF] to-[#00FFA3]" />
          </StaggerItem>

          {/* 快捷信息卡 - 1x1 */}
          <StaggerItem className="md:col-span-1">
            <QuickStat icon="📸" label="照片" value="2" color="from-[#00FFA3] to-[#00D1FF]" />
          </StaggerItem>

          {/* 快捷信息卡 - 1x1 */}
          <StaggerItem className="md:col-span-1">
            <QuickStat icon="💻" label="项目" value="2" color="from-[#6366f1] to-[#00D1FF]" />
          </StaggerItem>

          {/* 快捷信息卡 - 1x1 */}
          <StaggerItem className="md:col-span-1">
            <QuickStat icon="🎵" label="音乐" value="0" color="from-[#00D1FF] to-[#8b5cf6]" />
          </StaggerItem>

          {/* 底部状态栏 - 整行 */}
          <StaggerItem className="md:col-span-4 lg:col-span-6">
            <StatusBar />
          </StaggerItem>
        </div>
      </StaggerContainer>
    </main>
  );
}

/** 快捷数据小卡片 - OS 风格 */
function QuickStat({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-[rgba(20,21,23,0.65)] backdrop-blur-[20px] saturate-[1.8] border border-white/10 rounded-3xl p-4 md:p-5 h-full flex flex-col items-center justify-center gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:bg-[rgba(20,21,23,0.75)] transition-colors duration-300 group">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-white tabular-nums">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
