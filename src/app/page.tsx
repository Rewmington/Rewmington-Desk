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
            <QuickStat icon="📝" label="文章" value="0" color="from-violet-400 to-purple-500" />
          </StaggerItem>

          {/* 快捷信息卡 - 1x1 */}
          <StaggerItem className="md:col-span-1">
            <QuickStat icon="📸" label="照片" value="2" color="from-pink-400 to-rose-500" />
          </StaggerItem>

          {/* 快捷信息卡 - 1x1 */}
          <StaggerItem className="md:col-span-1">
            <QuickStat icon="💻" label="项目" value="2" color="from-blue-400 to-indigo-500" />
          </StaggerItem>

          {/* 快捷信息卡 - 1x1 */}
          <StaggerItem className="md:col-span-1">
            <QuickStat icon="🎵" label="音乐" value="0" color="from-amber-400 to-orange-500" />
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
    <div className="bg-white/20 backdrop-blur-xl border border-white/50 rounded-3xl p-4 md:p-5 h-full flex flex-col items-center justify-center gap-2 shadow-lg shadow-black/5 hover:bg-white/30 transition-colors duration-300 group">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-800 tabular-nums">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
