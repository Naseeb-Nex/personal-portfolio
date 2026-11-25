import { type ExpressionName } from "./expressions";

export type BrainState =
  | "IDLE"
  | "GLIDE"
  | "PERCH"
  | "PEEK"
  | "POINT"
  | "REACT"
  | "SLEEP"
  // EXTENSION POINT: Tour mode extension states
  // Add "CARRIED" | "TOUR" when tour mode controller is implemented
  | "TOUR"
  | "CARRIED";

export type PixelTargetType = "perch" | "point" | "peek" | "avoid";

export interface PixelTarget {
  element: HTMLElement;
  type: PixelTargetType;
  rect: DOMRect;
  isVisible: boolean;
}

export interface BrainPosition {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
}

export interface BrainSnapshot {
  state: BrainState;
  expression: ExpressionName;
  targetPos: BrainPosition;
  currentPos: BrainPosition;
  speechText: string | null;
  isMobile: boolean;
  reducedMotion: boolean;
}

const BODY_SIZE = 140; // Companion body visual bounding box in px
const AVOID_PADDING = 18; // Safety margin around avoid zones
const SLEEP_TIMEOUT_MS = 20000; // 20s idle -> sleep
const FAST_SCROLL_VELOCITY = 1.6; // px/ms threshold for dizzy

export class PixelBrain {
  private state: BrainState = "IDLE";
  private currentExpression: ExpressionName = "neutral";
  private targets: Map<HTMLElement, PixelTarget> = new Map();
  private observer: IntersectionObserver | null = null;
  private rafScheduled = false;

  private currentPos: BrainPosition = { x: 40, y: 120 };
  private targetPos: BrainPosition = { x: 40, y: 120 };
  private speechText: string | null = "Hi! I'm Pixel.";

  private lastActiveTime = performance.now();
  private lastScrollY = typeof window !== "undefined" ? window.scrollY : 0;
  private lastScrollTime = performance.now();
  private scrollSettleTimer: number | null = null;
  private dizzyTimeout: number | null = null;
  private roamTimer: number | null = null;
  private speechTimeout: number | null = null;

  public isMobile = false;
  public reducedMotion = false;
  private onChangeCallbacks: Set<(snap: BrainSnapshot) => void> = new Set();

  constructor() {
    this.checkEnvironment();
    this.initDefaultPosition();
    this.initRegistry();
    this.bindEvents();
    this.startRoamCycle();
  }

  public subscribe(cb: (snap: BrainSnapshot) => void): () => void {
    this.onChangeCallbacks.add(cb);
    cb(this.getSnapshot());
    return () => this.onChangeCallbacks.delete(cb);
  }

  public getSnapshot(): BrainSnapshot {
    return {
      state: this.state,
      expression: this.currentExpression,
      targetPos: { ...this.targetPos },
      currentPos: { ...this.currentPos },
      speechText: this.speechText,
      isMobile: this.isMobile,
      reducedMotion: this.reducedMotion,
    };
  }

  private notify() {
    const snap = this.getSnapshot();
    this.onChangeCallbacks.forEach((cb) => cb(snap));
  }

  private checkEnvironment() {
    this.isMobile =
      typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 640);
    this.reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  private initDefaultPosition() {
    if (typeof window === "undefined") return;
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (this.isMobile) {
      // Mobile plan: bot docks to bottom-left corner, avoiding bottom-right chat widget and safe areas
      this.targetPos = {
        x: 16,
        y: Math.max(16, h - BODY_SIZE - 32),
      };
    } else {
      // Desktop default: comfortably perched on the right margin of the hero
      this.targetPos = {
        x: Math.max(20, w - BODY_SIZE - 60),
        y: 140,
      };
    }
    this.currentPos = { ...this.targetPos };
  }

  private bindEvents() {
    if (typeof window === "undefined") return;

    const onUserActivity = () => {
      this.lastActiveTime = performance.now();
      if (this.state === "SLEEP") {
        this.wakeUp();
      }
    };

    window.addEventListener("pointermove", onUserActivity, { passive: true });
    window.addEventListener("keydown", onUserActivity, { passive: true });
    window.addEventListener("click", onUserActivity, { passive: true });

    // Scroll listener: throttled rect refresh + fast scroll detection + perching
    window.addEventListener(
      "scroll",
      () => this.onScroll(),
      { passive: true }
    );

    window.addEventListener(
      "resize",
      () => {
        this.checkEnvironment();
        this.scheduleRectUpdate();
        if (this.reducedMotion || this.isMobile) {
          this.initDefaultPosition();
        }
      },
      { passive: true }
    );
  }

  private initRegistry() {
    if (typeof window === "undefined") return;

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const target = this.targets.get(entry.target as HTMLElement);
          if (target) {
            target.isVisible = entry.isIntersecting;
            target.rect = entry.boundingClientRect;
          }
        }
      },
      { threshold: [0, 0.1, 0.5] }
    );

    this.scanDomElements();
  }

  public scanDomElements() {
    if (typeof document === "undefined") return;
    const elements = document.querySelectorAll<HTMLElement>("[data-pixel]");

    elements.forEach((el) => {
      if (!this.targets.has(el)) {
        const type = (el.getAttribute("data-pixel") || "perch") as PixelTargetType;
        const target: PixelTarget = {
          element: el,
          type,
          rect: el.getBoundingClientRect(),
          isVisible: true,
        };
        this.targets.set(el, target);
        this.observer?.observe(el);
      }
    });
  }

  private scheduleRectUpdate() {
    if (this.rafScheduled) return;
    this.rafScheduled = true;
    requestAnimationFrame(() => {
      this.rafScheduled = false;
      this.targets.forEach((target) => {
        if (target.element.isConnected) {
          target.rect = target.element.getBoundingClientRect();
        }
      });
    });
  }

  private detectFastScroll() {
    const now = performance.now();
    const currentY = window.scrollY;
    const dt = now - this.lastScrollTime;
    if (dt > 16) {
      const dy = Math.abs(currentY - this.lastScrollY);
      const velocity = dy / dt;
      if (velocity > FAST_SCROLL_VELOCITY && this.state !== "REACT") {
        this.triggerDizzy();
      }
      this.lastScrollY = currentY;
      this.lastScrollTime = now;
    }
  }

  public triggerDizzy() {
    if (this.dizzyTimeout) clearTimeout(this.dizzyTimeout);
    this.state = "REACT";
    this.currentExpression = "dizzy";
    this.speechText = "Whoa, fast scroll!";
    this.notify();

    this.dizzyTimeout = window.setTimeout(() => {
      this.state = "IDLE";
      this.currentExpression = "neutral";
      this.speechText = null;
      this.notify();
    }, 2400);
  }

  private onScroll() {
    this.lastActiveTime = performance.now();
    if (this.state === "SLEEP") {
      this.wakeUp();
    }
    this.scheduleRectUpdate();
    this.detectFastScroll();

    // After scroll settles, perch on the best visible section
    if (this.scrollSettleTimer) clearTimeout(this.scrollSettleTimer);
    this.scrollSettleTimer = window.setTimeout(() => {
      if (this.state !== "REACT" && this.state !== "SLEEP" && !this.reducedMotion) {
        this.perchOnVisibleSection();
      }
    }, 400);
  }

  public perchOnVisibleSection() {
    this.scheduleRectUpdate();
    const avoidRects: DOMRect[] = [];
    const candidates: PixelTarget[] = [];

    this.targets.forEach((target) => {
      if (target.type === "avoid") {
        avoidRects.push(target.rect);
      } else if (target.element.isConnected) {
        const r = target.element.getBoundingClientRect();
        target.rect = r;
        // Check if inside viewport
        if (r.top < window.innerHeight && r.bottom > 0) {
          if (this.isMobile) {
            const isHeading =
              target.element.tagName === "H1" ||
              target.element.tagName === "H2" ||
              target.element.tagName === "H3" ||
              target.element.classList.contains("section-title") ||
              target.type === "perch";
            if (isHeading) candidates.push(target);
          } else {
            candidates.push(target);
          }
        }
      }
    });

    if (candidates.length === 0) return;

    // Sort by proximity to upper-middle viewport
    candidates.sort((a, b) => Math.abs(a.rect.top - 150) - Math.abs(b.rect.top - 150));
    const chosen = candidates[0];
    const pos = this.calculatePerchPosition(chosen, avoidRects);
    if (pos) {
      this.targetPos = pos;
      this.state = "PERCH";
      this.currentExpression = "happy";
      this.notify();
    }
  }

  public handleClick() {
    this.lastActiveTime = performance.now();
    if (this.state === "SLEEP") {
      this.wakeUp();
      return;
    }

    // Cycle friendly reaction expressions
    const reactions: ExpressionName[] = [
      "happy",
      "love",
      "wink",
      "laughing",
      "proud",
      "curious",
      "surprised",
      "neutral",
    ];
    const currentIndex = reactions.indexOf(this.currentExpression);
    const nextExpr = reactions[(currentIndex + 1) % reactions.length];

    this.state = "REACT";
    this.currentExpression = nextExpr;

    const phrases: Record<string, string> = {
      happy: "Bleep! Glad you're here!",
      love: "Love this portfolio!",
      wink: "Did you spot the easter eggs?",
      laughing: "Haha, tickles!",
      proud: "Crafted with passion.",
      curious: "What shall we explore next?",
      surprised: "Ooh! Nice click!",
      neutral: "Ready when you are.",
    };
    this.showSpeech(phrases[nextExpr] || "Beep boop!");

    setTimeout(() => {
      if (this.state === "REACT") {
        this.state = "PERCH";
        this.notify();
      }
    }, 2000);
    this.notify();
  }

  public showSpeech(text: string, durationMs = 3500) {
    this.speechText = text;
    if (this.speechTimeout) clearTimeout(this.speechTimeout);
    this.notify();

    this.speechTimeout = window.setTimeout(() => {
      this.speechText = null;
      this.notify();
    }, durationMs);
  }

  private wakeUp() {
    this.state = "REACT";
    this.currentExpression = "surprised";
    this.showSpeech("Yawwn... I'm awake!");
    setTimeout(() => {
      this.state = "IDLE";
      this.currentExpression = "neutral";
      this.notify();
    }, 1800);
  }

  private startRoamCycle() {
    const tick = () => {
      const now = performance.now();

      // Check 20s idle -> sleep
      if (
        this.state !== "SLEEP" &&
        this.state !== "REACT" &&
        now - this.lastActiveTime >= SLEEP_TIMEOUT_MS
      ) {
        this.state = "SLEEP";
        this.currentExpression = "sleepy";
        this.speechText = "Zzz...";
        this.notify();
      }

      // If active and not reduced motion, roam periodically
      if (
        !this.reducedMotion &&
        this.state !== "SLEEP" &&
        this.state !== "REACT" &&
        this.state !== "GLIDE"
      ) {
        this.pickNextDestination();
      }

      // Schedule next roam check between 8s and 14s
      const delay = Math.random() * 6000 + 8000;
      this.roamTimer = window.setTimeout(tick, delay);
    };

    this.roamTimer = window.setTimeout(tick, 7000);
  }

  private pickNextDestination() {
    this.scheduleRectUpdate();
    const avoidRects: DOMRect[] = [];
    const candidates: PixelTarget[] = [];

    this.targets.forEach((target) => {
      if (target.type === "avoid") {
        avoidRects.push(target.rect);
      } else if (target.isVisible) {
        // Mobile plan: perches only on section headings if roving
        if (this.isMobile) {
          const isHeading =
            target.element.tagName === "H1" ||
            target.element.tagName === "H2" ||
            target.element.tagName === "H3" ||
            target.element.classList.contains("section-title");
          if (isHeading) candidates.push(target);
        } else {
          candidates.push(target);
        }
      }
    });

    if (candidates.length === 0) {
      if (this.isMobile) {
        // Reset to docked corner
        this.initDefaultPosition();
      }
      return;
    }

    // Pick random candidate
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    const pos = this.calculatePerchPosition(chosen, avoidRects);

    if (pos) {
      this.state = "GLIDE";
      this.currentExpression = "thinking";
      this.targetPos = pos;
      this.notify();

      setTimeout(() => {
        if (this.state === "GLIDE") {
          this.state = chosen.type === "peek" ? "PEEK" : chosen.type === "point" ? "POINT" : "PERCH";
          this.currentExpression = chosen.type === "peek" ? "curious" : "happy";
          this.notify();
        }
      }, 1600);
    }
  }

  /**
   * Calculates perch coordinate ensuring it never overlaps body text or CTAs (avoid zones).
   */
  private calculatePerchPosition(
    target: PixelTarget,
    avoidRects: DOMRect[]
  ): BrainPosition | null {
    const r = target.rect;
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;

    // Potential perch anchor points around target:
    // 1. Top right corner / edge
    // 2. Top left corner / edge
    // 3. Right margin outside card
    // 4. Left margin outside card
    const attempts: BrainPosition[] = [
      { x: r.right - 40, y: r.top - BODY_SIZE + 20 },
      { x: r.left - 40, y: r.top - BODY_SIZE + 20 },
      { x: r.right + 16, y: r.top + 10 },
      { x: r.left - BODY_SIZE - 16, y: r.top + 10 },
      { x: r.right - BODY_SIZE / 2, y: r.bottom - 20 },
    ];

    for (const pt of attempts) {
      // Clamp inside screen bounds
      const clampedX = Math.max(12, Math.min(viewW - BODY_SIZE - 12, pt.x));
      const clampedY = Math.max(60, Math.min(viewH - BODY_SIZE - 20, pt.y));

      const candidateRect = {
        left: clampedX,
        top: clampedY,
        right: clampedX + BODY_SIZE,
        bottom: clampedY + BODY_SIZE,
      };

      // Check collision with all avoid zones
      const collidesWithAvoid = avoidRects.some((avoid) => {
        return !(
          candidateRect.right + AVOID_PADDING < avoid.left ||
          candidateRect.left - AVOID_PADDING > avoid.right ||
          candidateRect.bottom + AVOID_PADDING < avoid.top ||
          candidateRect.top - AVOID_PADDING > avoid.bottom
        );
      });

      if (!collidesWithAvoid) {
        return { x: clampedX, y: clampedY };
      }
    }

    return null;
  }

  public updateSpringPosition(current: BrainPosition, target: BrainPosition, damping = 0.1): BrainPosition {
    const dx = target.x - current.x;
    const dy = target.y - current.y;
    return {
      x: current.x + dx * damping,
      y: current.y + dy * damping,
    };
  }

  public destroy() {
    if (this.dizzyTimeout) clearTimeout(this.dizzyTimeout);
    if (this.roamTimer) clearTimeout(this.roamTimer);
    if (this.speechTimeout) clearTimeout(this.speechTimeout);
    this.observer?.disconnect();
    this.onChangeCallbacks.clear();
  }
}
