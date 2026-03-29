import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Headphones, Radio, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef } from "react";
import { useStudio } from "../context/StudioContext";
import type { AudioTrack } from "../types/studio";

function WaveformCanvas({ track }: { track: AudioTrack }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0d0f14";
    ctx.fillRect(0, 0, W, H);
    const bars = 60;
    const barW = (W - 2) / bars;
    const seed = track.id.charCodeAt(track.id.length - 1);
    for (let i = 0; i < bars; i++) {
      const height = track.muted
        ? 2
        : Math.abs(Math.sin(i * 0.4 + seed) * Math.cos(i * 0.2)) *
            (H * 0.8 * (track.volume / 100)) +
          2;
      const x = 1 + i * barW;
      const y = (H - height) / 2;
      const gradient = ctx.createLinearGradient(0, y, 0, y + height);
      gradient.addColorStop(0, track.muted ? "#2a2d3a" : "#06b6d4");
      gradient.addColorStop(1, track.muted ? "#1e2130" : "#a855f7");
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barW - 1, height);
    }
    ctx.strokeStyle = "#2a2d3a";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();
  }, [track]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={40}
      className="w-full rounded"
      style={{ border: "1px solid #2a2d3a" }}
    />
  );
}

function TrackEditor({ track }: { track: AudioTrack }) {
  const { updateAudioTrack } = useStudio();
  const fileRef = useRef<HTMLInputElement>(null);

  function update(updates: Partial<AudioTrack>) {
    updateAudioTrack(track.id, updates);
  }

  const stereoBorder = track.stereo ? "#a855f7" : "#2a2d3a";
  const muteBorder = track.muted ? "#ef4444" : "#2a2d3a";
  const soloBorder = track.solo ? "#f59e0b" : "#2a2d3a";

  return (
    <div
      className="flex flex-col gap-1.5 p-2"
      style={{ borderRight: "1px solid #2a2d3a" }}
      data-ocid="audio.panel"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold" style={{ color: "#06b6d4" }}>
          {track.name}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="text-xs px-1.5 py-0.5 rounded transition-colors"
            style={{
              background: track.stereo
                ? "rgba(168,85,247,0.2)"
                : "rgba(100,100,120,0.2)",
              color: track.stereo ? "#a855f7" : "#8b8fa8",
              border: `1px solid ${stereoBorder}`,
            }}
            onClick={() => update({ stereo: !track.stereo })}
            data-ocid="audio.stereo_toggle"
          >
            {track.stereo ? <Headphones size={10} /> : <Radio size={10} />}
          </button>
          <button
            type="button"
            className="text-xs px-1.5 py-0.5 rounded transition-colors"
            style={{
              background: track.muted
                ? "rgba(239,68,68,0.2)"
                : "rgba(100,100,120,0.2)",
              color: track.muted ? "#ef4444" : "#8b8fa8",
              border: `1px solid ${muteBorder}`,
            }}
            onClick={() => update({ muted: !track.muted })}
            data-ocid="audio.mute_toggle"
          >
            {track.muted ? <VolumeX size={10} /> : <Volume2 size={10} />}
          </button>
          <button
            type="button"
            className="text-xs px-1.5 py-0.5 rounded transition-colors"
            style={{
              background: track.solo
                ? "rgba(245,158,11,0.2)"
                : "rgba(100,100,120,0.2)",
              color: track.solo ? "#f59e0b" : "#8b8fa8",
              border: `1px solid ${soloBorder}`,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
            onClick={() => update({ solo: !track.solo })}
            data-ocid="audio.solo_toggle"
          >
            S
          </button>
        </div>
      </div>

      <WaveformCanvas track={track} />

      <input
        ref={fileRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f)
            update({
              fileUrl: URL.createObjectURL(f),
              name: f.name.substring(0, 12),
            });
        }}
      />
      <Button
        size="sm"
        variant="ghost"
        className="h-6 text-xs w-full"
        style={{ color: "#8b8fa8", border: "1px dashed #2a2d3a" }}
        onClick={() => fileRef.current?.click()}
        data-ocid="audio.upload_button"
      >
        {track.fileUrl ? "Replace Audio" : "+ Load Audio"}
      </Button>

      <div className="flex items-center gap-2">
        <Label className="text-xs w-6" style={{ color: "#8b8fa8" }}>
          Vol
        </Label>
        <Slider
          value={[track.volume]}
          min={0}
          max={200}
          step={1}
          onValueChange={([v]) => update({ volume: v })}
          className="flex-1"
          data-ocid="audio.volume_slider"
        />
        <span
          className="text-xs w-8 text-right tabular-nums"
          style={{ color: "#8b8fa8" }}
        >
          {track.volume}%
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-xs w-6" style={{ color: "#8b8fa8" }}>
          Pan
        </Label>
        <Slider
          value={[track.pan + 100]}
          min={0}
          max={200}
          step={1}
          onValueChange={([v]) => update({ pan: v - 100 })}
          className="flex-1"
          data-ocid="audio.pan_slider"
        />
        <span
          className="text-xs w-8 text-right tabular-nums"
          style={{ color: "#8b8fa8" }}
        >
          {track.pan === 0
            ? "C"
            : track.pan > 0
              ? `R${track.pan}`
              : `L${Math.abs(track.pan)}`}
        </span>
      </div>

      <div className="text-xs" style={{ color: "#4b5068" }}>
        {track.stereo ? "Stereo" : "Mono"} · up to 200 dB · 150kbps
      </div>
    </div>
  );
}

export function AudioEditor() {
  const { state } = useStudio();
  return (
    <div className="flex h-full" data-ocid="audio.section">
      {state.audioTracks.map((track) => (
        <div key={track.id} className="flex-1 overflow-hidden">
          <TrackEditor track={track} />
        </div>
      ))}
    </div>
  );
}
