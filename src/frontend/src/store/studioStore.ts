import { useCallback, useReducer } from "react";
import type {
  AudioTrack,
  Layer,
  StudioAction,
  StudioState,
} from "../types/studio";

const DEFAULT_EFFECTS = [
  { id: "blur", name: "Blur", enabled: false, intensity: 5 },
  { id: "glow", name: "Glow", enabled: false, intensity: 50 },
  { id: "shadow", name: "Shadow", enabled: false, intensity: 40 },
  { id: "colorGrade", name: "Color Grade", enabled: false, intensity: 50 },
  {
    id: "chromaticAb",
    name: "Chromatic Aberration",
    enabled: false,
    intensity: 3,
  },
];

const bgLayer: Layer = {
  id: "layer-bg",
  name: "Background",
  type: "shape",
  shapeKind: "rect",
  visible: true,
  locked: false,
  transform: {
    x: 0,
    y: 0,
    width: 1920,
    height: 1080,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
  },
  material: {
    fillColor: "#1a1d2e",
    strokeColor: "transparent",
    strokeWidth: 0,
    opacity: 1,
    blendMode: "normal",
  },
  effects: DEFAULT_EFFECTS.map((e) => ({ ...e })),
  keyframes: [],
  inFrame: 0,
  outFrame: 299,
};

const circleLayer: Layer = {
  id: "layer-circle",
  name: "Cyan Circle",
  type: "shape",
  shapeKind: "ellipse",
  visible: true,
  locked: false,
  transform: {
    x: 810,
    y: 390,
    width: 300,
    height: 300,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
  },
  material: {
    fillColor: "#06b6d4",
    strokeColor: "#22d3ee",
    strokeWidth: 3,
    opacity: 0.9,
    blendMode: "normal",
  },
  effects: DEFAULT_EFFECTS.map((e) =>
    e.id === "glow" ? { ...e, enabled: true } : { ...e },
  ),
  keyframes: [],
  inFrame: 0,
  outFrame: 299,
};

const textLayer: Layer = {
  id: "layer-text",
  name: "StudioX Title",
  type: "text",
  visible: true,
  locked: false,
  transform: {
    x: 760,
    y: 100,
    width: 400,
    height: 80,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
  },
  material: {
    fillColor: "#a855f7",
    strokeColor: "transparent",
    strokeWidth: 0,
    opacity: 1,
    blendMode: "normal",
  },
  effects: DEFAULT_EFFECTS.map((e) => ({ ...e })),
  keyframes: [],
  text: "StudioX",
  fontSize: 64,
  fontFamily: "BricolageGrotesque, sans-serif",
  inFrame: 0,
  outFrame: 299,
};

const audioTrack1: AudioTrack = {
  id: "audio-1",
  name: "Track 1",
  fileUrl: null,
  volume: 80,
  pan: 0,
  muted: false,
  solo: false,
  stereo: true,
};

const audioTrack2: AudioTrack = {
  id: "audio-2",
  name: "Track 2",
  fileUrl: null,
  volume: 60,
  pan: 0,
  muted: false,
  solo: false,
  stereo: false,
};

export const initialState: StudioState = {
  layers: [bgLayer, circleLayer, textLayer],
  selectedLayerId: "layer-circle",
  currentFrame: 0,
  totalFrames: 300,
  fps: 30,
  isPlaying: false,
  activeTool: "select",
  zoom: 0.5,
  panX: 0,
  panY: 0,
  canvasWidth: 1920,
  canvasHeight: 1080,
  audioTracks: [audioTrack1, audioTrack2],
};

function studioReducer(state: StudioState, action: StudioAction): StudioState {
  switch (action.type) {
    case "ADD_LAYER":
      return {
        ...state,
        layers: [...state.layers, action.payload],
        selectedLayerId: action.payload.id,
      };
    case "DELETE_LAYER":
      return {
        ...state,
        layers: state.layers.filter((l) => l.id !== action.payload.id),
        selectedLayerId:
          state.selectedLayerId === action.payload.id
            ? null
            : state.selectedLayerId,
      };
    case "SELECT_LAYER":
      return { ...state, selectedLayerId: action.payload.id };
    case "UPDATE_LAYER":
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.payload.id ? { ...l, ...action.payload.updates } : l,
        ),
      };
    case "REORDER_LAYERS": {
      const layers = [...state.layers];
      const [moved] = layers.splice(action.payload.fromIndex, 1);
      layers.splice(action.payload.toIndex, 0, moved);
      return { ...state, layers };
    }
    case "SET_PLAYING":
      return { ...state, isPlaying: action.payload };
    case "SET_CURRENT_FRAME":
      return {
        ...state,
        currentFrame: Math.max(
          0,
          Math.min(action.payload, state.totalFrames - 1),
        ),
      };
    case "SET_TOOL":
      return { ...state, activeTool: action.payload };
    case "SET_ZOOM":
      return { ...state, zoom: Math.max(0.1, Math.min(4, action.payload)) };
    case "SET_PAN":
      return { ...state, panX: action.payload.x, panY: action.payload.y };
    case "UPDATE_AUDIO_TRACK":
      return {
        ...state,
        audioTracks: state.audioTracks.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t,
        ),
      };
    default:
      return state;
  }
}

export function useStudioStore() {
  const [state, dispatch] = useReducer(studioReducer, initialState);

  const addLayer = useCallback(
    (layer: Layer) => dispatch({ type: "ADD_LAYER", payload: layer }),
    [],
  );
  const deleteLayer = useCallback(
    (id: string) => dispatch({ type: "DELETE_LAYER", payload: { id } }),
    [],
  );
  const selectLayer = useCallback(
    (id: string | null) => dispatch({ type: "SELECT_LAYER", payload: { id } }),
    [],
  );
  const updateLayer = useCallback(
    (id: string, updates: Partial<Layer>) =>
      dispatch({ type: "UPDATE_LAYER", payload: { id, updates } }),
    [],
  );
  const reorderLayers = useCallback(
    (fromIndex: number, toIndex: number) =>
      dispatch({ type: "REORDER_LAYERS", payload: { fromIndex, toIndex } }),
    [],
  );
  const setPlaying = useCallback(
    (v: boolean) => dispatch({ type: "SET_PLAYING", payload: v }),
    [],
  );
  const setCurrentFrame = useCallback(
    (f: number) => dispatch({ type: "SET_CURRENT_FRAME", payload: f }),
    [],
  );
  const setTool = useCallback(
    (t: import("../types/studio").Tool) =>
      dispatch({ type: "SET_TOOL", payload: t }),
    [],
  );
  const setZoom = useCallback(
    (z: number) => dispatch({ type: "SET_ZOOM", payload: z }),
    [],
  );
  const setPan = useCallback(
    (x: number, y: number) => dispatch({ type: "SET_PAN", payload: { x, y } }),
    [],
  );
  const updateAudioTrack = useCallback(
    (id: string, updates: Partial<AudioTrack>) =>
      dispatch({ type: "UPDATE_AUDIO_TRACK", payload: { id, updates } }),
    [],
  );

  return {
    state,
    dispatch,
    addLayer,
    deleteLayer,
    selectLayer,
    updateLayer,
    reorderLayers,
    setPlaying,
    setCurrentFrame,
    setTool,
    setZoom,
    setPan,
    updateAudioTrack,
  };
}
