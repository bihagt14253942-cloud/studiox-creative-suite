import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronDown,
  ChevronUp,
  Circle,
  Eye,
  EyeOff,
  Film,
  GripVertical,
  Image,
  Lock,
  Plus,
  Square,
  Trash2,
  Type,
  Unlock,
} from "lucide-react";
import { useState } from "react";
import { useStudio } from "../context/StudioContext";
import type { Layer, LayerType } from "../types/studio";

function layerTypeIcon(layer: Layer) {
  if (layer.type === "text")
    return <Type size={12} className="text-yellow-400" />;
  if (layer.type === "image")
    return <Image size={12} className="text-green-400" />;
  if (layer.type === "video")
    return <Film size={12} className="text-orange-400" />;
  if (layer.shapeKind === "ellipse")
    return <Circle size={12} className="text-cyan-400" />;
  return <Square size={12} className="text-purple-400" />;
}

function layerTypeName(type: LayerType): string {
  const map: Record<LayerType, string> = {
    shape: "Shape",
    image: "Image",
    text: "Text",
    video: "Video",
    adjustment: "Adj",
  };
  return map[type] ?? type;
}

export function LayerPanel() {
  const {
    state,
    selectLayer,
    updateLayer,
    deleteLayer,
    addLayer,
    reorderLayers,
  } = useStudio();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const reversed = [...state.layers].reverse();

  function startEdit(layer: Layer) {
    setEditingId(layer.id);
    setEditName(layer.name);
  }

  function commitEdit(id: string) {
    if (editName.trim()) updateLayer(id, { name: editName.trim() });
    setEditingId(null);
  }

  function createLayer(type: LayerType) {
    const id = `layer-${Date.now()}`;
    const newLayer: Layer = {
      id,
      name: `${layerTypeName(type)} ${state.layers.length + 1}`,
      type,
      shapeKind: type === "shape" ? "rect" : undefined,
      visible: true,
      locked: false,
      transform: {
        x: 200,
        y: 200,
        width: 200,
        height: 150,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      },
      material: {
        fillColor: "#3b82f6",
        strokeColor: "transparent",
        strokeWidth: 0,
        opacity: 1,
        blendMode: "normal",
      },
      effects: [
        { id: "blur", name: "Blur", enabled: false, intensity: 5 },
        { id: "glow", name: "Glow", enabled: false, intensity: 50 },
        { id: "shadow", name: "Shadow", enabled: false, intensity: 40 },
        {
          id: "colorGrade",
          name: "Color Grade",
          enabled: false,
          intensity: 50,
        },
        {
          id: "chromaticAb",
          name: "Chromatic Aberration",
          enabled: false,
          intensity: 3,
        },
      ],
      keyframes: [],
      text: type === "text" ? "New Text" : undefined,
      fontSize: type === "text" ? 32 : undefined,
      fontFamily: type === "text" ? "sans-serif" : undefined,
      inFrame: 0,
      outFrame: state.totalFrames - 1,
    };
    addLayer(newLayer);
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col h-full" data-ocid="layers.panel">
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{ borderBottom: "1px solid #2a2d3a" }}
        >
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#06b6d4" }}
          >
            Layers
          </span>
          <span className="text-xs" style={{ color: "#4b5068" }}>
            {state.layers.length} layers
          </span>
        </div>

        <ScrollArea className="flex-1">
          <div className="py-1" data-ocid="layers.list">
            {reversed.map((layer, reversedIdx) => {
              const originalIdx = state.layers.length - 1 - reversedIdx;
              const isSelected = state.selectedLayerId === layer.id;
              return (
                <LayerRow
                  key={layer.id}
                  layer={layer}
                  isSelected={isSelected}
                  reversedIdx={reversedIdx}
                  originalIdx={originalIdx}
                  totalLayers={state.layers.length}
                  editingId={editingId}
                  editName={editName}
                  onSelect={() => selectLayer(layer.id)}
                  onToggleVisible={() =>
                    updateLayer(layer.id, { visible: !layer.visible })
                  }
                  onToggleLock={() =>
                    updateLayer(layer.id, { locked: !layer.locked })
                  }
                  onOpacityChange={(v) =>
                    updateLayer(layer.id, {
                      material: { ...layer.material, opacity: v },
                    })
                  }
                  onStartEdit={() => startEdit(layer)}
                  onEditNameChange={setEditName}
                  onCommitEdit={() => commitEdit(layer.id)}
                  onCancelEdit={() => setEditingId(null)}
                  onMoveUp={() => {
                    if (originalIdx < state.layers.length - 1)
                      reorderLayers(originalIdx, originalIdx + 1);
                  }}
                  onMoveDown={() => {
                    if (originalIdx > 0)
                      reorderLayers(originalIdx, originalIdx - 1);
                  }}
                  onDelete={() => deleteLayer(layer.id)}
                />
              );
            })}
          </div>
        </ScrollArea>

        <div
          className="p-2 grid grid-cols-4 gap-1"
          style={{ borderTop: "1px solid #2a2d3a" }}
          data-ocid="layers.add_panel"
        >
          {[
            {
              type: "shape" as LayerType,
              icon: <Square size={12} />,
              label: "Shape",
            },
            {
              type: "text" as LayerType,
              icon: <Type size={12} />,
              label: "Text",
            },
            {
              type: "image" as LayerType,
              icon: <Image size={12} />,
              label: "Image",
            },
            {
              type: "video" as LayerType,
              icon: <Film size={12} />,
              label: "Video",
            },
          ].map(({ type, icon, label }) => (
            <Tooltip key={type}>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 flex flex-col items-center gap-0.5 p-1"
                  style={{ color: "#8b8fa8", fontSize: 9 }}
                  onClick={() => createLayer(type)}
                  data-ocid={`layers.add_${type}_button`}
                >
                  <Plus size={10} />
                  {icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add {label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}

interface LayerRowProps {
  layer: Layer;
  isSelected: boolean;
  reversedIdx: number;
  originalIdx: number;
  totalLayers: number;
  editingId: string | null;
  editName: string;
  onSelect: () => void;
  onToggleVisible: () => void;
  onToggleLock: () => void;
  onOpacityChange: (v: number) => void;
  onStartEdit: () => void;
  onEditNameChange: (v: string) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

function LayerRow({
  layer,
  isSelected,
  reversedIdx,
  editingId,
  editName,
  onSelect,
  onToggleVisible,
  onToggleLock,
  onOpacityChange,
  onStartEdit,
  onEditNameChange,
  onCommitEdit,
  onCancelEdit,
  onMoveUp,
  onMoveDown,
  onDelete,
}: LayerRowProps) {
  return (
    <div
      className="flex items-center gap-1 px-2 py-1.5 cursor-pointer group transition-colors"
      style={{
        background: isSelected ? "rgba(6,182,212,0.12)" : "transparent",
        borderLeft: isSelected ? "2px solid #06b6d4" : "2px solid transparent",
      }}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect();
      }}
      data-ocid={`layers.item.${reversedIdx + 1}`}
    >
      <GripVertical size={12} style={{ color: "#4b5068", flexShrink: 0 }} />

      <button
        type="button"
        className="p-0.5 rounded hover:bg-white/10 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisible();
        }}
        data-ocid={`layers.toggle.${reversedIdx + 1}`}
      >
        {layer.visible ? (
          <Eye size={12} style={{ color: "#8b8fa8" }} />
        ) : (
          <EyeOff size={12} style={{ color: "#4b5068" }} />
        )}
      </button>

      <button
        type="button"
        className="p-0.5 rounded hover:bg-white/10 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onToggleLock();
        }}
        data-ocid={`layers.lock.${reversedIdx + 1}`}
      >
        {layer.locked ? (
          <Lock size={12} style={{ color: "#f59e0b" }} />
        ) : (
          <Unlock size={12} style={{ color: "#4b5068" }} />
        )}
      </button>

      <span className="flex-shrink-0">{layerTypeIcon(layer)}</span>

      <div className="flex-1 min-w-0">
        {editingId === layer.id ? (
          <input
            className="w-full text-xs px-1 rounded outline-none"
            style={{
              background: "#1e2130",
              color: "white",
              border: "1px solid #06b6d4",
            }}
            value={editName}
            onChange={(e) => onEditNameChange(e.target.value)}
            onBlur={onCommitEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") onCommitEdit();
              if (e.key === "Escape") onCancelEdit();
            }}
            onClick={(e) => e.stopPropagation()}
            data-ocid="layers.input"
          />
        ) : (
          <span
            className="text-xs truncate block"
            style={{ color: isSelected ? "white" : "#8b8fa8" }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              onStartEdit();
            }}
          >
            {layer.name}
          </span>
        )}
      </div>

      <div
        className="flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={() => {}}
        role="presentation"
      >
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={layer.material.opacity}
          onChange={(e) => onOpacityChange(Number.parseFloat(e.target.value))}
          className="w-12 h-1 appearance-none cursor-pointer"
          style={{ accentColor: "#06b6d4" }}
          title={`Opacity: ${Math.round(layer.material.opacity * 100)}%`}
        />
      </div>

      <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          className="hover:text-white"
          style={{ color: "#4b5068", lineHeight: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          data-ocid={`layers.up_button.${reversedIdx + 1}`}
        >
          <ChevronUp size={10} />
        </button>
        <button
          type="button"
          className="hover:text-white"
          style={{ color: "#4b5068", lineHeight: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          data-ocid={`layers.down_button.${reversedIdx + 1}`}
        >
          <ChevronDown size={10} />
        </button>
      </div>

      <button
        type="button"
        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/20 transition-all"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        data-ocid={`layers.delete_button.${reversedIdx + 1}`}
      >
        <Trash2 size={12} style={{ color: "#ef4444" }} />
      </button>
    </div>
  );
}
