import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Circle,
  Download,
  Film,
  Hand,
  Layers,
  MousePointer2,
  Music,
  Pause,
  Pen,
  Play,
  Redo,
  Save,
  SkipBack,
  Sparkles,
  Square,
  Type,
  Undo,
  Wand2,
  ZoomIn,
} from "lucide-react";
import { useStudio } from "../context/StudioContext";
import type { Tool } from "../types/studio";

const tools: { tool: Tool; icon: React.ReactNode; label: string }[] = [
  { tool: "select", icon: <MousePointer2 size={16} />, label: "Select" },
  { tool: "rect", icon: <Square size={16} />, label: "Rectangle" },
  { tool: "ellipse", icon: <Circle size={16} />, label: "Ellipse" },
  { tool: "text", icon: <Type size={16} />, label: "Text" },
  { tool: "pen", icon: <Pen size={16} />, label: "Pen" },
  { tool: "hand", icon: <Hand size={16} />, label: "Pan" },
  { tool: "zoom", icon: <ZoomIn size={16} />, label: "Zoom" },
];

interface ToolbarProps {
  onExportClick: () => void;
}

export function Toolbar({ onExportClick }: ToolbarProps) {
  const { state, setTool, setPlaying, setCurrentFrame } = useStudio();

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className="flex items-center gap-1 px-3 h-full"
        style={{ background: "#131620", borderBottom: "1px solid #2a2d3a" }}
        data-ocid="toolbar.panel"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mr-3">
          <Sparkles size={20} className="text-cyan-400" />
          <span
            className="font-bold text-sm tracking-wider"
            style={{ color: "#a855f7" }}
          >
            StudioX
          </span>
        </div>

        <Separator
          orientation="vertical"
          className="h-8 mx-1"
          style={{ background: "#2a2d3a" }}
        />

        {/* Tools */}
        <div className="flex items-center gap-0.5" data-ocid="toolbar.tab">
          {tools.map(({ tool, icon, label }) => (
            <Tooltip key={tool}>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={state.activeTool === tool ? "default" : "ghost"}
                  className="w-8 h-8 p-0"
                  style={
                    state.activeTool === tool
                      ? { background: "#06b6d4", color: "#0d0f14" }
                      : { color: "#8b8fa8" }
                  }
                  onClick={() => setTool(tool)}
                  data-ocid={`toolbar.${tool}_button`}
                >
                  {icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{label}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        <Separator
          orientation="vertical"
          className="h-8 mx-2"
          style={{ background: "#2a2d3a" }}
        />

        {/* Playback */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="w-8 h-8 p-0"
                style={{ color: "#8b8fa8" }}
                onClick={() => setCurrentFrame(0)}
                data-ocid="toolbar.skip_back_button"
              >
                <SkipBack size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Rewind</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                className="w-8 h-8 p-0"
                style={{
                  background: state.isPlaying ? "#a855f7" : "#06b6d4",
                  color: "#0d0f14",
                }}
                onClick={() => setPlaying(!state.isPlaying)}
                data-ocid="toolbar.play_button"
              >
                {state.isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {state.isPlaying ? "Pause" : "Play"}
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator
          orientation="vertical"
          className="h-8 mx-2"
          style={{ background: "#2a2d3a" }}
        />

        {/* Mode Icons */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="w-8 h-8 p-0"
                style={{ color: "#8b8fa8" }}
                data-ocid="toolbar.layers_button"
              >
                <Layers size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Layers</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="w-8 h-8 p-0"
                style={{ color: "#8b8fa8" }}
                data-ocid="toolbar.film_button"
              >
                <Film size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Video</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="w-8 h-8 p-0"
                style={{ color: "#8b8fa8" }}
                data-ocid="toolbar.audio_button"
              >
                <Music size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Audio</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="w-8 h-8 p-0"
                style={{ color: "#8b8fa8" }}
                data-ocid="toolbar.vfx_button"
              >
                <Wand2 size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>VFX</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex-1" />

        {/* Frame info */}
        <span className="text-xs tabular-nums" style={{ color: "#8b8fa8" }}>
          Frame {state.currentFrame + 1} / {state.totalFrames} &nbsp;|&nbsp;{" "}
          {state.fps}fps &nbsp;|&nbsp; {state.canvasWidth}×{state.canvasHeight}
        </span>

        <Separator
          orientation="vertical"
          className="h-8 mx-2"
          style={{ background: "#2a2d3a" }}
        />

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="w-8 h-8 p-0"
                style={{ color: "#8b8fa8" }}
                data-ocid="toolbar.undo_button"
              >
                <Undo size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="w-8 h-8 p-0"
                style={{ color: "#8b8fa8" }}
                data-ocid="toolbar.redo_button"
              >
                <Redo size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="w-8 h-8 p-0"
                style={{ color: "#8b8fa8" }}
                data-ocid="toolbar.save_button"
              >
                <Save size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save</TooltipContent>
          </Tooltip>
          <Button
            size="sm"
            className="h-8 px-3 text-xs font-semibold"
            style={{
              background: "linear-gradient(135deg, #06b6d4, #a855f7)",
              color: "white",
              border: "none",
            }}
            onClick={onExportClick}
            data-ocid="toolbar.primary_button"
          >
            <Download size={14} className="mr-1" />
            Export
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
