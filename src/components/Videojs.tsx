import React, { useCallback, useEffect, useRef } from "react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";
import "videojs-contrib-quality-levels";
// Import source directly — the pre-built dist is Babel-transpiled to ES5,
// which breaks with Video.js v8's native ES class Plugin base.
import "videojs-hls-quality-selector/src/plugin";

// Video.js v8 built-in types don't export a PlayerOptions interface,
// so we use a record type to stay type-safe without relying on @types/video.js.
type VideoJsOptions = Record<string, unknown>;

// Extend the Player type to include plugin methods added at runtime
interface PlayerWithPlugins extends Player {
  qualityLevels?: () => void;
  hlsQualitySelector?: (opts: { displayCurrentQuality: boolean }) => void;
}

interface VideoJSProps {
  options: VideoJsOptions;
  onReady?: (player: Player) => void;
  className?: string;
}

export const VideoJSComponent: React.FC<VideoJSProps> = ({
  options,
  onReady,
  className,
}) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  // Stable reference for onReady to avoid re-initializing the player
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  const initPlayer = useCallback(() => {
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current.appendChild(videoElement);

      // Separate sources and autoplay from the rest of the options.
      // We must initialize quality plugins BEFORE setting the source,
      // otherwise VHS parses the HLS manifest and fires addqualitylevel
      // events before the quality selector can bind its listeners.
      const { sources, autoplay, ...restOptions } = options;

      const player: PlayerWithPlugins = videojs(
        videoElement,
        {
          ...restOptions,
          autoplay: false,
          fluid: false,
          fill: true,
        },
        () => {
          // 1. Initialize quality levels plugin (required by hls-quality-selector)
          if (typeof player.qualityLevels === "function") {
            player.qualityLevels();
          }

          // 2. Initialize HLS quality selector — its event listeners are now
          //    bound BEFORE we set the source below.
          if (typeof player.hlsQualitySelector === "function") {
            player.hlsQualitySelector({
              displayCurrentQuality: true,
            });
          }

          // 3. Now set the source — VHS will parse the manifest and fire
          //    addqualitylevel events that the quality selector will catch.
          if (sources) {
            (player as Player).src(sources as { src: string; type: string }[]);
          }

          // 4. Start playback if autoplay was requested
          if (autoplay) {
            (player as Player).play();
          }

          onReadyRef.current?.(player);
        },
      );

      playerRef.current = player;
    }
  }, [options]);

  useEffect(() => {
    initPlayer();
  }, [initPlayer]);

  // Clean up player on unmount
  useEffect(() => {
    return () => {
      const player = playerRef.current;
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div
      data-vjs-player
      className={className}
      style={{ width: "100%", height: "100%" }}
    >
      <div ref={videoRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};
