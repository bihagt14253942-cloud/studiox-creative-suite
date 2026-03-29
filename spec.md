# StudioX - Creative Suite

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full creative studio web app with layer-based canvas editor
- 2D canvas drawing/compositing with unlimited layers
- 3D object viewer/editor using Three.js (primitive shapes, obj import)
- VFX effects panel: blur, glow, chromatic aberration, color grading, particle effects, distortion, lens flare
- Material editor: color, opacity, blend modes, texture maps
- Timeline panel for keyframe animation and motion graphics
- Video editor: import video, trim, cut, merge, overlay, apply effects per layer
- Audio editor: dual-track waveform editor, mono/stereo toggle, volume/pan, EQ, effects
- Layer panel: unlimited layers, drag reorder, visibility/lock, group, rename
- Properties panel: transform (position, rotation, scale), layer-specific settings
- Export panel: image (PNG/JPEG/WebP), video (MP4/WebM) up to max browser resolution, audio (WAV/MP3)
- Project save/load via backend (JSON project state + blob assets)
- Asset library: upload photos, videos, audio files
- Motion graphics tools: text animator, shape morphing, path animation
- Preview renderer with playback controls (play, pause, seek, loop)

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: project CRUD, asset metadata storage
2. Select blob-storage and authorization components
3. Frontend: multi-panel layout (toolbar, layers, canvas, properties, timeline, audio)
4. Canvas engine: layer compositing using HTML5 Canvas 2D
5. 3D panel: React Three Fiber scene with controls
6. VFX effects: WebGL fragment shaders + CSS filters
7. Audio editor: Web Audio API waveform visualization and editing
8. Timeline: keyframe editor for object transforms
9. Export: canvas capture API, MediaRecorder for video
10. Asset management: upload/manage via blob-storage

## Notes
- True 8K browser rendering is memory-constrained; app supports up to 4K canvas (3840x2160) limited by device GPU/RAM
- Audio bitrate/dB values beyond Web Audio API limits are capped at browser maximums
- All processing is client-side (offline capable after load)
