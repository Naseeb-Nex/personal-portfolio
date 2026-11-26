# Pixel Companion: Tour Mode Architecture & Design

This document details the architectural specification for **Tour Mode** in the Pixel Companion, covering data models, controller state machines, desktop and mobile interaction behaviors, accessibility (a11y), and integration with the existing Pixel Brain.

---

## 1. Overview

Tour Mode enables Pixel to guide visitors step-by-step through key sections of the portfolio (e.g. Hero, Discover/Manifesto, Experience/Career, and Contact). It operates without aggressive viewport locking, using standard smooth scrolling (`scrollIntoView({ behavior: 'smooth', block: 'center' })`) while Pixel flies to perch at relevant section anchors and narrates contextual insights.

---

## 2. Data Model

The tour is configured as a declarative sequence of stops:

```ts
export interface TourStop {
  id: string;
  targetSelector: string; // CSS selector or data-pixel selector
  anchor: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'margin-right';
  expression: ExpressionName; // e.g. "happy", "proud", "curious"
  line: string; // Narration speech text
  dwellMs: number; // Duration to remain at this stop before auto-advancing (0 = manual only)
  audioCue?: string; // Optional future audio identifier (currently soundless)
}

export interface TourConfig {
  autoAdvance: boolean;
  loop: boolean;
  stops: TourStop[];
}
```

### Default Portfolio Tour Stops

```ts
export const PORTFOLIO_TOUR: TourStop[] = [
  {
    id: 'hero',
    targetSelector: '.hero-heading',
    anchor: 'margin-right',
    expression: 'happy',
    line: "Welcome! I'm Pixel, Naseeb's autonomous companion. Let me show you around!",
    dwellMs: 6000,
  },
  {
    id: 'manifesto',
    targetSelector: '.manifesto-section',
    anchor: 'top-right',
    expression: 'proud',
    line: "Here is Naseeb's engineering manifesto: wiring agents that truly think.",
    dwellMs: 7000,
  },
  {
    id: 'about',
    targetSelector: '.about-header',
    anchor: 'top-right',
    expression: 'curious',
    line: "Naseeb designs multi-agent architectures and LLM orchestrations.",
    dwellMs: 7000,
  },
  {
    id: 'career',
    targetSelector: '.career-title',
    anchor: 'top-left',
    expression: 'thinking',
    line: "Explore the career milestones—building enterprise RAG and agent systems.",
    dwellMs: 7000,
  },
  {
    id: 'contact',
    targetSelector: '.contact-header',
    anchor: 'top-right',
    expression: 'love',
    line: "Ready to build something intelligent together? Drop a line here!",
    dwellMs: 8000,
  },
];
```

---

## 3. Controller Architecture & State Machine

Tour Mode introduces two specific brain states into `PixelBrain`:
- `CARRIED`: Transition state when the page is scrolling to the next section and Pixel is gliding in sync with the viewport.
- `TOUR`: Active state where Pixel is perched at the current tour stop target, delivering the speech line and waiting for user input or dwell timeout.

### State Transition Diagram

```
[IDLE / PERCH]
      │
      ▼  (Start Tour Trigger)
   [CARRIED] ──(scrollIntoView + glide)──► [TOUR]
      ▲                                       │
      │                                       ▼
 (Next / Prev)                         [User Actions]
      │                                ├─ Next ────────► [CARRIED]
      │                                ├─ Prev ────────► [CARRIED]
      │                                ├─ Skip / Exit ─► [IDLE] (Resumes roam)
      │                                └─ Timeout ─────► [CARRIED]
```

### Scroll-Lock-Free Controller

Unlike disruptive modal tours that lock `document.body.style.overflow = 'hidden'`, Pixel's controller:
1. Calculates target bounding rect via `document.querySelector(stop.targetSelector)`.
2. Triggers `element.scrollIntoView({ behavior: 'smooth', block: 'center' })`.
3. Sets state to `CARRIED` during travel.
4. When scroll stabilizes (via `scrollend` event or rAF velocity check), sets state to `TOUR` and positions Pixel at the target anchor.
5. If the visitor manually scrolls away, Tour Mode does not trap them; it displays a small floating "Resume Tour / Exit" pill or gracefully exits after manual deviation.

---

## 4. Desktop & Mobile Behavior

| Feature | Desktop (width > 640px) | Mobile (width <= 640px / coarse) |
| :--- | :--- | :--- |
| **Rendering** | 3D instanced mesh with dynamic lighting | 2D canvas/CSS grid lightweight renderer |
| **Gaze** | MathUtils.damp cursor gaze tracking | Touch tap driven + scroll-direction yaw |
| **Positioning** | Perched on card margins / headings | Docks to bottom safe area or top of heading |
| **Bubble** | Max-width 240px, anchored above bot | Max-width 70vw, compact paddings, above bot |
| **Controls** | Floating tour toolbar: `[◀ Prev]` `[▶ Next]` `[✕ Exit]` | Compact bottom controls overlay above nav bar |

---

## 5. Accessibility (a11y) & Keyboard Navigation

1. **Screen Readers**:
   - Every tour line is streamed to an `aria-live="polite"` element with `role="status"` and `id="pixel-tour-announcer"`.
   - The companion button itself has `aria-label="Pixel Companion - Tour Stop X of Y. Press Escape to exit tour."`
2. **Keyboard Operation**:
   - `Escape`: Immediately exits Tour Mode and returns Pixel to `IDLE` roaming.
   - `ArrowRight` / `Enter`: Advances to the next tour stop.
   - `ArrowLeft`: Returns to the previous stop.
   - `Tab`: Focuses interactive tour controls in logical order without keyboard traps.
3. **Reduced Motion**:
   - When `prefers-reduced-motion: reduce` is active:
     - Disables smooth camera animation; uses instant jumps or subtle opacity cross-fades.
     - Pixel snaps directly to the stop anchor without wobble/float oscillations.

---

## 6. Extension Points in Brain

In `src/features/companion/brain.ts`, the state machine already includes:
```ts
export type BrainState =
  | "IDLE"
  | "GLIDE"
  | "PERCH"
  | "PEEK"
  | "POINT"
  | "REACT"
  | "SLEEP"
  // EXTENSION POINT: Tour mode extension states
  | "TOUR"
  | "CARRIED";
```

To wire the full controller in Phase 3:
1. Add `tourController: PixelTourController | null` to `PixelBrain`.
2. Implement `startTour(config?: TourConfig)` and `exitTour()`.
3. In `exitTour()`, clear tour timeouts, set state to `IDLE`, and call `this.startRoamCycle()`.
