import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { useStudio } from "../context/StudioContext";

const TRACK_HEIGHT = 28;
const HEADER_HEIGHT = 24;
const LABEL_WIDTH = 110;

export function Timeline() {
  const { state, setPlaying, setCurrentFrame } = useStudio();
  const rulerRef = useRef<HTMLCanvasElement>(null);
  const tracksRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingPlayhead = useRef(false);

  const totalFrames = state.totalFrames;
  const currentFrame = state.currentFrame;
  const layers = state.layers;

  const frameToX = useCallback(
    (frame: number, width: number) => {
      return LABEL_WIDTH + (frame / totalFrames) * (width - LABEL_WIDTH);
    },
    [totalFrames],
  );

  const xToFrame = useCallback(
    (x: number, width: number) => {
      return Math.round(
        ((x - LABEL_WIDTH) / (width - LABEL_WIDTH)) * totalFrames,
      );
    },
    [totalFrames],
  );

  // Draw ruler + tracks
  useEffect(() => {
    const ruler = rulerRef.current;
    const tracks = tracksRef.current;
    if (!ruler || !tracks) return;
    const W = ruler.width;

    const rCtx = ruler.getContext("2d")!;
    rCtx.clearRect(0, 0, W, HEADER_HEIGHT);
    rCtx.fillStyle = "#131620";
    rCtx.fillRect(0, 0, W, HEADER_HEIGHT);

    const frameWidth = (W - LABEL_WIDTH) / totalFrames;
    const majorEvery = Math.max(1, Math.ceil(10 / frameWidth));

    for (let f = 0; f <= totalFrames; f += majorEvery) {
      const x = frameToX(f, W);
      const isMajor = f % (majorEvery * 5) === 0;
      rCtx.strokeStyle = isMajor ? "#4b5068" : "#2a2d3a";
      rCtx.lineWidth = 1;
      rCtx.beginPath();
      rCtx.moveTo(x, isMajor ? 4 : 10);
      rCtx.lineTo(x, HEADER_HEIGHT);
      rCtx.stroke();
      if (isMajor) {
        rCtx.fillStyle = "#4b5068";
        rCtx.font = "9px monospace";
        rCtx.fillText(String(f), x + 2, 12);
      }
    }

    const px = frameToX(currentFrame, W);
    rCtx.fillStyle = "#06b6d4";
    rCtx.fillRect(px - 1, 0, 2, HEADER_HEIGHT);
    rCtx.beginPath();
    rCtx.moveTo(px - 5, 0);
    rCtx.lineTo(px + 5, 0);
    rCtx.lineTo(px, 8);
    rCtx.closePath();
    rCtx.fill();

    const tCtx = tracks.getContext("2d")!;
    const totalH = layers.length * TRACK_HEIGHT;
    tracks.height = Math.max(totalH, 1);
    tCtx.clearRect(0, 0, W, tracks.height);

    const reversedLayers = [...layers].reverse();
    for (let idx = 0; idx < reversedLayers.length; idx++) {
      const layer = reversedLayers[idx];
      const ty = idx * TRACK_HEIGHT;
      const isSelected = layer.id === state.selectedLayerId;

      tCtx.fillStyle = isSelected
        ? "rgba(6,182,212,0.08)"
        : idx % 2 === 0
          ? "#131620"
          : "#0f1119";
      tCtx.fillRect(0, ty, W, TRACK_HEIGHT);

      tCtx.fillStyle = isSelected ? "#06b6d4" : "#8b8fa8";
      tCtx.font = "10px sans-serif";
      tCtx.fillText(layer.name.substring(0, 14), 4, ty + 17);

      const barX = frameToX(layer.inFrame, W);
      const barW = frameToX(layer.outFrame, W) - barX;
      tCtx.fillStyle = isSelected
        ? "rgba(6,182,212,0.5)"
        : "rgba(168,85,247,0.4)";
      tCtx.fillRect(barX, ty + 4, barW, TRACK_HEIGHT - 8);
      tCtx.strokeStyle = isSelected ? "#06b6d4" : "#a855f7";
      tCtx.lineWidth = 1;
      tCtx.strokeRect(barX, ty + 4, barW, TRACK_HEIGHT - 8);

      for (const kf of layer.keyframes) {
        const kx = frameToX(kf.frame, W);
        const ky = ty + TRACK_HEIGHT / 2;
        tCtx.fillStyle = "#f59e0b";
        tCtx.beginPath();
        tCtx.moveTo(kx, ky - 5);
        tCtx.lineTo(kx + 5, ky);
        tCtx.lineTo(kx, ky + 5);
        tCtx.lineTo(kx - 5, ky);
        tCtx.closePath();
        tCtx.fill();
      }

      tCtx.strokeStyle = "#2a2d3a";
      tCtx.lineWidth = 0.5;
      tCtx.strokeRect(0, ty, W, TRACK_HEIGHT);
    }

    tCtx.strokeStyle = "#06b6d4";
    tCtx.lineWidth = 1.5;
    tCtx.beginPath();
    tCtx.moveTo(px, 0);
    tCtx.lineTo(px, tracks.height);
    tCtx.stroke();
  });

  useEffect(() => {
    const ruler = rulerRef.current;
    const tracks = tracksRef.current;
    const container = containerRef.current;
    if (!container || !ruler || !tracks) return;
    const ro = new ResizeObserver(() => {
      const w = container.clientWidth;
      ruler.width = w;
      tracks.width = w;
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  const handleRulerClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const ruler = rulerRef.current;
      if (!ruler) return;
      const rect = ruler.getBoundingClientRect();
      const x = e.clientX - rect.left;
      setCurrentFrame(
        Math.max(0, Math.min(xToFrame(x, ruler.width), totalFrames - 1)),
      );
    },
    [xToFrame, setCurrentFrame, totalFrames],
  );

  const handleRulerMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      isDraggingPlayhead.current = true;
      handleRulerClick(e);
    },
    [handleRulerClick],
  );

  const handleRulerMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDraggingPlayhead.current) return;
      handleRulerClick(e);
    },
    [handleRulerClick],
  );

  // Playback
  const playRef = useRef<number | null>(null);
  useEffect(() => {
    if (state.isPlaying) {
      let last = performance.now();
      let frame = currentFrame;
      const tick = (now: number) => {
        const dt = now - last;
        last = now;
        frame = (frame + Math.round((dt / 1000) * state.fps)) % totalFrames;
        setCurrentFrame(frame);
        playRef.current = requestAnimationFrame(tick);
      };
      playRef.current = requestAnimationFrame(tick);
    } else {
      if (playRef.current) cancelAnimationFrame(playRef.current);
    }
    return () => {
      if (playRef.current) cancelAnimationFrame(playRef.current);
    };
  }, [state.isPlaying, state.fps, currentFrame, setCurrentFrame, totalFrames]);

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "#131620" }}
      data-ocid="timeline.panel"
    >
      <div
        className="flex items-center gap-2 px-2 py-1"
        style={{ borderBottom: "1px solid #2a2d3a", height: 36 }}
      >
        <Button
          size="sm"
          variant="ghost"
          className="w-6 h-6 p-0"
          style={{ color: "#8b8fa8" }}
          onClick={() => setCurrentFrame(0)}
          data-ocid="timeline.skip_back_button"
        >
          <SkipBack size={12} />
        </Button>
        <Button
          size="sm"
          className="w-6 h-6 p-0"
          style={{
            background: state.isPlaying ? "#a855f7" : "#06b6d4",
            color: "#0d0f14",
          }}
          onClick={() => setPlaying(!state.isPlaying)}
          data-ocid="timeline.play_button"
        >
          {state.isPlaying ? <Pause size={12} /> : <Play size={12} />}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="w-6 h-6 p-0"
          style={{ color: "#8b8fa8" }}
          onClick={() => setCurrentFrame(totalFrames - 1)}
          data-ocid="timeline.skip_forward_button"
        >
          <SkipForward size={12} />
        </Button>

        <span className="text-xs tabular-nums" style={{ color: "#8b8fa8" }}>
          {currentFrame + 1} / {totalFrames}
        </span>

        <Select value={String(state.fps)}>
          <SelectTrigger
            className="h-6 w-20 text-xs"
            style={{
              background: "#1e2130",
              border: "1px solid #2a2d3a",
              color: "white",
            }}
            data-ocid="timeline.fps_select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            style={{ background: "#1e2130", border: "1px solid #2a2d3a" }}
          >
            {[24, 25, 30, 60, 120].map((fps) => (
              <SelectItem
                key={fps}
                value={String(fps)}
                className="text-xs"
                style={{ color: "white" }}
              >
                {fps} fps
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden relative"
      >
        <canvas
          ref={rulerRef}
          height={HEADER_HEIGHT}
          className="sticky top-0 z-10 block w-full cursor-pointer"
          style={{ height: HEADER_HEIGHT }}
          onMouseDown={handleRulerMouseDown}
          onMouseMove={handleRulerMouseMove}
          onMouseUp={() => {
            isDraggingPlayhead.current = false;
          }}
          data-ocid="timeline.canvas_target"
        />
        <canvas ref={tracksRef} className="block w-full" />
      </div>
    </div>
  );
}
