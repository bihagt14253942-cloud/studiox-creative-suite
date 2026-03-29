import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useStudio } from "../context/StudioContext";
import type { BlendMode, Effect } from "../types/studio";

const BLEND_MODES: BlendMode[] = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
];

function Section({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ borderBottom: "1px solid #2a2d3a" }}>
      <button
        type="button"
        className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-white/5 transition-colors"
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <ChevronDown size={12} style={{ color: "#8b8fa8" }} />
        ) : (
          <ChevronRight size={12} style={{ color: "#8b8fa8" }} />
        )}
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "#06b6d4" }}
        >
          {title}
        </span>
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

function NumInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-xs w-8 flex-shrink-0" style={{ color: "#8b8fa8" }}>
        {label}
      </Label>
      <div className="relative flex-1">
        <input
          type="number"
          value={Math.round(value * 100) / 100}
          min={min}
          max={max}
          step={step ?? 1}
          onChange={(e) => onChange(Number.parseFloat(e.target.value) || 0)}
          className="w-full text-xs rounded px-2 py-1 text-right"
          style={{
            background: "#1e2130",
            border: "1px solid #2a2d3a",
            color: "white",
            outline: "none",
          }}
          data-ocid="properties.input"
        />
        {unit && (
          <span
            className="absolute right-1 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: "#4b5068" }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export function PropertiesPanel() {
  const { state, updateLayer } = useStudio();
  const layer = state.layers.find((l) => l.id === state.selectedLayerId);

  if (!layer) {
    return (
      <div
        className="flex items-center justify-center h-full"
        data-ocid="properties.empty_state"
      >
        <div className="text-center" style={{ color: "#4b5068" }}>
          <p className="text-xs">No layer selected</p>
          <p className="text-xs mt-1">Click a layer to edit</p>
        </div>
      </div>
    );
  }

  const { transform, material, effects } = layer;

  function updateTransform(updates: Partial<typeof transform>) {
    updateLayer(layer!.id, { transform: { ...transform, ...updates } });
  }

  function updateMaterial(updates: Partial<typeof material>) {
    updateLayer(layer!.id, { material: { ...material, ...updates } });
  }

  function updateEffect(effectId: string, updates: Partial<Effect>) {
    const newEffects = effects.map((e) =>
      e.id === effectId ? { ...e, ...updates } : e,
    );
    updateLayer(layer!.id, { effects: newEffects });
  }

  return (
    <ScrollArea className="h-full" data-ocid="properties.panel">
      <div className="text-white">
        <div
          className="px-3 py-2"
          style={{ borderBottom: "1px solid #2a2d3a" }}
        >
          <span className="text-xs font-semibold" style={{ color: "white" }}>
            {layer.name}
          </span>
          <span
            className="ml-2 text-xs px-1.5 py-0.5 rounded"
            style={{ background: "#1e2130", color: "#06b6d4" }}
          >
            {layer.type}
          </span>
        </div>

        <Section title="Transform">
          <div className="grid grid-cols-2 gap-2">
            <NumInput
              label="X"
              value={transform.x}
              onChange={(v) => updateTransform({ x: v })}
            />
            <NumInput
              label="Y"
              value={transform.y}
              onChange={(v) => updateTransform({ y: v })}
            />
            <NumInput
              label="W"
              value={transform.width}
              onChange={(v) => updateTransform({ width: Math.max(1, v) })}
              min={1}
            />
            <NumInput
              label="H"
              value={transform.height}
              onChange={(v) => updateTransform({ height: Math.max(1, v) })}
              min={1}
            />
            <div className="col-span-2">
              <NumInput
                label="°"
                value={transform.rotation}
                onChange={(v) => updateTransform({ rotation: v })}
                min={-360}
                max={360}
                unit="°"
              />
            </div>
          </div>
        </Section>

        <Section title="Material">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label
                className="text-xs w-16 flex-shrink-0"
                style={{ color: "#8b8fa8" }}
              >
                Fill
              </Label>
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="color"
                  value={material.fillColor}
                  onChange={(e) =>
                    updateMaterial({ fillColor: e.target.value })
                  }
                  className="w-8 h-8 rounded cursor-pointer border-0"
                  style={{ background: "none" }}
                  data-ocid="properties.fill_input"
                />
                <input
                  type="text"
                  value={material.fillColor}
                  onChange={(e) =>
                    updateMaterial({ fillColor: e.target.value })
                  }
                  className="flex-1 text-xs px-2 py-1 rounded"
                  style={{
                    background: "#1e2130",
                    border: "1px solid #2a2d3a",
                    color: "white",
                    outline: "none",
                  }}
                  data-ocid="properties.color_input"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs" style={{ color: "#8b8fa8" }}>
                Opacity {Math.round(material.opacity * 100)}%
              </Label>
              <Slider
                value={[material.opacity * 100]}
                min={0}
                max={100}
                step={1}
                onValueChange={([v]) => updateMaterial({ opacity: v / 100 })}
                data-ocid="properties.opacity_input"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs" style={{ color: "#8b8fa8" }}>
                Blend Mode
              </Label>
              <Select
                value={material.blendMode}
                onValueChange={(v) =>
                  updateMaterial({ blendMode: v as BlendMode })
                }
              >
                <SelectTrigger
                  className="h-7 text-xs"
                  style={{
                    background: "#1e2130",
                    border: "1px solid #2a2d3a",
                    color: "white",
                  }}
                  data-ocid="properties.blend_select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{ background: "#1e2130", border: "1px solid #2a2d3a" }}
                >
                  {BLEND_MODES.map((m) => (
                    <SelectItem
                      key={m}
                      value={m}
                      className="text-xs capitalize"
                      style={{ color: "white" }}
                    >
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {layer.type === "shape" && (
              <div className="flex items-center gap-2">
                <Label
                  className="text-xs w-16 flex-shrink-0"
                  style={{ color: "#8b8fa8" }}
                >
                  Stroke
                </Label>
                <input
                  type="color"
                  value={
                    material.strokeColor === "transparent"
                      ? "#000000"
                      : material.strokeColor
                  }
                  onChange={(e) =>
                    updateMaterial({ strokeColor: e.target.value })
                  }
                  className="w-8 h-8 rounded cursor-pointer"
                  style={{ background: "none" }}
                  data-ocid="properties.stroke_input"
                />
                <input
                  type="number"
                  value={material.strokeWidth}
                  min={0}
                  max={50}
                  onChange={(e) =>
                    updateMaterial({
                      strokeWidth: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-16 text-xs px-2 py-1 rounded"
                  style={{
                    background: "#1e2130",
                    border: "1px solid #2a2d3a",
                    color: "white",
                    outline: "none",
                  }}
                  data-ocid="properties.stroke_width_input"
                />
              </div>
            )}

            {layer.type === "text" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label
                    className="text-xs w-16 flex-shrink-0"
                    style={{ color: "#8b8fa8" }}
                  >
                    Text
                  </Label>
                  <input
                    type="text"
                    value={layer.text || ""}
                    onChange={(e) =>
                      updateLayer(layer.id, { text: e.target.value })
                    }
                    className="flex-1 text-xs px-2 py-1 rounded"
                    style={{
                      background: "#1e2130",
                      border: "1px solid #2a2d3a",
                      color: "white",
                      outline: "none",
                    }}
                    data-ocid="properties.text_input"
                  />
                </div>
                <NumInput
                  label="Size"
                  value={layer.fontSize || 32}
                  onChange={(v) => updateLayer(layer.id, { fontSize: v })}
                  min={4}
                  max={500}
                />
              </div>
            )}
          </div>
        </Section>

        <Section title="Effects">
          <div className="space-y-3">
            {effects.map((effect) => (
              <div key={effect.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    className="text-xs"
                    style={{ color: effect.enabled ? "white" : "#8b8fa8" }}
                  >
                    {effect.name}
                  </Label>
                  <Switch
                    checked={effect.enabled}
                    onCheckedChange={(v) =>
                      updateEffect(effect.id, { enabled: v })
                    }
                    data-ocid={`properties.${effect.id}_switch`}
                  />
                </div>
                {effect.enabled && (
                  <Slider
                    value={[effect.intensity]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([v]) =>
                      updateEffect(effect.id, { intensity: v })
                    }
                    data-ocid={`properties.${effect.id}_slider`}
                  />
                )}
              </div>
            ))}
          </div>
        </Section>

        <div
          className="px-3 py-3 text-center"
          style={{ color: "#4b5068", fontSize: 10 }}
        >
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#4b5068" }}
          >
            Built with love using caffeine.ai
          </a>
        </div>
      </div>
    </ScrollArea>
  );
}
