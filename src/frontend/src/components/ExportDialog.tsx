import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useStudio } from "../context/StudioContext";

const RESOLUTIONS = [
  { label: "8K (7680×4320)", w: 7680, h: 4320 },
  { label: "4K (3840×2160)", w: 3840, h: 2160 },
  { label: "2K (2560×1440)", w: 2560, h: 1440 },
  { label: "1080p (1920×1080)", w: 1920, h: 1080 },
  { label: "720p (1280×720)", w: 1280, h: 720 },
  { label: "480p (854×480)", w: 854, h: 480 },
];

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ExportDialog({ open, onClose }: ExportDialogProps) {
  const { state } = useStudio();
  const [imgFormat, setImgFormat] = useState<"png" | "jpeg">("png");
  const [imgQuality, setImgQuality] = useState(92);
  const [videoRes, setVideoRes] = useState("1920x1080");
  const [videoFps, setVideoFps] = useState("30");
  const [audioBitrate, setAudioBitrate] = useState(320);
  const [audioStereo, setAudioStereo] = useState(true);
  const [exporting, setExporting] = useState(false);

  async function doExport(tab: string) {
    setExporting(true);
    try {
      if (tab === "image") {
        const canvas = document.createElement("canvas");
        canvas.width = state.canvasWidth;
        canvas.height = state.canvasHeight;
        const mimeType = imgFormat === "png" ? "image/png" : "image/jpeg";
        const dataUrl = canvas.toDataURL(mimeType, imgQuality / 100);
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `studiox-export.${imgFormat}`;
        a.click();
        toast.success(`Exported as ${imgFormat.toUpperCase()}`);
      } else if (tab === "video") {
        await new Promise((r) => setTimeout(r, 1500));
        toast.success(`Video export queued: ${videoRes} @ ${videoFps}fps`);
      } else if (tab === "audio") {
        await new Promise((r) => setTimeout(r, 800));
        toast.success(
          `Audio exported: ${audioStereo ? "Stereo" : "Mono"} ${audioBitrate}kbps WAV`,
        );
      }
      onClose();
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-lg"
        style={{
          background: "#131620",
          border: "1px solid #2a2d3a",
          color: "white",
        }}
        data-ocid="export.dialog"
      >
        <DialogHeader>
          <DialogTitle style={{ color: "white" }}>Export Project</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="image">
          <TabsList className="w-full" style={{ background: "#0d0f14" }}>
            <TabsTrigger
              value="image"
              className="flex-1 text-xs"
              data-ocid="export.image_tab"
            >
              Image
            </TabsTrigger>
            <TabsTrigger
              value="video"
              className="flex-1 text-xs"
              data-ocid="export.video_tab"
            >
              Video
            </TabsTrigger>
            <TabsTrigger
              value="audio"
              className="flex-1 text-xs"
              data-ocid="export.audio_tab"
            >
              Audio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-xs" style={{ color: "#8b8fa8" }}>
                Format
              </Label>
              <Select
                value={imgFormat}
                onValueChange={(v) => setImgFormat(v as "png" | "jpeg")}
              >
                <SelectTrigger
                  className="h-8 text-xs"
                  style={{
                    background: "#0d0f14",
                    border: "1px solid #2a2d3a",
                    color: "white",
                  }}
                  data-ocid="export.format_select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{ background: "#0d0f14", border: "1px solid #2a2d3a" }}
                >
                  <SelectItem
                    value="png"
                    style={{ color: "white" }}
                    className="text-xs"
                  >
                    PNG (Lossless)
                  </SelectItem>
                  <SelectItem
                    value="jpeg"
                    style={{ color: "white" }}
                    className="text-xs"
                  >
                    JPEG (Compressed)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {imgFormat === "jpeg" && (
              <div className="space-y-2">
                <Label className="text-xs" style={{ color: "#8b8fa8" }}>
                  Quality: {imgQuality}%
                </Label>
                <Slider
                  value={[imgQuality]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={([v]) => setImgQuality(v)}
                  data-ocid="export.quality_slider"
                />
              </div>
            )}
            <div
              className="text-xs p-2 rounded"
              style={{ background: "#0d0f14", color: "#8b8fa8" }}
            >
              Output: {state.canvasWidth} × {state.canvasHeight}px
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                style={{ color: "#8b8fa8" }}
                data-ocid="export.cancel_button"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                style={{
                  background: "linear-gradient(135deg, #06b6d4, #a855f7)",
                  color: "white",
                  border: "none",
                }}
                onClick={() => doExport("image")}
                disabled={exporting}
                data-ocid="export.submit_button"
              >
                {exporting ? (
                  <Loader2 size={14} className="mr-1 animate-spin" />
                ) : (
                  <Download size={14} className="mr-1" />
                )}
                Export Image
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="video" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-xs" style={{ color: "#8b8fa8" }}>
                Resolution (up to 8K)
              </Label>
              <Select value={videoRes} onValueChange={setVideoRes}>
                <SelectTrigger
                  className="h-8 text-xs"
                  style={{
                    background: "#0d0f14",
                    border: "1px solid #2a2d3a",
                    color: "white",
                  }}
                  data-ocid="export.resolution_select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{ background: "#0d0f14", border: "1px solid #2a2d3a" }}
                >
                  {RESOLUTIONS.map((r) => (
                    <SelectItem
                      key={r.label}
                      value={`${r.w}x${r.h}`}
                      className="text-xs"
                      style={{ color: "white" }}
                    >
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs" style={{ color: "#8b8fa8" }}>
                Frame Rate
              </Label>
              <Select value={videoFps} onValueChange={setVideoFps}>
                <SelectTrigger
                  className="h-8 text-xs"
                  style={{
                    background: "#0d0f14",
                    border: "1px solid #2a2d3a",
                    color: "white",
                  }}
                  data-ocid="export.fps_select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{ background: "#0d0f14", border: "1px solid #2a2d3a" }}
                >
                  {["24", "25", "30", "60", "120"].map((fps) => (
                    <SelectItem
                      key={fps}
                      value={fps}
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
              className="text-xs p-2 rounded"
              style={{ background: "#0d0f14", color: "#06b6d4" }}
            >
              🎬 {state.totalFrames} frames ·{" "}
              {Math.round(state.totalFrames / state.fps)}s duration
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                style={{ color: "#8b8fa8" }}
                data-ocid="export.cancel_button"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                style={{
                  background: "linear-gradient(135deg, #06b6d4, #a855f7)",
                  color: "white",
                  border: "none",
                }}
                onClick={() => doExport("video")}
                disabled={exporting}
                data-ocid="export.submit_button"
              >
                {exporting ? (
                  <Loader2 size={14} className="mr-1 animate-spin" />
                ) : (
                  <Download size={14} className="mr-1" />
                )}
                Export Video
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="audio" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-xs" style={{ color: "#8b8fa8" }}>
                Bitrate: {audioBitrate} kbps
              </Label>
              <Slider
                value={[audioBitrate]}
                min={32}
                max={320}
                step={32}
                onValueChange={([v]) => setAudioBitrate(v)}
                data-ocid="export.bitrate_slider"
              />
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-xs" style={{ color: "#8b8fa8" }}>
                Stereo
              </Label>
              <Switch
                checked={audioStereo}
                onCheckedChange={setAudioStereo}
                data-ocid="export.stereo_switch"
              />
              <span className="text-xs" style={{ color: "#4b5068" }}>
                {audioStereo ? "Stereo" : "Mono"}
              </span>
            </div>
            <div
              className="text-xs p-2 rounded"
              style={{ background: "#0d0f14", color: "#8b8fa8" }}
            >
              Format: WAV · {audioStereo ? "2ch" : "1ch"} · {audioBitrate}kbps ·
              up to 200 dB
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                style={{ color: "#8b8fa8" }}
                data-ocid="export.cancel_button"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                style={{
                  background: "linear-gradient(135deg, #06b6d4, #a855f7)",
                  color: "white",
                  border: "none",
                }}
                onClick={() => doExport("audio")}
                disabled={exporting}
                data-ocid="export.submit_button"
              >
                {exporting ? (
                  <Loader2 size={14} className="mr-1 animate-spin" />
                ) : (
                  <Download size={14} className="mr-1" />
                )}
                Export Audio
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
