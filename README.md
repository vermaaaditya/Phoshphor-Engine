# PhosphorEngine

PhosphorEngine is a modern web app that turns uploaded images into **reactive monochrome ASCII art** in real time.
It is designed for social-first visuals (Instagram reels/posts), with interactive cursor warping and quick export in **PNG, JPEG, and SVG** formats.

---

## Vision

Create a “looks-like-magic” ASCII playground where users can:

- Upload any image
- Tune ASCII look instantly (density, ramp, contrast, brightness, invert)
- Interact with output using cursor-driven distortion (Warp / Ripple / Glitch-lite)
- Export polished outputs for content creation

---

## Tech Stack

- **Vite** for fast dev/build workflow
- **React** for reactive UI and state-driven rendering
- **Three.js** for animated background scene and visual polish
- **Canvas 2D** for high-performance ASCII frame rendering
- **Vanilla SVG generation** for vector export

---

## Current MVP Features

### Input
- Upload local image files (`image/*`)

### Reactive ASCII Controls
- Density (column count)
- Character ramp presets
- Brightness
- Contrast
- Invert monochrome

### Interactive Distortion Layer
- Cursor interaction over output
- Circular influence radius with distance falloff
- Distortion presets:
  - `Warp`
  - `Ripple`
  - `Glitch-lite`
- Adjustable:
  - Radius
  - Strength
  - Recovery (spring-back behavior)

### Export
- **PNG** (`canvas -> image/png`)
- **JPEG** (`canvas -> image/jpeg`)
- **SVG** (ASCII glyphs exported as vector text)

### UX / Visuals
- Instagram-ready dark UI
- Animated Three.js particle background
- Cursor glow ring over output area

---

## Architecture Overview

The app is modular and built around separate processing responsibilities.

### `src/lib/imageProcessor.js`
**Responsibility:** pixel preprocessing
- Scales source image to ASCII sampling grid
- Calculates luminance from RGB
- Applies brightness/contrast/invert adjustments

### `src/lib/asciiMapper.js`
**Responsibility:** luminance -> ASCII conversion
- Defines character ramp presets
- Maps per-cell luminance to ramp indices
- Builds frame lines from mapped indices

### `src/lib/distortionEngine.js`
**Responsibility:** interaction and motion behavior
- Maintains transient displacement and character shift fields
- Applies per-frame decay (recovery)
- Injects cursor-based force using falloff and selected preset dynamics

### `src/lib/exportService.js`
**Responsibility:** output serialization
- Raster export helpers for PNG/JPEG
- SVG text export with escaped glyph output and displaced positions

### `src/components/BackgroundScene.jsx`
**Responsibility:** style layer
- Creates lightweight Three.js particle scene
- Runs independent animation loop for aesthetic depth

### `src/App.jsx`
**Responsibility:** orchestration
- UI state management (controls/presets)
- File upload lifecycle
- Render loop (`requestAnimationFrame`)
- Canvas painting and distortion visualization
- Export action wiring

---

## Render Pipeline (Frame-by-Frame)

1. User uploads image
2. Image is sampled to ASCII grid dimensions (`cols x rows`)
3. Pixel data is converted to adjusted luminance
4. Luminance maps to ASCII ramp indices
5. Distortion engine updates displacement + shift fields
6. Final glyphs render to canvas with per-cell offsets
7. Current frame is cached for export

This keeps a clear source-of-truth model while applying transient distortion in real time.

---

## Interaction Design Notes

To keep output readable while still feeling alive:

- Distortion is strongest near cursor center and eases at radius edges
- Recovery dampens motion naturally after cursor exits
- Character shift remains mild by default to preserve legibility
- Presets provide different “personality” without changing base image source

---

## Local Development

### Install
```bash
npm install
```

### Start dev server
```bash
npm run dev
```

### Lint
```bash
npm run lint
```

### Production build
```bash
npm run build
```

---

## Vibe-Coding Prompt (Detailed)

Use this prompt with coding assistants to extend the project:

> Build and improve a modern web app called PhosphorEngine that converts uploaded images into reactive monochrome ASCII art in real time using Vite + React. Keep the architecture modular with ImageProcessor, AsciiMapper, DistortionEngine, Renderer, and ExportService layers. Preserve a source-of-truth ASCII grid and apply transient cursor-based distortion with smooth falloff and spring-back recovery. Support distortion presets (Warp, Ripple, Glitch-lite), controls for density/ramp/brightness/contrast/invert, and exports to PNG, JPEG, and SVG. Maintain an Instagram-ready visual style with subtle Three.js background motion, polished dark UI, and smooth interactions. Prioritize performance, readability, and clean component boundaries.

---

## Design Direction Guide (for Better Visual Concepts)

If you want your design tool/AI to generate stronger UI ideas, use these direction blocks:

### Style Direction A — Cyber Editorial
- Deep navy/black gradients
- Thin glowing borders and frosted glass cards
- Mono typography + uppercase micro labels
- Accent colors: electric violet, neon blue

### Style Direction B — Minimal Luxury Terminal
- Matte charcoal background
- Soft off-white text, muted grays
- Very limited accent (single cyan/indigo)
- Big spacing, low visual noise

### Style Direction C — Glitch Art Studio
- Layered blur, subtle chromatic offsets
- Animated noise overlays
- High-contrast control chips
- Bolder cursor rings and reactive pulses

### Layout Recommendations
- Left: control cockpit (fixed)
- Right: large live output stage (dominant)
- Sticky export bar near output for mobile
- Keep first screen focused: upload -> interact -> export

### Motion Recommendations
- Micro-animations for slider feedback
- Smooth panel entrance transitions
- Cursor glow and ripple with eased interpolation
- Keep all motion under “premium subtle” threshold by default

---

## Near-Term Roadmap

- Camera/video input mode
- Color ASCII mode
- Preset saving + shareable URLs
- Before/after split view
- Text overlay templates for social posts
- Batch export variants for Instagram carousel formats

---

## Notes

- Current MVP is intentionally **monochrome-first**.
- The codebase is structured so color mode and live-feed modes can be added without rewriting the core pipeline.
