import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { AudioEditor } from "./components/AudioEditor";
import { CanvasWorkspace } from "./components/CanvasWorkspace";
import { ExportDialog } from "./components/ExportDialog";
import { LayerPanel } from "./components/LayerPanel";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { Timeline } from "./components/Timeline";
import { Toolbar } from "./components/Toolbar";
import { StudioProvider } from "./context/StudioContext";

export default function App() {
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <StudioProvider>
      <div
        className="flex flex-col h-screen w-screen overflow-hidden"
        style={{ background: "#0d0f14" }}
      >
        {/* Toolbar */}
        <div style={{ height: 60, flexShrink: 0 }}>
          <Toolbar onExportClick={() => setExportOpen(true)} />
        </div>

        {/* Middle row */}
        <div className="flex flex-1 overflow-hidden">
          {/* Layer panel */}
          <div
            style={{
              width: 280,
              flexShrink: 0,
              background: "#131620",
              borderRight: "1px solid #2a2d3a",
            }}
          >
            <LayerPanel />
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-hidden relative">
            <CanvasWorkspace />
          </div>

          {/* Properties */}
          <div
            style={{
              width: 300,
              flexShrink: 0,
              background: "#131620",
              borderLeft: "1px solid #2a2d3a",
            }}
          >
            <PropertiesPanel />
          </div>
        </div>

        {/* Bottom: Timeline + Audio */}
        <div
          style={{
            height: 220,
            flexShrink: 0,
            background: "#131620",
            borderTop: "1px solid #2a2d3a",
          }}
          className="flex"
        >
          <div className="flex-1 overflow-hidden">
            <Timeline />
          </div>
          <div style={{ width: 460, borderLeft: "1px solid #2a2d3a" }}>
            <AudioEditor />
          </div>
        </div>
      </div>

      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
      <Toaster />
    </StudioProvider>
  );
}
