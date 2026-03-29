import { useCallback, useEffect, useRef, useState } from "react";
import { useStudio } from "../context/StudioContext";
import type { Layer } from "../types/studio";

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = Number.parseInt(clean.substring(0, 2), 16);
  const g = Number.parseInt(clean.substring(2, 4), 16);
  const b = Number.parseInt(clean.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function drawLayer(ctx: CanvasRenderingContext2D, layer: Layer) {
  if (!layer.visible) return;
  ctx.save();
  const { x, y, width, height, rotation } = layer.transform;
  const { fillColor, strokeColor, strokeWidth, opacity, blendMode } =
    layer.material;
  ctx.globalAlpha = opacity;
  ctx.globalCompositeOperation = blendMode as GlobalCompositeOperation;

  const glowEffect = layer.effects.find((e) => e.id === "glow" && e.enabled);
  const blurEffect = layer.effects.find((e) => e.id === "blur" && e.enabled);
  const shadowEffect = layer.effects.find(
    (e) => e.id === "shadow" && e.enabled,
  );

  if (glowEffect) {
    ctx.shadowColor = fillColor;
    ctx.shadowBlur = glowEffect.intensity;
  }
  if (shadowEffect && !glowEffect) {
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = shadowEffect.intensity / 2;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
  }
  if (blurEffect) {
    ctx.filter = `blur(${blurEffect.intensity / 5}px)`;
  }

  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  const cx = -width / 2;
  const cy = -height / 2;

  if (layer.type === "shape") {
    ctx.fillStyle = hexToRgba(fillColor, 1);
    if (strokeColor && strokeColor !== "transparent" && strokeWidth > 0) {
      ctx.strokeStyle = hexToRgba(strokeColor, 1);
      ctx.lineWidth = strokeWidth;
    }
    if (layer.shapeKind === "rect") {
      ctx.fillRect(cx, cy, width, height);
      if (strokeWidth > 0) ctx.strokeRect(cx, cy, width, height);
    } else if (layer.shapeKind === "ellipse") {
      ctx.beginPath();
      ctx.ellipse(0, 0, width / 2, height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      if (strokeWidth > 0) ctx.stroke();
    }
  } else if (layer.type === "text") {
    ctx.fillStyle = hexToRgba(fillColor, 1);
    ctx.font = `bold ${layer.fontSize || 32}px ${layer.fontFamily || "sans-serif"}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(layer.text || "", 0, 0);
  } else if (layer.type === "image" || layer.type === "video") {
    const tileSize = 20;
    for (let tx = 0; tx < width; tx += tileSize) {
      for (let ty = 0; ty < height; ty += tileSize) {
        const isDark =
          (Math.floor(tx / tileSize) + Math.floor(ty / tileSize)) % 2 === 0;
        ctx.fillStyle = isDark ? "#333" : "#555";
        ctx.fillRect(
          cx + tx,
          cy + ty,
          Math.min(tileSize, width - tx),
          Math.min(tileSize, height - ty),
        );
      }
    }
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(layer.type === "image" ? "IMAGE" : "VIDEO", 0, 0);
  }
  ctx.restore();
}

function drawSelectionHandles(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  zoom: number,
) {
  const { x, y, width, height, rotation } = layer.transform;
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  const hw = width / 2;
  const hh = height / 2;
  const handleSize = 8 / zoom;

  ctx.strokeStyle = "#06b6d4";
  ctx.lineWidth = 1.5 / zoom;
  ctx.setLineDash([4 / zoom, 3 / zoom]);
  ctx.strokeRect(-hw, -hh, width, height);
  ctx.setLineDash([]);

  const handles: [number, number][] = [
    [-hw, -hh],
    [0, -hh],
    [hw, -hh],
    [-hw, 0],
    [hw, 0],
    [-hw, hh],
    [0, hh],
    [hw, hh],
  ];
  for (const [hx, hy] of handles) {
    ctx.fillStyle = "white";
    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 1.5 / zoom;
    ctx.fillRect(
      hx - handleSize / 2,
      hy - handleSize / 2,
      handleSize,
      handleSize,
    );
    ctx.strokeRect(
      hx - handleSize / 2,
      hy - handleSize / 2,
      handleSize,
      handleSize,
    );
  }

  ctx.beginPath();
  ctx.moveTo(0, -hh);
  ctx.lineTo(0, -hh - 24 / zoom);
  ctx.strokeStyle = "#06b6d4";
  ctx.lineWidth = 1.5 / zoom;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -hh - 24 / zoom, 5 / zoom, 0, Math.PI * 2);
  ctx.fillStyle = "#06b6d4";
  ctx.fill();
  ctx.restore();
}

export function CanvasWorkspace() {
  const { state, updateLayer, setZoom, setPan } = useStudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const panDragRef = useRef<{
    startX: number;
    startY: number;
    origPanX: number;
    origPanY: number;
  } | null>(null);
  const [isPanning, setIsPanning] = useState(false);

  const toCanvasCoords = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { cx: 0, cy: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        cx: (clientX - rect.left) / state.zoom,
        cy: (clientY - rect.top) / state.zoom,
      };
    },
    [state.zoom],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function render() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0d0f14";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#1a1d2e";
      ctx.fillRect(0, 0, state.canvasWidth, state.canvasHeight);
      ctx.strokeStyle = "#2a2d3a";
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, state.canvasWidth, state.canvasHeight);
      for (const layer of [...state.layers]) {
        drawLayer(ctx, layer);
      }
      const selected = state.layers.find((l) => l.id === state.selectedLayerId);
      if (selected && !selected.locked) {
        drawSelectionHandles(ctx, selected, state.zoom);
      }
    }

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  });

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(state.zoom * delta);
    },
    [state.zoom, setZoom],
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (e.button !== 0) return;
      if (state.activeTool === "hand") {
        setIsPanning(true);
        panDragRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          origPanX: state.panX,
          origPanY: state.panY,
        };
        return;
      }
      const { cx, cy } = toCanvasCoords(e.clientX, e.clientY);
      const selected = state.layers.find((l) => l.id === state.selectedLayerId);
      if (selected && !selected.locked) {
        const { x, y, width, height } = selected.transform;
        if (cx >= x && cx <= x + width && cy >= y && cy <= y + height) {
          dragRef.current = { startX: cx, startY: cy, origX: x, origY: y };
        }
      }
    },
    [state, toCanvasCoords],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (panDragRef.current) {
        const dx = e.clientX - panDragRef.current.startX;
        const dy = e.clientY - panDragRef.current.startY;
        setPan(
          panDragRef.current.origPanX + dx,
          panDragRef.current.origPanY + dy,
        );
        return;
      }
      if (dragRef.current && state.selectedLayerId) {
        const { cx, cy } = toCanvasCoords(e.clientX, e.clientY);
        const dx = cx - dragRef.current.startX;
        const dy = cy - dragRef.current.startY;
        const selected = state.layers.find(
          (l) => l.id === state.selectedLayerId,
        );
        if (selected) {
          updateLayer(state.selectedLayerId, {
            transform: {
              ...selected.transform,
              x: dragRef.current.origX + dx,
              y: dragRef.current.origY + dy,
            },
          });
        }
      }
    },
    [state, toCanvasCoords, updateLayer, setPan],
  );

  const onMouseUp = useCallback(() => {
    dragRef.current = null;
    panDragRef.current = null;
    setIsPanning(false);
  }, []);

  const containerW = state.canvasWidth * state.zoom;
  const containerH = state.canvasHeight * state.zoom;

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-auto flex items-center justify-center"
      style={{
        background: "#0d0f14",
        cursor: isPanning
          ? "grabbing"
          : state.activeTool === "hand"
            ? "grab"
            : "default",
      }}
      data-ocid="canvas.canvas_target"
    >
      <div
        style={{
          position: "relative",
          transform: `translate(${state.panX}px, ${state.panY}px)`,
        }}
      >
        <canvas
          ref={canvasRef}
          width={state.canvasWidth}
          height={state.canvasHeight}
          style={{
            width: containerW,
            height: containerH,
            display: "block",
            imageRendering: "pixelated",
          }}
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        />
        <div
          className="absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded"
          style={{
            background: "rgba(0,0,0,0.6)",
            color: "#8b8fa8",
            pointerEvents: "none",
          }}
        >
          {Math.round(state.zoom * 100)}%
        </div>
      </div>
    </div>
  );
}
