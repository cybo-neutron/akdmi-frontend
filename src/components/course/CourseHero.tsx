import { useState } from "react";
import { Play } from "lucide-react";
import { VideoJSComponent } from "@/components/Videojs";
import { cn } from "@/lib/utils";

interface CourseHeroProps {
  introductionVideo?: string | null;
  coverArt?: string | null;
  title: string;
}

export function CourseHero({
  introductionVideo,
  coverArt,
  title,
}: CourseHeroProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (isPlaying && introductionVideo) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-sm overflow-hidden">
        <VideoJSComponent
          className="h-full w-full"
          options={{
            controls: true,
            autoplay: true,
            fluid: false,
            fill: true,
            sources: [
              {
                src: introductionVideo,
                type: introductionVideo.includes(".m3u8")
                  ? "application/x-mpegURL"
                  : "video/mp4",
              },
            ],
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full aspect-video overflow-hidden rounded-sm",
        introductionVideo && "cursor-pointer group",
      )}
      onClick={() => introductionVideo && setIsPlaying(true)}
    >
      {/* Cover art or gradient placeholder */}
      {coverArt ? (
        <img
          src={coverArt}
          alt={title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-linear-to-br from-zinc-800 via-zinc-700 to-zinc-900 flex items-center justify-center">
          <span className="text-5xl font-black text-white/10 uppercase tracking-widest text-center px-8 select-none">
            COURSE
          </span>
        </div>
      )}

      {/* Subtle dark overlay */}
      <div className="absolute inset-0 bg-black/25" />

      {/* Play button — only shown when a video URL exists */}
      {introductionVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-200">
            <Play className="h-7 w-7 text-primary-foreground fill-primary-foreground ml-1" />
          </div>
        </div>
      )}

      {/* "Preview Trailer" badge */}
      <div className="absolute bottom-3 left-3">
        <span className="bg-black/70 text-white text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1.5">
          Preview Trailer
        </span>
      </div>
    </div>
  );
}
