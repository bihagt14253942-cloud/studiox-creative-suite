export type LayerType = "shape" | "image" | "text" | "video" | "adjustment";
export type ShapeKind = "rect" | "ellipse" | "line" | "polygon";
export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "color-dodge"
  | "color-burn"
  | "hard-light"
  | "soft-light"
  | "difference"
  | "exclusion";
export type Tool =
  | "select"
  | "rect"
  | "ellipse"
  | "text"
  | "pen"
  | "hand"
  | "zoom";

export interface Effect {
  id: string;
  name: string;
  enabled: boolean;
  intensity: number;
}

export interface Transform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface Material {
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  blendMode: BlendMode;
}

export interface Keyframe {
  frame: number;
  transform: Partial<Transform>;
  easing: "linear" | "ease-in" | "ease-out" | "ease-in-out";
}

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  shapeKind?: ShapeKind;
  visible: boolean;
  locked: boolean;
  transform: Transform;
  material: Material;
  effects: Effect[];
  keyframes: Keyframe[];
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  imageUrl?: string;
  videoUrl?: string;
  inFrame: number;
  outFrame: number;
}

export interface AudioTrack {
  id: string;
  name: string;
  fileUrl: string | null;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  stereo: boolean;
}

export interface StudioState {
  layers: Layer[];
  selectedLayerId: string | null;
  currentFrame: number;
  totalFrames: number;
  fps: number;
  isPlaying: boolean;
  activeTool: Tool;
  zoom: number;
  panX: number;
  panY: number;
  canvasWidth: number;
  canvasHeight: number;
  audioTracks: AudioTrack[];
}

export type StudioAction =
  | { type: "ADD_LAYER"; payload: Layer }
  | { type: "DELETE_LAYER"; payload: { id: string } }
  | { type: "SELECT_LAYER"; payload: { id: string | null } }
  | { type: "UPDATE_LAYER"; payload: { id: string; updates: Partial<Layer> } }
  | { type: "REORDER_LAYERS"; payload: { fromIndex: number; toIndex: number } }
  | { type: "SET_PLAYING"; payload: boolean }
  | { type: "SET_CURRENT_FRAME"; payload: number }
  | { type: "SET_TOOL"; payload: Tool }
  | { type: "SET_ZOOM"; payload: number }
  | { type: "SET_PAN"; payload: { x: number; y: number } }
  | {
      type: "UPDATE_AUDIO_TRACK";
      payload: { id: string; updates: Partial<AudioTrack> };
    };
